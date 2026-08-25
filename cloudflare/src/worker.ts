import { fetchRequestHandler } from "@trpc/server/adapters/fetch";
import { saveMediaAsset } from "./db";
import { appRouter, getAccessUser, mediaKey, mediaSlotConfig, processTelegramCallback } from "./router";

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), { status, headers: { "content-type": "application/json; charset=utf-8" } });
}

function safeFileName(value: string | null) {
  const decoded = value ? decodeURIComponent(value) : "upload.bin";
  return decoded.replace(/[\\/\u0000-\u001f]/g, "_").slice(0, 255) || "upload.bin";
}

async function handleMediaUpload(request: Request, env: Env, ctx: ExecutionContext) {
  const user = await getAccessUser(request, env, ctx);
  if (!user || user.role !== "admin") return json({ error: "Требуется доступ владельца." }, 403);

  const url = new URL(request.url);
  const slot = url.searchParams.get("slot") as keyof typeof mediaSlotConfig | null;
  if (!slot || !(slot in mediaSlotConfig)) return json({ error: "Неизвестный слот медиафайла." }, 400);

  const config = mediaSlotConfig[slot];
  const contentType = request.headers.get("content-type")?.split(";", 1)[0].trim().toLowerCase() ?? "";
  const contentLength = Number(request.headers.get("content-length") ?? "0");
  if (!config.mimes.includes(contentType as never)) return json({ error: "Неподдерживаемый тип файла." }, 400);
  if (contentLength && contentLength > config.maxBytes) return json({ error: "Размер файла превышает лимит для этого медиафайла." }, 413);
  if (!request.body) return json({ error: "Файл не передан." }, 400);

  const originalName = safeFileName(request.headers.get("x-file-name"));
  const key = mediaKey(slot, originalName);
  await env.MEDIA.put(key, request.body, {
    httpMetadata: { contentType, cacheControl: "public, max-age=31536000, immutable" },
    customMetadata: { originalName, slot },
  });

  const object = await env.MEDIA.head(key);
  if (!object) return json({ error: "Не удалось записать файл в хранилище." }, 500);
  const asset = await saveMediaAsset(env.DB, {
    slot,
    key,
    url: `/media/${encodeURIComponent(key)}`,
    mimeType: contentType,
    label: config.label,
    originalName,
    sizeBytes: object.size,
  });
  return json(asset, 201);
}

async function handleMediaRead(request: Request, env: Env) {
  const url = new URL(request.url);
  const key = decodeURIComponent(url.pathname.slice("/media/".length));
  if (!key || key.includes("..") || !key.startsWith("site-media/")) return new Response("Not found", { status: 404 });
  const object = await env.MEDIA.get(key);
  if (!object) return new Response("Not found", { status: 404 });

  const headers = new Headers();
  object.writeHttpMetadata(headers);
  headers.set("etag", object.httpEtag);
  headers.set("cache-control", object.httpMetadata?.cacheControl ?? "public, max-age=31536000, immutable");
  return new Response(object.body, { headers });
}

async function handleTelegramWebhook(request: Request, env: Env) {
  if (!env.TELEGRAM_WEBHOOK_SECRET || request.headers.get("x-telegram-bot-api-secret-token") !== env.TELEGRAM_WEBHOOK_SECRET) {
    return new Response("Unauthorized", { status: 401 });
  }
  try {
    const body = (await request.json()) as { callback_query?: Parameters<typeof processTelegramCallback>[1] };
    if (body.callback_query) await processTelegramCallback(env, body.callback_query);
  } catch (error) {
    console.error("[Telegram] Webhook processing failed", error instanceof Error ? error.message : error);
  }
  return new Response(null, { status: 200 });
}

export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    const pathname = new URL(request.url).pathname;

    if (pathname === "/api/trpc" || pathname.startsWith("/api/trpc/")) {
      return fetchRequestHandler({
        endpoint: "/api/trpc",
        req: request,
        router: appRouter,
        createContext: async () => ({ request, env, executionCtx: ctx, user: await getAccessUser(request, env, ctx) }),
        onError({ error, path }) {
          console.error(`[tRPC] ${path ?? "unknown"}:`, error.message);
        },
      });
    }

    if (pathname === "/api/admin/media" && request.method === "PUT") return handleMediaUpload(request, env, ctx);
    if (pathname === "/api/telegram/webhook" && request.method === "POST") return handleTelegramWebhook(request, env);
    if (pathname.startsWith("/media/")) return handleMediaRead(request, env);

    return env.ASSETS.fetch(request);
  },
};
