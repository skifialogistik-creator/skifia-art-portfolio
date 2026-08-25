import { nanoid } from "nanoid";
import { defaultSiteContent, type SiteContent } from "../../shared/siteContent";

export type SubmissionStatus = "received" | "reviewed" | "archived";
export type MediaSlot =
  | "avatar"
  | "services-video"
  | "about-video"
  | "project-cover-01"
  | "project-cover-02"
  | "project-cover-03"
  | "project-cover-04"
  | "project-cover-05"
  | "project-cover-06";

export type BriefSubmissionPayload = {
  fullName: string;
  companyName: string;
  email: string;
  phone: string;
  contactPreference: string;
  businessDescription: string;
  offers: string;
  audience: string;
  goals: string[];
  mainGoal: string;
  whyChoose: string;
  geography: string;
  currentSiteState: string;
  requiredPages: string[];
  features: string[];
  styleWords: string[];
  references: string;
  colorDirection: string;
  colorNotes: string;
  availableMaterials: string[];
  contentReadiness: string;
  deadline: string;
  budgetRange: string;
  comment: string;
  consent: true;
};

export type BriefSubmission = {
  publicId: string;
  status: SubmissionStatus;
  fullName: string;
  companyName: string;
  email: string;
  phone: string;
  payload: BriefSubmissionPayload;
  createdAt: string;
};

export type SiteInquiry = {
  publicId: string;
  status: SubmissionStatus;
  siteNumber: string;
  siteName: string;
  price: string;
  fullName: string;
  contact: string;
  comment: string;
  createdAt: string;
};

export type SiteInquiryInput = Omit<SiteInquiry, "publicId" | "status" | "createdAt">;

export type MediaAsset = {
  slot: MediaSlot;
  key: string;
  url: string;
  mimeType: string;
  label: string;
  originalName: string;
  sizeBytes: number;
  updatedAt: string;
};

export type MediaAssetInput = Omit<MediaAsset, "updatedAt">;

function now() {
  return new Date().toISOString();
}

function parseJson<T>(value: string): T {
  return JSON.parse(value) as T;
}

export async function createBriefSubmission(db: D1Database, payload: BriefSubmissionPayload) {
  const publicId = `BR-${nanoid(9).toUpperCase()}`;
  const createdAt = now();
  await db
    .prepare(
      `INSERT INTO brief_submissions
        (public_id, status, full_name, company_name, email, phone, payload_json, created_at)
       VALUES (?, 'received', ?, ?, ?, ?, ?, ?)`,
    )
    .bind(publicId, payload.fullName, payload.companyName, payload.email, payload.phone, JSON.stringify(payload), createdAt)
    .run();
  return { publicId };
}

export async function createSiteInquiry(db: D1Database, input: SiteInquiryInput) {
  const publicId = `SI-${nanoid(9).toUpperCase()}`;
  const createdAt = now();
  await db
    .prepare(
      `INSERT INTO site_inquiries
        (public_id, status, site_number, site_name, price, full_name, contact, comment, created_at)
       VALUES (?, 'received', ?, ?, ?, ?, ?, ?, ?)`,
    )
    .bind(publicId, input.siteNumber, input.siteName, input.price, input.fullName, input.contact, input.comment, createdAt)
    .run();
  return { publicId };
}

function mapBrief(row: Record<string, unknown>): BriefSubmission {
  return {
    publicId: String(row.public_id),
    status: row.status as SubmissionStatus,
    fullName: String(row.full_name),
    companyName: String(row.company_name),
    email: String(row.email),
    phone: String(row.phone),
    payload: parseJson<BriefSubmissionPayload>(String(row.payload_json)),
    createdAt: String(row.created_at),
  };
}

function mapInquiry(row: Record<string, unknown>): SiteInquiry {
  return {
    publicId: String(row.public_id),
    status: row.status as SubmissionStatus,
    siteNumber: String(row.site_number),
    siteName: String(row.site_name),
    price: String(row.price),
    fullName: String(row.full_name),
    contact: String(row.contact),
    comment: String(row.comment),
    createdAt: String(row.created_at),
  };
}

export async function getBriefSubmissions(db: D1Database) {
  const result = await db.prepare("SELECT * FROM brief_submissions ORDER BY created_at DESC LIMIT 250").all<Record<string, unknown>>();
  return result.results.map(mapBrief);
}

export async function getSiteInquiries(db: D1Database) {
  const result = await db.prepare("SELECT * FROM site_inquiries ORDER BY created_at DESC LIMIT 250").all<Record<string, unknown>>();
  return result.results.map(mapInquiry);
}

export async function getSiteInquiryByPublicId(db: D1Database, publicId: string) {
  const row = await db.prepare("SELECT * FROM site_inquiries WHERE public_id = ? LIMIT 1").bind(publicId).first<Record<string, unknown>>();
  return row ? mapInquiry(row) : undefined;
}

export async function updateBriefSubmissionStatus(db: D1Database, publicId: string, status: SubmissionStatus) {
  await db.prepare("UPDATE brief_submissions SET status = ? WHERE public_id = ?").bind(status, publicId).run();
  const row = await db.prepare("SELECT * FROM brief_submissions WHERE public_id = ? LIMIT 1").bind(publicId).first<Record<string, unknown>>();
  if (!row) throw new Error("Заявка не найдена.");
  return mapBrief(row);
}

export async function updateSiteInquiryStatus(db: D1Database, publicId: string, status: SubmissionStatus) {
  await db.prepare("UPDATE site_inquiries SET status = ? WHERE public_id = ?").bind(status, publicId).run();
  const row = await db.prepare("SELECT * FROM site_inquiries WHERE public_id = ? LIMIT 1").bind(publicId).first<Record<string, unknown>>();
  if (!row) throw new Error("Заявка на сайт не найдена.");
  return mapInquiry(row);
}

export async function getSiteContent(db: D1Database): Promise<SiteContent> {
  const row = await db.prepare("SELECT content_json FROM site_content WHERE id = 1").first<{ content_json: string }>();
  if (!row?.content_json) return defaultSiteContent;
  const stored = parseJson<Partial<SiteContent>>(row.content_json);
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
    projects: stored.projects?.length
      ? stored.projects.map((project) => ({
          ...project,
          coverUrl: project.coverUrl ?? "",
          price: project.price ?? "Цена по запросу",
          availability: project.availability ?? "available",
        }))
      : defaultSiteContent.projects,
  };
}

export async function saveSiteContent(db: D1Database, content: SiteContent) {
  const updatedAt = now();
  await db
    .prepare(
      `INSERT INTO site_content (id, content_json, updated_at) VALUES (1, ?, ?)
       ON CONFLICT(id) DO UPDATE SET content_json = excluded.content_json, updated_at = excluded.updated_at`,
    )
    .bind(JSON.stringify(content), updatedAt)
    .run();
  return content;
}

export async function getMediaAssets(db: D1Database) {
  const result = await db.prepare("SELECT * FROM site_media_assets ORDER BY slot").all<Record<string, unknown>>();
  return result.results.map((row) => ({
    slot: row.slot as MediaSlot,
    key: String(row.object_key),
    url: String(row.url),
    mimeType: String(row.mime_type),
    label: String(row.label),
    originalName: String(row.original_name),
    sizeBytes: Number(row.size_bytes),
    updatedAt: String(row.updated_at),
  })) satisfies MediaAsset[];
}

export async function saveMediaAsset(db: D1Database, asset: MediaAssetInput) {
  const updatedAt = now();
  await db
    .prepare(
      `INSERT INTO site_media_assets
        (slot, object_key, url, mime_type, label, original_name, size_bytes, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)
       ON CONFLICT(slot) DO UPDATE SET
         object_key = excluded.object_key,
         url = excluded.url,
         mime_type = excluded.mime_type,
         label = excluded.label,
         original_name = excluded.original_name,
         size_bytes = excluded.size_bytes,
         updated_at = excluded.updated_at`,
    )
    .bind(asset.slot, asset.key, asset.url, asset.mimeType, asset.label, asset.originalName, asset.sizeBytes, updatedAt)
    .run();
  return { ...asset, updatedAt } satisfies MediaAsset;
}

export async function getTelegramNotificationChatId(db: D1Database) {
  const row = await db.prepare("SELECT chat_id FROM telegram_settings WHERE id = 1").first<{ chat_id: string }>();
  return row?.chat_id;
}
