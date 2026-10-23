import { Order, OrderItem, Listing, ExperienceSlot, AttendeeDetail, PillarType } from "../../types";

export interface ManifestRow {
  bookingId: string;
  orderRef: string;
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  offeringId: string;
  offeringTitle: string;
  pillar: PillarType;
  sessionId?: string | undefined;
  sessionStart?: string | undefined;
  sessionEnd?: string | undefined;
  venueName?: string | undefined;
  seatIndex: number;
  attendeeName: string;
  attendeePhone: string;
  checkedIn: boolean;
  checkInTime?: string | undefined;
  checkInMethod?: string | undefined;
  status: "confirmed" | "cancelled" | "refunded";
  unitPriceINR: number;
}

export interface ManifestFilterOptions {
  pillar?: PillarType | "all" | undefined;
  sessionId?: string | undefined;
  searchQuery?: string | undefined;
  dateFilter?: "all" | "today" | "tomorrow" | undefined;
  attendanceStatus?: "all" | "checked_in" | "pending" | undefined;
}

/**
 * Builds the canonical manifest rows across all orders, booking items, and attendee expansions.
 */
export function buildCanonicalManifest(
  orders: Order[],
  listings: Listing[],
  slots: ExperienceSlot[],
  filters?: ManifestFilterOptions,
): ManifestRow[] {
  const rows: ManifestRow[] = [];

  for (const order of orders) {
    if (order.status === "cancelled" || order.status === "refunded") {
      continue;
    }

    for (const item of order.items) {
      const listing = item.listing || listings.find((l) => l.id === item.listing_id);
      const slot = item.slot || slots.find((s) => s.id === item.slot_id);
      const pillar = listing?.pillar || "food";

      // If item has explicit attendee details, expand per attendee
      const attendees = item.attendee_details || [];
      const totalSeats = item.quantity;

      if (attendees.length > 0) {
        attendees.forEach((att, idx) => {
          rows.push({
            bookingId: `${order.id}-${item.id}-${idx}`,
            orderRef: order.order_ref,
            customerName: order.customer_name,
            customerPhone: order.customer_phone,
            customerEmail: order.customer_email,
            offeringId: item.listing_id,
            offeringTitle: listing?.title || "Coastal Experience",
            pillar,
            sessionId: slot?.id,
            sessionStart: slot?.slot_start,
            sessionEnd: slot?.slot_end,
            venueName: listing?.location_name || "Harbor Rendezvous",
            seatIndex: idx + 1,
            attendeeName: att.fullName || `${order.customer_name} (Guest ${idx + 1})`,
            attendeePhone: att.phone || order.customer_phone,
            checkedIn: Boolean(att.checked_in),
            checkInTime: att.check_in_time,
            checkInMethod: att.check_in_method || "manual",
            status: order.status as "confirmed",
            unitPriceINR: item.unit_price_inr,
          });
        });
      } else {
        // Expand placeholder seats for unnamed tickets
        for (let idx = 0; idx < totalSeats; idx++) {
          rows.push({
            bookingId: `${order.id}-${item.id}-${idx}`,
            orderRef: order.order_ref,
            customerName: order.customer_name,
            customerPhone: order.customer_phone,
            customerEmail: order.customer_email,
            offeringId: item.listing_id,
            offeringTitle: listing?.title || "Coastal Experience",
            pillar,
            sessionId: slot?.id,
            sessionStart: slot?.slot_start,
            sessionEnd: slot?.slot_end,
            venueName: listing?.location_name || "Harbor Rendezvous",
            seatIndex: idx + 1,
            attendeeName: idx === 0 ? order.customer_name : `Seat ${idx + 1} (Unregistered)`,
            attendeePhone: order.customer_phone,
            checkedIn: false,
            status: order.status as "confirmed",
            unitPriceINR: item.unit_price_inr,
          });
        }
      }
    }
  }

  // Apply filters
  return rows.filter((row) => {
    if (filters?.pillar && filters.pillar !== "all" && row.pillar !== filters.pillar) {
      return false;
    }

    if (filters?.sessionId && row.sessionId !== filters.sessionId) {
      return false;
    }

    if (filters?.attendanceStatus === "checked_in" && !row.checkedIn) {
      return false;
    }
    if (filters?.attendanceStatus === "pending" && row.checkedIn) {
      return false;
    }

    if (filters?.dateFilter && filters.dateFilter !== "all" && row.sessionStart) {
      const slotDate = new Date(row.sessionStart).toISOString().split("T")[0];
      const today = new Date().toISOString().split("T")[0];
      const tomorrowDate = new Date();
      tomorrowDate.setDate(tomorrowDate.getDate() + 1);
      const tomorrow = tomorrowDate.toISOString().split("T")[0];

      if (filters.dateFilter === "today" && slotDate !== today) return false;
      if (filters.dateFilter === "tomorrow" && slotDate !== tomorrow) return false;
    }

    if (filters?.searchQuery) {
      const q = filters.searchQuery.toLowerCase();
      const match =
        row.attendeeName.toLowerCase().includes(q) ||
        row.customerName.toLowerCase().includes(q) ||
        row.customerPhone.includes(q) ||
        row.orderRef.toLowerCase().includes(q) ||
        row.offeringTitle.toLowerCase().includes(q);
      if (!match) return false;
    }

    return true;
  });
}

/**
 * Escapes CSV values and protects against CSV formula injection attacks (=, +, -, @).
 */
export function escapeCsvValue(val: string | number | boolean | null | undefined): string {
  if (val === null || val === undefined) return '""';
  const str = String(val).trim();
  // Formula injection prevention
  const sanitized = /^[=+\-@\t\r]/.test(str) ? `'${str}` : str;
  return `"${sanitized.replace(/"/g, '""')}"`;
}

/**
 * Exports canonical manifest rows to secure UTF-8 CSV with BOM for Excel compatibility.
 */
export function exportManifestCsv(rows: ManifestRow[]): string {
  const headers = [
    "Order Ref",
    "Pillar",
    "Experience",
    "Venue",
    "Seat #",
    "Attendee Name",
    "Attendee Phone",
    "Lead Customer",
    "Customer Email",
    "Session Start (IST)",
    "Check-In Status",
    "Check-In Time",
  ];

  const lines = [headers.map(escapeCsvValue).join(",")];

  for (const r of rows) {
    lines.push(
      [
        r.orderRef,
        r.pillar.toUpperCase(),
        r.offeringTitle,
        r.venueName || "Rendezvous Point",
        r.seatIndex,
        r.attendeeName,
        r.attendeePhone,
        r.customerName,
        r.customerEmail,
        r.sessionStart ? new Date(r.sessionStart).toLocaleString("en-IN", { timeZone: "Asia/Kolkata" }) : "N/A",
        r.checkedIn ? "CHECKED IN" : "PENDING",
        r.checkInTime ? new Date(r.checkInTime).toLocaleString("en-IN", { timeZone: "Asia/Kolkata" }) : "N/A",
      ]
        .map(escapeCsvValue)
        .join(","),
    );
  }

  // Prepend UTF-8 BOM so Excel opens Hindi/Marathi characters without mangling
  return "\uFEFF" + lines.join("\r\n");
}
