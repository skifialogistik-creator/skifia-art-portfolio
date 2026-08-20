import { describe, expect, it } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";
import { ENV } from "./_core/env";

function createCaller(openId: string, role: "admin" | "user") {
  return appRouter.createCaller({
    user: {
      id: role === "admin" ? 1 : 2,
      openId,
      name: "Test user",
      email: "test@example.com",
      loginMethod: "manus",
      role,
      createdAt: new Date(),
      updatedAt: new Date(),
      lastSignedIn: new Date(),
    },
    req: {} as TrpcContext["req"],
    res: {} as TrpcContext["res"],
  });
}

describe("owner-only media and brief submission routes", () => {
  it("allows the owner to read the active media library and the submissions list", async () => {
    const owner = createCaller(ENV.ownerOpenId, "admin");

    await expect(owner.media.list()).resolves.toEqual(expect.any(Array));
    await expect(owner.submissions.list()).resolves.toEqual(expect.any(Array));
  });

  it("blocks a regular user from reading media or client submissions", async () => {
    const visitor = createCaller("regular-user", "user");

    await expect(visitor.media.list()).rejects.toMatchObject({ code: "FORBIDDEN" });
    await expect(visitor.submissions.list()).rejects.toMatchObject({ code: "FORBIDDEN" });
  });

  it("blocks another administrator from uploading media and changing a brief status", async () => {
    const anotherAdmin = createCaller("another-admin", "admin");

    await expect(anotherAdmin.media.upload({
      slot: "avatar",
      fileName: "portrait.png",
      mimeType: "image/png",
      dataBase64: "iVBORw0KGgo=",
    })).rejects.toMatchObject({ code: "FORBIDDEN" });
    await expect(anotherAdmin.submissions.updateStatus({ publicId: "BR-TEST123", status: "reviewed" })).rejects.toMatchObject({ code: "FORBIDDEN" });
  });

  it("rejects an unsupported MIME type before the owner upload reaches storage", async () => {
    const owner = createCaller(ENV.ownerOpenId, "admin");

    await expect(owner.media.upload({
      slot: "avatar",
      fileName: "incorrect.mp4",
      mimeType: "video/mp4",
      dataBase64: "AAAAAGZ0eXA=",
    })).rejects.toMatchObject({ code: "BAD_REQUEST" });
  });
});
