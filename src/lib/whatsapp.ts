/**
 * Universal WhatsApp Core Engine for MatsyaMart
 * Encodes normalized phone numbers, deep-link dispatchers, and formatted coastal messages.
 */

export const MATSYAMART_WHATSAPP_NUMBER = "917666511511";
export const MATSYAMART_WHATSAPP_DISPLAY = "+91 76665 11511";

/**
 * Normalizes any Indian/international phone into clean digits for wa.me deep links.
 * E.g. "98201 44512" -> "919820144512", "+91 76665 11511" -> "917666511511".
 */
export function normalizeWhatsAppPhone(raw?: string | null): string {
  if (!raw) return "";
  const digits = String(raw).replace(/\D/g, "");
  if (digits.length === 10) return `91${digits}`;
  if (digits.length === 12 && digits.startsWith("91")) return digits;
  if (digits.length === 11 && digits.startsWith("0")) return `91${digits.slice(1)}`;
  return digits;
}

/** Formats clean phone number for display (+91 76665 11511) */
export function formatPhoneDisplay(raw?: string | null): string {
  if (!raw) return MATSYAMART_WHATSAPP_DISPLAY;
  const clean = normalizeWhatsAppPhone(raw);
  if (clean.length === 12 && clean.startsWith("91")) {
    return `+91 ${clean.slice(2, 7)} ${clean.slice(7)}`;
  }
  return raw;
}

/** Builds a wa.me URL for web/desktop/mobile app */
export function buildWhatsAppUrl(phone?: string | null, message?: string): string {
  const cleanPhone = normalizeWhatsAppPhone(phone);
  const encodedText = message ? encodeURIComponent(message) : "";
  if (cleanPhone) {
    return `https://wa.me/${cleanPhone}${encodedText ? `?text=${encodedText}` : ""}`;
  }
  return `https://api.whatsapp.com/send${encodedText ? `?text=${encodedText}` : ""}`;
}

/** Opens WhatsApp directly in new window */
export function openWhatsApp(phone?: string | null, message?: string): void {
  const url = buildWhatsAppUrl(phone, message);
  if (typeof window !== "undefined") {
    window.open(url, "_blank", "noopener,noreferrer");
  }
}

/* =======================================================================
   FORMATTED COASTAL DISPATCH TEMPLATES
   ======================================================================= */

export interface PassMessageParams {
  guestName: string;
  experienceTitle: string;
  ticketRef: string;
  dateStr: string;
  timeStr: string;
  venue: string;
  secretPin?: string | undefined;
  mapsUrl?: string | undefined;
  passUrl: string;
  seatsCount?: number | undefined;
}

export function buildPassMessage(p: PassMessageParams): string {
  return (
    `🎟️ *MatsyaMart Official 9:16 Mobile Pass*\n\n` +
    `Namaste *${p.guestName}*, your coastal reservation is confirmed!\n\n` +
    `*Experience:* ${p.experienceTitle}\n` +
    `*Pass Reference:* ${p.ticketRef}\n` +
    `*Seats:* ${p.seatsCount || 1} confirmed\n` +
    `*Date:* ${p.dateStr}\n` +
    `*Time:* ${p.timeStr}\n` +
    `*Rendezvous Venue:* ${p.venue}\n` +
    (p.secretPin ? `*Arrival Notes:* ${p.secretPin}\n` : "") +
    (p.mapsUrl ? `*Google Maps GPS:* ${p.mapsUrl}\n` : "") +
    `*Security Status:* ✅ Confirmed & Paid\n\n` +
    `👉 *Open & Present Your 9:16 Entry Pass:*\n${p.passUrl}\n\n` +
    `_Bhoomiputra Foundation · Kolibaba Seafood Inc_\n` +
    `_Support: ${MATSYAMART_WHATSAPP_DISPLAY}_`
  );
}

export interface CookRosterParams {
  feastTitle: string;
  cookName: string;
  dateStr: string;
  timeStr: string;
  venue: string;
  totalGuests: number;
  totalPlates: number;
  payoutEstINR: number;
  attendees: Array<{ name: string; phone: string; seats: number }>;
}

export function buildCookRosterMessage(p: CookRosterParams): string {
  const guestLines = p.attendees
    .map((a, i) => `${i + 1}. ${a.name} (${a.seats} seats) - ${a.phone}`)
    .join("\n");

  return (
    `🐟 *MatsyaMart Kitchen Dispatch · Day-Before Roster*\n\n` +
    `Namaste *${p.cookName}*!\n` +
    `Here is tomorrow's verified guest manifest for your seafood feast:\n\n` +
    `*Feast:* ${p.feastTitle}\n` +
    `*Date:* ${p.dateStr}\n` +
    `*Window:* ${p.timeStr}\n` +
    `*Courtyard Venue:* ${p.venue}\n` +
    `*Total Booked Guests:* ${p.totalGuests} Guests\n` +
    `*Total Portions Required:* ${p.totalPlates} Plates\n` +
    `*Estimated Cook Payout:* ₹${p.payoutEstINR.toLocaleString("en-IN")}\n\n` +
    `📋 *Guest List:*\n${guestLines || "No guests booked yet"}\n\n` +
    `_Please procure fresh catch at dawn market. Contact MatsyaMart coordinator if any shortage._`
  );
}

export interface GuideManifestParams {
  walkTitle: string;
  guideName: string;
  dateStr: string;
  departureTimeStr: string;
  meetingPoint: string;
  lowTideTime?: string | undefined;
  totalWalkers: number;
  attendees: Array<{ name: string; phone: string; seats: number }>;
}

export function buildGuideManifestMessage(p: GuideManifestParams): string {
  const walkerLines = p.attendees
    .map((a, i) => `${i + 1}. ${a.name} (${a.seats} seats) - ${a.phone}`)
    .join("\n");

  return (
    `⚓ *MatsyaMart Trail Manifest · Guide Dispatch*\n\n` +
    `Namaste *${p.guideName}*!\n` +
    `Here is your verified walker manifest for tomorrow's intertidal trail:\n\n` +
    `*Trail:* ${p.walkTitle}\n` +
    `*Departure Date:* ${p.dateStr}\n` +
    `*Reporting Window:* ${p.departureTimeStr}\n` +
    `*Rendezvous Point:* ${p.meetingPoint}\n` +
    (p.lowTideTime ? `*Low Tide Window:* ${p.lowTideTime}\n` : "") +
    `*Confirmed Walkers:* ${p.totalWalkers} Walkers\n\n` +
    `📋 *Walker Manifest:*\n${walkerLines || "No walkers registered yet"}\n\n` +
    `_Ensure all walkers have mud boots and safety briefing completed before harbor entry._`
  );
}

export interface ArtisanRosterParams {
  workshopTitle: string;
  artisanName: string;
  dateStr: string;
  timeStr: string;
  studioVenue: string;
  totalParticipants: number;
  materialsList?: string | undefined;
  attendees: Array<{ name: string; phone: string }>;
}

export function buildArtisanRosterMessage(p: ArtisanRosterParams): string {
  const rosterLines = p.attendees
    .map((a, i) => `${i + 1}. ${a.name} - ${a.phone}`)
    .join("\n");

  return (
    `🎨 *MatsyaMart Masterclass Roster · Artisan Dispatch*\n\n` +
    `Namaste *${p.artisanName}*!\n` +
    `Here is your enrolled participant roster for tomorrow's masterclass:\n\n` +
    `*Masterclass:* ${p.workshopTitle}\n` +
    `*Schedule:* ${p.dateStr} at ${p.timeStr}\n` +
    `*Studio Venue:* ${p.studioVenue}\n` +
    `*Enrolled Participants:* ${p.totalParticipants} Participants\n` +
    (p.materialsList ? `*Toolkits Required:* ${p.materialsList}\n` : "") +
    `\n📋 *Participant List:*\n${rosterLines || "No participants registered yet"}\n\n` +
    `_All take-home craft kits should be assembled on the workbench prior to arrival._`
  );
}

export interface GoodsTrackingParams {
  customerName: string;
  orderRef: string;
  itemsSummary: string;
  courierName: string;
  trackingNumber: string;
  trackingUrl?: string | undefined;
}

export function buildGoodsTrackingMessage(p: GoodsTrackingParams): string {
  const portalUrl =
    p.trackingUrl || `https://matsyamart.com/order/confirmation/${p.orderRef}`;
  return (
    `📦 *MatsyaMart Pantry & Craft · Order Dispatched*\n\n` +
    `Namaste *${p.customerName}*!\n` +
    `Your direct-from-koliwada order has been packed and handed over to our courier partner.\n\n` +
    `*Order Ref:* ${p.orderRef}\n` +
    `*Items:* ${p.itemsSummary}\n` +
    `*Courier Partner:* ${p.courierName}\n` +
    `*Tracking AWB:* ${p.trackingNumber}\n` +
    `*Live Delivery Tracking:* ${portalUrl}\n\n` +
    `Thank you for directly supporting indigenous coastal women collectives!\n` +
    `_Need help? Message MatsyaMart at ${MATSYAMART_WHATSAPP_DISPLAY}_`
  );
}

export interface TidalAdvisoryParams {
  experienceTitle: string;
  tideTime: string;
  tideHeightMeters: string;
  meetingPoint: string;
  advisoryText?: string | undefined;
}

export function buildTidalAdvisoryMessage(p: TidalAdvisoryParams): string {
  return (
    `🌊 *MatsyaMart Coastal Safety Advisory · Tidal Update*\n\n` +
    `Maritime advisory for: *${p.experienceTitle}*\n\n` +
    `*Tidal Window:* High Tide at ${p.tideTime} (${p.tideHeightMeters}m)\n` +
    `*Meeting Point:* ${p.meetingPoint}\n\n` +
    `*Safety Notice:* ${p.advisoryText || "Water levels will peak during departure. Please report 15 minutes early and wear intertidal water-resistant footwear."}\n\n` +
    `_MatsyaMart Coastal Operations Command · Bhoomiputra Foundation_`
  );
}
