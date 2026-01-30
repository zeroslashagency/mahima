import { Header } from "@/components/header";
import { HeroSection } from "@/components/sections/hero-section";
import { PhilosophySection } from "@/components/sections/philosophy-section";
import { FeaturedProductsSection } from "@/components/sections/featured-products-section";
import { TechnologySection } from "@/components/sections/technology-section";
import { GallerySection } from "@/components/sections/gallery-section";
import { CollectionSection } from "@/components/sections/collection-section";
import { EditorialSection } from "@/components/sections/editorial-section";
import { TestimonialsSection } from "@/components/sections/testimonials-section";
import { FooterSection } from "@/components/sections/footer-section";

export const metadata = {
  title: "Sound Healing & Breathwork in Delhi NCR",
  description:
    "Premium sound healing, breathwork, and meditative journeys in Delhi-NCR. Private sessions, group sound baths, and corporate wellness experiences.",
  alternates: {
    canonical: "/",
  },
};

export default function Home() {
  const structuredData = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        name: "Heal with Mahima",
        url: "https://healwithmahima.in",
        logo: "https://healwithmahima.in/icon.svg",
      },
      {
        "@type": "WebSite",
        name: "Heal with Mahima",
        url: "https://healwithmahima.in",
      },
      {
        "@type": "Service",
        name: "Sound Healing & Breathwork",
        areaServed: "Delhi NCR",
        provider: {
          "@type": "Organization",
          name: "Heal with Mahima",
          url: "https://healwithmahima.in",
        },
      },
    ],
  };

  return (
    <main className="min-h-screen bg-background">
      <script
        type="application/ld+json"
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      <Header />
      <HeroSection />
      <PhilosophySection />
      <FeaturedProductsSection />
      <TechnologySection />
      <GallerySection />
      <CollectionSection />
      <EditorialSection />
      <TestimonialsSection />
      <FooterSection />
    </main>
  );
}
