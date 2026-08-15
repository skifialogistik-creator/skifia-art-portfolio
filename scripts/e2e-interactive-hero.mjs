import { chromium } from "playwright-core";

const browser = await chromium.launch({ executablePath: "/usr/bin/chromium", headless: true, args: ["--no-sandbox", "--disable-dev-shm-usage"] });

try {
  const desktop = await browser.newContext({ viewport: { width: 1280, height: 720 } });
  const desktopPage = await desktop.newPage();
  await desktopPage.goto("http://127.0.0.1:3000/", { waitUntil: "networkidle" });
  const video = desktopPage.locator("#top video");
  await video.evaluate((element) => new Promise((resolve) => {
    if (element.readyState >= 2) resolve(undefined);
    else element.addEventListener("loadeddata", () => resolve(undefined), { once: true });
  }));
  const box = await video.boundingBox();
  if (!box) throw new Error("Interactive hero video is not visible");
  await desktopPage.mouse.move(box.x + box.width * 0.16, box.y + box.height * 0.54);
  await desktopPage.waitForTimeout(200);
  const leftTime = await video.evaluate((element) => element.currentTime);
  await desktopPage.mouse.move(box.x + box.width * 0.84, box.y + box.height * 0.54);
  await desktopPage.waitForTimeout(200);
  const rightTime = await video.evaluate((element) => element.currentTime);
  if (!(rightTime > leftTime + 0.4)) throw new Error(`Pointer scrubbing did not advance the scene: ${leftTime} → ${rightTime}`);
  await desktop.close();

  const mobile = await browser.newContext({ viewport: { width: 375, height: 812 }, isMobile: true, hasTouch: true });
  const mobilePage = await mobile.newPage();
  await mobilePage.goto("http://127.0.0.1:3000/", { waitUntil: "networkidle" });
  const mobileVideo = mobilePage.locator("#top video");
  await mobileVideo.evaluate((element) => new Promise((resolve) => {
    if (element.readyState >= 2) resolve(undefined);
    else element.addEventListener("loadeddata", () => resolve(undefined), { once: true });
  }));
  await mobilePage.waitForTimeout(300);
  const mobileState = await mobileVideo.evaluate((element) => ({ paused: element.paused, loop: element.loop, muted: element.muted }));
  if (mobileState.paused || !mobileState.loop || !mobileState.muted) throw new Error(`Mobile playback was not configured correctly: ${JSON.stringify(mobileState)}`);
  await mobile.close();

  console.log(JSON.stringify({ desktopScrub: { leftTime, rightTime }, mobilePlayback: mobileState }));
} finally {
  await browser.close();
}
