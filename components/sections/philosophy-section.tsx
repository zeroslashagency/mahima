import Image from "next/image";

const physiologyNotes = [
  {
    label: "Breath pattern",
    title: "From shallow to slower, fuller cycles.",
  },
  {
    label: "Body response",
    title: "Muscular guarding starts to soften in the room.",
  },
  {
    label: "Attention",
    title: "Focus becomes less effortful and more embodied.",
  },
];

export function PhilosophySection() {
  return (
    <section
      id="philosophy"
      className="relative overflow-hidden bg-[linear-gradient(180deg,#faf6ed_0%,#faf6ed_26%,#f4ecdf_52%,#ece2d3_100%)] px-6 py-20 md:px-10 md:py-28 lg:px-14"
    >
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-[linear-gradient(90deg,transparent,rgba(62,49,37,0.18),transparent)]" />
      <div className="pointer-events-none absolute inset-x-0 top-0 h-56 bg-[linear-gradient(180deg,#faf6ed_0%,rgba(250,246,237,0.96)_58%,transparent_100%)]" />
      <div className="pointer-events-none absolute -left-24 top-24 h-64 w-64 rounded-full bg-[#f7efe4] blur-3xl" />
      <div className="pointer-events-none absolute right-0 top-32 h-72 w-72 rounded-full bg-[#d7c0a1]/25 blur-3xl" />

      <div className="mx-auto max-w-[90rem]">
        <div className="grid gap-14 border-t border-[#cdbca9] pt-12 lg:grid-cols-[0.78fr_1.22fr] lg:pt-16">
          <div className="max-w-2xl">
            <p className="text-[0.68rem] uppercase tracking-[0.42em] text-[#6f6255]">Why it works</p>
            <h2 className="mt-5 text-[clamp(3.2rem,7vw,7.2rem)] font-medium leading-[0.88] tracking-[-0.07em] text-[#1f1812]">
              The Science
              <br />
              of Sound.
            </h2>
            <p className="mt-6 max-w-xl text-lg leading-8 text-[#5b5045] md:text-[1.15rem]">
              Vibrational therapy helps the body shift out of high-alert states and into slower, more regulated rhythms.
              It is not a vague wellness idea. The change is physical: breath depth, muscular holding, and attention all
              respond to resonance in the room.
            </p>

            <div className="mt-10 border-t border-[#cdbca9]">
              {physiologyNotes.map((note) => (
                <div
                  key={note.label}
                  className="grid gap-3 border-b border-[#cdbca9] py-5 md:grid-cols-[10rem_1fr] md:gap-6"
                >
                  <p className="text-[0.72rem] uppercase tracking-[0.32em] text-[#7b6d5e]">{note.label}</p>
                  <p className="text-lg leading-8 text-[#2b241d]">{note.title}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="flex items-start justify-end">
            <div className="w-full max-w-[33rem]">
              <div className="overflow-hidden rounded-[3.25rem] border border-[#d8c8b7] bg-[#f6efe6] shadow-[0_32px_78px_rgba(64,44,20,0.1)]">
                <div className="relative aspect-[3/4]">
                  <Image
                    src="/asset/card-4.JPG"
                    alt="Breathwork journey"
                    fill
                    sizes="(max-width: 768px) 100vw, 38vw"
                    className="object-cover object-[center_18%]"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
