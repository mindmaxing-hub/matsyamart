import { PayoutAgreement, AgreementType } from "../../types";

export interface PayoutCalculationInput {
  agreement: PayoutAgreement;
  netItemRevenueINR: number;
  quantity: number;
}

export interface PayoutCalculationResult {
  accrualAmountINR: number;
  calculationBasis: string;
}

/**
 * Calculates authoritative partner payout based on configured commercial agreement.
 * Replaces hardcoded 85/15 splits with explicit net revenue or unit rules.
 */
export function calculatePartnerPayout(
  input: PayoutCalculationInput,
): PayoutCalculationResult {
  const { agreement, netItemRevenueINR, quantity } = input;

  switch (agreement.agreement_type) {
    case "none":
      return {
        accrualAmountINR: 0,
        calculationBasis: "Explicit Zero Payout Agreement",
      };

    case "percent_net_item": {
      const rate = Math.max(0, Math.min(100, agreement.rate_value));
      const amount = Math.round((netItemRevenueINR * rate) / 100);
      return {
        accrualAmountINR: amount,
        calculationBasis: `${rate}% of net item revenue (₹${netItemRevenueINR})`,
      };
    }

    case "fixed_unit": {
      const rate = Math.max(0, agreement.rate_value);
      const amount = Math.round(rate * quantity);
      return {
        accrualAmountINR: amount,
        calculationBasis: `Fixed ₹${rate} per unit × ${quantity} units`,
      };
    }

    case "fixed_session": {
      const rate = Math.max(0, agreement.rate_value);
      return {
        accrualAmountINR: Math.round(rate),
        calculationBasis: `Fixed ₹${rate} per session flat fee`,
      };
    }

    case "manual":
    default:
      return {
        accrualAmountINR: Math.max(0, Math.round(agreement.rate_value)),
        calculationBasis: `Audited manual exception accrual (₹${agreement.rate_value})`,
      };
  }
}
