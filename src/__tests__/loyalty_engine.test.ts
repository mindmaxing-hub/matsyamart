import { describe, it, expect } from "vitest";
import {
  DEFAULT_LOYALTY_CONFIG,
  calculatePendingPoints,
  validatePointsRedemption,
  calculateRefundLoyaltyClawback,
} from "../lib/services/loyalty";
import { LoyaltyMembership } from "../types";

describe("MatsyaPoints Loyalty Engine", () => {
  const mockBronzeMember: LoyaltyMembership = {
    id: "mem-01",
    phone: "+91 98200 88219",
    current_tier: "Coastal Ally (Bronze)",
    lifetime_spend_inr: 1200,
    spendable_points: 150,
    pending_points: 0,
    created_at: "2026-10-01T00:00:00Z",
    updated_at: "2026-10-01T00:00:00Z",
  };

  const mockGoldMember: LoyaltyMembership = {
    id: "mem-02",
    phone: "+91 99308 22104",
    current_tier: "Deep Sea Patron (Gold)",
    lifetime_spend_inr: 22000,
    spendable_points: 800,
    pending_points: 100,
    created_at: "2026-08-01T00:00:00Z",
    updated_at: "2026-10-01T00:00:00Z",
  };

  it("calculates pending points according to member tier earning rate", () => {
    // Bronze: 3% back
    const pointsBronze = calculatePendingPoints({
      config: DEFAULT_LOYALTY_CONFIG,
      membership: mockBronzeMember,
      eligibleItemRevenueINR: 2000,
    });
    expect(pointsBronze).toBe(60); // 3% of 2000

    // Gold: 8% back
    const pointsGold = calculatePendingPoints({
      config: DEFAULT_LOYALTY_CONFIG,
      membership: mockGoldMember,
      eligibleItemRevenueINR: 2000,
    });
    expect(pointsGold).toBe(160); // 8% of 2000
  });

  it("validates redemption respecting max redemption cap and available balance", () => {
    // Order total ₹1000, max redemption 50% = max ₹500 (500 pts at ₹1/pt)
    // Member has 150 spendable points
    const res1 = validatePointsRedemption({
      config: DEFAULT_LOYALTY_CONFIG,
      membership: mockBronzeMember,
      pointsToRedeem: 100,
      eligibleCartTotalINR: 1000,
    });
    expect(res1.valid).toBe(true);
    expect(res1.pointsApproved).toBe(100);
    expect(res1.discountINR).toBe(100);

    // Attempting to redeem more points than available
    const res2 = validatePointsRedemption({
      config: DEFAULT_LOYALTY_CONFIG,
      membership: mockBronzeMember,
      pointsToRedeem: 300, // only has 150
      eligibleCartTotalINR: 1000,
    });
    expect(res2.valid).toBe(false);
    expect(res2.error).toContain("available balance is only 150 points");

    // Attempting to redeem more points than the 50% max order cap
    const res3 = validatePointsRedemption({
      config: DEFAULT_LOYALTY_CONFIG,
      membership: mockGoldMember, // has 800 points
      pointsToRedeem: 700,
      eligibleCartTotalINR: 1000, // 50% cap is ₹500 = 500 pts
    });
    expect(res3.valid).toBe(true);
    expect(res3.pointsApproved).toBe(500); // capped at 50%
    expect(res3.discountINR).toBe(500);
  });

  it("calculates loyalty clawbacks accurately on order cancellation and refunds", () => {
    const clawback = calculateRefundLoyaltyClawback({
      orderTotalINR: 2000,
      refundAmountINR: 2000,
      pointsEarnedOnOrder: 60,
      pointsRedeemedOnOrder: 150,
    });

    expect(clawback.pendingPointsToCancel).toBe(60);
    expect(clawback.spentPointsToRestore).toBe(150);
    expect(clawback.summaryMessage).toContain("Claw back 60 unearned pending points");
    expect(clawback.summaryMessage).toContain("restore 150 redeemed points");
  });

  it("calculates partial loyalty clawback on partial refunds", () => {
    const clawback = calculateRefundLoyaltyClawback({
      orderTotalINR: 2000,
      refundAmountINR: 1000, // 50% partial refund
      pointsEarnedOnOrder: 60,
      pointsRedeemedOnOrder: 100,
    });

    expect(clawback.pendingPointsToCancel).toBe(30);
    expect(clawback.spentPointsToRestore).toBe(50);
  });
});
