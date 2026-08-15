import { useReducedMotion } from "framer-motion";
import { useEffect, useRef, useState } from "react";

const roboticHandVideo = "/manus-storage/robotic-hand_ef650d71.mp4";

function isLightSurface(element: HTMLElement) {
  let current: HTMLElement | null = element;
  while (current) {
    const rgb = getComputedStyle(current).backgroundColor.match(/\d+/g)?.map(Number);
    const transparent = rgb && rgb.length === 4 && rgb[3] === 0;
    if (rgb && rgb.length >= 3 && !transparent) return rgb[0] > 170 && rgb[1] > 170 && rgb[2] > 170;
    current = current.parentElement;
  }
  return true;
}

/** A low-contrast, edge-mounted hand used as a recurring visual signature. */
export default function RoboticHandMotif() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [active, setActive] = useState(false);
  const reduceMotion = useReducedMotion();

  useEffect(() => {
    const sections = Array.from(document.querySelectorAll<HTMLElement>("main > section")).filter((section) => section.id !== "hand-scene" && isLightSurface(section));
    const visible = new Set<HTMLElement>();
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        const section = entry.target as HTMLElement;
        if (entry.isIntersecting) visible.add(section);
        else visible.delete(section);
      });
      setActive(visible.size > 0);
    }, { threshold: 0.22 });
    sections.forEach((section) => observer.observe(section));
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    video.muted = true;
    video.loop = true;
    if (active && !reduceMotion) void video.play().catch(() => undefined);
    else video.pause();
  }, [active, reduceMotion]);

  return <video ref={videoRef} src={roboticHandVideo} muted loop playsInline preload="none" aria-hidden="true" className={`hand-motif ${active ? "hand-motif-active" : ""}`} />;
}
