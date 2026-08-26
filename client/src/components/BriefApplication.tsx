/*
 * Design: «Ночной контроль». Заявка остаётся спокойной и понятной,
 * но получает самостоятельную контрастную неоновую систему состояний.
 */
import { Check, CheckCircle2, ChevronLeft, ChevronRight, Download, Loader2, Send, ShieldCheck } from "lucide-react";
import { useMemo, useState } from "react";
import { trpc } from "@/lib/trpc";
import { getUiCopy, normalizeSiteContentBundle } from "@shared/locales";
import { useLocale } from "@/contexts/LocaleContext";

const pdfFontUrl = "/manus-storage/NotoSans-Regular_f2352b28.ttf";
const fieldClassName = "mt-2 w-full border-b border-[#6a4a8c] bg-transparent px-0 py-3 text-lg text-[#fff7ff] outline-none caret-[#53e0cf] placeholder:text-[#9a83b3] focus:border-[#53e0cf]";

const goalOptions = ["Получать больше заявок", "Объяснить услуги и цены", "Показать экспертность", "Увеличить доверие", "Продавать онлайн", "Упростить запись / бронь"];
const pageOptions = ["Главная", "Услуги", "О компании", "Кейсы / портфолио", "Цены", "Отзывы", "Блог / статьи", "Контакты"];
const featureOptions = ["Форма заявки", "Telegram / WhatsApp", "Онлайн-запись", "Калькулятор", "Каталог", "Личный кабинет", "Мультиязычность", "Интеграция с CRM"];
const materialOptions = ["Логотип", "Фирменные цвета", "Фотографии", "Видео", "Тексты", "Ничего — нужна помощь"];
const styleOptions = ["Спокойный", "Премиальный", "Смелый", "Минималистичный", "Технологичный", "Тёплый и человечный", "Editorial", "Экспрессивный"];
const projectTypeOptions = ["Лендинг", "Сайт компании", "Интернет-магазин", "Каталог", "Сервис / личный кабинет", "Портфолио", "Блог / медиа", "Другое"];
const projectStageOptions = ["Только идея", "Бизнес уже работает", "Сайт устарел", "Сайт есть — нужны заявки", "Нужен перезапуск проекта"];
const audienceOptions = ["Частные клиенты", "Компании", "Премиум-сегмент", "Локальные клиенты", "Международная аудитория", "Специалисты / партнёры"];
const scenarioOptions = ["Оставить заявку", "Записаться", "Купить", "Рассчитать стоимость", "Посмотреть кейсы", "Написать в мессенджер"];
const optionKeys: Record<string, string> = { "Получать больше заявок": "leads", "Объяснить услуги и цены": "explain", "Показать экспертность": "expertise", "Увеличить доверие": "trust", "Продавать онлайн": "sellOnline", "Упростить запись / бронь": "booking", "Главная": "home", "Услуги": "services", "О компании": "about", "Кейсы / портфолио": "cases", "Цены": "prices", "Отзывы": "reviews", "Блог / статьи": "blog", "Контакты": "contacts", "Форма заявки": "brief", "Telegram / WhatsApp": "messengers", "Онлайн-запись": "bookingOnline", "Калькулятор": "calculator", "Каталог": "catalog", "Личный кабинет": "account", "Мультиязычность": "multilingual", "Интеграция с CRM": "crm", "Логотип": "logo", "Фирменные цвета": "brandColors", "Фотографии": "photos", "Видео": "video", "Тексты": "texts", "Ничего — нужна помощь": "needHelp", "Спокойный": "calm", "Премиальный": "premiumStyle", "Смелый": "bold", "Минималистичный": "minimal", "Технологичный": "tech", "Тёплый и человечный": "warm", "Editorial": "editorial", "Экспрессивный": "expressive", "Лендинг": "landing", "Сайт компании": "company", "Интернет-магазин": "shop", "Сервис / личный кабинет": "service", "Портфолио": "portfolio", "Блог / медиа": "blog", "Другое": "other", "Только идея": "idea", "Бизнес уже работает": "working", "Сайт устарел": "outdated", "Сайт есть — нужны заявки": "leads", "Нужен перезапуск проекта": "restart", "Частные клиенты": "private", "Компании": "companies", "Премиум-сегмент": "premium", "Локальные клиенты": "local", "Международная аудитория": "international", "Специалисты / партнёры": "partners", "Оставить заявку": "apply", "Записаться": "book", "Купить": "buy", "Рассчитать стоимость": "calculate", "Посмотреть кейсы": "cases", "Написать в мессенджер": "message", "Доверьтесь вашему предложению": "trustColor", "Светлая, воздушная палитра": "lightColor", "Тёмная, статусная палитра": "darkColor", "Контрастная и энергичная палитра": "contrastColor", "Есть фирменные цвета — использовать их": "brandColors", "Нужен новый сайт": "newSite", "Есть сайт, нужен редизайн": "redesign", "Всё готово": "contentReady", "Нужно помочь со структурой и текстом": "contentHelp" };

const steps = [
  ["01", "О проекте", "Контакты и основа бизнеса"],
  ["02", "Цели", "Кому и зачем нужен сайт"],
  ["03", "Структура", "Страницы и полезные функции"],
  ["04", "Визуальный язык", "Стиль, цвета и ориентиры"],
  ["05", "Организация", "Срок, бюджет и запуск"],
] as const;

type BriefFormData = {
  fullName: string;
  companyName: string;
  projectType: string;
  projectStage: string;
  email: string;
  phone: string;
  contactPreference: string;
  leadSource: string;
  businessDescription: string;
  offers: string;
  audience: string;
  audienceTypes: string[];
  primaryScenarios: string[];
  goals: string[];
  mainGoal: string;
  whyChoose: string;
  geography: string;
  currentSiteState: string;
  requiredPages: string[];
  features: string[];
  styleWords: string[];
  references: string;
  colorDirection: string;
  colorNotes: string;
  availableMaterials: string[];
  contentReadiness: string;
  deadline: string;
  budgetRange: string;
  comment: string;
  consent: boolean;
};

const initialData: BriefFormData = {
  fullName: "", companyName: "", projectType: "Лендинг", projectStage: "Только идея", email: "", phone: "", contactPreference: "Telegram", leadSource: "Telegram", businessDescription: "", offers: "", audience: "", audienceTypes: [], primaryScenarios: [], goals: [], mainGoal: "", whyChoose: "", geography: "", currentSiteState: "Нужен новый сайт", requiredPages: ["Главная", "Услуги", "Контакты"], features: ["Форма заявки"], styleWords: ["Спокойный"], references: "", colorDirection: "Доверьтесь вашему предложению", colorNotes: "", availableMaterials: [], contentReadiness: "Нужно помочь со структурой и текстом", deadline: "", budgetRange: "", comment: "", consent: false,
};

function FieldLabel({ children, required = false }: { children: string; required?: boolean }) {
  return <span className="font-mono text-[10px] font-medium uppercase tracking-[0.14em] text-[#7de5d6]">{children}{required && <span className="ml-1 text-[#ff6fae]">*</span>}</span>;
}

function ToggleGroup({ options, selected, onChange, minOne = false, labels = {} }: { options: string[]; selected?: string[]; onChange: (next: string[]) => void; minOne?: boolean; labels?: Record<string, string> }) {
  const safeSelected = Array.isArray(selected) ? selected : [];
  const toggle = (option: string) => {
    const alreadySelected = safeSelected.includes(option);
    if (alreadySelected && minOne && safeSelected.length === 1) return;
    onChange(alreadySelected ? safeSelected.filter((item) => item !== option) : [...safeSelected, option]);
  };
  return <div className="flex flex-wrap gap-2">{options.map((option) => { const active = safeSelected.includes(option); return <button key={option} type="button" aria-pressed={active} onClick={() => toggle(option)} className={`inline-flex items-center gap-2 border px-3 py-2 text-sm transition-all duration-200 active:scale-[0.97] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#53e0cf] ${active ? "border-[#53e0cf] bg-[#6928c8] text-white shadow-[0_0_18px_rgba(255,104,223,.24)]" : "border-[#553875] bg-[#170c29] text-[#d7c6e8] hover:border-[#b761ff] hover:text-[#fff5ff]"}`}>{active && <Check className="h-3.5 w-3.5" />}{labels[option] ?? option}</button>; })}</div>;
}

function RadioOption({ checked, label, detail, onChange }: { checked: boolean; label: string; detail: string; onChange: () => void }) {
  return <button type="button" onClick={onChange} className={`w-full border p-4 text-left transition-all duration-200 active:scale-[0.99] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#53e0cf] ${checked ? "border-[#53e0cf] bg-[#251143] shadow-[0_0_18px_rgba(255,104,223,.16)]" : "border-[#553875] bg-[#170c29] hover:border-[#b761ff]"}`}><span className="flex items-start gap-3"><span className={`mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full border ${checked ? "border-[#53e0cf] bg-[#7c32df]" : "border-[#9270ae]"}`}>{checked && <span className="h-1.5 w-1.5 rounded-full bg-white" />}</span><span><span className="block font-semibold text-[#fbf4ff]">{label}</span><span className="mt-1 block text-sm leading-5 text-[#cbb8df]">{detail}</span></span></span></button>;
}

function arrayBufferToBase64(buffer: ArrayBuffer) {
  const bytes = new Uint8Array(buffer);
  let binary = "";
  for (let index = 0; index < bytes.byteLength; index += 1) binary += String.fromCharCode(bytes[index]);
  return window.btoa(binary);
}

async function downloadBriefPdf(data: BriefFormData, publicId: string) {
  const { jsPDF } = await import("jspdf");
  const fontResponse = await fetch(pdfFontUrl);
  if (!fontResponse.ok) throw new Error("Не удалось подготовить шрифт для PDF.");
  const fontBase64 = arrayBufferToBase64(await fontResponse.arrayBuffer());
  const doc = new jsPDF({ unit: "mm", format: "a4" });
  doc.addFileToVFS("NotoSans-Regular.ttf", fontBase64);
  doc.addFont("NotoSans-Regular.ttf", "NotoSans", "normal");
  doc.setFont("NotoSans");

  const pageWidth = 210;
  const margin = 17;
  const contentWidth = pageWidth - margin * 2;
  let y = 18;
  const write = (text: string, size = 10, color: [number, number, number] = [42, 23, 68]) => {
    doc.setFontSize(size);
    doc.setTextColor(...color);
    const lines = doc.splitTextToSize(text || "—", contentWidth);
    const height = lines.length * (size * 0.46 + 1.1);
    if (y + height > 280) { doc.addPage(); y = 18; }
    doc.text(lines, margin, y);
    y += height + 4;
  };
  const section = (title: string) => {
    if (y > 255) { doc.addPage(); y = 18; }
    doc.setDrawColor(154, 72, 255);
    doc.line(margin, y, pageWidth - margin, y);
    y += 6;
    write(title.toUpperCase(), 10, [113, 43, 208]);
  };
  const item = (label: string, value: string | string[]) => {
    doc.setFontSize(8);
    doc.setTextColor(105, 84, 130);
    if (y > 270) { doc.addPage(); y = 18; }
    doc.text(label.toUpperCase(), margin, y);
    y += 4;
    write(Array.isArray(value) ? value.join(", ") : value, 10);
  };

  doc.setFillColor(113, 43, 208);
  doc.rect(0, 0, pageWidth, 7, "F");
  doc.setFontSize(20);
  doc.setTextColor(42, 23, 68);
  doc.text("Бриф на разработку сайта", margin, y);
  y += 9;
  doc.setFontSize(9);
  doc.setTextColor(113, 43, 208);
  doc.text(`Заявка ${publicId} · ${new Date().toLocaleDateString("ru-RU")}`, margin, y);
  y += 11;

  section("01. Контакты и бизнес");
  item("Имя", data.fullName); item("Компания", data.companyName); item("Тип проекта", data.projectType); item("Стадия проекта", data.projectStage); item("E-mail", data.email); item("Телефон", data.phone); item("Предпочтительный канал", data.contactPreference); item("Источник обращения", data.leadSource); item("О бизнесе", data.businessDescription); item("Услуги и предложение", data.offers); item("География", data.geography);
  section("02. Цели и аудитория");
  item("Целевая аудитория", data.audience); item("Тип аудитории", data.audienceTypes); item("Главные сценарии", data.primaryScenarios); item("Задачи сайта", data.goals); item("Главный результат", data.mainGoal); item("Почему выбирают вас", data.whyChoose);
  section("03. Структура и функции");
  item("Текущая ситуация", data.currentSiteState); item("Нужные страницы", data.requiredPages); item("Функции", data.features.length ? data.features : "Пока не определены"); item("Материалы", data.availableMaterials.length ? data.availableMaterials : "Пока не определены"); item("Готовность контента", data.contentReadiness);
  section("04. Визуальный язык");
  item("Характер сайта", data.styleWords); item("Цветовое направление", data.colorDirection); item("Пожелания по цвету", data.colorNotes); item("Сайты-ориентиры", data.references);
  section("05. Организация");
  item("Желаемый запуск", data.deadline); item("Ориентир по бюджету", data.budgetRange); item("Дополнительно", data.comment);
  doc.setFontSize(8);
  doc.setTextColor(105, 84, 130);
  doc.text("Сформировано на сайте «Сайт под ключ».", margin, 288);
  doc.save(`brief-${publicId.toLowerCase()}.pdf`);
}

export default function BriefApplication() {
  const { locale } = useLocale();
  const ui = getUiCopy(locale);
  const [step, setStep] = useState(0);
  const [data, setData] = useState<BriefFormData>(initialData);
  const [error, setError] = useState("");
  const [submissionId, setSubmissionId] = useState<string | null>(null);
  const mutation = trpc.brief.submit.useMutation();
  const { data: storedContent } = trpc.siteContent.public.useQuery(undefined, { staleTime: 60_000, refetchOnWindowFocus: false });
  const contentBundle = normalizeSiteContentBundle(storedContent);
  const briefCopy = contentBundle.locales[locale].brief;
  const optionLabels = useMemo(() => Object.fromEntries(Object.entries(optionKeys).map(([value, key]) => [value, ui.form.options[key] ?? value])) as Record<string, string>, [ui]);
  const progress = useMemo(() => ((step + 1) / ui.form.steps.length) * 100, [step, ui.form.steps.length]);
  const setField = <K extends keyof BriefFormData>(key: K, value: BriefFormData[K]) => setData((current) => ({ ...current, [key]: value }));

  const validateStep = () => {
    if (step === 0 && (!data.fullName.trim() || !data.companyName.trim() || !data.projectType || !data.projectStage || !data.email.trim() || !data.phone.trim() || !data.businessDescription.trim() || !data.offers.trim() || !data.geography.trim())) return ui.form.validation[0];
    if (step === 1 && (!data.audience.trim() || !data.audienceTypes.length || !data.primaryScenarios.length || !data.goals.length || !data.mainGoal.trim())) return ui.form.validation[1];
    if (step === 2 && (!data.requiredPages.length || !data.contentReadiness)) return ui.form.validation[2];
    if (step === 3 && (!data.styleWords.length || !data.colorDirection)) return ui.form.validation[3];
    if (step === 4 && (!data.deadline.trim() || !data.budgetRange || !data.consent)) return ui.form.validation[4];
    return "";
  };

  const nextStep = () => { const nextError = validateStep(); if (nextError) { setError(nextError); return; } setError(""); setStep((current) => Math.min(current + 1, ui.form.steps.length - 1)); };
  const previousStep = () => { setError(""); setStep((current) => Math.max(current - 1, 0)); };
  const submit = async () => {
    const nextError = validateStep();
    if (nextError) { setError(nextError); return; }
    setError("");
    try {
      const submission = await mutation.mutateAsync({ ...data, consent: true });
      setSubmissionId(submission.publicId);
      try {
        await downloadBriefPdf(data, submission.publicId);
      } catch (pdfError) {
        console.warn("Заявка сохранена, но PDF не скачан.", pdfError);
      }
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : ui.form.saveError);
    }
  };

  if (submissionId) return <section id="brief" className="border-y border-[#3d265f] bg-[linear-gradient(145deg,#130924_0%,#1b0a32_100%)] text-[#f5efff]"><div className="mx-auto grid max-w-[1440px] lg:grid-cols-[0.72fr_1.28fr]"><div className="border-b border-[#3d265f] p-6 sm:p-10 lg:border-b-0 lg:border-r lg:p-12"><div className="flex items-center gap-3 font-mono text-[10px] font-medium uppercase tracking-[0.2em] text-[#7de5d6]"><span className="grid h-6 w-6 place-items-center border border-[#a458ff] bg-[#6d2bd0] text-[9px] text-white">12</span><span>{ui.form.accepted}</span></div><h2 className="mt-7 font-display text-4xl font-extrabold leading-[1.03] tracking-[-0.065em] sm:text-5xl">{ui.form.acceptedTitle}</h2><p className="mt-6 max-w-sm leading-7 text-[#b8ddd8]">{ui.form.acceptedText}</p></div><div className="p-6 sm:p-10 lg:p-12"><div className="border border-[#9e54eb] bg-[#251143] p-6 sm:p-8"><CheckCircle2 className="h-10 w-10 text-[#53e0cf]" /><p className="mt-7 font-mono text-[10px] uppercase tracking-[0.16em] text-[#7de5d6]">{ui.form.requestNumber}</p><p className="mt-3 font-display text-3xl font-extrabold tracking-[-0.055em] text-[#fff9ff]">{submissionId}</p><p className="mt-5 max-w-lg text-sm leading-6 text-[#d6c6e9]">{ui.form.savedNotice}</p><button type="button" onClick={() => void downloadBriefPdf(data, submissionId)} className="mt-7 inline-flex items-center gap-3 border border-[#8de9dc] bg-[linear-gradient(135deg,#07545b,#0d9488)] px-5 py-4 font-mono text-[11px] font-medium uppercase tracking-[0.13em] text-white shadow-[0_0_24px_rgba(13,148,136,.28)] transition-all duration-200 hover:-translate-y-0.5 hover:brightness-110 active:scale-[0.97] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#53e0cf]"><Download className="h-4 w-4" /> {ui.form.downloadAgain}</button></div></div></div></section>;

  return <section id="brief" className="border-y border-[#3d265f] bg-[linear-gradient(145deg,#130924_0%,#1b0a32_100%)] text-[#f5efff]"><div className="mx-auto grid max-w-[1440px] lg:grid-cols-[0.72fr_1.28fr]"><aside className="border-b border-[#3d265f] p-6 sm:p-10 lg:border-b-0 lg:border-r lg:p-12"><div className="flex items-center gap-3 font-mono text-[10px] font-medium uppercase tracking-[0.2em] text-[#7de5d6]"><span className="grid h-6 w-6 place-items-center border border-[#a458ff] bg-[#6d2bd0] text-[9px] text-white">12</span><span>{briefCopy.label}</span></div><h2 className="mt-7 font-display text-4xl font-extrabold leading-[1.03] tracking-[-0.065em] sm:text-5xl">{briefCopy.title}</h2><p className="mt-6 max-w-sm leading-7 text-[#b8ddd8]">{briefCopy.intro}</p><div className="mt-10 border-t border-[#164f55]">{ui.form.steps.map(([number, title, detail], index) => <div key={number} className={`flex gap-4 border-b border-[#164f55] py-4 ${index === step ? "text-[#7de5d6]" : "text-[#ad96c5]"}`}><span className={`grid h-6 w-6 shrink-0 place-items-center border font-mono text-[9px] ${index === step ? "border-[#53e0cf] bg-[#6d2bd0] text-white" : index < step ? "border-[#b56aff] bg-[#291149] text-[#ffc3f2]" : "border-[#75568f]"}`}>{index < step ? <Check className="h-3.5 w-3.5" /> : number}</span><span><span className="block text-sm font-semibold text-[#fff7ff]">{title}</span><span className="block text-xs leading-5 text-[#bda8d3]">{detail}</span></span></div>)}</div><div className="mt-9 border-l-2 border-[#53e0cf] bg-[#24103f] px-4 py-3 text-sm leading-6 text-[#e9dcf9]"><ShieldCheck className="mr-2 inline h-4 w-4 text-[#53e0cf]" />{briefCopy.privacyNote}</div></aside><div className="p-6 sm:p-10 lg:p-12"><div className="flex items-end justify-between gap-5"><div><p className="font-mono text-[10px] uppercase tracking-[0.15em] text-[#7de5d6]">{ui.form.stepLabel} {step + 1} / {ui.form.steps.length}</p><h3 className="mt-2 font-display text-3xl font-bold tracking-[-0.05em]">{ui.form.steps[step][1]}</h3></div><p className="font-mono text-xs text-[#d0b9e8]">{Math.round(progress)}%</p></div><div className="mt-5 h-1.5 overflow-hidden bg-[#3c2456]"><div className="h-full bg-[linear-gradient(90deg,#07545b,#53e0cf)] transition-all duration-300" style={{ width: `${progress}%` }} /></div>

    <div className="mt-9">
      {step === 0 && <div className="space-y-7"><p className="max-w-2xl text-[17px] leading-7 text-[#b8ddd8]">{ui.form.startIntro}</p><div className="grid gap-6 sm:grid-cols-2"><label><FieldLabel required>{ui.form.fields.fullName}</FieldLabel><input value={data.fullName} onChange={(event) => setField("fullName", event.target.value)} placeholder={ui.form.placeholders.fullName} className={fieldClassName} /></label><label><FieldLabel required>{ui.form.fields.companyName}</FieldLabel><input value={data.companyName} onChange={(event) => setField("companyName", event.target.value)} placeholder={ui.form.placeholders.companyName} className={fieldClassName} /></label><label><FieldLabel required>{ui.form.fields.projectType}</FieldLabel><select value={data.projectType} onChange={(event) => setField("projectType", event.target.value)} className={fieldClassName}>{projectTypeOptions.map((option) => <option key={option} value={option}>{optionLabels[option] ?? option}</option>)}</select></label><label><FieldLabel required>{ui.form.fields.projectStage}</FieldLabel><select value={data.projectStage} onChange={(event) => setField("projectStage", event.target.value)} className={fieldClassName}>{projectStageOptions.map((option) => <option key={option} value={option}>{optionLabels[option] ?? option}</option>)}</select></label><label><FieldLabel required>{ui.form.fields.email}</FieldLabel><input type="email" value={data.email} onChange={(event) => setField("email", event.target.value)} placeholder="name@company.com" className={fieldClassName} /></label><label><FieldLabel required>{ui.form.fields.phone}</FieldLabel><input value={data.phone} onChange={(event) => setField("phone", event.target.value)} placeholder={ui.form.placeholders.phone} className={fieldClassName} /></label><label className="sm:col-span-2"><FieldLabel required>{ui.form.fields.businessDescription}</FieldLabel><textarea value={data.businessDescription} onChange={(event) => setField("businessDescription", event.target.value)} placeholder={ui.form.placeholders.businessDescription} className={`${fieldClassName} min-h-24 resize-y`} /></label><label className="sm:col-span-2"><FieldLabel required>{ui.form.fields.offers}</FieldLabel><textarea value={data.offers} onChange={(event) => setField("offers", event.target.value)} placeholder={ui.form.placeholders.offers} className={`${fieldClassName} min-h-24 resize-y`} /></label><label><FieldLabel required>{ui.form.fields.geography}</FieldLabel><input value={data.geography} onChange={(event) => setField("geography", event.target.value)} placeholder={ui.form.placeholders.geography} className={fieldClassName} /></label><label><FieldLabel>{ui.form.fields.contactPreference}</FieldLabel><select value={data.contactPreference} onChange={(event) => setField("contactPreference", event.target.value)} className={fieldClassName}><option>Telegram</option><option>WhatsApp</option><option>{ui.form.contactPhone}</option><option>{ui.form.contactEmail}</option></select></label><label><FieldLabel>{ui.form.fields.leadSource}</FieldLabel><select value={data.leadSource} disabled className={fieldClassName}><option>Telegram</option></select></label></div></div>}
      {step === 1 && <div className="space-y-7"><p className="max-w-2xl text-[17px] leading-7 text-[#b8ddd8]">{ui.form.startIntro}</p><label className="block"><FieldLabel required>{ui.form.fields.audience}</FieldLabel><textarea value={data.audience} onChange={(event) => setField("audience", event.target.value)} placeholder={ui.form.placeholders.audience} className={`${fieldClassName} min-h-28 resize-y`} /></label><div><FieldLabel required>{ui.form.fields.audienceTypes}</FieldLabel><div className="mt-4"><ToggleGroup labels={optionLabels} options={audienceOptions} selected={data.audienceTypes} onChange={(audienceTypes) => setField("audienceTypes", audienceTypes)} minOne /></div></div><div><FieldLabel required>{ui.form.fields.primaryScenarios}</FieldLabel><div className="mt-4"><ToggleGroup labels={optionLabels} options={scenarioOptions} selected={data.primaryScenarios} onChange={(primaryScenarios) => setField("primaryScenarios", primaryScenarios)} minOne /></div></div><div><FieldLabel required>{ui.form.fields.goals}</FieldLabel><p className="mt-2 text-sm text-[#bda8d3]">{ui.form.selectAll}</p><div className="mt-4"><ToggleGroup labels={optionLabels} options={goalOptions} selected={data.goals} onChange={(goals) => setField("goals", goals)} /></div></div><label className="block"><FieldLabel required>{ui.form.fields.mainGoal}</FieldLabel><textarea value={data.mainGoal} onChange={(event) => setField("mainGoal", event.target.value)} placeholder={ui.form.placeholders.mainGoal} className={`${fieldClassName} min-h-24 resize-y`} /></label><label className="block"><FieldLabel>{ui.form.fields.whyChoose}</FieldLabel><textarea value={data.whyChoose} onChange={(event) => setField("whyChoose", event.target.value)} placeholder={ui.form.placeholders.whyChoose} className={`${fieldClassName} min-h-24 resize-y`} /></label></div>}
      {step === 2 && <div className="space-y-7"><p className="max-w-2xl text-[17px] leading-7 text-[#b8ddd8]">{ui.form.startIntro}</p><div className="grid gap-3 sm:grid-cols-2"><RadioOption checked={data.currentSiteState === "Нужен новый сайт"} onChange={() => setField("currentSiteState", "Нужен новый сайт")} label={optionLabels["Нужен новый сайт"]} detail={ui.form.startIntro} /><RadioOption checked={data.currentSiteState === "Есть сайт, нужен редизайн"} onChange={() => setField("currentSiteState", "Есть сайт, нужен редизайн")} label={optionLabels["Есть сайт, нужен редизайн"]} detail={ui.form.startIntro} /></div><div><FieldLabel required>{ui.form.fields.requiredPages}</FieldLabel><div className="mt-4"><ToggleGroup labels={optionLabels} options={pageOptions} selected={data.requiredPages} onChange={(requiredPages) => setField("requiredPages", requiredPages)} minOne /></div></div><div><FieldLabel>{ui.form.fields.features}</FieldLabel><div className="mt-4"><ToggleGroup labels={optionLabels} options={featureOptions} selected={data.features} onChange={(features) => setField("features", features)} /></div></div><div><FieldLabel>{ui.form.fields.availableMaterials}</FieldLabel><div className="mt-4"><ToggleGroup labels={optionLabels} options={materialOptions} selected={data.availableMaterials} onChange={(availableMaterials) => setField("availableMaterials", availableMaterials)} /></div></div><div><FieldLabel required>{ui.form.fields.contentReadiness}</FieldLabel><div className="mt-3 grid gap-3 sm:grid-cols-2"><RadioOption checked={data.contentReadiness === "Всё готово"} onChange={() => setField("contentReadiness", "Всё готово")} label={optionLabels["Всё готово"]} detail={ui.form.startIntro} /><RadioOption checked={data.contentReadiness === "Нужно помочь со структурой и текстом"} onChange={() => setField("contentReadiness", "Нужно помочь со структурой и текстом")} label={optionLabels["Нужна помощь"]} detail={ui.form.startIntro} /></div></div></div>}
      {step === 3 && <div className="space-y-7"><p className="max-w-2xl text-[17px] leading-7 text-[#b8ddd8]">{ui.form.startIntro}</p><div><FieldLabel required>{ui.form.fields.styleWords}</FieldLabel><div className="mt-4"><ToggleGroup labels={optionLabels} options={styleOptions} selected={data.styleWords} onChange={(styleWords) => setField("styleWords", styleWords)} minOne /></div></div><label className="block"><FieldLabel required>{ui.form.fields.colorDirection}</FieldLabel><select value={data.colorDirection} onChange={(event) => setField("colorDirection", event.target.value)} className={fieldClassName}><option value="Доверьтесь вашему предложению">{optionLabels["Доверьтесь вашему предложению"]}</option><option value="Светлая, воздушная палитра">{optionLabels["Светлая, воздушная палитра"]}</option><option value="Тёмная, статусная палитра">{optionLabels["Тёмная, статусная палитра"]}</option><option value="Контрастная и энергичная палитра">{optionLabels["Контрастная и энергичная палитра"]}</option><option value="Есть фирменные цвета — использовать их">{optionLabels["Есть фирменные цвета — использовать их"]}</option></select></label><label className="block"><FieldLabel>{ui.form.fields.colorNotes}</FieldLabel><textarea value={data.colorNotes} onChange={(event) => setField("colorNotes", event.target.value)} placeholder={ui.form.placeholders.colorNotes} className={`${fieldClassName} min-h-24 resize-y`} /></label><label className="block"><FieldLabel>{ui.form.fields.references}</FieldLabel><textarea value={data.references} onChange={(event) => setField("references", event.target.value)} placeholder={ui.form.placeholders.references} className={`${fieldClassName} min-h-24 resize-y`} /></label></div>}
      {step === 4 && <div className="space-y-7"><p className="max-w-2xl text-[17px] leading-7 text-[#b8ddd8]">{ui.form.startIntro}</p><div className="grid gap-6 sm:grid-cols-2"><label><FieldLabel required>{ui.form.fields.deadline}</FieldLabel><input value={data.deadline} onChange={(event) => setField("deadline", event.target.value)} placeholder={ui.form.placeholders.deadline} className={fieldClassName} /></label><label><FieldLabel required>{ui.form.fields.budgetRange}</FieldLabel><select value={data.budgetRange} onChange={(event) => setField("budgetRange", event.target.value)} className={fieldClassName}><option value="">{ui.form.selectBudget}</option><option>До 2 500 PLN</option><option>2 500–4 500 PLN</option><option>4 500–8 500 PLN</option><option>От 9 000 PLN</option><option>Нужна оценка после брифа</option></select></label></div><label className="block"><FieldLabel>{ui.form.fields.comment}</FieldLabel><textarea value={data.comment} onChange={(event) => setField("comment", event.target.value)} placeholder={ui.form.placeholders.comment} className={`${fieldClassName} min-h-28 resize-y`} /></label><label className="flex cursor-pointer items-start gap-3 border-t border-[#164f55] pt-6"><input type="checkbox" checked={data.consent} onChange={(event) => setField("consent", event.target.checked)} className="mt-1 h-5 w-5 accent-[#53e0cf] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#53e0cf]" /><span className="text-sm leading-6 text-[#c1e2dd]">{briefCopy.privacyNote}</span></label></div>}
    </div>
    {error && <div role="alert" className="mt-7 border-l-2 border-[#ef8d9b] bg-[#123f45] px-4 py-3 text-sm leading-6 text-[#d7fff7]">{error}</div>}
    <div className="mt-10 flex flex-wrap items-center justify-between gap-4 border-t border-[#164f55] pt-6"><button type="button" onClick={previousStep} disabled={step === 0 || mutation.isPending} className="inline-flex items-center gap-2 px-2 py-3 text-sm font-semibold text-[#a8cfca] transition-colors hover:text-[#7de5d6] disabled:cursor-not-allowed disabled:opacity-30 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#53e0cf]"><ChevronLeft className="h-4 w-4" /> {ui.form.previous}</button>{step < ui.form.steps.length - 1 ? <button type="button" onClick={nextStep} className="inline-flex items-center gap-3 border border-[#8de9dc] bg-[linear-gradient(135deg,#07545b,#0d9488)] px-5 py-4 font-mono text-[11px] font-medium uppercase tracking-[0.13em] text-white shadow-[0_0_24px_rgba(13,148,136,.28)] transition-all duration-200 hover:-translate-y-0.5 hover:brightness-110 active:scale-[0.97] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#53e0cf]">{ui.form.next} <ChevronRight className="h-4 w-4" /></button> : <button type="button" onClick={() => void submit()} disabled={mutation.isPending} className="inline-flex items-center gap-3 border border-[#8de9dc] bg-[linear-gradient(135deg,#07545b,#0d9488)] px-5 py-4 font-mono text-[11px] font-medium uppercase tracking-[0.13em] text-white shadow-[0_0_24px_rgba(13,148,136,.28)] transition-all duration-200 hover:-translate-y-0.5 hover:brightness-110 active:scale-[0.97] disabled:cursor-not-allowed disabled:opacity-70 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#53e0cf]">{mutation.isPending ? <><Loader2 className="h-4 w-4 animate-spin" /> {ui.form.sending}</> : <><Send className="h-4 w-4" /> {ui.form.submit}</>}</button>}</div>
  </div></div></section>;
}
