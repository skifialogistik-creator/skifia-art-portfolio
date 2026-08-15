import { chromium } from "playwright-core";

const browser = await chromium.launch({ executablePath: "/usr/bin/chromium", headless: true, args: ["--no-sandbox", "--disable-dev-shm-usage"] });

const soundMock = () => {
  class FakeAudioContext {
    static instances = 0;
    constructor() { FakeAudioContext.instances += 1; this.currentTime = 0; this.state = "running"; this.destination = {}; }
    resume() { return Promise.resolve(); }
    createOscillator() { return { type: "sine", frequency: { setValueAtTime() {}, exponentialRampToValueAtTime() {} }, connect(target) { return target; }, start() { window.__gestureSoundStarts = (window.__gestureSoundStarts || 0) + 1; }, stop() {} }; }
    createGain() { return { gain: { setValueAtTime() {}, exponentialRampToValueAtTime() {} }, connect(target) { return target; } }; }
    createBiquadFilter() { return { type: "lowpass", frequency: { setValueAtTime() {} }, connect(target) { return target; } }; }
  }
  window.AudioContext = FakeAudioContext;
  window.__gestureSoundStarts = 0;
};

try {
  const desktop = await browser.newContext({ viewport: { width: 1280, height: 720 } });
  const page = await desktop.newPage();
  await page.addInitScript(soundMock);
  await page.goto("http://127.0.0.1:3000/", { waitUntil: "networkidle" });
  await page.locator("#ownership").evaluate((element) => element.scrollIntoView({ block: "center", behavior: "instant" }));
  await page.waitForTimeout(650);
  const toggle = page.locator(".hand-sound-toggle");
  await toggle.waitFor({ state: "attached" });
  const preClickState = await toggle.evaluate((button) => ({ visible: getComputedStyle(button).opacity, text: button.textContent }));
  if (Number.parseFloat(preClickState.visible) < 0.9) throw new Error(`Sound toggle did not appear on a gesture stage: ${JSON.stringify(preClickState)}`);
  await toggle.click();
  await page.waitForTimeout(80);
  const enabledState = await toggle.evaluate((button) => ({ pressed: button.getAttribute("aria-pressed"), visible: getComputedStyle(button).opacity }));
  const firstSound = await page.evaluate(() => window.__gestureSoundStarts);
  const handVisibility = await page.locator("video.hand-motif").evaluate((video) => getComputedStyle(video).opacity);
  if (enabledState.pressed !== "true" || Number.parseFloat(enabledState.visible) < 0.9 || firstSound < 1 || Number.parseFloat(handVisibility) < 0.3) throw new Error(`Sound or hand visibility failed: ${JSON.stringify({ enabledState, firstSound, handVisibility })}`);
  await page.locator("#checklist").evaluate((element) => element.scrollIntoView({ block: "center", behavior: "instant" }));
  await page.waitForTimeout(700);
  const secondSound = await page.evaluate(() => window.__gestureSoundStarts);
  if (secondSound < 2) throw new Error(`A changed gesture did not produce a second sound: ${secondSound}`);
  await desktop.close();

  const mobile = await browser.newContext({ viewport: { width: 375, height: 812 }, isMobile: true, hasTouch: true });
  const mobilePage = await mobile.newPage();
  await mobilePage.addInitScript(soundMock);
  await mobilePage.goto("http://127.0.0.1:3000/", { waitUntil: "networkidle" });
  await mobilePage.locator("#ownership").evaluate((element) => element.scrollIntoView({ block: "center", behavior: "instant" }));
  await mobilePage.waitForTimeout(650);
  const mobileState = await mobilePage.evaluate(() => ({ handOpacity: getComputedStyle(document.querySelector("video.hand-motif")).opacity, toggleVisible: getComputedStyle(document.querySelector(".hand-sound-toggle")).opacity, scrollWidth: document.documentElement.scrollWidth, clientWidth: document.documentElement.clientWidth }));
  if (Number.parseFloat(mobileState.handOpacity) < 0.2 || Number.parseFloat(mobileState.toggleVisible) < 0.9 || mobileState.scrollWidth > mobileState.clientWidth) throw new Error(`Mobile hand sound UI failed: ${JSON.stringify(mobileState)}`);
  await mobile.close();

  const reduced = await browser.newContext({ viewport: { width: 1280, height: 720 }, reducedMotion: "reduce" });
  const reducedPage = await reduced.newPage();
  await reducedPage.addInitScript(soundMock);
  await reducedPage.goto("http://127.0.0.1:3000/", { waitUntil: "networkidle" });
  await reducedPage.locator("#ownership").evaluate((element) => element.scrollIntoView({ block: "center", behavior: "instant" }));
  await reducedPage.waitForTimeout(300);
  const reducedState = await reducedPage.locator(".hand-sound-toggle").evaluate((button) => ({ disabled: button.disabled, starts: window.__gestureSoundStarts }));
  if (!reducedState.disabled || reducedState.starts !== 0) throw new Error(`Reduced-motion should disable sound: ${JSON.stringify(reducedState)}`);
  await reduced.close();

  console.log(JSON.stringify({ enabledState, firstSound, secondSound, handVisibility, mobileState, reducedState }));
} finally {
  await browser.close();
}
