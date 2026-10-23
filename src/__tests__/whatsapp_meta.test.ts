import { describe, it, expect } from "vitest";
import { buildMultilingualHostNotice } from "../lib/services/whatsappMeta";

describe("Multilingual WhatsApp Host Notice", () => {
  const mockParams = {
    hostName: "Ramesh Koli",
    offeringTitle: "Intertidal Dawn Trail",
    pillar: "walks" as const,
    dateStr: "Saturday, 25 October 2026",
    timeStr: "06:30 AM - 09:00 AM",
    venueName: "Versova Jetty",
    mapsUrl: "https://www.google.com/maps/search/?api=1&query=19.1316,72.8109",
    totalGuests: 2,
    totalSeats: 3,
    estimatedPayoutINR: 2167,
    attendees: [
      { name: "Aarav Patel", phone: "+91 98201 11223", seats: 2 },
      { name: "Pooja Shah", phone: "+91 98201 44556", seats: 1 },
    ],
  };

  it("builds English notice with proper operational details", () => {
    const result = buildMultilingualHostNotice({ ...mockParams, language: "en" });
    expect(result.language).toBe("en");
    expect(result.text).toContain("Day-Before Notice (6:00 PM IST)");
    expect(result.text).toContain("Namaste *Ramesh Koli*");
    expect(result.text).toContain("Intertidal Dawn Trail");
    expect(result.text).toContain("Aarav Patel (2 seats)");
    expect(result.text).toContain("₹2,167");
  });

  it("builds Hindi notice with correct translations and format", () => {
    const result = buildMultilingualHostNotice({ ...mockParams, language: "hi" });
    expect(result.language).toBe("hi");
    expect(result.text).toContain("कल का रोस्टर (शाम ६ बजे)");
    expect(result.text).toContain("नमस्ते *Ramesh Koli*");
    expect(result.text).toContain("सत्यापित अतिथि सूची");
  });

  it("builds Marathi notice for local Koli community hosts", () => {
    const result = buildMultilingualHostNotice({ ...mockParams, language: "mr" });
    expect(result.language).toBe("mr");
    expect(result.text).toContain("उद्याचा रोस्टर (सायंकाळी ६ वाजता)");
    expect(result.text).toContain("नमस्कार *Ramesh Koli*");
    expect(result.text).toContain("*अंदाजे मानधन:* ₹2,167");
  });
});
