import { describe, expect, it } from "vitest";

const token = process.env.TELEGRAM_BOT_TOKEN;

describe("Telegram bot credentials", () => {
  it.skipIf(!token)("validates that the configured token belongs to a Telegram bot", async () => {
    const response = await fetch(`https://api.telegram.org/bot${token}/getMe`);
    const payload = await response.json() as { ok?: boolean; result?: { is_bot?: boolean; username?: string } };

    expect(response.ok).toBe(true);
    expect(payload.ok).toBe(true);
    expect(payload.result?.is_bot).toBe(true);
    expect(payload.result?.username).toBeTruthy();
  }, 15_000);
});
