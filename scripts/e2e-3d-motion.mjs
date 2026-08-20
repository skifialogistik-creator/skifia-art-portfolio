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
  const magneticBefore = await avatarImage.evaluate((element) => getComputedStyle(element).transform);
  await avatar.evaluate((element) => {
    const box = element.getBoundingClientRect();
    element.dispatchEvent(new PointerEvent("pointermove", { bubbles: true, clientX: box.left + box.width * 0.78, clientY: box.top + box.height * 0.82 }));
  });
  await page.waitForTimeout(220);
  const magneticTransform = await avatarImage.evaluate((element) => getComputedStyle(element).transform);
  if (magneticTransform === magneticBefore) throw new Error("Magnetic avatar did not react to pointer movement");

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
  const services = page.locator(".services-showcase");
  await services.scrollIntoViewIfNeeded();
  const servicesVideo = services.locator("video");
  await page.waitForTimeout(600);
  const videoState = await servicesVideo.evaluate((video) => ({ playing: !video.paused, time: video.currentTime, source: video.querySelector("source")?.getAttribute("src") }));
  if (!videoState.playing || videoState.time <= 0 || !videoState.source?.includes("chrome-kinetic-reference")) throw new Error("Services video background is not playing");
  const about = page.locator(".about-portrait");
  await about.scrollIntoViewIfNeeded();
  const aboutVideo = about.locator("video");
  await page.waitForTimeout(600);
  const aboutVideoState = await aboutVideo.evaluate((video) => ({ playing: !video.paused, time: video.currentTime, source: video.querySelector("source")?.getAttribute("src"), clip: getComputedStyle(video).clipPath, width: video.getBoundingClientRect().width, height: video.getBoundingClientRect().height }));
  const revealIsOpen = !aboutVideoState.clip.includes("100%");
  if (!aboutVideoState.source?.includes("sliding-portrait-reference") || !revealIsOpen || aboutVideoState.width < 1000 || aboutVideoState.height < 500) throw new Error("About portrait video is not clearly rendered");
  const aboutCta = about.locator(".about-portrait-cta");
  const servicesCta = services.locator(".services-primary-cta");
  const aboutCtaBox = await aboutCta.boundingBox();
  await services.scrollIntoViewIfNeeded();
  const servicesCtaBox = await servicesCta.boundingBox();
  const servicesCtaHref = await servicesCta.getAttribute("href");
  const serviceCaptions = services.locator(".services-caption");
  const firstCaptionFontSize = await serviceCaptions.first().evaluate((element) => Number.parseFloat(getComputedStyle(element).fontSize));
  if (!aboutCtaBox || !servicesCtaBox || aboutCtaBox.width < 100 || servicesCtaBox.width < 100 || servicesCtaHref !== "https://t.me/Tristan_81" || await serviceCaptions.count() !== 2 || firstCaptionFontSize < 14) throw new Error("Primary CTAs or service captions are not sufficiently visible");
  await desktop.close();

  const mobile = await browser.newContext({ viewport: { width: 390, height: 844 } });
  const mobilePage = await mobile.newPage();
  await mobilePage.goto("http://127.0.0.1:3000/", { waitUntil: "networkidle" });
  const mobileServices = mobilePage.locator(".services-showcase");
  await mobileServices.scrollIntoViewIfNeeded();
  const mobileServicesBox = await mobileServices.boundingBox();
  const mobileWords = await mobileServices.locator(".services-word").count();
  const mobileAbout = mobilePage.locator(".about-portrait");
  await mobileAbout.scrollIntoViewIfNeeded();
  const mobileAboutVideo = mobileAbout.locator("video");
  const mobileAboutCta = mobileAbout.locator(".about-portrait-cta");
  const mobileCtaBox = await mobileAboutCta.boundingBox();
  await mobileServices.scrollIntoViewIfNeeded();
  const mobileServicesCta = mobileServices.locator(".services-primary-cta");
  const mobileServicesCtaBox = await mobileServicesCta.boundingBox();
  const mobileCaptions = mobileServices.locator(".services-caption");
  const mobileCaptionBoxes = await Promise.all([0, 1].map((index) => mobileCaptions.nth(index).boundingBox()));
  const mobileCaptionFontSize = await mobileCaptions.first().evaluate((element) => Number.parseFloat(getComputedStyle(element).fontSize));
  await mobilePage.waitForTimeout(1200);
  await mobilePage.screenshot({ path: "/home/ubuntu/mobile-services-caption-check.png", fullPage: false });
  if (!mobileServicesBox || mobileServicesBox.width < 360 || mobileWords !== 3 || await mobileAboutVideo.count() !== 1 || !mobileCtaBox || mobileCtaBox.width < 100 || !mobileServicesCtaBox || mobileServicesCtaBox.width < 100 || await mobileServicesCta.getAttribute("href") !== "https://t.me/Tristan_81" || await mobileCaptions.count() !== 2 || mobileCaptionBoxes.some((box) => !box || box.width < 130 || box.height < 50) || mobileCaptionFontSize < 13) throw new Error("Services or about scene is not readable on mobile");
  await mobile.close();

  const reduced = await browser.newContext({ viewport: { width: 1280, height: 720 }, reducedMotion: "reduce" });
  const reducedPage = await reduced.newPage();
  await reducedPage.goto("http://127.0.0.1:3000/", { waitUntil: "networkidle" });
  const reducedAvatar = reducedPage.locator(".avatar-stage");
  const reducedImage = reducedPage.locator(".avatar-image");
  const reducedBox = await reducedAvatar.boundingBox();
  if (!reducedBox) throw new Error("Reduced-motion avatar is not visible");
  await reducedAvatar.evaluate((element) => {
    const box = element.getBoundingClientRect();
    element.dispatchEvent(new PointerEvent("pointermove", { bubbles: true, clientX: box.left + box.width * 0.78, clientY: box.top + box.height * 0.82 }));
  });
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

  console.log(JSON.stringify({ magneticTransform, marqueeMoved: beforeMarquee !== afterMarquee, stickyY: stickyBox.y, projectGlow: shadowBefore !== shadowAfter, projectLift: liftBefore !== liftAfter, servicesVideoPlaying: videoState.playing, aboutVideoPlaying: aboutVideoState.playing, mobileServicesWords: mobileWords, reducedMotion: true }));
} finally {
  await browser.close();
}
