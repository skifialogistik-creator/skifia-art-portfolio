export const defaultPublicMediaUrls = {
  avatar: "/manus-storage/creator-avatar_e02226c5.webp",
  servicesVideo: "/manus-storage/chrome-kinetic-reference_69492557.mp4",
  aboutVideo: "/manus-storage/sliding-portrait-reference_552e9a0d.mp4",
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
