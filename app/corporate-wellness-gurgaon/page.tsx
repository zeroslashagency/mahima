"use client";

import { Header } from "@/components/header";
import { FooterSection } from "@/components/sections/footer-section";
import Link from "next/link";

export const metadata = {
  title: "Corporate Wellness in Gurgaon",
  description:
    "Corporate sound healing and breathwork programs in Gurgaon to reduce burnout, improve focus, and elevate team wellbeing.",
  alternates: {
    canonical: "/corporate-wellness-gurgaon",
  },
};

export default function CorporateWellnessPage() {
  return (
    <main className="min-h-screen bg-background">
      <Header />
      <section className="px-6 pt-32 pb-20 md:px-12 lg:px-20">
        <div className="mx-auto max-w-3xl text-center">
          <p className="text-xs uppercase tracking-widest text-muted-foreground">
            Corporate Wellness
          </p>
          <h1 className="mt-6 text-4xl font-medium tracking-tight text-foreground md:text-5xl">
            Corporate Wellness in Gurgaon
          </h1>
          <p className="mt-6 text-base leading-relaxed text-muted-foreground md:text-lg">
            Support your teams with sound healing and breathwork sessions that
            reduce stress, enhance creativity, and restore focus. Programs are
            designed for leadership offsites, wellness weeks, and ongoing team
            care.
          </p>
          <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link
              href="/contact"
              className="rounded-full bg-foreground px-6 py-3 text-sm font-medium text-background transition-opacity hover:opacity-80"
            >
              Request a Corporate Proposal
            </Link>
            <Link
              href="/services"
              className="rounded-full border border-border px-6 py-3 text-sm font-medium text-foreground transition-colors hover:bg-secondary"
            >
              View Corporate Programs
            </Link>
          </div>
        </div>
      </section>
      <section className="px-6 pb-24 md:px-12 lg:px-20">
        <div className="mx-auto grid max-w-5xl gap-6 md:grid-cols-3">
          {[
            {
              title: "On-site Sessions",
              text: "Curated sound baths at your office or retreat.",
            },
            {
              title: "Team Breathwork",
              text: "Guided breathwork for focus and emotional release.",
            },
            {
              title: "Wellness Weeks",
              text: "Multi-session formats for sustained impact.",
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
