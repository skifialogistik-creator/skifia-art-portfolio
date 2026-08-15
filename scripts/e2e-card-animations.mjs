import { chromium } from "playwright-core";

const browser = await chromium.launch({ executablePath: "/usr/bin/chromium", headless: true, args: ["--no-sandbox", "--disable-dev-shm-usage"] });

try {
  const normal = await browser.newContext({ viewport: { width: 1280, height: 720 } });
  const page = await normal.newPage();
  await page.goto("http://127.0.0.1:3000/", { waitUntil: "networkidle" });
  const services = page.locator("#services .border-t > article");
  await services.first().scrollIntoViewIfNeeded();
  await page.waitForTimeout(1050);
  const normalState = await services.evaluateAll((cards) => cards.slice(0, 3).map((card) => ({
    visible: card.classList.contains("card-visible"),
    opacity: getComputedStyle(card).opacity,
    filter: getComputedStyle(card).filter,
    delay: card.style.getPropertyValue("--card-delay"),
  })));
  if (normalState.some((card) => !card.visible || Number.parseFloat(card.opacity) < 0.99 || !["none", "blur(0px)"].includes(card.filter))) throw new Error(`Cards did not complete their entrance: ${JSON.stringify(normalState)}`);
  if (new Set(normalState.map((card) => card.delay)).size < 2) throw new Error(`Cards do not have staggered timing: ${JSON.stringify(normalState)}`);
  await normal.close();

  const reduced = await browser.newContext({ viewport: { width: 1280, height: 720 }, reducedMotion: "reduce" });
  const reducedPage = await reduced.newPage();
  await reducedPage.goto("http://127.0.0.1:3000/", { waitUntil: "networkidle" });
  const reducedState = await reducedPage.locator("#services .border-t > article").evaluateAll((cards) => cards.slice(0, 3).map((card) => ({
    hasRevealClass: card.classList.contains("card-reveal"),
    opacity: getComputedStyle(card).opacity,
  })));
  if (reducedState.some((card) => card.hasRevealClass || Number.parseFloat(card.opacity) < 0.99)) throw new Error(`Reduced-motion cards are not immediately accessible: ${JSON.stringify(reducedState)}`);
  await reduced.close();

  const mobile = await browser.newContext({ viewport: { width: 375, height: 812 }, isMobile: true, hasTouch: true });
  const mobilePage = await mobile.newPage();
  await mobilePage.goto("http://127.0.0.1:3000/", { waitUntil: "networkidle" });
  const mobileCards = mobilePage.locator("#services .border-t > article");
  await mobileCards.first().scrollIntoViewIfNeeded();
  await mobilePage.waitForTimeout(1050);
  const mobileState = await mobileCards.evaluateAll((cards) => cards.slice(0, 2).map((card) => ({
    visible: card.classList.contains("card-visible"),
    opacity: getComputedStyle(card).opacity,
  })));
  const mobileLayout = await mobilePage.evaluate(() => ({ scrollWidth: document.documentElement.scrollWidth, clientWidth: document.documentElement.clientWidth }));
  if (mobileState.some((card) => !card.visible || Number.parseFloat(card.opacity) < 0.99) || mobileLayout.scrollWidth > mobileLayout.clientWidth) throw new Error(`Mobile card animation is incorrect: ${JSON.stringify({ mobileState, mobileLayout })}`);
  await mobile.close();

  console.log(JSON.stringify({ normalState, reducedState, mobileState, mobileLayout }));
} finally {
  await browser.close();
}
