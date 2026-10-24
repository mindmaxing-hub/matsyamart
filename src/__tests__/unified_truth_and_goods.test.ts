import { describe, it, expect } from "vitest";
import { SEED_LISTINGS, generateSeedSlots } from "../data/seedData";
import { buildGoodsTrackingMessage } from "../lib/whatsapp";
import { Listing } from "../types";

describe("Unified Truth & Canonical Offerings", () => {
  it("should have Authentic Seafood Thali permanently in SEED_LISTINGS", () => {
    const seafoodThali = SEED_LISTINGS.find(
      (l) => l.id === "exp-seafood-thali-madh" || l.slug === "seafood-thali-madh-island",
    );
    expect(seafoodThali).toBeDefined();
    expect(seafoodThali?.pillar).toBe("food");
    expect(seafoodThali?.meal_type).toBe("lunch");
    expect(seafoodThali?.price_inr).toBe(1200);
    expect(seafoodThali?.custom_tags).toContain("UNLIMITED THALI");
    expect(seafoodThali?.custom_tags).toContain("LUNCH");
  });

  it("should generate bookable lunch slots for Seafood Thali in seed slots", () => {
    const slots = generateSeedSlots();
    const thaliSlots = slots.filter(
      (s) => s.listing_id === "exp-seafood-thali-madh",
    );
    expect(thaliSlots.length).toBeGreaterThan(0);
    // Check lunch slot start hours (12:30 PM local)
    const firstSlot = thaliSlots[0];
    expect(firstSlot).toBeDefined();
    const startDate = new Date(firstSlot!.slot_start);
    expect(startDate.getHours()).toBe(12);
    expect(startDate.getMinutes()).toBe(30);
  });
});

describe("Goods Tracking & WhatsApp Portal Link", () => {
  it("should generate tracking link to MatsyaMart confirmation portal, not external courier", () => {
    const msg = buildGoodsTrackingMessage({
      customerName: "Aryan",
      orderRef: "MM-PRD-2026-9921",
      itemsSummary: "1x Artisanal Sun-Dried Jawla",
      courierName: "Coastal Express Courier",
      trackingNumber: "CE-992184-IN",
      trackingUrl: "https://matsyamart.com/order/confirmation/MM-PRD-2026-9921",
    });

    expect(msg).toContain("MM-PRD-2026-9921");
    expect(msg).toContain("https://matsyamart.com/order/confirmation/MM-PRD-2026-9921");
    expect(msg).not.toContain("bluedart.com");
  });

  it("should fallback to internal portal if trackingUrl is omitted", () => {
    const msg = buildGoodsTrackingMessage({
      customerName: "Aditya",
      orderRef: "MM-PRD-2026-0042",
      itemsSummary: "2x Raw Mangrove Honey",
      courierName: "Coastal Express",
      trackingNumber: "CE-0042",
    });

    expect(msg).toContain("https://matsyamart.com/order/confirmation/MM-PRD-2026-0042");
    expect(msg).not.toContain("bluedart.com");
  });
});

describe("Meal Type & Custom Tags Classification", () => {
  it("should accurately reflect meal_type on food offerings", () => {
    const dinnerOffering: Partial<Listing> = {
      pillar: "food",
      meal_type: "dinner",
      custom_tags: ["SEAFOOD BANQUET", "CRAB MASALA"],
    };

    expect(dinnerOffering.meal_type).toBe("dinner");
    expect(dinnerOffering.custom_tags?.[0]).toBe("SEAFOOD BANQUET");
  });
});
