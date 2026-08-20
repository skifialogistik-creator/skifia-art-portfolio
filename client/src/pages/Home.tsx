import BriefApplication from "@/components/BriefApplication";
import { ArrowDownRight, ArrowUpRight, ChevronDown, ExternalLink, Menu, Sparkles, X } from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { creatorPreviewLabels, portfolioWorks } from "./portfolioContent";
import { trpc } from "@/lib/trpc";
import { defaultSiteContent, type SiteContent } from "@shared/siteContent";
import { resolvePublicMediaUrls } from "@shared/siteMedia";

function FadeIn({ children, delay = 0, className = "" }: { children: React.ReactNode; delay?: number; className?: string }) {
  const reduced = useReducedMotion();
  return <motion.div initial={reduced ? false : { opacity: 0, y: 28 }} whileInView={reduced ? undefined : { opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.16 }} transition={{ duration: 0.72, delay, ease: [0.25, 0.1, 0.25, 1] }} className={className}>{children}</motion.div>;
}

function MagneticAvatar({ src }: { src: string }) {
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

  return <div onPointerMove={move} onPointerLeave={reset} className="avatar-stage absolute bottom-0 left-1/2 z-10 h-[69%] w-[min(72vw,570px)] -translate-x-1/2 sm:h-[75%] sm:w-[min(60vw,640px)]" aria-label="Интерактивный 3D-объект"><span className="avatar-halo" aria-hidden="true" /><motion.div animate={reduced ? undefined : { y: [0, -12, 0], rotate: [0, 0.8, 0], scale: [1, 1.018, 1] }} transition={{ duration: 3.6, repeat: Infinity, ease: "easeInOut" }} className="avatar-float h-full w-full"><img ref={imageRef} src={src} alt="Стилизованный 3D-портрет создателя сайта" className="avatar-image h-full w-full object-contain object-bottom" /></motion.div></div>;
}

function AnimatedText({ text }: { text: string }) {
  return <p className="about-reveal mx-auto max-w-2xl text-center text-[clamp(1.08rem,2vw,1.45rem)] font-medium leading-relaxed text-[#d7e2ea]">{Array.from(text).map((character, index) => <motion.span key={`${character}-${index}`} initial={{ opacity: 0.22 }} whileInView={{ opacity: 1 }} viewport={{ once: true, amount: 0.4 }} transition={{ duration: 0.35, delay: Math.min(index * 0.012, 0.6) }}>{character}</motion.span>)}</p>;
}

function ProjectStackCard({ index, total, work }: { index: number; total: number; work: SiteContent["projects"][number] }) {
  const targetScale = 1 - (total - 1 - index) * 0.035;
  return <div className="project-sticky h-[78vh] sm:h-[84vh]" style={{ top: `${96 + index * 28}px` }}><motion.article initial={{ opacity: 0, y: 34 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.24 }} transition={{ duration: 0.65, ease: [0.25, 0.1, 0.25, 1] }} className="project-sheet h-full" style={{ scale: targetScale }}><div className="flex flex-wrap items-start justify-between gap-4"><div className="flex min-w-0 items-center gap-4 sm:gap-7"><span className="font-display text-[clamp(3rem,8vw,7rem)] font-semibold leading-none tracking-[-.07em] text-[#d7e2ea]">{work.number}</span><div><p className="font-mono text-[10px] uppercase tracking-[0.17em] text-[#9faab4]">{work.category}</p><h3 className="mt-2 font-display text-2xl font-semibold tracking-[-.04em] text-white sm:text-4xl">{work.name}</h3></div></div>{work.url ? <a href={work.url} target="_blank" rel="noreferrer" className="live-button">Открыть сайт <ExternalLink className="h-4 w-4" /></a> : <span className="live-button live-button--muted">Ссылка появится <ArrowUpRight className="h-4 w-4" /></span>}</div><div className={`project-art project-art--${work.visual} mt-5 grid h-[calc(100%-130px)] grid-cols-[.7fr_1fr] gap-3 sm:mt-8`}><div className="grid grid-rows-2 gap-3"><div className="project-art__tile project-art__tile--a"><span>{work.number}</span><b>visual<br />direction</b></div><div className="project-art__tile project-art__tile--b"><i /><i /><i /></div></div><div className="project-art__tile project-art__tile--hero"><em>future<br />on<br />screen</em><span className="project-art__orb" /><small>case / {String(index + 1).padStart(2, "0")}</small></div></div></motion.article></div>;
}

const serviceEase: [number, number, number, number] = [0.22, 1, 0.36, 1];

function ServiceShowcase({ content, videoUrl }: { content: SiteContent; videoUrl: string }) {
  const reduced = useReducedMotion();
  const fadeUp = (delay: number) => ({ initial: reduced ? false : { opacity: 0, y: 32 }, whileInView: reduced ? undefined : { opacity: 1, y: 0 }, viewport: { once: true, amount: 0.2 }, transition: { delay, duration: 0.6, ease: serviceEase } });
  const serviceStats = [["01", content.services.statOneLabel], ["02", content.services.statTwoLabel], ["03", content.services.statThreeLabel]];
  const serviceWords = [content.services.headlineOne, content.services.headlineTwo, content.services.headlineThree];

  return <section id="services" className="services-showcase relative z-10 isolate min-h-screen overflow-hidden rounded-t-[42px] bg-[#cbb5f0] px-5 py-6 text-[#201529] sm:rounded-t-[60px] sm:px-8 sm:py-8 md:px-12">
    <video className="services-video pointer-events-none absolute inset-0 -z-20 h-full w-full object-cover" autoPlay loop muted playsInline preload="metadata" aria-hidden="true"><source src={videoUrl} /></video>
    <div className="services-wash pointer-events-none absolute inset-0 -z-10" />
    <div className="mx-auto flex min-h-[calc(100svh-3rem)] max-w-[1600px] flex-col sm:min-h-[calc(100svh-4rem)]">
      <div className="grid grid-cols-[1fr_auto] items-center gap-4"><motion.div {...fadeUp(0)} className="flex items-center gap-3"><span className="grid h-8 w-8 place-items-center rounded-full border-2 border-[#5e0ed7]"><i className="h-2.5 w-2.5 rounded-full bg-[#5e0ed7]" /></span><span className="font-mono text-[9px] font-semibold uppercase tracking-[.17em]">{content.services.eyebrow}</span></motion.div><motion.a {...fadeUp(0.2)} href={content.company.telegramUrl || "#brief"} target={content.company.telegramUrl ? "_blank" : undefined} rel={content.company.telegramUrl ? "noreferrer" : undefined} className="services-primary-cta">{content.services.ctaLabel} <ArrowUpRight className="h-4 w-4" /></motion.a></div>
      <div className="relative z-10 flex flex-1 items-center justify-end py-10 sm:py-12"><div className="grid grid-cols-3 gap-4 text-right sm:gap-8 md:gap-12">{serviceStats.map(([number, label], index) => <motion.div key={number} {...fadeUp(0.24 + index * 0.12)}><p className="font-display text-[clamp(2.2rem,5vw,4.4rem)] font-semibold leading-none tracking-[-.1em]"><span className="mr-1 align-top text-[.4em] text-[#5e0ed7]">+</span>{number}</p><p className="mt-2 whitespace-pre-line font-mono text-[8px] font-semibold leading-tight tracking-[.12em] sm:text-[10px]">{label}</p></motion.div>)}</div></div>
      <div className="grid gap-7 pb-4 sm:gap-10 md:grid-cols-[minmax(250px,.54fr)_1fr] md:items-end md:pb-7"><motion.div initial={reduced ? false : { opacity: 0, y: 20, filter: "blur(5px)" }} whileInView={reduced ? undefined : { opacity: 1, y: 0, filter: "blur(0px)" }} viewport={{ once: true, amount: 0.25 }} transition={{ delay: 0.58, duration: 0.64, ease: serviceEase }} className="services-annotation"><div className="services-annotation__item"><span>01</span><p>{content.services.annotationOne}</p></div><div className="services-annotation__item"><span>02</span><p>{content.services.annotationTwo}</p></div></motion.div><div className="flex items-end justify-end"><h2 className="text-right font-display text-[clamp(2.7rem,8.7vw,8.8rem)] font-semibold leading-[.77] tracking-[-.07em]">{serviceWords.map((word, index) => <span key={`${word}-${index}`} className="services-word block overflow-hidden"><motion.span initial={reduced ? false : { y: "112%" }} whileInView={reduced ? undefined : { y: 0 }} viewport={{ once: true, amount: 0.25 }} transition={{ delay: 0.38 + index * 0.14, duration: 0.7, ease: serviceEase }} className="block">{word}</motion.span></span>)}</h2></div></div>
    </div>
  </section>;
}

export default function Home() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [marqueeOffset, setMarqueeOffset] = useState(0);
  const marqueeRef = useRef<HTMLElement>(null);
  const reduced = useReducedMotion();
  const { data: storedContent } = trpc.siteContent.public.useQuery(undefined, { staleTime: 60_000, refetchOnWindowFocus: false });
  const { data: mediaAssets } = trpc.media.public.useQuery(undefined, { staleTime: 60_000, refetchOnWindowFocus: false });
  const content = storedContent ?? defaultSiteContent;
  const { avatar: avatarUrl, servicesVideo: servicesVideoUrl, aboutVideo: aboutVideoUrl } = resolvePublicMediaUrls(mediaAssets);

  useEffect(() => {
    if (reduced) return;
    const onScroll = () => {
      if (!marqueeRef.current) return;
      const top = marqueeRef.current.getBoundingClientRect().top + window.scrollY;
      setMarqueeOffset((window.scrollY - top + window.innerHeight) * 0.16);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [reduced]);

  useEffect(() => { document.title = content.branding.siteName; }, [content.branding.siteName]);

  useEffect(() => {
    const sectionId = window.location.hash.replace("#", "") || new URLSearchParams(window.location.search).get("section") || "";
    if (!sectionId) return;
    const timeout = window.setTimeout(() => document.getElementById(sectionId)?.scrollIntoView({ behavior: "auto", block: "start" }), 0);
    return () => window.clearTimeout(timeout);
  }, []);

  return <div className="creator-shell min-h-screen overflow-x-clip bg-[#0c0c0c] text-[#d7e2ea]">
    <header className="creator-nav absolute inset-x-0 top-0 z-30"><div className="mx-auto flex max-w-[1600px] items-center justify-between px-6 pt-6 sm:px-10 sm:pt-8"><a href="#top" className="font-display text-sm font-black uppercase tracking-[-0.06em] text-[#d7e2ea]">{content.branding.siteName}</a><nav className="hidden items-center gap-8 font-medium uppercase tracking-wider text-[#d7e2ea] sm:flex sm:text-sm lg:gap-12 lg:text-lg"><a href="#about" className="transition-opacity hover:opacity-70">{content.branding.navAbout}</a><a href="#services" className="transition-opacity hover:opacity-70">{content.branding.navServices}</a><a href="#projects" className="transition-opacity hover:opacity-70">{content.branding.navProjects}</a><a href="#brief" className="transition-opacity hover:opacity-70">{content.branding.navContact}</a></nav><button type="button" onClick={() => setMenuOpen((value) => !value)} aria-label={menuOpen ? "Закрыть меню" : "Открыть меню"} aria-expanded={menuOpen} className="grid h-10 w-10 place-items-center rounded-full border border-[#d7e2ea]/50 text-[#d7e2ea] sm:hidden">{menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}</button></div>{menuOpen && <nav className="mx-6 mt-4 flex flex-col gap-4 rounded-2xl border border-white/15 bg-[#161616]/95 p-5 font-mono text-xs uppercase tracking-[.14em] sm:hidden"><a href="#about" onClick={() => setMenuOpen(false)}>{content.branding.navAbout}</a><a href="#services" onClick={() => setMenuOpen(false)}>{content.branding.navServices}</a><a href="#projects" onClick={() => setMenuOpen(false)}>{content.branding.navProjects}</a><a href="#brief" onClick={() => setMenuOpen(false)} className="text-[#f2b1ff]">{content.branding.navContact}</a></nav>}</header>

    <main>
      <section id="top" className="relative flex min-h-screen flex-col overflow-hidden"><div className="hero-noise pointer-events-none absolute inset-0" /><div className="hero-glow pointer-events-none absolute left-1/2 top-[38%] h-[42vw] w-[42vw] min-h-64 min-w-64 -translate-x-1/2 -translate-y-1/2 rounded-full" /><MagneticAvatar src={avatarUrl} /><div className="pointer-events-none relative z-20 mx-auto flex w-full max-w-[1600px] flex-1 flex-col px-6 pt-32 sm:px-10 sm:pt-40"><FadeIn className="pointer-events-auto overflow-hidden" delay={0.12}><h1 className="hero-heading whitespace-nowrap font-display text-[5.75vw] font-semibold leading-[.78] tracking-[-.07em] sm:text-[6.25vw] md:text-[6.5vw] lg:text-[7vw]">{content.hero.lineOne}<br />{content.hero.lineTwo.includes("создаю") ? <span>{content.hero.lineTwo}</span> : content.hero.lineTwo}<br />{content.hero.lineThree}</h1></FadeIn><div className="mt-auto flex justify-end pb-7 sm:pb-10"><div className="hero-sidecar pointer-events-auto relative z-20 flex max-w-[270px] flex-col items-end gap-5 text-right sm:max-w-[320px]"><FadeIn delay={0.3} className="hero-note">{content.hero.note}</FadeIn><FadeIn delay={0.45}><a href="#brief" className="contact-button">{content.hero.ctaLabel} <ArrowDownRight className="h-4 w-4" /></a></FadeIn></div></div></div></section>

      <section ref={marqueeRef} className="marquee-section overflow-hidden bg-[#0c0c0c] pb-10 pt-24 sm:pt-32"><div className="marquee-row gap-3" style={{ transform: `translate3d(${marqueeOffset - 260}px, 0, 0)` }}>{[...creatorPreviewLabels, ...creatorPreviewLabels, ...creatorPreviewLabels].map((label, index) => <div key={`first-${index}`} className={`marquee-card marquee-card--${index % 5}`}><span>{label}</span><b>{String(index + 1).padStart(2, "0")}</b><i /></div>)}</div><div className="marquee-row mt-3 gap-3" style={{ transform: `translate3d(${-marqueeOffset + 80}px, 0, 0)` }}>{[...creatorPreviewLabels.slice().reverse(), ...creatorPreviewLabels.slice().reverse(), ...creatorPreviewLabels.slice().reverse()].map((label, index) => <div key={`second-${index}`} className={`marquee-card marquee-card--${(index + 2) % 5}`}><span>{label}</span><b>{String(index + 11).padStart(2, "0")}</b><i /></div>)}</div></section>

      <section id="about" className="about-portrait relative isolate min-h-[110svh] overflow-hidden bg-[#edeef5] px-5 py-7 text-[#17171a] sm:min-h-[118svh] sm:px-8 sm:py-10 md:px-12"><motion.video initial={reduced ? false : { clipPath: "inset(0 100% 0 0)", x: "-10%" }} whileInView={reduced ? undefined : { clipPath: "inset(0 0% 0 0)", x: "0%" }} viewport={{ once: true, amount: 0.2 }} transition={{ duration: 1.1, ease: [0.22, 1, 0.36, 1] }} autoPlay loop muted playsInline preload="metadata" className="about-portrait-video pointer-events-none absolute inset-x-0 top-[16vh] z-0 h-[92svh] w-full object-contain"><source src={aboutVideoUrl} /></motion.video><div className="about-portrait-mask pointer-events-none absolute inset-0 z-[1]" /><div className="relative z-10 mx-auto flex min-h-[calc(110svh-3.5rem)] max-w-[1600px] flex-col sm:min-h-[calc(118svh-5rem)]"><motion.div initial={reduced ? false : { opacity: 0, y: -18 }} whileInView={reduced ? undefined : { opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6, ease: serviceEase }} className="flex items-center justify-between gap-4"><p className="font-mono text-[9px] font-semibold uppercase tracking-[.16em]">{content.about.eyebrow}</p><span className="rounded-full border border-black/15 bg-white/60 px-3 py-1.5 font-mono text-[8px] font-semibold uppercase tracking-[.14em] backdrop-blur-sm">{content.about.tag}</span></motion.div><div className="mt-14 max-w-3xl sm:mt-20 md:ml-[8%]"><motion.h2 initial={reduced ? false : { opacity: 0, y: 22 }} whileInView={reduced ? undefined : { opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.3 }} transition={{ delay: 0.18, duration: 0.75, ease: serviceEase }} className="font-display text-[clamp(3rem,8.5vw,8.5rem)] font-semibold leading-[.79] tracking-[-.07em]">{content.about.lineOne}<br />{content.about.lineTwo} <span className="text-[#5e0ed7]">{content.about.accentWord}</span><br />{content.about.lineThree}</motion.h2></div><motion.div initial={reduced ? false : { opacity: 0, y: 26 }} whileInView={reduced ? undefined : { opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.2 }} transition={{ delay: 0.38, duration: 0.7, ease: serviceEase }} className="about-copy-card mt-auto grid gap-5 p-5 sm:max-w-xl sm:p-7 md:ml-auto"><p className="text-sm font-medium leading-relaxed text-black/72 sm:text-base">{content.about.description}</p><a href="#brief" className="about-portrait-cta">{content.about.ctaLabel} <ArrowUpRight className="h-4 w-4" /></a></motion.div></div></section>

      <ServiceShowcase content={content} videoUrl={servicesVideoUrl} />

      <section id="projects" className="projects-section relative z-20 -mt-10 rounded-t-[42px] bg-[#0c0c0c] px-5 pb-16 pt-24 sm:-mt-14 sm:rounded-t-[60px] sm:px-8 sm:pt-32"><div className="mx-auto max-w-6xl"><FadeIn><p className="font-mono text-[10px] uppercase tracking-[.18em] text-[#9da9b2]">Ваша коллекция опубликованных работ</p><h2 className="hero-heading mt-5 font-display text-[clamp(3.5rem,11vw,9.6rem)] font-semibold leading-[.77] tracking-[-.07em]">{content.branding.navProjects}</h2></FadeIn><div className="mt-12">{content.projects.map((work, index) => <ProjectStackCard key={`${work.number}-${index}`} index={index} total={content.projects.length} work={work} />)}</div></div></section>

      <section className="closing-section relative overflow-hidden bg-[#0c0c0c] px-5 pb-24 pt-8 sm:px-8"><div className="mx-auto flex max-w-6xl flex-col items-start justify-between gap-8 border-t border-[#d7e2ea]/20 pt-9 sm:flex-row sm:items-end"><div><p className="font-mono text-[10px] uppercase tracking-[.18em] text-[#9da9b2]">{content.closing.eyebrow}</p><h2 className="mt-4 max-w-3xl font-display text-[clamp(2.8rem,7vw,6.4rem)] font-semibold leading-[.8] tracking-[-.06em] text-[#d7e2ea]">{content.closing.lineOne}<br />{content.closing.lineTwo}</h2></div><a href={content.company.telegramUrl || "#brief"} target={content.company.telegramUrl ? "_blank" : undefined} rel={content.company.telegramUrl ? "noreferrer" : undefined} className="contact-button shrink-0">{content.closing.ctaLabel} <ArrowDownRight className="h-4 w-4" /></a></div></section>

      <BriefApplication />
    </main>

    <footer className="border-t border-[#d7e2ea]/10 bg-[#0c0c0c] px-6 py-9 sm:px-10"><div className="mx-auto flex max-w-[1600px] flex-col gap-5 sm:flex-row sm:items-end sm:justify-between"><div><p className="font-display text-sm font-black uppercase tracking-[-.06em] text-[#d7e2ea]">{content.branding.siteName}</p><p className="mt-2 max-w-md text-xs leading-5 text-[#8c969e]">{content.branding.footerNote}</p>{(content.company.companyName || content.company.phone || content.company.email || content.company.address) && <p className="mt-3 max-w-lg text-xs leading-5 text-[#c0b9ca]">{[content.company.companyName, content.company.phone, content.company.email, content.company.address].filter(Boolean).join(" · ")}</p>}{content.company.legalLine && <p className="mt-1 text-[10px] text-[#756d80]">{content.company.legalLine}</p>}</div><p className="font-mono text-[9px] uppercase tracking-[.14em] text-[#8c969e]">© {new Date().getFullYear()} / {content.branding.siteName}</p></div></footer>
  </div>;
}
