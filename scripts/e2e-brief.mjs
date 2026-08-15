import { chromium } from "playwright-core";

const browser = await chromium.launch({
  executablePath: "/usr/bin/chromium",
  headless: true,
  args: ["--no-sandbox", "--disable-dev-shm-usage"],
});

try {
  const mobile = process.env.BRIEF_E2E_MOBILE === "1";
  const context = await browser.newContext({
    acceptDownloads: true,
    viewport: mobile ? { width: 375, height: 812 } : { width: 1280, height: 720 },
    isMobile: mobile,
    hasTouch: mobile,
  });
  const page = await context.newPage();
  await page.goto("http://127.0.0.1:3000/", { waitUntil: "networkidle" });
  await page.locator("#brief").scrollIntoViewIfNeeded();

  await page.getByPlaceholder("Как к вам обращаться").fill("E2E Клиент");
  await page.getByPlaceholder("Например, Studio Forma").fill(mobile ? "E2E mobile validation" : "E2E validation");
  await page.getByPlaceholder("name@company.com").fill(mobile ? "e2e-brief-mobile@example.com" : "e2e-brief-validation@example.com");
  await page.getByPlaceholder("+48 ... или @telegram").fill("+48 600 000 000");
  await page.getByPlaceholder("Чем занимаетесь, как давно работаете, в чём специфика вашей работы?").fill("Тестовый сервис для браузерной проверки полного сценария отправки брифа.");
  await page.getByPlaceholder("Ключевые услуги, товары, форматы работы, диапазон цен").fill("Тестовая консультация и настройка сайта.");
  await page.getByPlaceholder("Город, страна, онлайн").fill("Варшава");
  await page.getByRole("button", { name: "Дальше" }).click();

  await page.getByPlaceholder("Кто эти люди, с какой задачей приходят, что для них важно при выборе?").fill("Предприниматели, которым нужен понятный сайт для обращений.");
  await page.getByRole("button", { name: "Получать больше заявок" }).click();
  await page.getByPlaceholder("Например: стабильные заявки из поиска, понятный образ бренда, меньше однотипных вопросов").fill("Получать понятные заявки от подходящих клиентов.");
  await page.getByRole("button", { name: "Дальше" }).click();

  await page.getByRole("button", { name: "Дальше" }).click();
  await page.getByRole("button", { name: "Дальше" }).click();

  await page.getByPlaceholder("Например, до 15 октября").fill("В течение месяца");
  await page.locator("select").last().selectOption({ label: "Нужна оценка после брифа" });
  await page.getByRole("checkbox", { name: /Я согласен\(на\) на сохранение данных заявки/ }).check();

  const initialPdf = page.waitForEvent("download");
  await page.getByRole("button", { name: "Сохранить и скачать PDF" }).click();
  const initialDownload = await initialPdf;
  await page.getByText("Заявка принята").waitFor({ timeout: 20_000 });
  const applicationId = (await page.locator("text=/BR-[A-Z0-9-]+/").first().textContent())?.trim();
  if (!applicationId?.startsWith("BR-")) throw new Error("Success screen did not display an application number");
  if (!initialDownload.suggestedFilename().endsWith(".pdf")) throw new Error("Initial PDF download did not have a PDF filename");
  if (!(await initialDownload.path())) throw new Error("Initial PDF download was unavailable");

  const repeatPdf = page.waitForEvent("download");
  await page.getByRole("button", { name: "Скачать PDF ещё раз" }).click();
  const repeatDownload = await repeatPdf;
  if (!repeatDownload.suggestedFilename().endsWith(".pdf") || !(await repeatDownload.path())) throw new Error("Repeat PDF download failed");

  console.log(JSON.stringify({ mobile, applicationId, initialPdf: initialDownload.suggestedFilename(), repeatPdf: repeatDownload.suggestedFilename() }));
  await context.close();
} finally {
  await browser.close();
}
