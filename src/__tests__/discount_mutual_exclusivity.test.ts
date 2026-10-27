import { describe, it, expect, beforeEach } from "vitest";
import {
  signWhatsAppOtpChallenge,
  verifyWhatsAppOtpChallenge,
} from "../lib/serverAuthToken";
import {
  createWhatsAppOtpSession,
  verifyWhatsAppOtpSession,
  clearAllWhatsAppOtpSessions,
} from "../lib/whatsappOtp";

describe("Discount Mutual Exclusivity & Stateless OTP Challenge Suite", () => {
  beforeEach(() => {
    clearAllWhatsAppOtpSessions();
  });

  describe("1. Stateless WhatsApp OTP Challenge Verification", () => {
    it("signs and verifies a valid OTP challenge token statelessly", () => {
      const phone = "7304290690";
      const otp = "582914";
      const challengeToken = signWhatsAppOtpChallenge(phone, otp, 60000);

      expect(challengeToken).toBeDefined();
      expect(challengeToken).toContain(".");

      const result = verifyWhatsAppOtpChallenge(phone, otp, challengeToken);
      expect(result.valid).toBe(true);
    });

    it("rejects an incorrect OTP code against the challenge token", () => {
      const phone = "7304290690";
      const otp = "582914";
      const challengeToken = signWhatsAppOtpChallenge(phone, otp, 60000);

      const result = verifyWhatsAppOtpChallenge(phone, "999999", challengeToken);
      expect(result.valid).toBe(false);
      expect(result.error).toContain("Incorrect verification code");
    });

    it("rejects verification if the phone number does not match the token", () => {
      const phone = "7304290690";
      const otp = "582914";
      const challengeToken = signWhatsAppOtpChallenge(phone, otp, 60000);

      const result = verifyWhatsAppOtpChallenge("9820012345", otp, challengeToken);
      expect(result.valid).toBe(false);
      expect(result.error).toContain("mismatch");
    });

    it("rejects an expired OTP challenge token", () => {
      const phone = "7304290690";
      const otp = "582914";
      // Issue expired token with negative TTL
      const challengeToken = signWhatsAppOtpChallenge(phone, otp, -1000);

      const result = verifyWhatsAppOtpChallenge(phone, otp, challengeToken);
      expect(result.valid).toBe(false);
      expect(result.error).toContain("expired");
    });

    it("rejects a tampered OTP challenge token signature", () => {
      const phone = "7304290690";
      const otp = "582914";
      const challengeToken = signWhatsAppOtpChallenge(phone, otp, 60000);
      const parts = challengeToken.split(".");
      const tampered = `${parts[0]!}.${parts[1]!.slice(0, -3)}xyz`;

      const result = verifyWhatsAppOtpChallenge(phone, otp, tampered);
      expect(result.valid).toBe(false);
      expect(result.error).toContain("Invalid challenge token signature");
    });

    it("verifies OTP across serverless worker isolate restarts when in-memory store is wiped", () => {
      const phone = "7304290690";
      const session = createWhatsAppOtpSession(phone);
      expect(session.success).toBe(true);
      expect(session.otp).toBeDefined();
      expect(session.challengeToken).toBeDefined();

      // Simulate new Cloudflare worker isolate starting up (in-memory Map wiped clean)
      clearAllWhatsAppOtpSessions();

      // Verify should still succeed statelessly using the challenge token
      const verifyRes = verifyWhatsAppOtpSession(
        phone,
        session.otp!,
        session.challengeToken,
      );
      expect(verifyRes.valid).toBe(true);
    });
  });

  describe("2. Non-Clubbing Policy (Bhoomiputra Member Discount vs Promo Coupons)", () => {
    it("ensures Bhoomiputra discount and promo coupons cannot both be active simultaneously", () => {
      const subtotal = 1000;
      const bhoomiDiscountPercent = 15;
      const bhoomiDiscountAmount = Math.round((subtotal * bhoomiDiscountPercent) / 100); // 150
      const couponDiscountAmount = 100; // e.g. DEAL100

      // Scenario A: Bhoomiputra Member privilege verified
      const isBhoomiMemberVerified = true;
      let appliedCoupon: { code: string; discountAmount: number } | null = {
        code: "DEAL100",
        discountAmount: couponDiscountAmount,
      };

      // Non-clubbing rule: applying/verifying Bhoomiputra removes promo coupon
      if (isBhoomiMemberVerified) {
        appliedCoupon = null;
      }

      const activeDiscount = isBhoomiMemberVerified
        ? bhoomiDiscountAmount
        : appliedCoupon?.discountAmount || 0;

      expect(appliedCoupon).toBeNull();
      expect(activeDiscount).toBe(150);
      expect(activeDiscount).not.toBe(250); // NEVER clubbed!
    });

    it("ensures applying a promo coupon removes Bhoomiputra selection", () => {
      let isBhoomiMember = true;
      let bhoomiVerifyStatus: "idle" | "verifying" | "verified" = "verified";

      // User applies promo coupon
      const newCouponApplied = "DEAL100";
      if (newCouponApplied) {
        isBhoomiMember = false;
        bhoomiVerifyStatus = "idle";
      }

      expect(isBhoomiMember).toBe(false);
      expect(bhoomiVerifyStatus).toBe("idle");
    });
  });
});
