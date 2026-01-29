"use client";

import { FadeImage } from "@/components/fade-image";

const accessories = [
  {
    id: 1,
    name: "Crystal Sound Bowl",
    description: "Frosted quartz bowl tuned to Heart Chakra (432Hz).",
    price: "₹12,499",
    image: "/asset/shop-crystal-bowl.png",
  },
  {
    id: 2,
    name: "Pure Brass Gong",
    description: "Hand-hammered 32-inch gong for deep vibrational release.",
    price: "₹18,999",
    image: "/asset/shop-brass-gong.png",
  },
  {
    id: 3,
    name: "Tibetan Singing Bowl",
    description: "Antique bronze bowl set with rosewood mallet.",
    price: "₹8,500",
    image: "/asset/shop-tibetan-bowl.png",
  },
  {
    id: 4,
    name: "Guided Meditation",
    description: "Digital audio journey for deep sleep and anxiety relief.",
    price: "₹999",
    image: "/asset/shop-meditation-track.png",
  },
  {
    id: 5,
    name: "White Sage Bundle",
    description: "Organic California white sage for space clearing.",
    price: "₹1,200",
    image: "/asset/shop-sage-kit.png",
  },
  {
    id: 6,
    name: "Chakra Healing Set",
    description: "Seven polished crystals for energy alignment.",
    price: "₹4,500",
    image: "/asset/shop-chakra-set.png",
  },
];

export function CollectionSection() {
  return (
    <section id="accessories" className="bg-background">
      {/* Section Title */}
      <div className="px-6 py-20 md:px-12 lg:px-20 md:py-10">
        <h2 className="text-3xl font-medium tracking-tight text-foreground md:text-4xl">
          Wellness Shop
        </h2>
      </div>

      {/* Accessories Grid/Carousel */}
      <div className="pb-24">
        {/* Mobile: Horizontal Carousel */}
        <div className="flex gap-6 overflow-x-auto px-6 pb-4 md:hidden snap-x snap-mandatory scrollbar-hide">
          {accessories.map((accessory) => (
            <div key={accessory.id} className="group flex-shrink-0 w-[75vw] snap-center">
              {/* Image */}
              <div className="relative aspect-[2/3] overflow-hidden rounded-2xl bg-secondary">
                <FadeImage
                  src={accessory.image || "/placeholder.svg"}
                  alt={accessory.name}
                  fill
                  className="object-cover group-hover:scale-105"
                />
              </div>

              {/* Content */}
              <div className="py-6">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-medium leading-snug text-foreground">
                      {accessory.name}
                    </h3>
                    <p className="mt-2 text-sm text-muted-foreground">
                      {accessory.description}
                    </p>
                  </div>
                  <span className="text-lg font-medium text-foreground">
                    {accessory.price}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Desktop: Grid */}
        <div className="hidden md:grid md:grid-cols-3 gap-8 md:px-12 lg:px-20">
          {accessories.map((accessory) => (
            <div key={accessory.id} className="group">
              {/* Image */}
              <div className="relative aspect-[2/3] overflow-hidden rounded-2xl bg-secondary">
                <FadeImage
                  src={accessory.image || "/placeholder.svg"}
                  alt={accessory.name}
                  fill
                  className="object-cover group-hover:scale-105"
                />
              </div>

              {/* Content */}
              <div className="py-6">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-medium leading-snug text-foreground">
                      {accessory.name}
                    </h3>
                    <p className="mt-2 text-sm text-muted-foreground">
                      {accessory.description}
                    </p>
                  </div>
                  <span className="font-medium text-foreground text-2xl">
                    {accessory.price}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
