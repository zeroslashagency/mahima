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
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({
        x: (e.clientX / window.innerWidth - 0.5) * 20,
        y: (e.clientY / window.innerHeight - 0.5) * 20,
      });
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  const effectiveScroll = isMobile ? 0 : scrollProgress;

  // Text fades out first (0 to 0.2)
  const textOpacity = isMobile ? 1 : Math.max(0, 1 - (effectiveScroll / 0.2));

  // Image transforms start after text fades (0.2 to 1)
  const imageProgress = isMobile ? 0 : Math.max(0, Math.min(1, (effectiveScroll - 0.2) / 0.8));

  // Smooth interpolations
  const centerWidth = isMobile ? 100 : 100 - (imageProgress * 58); // 100% to 42%
  const centerHeight = isMobile ? 100 : 100 - (imageProgress * 30); // 100% to 70%
  const sideWidth = isMobile ? 0 : imageProgress * 22; // 0% to 22%
  const sideOpacity = isMobile ? 0 : imageProgress;
  const sideTranslateLeft = isMobile ? 0 : -100 + (imageProgress * 100); // -100% to 0%
  const sideTranslateRight = isMobile ? 0 : 100 - (imageProgress * 100); // 100% to 0%
  const borderRadius = isMobile ? 16 : imageProgress * 24; // 0px to 24px
  const gap = isMobile ? 8 : imageProgress * 16; // 0px to 16px

  // Vertical offset for side columns to move them up on mobile
  const sideTranslateY = isMobile ? 0 : -(imageProgress * 15); // Move up by 15% when fully expanded

  // Mouse move transform for the video
  const mouseTransform = isMobile ? "translate3d(0, 0, 0) scale(1.02)" : `translate3d(${mousePosition.x}px, ${mousePosition.y}px, 0) scale(1.05)`;

  return (
    <section ref={sectionRef} className="relative bg-background">
      {/* Sticky container for scroll animation */}
      <div className="overflow-hidden h-[72vh] min-h-[420px] md:sticky md:top-0 md:h-screen">
        <div className="flex h-full w-full items-center justify-center">
          {/* Bento Grid Container */}
          <div
            className="relative flex h-full w-full items-stretch justify-center"
            style={{
              gap: `${gap}px`,
              padding: `${isMobile ? 8 : imageProgress * 16}px`,
              paddingBottom: `${isMobile ? 16 : 60 + (imageProgress * 40)}px`,
            }}
          >

            {/* Left Column */}
            <div
              className="hidden flex-col will-change-transform md:flex"
              style={{
                width: `${sideWidth}%`,
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
              className="relative overflow-hidden will-change-transform"
              style={{
                width: `${centerWidth}%`,
                height: `${centerHeight}%`,
                flex: "0 0 auto",
                borderRadius: `${borderRadius}px`,
              }}
            >
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
              </video>

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
              className="hidden flex-col will-change-transform md:flex"
              style={{
                width: `${sideWidth}%`,
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
