import Image from "next/image";
import { LiveWave } from "./live-wave";

const physiologyNotes = [
  {
    label: "Breath",
    title: "Short, shallow breaths turn into slower, fuller cycles.",
  },
  {
    label: "Muscles",
    title: "Tension you've been holding starts to let go.",
  },
  {
    label: "Attention",
    title: "Focus takes less effort and settles back into the body.",
  },
];

export function PhilosophySection() {
  return (
    <section id="philosophy" className="bg-background px-6 pt-20 pb-24 md:px-12 md:pt-28 md:pb-36 lg:px-20">
      <div className="mx-auto max-w-[90rem]">
        <div className="grid gap-12 md:grid-cols-12 md:items-end md:gap-10">
          <div className="md:col-span-7">
            <h2 className="text-balance text-4xl font-medium leading-[0.95] tracking-tight text-foreground md:text-6xl lg:text-7xl">
              What sound does to the body.
            </h2>
            <p className="mt-8 max-w-[34rem] text-pretty text-lg leading-relaxed text-muted-foreground">
              Vibration helps the body move out of a high-alert state and into a slower, steadier rhythm. You can
              feel the change: breath deepens, held muscles soften, and attention stops racing.
            </p>
          </div>

          <div className="md:col-span-5">
            <div className="relative aspect-[4/5] w-full overflow-hidden rounded-[24px] bg-secondary">
              <Image
                src="/asset/card-4.webp"
                alt="A breathwork session with Mahima"
                fill
                sizes="(max-width: 768px) 100vw, 40vw"
                className="object-cover object-[center_18%]"
              />
            </div>
          </div>
        </div>

        <div className="mt-20 md:mt-28">
          <LiveWave />

          <div className="mt-10 grid gap-10 md:grid-cols-3 md:gap-10">
            {physiologyNotes.map((note) => (
              <div key={note.label} className="max-w-xs">
                <h3 className="text-sm font-medium text-muted-foreground">{note.label}</h3>
                <p className="mt-3 text-xl leading-snug text-foreground">{note.title}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
