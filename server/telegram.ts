import { createHmac, timingSafeEqual } from "node:crypto";
import type { Express, Request, Response } from "express";
import { ENV } from "./_core/env";
import { getSiteInquiryByPublicId, getTelegramNotificationChatId, updateSiteInquiryStatus } from "./db";

type TelegramSiteInquiry = {
  publicId: string;
  siteName: string;
  price: string;
  fullName: string;
  contact: string;
  comment: string;
};

type TelegramResponse = { ok?: boolean; description?: string };
type InlineKeyboard = { inline_keyboard: Array<Array<{ text: string; callback_data: string }>> };
type TelegramCallback = {
  id?: string;
  data?: string;
  from?: { id?: number };
  message?: { message_id?: number; chat?: { id?: number } };
};

export const TELEGRAM_WEBHOOK_PATH = "/api/telegram/webhook";

function inquiryMessage(inquiry: TelegramSiteInquiry, status = "Новая") {
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

function workButton(publicId: string): InlineKeyboard {
  return { inline_keyboard: [[{ text: "Взять в работу", callback_data: `work:${publicId}` }]] };
}

function webhookSecret() {
  return createHmac("sha256", ENV.cookieSecret || "telegram-webhook").update("telegram-webhook").digest("hex");
}

export function hasValidTelegramWebhookSecret(value: string | undefined) {
  if (!value) return false;
  const expected = Buffer.from(webhookSecret());
  const received = Buffer.from(value);
  return expected.length === received.length && timingSafeEqual(expected, received);
}

async function telegramApi(method: string, body: Record<string, unknown>) {
  if (!ENV.telegramBotToken) return { ok: false, description: "Telegram bot token is not configured" } as TelegramResponse;
  const response = await fetch(`https://api.telegram.org/bot${ENV.telegramBotToken}/${method}`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
    signal: AbortSignal.timeout(8_000),
  });
  return await response.json() as TelegramResponse;
}

export async function sendTelegramText(chatId: string, text: string, replyMarkup?: InlineKeyboard) {
  if (!ENV.telegramBotToken) return { sent: false, reason: "Telegram bot token is not configured" } as const;
  try {
    const payload = await telegramApi("sendMessage", { chat_id: chatId, text, disable_web_page_preview: true, ...(replyMarkup ? { reply_markup: replyMarkup } : {}) });
    if (!payload.ok) {
      console.error("[Telegram] Message delivery failed", { description: payload.description });
      return { sent: false, reason: payload.description ?? "Telegram rejected the request" } as const;
    }
    return { sent: true } as const;
  } catch (error) {
    console.error("[Telegram] Message delivery failed", error instanceof Error ? error.message : error);
    return { sent: false, reason: "Telegram request failed" } as const;
  }
}

export async function notifyTelegramAboutSiteInquiry(chatId: string | undefined, inquiry: TelegramSiteInquiry) {
  if (process.env.VITEST || !chatId) return { sent: false, reason: process.env.VITEST ? "Skipped during tests" : "Telegram chat is not configured" } as const;
  return sendTelegramText(chatId, inquiryMessage(inquiry), workButton(inquiry.publicId));
}

async function answerTelegramCallback(callbackId: string, text: string, showAlert = false) {
  try {
    await telegramApi("answerCallbackQuery", { callback_query_id: callbackId, text, show_alert: showAlert });
  } catch (error) {
    console.error("[Telegram] Callback acknowledgement failed", error instanceof Error ? error.message : error);
  }
}

export async function processTelegramCallback(callback: TelegramCallback) {
  const callbackId = callback.id;
  const message = callback.message;
  const chatId = message?.chat?.id;
  const senderId = callback.from?.id;
  const data = callback.data;
  if (!callbackId || !chatId || !senderId || !data?.startsWith("work:")) return { handled: false, reason: "Unsupported callback" } as const;

  const ownerChatId = await getTelegramNotificationChatId();
  if (!ownerChatId || String(chatId) !== ownerChatId || String(senderId) !== ownerChatId) {
    await answerTelegramCallback(callbackId, "Нет доступа к этой заявке.", true);
    return { handled: false, reason: "Unauthorized chat" } as const;
  }

  const publicId = data.slice("work:".length);
  const inquiry = await getSiteInquiryByPublicId(publicId);
  if (!inquiry) {
    await answerTelegramCallback(callbackId, "Заявка не найдена.", true);
    return { handled: false, reason: "Inquiry not found" } as const;
  }
  if (inquiry.status === "reviewed") {
    await answerTelegramCallback(callbackId, "Эта заявка уже в работе.");
    return { handled: true, status: "reviewed" } as const;
  }

  const updated = await updateSiteInquiryStatus(inquiry.publicId, "reviewed");
  await answerTelegramCallback(callbackId, "Заявка переведена в работу.");
  if (message?.message_id) {
    try {
      await telegramApi("editMessageText", { chat_id: chatId, message_id: message.message_id, text: inquiryMessage(updated, "В работе"), disable_web_page_preview: true });
    } catch (error) {
      console.error("[Telegram] Callback message update failed", error instanceof Error ? error.message : error);
    }
  }
  return { handled: true, status: updated.status } as const;
}

export function registerTelegramWebhookRoutes(app: Express) {
  app.post(TELEGRAM_WEBHOOK_PATH, async (req: Request, res: Response) => {
    if (!hasValidTelegramWebhookSecret(req.header("x-telegram-bot-api-secret-token") ?? undefined)) {
      res.sendStatus(401);
      return;
    }
    try {
      await processTelegramCallback(req.body?.callback_query ?? {});
    } catch (error) {
      console.error("[Telegram] Webhook processing failed", error instanceof Error ? error.message : error);
    }
    res.sendStatus(200);
  });
}

export async function configureTelegramWebhook(webhookUrl: string) {
  const payload = await telegramApi("setWebhook", { url: webhookUrl, secret_token: webhookSecret(), allowed_updates: ["callback_query"] });
  return Boolean(payload.ok);
}
