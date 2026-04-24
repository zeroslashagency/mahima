"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { useIsMobile } from "@/hooks/use-mobile";

const word = "MAHIMA";

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
  const [scrollProgress, setScrollProgress] = useState(0);
  const isMobile = useIsMobile();

  useEffect(() => {
    if (isMobile) {
      setScrollProgress(0);
      return;
    }
    const handleScroll = () => {
      if (!sectionRef.current) return;

      const rect = sectionRef.current.getBoundingClientRect();
      const scrollableHeight = window.innerHeight * 2;
      const scrolled = -rect.top;
      const progress = Math.max(0, Math.min(1, scrolled / scrollableHeight));

      setScrollProgress(progress);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, [isMobile]);

  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    if (isMobile) {
      setMousePosition({ x: 0, y: 0 });
      return;
    }
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({
        x: (e.clientX / window.innerWidth - 0.5) * 20,
        y: (e.clientY / window.innerHeight - 0.5) * 20,
      });
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, [isMobile]);

  const effectiveScroll = isMobile ? 0 : scrollProgress;

  // Start the hero transition as soon as scrolling begins.
  const textOpacity = isMobile ? 1 : Math.max(0, 1 - (effectiveScroll / 0.14));
  const imageProgress = isMobile ? 0 : effectiveScroll;

  // Keep the hero full width until the side columns are meaningfully visible.
  const showSideColumns = !isMobile && imageProgress > 0.005;
  const centerFlex = showSideColumns ? 100 - (imageProgress * 44) : 1; // 100 to 56 once columns are active
  const centerHeight = isMobile ? 100 : 100 - (imageProgress * 30); // 100% to 70%
  const sideFlex = showSideColumns ? imageProgress * 22 : 0; // 0 to 22
  const sideOpacity = showSideColumns ? imageProgress : 0;
  const sideTranslateLeft = showSideColumns ? -100 + (imageProgress * 100) : -100; // -100% to 0%
  const sideTranslateRight = showSideColumns ? 100 - (imageProgress * 100) : 100; // 100% to 0%
  const borderRadius = isMobile ? 16 : imageProgress * 24; // 0px to 24px
  const gap = isMobile ? 8 : imageProgress * 16; // 0px to 16px

  // Vertical offset for side columns to move them up on mobile
  const sideTranslateY = isMobile ? 0 : -(imageProgress * 15); // Move up by 15% when fully expanded

  // Mouse move transform for the video
  const mouseTransform = isMobile ? "translate3d(0, 0, 0) scale(1.02)" : `translate3d(${mousePosition.x}px, ${mousePosition.y}px, 0) scale(1.05)`;

  if (isMobile) {
    return (
      <section ref={sectionRef} className="relative bg-background">
        <div className="h-[72vh] min-h-[420px] px-4 pt-4 pb-6">
          <div className="relative h-full w-full overflow-hidden rounded-[24px]">
            <Image
              src="/asset/hero-poster.webp"
              alt="Heal with Mahima sanctuary"
              fill
              priority
              sizes="100vw"
              className="object-cover"
            />

            <div className="absolute inset-0 flex items-end overflow-hidden">
              <h1 className="w-full text-[16vw] font-medium leading-[0.8] tracking-tighter text-white">
                {word.split("").map((letter, index) => (
                  <span
                    key={index}
                    className="inline-block animate-[slideUp_0.8s_ease-out_forwards] opacity-0"
                    style={{
                      animationDelay: `${index * 0.08}s`,
                      transition: "all 1.5s",
                      transitionTimingFunction: "cubic-bezier(0.86, 0, 0.07, 1)",
                    }}
                  >
                    {letter}
                  </span>
                ))}
              </h1>
            </div>
          </div>
        </div>

        <div className="px-6 pt-4 pb-10">
          <p className="mx-auto max-w-2xl text-center text-2xl leading-relaxed text-muted-foreground">
            Delhi-NCR&apos;s Premium
            <br />
            Sound Healing
          </p>
        </div>
      </section>
    );
  }

  return (
    <section ref={sectionRef} className="relative bg-background">
      {/* Sticky container for scroll animation */}
      <div className="overflow-hidden h-[72vh] min-h-[420px] md:sticky md:top-0 md:h-screen">
        <div className="flex h-full w-full items-center justify-center">
          {/* Bento Grid Container */}
          <div
            className="relative flex h-full w-full items-stretch"
            style={{
              gap: `${gap}px`,
              padding: `${isMobile ? 8 : imageProgress * 16}px`,
              paddingBottom: `${isMobile ? 16 : 60 + (imageProgress * 40)}px`,
            }}
          >

            {/* Left Column */}
            <div
              className="min-w-0 flex-col will-change-transform"
              style={{
                display: showSideColumns ? "flex" : "none",
                flex: `${sideFlex} 1 0%`,
                gap: `${gap}px`,
                transform: `translateX(${sideTranslateLeft}%) translateY(${sideTranslateY}%)`,
                opacity: sideOpacity,
              }}
            >
              {sideImages.filter(img => img.position === "left").map((img, idx) => (
                <div
                  key={idx}
                  className="relative overflow-hidden will-change-transform"
                  style={{
                    flex: img.span,
                    borderRadius: `${borderRadius}px`,
                  }}
                >
                  <Image
                    src={img.src || "/placeholder.svg"}
                    alt={img.alt}
                    fill
                    priority
                    className="object-cover"
                  />
                </div>
              ))}
            </div>

            {/* Main Hero Image - Center */}
            <div
              className="relative min-w-0 overflow-hidden will-change-transform"
              style={{
                flex: `${centerFlex} 1 0%`,
                height: `${centerHeight}%`,
                borderRadius: `${borderRadius}px`,
              }}
            >
              {isMobile ? (
                <Image
                  src="/asset/hero-poster.webp"
                  alt="Heal with Mahima sanctuary"
                  fill
                  priority
                  sizes="(max-width: 768px) 100vw, 50vw"
                  className="object-cover"
                />
              ) : (
                <video
                  autoPlay
                  loop
                  muted
                  playsInline
                  poster="/asset/hero-poster.webp"
                  className="absolute inset-0 h-full w-full object-cover transition-transform duration-300 ease-out"
                  style={{ transform: mouseTransform }}
                >
                  <source src="/asset/hero-opt.webm" type="video/webm" />
                  <source src="/asset/hero-opt.mp4" type="video/mp4" />
                  <track
                    kind="captions"
                    src="/captions/ambient.vtt"
                    srcLang="en"
                    label="English"
                  />
                </video>
              )}

              {/* Overlay Text - Fades out first */}
              <div
                className="absolute inset-0 flex items-end overflow-hidden"
                style={{ opacity: textOpacity }}
              >
                <h1 className="w-full text-[16vw] font-medium leading-[0.8] tracking-tighter text-white md:text-[22vw]">
                  {word.split("").map((letter, index) => (
                    <span
                      key={index}
                      className="inline-block animate-[slideUp_0.8s_ease-out_forwards] opacity-0"
                      style={{
                        animationDelay: `${index * 0.08}s`,
                        transition: 'all 1.5s',
                        transitionTimingFunction: 'cubic-bezier(0.86, 0, 0.07, 1)',
                      }}
                    >
                      {letter}
                    </span>
                  ))}
                </h1>
              </div>
            </div>

            {/* Right Column */}
            <div
              className="min-w-0 flex-col will-change-transform"
              style={{
                display: showSideColumns ? "flex" : "none",
                flex: `${sideFlex} 1 0%`,
                gap: `${gap}px`,
                transform: `translateX(${sideTranslateRight}%) translateY(${sideTranslateY}%)`,
                opacity: sideOpacity,
              }}
            >
              {sideImages.filter(img => img.position === "right").map((img, idx) => (
                <div
                  key={idx}
                  className="relative overflow-hidden will-change-transform"
                  style={{
                    flex: img.span,
                    borderRadius: `${borderRadius}px`,
                  }}
                >
                  <Image
                    src={img.src || "/placeholder.svg"}
                    alt={img.alt}
                    fill
                    priority
                    className="object-cover"
                  />
                </div>
              ))}
            </div>

          </div>
        </div>
      </div>

      {/* Scroll space to enable animation */}
      <div className="h-0 md:h-[200vh]" />

      {/* Tagline Section */}
      <div className="px-6 pt-4 pb-10 md:pt-48 md:px-12 md:pb-36 lg:px-20 lg:pt-56 lg:pb-44">
        <p className="mx-auto max-w-2xl text-center text-2xl leading-relaxed text-muted-foreground md:text-3xl lg:text-[2.5rem] lg:leading-snug">
          Delhi-NCR's Premium
          <br />
          Sound Healing
        </p>
      </div>
    </section>
  );
}
