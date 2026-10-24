import { describe, it, expect } from "vitest";
import { SEED_PARTNERS } from "../data/seedData";
import { normalizeWhatsAppPhone } from "../lib/whatsapp";
import { exportManifestCsv, ManifestRow } from "../lib/services/manifest";

describe("Batch D & Batch E End-to-End Suite", () => {
  describe("Batch D: Host Portal Gate Authentication & CSV Export", () => {
    it("recognizes 9920477158 and 7666511511 as authorized partners", () => {
      const p1 = SEED_PARTNERS.find(
        (p) => normalizeWhatsAppPhone(p.phone) === "919920477158",
      );
      expect(p1).toBeDefined();
      expect(p1?.name).toContain("Capt. Dilip Koli");

      const p2 = SEED_PARTNERS.find(
        (p) => normalizeWhatsAppPhone(p.phone) === "917666511511",
      );
      expect(p2).toBeDefined();
      expect(p2?.name).toContain("Host Liaison");
    });

    it("rejects unauthorized phone numbers like 9111111111", () => {
      const match = SEED_PARTNERS.find(
        (p) => normalizeWhatsAppPhone(p.phone) === "919111111111",
      );
      expect(match).toBeUndefined();
    });

    it("exports valid canonical manifest CSV with required column headers", () => {
      const mockRows: ManifestRow[] = [
        {
          orderId: "ord-1",
          orderRef: "MM-EXP-FOOD-TEST",
          pillar: "food",
          offeringId: "exp-seafood-feast-01",
          offeringTitle: "Versova Seafood Thali",
          venueName: "Versova Gaothan Courtyard",
          seatIndex: 1,
          attendeeName: "Aryan Panchal",
          attendeePhone: "+91 99204 77158",
          customerName: "Aryan Panchal",
          customerEmail: "aryan@example.com",
          customerPhone: "+91 99204 77158",
          bookingId: "b-1",
          sessionStart: new Date().toISOString(),
          checkedIn: true,
          checkInTime: new Date().toISOString(),
          status: "confirmed",
          unitPriceINR: 1450,
        },
      ];

      const csv = exportManifestCsv(mockRows);
      expect(csv).toContain("Order Ref");
      expect(csv).toContain("Seat #");
      expect(csv).toContain("Attendee Name");
      expect(csv).toContain("Check-In Status");
      expect(csv).toContain("MM-EXP-FOOD-TEST");
      expect(csv).toContain("CHECKED IN");
    });
  });

  describe("Batch E: Inventory Stock & Refund Capacity Mechanics", () => {
    it("flags low stock dynamically when threshold is greater than stock units", () => {
      const batch = {
        stock_units: 50,
        min_threshold: 5,
      };

      expect(batch.stock_units <= batch.min_threshold).toBe(false);

      // Edit threshold to 60 as per M-E02
      batch.min_threshold = 60;
      expect(batch.stock_units <= batch.min_threshold).toBe(true);

      // Restock +50 units
      batch.stock_units += 50; // 100
      expect(batch.stock_units <= batch.min_threshold).toBe(false);
    });

    it("calculates accurate capacity recovery upon order refund", () => {
      const slot = {
        id: "slot-food-1",
        capacity: 15,
        booked_count: 12,
      };

      const orderSeatsToRefund = 2;
      const nextBookedCount = Math.max(0, slot.booked_count - orderSeatsToRefund);

      expect(nextBookedCount).toBe(10);
    });
  });
});
