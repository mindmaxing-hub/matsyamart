import { describe, it, expect, beforeEach } from "vitest";
import {
  cleanIndianMobile,
  generateNumericOtp,
  createOtpSession,
  verifyOtpSession,
  clearAllOtpSessions,
  sendFast2SmsOtp,
  FAST2SMS_API_KEY,
} from "../lib/fast2sms";

describe("Fast2SMS OTP Verification Gateway Suite", () => {
  beforeEach(() => {
    clearAllOtpSessions();
  });

  describe("1. Mobile Number Normalization & Sanitization", () => {
    it("cleans Indian mobile numbers with country code or dashes into 10 digits", () => {
      expect(cleanIndianMobile("+91 99204 77158")).toBe("9920477158");
      expect(cleanIndianMobile("+91-98200-12345")).toBe("9820012345");
      expect(cleanIndianMobile("09820012345")).toBe("9820012345");
      expect(cleanIndianMobile("9820012345")).toBe("9820012345");
    });

    it("generates 6-digit numeric OTPs matching pattern /^[0-9]{6}$/", () => {
      for (let i = 0; i < 10; i++) {
        const otp = generateNumericOtp();
        expect(otp).toMatch(/^[0-9]{6}$/);
        expect(Number(otp)).toBeGreaterThanOrEqual(100000);
        expect(Number(otp)).toBeLessThanOrEqual(999999);
      }
    });
  });

  describe("2. Fast2SMS Session Management & Rate Limiting", () => {
    it("creates an active OTP session for a valid 10-digit number", () => {
      const res = createOtpSession("9920477158");
      expect(res.success).toBe(true);
      expect(res.otp).toBeDefined();
      expect(res.otp).toMatch(/^[0-9]{6}$/);
    });

    it("rejects invalid length mobile numbers", () => {
      const res = createOtpSession("12345");
      expect(res.success).toBe(false);
      expect(res.error).toContain("valid 10-digit");
    });

    it("enforces 30-second resend cooldown against rapid repeated requests", () => {
      const first = createOtpSession("9920477158");
      expect(first.success).toBe(true);

      const second = createOtpSession("9920477158");
      expect(second.success).toBe(false);
      expect(second.cooldownRemaining).toBeGreaterThan(0);
      expect(second.error).toContain("seconds before requesting");
    });

    it("successfully verifies with matching OTP and invalidates session after use", () => {
      const { otp } = createOtpSession("9920477158");
      expect(otp).toBeDefined();

      const verifyRes = verifyOtpSession("9920477158", otp!);
      expect(verifyRes.valid).toBe(true);

      // Re-verifying with the same OTP should fail because session was consumed
      const replayRes = verifyOtpSession("9920477158", otp!);
      expect(replayRes.valid).toBe(false);
      expect(replayRes.error).toContain("No active OTP request");
    });

    it("rejects incorrect OTP codes and decrements remaining attempts", () => {
      createOtpSession("9920477158");

      const fail1 = verifyOtpSession("9920477158", "000000");
      expect(fail1.valid).toBe(false);
      expect(fail1.error).toContain("4 attempt(s) remaining");

      const fail2 = verifyOtpSession("9920477158", "111111");
      expect(fail2.valid).toBe(false);
      expect(fail2.error).toContain("3 attempt(s) remaining");
    });

    it("invalidates session after 5 failed attempts to prevent brute-forcing", () => {
      createOtpSession("9920477158");

      for (let i = 0; i < 5; i++) {
        verifyOtpSession("9920477158", "999999");
      }

      // 6th attempt should declare session terminated
      const locked = verifyOtpSession("9920477158", "999999");
      expect(locked.valid).toBe(false);
      expect(locked.error).toMatch(/(expired|No active|Too many)/i);
    });
  });

  describe("3. Fast2SMS Gateway Key & Dispatch Resilience", () => {
    it("contains the official Fast2SMS API key configured", () => {
      expect(FAST2SMS_API_KEY).toBeDefined();
      expect(FAST2SMS_API_KEY.length).toBeGreaterThan(30);
      expect(FAST2SMS_API_KEY).toContain("oR4byDS7ZRxOMArq9rCOHqf6IYJD8fhprfSHWD8bCjVBVNNw1bs2SMM15o7M1W2l3sA6RgnHoBVWuXOe");
    });

    it("handles Fast2SMS network dispatch or sandbox mode gracefully without crashing", async () => {
      const testCode = "543210";
      const result = await sendFast2SmsOtp("9920477158", testCode);
      expect(result).toBeDefined();
      expect(result.success).toBe(true);
      expect(result.message).toContain("9920477158");
      // Zero-Leak Security Invariant: The raw OTP code must NEVER be exposed in the returned message!
      expect(result.message).not.toContain(testCode);
      expect(result.message).not.toContain("Note: Code is");
    });
  });
});
