/**
 * MatsyaMart Abandoned Cart Recovery Engine
 * Encodes, captures, serializes, and restores incomplete customer orders.
 * Includes 1-Click WhatsApp & Fast2SMS SMS recovery generators.
 */

import { CartItem, Listing, ExperienceSlot } from "../types";
import { normalizeWhatsAppNumber } from "./fast2smsWhatsApp";

export interface AbandonedCartRecord {
  id: string; // unique session/cart id
  customerName?: string | undefined;
  customerPhone?: string | undefined;
  customerEmail?: string | undefined;
  emergencyContact?: string | undefined;
  memberDiscountApplied?: boolean | undefined;
  memberId?: string | undefined;
  items: Array<{
    listingId: string;
    title: string;
    pillar: string;
    priceINR: number;
    quantity: number;
    slotId?: string | undefined;
    slotDate?: string | undefined;
    slotTime?: string | undefined;
    venue?: string | undefined;
  }>;
  totalINR: number;
  createdAt: number; // unix ms
  updatedAt: number;
  status: "abandoned" | "contacted" | "recovered";
  recoverySentAt?: number | undefined;
  recoveryChannel?: "whatsapp" | "sms" | undefined;
}

const ABANDONED_STORAGE_KEY = "matsyamart_abandoned_carts_v1";

/**
 * Encodes a cart into a compact base64 URL-safe restore token
 */
export function encodeCartRestoreToken(record: {
  customerName?: string | undefined;
  customerPhone?: string | undefined;
  customerEmail?: string | undefined;
  emergencyContact?: string | undefined;
  memberId?: string | undefined;
  memberDiscountApplied?: boolean | undefined;
  items: Array<{
    listingId: string;
    quantity: number;
    slotId?: string | undefined;
  }>;
}): string {
  try {
    const payload = JSON.stringify({
      n: record.customerName || "",
      p: record.customerPhone || "",
      e: record.customerEmail || "",
      em: record.emergencyContact || "",
      m: record.memberId || "",
      d: record.memberDiscountApplied ? 1 : 0,
      i: record.items.map((it) => ({
        l: it.listingId,
        q: it.quantity,
        s: it.slotId || "",
      })),
      t: Date.now(),
    });
    if (typeof window !== "undefined") {
      return btoa(encodeURIComponent(payload));
    }
    return Buffer.from(encodeURIComponent(payload)).toString("base64");
  } catch (err) {
    console.error("Failed to encode cart restore token:", err);
    return "";
  }
}

/**
 * Decodes a cart restore token back into checkout-ready cart items & metadata
 */
export function decodeCartRestoreToken(token: string): {
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  emergencyContact: string;
  memberId: string;
  memberDiscountApplied: boolean;
  items: Array<{ listingId: string; quantity: number; slotId?: string | undefined }>;
} | null {
  try {
    let raw = "";
    if (typeof window !== "undefined") {
      raw = decodeURIComponent(atob(token));
    } else {
      raw = decodeURIComponent(Buffer.from(token, "base64").toString());
    }
    const data = JSON.parse(raw);
    return {
      customerName: data.n || "",
      customerPhone: data.p || "",
      customerEmail: data.e || "",
      emergencyContact: data.em || "",
      memberId: data.m || "",
      memberDiscountApplied: Boolean(data.d),
      items: (data.i || []).map((it: any) => ({
        listingId: it.l,
        quantity: it.q || 1,
        slotId: it.s || undefined,
      })),
    };
  } catch (err) {
    console.error("Failed to decode cart restore token:", err);
    return null;
  }
}

/**
 * Fetches all saved abandoned carts from local storage
 */
export function getSavedAbandonedCarts(): AbandonedCartRecord[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(ABANDONED_STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

/**
 * Saves or updates an abandoned cart candidate
 */
export function recordAbandonedCart(
  cart: Omit<AbandonedCartRecord, "id" | "createdAt" | "updatedAt" | "status"> & {
    id?: string | undefined;
  },
): AbandonedCartRecord {
  const all = getSavedAbandonedCarts();
  const phone = normalizeWhatsAppNumber(cart.customerPhone);
  const now = Date.now();

  // Look for existing active cart for this phone or session
  const existingIdx = all.findIndex(
    (c) =>
      (cart.id && c.id === cart.id) ||
      (phone && normalizeWhatsAppNumber(c.customerPhone) === phone && c.status !== "recovered"),
  );

  let updatedRecord: AbandonedCartRecord;

  if (existingIdx >= 0 && all[existingIdx]) {
    const existing = all[existingIdx]!;
    updatedRecord = {
      ...existing,
      ...cart,
      id: existing.id,
      createdAt: existing.createdAt,
      updatedAt: now,
      status: existing.status === "recovered" ? "abandoned" : existing.status,
    };
    all[existingIdx] = updatedRecord;
  } else {
    updatedRecord = {
      ...cart,
      id: cart.id || `cart-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      createdAt: now,
      updatedAt: now,
      status: "abandoned",
    };
    all.unshift(updatedRecord);
  }

  // Keep top 50 abandoned carts
  const trimmed = all.slice(0, 50);
  try {
    localStorage.setItem(ABANDONED_STORAGE_KEY, JSON.stringify(trimmed));
  } catch (e) {
    console.error("Failed to persist abandoned cart", e);
  }

  return updatedRecord;
}

/**
 * Marks an abandoned cart as recovered or contacted
 */
export function updateAbandonedCartStatus(
  cartId: string,
  status: "abandoned" | "contacted" | "recovered",
  channel?: "whatsapp" | "sms",
): void {
  const all = getSavedAbandonedCarts();
  const target = all.find((c) => c.id === cartId);
  if (target) {
    target.status = status;
    target.updatedAt = Date.now();
    if (channel) {
      target.recoveryChannel = channel;
      target.recoverySentAt = Date.now();
    }
    try {
      localStorage.setItem(ABANDONED_STORAGE_KEY, JSON.stringify(all));
    } catch (e) {
      console.error("Failed to update cart status", e);
    }
  }
}

/**
 * Builds the full restore URL
 */
export function buildCartRestoreUrl(cart: AbandonedCartRecord, origin?: string): string {
  const base = origin || (typeof window !== "undefined" ? window.location.origin : "https://matsyamart.com");
  const token = encodeCartRestoreToken({
    customerName: cart.customerName,
    customerPhone: cart.customerPhone,
    customerEmail: cart.customerEmail,
    emergencyContact: cart.emergencyContact,
    memberId: cart.memberId,
    memberDiscountApplied: cart.memberDiscountApplied,
    items: cart.items.map((i) => ({
      listingId: i.listingId,
      quantity: i.quantity,
      slotId: i.slotId,
    })),
  });
  return `${base}/?restore=${encodeURIComponent(token)}`;
}
