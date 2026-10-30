"use client";

import { useEffect, useRef, useState } from "react";

const BODY =
  "M465 800 Q590 835 725 800 C760 870 800 925 850 932 C950 905 1050 915 1050 990 C1050 1080 960 1128 840 1140 C870 1158 892 1192 872 1200 C780 1186 660 1190 590 1200 C520 1190 400 1186 308 1200 C288 1192 310 1158 340 1140 C220 1128 135 1080 135 990 C135 915 230 905 330 932 C380 925 420 870 465 800Z";
const LINE =
  "M535 1065 C420 990 200 860 110 822 C40 800 30 880 80 900 C150 920 230 900 270 850 C320 780 330 650 330 500 C330 395 450 395 450 500 L455 720 C460 840 720 840 725 720 L730 500 C730 395 850 395 850 500 C850 650 860 780 910 850 C950 900 1030 920 1100 900 C1150 880 1140 800 1070 822 C980 860 760 990 645 1065";

export function LogoMotion({ className = "" }: { className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [play, setPlay] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setPlay(true);
          io.disconnect();
        }
      },
      { threshold: 0.4 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      data-play={play ? "" : undefined}
      className={`logo-motion flex flex-col items-center ${className}`}
      aria-hidden="true"
    >
      <svg viewBox="20 160 1140 1060" className="w-32 overflow-visible md:w-40 lg:w-48">
        <path className="logo-motion-body" d={BODY} />
        <path
          className="logo-motion-line"
          d={LINE}
          pathLength={1}
          fill="none"
          strokeWidth={46}
          strokeLinecap="round"
        />
        <circle className="logo-motion-head" cx="590" cy="315" r="115" />
      </svg>
      <span className="logo-motion-word mt-3 whitespace-nowrap text-2xl font-light tracking-wide md:text-3xl lg:text-4xl">
        Heal with Mahima
      </span>
    </div>
  );
}
