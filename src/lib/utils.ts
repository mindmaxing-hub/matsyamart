import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import type { Order } from "../types";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatINR(amount: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatDate(isoDate: string): string {
  const date = new Date(isoDate);
  return date.toLocaleDateString("en-IN", {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function formatTime(isoDate: string): string {
  const date = new Date(isoDate);
  return date.toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
}

export function formatSlotRange(startIso: string, endIso: string): string {
  return `${formatTime(startIso)} – ${formatTime(endIso)}`;
}

export type OrderRefPrefix =
  | "GD"
  | "WK"
  | "FD"
  | "WS"
  | "EXP"
  | "PRD"
  | "MIX";

export function getOrderCategoryPrefix(
  items: Array<{
    listing?:
      | {
          type?: string | undefined;
          pillar?: string | undefined;
          title?: string | undefined;
        }
      | undefined;
  }>,
): OrderRefPrefix {
  if (!items || items.length === 0) return "GD";

  const hasExp = items.some((i) => i.listing?.type === "experience");
  if (!hasExp) return "GD";

  const expItem =
    items.find((i) => i.listing?.type === "experience")?.listing ||
    items[0]?.listing;
  const pillar = (expItem?.pillar || "").toLowerCase();

  if (pillar === "walks" || pillar === "walk") return "WK";
  if (pillar === "workshops" || pillar === "workshop") return "WS";
  if (pillar === "food") return "FD";

  const title = (expItem?.title || "").toLowerCase();
  if (
    title.includes("walk") ||
    title.includes("trail") ||
    title.includes("tour") ||
    title.includes("heritage") ||
    title.includes("safari")
  ) {
    return "WK";
  }
  if (
    title.includes("workshop") ||
    title.includes("weaving") ||
    title.includes("craft") ||
    title.includes("carpentry")
  ) {
    return "WS";
  }
  if (
    title.includes("feast") ||
    title.includes("thali") ||
    title.includes("dining") ||
    title.includes("food") ||
    title.includes("crab")
  ) {
    return "FD";
  }

  return "WK";
}

export function generateOrderRef(type: OrderRefPrefix = "GD"): string {
  const year = new Date().getFullYear();
  const randomSuffix = Math.floor(1000 + Math.random() * 9000);
  return `MM-${type}-${year}-${randomSuffix}`;
}

export function formatDuration(minutes?: number): string {
  if (!minutes) return "";
  const hrs = Math.floor(minutes / 60);
  const mins = minutes % 60;
  if (hrs > 0 && mins > 0) return `${hrs}h ${mins}m`;
  if (hrs > 0) return `${hrs} hrs`;
  return `${mins} mins`;
}

export interface HsnSacInfo {
  code: string;
  category: "goods" | "walk" | "food" | "workshop";
  description: string;
}

export function getItemHsnSacCode(listing?: {
  type?: string | undefined;
  pillar?: string | undefined;
  title?: string | undefined;
} | undefined): HsnSacInfo {
  const p = (listing?.pillar || "").toLowerCase();
  const t = (listing?.title || "").toLowerCase();
  const type = listing?.type;

  if (p === "walks" || p === "walk" || t.includes("walk") || t.includes("heritage") || t.includes("trail")) {
    return {
      code: "998553",
      category: "walk",
      description: "Heritage Tourism & Koli Coastal Walking Tour",
    };
  }
  if (p === "food" || t.includes("feast") || t.includes("thali") || t.includes("dining") || t.includes("lunch") || t.includes("dinner")) {
    return {
      code: "996331",
      category: "food",
      description: "Traditional Coastal Dining & Seafood Feast Services",
    };
  }
  if (p === "workshops" || p === "workshop" || t.includes("workshop") || t.includes("craft") || t.includes("weaving")) {
    return {
      code: "999293",
      category: "workshop",
      description: "Artisanal Craft Workshop & Maritime Skill Education",
    };
  }

  // Goods
  if (t.includes("honey")) {
    return {
      code: "040900",
      category: "goods",
      description: "Wild Mangrove Forest Honey",
    };
  }
  if (t.includes("masala") || t.includes("spice") || t.includes("blend")) {
    return {
      code: "091099",
      category: "goods",
      description: "Indigenous Koli Masala & Sun-Dried Coastal Spices",
    };
  }
  return {
    code: "030559",
    category: "goods",
    description: "Sun-Cured Artisanal Dry Fish & Coastal Pantry Catch",
  };
}

export interface OrderGstBreakdown {
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

export function calculateOrderGstBreakdown(
  totalAmount: number,
  shippingState?: string,
): OrderGstBreakdown {
  const cleanState = (shippingState || "").trim().toLowerCase();
  const isInterState = Boolean(
    cleanState &&
      cleanState !== "maharashtra" &&
      cleanState !== "mh" &&
      cleanState !== "27" &&
      cleanState !== "27 - maharashtra",
  );

  // 18% inclusive GST
  const taxableValue = Math.round((totalAmount / 1.18) * 100) / 100;
  const totalGst = Math.round((totalAmount - taxableValue) * 100) / 100;

  const cgst = isInterState ? 0 : Math.round((totalGst / 2) * 100) / 100;
  const sgst = isInterState ? 0 : Math.round((totalGst - cgst) * 100) / 100;
  const igst = isInterState ? totalGst : 0;

  const placeOfSupply = isInterState
    ? `${shippingState || "Inter-State"} (IGST Applicable)`
    : "Maharashtra (State Code: 27)";

  return {
    taxableValue,
    totalGst,
    cgst,
    sgst,
    igst,
    isInterState,
    placeOfSupply,
    supplierGstin: "27ABBFK9637R1ZF",
    officialBillingName: "Kolibaba Seafood Inc.",
    registeredAddress:
      "101, Samudra Darshan, Budha Lane 2, Versova, Andheri West, Mumbai - 400061",
  };
}

/**
 * Normalizes digits and determines whether a phone number represents a mock,
 * test, or placeholder number (such as 9920477158 or any string < 10 digits).
 */
export function isDummyOrPlaceholderPhone(phone?: string | null): boolean {
  if (!phone) return true;
  const digits = phone.replace(/\D/g, "");
  if (digits.length < 10) return true;
  if (digits.endsWith("9920477158")) return true;
  if (
    digits.endsWith("0000000000") ||
    digits.endsWith("1111111111") ||
    digits.endsWith("1234567890")
  ) {
    return true;
  }
  return false;
}

/**
 * Sanitizes an order's customer name and phone to ensure placeholder data
 * (like dummy test numbers or 'Verified Passholder' on physical goods) does not leak into UI.
 */
export function sanitizeOrderIdentity(order: Order): Order {
  if (!order) return order;
  const isPureGoods =
    order.items?.length > 0 &&
    order.items.every(
      (it) => it.listing?.type === "product" || it.listing?.pillar === "goods",
    );

  let cleanName = (order.customer_name || "").trim();
  if (
    cleanName.toLowerCase().includes("passholder") &&
    (isPureGoods ||
      order.order_ref?.toUpperCase().includes("-GD-") ||
      order.order_ref?.toUpperCase().includes("-PRD-"))
  ) {
    cleanName = "Valued Patron";
  }

  let cleanPhone = (order.customer_phone || "").trim();
  if (isDummyOrPlaceholderPhone(cleanPhone)) {
    cleanPhone = "";
  }

  return {
    ...order,
    customer_name: cleanName,
    customer_phone: cleanPhone,
  };
}
