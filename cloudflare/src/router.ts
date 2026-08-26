import { TRPCError, initTRPC } from "@trpc/server";
import { createRemoteJWKSet, jwtVerify } from "jose";
import { nanoid } from "nanoid";
import superjson from "superjson";
import { z } from "zod";
import { siteContentBundleSchema, type SiteContentBundle } from "../../shared/locales";
import {
  createBriefSubmission,
  createSiteInquiry,
  getBriefSubmissions,
  getMediaAssets,
  getSiteContent,
  getSiteInquiryByPublicId,
  getSiteInquiries,
  getTelegramNotificationChatId,
  saveSiteContent,
  updateBriefSubmissionStatus,
  updateSiteInquiryStatus,
  type SubmissionStatus,
} from "./db";

export type AccessUser = {
  email: string;
  name?: string;
  role: "admin" | "user";
};

export type WorkerContext = {
  request: Request;
  env: Env;
  executionCtx: ExecutionContext;
  user: AccessUser | null;
};

const t = initTRPC.context<WorkerContext>().create({ transformer: superjson });
export const router = t.router;
export const publicProcedure = t.procedure;

export const ownerProcedure = t.procedure.use(({ ctx, next }) => {
  if (!ctx.user || ctx.user.role !== "admin") {
    throw new TRPCError({ code: "FORBIDDEN", message: "Доступ к панели доступен только владельцу сайта." });
  }
  return next({ ctx });
});

function getCookie(request: Request, name: string) {
  const prefix = `${name}=`;
  const cookies = request.headers.get("cookie")?.split(";") ?? [];
  const pair = cookies.find((entry) => entry.trim().startsWith(prefix));
  return pair ? decodeURIComponent(pair.trim().slice(prefix.length)) : undefined;
}

function accessJwks(env: Env) {
  return createRemoteJWKSet(new URL(`${env.ACCESS_TEAM_DOMAIN.replace(/\/+$/, "")}/cdn-cgi/access/certs`));
}

export async function getAccessUser(request: Request, env: Env, executionCtx: ExecutionContext): Promise<AccessUser | null> {
  if (executionCtx.access) {
    const identity = await executionCtx.access.getIdentity();
    const email = identity?.email?.trim().toLowerCase();
    if (email) return { email, name: identity?.name, role: email === env.OWNER_EMAIL.trim().toLowerCase() ? "admin" : "user" };
  }

  const token = request.headers.get("cf-access-jwt-assertion") ?? getCookie(request, "CF_Authorization");
  if (!token || !env.ACCESS_TEAM_DOMAIN || !env.ACCESS_POLICY_AUD) return null;

  try {
    const { payload } = await jwtVerify(token, accessJwks(env), {
      issuer: env.ACCESS_TEAM_DOMAIN,
      audience: env.ACCESS_POLICY_AUD,
    });
    const email = typeof payload.email === "string" ? payload.email.trim().toLowerCase() : "";
    if (!email) return null;
    return { email, name: typeof payload.name === "string" ? payload.name : undefined, role: email === env.OWNER_EMAIL.trim().toLowerCase() ? "admin" : "user" };
  } catch {
    return null;
  }
}

const briefSubmissionSchema = z.object({
  fullName: z.string().trim().min(2).max(160),
  companyName: z.string().trim().min(2).max(160),
  projectType: z.string().trim().min(2).max(120),
  projectStage: z.string().trim().min(2).max(120),
  email: z.string().trim().email().max(320),
  phone: z.string().trim().min(5).max(64),
  contactPreference: z.string().trim().min(2).max(80),
  leadSource: z.literal("Telegram"),
  businessDescription: z.string().trim().min(20).max(3000),
  offers: z.string().trim().min(10).max(3000),
  audience: z.string().trim().min(10).max(2000),
  audienceTypes: z.array(z.string().trim().min(1)).min(1).max(8),
  primaryScenarios: z.array(z.string().trim().min(1)).min(1).max(8),
  goals: z.array(z.string().trim().min(1)).min(1).max(8),
  mainGoal: z.string().trim().min(10).max(1600),
  whyChoose: z.string().trim().max(2000),
  geography: z.string().trim().min(2).max(500),
  currentSiteState: z.string().trim().min(2).max(120),
  requiredPages: z.array(z.string().trim().min(1)).min(1).max(15),
  features: z.array(z.string().trim().min(1)).max(15),
  styleWords: z.array(z.string().trim().min(1)).min(1).max(8),
  references: z.string().trim().max(2000),
  colorDirection: z.string().trim().min(2).max(160),
  colorNotes: z.string().trim().max(1500),
  availableMaterials: z.array(z.string().trim().min(1)).max(10),
  contentReadiness: z.string().trim().min(2).max(120),
  deadline: z.string().trim().min(2).max(120),
  budgetRange: z.string().trim().min(2).max(120),
  comment: z.string().trim().max(3000),
  consent: z.literal(true),
});

const siteInquirySchema = z.object({
  siteNumber: z.string().trim().min(1).max(4),
  fullName: z.string().trim().min(2).max(160),
  contact: z.string().trim().min(5).max(320),
  comment: z.string().trim().max(1500),
  consent: z.literal(true),
});

async function telegramApi(env: Env, method: string, body: Record<string, unknown>) {
  if (!env.TELEGRAM_BOT_TOKEN) return { ok: false, description: "Telegram bot token is not configured" };
  const response = await fetch(`https://api.telegram.org/bot${env.TELEGRAM_BOT_TOKEN}/${method}`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  });
  return (await response.json()) as { ok?: boolean; description?: string };
}

function inquiryMessage(inquiry: { publicId: string; siteName: string; price: string; fullName: string; contact: string; comment: string }, status = "Новая") {
  return [
    "Новая заявка на готовый сайт",
    "",
    `Сайт: ${inquiry.siteName}`,
    `Цена: ${inquiry.price}`,
    `Клиент: ${inquiry.fullName}`,
    `Контакт: ${inquiry.contact}`,
    inquiry.comment ? `Комментарий: ${inquiry.comment}` : "Комментарий: —",
    `Статус: ${status}`,
    "",
    `Номер: ${inquiry.publicId}`,
  ].join("\n");
}

async function notifyTelegramInquiry(env: Env, chatId: string | undefined, inquiry: { publicId: string; siteName: string; price: string; fullName: string; contact: string; comment: string }) {
  if (!chatId || !env.TELEGRAM_BOT_TOKEN) return;
  await telegramApi(env, "sendMessage", {
    chat_id: chatId,
    text: inquiryMessage(inquiry),
    disable_web_page_preview: true,
    reply_markup: { inline_keyboard: [[{ text: "Взять в работу", callback_data: `work:${inquiry.publicId}` }]] },
  });
}

async function notifyTelegramBrief(env: Env, chatId: string | undefined, input: z.infer<typeof briefSubmissionSchema>, publicId: string) {
  if (!chatId || !env.TELEGRAM_BOT_TOKEN) return;
  await telegramApi(env, "sendMessage", {
    chat_id: chatId,
    text: ["Новый бриф на сайте", "", `Компания: ${input.companyName}`, `Контакт: ${input.fullName}`, `Email: ${input.email}`, `Телефон: ${input.phone}`, `Номер: ${publicId}`].join("\n"),
    disable_web_page_preview: true,
  });
}

export async function processTelegramCallback(env: Env, callback: { id?: string; data?: string; from?: { id?: number }; message?: { message_id?: number; chat?: { id?: number } } }) {
  const callbackId = callback.id;
  const message = callback.message;
  const chatId = message?.chat?.id;
  const senderId = callback.from?.id;
  if (!callbackId || !chatId || !senderId || !callback.data?.startsWith("work:")) return;

  const ownerChatId = await getTelegramNotificationChatId(env.DB);
  const answer = async (text: string, showAlert = false) => telegramApi(env, "answerCallbackQuery", { callback_query_id: callbackId, text, show_alert: showAlert });
  if (!ownerChatId || String(chatId) !== ownerChatId || String(senderId) !== ownerChatId) {
    await answer("Нет доступа к этой заявке.", true);
    return;
  }

  const inquiry = await getSiteInquiryByPublicId(env.DB, callback.data.slice("work:".length));
  if (!inquiry) {
    await answer("Заявка не найдена.", true);
    return;
  }
  if (inquiry.status === "reviewed") {
    await answer("Эта заявка уже в работе.");
    return;
  }

  const updated = await updateSiteInquiryStatus(env.DB, inquiry.publicId, "reviewed");
  await answer("Заявка переведена в работу.");
  if (message.message_id) {
    await telegramApi(env, "editMessageText", {
      chat_id: chatId,
      message_id: message.message_id,
      text: inquiryMessage(updated, "В работе"),
      disable_web_page_preview: true,
    });
  }
}

export const appRouter = router({
  system: router({
    health: publicProcedure.input(z.object({ timestamp: z.number().min(0) })).query(() => ({ ok: true })),
    notifyOwner: ownerProcedure.input(z.object({ title: z.string().min(1), content: z.string().min(1) })).mutation(() => ({ success: false })),
  }),
  auth: router({
    me: publicProcedure.query(({ ctx }) => (ctx.user ? { openId: ctx.user.email, name: ctx.user.name ?? ctx.user.email, email: ctx.user.email, loginMethod: "cloudflare-access", role: ctx.user.role } : null)),
    logout: publicProcedure.mutation(() => ({ success: true })),
  }),
  brief: router({
    submit: publicProcedure.input(briefSubmissionSchema).mutation(async ({ ctx, input }) => {
      const submission = await createBriefSubmission(ctx.env.DB, input);
      const chatId = await getTelegramNotificationChatId(ctx.env.DB);
      ctx.executionCtx.waitUntil(notifyTelegramBrief(ctx.env, chatId, input, submission.publicId));
      return submission;
    }),
  }),
  siteInquiries: router({
    submit: publicProcedure.input(siteInquirySchema).mutation(async ({ ctx, input }) => {
      const contentBundle = await getSiteContent(ctx.env.DB);
      const site = contentBundle.locales[contentBundle.defaultLocale].projects.find((project) => project.number === input.siteNumber);
      if (!site) throw new TRPCError({ code: "NOT_FOUND", message: "Этот сайт больше недоступен." });
      if (site.availability === "sold") throw new TRPCError({ code: "BAD_REQUEST", message: "Этот сайт уже продан. Выберите другой вариант." });
      const inquiry = await createSiteInquiry(ctx.env.DB, { siteNumber: site.number, siteName: site.name, price: site.price, fullName: input.fullName, contact: input.contact, comment: input.comment });
      const chatId = await getTelegramNotificationChatId(ctx.env.DB);
      ctx.executionCtx.waitUntil(notifyTelegramInquiry(ctx.env, chatId, { ...inquiry, siteName: site.name, price: site.price, fullName: input.fullName, contact: input.contact, comment: input.comment }));
      return inquiry;
    }),
    list: ownerProcedure.query(({ ctx }) => getSiteInquiries(ctx.env.DB)),
    updateStatus: ownerProcedure.input(z.object({ publicId: z.string().trim().min(4).max(32), status: z.enum(["received", "reviewed", "archived"]) })).mutation(({ ctx, input }) => updateSiteInquiryStatus(ctx.env.DB, input.publicId, input.status as SubmissionStatus)),
  }),
  siteContent: router({
    public: publicProcedure.query(({ ctx }) => getSiteContent(ctx.env.DB)),
    admin: router({
      get: ownerProcedure.query(({ ctx }) => getSiteContent(ctx.env.DB)),
      update: ownerProcedure.input(siteContentBundleSchema).mutation(({ ctx, input }) => saveSiteContent(ctx.env.DB, input as SiteContentBundle)),
    }),
  }),
  media: router({
    public: publicProcedure.query(({ ctx }) => getMediaAssets(ctx.env.DB)),
    list: ownerProcedure.query(({ ctx }) => getMediaAssets(ctx.env.DB)),
  }),
  submissions: router({
    list: ownerProcedure.query(({ ctx }) => getBriefSubmissions(ctx.env.DB)),
    updateStatus: ownerProcedure.input(z.object({ publicId: z.string().trim().min(4).max(32), status: z.enum(["received", "reviewed", "archived"]) })).mutation(({ ctx, input }) => updateBriefSubmissionStatus(ctx.env.DB, input.publicId, input.status as SubmissionStatus)),
  }),
});

export type AppRouter = typeof appRouter;

export function mediaKey(slot: string, originalName: string) {
  const extension = originalName.split(".").pop()?.replace(/[^a-zA-Z0-9]/g, "").toLowerCase() || "bin";
  return `site-media/${slot}-${Date.now()}-${nanoid(8)}.${extension}`;
}

export const mediaSlotConfig = {
  avatar: { label: "3D-портрет на первом экране", mimes: ["image/jpeg", "image/png", "image/webp"], maxBytes: 5 * 1024 * 1024 },
  "services-video": { label: "Видеофон блока «Услуги»", mimes: ["video/mp4", "video/webm"], maxBytes: 50 * 1024 * 1024 },
  "about-video": { label: "Видеопортрет блока «Обо мне»", mimes: ["video/mp4", "video/webm"], maxBytes: 50 * 1024 * 1024 },
  "project-cover-01": { label: "Обложка витрины сайта 01", mimes: ["image/jpeg", "image/png", "image/webp"], maxBytes: 5 * 1024 * 1024 },
  "project-cover-02": { label: "Обложка витрины сайта 02", mimes: ["image/jpeg", "image/png", "image/webp"], maxBytes: 5 * 1024 * 1024 },
  "project-cover-03": { label: "Обложка витрины сайта 03", mimes: ["image/jpeg", "image/png", "image/webp"], maxBytes: 5 * 1024 * 1024 },
  "project-cover-04": { label: "Обложка витрины сайта 04", mimes: ["image/jpeg", "image/png", "image/webp"], maxBytes: 5 * 1024 * 1024 },
  "project-cover-05": { label: "Обложка витрины сайта 05", mimes: ["image/jpeg", "image/png", "image/webp"], maxBytes: 5 * 1024 * 1024 },
  "project-cover-06": { label: "Обложка витрины сайта 06", mimes: ["image/jpeg", "image/png", "image/webp"], maxBytes: 5 * 1024 * 1024 },
} as const;
