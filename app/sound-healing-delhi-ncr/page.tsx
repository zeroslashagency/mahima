"use client";

import { Header } from "@/components/header";
import { FooterSection } from "@/components/sections/footer-section";
import Link from "next/link";

export const metadata = {
  title: "Sound Healing in Delhi NCR",
  description:
    "Private and group sound healing sessions in Delhi-NCR. Restore calm, reduce stress, and realign your nervous system with curated sound journeys.",
  alternates: {
    canonical: "/sound-healing-delhi-ncr",
  },
};

export default function SoundHealingPage() {
  return (
    <main className="min-h-screen bg-background">
      <Header />
      <section className="px-6 pt-32 pb-20 md:px-12 lg:px-20">
        <div className="mx-auto max-w-3xl text-center">
          <p className="text-xs uppercase tracking-widest text-muted-foreground">
            Sound Healing
          </p>
          <h1 className="mt-6 text-4xl font-medium tracking-tight text-foreground md:text-5xl">
            Sound Healing in Delhi NCR
          </h1>
          <p className="mt-6 text-base leading-relaxed text-muted-foreground md:text-lg">
            Experience immersive sound baths and one-on-one sessions designed to
            calm the mind, release tension, and guide you into deep restorative
            states. Mahima blends Himalayan singing bowls, gongs, and breathwork
            to help you reset your nervous system and reconnect with inner
            stillness.
          </p>
          <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link
              href="/contact"
              className="rounded-full bg-foreground px-6 py-3 text-sm font-medium text-background transition-opacity hover:opacity-80"
            >
              Book a Private Session
            </Link>
            <Link
              href="/services"
              className="rounded-full border border-border px-6 py-3 text-sm font-medium text-foreground transition-colors hover:bg-secondary"
            >
              View All Offerings
            </Link>
          </div>
        </div>
      </section>
      <section className="px-6 pb-24 md:px-12 lg:px-20">
        <div className="mx-auto grid max-w-5xl gap-6 md:grid-cols-3">
          {[
            {
              title: "Private Sessions",
              text: "Personalized sound journeys tailored to your goals and energy.",
            },
            {
              title: "Group Sound Baths",
              text: "Shared immersive experiences for community healing.",
            },
            {
              title: "Breath + Sound",
              text: "Breathwork sequences that deepen the vibrational reset.",
            },
          ].map((item) => (
            <div key={item.title} className="rounded-2xl border border-border p-6">
              <h3 className="text-lg font-medium text-foreground">{item.title}</h3>
              <p className="mt-3 text-sm text-muted-foreground">{item.text}</p>
            </div>
          ))}
        </div>
      </section>
      <FooterSection />
    </main>
  );
}
