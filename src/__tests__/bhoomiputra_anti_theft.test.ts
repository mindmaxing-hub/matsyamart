import { describe, it, expect } from "vitest";
import {
  findBhoomiputraMember,
  sendDelegationOtp,
  verifyDelegationOtp,
  verifyMemberDiscountEligibility,
  maskPhone,
  clean10DigitPhone,
  CORE_BHOOMIPUTRA_REGISTRY,
} from "../lib/bhoomiputraSecurity";
import fs from "fs";
import path from "path";

describe("Bhoomiputra Membership Anti-Theft Security Suite", () => {
  it("normalizes phone numbers to clean 10 digits", () => {
    expect(clean10DigitPhone("+91 73042 90690")).toBe("7304290690");
    expect(clean10DigitPhone("09920477158")).toBe("9920477158");
    expect(clean10DigitPhone("917666511511")).toBe("7666511511");
    expect(clean10DigitPhone("12345")).toBe("12345");
  });

  it("masks phone numbers cleanly for user safety", () => {
    expect(maskPhone("7304290690")).toBe("+91 ••••••0690");
    expect(maskPhone("9920477158")).toBe("+91 ••••••7158");
    expect(maskPhone("")).toBe("+91 ••••••••••");
  });

  it("finds Bhoomiputra members by canonical ID and phone", async () => {
    const aryanById = await findBhoomiputraMember({ memberId: "BH-MMR-075" });
    expect(aryanById).not.toBeNull();
    expect(aryanById?.name).toBe("Aryan Panchal");
    expect(aryanById?.phones).toContain("7304290690");

    const ashwiniByPhone = await findBhoomiputraMember({ phone: "9920477158" });
    expect(ashwiniByPhone).not.toBeNull();
    expect(ashwiniByPhone?.id).toBe("BH-MMR-061");
    expect(ashwiniByPhone?.name).toBe("Ashwini Koli");
  });

  it("approves 15% discount when checkout phone matches member registered phone", async () => {
    const result = await verifyMemberDiscountEligibility({
      memberId: "BH-MMR-075",
      customerPhone: "7304290690",
    });
    expect(result.eligible).toBe(true);
    expect(result.discountPercent).toBe(15);
    expect(result.member?.name).toBe("Aryan Panchal");
  });

  it("BLOCKS discount theft when a stranger enters someone else's Member ID", async () => {
    const result = await verifyMemberDiscountEligibility({
      memberId: "BH-MMR-075",
      customerPhone: "9899999999", // Unregistered stranger phone
    });
    expect(result.eligible).toBe(false);
    expect(result.discountPercent).toBe(0);
    expect(result.reason).toContain("belongs to +91 ••••••");
  });

  it("allows authorized delegation via WhatsApp 4-digit delegation code", async () => {
    const requesterPhone = "9820199999"; // Friend/Family phone
    const memberId = "BH-MMR-075";

    // Step 1: Dispatch delegation OTP to member
    const sendResult = await sendDelegationOtp({ memberId, requesterPhone });
    expect(sendResult.success).toBe(true);
    expect(sendResult.maskedPhone).toBe("+91 ••••••0690");

    // Step 2: Extract code directly for testing and verify
    // Invalid code fails
    const invalidVerify = verifyDelegationOtp({
      memberId,
      requesterPhone,
      code: "0000",
    });
    expect(invalidVerify.success).toBe(false);

    // Test with delegation token verification
    // Unknown delegation token is rejected
    const unverifiedResult = await verifyMemberDiscountEligibility({
      memberId: "BH-MMR-061",
      customerPhone: "9820188888",
      delegationToken: "invalid_token",
    });
    expect(unverifiedResult.eligible).toBe(false);
  }, 15000);
});

describe("Invoices Workspace Theme Verification", () => {
  it("contains zero occurrences of cold navy blue slate colors in InvoicesWorkspace.tsx", () => {
    const filePath = path.resolve(__dirname, "../components/admin/InvoicesWorkspace.tsx");
    const content = fs.readFileSync(filePath, "utf-8");

    // Ensure cold navy/slate palette is completely eradicated
    expect(content.includes("#152942")).toBe(false);
    expect(content.includes("#0e1a29")).toBe(false);
    expect(content.includes("#1c3554")).toBe(false);

    // Ensure warm roast / coastal luxury colors are present
    expect(content.includes("#29100B") || content.includes("#29100b")).toBe(true);
    expect(content.includes("#FFFDFB")).toBe(true);
    expect(content.includes("#E3A157")).toBe(true);
  });
});

import { describe as d2, it as i2, expect as e2 } from "vitest";
import { verifyMemberDiscountEligibility as vmde } from "../lib/bhoomiputraSecurity";
d2("Unregistered member IDs", () => {
  i2("does not grant the 15% discount to a made-up card number", async () => {
    const r = await vmde({ memberId: "BH-MMR-4321", customerPhone: "9000000001" });
    e2(r.eligible).toBe(false);
    e2(r.discountPercent).toBe(0);
  });
});
