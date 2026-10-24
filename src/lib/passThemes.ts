import { Listing } from "../types";

export type PassThemeCategory = "food" | "walk" | "workshop";

export interface PassThemeConfig {
  categoryLabel: "Food" | "Walk" | "Workshop";
  headerImage: string;
  bgClass: string;
  borderClass: string;
  titleColor: string;
  qrDarkColor: string;
  subtextColor: string;
  dividerColor: string;
  hostPhoneColor: string;
  directionsLinkColor: string;
}

export const PASS_THEMES: Record<PassThemeCategory, PassThemeConfig> = {
  food: {
    categoryLabel: "Food",
    headerImage: "/pass-header-food.png",
    bgClass: "bg-[#1c3554]",
    borderClass: "border-[#406882]/40",
    titleColor: "text-[#e3a157]",
    qrDarkColor: "#1c2f44",
    subtextColor: "text-[#cbd5e1]",
    dividerColor: "border-[#3a5874]/50",
    hostPhoneColor: "text-[#e3a157] hover:text-[#f3a850]",
    directionsLinkColor: "text-[#ffffff] group-hover:text-[#e3a157]",
  },
  walk: {
    categoryLabel: "Walk",
    headerImage: "/pass-header-walk.png",
    bgClass: "bg-[#5f98a0]",
    borderClass: "border-white/25",
    titleColor: "text-[#1b2b49]", // Deep marine navy for high-contrast legibility against seafoam teal
    qrDarkColor: "#0c3a4b",
    subtextColor: "text-[#f0fdfa]",
    dividerColor: "border-white/20",
    hostPhoneColor: "text-[#ffffff] hover:text-[#f0fdfa]",
    directionsLinkColor: "text-[#ffffff] group-hover:text-[#1b2b49]",
  },
  workshop: {
    categoryLabel: "Workshop",
    headerImage: "/pass-header-workshop.png",
    bgClass: "bg-[#2b120c]",
    borderClass: "border-[#dab38c]/25",
    titleColor: "text-[#e3a157]",
    qrDarkColor: "#260e03",
    subtextColor: "text-[#dab38c]",
    dividerColor: "border-[#dab38c]/15",
    hostPhoneColor: "text-[#e3a157] hover:text-[#dab38c]",
    directionsLinkColor: "text-[#f5edeb] group-hover:text-[#e3a157]",
  },
};

/**
 * Resolves the appropriate category theme for an offering based on
 * its explicit pillar, category ID, or title keywords.
 */
export function resolvePassCategory(listing?: Listing): PassThemeCategory {
  if (!listing) return "walk";

  const pillar = listing.pillar?.toLowerCase();
  if (pillar === "walks" || pillar === "walk") return "walk";
  if (pillar === "food") return "food";
  if (pillar === "workshops" || pillar === "workshop") return "workshop";

  const catId = listing.category_id?.toLowerCase() || "";
  if (catId.includes("walk") || catId.includes("trail") || catId.includes("tour")) return "walk";
  if (catId.includes("workshop") || catId.includes("craft")) return "workshop";
  if (catId.includes("food") || catId.includes("dining")) return "food";

  const title = (listing.title || "").toLowerCase();
  if (
    title.includes("walk") ||
    title.includes("trail") ||
    title.includes("safari") ||
    title.includes("tour") ||
    title.includes("heritage")
  ) {
    return "walk";
  }

  if (
    title.includes("workshop") ||
    title.includes("weaving") ||
    title.includes("craft") ||
    title.includes("pottery") ||
    title.includes("boatyard") ||
    title.includes("net-weaving") ||
    title.includes("carpentry")
  ) {
    return "workshop";
  }

  if (
    title.includes("thali") ||
    title.includes("feast") ||
    title.includes("dining") ||
    title.includes("breakfast") ||
    title.includes("lunch") ||
    title.includes("dinner") ||
    title.includes("culinary") ||
    title.includes("meal")
  ) {
    return "food";
  }

  return "walk";
}
