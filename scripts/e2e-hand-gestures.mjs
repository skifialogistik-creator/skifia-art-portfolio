import { chromium } from "playwright-core";

const browser = await chromium.launch({ executablePath: "/usr/bin/chromium", headless: true, args: ["--no-sandbox", "--disable-dev-shm-usage"] });

async function stageState(page, selector) {
  await page.locator(selector).evaluate((element) => element.scrollIntoView({ block: "center", behavior: "instant" }));
  await page.waitForTimeout(700);
  return page.evaluate(() => {
    const video = document.querySelector("video.hand-motif");
    const label = document.querySelector(".hand-gesture-label");
    if (!video || !label) throw new Error("Hand gesture elements are missing");
    return {
      active: video.classList.contains("hand-motif-active"),
      time: video.currentTime,
      angle: video.style.getPropertyValue("--hand-angle"),
      label: label.textContent?.replace(/\s+/g, " ").trim(),
      scrollY: window.scrollY,
    };
  });
}

try {
  const desktop = await browser.newContext({ viewport: { width: 1280, height: 720 } });
  const page = await desktop.newPage();
  await page.goto("http://127.0.0.1:3000/", { waitUntil: "networkidle" });
  const ownership = await stageState(page, "#ownership");
  const checklist = await stageState(page, "#checklist");
  if (!ownership.active || !checklist.active || ownership.label === checklist.label || ownership.angle === checklist.angle || Math.abs(ownership.time - checklist.time) < 0.5) throw new Error(`Hand gesture did not change by stage: ${JSON.stringify({ ownership, checklist })}`);
  await page.locator("#services").scrollIntoViewIfNeeded();
  await page.waitForTimeout(600);
  const blueState = await page.locator("video.hand-motif").evaluate((video) => ({ active: video.classList.contains("hand-motif-active"), labelVisible: document.querySelector(".hand-gesture-label")?.classList.contains("hand-gesture-label-active") }));
  if (blueState.active || blueState.labelVisible) throw new Error(`Hand gesture should be hidden on blue section: ${JSON.stringify(blueState)}`);
  await desktop.close();

  const mobile = await browser.newContext({ viewport: { width: 375, height: 812 }, isMobile: true, hasTouch: true });
  const mobilePage = await mobile.newPage();
  await mobilePage.goto("http://127.0.0.1:3000/", { waitUntil: "networkidle" });
  const mobileState = await stageState(mobilePage, "#ownership");
  const mobileLayout = await mobilePage.evaluate(() => ({ scrollWidth: document.documentElement.scrollWidth, clientWidth: document.documentElement.clientWidth }));
  if (!mobileState.active || !mobileState.label || mobileLayout.scrollWidth > mobileLayout.clientWidth) throw new Error(`Mobile gesture stage is incorrect: ${JSON.stringify({ mobileState, mobileLayout })}`);
  await mobile.close();

  console.log(JSON.stringify({ ownership, checklist, blueState, mobileState, mobileLayout }));
} finally {
  await browser.close();
}
