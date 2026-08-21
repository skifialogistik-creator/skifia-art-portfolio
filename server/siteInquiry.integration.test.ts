import { eq } from "drizzle-orm";
import { afterAll, describe, expect, it } from "vitest";
import { siteInquiries } from "../drizzle/schema";
import { getDb } from "./db";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

const createdIds: string[] = [];

function createPublicContext(): TrpcContext {
  return { user: null, req: { protocol: "https", headers: {} } as TrpcContext["req"], res: {} as TrpcContext["res"] };
}

describe("siteInquiries.submit", () => {
  afterAll(async () => {
    const db = await getDb();
    if (!db) return;
    for (const publicId of createdIds) await db.delete(siteInquiries).where(eq(siteInquiries.publicId, publicId));
  });

  it("stores a public inquiry for an available ready-to-buy site", async () => {
    const db = await getDb();
    expect(db, "The project database must be available for site inquiries").toBeTruthy();

    const caller = appRouter.createCaller(createPublicContext());
    const result = await caller.siteInquiries.submit({ siteNumber: "01", fullName: "Тестовый покупатель", contact: "@buyer_test", comment: "Проверка короткой заявки; запись будет удалена.", consent: true });
    createdIds.push(result.publicId);

    const saved = await db!.select().from(siteInquiries).where(eq(siteInquiries.publicId, result.publicId)).limit(1);
    expect(result.publicId).toMatch(/^SI-/);
    expect(saved).toHaveLength(1);
    expect(saved[0]).toMatchObject({ publicId: result.publicId, siteNumber: "01", siteName: "Skifia", fullName: "Тестовый покупатель", contact: "@buyer_test", status: "received" });
  });
});
