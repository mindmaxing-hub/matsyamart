import { describe, it, expect } from "vitest";
import { isDummyOrPlaceholderPhone, sanitizeOrderIdentity } from "../lib/utils";
import { Order } from "../types";

describe("Placeholder Phone and Passholder Label Eradication Suite", () => {
  it("identifies all representations of the 9920477158 placeholder phone", () => {
    expect(isDummyOrPlaceholderPhone("+91 99204 77158")).toBe(true);
    expect(isDummyOrPlaceholderPhone("9920477158")).toBe(true);
    expect(isDummyOrPlaceholderPhone("+919920477158")).toBe(true);
    expect(isDummyOrPlaceholderPhone("91 99204 77158")).toBe(true);
    expect(isDummyOrPlaceholderPhone("09920477158")).toBe(true);
    expect(isDummyOrPlaceholderPhone("")).toBe(true);
    expect(isDummyOrPlaceholderPhone(undefined)).toBe(true);
    expect(isDummyOrPlaceholderPhone("12345")).toBe(true);
    expect(isDummyOrPlaceholderPhone("0000000000")).toBe(true);
  });

  it("permits genuine customer and liaison mobile numbers", () => {
    expect(isDummyOrPlaceholderPhone("+91 73042 90690")).toBe(false);
    expect(isDummyOrPlaceholderPhone("7304290690")).toBe(false);
    expect(isDummyOrPlaceholderPhone("+91 76665 11511")).toBe(false);
    expect(isDummyOrPlaceholderPhone("9820144512")).toBe(false);
  });

  it("auto-scrubs placeholder phones and converts passholder titles to Valued Patron for goods", () => {
    const staleGoodsOrder: Order = {
      id: "ord-test-stale",
      order_ref: "MM-GD-2026-4754",
      customer_name: "Verified Passholder",
      customer_email: "guest@matsyamart.com",
      customer_phone: "+91 99204 77158",
      total_amount_inr: 550,
      status: "confirmed",
      created_at: new Date().toISOString(),
      items: [
        {
          id: "item-1",
          order_id: "ord-test-stale",
          listing_id: "prd-mangrove-honey",
          quantity: 1,
          unit_price_inr: 550,
          listing: {
            id: "prd-mangrove-honey",
            title: "Mangrove Wild Forest Honey",
            slug: "mangrove-wild-honey",
            type: "product",
            pillar: "goods",
            price_inr: 550,
            currency: "INR",
            short_summary: "Pure honey",
            full_description: "Pure honey",
            images: [],
            host_name: "Artisan Collective",
            is_active: true,
            is_featured: false,
          },
        },
      ],
    };

    const sanitized = sanitizeOrderIdentity(staleGoodsOrder);
    expect(sanitized.customer_phone).toBe("");
    expect(sanitized.customer_name).toBe("Valued Patron");
  });

  it("preserves real customer names on goods orders", () => {
    const realCustomerOrder: Order = {
      id: "ord-test-real",
      order_ref: "MM-GD-2026-4754",
      customer_name: "Aryan Panchal",
      customer_email: "mindmaxxxing@gmail.com",
      customer_phone: "+91 73042 90690",
      total_amount_inr: 550,
      status: "confirmed",
      created_at: new Date().toISOString(),
      items: [
        {
          id: "item-1",
          order_id: "ord-test-real",
          listing_id: "prd-mangrove-honey",
          quantity: 1,
          unit_price_inr: 550,
          listing: {
            id: "prd-mangrove-honey",
            title: "Mangrove Wild Forest Honey",
            slug: "mangrove-wild-honey",
            type: "product",
            pillar: "goods",
            price_inr: 550,
            currency: "INR",
            short_summary: "Pure honey",
            full_description: "Pure honey",
            images: [],
            host_name: "Artisan Collective",
            is_active: true,
            is_featured: false,
          },
        },
      ],
    };

    const sanitized = sanitizeOrderIdentity(realCustomerOrder);
    expect(sanitized.customer_phone).toBe("+91 73042 90690");
    expect(sanitized.customer_name).toBe("Aryan Panchal");
  });
});
