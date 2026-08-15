import { useReducedMotion } from "framer-motion";
import { type CSSProperties, useEffect, useRef, useState } from "react";

const roboticHandVideo = "/manus-storage/robotic-hand_ef650d71.mp4";

const gestures = [
  { label: "Собрать", note: "контур задачи", ratio: 0.12, angle: "-8deg", shift: "-6px", scale: "0.94", tone: 180 },
  { label: "Открыть", note: "доступы и роли", ratio: 0.31, angle: "-3deg", shift: "3px", scale: "0.98", tone: 240 },
  { label: "Настроить", note: "структура и сервисы", ratio: 0.52, angle: "2deg", shift: "0px", scale: "1", tone: 310 },
  { label: "Проверить", note: "контроль перед запуском", ratio: 0.72, angle: "6deg", shift: "7px", scale: "1.02", tone: 390 },
  { label: "Передать", note: "пакет владельца", ratio: 0.91, angle: "10deg", shift: "10px", scale: "1.04", tone: 520 },
] as const;

/** Recurring edge-mounted hand with a distinct, stage-specific pose and optional sound. */
export default function RoboticHandMotif() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const lastSoundGestureRef = useRef<number | null>(null);
  const [active, setActive] = useState(false);
  const [gestureIndex, setGestureIndex] = useState(0);
  const [soundEnabled, setSoundEnabled] = useState(false);
  const reduceMotion = useReducedMotion();
  const gesture = gestures[gestureIndex];

  const getAudioContext = () => {
    if (!audioContextRef.current) audioContextRef.current = new window.AudioContext();
    if (audioContextRef.current.state === "suspended") void audioContextRef.current.resume();
    return audioContextRef.current;
  };

  const playGestureSound = (index: number) => {
    if (reduceMotion) return;
    const context = getAudioContext();
    const tone = gestures[index]?.tone ?? 220;
    const now = context.currentTime;
    const oscillator = context.createOscillator();
    const gain = context.createGain();
    const filter = context.createBiquadFilter();
    oscillator.type = index % 2 === 0 ? "sine" : "triangle";
    oscillator.frequency.setValueAtTime(tone, now);
    oscillator.frequency.exponentialRampToValueAtTime(tone * 1.32, now + 0.16);
    filter.type = "lowpass";
    filter.frequency.setValueAtTime(1500, now);
    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.exponentialRampToValueAtTime(0.035, now + 0.018);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.22);
    oscillator.connect(filter).connect(gain).connect(context.destination);
    oscillator.start(now);
    oscillator.stop(now + 0.24);
  };

  useEffect(() => {
    const allSections = Array.from(document.querySelectorAll<HTMLElement>("main > section"));
    const nonGestureSections = new Set(["top", "hand-scene", "control-story", "services"]);
    const gestureSections = allSections.filter((section) => !nonGestureSections.has(section.id));
    let scheduled = false;
    const updateStage = () => {
      scheduled = false;
      const center = window.innerHeight * 0.5;
      const current = allSections.reduce<HTMLElement | null>((closest, section) => {
        if (!closest) return section;
        const sectionRect = section.getBoundingClientRect();
        const closestRect = closest.getBoundingClientRect();
        const sectionDistance = Math.abs((sectionRect.top + sectionRect.bottom) / 2 - center);
        const closestDistance = Math.abs((closestRect.top + closestRect.bottom) / 2 - center);
        return sectionDistance < closestDistance ? section : closest;
      }, null);
      const stageIndex = current ? gestureSections.indexOf(current) : -1;
      setActive(stageIndex >= 0);
      if (stageIndex >= 0) setGestureIndex(stageIndex % gestures.length);
    };
    const onScrollOrResize = () => { if (!scheduled) { scheduled = true; window.requestAnimationFrame(updateStage); } };
    updateStage();
    window.addEventListener("scroll", onScrollOrResize, { passive: true });
    window.addEventListener("resize", onScrollOrResize);
    return () => { window.removeEventListener("scroll", onScrollOrResize); window.removeEventListener("resize", onScrollOrResize); };
  }, []);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    video.muted = true;
    video.loop = false;
    if (!active) { video.pause(); return; }
    let pauseTimer: number | undefined;
    const setGestureFrame = () => {
      video.currentTime = video.duration * gesture.ratio;
      if (reduceMotion) { video.pause(); return; }
      void video.play().catch(() => undefined);
      pauseTimer = window.setTimeout(() => video.pause(), 460);
    };
    if (Number.isFinite(video.duration)) setGestureFrame();
    else { video.addEventListener("loadedmetadata", setGestureFrame, { once: true }); video.load(); }
    return () => { if (pauseTimer) window.clearTimeout(pauseTimer); video.removeEventListener("loadedmetadata", setGestureFrame); };
  }, [active, gesture.ratio, reduceMotion]);

  useEffect(() => {
    if (!active || !soundEnabled || reduceMotion || lastSoundGestureRef.current === gestureIndex) return;
    playGestureSound(gestureIndex);
    lastSoundGestureRef.current = gestureIndex;
  }, [active, gestureIndex, soundEnabled, reduceMotion]);

  const motifStyle = { "--hand-angle": gesture.angle, "--hand-shift": gesture.shift, "--hand-scale": gesture.scale } as CSSProperties;

  const toggleSound = () => {
    if (reduceMotion) return;
    getAudioContext();
    setSoundEnabled((enabled) => {
      if (!enabled) lastSoundGestureRef.current = null;
      return !enabled;
    });
  };

  return <><video ref={videoRef} src={roboticHandVideo} muted playsInline preload="none" aria-hidden="true" style={motifStyle} className={`hand-motif hand-gesture-${gestureIndex} ${active ? "hand-motif-active" : ""}`} /><div aria-hidden="true" className={`hand-gesture-label ${active ? "hand-gesture-label-active" : ""}`}><span>{String(gestureIndex + 1).padStart(2, "0")}</span><div><strong>{gesture.label}</strong><small>{gesture.note}</small></div></div><button type="button" className={`hand-sound-toggle ${active ? "hand-sound-toggle-active" : ""}`} disabled={Boolean(reduceMotion)} aria-pressed={soundEnabled} onClick={toggleSound}>{soundEnabled ? "Звук / вкл" : "Звук / выкл"}</button></>;
}
