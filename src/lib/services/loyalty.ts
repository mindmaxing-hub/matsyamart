import {
  LoyaltyProgramConfig,
  LoyaltyMembership,
  LoyaltyTierConfig,
  PillarType,
} from "../../types";

export const DEFAULT_LOYALTY_CONFIG: LoyaltyProgramConfig = {
  pointValueINR: 1, // 1 point = ₹1
  maxRedemptionPercent: 50, // Up to 50% of eligible item total
  eligiblePillars: ["food", "walks", "workshops", "goods"],
  expiryMonths: 12,
  tiers: [
    {
      tierName: "Coastal Ally (Bronze)",
      qualifyingSpendINR: 0,
      earningRatePercent: 3, // 3% back in points
    },
    {
      tierName: "Harbor Custodian (Silver)",
      qualifyingSpendINR: 5000,
      earningRatePercent: 5,
      discountPercent: 5,
    },
    {
      tierName: "Deep Sea Patron (Gold)",
      qualifyingSpendINR: 15000,
      earningRatePercent: 8,
      discountPercent: 10,
    },
  ],
};

export interface CalculateEarningInput {
  config: LoyaltyProgramConfig;
  membership: LoyaltyMembership;
  eligibleItemRevenueINR: number;
}

export function calculatePendingPoints(input: CalculateEarningInput): number {
  const { config, membership, eligibleItemRevenueINR } = input;
  const currentTier =
    config.tiers.find((t) => t.tierName === membership.current_tier) ||
    config.tiers[0];

  const rate = currentTier ? currentTier.earningRatePercent : 3;
  return Math.floor((eligibleItemRevenueINR * rate) / 100);
}

export interface ValidateRedemptionInput {
  config: LoyaltyProgramConfig;
  membership: LoyaltyMembership;
  pointsToRedeem: number;
  eligibleCartTotalINR: number;
}

export interface RedemptionValidationResult {
  valid: boolean;
  pointsApproved: number;
  discountINR: number;
  error?: string | undefined;
}

export function validatePointsRedemption(
  input: ValidateRedemptionInput,
): RedemptionValidationResult {
  const { config, membership, pointsToRedeem, eligibleCartTotalINR } = input;

  if (pointsToRedeem <= 0) {
    return { valid: true, pointsApproved: 0, discountINR: 0 };
  }

  if (pointsToRedeem > membership.spendable_points) {
    return {
      valid: false,
      pointsApproved: 0,
      discountINR: 0,
      error: `Requested ${pointsToRedeem} points, but available balance is only ${membership.spendable_points} points.`,
    };
  }

  const maxDiscountAllowed = Math.floor(
    (eligibleCartTotalINR * config.maxRedemptionPercent) / 100,
  );
  const maxPointsAllowed = Math.floor(maxDiscountAllowed / config.pointValueINR);

  const finalPoints = Math.min(pointsToRedeem, maxPointsAllowed);
  const discountINR = finalPoints * config.pointValueINR;

  return {
    valid: true,
    pointsApproved: finalPoints,
    discountINR,
  };
}
