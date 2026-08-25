PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS brief_submissions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  public_id TEXT NOT NULL UNIQUE,
  status TEXT NOT NULL DEFAULT 'received' CHECK (status IN ('received', 'reviewed', 'archived')),
  full_name TEXT NOT NULL,
  company_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  payload_json TEXT NOT NULL,
  created_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_brief_submissions_created_at ON brief_submissions(created_at DESC);

CREATE TABLE IF NOT EXISTS site_inquiries (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  public_id TEXT NOT NULL UNIQUE,
  status TEXT NOT NULL DEFAULT 'received' CHECK (status IN ('received', 'reviewed', 'archived')),
  site_number TEXT NOT NULL,
  site_name TEXT NOT NULL,
  price TEXT NOT NULL,
  full_name TEXT NOT NULL,
  contact TEXT NOT NULL,
  comment TEXT NOT NULL,
  created_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_site_inquiries_created_at ON site_inquiries(created_at DESC);

CREATE TABLE IF NOT EXISTS site_content (
  id INTEGER PRIMARY KEY CHECK (id = 1),
  content_json TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS site_media_assets (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  slot TEXT NOT NULL UNIQUE,
  object_key TEXT NOT NULL,
  url TEXT NOT NULL,
  mime_type TEXT NOT NULL,
  label TEXT NOT NULL,
  original_name TEXT NOT NULL,
  size_bytes INTEGER NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS telegram_settings (
  id INTEGER PRIMARY KEY CHECK (id = 1),
  chat_id TEXT NOT NULL,
  updated_at TEXT NOT NULL
);
