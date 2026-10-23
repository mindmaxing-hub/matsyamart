import { describe, it, expect } from "vitest";
import { getCartLineKey } from "../context/CartContext";

describe("Cart Line Keying and Multi-Session Segregation", () => {
  it("generates distinct cart line keys for different sessions of the same listing", () => {
    const listingId = "exp-versova-heritage-trail";
    const slotIdMorning = "slot-2026-10-25-0700";
    const slotIdEvening = "slot-2026-10-25-1630";

    const keyMorning = getCartLineKey(listingId, slotIdMorning);
    const keyEvening = getCartLineKey(listingId, slotIdEvening);

    expect(keyMorning).toBe("exp-versova-heritage-trail:slot-2026-10-25-0700");
    expect(keyEvening).toBe("exp-versova-heritage-trail:slot-2026-10-25-1630");
    expect(keyMorning).not.toBe(keyEvening);
  });

  it("falls back to listing ID for pantry products with no session slot", () => {
    const productId = "prod-kolibaba-bombil-crisps";
    const key = getCartLineKey(productId);

    expect(key).toBe("prod-kolibaba-bombil-crisps");
  });

  it("handles removeItems filtering targeting only specified session keys", () => {
    const cartItems = [
      {
        listingId: "exp-versova",
        slotId: "slot-morning",
        title: "Versova Trail Morning",
      },
      {
        listingId: "exp-versova",
        slotId: "slot-evening",
        title: "Versova Trail Evening",
      },
      {
        listingId: "prod-fish-pickle",
        slotId: undefined,
        title: "Koli Fish Pickle",
      },
    ];

    const itemsToRemove = [{ listingId: "exp-versova", slotId: "slot-morning" }];
    const keysToRemove = new Set(
      itemsToRemove.map((i) => getCartLineKey(i.listingId, i.slotId)),
    );

    const remaining = cartItems.filter(
      (item) => !keysToRemove.has(getCartLineKey(item.listingId, item.slotId)),
    );

    expect(remaining).toHaveLength(2);
    expect(remaining.map((r) => r.slotId)).toEqual(["slot-evening", undefined]);
  });
});
