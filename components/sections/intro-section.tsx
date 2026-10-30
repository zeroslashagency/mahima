import Link from "next/link";
import { PlusField } from "./plus-field";
import { RotatingWord } from "./rotating-word";

const audiences = ["busy minds", "tired bodies", "teams at work", "new parents", "anyone who can't switch off"];

const practices = [
  { word: "singing bowls", color: "#b5651d" },
  { word: "gongs", color: "#8a5a44" },
  { word: "breathwork", color: "#5f7f63" },
  { word: "silence", color: "#4b5a7a" },
];

export function IntroSection() {
  return (
    <section id="intro" className="bg-background px-6 py-24 md:px-12 md:py-36 lg:px-20">
      <div className="mx-auto max-w-[36rem] md:max-w-[46rem]">
        <p className="intro-rise font-serif text-6xl italic leading-none text-foreground md:text-8xl">Namaste,</p>

        <div className="mt-10 md:mt-12">
          <PlusField />
        </div>

        <p
          className="intro-rise mt-10 text-pretty text-[1.75rem] leading-snug tracking-tight text-foreground md:mt-12 md:text-[2.5rem] md:leading-[1.2]"
          style={{ animationDelay: "0.15s" }}
        >
          I'm Mahima. I help <RotatingWord words={audiences} /> find their way back to calm through{" "}
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
          I listen first, then let the sound do the rest.
        </p>

        <div className="intro-rise mt-10 flex flex-wrap gap-3" style={{ animationDelay: "0.45s" }}>
          <Link
            href="#products"
            className="rounded-full bg-foreground px-6 py-3 text-base font-medium text-background transition-opacity hover:opacity-80"
          >
            See sessions →
          </Link>
          <Link
            href="/play"
            className="rounded-full border border-border bg-background px-6 py-3 text-base font-medium text-foreground transition-colors hover:bg-secondary"
          >
            Strike a bowl
          </Link>
        </div>
      </div>
    </section>
  );
}
