import BriefApplication from "@/components/BriefApplication";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ArrowDownRight, ArrowUpRight, Compass, ExternalLink, Mail, Menu, MessageCircle, PanelsTopLeft, Phone, Rocket, Send, ShieldCheck, X } from "lucide-react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useEffect, useMemo, useRef, useState } from "react";
import { trpc } from "@/lib/trpc";
import { SiteInquiryDialog } from "@/components/SiteInquiryDialog";
import type { SiteContent } from "@shared/siteContent";
import { resolvePublicMediaUrls } from "@shared/siteMedia";
import { getUiCopy, localeOrder, normalizeSiteContentBundle, type Locale } from "@shared/locales";
import { useLocale } from "@/contexts/LocaleContext";
import LanguageSwitcher from "@/components/LanguageSwitcher";

const seoCopy: Record<Locale, { title: string; description: string; ogLocale: string }> = {
  uk: { title: "Skifia Art — дизайн і розробка сайтів", description: "Skifia Art створює виразні сайти: стратегія, дизайн, розробка та запуск під ключ.", ogLocale: "uk_UA" },
  pl: { title: "Skifia Art — projektowanie i tworzenie stron", description: "Skifia Art tworzy charakterystyczne strony: strategia, design, development i uruchomienie pod klucz.", ogLocale: "pl_PL" },
  ru: { title: "Skifia Art — дизайн и разработка сайтов", description: "Skifia Art создаёт выразительные сайты: стратегия, дизайн, разработка и запуск под ключ.", ogLocale: "ru_RU" },
};

function upsertMeta(attribute: "name" | "property", key: string, content: string) {
  let element = document.head.querySelector<HTMLMetaElement>(`meta[${attribute}="${key}"]`);
  if (!element) {
    element = document.createElement("meta");
    element.setAttribute(attribute, key);
    document.head.appendChild(element);
  }
  element.content = content;
}


function FadeIn({ children, delay = 0, className = "" }: { children: React.ReactNode; delay?: number; className?: string }) {
  const reduced = useReducedMotion();
  return <motion.div initial={reduced ? false : { opacity: 0, y: 28 }} whileInView={reduced ? undefined : { opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.16 }} transition={{ duration: 0.72, delay, ease: [0.25, 0.1, 0.25, 1] }} className={className}>{children}</motion.div>;
}

function MagneticAvatar({ src }: { src?: string }) {
  const reduced = useReducedMotion();
  const imageRef = useRef<HTMLImageElement>(null);

  const move = (event: React.PointerEvent<HTMLDivElement>) => {
    if (reduced || !imageRef.current) return;
    const box = event.currentTarget.getBoundingClientRect();
    const x = ((event.clientX - box.left) / box.width - 0.5) * 46;
    const y = ((event.clientY - box.top) / box.height - 0.5) * 46;
    imageRef.current.style.transform = `translate3d(${x}px, ${y}px, 0) rotate(${x * 0.19}deg) scale(1.035)`;
  };

  const reset = () => { if (imageRef.current) imageRef.current.style.transform = "translate3d(0, 0, 0) rotate(0deg) scale(1)"; };

  return <div onPointerMove={move} onPointerLeave={reset} className="avatar-stage absolute bottom-0 left-1/2 z-10 h-[69%] w-[min(72vw,570px)] -translate-x-1/2 sm:h-[75%] sm:w-[min(60vw,640px)]" aria-label="Интерактивный 3D-объект"><span className="avatar-halo" aria-hidden="true" /><motion.div animate={reduced ? undefined : { y: [0, -12, 0], rotate: [0, 0.8, 0], scale: [1, 1.018, 1] }} transition={{ duration: 3.6, repeat: Infinity, ease: "easeInOut" }} className="avatar-float h-full w-full">{src ? <img ref={imageRef} src={src} alt="Стилизованный 3D-портрет создателя сайта" className="avatar-image h-full w-full object-contain object-bottom" /> : null}</motion.div></div>;
}

function RotatingHeroPhrase({ fallback, phrases: phraseList }: { fallback: string; phrases: readonly string[] }) {
  const reduced = useReducedMotion();
  const phrases = useMemo(() => [fallback, ...phraseList.filter((phrase) => phrase !== fallback)], [fallback, phraseList]);
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    if (reduced || phrases.length < 2) return;
    const interval = window.setInterval(() => {
      setActiveIndex((current) => (current + 1) % phrases.length);
    }, 3200);
    return () => window.clearInterval(interval);
  }, [phrases, reduced]);

  const activePhrase = reduced ? fallback : phrases[activeIndex] ?? fallback;

  return <span className="hero-phrase relative inline-grid max-w-full overflow-hidden align-baseline" aria-live="polite" aria-label={activePhrase}>
    {phrases.map((phrase, index) => <span key={phrase} className="invisible col-start-1 row-start-1 whitespace-nowrap">{phrase}</span>)}
    <AnimatePresence initial={false} mode="wait">
      <motion.span key={activePhrase} initial={reduced ? false : { opacity: 0, y: "68%" }} animate={{ opacity: 1, y: 0 }} exit={reduced ? undefined : { opacity: 0, y: "-68%" }} transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }} className="col-start-1 row-start-1 whitespace-nowrap">
        {activePhrase}
      </motion.span>
    </AnimatePresence>
  </span>;
}

const previewCopy: Record<Locale, { eyebrow: string; title: string; avatarAlt: string; status: string }> = {
  uk: { eyebrow: "Skifia Art / preview", title: "Відкриваємо сайт", avatarAlt: "Анімований 3D-портрет Skifia Art", status: "Відкриваємо сайт" },
  pl: { eyebrow: "Skifia Art / podgląd", title: "Otwieramy stronę", avatarAlt: "Animowany portret 3D Skifia Art", status: "Otwieramy stronę" },
  ru: { eyebrow: "Skifia Art / preview", title: "Открываем сайт", avatarAlt: "Анимированный 3D-портрет Skifia Art", status: "Открываем сайт" },
};

function PreviewLink({ href, previewSrc, className, children }: { href: string; previewSrc?: string; className?: string; children: React.ReactNode }) {
  const [isLoading, setIsLoading] = useState(false);
  const reduced = useReducedMotion();

  const openWithPreview = (event: React.MouseEvent<HTMLAnchorElement>) => {
    event.preventDefault();
    event.stopPropagation();
    if (isLoading) return;
    const copy = previewCopy[(document.documentElement.lang as Locale) || "uk"] ?? previewCopy.uk;
    setIsLoading(true);
    const nextWindow = window.open("about:blank", "_blank");
    if (nextWindow) {
      nextWindow.opener = null;
      const previewDocument = nextWindow.document;
      previewDocument.title = copy.title;
      previewDocument.head.innerHTML = `<meta name="viewport" content="width=device-width, initial-scale=1" /><style>html,body{margin:0;min-height:100%;background:#0c0c0c;color:#d7e2ea;font-family:Arial,sans-serif}body{display:grid;min-height:100vh;place-items:center;overflow:hidden}.preview{position:relative;display:grid;min-height:100vh;width:100%;place-items:center;overflow:hidden}.glow{position:absolute;height:45vw;width:45vw;min-height:260px;min-width:260px;border-radius:50%;background:radial-gradient(circle,rgba(45,212,191,.42),rgba(7,83,86,.18) 38%,transparent 72%);filter:blur(18px)}.content{position:relative;z-index:1;display:flex;flex-direction:column;align-items:center;gap:14px;text-align:center}.avatar-wrap{position:relative;display:grid;height:230px;width:230px;place-items:center}.halo{position:absolute;height:72%;width:72%;border-radius:50%;background:radial-gradient(circle,rgba(83,224,207,.62),rgba(7,83,86,.22) 48%,transparent 74%);filter:blur(14px);animation:pulse 2.4s ease-in-out infinite}.avatar{position:relative;z-index:1;height:100%;width:100%;object-fit:contain;filter:drop-shadow(0 20px 32px rgba(7,83,86,.75));animation:float 2.8s ease-in-out infinite}.eyebrow,.url{font:600 10px/1.4 monospace;letter-spacing:.16em;text-transform:uppercase}.eyebrow{color:#53e0cf}.content strong{font:600 30px/1.05 Georgia,serif;letter-spacing:-.04em}.url{max-width:80vw;overflow:hidden;color:#8c969e;text-overflow:ellipsis;white-space:nowrap}@keyframes float{50%{transform:translateY(-9px) scale(1.02)}}@keyframes pulse{50%{opacity:.72;transform:scale(1.1)}}@media(prefers-reduced-motion:reduce){.avatar,.halo{animation:none}}</style>`;
      const preview = previewDocument.createElement("main");
      preview.className = "preview";
      const glow = previewDocument.createElement("div");
      glow.className = "glow";
      const content = previewDocument.createElement("div");
      content.className = "content";
      if (previewSrc) {
        const avatarWrap = previewDocument.createElement("div");
        avatarWrap.className = "avatar-wrap";
        const halo = previewDocument.createElement("span");
        halo.className = "halo";
        const image = previewDocument.createElement("img");
        image.className = "avatar";
        image.alt = copy.avatarAlt;
        image.src = previewSrc;
        avatarWrap.append(halo, image);
        content.appendChild(avatarWrap);
      }
      const eyebrow = previewDocument.createElement("span");
      eyebrow.className = "eyebrow";
      eyebrow.textContent = copy.eyebrow;
      const title = previewDocument.createElement("strong");
      title.textContent = copy.title;
      const url = previewDocument.createElement("span");
      url.className = "url";
      url.textContent = href.replace(/^https?:\/\//, "").replace(/\/$/, "");
      content.append(eyebrow, title, url);
      preview.append(glow, content);
      previewDocument.body.replaceChildren(preview);
    }
    window.setTimeout(() => {
      if (nextWindow && !nextWindow.closed) nextWindow.location.replace(href);
      else window.location.href = href;
    }, reduced ? 180 : 900);
  };

  return <><a href={href} target="_blank" rel="noreferrer" onClick={openWithPreview} className={className}>{children}</a>{isLoading && <span className="sr-only" role="status">{previewCopy[(document.documentElement.lang as Locale) || "uk"]?.status ?? previewCopy.uk.status}</span>}</>;
}

const cookieCopy: Record<Locale, { title: string; text: string; necessary: string; analytics: string }> = {
  uk: { title: "Налаштування cookies", text: "Ми використовуємо необхідні дані для роботи сайту. Аналітика підключається лише за вашою згодою.", necessary: "Лише необхідні", analytics: "Дозволити аналітику" },
  pl: { title: "Ustawienia cookies", text: "Używamy niezbędnych danych do działania strony. Analityka jest włączana tylko za Twoją zgodą.", necessary: "Tylko niezbędne", analytics: "Zezwól na analitykę" },
  ru: { title: "Настройки cookies", text: "Мы используем необходимые данные для работы сайта. Аналитика подключается только с вашего согласия.", necessary: "Только необходимые", analytics: "Разрешить аналитику" },
};

function CookieConsent() {
  const { locale } = useLocale();
  const copy = cookieCopy[locale];
  const [visible, setVisible] = useState(false);
  const analyticsEndpoint = import.meta.env.VITE_ANALYTICS_ENDPOINT as string | undefined;
  const analyticsWebsiteId = import.meta.env.VITE_ANALYTICS_WEBSITE_ID as string | undefined;
  const analyticsAvailable = Boolean(analyticsEndpoint && analyticsWebsiteId);

  useEffect(() => {
    if (!analyticsEndpoint || !analyticsWebsiteId) return;
    const choice = window.localStorage.getItem("skifia-cookie-consent");
    if (!choice) setVisible(true);
    if (choice === "analytics") {
      const script = document.createElement("script");
      script.defer = true;
      script.src = `${analyticsEndpoint}/umami`;
      script.dataset.websiteId = analyticsWebsiteId;
      document.head.appendChild(script);
      return () => script.remove();
    }
  }, [analyticsAvailable, analyticsEndpoint, analyticsWebsiteId]);

  if (!visible || !analyticsAvailable) return null;
  const choose = (value: "necessary" | "analytics") => {
    window.localStorage.setItem("skifia-cookie-consent", value);
    setVisible(false);
    if (value === "analytics") window.location.reload();
  };
  return <aside className="cookie-consent" role="dialog" aria-labelledby="cookie-consent-title" aria-describedby="cookie-consent-text"><div><h2 id="cookie-consent-title">{copy.title}</h2><p id="cookie-consent-text">{copy.text}</p></div><div className="cookie-consent__actions"><button type="button" onClick={() => choose("necessary")} className="cookie-consent__button cookie-consent__button--secondary">{copy.necessary}</button><button type="button" onClick={() => choose("analytics")} className="cookie-consent__button">{copy.analytics}</button></div></aside>;
}

function AnimatedText({ text }: { text: string }) {
  return <p className="about-reveal mx-auto max-w-2xl text-center text-[clamp(1.08rem,2vw,1.45rem)] font-medium leading-relaxed text-[#d7e2ea]">{Array.from(text).map((character, index) => <motion.span key={`${character}-${index}`} initial={{ opacity: 0.22 }} whileInView={{ opacity: 1 }} viewport={{ once: true, amount: 0.4 }} transition={{ duration: 0.35, delay: Math.min(index * 0.012, 0.6) }}>{character}</motion.span>)}</p>;
}

function ProjectStackCard({ index, work, ui, previewSrc }: { index: number; work: SiteContent["projects"][number]; ui: ReturnType<typeof getUiCopy>; previewSrc?: string }) {
  const coverUrl = work.coverUrl;
  const hasUrl = Boolean(work.url);

  return <motion.article initial={{ opacity: 1, y: 0 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.2 }} transition={{ duration: 0.65, ease: [0.25, 0.1, 0.25, 1] }} className="project-portfolio-card" style={{ zIndex: index + 1, "--stack-offset": `${index * 18}px` } as React.CSSProperties}><div className="project-portfolio-card__topline"><span>{work.number} / {work.category}</span><span>case / {String(index + 1).padStart(2, "0")}</span></div><div className="project-portfolio-card__body"><div className="project-portfolio-card__visual">{coverUrl ? <img src={coverUrl} alt={`Обложка портфолио ${work.name}`} className="project-portfolio-card__image" loading="lazy" /> : <div className={`project-portfolio-card__placeholder project-portfolio-card__placeholder--${work.visual}`}><span>{work.number}</span><small>{ui.projectsKicker}</small></div>}<span className="project-portfolio-card__visual-wash" aria-hidden="true" /></div><div className="project-portfolio-card__info"><p className="project-portfolio-card__kicker">{work.category}</p><h3>{work.name}</h3><p className="project-portfolio-card__description">{work.description}</p><div className="project-portfolio-card__actions">{hasUrl && <PreviewLink href={work.url!} previewSrc={previewSrc} className="live-button">{ui.storefrontOpen} <ExternalLink className="h-4 w-4" /></PreviewLink>}</div></div></div></motion.article>;
}

function StorefrontSiteCard({ work, index, onRequest, ui, previewSrc }: { work: SiteContent["projects"][number]; index: number; onRequest: (work: SiteContent["projects"][number]) => void; ui: ReturnType<typeof getUiCopy>; previewSrc?: string }) {
  const [flipped, setFlipped] = useState(false);
  const coverUrl = work.coverUrl;
  const isSold = work.availability === "sold";
  const availabilityLabel = isSold ? ui.storefrontSold : ui.storefrontAvailable;
  const hasUrl = Boolean(work.url);
  const hostLabel = work.url ? work.url.replace(/^https?:\/\/(www\.)?/, "").split("/")[0] : ui.hostPlaceholder;
  const toggle = () => setFlipped((current) => !current);
  const onKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      toggle();
    }
  };

  return <motion.article initial={{ opacity: 0, y: 26 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.18 }} transition={{ duration: 0.55, delay: index * 0.08, ease: [0.22, 1, 0.36, 1] }} className="site-store-card"><div className={`site-store-card__flip ${flipped ? "is-flipped" : ""}`} role="button" tabIndex={0} aria-pressed={flipped} aria-label={`${ui.storefrontOpen} ${work.name}`} onClick={toggle} onKeyDown={onKeyDown}><div className="site-store-card__face site-store-card__front"><div className="site-store-card__topline"><span>{ui.siteLabel} / {work.number}</span><span className={`site-store-card__status site-store-card__status--${work.availability}`}>{availabilityLabel}</span></div><div className="site-store-card__browser"><div className="site-store-card__browser-bar"><i /><i /><i /><span>{hostLabel}</span></div><div className="site-store-card__preview">{coverUrl ? <img src={coverUrl} alt={`Превью сайта ${work.name}`} loading="lazy" /> : <div className={`site-store-card__placeholder site-store-card__placeholder--${work.visual}`}><span>{ui.decorativeReady.split("\n").map((line) => <span key={line} className="block">{line}</span>)}</span><i /></div>}<div className="site-store-card__preview-wash" /></div></div><div className="site-store-card__front-copy"><p>{work.category}</p><h3>{work.name}</h3><div className="site-store-card__sale-meta"><strong>{work.price}</strong><span>{ui.storefrontHint}</span></div></div></div><div className="site-store-card__face site-store-card__back"><span className={`site-store-card__badge site-store-card__badge--${work.availability}`}>{availabilityLabel}</span><div><p className="site-store-card__back-kicker">{work.category}</p><h3>{work.name}</h3><p className="site-store-card__description">{work.description}</p></div><div className="site-store-card__back-footer"><strong>{work.price}</strong><div className="site-store-card__actions">{hasUrl && <PreviewLink href={work.url!} previewSrc={previewSrc} className="site-store-card__link">{ui.storefrontOpen} <ArrowUpRight className="h-4 w-4" /></PreviewLink>}{isSold ? <span className="site-store-card__link site-store-card__link--sold">{ui.availabilitySold}</span> : <button type="button" onClick={(event) => { event.stopPropagation(); onRequest(work); }} className="site-store-card__inquiry">{ui.storefrontRequest}</button>}</div></div></div></div></motion.article>;
}

const serviceEase: [number, number, number, number] = [0.22, 1, 0.36, 1];

function ServiceShowcase({ content, videoUrl }: { content: SiteContent; videoUrl?: string }) {
  const reduced = useReducedMotion();
  const fadeUp = (delay: number) => ({ initial: reduced ? false : { opacity: 0, y: 32 }, whileInView: reduced ? undefined : { opacity: 1, y: 0 }, viewport: { once: true, amount: 0.2 }, transition: { delay, duration: 0.6, ease: serviceEase } });
  const serviceStats = [["01", content.services.statOneLabel], ["02", content.services.statTwoLabel], ["03", content.services.statThreeLabel]];
  const serviceWords = [content.services.headlineOne, content.services.headlineTwo, content.services.headlineThree];
  const serviceNotes = [content.services.annotationOne, content.services.annotationTwo, content.services.annotationThree];
  const serviceIllustrations = [Compass, PanelsTopLeft, Rocket];

  return <section id="services" className="services-showcase relative z-10 isolate min-h-screen overflow-hidden rounded-t-[42px] bg-[#b8f3e7] px-5 py-6 text-[#201529] sm:rounded-t-[60px] sm:px-8 sm:py-8 md:px-12">
    {videoUrl ? <video className="services-video pointer-events-none absolute inset-0 z-0 h-full w-full object-cover" autoPlay loop muted playsInline preload="metadata" aria-hidden="true"><source src={videoUrl} /></video> : null}
    <div className="services-wash pointer-events-none absolute inset-0 z-[1]" />
    <div className="relative z-10 mx-auto flex min-h-[calc(100svh-3rem)] max-w-[1600px] flex-col sm:min-h-[calc(100svh-4rem)]">
      <div className="grid grid-cols-[1fr_auto] items-center gap-4"><motion.div {...fadeUp(0)} className="flex items-center gap-3"><span className="grid h-8 w-8 place-items-center rounded-full border-2 border-[#0d9488]"><i className="h-2.5 w-2.5 rounded-full bg-[#0d9488]" /></span><span className="font-mono text-[9px] font-semibold uppercase tracking-[.17em]">{content.services.eyebrow}</span></motion.div><motion.a {...fadeUp(0.2)} href={content.company.telegramUrl || "#brief"} target={content.company.telegramUrl ? "_blank" : undefined} rel={content.company.telegramUrl ? "noreferrer" : undefined} className="services-primary-cta">{content.services.ctaLabel} <ArrowUpRight className="h-4 w-4" /></motion.a></div>
      <div className="relative z-10 flex flex-1 items-center justify-end py-10 sm:py-12"><div className="services-stage-grid relative z-10">{serviceStats.map(([number, label], index) => { const ServiceIcon = serviceIllustrations[index]; return <div key={number} className="services-stage"><motion.div {...fadeUp(0.24 + index * 0.12)} className="services-stage-stat"><p className="font-display text-[clamp(2.2rem,5vw,4.4rem)] font-semibold leading-none tracking-[-.1em]"><span className="mr-1 align-top text-[.4em] text-[#0d9488]">+</span>{number}</p><p className="mt-2 whitespace-pre-line font-mono text-[8px] font-semibold leading-tight tracking-[.12em] sm:text-[10px]">{label}</p></motion.div><motion.article initial={reduced ? false : { opacity: 0, y: 24, scale: 0.97 }} whileInView={reduced ? undefined : { opacity: 1, y: 0, scale: 1 }} whileHover={reduced ? undefined : { y: -6, scale: 1.015 }} viewport={{ once: true, amount: 0.22 }} transition={{ delay: 0.56 + index * 0.1, duration: 0.52, ease: serviceEase }} className="services-annotation-card"><ServiceIcon aria-hidden="true" className="service-stage-icon" /><span>{String(index + 1).padStart(2, "0")}</span><p>{serviceNotes[index]}</p><i aria-hidden="true" /></motion.article></div>; })}</div></div>
      <div className="flex justify-end pb-4 sm:pb-7"><h2 className="text-right font-display text-[clamp(2.7rem,8.7vw,8.8rem)] font-semibold leading-[.77] tracking-[-.07em]">{serviceWords.map((word, index) => <span key={`${word}-${index}`} className="services-word block overflow-hidden"><motion.span initial={reduced ? false : { y: "112%" }} whileInView={reduced ? undefined : { y: 0 }} viewport={{ once: true, amount: 0.25 }} transition={{ delay: 0.38 + index * 0.14, duration: 0.7, ease: serviceEase }} className="block">{word}</motion.span></span>)}</h2></div>
    </div>
  </section>;
}

export default function Home() {
  const { locale } = useLocale();
  const ui = getUiCopy(locale);
  const [menuOpen, setMenuOpen] = useState(false);
  const [inquiryWork, setInquiryWork] = useState<SiteContent["projects"][number] | null>(null);
  const [privacyOpen, setPrivacyOpen] = useState(false);
  const reduced = useReducedMotion();
  const { data: storedContent } = trpc.siteContent.public.useQuery(undefined, { staleTime: 60_000, refetchOnWindowFocus: false });
  const { data: mediaAssets } = trpc.media.public.useQuery(undefined, { staleTime: 60_000, refetchOnWindowFocus: false });
  const contentBundle = normalizeSiteContentBundle(storedContent);
  const content = contentBundle.locales[locale] ?? contentBundle.locales.ru;
  const seo = seoCopy[locale];

  useEffect(() => {
    if (typeof document === "undefined" || typeof window === "undefined") return;
    document.documentElement.lang = locale;
    document.title = seo.title;
    upsertMeta("name", "description", seo.description);
    upsertMeta("name", "robots", "index,follow");
    upsertMeta("property", "og:title", seo.title);
    upsertMeta("property", "og:description", seo.description);
    upsertMeta("property", "og:locale", seo.ogLocale);
    upsertMeta("property", "og:type", "website");
    upsertMeta("property", "og:site_name", "Skifia Art");
    upsertMeta("name", "twitter:card", "summary");

    const baseUrl = new URL(window.location.href);
    baseUrl.searchParams.delete("lang");
    baseUrl.searchParams.delete("cachecheck");
    baseUrl.hash = "";
    const canonicalUrl = new URL(baseUrl);
    canonicalUrl.searchParams.set("lang", locale);
    let canonical = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]');
    if (!canonical) {
      canonical = document.createElement("link");
      canonical.rel = "canonical";
      document.head.appendChild(canonical);
    }
    canonical.href = canonicalUrl.toString();
    upsertMeta("property", "og:url", canonicalUrl.toString());

    document.head.querySelectorAll('link[data-seo-hreflang="true"]').forEach((link) => link.remove());
    localeOrder.forEach((alternateLocale) => {
      const link = document.createElement("link");
      link.rel = "alternate";
      link.hreflang = alternateLocale;
      link.href = `${baseUrl.toString()}?lang=${alternateLocale}`;
      link.dataset.seoHreflang = "true";
      document.head.appendChild(link);
    });
    const defaultLink = document.createElement("link");
    defaultLink.rel = "alternate";
    defaultLink.hreflang = "x-default";
    defaultLink.href = baseUrl.toString();
    defaultLink.dataset.seoHreflang = "true";
    document.head.appendChild(defaultLink);
  }, [locale, seo]);

  const { avatar: avatarUrl, servicesVideo: servicesVideoUrl, aboutVideo: aboutVideoUrl } = resolvePublicMediaUrls(mediaAssets);
  const mediaBySlot = useMemo(() => new Map((mediaAssets ?? []).map((asset) => [asset.slot, asset.url])), [mediaAssets]);
  const projects = useMemo(() => content.projects.map((work, index) => ({
    ...work,
    coverUrl: work.coverUrl || mediaBySlot.get(`project-cover-${String(index + 1).padStart(2, "0")}`) || "",
  })), [content.projects, mediaBySlot]);
  const heroPhrase = content.hero.lineThree.trim();
  const rotatingHeroWords = ui.heroPhrases.map((phrase) => phrase.trim().split(/\s+/).slice(-1)[0]).filter(Boolean);
  const rotatesHeroPhrase = rotatingHeroWords.length > 1;


  useEffect(() => {
    const sectionId = window.location.hash.replace("#", "") || new URLSearchParams(window.location.search).get("section") || "";
    if (!sectionId) return;
    const timeout = window.setTimeout(() => document.getElementById(sectionId)?.scrollIntoView({ behavior: "auto", block: "start" }), 0);
    return () => window.clearTimeout(timeout);
  }, []);

  return <div className="creator-shell min-h-screen overflow-x-clip bg-[#0c0c0c] text-[#d7e2ea]">
    <header className="creator-nav absolute inset-x-0 top-0 z-30"><div className="mx-auto flex max-w-[1600px] items-center justify-between px-6 pt-6 sm:px-10 sm:pt-8"><a href="#top" className="font-display text-sm font-black uppercase tracking-[-0.06em] text-[#d7e2ea]">{content.branding.siteName}</a><nav className="hidden items-center gap-8 font-medium uppercase tracking-wider text-[#d7e2ea] sm:flex sm:text-sm lg:gap-12 lg:text-lg"><a href="#about" className="transition-opacity hover:opacity-70">{content.branding.navAbout}</a><a href="#services" className="transition-opacity hover:opacity-70">{content.branding.navServices}</a><a href="#projects" className="transition-opacity hover:opacity-70">{content.branding.navProjects}</a><a href="#brief" className="transition-opacity hover:opacity-70">{content.branding.navContact}</a></nav><LanguageSwitcher compact /><button type="button" onClick={() => setMenuOpen((value) => !value)} aria-label={menuOpen ? ui.menuClose : ui.menuOpen} aria-expanded={menuOpen} className="grid h-10 w-10 place-items-center rounded-full border border-[#d7e2ea]/50 text-[#d7e2ea] sm:hidden">{menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}</button></div>{menuOpen && <nav className="mx-6 mt-4 flex flex-col gap-4 rounded-2xl border border-white/15 bg-[#161616]/95 p-5 font-mono text-xs uppercase tracking-[.14em] sm:hidden"><a href="#about" onClick={() => setMenuOpen(false)}>{content.branding.navAbout}</a><a href="#services" onClick={() => setMenuOpen(false)}>{content.branding.navServices}</a><a href="#projects" onClick={() => setMenuOpen(false)}>{content.branding.navProjects}</a><a href="#brief" onClick={() => setMenuOpen(false)} className="text-[#53e0cf]">{content.branding.navContact}</a></nav>}</header>

    <main>
      <section id="top" className="relative flex min-h-[100svh] flex-col overflow-hidden"><div className="hero-noise pointer-events-none absolute inset-0" /><div className="hero-glow pointer-events-none absolute left-1/2 top-[38%] h-[42vw] w-[42vw] min-h-64 min-w-64 -translate-x-1/2 -translate-y-1/2 rounded-full" /><MagneticAvatar src={avatarUrl} /><div className="pointer-events-none relative z-20 mx-auto flex w-full max-w-[1600px] flex-1 flex-col px-6 pt-24 sm:px-10 sm:pt-28 md:pt-28 lg:pt-32"><FadeIn className="pointer-events-auto overflow-hidden" delay={0.12}><h1 className="hero-heading whitespace-normal font-display text-[5.75vw] font-semibold leading-[.78] tracking-[-.07em] sm:text-[6.25vw] md:text-[6.5vw] lg:text-[7vw]"><span className="hero-greeting">{content.hero.lineOne}</span><br /><span className="hero-subline"><span className="hero-verb">{content.hero.lineTwo}</span>{" "}{rotatesHeroPhrase ? <RotatingHeroPhrase fallback={heroPhrase} phrases={rotatingHeroWords} /> : content.hero.lineThree}</span></h1></FadeIn><div className="hero-sidecar-row mt-auto flex justify-end pb-7 sm:pb-10"><div className="hero-sidecar pointer-events-auto relative z-20 flex max-w-[270px] flex-col items-end gap-5 text-right sm:max-w-[320px]"><FadeIn delay={0.3} className="hero-note">{content.hero.note}</FadeIn><FadeIn delay={0.45}><a href="#brief" className="contact-button">{content.hero.ctaLabel} <ArrowDownRight className="h-4 w-4" /></a></FadeIn></div></div></div></section>

      <section id="site-storefront" className="site-storefront relative overflow-hidden px-5 pb-16 pt-20 sm:px-8 sm:pb-24 sm:pt-28"><div className="site-storefront__glow pointer-events-none absolute -left-24 top-20 h-72 w-72 rounded-full" /><div className="site-storefront__glow site-storefront__glow--right pointer-events-none absolute -right-24 bottom-0 h-80 w-80 rounded-full" /><div className="relative mx-auto max-w-6xl"><FadeIn><p className="font-mono text-[10px] uppercase tracking-[.18em] text-[#55c7bd]">{ui.storefrontKicker}</p><div className="mt-4 flex flex-col justify-between gap-5 sm:flex-row sm:items-end"><h2 className="site-storefront__title">{ui.storefrontTitle}<br /><span>{ui.storefrontTitleAccent}</span></h2><p className="max-w-sm text-sm leading-6 text-[#b6afc0]">{ui.storefrontDescription}</p></div></FadeIn><div className="site-storefront__grid mt-10 sm:mt-14">{projects.map((work, index) => <StorefrontSiteCard key={`store-${work.number}-${index}`} work={work} index={index} onRequest={setInquiryWork} ui={ui} previewSrc={avatarUrl} />)}</div></div></section>

      <section id="about" className="about-portrait relative isolate min-h-[110svh] overflow-hidden bg-[#edeef5] px-5 py-7 text-[#17171a] sm:min-h-[118svh] sm:px-8 sm:py-10 md:px-12"><motion.video initial={reduced ? false : { clipPath: "inset(0 100% 0 0)", x: "-10%" }} whileInView={reduced ? undefined : { clipPath: "inset(0 0% 0 0)", x: "0%" }} viewport={{ once: true, amount: 0.2 }} transition={{ duration: 1.1, ease: [0.22, 1, 0.36, 1] }} autoPlay loop muted playsInline preload="metadata" className="about-portrait-video pointer-events-none absolute inset-x-0 top-[16vh] z-0 h-[92svh] w-full object-contain">{aboutVideoUrl ? <source src={aboutVideoUrl} /> : null}</motion.video><div className="about-portrait-mask pointer-events-none absolute inset-0 z-[1]" /><div className="relative z-10 mx-auto flex min-h-[calc(110svh-3.5rem)] max-w-[1600px] flex-col sm:min-h-[calc(118svh-5rem)]"><motion.div initial={reduced ? false : { opacity: 0, y: -18 }} whileInView={reduced ? undefined : { opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6, ease: serviceEase }} className="flex items-center justify-between gap-4"><p className="font-mono text-[9px] font-semibold uppercase tracking-[.16em]">{content.about.eyebrow}</p><span className="rounded-full border border-black/15 bg-white/60 px-3 py-1.5 font-mono text-[8px] font-semibold uppercase tracking-[.14em] backdrop-blur-sm">{content.about.tag}</span></motion.div><div className="mt-14 max-w-3xl sm:mt-20 md:ml-[8%]"><motion.h2 initial={reduced ? false : { opacity: 0, y: 22 }} whileInView={reduced ? undefined : { opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.3 }} transition={{ delay: 0.18, duration: 0.75, ease: serviceEase }} className="font-display text-[clamp(3rem,8.5vw,8.5rem)] font-semibold leading-[.79] tracking-[-.07em]">{content.about.lineOne}<br />{content.about.lineTwo} <span className="text-[#0d9488]">{content.about.accentWord}</span><br />{content.about.lineThree}</motion.h2></div><motion.div initial={reduced ? false : { opacity: 0, y: 26 }} whileInView={reduced ? undefined : { opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.2 }} transition={{ delay: 0.38, duration: 0.7, ease: serviceEase }} className="about-copy-card mt-auto grid gap-5 p-5 sm:max-w-xl sm:p-7 md:ml-auto"><p className="text-sm font-medium leading-relaxed text-black/72 sm:text-base">{content.about.description}</p><a href="#brief" className="about-portrait-cta">{content.about.ctaLabel} <ArrowUpRight className="h-4 w-4" /></a></motion.div></div></section>

      <ServiceShowcase content={content} videoUrl={servicesVideoUrl} />

      <section id="projects" className="projects-section relative z-20 -mt-10 rounded-t-[42px] bg-[#0c0c0c] px-5 pb-16 pt-24 sm:-mt-14 sm:rounded-t-[60px] sm:px-8 sm:pt-32"><div className="mx-auto max-w-6xl"><FadeIn><p className="font-mono text-[10px] uppercase tracking-[.18em] text-[#9da9b2]">{ui.projectsKicker}</p><h2 className="hero-heading mt-5 font-display text-[clamp(3.5rem,11vw,9.6rem)] font-semibold leading-[.77] tracking-[-.07em]">{content.branding.navProjects}</h2></FadeIn><div className="project-portfolio-stack mt-12">{projects.map((work, index) => <ProjectStackCard key={`${work.number}-${index}`} index={index} work={work} ui={ui} previewSrc={avatarUrl} />)}</div></div></section>

      <section className="closing-section relative overflow-hidden bg-[#0c0c0c] px-5 pb-24 pt-8 sm:px-8"><div className="mx-auto flex max-w-6xl flex-col items-start justify-between gap-8 border-t border-[#d7e2ea]/20 pt-9 sm:flex-row sm:items-end"><div><p className="font-mono text-[10px] uppercase tracking-[.18em] text-[#9da9b2]">{content.closing.eyebrow}</p><h2 className="mt-4 max-w-3xl font-display text-[clamp(2.8rem,7vw,6.4rem)] font-semibold leading-[.8] tracking-[-.06em] text-[#d7e2ea]">{content.closing.lineOne}<br />{content.closing.lineTwo}</h2></div><a href={content.company.telegramUrl || "#brief"} target={content.company.telegramUrl ? "_blank" : undefined} rel={content.company.telegramUrl ? "noreferrer" : undefined} className="contact-button shrink-0">{content.closing.ctaLabel} <ArrowDownRight className="h-4 w-4" /></a></div></section>

      <BriefApplication />
      {inquiryWork && <SiteInquiryDialog work={inquiryWork} open={Boolean(inquiryWork)} onOpenChange={(open) => { if (!open) setInquiryWork(null); }} />}
    </main>

    <footer className="border-t border-[#d7e2ea]/10 bg-[#0c0c0c] px-6 py-9 sm:px-10"><div className="mx-auto grid max-w-[1600px] gap-8 lg:grid-cols-[1.2fr_.8fr_auto] lg:items-end"><div><p className="font-display text-sm font-black uppercase tracking-[-.06em] text-[#d7e2ea]">{content.branding.siteName}</p><p className="mt-2 max-w-md text-xs leading-5 text-[#8c969e]">{content.branding.footerNote}</p><div className="mt-4 space-y-1.5 text-xs leading-5 text-[#c9c1d1]"><p>{content.company.companyName}</p>{content.company.taxId && <p>{content.company.taxId}</p>}{content.company.legalLine && <p className="text-[#8c8494]">{content.company.legalLine}</p>}</div></div><div><p className="font-mono text-[9px] font-semibold uppercase tracking-[.14em] text-[#ad9db9]">{ui.contacts}</p><div className="mt-3 flex flex-wrap gap-2"><a href={`tel:${content.company.phone.replace(/[^+\d]/g, "")}`} className="footer-contact-link"><Phone className="h-3.5 w-3.5" />{content.company.phone}</a><a href={`mailto:${content.company.email}`} className="footer-contact-link"><Mail className="h-3.5 w-3.5" />{ui.emailLabel}</a>{content.company.whatsappUrl && <a href={content.company.whatsappUrl} target="_blank" rel="noreferrer" className="footer-contact-link"><MessageCircle className="h-3.5 w-3.5" />{ui.whatsappLabel}</a>}{content.company.telegramUrl && <a href={content.company.telegramUrl} target="_blank" rel="noreferrer" className="footer-contact-link"><Send className="h-3.5 w-3.5" />{ui.telegramLabel}</a>}</div><button type="button" onClick={() => setPrivacyOpen(true)} className="mt-4 inline-flex items-center gap-2 text-xs text-[#9deee2] transition hover:text-white"><ShieldCheck className="h-3.5 w-3.5" />{ui.privacy}</button></div><p className="font-mono text-[9px] uppercase tracking-[.14em] text-[#8c969e]">© {new Date().getFullYear()} / {content.branding.siteName}</p></div></footer>
    <CookieConsent />
    <Dialog open={privacyOpen} onOpenChange={setPrivacyOpen}><DialogContent className="max-h-[calc(100svh-2rem)] max-w-2xl overflow-y-auto border-white/10 bg-[#121015] p-5 text-white sm:p-7"><DialogHeader><DialogTitle className="font-display text-3xl font-semibold tracking-[-.06em]">{ui.privacyTitle}</DialogTitle><DialogDescription className="text-[#aaa2b6]">{ui.privacyDescription}</DialogDescription></DialogHeader><div className="mt-4 space-y-5 text-sm leading-7 text-[#ddd5e4]"><p>{content.company.privacyPolicy}</p><div className="rounded-2xl border border-white/10 bg-[#19161e] p-4"><p className="font-mono text-[9px] font-semibold uppercase tracking-[.14em] text-[#a79eaf]">{ui.privacyAdmin}</p><p className="mt-2 text-white">{content.company.companyName}</p>{content.company.taxId && <p className="text-[#c8bfce]">{content.company.taxId}</p>}<a href={`mailto:${content.company.email}`} className="mt-3 inline-flex text-[#8de9dc] hover:text-white">{content.company.email}</a></div></div></DialogContent></Dialog>
  </div>;
}
