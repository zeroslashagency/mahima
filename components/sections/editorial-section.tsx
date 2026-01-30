"use client";

const specs = [
  { label: "Stress", value: "-40%" },
  { label: "Clarity", value: "Boosted" },
  { label: "Sleep", value: "Deep" },
  { label: "Energy", value: "Restored" },
];

export function EditorialSection() {
  return (
    <section className="bg-background">
      {/* Newsletter Banner */}
      <div id="reserve" className="px-6 pt-16 md:px-12 lg:px-20">
        <div className="rounded-[32px] border border-border bg-secondary px-8 py-12 text-center md:px-12">
          <p className="text-xs uppercase tracking-widest text-muted-foreground">
            Private Bookings
          </p>
          <h3 className="mt-4 text-3xl font-medium tracking-tight text-foreground md:text-4xl">
            Reserve a Sound Healing Session
          </h3>
          <p className="mx-auto mt-4 max-w-2xl text-sm text-muted-foreground md:text-base">
            One-on-one sound journeys and breathwork sessions tailored to your goals.
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-4 md:flex-row">
            <button className="rounded-full bg-foreground px-6 py-3 text-sm font-medium text-background transition-opacity hover:opacity-80">
              Book a Session
            </button>
            <button className="rounded-full border border-border px-6 py-3 text-sm font-medium text-foreground transition-colors hover:bg-background">
              View Availability
            </button>
          </div>
        </div>
      </div>


      {/* Decorative Icons */}
      <div className="flex items-center justify-center gap-6 pb-20">


      </div>

      {/* Specs Grid */}
      <div className="grid grid-cols-2 border-t border-border md:grid-cols-4">
        {specs.map((spec) => (
          <div
            key={spec.label}
            className="border-b border-r border-border p-8 text-center last:border-r-0 md:border-b-0"
          >
            <p className="mb-2 text-xs uppercase tracking-widest text-muted-foreground">
              {spec.label}
            </p>
            <p className="font-medium text-foreground text-4xl">
              {spec.value}
            </p>
          </div>
        ))}
      </div>

      {/* Full-width Video */}
      <div className="relative aspect-[16/9] w-full md:aspect-[21/9]">
        <video
          autoPlay
          loop
          muted
          playsInline
          poster="/asset/hero-poster.webp"
          className="absolute inset-0 h-full w-full object-cover"
        >
          <source src="/asset/hero-opt.webm" type="video/webm" />
          <source src="/asset/hero-opt.mp4" type="video/mp4" />
        </video>
      </div>
    </section>
  );
}
