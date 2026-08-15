/*
 * Interactive hero: reference video becomes a control surface. On desktop the
 * horizontal pointer position scrubs the figure; on touch devices it plays as a
 * quiet loop. This keeps the visual flourish useful and accessible.
 */
import { motion, useReducedMotion } from "framer-motion";
import { ArrowDownRight, MousePointer2, ShieldCheck, Sparkles } from "lucide-react";
import { useEffect, useRef, useState } from "react";

const heroVideo = "/manus-storage/interactive-figure_3957bd84.mp4";
const headline = "Ваш сайт.\nВаши аккаунты.\nВаш контроль.";

function useTypewriter(text: string, speed = 28, startDelay = 260, disabled = false) {
  const [displayed, setDisplayed] = useState("");
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (disabled) {
      setDisplayed(text);
      setDone(true);
      return;
    }
    let interval: number | undefined;
    const start = window.setTimeout(() => {
      let index = 0;
      interval = window.setInterval(() => {
        index += 1;
        setDisplayed(text.slice(0, index));
        if (index >= text.length) {
          if (interval) window.clearInterval(interval);
          setDone(true);
        }
      }, speed);
    }, startDelay);
    return () => { window.clearTimeout(start); if (interval) window.clearInterval(interval); };
  }, [disabled, speed, startDelay, text]);

  return { displayed, done };
}

export default function InteractiveHero() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const [isReady, setIsReady] = useState(false);
  const [cursorRatio, setCursorRatio] = useState(0.5);
  const [isHovering, setIsHovering] = useState(false);
  const reduceMotion = useReducedMotion();
  const { displayed, done } = useTypewriter(headline, 28, 260, reduceMotion ?? false);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    const media = window.matchMedia("(max-width: 1023px)");
    const activateMobilePlayback = () => {
      if (media.matches && !reduceMotion) {
        video.muted = true;
        video.loop = true;
        void video.play().catch(() => undefined);
      } else {
        video.pause();
        if (Number.isFinite(video.duration)) video.currentTime = video.duration * 0.54;
      }
    };
    activateMobilePlayback();
    media.addEventListener("change", activateMobilePlayback);
    return () => media.removeEventListener("change", activateMobilePlayback);
  }, [reduceMotion]);

  const scrubVideo = (clientX: number) => {
    const stage = stageRef.current;
    const video = videoRef.current;
    if (!stage || !video || window.innerWidth < 1024 || reduceMotion || !Number.isFinite(video.duration)) return;
    const bounds = stage.getBoundingClientRect();
    const ratio = Math.min(0.94, Math.max(0.07, (clientX - bounds.left) / bounds.width));
    setCursorRatio(ratio);
    video.currentTime = ratio * video.duration;
  };

  return (
    <section id="top" className="interactive-hero relative overflow-hidden bg-[#101a22] text-[#f4f0e8]">
      <div className="absolute inset-0 opacity-35 [background-image:linear-gradient(rgba(140,211,214,.17)_1px,transparent_1px),linear-gradient(90deg,rgba(140,211,214,.17)_1px,transparent_1px)] [background-size:42px_42px]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_24%_58%,rgba(7,92,112,.55),transparent_30%),radial-gradient(circle_at_76%_24%,rgba(113,118,255,.24),transparent_26%)]" />
      <div className="relative mx-auto grid min-h-[calc(100svh-65px)] max-w-[1440px] lg:grid-cols-[0.92fr_1.08fr]">
        <motion.div initial={reduceMotion ? false : { opacity: 0, y: 24 }} animate={reduceMotion ? undefined : { opacity: 1, y: 0 }} transition={{ duration: 0.7, ease: [0.23, 1, 0.32, 1] }} className="relative z-10 flex flex-col justify-center px-5 pb-14 pt-16 sm:px-8 sm:pb-20 sm:pt-20 lg:px-12 lg:py-24">
          <div className="flex items-center gap-3 font-mono text-[10px] font-medium uppercase tracking-[0.21em] text-[#9ccfcf]"><span className="grid h-6 w-6 place-items-center border border-[#9ccfcf] bg-[#075c70] text-[9px] text-white">00</span><span>Интерактивный контроль проекта</span></div>
          <h1 className="mt-8 max-w-[720px] whitespace-pre-wrap font-display text-[clamp(3.25rem,7.2vw,7.1rem)] font-extrabold leading-[0.92] tracking-[-0.08em] text-[#f7f5ef]">
            {displayed}<span className={`hero-cursor ${done ? "opacity-0" : ""}`} aria-hidden="true" />
          </h1>
          <p className="mt-8 max-w-xl text-lg leading-8 text-[#cbd8d5] sm:text-xl">Понятный план: что подготовить, какие сервисы нужны и как безопасно получить сайт со всеми правами владельца.</p>
          <div className="mt-10 flex flex-wrap items-center gap-x-7 gap-y-4"><a href="#brief" className="group inline-flex items-center gap-3 bg-[#a8e1dc] px-5 py-4 font-mono text-[11px] font-semibold uppercase tracking-[0.13em] text-[#0d262c] transition-all duration-200 hover:-translate-y-0.5 hover:bg-[#e2fffb] active:scale-[0.97]">Начать с брифа <ArrowDownRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5 group-hover:translate-y-0.5" /></a><a href="#ownership" className="group inline-flex items-center gap-3 border-b border-[#9ccfcf]/50 pb-1.5 text-sm font-semibold text-[#f4f0e8] transition-colors hover:border-[#f4f0e8]">Как устроено владение <ArrowDownRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5 group-hover:translate-y-0.5" /></a></div>
          <div className="mt-14 grid max-w-xl grid-cols-3 gap-3 border-t border-[#7ca0a4]/45 pt-5"><div><p className="font-mono text-[10px] uppercase tracking-[0.15em] text-[#9ccfcf]">Правило</p><p className="mt-2 text-sm font-semibold leading-5">Никаких паролей в переписке</p></div><div><p className="font-mono text-[10px] uppercase tracking-[0.15em] text-[#9ccfcf]">Владелец</p><p className="mt-2 text-sm font-semibold leading-5">Клиент, не исполнитель</p></div><div><p className="font-mono text-[10px] uppercase tracking-[0.15em] text-[#9ccfcf]">Финал</p><p className="mt-2 text-sm font-semibold leading-5">Доступы + код + инструкция</p></div></div>
        </motion.div>
        <div ref={stageRef} onPointerMove={(event) => scrubVideo(event.clientX)} onPointerEnter={() => setIsHovering(true)} onPointerLeave={() => setIsHovering(false)} className="relative order-first min-h-[430px] overflow-hidden border-b border-[#c7d9d8]/20 bg-[#e6e6f1] lg:order-none lg:min-h-0 lg:border-b-0 lg:border-l">
          <video ref={videoRef} src={heroVideo} muted playsInline preload="auto" onLoadedMetadata={() => { setIsReady(true); const video = videoRef.current; if (video && window.innerWidth >= 1024 && !reduceMotion) video.currentTime = video.duration * 0.54; }} className="absolute inset-0 h-full w-full object-cover object-[61%_center] lg:object-[62%_center]" aria-label="Интерактивная видеосцена: фигура меняет направление вместе с курсором" />
          <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(90deg,rgba(16,26,34,.5),transparent_45%),linear-gradient(0deg,rgba(9,16,25,.55),transparent_30%)]" />
          <div className="interactive-scanlines pointer-events-none absolute inset-0 opacity-25" />
          <motion.div animate={{ x: `${cursorRatio * 100}%` }} transition={{ type: "spring", stiffness: 145, damping: 22 }} className="pointer-events-none absolute inset-x-0 top-[52%] hidden h-px bg-[#d5fffb]/80 lg:block"><span className="absolute -top-2 -left-2 grid h-4 w-4 place-items-center rounded-full border border-[#d5fffb] bg-[#075c70] shadow-[0_0_24px_5px_rgba(180,255,250,.55)]"><span className="h-1.5 w-1.5 rounded-full bg-[#d5fffb]" /></span></motion.div>
          <div className="absolute left-5 top-5 flex items-center gap-2 border border-white/30 bg-[#0b151c]/70 px-3 py-2 font-mono text-[9px] uppercase tracking-[0.14em] text-[#e1fffb] backdrop-blur-sm"><Sparkles className="h-3.5 w-3.5 text-[#b9f8ef]" /> Сцена / живая</div>
          <div className="absolute bottom-5 left-5 right-5 flex items-end justify-between gap-4 sm:bottom-7 sm:left-7 sm:right-7"><div className="max-w-[260px] border-l-2 border-[#a8e1dc] bg-[#0b151c]/65 px-4 py-3 text-[#f4f0e8] backdrop-blur-md"><p className="font-mono text-[9px] uppercase tracking-[0.17em] text-[#a8e1dc]">Принцип 01</p><p className="mt-2 font-display text-lg font-bold leading-tight tracking-[-0.035em]">У клиента — все ключи от проекта.</p></div><div className={`hidden items-center gap-2 border border-white/30 bg-[#0b151c]/65 px-3 py-2 font-mono text-[9px] uppercase tracking-[0.14em] text-[#e1fffb] backdrop-blur-md lg:flex ${isHovering ? "opacity-100" : "opacity-65"}`}><MousePointer2 className="h-3.5 w-3.5" /> Ведите курсором</div></div>
          {!isReady && <div className="absolute inset-0 grid place-items-center bg-[#0f1720] font-mono text-[10px] uppercase tracking-[0.18em] text-[#b7ded8]">Загрузка сцены…</div>}
          <div className="absolute bottom-0 left-0 h-1 bg-[#a8e1dc] transition-[width] duration-150" style={{ width: `${cursorRatio * 100}%` }} />
        </div>
      </div>
      <div className="absolute bottom-5 right-5 hidden items-center gap-2 font-mono text-[9px] uppercase tracking-[0.16em] text-[#9ccfcf] lg:flex"><ShieldCheck className="h-4 w-4" /> Доступы / клиенту</div>
    </section>
  );
}
