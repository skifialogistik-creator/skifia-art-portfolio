import { eq } from "drizzle-orm";
import { afterAll, describe, expect, it, vi } from "vitest";
import { siteInquiries } from "../drizzle/schema";
import { createSiteInquiry, getDb, getSiteInquiryByPublicId, getTelegramNotificationChatId } from "./db";
import { processTelegramCallback } from "./telegram";

const createdIds: string[] = [];

describe("Telegram callback for site inquiries", () => {
  afterAll(async () => {
    const db = await getDb();
    if (!db) return;
    for (const publicId of createdIds) await db.delete(siteInquiries).where(eq(siteInquiries.publicId, publicId));
  });

  it("moves a new inquiry into work only when the callback is from the configured owner chat", async () => {
    const chatId = await getTelegramNotificationChatId();
    expect(chatId).toBeTruthy();
    const inquiry = await createSiteInquiry({ siteNumber: "01", siteName: "Проверочный сайт", price: "Цена по запросу", fullName: "Тестовый покупатель", contact: "@telegram_test", comment: "Проверка Telegram callback" });
    createdIds.push(inquiry.publicId);

    const fetchMock = vi.fn().mockResolvedValue({ ok: true, json: async () => ({ ok: true }) });
    const originalFetch = global.fetch;
    global.fetch = fetchMock as typeof fetch;
    try {
      const result = await processTelegramCallback({ id: "callback-test", data: `work:${inquiry.publicId}`, from: { id: Number(chatId) }, message: { message_id: 77, chat: { id: Number(chatId) } } });
      const updated = await getSiteInquiryByPublicId(inquiry.publicId);

      expect(result).toMatchObject({ handled: true, status: "reviewed" });
      expect(updated?.status).toBe("reviewed");
      expect(fetchMock).toHaveBeenCalledTimes(2);
    } finally {
      global.fetch = originalFetch;
    }
  });

  it("does not change a status when a callback comes from another chat", async () => {
    const chatId = await getTelegramNotificationChatId();
    expect(chatId).toBeTruthy();
    const inquiry = await createSiteInquiry({ siteNumber: "01", siteName: "Проверочный сайт", price: "Цена по запросу", fullName: "Тестовый покупатель", contact: "@telegram_test", comment: "Проверка защиты Telegram callback" });
    createdIds.push(inquiry.publicId);

    const fetchMock = vi.fn().mockResolvedValue({ ok: true, json: async () => ({ ok: true }) });
    const originalFetch = global.fetch;
    global.fetch = fetchMock as typeof fetch;
    try {
      const result = await processTelegramCallback({ id: "callback-denied", data: `work:${inquiry.publicId}`, from: { id: 999 }, message: { message_id: 78, chat: { id: 999 } } });
      const unchanged = await getSiteInquiryByPublicId(inquiry.publicId);

      expect(result).toMatchObject({ handled: false, reason: "Unauthorized chat" });
      expect(unchanged?.status).toBe("received");
      expect(fetchMock).toHaveBeenCalledTimes(1);
    } finally {
      global.fetch = originalFetch;
    }
  });
});
