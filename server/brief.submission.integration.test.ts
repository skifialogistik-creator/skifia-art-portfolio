import { eq } from "drizzle-orm";
import { afterAll, describe, expect, it } from "vitest";
import { briefSubmissions } from "../drizzle/schema";
import { getDb } from "./db";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

const createdIds: string[] = [];

function createPublicContext(): TrpcContext {
  return {
    user: null,
    req: { protocol: "https", headers: {} } as TrpcContext["req"],
    res: {} as TrpcContext["res"],
  };
}

describe("brief.submit", () => {
  afterAll(async () => {
    const db = await getDb();
    if (!db || !createdIds.length) return;
    for (const publicId of createdIds) {
      await db.delete(briefSubmissions).where(eq(briefSubmissions.publicId, publicId));
    }
  });

  it("stores a public brief submission in the database", async () => {
    const db = await getDb();
    expect(db, "The project database must be available for brief submissions").toBeTruthy();

    const caller = appRouter.createCaller(createPublicContext());
    const result = await caller.brief.submit({
      fullName: "Тестовая Заявка",
      companyName: "Тестовый проект",
      email: "brief-test@example.com",
      phone: "+48 600 000 000",
      contactPreference: "Telegram",
      businessDescription: "Тестовый сервис для проверки сохранения расширенной заявки на сайт.",
      offers: "Тестовая консультация и сопровождение проекта.",
      audience: "Предприниматели, которым нужен понятный сайт для заявок.",
      goals: ["Получать больше заявок"],
      mainGoal: "Проверить надёжное сохранение заполненного брифа.",
      whyChoose: "Понятный процесс и прозрачная передача.",
      geography: "Варшава",
      currentSiteState: "Нужен новый сайт",
      requiredPages: ["Главная", "Услуги", "Контакты"],
      features: ["Форма заявки"],
      styleWords: ["Спокойный"],
      references: "",
      colorDirection: "Светлая, воздушная палитра",
      colorNotes: "",
      availableMaterials: ["Логотип"],
      contentReadiness: "Нужно помочь со структурой и текстом",
      deadline: "В течение месяца",
      budgetRange: "Нужна оценка после брифа",
      comment: "Интеграционная проверка; запись будет автоматически удалена.",
      consent: true,
    });
    createdIds.push(result.publicId);

    const saved = await db!.select({ publicId: briefSubmissions.publicId, companyName: briefSubmissions.companyName, payload: briefSubmissions.payload }).from(briefSubmissions).where(eq(briefSubmissions.publicId, result.publicId)).limit(1);

    expect(result.publicId).toMatch(/^BR-/);
    expect(saved).toHaveLength(1);
    expect(saved[0]).toMatchObject({ publicId: result.publicId, companyName: "Тестовый проект" });
    expect(saved[0]?.payload).toMatchObject({ goals: ["Получать больше заявок"], colorDirection: "Светлая, воздушная палитра" });
  });
});

