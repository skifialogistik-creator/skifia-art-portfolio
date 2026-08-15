import { chromium } from "playwright-core";

const browser = await chromium.launch({ executablePath: "/usr/bin/chromium", headless: true, args: ["--no-sandbox", "--disable-dev-shm-usage"] });

try {
  const desktop = await browser.newContext({ viewport: { width: 1280, height: 720 } });
  const page = await desktop.newPage();
  await page.goto("http://127.0.0.1:3000/", { waitUntil: "networkidle" });
  const figure = page.locator("#top video");
  await figure.evaluate((element) => new Promise((resolve) => {
    if (element.readyState >= 2) resolve(undefined);
    else element.addEventListener("loadeddata", () => resolve(undefined), { once: true });
  }));
  const figureBox = await figure.boundingBox();
  if (!figureBox) throw new Error("Figure video is not visible in the top scene");
  await page.mouse.move(figureBox.x + figureBox.width * 0.16, figureBox.y + figureBox.height * 0.55);
  await page.waitForTimeout(120);
  const leftTime = await figure.evaluate((element) => element.currentTime);
  await page.mouse.move(figureBox.x + figureBox.width * 0.84, figureBox.y + figureBox.height * 0.55);
  await page.waitForTimeout(120);
  const rightTime = await figure.evaluate((element) => element.currentTime);
  if (!(rightTime > leftTime + 0.4)) throw new Error(`Figure did not respond to the pointer: ${leftTime} → ${rightTime}`);

  const order = await page.evaluate(() => {
    const top = document.querySelector("#top")?.getBoundingClientRect();
    const hand = document.querySelector("#hand-scene")?.getBoundingClientRect();
    return { topBottom: top?.bottom ?? 0, handTop: hand?.top ?? 0 };
  });
  if (order.handTop < order.topBottom - 1) throw new Error(`Hand block is not below the figure scene: ${JSON.stringify(order)}`);
  await page.locator("#hand-scene").scrollIntoViewIfNeeded();
  await page.waitForTimeout(250);
  const handState = await page.locator("#hand-scene video").evaluate((element) => ({ paused: element.paused, loop: element.loop }));
  if (handState.paused || !handState.loop) throw new Error(`Hand scene did not play when visible: ${JSON.stringify(handState)}`);

  const visualState = await page.evaluate(() => {
    const blue = document.querySelector("#control-story");
    const brief = document.querySelector('header a[href="#brief"]');
    if (!blue || !brief) throw new Error("Required visual elements are missing");
    const blueStyle = getComputedStyle(blue);
    const briefStyle = getComputedStyle(brief);
    return { blue: blueStyle.backgroundColor, briefBackground: briefStyle.backgroundColor, briefText: briefStyle.color };
  });
  if (visualState.blue !== "rgb(7, 92, 112)" || visualState.briefText !== "rgb(255, 255, 255)") throw new Error(`Color contrast is not restored: ${JSON.stringify(visualState)}`);
  await desktop.close();

  const mobile = await browser.newContext({ viewport: { width: 375, height: 812 }, isMobile: true, hasTouch: true });
  const mobilePage = await mobile.newPage();
  await mobilePage.goto("http://127.0.0.1:3000/", { waitUntil: "networkidle" });
  const mobileState = await mobilePage.locator("#top video").evaluate((element) => ({ paused: element.paused, loop: element.loop, muted: element.muted }));
  const mobileLayout = await mobilePage.evaluate(() => ({ scrollWidth: document.documentElement.scrollWidth, clientWidth: document.documentElement.clientWidth }));
  if (mobileState.paused || !mobileState.loop || !mobileState.muted || mobileLayout.scrollWidth > mobileLayout.clientWidth) throw new Error(`Mobile scene is incorrect: ${JSON.stringify({ mobileState, mobileLayout })}`);
  await mobile.close();

  console.log(JSON.stringify({ figurePointerControl: { leftTime, rightTime }, handScene: handState, visualState, mobileState, mobileLayout }));
} finally {
  await browser.close();
}
