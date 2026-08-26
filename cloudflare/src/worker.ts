import { fetchRequestHandler } from "@trpc/server/adapters/fetch";
import { saveMediaAsset } from "./db";
import { appRouter, getAccessUser, mediaKey, mediaSlotConfig, processTelegramCallback } from "./router";

type PublicLocale = "uk" | "pl" | "ru";

const publicSeo: Record<PublicLocale, { title: string; description: string; ogLocale: string }> = {
  uk: { title: "Skifia Art — дизайн і розробка сайтів", description: "Skifia Art створює виразні сайти: стратегія, дизайн, розробка та запуск під ключ.", ogLocale: "uk_UA" },
  pl: { title: "Skifia Art — projektowanie i tworzenie stron", description: "Skifia Art tworzy charakterystyczne strony: strategia, design, development i uruchomienie pod klucz.", ogLocale: "pl_PL" },
  ru: { title: "Skifia Art — дизайн и разработка сайтов", description: "Skifia Art создаёт выразительные сайты: стратегия, дизайн, разработка и запуск под ключ.", ogLocale: "ru_RU" },
};

const publicOrigin = "https://skifia-art.site";

function getPublicLocale(url: URL): PublicLocale {
  const requested = url.searchParams.get("lang");
  return requested === "pl" || requested === "ru" || requested === "uk" ? requested : "uk";
}

function escapeHtml(value: string) {
  return value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/\"/g, "&quot;");
}

function replaceMeta(html: string, attribute: "name" | "property", key: string, content: string) {
  const tag = new RegExp(`<meta\\s+${attribute}="${key}"[^>]*>`, "i");
  const replacement = `<meta ${attribute}="${key}" content="${escapeHtml(content)}" />`;
  return tag.test(html) ? html.replace(tag, replacement) : html.replace(/<\/head>/i, `${replacement}\n  </head>`);
}

function rewritePublicSeoHtml(html: string, locale: PublicLocale) {
  const seo = publicSeo[locale];
  const canonical = `${publicOrigin}/?lang=${locale}`;
  let output = html.replace(/<html[^>]*>/i, `<html lang="${locale}">`).replace(/<title>[^<]*<\/title>/i, `<title>${escapeHtml(seo.title)}</title>`);
  output = replaceMeta(output, "name", "description", seo.description);
  output = replaceMeta(output, "name", "robots", "index,follow");
  output = replaceMeta(output, "property", "og:title", seo.title);
  output = replaceMeta(output, "property", "og:description", seo.description);
  output = replaceMeta(output, "property", "og:locale", seo.ogLocale);
  output = replaceMeta(output, "property", "og:type", "website");
  output = replaceMeta(output, "property", "og:site_name", "Skifia Art");
  output = replaceMeta(output, "property", "og:url", canonical);
  output = replaceMeta(output, "name", "twitter:card", "summary");
  output = output.replace(/<link[^>]+rel="canonical"[^>]*>\s*/gi, "");
  output = output.replace(/<link[^>]+hreflang="[^"]+"[^>]*>\s*/gi, "");
  const alternates = (["uk", "pl", "ru"] as PublicLocale[]).map((alternate) => `<link rel="alternate" hreflang="${alternate}" href="${publicOrigin}/?lang=${alternate}" />`).join("\n    ");
  const seoLinks = `<link rel="canonical" href="${canonical}" />\n    ${alternates}\n    <link rel="alternate" hreflang="x-default" href="${publicOrigin}/?lang=uk" />`;
  return output.replace(/<\/head>/i, `${seoLinks}\n  </head>`);
}

function sitemapResponse() {
  const urls = (["uk", "pl", "ru"] as PublicLocale[]).map((locale) => `  <url><loc>${publicOrigin}/?lang=${locale}</loc></url>`).join("\n");
  return new Response(`<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>`, {
    headers: { "content-type": "application/xml; charset=UTF-8", "cache-control": "public, max-age=3600" },
  });
}

function robotsResponse() {
  return new Response(`User-agent: *\nAllow: /\nDisallow: /studio-control\nDisallow: /api/\nSitemap: ${publicOrigin}/sitemap.xml\n`, {
    headers: { "content-type": "text/plain; charset=UTF-8", "cache-control": "public, max-age=3600" },
  });
}

async function jsonOrSeoAsset(request: Request, env: Env) {
  const url = new URL(request.url);
  if (request.method === "GET" && url.pathname === "/sitemap.xml") return sitemapResponse();
  if (request.method === "GET" && url.pathname === "/robots.txt") return robotsResponse();
  if (request.method === "GET" && (url.pathname === "/" || url.pathname === "/index.html") && request.headers.get("accept")?.includes("text/html")) {
    const asset = await env.ASSETS.fetch(request);
    const headers = new Headers(asset.headers);
    headers.delete("content-length");
    headers.delete("etag");
    headers.set("cache-control", "no-store");
    headers.set("vary", "Accept");
    return new Response(rewritePublicSeoHtml(await asset.text(), getPublicLocale(url)), { status: asset.status, headers });
  }
  return null;
}

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

    const trpcEndpoint = pathname === "/studio-control/api/trpc" || pathname.startsWith("/studio-control/api/trpc/")
      ? "/studio-control/api/trpc"
      : pathname === "/api/trpc" || pathname.startsWith("/api/trpc/")
        ? "/api/trpc"
        : null;

    if (trpcEndpoint) {
      return fetchRequestHandler({
        endpoint: trpcEndpoint,
        req: request,
        router: appRouter,
        createContext: async () => ({ request, env, executionCtx: ctx, user: await getAccessUser(request, env, ctx) }),
        onError({ error, path }) {
          console.error(`[tRPC] ${path ?? "unknown"}:`, error.message);
        },
      });
    }

    if ((pathname === "/api/admin/media" || pathname === "/studio-control/api/admin/media") && request.method === "PUT") return handleMediaUpload(request, env, ctx);
    if (pathname === "/api/telegram/webhook" && request.method === "POST") return handleTelegramWebhook(request, env);
    if (pathname.startsWith("/media/")) return handleMediaRead(request, env);

    const seoAsset = await jsonOrSeoAsset(request, env);
    if (seoAsset) return seoAsset;
    return env.ASSETS.fetch(request);
  },
};
