import { describe, it, expect } from "vitest";
import { escapeCsvValue, exportManifestCsv, ManifestRow } from "../lib/services/manifest";

describe("Canonical Manifest & Safe CSV Export", () => {
  it("escapes CSV values with quotes and double-quotes correctly", () => {
    expect(escapeCsvValue("Normal Name")).toBe('"Normal Name"');
    expect(escapeCsvValue('Name with "Quotes"')).toBe('"Name with ""Quotes"""');
  });

  it("neutralizes spreadsheet formula injection characters (=, +, -, @)", () => {
    expect(escapeCsvValue("=SUM(A1:B1)")).toBe('"\'=SUM(A1:B1)"');
    expect(escapeCsvValue("+cmd|' /C calc'!A0")).toBe('"\'+cmd|\' /C calc\'!A0"');
    expect(escapeCsvValue("-1+2")).toBe('"\'-1+2"');
    expect(escapeCsvValue("@import")).toBe('"\'@import"');
  });

  it("exports valid UTF-8 CSV with BOM", () => {
    const mockRows: ManifestRow[] = [
      {
        bookingId: "b-01",
        orderRef: "MM-EXP-001",
        customerName: "Suresh Patil",
        customerPhone: "+91 98200 11111",
        customerEmail: "suresh@example.com",
        offeringId: "exp-01",
        offeringTitle: "Versova Trail",
        pillar: "walks",
        seatIndex: 1,
        attendeeName: "Suresh Patil",
        attendeePhone: "+91 98200 11111",
        checkedIn: false,
        status: "confirmed",
        unitPriceINR: 850,
      },
    ];

    const csv = exportManifestCsv(mockRows);
    expect(csv.startsWith("\uFEFF")).toBe(true);
    expect(csv).toContain('"MM-EXP-001"');
    expect(csv).toContain('"WALKS"');
    expect(csv).toContain('"Suresh Patil"');
  });
});
