"use client";

import { corporateContent } from "@/lib/corporate-content";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef } from "react";

const DESKTOP_QUERY = "(min-width: 768px)";
const REDUCED_MOTION_QUERY = "(prefers-reduced-motion: reduce)";

function useRafScroll(update: () => void, watchQueries = false) {
  const updateRef = useRef(update);

  useEffect(() => {
    updateRef.current = update;
  });

  useEffect(() => {
    let frame: number | null = null;
    const schedule = () => {
      if (frame !== null) return;
      frame = requestAnimationFrame(() => {
        frame = null;
        updateRef.current();
      });
    };

    const queries = watchQueries
      ? [window.matchMedia(DESKTOP_QUERY), window.matchMedia(REDUCED_MOTION_QUERY)]
      : [window.matchMedia(REDUCED_MOTION_QUERY)];

    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule, { passive: true });
    queries.forEach((mql) => mql.addEventListener("change", schedule));
    updateRef.current();

    return () => {
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
      queries.forEach((mql) => mql.removeEventListener("change", schedule));
      if (frame !== null) cancelAnimationFrame(frame);
    };
  }, [watchQueries]);
}

const REVEALED_COLOR = "var(--foreground)";
const HIDDEN_COLOR = "#e4e4e7";

function ScrollRevealText({ text }: { text: string }) {
  const containerRef = useRef<HTMLParagraphElement>(null);
  const wordRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const revealedCountRef = useRef(0);

  const words = text.split(" ");

  useRafScroll(() => {
    if (!containerRef.current) return;

    let progress = 1;
    if (!window.matchMedia(REDUCED_MOTION_QUERY).matches) {
      const rect = containerRef.current.getBoundingClientRect();
      const windowHeight = window.innerHeight;
      const startOffset = windowHeight * 0.9;
      const endOffset = windowHeight * 0.1;
      const totalDistance = startOffset - endOffset;
      const currentPosition = startOffset - rect.top;
      progress = Math.max(0, Math.min(1, currentPosition / totalDistance));
    }

    const spans = wordRefs.current;
    const total = spans.length;
    let revealedCount = 0;
    for (let i = 0; i < total; i++) {
      if (progress > i / total) revealedCount = i + 1;
    }
    if (revealedCount === revealedCountRef.current) return;

    const from = Math.min(revealedCount, revealedCountRef.current);
    const to = Math.max(revealedCount, revealedCountRef.current);
    for (let i = from; i < to; i++) {
      const span = spans[i];
      if (!span) continue;
      const revealed = i < revealedCount;
      span.style.color = revealed ? REVEALED_COLOR : HIDDEN_COLOR;
      span.dataset.revealed = revealed ? "true" : "false";
    }
    revealedCountRef.current = revealedCount;
  });

  return (
    <p
      ref={containerRef}
      className="text-3xl font-semibold leading-snug md:text-4xl lg:text-5xl"
    >
      {words.map((word, index) => (
        <span
          key={index}
          ref={(el) => {
            wordRefs.current[index] = el;
          }}
          data-revealed="false"
          className="transition-colors duration-150"
          style={{ color: HIDDEN_COLOR }}
        >
          {word}
          {index < words.length - 1 ? " " : ""}
        </span>
      ))}
    </p>
  );
}

const {
  titleWords,
  mainImage,
  mainImageAlt,
  overlayLine,
  buttonText,
  buttonLink,
  leftPhoto,
  leftPhotoAlt,
  formatsLabel,
  formats,
  proofLabel,
  proofNumber,
  proofText,
  logos,
  rightPhoto,
  rightPhotoAlt,
  paragraph,
} = corporateContent;

export function TechnologySection() {
  const sectionRef = useRef<HTMLElement>(null);
  const textSectionRef = useRef<HTMLDivElement>(null);
  const bentoRef = useRef<HTMLDivElement>(null);
  const leftColumnRef = useRef<HTMLDivElement>(null);
  const rightColumnRef = useRef<HTMLDivElement>(null);
  const centerRef = useRef<HTMLDivElement>(null);
  const sideTileRefs = useRef<(HTMLDivElement | null)[]>([]);
  const titleWordRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const ctaRef = useRef<HTMLDivElement>(null);
  const layoutAnimatedRef = useRef(false);

  useRafScroll(() => {
    if (!sectionRef.current) return;

    const reducedMotion = window.matchMedia(REDUCED_MOTION_QUERY).matches;
    const desktop = window.matchMedia(DESKTOP_QUERY).matches;
    const animateLayout = !reducedMotion && desktop;

    let scrollProgress = 0;
    if (!reducedMotion) {
      const rect = sectionRef.current.getBoundingClientRect();
      const scrollableHeight = window.innerHeight * 2;
      scrollProgress = Math.max(
        0,
        Math.min(1, -rect.top / scrollableHeight),
      );
    }

    titleWordRefs.current.forEach((span, index) => {
      if (!span) return;
      const wordFadeStart = index * 0.07;
      const wordProgress = Math.max(
        0,
        Math.min(1, (scrollProgress - wordFadeStart) / 0.07),
      );
      span.style.opacity = `${1 - wordProgress}`;
      span.style.filter = `blur(${wordProgress * 10}px)`;
    });

    const cta = ctaRef.current;
    if (cta) {
      const ctaStart = Math.max(0.22, titleWords.length * 0.07 + 0.01);
      const ctaProgress =
        reducedMotion || !desktop
          ? 1
          : Math.max(0, Math.min(1, (scrollProgress - ctaStart) / 0.13));
      cta.style.opacity = `${ctaProgress}`;
      cta.style.visibility = ctaProgress === 0 ? "hidden" : "visible";
      cta.style.pointerEvents = ctaProgress === 0 ? "none" : "auto";
      cta.toggleAttribute("inert", ctaProgress === 0);
    }

    const bento = bentoRef.current;
    const center = centerRef.current;
    const columns = [leftColumnRef.current, rightColumnRef.current];
    const tiles = sideTileRefs.current;

    if (!animateLayout) {
      if (!layoutAnimatedRef.current) return;
      layoutAnimatedRef.current = false;
      bento?.style.removeProperty("gap");
      bento?.style.removeProperty("padding");
      center?.style.removeProperty("width");
      center?.style.removeProperty("border-radius");
      columns.forEach((column, index) => {
        if (!column) return;
        column.style.removeProperty("width");
        column.style.removeProperty("gap");
        column.style.removeProperty("opacity");
        column.style.transform = `translateX(${index === 0 ? -100 : 100}%)`;
      });
      tiles.forEach((tile) => tile?.style.removeProperty("border-radius"));
      return;
    }

    layoutAnimatedRef.current = true;
    const imageProgress = Math.max(
      0,
      Math.min(1, (scrollProgress - 0.2) / 0.8),
    );
    const gap = `${imageProgress * 16}px`;
    const radius = `${imageProgress * 24}px`;
    const sideWidth = `${imageProgress * 22}%`;
    const sideOffset = 100 - imageProgress * 100;

    if (bento) {
      bento.style.gap = gap;
      bento.style.padding = gap;
    }
    if (center) {
      center.style.width = `${100 - imageProgress * 58}%`;
      center.style.borderRadius = radius;
    }
    columns.forEach((column, index) => {
      if (!column) return;
      column.style.width = sideWidth;
      column.style.gap = gap;
      column.style.transform = `translateX(${index === 0 ? -sideOffset : sideOffset}%)`;
      column.style.opacity = `${imageProgress}`;
    });
    tiles.forEach((tile) => {
      if (tile) tile.style.borderRadius = radius;
    });
  }, true);

  return (
    <section id="technology" ref={sectionRef} className="relative bg-foreground">
      {/* Sticky container for scroll animation */}
      <div className="h-[70vh] overflow-hidden md:sticky md:top-0 md:h-screen">
        <div className="flex h-full w-full items-center justify-center">
          {/* Bento Grid Container */}
          <div
            ref={bentoRef}
            className="relative flex h-full w-full items-stretch justify-center gap-2 p-2 md:gap-0 md:p-0"
          >
            {/* Left Column */}
            <div
              ref={leftColumnRef}
              className="hidden w-0 flex-col opacity-0 will-change-transform md:flex"
              style={{ transform: "translateX(-100%)" }}
            >
              <div
                ref={(el) => {
                  sideTileRefs.current[0] = el;
                }}
                className="relative overflow-hidden will-change-transform"
                style={{ flex: 1 }}
              >
                <Image
                  src={leftPhoto}
                  alt={leftPhotoAlt}
                  fill
                  sizes="22vw"
                  className="object-cover"
                />
              </div>
              <div
                ref={(el) => {
                  sideTileRefs.current[1] = el;
                }}
                className="relative overflow-hidden bg-background text-foreground will-change-transform"
                style={{ flex: 1 }}
              >
                <div className="flex h-full flex-col justify-between p-[clamp(1rem,2vw,2.5rem)]">
                  <p className="min-w-0 text-xs uppercase tracking-widest text-muted-foreground [overflow-wrap:anywhere]">
                    {formatsLabel}
                  </p>
                  <ul className="min-w-0 space-y-[clamp(0.5rem,1.2vh,1rem)]">
                    {formats.map((format, index) => (
                      <li
                        key={`${format}-${index}`}
                        className="min-w-0 text-[clamp(1rem,1.55vw,1.75rem)] font-medium leading-tight [overflow-wrap:anywhere]"
                      >
                        {format}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>

            {/* Main Center Image */}
            <div
              ref={centerRef}
              className="relative h-full w-full flex-none overflow-hidden rounded-2xl will-change-transform md:rounded-none"
            >
              <Image
                src={mainImage}
                alt={mainImageAlt}
                fill
                sizes="100vw"
                className="object-cover"
              />
              <div className="absolute inset-0 bg-foreground/40" />

              <div className="absolute inset-0 flex items-center justify-center px-6 text-center">
                <div className="flex flex-col items-center gap-8">
                  {/* Title Text - Fades out word by word with blur */}
                  <h2 className="max-w-3xl text-5xl font-medium leading-tight tracking-tight text-white md:text-5xl lg:text-7xl">
                    {titleWords.map((word, index) => (
                      <span
                        key={`${word}-${index}`}
                        ref={(el) => {
                          titleWordRefs.current[index] = el;
                        }}
                        className="inline-block"
                        style={{
                          transition:
                            "opacity 0.1s linear, filter 0.1s linear",
                          marginRight:
                            index < titleWords.length - 1 ? "0.3em" : "0",
                        }}
                      >
                        {word}
                        {titleWords.length === 3 && index === 1 && <br />}
                      </span>
                    ))}
                  </h2>

                  <div
                    ref={ctaRef}
                    inert
                    className="flex max-w-xl flex-col items-center gap-6 text-white md:motion-safe:absolute md:motion-safe:left-1/2 md:motion-safe:top-1/2 md:motion-safe:-translate-x-1/2 md:motion-safe:-translate-y-1/2"
                    style={{
                      opacity: 0,
                      visibility: "hidden",
                      pointerEvents: "none",
                      transition: "opacity 0.1s linear",
                    }}
                  >
                    <p className="min-w-0 text-[clamp(2rem,4vw,4.5rem)] font-medium leading-tight tracking-tight [overflow-wrap:anywhere]">
                      {overlayLine}
                    </p>
                    <Link
                      href={buttonLink}
                      className="max-w-full rounded-full bg-white px-6 py-3 text-center text-sm font-medium text-foreground transition-opacity [overflow-wrap:anywhere] hover:opacity-80"
                    >
                      {buttonText}
                    </Link>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column */}
            <div
              ref={rightColumnRef}
              className="hidden w-0 flex-col opacity-0 will-change-transform md:flex"
              style={{ transform: "translateX(100%)" }}
            >
              <div
                ref={(el) => {
                  sideTileRefs.current[2] = el;
                }}
                className="relative overflow-hidden bg-background text-foreground will-change-transform"
                style={{ flex: 1 }}
              >
                <div className="flex h-full flex-col justify-between p-[clamp(1rem,2vw,2.5rem)]">
                  <p className="min-w-0 text-xs uppercase tracking-widest text-muted-foreground [overflow-wrap:anywhere]">
                    {proofLabel}
                  </p>
                  <div className="min-w-0">
                    {proofNumber && (
                      <p className="text-[clamp(2.5rem,5vw,6rem)] font-medium leading-none tracking-tight [overflow-wrap:anywhere]">
                        {proofNumber}
                      </p>
                    )}
                    <p className="max-w-[18ch] text-[clamp(1rem,1.55vw,1.75rem)] font-medium leading-tight [overflow-wrap:anywhere]">
                      {proofText}
                    </p>
                    {logos.length > 0 && (
                      <div className="mt-[clamp(0.75rem,2vh,1.5rem)] flex flex-wrap items-center gap-3">
                        {logos.map((logo, index) => (
                          <Image
                            key={`${logo}-${index}`}
                            src={logo}
                            alt=""
                            width={96}
                            height={32}
                            className="h-6 w-auto max-w-[42%] object-contain"
                          />
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
              <div
                ref={(el) => {
                  sideTileRefs.current[3] = el;
                }}
                className="relative overflow-hidden will-change-transform"
                style={{ flex: 1 }}
              >
                <Image
                  src={rightPhoto}
                  alt={rightPhotoAlt}
                  fill
                  sizes="22vw"
                  className="object-cover"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Scroll space to enable animation */}
      <div className="h-[12vh] md:h-[200vh]" />

      {/* Description Section with Background Image and Scroll Reveal */}
      <div
        ref={textSectionRef}
        className="relative overflow-hidden bg-background px-6 py-24 md:px-12 md:py-32 lg:px-20 lg:py-40"
      >
        {/* Text Content */}
        <div className="relative z-10 mx-auto max-w-4xl">
          <ScrollRevealText text={paragraph} />
        </div>
      </div>
    </section>
  );
}
