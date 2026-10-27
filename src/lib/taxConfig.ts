/**
 * MatsyaMart Statutory GST Tax Configuration & Calculation Engine
 * Manages official GSTIN, HSN/SAC statutory rates, and dynamic tax reconciliation
 */

export interface StatutoryTaxConfig {
  gstin: string;
  legalEntityName: string;
  homeState: string;
  homeStateCode: string;
  registeredAddress: string;
  defaultGstPercent: number; // e.g. 18, 12, 5
  pricingModel: "inclusive" | "exclusive";
  categoryRates: {
    goods: number;
    food: number;
    walks: number;
    workshops: number;
  };
}

export const DEFAULT_TAX_CONFIG: StatutoryTaxConfig = {
  gstin: "27ABBFK9637R1ZF",
  legalEntityName: "Kolibaba Seafood Inc.",
  homeState: "Maharashtra",
  homeStateCode: "27",
  registeredAddress:
    "101, Samudra Darshan, Budha Lane 2, Versova, Andheri West, Mumbai – 400061",
  defaultGstPercent: 18,
  pricingModel: "inclusive",
  categoryRates: {
    goods: 18,
    food: 18,
    walks: 18,
    workshops: 18,
  },
};

const STORAGE_KEY = "matsyamart_statutory_tax_config";

/**
 * Loads current statutory tax configuration from storage or defaults
 */
export function getStatutoryTaxConfig(): StatutoryTaxConfig {
  if (typeof window === "undefined") {
    return DEFAULT_TAX_CONFIG;
  }

  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_TAX_CONFIG;
    const parsed = JSON.parse(raw);
    return {
      ...DEFAULT_TAX_CONFIG,
      ...parsed,
      categoryRates: {
        ...DEFAULT_TAX_CONFIG.categoryRates,
        ...(parsed.categoryRates || {}),
      },
    };
  } catch (err) {
    console.warn("[Tax Config Load Warning]", err);
    return DEFAULT_TAX_CONFIG;
  }
}

/**
 * Persists updated statutory tax configuration
 */
export function saveStatutoryTaxConfig(config: StatutoryTaxConfig): void {
  if (typeof window === "undefined") return;

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
    window.dispatchEvent(
      new CustomEvent("matsyamart_tax_config_updated", { detail: config }),
    );
  } catch (err) {
    console.error("[Tax Config Save Failure]", err);
  }
}

export interface DynamicGstBreakdown {
  ratePercent: number;
  taxableValue: number;
  totalGst: number;
  cgst: number;
  sgst: number;
  igst: number;
  isInterState: boolean;
  placeOfSupply: string;
  supplierGstin: string;
  officialBillingName: string;
  registeredAddress: string;
}

/**
 * Dynamically calculates statutory GST breakdown using active tax configuration
 */
export function calculateDynamicGst(
  totalAmount: number,
  shippingState?: string,
  categoryPillar?: "goods" | "food" | "walks" | "workshops" | string,
  customConfig?: StatutoryTaxConfig,
): DynamicGstBreakdown {
  const cfg = customConfig || getStatutoryTaxConfig();
  const cleanState = (shippingState || "").trim().toLowerCase();

  const isInterState = Boolean(
    cleanState &&
      cleanState !== cfg.homeState.toLowerCase() &&
      cleanState !== "mh" &&
      cleanState !== cfg.homeStateCode &&
      !cleanState.includes(cfg.homeState.toLowerCase()),
  );

  // Determine applicable rate for category
  let rate = cfg.defaultGstPercent;
  if (categoryPillar) {
    const key = categoryPillar.toLowerCase();
    if (key === "goods" || key === "gd") rate = cfg.categoryRates.goods;
    else if (key === "food" || key === "fd") rate = cfg.categoryRates.food;
    else if (key === "walks" || key === "wk") rate = cfg.categoryRates.walks;
    else if (key === "workshops" || key === "ws") rate = cfg.categoryRates.workshops;
  }

  // Calculate based on inclusive pricing model: Total = Taxable * (1 + rate / 100)
  const divisor = 1 + rate / 100;
  const taxableValue = Math.round((totalAmount / divisor) * 100) / 100;
  const totalGst = Math.round((totalAmount - taxableValue) * 100) / 100;

  const cgst = isInterState ? 0 : Math.round((totalGst / 2) * 100) / 100;
  const sgst = isInterState ? 0 : Math.round((totalGst - cgst) * 100) / 100;
  const igst = isInterState ? totalGst : 0;

  const placeOfSupply = isInterState
    ? `${shippingState || "Inter-State"} (IGST Applicable)`
    : `${cfg.homeState} (State Code: ${cfg.homeStateCode})`;

  return {
    ratePercent: rate,
    taxableValue,
    totalGst,
    cgst,
    sgst,
    igst,
    isInterState,
    placeOfSupply,
    supplierGstin: cfg.gstin,
    officialBillingName: cfg.legalEntityName,
    registeredAddress: cfg.registeredAddress,
  };
}
