import { chromium } from "playwright-core";

const browser = await chromium.launch({ executablePath: "/usr/bin/chromium", headless: true, args: ["--no-sandbox", "--disable-dev-shm-usage"] });

try {
  const desktop = await browser.newContext({ viewport: { width: 1280, height: 720 } });
  const page = await desktop.newPage();
  await page.goto("http://127.0.0.1:3000/", { waitUntil: "networkidle" });
  const game = page.locator("#route-game");
  await game.scrollIntoViewIfNeeded();

  const first = game.getByRole("listitem", { name: /Бриф: доступен/ });
  await first.focus();
  await first.press("Enter");
  for (const label of ["Аккаунты", "Структура", "Дизайн", "Запуск", "Передача"]) {
    await game.getByRole("listitem", { name: new RegExp(`${label}: доступен`) }).click();
  }
  await game.getByText("Пакет владельца собран.").waitFor({ timeout: 10_000 });
  const completeCount = await game.getByText("6/6").count();
  if (!completeCount) throw new Error("Game did not display final progress");
  await game.getByRole("button", { name: /Начать заново/ }).click();
  if (!await game.getByRole("listitem", { name: /Бриф: доступен/ }).isVisible()) throw new Error("Game reset did not restore the first checkpoint");
  await desktop.close();

  const mobile = await browser.newContext({ viewport: { width: 375, height: 812 }, isMobile: true, hasTouch: true });
  const mobilePage = await mobile.newPage();
  await mobilePage.goto("http://127.0.0.1:3000/", { waitUntil: "networkidle" });
  await mobilePage.locator("#route-game").scrollIntoViewIfNeeded();
  const mobileLayout = await mobilePage.evaluate(() => ({ scrollWidth: document.documentElement.scrollWidth, clientWidth: document.documentElement.clientWidth }));
  if (mobileLayout.scrollWidth > mobileLayout.clientWidth) throw new Error(`Game caused horizontal overflow: ${JSON.stringify(mobileLayout)}`);
  if (!await mobilePage.getByRole("listitem", { name: /Бриф: доступен/ }).isVisible()) throw new Error("First mobile checkpoint is not visible");
  await mobile.close();

  console.log(JSON.stringify({ keyboardStart: true, completed: true, reset: true, mobileLayout }));
} finally {
  await browser.close();
}
