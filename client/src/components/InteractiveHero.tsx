/*
 * Video scene + story block. The hand is intentionally isolated in its own
 * scroll-controlled stage; the client-control message starts only after it.
 */
import { motion, useReducedMotion } from "framer-motion";
import { ArrowDownRight, Check, MousePointer2, ShieldCheck, Sparkles } from "lucide-react";
import { useEffect, useRef, useState } from "react";

const roboticHandVideo = "/manus-storage/robotic-hand_ef650d71.mp4";
const controlCards = [
  ["01", "Домен", "Адрес сайта оформлен на рабочую почту клиента."],
  ["02", "Аккаунты", "Сервисы подключаются по ролям, без передачи паролей."],
  ["03", "Пакет владельца", "В финале остаются доступы, код и инструкция."],
] as const;

export default function InteractiveHero() {
  const sectionRef = useRef<HTMLElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [ready, setReady] = useState(false);
  const [scrollRatio, setScrollRatio] = useState(0);
  const reduceMotion = useReducedMotion();

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    const media = window.matchMedia("(max-width: 767px)");
    const togglePlayback = () => {
      if (media.matches && !reduceMotion) {
        video.muted = true;
        video.loop = true;
        void video.play().catch(() => undefined);
      } else {
        video.pause();
        if (Number.isFinite(video.duration)) video.currentTime = reduceMotion ? video.duration * 0.5 : 0;
      }
    };
    togglePlayback();
    media.addEventListener("change", togglePlayback);
    return () => media.removeEventListener("change", togglePlayback);
  }, [reduceMotion]);

  useEffect(() => {
    if (reduceMotion) return;
    let scheduled = false;
    const syncVideoToScroll = () => {
      scheduled = false;
      const section = sectionRef.current;
      const video = videoRef.current;
      if (!section || !video || window.innerWidth < 768 || !Number.isFinite(video.duration)) return;
      const bounds = section.getBoundingClientRect();
      const travel = Math.max(1, bounds.height - window.innerHeight);
      const ratio = Math.min(0.96, Math.max(0.04, -bounds.top / travel));
      setScrollRatio(ratio);
      video.currentTime = ratio * video.duration;
    };
    const onScroll = () => {
      if (!scheduled) { scheduled = true; window.requestAnimationFrame(syncVideoToScroll); }
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [reduceMotion]);

  return (
    <>
      <section ref={sectionRef} id="top" className="relative h-[128svh] bg-[#f9f9fa]" aria-label="Интерактивная видеосцена">
        <div className="sticky top-0 h-[100svh] overflow-hidden border-b border-[#d9dbdc] bg-[#f9f9fa]">
          <video ref={videoRef} src={roboticHandVideo} muted playsInline preload="auto" onLoadedMetadata={() => { setReady(true); const video = videoRef.current; if (video && reduceMotion) video.currentTime = video.duration * 0.5; }} className="absolute left-1/2 top-1/2 h-[80%] w-[80%] -translate-x-1/2 -translate-y-1/2 object-cover object-center sm:h-full sm:w-full" aria-label="Видеосцена с роботизированной рукой, реагирующая на прокрутку страницы" />
          <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_top,rgba(249,249,250,.92)_0%,rgba(249,249,250,.1)_28%,transparent_58%)]" />
          <motion.div initial={reduceMotion ? false : { opacity: 0, y: -16 }} animate={reduceMotion ? undefined : { opacity: 1, y: 0 }} transition={{ duration: 0.75, ease: [0.16, 1, 0.3, 1] }} className="absolute left-5 top-5 flex items-center gap-2 border border-[#cfd2d4] bg-white/80 px-3 py-2 font-mono text-[9px] uppercase tracking-[0.15em] text-[#161b1c] backdrop-blur-md sm:left-8 sm:top-7"><Sparkles className="h-3.5 w-3.5 text-[#075c70]" /> Сцена / рука контроля</motion.div>
          <div className="absolute bottom-8 left-5 right-5 flex flex-col justify-between gap-5 sm:bottom-10 sm:left-8 sm:right-8 sm:flex-row sm:items-end"><div className="max-w-xl"><p className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.16em] text-[#4c5558]"><span className="h-2 w-2 rounded-full bg-[#075c70]" /> Листайте, чтобы запустить сцену</p><p className="mt-3 max-w-md font-display text-2xl font-semibold leading-tight tracking-[-0.045em] text-[#121819] sm:text-3xl">Контроль начинается с простого движения: доступы должны быть у владельца.</p></div><div className="hidden items-center gap-2 font-mono text-[9px] uppercase tracking-[0.15em] text-[#4c5558] sm:flex"><MousePointer2 className="h-4 w-4" /> Прогресс {Math.round(scrollRatio * 100)}%</div></div>
          <div className="absolute bottom-0 left-0 h-1 bg-[#075c70] transition-[width] duration-100" style={{ width: `${scrollRatio * 100}%` }} />
          {!ready && <div className="absolute right-5 top-5 border border-[#cfd2d4] bg-white/80 px-3 py-2 font-mono text-[9px] uppercase tracking-[0.15em] text-[#536164] backdrop-blur-sm">Загрузка сцены…</div>}
        </div>
      </section>

      <section id="control-story" className="relative overflow-hidden border-b border-[#d6d8d7] bg-[#f6f6f4] text-[#171c1d]">
        <div className="absolute inset-0 opacity-60 [background-image:linear-gradient(rgba(18,24,25,.055)_1px,transparent_1px),linear-gradient(90deg,rgba(18,24,25,.055)_1px,transparent_1px)] [background-size:34px_34px]" />
        <div className="relative mx-auto grid max-w-[1440px] gap-10 px-5 py-16 sm:px-8 sm:py-24 lg:grid-cols-[0.86fr_1.14fr] lg:px-12">
          <motion.div initial={reduceMotion ? false : { opacity: 0, y: 18 }} whileInView={reduceMotion ? undefined : { opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.35 }} transition={{ duration: 0.65, ease: [0.16, 1, 0.3, 1] }}>
            <div className="flex items-center gap-3 font-mono text-[10px] font-medium uppercase tracking-[0.2em] text-[#075c70]"><span className="grid h-6 w-6 place-items-center border border-[#075c70] bg-[#075c70] text-[9px] text-white">01</span><span>Контроль проекта</span></div>
            <h1 className="mt-8 max-w-[700px] font-display text-[clamp(3.4rem,7vw,7.2rem)] font-semibold leading-[0.9] tracking-[-0.08em]">Ваш сайт.<br /><span className="text-[#075c70]">Ваши аккаунты.</span><br />Ваш контроль.</h1>
            <p className="mt-8 max-w-xl text-lg leading-8 text-[#525d5e] sm:text-xl">Понятный план: что подготовить, какие сервисы нужны и как безопасно получить сайт со всеми правами владельца.</p>
            <div className="mt-10 flex flex-wrap items-center gap-x-7 gap-y-4"><a href="#brief" className="group inline-flex items-center gap-3 bg-[#101718] px-5 py-4 font-mono text-[11px] font-medium uppercase tracking-[0.13em] text-white transition-all duration-200 hover:-translate-y-0.5 hover:bg-[#075c70] active:scale-[0.97]">Начать с брифа <ArrowDownRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5 group-hover:translate-y-0.5" /></a><a href="#ownership" className="group inline-flex items-center gap-3 border-b border-[#171c1d] pb-1.5 text-sm font-semibold transition-colors hover:border-[#075c70] hover:text-[#075c70]">Как устроено владение <ArrowDownRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5 group-hover:translate-y-0.5" /></a></div>
          </motion.div>
          <div className="grid gap-3 sm:grid-cols-3 lg:items-end">{controlCards.map(([number, title, text], index) => <motion.article key={number} initial={reduceMotion ? false : { opacity: 0, y: 18 }} whileInView={reduceMotion ? undefined : { opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.28 }} transition={{ duration: 0.5, delay: reduceMotion ? 0 : index * 0.08, ease: [0.16, 1, 0.3, 1] }} className="control-card border border-[#cfd2d1] bg-white/80 p-5 backdrop-blur-sm"><p className="font-mono text-[10px] uppercase tracking-[0.16em] text-[#075c70]">{number}</p><ShieldCheck className="mt-10 h-6 w-6 text-[#075c70]" /><h2 className="mt-5 font-display text-2xl font-semibold tracking-[-0.045em]">{title}</h2><p className="mt-3 text-sm leading-6 text-[#586365]">{text}</p><p className="mt-6 flex items-center gap-2 border-t border-[#dfe2e0] pt-4 font-mono text-[9px] uppercase tracking-[0.13em] text-[#435452]"><Check className="h-3.5 w-3.5 text-[#075c70]" /> Под контролем</p></motion.article>)}</div>
        </div>
      </section>
    </>
  );
}
