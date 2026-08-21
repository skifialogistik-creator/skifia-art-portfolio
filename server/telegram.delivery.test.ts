import { describe, expect, it } from "vitest";
import { getTelegramNotificationChatId } from "./db";
import { sendTelegramText } from "./telegram";

describe("Telegram notification delivery", () => {
  it.skipIf(process.env.RUN_TELEGRAM_DELIVERY_TEST !== "1")("sends a setup confirmation to the configured owner chat", async () => {
    const chatId = await getTelegramNotificationChatId();
    expect(chatId).toBeTruthy();

    const result = await sendTelegramText(chatId!, "Skifia Art: Telegram-уведомления подключены. Следующая заявка на готовый сайт будет отправлена сюда автоматически.");
    expect(result.sent).toBe(true);
  }, 15_000);
});
