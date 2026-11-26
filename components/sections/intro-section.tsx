import Link from "next/link";
import { PlusField } from "./plus-field";
import { RotatingWord } from "./rotating-word";
import { introContent } from "@/lib/cms";

const { audiences, practices, buttons } = introContent;

export function IntroSection() {
  return (
    <section id="intro" className="bg-background px-6 py-24 md:px-12 md:py-36 lg:px-20">
      <div className="mx-auto max-w-[36rem] md:max-w-[46rem]">
        <p className="intro-rise font-serif text-6xl italic leading-none text-foreground md:text-8xl">{introContent.greeting}</p>

        <div className="mt-10 md:mt-12">
          <PlusField />
        </div>

        <p
          className="intro-rise mt-10 text-pretty text-[1.75rem] leading-snug tracking-tight text-foreground md:mt-12 md:text-[2.5rem] md:leading-[1.2]"
          style={{ animationDelay: "0.15s" }}
        >
          {introContent.leadPrefix} <RotatingWord words={audiences} /> {introContent.leadSuffix}{" "}
          {practices.map((p, i) => (
            <span key={p.word}>
              <span style={{ color: p.color }}>{p.word}</span>
              {i < practices.length - 2 ? ", " : i === practices.length - 2 ? " and " : ""}
            </span>
          ))}
          .
        </p>

        <p
          className="intro-rise mt-6 font-serif text-xl italic md:text-2xl text-muted-foreground"
          style={{ animationDelay: "0.3s" }}
        >
          {introContent.tagline}
        </p>

        <div className="intro-rise mt-10 flex flex-wrap gap-3" style={{ animationDelay: "0.45s" }}>
          {buttons.map((button, index) => (
            <Link
              key={button.label}
              href={button.href}
              className={
                index === 0
                  ? "rounded-full bg-foreground px-6 py-3 text-base font-medium text-background transition-opacity hover:opacity-80"
                  : "rounded-full border border-border bg-background px-6 py-3 text-base font-medium text-foreground transition-colors hover:bg-secondary"
              }
            >
              {button.label}
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
