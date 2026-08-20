import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const homeSource = readFileSync(new URL("./Home.tsx", import.meta.url), "utf8");
const stylesSource = readFileSync(new URL("../index.css", import.meta.url), "utf8");
const indexSource = readFileSync(new URL("../../index.html", import.meta.url), "utf8");

describe("обновление бренда Skifia Art", () => {
  it("сохраняет мобильную сцену услуг сиреневой, полноэкранной и читабельной", () => {
    expect(homeSource).toContain('id="services"');
    expect(homeSource).toContain("min-h-screen");
    expect(homeSource).toContain("bg-[#cbb5f0]");
    expect(homeSource).toContain("text-[#201529]");
    expect(stylesSource).toContain(".services-wash { background:radial-gradient");
    expect(stylesSource).toContain(".services-video { filter:saturate(1.16)");
    expect(homeSource).toContain("const serviceNotes = [content.services.annotationOne, content.services.annotationTwo, content.services.annotationThree];");
    expect(homeSource).toContain("services-stage-grid");
    expect(homeSource).toContain("className=\"services-stage\"");
    expect(homeSource).toContain("services-annotation-card");
    expect(stylesSource).toContain(".services-stage-grid { display:grid; grid-template-columns:repeat(3,minmax(0,1fr));");
    expect(stylesSource).toContain(".services-stage { display:grid; align-content:start;");
    expect(stylesSource).toContain(".services-annotation-card { position:relative; display:grid;");
    expect(stylesSource).toContain(".services-stage-grid { grid-template-columns:1fr; width:100%; gap:.9rem; }");
    expect(stylesSource).toContain("@keyframes services-video-drift");
    expect(stylesSource).toContain(".services-video { animation:services-video-drift 13s");
  });

  it("сохраняет мобильную компоновку проектов и финального CTA", () => {
    expect(homeSource).toContain('id="projects" className="projects-section relative z-20 -mt-10 rounded-t-[42px] bg-[#0c0c0c] px-5 pb-16 pt-24');
    expect(homeSource).toContain('className="closing-section relative overflow-hidden bg-[#0c0c0c] px-5 pb-24 pt-8 sm:px-8"');
    expect(stylesSource).toContain(".project-art { min-height:270px; }");
    expect(stylesSource).toContain(".project-sticky { height:70vh !important; top:72px !important; }");
    expect(stylesSource).toContain(".project-sheet { border-radius:2rem; }");
    expect(stylesSource).toContain(".closing-section .contact-button { min-height:44px; padding:.85rem 1.1rem; color:#fff; }");
  });

  it("фиксирует serif-ритм для заголовков услуг, проектов и финального CTA", () => {
    expect(stylesSource).toContain('font-family:"Cormorant Garamond", Georgia, serif');
    expect(homeSource).toContain("text-right font-display text-[clamp(2.7rem,8.7vw,8.8rem)] font-semibold leading-[.77] tracking-[-.07em]");
    expect(homeSource).toContain("hero-heading mt-5 font-display text-[clamp(3.5rem,11vw,9.6rem)] font-semibold leading-[.77] tracking-[-.07em]");
    expect(homeSource).toContain("font-display text-[clamp(2.8rem,7vw,6.4rem)] font-semibold leading-[.8] tracking-[-.06em]");
  });

  it("сохраняет контраст каждого заголовка на его конкретном фоне", () => {
    const servicesSection = homeSource.slice(homeSource.indexOf('id="services"'), homeSource.indexOf('id="projects"'));
    const projectsSection = homeSource.slice(homeSource.indexOf('id="projects"'), homeSource.indexOf('className="closing-section'));
    const closingSection = homeSource.slice(homeSource.indexOf('className="closing-section'));

    expect(servicesSection).toContain("bg-[#cbb5f0]");
    expect(servicesSection).toContain("text-[#201529]");
    expect(servicesSection).toContain("text-right font-display");
    expect(projectsSection).toContain("bg-[#0c0c0c]");
    expect(projectsSection).toContain("hero-heading mt-5 font-display");
    expect(closingSection).toContain("bg-[#0c0c0c]");
    expect(closingSection).toContain("text-[#d7e2ea]");
    expect(closingSection).toContain("font-display text-[clamp(2.8rem,7vw,6.4rem)]");
    expect(stylesSource).toContain(".hero-heading { background:linear-gradient(180deg,#d8d8dc 0%,#9ea1ab 100%)");
    expect(stylesSource).toContain(".services-wash { background:radial-gradient");
  });

  it("подключает фирменный favicon Skifia Art", () => {
    expect(indexSource).toContain('rel="icon" type="image/png" href="/manus-storage/skifia-art-favicon_a0d94c2b.png"');
  });

  it("подключает разные иллюстрации стратегии, дизайна и запуска в карточки услуг", () => {
    expect(homeSource).toContain("const serviceIllustrations = [Compass, PanelsTopLeft, Rocket];");
    expect(homeSource).toContain('className="service-stage-icon"');
    expect(stylesSource).toContain(".service-stage-icon { position:absolute;");
    expect(stylesSource).toContain("@keyframes service-icon-float");
    expect(stylesSource).toContain(".service-stage-icon { animation:service-icon-float 4.6s");
  });
});
