import { describe, expect, it } from "vitest";
import { getTelegramNotificationChatId } from "./db";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

function createPublicContext(): TrpcContext {
  return { user: null, req: { protocol: "https", headers: {} } as TrpcContext["req"], res: {} as TrpcContext["res"] };
}

describe("Telegram notification settings privacy", () => {
  it("does not expose the configured owner chat through the public content route", async () => {
    const chatId = await getTelegramNotificationChatId();
    expect(chatId).toBeTruthy();

    const caller = appRouter.createCaller(createPublicContext());
    const publicContent = await caller.siteContent.public();
    expect(JSON.stringify(publicContent)).not.toContain(chatId!);
  });
});
