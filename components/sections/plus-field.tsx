"use client";

import { useEffect, useRef } from "react";

// Idle: soft ripples start at random points across the grid.
// Hover (or tap): a singing bowl forms under the pointer and sound rings rise out of it.
const COLS = 24;
const ROWS = 10;
const BASE = 0.1;
const FRAME_MS = 1000 / 30;
const RIPPLE_LIFE = 3.2;
const RING_PERIOD = 1;
const RING_LIFE = 2.6;
const TAP_HOLD = 3;

type Ripple = { x: number; y: number; born: number };

const clamp = (v: number, min: number, max: number) => Math.min(max, Math.max(min, v));
const ring = (distance: number, radius: number, width: number) => Math.exp(-((distance - radius) ** 2) / width);

// Bowl silhouette relative to the pointer cell: rim one row above, body curving down to a narrow base.
function inBowl(dx: number, dy: number) {
  const depth = dy + 1;
  if (depth < 0 || depth > 3) return false;
  return Math.abs(dx) <= 4.2 * Math.sqrt(1 - (depth / 3.3) ** 2);
}

// Android: three fading pulses in time with the sound rings.
const STRIKE_PATTERN = [14, RING_PERIOD * 1000 - 14, 9, RING_PERIOD * 1000 - 9, 5];
// Android, while the grid is on screen: one faint pulse each time an idle ripple starts.
const RIPPLE_PULSE = 12;

export function PlusField() {
  const fieldRef = useRef<HTMLDivElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);

  // Haptics run even with reduced motion: they're feedback for a tap, not animation.
  useEffect(() => {
    const field = fieldRef.current;
    if (!field || typeof navigator.vibrate !== "function") return;
    const onDown = (e: PointerEvent) => {
      if (e.pointerType !== "mouse") navigator.vibrate(STRIKE_PATTERN);
    };
    field.addEventListener("pointerdown", onDown);
    return () => field.removeEventListener("pointerdown", onDown);
  }, []);

  useEffect(() => {
    const field = fieldRef.current;
    const grid = gridRef.current;
    if (!field || !grid) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const cells = Array.from(grid.children) as HTMLElement[];
    const shown = new Float32Array(cells.length).fill(BASE);
    let ripples: Ripple[] = [{ x: COLS / 2, y: ROWS / 2, born: 0 }];
    let nextRipple = 1.2;
    let elapsed = 0;
    let last = 0;
    let raf = 0;
    let running = false;
    const canVibrate = typeof navigator.vibrate === "function" && window.matchMedia("(pointer: coarse)").matches;

    const bowl = { x: COLS / 2, y: ROWS / 2 };
    let engaged = false;
    let releaseAt = Infinity;
    let struckAt = 0;
    let presence = 0;

    const placeBowl = (e: PointerEvent) => {
      const rect = grid.getBoundingClientRect();
      const gx = ((e.clientX - rect.left) / rect.width) * COLS - 0.5;
      const gy = ((e.clientY - rect.top) / rect.height) * ROWS - 0.5;
      bowl.x = clamp(Math.round(gx), 4, COLS - 5);
      bowl.y = clamp(Math.round(gy), 1, ROWS - 3);
      if (!engaged) struckAt = elapsed;
      engaged = true;
    };

    const onMove = (e: PointerEvent) => {
      if (e.pointerType !== "mouse") return;
      releaseAt = Infinity;
      placeBowl(e);
    };
    const onDown = (e: PointerEvent) => {
      if (e.pointerType === "mouse") return;
      engaged = false; // each tap is a fresh strike, so the rings restart in time with the haptic
      placeBowl(e);
      releaseAt = elapsed + TAP_HOLD;
    };
    const onLeave = (e: PointerEvent) => {
      if (e.pointerType === "mouse") engaged = false;
    };

    const tick = (now: number) => {
      raf = requestAnimationFrame(tick);
      const dt = Math.min(now - last, 100) / 1000;
      if (dt * 1000 < FRAME_MS) return;
      last = now;
      elapsed += dt;
      const t = elapsed;

      if (t > releaseAt) {
        engaged = false;
        releaseAt = Infinity;
      }
      presence += ((engaged ? 1 : 0) - presence) * Math.min(1, dt * 6);

      if (t >= nextRipple) {
        ripples.push({ x: Math.random() * COLS, y: Math.random() * ROWS, born: t });
        nextRipple = t + 1.4 + Math.random() * 1.2;
        // Browsers only allow vibration after the visitor has tapped the page at least once.
        if (canVibrate && !engaged && navigator.userActivation?.hasBeenActive) navigator.vibrate(RIPPLE_PULSE);
      }
      ripples = ripples.filter((r) => t - r.born < RIPPLE_LIFE);

      const sinceStrike = Math.max(0, t - struckAt);

      for (let i = 0; i < cells.length; i++) {
        const x = i % COLS;
        const y = Math.floor(i / COLS);

        let idle = 0;
        for (const r of ripples) {
          const age = t - r.born;
          const d = Math.hypot(x - r.x, (y - r.y) * 1.1);
          idle = Math.max(idle, ring(d, age * 4.5, 1.2) * (1 - age / RIPPLE_LIFE));
        }

        let active = 0;
        if (presence > 0.01) {
          const dx = x - bowl.x;
          const dy = y - bowl.y;
          if (inBowl(dx, dy)) {
            active = 0.85 + 0.15 * Math.sin(t * 5 + dx * 0.6);
          } else {
            const d = Math.hypot(dx, (dy + 1.5) * 1.15);
            const rising = dy < -1 ? 1 : 0.35;
            for (let n = 0; n < 3; n++) {
              const age = (sinceStrike % RING_PERIOD) + n * RING_PERIOD;
              if (age > sinceStrike || age > RING_LIFE) continue;
              active = Math.max(active, ring(d, 2 + age * 5, 0.9) * (1 - age / RING_LIFE) * rising);
            }
          }
        }

        const value = Math.min(1, BASE + 0.85 * (idle * (1 - presence) + active * presence));
        if (Math.abs(value - shown[i]) > 0.01) {
          shown[i] = value;
          cells[i].style.opacity = value.toFixed(2);
        }
      }
    };

    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && !running) {
        running = true;
        last = performance.now();
        raf = requestAnimationFrame(tick);
      } else if (!entry.isIntersecting && running) {
        running = false;
        cancelAnimationFrame(raf);
      }
    });
    observer.observe(grid);

    field.addEventListener("pointermove", onMove);
    field.addEventListener("pointerdown", onDown);
    field.addEventListener("pointerleave", onLeave);

    return () => {
      observer.disconnect();
      cancelAnimationFrame(raf);
      field.removeEventListener("pointermove", onMove);
      field.removeEventListener("pointerdown", onDown);
      field.removeEventListener("pointerleave", onLeave);
    };
  }, []);

  return (
    <div ref={fieldRef} className="relative" aria-hidden="true">
      <div
        ref={gridRef}
        className="grid gap-1 text-foreground sm:gap-[6px] md:gap-2"
        style={{ gridTemplateColumns: `repeat(${COLS}, minmax(0, 1fr))` }}
      >
        {Array.from({ length: COLS * ROWS }, (_, i) => (
          <span key={i} className="intro-plus aspect-square" />
        ))}
      </div>
      {/* iOS has no Vibration API. Safari (17.4+) plays a system haptic when a switch toggles from a real tap,
          so a transparent label covers the grid and forwards the tap to a hidden switch. */}
      <label className="absolute inset-0 cursor-default touch-manipulation [-webkit-tap-highlight-color:transparent]">
        <input
          type="checkbox"
          // @ts-expect-error `switch` is a WebKit-only attribute missing from React's types
          switch=""
          tabIndex={-1}
          className="invisible absolute m-0 h-px w-px"
          onClick={(e) => e.stopPropagation()}
        />
      </label>
    </div>
  );
}
