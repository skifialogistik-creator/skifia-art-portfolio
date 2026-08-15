import { chromium } from "playwright-core";

const browser = await chromium.launch({ executablePath: "/usr/bin/chromium", headless: true, args: ["--no-sandbox", "--disable-dev-shm-usage"] });

try {
  const desktop = await browser.newContext({ viewport: { width: 1280, height: 720 } });
  const page = await desktop.newPage();
  await page.goto("http://127.0.0.1:3000/", { waitUntil: "networkidle" });
  const video = page.locator("#top video");
  await video.evaluate((element) => new Promise((resolve) => {
    if (element.readyState >= 2) resolve(undefined);
    else element.addEventListener("loadeddata", () => resolve(undefined), { once: true });
  }));
  const before = await video.evaluate((element) => element.currentTime);
  await page.evaluate(() => window.scrollTo(0, window.innerHeight * 0.2));
  await page.waitForTimeout(250);
  const after = await video.evaluate((element) => element.currentTime);
  if (!(after > before + 0.15)) throw new Error(`Scroll did not advance robotic hand video: ${before} → ${after}`);
  await page.locator("#control-story").scrollIntoViewIfNeeded();
  if (!await page.getByRole("heading", { name: /Ваш сайт\./ }).isVisible()) throw new Error("Information block was not separate and visible after the video scene");
  await page.locator("#services").scrollIntoViewIfNeeded();
  const serviceCards = await page.locator("#services .border-t > article").count();
  if (serviceCards < 6) throw new Error(`Service cards were not rendered: ${serviceCards}`);
  await desktop.close();

  const mobile = await browser.newContext({ viewport: { width: 375, height: 812 }, isMobile: true, hasTouch: true });
  const mobilePage = await mobile.newPage();
  await mobilePage.goto("http://127.0.0.1:3000/", { waitUntil: "networkidle" });
  const mobileVideo = mobilePage.locator("#top video");
  await mobileVideo.evaluate((element) => new Promise((resolve) => {
    if (element.readyState >= 2) resolve(undefined);
    else element.addEventListener("loadeddata", () => resolve(undefined), { once: true });
  }));
  const mobileState = await mobileVideo.evaluate((element) => ({ paused: element.paused, loop: element.loop, muted: element.muted }));
  if (mobileState.paused || !mobileState.loop || !mobileState.muted) throw new Error(`Mobile video setup is incorrect: ${JSON.stringify(mobileState)}`);
  const layout = await mobilePage.evaluate(() => ({ scrollWidth: document.documentElement.scrollWidth, clientWidth: document.documentElement.clientWidth }));
  if (layout.scrollWidth > layout.clientWidth) throw new Error(`Mobile layout overflows horizontally: ${JSON.stringify(layout)}`);
  await mobile.close();

  console.log(JSON.stringify({ scrollScrub: { before, after }, separateInformationBlock: true, serviceCards, mobileVideo: mobileState, mobileLayout: layout }));
} finally {
  await browser.close();
}
