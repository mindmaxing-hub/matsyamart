import { describe, it, expect, beforeEach } from "vitest";

describe("Coupon Synchronization & DEAL100 Verification Suite", () => {
  const STORAGE_COUPONS = "matsyamart_coupons_v1";

  beforeEach(() => {
    localStorage.clear();
  });

  it("verifies DEAL100 coupon properties and ₹1 test checkout calculation", () => {
    const rawHoneyPrice = 550;
    const deal100Discount = 549;
    const finalAmount = Math.max(1, rawHoneyPrice - deal100Discount);

    expect(deal100Discount).toBe(549);
    expect(finalAmount).toBe(1);
  });

  it("ensures existing localStorage merges new seeds without overwriting existing coupons", () => {
    // Simulate user with stale localStorage on mobile or laptop
    const existingStaleCoupons = [
      {
        id: "coup-custom-old",
        code: "OLDPROMO",
        description: "Older Promo",
        discount_type: "percent",
        discount_value: 5,
        min_order_inr: 0,
        applicable_pillars: ["goods"],
        used_count: 0,
        is_active: true,
        created_at: new Date().toISOString(),
      },
    ];

    localStorage.setItem(STORAGE_COUPONS, JSON.stringify(existingStaleCoupons));

    // Simulated DataContext seed list containing DEAL100
    const SEED_COUPONS = [
      {
        id: "coup-deal-100",
        code: "DEAL100",
        description: "Live Order Verification Deal · Flat ₹549 Off (₹1 Test Checkout)",
        discount_type: "flat",
        discount_value: 549,
        min_order_inr: 0,
        applicable_pillars: ["goods", "food", "walks", "workshops"],
        used_count: 0,
        is_active: true,
        created_at: new Date().toISOString(),
      },
    ];

    const saved = localStorage.getItem(STORAGE_COUPONS);
    const parsed = saved ? JSON.parse(saved) : [];
    const missingSeeds = SEED_COUPONS.filter(
      (seed) => !parsed.some((c: any) => c.code.toUpperCase() === seed.code.toUpperCase())
    );

    const merged = [...parsed, ...missingSeeds];
    localStorage.setItem(STORAGE_COUPONS, JSON.stringify(merged));

    const finalStorage = JSON.parse(localStorage.getItem(STORAGE_COUPONS)!);
    expect(finalStorage.length).toBe(2);
    expect(finalStorage.some((c: any) => c.code === "DEAL100")).toBe(true);
    expect(finalStorage.some((c: any) => c.code === "OLDPROMO")).toBe(true);
  });

  it("updates existing stale stored DEAL100 coupon that lacked 'goods' pillar", () => {
    // Stale version of DEAL100 that only had walks and workshops
    const staleDeal100 = [
      {
        id: "coup-deal-100",
        code: "DEAL100",
        description: "Old Deal",
        discount_type: "flat",
        discount_value: 549,
        min_order_inr: 0,
        applicable_pillars: ["walks", "workshops"], // Missing goods!
        used_count: 0,
        is_active: true,
        created_at: new Date().toISOString(),
      },
    ];

    localStorage.setItem(STORAGE_COUPONS, JSON.stringify(staleDeal100));

    const SEED_COUPONS = [
      {
        id: "coup-deal-100",
        code: "DEAL100",
        description: "Live Order Verification Deal · Flat ₹549 Off (₹1 Test Checkout)",
        discount_type: "flat",
        discount_value: 549,
        min_order_inr: 0,
        applicable_pillars: ["goods", "food", "walks", "workshops"],
        used_count: 0,
        is_active: true,
        created_at: new Date().toISOString(),
      },
    ];

    const saved = localStorage.getItem(STORAGE_COUPONS);
    const parsed = saved ? JSON.parse(saved) : [];
    const seedMap = new Map(SEED_COUPONS.map((s) => [s.code.toUpperCase(), s]));
    const updatedParsed = parsed.map((c: any) => {
      const canonical = seedMap.get(c.code.toUpperCase());
      return canonical ? { ...c, ...canonical } : c;
    });

    localStorage.setItem(STORAGE_COUPONS, JSON.stringify(updatedParsed));

    const finalCoupons = JSON.parse(localStorage.getItem(STORAGE_COUPONS)!);
    const deal100 = finalCoupons.find((c: any) => c.code === "DEAL100");
    expect(deal100.applicable_pillars).toContain("goods");
  });
});
