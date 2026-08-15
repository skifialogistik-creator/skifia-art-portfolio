import { chromium } from "playwright-core";

const browser = await chromium.launch({ executablePath: "/usr/bin/chromium", headless: true, args: ["--no-sandbox", "--disable-dev-shm-usage"] });

try {
  const normalContext = await browser.newContext({ viewport: { width: 1280, height: 720 } });
  const normalPage = await normalContext.newPage();
  await normalPage.goto("http://127.0.0.1:3000/", { waitUntil: "networkidle" });
  await normalPage.locator("#services").scrollIntoViewIfNeeded();
  await normalPage.waitForTimeout(750);
  const serviceOpacity = await normalPage.locator("#services").evaluate((element) => getComputedStyle(element).opacity);
  if (Number.parseFloat(serviceOpacity) < 0.99) throw new Error(`Scroll reveal did not complete: opacity ${serviceOpacity}`);
  await normalContext.close();

  const reducedContext = await browser.newContext({ viewport: { width: 1280, height: 720 }, reducedMotion: "reduce" });
  const reducedPage = await reducedContext.newPage();
  await reducedPage.goto("http://127.0.0.1:3000/", { waitUntil: "networkidle" });
  await reducedPage.waitForTimeout(50);
  const reducedState = await reducedPage.evaluate(() => {
    const heading = document.querySelector("#top h1")?.textContent?.replace(/\s+/g, " ").trim();
    const video = document.querySelector("#top video");
    const ownership = document.querySelector("#ownership");
    return { heading, videoPaused: video?.paused, ownershipOpacity: ownership ? getComputedStyle(ownership).opacity : null };
  });
  if (reducedState.heading !== "Ваш сайт. Ваши аккаунты. Ваш контроль.") throw new Error("Reduced-motion mode did not render the full heading immediately");
  if (!reducedState.videoPaused) throw new Error("Reduced-motion mode should keep the interactive video paused");
  if (reducedState.ownershipOpacity !== "1") throw new Error(`Reduced-motion mode hid a section: opacity ${reducedState.ownershipOpacity}`);
  await reducedContext.close();

  console.log(JSON.stringify({ scrollReveal: serviceOpacity, reducedMotion: reducedState }));
} finally {
  await browser.close();
}
