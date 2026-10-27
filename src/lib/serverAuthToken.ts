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

export interface WhatsAppOtpChallengePayload {
  phone: string;
  exp: number; // Expiry timestamp in ms (e.g. 10 minutes)
  hash: string; // HMAC of phone:otp:exp
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
 * Creates a stateless signed challenge token for a WhatsApp OTP session.
 * Bound to the recipient phone and expiration timestamp without exposing plain OTP.
 */
export function signWhatsAppOtpChallenge(
  phone: string,
  otp: string,
  ttlMs: number = 10 * 60 * 1000,
): string {
  const cleanPhone = phone.replace(/\D/g, "").slice(-10);
  const exp = Date.now() + ttlMs;
  const hash = createHmac("sha256", AUTH_SECRET)
    .update(`otp:${cleanPhone}:${otp.trim()}:${exp}`)
    .digest("base64url");

  const payload: WhatsAppOtpChallengePayload = {
    phone: cleanPhone,
    exp,
    hash,
  };

  const payloadB64 = Buffer.from(JSON.stringify(payload)).toString("base64url");
  const signature = createHmac("sha256", AUTH_SECRET)
    .update(payloadB64)
    .digest("base64url");

  return `${payloadB64}.${signature}`;
}

/**
 * Statelessly verifies a WhatsApp OTP challenge token across any serverless isolate.
 */
export function verifyWhatsAppOtpChallenge(
  phone: string,
  userOtp: string,
  challengeToken: string | undefined | null,
): { valid: boolean; error?: string } {
  if (!challengeToken || typeof challengeToken !== "string") {
    return { valid: false, error: "Missing verification challenge" };
  }

  const parts = challengeToken.split(".");
  if (parts.length !== 2) {
    return { valid: false, error: "Malformed challenge token" };
  }

  const [payloadB64, signature] = parts;
  if (!payloadB64 || !signature) {
    return { valid: false, error: "Incomplete challenge token segments" };
  }

  const expectedSig = createHmac("sha256", AUTH_SECRET)
    .update(payloadB64)
    .digest("base64url");
  const sigBuffer = Buffer.from(signature);
  const expectedBuffer = Buffer.from(expectedSig);

  if (
    sigBuffer.length !== expectedBuffer.length ||
    !timingSafeEqual(sigBuffer, expectedBuffer)
  ) {
    return { valid: false, error: "Invalid challenge token signature" };
  }

  try {
    const payload: WhatsAppOtpChallengePayload = JSON.parse(
      Buffer.from(payloadB64, "base64url").toString("utf-8"),
    );

    const cleanPhone = phone.replace(/\D/g, "").slice(-10);
    if (payload.phone !== cleanPhone) {
      return { valid: false, error: "Phone number mismatch" };
    }

    if (Date.now() > payload.exp) {
      return {
        valid: false,
        error: "Verification code has expired. Please request a new code on WhatsApp.",
      };
    }

    const expectedHash = createHmac("sha256", AUTH_SECRET)
      .update(`otp:${cleanPhone}:${userOtp.trim()}:${payload.exp}`)
      .digest("base64url");
    const hashBuffer = Buffer.from(payload.hash);
    const expectedHashBuffer = Buffer.from(expectedHash);

    if (
      hashBuffer.length !== expectedHashBuffer.length ||
      !timingSafeEqual(hashBuffer, expectedHashBuffer)
    ) {
      return {
        valid: false,
        error: "Incorrect verification code. Please check your WhatsApp and try again.",
      };
    }

    return { valid: true };
  } catch {
    return { valid: false, error: "Corrupted challenge payload" };
  }
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
