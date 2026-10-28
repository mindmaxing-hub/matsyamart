import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  sendPassWhatsAppCascade,
  FAST2SMS_PASS_LINK_TEMPLATE_ID,
  FAST2SMS_PASS_IMAGE_TEMPLATE_ID,
  FAST2SMS_PASS_PDF_TEMPLATE_ID,
  FAST2SMS_PHONE_NUMBER_ID,
} from "../lib/fast2smsWhatsApp";

describe("Multi-Template WhatsApp Pass Waterfall Dispatch Suite", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("validates template constants and default approved IDs", () => {
    expect(FAST2SMS_PASS_LINK_TEMPLATE_ID).toBe("39898");
    expect(FAST2SMS_PASS_IMAGE_TEMPLATE_ID).toBe("39898");
    expect(FAST2SMS_PASS_PDF_TEMPLATE_ID).toBe("39898");
    expect(FAST2SMS_PHONE_NUMBER_ID).toBe("1442308258960303");
  });

  it("rejects invalid or too short phone numbers gracefully", async () => {
    const res = await sendPassWhatsAppCascade({
      phone: "1234",
      orderRef: "MM-TEST1",
      digitalPassUrl: "https://matsyamart.com/order/confirmation/MM-TEST1",
    });

    expect(res.success).toBe(false);
    expect(res.error).toContain("Invalid 10-digit");
    expect(res.attempts[0]?.status).toBe("failed");
  });

  it("executes Tier 1 (Direct Link Template First) in auto mode", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({
        return: true,
        status_code: 200,
        request_id: "req_tier1_link",
        message: ["Message sent successfully."],
      }),
    });
    vi.stubGlobal("fetch", fetchMock);

    const res = await sendPassWhatsAppCascade({
      phone: "7304290690",
      orderRef: "MM-TESTLINK",
      guestName: "Aryan",
      digitalPassUrl: "https://matsyamart.com/order/confirmation/MM-TESTLINK",
      mode: "auto",
    });

    expect(res.success).toBe(true);
    expect(res.mode).toBe("whatsapp_template_link");
    expect(res.requestId).toBe("req_tier1_link");
    expect(fetchMock).toHaveBeenCalledTimes(1);

    const callUrl = fetchMock.mock.calls[0]![0] as string;
    const decodedUrl = decodeURIComponent(callUrl.replace(/\+/g, " "));
    expect(decodedUrl).toContain("message_id=39898");
    expect(decodedUrl).toContain("numbers=7304290690");
    expect(decodedUrl).toContain("https://matsyamart.com/order/confirmation/MM-TESTLINK");
    expect(decodedUrl).toContain("🎟️ YOUR DIGITAL BOARDING PASS LINK:");
    // Meta Cloud API Rule: variables_values must never contain newlines (\n) or tabs (\t)
    expect(decodedUrl).not.toContain("\n");
    expect(decodedUrl).not.toContain("\t");
  });

  it("falls back to Tier 2 (Image Media Template) when Tier 1 fails", async () => {
    const fetchMock = vi
      .fn()
      // Tier 1: Fails
      .mockResolvedValueOnce({
        ok: false,
        status: 400,
        json: async () => ({
          return: false,
          message: ["Link template unavailable"],
        }),
      })
      // Tier 2: Image Media Template succeeds
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({
          return: true,
          status_code: 200,
          request_id: "req_tier2_image",
          message: ["Image message sent successfully."],
        }),
      });
    vi.stubGlobal("fetch", fetchMock);

    const res = await sendPassWhatsAppCascade({
      phone: "7304290690",
      orderRef: "MM-TESTIMAGE",
      digitalPassUrl: "https://matsyamart.com/order/confirmation/MM-TESTIMAGE",
      imageUrl: "https://matsyamart.com/pass-card.png",
      mode: "auto",
    });

    expect(res.success).toBe(true);
    expect(res.mode).toBe("whatsapp_template_image");
    expect(res.requestId).toBe("req_tier2_image");
    expect(fetchMock).toHaveBeenCalledTimes(2);

    const callUrlTier2 = fetchMock.mock.calls[1]![0] as string;
    expect(callUrlTier2).toContain("media_url=");
    expect(callUrlTier2).toContain(encodeURIComponent("https://matsyamart.com/pass-card.png"));
  });

  it("falls back to Tier 3 (PDF Document Template) when Tier 1 and 2 fail", async () => {
    const fetchMock = vi
      .fn()
      // Tier 1: Fails
      .mockResolvedValueOnce({
        ok: false,
        status: 400,
        json: async () => ({ return: false, message: ["Failed Tier 1"] }),
      })
      // Tier 2: Fails
      .mockResolvedValueOnce({
        ok: false,
        status: 400,
        json: async () => ({ return: false, message: ["Failed Tier 2"] }),
      })
      // Tier 3: PDF Document Template succeeds
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({
          return: true,
          status_code: 200,
          request_id: "req_tier3_pdf",
          message: ["PDF message sent successfully."],
        }),
      });
    vi.stubGlobal("fetch", fetchMock);

    const res = await sendPassWhatsAppCascade({
      phone: "7304290690",
      orderRef: "MM-TESTPDF",
      digitalPassUrl: "https://matsyamart.com/order/confirmation/MM-TESTPDF",
      pdfUrl: "https://matsyamart.com/invoice.pdf",
      mode: "auto",
    });

    expect(res.success).toBe(true);
    expect(res.mode).toBe("whatsapp_template_pdf");
    expect(res.requestId).toBe("req_tier3_pdf");
    expect(fetchMock).toHaveBeenCalledTimes(3);

    const callUrlTier3 = fetchMock.mock.calls[2]![0] as string;
    expect(callUrlTier3).toContain("media_url=");
    expect(callUrlTier3).toContain("document_filename=MatsyaMart_Boarding_Pass_MM-TESTPDF.pdf");
  });

  it("allows testing explicit modes independently (e.g. mode: link only)", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: false,
      status: 400,
      json: async () => ({
        return: false,
        message: ["Test failure for link"],
      }),
    });
    vi.stubGlobal("fetch", fetchMock);

    const res = await sendPassWhatsAppCascade({
      phone: "7304290690",
      orderRef: "MM-LINKONLY",
      digitalPassUrl: "https://matsyamart.com/order/confirmation/MM-LINKONLY",
      mode: "link",
    });

    expect(res.success).toBe(false);
    expect(res.mode).toBe("whatsapp_template_link");
    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(res.waLink).toContain("https://wa.me/917304290690");
  });

  it("strips oversized ?p= Base64 state payload to prevent Fast2SMS >1000 char 400 error", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({
        return: true,
        status_code: 200,
        request_id: "req_sanitized",
      }),
    });
    vi.stubGlobal("fetch", fetchMock);

    // Simulate huge 1,200 char Base64 token in URL
    const giantToken = "eyJyZWYiOiJNTS1GRC0yMDI2LTQ5OTQiLCJuYW1lIjoi".repeat(30);
    const hugeUrl = `https://matsyamart.com/order/confirmation/MM-FD-2026-4994?p=${giantToken}`;

    const res = await sendPassWhatsAppCascade({
      phone: "7304290690",
      orderRef: "MM-FD-2026-4994",
      guestName: "Aryan Panchal",
      digitalPassUrl: hugeUrl,
      mode: "link",
    });

    expect(res.success).toBe(true);
    expect(fetchMock).toHaveBeenCalledTimes(1);

    const callUrl = fetchMock.mock.calls[0]![0] as string;
    const urlObj = new URL(callUrl);
    const variablesValues = urlObj.searchParams.get("variables_values") || "";

    // Invariant 1: Variables values must strictly be under 1000 characters
    expect(variablesValues.length).toBeLessThan(900);
    // Invariant 2: Base64 payload is stripped out
    expect(variablesValues).not.toContain(giantToken);
    // Invariant 3: Canonical pass URL is preserved
    expect(variablesValues).toContain("https://matsyamart.com/order/confirmation/MM-FD-2026-4994");
  });

  it("discriminates physical goods orders with order receipt label and dock dispatch copy", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({
        return: true,
        status_code: 200,
        request_id: "req_goods",
      }),
    });
    vi.stubGlobal("fetch", fetchMock);

    const res = await sendPassWhatsAppCascade({
      phone: "7304290690",
      orderRef: "MM-GD-2026-1630",
      guestName: "Aryan Panchal",
      digitalPassUrl: "https://matsyamart.com/order/confirmation/MM-GD-2026-1630",
      isGoods: true,
      mode: "link",
    });

    expect(res.success).toBe(true);
    const callUrl = fetchMock.mock.calls[0]![0] as string;
    const urlObj = new URL(callUrl);
    const variablesValues = urlObj.searchParams.get("variables_values") || "";

    // Invariant: Goods orders must never be labeled as Boarding Pass
    expect(variablesValues).toContain("📦 MATSYAMART ORDER RECEIPT:");
    expect(variablesValues).not.toContain("BOARDING PASS");

    // Invariant: Direct waLink must have goods dispatch header
    expect(res.waLink).toContain(encodeURIComponent("Official Goods Order Confirmation"));
    expect(res.waLink).toContain(encodeURIComponent("Pan-India Coastal Goods Dispatch"));
  });
});
