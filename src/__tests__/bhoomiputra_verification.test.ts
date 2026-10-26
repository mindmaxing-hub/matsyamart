import { describe, it, expect } from "vitest";
import { normalizeMemberId } from "../routes/api/bhoomiputra.verify-member";

describe("Bhoomiputra Member Verification & Normalization Suite", () => {
  describe("1. Unicode Dash & Input Normalization", () => {
    it("normalizes Unicode en-dash (\\u2013) to standard ASCII hyphen", () => {
      const result = normalizeMemberId("BH–MMR-075"); // Contains \u2013 en-dash
      expect(result.normalized).toBe("BH-MMR-075");
      expect(result.cleanUpper).toBe("BH-MMR-075");
      expect(result.sequenceNum).toBe(75);
      expect(result.canonicalId).toBe("BH-MMR-075");
    });

    it("normalizes Unicode em-dash (\\u2014) to standard ASCII hyphen", () => {
      const result = normalizeMemberId("BH—MMR-075"); // Contains \u2014 em-dash
      expect(result.normalized).toBe("BH-MMR-075");
      expect(result.canonicalId).toBe("BH-MMR-075");
      expect(result.sequenceNum).toBe(75);
    });

    it("handles whitespace, lowercase, and formatting variations", () => {
      const result = normalizeMemberId("  bh - mmr - 075  ");
      expect(result.canonicalId).toBe("BH-MMR-075");
      expect(result.sequenceNum).toBe(75);
    });

    it("normalizes short sequence numbers like '075' or '75'", () => {
      const r1 = normalizeMemberId("075");
      expect(r1.canonicalId).toBe("BH-MMR-075");
      expect(r1.sequenceNum).toBe(75);

      const r2 = normalizeMemberId("75");
      expect(r2.canonicalId).toBe("BH-MMR-075");
      expect(r2.sequenceNum).toBe(75);
    });

    it("distinguishes 10-digit mobile phones from sequence IDs", () => {
      const result = normalizeMemberId("7304290690");
      expect(result.cleanDigits).toBe("7304290690");
      expect(result.sequenceNum).toBeNull(); // Should not treat 10-digit phone as sequence number!
    });
  });

  describe("2. Sequential Bhoomiputra Member Range Validation", () => {
    it("identifies valid Bhoomiputra Foundation sequence range (>= 61)", () => {
      const seq61 = normalizeMemberId("BH-MMR-061");
      expect(seq61.sequenceNum).toBe(61);
      expect(seq61.sequenceNum! >= 61).toBe(true);

      const seq75 = normalizeMemberId("BH-MMR-075");
      expect(seq75.sequenceNum).toBe(75);
      expect(seq75.sequenceNum! >= 61).toBe(true);
    });
  });
});
