"use client";

import Link from "next/link";
import { motion, useScroll, useTransform } from "framer-motion";

const supporterCards = [
  {
    name: "Cara",
    detail: "Building a quieter platform for artists and independent thinkers.",
    supporters: "8,780 supporters",
    position: "-left-16 top-28 -rotate-[2deg]",
    driftX: -48,
    driftY: -10,
  },
  {
    name: "Kaleigh",
    detail: "Creating indoor cycling and strength sessions on YouTube.",
    supporters: "4,488 supporters",
    position: "-left-8 top-[21rem] rotate-[5deg]",
    driftX: -72,
    driftY: 10,
  },
  {
    name: "Stefano",
    detail: "Teaching YouTube videos and podcast craft for first-time creators.",
    supporters: "641 supporters",
    position: "-left-14 top-[35rem] -rotate-[6deg]",
    driftX: -52,
    driftY: 28,
  },
  {
    name: "Thrift",
    detail: "Creating thrifting videos with a warm, witty voice.",
    supporters: "112 supporters",
    position: "-right-8 top-32 rotate-[6deg]",
    driftX: 48,
    driftY: -8,
  },
  {
    name: "Beach Talk",
    detail: "A podcast for long-form stories, radio voices, and culture.",
    supporters: "1,805 supporters",
    position: "-right-20 top-[20rem] -rotate-[5deg]",
    driftX: 76,
    driftY: 14,
  },
  {
    name: "Simple Politics",
    detail: "Helping people have better conversations about politics.",
    supporters: "3,206 supporters",
    position: "-right-10 top-[35rem] rotate-[4deg]",
    driftX: 54,
    driftY: 26,
  },
];

type SupporterCard = (typeof supporterCards)[number];

function FloatingSupporterCard({
  card,
  scrollY,
  opacity,
  scale,
  blur,
}: {
  card: SupporterCard;
  scrollY: ReturnType<typeof useScroll>["scrollY"];
  opacity: ReturnType<typeof useTransform<number, number>>;
  scale: ReturnType<typeof useTransform<number, number>>;
  blur: ReturnType<typeof useTransform<number, number>>;
}) {
  const x = useTransform(scrollY, [0, 260], [0, card.driftX]);
  const y = useTransform(scrollY, [0, 260], [0, card.driftY]);
  const filter = useTransform(blur, (value) => `blur(${value}px)`);

  return (
    <motion.div
      className={`absolute w-[12.5rem] rounded-[2rem] border border-[#ece4d6] bg-white/92 p-5 shadow-[0_24px_60px_rgba(66,46,19,0.08)] backdrop-blur-sm ${card.position}`}
      style={{ opacity, scale, x, y, filter }}
    >
      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#111111] text-xl font-semibold text-white">
        {card.name.slice(0, 1)}
      </div>
      <p className="mt-4 text-[1rem] font-medium leading-6 text-[#201d1a]">{card.detail}</p>
      <p className="mt-4 text-sm text-[#7a6f62]">{card.supporters}</p>
    </motion.div>
  );
}

export function HeroSection() {
  const { scrollY } = useScroll();
  const cardsOpacity = useTransform(scrollY, [0, 140, 260], [1, 0.55, 0]);
  const cardsScale = useTransform(scrollY, [0, 260], [1, 0.9]);
  const cardsBlur = useTransform(scrollY, [0, 260], [0, 10]);

  return (
    <section className="bg-background">
      <div className="relative isolate overflow-hidden bg-[#faf6ed]">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.95),rgba(250,246,237,0.88)_42%,rgba(245,239,228,0.96)_100%)]" />
        <div className="pointer-events-none absolute inset-x-0 top-0 h-48 bg-[linear-gradient(180deg,rgba(255,255,255,0.85),transparent)]" />

        <div className="relative mx-auto min-h-[100dvh] max-w-[90rem] px-6 pb-18 pt-32 md:px-10 md:pb-24 md:pt-40 lg:px-14">
          <div className="hidden lg:block">
            {supporterCards.map((card) => (
              <FloatingSupporterCard
                key={card.name}
                card={card}
                scrollY={scrollY}
                opacity={cardsOpacity}
                scale={cardsScale}
                blur={cardsBlur}
              />
            ))}
          </div>

          <div className="mx-auto flex max-w-5xl flex-col items-center text-center">
            <div className="inline-flex items-center gap-3 rounded-full bg-white/78 px-5 py-2 text-sm text-[#3d4333] shadow-[0_12px_30px_rgba(66,46,19,0.06)]">
              <div className="flex items-center gap-2">
                <span className="h-2.5 w-2.5 rounded-full bg-[#5d924d]" />
                <span className="h-2.5 w-2.5 rounded-full bg-[#5d924d]" />
                <span className="h-2.5 w-2.5 rounded-full bg-[#5d924d]" />
                <span className="h-2.5 w-2.5 rounded-full bg-[#5d924d]" />
                <span className="h-2.5 w-2.5 rounded-full bg-[#5d924d]" />
              </div>
              <span>Loved by clients across Delhi NCR</span>
            </div>

            <h1 className="mt-10 max-w-4xl text-[clamp(4rem,11vw,8.6rem)] font-semibold leading-[0.9] tracking-[-0.08em] text-[#171512]">
              Heal with
              <br />
              Mahima
            </h1>

            <p className="mt-6 max-w-2xl text-xl leading-9 text-[#4e473f] md:text-[1.9rem] md:leading-[1.45]">
              Accept support for your nervous system. Book a session, slow the body down, and leave lighter than you arrived.
            </p>

            <div className="mt-10 flex flex-col items-center gap-5">
              <Link
                href="#reserve"
                className="rounded-full bg-[#ffd84c] px-10 py-5 text-2xl font-semibold tracking-[-0.03em] text-[#181611] shadow-[0_22px_44px_rgba(255,208,54,0.28)] transition-transform duration-300 hover:-translate-y-1"
              >
                Book my session
              </Link>
              <p className="text-lg text-[#675d52]">Private sessions, sound baths, and corporate wellness in under a minute.</p>
            </div>
          </div>
        </div>
      </div>

    </section>
  );
}
