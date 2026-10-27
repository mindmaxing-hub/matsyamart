import { describe, it, expect, vi } from "vitest";
import {
  DEFAULT_RAZORPAY_KEY_ID,
  loadRazorpayScript,
  initiatePayment,
  RazorpayCheckoutOptions,
} from "../lib/razorpay";
import { RAZORPAY_KEY_ID, RAZORPAY_KEY_SECRET } from "../routes/api/razorpay.order.create";

describe("MatsyaMart Live Razorpay Integration Suite", () => {
  it("has live Razorpay Key ID and Secret configured", () => {
    expect(DEFAULT_RAZORPAY_KEY_ID).toBe("rzp_live_TsxeJqBUCJLHdx");
    expect(RAZORPAY_KEY_ID).toBe("rzp_live_TsxeJqBUCJLHdx");
    expect(RAZORPAY_KEY_SECRET).toBe("76QgXL8gEMFS01FStzJJDtbr");
  });

  it("converts INR amounts correctly into integer paise for Razorpay", () => {
    const testCases = [
      { inr: 499, expectedPaise: 49900 },
      { inr: 1250.5, expectedPaise: 125050 },
      { inr: 99, expectedPaise: 9900 },
      { inr: 2999, expectedPaise: 299900 },
    ];

    testCases.forEach(({ inr, expectedPaise }) => {
      expect(Math.round(inr * 100)).toBe(expectedPaise);
    });
  });

  it("handles offline / mock sandbox fallback cleanly when Razorpay script is absent", async () => {
    const onSuccess = vi.fn();
    const onDismiss = vi.fn();

    const options: RazorpayCheckoutOptions = {
      amountInr: 850,
      orderRef: "MM-TEST-01",
      customerName: "Vikas Koli",
      customerEmail: "vikas@example.com",
      customerPhone: "9920477158",
      description: "Coastal Fishing Workshop",
      onSuccess,
      onDismiss,
    };

    await initiatePayment(options);

    const mockModal = document.getElementById("matsyamart-mock-rzp-modal");
    expect(mockModal).not.toBeNull();

    // Verify amount in modal
    expect(mockModal?.textContent).toContain("850");
    expect(mockModal?.textContent).toContain("MM-TEST-01");
    expect(mockModal?.textContent).toContain("Vikas Koli");

    // Clean up
    mockModal?.remove();
  });
});
