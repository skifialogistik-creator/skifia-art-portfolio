import { chromium } from "playwright-core";

const browser = await chromium.launch({ executablePath: "/usr/bin/chromium", headless: true, args: ["--no-sandbox", "--disable-dev-shm-usage"] });

try {
  const desktop = await browser.newContext({ viewport: { width: 1280, height: 720 } });
  const page = await desktop.newPage();
  await page.goto("http://127.0.0.1:3000/", { waitUntil: "networkidle" });

  const avatar = page.locator(".avatar-stage");
  const avatarImage = page.locator(".avatar-image");
  const avatarBox = await avatar.boundingBox();
  if (!avatarBox) throw new Error("3D avatar is not visible");
  await page.mouse.move(avatarBox.x + avatarBox.width * 0.78, avatarBox.y + avatarBox.height * 0.82);
  await page.waitForTimeout(120);
  const magneticTransform = await avatarImage.evaluate((element) => getComputedStyle(element).transform);
  if (magneticTransform === "none") throw new Error("Magnetic avatar did not react to pointer movement");

  const firstMarquee = page.locator(".marquee-row").first();
  const beforeMarquee = await firstMarquee.evaluate((element) => getComputedStyle(element).transform);
  await page.locator(".marquee-section").scrollIntoViewIfNeeded();
  await page.mouse.wheel(0, 520);
  await page.waitForTimeout(140);
  const afterMarquee = await firstMarquee.evaluate((element) => getComputedStyle(element).transform);
  if (beforeMarquee === afterMarquee) throw new Error("Scroll-driven marquee did not move");

  const firstSticky = page.locator(".project-sticky").first();
  await firstSticky.scrollIntoViewIfNeeded();
  await page.waitForTimeout(120);
  const stickyBox = await firstSticky.boundingBox();
  if (!stickyBox || stickyBox.y > 150) throw new Error("Project card is not sticky in the viewport");
  const projectSheet = firstSticky.locator(".project-sheet");
  const shadowBefore = await projectSheet.evaluate((element) => getComputedStyle(element).boxShadow);
  const liftBefore = await firstSticky.evaluate((element) => getComputedStyle(element).transform);
  await projectSheet.hover();
  await page.waitForTimeout(520);
  const shadowAfter = await projectSheet.evaluate((element) => getComputedStyle(element).boxShadow);
  const liftAfter = await firstSticky.evaluate((element) => getComputedStyle(element).transform);
  if (shadowBefore === shadowAfter) throw new Error("Project card glow did not appear on hover");
  if (liftBefore === liftAfter) throw new Error("Project card did not lift on hover");
  await desktop.close();

  const reduced = await browser.newContext({ viewport: { width: 1280, height: 720 }, reducedMotion: "reduce" });
  const reducedPage = await reduced.newPage();
  await reducedPage.goto("http://127.0.0.1:3000/", { waitUntil: "networkidle" });
  const reducedAvatar = reducedPage.locator(".avatar-stage");
  const reducedImage = reducedPage.locator(".avatar-image");
  const reducedBox = await reducedAvatar.boundingBox();
  if (!reducedBox) throw new Error("Reduced-motion avatar is not visible");
  await reducedPage.mouse.move(reducedBox.x + reducedBox.width * 0.78, reducedBox.y + reducedBox.height * 0.82);
  await reducedPage.waitForTimeout(100);
  const reducedTransform = await reducedImage.evaluate((element) => getComputedStyle(element).transform);
  if (reducedTransform !== "none") throw new Error("Avatar still moves with reduced motion enabled");

  const reducedMarquee = reducedPage.locator(".marquee-row").first();
  const beforeReducedMarquee = await reducedMarquee.evaluate((element) => getComputedStyle(element).transform);
  await reducedPage.locator(".marquee-section").scrollIntoViewIfNeeded();
  await reducedPage.mouse.wheel(0, 520);
  await reducedPage.waitForTimeout(120);
  const afterReducedMarquee = await reducedMarquee.evaluate((element) => getComputedStyle(element).transform);
  if (beforeReducedMarquee !== afterReducedMarquee) throw new Error("Marquee still moves with reduced motion enabled");
  await reduced.close();

  console.log(JSON.stringify({ magneticTransform, marqueeMoved: beforeMarquee !== afterMarquee, stickyY: stickyBox.y, projectGlow: shadowBefore !== shadowAfter, projectLift: liftBefore !== liftAfter, reducedMotion: true }));
} finally {
  await browser.close();
}
