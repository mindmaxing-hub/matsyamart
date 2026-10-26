import { describe, it, expect, beforeEach } from "vitest";
import {
  encodeCartRestoreToken,
  decodeCartRestoreToken,
  recordAbandonedCart,
  getSavedAbandonedCarts,
  updateAbandonedCartStatus,
  buildCartRestoreUrl,
} from "../lib/abandonedCart";

describe("Abandoned Cart Recovery Engine Suite", () => {
  beforeEach(() => {
    if (typeof localStorage !== "undefined") {
      localStorage.clear();
    }
  });

  it("encodes and decodes cart restore tokens cleanly in roundtrip", () => {
    const original = {
      customerName: "Aarav Sharma",
      customerPhone: "9820144512",
      customerEmail: "aarav@example.com",
      emergencyContact: "+91 99204 77158",
      memberId: "BHOOMI-7788",
      memberDiscountApplied: true,
      items: [
        {
          listingId: "exp-walk-sassoon",
          quantity: 2,
          slotId: "slot-2026-10-28",
        },
        {
          listingId: "prod-bombay-duck",
          quantity: 1,
        },
      ],
    };

    const token = encodeCartRestoreToken(original);
    expect(token).toBeTruthy();
    expect(typeof token).toBe("string");

    const decoded = decodeCartRestoreToken(token);
    expect(decoded).not.toBeNull();
    expect(decoded?.customerName).toBe("Aarav Sharma");
    expect(decoded?.customerPhone).toBe("9820144512");
    expect(decoded?.customerEmail).toBe("aarav@example.com");
    expect(decoded?.memberId).toBe("BHOOMI-7788");
    expect(decoded?.memberDiscountApplied).toBe(true);
    expect(decoded?.items).toHaveLength(2);
    expect(decoded?.items[0]?.listingId).toBe("exp-walk-sassoon");
    expect(decoded?.items[0]?.quantity).toBe(2);
    expect(decoded?.items[0]?.slotId).toBe("slot-2026-10-28");
  });

  it("records and updates abandoned cart state in local persistence", () => {
    const saved = recordAbandonedCart({
      customerName: "Kavita Rao",
      customerPhone: "9920477158",
      items: [
        {
          listingId: "feast-crab",
          title: "Versova Koli Crab Masala",
          pillar: "food",
          priceINR: 1200,
          quantity: 2,
        },
      ],
      totalINR: 2400,
    });

    expect(saved.id).toBeTruthy();
    expect(saved.status).toBe("abandoned");

    const all = getSavedAbandonedCarts();
    expect(all).toHaveLength(1);
    expect(all[0]?.customerName).toBe("Kavita Rao");

    // Update status to contacted
    updateAbandonedCartStatus(saved.id, "contacted", "whatsapp");
    const updated = getSavedAbandonedCarts();
    expect(updated[0]?.status).toBe("contacted");
    expect(updated[0]?.recoveryChannel).toBe("whatsapp");
  });

  it("builds correct cart restore URL with token", () => {
    const cart = {
      id: "cart-test-1",
      customerName: "Rohan V",
      customerPhone: "9820144512",
      items: [{ listingId: "walk-1", title: "Walk", pillar: "walks", priceINR: 850, quantity: 1 }],
      totalINR: 850,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      status: "abandoned" as const,
    };

    const url = buildCartRestoreUrl(cart, "https://matsyamart.com");
    expect(url).toContain("https://matsyamart.com/?restore=");
  });
});
