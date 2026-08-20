import { describe, expect, it } from "vitest";
import { defaultPublicMediaUrls, resolvePublicMediaUrls } from "@shared/siteMedia";

describe("resolvePublicMediaUrls", () => {
  it("подставляет загруженный владельцем портрет в публичную сцену вместо резервного файла", () => {
    const ownerAvatarUrl = "/manus-storage/site-media/avatar-1787235843233_68cc6ad4.webp";

    expect(resolvePublicMediaUrls([{ slot: "avatar", url: ownerAvatarUrl }])).toEqual({
      avatar: ownerAvatarUrl,
      servicesVideo: defaultPublicMediaUrls.servicesVideo,
      aboutVideo: defaultPublicMediaUrls.aboutVideo,
    });
  });

  it("сохраняет резервные URL, когда в библиотеке пока нет файлов", () => {
    expect(resolvePublicMediaUrls()).toEqual({
      avatar: defaultPublicMediaUrls.avatar,
      servicesVideo: defaultPublicMediaUrls.servicesVideo,
      aboutVideo: defaultPublicMediaUrls.aboutVideo,
    });
  });
});
