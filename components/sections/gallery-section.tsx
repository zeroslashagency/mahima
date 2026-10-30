"use client";

import Image from "next/image";
import { useEffect, useLayoutEffect, useRef } from "react";

const useIsomorphicLayoutEffect = typeof window !== "undefined" ? useLayoutEffect : useEffect;

const galleryItems = [
  { type: "video", src: "/asset/opt/vid-1.mp4", poster: "/asset/opt/vid-1-poster.webp", label: "Sound bath in motion" },
  { type: "image", src: "/asset/card-2.webp", alt: "Sound Bath Session" },
  { type: "video", src: "/asset/opt/vid-2.mp4", poster: "/asset/opt/vid-2-poster.webp", label: "Breathwork flow" },
  { type: "image", src: "/asset/side-1.webp", alt: "Bowl Vibration" },
  { type: "image", src: "/asset/side-2.webp", alt: "Nature Retreat" },
  { type: "video", src: "/asset/opt/vid-3.mp4", poster: "/asset/opt/vid-3-poster.webp", label: "Meditation space ambience" },
  { type: "image", src: "/asset/card-3-upright.webp", alt: "Group Meditation" },
  { type: "image", src: "/asset/card-4.webp", alt: "Closing Circle" },
];

export function GallerySection() {
  const galleryRef = useRef<HTMLElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const videoRefs = useRef<(HTMLVideoElement | null)[]>([]);

  useIsomorphicLayoutEffect(() => {
    const section = galleryRef.current;
    const container = containerRef.current;
    if (!section || !container) return;

    let frame: number | null = null;

    const update = () => {
      const rect = section.getBoundingClientRect();
      const totalScrollDistance = Math.max(0, container.scrollWidth - window.innerWidth);
      const scrolled = Math.max(0, -rect.top);
      const progress = totalScrollDistance > 0 ? Math.min(1, scrolled / totalScrollDistance) : 0;
      container.style.transform = `translate3d(${progress * -totalScrollDistance}px, 0, 0)`;
    };

    const measure = () => {
      const extra = Math.max(0, container.scrollWidth - window.innerWidth);
      section.style.height = `${window.innerHeight + extra}px`;
      update();
    };

    const schedule = (fn: () => void) => () => {
      if (frame !== null) cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        frame = null;
        fn();
      });
    };

    const onScroll = schedule(update);
    const onResize = schedule(measure);

    measure();

    const resizeObserver = new ResizeObserver(onResize);
    resizeObserver.observe(container);
    window.addEventListener("resize", onResize, { passive: true });
    window.addEventListener("scroll", onScroll, { passive: true });

    return () => {
      resizeObserver.disconnect();
      window.removeEventListener("resize", onResize);
      window.removeEventListener("scroll", onScroll);
      if (frame !== null) cancelAnimationFrame(frame);
    };
  }, []);

  useEffect(() => {
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const saveData = (navigator as Navigator & { connection?: { saveData?: boolean } }).connection?.saveData === true;
    if (reducedMotion || saveData) return;

    const videos = videoRefs.current.filter((video): video is HTMLVideoElement => video !== null);
    if (videos.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const video = entry.target as HTMLVideoElement;
          if (entry.isIntersecting) {
            video.play().catch(() => {});
          } else {
            video.pause();
          }
        });
      },
      { rootMargin: "200px" }
    );

    videos.forEach((video) => observer.observe(video));

    return () => {
      observer.disconnect();
      videos.forEach((video) => video.pause());
    };
  }, []);

  return (
    <section
      id="gallery"
      ref={galleryRef}
      className="relative h-[calc(100vh_+_580vw_+_216px)] bg-background md:h-[calc(100vh_+_156vw_+_216px)] lg:h-[calc(100vh_+_108vw_+_216px)] xl:h-[calc(100vh_+_92vw_+_216px)]"
    >
      {/* Sticky container */}
      <div className="sticky top-0 h-screen overflow-hidden">
        <div className="flex h-full items-center">
          {/* Horizontal scrolling container */}
          <div
            ref={containerRef}
            className="flex gap-6 px-6 will-change-transform"
            style={{
              transform: "translate3d(0px, 0, 0)",
              touchAction: "pan-y",
            }}
          >
            {galleryItems.map((item, index) => (
              <div
                key={index}
                className="relative h-[70vh] w-[85vw] flex-shrink-0 overflow-hidden rounded-2xl md:h-[60vh] md:w-[32vw] lg:w-[26vw] xl:w-[24vw]"
              >
                {item.type === "video" ? (
                  <video
                    ref={(el) => {
                      videoRefs.current[index] = el;
                    }}
                    loop
                    muted
                    playsInline
                    preload="none"
                    poster={item.poster}
                    aria-label={item.label}
                    className="absolute inset-0 h-full w-full object-cover"
                  >
                    <source src={item.src} type="video/mp4" />
                    <track
                      kind="captions"
                      src="/captions/ambient.vtt"
                      srcLang="en"
                      label="English"
                    />
                  </video>
                ) : (
                  <Image
                    src={item.src || "/placeholder.svg"}
                    alt={item.alt ?? ""}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 85vw, (max-width: 1024px) 32vw, 24vw"
                  />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
