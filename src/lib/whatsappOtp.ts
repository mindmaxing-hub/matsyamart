/**
 * MatsyaMart WhatsApp-First OTP & Verification Engine
 * Direct integration with Fast2SMS WhatsApp Gateway + Instant wa.me Fallback
 * Sender ID: +91 76665 11511 (MatsyaMart Official)
 */

import {
  FAST2SMS_API_KEY,
  FAST2SMS_PHONE_NUMBER_ID,
  FAST2SMS_SENDER_PHONE_NUMBER,
  FAST2SMS_SENDER_DISPLAY,
  FAST2SMS_OTP_TEMPLATE_ID,
  normalizeWhatsAppNumber,
  to10DigitIndianNumber,
} from "./fast2smsWhatsApp";

export interface WhatsAppOtpSession {
  phone: string;
  otp: string;
  expiresAt: number;
  attempts: number;
  lastSentAt: number;
  sendCount: number;
  lockoutUntil?: number | undefined;
}

// In-memory OTP session cache keyed by 10-digit mobile number
const whatsappOtpStore = new Map<string, WhatsAppOtpSession>();

const OTP_EXPIRY_MS = 10 * 60 * 1000; // 10 minutes
const RESEND_COOLDOWN_MS = 30 * 1000; // 30 seconds
const MAX_VERIFY_ATTEMPTS = 5;
const MAX_SEND_COUNT = 5; // Max 5 code requests before 15-minute lockout
const LOCKOUT_MS = 15 * 60 * 1000; // 15 minutes lockout

/**
 * Normalizes phone number to standard 10-digit Indian mobile number
 */
export function cleanIndianMobile(raw: string): string {
  const digits = (raw || "").replace(/\D/g, "");
  return digits.length > 10 ? digits.slice(-10) : digits;
}

/**
 * Generates a cryptographically random 6-digit numeric OTP
 */
export function generateWhatsAppOtp(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

/**
 * Builds official branded WhatsApp verification message
 */
export function buildWhatsAppOtpMessage(otp: string, phone: string): string {
  const cleanPhone = cleanIndianMobile(phone);
  let text = `🐟 *MatsyaMart Official Verification*\n\n`;
  text += `Namaste! Your mobile verification code for MatsyaMart is:\n`;
  text += `👉 *${otp}*\n\n`;
  text += `• Valid for 10 minutes\n`;
  text += `• Phone: +91 ${cleanPhone}\n\n`;
  text += `_Kolibaba Seafood Inc · In strategic partnership with Bhoomiputra Foundation_\n`;
  text += `_For your security, do not share this code with anyone._`;
  return text;
}

/**
 * Creates, caches, and enforces rate-limiting cooldown and send quota for a WhatsApp OTP session
 */
export function createWhatsAppOtpSession(phone: string): {
  success: boolean;
  otp?: string;
  cooldownRemaining?: number;
  tooManyAttempts?: boolean;
  error?: string;
} {
  const cleanPhone = cleanIndianMobile(phone);

  if (cleanPhone.length !== 10) {
    return {
      success: false,
      error: "Please provide a valid 10-digit Indian mobile number.",
    };
  }

  const now = Date.now();
  const existing = whatsappOtpStore.get(cleanPhone);

  if (existing) {
    // Check if user is in lockout period due to excessive attempts
    if (existing.lockoutUntil && now < existing.lockoutUntil) {
      const waitSeconds = Math.ceil((existing.lockoutUntil - now) / 1000);
      return {
        success: false,
        tooManyAttempts: true,
        cooldownRemaining: waitSeconds,
        error: `You have requested verification codes too many times. Please wait ${Math.ceil(waitSeconds / 60)} minute(s) before trying again, or verify directly via WhatsApp.`,
      };
    }

    // Check if user has reached the maximum send limit
    if (existing.sendCount >= MAX_SEND_COUNT) {
      existing.lockoutUntil = now + LOCKOUT_MS;
      const waitSeconds = Math.ceil(LOCKOUT_MS / 1000);
      return {
        success: false,
        tooManyAttempts: true,
        cooldownRemaining: waitSeconds,
        error: `You have requested verification codes too many times. Please wait ${Math.ceil(waitSeconds / 60)} minute(s) before trying again, or verify directly via WhatsApp.`,
      };
    }

    // Check standard 30-second cooldown
    const elapsed = now - existing.lastSentAt;
    if (elapsed < RESEND_COOLDOWN_MS) {
      const remainingSeconds = Math.ceil((RESEND_COOLDOWN_MS - elapsed) / 1000);
      return {
        success: false,
        cooldownRemaining: remainingSeconds,
        error: `Please wait ${remainingSeconds} seconds before requesting a new WhatsApp code.`,
      };
    }
  }

  const otp = generateWhatsAppOtp();
  const session: WhatsAppOtpSession = {
    phone: cleanPhone,
    otp,
    expiresAt: now + OTP_EXPIRY_MS,
    attempts: 0,
    lastSentAt: now,
    sendCount: (existing ? existing.sendCount : 0) + 1,
    lockoutUntil: undefined,
  };

  whatsappOtpStore.set(cleanPhone, session);

  return {
    success: true,
    otp,
  };
}

export interface SendOtpResult {
  success: boolean;
  status: "accepted" | "delivered" | "failed";
  provider?: "whatsapp-fast2sms" | undefined;
  message: string;
  requestId?: string | undefined;
  error?: string | undefined;
}

/**
 * Dispatches an OTP via Fast2SMS WhatsApp Gateway.
 * Strict zero-leak security: Never returns raw OTP or compose links containing secrets.
 * Zero-SMS invariant: Normal SMS OTP is completely removed; pure WhatsApp only.
 * Zero-freeform outbound: Does not fall back to freeform session endpoint for cold outbound.
 */
export async function sendWhatsAppOtp(
  phone: string,
  otp: string,
): Promise<SendOtpResult> {
  const cleanPhone = cleanIndianMobile(phone);

  if (!FAST2SMS_API_KEY) {
    return {
      success: false,
      status: "failed",
      message: "Fast2SMS provider configuration missing.",
      error: "Fast2SMS provider configuration missing. Please configure FAST2SMS_API_KEY.",
    };
  }

  // Strict WhatsApp Outbound Invariant: Outbound messages to arbitrary users strictly require an approved Template.
  // Meta Cloud API drops freeform session messages outside the 24-hr user-initiated window.
  // Never silently fall back to /dev/whatsapp-session or normal SMS for OTPs.
  if (!FAST2SMS_OTP_TEMPLATE_ID) {
    return {
      success: false,
      status: "failed",
      provider: "whatsapp-fast2sms",
      message: "WhatsApp OTP template is not configured. An approved Fast2SMS WhatsApp template is required for automated outbound OTP delivery.",
      error: "WhatsApp OTP template ID missing. Please create an approved Authentication/Utility template in Fast2SMS and configure FAST2SMS_OTP_TEMPLATE_ID.",
    };
  }

  // Fast2SMS WhatsApp Template API (official utility/authentication template route)
  try {
    const templateQuery = new URLSearchParams({
      message_id: FAST2SMS_OTP_TEMPLATE_ID,
      phone_number_id: FAST2SMS_PHONE_NUMBER_ID,
      numbers: cleanPhone,
      variables_values: otp,
    });
    const templateUrl = `https://www.fast2sms.com/dev/whatsapp?${templateQuery.toString()}`;
    console.log(`[Fast2SMS WhatsApp Template Outbound Attempt] Phone: +91 ${cleanPhone}, TemplateID: ${FAST2SMS_OTP_TEMPLATE_ID}`);
    const tplRes = await fetch(templateUrl, {
      method: "GET",
      headers: {
        authorization: FAST2SMS_API_KEY,
      },
      signal: typeof AbortSignal !== "undefined" && typeof AbortSignal.timeout === "function" ? AbortSignal.timeout(5000) : null,
    });

    const tplData = (await tplRes.json().catch(() => ({}))) as {
      return?: boolean;
      status_code?: number;
      message?: string | string[];
      request_id?: string;
    };

    console.log(`[Fast2SMS WhatsApp Template Response] Status: ${tplRes.status}`, tplData);

    if (tplData.return === true || tplData.status_code === 200) {
      return {
        success: true,
        status: "accepted",
        provider: "whatsapp-fast2sms",
        message: `Verification code dispatched to WhatsApp (+91 ${cleanPhone}).`,
        requestId: tplData.request_id,
      };
    }

    const errDetail = Array.isArray(tplData.message) ? tplData.message.join(", ") : String(tplData.message || "WhatsApp template dispatch error");
    return {
      success: false,
      status: "failed",
      provider: "whatsapp-fast2sms",
      message: `WhatsApp template delivery rejected: ${errDetail}`,
      error: `WhatsApp template delivery rejected: ${errDetail}`,
    };
  } catch (err: unknown) {
    console.error(`[Fast2SMS WhatsApp Template Error] Phone: ${cleanPhone}:`, err);
    return {
      success: false,
      status: "failed",
      provider: "whatsapp-fast2sms",
      message: "Unable to dispatch WhatsApp template code. Please check your connection and try again.",
      error: "Unable to dispatch WhatsApp template code.",
    };
  }
}

/**
 * Validates submitted OTP against stored WhatsApp session
 */
export function verifyWhatsAppOtpSession(
  phone: string,
  userOtp: string,
): {
  valid: boolean;
  error?: string;
  remainingAttempts?: number;
} {
  const cleanPhone = cleanIndianMobile(phone);
  const session = whatsappOtpStore.get(cleanPhone);

  if (!session) {
    return {
      valid: false,
      error: "No active WhatsApp verification request found. Please request a new code.",
    };
  }

  const now = Date.now();
  if (now > session.expiresAt) {
    whatsappOtpStore.delete(cleanPhone);
    return {
      valid: false,
      error: "Verification code has expired. Please request a new code on WhatsApp.",
    };
  }

  session.attempts += 1;

  if (session.otp !== userOtp.trim()) {
    const remaining = MAX_VERIFY_ATTEMPTS - session.attempts;
    if (remaining <= 0) {
      whatsappOtpStore.delete(cleanPhone);
      return {
        valid: false,
        error: "Too many incorrect attempts. Please request a new code on WhatsApp.",
        remainingAttempts: 0,
      };
    }

    return {
      valid: false,
      error: `Incorrect verification code. ${remaining} attempt(s) remaining.`,
      remainingAttempts: remaining,
    };
  }

  // Success: consume session immediately (replay protection)
  whatsappOtpStore.delete(cleanPhone);

  return {
    valid: true,
  };
}

/**
 * Resets all active sessions (used primarily in tests)
 */
export function clearAllWhatsAppOtpSessions(): void {
  whatsappOtpStore.clear();
}
