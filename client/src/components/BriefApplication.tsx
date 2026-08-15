/*
 * Design: «Владение без тревоги». Расширенный бриф оформлен как спокойное досье:
 * одна понятная задача за шаг, видимый прогресс и итоговый документ для клиента.
 */
import { jsPDF } from "jspdf";
import { Check, CheckCircle2, ChevronLeft, ChevronRight, Download, FileText, Loader2, Send, ShieldCheck } from "lucide-react";
import { useMemo, useState } from "react";
import { trpc } from "@/lib/trpc";

const pdfFontUrl = "/manus-storage/NotoSans-Regular_7d1593bf.ttf";

const goalOptions = ["Получать больше заявок", "Объяснить услуги и цены", "Показать экспертность", "Увеличить доверие", "Продавать онлайн", "Упростить запись / бронь"];
const pageOptions = ["Главная", "Услуги", "О компании", "Кейсы / портфолио", "Цены", "Отзывы", "Блог / статьи", "Контакты"];
const featureOptions = ["Форма заявки", "Telegram / WhatsApp", "Онлайн-запись", "Калькулятор", "Каталог", "Личный кабинет", "Мультиязычность", "Интеграция с CRM"];
const materialOptions = ["Логотип", "Фирменные цвета", "Фотографии", "Видео", "Тексты", "Ничего — нужна помощь"];
const styleOptions = ["Спокойный", "Премиальный", "Смелый", "Минималистичный", "Технологичный", "Тёплый и человечный"];

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
  email: string;
  phone: string;
  contactPreference: string;
  businessDescription: string;
  offers: string;
  audience: string;
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
  fullName: "", companyName: "", email: "", phone: "", contactPreference: "Telegram", businessDescription: "", offers: "", audience: "", goals: [], mainGoal: "", whyChoose: "", geography: "", currentSiteState: "Нужен новый сайт", requiredPages: ["Главная", "Услуги", "Контакты"], features: ["Форма заявки"], styleWords: ["Спокойный"], references: "", colorDirection: "Доверьтесь вашему предложению", colorNotes: "", availableMaterials: [], contentReadiness: "Нужно помочь со структурой и текстом", deadline: "", budgetRange: "", comment: "", consent: false,
};

function FieldLabel({ children, required = false }: { children: string; required?: boolean }) {
  return <span className="font-mono text-[10px] font-medium uppercase tracking-[0.14em] text-[#66706d]">{children}{required && <span className="ml-1 text-[#a44837]">*</span>}</span>;
}

function ToggleGroup({ options, selected, onChange, minOne = false }: { options: string[]; selected: string[]; onChange: (next: string[]) => void; minOne?: boolean }) {
  const toggle = (option: string) => {
    const alreadySelected = selected.includes(option);
    if (alreadySelected && minOne && selected.length === 1) return;
    onChange(alreadySelected ? selected.filter((item) => item !== option) : [...selected, option]);
  };
  return <div className="flex flex-wrap gap-2">{options.map((option) => { const active = selected.includes(option); return <button key={option} type="button" aria-pressed={active} onClick={() => toggle(option)} className={`inline-flex items-center gap-2 border px-3 py-2 text-sm transition-all duration-200 active:scale-[0.97] ${active ? "border-[#075c70] bg-[#e2efea] text-[#075c70]" : "border-[#cfc8bc] bg-[#fcfaf5] text-[#5c6662] hover:border-[#075c70]"}`}>{active && <Check className="h-3.5 w-3.5" />}{option}</button>; })}</div>;
}

function RadioOption({ checked, label, detail, onChange }: { checked: boolean; label: string; detail: string; onChange: () => void }) {
  return <button type="button" onClick={onChange} className={`w-full border p-4 text-left transition-all duration-200 active:scale-[0.99] ${checked ? "border-[#075c70] bg-[#e2efea]" : "border-[#d6d0c5] bg-[#fcfaf5] hover:border-[#075c70]"}`}><span className="flex items-start gap-3"><span className={`mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full border ${checked ? "border-[#075c70] bg-[#075c70]" : "border-[#9ba6a1]"}`}>{checked && <span className="h-1.5 w-1.5 rounded-full bg-white" />}</span><span><span className="block font-semibold text-[#293330]">{label}</span><span className="mt-1 block text-sm leading-5 text-[#65706b]">{detail}</span></span></span></button>;
}

function arrayBufferToBase64(buffer: ArrayBuffer) {
  const bytes = new Uint8Array(buffer);
  let binary = "";
  for (let index = 0; index < bytes.byteLength; index += 1) binary += String.fromCharCode(bytes[index]);
  return window.btoa(binary);
}

async function downloadBriefPdf(data: BriefFormData, publicId: string) {
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
  const write = (text: string, size = 10, color: [number, number, number] = [38, 48, 47]) => {
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
    doc.setDrawColor(7, 92, 112);
    doc.line(margin, y, pageWidth - margin, y);
    y += 6;
    write(title.toUpperCase(), 10, [7, 92, 112]);
  };
  const item = (label: string, value: string | string[]) => {
    doc.setFontSize(8);
    doc.setTextColor(100, 112, 109);
    if (y > 270) { doc.addPage(); y = 18; }
    doc.text(label.toUpperCase(), margin, y);
    y += 4;
    write(Array.isArray(value) ? value.join(", ") : value, 10);
  };

  doc.setFillColor(7, 92, 112);
  doc.rect(0, 0, pageWidth, 7, "F");
  doc.setFontSize(20);
  doc.setTextColor(32, 38, 37);
  doc.text("Бриф на разработку сайта", margin, y);
  y += 9;
  doc.setFontSize(9);
  doc.setTextColor(7, 92, 112);
  doc.text(`Заявка ${publicId} · ${new Date().toLocaleDateString("ru-RU")}`, margin, y);
  y += 11;

  section("01. Контакты и бизнес");
  item("Имя", data.fullName); item("Компания", data.companyName); item("E-mail", data.email); item("Телефон", data.phone); item("Предпочтительный канал", data.contactPreference); item("О бизнесе", data.businessDescription); item("Услуги и предложение", data.offers); item("География", data.geography);
  section("02. Цели и аудитория");
  item("Целевая аудитория", data.audience); item("Задачи сайта", data.goals); item("Главный результат", data.mainGoal); item("Почему выбирают вас", data.whyChoose);
  section("03. Структура и функции");
  item("Текущая ситуация", data.currentSiteState); item("Нужные страницы", data.requiredPages); item("Функции", data.features.length ? data.features : "Пока не определены"); item("Материалы", data.availableMaterials.length ? data.availableMaterials : "Пока не определены"); item("Готовность контента", data.contentReadiness);
  section("04. Визуальный язык");
  item("Характер сайта", data.styleWords); item("Цветовое направление", data.colorDirection); item("Пожелания по цвету", data.colorNotes); item("Сайты-ориентиры", data.references);
  section("05. Организация");
  item("Желаемый запуск", data.deadline); item("Ориентир по бюджету", data.budgetRange); item("Дополнительно", data.comment);
  doc.setFontSize(8);
  doc.setTextColor(100, 112, 109);
  doc.text("Сформировано на сайте «Сайт под ключ».", margin, 288);
  doc.save(`brief-${publicId.toLowerCase()}.pdf`);
}

export default function BriefApplication() {
  const [step, setStep] = useState(0);
  const [data, setData] = useState<BriefFormData>(initialData);
  const [error, setError] = useState("");
  const [submissionId, setSubmissionId] = useState<string | null>(null);
  const mutation = trpc.brief.submit.useMutation();
  const progress = useMemo(() => ((step + 1) / steps.length) * 100, [step]);
  const setField = <K extends keyof BriefFormData>(key: K, value: BriefFormData[K]) => setData((current) => ({ ...current, [key]: value }));

  const validateStep = () => {
    if (step === 0 && (!data.fullName.trim() || !data.companyName.trim() || !data.email.trim() || !data.phone.trim() || data.businessDescription.trim().length < 20 || data.offers.trim().length < 10 || !data.geography.trim())) return "Заполните контакты и кратко опишите бизнес, услуги и географию.";
    if (step === 1 && (!data.audience.trim() || !data.goals.length || data.mainGoal.trim().length < 10)) return "Опишите аудиторию, выберите хотя бы одну задачу и главный результат сайта.";
    if (step === 2 && (!data.requiredPages.length || !data.contentReadiness)) return "Выберите хотя бы одну страницу и оцените готовность контента.";
    if (step === 3 && (!data.styleWords.length || !data.colorDirection)) return "Выберите характер и цветовое направление будущего сайта.";
    if (step === 4 && (!data.deadline.trim() || !data.budgetRange || !data.consent)) return "Укажите ориентир по сроку и бюджету, затем подтвердите согласие на обработку заявки.";
    return "";
  };

  const nextStep = () => { const nextError = validateStep(); if (nextError) { setError(nextError); return; } setError(""); setStep((current) => Math.min(current + 1, steps.length - 1)); };
  const previousStep = () => { setError(""); setStep((current) => Math.max(current - 1, 0)); };
  const submit = async () => {
    const nextError = validateStep();
    if (nextError) { setError(nextError); return; }
    setError("");
    try {
      const submission = await mutation.mutateAsync({ ...data, consent: true });
      await downloadBriefPdf(data, submission.publicId);
      setSubmissionId(submission.publicId);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Не удалось сохранить заявку. Пожалуйста, повторите попытку.");
    }
  };

  if (submissionId) return <section id="brief" className="bg-[#fcfaf5]"><div className="mx-auto grid max-w-[1440px] lg:grid-cols-[0.72fr_1.28fr]"><div className="border-b border-[#d6d0c5] p-6 sm:p-10 lg:border-b-0 lg:border-r lg:p-12"><div className="flex items-center gap-3 font-mono text-[10px] font-medium uppercase tracking-[0.2em] text-[#075c70]"><span className="grid h-6 w-6 place-items-center border border-[#075c70] bg-[#075c70] text-[9px] text-[#fcfaf5]">12</span><span>Заявка принята</span></div><h2 className="mt-7 font-display text-4xl font-extrabold leading-[1.03] tracking-[-0.065em] sm:text-5xl">У вас есть точка опоры для будущего сайта.</h2><p className="mt-6 max-w-sm leading-7 text-[#59625e]">Заявка сохранена, а PDF-резюме уже скачивается. Сохраните номер заявки — по нему удобно ссылаться на заполненный бриф.</p></div><div className="p-6 sm:p-10 lg:p-12"><div className="border border-[#075c70] bg-[#e2efea] p-6 sm:p-8"><CheckCircle2 className="h-10 w-10 text-[#075c70]" /><p className="mt-7 font-mono text-[10px] uppercase tracking-[0.16em] text-[#075c70]">Номер заявки</p><p className="mt-3 font-display text-3xl font-extrabold tracking-[-0.055em] text-[#202625]">{submissionId}</p><p className="mt-5 max-w-lg text-sm leading-6 text-[#50625c]">Автоматическая e-mail-отправка будет добавлена после подтверждения почтового сервиса. Сейчас заявка сохранена в базе, а уведомление о новом брифе отправлено владельцу проекта.</p><button type="button" onClick={() => void downloadBriefPdf(data, submissionId)} className="mt-7 inline-flex items-center gap-3 border border-[#075c70] bg-[#075c70] px-5 py-4 font-mono text-[11px] font-medium uppercase tracking-[0.13em] text-[#fcfaf5] transition-all duration-200 hover:-translate-y-0.5 hover:bg-[#064c5c] active:scale-[0.97]"><Download className="h-4 w-4" /> Скачать PDF ещё раз</button></div></div></div></section>;

  return <section id="brief" className="bg-[#fcfaf5]"><div className="mx-auto grid max-w-[1440px] lg:grid-cols-[0.72fr_1.28fr]"><aside className="border-b border-[#d6d0c5] p-6 sm:p-10 lg:border-b-0 lg:border-r lg:p-12"><div className="flex items-center gap-3 font-mono text-[10px] font-medium uppercase tracking-[0.2em] text-[#075c70]"><span className="grid h-6 w-6 place-items-center border border-[#075c70] bg-[#075c70] text-[9px] text-[#fcfaf5]">12</span><span>Заявка на сайт</span></div><h2 className="mt-7 font-display text-4xl font-extrabold leading-[1.03] tracking-[-0.065em] sm:text-5xl">Расскажите о проекте так, чтобы он стал интереснее.</h2><p className="mt-6 max-w-sm leading-7 text-[#59625e]">Не нужно подбирать технические слова. Ответьте как удобно: это поможет увидеть ваш характер, будущую структуру и сильные визуальные ходы.</p><div className="mt-10 space-y-0 border-t border-[#d6d0c5]">{steps.map(([number, title, detail], index) => <div key={number} className={`flex gap-4 border-b border-[#d6d0c5] py-4 ${index === step ? "text-[#075c70]" : "text-[#87908c]"}`}><span className={`grid h-6 w-6 shrink-0 place-items-center border font-mono text-[9px] ${index === step ? "border-[#075c70] bg-[#075c70] text-white" : index < step ? "border-[#8eb6aa] bg-[#e2efea] text-[#075c70]" : "border-[#b8c0bb]"}`}>{index < step ? <Check className="h-3.5 w-3.5" /> : number}</span><span><span className="block text-sm font-semibold">{title}</span><span className="block text-xs leading-5 text-[#78817d]">{detail}</span></span></div>)}</div><div className="mt-9 border-l-2 border-[#075c70] bg-[#e2efea] px-4 py-3 text-sm leading-6 text-[#38514b]"><ShieldCheck className="mr-2 inline h-4 w-4 text-[#075c70]" />Не указывайте пароли, платёжные данные и другие секреты.</div></aside><div className="p-6 sm:p-10 lg:p-12"><div className="flex items-end justify-between gap-5"><div><p className="font-mono text-[10px] uppercase tracking-[0.15em] text-[#075c70]">Шаг {step + 1} из {steps.length}</p><h3 className="mt-2 font-display text-3xl font-bold tracking-[-0.05em]">{steps[step][1]}</h3></div><p className="font-mono text-xs text-[#66706d]">{Math.round(progress)}%</p></div><div className="mt-5 h-1.5 overflow-hidden bg-[#d7dfda]"><div className="h-full bg-[#075c70] transition-all duration-300" style={{ width: `${progress}%` }} /></div>

    <div className="mt-9">
      {step === 0 && <div className="space-y-7"><p className="max-w-2xl text-[17px] leading-7 text-[#56605c]">Начнём с фактов. На основе этих ответов можно сформировать структуру, оффер и правильную логику первого экрана.</p><div className="grid gap-6 sm:grid-cols-2"><label><FieldLabel required>Ваше имя</FieldLabel><input value={data.fullName} onChange={(event) => setField("fullName", event.target.value)} placeholder="Как к вам обращаться" className="mt-2 w-full border-b border-[#a9b0ab] bg-transparent px-0 py-3 text-lg outline-none focus:border-[#075c70]" /></label><label><FieldLabel required>Компания / проект</FieldLabel><input value={data.companyName} onChange={(event) => setField("companyName", event.target.value)} placeholder="Например, Studio Forma" className="mt-2 w-full border-b border-[#a9b0ab] bg-transparent px-0 py-3 text-lg outline-none focus:border-[#075c70]" /></label><label><FieldLabel required>E-mail</FieldLabel><input type="email" value={data.email} onChange={(event) => setField("email", event.target.value)} placeholder="name@company.com" className="mt-2 w-full border-b border-[#a9b0ab] bg-transparent px-0 py-3 text-lg outline-none focus:border-[#075c70]" /></label><label><FieldLabel required>Телефон / мессенджер</FieldLabel><input value={data.phone} onChange={(event) => setField("phone", event.target.value)} placeholder="+48 ... или @telegram" className="mt-2 w-full border-b border-[#a9b0ab] bg-transparent px-0 py-3 text-lg outline-none focus:border-[#075c70]" /></label><label className="sm:col-span-2"><FieldLabel required>О бизнесе в двух–трёх предложениях</FieldLabel><textarea value={data.businessDescription} onChange={(event) => setField("businessDescription", event.target.value)} placeholder="Чем занимаетесь, как давно работаете, в чём специфика вашей работы?" className="mt-2 min-h-24 w-full resize-y border-b border-[#a9b0ab] bg-transparent px-0 py-3 text-lg outline-none focus:border-[#075c70]" /></label><label className="sm:col-span-2"><FieldLabel required>Что вы предлагаете клиенту</FieldLabel><textarea value={data.offers} onChange={(event) => setField("offers", event.target.value)} placeholder="Ключевые услуги, товары, форматы работы, диапазон цен" className="mt-2 min-h-24 w-full resize-y border-b border-[#a9b0ab] bg-transparent px-0 py-3 text-lg outline-none focus:border-[#075c70]" /></label><label><FieldLabel required>География работы</FieldLabel><input value={data.geography} onChange={(event) => setField("geography", event.target.value)} placeholder="Город, страна, онлайн" className="mt-2 w-full border-b border-[#a9b0ab] bg-transparent px-0 py-3 text-lg outline-none focus:border-[#075c70]" /></label><label><FieldLabel>Как удобнее связаться</FieldLabel><select value={data.contactPreference} onChange={(event) => setField("contactPreference", event.target.value)} className="mt-2 w-full border-b border-[#a9b0ab] bg-transparent px-0 py-3 text-lg outline-none focus:border-[#075c70]"><option>Telegram</option><option>WhatsApp</option><option>Телефон</option><option>E-mail</option></select></label></div></div>}
      {step === 1 && <div className="space-y-7"><p className="max-w-2xl text-[17px] leading-7 text-[#56605c]">Хороший сайт начинается не со страницы, а с понимания человека, который должен на неё прийти.</p><label className="block"><FieldLabel required>Кто ваш идеальный клиент</FieldLabel><textarea value={data.audience} onChange={(event) => setField("audience", event.target.value)} placeholder="Кто эти люди, с какой задачей приходят, что для них важно при выборе?" className="mt-2 min-h-28 w-full resize-y border-b border-[#a9b0ab] bg-transparent px-0 py-3 text-lg outline-none focus:border-[#075c70]" /></label><div><FieldLabel required>Какие задачи должен решать сайт</FieldLabel><p className="mt-2 text-sm text-[#66706d]">Выберите все подходящие варианты.</p><div className="mt-4"><ToggleGroup options={goalOptions} selected={data.goals} onChange={(goals) => setField("goals", goals)} /></div></div><label className="block"><FieldLabel required>Какой результат вы хотите увидеть через 3–6 месяцев</FieldLabel><textarea value={data.mainGoal} onChange={(event) => setField("mainGoal", event.target.value)} placeholder="Например: стабильные заявки из поиска, понятный образ бренда, меньше однотипных вопросов" className="mt-2 min-h-24 w-full resize-y border-b border-[#a9b0ab] bg-transparent px-0 py-3 text-lg outline-none focus:border-[#075c70]" /></label><label className="block"><FieldLabel>Почему клиенты выбирают именно вас</FieldLabel><textarea value={data.whyChoose} onChange={(event) => setField("whyChoose", event.target.value)} placeholder="Опыт, подход, скорость, технология, гарантия, команда или ваша история" className="mt-2 min-h-24 w-full resize-y border-b border-[#a9b0ab] bg-transparent px-0 py-3 text-lg outline-none focus:border-[#075c70]" /></label></div>}
      {step === 2 && <div className="space-y-7"><p className="max-w-2xl text-[17px] leading-7 text-[#56605c]">Не нужно сразу знать всё. Отметьте то, что уже понятно — недостающие детали можно сформировать вместе.</p><div className="grid gap-3 sm:grid-cols-2"><RadioOption checked={data.currentSiteState === "Нужен новый сайт"} onChange={() => setField("currentSiteState", "Нужен новый сайт")} label="Нужен новый сайт" detail="Начинаем с чистого листа." /><RadioOption checked={data.currentSiteState === "Есть сайт, нужен редизайн"} onChange={() => setField("currentSiteState", "Есть сайт, нужен редизайн")} label="Есть сайт, нужен редизайн" detail="Сохраним полезное и обновим слабое." /></div><div><FieldLabel required>Какие страницы важны</FieldLabel><div className="mt-4"><ToggleGroup options={pageOptions} selected={data.requiredPages} onChange={(requiredPages) => setField("requiredPages", requiredPages)} minOne /></div></div><div><FieldLabel>Какие функции пригодятся</FieldLabel><div className="mt-4"><ToggleGroup options={featureOptions} selected={data.features} onChange={(features) => setField("features", features)} /></div></div><div><FieldLabel>Что уже есть из материалов</FieldLabel><div className="mt-4"><ToggleGroup options={materialOptions} selected={data.availableMaterials} onChange={(availableMaterials) => setField("availableMaterials", availableMaterials)} /></div></div><div><FieldLabel required>Насколько готов контент</FieldLabel><div className="mt-3 grid gap-3 sm:grid-cols-2"><RadioOption checked={data.contentReadiness === "Всё готово"} onChange={() => setField("contentReadiness", "Всё готово")} label="Всё готово" detail="Есть тексты и визуальные материалы." /><RadioOption checked={data.contentReadiness === "Нужно помочь со структурой и текстом"} onChange={() => setField("contentReadiness", "Нужно помочь со структурой и текстом")} label="Нужна помощь" detail="Нужны вопросы, структура и план контента." /></div></div></div>}
      {step === 3 && <div className="space-y-7"><p className="max-w-2xl text-[17px] leading-7 text-[#56605c]">Здесь не бывает «правильных» ответов. Нам важнее почувствовать, каким должен быть ваш сайт и какое впечатление он должен оставить.</p><div><FieldLabel required>Каким должен ощущаться сайт</FieldLabel><div className="mt-4"><ToggleGroup options={styleOptions} selected={data.styleWords} onChange={(styleWords) => setField("styleWords", styleWords)} minOne /></div></div><label className="block"><FieldLabel required>Цветовое направление</FieldLabel><select value={data.colorDirection} onChange={(event) => setField("colorDirection", event.target.value)} className="mt-2 w-full border-b border-[#a9b0ab] bg-transparent px-0 py-3 text-lg outline-none focus:border-[#075c70]"><option>Доверьтесь вашему предложению</option><option>Светлая, воздушная палитра</option><option>Тёмная, статусная палитра</option><option>Контрастная и энергичная палитра</option><option>Есть фирменные цвета — использовать их</option></select></label><label className="block"><FieldLabel>Пожелания по цветам</FieldLabel><textarea value={data.colorNotes} onChange={(event) => setField("colorNotes", event.target.value)} placeholder="Любимые / нежелательные цвета, фирменные коды, ассоциации или настроение" className="mt-2 min-h-24 w-full resize-y border-b border-[#a9b0ab] bg-transparent px-0 py-3 text-lg outline-none focus:border-[#075c70]" /></label><label className="block"><FieldLabel>Сайты, бренды или изображения-ориентиры</FieldLabel><textarea value={data.references} onChange={(event) => setField("references", event.target.value)} placeholder="Вставьте ссылки и поясните, что в них нравится: сетка, фото, шрифт, подача, ритм" className="mt-2 min-h-24 w-full resize-y border-b border-[#a9b0ab] bg-transparent px-0 py-3 text-lg outline-none focus:border-[#075c70]" /></label></div>}
      {step === 4 && <div className="space-y-7"><p className="max-w-2xl text-[17px] leading-7 text-[#56605c]">Финальные вводные помогут спланировать работу без скрытых ожиданий. Точные условия фиксируются в предложении после изучения брифа.</p><div className="grid gap-6 sm:grid-cols-2"><label><FieldLabel required>Желаемый срок запуска</FieldLabel><input value={data.deadline} onChange={(event) => setField("deadline", event.target.value)} placeholder="Например, до 15 октября" className="mt-2 w-full border-b border-[#a9b0ab] bg-transparent px-0 py-3 text-lg outline-none focus:border-[#075c70]" /></label><label><FieldLabel required>Ориентир по бюджету</FieldLabel><select value={data.budgetRange} onChange={(event) => setField("budgetRange", event.target.value)} className="mt-2 w-full border-b border-[#a9b0ab] bg-transparent px-0 py-3 text-lg outline-none focus:border-[#075c70]"><option value="">Выберите диапазон</option><option>До 2 500 PLN</option><option>2 500–4 500 PLN</option><option>4 500–8 500 PLN</option><option>От 9 000 PLN</option><option>Нужна оценка после брифа</option></select></label></div><label className="block"><FieldLabel>Что ещё важно знать о проекте</FieldLabel><textarea value={data.comment} onChange={(event) => setField("comment", event.target.value)} placeholder="Ограничения, команды, конкуренты, обязательные материалы, особые ожидания" className="mt-2 min-h-28 w-full resize-y border-b border-[#a9b0ab] bg-transparent px-0 py-3 text-lg outline-none focus:border-[#075c70]" /></label><label className="flex cursor-pointer items-start gap-3 border-t border-[#d6d0c5] pt-6"><input type="checkbox" checked={data.consent} onChange={(event) => setField("consent", event.target.checked)} className="mt-1 h-5 w-5 accent-[#075c70]" /><span className="text-sm leading-6 text-[#4e5b56]">Я согласен(на) на сохранение данных заявки для подготовки предложения и связи по этому проекту. Пароли и платёжные данные в бриф не передаются.</span></label></div>}
    </div>
    {error && <div role="alert" className="mt-7 border-l-2 border-[#a44837] bg-[#f4e9e4] px-4 py-3 text-sm leading-6 text-[#814537]">{error}</div>}
    <div className="mt-10 flex flex-wrap items-center justify-between gap-4 border-t border-[#d6d0c5] pt-6"><button type="button" onClick={previousStep} disabled={step === 0 || mutation.isPending} className="inline-flex items-center gap-2 px-2 py-3 text-sm font-semibold text-[#5f6965] transition-colors hover:text-[#075c70] disabled:cursor-not-allowed disabled:opacity-30"><ChevronLeft className="h-4 w-4" /> Назад</button>{step < steps.length - 1 ? <button type="button" onClick={nextStep} className="inline-flex items-center gap-3 bg-[#075c70] px-5 py-4 font-mono text-[11px] font-medium uppercase tracking-[0.13em] text-[#fcfaf5] transition-all duration-200 hover:-translate-y-0.5 hover:bg-[#064c5c] active:scale-[0.97]">Дальше <ChevronRight className="h-4 w-4" /></button> : <button type="button" onClick={() => void submit()} disabled={mutation.isPending} className="inline-flex items-center gap-3 bg-[#075c70] px-5 py-4 font-mono text-[11px] font-medium uppercase tracking-[0.13em] text-[#fcfaf5] transition-all duration-200 hover:-translate-y-0.5 hover:bg-[#064c5c] active:scale-[0.97] disabled:cursor-not-allowed disabled:opacity-70">{mutation.isPending ? <><Loader2 className="h-4 w-4 animate-spin" /> Сохраняем</> : <><Send className="h-4 w-4" /> Сохранить и скачать PDF</>}</button>}</div>
  </div></div></section>;
}
