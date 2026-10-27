import { describe, it, expect, beforeEach } from "vitest";
import {
  cleanIndianMobile,
  generateWhatsAppOtp,
  buildWhatsAppOtpMessage,
  createWhatsAppOtpSession,
  verifyWhatsAppOtpSession,
  clearAllWhatsAppOtpSessions,
  sendWhatsAppOtp,
} from "../lib/whatsappOtp";
import { FAST2SMS_SENDER_PHONE_ID } from "../lib/fast2smsWhatsApp";

describe("MatsyaMart WhatsApp-First OTP & Verification Engine Suite", () => {
  beforeEach(() => {
    clearAllWhatsAppOtpSessions();
  });

  describe("1. Mobile Number Normalization & Code Generation", () => {
    it("normalizes diverse Indian mobile number formats into standard 10 digits", () => {
      expect(cleanIndianMobile("+91 99204 77158")).toBe("9920477158");
      expect(cleanIndianMobile("+91-98200-12345")).toBe("9820012345");
      expect(cleanIndianMobile("09820012345")).toBe("9820012345");
      expect(cleanIndianMobile("9820012345")).toBe("9820012345");
      expect(cleanIndianMobile("919820012345")).toBe("9820012345");
    });

    it("generates cryptographically secure 6-digit numeric OTPs", () => {
      for (let i = 0; i < 20; i++) {
        const otp = generateWhatsAppOtp();
        expect(otp).toMatch(/^[0-9]{6}$/);
        const num = Number(otp);
        expect(num).toBeGreaterThanOrEqual(100000);
        expect(num).toBeLessThanOrEqual(999999);
      }
    });

    it("formats branded WhatsApp verification messages with zero AI slop", () => {
      const msg = buildWhatsAppOtpMessage("482910", "9920477158");
      expect(msg).toContain("MatsyaMart Official Verification");
      expect(msg).toContain("482910");
      expect(msg).toContain("+91 9920477158");
      expect(msg).toContain("Kolibaba Seafood Inc · In strategic partnership with Bhoomiputra Foundation");
      expect(msg).toContain("Valid for 10 minutes");
    });
  });

  describe("2. WhatsApp OTP Session Management & Rate Limiting", () => {
    it("creates an active WhatsApp OTP session for a valid 10-digit number", () => {
      const res = createWhatsAppOtpSession("9920477158");
      expect(res.success).toBe(true);
      expect(res.otp).toBeDefined();
      expect(res.otp).toMatch(/^[0-9]{6}$/);
    });

    it("rejects phone numbers with invalid length", () => {
      const res = createWhatsAppOtpSession("12345");
      expect(res.success).toBe(false);
      expect(res.error).toContain("valid 10-digit");
    });

    it("strictly enforces a 30-second resend cooldown", () => {
      const first = createWhatsAppOtpSession("9920477158");
      expect(first.success).toBe(true);

      const second = createWhatsAppOtpSession("9920477158");
      expect(second.success).toBe(false);
      expect(second.cooldownRemaining).toBeGreaterThan(0);
      expect(second.error).toContain("seconds before requesting a new WhatsApp code");
    });

    it("successfully verifies correct OTP and provides replay protection", () => {
      const { otp } = createWhatsAppOtpSession("9920477158");
      expect(otp).toBeDefined();

      const verifyRes = verifyWhatsAppOtpSession("9920477158", otp!);
      expect(verifyRes.valid).toBe(true);

      // Subsequent attempt must fail as the session was consumed
      const replayRes = verifyWhatsAppOtpSession("9920477158", otp!);
      expect(replayRes.valid).toBe(false);
      expect(replayRes.error).toContain("No active WhatsApp verification request");
    });

    it("tracks failed attempts and decrements remaining quota", () => {
      createWhatsAppOtpSession("9920477158");

      const fail1 = verifyWhatsAppOtpSession("9920477158", "000000");
      expect(fail1.valid).toBe(false);
      expect(fail1.remainingAttempts).toBe(4);
      expect(fail1.error).toContain("4 attempt(s) remaining");

      const fail2 = verifyWhatsAppOtpSession("9920477158", "111111");
      expect(fail2.valid).toBe(false);
      expect(fail2.remainingAttempts).toBe(3);
      expect(fail2.error).toContain("3 attempt(s) remaining");
    });

    it("locks and terminates session after 5 failed attempts", () => {
      createWhatsAppOtpSession("9920477158");

      for (let i = 0; i < 4; i++) {
        verifyWhatsAppOtpSession("9920477158", "999999");
      }

      // 5th failed attempt terminates session
      const fifth = verifyWhatsAppOtpSession("9920477158", "999999");
      expect(fifth.valid).toBe(false);
      expect(fifth.error).toContain("Too many incorrect attempts");

      // 6th attempt should return session not found
      const sixth = verifyWhatsAppOtpSession("9920477158", "999999");
      expect(sixth.valid).toBe(false);
      expect(sixth.error).toContain("No active WhatsApp verification request");
    });
  });

  describe("3. Dispatch Resilience & Deep Link Gateway", () => {
    it("generates official wa.me direct links with sender phone ID", async () => {
      const dispatch = await sendWhatsAppOtp("9820012345", "123456");
      expect(dispatch.success).toBe(true);
      expect(dispatch.message).toContain("+91 9820012345");
      expect(dispatch.waLink).toContain("wa.me/919820012345");
      expect(FAST2SMS_SENDER_PHONE_ID).toBe("7666511511");
    });
  });
});
