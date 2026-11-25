import corporateJson from "@/content/corporate.json";

export type CorporateContent = {
  titleWords: string[];
  mainImage: string;
  mainImageAlt: string;
  overlayLine: string;
  buttonText: string;
  buttonLink: string;
  leftPhoto: string;
  leftPhotoAlt: string;
  formatsLabel: string;
  formats: string[];
  proofLabel: string;
  proofNumber: string;
  proofText: string;
  logos: string[];
  rightPhoto: string;
  rightPhotoAlt: string;
  paragraph: string;
};

const defaults: CorporateContent = {
  titleWords: ["Corporate", "Wellness", "Gurgaon."],
  mainImage: "/asset/hero.jpg",
  mainImageAlt: "Aerial view of sound healing sanctuary",
  overlayLine: "Bring calm to your team.",
  buttonText: "Plan a team session",
  buttonLink: "/corporate-wellness-gurgaon",
  leftPhoto: "/asset/card-3.webp",
  leftPhotoAlt: "Group sound bath",
  formatsLabel: "Formats",
  formats: ["On-site sessions", "Team breathwork", "Wellness weeks"],
  proofLabel: "On-site",
  proofNumber: "",
  proofText: "At your office or retreat across Delhi NCR",
  logos: [],
  rightPhoto: "/asset/side-3.webp",
  rightPhotoAlt: "Peaceful sanctuary",
  paragraph:
    "Stress is the silent productivity killer. Mahima's corporate wellness programs use sound healing and breathwork to reduce burnout, enhance creativity, and restore team synergy. Invest in the wellbeing of your workforce and watch performance soar.",
};

const source: Record<string, unknown> = corporateJson;

function stringValue(key: keyof CorporateContent) {
  const value = source[key];
  return typeof value === "string" && value.trim()
    ? value.trim()
    : (defaults[key] as string);
}

function optionalStringValue(key: "proofNumber") {
  const value = source[key];
  return typeof value === "string" ? value.trim() : "";
}

const MAX_LIMITS = { titleWords: 5, formats: 4, logos: 6 } as const;

// next/image has no remotePatterns configured, so only local public paths work.
function isLocalImagePath(value: string) {
  return (
    value.startsWith("/") &&
    !value.startsWith("//") &&
    !/[\s\\]/.test(value)
  );
}

function isSafeLink(value: string) {
  if (/[\s\\]/.test(value)) return false;
  if (value.startsWith("/")) return !value.startsWith("//");
  if (value.startsWith("#")) return true;
  return /^(https?:|mailto:|tel:)/i.test(value);
}

function imageValue(key: "mainImage" | "leftPhoto" | "rightPhoto") {
  const value = source[key];
  return typeof value === "string" && isLocalImagePath(value.trim())
    ? value.trim()
    : defaults[key];
}

function linkValue(key: "buttonLink") {
  const value = source[key];
  return typeof value === "string" && isSafeLink(value.trim())
    ? value.trim()
    : defaults[key];
}

function stringListValue(key: "titleWords" | "formats") {
  const value = source[key];
  if (!Array.isArray(value)) return defaults[key];

  const entries = value
    .filter((entry): entry is string => typeof entry === "string")
    .map((entry) => entry.trim())
    .filter(Boolean)
    .slice(0, MAX_LIMITS[key]);

  return entries.length > 0 ? entries : defaults[key];
}

function logoListValue(key: "logos") {
  const value = source[key];
  if (!Array.isArray(value)) return [];

  return value
    .filter((entry): entry is string => typeof entry === "string")
    .map((entry) => entry.trim())
    .filter(isLocalImagePath)
    .slice(0, MAX_LIMITS[key]);
}

export const corporateContent: CorporateContent = {
  titleWords: stringListValue("titleWords"),
  mainImage: imageValue("mainImage"),
  mainImageAlt: stringValue("mainImageAlt"),
  overlayLine: stringValue("overlayLine"),
  buttonText: stringValue("buttonText"),
  buttonLink: linkValue("buttonLink"),
  leftPhoto: imageValue("leftPhoto"),
  leftPhotoAlt: stringValue("leftPhotoAlt"),
  formatsLabel: stringValue("formatsLabel"),
  formats: stringListValue("formats"),
  proofLabel: stringValue("proofLabel"),
  proofNumber: optionalStringValue("proofNumber"),
  proofText: stringValue("proofText"),
  logos: logoListValue("logos"),
  rightPhoto: imageValue("rightPhoto"),
  rightPhotoAlt: stringValue("rightPhotoAlt"),
  paragraph: stringValue("paragraph"),
};
