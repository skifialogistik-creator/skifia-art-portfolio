/*
 * Composition: the mouse-controlled figure owns the first screen. The robotic
 * hand is a distinct violet interlude below it, followed by a neon control block.
 */
import { motion, useReducedMotion } from "framer-motion";
import { ArrowDownRight, Check, MousePointer2, ShieldCheck, Sparkles } from "lucide-react";
import { useEffect, useRef, useState } from "react";

const interactiveFigureVideo = "/manus-storage/interactive-figure_3957bd84.mp4";
const roboticHandVideo = "/manus-storage/robotic-hand_ef650d71.mp4";
const controlCards = [
  ["01", "Домен", "Адрес сайта оформлен на рабочую почту клиента."],
  ["02", "Аккаунты", "Сервисы подключаются по ролям, без передачи паролей."],
  ["03", "Пакет владельца", "В финале остаются доступы, код и инструкция."],
] as const;

export default function InteractiveHero() {
  const figureVideoRef = useRef<HTMLVideoElement>(null);
  const handVideoRef = useRef<HTMLVideoElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const [figureReady, setFigureReady] = useState(false);
  const [handReady, setHandReady] = useState(false);
  const [cursorRatio, setCursorRatio] = useState(0.5);
  const [isHovering, setIsHovering] = useState(false);
  const reduceMotion = useReducedMotion();

  useEffect(() => {
    const figure = figureVideoRef.current;
    const hand = handVideoRef.current;
    if (!figure || !hand) return;
    const mobile = window.matchMedia("(max-width: 1023px)");
    const setPlayback = () => {
      figure.muted = true;
      hand.muted = true;
      hand.loop = true;
      if (mobile.matches && !reduceMotion) {
        figure.loop = true;
        void figure.play().catch(() => undefined);
        void hand.play().catch(() => undefined);
      } else {
        figure.pause();
        if (Number.isFinite(figure.duration)) figure.currentTime = figure.duration * 0.54;
        if (reduceMotion) hand.pause();
      }
    };
    setPlayback();
    mobile.addEventListener("change", setPlayback);
    return () => mobile.removeEventListener("change", setPlayback);
  }, [reduceMotion]);

  useEffect(() => {
    const hand = handVideoRef.current;
    if (!hand || reduceMotion) return;
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) void hand.play().catch(() => undefined);
      else hand.pause();
    }, { threshold: 0.28 });
    observer.observe(hand);
    return () => observer.disconnect();
  }, [reduceMotion]);

  const scrubFigure = (clientX: number) => {
    const stage = stageRef.current;
    const figure = figureVideoRef.current;
    if (!stage || !figure || window.innerWidth < 1024 || reduceMotion || !Number.isFinite(figure.duration)) return;
    const bounds = stage.getBoundingClientRect();
    const ratio = Math.min(0.94, Math.max(0.07, (clientX - bounds.left) / bounds.width));
    setCursorRatio(ratio);
    figure.currentTime = ratio * figure.duration;
  };

  return (
    <>
      <section id="top" className="relative min-h-[calc(100svh-65px)] overflow-hidden bg-[#07030f]" aria-label="Интерактивная видеосцена">
        <div ref={stageRef} onPointerMove={(event) => scrubFigure(event.clientX)} onPointerEnter={() => setIsHovering(true)} onPointerLeave={() => setIsHovering(false)} className="relative min-h-[calc(100svh-65px)] overflow-hidden">
          <video ref={figureVideoRef} src={interactiveFigureVideo} muted playsInline preload="auto" onLoadedMetadata={() => { setFigureReady(true); const video = figureVideoRef.current; if (video && window.innerWidth >= 1024 && !reduceMotion) video.currentTime = video.duration * 0.54; }} className="absolute inset-0 h-full w-full object-cover object-[61%_center] lg:object-[62%_center]" aria-label="Фигура меняет направление вместе с движением курсора" />
          <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(90deg,rgba(21,7,46,.76),transparent_50%),linear-gradient(0deg,rgba(5,2,14,.75),transparent_32%)]" />
          <div className="interactive-scanlines pointer-events-none absolute inset-0 opacity-20" />
          <motion.div animate={reduceMotion ? undefined : { x: `${cursorRatio * 100}%` }} transition={{ type: "spring", stiffness: 145, damping: 22 }} className="pointer-events-none absolute inset-x-0 top-[54%] hidden h-px bg-[#f7a9ff]/80 lg:block"><span className="absolute -top-2 -left-2 grid h-4 w-4 place-items-center rounded-full border border-[#f7a9ff] bg-[#7328dc] shadow-[0_0_28px_7px_rgba(234,84,255,.72)]"><span className="h-1.5 w-1.5 rounded-full bg-[#fff0ff]" /></span></motion.div>
          <div className="absolute left-5 top-5 flex items-center gap-2 border border-[#a15cff]/70 bg-[#10051f]/75 px-3 py-2 font-mono text-[9px] uppercase tracking-[0.14em] text-[#f4d9ff] backdrop-blur-sm sm:left-8 sm:top-7"><Sparkles className="h-3.5 w-3.5 text-[#ff68df]" /> Сцена / живая</div>
          <div className="absolute bottom-7 left-5 right-5 flex items-end justify-between gap-4 sm:bottom-9 sm:left-8 sm:right-8"><div className="max-w-[310px] border-l-2 border-[#ff68df] bg-[#10051f]/78 px-4 py-3 text-[#fbf5ff] backdrop-blur-md"><p className="font-mono text-[9px] uppercase tracking-[0.17em] text-[#ff9be9]">Интерактивная сцена</p><p className="mt-2 font-display text-lg font-semibold leading-tight tracking-[-0.035em]">Ведите курсором — фигура меняет направление.</p></div><div className={`hidden items-center gap-2 border border-[#a15cff]/70 bg-[#10051f]/75 px-3 py-2 font-mono text-[9px] uppercase tracking-[0.14em] text-[#f4d9ff] backdrop-blur-md lg:flex ${isHovering ? "opacity-100" : "opacity-65"}`}><MousePointer2 className="h-3.5 w-3.5" /> Курсор / сцена</div></div>
          {!figureReady && <div className="absolute right-5 top-5 border border-[#a15cff]/70 bg-[#10051f]/75 px-3 py-2 font-mono text-[9px] uppercase tracking-[0.15em] text-[#f4d9ff] backdrop-blur-sm">Загрузка сцены…</div>}
        </div>
      </section>

      <section id="hand-scene" className="relative overflow-hidden border-b border-[#3b235f] bg-[#140a28] text-[#f7efff]">
        <div className="absolute inset-0 opacity-65 [background-image:radial-gradient(#b76dff_0.55px,transparent_0.55px)] [background-size:8px_8px]" />
        <div className="relative mx-auto grid min-h-[600px] max-w-[1440px] lg:grid-cols-[0.8fr_1.2fr]">
          <div className="z-10 flex flex-col justify-end px-5 py-14 sm:px-8 sm:py-20 lg:px-12 lg:py-24"><div className="flex items-center gap-3 font-mono text-[10px] font-medium uppercase tracking-[0.2em] text-[#ff8de8]"><span className="grid h-6 w-6 place-items-center border border-[#9e50ff] bg-[#25114a] text-[9px]">01</span><span>Проверка владения</span></div><h2 className="mt-7 max-w-md font-display text-4xl font-semibold leading-[1.02] tracking-[-0.065em] sm:text-5xl">Держите ключевые доступы в своих руках.</h2><p className="mt-6 max-w-md text-[17px] leading-7 text-[#d2c3e9]">Домен, аккаунты, реклама и аналитика принадлежат вам. Исполнитель получает доступ к работе через роль пользователя.</p><a href="#ownership" className="mt-8 inline-flex w-fit items-center gap-3 border-b border-[#ff8de8] pb-1.5 text-sm font-semibold text-[#fbf5ff] transition-colors hover:border-[#8f5cff] hover:text-[#ff8de8]">Проверить принцип владения <ArrowDownRight className="h-4 w-4" /></a></div>
          <div className="relative min-h-[420px]"><video ref={handVideoRef} src={roboticHandVideo} muted playsInline loop preload="metadata" onLoadedMetadata={() => setHandReady(true)} className="absolute inset-0 h-full w-full object-cover object-center mix-blend-screen saturate-150" aria-label="Роботизированная рука в отдельной информационной сцене" />{!handReady && <div className="absolute inset-0 grid place-items-center font-mono text-[9px] uppercase tracking-[0.15em] text-[#d6b6ff]">Загрузка руки…</div>}<div className="pointer-events-none absolute bottom-6 right-6 border border-[#a15cff]/70 bg-[#16072d]/85 px-3 py-2 font-mono text-[9px] uppercase tracking-[0.14em] text-[#f5dcff] backdrop-blur-sm"><ShieldCheck className="mr-2 inline h-3.5 w-3.5 text-[#ff68df]" /> Владелец / клиент</div></div>
        </div>
      </section>

      <section id="control-story" className="relative overflow-hidden bg-[#4a167f] text-[#f9f2ff]">
        <div className="absolute inset-0 opacity-35 [background-image:linear-gradient(rgba(255,191,245,.24)_1px,transparent_1px),linear-gradient(90deg,rgba(255,191,245,.24)_1px,transparent_1px)] [background-size:42px_42px]" />
        <div className="relative mx-auto grid max-w-[1440px] gap-10 px-5 py-16 sm:px-8 sm:py-24 lg:grid-cols-[0.86fr_1.14fr] lg:px-12">
          <motion.div initial={reduceMotion ? false : { opacity: 0, y: 18 }} whileInView={reduceMotion ? undefined : { opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.35 }} transition={{ duration: 0.65, ease: [0.16, 1, 0.3, 1] }}><div className="flex items-center gap-3 font-mono text-[10px] font-medium uppercase tracking-[0.2em] text-[#ffc1f4]"><span className="grid h-6 w-6 place-items-center border border-[#ffc1f4] bg-[#2c0d57] text-[9px] text-[#ffbcf1]">02</span><span>Контроль проекта</span></div><h1 className="mt-8 max-w-[700px] font-display text-[clamp(3.4rem,7vw,7.2rem)] font-semibold leading-[0.9] tracking-[-0.08em]">Ваш сайт.<br />Ваши аккаунты.<br /><span className="text-[#ff8de8]">Ваш контроль.</span></h1><p className="mt-8 max-w-xl text-lg leading-8 text-[#eadfff] sm:text-xl">Понятный план: что подготовить, какие сервисы нужны и как безопасно получить сайт со всеми правами владельца.</p><div className="mt-10 flex flex-wrap items-center gap-x-7 gap-y-4"><a href="#brief" className="group inline-flex items-center gap-3 border border-[#ff88e7] bg-[#ff5bd7] px-5 py-4 font-mono text-[11px] font-semibold uppercase tracking-[0.13em] text-[#26052b] shadow-[0_0_30px_rgba(255,91,215,.48)] transition-all duration-200 hover:-translate-y-0.5 hover:bg-[#ff9be8] active:scale-[0.97]">Начать с брифа <ArrowDownRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5 group-hover:translate-y-0.5" /></a><a href="#ownership" className="group inline-flex items-center gap-3 border-b border-[#ffc1f4] pb-1.5 text-sm font-semibold text-white transition-colors hover:border-white">Как устроено владение <ArrowDownRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5 group-hover:translate-y-0.5" /></a></div></motion.div>
          <div className="grid gap-3 sm:grid-cols-3 lg:items-end">{controlCards.map(([number, title, text], index) => <motion.article key={number} initial={reduceMotion ? false : { opacity: 0, y: 18 }} whileInView={reduceMotion ? undefined : { opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.28 }} transition={{ duration: 0.5, delay: reduceMotion ? 0 : index * 0.08, ease: [0.16, 1, 0.3, 1] }} className="control-card border border-[#c16bff]/65 bg-[#18082c]/85 p-5 text-[#f7efff] backdrop-blur-sm"><p className="font-mono text-[10px] uppercase tracking-[0.16em] text-[#ff9be8]">{number}</p><ShieldCheck className="mt-10 h-6 w-6 text-[#ff68df]" /><h2 className="mt-5 font-display text-2xl font-semibold tracking-[-0.045em]">{title}</h2><p className="mt-3 text-sm leading-6 text-[#d8c8f2]">{text}</p><p className="mt-6 flex items-center gap-2 border-t border-[#7441a1] pt-4 font-mono text-[9px] uppercase tracking-[0.13em] text-[#cbb7e9]"><Check className="h-3.5 w-3.5 text-[#ff68df]" /> Под контролем</p></motion.article>)}</div>
        </div>
      </section>
    </>
  );
}
