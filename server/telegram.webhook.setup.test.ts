import { describe, expect, it } from "vitest";
import { configureTelegramWebhook } from "./telegram";

const webhookUrl = process.env.TELEGRAM_WEBHOOK_URL;

describe("Telegram webhook setup", () => {
  it.skipIf(process.env.RUN_TELEGRAM_WEBHOOK_SETUP !== "1" || !webhookUrl)("registers the published callback endpoint with Telegram", async () => {
    await expect(configureTelegramWebhook(webhookUrl!)).resolves.toBe(true);
  }, 15_000);
});
