import { describe, it, expect } from "vitest";
import { encodePassPayload, decodePassPayload } from "../lib/passPayload";
import { Order } from "../types";
import { TEMPLATES } from "../lib/email-templates/registry";
import { render } from "@react-email/render";
import * as React from "react";

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

    it("renders booking-confirmation template to valid HTML containing pass link", async () => {
      const entry = TEMPLATES["booking-confirmation"]!;
      const element = React.createElement(entry.component, entry.previewData);
      const html = await render(element);

      expect(html).toContain("Confirmed Coastal Pass");
      expect(html).toContain("MM-EXP-2026-0042");
      expect(html).toContain("Aryan Panchal");
      expect(html).toContain("hello@matsyamart.com");
      expect(html).toContain("Open Boarding Pass on Mobile");
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
  });
});
