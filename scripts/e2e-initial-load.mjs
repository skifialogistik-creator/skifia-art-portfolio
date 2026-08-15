import { chromium } from "playwright-core";

const browser = await chromium.launch({ executablePath: "/usr/bin/chromium", headless: true, args: ["--no-sandbox", "--disable-dev-shm-usage"] });

try {
  const context = await browser.newContext({ viewport: { width: 1280, height: 720 } });
  const page = await context.newPage();
  await page.goto("http://127.0.0.1:3000/", { waitUntil: "networkidle" });
  const resources = await page.evaluate(() => performance.getEntriesByType("resource").map((entry) => entry.name));
  if (resources.some((resource) => resource.includes("jspdf"))) throw new Error("PDF library was loaded before a user requested a brief PDF");
  if (!resources.some((resource) => resource.includes("interactive-figure"))) throw new Error("Interactive hero video did not load");
  console.log(JSON.stringify({ deferredPdf: true, interactiveVideoLoaded: true, resources: resources.length }));
  await context.close();
} finally {
  await browser.close();
}
