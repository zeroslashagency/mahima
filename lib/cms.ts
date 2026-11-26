import siteJson from "@/content/site.json";
import heroJson from "@/content/hero.json";
import philosophyJson from "@/content/philosophy.json";
import introJson from "@/content/intro.json";
import offeringsJson from "@/content/offerings.json";
import shopJson from "@/content/shop.json";
import galleryJson from "@/content/gallery.json";
import aboutJson from "@/content/about.json";
import landingCorporateJson from "@/content/landing-corporate.json";
import landingBreathworkJson from "@/content/landing-breathwork.json";
import landingSoundJson from "@/content/landing-sound.json";
import playJson from "@/content/play.json";

// Shared validators. next/image has no remotePatterns configured, so only
// local public paths work. Bad CMS values fall back to defaults instead of
// breaking the page.

function isLocalImagePath(value: string) {
  return (
    value.startsWith("/") &&
    !value.startsWith("//") &&
    !/[\s\\]/.test(value)
  );
}

function isLocalMediaPath(value: string) {
  return isLocalImagePath(value);
}

function isSafeLink(value: string) {
  if (/[\s\\]/.test(value)) return false;
  if (value.startsWith("/")) return !value.startsWith("//");
  if (value.startsWith("#")) return true;
  return /^(https?:|mailto:|tel:)/i.test(value);
}

function text(source: Record<string, unknown>, key: string, fallback: string) {
  const value = source[key];
  return typeof value === "string" && value.trim() ? value.trim() : fallback;
}

function optionalText(source: Record<string, unknown>, key: string) {
  const value = source[key];
  return typeof value === "string" ? value.trim() : "";
}

function image(source: Record<string, unknown>, key: string, fallback: string) {
  const value = source[key];
  return typeof value === "string" && isLocalImagePath(value.trim())
    ? value.trim()
    : fallback;
}

function media(source: Record<string, unknown>, key: string, fallback: string) {
  const value = source[key];
  return typeof value === "string" && isLocalMediaPath(value.trim())
    ? value.trim()
    : fallback;
}

function link(source: Record<string, unknown>, key: string, fallback: string) {
  const value = source[key];
  return typeof value === "string" && isSafeLink(value.trim())
    ? value.trim()
    : fallback;
}

function oneOf<T extends string>(
  source: Record<string, unknown>,
  key: string,
  allowed: readonly T[],
  fallback: T,
): T {
  const value = source[key];
  return typeof value === "string" && (allowed as readonly string[]).includes(value.trim())
    ? (value.trim() as T)
    : fallback;
}

function color(source: Record<string, unknown>, key: string, fallback: string) {
  const value = source[key];
  return typeof value === "string" && /^#[0-9a-fA-F]{3,8}$/.test(value.trim())
    ? value.trim()
    : fallback;
}

function stringList(
  source: Record<string, unknown>,
  key: string,
  fallback: string[],
  max: number,
) {
  const value = source[key];
  if (!Array.isArray(value)) return fallback;
  const entries = value
    .filter((entry): entry is string => typeof entry === "string")
    .map((entry) => entry.trim())
    .filter(Boolean)
    .slice(0, max);
  return entries.length > 0 ? entries : fallback;
}

function objectList<T>(
  source: Record<string, unknown>,
  key: string,
  fallback: T[],
  map: (item: Record<string, unknown>) => T | null,
  max: number,
) {
  const value = source[key];
  if (!Array.isArray(value)) return fallback;
  const entries = value
    .filter(
      (entry): entry is Record<string, unknown> =>
        typeof entry === "object" && entry !== null,
    )
    .map(map)
    .filter((entry): entry is T => entry !== null)
    .slice(0, max);
  return entries.length > 0 ? entries : fallback;
}

export type LinkItem = { label: string; href: string };

// ---- Site: header, footer, home SEO ----

export type SiteContent = {
  brandName: string;
  nav: (LinkItem & { mobileLabel: string })[];
  ctaButton: LinkItem;
  footerBrandName: string;
  footerBlurb: string;
  footerColumns: { heading: string; links: LinkItem[] }[];
  socials: LinkItem[];
  copyright: string;
  seo: { title: string; description: string };
};

function linkItem(
  item: Record<string, unknown>,
  labelFallback: string,
  hrefFallback: string,
): LinkItem | null {
  const label = text(item, "label", labelFallback);
  if (!label && !labelFallback) return null;
  return {
    label: text(item, "label", labelFallback),
    href: link(item, "href", hrefFallback),
  };
}

const siteSource: Record<string, unknown> = siteJson;

export const siteContent: SiteContent = {
  brandName: text(siteSource, "brandName", "MAHIMA"),
  nav: objectList(
    siteSource,
    "nav",
    [{ label: "Offerings", href: "#products", mobileLabel: "Offerings" }],
    (item) => {
      const base = linkItem(item, "", "#");
      if (!base || !base.label) return null;
      return {
        ...base,
        mobileLabel: optionalText(item, "mobileLabel") || base.label,
      };
    },
    8,
  ),
  ctaButton: linkItem(
    (siteSource.ctaButton as Record<string, unknown>) ?? {},
    "Book a Session",
    "/#products",
  ) ?? { label: "Book a Session", href: "/#products" },
  footerBrandName: text(siteSource, "footerBrandName", "HEAL WITH MAHIMA"),
  footerBlurb: text(
    siteSource,
    "footerBlurb",
    "Transformative Sound Healing and Breathwork journeys engineered for the modern soul. Rediscover your inner sanctuary.",
  ),
  footerColumns: objectList(
    siteSource,
    "footerColumns",
    [{ heading: "Explore", links: [{ label: "Offerings", href: "#products" }] }],
    (column) => {
      const heading = text(column, "heading", "");
      const links = objectList(
        column,
        "links",
        [],
        (item) => linkItem(item, "", "#"),
        8,
      );
      if (!heading || links.length === 0) return null;
      return { heading, links };
    },
    4,
  ),
  socials: objectList(
    siteSource,
    "socials",
    [{ label: "Instagram", href: "#" }],
    (item) => linkItem(item, "", "#"),
    6,
  ),
  copyright: text(
    siteSource,
    "copyright",
    "2026 HEAL WITH MAHIMA. All rights reserved.",
  ),
  seo: {
    title: text(
      (siteSource.seo as Record<string, unknown>) ?? {},
      "title",
      "Sound Healing & Breathwork in Delhi NCR",
    ),
    description: text(
      (siteSource.seo as Record<string, unknown>) ?? {},
      "description",
      "Premium sound healing, breathwork, and meditative journeys in Delhi-NCR. Private sessions, group sound baths, and corporate wellness experiences.",
    ),
  },
};

// ---- Hero ----

export type HeroContent = {
  srText: string;
  sideImages: { src: string; alt: string; position: "left" | "right" }[];
};

const heroSource: Record<string, unknown> = heroJson;

export const heroContent: HeroContent = {
  srText: text(
    heroSource,
    "srText",
    "Heal with Mahima: Delhi-NCR's Premium Sound Healing",
  ),
  sideImages: objectList(
    heroSource,
    "sideImages",
    [{ src: "/asset/side-1.webp", alt: "Meditation Space", position: "left" as const }],
    (item) => {
      const src = image(item, "src", "");
      if (!src) return null;
      return {
        src,
        alt: text(item, "alt", "Sanctuary photo"),
        position: oneOf(item, "position", ["left", "right"] as const, "left"),
      };
    },
    8,
  ),
};

// ---- Philosophy ----

export type PhilosophyContent = {
  heading: string;
  paragraph: string;
  image: string;
  imageAlt: string;
  notes: { label: string; title: string }[];
};

const philosophySource: Record<string, unknown> = philosophyJson;

export const philosophyContent: PhilosophyContent = {
  heading: text(philosophySource, "heading", "What sound does to the body."),
  paragraph: text(
    philosophySource,
    "paragraph",
    "Vibration helps the body move out of a high-alert state and into a slower, steadier rhythm.",
  ),
  image: image(philosophySource, "image", "/asset/card-4.webp"),
  imageAlt: text(philosophySource, "imageAlt", "A breathwork session with Mahima"),
  notes: objectList(
    philosophySource,
    "notes",
    [{ label: "Breath", title: "Short, shallow breaths turn into slower, fuller cycles." }],
    (item) => {
      const label = text(item, "label", "");
      const title = text(item, "title", "");
      if (!label || !title) return null;
      return { label, title };
    },
    6,
  ),
};

// ---- Intro ----

export type IntroContent = {
  greeting: string;
  leadPrefix: string;
  leadSuffix: string;
  audiences: string[];
  practices: { word: string; color: string }[];
  tagline: string;
  buttons: LinkItem[];
};

const introSource: Record<string, unknown> = introJson;

export const introContent: IntroContent = {
  greeting: text(introSource, "greeting", "Namaste,"),
  leadPrefix: text(introSource, "leadPrefix", "I'm Mahima. I help"),
  leadSuffix: text(introSource, "leadSuffix", "find their way back to calm through"),
  audiences: stringList(
    introSource,
    "audiences",
    ["busy minds", "tired bodies", "teams at work"],
    8,
  ),
  practices: objectList(
    introSource,
    "practices",
    [{ word: "singing bowls", color: "#b5651d" }],
    (item) => {
      const word = text(item, "word", "");
      if (!word) return null;
      return { word, color: color(item, "color", "#b5651d") };
    },
    8,
  ),
  tagline: text(
    introSource,
    "tagline",
    "I listen first, then let the sound do the rest.",
  ),
  buttons: objectList(
    introSource,
    "buttons",
    [{ label: "See sessions →", href: "#products" }],
    (item) => linkItem(item, "", "#products"),
    4,
  ),
};

// ---- Offerings (featured products) ----

export type OfferingsContent = {
  heading: string;
  eyebrow: string;
  items: { kicker: string; title: string; image: string; imageAlt: string }[];
};

const offeringsSource: Record<string, unknown> = offeringsJson;

export const offeringsContent: OfferingsContent = {
  heading: text(
    offeringsSource,
    "heading",
    "Core Wellness Offerings in Delhi NCR.",
  ),
  eyebrow: text(offeringsSource, "eyebrow", "Offerings"),
  items: objectList(
    offeringsSource,
    "items",
    [
      {
        kicker: "Private Session",
        title: "1:1 Sound Sanctuary",
        image: "/asset/card-2.webp",
        imageAlt: "1:1 Sound Sanctuary",
      },
    ],
    (item) => {
      const title = text(item, "title", "");
      const src = image(item, "image", "");
      if (!title || !src) return null;
      return {
        kicker: text(item, "kicker", ""),
        title,
        image: src,
        imageAlt: text(item, "imageAlt", title),
      };
    },
    6,
  ),
};

// ---- Shop (collection) ----

export type ShopContent = {
  heading: string;
  items: {
    name: string;
    description: string;
    price: string;
    image: string;
    imageAlt: string;
  }[];
};

const shopSource: Record<string, unknown> = shopJson;

export const shopContent: ShopContent = {
  heading: text(shopSource, "heading", "Wellness Shop"),
  items: objectList(
    shopSource,
    "items",
    [
      {
        name: "Crystal Sound Bowl",
        description: "Frosted quartz bowl tuned to Heart Chakra (432Hz).",
        price: "₹12,499",
        image: "/asset/shop-crystal-bowl.png",
        imageAlt: "Crystal Sound Bowl",
      },
    ],
    (item) => {
      const name = text(item, "name", "");
      const src = image(item, "image", "");
      if (!name || !src) return null;
      return {
        name,
        description: text(item, "description", ""),
        price: text(item, "price", ""),
        image: src,
        imageAlt: text(item, "imageAlt", name),
      };
    },
    12,
  ),
};

// ---- Gallery ----

export type GalleryItem =
  | { kind: "video"; src: string; poster: string; label: string }
  | { kind: "image"; src: string; alt: string };

export type GalleryContent = { items: GalleryItem[] };

const gallerySource: Record<string, unknown> = galleryJson;

export const galleryContent: GalleryContent = {
  items: objectList(
    gallerySource,
    "items",
    [{ kind: "image" as const, src: "/asset/card-2.webp", alt: "Sound Bath Session" }],
    (item) => {
      const kind = oneOf(item, "kind", ["image", "video"] as const, "image");
      if (kind === "video") {
        const src = media(item, "videoSrc", "");
        if (!src) return null;
        return {
          kind,
          src,
          poster: image(item, "poster", ""),
          label: text(item, "label", "Sanctuary video"),
        };
      }
      const src = image(item, "imageSrc", "");
      if (!src) return null;
      return { kind, src, alt: text(item, "alt", "Sanctuary photo") };
    },
    16,
  ),
};

// ---- About (testimonials section) ----

export type AboutContent = {
  statement: string;
  image: string;
  imageAlt: string;
};

const aboutSource: Record<string, unknown> = aboutJson;

export const aboutContent: AboutContent = {
  statement: text(
    aboutSource,
    "statement",
    "At Heal with Mahima, we bridge the gap between ancient wisdom and modern living.",
  ),
  image: image(aboutSource, "image", "/asset/card.jpg"),
  imageAlt: text(aboutSource, "imageAlt", "Peaceful Sanctuary"),
};

// ---- Landing pages ----

export type LandingContent = {
  seo: { title: string; description: string };
  kicker: string;
  title: string;
  intro: string;
  buttons: (LinkItem & { style: "primary" | "secondary" })[];
  cards: { title: string; text: string }[];
};

function landingContent(
  source: Record<string, unknown>,
  fallback: LandingContent,
): LandingContent {
  return {
    seo: {
      title: text(
        (source.seo as Record<string, unknown>) ?? {},
        "title",
        fallback.seo.title,
      ),
      description: text(
        (source.seo as Record<string, unknown>) ?? {},
        "description",
        fallback.seo.description,
      ),
    },
    kicker: text(source, "kicker", fallback.kicker),
    title: text(source, "title", fallback.title),
    intro: text(source, "intro", fallback.intro),
    buttons: objectList(
      source,
      "buttons",
      fallback.buttons,
      (item) => {
        const base = linkItem(item, "", "/#products");
        if (!base || !base.label) return null;
        return {
          ...base,
          style: oneOf(item, "style", ["primary", "secondary"] as const, "primary"),
        };
      },
      4,
    ),
    cards: objectList(
      source,
      "cards",
      fallback.cards,
      (item) => {
        const title = text(item, "title", "");
        const itemText = text(item, "text", "");
        if (!title || !itemText) return null;
        return { title, text: itemText };
      },
      6,
    ),
  };
}

const corporateFallback: LandingContent = {
  seo: {
    title: "Corporate Wellness in Gurgaon",
    description:
      "Corporate sound healing and breathwork programs in Gurgaon to reduce burnout, improve focus, and elevate team wellbeing.",
  },
  kicker: "Corporate Wellness",
  title: "Corporate Wellness in Gurgaon",
  intro: "Support your teams with sound healing and breathwork sessions.",
  buttons: [
    { label: "Request a Corporate Proposal", href: "/#products", style: "primary" },
  ],
  cards: [{ title: "On-site Sessions", text: "Curated sound baths at your office or retreat." }],
};

const breathworkFallback: LandingContent = {
  seo: {
    title: "Breathwork in Delhi NCR",
    description:
      "Guided breathwork journeys in Delhi-NCR to reduce stress, build clarity, and release emotional tension.",
  },
  kicker: "Breathwork",
  title: "Breathwork in Delhi NCR",
  intro: "Breath is the fastest way to shift your state.",
  buttons: [
    { label: "Reserve a Breathwork Session", href: "/#products", style: "primary" },
  ],
  cards: [{ title: "Stress Release", text: "Gentle sessions designed to calm and decompress." }],
};

const soundFallback: LandingContent = {
  seo: {
    title: "Sound Healing in Delhi NCR",
    description:
      "Private and group sound healing sessions in Delhi-NCR. Restore calm, reduce stress, and realign your nervous system with curated sound journeys.",
  },
  kicker: "Sound Healing",
  title: "Sound Healing in Delhi NCR",
  intro: "Experience immersive sound baths and one-on-one sessions.",
  buttons: [
    { label: "Book a Private Session", href: "/#products", style: "primary" },
  ],
  cards: [{ title: "Private Sessions", text: "Personalized sound journeys tailored to your goals and energy." }],
};

export const landingCorporateContent = landingContent(
  landingCorporateJson,
  corporateFallback,
);
export const landingBreathworkContent = landingContent(
  landingBreathworkJson,
  breathworkFallback,
);
export const landingSoundContent = landingContent(
  landingSoundJson,
  soundFallback,
);

// ---- Play page copy (bowls stay hardcoded: they drive the audio engine) ----

export type PlayContent = {
  backLink: string;
  heading: string;
  description: string;
  descriptionHighlight: string;
};

const playSource: Record<string, unknown> = playJson;

export const playContent: PlayContent = {
  backLink: text(playSource, "backLink", "← Return to Sanctuary"),
  heading: text(playSource, "heading", "Zen Playground"),
  description: text(
    playSource,
    "description",
    "An immersive sound sanctuary. Use keys 1-7 to strike bowls, or click and hold to hear them sing.",
  ),
  descriptionHighlight: text(playSource, "descriptionHighlight", "1-7"),
};
