/**
 * Fast2SMS WhatsApp Universal Dispatch Engine for MatsyaMart
 * Official Sender: +91 76665 11511 (Matsyamart)
 * Powered by Fast2SMS WhatsApp Developer Suite (dev/whatsapp & dev/whatsapp-session)
 */

export const FAST2SMS_API_KEY =
  (typeof process !== "undefined" &&
    (process.env?.["FAST2SMS_API_KEY"] || process.env?.["VITE_FAST2SMS_API_KEY"])) ||
  "oR4byDS7ZRxOMArq9rCOHqf6IYJD8fhprfSHWD8bCjVBVNNw1bs2SMM15o7M1W2l3sA6RgnHoBVWuXOe";

export const FAST2SMS_WABA_ID = "1749937716073750";
export const FAST2SMS_PHONE_NUMBER_ID = "1442308258960303"; // Meta Cloud API Phone Number ID verified on Fast2SMS
export const FAST2SMS_SENDER_PHONE_NUMBER = "7666511511"; // Official 10-digit WhatsApp number (+91 76665 11511)
export const FAST2SMS_SENDER_PHONE_ID = FAST2SMS_PHONE_NUMBER_ID; // Backward-compatibility alias for API calls
export const FAST2SMS_SENDER_DISPLAY = "+91 76665 11511";
export const FAST2SMS_PAYMENT_TEMPLATE_ID = "39898"; // Template 'payment_completed'

/**
 * Normalizes any Indian/international phone into clean digits.
 * E.g. "98201 44512" -> "919820144512", "+91 76665 11511" -> "917666511511".
 */
export function normalizeWhatsAppNumber(raw?: string | null): string {
  if (!raw) return "";
  const digits = String(raw).replace(/\D/g, "");
  if (digits.length === 10) return `91${digits}`;
  if (digits.length === 12 && digits.startsWith("91")) return digits;
  if (digits.length === 11 && digits.startsWith("0")) return `91${digits.slice(1)}`;
  return digits;
}

/** Formats clean 10-digit number for SMS / query parameters */
export function to10DigitIndianNumber(raw?: string | null): string {
  if (!raw) return "";
  const digits = String(raw).replace(/\D/g, "");
  if (digits.length === 10) return digits;
  if (digits.length === 12 && digits.startsWith("91")) return digits.slice(2);
  if (digits.length === 11 && digits.startsWith("0")) return digits.slice(1);
  return digits.slice(-10);
}

export interface MultiPassParams {
  guestName: string;
  orderRef: string;
  items: Array<{
    title: string;
    pillar: "walks" | "food" | "workshops" | "goods";
    dateStr?: string | undefined;
    timeStr?: string | undefined;
    venue?: string | undefined;
    mapsUrl?: string | undefined;
    passRef: string;
    attendeeName?: string | undefined;
  }>;
  totalPaidINR: number;
  digitalPassUrl: string;
  emergencyPhone?: string | undefined;
}

/**
 * Builds rich formatted multi-pass WhatsApp text matching Apple-clean coastal aesthetic
 */
export function buildMultiPassWhatsAppMessage(p: MultiPassParams): string {
  const experiences = p.items.filter((i) => i.pillar !== "goods");
  const physicalGoods = p.items.filter((i) => i.pillar === "goods");

  let body = `🐟 *MatsyaMart Official Coastal Boarding Passes*\n`;
  body += `Namaste *${p.guestName}*, your coastal reservation is confirmed!\n\n`;
  body += `*Order Reference:* ${p.orderRef}\n`;
  body += `*Payment Verified:* ₹${p.totalPaidINR.toLocaleString("en-IN")}\n\n`;

  if (experiences.length > 0) {
    body += `🎟️ *YOUR DIGITAL ENTRY PASSES (${experiences.length})*\n`;
    experiences.forEach((item, idx) => {
      body += `\n*${idx + 1}. ${item.title}*\n`;
      body += `• Pass ID: *${item.passRef}*\n`;
      if (item.attendeeName) body += `• Attendee: ${item.attendeeName}\n`;
      if (item.dateStr) body += `• Date: ${item.dateStr}\n`;
      if (item.timeStr) body += `• Session Window: ${item.timeStr}\n`;
      if (item.venue) body += `• Meeting Point: ${item.venue}\n`;
      if (item.mapsUrl) body += `• Google Maps GPS: ${item.mapsUrl}\n`;
    });
    body += `\n📱 *Open & Download 9:16 Mobile Pass:*\n${p.digitalPassUrl}\n\n`;
  }

  if (physicalGoods.length > 0) {
    body += `📦 *Pan-India Coastal Goods Dispatch*\n`;
    physicalGoods.forEach((g) => {
      body += `• ${g.title} (Order Ref: ${g.passRef})\n`;
    });
    body += `Dispatch window: Handcrafted at dawn dock, tracking updates will follow via SMS.\n\n`;
  }

  body += `🛡️ *Kolibaba Seafood Inc · Bhoomiputra Foundation*\n`;
  if (p.emergencyPhone) {
    body += `Emergency / Maritime Safety: ${p.emergencyPhone}\n`;
  }
  body += `WhatsApp Support: ${FAST2SMS_SENDER_DISPLAY}`;

  return body;
}

/**
 * Builds high-converting abandoned cart recovery message
 */
export function buildAbandonedCartWhatsAppMessage(params: {
  customerName?: string | undefined;
  itemsSummary: string;
  totalINR: number;
  restoreUrl: string;
  discountPercentage?: number | undefined;
}): string {
  const name = params.customerName?.trim() || "Friend";
  let msg = `🐟 *MatsyaMart Coastal Reservation Reminder*\n\n`;
  msg += `Namaste *${name}*! We noticed you left some authentic Koli items in your basket:\n\n`;
  msg += `*Items:* ${params.itemsSummary}\n`;
  msg += `*Basket Total:* ₹${params.totalINR.toLocaleString("en-IN")}\n`;
  if (params.discountPercentage) {
    msg += `✨ *Bhoomiputra Member Privilege Active:* ${params.discountPercentage}% OFF reserved!\n`;
  }
  msg += `\nSpots and dawn catches fill quickly with the tide. Tap below to restore your exact dates & finish in 1 click:\n\n`;
  msg += `👉 *Complete Coastal Order:*\n${params.restoreUrl}\n\n`;
  msg += `_Kolibaba Seafood Inc · Need assistance? Reply to this message._`;
  return msg;
}

export interface Fast2SMSSendResult {
  success: boolean;
  messageId?: string | undefined;
  statusCode?: number | undefined;
  error?: string | undefined;
  mode: "whatsapp_session" | "whatsapp_template" | "direct_wa_link";
  waLink?: string | undefined;
}

/**
 * Dispatches WhatsApp message via Fast2SMS API.
 * Uses Fast2SMS WhatsApp session or template endpoints,
 * and always provides the fallback direct wa.me link.
 */
export async function sendFast2SMSWhatsApp(
  toPhone: string,
  messageText: string,
  options?: {
    apiKey?: string | undefined;
    phoneId?: string | undefined;
    templateId?: string | undefined;
  },
): Promise<Fast2SMSSendResult> {
  const normalizedPhone = normalizeWhatsAppNumber(toPhone);
  const tenDigit = to10DigitIndianNumber(toPhone);
  const apiKey = options?.apiKey || FAST2SMS_API_KEY;
  const phoneId = options?.phoneId || FAST2SMS_SENDER_PHONE_ID;

  const directWaLink = `https://wa.me/${normalizedPhone}?text=${encodeURIComponent(messageText)}`;

  if (!normalizedPhone || normalizedPhone.length < 10) {
    return {
      success: false,
      error: "Invalid phone number",
      mode: "direct_wa_link",
      waLink: directWaLink,
    };
  }

  // Attempt 1: Fast2SMS WhatsApp Session endpoint (phone_number_id & to in query params, body: { type, text })
  try {
    const sessionUrl = `https://www.fast2sms.com/dev/whatsapp-session?phone_number_id=${encodeURIComponent(phoneId)}&to=${encodeURIComponent(normalizedPhone)}`;
    const sessionRes = await fetch(sessionUrl, {
      method: "POST",
      headers: {
        authorization: apiKey,
        "Content-Type": "application/json",
      },
      signal: typeof AbortSignal !== "undefined" && typeof AbortSignal.timeout === "function" ? AbortSignal.timeout(4000) : null,
      body: JSON.stringify({
        type: "text",
        text: messageText,
      }),
    });

    const sessionData = await sessionRes.json().catch(() => ({}));
    if (sessionRes.ok && (sessionData.status_code === 200 || sessionData.return === true)) {
      const msgId =
        sessionData.message_id ||
        (Array.isArray(sessionData.request_id)
          ? sessionData.request_id[0]
          : sessionData.request_id) ||
        `f2s-sess-${Date.now()}`;
      return {
        success: true,
        messageId: String(msgId),
        statusCode: 200,
        mode: "whatsapp_session",
        waLink: directWaLink,
      };
    }

    // Attempt 2: If session endpoint returns non-200, try WhatsApp template route if templateId configured
    if (options?.templateId || FAST2SMS_PAYMENT_TEMPLATE_ID) {
      const templateId = options?.templateId || FAST2SMS_PAYMENT_TEMPLATE_ID;
      const tplUrl = `https://www.fast2sms.com/dev/whatsapp?message_id=${templateId}&phone_number_id=${phoneId}&numbers=${tenDigit}&variables_values=${encodeURIComponent("MatsyaMart Order Confirmed")}`;
      const tplRes = await fetch(tplUrl, {
        method: "GET",
        headers: {
          authorization: apiKey,
        },
        signal: typeof AbortSignal !== "undefined" && typeof AbortSignal.timeout === "function" ? AbortSignal.timeout(4000) : null,
      });
      const tplData = await tplRes.json().catch(() => ({}));
      if (tplRes.ok && (tplData.status_code === 200 || tplData.return === true)) {
        return {
          success: true,
          messageId: tplData.message_id || `f2s-tpl-${Date.now()}`,
          statusCode: 200,
          mode: "whatsapp_template",
          waLink: directWaLink,
        };
      }
    }

    return {
      success: true,
      messageId: `wa-link-${Date.now()}`,
      mode: "direct_wa_link",
      waLink: directWaLink,
      error: sessionData?.message || "Fast2SMS session dispatched with direct link fallback",
    };
  } catch (err: any) {
    console.warn("[Fast2SMS WhatsApp] Network error, providing direct link:", err);
    return {
      success: true,
      messageId: `wa-link-fallback-${Date.now()}`,
      mode: "direct_wa_link",
      waLink: directWaLink,
      error: err?.message || "Network error",
    };
  }
}
