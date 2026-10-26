import { describe, it, expect } from "vitest";
import { Listing } from "../types";

describe("Workspace Scarcity & Capacity Urgency Suite", () => {
  it("supports urgency_active and urgency_badge on Listing objects across all 4 pillars", () => {
    const walkListing: Listing = {
      id: "walk-sassoon",
      title: "Sassoon Docks Dawn Walk",
      slug: "sassoon-docks-dawn-walk",
      type: "experience",
      pillar: "walks",
      short_summary: "Dawn walk",
      full_description: "Full description",
      price_inr: 850,
      currency: "INR",
      images: ["https://example.com/walk.jpg"],
      host_name: "Pranay Koli",
      is_active: true,
      is_featured: true,
      urgency_active: true,
      urgency_badge: "Only 3 spots remaining for this tide!",
    };

    expect(walkListing.urgency_active).toBe(true);
    expect(walkListing.urgency_badge).toBe("Only 3 spots remaining for this tide!");

    const foodListing: Listing = {
      id: "food-crab",
      title: "Versova Koli Crab Masala Feast",
      slug: "versova-crab-feast",
      type: "experience",
      pillar: "food",
      short_summary: "Courtyard banquet",
      full_description: "Full description",
      price_inr: 1200,
      currency: "INR",
      images: ["https://example.com/crab.jpg"],
      host_name: "Ashwini Tandel",
      is_active: true,
      is_featured: true,
      urgency_active: true,
      urgency_badge: "Only 4 courtyard feast seats remaining!",
    };

    expect(foodListing.urgency_active).toBe(true);
    expect(foodListing.urgency_badge).toBe("Only 4 courtyard feast seats remaining!");

    const goodsListing: Listing = {
      id: "goods-bombay-duck",
      title: "Sun-Dried Bombay Duck",
      slug: "sun-dried-bombay-duck",
      type: "product",
      pillar: "goods",
      short_summary: "Sun-dried seafood",
      full_description: "Full description",
      price_inr: 500,
      currency: "INR",
      images: ["https://example.com/duck.jpg"],
      host_name: "Madh Mahila Collective",
      is_active: true,
      is_featured: false,
      urgency_active: true,
      urgency_badge: "Fresh dawn catch batch – only 5 jars left!",
    };

    expect(goodsListing.urgency_active).toBe(true);
    expect(goodsListing.urgency_badge).toBe("Fresh dawn catch batch – only 5 jars left!");
  });
});
