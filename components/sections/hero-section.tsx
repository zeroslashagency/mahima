"use client";

import Image from "next/image";
import { useEffect, useRef, type CSSProperties } from "react";
import { LogoMotion } from "@/components/brand/logo-motion";
import { WaterSurface } from "./water-surface";

const sideImages = [
  {
    src: "/asset/side-1.webp",
    alt: "Meditation Space",
    position: "left",
    span: 1,
  },
  {
    src: "/asset/side-2.webp",
    alt: "Sound Healing Session",
    position: "left",
    span: 1,
  },
  {
    src: "/asset/side-3.webp",
    alt: "Peaceful Sanctuary",
    position: "right",
    span: 1,
  },
  {
    src: "/asset/card-4.webp",
    alt: "Gong Detail",
    position: "right",
    span: 1,
  },
];

export function HeroSection() {
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const desktopQuery = window.matchMedia("(min-width: 768px)");
    const reducedMotionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");

    let teardown: (() => void) | null = null;

    const attachMotion = () => {
      const section = sectionRef.current;
      if (!section) return () => {};

      let scrollFrame = 0;

      const updateScroll = () => {
        scrollFrame = 0;
        const rect = section.getBoundingClientRect();
        const progress = Math.max(0, Math.min(1, -rect.top / (window.innerHeight * 2)));
        section.style.setProperty("--hero-p", progress.toFixed(4));
      };

      const onScroll = () => {
        if (!scrollFrame) scrollFrame = requestAnimationFrame(updateScroll);
      };

      window.addEventListener("scroll", onScroll, { passive: true });
      window.addEventListener("resize", onScroll, { passive: true });
      updateScroll();

      return () => {
        window.removeEventListener("scroll", onScroll);
        window.removeEventListener("resize", onScroll);
        cancelAnimationFrame(scrollFrame);
        section.style.setProperty("--hero-p", "0");
      };
    };

    const sync = () => {
      teardown?.();
      teardown = null;
      const isDesktop = desktopQuery.matches;
      const reducedMotion = reducedMotionQuery.matches;
      if (isDesktop && !reducedMotion) teardown = attachMotion();
    };

    sync();
    desktopQuery.addEventListener("change", sync);
    reducedMotionQuery.addEventListener("change", sync);

    return () => {
      desktopQuery.removeEventListener("change", sync);
      reducedMotionQuery.removeEventListener("change", sync);
      teardown?.();
    };
  }, []);

  const sideColumnClass =
    "hidden min-w-0 flex-col will-change-transform md:flex md:[flex:calc(var(--hero-p)*22)_1_0%] md:gap-[calc(var(--hero-p)*16px)] md:opacity-[var(--hero-p)]";

  const renderSideImages = (position: "left" | "right") =>
    sideImages
      .filter((img) => img.position === position)
      .map((img, idx) => (
        <div
          key={idx}
          className="relative overflow-hidden rounded-[calc(var(--hero-p)*24px)] will-change-transform"
          style={{ flex: img.span }}
        >
          <Image src={img.src} alt={img.alt} fill sizes="22vw" className="object-cover" />
        </div>
      ));

  return (
    <section
      ref={sectionRef}
      className="relative bg-background"
      style={{ "--hero-p": 0 } as CSSProperties}
    >
      {/* Own wrapper so the sticky hero unpins before the logo, instead of covering it. */}
      <div>
        <div className="h-[100lvh] min-h-[420px] overflow-hidden md:sticky md:top-0 md:h-screen">
          <div className="flex h-full w-full items-center justify-center">
            <div className="relative flex h-full w-full items-stretch md:gap-[calc(var(--hero-p)*16px)] md:p-[calc(var(--hero-p)*16px)] md:pb-[calc(var(--hero-p)*100px)]">
              <div
                className={`${sideColumnClass} md:[transform:translateX(calc(-100%_+_var(--hero-p)*100%))_translateY(calc(var(--hero-p)*-15%))]`}
              >
                {renderSideImages("left")}
              </div>

              <div className="relative h-full min-w-0 flex-1 overflow-hidden will-change-transform md:h-[calc(100%_-_var(--hero-p)*30%)] md:rounded-[calc(var(--hero-p)*24px)] md:[flex:calc(100_-_var(--hero-p)*44)_1_0%]">
                <WaterSurface />
              </div>

              <div
                className={`${sideColumnClass} md:[transform:translateX(calc(100%_-_var(--hero-p)*100%))_translateY(calc(var(--hero-p)*-15%))]`}
              >
                {renderSideImages("right")}
              </div>
            </div>
          </div>
        </div>

        <div className="h-0 md:h-[200vh] md:motion-reduce:h-0" />
      </div>

      {/* Shrunk box ends 30vh+65px above the frame bottom; pull the logo up into that space. */}
      <div className="relative z-10 px-6 pt-4 pb-10 md:px-12 md:pt-10 md:pb-24 md:motion-safe:-mt-[calc(30vh+65px)] lg:px-20 lg:pt-12 lg:pb-32">
        <p className="sr-only">Heal with Mahima: Delhi-NCR&apos;s Premium Sound Healing</p>
        <LogoMotion className="mx-auto" />
      </div>
    </section>
  );
}
