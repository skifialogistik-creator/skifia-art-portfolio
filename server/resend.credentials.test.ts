import { describe, expect, it } from "vitest";

describe.skip("Resend credentials", () => {
  it("authorizes a lightweight transactional-email request", async () => {
    const apiKey = process.env.RESEND_API_KEY;
    const fromEmail = process.env.RESEND_FROM_EMAIL;

    expect(apiKey, "RESEND_API_KEY must be configured").toBeTruthy();
    expect(fromEmail, "RESEND_FROM_EMAIL must be configured").toBeTruthy();

    const response = await fetch("https://api.resend.com/emails?limit=1", {
      headers: { Authorization: `Bearer ${apiKey}` },
    });

    expect(response.status, "Resend API key must authorize the emails endpoint").toBe(200);
  }, 15_000);
});
