import BriefApplication from "@/components/BriefApplication";
import { ArrowDownRight, ArrowUpRight, ChevronDown, ExternalLink, Menu, Sparkles, X } from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { creatorPreviewLabels, portfolioWorks } from "./portfolioContent";

function FadeIn({ children, delay = 0, className = "" }: { children: React.ReactNode; delay?: number; className?: string }) {
  const reduced = useReducedMotion();
  return <motion.div initial={reduced ? false : { opacity: 0, y: 28 }} whileInView={reduced ? undefined : { opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.16 }} transition={{ duration: 0.72, delay, ease: [0.25, 0.1, 0.25, 1] }} className={className}>{children}</motion.div>;
}

function MagneticAvatar() {
  const reduced = useReducedMotion();
  const imageRef = useRef<HTMLImageElement>(null);

  const move = (event: React.PointerEvent<HTMLDivElement>) => {
    if (reduced || !imageRef.current) return;
    const box = event.currentTarget.getBoundingClientRect();
    const x = ((event.clientX - box.left) / box.width - 0.5) * 22;
    const y = ((event.clientY - box.top) / box.height - 0.5) * 22;
    imageRef.current.style.transform = `translate3d(${x}px, ${y}px, 0) rotate(${x * 0.08}deg)`;
  };

  const reset = () => { if (imageRef.current) imageRef.current.style.transform = "translate3d(0, 0, 0) rotate(0deg)"; };

  return <div onPointerMove={move} onPointerLeave={reset} className="avatar-stage absolute bottom-0 left-1/2 z-10 h-[69%] w-[min(72vw,570px)] -translate-x-1/2 sm:h-[75%] sm:w-[min(60vw,640px)]" aria-label="Интерактивный 3D-объект"><img ref={imageRef} src="/manus-storage/creator-avatar_e02226c5.webp" alt="Стилизованный 3D-портрет создателя сайта" className="avatar-image h-full w-full object-contain object-bottom" /></div>;
}

function AnimatedText({ text }: { text: string }) {
  return <p className="about-reveal mx-auto max-w-2xl text-center text-[clamp(1.08rem,2vw,1.45rem)] font-medium leading-relaxed text-[#d7e2ea]">{Array.from(text).map((character, index) => <motion.span key={`${character}-${index}`} initial={{ opacity: 0.22 }} whileInView={{ opacity: 1 }} viewport={{ once: true, amount: 0.4 }} transition={{ duration: 0.35, delay: Math.min(index * 0.012, 0.6) }}>{character}</motion.span>)}</p>;
}

function ProjectStackCard({ index, work }: { index: number; work: (typeof portfolioWorks)[number] }) {
  const targetScale = 1 - (portfolioWorks.length - 1 - index) * 0.035;
  return <div className="project-sticky h-[78vh] sm:h-[84vh]" style={{ top: `${96 + index * 28}px` }}><motion.article initial={{ opacity: 0, y: 34 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.24 }} transition={{ duration: 0.65, ease: [0.25, 0.1, 0.25, 1] }} className="project-sheet h-full" style={{ scale: targetScale }}><div className="flex flex-wrap items-start justify-between gap-4"><div className="flex min-w-0 items-center gap-4 sm:gap-7"><span className="font-display text-[clamp(3rem,8vw,7rem)] font-black leading-none tracking-[-0.1em] text-[#d7e2ea]">{work.number}</span><div><p className="font-mono text-[10px] uppercase tracking-[0.17em] text-[#9faab4]">{work.category}</p><h3 className="mt-2 font-display text-2xl font-black uppercase tracking-[-0.07em] text-white sm:text-4xl">{work.name}</h3></div></div>{work.url ? <a href={work.url} target="_blank" rel="noreferrer" className="live-button">Открыть сайт <ExternalLink className="h-4 w-4" /></a> : <span className="live-button live-button--muted">Ссылка появится <ArrowUpRight className="h-4 w-4" /></span>}</div><div className={`project-art project-art--${work.visual} mt-5 grid h-[calc(100%-130px)] grid-cols-[.7fr_1fr] gap-3 sm:mt-8`}><div className="grid grid-rows-2 gap-3"><div className="project-art__tile project-art__tile--a"><span>{work.number}</span><b>visual<br />direction</b></div><div className="project-art__tile project-art__tile--b"><i /><i /><i /></div></div><div className="project-art__tile project-art__tile--hero"><em>future<br />on<br />screen</em><span className="project-art__orb" /><small>case / {String(index + 1).padStart(2, "0")}</small></div></div></motion.article></div>;
}

export default function Home() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [marqueeOffset, setMarqueeOffset] = useState(0);
  const marqueeRef = useRef<HTMLElement>(null);
  const reduced = useReducedMotion();

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

  return <div className="creator-shell min-h-screen overflow-x-clip bg-[#0c0c0c] text-[#d7e2ea]">
    <header className="creator-nav absolute inset-x-0 top-0 z-30"><div className="mx-auto flex max-w-[1600px] items-center justify-between px-6 pt-6 sm:px-10 sm:pt-8"><a href="#top" className="font-display text-sm font-black uppercase tracking-[-0.06em] text-[#d7e2ea]">site<br />maker</a><nav className="hidden items-center gap-8 font-medium uppercase tracking-wider text-[#d7e2ea] sm:flex sm:text-sm lg:gap-12 lg:text-lg"><a href="#about" className="transition-opacity hover:opacity-70">Обо мне</a><a href="#services" className="transition-opacity hover:opacity-70">Услуги</a><a href="#projects" className="transition-opacity hover:opacity-70">Проекты</a><a href="#brief" className="transition-opacity hover:opacity-70">Контакт</a></nav><button type="button" onClick={() => setMenuOpen((value) => !value)} aria-label={menuOpen ? "Закрыть меню" : "Открыть меню"} aria-expanded={menuOpen} className="grid h-10 w-10 place-items-center rounded-full border border-[#d7e2ea]/50 text-[#d7e2ea] sm:hidden">{menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}</button></div>{menuOpen && <nav className="mx-6 mt-4 flex flex-col gap-4 rounded-2xl border border-white/15 bg-[#161616]/95 p-5 font-mono text-xs uppercase tracking-[.14em] sm:hidden"><a href="#about" onClick={() => setMenuOpen(false)}>Обо мне</a><a href="#services" onClick={() => setMenuOpen(false)}>Услуги</a><a href="#projects" onClick={() => setMenuOpen(false)}>Проекты</a><a href="#brief" onClick={() => setMenuOpen(false)} className="text-[#f2b1ff]">Начать с брифа</a></nav>}</header>

    <main>
      <section id="top" className="relative flex min-h-screen flex-col overflow-hidden"><div className="hero-noise pointer-events-none absolute inset-0" /><div className="hero-glow pointer-events-none absolute left-1/2 top-[38%] h-[42vw] w-[42vw] min-h-64 min-w-64 -translate-x-1/2 -translate-y-1/2 rounded-full" /><MagneticAvatar /><div className="pointer-events-none relative z-20 mx-auto flex w-full max-w-[1600px] flex-1 flex-col px-6 pt-28 sm:px-10 sm:pt-36"><FadeIn className="pointer-events-auto overflow-hidden" delay={0.12}><h1 className="hero-heading whitespace-nowrap font-display text-[14vw] font-black uppercase leading-[.8] tracking-[-0.12em] sm:text-[15vw] md:-mt-4 md:text-[16vw] lg:text-[17.5vw]">Привет,<br />я <span>создаю</span><br />сайты</h1></FadeIn><div className="mt-auto flex items-end justify-between gap-5 pb-7 sm:pb-10"><FadeIn delay={0.3} className="pointer-events-auto relative z-20 max-w-[160px] text-[clamp(.72rem,1.4vw,1.25rem)] font-light uppercase leading-snug tracking-wide text-[#d7e2ea] sm:max-w-[260px]">Дизайн и разработка сайтов, которые хочется рассматривать и открывать снова.</FadeIn><FadeIn delay={0.45} className="pointer-events-auto relative z-20"><a href="#brief" className="contact-button">Обсудить проект <ArrowDownRight className="h-4 w-4" /></a></FadeIn></div></div></section>

      <section ref={marqueeRef} className="marquee-section overflow-hidden bg-[#0c0c0c] pb-10 pt-24 sm:pt-32"><div className="marquee-row gap-3" style={{ transform: `translate3d(${marqueeOffset - 260}px, 0, 0)` }}>{[...creatorPreviewLabels, ...creatorPreviewLabels, ...creatorPreviewLabels].map((label, index) => <div key={`first-${index}`} className={`marquee-card marquee-card--${index % 5}`}><span>{label}</span><b>{String(index + 1).padStart(2, "0")}</b><i /></div>)}</div><div className="marquee-row mt-3 gap-3" style={{ transform: `translate3d(${-marqueeOffset + 80}px, 0, 0)` }}>{[...creatorPreviewLabels.slice().reverse(), ...creatorPreviewLabels.slice().reverse(), ...creatorPreviewLabels.slice().reverse()].map((label, index) => <div key={`second-${index}`} className={`marquee-card marquee-card--${(index + 2) % 5}`}><span>{label}</span><b>{String(index + 11).padStart(2, "0")}</b><i /></div>)}</div></section>

      <section id="about" className="about-section relative grid min-h-screen place-items-center overflow-hidden px-5 py-24 sm:px-8"><div className="about-symbol about-symbol--moon">◔</div><div className="about-symbol about-symbol--cube">✦</div><div className="about-symbol about-symbol--lego">▦</div><div className="about-symbol about-symbol--orb">◌</div><div className="relative z-10 flex max-w-4xl flex-col items-center"><FadeIn><p className="font-mono text-[10px] uppercase tracking-[.18em] text-[#9da9b2]">Сайт под ключ / от замысла до запуска</p><h2 className="hero-heading mt-6 text-center font-display text-[clamp(3.2rem,11vw,9.8rem)] font-black uppercase leading-[.82] tracking-[-.11em]">Обо мне</h2></FadeIn><div className="mt-12 sm:mt-16"><AnimatedText text="Я превращаю идею в сайт с характером: собираю структуру, создаю сильный визуальный язык и довожу проект до уверенного запуска. Вам не нужно разбираться в технических деталях — на каждом этапе будет понятный результат и следующий шаг." /></div><a href="#brief" className="contact-button mt-14 sm:mt-20">Заполнить бриф <ArrowDownRight className="h-4 w-4" /></a></div></section>

      <section id="services" className="services-section relative z-10 rounded-t-[42px] bg-white px-5 py-20 text-[#0c0c0c] sm:rounded-t-[60px] sm:px-8 sm:py-28"><div className="mx-auto max-w-6xl"><FadeIn><h2 className="text-center font-display text-[clamp(3.4rem,11vw,9.6rem)] font-black uppercase leading-[.82] tracking-[-.11em]">Услуги</h2></FadeIn><div className="mt-16 border-t border-black/15 sm:mt-24">{[["01", "Стратегия", "Разбираем задачу, аудиторию, сценарии пользователя и смысл первого впечатления от сайта."], ["02", "Дизайн", "Создаю выразительный визуальный язык, сетку, типографику и адаптивные экраны."], ["03", "Разработка", "Собираю быстрый сайт с анимациями, формами и нужными интеграциями."], ["04", "Запуск", "Подключаю домен, проверяю мобильную версию, базовое SEO и путь заявки."], ["05", "Передача", "Передаю исходники, доступы и понятную инструкцию по дальнейшему управлению."]].map(([number, title, text], index) => <FadeIn key={number} delay={index * 0.06}><article className="service-item grid gap-4 border-b border-black/15 py-8 sm:grid-cols-[minmax(90px,.23fr)_1fr] sm:gap-8 sm:py-11"><span className="font-display text-[clamp(3.2rem,8vw,7.2rem)] font-black leading-none tracking-[-.11em]">{number}</span><div className="pt-1"><h3 className="font-display text-[clamp(1.05rem,2.2vw,2rem)] font-black uppercase tracking-[-.06em]">{title}</h3><p className="mt-3 max-w-2xl text-[clamp(.9rem,1.6vw,1.2rem)] leading-relaxed text-black/60">{text}</p></div></article></FadeIn>)}</div></div></section>

      <section id="projects" className="projects-section relative z-20 -mt-10 rounded-t-[42px] bg-[#0c0c0c] px-5 pb-16 pt-24 sm:-mt-14 sm:rounded-t-[60px] sm:px-8 sm:pt-32"><div className="mx-auto max-w-6xl"><FadeIn><p className="font-mono text-[10px] uppercase tracking-[.18em] text-[#9da9b2]">Ваша коллекция опубликованных работ</p><h2 className="hero-heading mt-5 font-display text-[clamp(3.5rem,11vw,9.6rem)] font-black uppercase leading-[.82] tracking-[-.11em]">Проекты</h2></FadeIn><div className="mt-12">{portfolioWorks.map((work, index) => <ProjectStackCard key={work.number} index={index} work={work} />)}</div></div></section>

      <section className="closing-section relative overflow-hidden bg-[#0c0c0c] px-5 pb-24 pt-8 sm:px-8"><div className="mx-auto flex max-w-6xl flex-col items-start justify-between gap-8 border-t border-[#d7e2ea]/20 pt-9 sm:flex-row sm:items-end"><div><p className="font-mono text-[10px] uppercase tracking-[.18em] text-[#9da9b2]">Есть идея? Соберём её в рабочий сайт.</p><h2 className="mt-4 max-w-3xl font-display text-[clamp(2.8rem,7vw,6.4rem)] font-black uppercase leading-[.86] tracking-[-.1em] text-[#d7e2ea]">Пора сделать<br />что-то заметное.</h2></div><a href="#brief" className="contact-button shrink-0">Начать <ArrowDownRight className="h-4 w-4" /></a></div></section>

      <BriefApplication />
    </main>

    <footer className="border-t border-[#d7e2ea]/10 bg-[#0c0c0c] px-6 py-9 sm:px-10"><div className="mx-auto flex max-w-[1600px] items-end justify-between gap-4"><p className="font-display text-sm font-black uppercase tracking-[-.06em] text-[#d7e2ea]">site<br />maker</p><p className="font-mono text-[9px] uppercase tracking-[.14em] text-[#8c969e]">© {new Date().getFullYear()} / web direction</p></div></footer>
  </div>;
}
