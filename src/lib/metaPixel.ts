/**
 * Meta Pixel Tracking Engine for MatsyaMart
 * Official Pixel ID: 1795293538302324
 * Tracks e-commerce funnel events: PageView, ViewContent, AddToCart, InitiateCheckout, Purchase
 */

export const META_PIXEL_ID = "1795293538302324";

declare global {
  interface Window {
    fbq?: (...args: any[]) => void;
    _fbq?: any;
  }
}

/**
 * Safely dispatches standard or custom Meta Pixel events
 */
export function trackMetaPixel(
  eventName:
    | "PageView"
    | "ViewContent"
    | "AddToCart"
    | "InitiateCheckout"
    | "Purchase"
    | "Search"
    | "Contact"
    | string,
  params?: Record<string, any>,
): boolean {
  if (typeof window === "undefined") return false;

  try {
    if (typeof window.fbq === "function") {
      if (params) {
        window.fbq("track", eventName, params);
      } else {
        window.fbq("track", eventName);
      }
      return true;
    } else {
      // In non-production or adblock environments, log in dev
      if (typeof process !== "undefined" && process.env?.["NODE_ENV"] !== "production") {
        console.debug(`[MetaPixel] (mock/adblocked) ${eventName}`, params);
      }
      return false;
    }
  } catch (err) {
    console.warn(`[MetaPixel] Failed to track ${eventName}:`, err);
    return false;
  }
}

export function trackViewContent(params: {
  content_id: string;
  content_name: string;
  content_type: "product" | "experience" | "walk" | "food" | "workshop";
  value?: number;
  currency?: string;
}): boolean {
  return trackMetaPixel("ViewContent", {
    content_ids: [params.content_id],
    content_name: params.content_name,
    content_type: params.content_type,
    value: params.value ?? 0,
    currency: params.currency || "INR",
  });
}

export function trackAddToCart(params: {
  content_id: string;
  content_name: string;
  value: number;
  currency?: string;
  quantity?: number;
}): boolean {
  return trackMetaPixel("AddToCart", {
    content_ids: [params.content_id],
    content_name: params.content_name,
    content_type: "product",
    value: params.value,
    currency: params.currency || "INR",
    quantity: params.quantity || 1,
  });
}

export function trackInitiateCheckout(params: {
  num_items: number;
  value: number;
  currency?: string;
  content_ids?: string[];
}): boolean {
  return trackMetaPixel("InitiateCheckout", {
    num_items: params.num_items,
    value: params.value,
    currency: params.currency || "INR",
    content_ids: params.content_ids || [],
  });
}

export function trackPurchase(params: {
  order_id: string;
  value: number;
  currency?: string;
  num_items?: number;
  content_ids?: string[];
}): boolean {
  return trackMetaPixel("Purchase", {
    order_id: params.order_id,
    value: params.value,
    currency: params.currency || "INR",
    num_items: params.num_items || 1,
    content_ids: params.content_ids || [],
  });
}
