import { writeFile } from "node:fs/promises";
import { describe, expect, it } from "vitest";
import { createSiteInquiry, getTelegramNotificationChatId } from "./db";
import { sendTelegramInquiry } from "./telegram";

describe("Telegram work-button delivery", () => {
  it.skipIf(process.env.RUN_TELEGRAM_BUTTON_TEST !== "1")("sends a clearly marked test inquiry with a work button to the owner chat", async () => {
    const chatId = await getTelegramNotificationChatId();
    expect(chatId).toBeTruthy();
    const inquiry = await createSiteInquiry({ siteNumber: "T", siteName: "Проверочная заявка Telegram", price: "Тест", fullName: "Проверка кнопки", contact: "Системное сообщение", comment: "Нажмите «Взять в работу», чтобы подтвердить настройку кнопки." });
    const result = await sendTelegramInquiry(chatId!, { publicId: inquiry.publicId, siteName: "Проверочная заявка Telegram", price: "Тест", fullName: "Проверка кнопки", contact: "Системное сообщение", comment: "Нажмите «Взять в работу», чтобы подтвердить настройку кнопки." });
    await writeFile("/home/ubuntu/telegram-button-test-id.txt", inquiry.publicId, { mode: 0o600 });
    expect(result.sent).toBe(true);
  }, 15_000);
});
