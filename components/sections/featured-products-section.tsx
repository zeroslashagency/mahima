"use client";

import { FadeImage } from "@/components/fade-image";

const features = [
  {
    title: "1:1 Sound Sanctuary",
    description: "Private Session",
    image: "/asset/card-2.jpeg",
  },
  {
    title: "Group Sound Bath",
    description: "Community",
    image: "/asset/card-3.jpg",
  },
  {
    title: "Breathwork Journey",
    description: "Transformation",
    image: "/asset/card-4.JPG",
  },
];

export function FeaturedProductsSection() {
  return (
    <section id="products" className="bg-background">
      {/* Section Title */}
      <div className="px-6 py-20 text-center md:px-12 md:py-28 lg:px-20 lg:py-32 lg:pb-20">
        <h2 className="text-3xl font-medium tracking-tight text-foreground md:text-4xl lg:text-5xl">
          Core Wellness Offerings
          <br />
          in Delhi NCR.
        </h2>
        <p className="mx-auto mt-6 max-w-md text-sm text-muted-foreground">
          Offerings
        </p>
      </div>

      {/* Features Grid */}
      <div className="grid grid-cols-1 gap-4 px-6 pb-20 md:grid-cols-3 md:px-12 lg:px-20">
        {features.map((feature) => (
          <div key={feature.title} className="group">
            {/* Image */}
            <div className="relative h-[631px] -full overflow-hidden" style={{ borderRadius: "25px" }}>
              <FadeImage
                src={feature.image || "/placeholder.svg"}
                alt={feature.title}
                fill
                className="object-cover transition-all duration-700 ease-out group-hover:scale-105"
              />
            </div>

            {/* Content */}
            <div className="py-6">
              <p className="mb-2 text-xs uppercase tracking-widest text-muted-foreground">
                {feature.description}
              </p>
              <h3 className="text-foreground text-xl font-semibold">
                {feature.title}
              </h3>
            </div>
          </div>
        ))}
      </div>

      {/* CTA Link */}
      <div className="flex justify-center px-6 pb-28 md:px-12 lg:px-20">

      </div>
    </section>
  );
}
