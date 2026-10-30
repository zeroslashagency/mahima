"use client";

import { useEffect, useRef } from "react";

// A wave that starts fast and tight (high alert) and slows into long, even swells (regulated).
// It drifts slowly over time; animation pauses off-screen and respects reduced motion.
const WAVE_WIDTH = 1200;
const WAVE_HEIGHT = 120;
const STEP = 3;
const FRAME_MS = 1000 / 30;

function buildWavePath(time: number, speed: number, ampScale: number) {
  const mid = WAVE_HEIGHT / 2;
  const breath = 1 + 0.12 * Math.sin(time * 0.35);
  let phase = 0;
  let d = "";
  for (let x = 0; x <= WAVE_WIDTH; x += STEP) {
    const t = x / WAVE_WIDTH;
    phase += (0.16 * (1 - t) ** 2 + 0.012) * (STEP / 2);
    const amplitude = (34 - 16 * t) * ampScale * breath;
    const y = mid + Math.sin(phase - time * speed) * amplitude;
    d += `${x === 0 ? "M" : " L"}${x} ${y.toFixed(2)}`;
  }
  return d;
}

const lines = [{ speed: 0.9, ampScale: 1, opacity: 1, width: 1.5 }];

export function LiveWave() {
  const svgRef = useRef<SVGSVGElement>(null);
  const pathRefs = useRef<(SVGPathElement | null)[]>([]);

  useEffect(() => {
    const svg = svgRef.current;
    if (!svg) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let raf = 0;
    let visible = false;
    let last = 0;
    let elapsed = 0;

    const tick = (now: number) => {
      raf = requestAnimationFrame(tick);
      const dt = now - last;
      if (dt < FRAME_MS) return;
      last = now;
      elapsed += Math.min(dt, 100) / 1000;
      lines.forEach((line, i) => {
        pathRefs.current[i]?.setAttribute("d", buildWavePath(elapsed, line.speed, line.ampScale));
      });
    };

    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && !visible) {
        visible = true;
        last = performance.now();
        raf = requestAnimationFrame(tick);
      } else if (!entry.isIntersecting && visible) {
        visible = false;
        cancelAnimationFrame(raf);
      }
    });
    observer.observe(svg);

    return () => {
      observer.disconnect();
      cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <svg
      ref={svgRef}
      viewBox={`0 0 ${WAVE_WIDTH} ${WAVE_HEIGHT}`}
      preserveAspectRatio="none"
      className="h-16 w-full overflow-visible text-foreground md:h-24"
      aria-hidden="true"
    >
      {lines.map((line, i) => (
        <path
          key={i}
          ref={(el) => {
            pathRefs.current[i] = el;
          }}
          d={buildWavePath(0, line.speed, line.ampScale)}
          fill="none"
          stroke="currentColor"
          strokeOpacity={line.opacity}
          strokeWidth={line.width}
          strokeLinecap="round"
          vectorEffect="non-scaling-stroke"
        />
      ))}
    </svg>
  );
}
