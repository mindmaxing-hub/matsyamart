import { describe, it, expect, vi } from "vitest";
import {
  FAST2SMS_SENDER_DISPLAY,
  FAST2SMS_SENDER_PHONE_ID,
  FAST2SMS_PHONE_NUMBER_ID,
  FAST2SMS_SENDER_PHONE_NUMBER,
  FAST2SMS_PAYMENT_TEMPLATE_ID,
  normalizeWhatsAppNumber,
  to10DigitIndianNumber,
  buildMultiPassWhatsAppMessage,
  buildAbandonedCartWhatsAppMessage,
  sendFast2SMSWhatsApp,
} from "../lib/fast2smsWhatsApp";

describe("Fast2SMS WhatsApp Universal Dispatch Engine Suite", () => {
  it("verifies official Fast2SMS sender attributes", () => {
    expect(FAST2SMS_SENDER_DISPLAY).toBe("+91 76665 11511");
    expect(FAST2SMS_PHONE_NUMBER_ID).toBe("1442308258960303");
    expect(FAST2SMS_SENDER_PHONE_ID).toBe("1442308258960303");
    expect(FAST2SMS_SENDER_PHONE_NUMBER).toBe("7666511511");
    expect(FAST2SMS_PAYMENT_TEMPLATE_ID).toBe("39898");
  });

  it("normalizes various Indian and international phone formats", () => {
    expect(normalizeWhatsAppNumber("98201 44512")).toBe("919820144512");
    expect(normalizeWhatsAppNumber("+91 76665 11511")).toBe("917666511511");
    expect(normalizeWhatsAppNumber("09920477158")).toBe("919920477158");
    expect(normalizeWhatsAppNumber("919820144512")).toBe("919820144512");
    expect(normalizeWhatsAppNumber("")).toBe("");
    expect(normalizeWhatsAppNumber(null)).toBe("");
  });

  it("extracts clean 10-digit Indian numbers for SMS routes", () => {
    expect(to10DigitIndianNumber("+91 98201 44512")).toBe("9820144512");
    expect(to10DigitIndianNumber("09820144512")).toBe("9820144512");
    expect(to10DigitIndianNumber("919820144512")).toBe("9820144512");
  });

  it("builds comprehensive multi-pass WhatsApp payload with GPS and emergency contact", () => {
    const message = buildMultiPassWhatsAppMessage({
      guestName: "Aryan Panchal",
      orderRef: "MM-WK-2026-1029",
      items: [
        {
          title: "Sassoon Docks Dawn Walk",
          pillar: "walks",
          dateStr: "28/10/2026",
          timeStr: "06:30 AM - 09:00 AM",
          venue: "Historic Sassoon Docks Arch, Colaba",
          mapsUrl: "https://maps.google.com/?q=18.9142,72.8277",
          passRef: "MM-WK-2026-1029-1",
          attendeeName: "Aryan Panchal",
        },
        {
          title: "Sassoon Docks Dawn Walk",
          pillar: "walks",
          dateStr: "28/10/2026",
          timeStr: "06:30 AM - 09:00 AM",
          venue: "Historic Sassoon Docks Arch, Colaba",
          mapsUrl: "https://maps.google.com/?q=18.9142,72.8277",
          passRef: "MM-WK-2026-1029-2",
          attendeeName: "Siddharth Mehta",
        },
      ],
      totalPaidINR: 1700,
      digitalPassUrl: "https://matsyamart.com/order/confirmation/MM-WK-2026-1029",
      emergencyPhone: "+91 99204 77158",
    });

    expect(message).toContain("MatsyaMart Official Coastal Boarding Passes");
    expect(message).toContain("Aryan Panchal");
    expect(message).toContain("MM-WK-2026-1029");
    expect(message).toContain("YOUR DIGITAL ENTRY PASSES (2)");
    expect(message).toContain("Pass ID: *MM-WK-2026-1029-1*");
    expect(message).toContain("Pass ID: *MM-WK-2026-1029-2*");
    expect(message).toContain("Siddharth Mehta");
    expect(message).toContain("https://maps.google.com/?q=18.9142,72.8277");
    expect(message).toContain("https://matsyamart.com/order/confirmation/MM-WK-2026-1029");
    expect(message).toContain("Emergency / Maritime Safety: +91 99204 77158");
    expect(message).toContain("Bhoomiputra Foundation");
  });

  it("builds high-converting abandoned cart WhatsApp reminder", () => {
    const msg = buildAbandonedCartWhatsAppMessage({
      customerName: "Vikram Malhotra",
      itemsSummary: "Versova Koli Crab Masala & Surmai Feast (2x)",
      totalINR: 2400,
      restoreUrl: "https://matsyamart.com/?restore=sampleToken",
      discountPercentage: 15,
    });

    expect(msg).toContain("MatsyaMart Coastal Reservation Reminder");
    expect(msg).toContain("Vikram Malhotra");
    expect(msg).toContain("Versova Koli Crab Masala & Surmai Feast");
    expect(msg).toContain("₹2,400");
    expect(msg).toContain("*Bhoomiputra Member Privilege Active:* 15% OFF reserved!");
    expect(msg).toContain("https://matsyamart.com/?restore=sampleToken");
  });

  it("dispatches via Fast2SMS with reliable direct wa.me fallback", async () => {
    const fetchSpy = vi.spyOn(globalThis, "fetch").mockResolvedValueOnce({
      ok: true,
      json: async () => ({ status_code: 200, return: true, message_id: "test-msg-123" }),
    } as any);

    const result = await sendFast2SMSWhatsApp(
      "9820144512",
      "Test message",
      { apiKey: "test-api-key" },
    );

    expect(result.success).toBe(true);
    expect(result.waLink).toContain("https://wa.me/919820144512");
    expect(result.messageId).toBe("test-msg-123");
    fetchSpy.mockRestore();
  });
});
