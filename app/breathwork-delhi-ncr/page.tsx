import { Header } from "@/components/header";
import { FooterSection } from "@/components/sections/footer-section";
import Link from "next/link";

export const metadata = {
  title: "Breathwork in Delhi NCR",
  description:
    "Guided breathwork journeys in Delhi-NCR to reduce stress, build clarity, and release emotional tension.",
  alternates: {
    canonical: "/breathwork-delhi-ncr",
  },
};

export default function BreathworkPage() {
  return (
    <main className="min-h-screen bg-background">
      <Header />
      <section className="px-6 pt-32 pb-20 md:px-12 lg:px-20">
        <div className="mx-auto max-w-3xl text-center">
          <p className="text-xs uppercase tracking-widest text-muted-foreground">
            Breathwork
          </p>
          <h1 className="mt-6 text-4xl font-medium tracking-tight text-foreground md:text-5xl">
            Breathwork in Delhi NCR
          </h1>
          <p className="mt-6 text-base leading-relaxed text-muted-foreground md:text-lg">
            Breath is the fastest way to shift your state. These guided sessions
            combine rhythmic breathing, intention setting, and grounding to help
            you clear mental noise and unlock a calmer, more focused nervous
            system.
          </p>
          <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link
              href="/contact"
              className="rounded-full bg-foreground px-6 py-3 text-sm font-medium text-background transition-opacity hover:opacity-80"
            >
              Reserve a Breathwork Session
            </Link>
            <Link
              href="/services"
              className="rounded-full border border-border px-6 py-3 text-sm font-medium text-foreground transition-colors hover:bg-secondary"
            >
              Explore Full Programs
            </Link>
          </div>
        </div>
      </section>
      <section className="px-6 pb-24 md:px-12 lg:px-20">
        <div className="mx-auto grid max-w-5xl gap-6 md:grid-cols-3">
          {[
            {
              title: "Stress Release",
              text: "Gentle sessions designed to calm and decompress.",
            },
            {
              title: "Clarity + Focus",
              text: "Breathing techniques to boost mental clarity and energy.",
            },
            {
              title: "Deep Reset",
              text: "Long-form journeys for emotional release and recovery.",
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
