import DashboardLayout from "@/components/DashboardLayout";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { startLogin } from "@/const";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import type { SiteContent } from "@shared/siteContent";
import { createDefaultSiteContentBundle, localeLabels, localeOrder, normalizeSiteContentBundle, type Locale, type SiteContentBundle } from "@shared/locales";
import type { BriefSubmission, SiteInquiry } from "../../../drizzle/schema";
import { ArrowUpRight, Check, Clipboard, Eye, FileImage, Film, Globe2, Inbox, Loader2, LockKeyhole, Plus, Save, ShieldCheck, Trash2, UploadCloud } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

type FieldProps = {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  multiline?: boolean;
  hint?: string;
};

type MediaSlot = "avatar" | "services-video" | "about-video" | "project-cover-01" | "project-cover-02" | "project-cover-03" | "project-cover-04" | "project-cover-05" | "project-cover-06";

const mediaSlots: Array<{
  slot: MediaSlot;
  label: string;
  description: string;
  kind: "image" | "video";
  accept: string;
  maxBytes: number;
  projectIndex?: number;
}> = [
  { slot: "avatar", label: "3D-портрет", description: "Первый экран сайта", kind: "image", accept: "image/jpeg,image/png,image/webp", maxBytes: 5 * 1024 * 1024 },
  { slot: "services-video", label: "Видео услуг", description: "Фон блока «Услуги»", kind: "video", accept: "video/mp4,video/webm", maxBytes: 50 * 1024 * 1024 },
  { slot: "about-video", label: "Видео «Обо мне»", description: "Выдвижной видеопортрет", kind: "video", accept: "video/mp4,video/webm", maxBytes: 50 * 1024 * 1024 },
  { slot: "project-cover-01", label: "Обложка сайта 01", description: "Витрина продаваемых сайтов", kind: "image", accept: "image/jpeg,image/png,image/webp", maxBytes: 5 * 1024 * 1024, projectIndex: 0 },
  { slot: "project-cover-02", label: "Обложка сайта 02", description: "Витрина продаваемых сайтов", kind: "image", accept: "image/jpeg,image/png,image/webp", maxBytes: 5 * 1024 * 1024, projectIndex: 1 },
  { slot: "project-cover-03", label: "Обложка сайта 03", description: "Витрина продаваемых сайтов", kind: "image", accept: "image/jpeg,image/png,image/webp", maxBytes: 5 * 1024 * 1024, projectIndex: 2 },
  { slot: "project-cover-04", label: "Обложка сайта 04", description: "Витрина продаваемых сайтов", kind: "image", accept: "image/jpeg,image/png,image/webp", maxBytes: 5 * 1024 * 1024, projectIndex: 3 },
  { slot: "project-cover-05", label: "Обложка сайта 05", description: "Витрина продаваемых сайтов", kind: "image", accept: "image/jpeg,image/png,image/webp", maxBytes: 5 * 1024 * 1024, projectIndex: 4 },
  { slot: "project-cover-06", label: "Обложка сайта 06", description: "Витрина продаваемых сайтов", kind: "image", accept: "image/jpeg,image/png,image/webp", maxBytes: 5 * 1024 * 1024, projectIndex: 5 },
];

const statusLabels = {
  received: "Новая",
  reviewed: "В работе",
  archived: "Архив",
} as const;

function Field({ label, value, onChange, placeholder, multiline = false, hint }: FieldProps) {
  const fieldClass = "mt-2 w-full rounded-xl border border-white/10 bg-[#15131b] px-3 py-2.5 text-sm text-white outline-none transition focus:border-[#b98cff] focus:ring-2 focus:ring-[#b98cff]/20";
  return <label className="block"><span className="font-mono text-[10px] font-semibold uppercase tracking-[.14em] text-[#b9b1c5]">{label}</span>{multiline ? <textarea value={value} onChange={(event) => onChange(event.target.value)} placeholder={placeholder} rows={3} className={`${fieldClass} resize-y`} /> : <input value={value} onChange={(event) => onChange(event.target.value)} placeholder={placeholder} className={fieldClass} />}{hint && <span className="mt-1.5 block text-xs leading-5 text-[#91899f]">{hint}</span>}</label>;
}

function Panel({ title, description, children }: { title: string; description: string; children: React.ReactNode }) {
  return <section className="rounded-[1.6rem] border border-white/10 bg-[#121015] p-5 shadow-[0_18px_50px_rgba(0,0,0,.18)] sm:p-7"><div className="mb-6 border-b border-white/10 pb-5"><h2 className="font-display text-xl font-black uppercase tracking-[-.07em] text-white">{title}</h2><p className="mt-2 max-w-2xl text-sm leading-6 text-[#aaa2b6]">{description}</p></div>{children}</section>;
}

function cloneDefaults() { return createDefaultSiteContentBundle(); }

function formatSize(bytes: number) {
  return bytes >= 1024 * 1024 ? `${(bytes / (1024 * 1024)).toFixed(1)} МБ` : `${Math.max(1, Math.round(bytes / 1024))} КБ`;
}

function formatDate(value: Date | string) {
  return new Date(value).toLocaleString("ru-RU", { dateStyle: "medium", timeStyle: "short" });
}

function asText(value: string | string[]) {
  return Array.isArray(value) ? (value.length ? value.join(" · ") : "Не выбрано") : (value || "Не указано");
}

function BriefDetail({ label, value }: { label: string; value: string | string[] }) {
  return <div className="rounded-xl border border-white/10 bg-[#19161e] p-3"><p className="font-mono text-[9px] font-semibold uppercase tracking-[.14em] text-[#a79eaf]">{label}</p><p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-[#f4edf6]">{asText(value)}</p></div>;
}

async function toBase64(file: File) {
  const dataUrl = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error("Не удалось прочитать файл."));
    reader.onload = () => resolve(String(reader.result));
    reader.readAsDataURL(file);
  });
  const [, dataBase64] = dataUrl.split(",", 2);
  if (!dataBase64) throw new Error("Не удалось подготовить файл к загрузке.");
  return dataBase64;
}

export default function AdminPanel() {
  const { user, loading } = useAuth();
  const isAdmin = user?.role === "admin";
  const contentQuery = trpc.siteContent.admin.get.useQuery(undefined, { enabled: isAdmin, retry: false, refetchOnWindowFocus: false });
  const mediaQuery = trpc.media.list.useQuery(undefined, { enabled: isAdmin, retry: false, refetchOnWindowFocus: false });
  const submissionsQuery = trpc.submissions.list.useQuery(undefined, { enabled: isAdmin, retry: false, refetchOnWindowFocus: false });
  const siteInquiriesQuery = trpc.siteInquiries.list.useQuery(undefined, { enabled: isAdmin, retry: false, refetchOnWindowFocus: false });
  const [draft, setDraft] = useState<SiteContentBundle>(cloneDefaults);
  const [selectedLocale, setSelectedLocale] = useState<Locale>("uk");
  const [uploadingSlot, setUploadingSlot] = useState<MediaSlot | null>(null);
  const [selectedSubmission, setSelectedSubmission] = useState<BriefSubmission | null>(null);
  const utils = trpc.useUtils();

  const saveMutation = trpc.siteContent.admin.update.useMutation({
    onSuccess: async (saved) => {
      setDraft(normalizeSiteContentBundle(saved));
      await Promise.all([utils.siteContent.admin.get.invalidate(), utils.siteContent.public.invalidate()]);
      toast.success("Изменения опубликованы на сайте");
    },
    onError: (error) => toast.error(error.message || "Не удалось сохранить изменения"),
  });

  const onUploadedMedia = async (asset: { slot: MediaSlot; url: string }) => {
    const projectIndex = mediaSlots.find((slotConfig) => slotConfig.slot === asset.slot)?.projectIndex;
    if (projectIndex !== undefined) {
      setDraft((current) => {
        const content = current.locales[selectedLocale];
        if (projectIndex >= content.projects.length) return current;
        return { ...current, locales: { ...current.locales, [selectedLocale]: { ...content, projects: content.projects.map((project, index) => index === projectIndex ? { ...project, coverUrl: asset.url } : project) } } };
      });
    }
    await Promise.all([utils.media.list.invalidate(), utils.media.public.invalidate()]);
    toast.success(projectIndex === undefined ? "Медиафайл сохранён и опубликован на сайте" : "Обложка загружена. Нажмите «Сохранить текст», чтобы привязать её к карточке.");
  };

  const updateStatusMutation = trpc.submissions.updateStatus.useMutation({
    onSuccess: async (updated) => {
      setSelectedSubmission((current) => current?.publicId === updated.publicId ? updated : current);
      await utils.submissions.list.invalidate();
      toast.success("Статус заявки обновлён");
    },
    onError: (error) => toast.error(error.message || "Не удалось обновить статус"),
  });

  const updateSiteInquiryStatusMutation = trpc.siteInquiries.updateStatus.useMutation({
    onSuccess: async () => {
      await utils.siteInquiries.list.invalidate();
      toast.success("Статус заявки на сайт обновлён");
    },
    onError: (error) => toast.error(error.message || "Не удалось обновить статус заявки на сайт"),
  });

  useEffect(() => { if (contentQuery.data) setDraft(normalizeSiteContentBundle(contentQuery.data)); }, [contentQuery.data]);

  const currentContent = draft.locales[selectedLocale] ?? draft.locales.ru;
  const title = useMemo(() => currentContent.branding.siteName || "Мой сайт", [currentContent.branding.siteName]);
  const updateLocale = (updater: (content: SiteContent) => SiteContent) => setDraft((current) => ({ ...current, locales: { ...current.locales, [selectedLocale]: updater(current.locales[selectedLocale] ?? current.locales.ru) } }));
  const setBranding = (key: keyof SiteContent["branding"], value: string) => updateLocale((content) => ({ ...content, branding: { ...content.branding, [key]: value } }));
  const setHero = (key: keyof SiteContent["hero"], value: string) => updateLocale((content) => ({ ...content, hero: { ...content.hero, [key]: value } }));
  const setAbout = (key: keyof SiteContent["about"], value: string) => updateLocale((content) => ({ ...content, about: { ...content.about, [key]: value } }));
  const setServices = (key: keyof SiteContent["services"], value: string) => updateLocale((content) => ({ ...content, services: { ...content.services, [key]: value } }));
  const setCompany = (key: keyof SiteContent["company"], value: string) => updateLocale((content) => ({ ...content, company: { ...content.company, [key]: value } }));
  const setClosing = (key: keyof SiteContent["closing"], value: string) => updateLocale((content) => ({ ...content, closing: { ...content.closing, [key]: value } }));
  const updateProject = (index: number, key: keyof SiteContent["projects"][number], value: string) => updateLocale((content) => ({ ...content, projects: content.projects.map((project, projectIndex) => projectIndex === index ? { ...project, [key]: value } : project) }));
  const addProject = () => updateLocale((content) => content.projects.length >= 6 ? content : ({ ...content, projects: [...content.projects, { number: String(content.projects.length + 1).padStart(2, "0"), name: "Новый проект", category: "Категория", description: "Коротко опишите задачу и результат проекта.", url: "", coverUrl: "", price: "Цена по запросу", availability: "available", visual: "violet" }] }));
  const removeProject = (index: number) => updateLocale((content) => content.projects.length <= 1 ? content : ({ ...content, projects: content.projects.filter((_, projectIndex) => projectIndex !== index) }));

  const uploadFile = async (slotConfig: typeof mediaSlots[number], file: File, input: HTMLInputElement) => {
    if (!slotConfig.accept.split(",").includes(file.type)) {
      toast.error(slotConfig.kind === "image" ? "Для этого слота выберите JPG, PNG или WEBP." : "Для этого слота выберите MP4 или WEBM.");
      input.value = "";
      return;
    }
    if (file.size > slotConfig.maxBytes) {
      toast.error(`Размер файла превышает лимит ${slotConfig.kind === "image" ? "5 МБ" : "50 МБ"}.`);
      input.value = "";
      return;
    }

    setUploadingSlot(slotConfig.slot);
    try {
      const response = await fetch(`/studio-control/api/admin/media?slot=${encodeURIComponent(slotConfig.slot)}`, {
        method: "PUT",
        credentials: "include",
        headers: {
          "content-type": file.type,
          "x-file-name": encodeURIComponent(file.name),
        },
        body: file,
      });
      const asset = (await response.json().catch(() => null)) as { slot?: MediaSlot; url?: string; error?: string } | null;
      if (!response.ok || !asset?.slot || !asset.url) throw new Error(asset?.error || "Не удалось загрузить медиафайл");
      await onUploadedMedia({ slot: asset.slot, url: asset.url });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Не удалось загрузить медиафайл");
    } finally {
      setUploadingSlot(null);
      input.value = "";
    }
  };

  const copyUrl = async (url: string) => {
    try {
      await navigator.clipboard.writeText(url);
      toast.success("Ссылка на файл скопирована");
    } catch {
      toast.error("Не удалось скопировать ссылку. Скопируйте её вручную из адресной строки.");
    }
  };

  const accessDenied = contentQuery.error?.data?.code === "FORBIDDEN";
  if (loading) return <div className="grid min-h-screen place-items-center bg-[#0c0c0c] text-white"><Loader2 className="h-7 w-7 animate-spin text-[#b98cff]" /></div>;
  if (!user) return <div className="grid min-h-screen place-items-center bg-[#0c0c0c] px-5 text-white"><div className="max-w-md rounded-[2rem] border border-white/10 bg-[#15131b] p-8 text-center"><LockKeyhole className="mx-auto h-8 w-8 text-[#b98cff]" /><h1 className="mt-5 font-display text-2xl font-black uppercase tracking-[-.08em]">Закрытая панель</h1><p className="mt-3 text-sm leading-6 text-[#aaa2b6]">Этот раздел не виден на публичном сайте. Войдите через защищённую авторизацию владельца.</p><button onClick={() => startLogin()} className="mt-7 inline-flex items-center gap-2 rounded-full bg-[#b98cff] px-5 py-3 font-mono text-xs font-bold uppercase tracking-[.12em] text-[#160e22]">Войти <ArrowUpRight className="h-4 w-4" /></button></div></div>;
  if (!isAdmin || accessDenied) return <div className="grid min-h-screen place-items-center bg-[#0c0c0c] px-5 text-white"><div className="max-w-md rounded-[2rem] border border-white/10 bg-[#15131b] p-8 text-center"><ShieldCheck className="mx-auto h-8 w-8 text-[#ff9ed7]" /><h1 className="mt-5 font-display text-2xl font-black uppercase tracking-[-.08em]">Нет доступа</h1><p className="mt-3 text-sm leading-6 text-[#aaa2b6]">Редактирование сайта доступно только назначенному владельцу.</p><a href="/" className="mt-7 inline-flex rounded-full border border-white/20 px-5 py-3 font-mono text-xs font-bold uppercase tracking-[.12em]">Вернуться на сайт</a></div></div>;

  return <DashboardLayout><div className="mx-auto max-w-6xl pb-16"><div className="flex flex-col gap-6 border-b border-white/10 pb-7 sm:flex-row sm:items-end sm:justify-between"><div><p className="font-mono text-[10px] font-semibold uppercase tracking-[.16em] text-[#b98cff]">Скрытая панель владельца</p><h1 className="mt-3 font-display text-[clamp(2.2rem,5vw,4.5rem)] font-black uppercase leading-[.84] tracking-[-.1em] text-white">{title}<br />студия.</h1><p className="mt-4 max-w-xl text-sm leading-6 text-[#aaa2b6]">Контент, медиафайлы и входящие заявки собраны в одном защищённом пространстве. Опубликованные изменения сразу используются на сайте.</p></div><div className="flex flex-wrap gap-3"><a href="/" target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 rounded-full border border-white/15 px-4 py-3 font-mono text-[10px] font-semibold uppercase tracking-[.12em] text-white">Открыть сайт <Globe2 className="h-4 w-4" /></a><button disabled={saveMutation.isPending || contentQuery.isLoading} onClick={() => saveMutation.mutate(draft)} className="inline-flex items-center gap-2 rounded-full bg-[#b98cff] px-5 py-3 font-mono text-[10px] font-bold uppercase tracking-[.12em] text-[#160e22] disabled:opacity-60">{saveMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}Сохранить текст</button></div></div>

    {contentQuery.isLoading ? <div className="grid min-h-64 place-items-center"><Loader2 className="h-6 w-6 animate-spin text-[#b98cff]" /></div> : <Tabs defaultValue="content" className="mt-8 gap-6"><TabsList className="h-auto w-full flex-wrap justify-start gap-1 rounded-2xl border border-white/10 bg-[#121015] p-2 sm:w-fit"><TabsTrigger value="content" className="rounded-xl px-4 py-2 font-mono text-[10px] uppercase tracking-[.12em] text-white data-[state=active]:bg-[#b98cff] data-[state=active]:text-[#160e22]">Контент</TabsTrigger><TabsTrigger value="media" className="rounded-xl px-4 py-2 font-mono text-[10px] uppercase tracking-[.12em] text-white data-[state=active]:bg-[#b98cff] data-[state=active]:text-[#160e22]">Медиа</TabsTrigger><TabsTrigger value="submissions" className="rounded-xl px-4 py-2 font-mono text-[10px] uppercase tracking-[.12em] text-white data-[state=active]:bg-[#b98cff] data-[state=active]:text-[#160e22]">Заявки{(submissionsQuery.data?.length ?? 0) > 0 ? ` · ${submissionsQuery.data?.length}` : ""}</TabsTrigger></TabsList>

      <TabsContent value="content" className="mt-0"><div className="mb-6 flex flex-col gap-4 rounded-2xl border border-[#b98cff]/25 bg-[#b98cff]/10 p-4 sm:flex-row sm:items-center sm:justify-between"><div><p className="font-mono text-[10px] font-semibold uppercase tracking-[.14em] text-[#d7b4ff]">Языковая версия</p><p className="mt-1 text-sm text-[#ded1ea]">Выберите язык, отредактируйте его поля и нажмите «Сохранить текст».</p></div><div className="flex gap-1 rounded-xl border border-white/10 bg-[#121015] p-1" role="tablist" aria-label="Языковые версии">{localeOrder.map((option) => <button key={option} type="button" role="tab" aria-selected={selectedLocale === option} onClick={() => setSelectedLocale(option)} className={`rounded-lg px-4 py-2 font-mono text-[10px] font-bold tracking-[.12em] transition ${selectedLocale === option ? "bg-[#b98cff] text-[#160e22]" : "text-white hover:bg-white/10"}`}>{localeLabels[option]}</button>)}</div></div><div className="grid gap-6">
        <Panel title="Бренд и навигация" description="Название сайта, пункты публичного меню и нижняя подпись."><div className="grid gap-4 md:grid-cols-2"><Field label="Название сайта" value={currentContent.branding.siteName} onChange={(value) => setBranding("siteName", value)} /><Field label="Нижняя подпись" value={currentContent.branding.footerNote} onChange={(value) => setBranding("footerNote", value)} /><Field label="Меню: обо мне" value={currentContent.branding.navAbout} onChange={(value) => setBranding("navAbout", value)} /><Field label="Меню: услуги" value={currentContent.branding.navServices} onChange={(value) => setBranding("navServices", value)} /><Field label="Меню: проекты" value={currentContent.branding.navProjects} onChange={(value) => setBranding("navProjects", value)} /><Field label="Меню: контакт" value={currentContent.branding.navContact} onChange={(value) => setBranding("navContact", value)} /></div></Panel>
        <Panel title="Первый экран" description="Крупный заголовок, правая подпись и главный призыв к действию."><div className="grid gap-4 md:grid-cols-3"><Field label="Строка 1" value={currentContent.hero.lineOne} onChange={(value) => setHero("lineOne", value)} /><Field label="Строка 2" value={currentContent.hero.lineTwo} onChange={(value) => setHero("lineTwo", value)} /><Field label="Строка 3" value={currentContent.hero.lineThree} onChange={(value) => setHero("lineThree", value)} /></div><div className="mt-4 grid gap-4 md:grid-cols-[1fr_.35fr]"><Field label="Подпись справа" value={currentContent.hero.note} onChange={(value) => setHero("note", value)} multiline /><Field label="Кнопка" value={currentContent.hero.ctaLabel} onChange={(value) => setHero("ctaLabel", value)} /></div></Panel>
        <Panel title="Обо мне" description="Светлая портретная сцена и её подписи."><div className="grid gap-4 md:grid-cols-2"><Field label="Верхняя подпись" value={currentContent.about.eyebrow} onChange={(value) => setAbout("eyebrow", value)} /><Field label="Тег" value={currentContent.about.tag} onChange={(value) => setAbout("tag", value)} /><Field label="Заголовок: строка 1" value={currentContent.about.lineOne} onChange={(value) => setAbout("lineOne", value)} /><Field label="Заголовок: строка 2" value={currentContent.about.lineTwo} onChange={(value) => setAbout("lineTwo", value)} /><Field label="Акцентное слово" value={currentContent.about.accentWord} onChange={(value) => setAbout("accentWord", value)} /><Field label="Заголовок: строка 3" value={currentContent.about.lineThree} onChange={(value) => setAbout("lineThree", value)} /><Field label="Описание" value={currentContent.about.description} onChange={(value) => setAbout("description", value)} multiline /><Field label="Кнопка" value={currentContent.about.ctaLabel} onChange={(value) => setAbout("ctaLabel", value)} /></div></Panel>
        <Panel title="Услуги" description="Тексты поверх анимированного видеофона, три карточки этапов и CTA."><div className="grid gap-4 md:grid-cols-2"><Field label="Верхняя подпись" value={currentContent.services.eyebrow} onChange={(value) => setServices("eyebrow", value)} /><Field label="Кнопка Telegram" value={currentContent.services.ctaLabel} onChange={(value) => setServices("ctaLabel", value)} /><Field label="Этап 01" value={currentContent.services.statOneLabel} onChange={(value) => setServices("statOneLabel", value)} /><Field label="Этап 02" value={currentContent.services.statTwoLabel} onChange={(value) => setServices("statTwoLabel", value)} /><Field label="Этап 03" value={currentContent.services.statThreeLabel} onChange={(value) => setServices("statThreeLabel", value)} /><Field label="Пояснение 01" value={currentContent.services.annotationOne} onChange={(value) => setServices("annotationOne", value)} multiline /><Field label="Пояснение 02" value={currentContent.services.annotationTwo} onChange={(value) => setServices("annotationTwo", value)} multiline /><Field label="Пояснение 03" value={currentContent.services.annotationThree} onChange={(value) => setServices("annotationThree", value)} multiline /><Field label="Заголовок 1" value={currentContent.services.headlineOne} onChange={(value) => setServices("headlineOne", value)} /><Field label="Заголовок 2" value={currentContent.services.headlineTwo} onChange={(value) => setServices("headlineTwo", value)} /><Field label="Заголовок 3" value={currentContent.services.headlineThree} onChange={(value) => setServices("headlineThree", value)} /></div></Panel>
        <Panel title="Контакты, реквизиты и конфиденциальность" description="Данные выводятся в подвале сайта и в окне политики конфиденциальности. Ссылки WhatsApp и Telegram указывайте в полном формате https://…"><div className="grid gap-4 md:grid-cols-2"><Field label="Название компании" value={currentContent.company.companyName} onChange={(value) => setCompany("companyName", value)} /><Field label="NIP / налоговый номер" value={currentContent.company.taxId} onChange={(value) => setCompany("taxId", value)} placeholder="NIP: 5732970568" /><Field label="Телефон" value={currentContent.company.phone} onChange={(value) => setCompany("phone", value)} placeholder="+48 …" /><Field label="E-mail" value={currentContent.company.email} onChange={(value) => setCompany("email", value)} placeholder="hello@example.com" /><Field label="WhatsApp" value={currentContent.company.whatsappUrl} onChange={(value) => setCompany("whatsappUrl", value)} placeholder="https://wa.me/…" /><Field label="Telegram" value={currentContent.company.telegramUrl} onChange={(value) => setCompany("telegramUrl", value)} placeholder="https://t.me/username" /><Field label="Адрес" value={currentContent.company.address} onChange={(value) => setCompany("address", value)} /><Field label="Юридическая строка" value={currentContent.company.legalLine} onChange={(value) => setCompany("legalLine", value)} /><Field label="Текст политики конфиденциальности" value={currentContent.company.privacyPolicy} onChange={(value) => setCompany("privacyPolicy", value)} multiline hint="Этот текст показывается посетителю после нажатия «Политика конфиденциальности» в подвале." /></div></Panel>
        <Panel title="Витрина сайтов" description="Добавляйте готовые сайты для продажи: название, краткое описание, ссылку, цену, статус и обложку. На первом экране витрины карточка переворачивается, а пустая ссылка ведёт в форму запроса условий."><div className="grid gap-5">{currentContent.projects.map((project, index) => <div key={`${project.number}-${index}`} className="rounded-2xl border border-white/10 bg-[#17141d] p-4"><div className="mb-4 flex items-center justify-between"><p className="font-mono text-[10px] font-semibold uppercase tracking-[.14em] text-[#b98cff]">Сайт {index + 1}</p><button onClick={() => removeProject(index)} disabled={currentContent.projects.length <= 1} className="inline-flex items-center gap-2 text-xs text-[#ffabc7] disabled:opacity-30"><Trash2 className="h-4 w-4" />Удалить</button></div><div className="grid gap-4 md:grid-cols-2"><Field label="Номер" value={project.number} onChange={(value) => updateProject(index, "number", value)} /><Field label="Название" value={project.name} onChange={(value) => updateProject(index, "name", value)} /><Field label="Категория" value={project.category} onChange={(value) => updateProject(index, "category", value)} /><Field label="Ссылка на сайт для перехода" value={project.url} onChange={(value) => updateProject(index, "url", value)} placeholder="https://example.com" hint="Вставьте полный адрес сайта с https:// — кнопка «Открыть» появится на карточке проекта." /><Field label="Цена" value={project.price} onChange={(value) => updateProject(index, "price", value)} placeholder="от 1 500 €" /><label className="block"><span className="font-mono text-[10px] font-semibold uppercase tracking-[.14em] text-[#b9b1c5]">Статус</span><select value={project.availability} onChange={(event) => updateProject(index, "availability", event.target.value)} className="mt-2 w-full rounded-xl border border-white/10 bg-[#15131b] px-3 py-2.5 text-sm text-white outline-none"><option value="available">В продаже</option><option value="sold">Продан</option></select></label><Field label="URL обложки" value={project.coverUrl} onChange={(value) => updateProject(index, "coverUrl", value)} placeholder="/manus-storage/…" hint={`Загрузите «Обложку сайта ${String(index + 1).padStart(2, "0")}" во вкладке «Медиа»: URL подставится автоматически.`} /><Field label="Краткое описание сайта" value={project.description} onChange={(value) => updateProject(index, "description", value)} multiline hint="Напишите 1–3 предложения: что входит в сайт, для кого он и какие ключевые функции или страницы есть внутри." /><label className="block"><span className="font-mono text-[10px] font-semibold uppercase tracking-[.14em] text-[#b9b1c5]">Цвет карточки</span><select value={project.visual} onChange={(event) => updateProject(index, "visual", event.target.value)} className="mt-2 w-full rounded-xl border border-white/10 bg-[#15131b] px-3 py-2.5 text-sm text-white outline-none"><option value="violet">Фиолетовый</option><option value="lime">Лаймовый</option><option value="coral">Коралловый</option></select></label></div></div>)}<button onClick={addProject} disabled={currentContent.projects.length >= 6} className="inline-flex w-fit items-center gap-2 rounded-full border border-dashed border-white/30 px-4 py-3 font-mono text-[10px] font-semibold uppercase tracking-[.12em] text-white disabled:opacity-30"><Plus className="h-4 w-4" />Добавить сайт</button></div></Panel>
        <Panel title="Финальный призыв" description="Последний блок перед брифом."><div className="grid gap-4 md:grid-cols-2"><Field label="Подпись" value={currentContent.closing.eyebrow} onChange={(value) => setClosing("eyebrow", value)} /><Field label="Кнопка" value={currentContent.closing.ctaLabel} onChange={(value) => setClosing("ctaLabel", value)} /><Field label="Заголовок: строка 1" value={currentContent.closing.lineOne} onChange={(value) => setClosing("lineOne", value)} /><Field label="Заголовок: строка 2" value={currentContent.closing.lineTwo} onChange={(value) => setClosing("lineTwo", value)} /></div></Panel>
        <Panel title="Клиентский бриф" description="Главный заголовок, пояснение и заметка о конфиденциальности в форме заявки."><div className="grid gap-4 md:grid-cols-2"><Field label="Метка блока" value={currentContent.brief.label} onChange={(value) => updateLocale((content) => ({ ...content, brief: { ...content.brief, label: value } }))} /><Field label="Заголовок" value={currentContent.brief.title} onChange={(value) => updateLocale((content) => ({ ...content, brief: { ...content.brief, title: value } }))} multiline /><Field label="Вводный текст" value={currentContent.brief.intro} onChange={(value) => updateLocale((content) => ({ ...content, brief: { ...content.brief, intro: value } }))} multiline /><Field label="Заметка о конфиденциальности" value={currentContent.brief.privacyNote} onChange={(value) => updateLocale((content) => ({ ...content, brief: { ...content.brief, privacyNote: value } }))} multiline /></div></Panel>
      </div></TabsContent>

      <TabsContent value="media" className="mt-0"><Panel title="Медиафайлы сайта" description="Заменяйте ключевые изображения и видео прямо здесь. Обложки сайтов из витрины автоматически подставляются в соответствующую карточку после загрузки и сохранения контента."><div className="mb-5 rounded-2xl border border-[#b98cff]/25 bg-[#b98cff]/10 p-4 text-sm leading-6 text-[#ded1ea]">Для портрета и обложек поддерживаются JPG, PNG и WEBP до 5 МБ. Для видео — MP4 и WEBM до 50 МБ. Предыдущие версии перестают использоваться на сайте после замены.</div><div className="grid gap-5 lg:grid-cols-3">{mediaSlots.map((slotConfig) => {
        const asset = mediaQuery.data?.find((item) => item.slot === slotConfig.slot);
        const pending = uploadingSlot === slotConfig.slot;
        return <article key={slotConfig.slot} className="overflow-hidden rounded-2xl border border-white/10 bg-[#17141d]"><div className="relative aspect-[4/3] overflow-hidden bg-[#0d0c10]">{asset ? slotConfig.kind === "image" ? <img src={asset.url} alt={slotConfig.label} className="h-full w-full object-cover" /> : <video src={asset.url} controls muted playsInline preload="metadata" className="h-full w-full object-cover" /> : <div className="grid h-full place-items-center text-[#756d80]">{slotConfig.kind === "image" ? <FileImage className="h-10 w-10" /> : <Film className="h-10 w-10" />}</div>}<span className="absolute left-3 top-3 rounded-full border border-white/15 bg-black/55 px-2.5 py-1 font-mono text-[9px] font-semibold uppercase tracking-[.12em] text-white backdrop-blur-sm">{slotConfig.kind === "image" ? "изображение" : "видео"}</span></div><div className="p-4"><p className="font-display text-lg font-black uppercase tracking-[-.06em] text-white">{slotConfig.label}</p><p className="mt-1 text-sm text-[#aaa2b6]">{slotConfig.description}</p>{asset ? <div className="mt-4 rounded-xl border border-white/10 bg-[#121015] p-3"><p className="truncate text-xs text-[#ddd3e4]">{asset.originalName}</p><p className="mt-1 font-mono text-[9px] uppercase tracking-[.12em] text-[#93899f]">{asset.mimeType} · {formatSize(asset.sizeBytes)}</p><button onClick={() => void copyUrl(asset.url)} className="mt-3 inline-flex items-center gap-1.5 text-xs text-[#d7b4ff] hover:text-white"><Clipboard className="h-3.5 w-3.5" />Скопировать URL</button></div> : <p className="mt-4 rounded-xl border border-dashed border-white/15 px-3 py-4 text-xs leading-5 text-[#91899f]">Используется исходный визуал сайта. Загрузите свой файл, чтобы заменить его.</p>}<label className="mt-4 inline-flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-[#b98cff] px-4 py-3 font-mono text-[10px] font-bold uppercase tracking-[.12em] text-[#160e22] transition hover:brightness-110 active:scale-[.97]">{pending ? <Loader2 className="h-4 w-4 animate-spin" /> : <UploadCloud className="h-4 w-4" />}{pending ? "Загрузка…" : asset ? "Заменить файл" : "Загрузить файл"}<input type="file" accept={slotConfig.accept} className="sr-only" disabled={Boolean(uploadingSlot)} onChange={(event) => { const file = event.currentTarget.files?.[0]; if (file) void uploadFile(slotConfig, file, event.currentTarget); }} /></label></div></article>;
      })}</div></Panel></TabsContent>

      <TabsContent value="submissions" className="mt-0"><Panel title="Входящие заявки" description="Здесь появляются заполненные клиентами брифы. Откройте заявку, чтобы увидеть ответы целиком, и меняйте рабочий статус по мере обработки.">{submissionsQuery.isLoading ? <div className="grid min-h-48 place-items-center"><Loader2 className="h-6 w-6 animate-spin text-[#b98cff]" /></div> : submissionsQuery.data?.length ? <Table className="min-w-[780px] text-[#f8f4fa]"><TableHeader><TableRow className="border-white/10 hover:bg-transparent"><TableHead className="px-3 text-[#a79eaf]">Клиент</TableHead><TableHead className="px-3 text-[#a79eaf]">Контакты</TableHead><TableHead className="px-3 text-[#a79eaf]">Получена</TableHead><TableHead className="px-3 text-[#a79eaf]">Статус</TableHead><TableHead className="px-3 text-right text-[#a79eaf]">Действия</TableHead></TableRow></TableHeader><TableBody>{submissionsQuery.data.map((submission) => <TableRow key={submission.publicId} className="border-white/10 hover:bg-white/[.035]"><TableCell className="px-3 py-4"><p className="font-medium text-white">{submission.fullName}</p><p className="mt-1 text-xs text-[#a79eaf]">{submission.companyName}</p><p className="mt-1 font-mono text-[9px] tracking-[.1em] text-[#8d819a]">{submission.publicId}</p></TableCell><TableCell className="px-3 py-4"><a href={`mailto:${submission.email}`} className="block text-xs text-[#dfc4ff] hover:text-white">{submission.email}</a><a href={`tel:${submission.phone}`} className="mt-1 block text-xs text-[#ddd6e4] hover:text-white">{submission.phone}</a></TableCell><TableCell className="px-3 py-4 text-xs text-[#c0b7c8]">{formatDate(submission.createdAt)}</TableCell><TableCell className="px-3 py-4"><select aria-label={`Статус заявки ${submission.publicId}`} value={submission.status} disabled={updateStatusMutation.isPending} onChange={(event) => updateStatusMutation.mutate({ publicId: submission.publicId, status: event.target.value as keyof typeof statusLabels })} className="rounded-lg border border-white/15 bg-[#15131b] px-2.5 py-2 text-xs text-white outline-none focus:border-[#b98cff]"><option value="received">Новая</option><option value="reviewed">В работе</option><option value="archived">Архив</option></select></TableCell><TableCell className="px-3 py-4 text-right"><button onClick={() => setSelectedSubmission(submission)} className="inline-flex items-center gap-2 rounded-full border border-white/15 px-3 py-2 font-mono text-[9px] font-semibold uppercase tracking-[.12em] text-white transition hover:border-[#b98cff] hover:text-[#e1c9ff]"><Eye className="h-3.5 w-3.5" />Открыть</button></TableCell></TableRow>)}</TableBody></Table> : <div className="grid min-h-48 place-items-center rounded-2xl border border-dashed border-white/15 bg-[#17141d] p-6 text-center"><Inbox className="h-7 w-7 text-[#b98cff]" /><p className="mt-3 font-medium text-white">Заявок пока нет</p><p className="mt-1 max-w-md text-sm leading-6 text-[#aaa2b6]">Когда клиент отправит бриф с публичного сайта, он появится здесь вместе с контактами и подробными ответами.</p></div>}</Panel></TabsContent>
      <TabsContent value="submissions" className="mt-6"><Panel title="Заявки на готовые сайты" description="Здесь появляются короткие обращения из кнопки «Оставить заявку» на витрине. Сайт и цена фиксируются в момент отправки.">{siteInquiriesQuery.isLoading ? <div className="grid min-h-40 place-items-center"><Loader2 className="h-6 w-6 animate-spin text-[#b98cff]" /></div> : siteInquiriesQuery.data?.length ? <div className="grid gap-3">{siteInquiriesQuery.data.map((inquiry: SiteInquiry) => <article key={inquiry.publicId} className="grid gap-4 rounded-2xl border border-white/10 bg-[#17141d] p-4 sm:grid-cols-[1fr_auto] sm:items-center"><div><div className="flex flex-wrap items-center gap-2"><p className="font-display text-xl font-semibold tracking-[-.05em] text-white">{inquiry.siteName}</p><span className="rounded-full border border-[#c9ff9f]/30 bg-[#b7f58d]/10 px-2 py-1 font-mono text-[8px] font-semibold uppercase tracking-[.12em] text-[#c9ff9f]">{inquiry.price}</span></div><p className="mt-2 text-sm text-[#eee7f5]">{inquiry.fullName} · <span className="text-[#d9beff]">{inquiry.contact}</span></p>{inquiry.comment && <p className="mt-2 max-w-2xl text-sm leading-6 text-[#aaa2b6]">{inquiry.comment}</p>}<p className="mt-3 font-mono text-[9px] uppercase tracking-[.12em] text-[#84798f]">{inquiry.publicId} · {formatDate(inquiry.createdAt)}</p></div><select aria-label={`Статус заявки на сайт ${inquiry.publicId}`} value={inquiry.status} disabled={updateSiteInquiryStatusMutation.isPending} onChange={(event) => updateSiteInquiryStatusMutation.mutate({ publicId: inquiry.publicId, status: event.target.value as keyof typeof statusLabels })} className="w-fit rounded-xl border border-white/15 bg-[#121015] px-3 py-2.5 text-sm text-white outline-none focus:border-[#b98cff]"><option value="received">Новая</option><option value="reviewed">В работе</option><option value="archived">Архив</option></select></article>)}</div> : <div className="grid min-h-40 place-items-center rounded-2xl border border-dashed border-white/15 bg-[#17141d] p-6 text-center"><Inbox className="h-7 w-7 text-[#b98cff]" /><p className="mt-3 font-medium text-white">Заявок на готовые сайты пока нет</p><p className="mt-1 max-w-md text-sm leading-6 text-[#aaa2b6]">Когда посетитель оставит контакты из карточки доступного сайта, обращение появится здесь.</p></div>}</Panel></TabsContent>
    </Tabs>}

    <Dialog open={Boolean(selectedSubmission)} onOpenChange={(open) => { if (!open) setSelectedSubmission(null); }}><DialogContent className="max-h-[calc(100svh-2rem)] max-w-3xl overflow-y-auto border-white/10 bg-[#121015] p-5 text-white sm:p-7"><DialogHeader><DialogTitle className="font-display text-2xl font-black uppercase tracking-[-.07em] text-white">Заявка {selectedSubmission?.publicId}</DialogTitle><DialogDescription className="text-[#aaa2b6]">{selectedSubmission ? `${selectedSubmission.fullName} · ${selectedSubmission.companyName} · ${formatDate(selectedSubmission.createdAt)}` : ""}</DialogDescription></DialogHeader>{selectedSubmission && <div className="mt-4 grid gap-5"><div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-white/10 bg-[#19161e] p-4"><div><p className="font-mono text-[9px] uppercase tracking-[.14em] text-[#a79eaf]">Рабочий статус</p><p className="mt-1 text-sm text-white">{statusLabels[selectedSubmission.status]}</p></div><select aria-label="Изменить статус открытой заявки" value={selectedSubmission.status} disabled={updateStatusMutation.isPending} onChange={(event) => updateStatusMutation.mutate({ publicId: selectedSubmission.publicId, status: event.target.value as keyof typeof statusLabels })} className="rounded-xl border border-white/15 bg-[#121015] px-3 py-2 text-sm text-white outline-none focus:border-[#b98cff]"><option value="received">Новая</option><option value="reviewed">В работе</option><option value="archived">Архив</option></select></div><div className="grid gap-3 sm:grid-cols-2"><BriefDetail label="Имя" value={selectedSubmission.payload.fullName} /><BriefDetail label="Компания" value={selectedSubmission.payload.companyName} /><BriefDetail label="E-mail" value={selectedSubmission.payload.email} /><BriefDetail label="Телефон" value={selectedSubmission.payload.phone} /><BriefDetail label="Предпочтительный способ связи" value={selectedSubmission.payload.contactPreference} /><BriefDetail label="География" value={selectedSubmission.payload.geography} /></div><div className="grid gap-3"><BriefDetail label="О проекте" value={selectedSubmission.payload.businessDescription} /><BriefDetail label="Что предлагает бизнес" value={selectedSubmission.payload.offers} /><BriefDetail label="Аудитория" value={selectedSubmission.payload.audience} /><BriefDetail label="Основная задача сайта" value={selectedSubmission.payload.mainGoal} /><BriefDetail label="Почему выбирают вас" value={selectedSubmission.payload.whyChoose} /></div><div className="grid gap-3 sm:grid-cols-2"><BriefDetail label="Цели" value={selectedSubmission.payload.goals} /><BriefDetail label="Текущее состояние сайта" value={selectedSubmission.payload.currentSiteState} /><BriefDetail label="Нужные страницы" value={selectedSubmission.payload.requiredPages} /><BriefDetail label="Функции" value={selectedSubmission.payload.features} /><BriefDetail label="Слова про стиль" value={selectedSubmission.payload.styleWords} /><BriefDetail label="Цветовое направление" value={selectedSubmission.payload.colorDirection} /><BriefDetail label="Материалы" value={selectedSubmission.payload.availableMaterials} /><BriefDetail label="Готовность контента" value={selectedSubmission.payload.contentReadiness} /><BriefDetail label="Срок" value={selectedSubmission.payload.deadline} /><BriefDetail label="Бюджет" value={selectedSubmission.payload.budgetRange} /></div><div className="grid gap-3"><BriefDetail label="Референсы" value={selectedSubmission.payload.references} /><BriefDetail label="Пожелания к цвету" value={selectedSubmission.payload.colorNotes} /><BriefDetail label="Дополнительный комментарий" value={selectedSubmission.payload.comment} /></div></div>}</DialogContent></Dialog>
  </div></DashboardLayout>;
}
