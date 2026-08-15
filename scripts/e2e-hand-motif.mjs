import { chromium } from "playwright-core";

const browser = await chromium.launch({ executablePath: "/usr/bin/chromium", headless: true, args: ["--no-sandbox", "--disable-dev-shm-usage"] });

try {
  const desktop = await browser.newContext({ viewport: { width: 1280, height: 720 } });
  const page = await desktop.newPage();
  await page.goto("http://127.0.0.1:3000/", { waitUntil: "networkidle" });
  const motif = page.locator("video.hand-motif");
  const whiteSections = page.locator("main > section");
  const whiteCount = await page.evaluate(() => Array.from(document.querySelectorAll("main > section")).filter((section) => {
    const rgb = getComputedStyle(section).backgroundColor.match(/\d+/g)?.map(Number) || [];
    return section.id !== "hand-scene" && rgb.length >= 3 && rgb[0] > 170 && rgb[1] > 170 && rgb[2] > 170;
  }).length);
  if (whiteCount < 4) throw new Error(`Expected multiple light sections, found ${whiteCount}`);

  const firstLight = page.locator("#ownership");
  await firstLight.scrollIntoViewIfNeeded();
  await page.waitForTimeout(650);
  const lightState = await motif.evaluate((video) => ({ active: video.classList.contains("hand-motif-active"), opacity: getComputedStyle(video).opacity, paused: video.paused }));
  if (!lightState.active || Number.parseFloat(lightState.opacity) < 0.1 || lightState.paused) throw new Error(`Hand motif did not appear on a light section: ${JSON.stringify(lightState)}`);

  await page.locator("#services").scrollIntoViewIfNeeded();
  await page.waitForTimeout(750);
  const blueState = await motif.evaluate((video) => ({ active: video.classList.contains("hand-motif-active"), opacity: getComputedStyle(video).opacity }));
  if (blueState.active || Number.parseFloat(blueState.opacity) > 0.02) throw new Error(`Hand motif remained over the blue section: ${JSON.stringify(blueState)}`);
  await desktop.close();

  const mobile = await browser.newContext({ viewport: { width: 375, height: 812 }, isMobile: true, hasTouch: true });
  const mobilePage = await mobile.newPage();
  await mobilePage.goto("http://127.0.0.1:3000/", { waitUntil: "networkidle" });
  await mobilePage.locator("#ownership").scrollIntoViewIfNeeded();
  await mobilePage.waitForTimeout(650);
  const mobileState = await mobilePage.locator("video.hand-motif").evaluate((video) => ({ active: video.classList.contains("hand-motif-active"), opacity: getComputedStyle(video).opacity }));
  const mobileLayout = await mobilePage.evaluate(() => ({ scrollWidth: document.documentElement.scrollWidth, clientWidth: document.documentElement.clientWidth }));
  if (!mobileState.active || Number.parseFloat(mobileState.opacity) < 0.05 || mobileLayout.scrollWidth > mobileLayout.clientWidth) throw new Error(`Mobile hand motif is incorrect: ${JSON.stringify({ mobileState, mobileLayout })}`);
  await mobile.close();

  console.log(JSON.stringify({ whiteCount, lightState, blueState, mobileState, mobileLayout }));
} finally {
  await browser.close();
}
