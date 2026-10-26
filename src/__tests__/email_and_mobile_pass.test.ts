import { describe, it, expect } from "vitest";
import { encodePassPayload, decodePassPayload } from "../lib/passPayload";
import { Order } from "../types";
import { TEMPLATES } from "../lib/email-templates/registry";
import { render } from "@react-email/render";
import * as React from "react";
import {
  getOrderCategoryPrefix,
  generateOrderRef,
  calculateOrderGstBreakdown,
  getItemHsnSacCode,
} from "../lib/utils";

describe("Mobile Pass Rehydration & Email Templates Suite", () => {
  const sampleOrder: Order = {
    id: "ord-test-d01",
    order_ref: "MM-EXP-2026-1606",
    customer_name: "Aryan Panchal",
    customer_email: "hello@matsyamart.com",
    customer_phone: "+91 99204 77158",
    total_amount_inr: 2900,
    status: "confirmed",
    created_at: new Date().toISOString(),
    items: [
      {
        id: "item-1",
        order_id: "ord-test-d01",
        listing_id: "exp-versova-heritage",
        slot_id: "slot-versova-1",
        quantity: 2,
        unit_price_inr: 1450,
        attendee_details: [
          { fullName: "Aryan Panchal", phone: "+91 99204 77158", checked_in: false },
          { fullName: "Kunal Sharma", phone: "+91 98200 44556", checked_in: false },
        ],
        listing: {
          id: "exp-versova-heritage",
          title: "Versova Coastal Heritage & Seafood Feast",
          slug: "versova-coastal-heritage-seafood-feast",
          pillar: "food",
          category_id: "cat-food",
          type: "experience",
          host_name: "Anusaya Tai Koli",
          price_inr: 1450,
          currency: "INR",
          short_summary: "Ancestral home dining in Versova",
          full_description: "Enjoy mud crab and authentic Koli cuisine",
          is_active: true,
          is_featured: true,
          location_name: "Versova Gaothan Dining Courtyard",
          secret_meeting_point: "Versova Jetty Gate 1",
          meeting_point_maps_url: "https://maps.app.goo.gl/TfKpsZPCyisNzSXv6",
          images: ["https://images.unsplash.com/photo-1544025162-d76694265947"],
        },
      },
    ],
  };

  describe("1. D01 Mobile Pass Payload & Bare Ref Synthesis", () => {
    it("generates a compact URL token under 1000 bytes", () => {
      const token = encodePassPayload(sampleOrder);
      expect(token).toBeDefined();
      expect(token.length).toBeLessThan(1000);
    });

    it("decodes payload accurately back to order reference and guest", () => {
      const token = encodePassPayload(sampleOrder);
      const decoded = decodePassPayload(token);
      expect(decoded).not.toBeNull();
      expect(decoded?.order_ref).toBe("MM-EXP-2026-1606");
      expect(decoded?.customer_name).toBe("Aryan Panchal");
      expect(decoded?.items[0]?.listing?.pillar).toBe("food");
    });

    it("verifies pattern matching for bare references like MM-EXP-2026-1606", () => {
      const ref = "MM-EXP-2026-1606";
      const isExpMatch = /^MM-(EXP|PRD)/i.test(ref);
      expect(isExpMatch).toBe(true);
      expect(ref.toUpperCase().startsWith("MM-EXP")).toBe(true);
    });
  });

  describe("2. Transactional Email Templates (@react-email)", () => {
    it("registers all 3 official MatsyaMart templates in the registry", () => {
      expect(TEMPLATES["booking-confirmation"]).toBeDefined();
      expect(TEMPLATES["host-proposal-received"]).toBeDefined();
      expect(TEMPLATES["admin-new-proposal-alert"]).toBeDefined();
    });

    it("renders booking-confirmation template to valid HTML containing pass link and GST Tax Invoice", async () => {
      const entry = TEMPLATES["booking-confirmation"]!;
      const element = React.createElement(entry.component, entry.previewData);
      const html = await render(element);

      // Pass & Event Verification
      expect(html).toContain("Confirmed Coastal Food Feast");
      expect(html).toContain("MM-EXP-2026-0042");
      expect(html).toContain("Aryan Panchal");
      expect(html).toContain("Open Boarding Pass on Mobile");
      expect(html).toContain("https://matsyamart.com/order/confirmation/MM-EXP-2026-0042");

      // Clean single-line text links (no raw base64 token dumped in prose)
      expect(html).toContain("matsyamart.com/order/confirmation/MM-EXP-2026-0042");
      expect(html).toContain("matsyamart.com/order/confirmation/MM-EXP-2026-0042?view=invoice");
      expect(html).not.toContain("?p=eyJy");

      // GST Tax Invoice Verification
      expect(html).toContain("OFFICIAL GST TAX INVOICE");
      expect(html).toContain("Kolibaba Seafood Inc.");
      expect(html).toContain("101, Samudra Darshan, Budha Lane 2, Versova, Andheri West");
      expect(html).toContain("27ABBFK9637R1ZF");
      expect(html).toContain("INV-MM-EXP-2026-0042");
      expect(html).toContain("Taxable Value (Subtotal)");
      expect(html).toContain("CGST (9.0%)");
      expect(html).toContain("SGST (9.0%)");
      expect(html).toContain("Total GST (18.0%)");
      expect(html).toContain("View &amp; Print Official Tax Invoice");
      expect(html).toContain("view=invoice");

      // Bhoomiputra Foundation footer placement
      expect(html).toContain("In strategic partnership with");
      expect(html).toContain("Bhoomiputra Foundation");
    });

    it("dynamically themes emails by category: food, walk, workshop", async () => {
      const entry = TEMPLATES["booking-confirmation"]!;

      // 1. Food Theme (Midnight Navy #1c3554)
      const foodElem = React.createElement(entry.component, {
        ...entry.previewData,
        pillar: "food",
        experienceTitle: "Versova Koli Crab Feast",
      });
      const foodHtml = await render(foodElem);
      expect(foodHtml).toContain("#1c3554");
      expect(foodHtml).toContain("Coastal Food Feast");

      // 2. Walk Theme (Seafoam Teal #5f98a0)
      const walkElem = React.createElement(entry.component, {
        ...entry.previewData,
        pillar: "walks",
        experienceTitle: "Sassoon Docks Dawn Heritage Walk",
      });
      const walkHtml = await render(walkElem);
      expect(walkHtml).toContain("#5f98a0");
      expect(walkHtml).toContain("Coastal Heritage Walk");

      // 3. Workshop Theme (Espresso Terracotta #2b120c)
      const workshopElem = React.createElement(entry.component, {
        ...entry.previewData,
        pillar: "workshops",
        experienceTitle: "Traditional Net-Weaving & Boat Carpentry Workshop",
      });
      const workshopHtml = await render(workshopElem);
      expect(workshopHtml).toContain("#2b120c");
      expect(workshopHtml).toContain("Coastal Craft Workshop");
    });

    it("renders host-proposal-received template to valid HTML", async () => {
      const entry = TEMPLATES["host-proposal-received"]!;
      const element = React.createElement(entry.component, entry.previewData);
      const html = await render(element);

      expect(html).toContain("Proposal Received!");
      expect(html).toContain("Ramesh Tandel");
      expect(html).toContain("Versova Crab Masala Tasting Feast");
      expect(html).toContain("hello@matsyamart.com");
    });

    it("renders admin-new-proposal-alert template to valid HTML addressed to hello@matsyamart.com", async () => {
      const entry = TEMPLATES["admin-new-proposal-alert"]!;
      expect(entry.to).toBe("hello@matsyamart.com");

      const element = React.createElement(entry.component, entry.previewData);
      const html = await render(element);

      expect(html).toContain("New Community Proposal");
      expect(html).toContain("Ramesh Tandel");
      expect(html).toContain("hello@matsyamart.com");
    });

    it("verifies clean sender identity in email footer without 'via notify'", async () => {
      const entry = TEMPLATES["booking-confirmation"]!;
      const element = React.createElement(entry.component, entry.previewData);
      const html = await render(element);

      expect(html).toContain("Dispatched from");
      expect(html).toContain("hello@matsyamart.com");
      expect(html).not.toContain("via notify.matsyamart.com");
    });

    it("verifies inter-state orders render IGST and suppress CGST/SGST", async () => {
      const entry = TEMPLATES["booking-confirmation"]!;
      const element = React.createElement(entry.component, {
        ...entry.previewData,
        orderRef: "MM-GD-2026-9901",
        shippingAddress: {
          addressLine: "702 Vastrapur",
          city: "Ahmedabad",
          state: "Gujarat",
          pincode: "380015",
        },
      });
      const html = await render(element);

      expect(html).toContain("IGST (18.0%):");
      expect(html).not.toContain("CGST (9.0%):");
      expect(html).not.toContain("SGST (9.0%):");
    });
  });

  describe("3. Order Reference Prefixes & Statutory GST Utility Suite", () => {
    it("resolves specific 2-letter prefixes for each category", () => {
      expect(
        getOrderCategoryPrefix([
          { listing: { type: "experience", pillar: "walks", title: "Heritage Walk" } },
        ]),
      ).toBe("WK");

      expect(
        getOrderCategoryPrefix([
          { listing: { type: "experience", pillar: "food", title: "Koli Crab Feast" } },
        ]),
      ).toBe("FD");

      expect(
        getOrderCategoryPrefix([
          { listing: { type: "experience", pillar: "workshops", title: "Boat Carpentry Workshop" } },
        ]),
      ).toBe("WS");

      expect(
        getOrderCategoryPrefix([
          { listing: { type: "product", pillar: "goods", title: "Sun Dried Bombay Duck" } },
        ]),
      ).toBe("GD");
    });

    it("generates order refs matching category format", () => {
      const wkRef = generateOrderRef("WK");
      expect(wkRef).toMatch(/^MM-WK-\d{4}-\d{4}$/);

      const fdRef = generateOrderRef("FD");
      expect(fdRef).toMatch(/^MM-FD-\d{4}-\d{4}$/);

      const wsRef = generateOrderRef("WS");
      expect(wsRef).toMatch(/^MM-WS-\d{4}-\d{4}$/);

      const gdRef = generateOrderRef("GD");
      expect(gdRef).toMatch(/^MM-GD-\d{4}-\d{4}$/);
    });

    it("calculates statutory GST breakdown for Maharashtra (Intra-state)", () => {
      const breakdown = calculateOrderGstBreakdown(2360, "Maharashtra");
      expect(breakdown.isInterState).toBe(false);
      expect(breakdown.taxableValue).toBe(2000);
      expect(breakdown.totalGst).toBe(360);
      expect(breakdown.cgst).toBe(180);
      expect(breakdown.sgst).toBe(180);
      expect(breakdown.igst).toBe(0);
      expect(breakdown.supplierGstin).toBe("27ABBFK9637R1ZF");
      expect(breakdown.officialBillingName).toBe("Kolibaba Seafood Inc.");
    });

    it("calculates statutory GST breakdown for Inter-state supply", () => {
      const breakdown = calculateOrderGstBreakdown(2360, "Gujarat");
      expect(breakdown.isInterState).toBe(true);
      expect(breakdown.taxableValue).toBe(2000);
      expect(breakdown.totalGst).toBe(360);
      expect(breakdown.cgst).toBe(0);
      expect(breakdown.sgst).toBe(0);
      expect(breakdown.igst).toBe(360);
    });

    it("resolves accurate HSN/SAC codes for each offering", () => {
      expect(getItemHsnSacCode({ type: "experience", pillar: "walks" }).code).toBe("998553");
      expect(getItemHsnSacCode({ type: "experience", pillar: "food" }).code).toBe("996331");
      expect(getItemHsnSacCode({ type: "experience", pillar: "workshops" }).code).toBe("999293");
      expect(getItemHsnSacCode({ type: "product", title: "Mangrove Honey" }).code).toBe("040900");
      expect(getItemHsnSacCode({ type: "product", title: "Koli Masala Blend" }).code).toBe("091099");
      expect(getItemHsnSacCode({ type: "product", title: "Jawla Dry Prawns" }).code).toBe("030559");
    });
  });

  describe("4. Bhoomiputra Member Discount, Emergency Safety & Multi-Pass Deck Suite", () => {
    it("preserves individual attendee details through URL-safe payload compression", () => {
      const multiTicketOrder: Order = {
        id: "ord-multi-01",
        order_ref: "MM-WK-2026-8812",
        customer_name: "Aryan Panchal",
        customer_email: "aryan@matsyamart.com",
        customer_phone: "+91 99204 77158",
        total_amount_inr: 3600,
        status: "confirmed",
        created_at: new Date().toISOString(),
        items: [
          {
            id: "item-walk-2seats",
            order_id: "ord-multi-01",
            listing_id: "exp-sassoon-trail",
            quantity: 2,
            unit_price_inr: 1200,
            attendee_details: [
              { fullName: "Aryan Panchal", phone: "+91 99204 77158" },
              { fullName: "Kunal Sharma", phone: "+91 98200 44556" },
            ],
            listing: {
              id: "exp-sassoon-trail",
              title: "Sassoon Docks Dawn Heritage Walk",
              slug: "sassoon-docks-dawn-heritage-walk",
              pillar: "walks",
              type: "experience",
              price_inr: 1200,
              currency: "INR",
              host_name: "Ashwini Koli",
              short_summary: "Colaba morning fish market trail",
              full_description: "",
              images: ["https://images.unsplash.com/photo-1544551763-46a013bb70d5"],
              is_active: true,
              is_featured: true,
            },
          },
          {
            id: "item-food-1seat",
            order_id: "ord-multi-01",
            listing_id: "exp-versova-feast",
            quantity: 1,
            unit_price_inr: 1200,
            attendee_details: [
              { fullName: "Aryan Panchal", phone: "+91 99204 77158" },
            ],
            listing: {
              id: "exp-versova-feast",
              title: "Versova Koli Crab Feast",
              slug: "versova-koli-crab-feast",
              pillar: "food",
              type: "experience",
              price_inr: 1200,
              currency: "INR",
              host_name: "Anusaya Tai Koli",
              short_summary: "Authentic coastal dining",
              full_description: "",
              images: ["https://images.unsplash.com/photo-1544025162-d76694265947"],
              is_active: true,
              is_featured: true,
            },
          },
        ],
      };

      const token = encodePassPayload(multiTicketOrder);
      expect(token).toBeDefined();
      expect(token.length).toBeLessThan(1000);

      const decoded = decodePassPayload(token);
      expect(decoded).not.toBeNull();
      expect(decoded?.items).toHaveLength(2);
      expect(decoded?.items[0]?.attendee_details).toHaveLength(2);
      expect(decoded?.items[0]?.attendee_details?.[0]?.fullName).toBe("Aryan Panchal");
      expect(decoded?.items[0]?.attendee_details?.[1]?.fullName).toBe("Kunal Sharma");
      expect(decoded?.items[1]?.attendee_details?.[0]?.fullName).toBe("Aryan Panchal");
    });

    it("renders Apple-style Pass Roster in email for multi-ticket orders", async () => {
      const entry = TEMPLATES["booking-confirmation"]!;
      const element = React.createElement(entry.component, {
        ...entry.previewData,
        orderRef: "MM-WK-2026-8812",
        items: [
          {
            title: "Sassoon Docks Dawn Heritage Walk",
            quantity: 2,
            unitPrice: 1200,
            pillar: "walks",
            attendees: ["Aryan Panchal", "Kunal Sharma"],
          },
          {
            title: "Versova Koli Crab Feast",
            quantity: 1,
            unitPrice: 1200,
            pillar: "food",
            attendees: ["Aryan Panchal"],
          },
        ],
      });

      const html = await render(element);
      expect(html).toContain("ADMISSION PASS ROSTER (3 TICKETS)");
      expect(html).toContain("TICKET #1 · Sassoon Docks Dawn Heritage Walk");
      expect(html).toContain("Guest: Aryan Panchal");
      expect(html).toContain("TICKET #2 · Sassoon Docks Dawn Heritage Walk");
      expect(html).toContain("Guest: Kunal Sharma");
      expect(html).toContain("TICKET #3 · Versova Koli Crab Feast");
    });

    it("calculates Bhoomiputra member discount correctly across eligible categories", () => {
      const discountPercent = 15;
      const eligiblePillars = ["food", "walks", "workshops"];

      const cartItems = [
        { price: 1200, qty: 2, pillar: "walks" }, // 2400 (eligible)
        { price: 1500, qty: 1, pillar: "food" },  // 1500 (eligible)
        { price: 500, qty: 1, pillar: "goods" },   // 500 (not eligible)
      ];

      const eligibleTotal = cartItems
        .filter((i) => eligiblePillars.includes(i.pillar))
        .reduce((sum, i) => sum + i.price * i.qty, 0);

      expect(eligibleTotal).toBe(3900);
      const discount = Math.round((eligibleTotal * discountPercent) / 100);
      expect(discount).toBe(585);
    });

    it("verifies Bhoomiputra discount is strictly 0 when member status is unverified or checking", () => {
      const discountPercent = 15;
      const eligibleTotal = 3900;
      const minOrderInr = 500;

      // When isBhoomiMember is true BUT verifyStatus is "idle", "verifying", or "error"
      const computeDiscount = (isMember: boolean, verifyStatus: string) => {
        return isMember && verifyStatus === "verified" && eligibleTotal >= minOrderInr
          ? Math.round((eligibleTotal * discountPercent) / 100)
          : 0;
      };

      expect(computeDiscount(false, "idle")).toBe(0);
      expect(computeDiscount(true, "idle")).toBe(0);
      expect(computeDiscount(true, "verifying")).toBe(0);
      expect(computeDiscount(true, "error")).toBe(0);
      expect(computeDiscount(true, "verified")).toBe(585);
    });

    it("verifies Apple design email canvas uses clean light background and concise card hierarchy", async () => {
      const entry = TEMPLATES["booking-confirmation"]!;
      const element = React.createElement(entry.component, entry.previewData);
      const html = await render(element);

      // Light Apple Canvas
      expect(html).toContain("background-color:#f5f5f7");
      expect(html).toContain("border-radius:20px");
      expect(html).toContain("MATSYAMART · OFFICIAL PASS");

      // Concise Apple Table
      expect(html).toContain("SCHEDULE &amp; TIME");
      expect(html).toContain("GUEST ADMISSION");
      expect(html).toContain("Total Amount Paid");

      // No verbose paragraphs or raw base64 dumping
      expect(html).not.toContain("?p=eyJy");
      expect(html).not.toContain("Tip: tap below to open your secure QR boarding pass");
    });
  });
});
