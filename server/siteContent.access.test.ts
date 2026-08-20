import { describe, expect, it } from "vitest";
import { appRouter } from "./routers";
import { defaultSiteContent } from "../shared/siteContent";
import type { TrpcContext } from "./_core/context";
import { ENV } from "./_core/env";

describe("siteContent.admin", () => {
  it("allows the owner to read protected site settings", async () => {
    const caller = appRouter.createCaller({
      user: {
        id: 1,
        openId: ENV.ownerOpenId,
        name: "Owner",
        email: "owner@example.com",
        loginMethod: "manus",
        role: "admin",
        createdAt: new Date(),
        updatedAt: new Date(),
        lastSignedIn: new Date(),
      },
      req: {} as TrpcContext["req"],
      res: {} as TrpcContext["res"],
    });

    await expect(caller.siteContent.admin.get()).resolves.toMatchObject({ branding: { siteName: defaultSiteContent.branding.siteName } });
  });

  it("allows the owner to save content that the public website can read", async () => {
    const owner = appRouter.createCaller({
      user: {
        id: 1,
        openId: ENV.ownerOpenId,
        name: "Owner",
        email: "owner@example.com",
        loginMethod: "manus",
        role: "admin",
        createdAt: new Date(),
        updatedAt: new Date(),
        lastSignedIn: new Date(),
      },
      req: {} as TrpcContext["req"],
      res: {} as TrpcContext["res"],
    });
    const publicCaller = appRouter.createCaller({ user: null, req: {} as TrpcContext["req"], res: {} as TrpcContext["res"] });

    await expect(owner.siteContent.admin.update(defaultSiteContent)).resolves.toMatchObject({ hero: { lineOne: defaultSiteContent.hero.lineOne } });
    await expect(publicCaller.siteContent.public()).resolves.toMatchObject({ company: { telegramUrl: defaultSiteContent.company.telegramUrl } });
  });

  it("denies content edits to any non-admin user", async () => {
    const caller = appRouter.createCaller({
      user: {
        id: 7,
        openId: "non-admin",
        name: "Viewer",
        email: "viewer@example.com",
        loginMethod: "manus",
        role: "user",
        createdAt: new Date(),
        updatedAt: new Date(),
        lastSignedIn: new Date(),
      },
      req: {} as TrpcContext["req"],
      res: {} as TrpcContext["res"],
    });

    await expect(caller.siteContent.admin.update(defaultSiteContent)).rejects.toMatchObject({ code: "FORBIDDEN" });
  });

  it("denies a different administrator even if they have the admin role", async () => {
    const caller = appRouter.createCaller({
      user: {
        id: 8,
        openId: "another-admin",
        name: "Another Admin",
        email: "another-admin@example.com",
        loginMethod: "manus",
        role: "admin",
        createdAt: new Date(),
        updatedAt: new Date(),
        lastSignedIn: new Date(),
      },
      req: {} as TrpcContext["req"],
      res: {} as TrpcContext["res"],
    });

    await expect(caller.siteContent.admin.get()).rejects.toMatchObject({ code: "FORBIDDEN" });
  });
});
