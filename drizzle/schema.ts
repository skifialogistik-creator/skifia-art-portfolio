import { int, json, mysqlEnum, mysqlTable, text, timestamp, varchar } from "drizzle-orm/mysql-core";
import type { SiteContentBundle } from "../shared/locales";

/**
 * Core user table backing auth flow.
 * Extend this file with additional tables as your product grows.
 * Columns use camelCase to match both database fields and generated types.
 */
export const users = mysqlTable("users", {
  /**
   * Surrogate primary key. Auto-incremented numeric value managed by the database.
   * Use this for relations between tables.
   */
  id: int("id").autoincrement().primaryKey(),
  /** Manus OAuth identifier (openId) returned from the OAuth callback. Unique per user. */
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

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

/** Public applications submitted through the website brief. */
export const briefSubmissions = mysqlTable("briefSubmissions", {
  id: int("id").autoincrement().primaryKey(),
  publicId: varchar("publicId", { length: 32 }).notNull().unique(),
  status: mysqlEnum("status", ["received", "reviewed", "archived"]).default("received").notNull(),
  fullName: varchar("fullName", { length: 160 }).notNull(),
  companyName: varchar("companyName", { length: 160 }).notNull(),
  email: varchar("email", { length: 320 }).notNull(),
  phone: varchar("phone", { length: 64 }).notNull(),
  payload: json("payload").$type<BriefSubmissionPayload>().notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type BriefSubmission = typeof briefSubmissions.$inferSelect;
export type InsertBriefSubmission = typeof briefSubmissions.$inferInsert;

/** Short inquiries submitted from a ready-to-buy site card. */
export const siteInquiries = mysqlTable("siteInquiries", {
  id: int("id").autoincrement().primaryKey(),
  publicId: varchar("publicId", { length: 32 }).notNull().unique(),
  status: mysqlEnum("status", ["received", "reviewed", "archived"]).default("received").notNull(),
  siteNumber: varchar("siteNumber", { length: 4 }).notNull(),
  siteName: varchar("siteName", { length: 120 }).notNull(),
  price: varchar("price", { length: 80 }).notNull(),
  fullName: varchar("fullName", { length: 160 }).notNull(),
  contact: varchar("contact", { length: 320 }).notNull(),
  comment: text("comment").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type SiteInquiry = typeof siteInquiries.$inferSelect;
export type InsertSiteInquiry = typeof siteInquiries.$inferInsert;

/** Private delivery target for owner notifications. Never returned from public content routes. */
export const telegramNotificationSettings = mysqlTable("telegramNotificationSettings", {
  id: int("id").primaryKey(),
  chatId: varchar("chatId", { length: 32 }).notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

/** Singleton record with all owner-editable public website content. */
export const siteContentSettings = mysqlTable("siteContentSettings", {
  id: int("id").primaryKey(),
  content: json("content").$type<SiteContentBundle>().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type SiteContentSettings = typeof siteContentSettings.$inferSelect;

/** Current owner-managed files that are rendered in key public website scenes. */
export const siteMediaAssets = mysqlTable("siteMediaAssets", {
  id: int("id").autoincrement().primaryKey(),
  slot: varchar("slot", { length: 40 }).notNull().unique(),
  key: varchar("key", { length: 500 }).notNull(),
  url: varchar("url", { length: 700 }).notNull(),
  mimeType: varchar("mimeType", { length: 120 }).notNull(),
  label: varchar("label", { length: 120 }).notNull(),
  originalName: varchar("originalName", { length: 255 }).notNull(),
  sizeBytes: int("sizeBytes").notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type SiteMediaAsset = typeof siteMediaAssets.$inferSelect;
