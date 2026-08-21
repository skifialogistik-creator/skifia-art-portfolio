import { desc, eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { BriefSubmissionPayload, InsertUser, briefSubmissions, siteContentSettings, siteMediaAssets, users } from "../drizzle/schema";
import { nanoid } from "nanoid";
import { ENV } from './_core/env';
import { defaultSiteContent, type SiteContent } from "../shared/siteContent";

let _db: ReturnType<typeof drizzle> | null = null;

// Lazily create the drizzle instance so local tooling can run without a DB.
export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = 'admin';
      updateSet.role = 'admin';
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

export async function createBriefSubmission(payload: BriefSubmissionPayload) {
  const db = await getDb();
  if (!db) {
    throw new Error("База заявок временно недоступна. Пожалуйста, повторите отправку позже.");
  }

  const publicId = `BR-${nanoid(9).toUpperCase()}`;

  await db.insert(briefSubmissions).values({
    publicId,
    fullName: payload.fullName,
    companyName: payload.companyName,
    email: payload.email,
    phone: payload.phone,
    payload,
  });

  return { publicId };
}

export async function getSiteContent(): Promise<SiteContent> {
  const db = await getDb();
  if (!db) return defaultSiteContent;

  const result = await db.select({ content: siteContentSettings.content }).from(siteContentSettings).where(eq(siteContentSettings.id, 1)).limit(1);
  const stored = result[0]?.content;
  if (!stored) return defaultSiteContent;

  return {
    ...defaultSiteContent,
    ...stored,
    branding: { ...defaultSiteContent.branding, ...stored.branding },
    hero: { ...defaultSiteContent.hero, ...stored.hero },
    about: { ...defaultSiteContent.about, ...stored.about },
    services: { ...defaultSiteContent.services, ...stored.services },
    closing: { ...defaultSiteContent.closing, ...stored.closing },
    brief: { ...defaultSiteContent.brief, ...stored.brief },
    company: { ...defaultSiteContent.company, ...stored.company },
    projects: stored.projects?.length ? stored.projects.map((project) => ({ ...project, coverUrl: project.coverUrl ?? "", price: project.price ?? "Цена по запросу", availability: project.availability ?? "available" })) : defaultSiteContent.projects,
  };
}

export async function saveSiteContent(content: SiteContent): Promise<SiteContent> {
  const db = await getDb();
  if (!db) throw new Error("База настроек временно недоступна. Повторите сохранение позже.");

  await db.insert(siteContentSettings).values({ id: 1, content }).onDuplicateKeyUpdate({ set: { content } });
  return content;
}

export type MediaSlot = "avatar" | "services-video" | "about-video" | "project-cover-01" | "project-cover-02" | "project-cover-03" | "project-cover-04" | "project-cover-05" | "project-cover-06";
export type BriefSubmissionStatus = "received" | "reviewed" | "archived";

type MediaAssetInput = {
  slot: MediaSlot;
  key: string;
  url: string;
  mimeType: string;
  label: string;
  originalName: string;
  sizeBytes: number;
};

export async function getMediaAssets() {
  const db = await getDb();
  if (!db) return [];

  return db.select().from(siteMediaAssets).orderBy(siteMediaAssets.slot);
}

export async function saveMediaAsset(asset: MediaAssetInput) {
  const db = await getDb();
  if (!db) throw new Error("Хранилище медиа временно недоступно. Повторите попытку позже.");

  await db.insert(siteMediaAssets).values(asset).onDuplicateKeyUpdate({
    set: {
      key: asset.key,
      url: asset.url,
      mimeType: asset.mimeType,
      label: asset.label,
      originalName: asset.originalName,
      sizeBytes: asset.sizeBytes,
    },
  });

  const result = await db.select().from(siteMediaAssets).where(eq(siteMediaAssets.slot, asset.slot)).limit(1);
  const saved = result[0];
  if (!saved) throw new Error("Не удалось сохранить информацию о медиафайле.");
  return saved;
}

export async function getBriefSubmissions() {
  const db = await getDb();
  if (!db) return [];

  return db.select().from(briefSubmissions).orderBy(desc(briefSubmissions.createdAt)).limit(250);
}

export async function updateBriefSubmissionStatus(publicId: string, status: BriefSubmissionStatus) {
  const db = await getDb();
  if (!db) throw new Error("База заявок временно недоступна. Повторите попытку позже.");

  await db.update(briefSubmissions).set({ status }).where(eq(briefSubmissions.publicId, publicId));
  const result = await db.select().from(briefSubmissions).where(eq(briefSubmissions.publicId, publicId)).limit(1);
  const updated = result[0];
  if (!updated) throw new Error("Заявка не найдена.");
  return updated;
}
