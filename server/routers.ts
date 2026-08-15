import { COOKIE_NAME } from "@shared/const";
import { z } from "zod";
import { createBriefSubmission } from "./db";
import { getSessionCookieOptions } from "./_core/cookies";
import { notifyOwner } from "./_core/notification";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router } from "./_core/trpc";

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

export const appRouter = router({
    // if you need to use socket.io, read and register route in server/_core/index.ts, all api should start with '/api/' so that the gateway can route correctly
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),
  brief: router({
    submit: publicProcedure
      .input(briefSubmissionSchema)
      .mutation(async ({ input }) => {
        const submission = await createBriefSubmission(input);
        void notifyOwner({
          title: "Новый бриф на сайте",
          content: `${input.companyName}: ${input.fullName}. Номер заявки ${submission.publicId}.`,
        });
        return submission;
      }),
  }),
});

export type AppRouter = typeof appRouter;
