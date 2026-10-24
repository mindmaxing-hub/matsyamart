import { describe, it, expect } from "vitest";
import { encodePassPayload, decodePassPayload } from "../lib/passPayload";
import { Order, OrderItem, Listing } from "../types";

describe("Cross-Device Pass Payload (encode/decode)", () => {
  const mockExperienceOrder: Order = {
    id: "ord-test-01",
    order_ref: "MM-EXP-2026-9952",
    customer_name: "Aryan Panchal",
    customer_email: "aryan@example.com",
    customer_phone: "+91 99204 77158",
    total_amount_inr: 2400,
    status: "confirmed",
    emergency_contact: "+91 98201 99887",
    created_at: "2026-10-23T18:00:00.000Z",
    items: [
      {
        id: "item-01",
        order_id: "ord-test-01",
        listing_id: "list-walk-01",
        quantity: 2,
        unit_price_inr: 1200,
        listing: {
          id: "list-walk-01",
          title: "Sassoon Docks Dawn Heritage Walk",
          slug: "sassoon-docks-dawn-heritage-walk",
          type: "experience",
          pillar: "walks",
          price_inr: 1200,
          currency: "INR",
          short_summary: "Dawn walk at Sassoon Docks",
          full_description: "Explore the bustling docks at sunrise",
          host_name: "Capt. Dilip Koli",
          host_phone: "+91 99204 77158",
          location_name: "Historic Sassoon Docks Clock Tower Arch, Colaba, Mumbai",
          images: ["https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=600"],
          is_active: true,
          is_featured: true,
        },
        slot: {
          id: "slot-01",
          listing_id: "list-walk-01",
          slot_start: "2026-10-25T06:30:00.000Z",
          slot_end: "2026-10-25T08:30:00.000Z",
          capacity: 15,
          booked_count: 2,
          is_cancelled: false,
        },
      },
    ],
  };

  const mockProductOrder: Order = {
    id: "ord-test-02",
    order_ref: "MM-PRD-2026-4411",
    customer_name: "Sneha Patil",
    customer_email: "sneha@example.com",
    customer_phone: "+91 98200 12345",
    total_amount_inr: 650,
    status: "confirmed",
    shipping_address: {
      addressLine: "Flat 402, Samudra Mahal, Worli Sea Face",
      landmark: "Near Worli Dairy",
      city: "Mumbai",
      state: "Maharashtra",
      pincode: "400018",
    },
    created_at: "2026-10-23T19:00:00.000Z",
    items: [
      {
        id: "item-02",
        order_id: "ord-test-02",
        listing_id: "list-honey-01",
        quantity: 1,
        unit_price_inr: 650,
        listing: {
          id: "list-honey-01",
          title: "Raw Mangrove Wild Blossom Honey",
          slug: "raw-mangrove-wild-blossom-honey",
          type: "product",
          pillar: "goods",
          price_inr: 650,
          currency: "INR",
          short_summary: "Pure wild mangrove honey harvested by coastal foresters",
          full_description: "Unprocessed, single-origin mangrove honey",
          host_name: "Madh Island Artisanal Collective",
          location_name: "Madh Island, Mumbai",
          weight_grams: 500,
          artisan_collective: "Madh Island Artisanal Collective",
          images: ["https://images.unsplash.com/photo-1587049352846-4a222e784d38?w=600"],
          is_active: true,
          is_featured: false,
        },
      },
    ],
  };

  it("encodes and decodes an experience order losslessly", () => {
    const token = encodePassPayload(mockExperienceOrder);
    expect(typeof token).toBe("string");
    expect(token.length).toBeGreaterThan(20);
    // Base64url safe string: no '+', '/', or '='
    expect(token).not.toMatch(/[+/=]/);

    const decoded = decodePassPayload(token);
    expect(decoded).not.toBeNull();
    expect(decoded?.order_ref).toBe("MM-EXP-2026-9952");
    expect(decoded?.customer_name).toBe("Aryan Panchal");
    expect(decoded?.customer_phone).toBe("+91 99204 77158");
    expect(decoded?.total_amount_inr).toBe(2400);
    expect(decoded?.emergency_contact).toBe("+91 98201 99887");
    expect(decoded?.items.length).toBe(1);
    expect(decoded?.items[0]?.listing?.type).toBe("experience");
    expect(decoded?.items[0]?.listing?.pillar).toBe("walks");
    expect(decoded?.items[0]?.slot?.slot_start).toBe("2026-10-25T06:30:00.000Z");
  });

  it("encodes and decodes a physical goods order preserving shipping address", () => {
    const token = encodePassPayload(mockProductOrder);
    expect(typeof token).toBe("string");

    const decoded = decodePassPayload(token);
    expect(decoded).not.toBeNull();
    expect(decoded?.order_ref).toBe("MM-PRD-2026-4411");
    expect(decoded?.customer_name).toBe("Sneha Patil");
    expect(decoded?.shipping_address?.pincode).toBe("400018");
    expect(decoded?.shipping_address?.city).toBe("Mumbai");
    expect(decoded?.items[0]?.listing?.type).toBe("product");
    expect(decoded?.items[0]?.listing?.weight_grams).toBe(500);
    expect(decoded?.items[0]?.listing?.artisan_collective).toBe(
      "Madh Island Artisanal Collective",
    );
  });

  it("returns null gracefully for invalid or malformed tokens", () => {
    expect(decodePassPayload("")).toBeNull();
    expect(decodePassPayload("random-invalid-token-123")).toBeNull();
    expect(decodePassPayload("{}")).toBeNull();
  });
});

describe("Order Type Classification (Goods vs Experience vs Mixed)", () => {
  it("correctly identifies pure physical goods orders (like Honey)", () => {
    const items: Partial<OrderItem>[] = [
      {
        listing: {
          type: "product",
          pillar: "goods",
          title: "Raw Mangrove Honey",
        } as Listing,
      },
    ];

    const isAllGoods =
      items.length > 0 && items.every((it) => it.listing?.type === "product");
    const hasExperiences = items.some(
      (it) => it.listing?.type === "experience",
    );

    expect(isAllGoods).toBe(true);
    expect(hasExperiences).toBe(false);
  });

  it("correctly identifies pure experience bookings (Walks, Food, Workshops)", () => {
    const items: Partial<OrderItem>[] = [
      {
        listing: {
          type: "experience",
          pillar: "food",
          title: "Authentic Koli Seafood Thali Feast",
        } as Listing,
      },
    ];

    const isAllGoods =
      items.length > 0 && items.every((it) => it.listing?.type === "product");
    const hasExperiences = items.some(
      (it) => it.listing?.type === "experience",
    );
    const hasGoods = items.some((it) => it.listing?.type === "product");

    expect(isAllGoods).toBe(false);
    expect(hasExperiences).toBe(true);
    expect(hasGoods).toBe(false);
  });

  it("correctly identifies mixed orders containing both goods and experiences", () => {
    const items: Partial<OrderItem>[] = [
      {
        listing: {
          type: "experience",
          pillar: "walks",
          title: "Sassoon Docks Morning Walk",
        } as Listing,
      },
      {
        listing: {
          type: "product",
          pillar: "goods",
          title: "Sun-Dried Bombay Duck (Bombil)",
        } as Listing,
      },
    ];

    const isAllGoods =
      items.length > 0 && items.every((it) => it.listing?.type === "product");
    const hasExperiences = items.some(
      (it) => it.listing?.type === "experience",
    );
    const hasGoods = items.some((it) => it.listing?.type === "product");
    const isMixed = hasExperiences && hasGoods;

    expect(isAllGoods).toBe(false);
    expect(isMixed).toBe(true);
  });
});

describe("Dynamic Venue Resolution for Experiences", () => {
  const getDefaultVenueForPillar = (pillar?: string) => {
    switch (pillar) {
      case "food":
        return "Versova Gaothan Dining Courtyard, Andheri West, Mumbai - 400061";
      case "workshops":
        return "Mahim Bay Net-Weaving Guild, Mahim West, Mumbai - 400016";
      case "walks":
      default:
        return "Historic Sassoon Docks Clock Tower Arch, Colaba, Mumbai - 400005";
    }
  };

  it("resolves food feast experiences to Versova Gaothan dining courtyard by default", () => {
    const venue = getDefaultVenueForPillar("food");
    expect(venue).toContain("Versova Gaothan");
    expect(venue).not.toContain("Sassoon Docks");
  });

  it("resolves workshop experiences to Mahim Bay Net-Weaving Guild by default", () => {
    const venue = getDefaultVenueForPillar("workshops");
    expect(venue).toContain("Mahim Bay");
  });

  it("resolves walking tours to Sassoon Docks by default", () => {
    const venue = getDefaultVenueForPillar("walks");
    expect(venue).toContain("Sassoon Docks");
  });
});
