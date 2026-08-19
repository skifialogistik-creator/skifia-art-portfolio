import BriefApplication from "@/components/BriefApplication";
import {
  ArrowDownRight,
  ArrowUpRight,
  Check,
  CircleArrowDown,
  Code2,
  ExternalLink,
  Layers3,
  Menu,
  MoveUpRight,
  Sparkles,
  X,
} from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";
import { useState } from "react";
import { offerCards, portfolioWorks, processSteps } from "./portfolioContent";

const animation = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0 },
};

function SectionEyebrow({ index, children }: { index: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-3 font-mono text-[10px] font-medium uppercase tracking-[0.2em] text-[#d7c9ff]">
      <span className="grid h-7 w-7 place-items-center rounded-full border border-[#8b65de] bg-[#1b1230] text-[9px] text-[#f5efff]">{index}</span>
      <span>{children}</span>
    </div>
  );
}

function ProjectVisual({ variant }: { variant: "violet" | "lime" | "coral" }) {
  return (
    <div className={`project-visual project-visual--${variant}`} aria-hidden="true">
      <div className="project-visual__window">
        <div className="project-visual__bar"><span /><span /><span /></div>
        <div className="project-visual__nav"><i /> <i /> <i /> <b /></div>
        <div className="project-visual__hero"><div><em>new<br />signal</em><span /></div><aside><i /><i /><i /></aside></div>
        <div className="project-visual__grid"><span /><span /><span /></div>
      </div>
      <span className="project-visual__stamp">WEB / {variant.toUpperCase()}</span>
    </div>
  );
}

export default function Home() {
  const [menuOpen, setMenuOpen] = useState(false);
  const reduceMotion = useReducedMotion();
  const visible = reduceMotion ? { opacity: 1, y: 0 } : undefined;

  return (
    <div className="portfolio-shell min-h-screen overflow-hidden bg-[#0d0b12] text-[#fbf9ff]">
      <header className="portfolio-header sticky top-0 z-50 border-b border-white/10 bg-[#0d0b12]/82 backdrop-blur-xl">
        <div className="mx-auto flex max-w-[1440px] items-center justify-between px-5 py-4 sm:px-8 lg:px-12">
          <a href="#top" className="flex items-center gap-3" aria-label="На главную">
            <span className="grid h-9 w-9 place-items-center rounded-full bg-[#a87cff] font-display text-sm font-black text-[#120c1e]">S</span>
            <span className="font-display text-[13px] font-bold uppercase tracking-[-0.06em]">site<br />maker</span>
          </a>
          <nav className="hidden items-center gap-7 font-mono text-[10px] uppercase tracking-[0.16em] text-[#c8c0d6] lg:flex">
            <a className="transition-colors hover:text-white" href="#works">Работы</a>
            <a className="transition-colors hover:text-white" href="#approach">Подход</a>
            <a className="transition-colors hover:text-white" href="#process">Процесс</a>
          </nav>
          <a href="#brief" className="hidden items-center gap-2 rounded-full bg-[#f3eeff] px-5 py-3 font-mono text-[10px] font-semibold uppercase tracking-[0.14em] text-[#140d21] transition-transform duration-200 hover:-translate-y-0.5 active:scale-[0.97] sm:inline-flex">Заполнить бриф <ArrowDownRight className="h-4 w-4" /></a>
          <button type="button" onClick={() => setMenuOpen((state) => !state)} className="grid h-10 w-10 place-items-center rounded-full border border-white/20 text-white lg:hidden" aria-expanded={menuOpen} aria-label={menuOpen ? "Закрыть меню" : "Открыть меню"}>{menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}</button>
        </div>
        {menuOpen && <nav className="border-t border-white/10 bg-[#15111d] px-5 py-5 font-mono text-xs uppercase tracking-[0.14em] sm:px-8 lg:hidden"><div className="mx-auto flex max-w-[1440px] flex-col gap-4"><a href="#works" onClick={() => setMenuOpen(false)}>Работы</a><a href="#approach" onClick={() => setMenuOpen(false)}>Подход</a><a href="#process" onClick={() => setMenuOpen(false)}>Процесс</a><a href="#brief" onClick={() => setMenuOpen(false)} className="text-[#caaaFF]">Заполнить бриф →</a></div></nav>}
      </header>

      <main>
        <section id="top" className="relative isolate min-h-[calc(100svh-73px)] overflow-hidden px-5 pb-12 pt-9 sm:px-8 sm:pb-16 sm:pt-12 lg:px-12 lg:pt-16">
          <div className="hero-grid pointer-events-none absolute inset-0 -z-10 opacity-60" />
          <div className="orbital-stage pointer-events-none absolute -right-24 top-12 -z-10 h-[450px] w-[450px] sm:right-[4%] sm:top-3 sm:h-[640px] sm:w-[640px]"><span /><i /><b /></div>
          <motion.div initial={reduceMotion ? false : "hidden"} animate={visible ?? "show"} variants={animation} transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }} className="mx-auto flex min-h-[calc(100svh-160px)] max-w-[1440px] flex-col justify-between">
            <div className="grid gap-8 lg:grid-cols-[1.05fr_.95fr] lg:gap-16">
              <div className="pt-4 lg:pt-10"><p className="font-mono text-[10px] uppercase tracking-[0.18em] text-[#cbbdff]">Дизайн + разработка / от идеи до запуска</p><h1 className="mt-8 max-w-5xl font-display text-[clamp(3.25rem,10.4vw,10.6rem)] font-black uppercase leading-[.82] tracking-[-0.11em]">Сайты,<br /><span className="text-gradient">которые</span><br />звучат.</h1></div>
              <div className="hero-panel mt-2 self-end rounded-[2rem] border border-white/13 bg-[#181422]/65 p-5 backdrop-blur-sm sm:mt-24 sm:max-w-[465px] sm:p-7 lg:mb-2"><Sparkles className="h-5 w-5 text-[#b590ff]" /><p className="mt-10 max-w-sm text-lg font-medium leading-7 text-[#e4ddf4]">Создаю характерные сайты для тех, кому важно не просто «быть в интернете», а остаться в памяти.</p><a href="#brief" className="mt-8 inline-flex items-center gap-3 font-mono text-[10px] font-bold uppercase tracking-[0.15em] text-white transition-colors hover:text-[#bc9bff]">Обсудить проект <MoveUpRight className="h-4 w-4" /></a></div>
            </div>
            <div className="mt-12 flex flex-col gap-8 border-t border-white/15 pt-5 sm:mt-20 sm:flex-row sm:items-end sm:justify-between"><div className="flex items-center gap-3 font-mono text-[10px] uppercase tracking-[0.15em] text-[#beb5cc]"><CircleArrowDown className="h-4 w-4" /> Листайте — здесь есть маршрут</div><div className="flex gap-8 font-mono text-[10px] uppercase tracking-[0.15em] text-[#b7adc6]"><span>Стратегия</span><span>Дизайн</span><span>Код</span></div></div>
          </motion.div>
        </section>

        <section className="overflow-hidden border-y border-white/10 bg-[#b18aff] py-3 text-[#120d19]"><div className="marquee-track flex w-max gap-8 whitespace-nowrap font-display text-xl font-black uppercase tracking-[-0.08em] sm:text-3xl"><span>ваш сайт / ваш голос / ваш сигнал / </span><span>ваш сайт / ваш голос / ваш сигнал / </span><span>ваш сайт / ваш голос / ваш сигнал / </span></div></section>

        <section id="works" className="relative px-5 py-20 sm:px-8 sm:py-28 lg:px-12"><div className="mx-auto max-w-[1440px]"><div className="grid gap-8 border-b border-white/14 pb-10 lg:grid-cols-[.82fr_1.18fr] lg:items-end"><div><SectionEyebrow index="01">витрина работ</SectionEyebrow><h2 className="mt-7 font-display text-[clamp(2.8rem,6.7vw,6.8rem)] font-black uppercase leading-[.86] tracking-[-0.1em]">Живые<br />ссылки.</h2></div><p className="max-w-xl text-lg leading-8 text-[#c9c2d4]">Здесь будут ваши опубликованные работы. Каждая карточка уже подготовлена: пришлите ссылки, и я заменю названия и наполнение на реальные проекты — без вымышленных кейсов.</p></div>
            <div className="mt-10 grid gap-5 lg:grid-cols-3">{portfolioWorks.map((work, index) => <motion.article key={work.number} initial={reduceMotion ? false : { opacity: 0, y: 28 }} whileInView={reduceMotion ? undefined : { opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.2 }} transition={{ duration: 0.55, delay: index * 0.07, ease: [0.16, 1, 0.3, 1] }} className="portfolio-card group rounded-[2rem] border border-white/12 bg-[#17131f] p-4"><ProjectVisual variant={work.visual} /><div className="mt-6 flex items-center justify-between font-mono text-[10px] uppercase tracking-[0.15em] text-[#b9adce]"><span>{work.number} / {work.category}</span><Layers3 className="h-4 w-4" /></div><h3 className="mt-5 font-display text-2xl font-black uppercase leading-[.93] tracking-[-0.075em] text-white">{work.name}</h3><p className="mt-4 min-h-24 text-sm leading-6 text-[#bbb3c8]">{work.description}</p>{work.url ? <a href={work.url} target="_blank" rel="noreferrer" className="mt-7 inline-flex items-center gap-2 font-mono text-[10px] font-bold uppercase tracking-[0.15em] text-white">Открыть сайт <ExternalLink className="h-4 w-4" /></a> : <span className="mt-7 inline-flex items-center gap-2 font-mono text-[10px] font-bold uppercase tracking-[0.15em] text-[#987de0]">Ссылка будет добавлена <ArrowUpRight className="h-4 w-4" /></span>}</motion.article>)}</div></div></section>

        <section id="approach" className="relative overflow-hidden rounded-t-[3rem] bg-[#f2edfb] px-5 py-20 text-[#17111f] sm:px-8 sm:py-28 lg:px-12"><div className="light-grid pointer-events-none absolute inset-0 opacity-65" /><div className="relative mx-auto max-w-[1440px]"><div className="grid gap-9 lg:grid-cols-[.78fr_1.22fr] lg:items-end"><div><SectionEyebrow index="02">под ключ</SectionEyebrow><h2 className="mt-7 font-display text-[clamp(2.8rem,6.4vw,6.5rem)] font-black uppercase leading-[.86] tracking-[-0.1em]">Не только<br />красиво.</h2></div><p className="max-w-xl text-lg leading-8 text-[#4a4353]">Сильный визуал — только часть работы. Я помогаю собрать идею, структуру, тексты, интерфейс и техническую основу, чтобы после запуска сайт не оставался красивой пустой витриной.</p></div><div className="mt-14 grid border-l border-t border-[#c7bbd7] sm:grid-cols-2 lg:grid-cols-4">{offerCards.map(([title, text], index) => <article key={title} className="group min-h-64 border-b border-r border-[#c7bbd7] p-6 sm:p-7"><p className="font-mono text-[10px] uppercase tracking-[0.16em] text-[#7552bc]">0{index + 1}</p><h3 className="mt-12 font-display text-2xl font-black uppercase tracking-[-0.07em]">{title}</h3><p className="mt-4 text-sm leading-6 text-[#62596a]">{text}</p><ArrowDownRight className="mt-8 h-5 w-5 text-[#6f4db9] transition-transform duration-200 group-hover:translate-x-1 group-hover:translate-y-1" /></article>)}</div></div></section>

        <section id="process" className="bg-[#17111f] px-5 py-20 sm:px-8 sm:py-28 lg:px-12"><div className="mx-auto grid max-w-[1440px] gap-12 lg:grid-cols-[.72fr_1.28fr]"><div><SectionEyebrow index="03">как это работает</SectionEyebrow><h2 className="mt-7 font-display text-[clamp(2.8rem,5.7vw,5.8rem)] font-black uppercase leading-[.87] tracking-[-0.1em]">Без<br />хаоса.</h2><p className="mt-8 max-w-md text-lg leading-8 text-[#c5bdcf]">У проекта есть ясный ритм: сначала смыслы, потом система, дальше — реализация и запуск. Вы всегда понимаете, на каком мы этапе и что нужно от вас.</p><a href="#brief" className="mt-10 inline-flex rounded-full bg-[#b38bff] px-6 py-4 font-mono text-[10px] font-bold uppercase tracking-[0.15em] text-[#160f22] transition-transform hover:-translate-y-0.5 active:scale-[0.97]">Перейти к брифу <ArrowDownRight className="ml-2 h-4 w-4" /></a></div><div className="relative"><span className="absolute bottom-9 left-[17px] top-9 w-px bg-[#6f5c83] sm:left-6" />{processSteps.map(([number, title, text], index) => <motion.article key={number} initial={reduceMotion ? false : { opacity: 0, x: 18 }} whileInView={reduceMotion ? undefined : { opacity: 1, x: 0 }} viewport={{ once: true, amount: 0.25 }} transition={{ duration: 0.5, delay: index * 0.07, ease: [0.16, 1, 0.3, 1] }} className="relative grid grid-cols-[35px_1fr] gap-6 border-b border-white/13 py-7 first:border-t sm:grid-cols-[52px_1fr] sm:gap-8"><span className="relative z-10 grid h-9 w-9 place-items-center rounded-full border border-[#a78af4] bg-[#17111f] font-mono text-[10px] text-[#d1c0ff] sm:h-12 sm:w-12">{number}</span><div><h3 className="font-display text-2xl font-black uppercase tracking-[-0.07em] text-white">{title}</h3><p className="mt-3 max-w-xl text-sm leading-6 text-[#beb6c9]">{text}</p></div></motion.article>)}</div></div></section>

        <section className="relative overflow-hidden bg-[#b18aff] px-5 py-20 text-[#17111f] sm:px-8 sm:py-24 lg:px-12"><div className="cta-orbit pointer-events-none absolute right-[8%] top-1/2 h-72 w-72 -translate-y-1/2 rounded-full border-[28px] border-[#e1d7fa] opacity-70" /><div className="relative mx-auto flex max-w-[1440px] flex-col justify-between gap-10 lg:flex-row lg:items-end"><div><p className="font-mono text-[10px] font-semibold uppercase tracking-[0.18em]">Есть задача? Есть старт.</p><h2 className="mt-7 max-w-4xl font-display text-[clamp(3rem,6vw,6.3rem)] font-black uppercase leading-[.86] tracking-[-0.1em]">Давайте сделаем<br />сайт заметным.</h2></div><a href="#brief" className="inline-flex w-fit items-center gap-3 rounded-full bg-[#17111f] px-7 py-5 font-mono text-[10px] font-bold uppercase tracking-[0.15em] text-white transition-transform hover:-translate-y-1 active:scale-[0.97]">Начать с брифа <ArrowDownRight className="h-4 w-4" /></a></div></section>

        <BriefApplication />
      </main>

      <footer className="border-t border-white/10 bg-[#0a090d] px-5 py-10 sm:px-8 lg:px-12"><div className="mx-auto flex max-w-[1440px] flex-col justify-between gap-6 sm:flex-row sm:items-end"><div><p className="font-display text-2xl font-black uppercase tracking-[-0.08em]">site maker</p><p className="mt-2 max-w-sm text-sm leading-6 text-[#aaa0b6]">Дизайн, разработка и запуск современных сайтов с характером.</p></div><div className="font-mono text-[10px] uppercase tracking-[0.15em] text-[#8d829a]">© {new Date().getFullYear()} / digital work</div></div></footer>
    </div>
  );
}
