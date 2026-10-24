import { describe, it, expect } from "vitest";
import { encodePassPayload, decodePassPayload } from "../lib/passPayload";
import { resolvePassCategory, PASS_THEMES } from "../lib/passThemes";
import { SEED_LISTINGS } from "../data/seedData";
import { Order } from "../types";

describe("QA 12 Forensic Fixes Suite", () => {
  it("encodes pass payload without data URLs and maintains compact size under 600 bytes", () => {
    const mockOrder: Order = {
      id: "ord-test-large-img",
      order_ref: "MM-EXP-2026-9999",
      customer_name: "Aryan Panchal",
      customer_email: "aryan@matsyamart.in",
      customer_phone: "+91 99204 77158",
      total_amount_inr: 2400,
      status: "confirmed",
      created_at: new Date().toISOString(),
      items: [
        {
          id: "it-1",
          order_id: "ord-test-large-img",
          listing_id: "exp-custom-dropzone",
          quantity: 2,
          unit_price_inr: 1200,
          listing: {
            id: "exp-custom-dropzone",
            title: "Custom Seafood Feast",
            slug: "custom-seafood-feast",
            pillar: "food",
            type: "experience",
            price_inr: 1200,
            currency: "INR",
            images: [
              // Massive 20KB base64 Data URL simulating dropzone upload
              "data:image/jpeg;base64," + "A".repeat(20000),
            ],
            location_name: "Versova Gaothan",
            duration_minutes: 180,
            host_name: "Ashwini",
            host_phone: "+91 99204 77158",
            short_summary: "Custom feast",
            full_description: "Custom feast full description",
            is_active: true,
            is_featured: false,
          },
        },
      ],
    };

    const token = encodePassPayload(mockOrder);
    expect(token).toBeTruthy();
    // Must be under 600 characters to prevent QR overflow
    expect(token.length).toBeLessThan(600);

    const decoded = decodePassPayload(token);
    expect(decoded).not.toBeNull();
    expect(decoded?.order_ref).toBe("MM-EXP-2026-9999");
    expect(decoded?.customer_name).toBe("Aryan Panchal");
    // Ensure data URL was stripped and replaced with safe default image
    expect(decoded?.items[0]?.listing?.images?.[0]).not.toContain("data:image");
    expect(decoded?.items[0]?.listing?.images?.[0]?.length).toBeLessThan(150);
  });

  it("resolves correct pass category and theme colors for all 3 experiential pillars", () => {
    const sassoonWalk = SEED_LISTINGS.find((l) => l.id === "exp-sassoon-trail");
    const madhFeast = SEED_LISTINGS.find((l) => l.id === "exp-seafood-thali-madh");
    const netWeaving = SEED_LISTINGS.find((l) => l.id === "exp-net-weaving");

    expect(resolvePassCategory(sassoonWalk)).toBe("walk");
    expect(PASS_THEMES.walk.bgClass).toBe("bg-[#5f98a0]");
    expect(PASS_THEMES.walk.qrDarkColor).toBe("#0c3a4b");

    expect(resolvePassCategory(madhFeast)).toBe("food");
    expect(PASS_THEMES.food.bgClass).toBe("bg-[#1c3554]");
    expect(PASS_THEMES.food.qrDarkColor).toBe("#1c2f44");

    expect(resolvePassCategory(netWeaving)).toBe("workshop");
    expect(PASS_THEMES.workshop.bgClass).toBe("bg-[#2b120c]");
    expect(PASS_THEMES.workshop.qrDarkColor).toBe("#260e03");
  });

  it("decodes cross-device pass token successfully without relying on localStorage", () => {
    const order: Order = {
      id: "ord-cross-device",
      order_ref: "MM-EXP-MOBILE-01",
      customer_name: "Rahul Sharma",
      customer_email: "rahul@example.com",
      customer_phone: "+91 98200 12345",
      total_amount_inr: 1200,
      status: "confirmed",
      created_at: new Date().toISOString(),
      items: [
        {
          id: "it-mobile-1",
          order_id: "ord-cross-device",
          listing_id: "exp-sassoon-trail",
          quantity: 1,
          unit_price_inr: 1200,
          listing: SEED_LISTINGS.find((l) => l.id === "exp-sassoon-trail"),
        },
      ],
    };

    const token = encodePassPayload(order);
    const hydrated = decodePassPayload(token);
    expect(hydrated).not.toBeNull();
    expect(hydrated?.order_ref).toBe("MM-EXP-MOBILE-01");
    expect(hydrated?.customer_phone).toBe("+91 98200 12345");
    expect(hydrated?.total_amount_inr).toBe(1200);
  });
});
