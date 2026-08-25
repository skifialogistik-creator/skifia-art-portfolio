import fs from "node:fs";
import path from "node:path";

const inputPath = process.argv[2] ?? "cloudflare/backup/legacy-export.json";
const outputPath = process.argv[3] ?? "cloudflare/backup/d1-import.sql";

if (!fs.existsSync(inputPath)) {
  throw new Error(`Файл экспорта не найден: ${inputPath}`);
}

const source = JSON.parse(fs.readFileSync(inputPath, "utf8"));
const quote = (value) => `'${String(value ?? "").replaceAll("'", "''")}'`;
const iso = (value) => value ? new Date(value).toISOString() : new Date().toISOString();
const status = (value) => ["received", "reviewed", "archived"].includes(value) ? value : "received";
const lines = [
  "BEGIN TRANSACTION;",
  "DELETE FROM brief_submissions;",
  "DELETE FROM site_inquiries;",
  "DELETE FROM site_content;",
  "DELETE FROM site_media_assets;",
  "DELETE FROM telegram_settings;",
];

for (const row of source.briefSubmissions ?? []) {
  lines.push(
    `INSERT INTO brief_submissions (public_id, status, full_name, company_name, email, phone, payload_json, created_at) VALUES (${quote(row.publicId)}, ${quote(status(row.status))}, ${quote(row.fullName)}, ${quote(row.companyName)}, ${quote(row.email)}, ${quote(row.phone)}, ${quote(JSON.stringify(row.payload ?? {}))}, ${quote(iso(row.createdAt))});`,
  );
}

for (const row of source.siteInquiries ?? []) {
  lines.push(
    `INSERT INTO site_inquiries (public_id, status, site_number, site_name, price, full_name, contact, comment, created_at) VALUES (${quote(row.publicId)}, ${quote(status(row.status))}, ${quote(row.siteNumber)}, ${quote(row.siteName)}, ${quote(row.price)}, ${quote(row.fullName)}, ${quote(row.contact)}, ${quote(row.comment)}, ${quote(iso(row.createdAt))});`,
  );
}

if (source.siteContent) {
  lines.push(
    `INSERT INTO site_content (id, content_json, updated_at) VALUES (1, ${quote(JSON.stringify(source.siteContent))}, ${quote(iso(source.siteContent.updatedAt))});`,
  );
}

for (const row of source.mediaAssets ?? []) {
  lines.push(
    `INSERT INTO site_media_assets (slot, object_key, url, mime_type, label, original_name, size_bytes, updated_at) VALUES (${quote(row.slot)}, ${quote(row.key)}, ${quote(row.url)}, ${quote(row.mimeType)}, ${quote(row.label)}, ${quote(row.originalName)}, ${Number(row.sizeBytes) || 0}, ${quote(iso(row.updatedAt))});`,
  );
}

if (source.telegramSettings?.chatId) {
  lines.push(
    `INSERT INTO telegram_settings (id, chat_id, updated_at) VALUES (1, ${quote(source.telegramSettings.chatId)}, ${quote(iso(source.telegramSettings.updatedAt))});`,
  );
}

lines.push("COMMIT;");
fs.mkdirSync(path.dirname(outputPath), { recursive: true });
fs.writeFileSync(outputPath, `${lines.join("\n")}\n`, "utf8");
console.log(`D1 import written to ${outputPath}`);
