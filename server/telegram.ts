import { ENV } from "./_core/env";

type TelegramSiteInquiry = {
  publicId: string;
  siteName: string;
  price: string;
  fullName: string;
  contact: string;
  comment: string;
};

type TelegramResponse = { ok?: boolean; description?: string };

function inquiryMessage(inquiry: TelegramSiteInquiry) {
  const details = [
    "Новая заявка на готовый сайт",
    "",
    `Сайт: ${inquiry.siteName}`,
    `Цена: ${inquiry.price}`,
    `Клиент: ${inquiry.fullName}`,
    `Контакт: ${inquiry.contact}`,
    inquiry.comment ? `Комментарий: ${inquiry.comment}` : "Комментарий: —",
    "",
    `Номер: ${inquiry.publicId}`,
  ];
  return details.join("\n");
}

export async function sendTelegramText(chatId: string, text: string) {
  if (!ENV.telegramBotToken) return { sent: false, reason: "Telegram bot token is not configured" } as const;

  try {
    const response = await fetch(`https://api.telegram.org/bot${ENV.telegramBotToken}/sendMessage`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ chat_id: chatId, text, disable_web_page_preview: true }),
      signal: AbortSignal.timeout(8_000),
    });
    const payload = await response.json() as TelegramResponse;
    if (!response.ok || !payload.ok) {
      console.error("[Telegram] Message delivery failed", { status: response.status, description: payload.description });
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
  return sendTelegramText(chatId, inquiryMessage(inquiry));
}
