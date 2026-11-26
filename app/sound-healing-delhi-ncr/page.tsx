import { Header } from "@/components/header";
import { FooterSection } from "@/components/sections/footer-section";
import Link from "next/link";
import { landingSoundContent as landing } from "@/lib/cms";

export const metadata = {
  title: landing.seo.title,
  description: landing.seo.description,
  alternates: {
    canonical: "/sound-healing-delhi-ncr",
  },
};

export default function SoundHealingPage() {
  return (
    <main className="min-h-screen bg-background">
      <Header variant="pill-light" />
      <section className="px-6 pt-32 pb-20 md:px-12 lg:px-20">
        <div className="mx-auto max-w-3xl text-center">
          <p className="text-xs uppercase tracking-widest text-muted-foreground">
            {landing.kicker}
          </p>
          <h1 className="mt-6 text-4xl font-medium tracking-tight text-foreground md:text-5xl">
            {landing.title}
          </h1>
          <p className="mt-6 text-base leading-relaxed text-muted-foreground md:text-lg">
            {landing.intro}
          </p>
          <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
            {landing.buttons.map((button) => (
              <Link
                key={button.label}
                href={button.href}
                className={
                  button.style === "primary"
                    ? "rounded-full bg-foreground px-6 py-3 text-sm font-medium text-background transition-opacity hover:opacity-80"
                    : "rounded-full border border-border px-6 py-3 text-sm font-medium text-foreground transition-colors hover:bg-secondary"
                }
              >
                {button.label}
              </Link>
            ))}
          </div>
        </div>
      </section>
      <section className="px-6 pb-24 md:px-12 lg:px-20">
        <div className="mx-auto grid max-w-5xl gap-6 md:grid-cols-3">
          {landing.cards.map((item) => (
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
