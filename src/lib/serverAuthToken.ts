import { createHmac, timingSafeEqual } from "crypto";

const AUTH_SECRET =
  (typeof process !== "undefined" && process.env?.["AUTH_TOKEN_SECRET"]) ||
  (typeof process !== "undefined" && process.env?.["RAZORPAY_KEY_SECRET"]) ||
  "matsyamart-canonical-auth-secret-key-2026-bhoomiputra";

export interface PhoneVerificationPayload {
  phone: string;
  verifiedAt: number;
  exp: number; // Expiry timestamp in ms (e.g. 30 minutes)
}

/**
 * Creates a signed verification token for an authenticated phone number.
 * Valid for 30 minutes from issue.
 */
export function signPhoneVerificationToken(phone: string, ttlMs: number = 30 * 60 * 1000): string {
  const cleanPhone = phone.replace(/\D/g, "").slice(-10);
  const now = Date.now();
  const payload: PhoneVerificationPayload = {
    phone: cleanPhone,
    verifiedAt: now,
    exp: now + ttlMs,
  };

  const payloadB64 = Buffer.from(JSON.stringify(payload)).toString("base64url");
  const signature = createHmac("sha256", AUTH_SECRET).update(payloadB64).digest("base64url");

  return `${payloadB64}.${signature}`;
}

/**
 * Verifies a phone verification token and ensures it matches the target phone and is unexpired.
 */
export function verifyPhoneVerificationToken(
  token: string | undefined | null,
  expectedPhone?: string,
): { valid: boolean; phone?: string; error?: string } {
  if (!token || typeof token !== "string") {
    return { valid: false, error: "Missing verification token" };
  }

  const parts = token.split(".");
  if (parts.length !== 2) {
    return { valid: false, error: "Malformed verification token format" };
  }

  const [payloadB64, signature] = parts;
  if (!payloadB64 || !signature) {
    return { valid: false, error: "Incomplete token segments" };
  }

  // Verify HMAC signature with timing-safe comparison
  const expectedSig = createHmac("sha256", AUTH_SECRET).update(payloadB64).digest("base64url");
  const sigBuffer = Buffer.from(signature);
  const expectedBuffer = Buffer.from(expectedSig);

  if (sigBuffer.length !== expectedBuffer.length || !timingSafeEqual(sigBuffer, expectedBuffer)) {
    return { valid: false, error: "Invalid token signature" };
  }

  try {
    const payload: PhoneVerificationPayload = JSON.parse(
      Buffer.from(payloadB64, "base64url").toString("utf-8"),
    );

    if (Date.now() > payload.exp) {
      return { valid: false, error: "Verification token has expired. Please verify mobile again." };
    }

    if (expectedPhone) {
      const cleanExpected = expectedPhone.replace(/\D/g, "").slice(-10);
      if (payload.phone !== cleanExpected) {
        return { valid: false, error: "Token phone mismatch" };
      }
    }

    return { valid: true, phone: payload.phone };
  } catch {
    return { valid: false, error: "Corrupted token payload" };
  }
}
