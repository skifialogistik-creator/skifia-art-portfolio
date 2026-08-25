export const defaultPublicMediaUrls = {
  avatar: "",
  servicesVideo: "",
  aboutVideo: "",
} as const;

type PublicMediaAsset = {
  slot: string;
  url: string;
};

export function resolvePublicMediaUrls(assets?: readonly PublicMediaAsset[]) {
  const bySlot = new Map((assets ?? []).map((asset) => [asset.slot, asset.url]));

  return {
    avatar: bySlot.get("avatar") ?? defaultPublicMediaUrls.avatar,
    servicesVideo: bySlot.get("services-video") ?? defaultPublicMediaUrls.servicesVideo,
    aboutVideo: bySlot.get("about-video") ?? defaultPublicMediaUrls.aboutVideo,
  };
}
