import { describe, it, expect } from "vitest";
import { normalizeWhatsAppPhone, formatPhoneDisplay } from "../lib/whatsapp";
import { formatINR } from "../lib/utils";

describe("Baseline Tooling & Utilities", () => {
  describe("WhatsApp Phone Normalization", () => {
    it("normalizes 10-digit Indian numbers to standard 91XXXXXXXXXX", () => {
      expect(normalizeWhatsAppPhone("9820144512")).toBe("919820144512");
      expect(normalizeWhatsAppPhone("+91 98201 44512")).toBe("919820144512");
      expect(normalizeWhatsAppPhone("09820144512")).toBe("919820144512");
    });

    it("formats phone for clean human display", () => {
      expect(formatPhoneDisplay("917666511511")).toBe("+91 76665 11511");
    });
  });

  describe("Commercial Currency & Calculations", () => {
    it("formats INR correctly", () => {
      expect(formatINR(1200)).toBe("₹1,200");
      expect(formatINR(0)).toBe("₹0");
    });
  });

  describe("Geographic Coordinate Validation", () => {
    it("validates latitude (-90 to 90) and longitude (-180 to 180)", () => {
      const isValidCoord = (lat: number, lng: number): boolean => {
        return (
          !isNaN(lat) &&
          !isNaN(lng) &&
          lat >= -90 &&
          lat <= 90 &&
          lng >= -180 &&
          lng <= 180
        );
      };

      expect(isValidCoord(19.1316, 72.8109)).toBe(true); // Versova Koliwada
      expect(isValidCoord(95.0, 72.8109)).toBe(false); // Invalid lat
      expect(isValidCoord(19.1316, 195.0)).toBe(false); // Invalid lng
    });

    it("generates canonical Google Maps URL from numeric coordinates", () => {
      const buildMapsUrl = (lat: number, lng: number): string => {
        return `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`;
      };

      expect(buildMapsUrl(19.1316, 72.8109)).toBe(
        "https://www.google.com/maps/search/?api=1&query=19.1316,72.8109",
      );
    });
  });
});
