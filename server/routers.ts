import { TRPCError } from "@trpc/server";
import { COOKIE_NAME } from "@shared/const";
import { z } from "zod";
import { createBriefSubmission, createSiteInquiry, getBriefSubmissions, getMediaAssets, getSiteContent, getSiteInquiries, getTelegramNotificationChatId, saveMediaAsset, saveSiteContent, updateBriefSubmissionStatus, updateSiteInquiryStatus, type MediaSlot } from "./db";
import { getSessionCookieOptions } from "./_core/cookies";
import { notifyOwner } from "./_core/notification";
import { systemRouter } from "./_core/systemRouter";
import { ownerProcedure, publicProcedure, router } from "./_core/trpc";
import { siteContentSchema } from "../shared/siteContent";
import { storagePut } from "./storage";
import { notifyTelegramAboutSiteInquiry } from "./telegram";

export const briefSubmissionSchema = z.object({
  fullName: z.string().trim().min(2).max(160),
  companyName: z.string().trim().min(2).max(160),
  email: z.string().trim().email().max(320),
  phone: z.string().trim().min(5).max(64),
  contactPreference: z.string().trim().min(2).max(80),
  businessDescription: z.string().trim().min(20).max(3000),
  offers: z.string().trim().min(10).max(3000),
  audience: z.string().trim().min(10).max(2000),
  goals: z.array(z.string().trim().min(1)).min(1).max(8),
  mainGoal: z.string().trim().min(10).max(1600),
  whyChoose: z.string().trim().max(2000),
  geography: z.string().trim().min(2).max(500),
  currentSiteState: z.string().trim().min(2).max(120),
  requiredPages: z.array(z.string().trim().min(1)).min(1).max(15),
  features: z.array(z.string().trim().min(1)).max(15),
  styleWords: z.array(z.string().trim().min(1)).min(1).max(8),
  references: z.string().trim().max(2000),
  colorDirection: z.string().trim().min(2).max(160),
  colorNotes: z.string().trim().max(1500),
  availableMaterials: z.array(z.string().trim().min(1)).max(10),
  contentReadiness: z.string().trim().min(2).max(120),
  deadline: z.string().trim().min(2).max(120),
  budgetRange: z.string().trim().min(2).max(120),
  comment: z.string().trim().max(3000),
  consent: z.literal(true),
});

export const siteInquirySchema = z.object({
  siteNumber: z.string().trim().min(1).max(4),
  fullName: z.string().trim().min(2).max(160),
  contact: z.string().trim().min(5).max(320),
  comment: z.string().trim().max(1500),
  consent: z.literal(true),
});

const mediaSlotConfig = {
  avatar: { label: "3D-портрет на первом экране", kind: "image", mimes: ["image/jpeg", "image/png", "image/webp"], maxBytes: 5 * 1024 * 1024 },
  "services-video": { label: "Видеофон блока «Услуги»", kind: "video", mimes: ["video/mp4", "video/webm"], maxBytes: 50 * 1024 * 1024 },
  "about-video": { label: "Видеопортрет блока «Обо мне»", kind: "video", mimes: ["video/mp4", "video/webm"], maxBytes: 50 * 1024 * 1024 },
  "project-cover-01": { label: "Обложка витрины сайта 01", kind: "image", mimes: ["image/jpeg", "image/png", "image/webp"], maxBytes: 5 * 1024 * 1024 },
  "project-cover-02": { label: "Обложка витрины сайта 02", kind: "image", mimes: ["image/jpeg", "image/png", "image/webp"], maxBytes: 5 * 1024 * 1024 },
  "project-cover-03": { label: "Обложка витрины сайта 03", kind: "image", mimes: ["image/jpeg", "image/png", "image/webp"], maxBytes: 5 * 1024 * 1024 },
  "project-cover-04": { label: "Обложка витрины сайта 04", kind: "image", mimes: ["image/jpeg", "image/png", "image/webp"], maxBytes: 5 * 1024 * 1024 },
  "project-cover-05": { label: "Обложка витрины сайта 05", kind: "image", mimes: ["image/jpeg", "image/png", "image/webp"], maxBytes: 5 * 1024 * 1024 },
  "project-cover-06": { label: "Обложка витрины сайта 06", kind: "image", mimes: ["image/jpeg", "image/png", "image/webp"], maxBytes: 5 * 1024 * 1024 },
} as const;

const mediaUploadSchema = z.object({
  slot: z.enum(["avatar", "services-video", "about-video", "project-cover-01", "project-cover-02", "project-cover-03", "project-cover-04", "project-cover-05", "project-cover-06"]),
  fileName: z.string().trim().min(1).max(255),
  mimeType: z.string().trim().min(1).max(120),
  dataBase64: z.string().trim().min(4).max(70 * 1024 * 1024),
});

function hasExpectedMediaSignature(data: Buffer, mimeType: string) {
  if (mimeType === "image/jpeg") return data.length >= 3 && data[0] === 0xff && data[1] === 0xd8 && data[2] === 0xff;
  if (mimeType === "image/png") return data.length >= 8 && data.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]));
  if (mimeType === "image/webp") return data.length >= 12 && data.subarray(0, 4).toString() === "RIFF" && data.subarray(8, 12).toString() === "WEBP";
  if (mimeType === "video/mp4") return data.length >= 12 && data.subarray(4, 8).toString() === "ftyp";
  if (mimeType === "video/webm") return data.length >= 4 && data.subarray(0, 4).equals(Buffer.from([0x1a, 0x45, 0xdf, 0xa3]));
  return false;
}

function mediaExtension(mimeType: string) {
  return ({ "image/jpeg": "jpg", "image/png": "png", "image/webp": "webp", "video/mp4": "mp4", "video/webm": "webm" } as Record<string, string>)[mimeType] ?? "bin";
}

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query((opts) => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return { success: true } as const;
    }),
  }),
  brief: router({
    submit: publicProcedure.input(briefSubmissionSchema).mutation(async ({ input }) => {
      const submission = await createBriefSubmission(input);
      void notifyOwner({
        title: "Новый бриф на сайте",
        content: `${input.companyName}: ${input.fullName}. Номер заявки ${submission.publicId}.`,
      });
      return submission;
    }),
  }),
  siteInquiries: router({
    submit: publicProcedure.input(siteInquirySchema).mutation(async ({ input }) => {
      const site = (await getSiteContent()).projects.find((project) => project.number === input.siteNumber);
      if (!site) throw new TRPCError({ code: "NOT_FOUND", message: "Этот сайт больше недоступен." });
      if (site.availability === "sold") throw new TRPCError({ code: "BAD_REQUEST", message: "Этот сайт уже продан. Выберите другой вариант." });

      const inquiry = await createSiteInquiry({
        siteNumber: site.number,
        siteName: site.name,
        price: site.price,
        fullName: input.fullName,
        contact: input.contact,
        comment: input.comment,
      });
      void notifyOwner({ title: "Новая заявка на готовый сайт", content: `${site.name}: ${input.fullName}. Номер заявки ${inquiry.publicId}.` });
      void (async () => {
        try {
          const chatId = await getTelegramNotificationChatId();
          await notifyTelegramAboutSiteInquiry(chatId, {
            publicId: inquiry.publicId,
            siteName: site.name,
            price: site.price,
            fullName: input.fullName,
            contact: input.contact,
            comment: input.comment,
          });
        } catch (error) {
          console.error("[Telegram] Notification preparation failed", error instanceof Error ? error.message : error);
        }
      })();
      return inquiry;
    }),
    list: ownerProcedure.query(() => getSiteInquiries()),
    updateStatus: ownerProcedure
      .input(z.object({ publicId: z.string().trim().min(4).max(32), status: z.enum(["received", "reviewed", "archived"]) }))
      .mutation(({ input }) => updateSiteInquiryStatus(input.publicId, input.status)),
  }),
  siteContent: router({
    public: publicProcedure.query(() => getSiteContent()),
    admin: router({
      get: ownerProcedure.query(() => getSiteContent()),
      update: ownerProcedure.input(siteContentSchema).mutation(({ input }) => saveSiteContent(input)),
    }),
  }),
  media: router({
    public: publicProcedure.query(() => getMediaAssets()),
    list: ownerProcedure.query(() => getMediaAssets()),
    upload: ownerProcedure.input(mediaUploadSchema).mutation(async ({ input }) => {
      const config = mediaSlotConfig[input.slot];
      if (!config.mimes.includes(input.mimeType as never)) {
        throw new TRPCError({ code: "BAD_REQUEST", message: "Для этого блока выбран неподдерживаемый тип файла." });
      }

      const normalizedBase64 = input.dataBase64.replace(/\s/g, "");
      if (!/^[A-Za-z0-9+/]*={0,2}$/.test(normalizedBase64)) {
        throw new TRPCError({ code: "BAD_REQUEST", message: "Файл передан в некорректном формате." });
      }

      const data = Buffer.from(normalizedBase64, "base64");
      if (!data.length || data.byteLength > config.maxBytes) {
        const limit = config.kind === "image" ? "5 МБ" : "50 МБ";
        throw new TRPCError({ code: "PAYLOAD_TOO_LARGE", message: `Размер файла превышает лимит ${limit}.` });
      }
      if (!hasExpectedMediaSignature(data, input.mimeType)) {
        throw new TRPCError({ code: "BAD_REQUEST", message: "Содержимое файла не соответствует заявленному формату." });
      }

      const slot = input.slot as MediaSlot;
      const stored = await storagePut(`site-media/${slot}-${Date.now()}.${mediaExtension(input.mimeType)}`, data, input.mimeType);
      return saveMediaAsset({
        slot,
        key: stored.key,
        url: stored.url,
        mimeType: input.mimeType,
        label: config.label,
        originalName: input.fileName,
        sizeBytes: data.byteLength,
      });
    }),
  }),
  submissions: router({
    list: ownerProcedure.query(() => getBriefSubmissions()),
    updateStatus: ownerProcedure
      .input(z.object({ publicId: z.string().trim().min(4).max(32), status: z.enum(["received", "reviewed", "archived"]) }))
      .mutation(({ input }) => updateBriefSubmissionStatus(input.publicId, input.status)),
  }),
});

export type AppRouter = typeof appRouter;
