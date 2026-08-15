import { chromium } from "playwright-core";

const browser = await chromium.launch({ executablePath: "/usr/bin/chromium", headless: true, args: ["--no-sandbox", "--disable-dev-shm-usage"] });

const overlapArea = (first, second) => Math.max(0, Math.min(first.right, second.right) - Math.max(first.left, second.left)) * Math.max(0, Math.min(first.bottom, second.bottom) - Math.max(first.top, second.top));

async function inspectSection(page, selector) {
  await page.locator(selector).evaluate((element) => element.scrollIntoView({ block: "center", behavior: "instant" }));
  await page.waitForTimeout(650);
  return page.evaluate(() => {
    const hand = document.querySelector("video.hand-motif");
    const section = document.querySelector(location.hash || "#ownership");
    if (!hand || !section) throw new Error("Required elements are missing");
    const handBox = hand.getBoundingClientRect();
    const targets = Array.from(section.querySelectorAll("h1, h2, h3, p, article, input, textarea, button, label")).filter((target) => {
      const style = getComputedStyle(target);
      const box = target.getBoundingClientRect();
      return style.visibility !== "hidden" && box.width > 0 && box.height > 0;
    }).map((target) => {
      const box = target.getBoundingClientRect();
      const x = Math.max(0, Math.min(handBox.right, box.right) - Math.max(handBox.left, box.left));
      const y = Math.max(0, Math.min(handBox.bottom, box.bottom) - Math.max(handBox.top, box.top));
      let layer = target;
      let zIndex = 0;
      while (layer && layer !== section) {
        const candidate = Number.parseInt(getComputedStyle(layer).zIndex, 10);
        if (Number.isFinite(candidate)) zIndex = Math.max(zIndex, candidate);
        layer = layer.parentElement;
      }
      return { tag: target.tagName, overlap: x * y, zIndex };
    });
    const unsafeOverlap = targets.filter((target) => target.overlap > 0 && target.zIndex <= Number.parseInt(getComputedStyle(hand).zIndex, 10)).length;
    return { handOpacity: getComputedStyle(hand).opacity, maxOverlap: Math.max(0, ...targets.map((target) => target.overlap)), unsafeOverlap, targetCount: targets.length };
  });
}

try {
  const desktop = await browser.newContext({ viewport: { width: 1280, height: 720 } });
  const page = await desktop.newPage();
  await page.goto("http://127.0.0.1:3000/#ownership", { waitUntil: "networkidle" });
  const ownership = await inspectSection(page, "#ownership");
  await page.goto("http://127.0.0.1:3000/#brief", { waitUntil: "networkidle" });
  const brief = await inspectSection(page, "#brief");
  if (ownership.maxOverlap > 0 || brief.maxOverlap > 0 || Number.parseFloat(ownership.handOpacity) < 0.3) throw new Error(`Hand overlaps content: ${JSON.stringify({ ownership, brief })}`);
  await desktop.close();

  const mobile = await browser.newContext({ viewport: { width: 375, height: 812 }, isMobile: true, hasTouch: true });
  const mobilePage = await mobile.newPage();
  await mobilePage.goto("http://127.0.0.1:3000/#brief", { waitUntil: "networkidle" });
  const mobileBrief = await inspectSection(mobilePage, "#brief");
  const mobileLayout = await mobilePage.evaluate(() => ({ scrollWidth: document.documentElement.scrollWidth, clientWidth: document.documentElement.clientWidth }));
  if (mobileBrief.maxOverlap > 0 || mobileLayout.scrollWidth > mobileLayout.clientWidth) throw new Error(`Mobile hand overlaps content: ${JSON.stringify({ mobileBrief, mobileLayout })}`);
  await mobile.close();

  console.log(JSON.stringify({ ownership, brief, mobileBrief, mobileLayout }));
} finally {
  await browser.close();
}
