import { describe, expect, it } from "vitest";
import { briefSubmissionSchema } from "./routers";

const validBrief = {
  fullName: "Анна Ковальская",
  companyName: "Studio Forma",
  email: "anna@example.com",
  phone: "+48 600 000 000",
  contactPreference: "Telegram",
  businessDescription: "Создаём интерьерные проекты и комплектуем квартиры под ключ.",
  offers: "Дизайн-проект, комплектация и авторский надзор.",
  audience: "Собственники квартир, которым нужен интерьер без лишних хлопот.",
  goals: ["Получать больше заявок"],
  mainGoal: "Получать понятные заявки от подходящих клиентов.",
  whyChoose: "Опытная команда и прозрачный процесс.",
  geography: "Варшава и онлайн",
  currentSiteState: "Нужен новый сайт",
  requiredPages: ["Главная", "Услуги"],
  features: ["Форма заявки"],
  styleWords: ["Премиальный"],
  references: "",
  colorDirection: "Светлая, воздушная палитра",
  colorNotes: "",
  availableMaterials: ["Логотип"],
  contentReadiness: "Нужно помочь со структурой и текстом",
  deadline: "До 15 октября",
  budgetRange: "4 500–8 500 PLN",
  comment: "",
  consent: true as const,
};

describe("briefSubmissionSchema", () => {
  it("accepts a complete public brief", () => {
    expect(briefSubmissionSchema.parse(validBrief)).toMatchObject(validBrief);
  });

  it("rejects a brief without consent or a goal", () => {
    expect(() => briefSubmissionSchema.parse({ ...validBrief, consent: false, goals: [] })).toThrow();
  });
});
