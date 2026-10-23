import { Order, OrderItem, Listing, ShippingAddress, PillarType } from "../types";

interface CompactItem {
  id?: string | undefined;
  title: string;
  qty: number;
  price: number;
  type: "experience" | "product";
  pillar?: PillarType | undefined;
  image?: string | undefined;
  weight?: number | undefined;
  collective?: string | undefined;
  location?: string | undefined;
  secretPoint?: string | undefined;
  mapsUrl?: string | undefined;
  hostName?: string | undefined;
  hostPhone?: string | undefined;
  slotStart?: string | undefined;
  slotEnd?: string | undefined;
}

interface CompactPayload {
  ref: string;
  name: string;
  phone: string;
  email?: string | undefined;
  total: number;
  created: string;
  shipping?: ShippingAddress | undefined;
  emergency?: string | undefined;
  items: CompactItem[];
}

/**
 * Encodes an Order into a compact, URL-safe base64 string suitable
 * for embedding directly into QR codes.
 */
export function encodePassPayload(order: Order): string {
  try {
    const compact: CompactPayload = {
      ref: order.order_ref,
      name: order.customer_name,
      phone: order.customer_phone,
      email: order.customer_email,
      total: order.total_amount_inr,
      created: order.created_at,
      shipping: order.shipping_address,
      emergency: order.emergency_contact,
      items: order.items.map((it) => ({
        id: it.id,
        title: it.listing?.title || "MatsyaMart Item",
        qty: it.quantity,
        price: it.unit_price_inr,
        type: it.listing?.type || "experience",
        pillar: it.listing?.pillar,
        image: it.listing?.images?.[0],
        weight: it.listing?.weight_grams,
        collective: it.listing?.artisan_collective,
        location: it.listing?.location_name,
        secretPoint: it.listing?.secret_meeting_point,
        mapsUrl: it.listing?.meeting_point_maps_url,
        hostName: it.listing?.host_name,
        hostPhone: it.listing?.host_phone,
        slotStart: it.slot?.slot_start,
        slotEnd: it.slot?.slot_end,
      })),
    };

    const jsonStr = JSON.stringify(compact);
    // URL-safe base64 encode
    if (typeof btoa !== "undefined") {
      const b64 = btoa(unescape(encodeURIComponent(jsonStr)));
      return b64.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
    } else if (typeof Buffer !== "undefined") {
      return Buffer.from(jsonStr, "utf8").toString("base64url");
    }
    return "";
  } catch (err) {
    console.error("Failed to encode pass payload:", err);
    return "";
  }
}

/**
 * Decodes a URL-safe base64 pass payload into a fully functional Order object.
 */
export function decodePassPayload(token: string): Order | null {
  if (!token || typeof token !== "string") return null;

  try {
    let base64 = token.replace(/-/g, "+").replace(/_/g, "/");
    while (base64.length % 4) {
      base64 += "=";
    }

    let jsonStr = "";
    if (typeof atob !== "undefined") {
      jsonStr = decodeURIComponent(escape(atob(base64)));
    } else if (typeof Buffer !== "undefined") {
      jsonStr = Buffer.from(base64, "base64").toString("utf8");
    }

    if (!jsonStr) return null;
    const compact = JSON.parse(jsonStr) as CompactPayload;
    if (!compact.ref || !compact.name) return null;

    const items: OrderItem[] = (compact.items || []).map((ci, idx) => {
      const mockListing: Listing = {
        id: `listing-${compact.ref}-${idx}`,
        title: ci.title,
        slug: ci.title.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
        type: ci.type,
        pillar: ci.pillar || (ci.type === "experience" ? "walks" : "goods"),
        price_inr: ci.price,
        currency: "INR",
        short_summary: ci.title,
        full_description: ci.title,
        host_name: ci.hostName || "Coastal Custodians",
        host_phone: ci.hostPhone || "+91 99204 77158",
        host_bio: "Local coastal custodian",
        location_name: ci.location || "Mumbai Coast",
        secret_meeting_point: ci.secretPoint,
        meeting_point_maps_url: ci.mapsUrl,
        images: ci.image ? [ci.image] : ["https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=600"],
        weight_grams: ci.weight,
        artisan_collective: ci.collective,
        stock_count: 50,
        low_stock_threshold: 5,
        is_active: true,
        is_featured: false,
        created_at: compact.created,
      };

      const mockSlot = ci.slotStart
        ? {
            id: `slot-${compact.ref}-${idx}`,
            listing_id: mockListing.id,
            slot_start: ci.slotStart,
            slot_end: ci.slotEnd || ci.slotStart,
            capacity: ci.qty + 10,
            booked_count: ci.qty,
            is_cancelled: false,
          }
        : undefined;

      return {
        id: ci.id || `item-${compact.ref}-${idx}`,
        order_id: `ord-${compact.ref}`,
        listing_id: mockListing.id,
        quantity: ci.qty,
        unit_price_inr: ci.price,
        listing: mockListing,
        slot: mockSlot,
        attendee_details: [
          {
            fullName: compact.name,
            phone: compact.phone,
            email: compact.email,
          },
        ],
      };
    });

    const reconstructedOrder: Order = {
      id: `ord-${compact.ref}`,
      order_ref: compact.ref,
      customer_name: compact.name,
      customer_email: compact.email || "guest@matsyamart.in",
      customer_phone: compact.phone || "+91 99999 99999",
      total_amount_inr: compact.total || 0,
      status: "confirmed",
      shipping_address: compact.shipping,
      emergency_contact: compact.emergency,
      created_at: compact.created || new Date().toISOString(),
      items,
    };

    return reconstructedOrder;
  } catch {
    // Graceful fallback for corrupted, incomplete, or legacy tokens
    return null;
  }
}
