import { describe, it, expect } from "vitest";
import { resolvePassCategory, PASS_THEMES, PassThemeCategory } from "../lib/passThemes";
import { generateQrDataUrl } from "../lib/qr";
import { Listing } from "../types";

describe("Category-Specific Pass Theme Service", () => {
  it("resolves food category from pillar, category_id, or title keywords", () => {
    const listingPillar: Partial<Listing> = {
      pillar: "food",
      title: "Coastal Experience",
    };
    expect(resolvePassCategory(listingPillar as Listing)).toBe("food");

    const listingCatId: Partial<Listing> = {
      category_id: "cat-food-dining",
      title: "Coastal Experience",
    };
    expect(resolvePassCategory(listingCatId as Listing)).toBe("food");

    const listingTitle: Partial<Listing> = {
      title: "Authentic Koli Seafood Thali Feast",
    };
    expect(resolvePassCategory(listingTitle as Listing)).toBe("food");
  });

  it("resolves walk category from pillar, category_id, or title keywords", () => {
    const listingPillar: Partial<Listing> = {
      pillar: "walks",
      title: "Coastal Experience",
    };
    expect(resolvePassCategory(listingPillar as Listing)).toBe("walk");

    const listingCatId: Partial<Listing> = {
      category_id: "cat-walks-trail",
      title: "Coastal Experience",
    };
    expect(resolvePassCategory(listingCatId as Listing)).toBe("walk");

    const listingTitle: Partial<Listing> = {
      title: "Sassoon Docks Dawn Heritage Walk",
    };
    expect(resolvePassCategory(listingTitle as Listing)).toBe("walk");
  });

  it("resolves workshop category from pillar, category_id, or title keywords", () => {
    const listingPillar: Partial<Listing> = {
      pillar: "workshops",
      title: "Coastal Experience",
    };
    expect(resolvePassCategory(listingPillar as Listing)).toBe("workshop");

    const listingCatId: Partial<Listing> = {
      category_id: "cat-workshops-craft",
      title: "Coastal Experience",
    };
    expect(resolvePassCategory(listingCatId as Listing)).toBe("workshop");

    const listingTitle: Partial<Listing> = {
      title: "Mahim Bay Net-Weaving Guild Workshop",
    };
    expect(resolvePassCategory(listingTitle as Listing)).toBe("workshop");
  });

  it("defaults gracefully to walk when listing is missing or empty", () => {
    expect(resolvePassCategory(undefined)).toBe("walk");
    expect(resolvePassCategory({} as Listing)).toBe("walk");
  });

  it("contains authentic, bespoke theme tokens for each category", () => {
    const categories: PassThemeCategory[] = ["food", "walk", "workshop"];

    categories.forEach((cat) => {
      const theme = PASS_THEMES[cat];
      expect(theme).toBeDefined();
      expect(theme.headerImage).toMatch(new RegExp(`^/pass-header-${cat}\\.png$`));
      expect(typeof theme.categoryLabel).toBe("string");
      expect(theme.bgClass).toBeDefined();
      expect(theme.qrDarkColor).toMatch(/^#[0-9a-fA-F]{6}$/);
    });

    // Check Food Theme specifics (Midnight Navy)
    expect(PASS_THEMES.food.categoryLabel).toBe("Food");
    expect(PASS_THEMES.food.bgClass).toContain("#1c3554");
    expect(PASS_THEMES.food.titleColor).toContain("#e3a157");
    expect(PASS_THEMES.food.qrDarkColor).toBe("#1c2f44");

    // Check Walk Theme specifics (Seafoam Teal with Deep Marine Navy title for high contrast)
    expect(PASS_THEMES.walk.categoryLabel).toBe("Walk");
    expect(PASS_THEMES.walk.bgClass).toContain("#5f98a0");
    expect(PASS_THEMES.walk.titleColor).toContain("#1b2b49");
    expect(PASS_THEMES.walk.qrDarkColor).toBe("#0c3a4b");

    // Check Workshop Theme specifics (Espresso Terracotta)
    expect(PASS_THEMES.workshop.categoryLabel).toBe("Workshop");
    expect(PASS_THEMES.workshop.bgClass).toContain("#2b120c");
    expect(PASS_THEMES.workshop.titleColor).toContain("#e3a157");
    expect(PASS_THEMES.workshop.qrDarkColor).toBe("#260e03");
  });

  it("generates QR code Data URL with custom category colors", async () => {
    const qrFood = await generateQrDataUrl("https://matsyamart.in/test", PASS_THEMES.food.qrDarkColor);
    expect(qrFood).toMatch(/^data:image\/png;base64,/);

    const qrWalk = await generateQrDataUrl("https://matsyamart.in/test", PASS_THEMES.walk.qrDarkColor);
    expect(qrWalk).toMatch(/^data:image\/png;base64,/);

    const qrWorkshop = await generateQrDataUrl("https://matsyamart.in/test", PASS_THEMES.workshop.qrDarkColor);
    expect(qrWorkshop).toMatch(/^data:image\/png;base64,/);
  });
});
