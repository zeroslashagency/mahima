"use client";

import Image from "next/image";
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
          {word}{index < words.length - 1 ? " " : ""}
        </span>
      ))}
    </p>
  );
}

const sideImages = [
  {
    src: "https://images.unsplash.com/photo-1476610182048-b716b8518aae?q=80&w=1000",
    alt: "Forest trail",
    position: "left",
    span: 1,
  },
  {
    src: "https://images.unsplash.com/photo-1511593358241-7eea1f3c84e5?q=80&w=1000",
    alt: "Mountain peak",
    position: "left",
    span: 1,
  },
  {
    src: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?q=80&w=1000",
    alt: "Alpine landscape",
    position: "right",
    span: 1,
  },
  {
    src: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=1000",
    alt: "Snow mountain",
    position: "right",
    span: 1,
  },
];

const titleWords = ["Corporate", "Wellness", "Gurgaon."];

export function TechnologySection() {
  const sectionRef = useRef<HTMLElement>(null);
  const textSectionRef = useRef<HTMLDivElement>(null);
  const bentoRef = useRef<HTMLDivElement>(null);
  const leftColumnRef = useRef<HTMLDivElement>(null);
  const rightColumnRef = useRef<HTMLDivElement>(null);
  const centerRef = useRef<HTMLDivElement>(null);
  const sideTileRefs = useRef<(HTMLDivElement | null)[]>([]);
  const titleWordRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const layoutAnimatedRef = useRef(false);

  const descriptionText = "Stress is the silent productivity killer. Mahima's corporate wellness programs use sound healing and breathwork to reduce burnout, enhance creativity, and restore team synergy. Invest in the wellbeing of your workforce and watch performance soar.";

  useRafScroll(() => {
    if (!sectionRef.current) return;

    const reducedMotion = window.matchMedia(REDUCED_MOTION_QUERY).matches;
    const animateLayout = !reducedMotion && window.matchMedia(DESKTOP_QUERY).matches;

    let scrollProgress = 0;
    if (!reducedMotion) {
      const rect = sectionRef.current.getBoundingClientRect();
      const scrollableHeight = window.innerHeight * 2;
      scrollProgress = Math.max(0, Math.min(1, -rect.top / scrollableHeight));
    }

    titleWordRefs.current.forEach((span, index) => {
      if (!span) return;
      const wordFadeStart = index * 0.07;
      const wordProgress = Math.max(0, Math.min(1, (scrollProgress - wordFadeStart) / 0.07));
      span.style.opacity = `${1 - wordProgress}`;
      span.style.filter = `blur(${wordProgress * 10}px)`;
    });

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
    const imageProgress = Math.max(0, Math.min(1, (scrollProgress - 0.2) / 0.8));
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

  const renderSideColumn = (position: "left" | "right", offset: number) =>
    sideImages
      .filter((img) => img.position === position)
      .map((img, idx) => (
        <div
          key={idx}
          ref={(el) => {
            sideTileRefs.current[offset + idx] = el;
          }}
          className="relative overflow-hidden will-change-transform"
          style={{ flex: img.span }}
        >
          <Image
            src={img.src || "/placeholder.svg"}
            alt={img.alt}
            fill
            sizes="22vw"
            className="object-cover"
          />
        </div>
      ));

  return (
    <section id="technology" ref={sectionRef} className="relative bg-foreground">
      {/* Sticky container for scroll animation */}
      <div className="overflow-hidden h-[70vh] md:sticky md:top-0 md:h-screen">
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
              {renderSideColumn("left", 0)}
            </div>

            {/* Main Center Image */}
            <div
              ref={centerRef}
              className="relative h-full w-full flex-none overflow-hidden rounded-2xl will-change-transform md:rounded-none"
            >
              <Image
                src="/asset/hero.jpg"
                alt="Aerial view of sound healing sanctuary"
                fill
                sizes="100vw"
                className="object-cover"
              />
              <div className="absolute inset-0 bg-foreground/40" />

              {/* Title Text - Fades out word by word with blur */}
              <div
                className="absolute inset-0 flex flex-col items-center justify-center px-6 text-center"
              >
                <h2 className="max-w-3xl font-medium leading-tight tracking-tight text-white md:text-5xl lg:text-7xl text-5xl">
                  {titleWords.map((word, index) => (
                    <span
                      key={index}
                      ref={(el) => {
                        titleWordRefs.current[index] = el;
                      }}
                      className="inline-block"
                      style={{
                        transition: "opacity 0.1s linear, filter 0.1s linear",
                        marginRight: index < 2 ? "0.3em" : "0",
                      }}
                    >
                      {word}
                      {index === 1 && <br />}
                    </span>
                  ))}
                </h2>
              </div>
            </div>

            {/* Right Column */}
            <div
              ref={rightColumnRef}
              className="hidden w-0 flex-col opacity-0 will-change-transform md:flex"
              style={{ transform: "translateX(100%)" }}
            >
              {renderSideColumn("right", 2)}
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
          <ScrollRevealText text={descriptionText} />
        </div>
      </div>
    </section>
  );
}
