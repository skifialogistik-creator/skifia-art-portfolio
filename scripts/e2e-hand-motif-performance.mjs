import { chromium } from "playwright-core";

const browser = await chromium.launch({ executablePath: "/usr/bin/chromium", headless: true, args: ["--no-sandbox", "--disable-dev-shm-usage"] });

async function measure(page) {
  return page.evaluate(async () => {
    const frameTimes = [];
    let previous = performance.now();
    await new Promise((resolve) => {
      const tick = (now) => {
        frameTimes.push(now - previous);
        previous = now;
        if (frameTimes.length >= 60) resolve(undefined);
        else requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    });
    const resources = performance.getEntriesByType("resource").filter((entry) => entry.name.includes("robotic-hand"));
    const averageFrame = frameTimes.slice(1).reduce((sum, value) => sum + value, 0) / Math.max(1, frameTimes.length - 1);
    return { averageFrame, robotHandRequests: resources.length, longFrames: frameTimes.filter((value) => value > 40).length };
  });
}

try {
  const desktop = await browser.newContext({ viewport: { width: 1280, height: 720 } });
  const page = await desktop.newPage();
  await page.goto("http://127.0.0.1:3000/", { waitUntil: "networkidle" });
  await page.locator("#ownership").scrollIntoViewIfNeeded();
  await page.waitForTimeout(500);
  const desktopMetrics = await measure(page);
  if (desktopMetrics.robotHandRequests > 3 || desktopMetrics.averageFrame > 34 || desktopMetrics.longFrames > 5) throw new Error(`Desktop motif performance is degraded: ${JSON.stringify(desktopMetrics)}`);
  await desktop.close();

  const mobile = await browser.newContext({ viewport: { width: 375, height: 812 }, isMobile: true, hasTouch: true });
  const mobilePage = await mobile.newPage();
  await mobilePage.goto("http://127.0.0.1:3000/", { waitUntil: "networkidle" });
  await mobilePage.locator("#ownership").scrollIntoViewIfNeeded();
  await mobilePage.waitForTimeout(500);
  const mobileMetrics = await measure(mobilePage);
  if (mobileMetrics.robotHandRequests > 3 || mobileMetrics.averageFrame > 34 || mobileMetrics.longFrames > 5) throw new Error(`Mobile motif performance is degraded: ${JSON.stringify(mobileMetrics)}`);
  await mobile.close();

  console.log(JSON.stringify({ desktopMetrics, mobileMetrics }));
} finally {
  await browser.close();
}
