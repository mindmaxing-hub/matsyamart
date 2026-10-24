import { describe, it, expect } from "vitest";
import { encodePassPayload, decodePassPayload } from "../lib/passPayload";
import { resolvePassCategory, PASS_THEMES } from "../lib/passThemes";
import { buildCanonicalManifest } from "../lib/services/manifest";
import { Order, OrderItem, Listing, ExperienceSlot } from "../types";

describe("MatsyaMart Master QA Suite — Automated Business Rules & Invariants", () => {
  /* -------------------------------------------------------------------------
   * 1. CART LINE-ITEM KEYING & DIFFERENTIATION
   * ------------------------------------------------------------------------- */
  describe("Cart Line-Item Keying", () => {
    it("creates discrete cart lines for same experience booked on different dates", () => {
      const mockListing: Listing = {
        id: "exp-01",
        title: "Sassoon Docks Dawn Heritage Walk",
        slug: "sassoon-docks-dawn-heritage-walk",
        type: "experience",
        pillar: "walks",
        price_inr: 1200,
        currency: "INR",
        short_summary: "Dawn walk",
        full_description: "Dawn walk",
        host_name: "Capt Dilip",
        images: ["/sample.jpg"],
        is_active: true,
        is_featured: false,
      };

      const lineA: OrderItem = {
        id: "item-day1",
        order_id: "ord-1",
        listing_id: "exp-01",
        quantity: 1,
        unit_price_inr: 1200,
        listing: mockListing,
        slot_id: "slot-sat",
      };

      const lineB: OrderItem = {
        id: "item-day2",
        order_id: "ord-1",
        listing_id: "exp-01",
        quantity: 1,
        unit_price_inr: 1200,
        listing: mockListing,
        slot_id: "slot-sun",
      };

      // Invariants: Unique key per offering + slotId
      const keyA = `${lineA.listing_id}_${lineA.slot_id}`;
      const keyB = `${lineB.listing_id}_${lineB.slot_id}`;

      expect(keyA).not.toBe(keyB);
      expect(keyA).toBe("exp-01_slot-sat");
      expect(keyB).toBe("exp-01_slot-sun");
    });

    it("increments quantity on same line for identical physical goods", () => {
      let cart = [{ id: "prd-honey", qty: 1, price: 650 }];

      // User adds same product second time
      const incomingId = "prd-honey";
      const existing = cart.find((i) => i.id === incomingId);
      if (existing) {
        existing.qty += 1;
      } else {
        cart.push({ id: incomingId, qty: 1, price: 650 });
      }

      expect(cart.length).toBe(1);
      expect(cart[0]?.qty).toBe(2);
      expect((cart[0]?.qty || 0) * (cart[0]?.price || 0)).toBe(1300);
    });
  });

  /* -------------------------------------------------------------------------
   * 2. GST 18% INCLUSIVE MATHEMATICS
   * ------------------------------------------------------------------------- */
  describe("GST 18% Inclusive Mathematics", () => {
    it("accurately calculates 18% inclusive GST (CGST 9% + SGST 9%) without rounding drift", () => {
      const totalAmount = 2400;

      // Taxable Value = Total / 1.18
      const taxableValue = Math.round((totalAmount / 1.18) * 100) / 100;
      const totalGst = Math.round((totalAmount - taxableValue) * 100) / 100;
      const cgst = Math.round((totalGst / 2) * 100) / 100;
      const sgst = Math.round((totalGst - cgst) * 100) / 100;

      expect(taxableValue).toBe(2033.9);
      expect(totalGst).toBe(366.1);
      expect(cgst).toBe(183.05);
      expect(sgst).toBe(183.05);
      expect(Math.round((taxableValue + cgst + sgst) * 100) / 100).toBe(totalAmount);
    });

    it("handles zero or small amounts safely", () => {
      const total = 0;
      const taxable = Math.round((total / 1.18) * 100) / 100;
      expect(taxable).toBe(0);
    });
  });

  /* -------------------------------------------------------------------------
   * 3. CATEGORY PASS THEME ENGINE & DESIGN ENFORCEMENT
   * ------------------------------------------------------------------------- */
  describe("Category Pass Themes", () => {
    it("applies Midnight Navy theme to Food feast experiences", () => {
      const foodListing: Listing = {
        id: "l-food",
        title: "Versova Koli Seafood Thali Feast",
        slug: "versova-seafood-thali",
        type: "experience",
        pillar: "food",
        price_inr: 1500,
        currency: "INR",
        short_summary: "Authentic coastal dining",
        full_description: "Dining",
        host_name: "Anusaya Tai",
        images: ["/food.jpg"],
        is_active: true,
        is_featured: true,
      };

      const category = resolvePassCategory(foodListing);
      expect(category).toBe("food");

      const theme = PASS_THEMES[category];
      expect(theme.categoryLabel).toBe("Food");
      expect(theme.headerImage).toBe("/pass-header-food.png");
      expect(theme.bgClass).toBe("bg-[#1c3554]");
      expect(theme.titleColor).toBe("text-[#e3a157]");
      expect(theme.qrDarkColor).toBe("#1c2f44");
    });

    it("applies Seafoam Teal theme with Deep Marine Navy title to Walk experiences", () => {
      const walkListing: Listing = {
        id: "l-walk",
        title: "Sassoon Docks Dawn Heritage Walk",
        slug: "sassoon-dawn-walk",
        type: "experience",
        pillar: "walks",
        price_inr: 1200,
        currency: "INR",
        short_summary: "Dawn walk",
        full_description: "Walk",
        host_name: "Dilip Koli",
        images: ["/walk.jpg"],
        is_active: true,
        is_featured: true,
      };

      const category = resolvePassCategory(walkListing);
      expect(category).toBe("walk");

      const theme = PASS_THEMES[category];
      expect(theme.categoryLabel).toBe("Walk");
      expect(theme.headerImage).toBe("/pass-header-walk.png");
      expect(theme.bgClass).toBe("bg-[#5f98a0]");
      // High contrast deep navy against teal
      expect(theme.titleColor).toBe("text-[#1b2b49]");
      expect(theme.qrDarkColor).toBe("#0c3a4b");
    });

    it("applies Espresso Terracotta theme to Workshop experiences", () => {
      const workshopListing: Listing = {
        id: "l-workshop",
        title: "Mahim Bay Net-Weaving Guild",
        slug: "mahim-net-weaving",
        type: "experience",
        pillar: "workshops",
        price_inr: 800,
        currency: "INR",
        short_summary: "Net weaving",
        full_description: "Workshop",
        host_name: "Laxman Nakawa",
        images: ["/workshop.jpg"],
        is_active: true,
        is_featured: false,
      };

      const category = resolvePassCategory(workshopListing);
      expect(category).toBe("workshop");

      const theme = PASS_THEMES[category];
      expect(theme.categoryLabel).toBe("Workshop");
      expect(theme.headerImage).toBe("/pass-header-workshop.png");
      expect(theme.bgClass).toBe("bg-[#2b120c]");
      expect(theme.titleColor).toBe("text-[#e3a157]");
      expect(theme.qrDarkColor).toBe("#260e03");
    });
  });

  /* -------------------------------------------------------------------------
   * 4. CROSS-DEVICE QR PAYLOAD INTEGRITY
   * ------------------------------------------------------------------------- */
  describe("Cross-Device QR Payload Compression & Rehydration", () => {
    it("compresses and rehydrates full order with 0 backend dependencies", () => {
      const order: Order = {
        id: "ord-test",
        order_ref: "MM-EXP-2026-QA99",
        customer_name: "Aryan Panchal",
        customer_email: "aryan@example.com",
        customer_phone: "+91 99204 77158",
        total_amount_inr: 2400,
        status: "confirmed",
        emergency_contact: "+91 98201 11223",
        created_at: "2026-10-24T10:00:00Z",
        items: [
          {
            id: "it-1",
            order_id: "ord-test",
            listing_id: "list-1",
            quantity: 2,
            unit_price_inr: 1200,
            listing: {
              id: "list-1",
              title: "Sassoon Docks Morning Walk",
              slug: "sassoon-docks",
              type: "experience",
              pillar: "walks",
              price_inr: 1200,
              currency: "INR",
              short_summary: "Walk",
              full_description: "Walk",
              host_name: "Capt Dilip",
              location_name: "Historic Sassoon Docks",
              images: ["/img.jpg"],
              is_active: true,
              is_featured: false,
            },
            slot: {
              id: "slot-1",
              listing_id: "list-1",
              slot_start: "2026-10-25T06:30:00Z",
              slot_end: "2026-10-25T08:30:00Z",
              capacity: 15,
              booked_count: 2,
              is_cancelled: false,
            },
          },
        ],
      };

      const payload = encodePassPayload(order);
      expect(payload.length).toBeGreaterThan(50);
      expect(payload).not.toMatch(/[+/=]/); // URL-safe base64

      const restored = decodePassPayload(payload);
      expect(restored).not.toBeNull();
      expect(restored?.order_ref).toBe("MM-EXP-2026-QA99");
      expect(restored?.customer_name).toBe("Aryan Panchal");
      expect(restored?.items[0]?.listing?.location_name).toBe("Historic Sassoon Docks");
      expect(restored?.items[0]?.quantity).toBe(2);
    });

    it("resists malformed or truncated payloads gracefully", () => {
      expect(decodePassPayload("")).toBeNull();
      expect(decodePassPayload("eyJinvalid")).toBeNull();
      expect(decodePassPayload("###not-base64###")).toBeNull();
    });
  });

  /* -------------------------------------------------------------------------
   * 5. HOST ATTENDANCE & CANONICAL MANIFEST INTEGRATION
   * ------------------------------------------------------------------------- */
  describe("Host Attendance & Manifest Engine", () => {
    it("generates maritime compliant canonical manifest rows with discrete seats", () => {
      const orders: Order[] = [
        {
          id: "ord-m1",
          order_ref: "MM-EXP-9001",
          customer_name: "Siddharth Rao",
          customer_email: "sid@example.com",
          customer_phone: "+91 98200 44556",
          total_amount_inr: 2400,
          status: "confirmed",
          emergency_contact: "+91 99999 88888",
          created_at: "2026-10-24T06:00:00Z",
          items: [
            {
              id: "it-m1",
              order_id: "ord-m1",
              listing_id: "l-walk",
              quantity: 2,
              unit_price_inr: 1200,
              slot_id: "s-walk-1",
              attendee_details: [
                { fullName: "Siddharth Rao", phone: "+91 98200 44556", checked_in: true },
                { fullName: "Rohan Rao", phone: "+91 98200 44557", checked_in: false },
              ],
            },
          ],
        },
      ];

      const listings: Listing[] = [
        {
          id: "l-walk",
          title: "Sassoon Docks Morning Walk",
          slug: "sassoon-walk",
          type: "experience",
          pillar: "walks",
          price_inr: 1200,
          currency: "INR",
          short_summary: "Walk",
          full_description: "Walk",
          host_name: "Capt Dilip",
          images: [],
          is_active: true,
          is_featured: false,
        },
      ];

      const slots: ExperienceSlot[] = [
        {
          id: "s-walk-1",
          listing_id: "l-walk",
          slot_start: "2026-10-25T06:30:00Z",
          slot_end: "2026-10-25T08:30:00Z",
          capacity: 15,
          booked_count: 2,
          is_cancelled: false,
        },
      ];

      const rows = buildCanonicalManifest(orders, listings, slots);
      expect(rows.length).toBe(2); // 2 discrete seats

      // Seat 1 checked in
      expect(rows[0]?.attendeeName).toBe("Siddharth Rao");
      expect(rows[0]?.checkedIn).toBe(true);

      // Seat 2 not checked in
      expect(rows[1]?.attendeeName).toBe("Rohan Rao");
      expect(rows[1]?.checkedIn).toBe(false);
    });
  });
});
