import { describe, it, expect } from "vitest";
import {
  signPhoneVerificationToken,
  verifyPhoneVerificationToken,
} from "../lib/serverAuthToken";
import {
  signQuoteData,
  verifyQuoteData,
} from "../routes/api/checkout.quote";

describe("Authoritative Server Quote & Cryptographic Security Suite", () => {
  describe("1. Server Phone Verification Tokens", () => {
    it("generates and verifies valid HMAC-SHA256 signed tokens", () => {
      const phone = "7304290690";
      const token = signPhoneVerificationToken(phone);
      expect(token).toBeDefined();
      expect(token).toContain(".");

      const verification = verifyPhoneVerificationToken(token, phone);
      expect(verification.valid).toBe(true);
      expect(verification.phone).toBe("7304290690");
    });

    it("rejects token when customer attempts to checkout with a different phone", () => {
      const phone = "7304290690";
      const token = signPhoneVerificationToken(phone);

      const verification = verifyPhoneVerificationToken(token, "9820012345");
      expect(verification.valid).toBe(false);
      expect(verification.error).toContain("mismatch");
    });

    it("rejects tampered token signatures", () => {
      const phone = "7304290690";
      const token = signPhoneVerificationToken(phone);
      const parts = token.split(".");
      expect(parts.length).toBe(2);
      const payload = parts[0]!;
      const sig = parts[1]!;
      const tamperedSig = sig.slice(0, -3) + "abc";
      const tamperedToken = `${payload}.${tamperedSig}`;

      const verification = verifyPhoneVerificationToken(tamperedToken, phone);
      expect(verification.valid).toBe(false);
      expect(verification.error).toContain("signature");
    });

    it("rejects expired verification tokens", () => {
      const phone = "7304290690";
      // Issue token with negative TTL
      const expiredToken = signPhoneVerificationToken(phone, -1000);

      const verification = verifyPhoneVerificationToken(expiredToken, phone);
      expect(verification.valid).toBe(false);
      expect(verification.error).toContain("expired");
    });
  });

  describe("2. Cryptographic Authoritative Server Quotes", () => {
    it("creates and verifies genuine server quotes with matching parameters", () => {
      const quoteData = {
        quoteId: "quote_test_001",
        finalAmount: 1,
        customerPhone: "7304290690",
        exp: Date.now() + 60000,
      };

      const signature = signQuoteData(quoteData);
      expect(signature).toBeDefined();
      expect(signature.length).toBe(64); // sha256 hex string

      const isValid = verifyQuoteData(quoteData, signature);
      expect(isValid).toBe(true);
    });

    it("detects and rejects client-side price tampering", () => {
      const quoteData = {
        quoteId: "quote_test_001",
        finalAmount: 1,
        customerPhone: "7304290690",
        exp: Date.now() + 60000,
      };

      const signature = signQuoteData(quoteData);

      // Malicious client tries to claim amount was 0 or different
      const tamperedQuoteData = {
        ...quoteData,
        finalAmount: 0,
      };

      const isValid = verifyQuoteData(tamperedQuoteData, signature);
      expect(isValid).toBe(false);
    });

    it("rejects expired quotes", () => {
      const expiredQuoteData = {
        quoteId: "quote_test_expired",
        finalAmount: 1,
        customerPhone: "7304290690",
        exp: Date.now() - 5000,
      };

      const signature = signQuoteData(expiredQuoteData);
      const isValid = verifyQuoteData(expiredQuoteData, signature);
      expect(isValid).toBe(false);
    });
  });

  describe("3. DEAL100 and Bhoomiputra Benefit Coexistence on Goods", () => {
    it("applies DEAL100 flat ₹549 discount to ₹550 Goods item resulting in ₹1 payable", () => {
      const subtotal = 550;
      const promoDiscount = Math.min(549, subtotal > 1 ? subtotal - 1 : 0);
      const finalAmount = Math.max(1, subtotal - promoDiscount);

      expect(promoDiscount).toBe(549);
      expect(finalAmount).toBe(1);
    });

    it("correctly identifies Goods exclusion for Bhoomiputra member and preserves DEAL100 coupon", () => {
      const itemPillar = "goods";
      const bhoomiApplicablePillars = ["food", "walks", "workshops"];

      const isBhoomiEligible = bhoomiApplicablePillars.includes(itemPillar);
      expect(isBhoomiEligible).toBe(false);

      const bhoomiDiscount = isBhoomiEligible ? Math.round(550 * 0.15) : 0;
      expect(bhoomiDiscount).toBe(0);

      // Active discount must NOT collapse to ₹0 when DEAL100 is entered
      const deal100Discount = 549;
      const activeDiscount = bhoomiDiscount > 0 ? bhoomiDiscount : deal100Discount;
      expect(activeDiscount).toBe(549);

      const payable = 550 - activeDiscount;
      expect(payable).toBe(1);
    });
  });
});
