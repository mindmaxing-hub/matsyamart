import { describe, it, expect } from "vitest";
import fs from "node:fs";
import path from "node:path";

describe("Razorpay Merchant Compliance & Policy Pages Suite", () => {
  const policyFiles = [
    "src/pages/TermsPage.tsx",
    "src/pages/PrivacyPage.tsx",
    "src/pages/RefundPolicyPage.tsx",
    "src/pages/ShippingPolicyPage.tsx",
    "src/pages/ContactPage.tsx",
    "src/components/policies/PolicyNav.tsx",
    "src/components/policies/PolicyFooterCard.tsx",
    "src/components/layout/Footer.tsx",
    "src/routes/terms.tsx",
    "src/routes/terms-and-conditions.tsx",
    "src/routes/privacy.tsx",
    "src/routes/privacy-policy.tsx",
    "src/routes/refund-policy.tsx",
    "src/routes/cancellation-and-refund.tsx",
    "src/routes/shipping-policy.tsx",
    "src/routes/shipping-and-delivery.tsx",
    "src/routes/contact.tsx",
    "src/routes/contact-us.tsx",
  ];

  it("verifies strictly ZERO em dashes (\\u2014) across all policy and route files", () => {
    for (const relPath of policyFiles) {
      const fullPath = path.resolve(process.cwd(), relPath);
      expect(fs.existsSync(fullPath), `File must exist: ${relPath}`).toBe(true);
      const content = fs.readFileSync(fullPath, "utf-8");
      expect(content).not.toContain("\u2014");
    }
  });

  it("verifies statutory merchant details are present across policy pages", () => {
    const terms = fs.readFileSync(path.resolve(process.cwd(), "src/pages/TermsPage.tsx"), "utf-8");
    const privacy = fs.readFileSync(path.resolve(process.cwd(), "src/pages/PrivacyPage.tsx"), "utf-8");
    const refund = fs.readFileSync(path.resolve(process.cwd(), "src/pages/RefundPolicyPage.tsx"), "utf-8");
    const shipping = fs.readFileSync(path.resolve(process.cwd(), "src/pages/ShippingPolicyPage.tsx"), "utf-8");
    const contact = fs.readFileSync(path.resolve(process.cwd(), "src/pages/ContactPage.tsx"), "utf-8");

    // Legal Operating Entity
    expect(terms).toContain("Kolibaba Seafood Inc.");
    expect(privacy).toContain("Kolibaba Seafood Inc.");
    expect(contact).toContain("Kolibaba Seafood Inc.");

    // GSTIN
    expect(terms).toContain("27ABBFK9637R1ZF");
    expect(contact).toContain("27ABBFK9637R1ZF");

    // Official support email & helpline
    expect(contact).toContain("hello@matsyamart.com");
    expect(contact).toContain("76665 11511");

    // Registered address
    expect(terms).toContain("Samudra Darshan");
    expect(terms).toContain("400061");

    // DPDP Act 2023 compliance in Privacy
    expect(privacy).toContain("Digital Personal Data Protection Act, 2023");
    expect(privacy).toContain("Grievance Officer");

    // Specific numerical timelines in Refund Policy (Razorpay mandatory requirement)
    expect(refund).toContain("5 to 7 business days");
    expect(refund).toContain("original payment source");

    // Shipping cold-chain & delivery timelines
    expect(shipping).toContain("7:00 AM");
    expect(shipping).toContain("11:30 AM");
  });

  it("verifies footer contains links to all mandatory Razorpay policy routes", () => {
    const footer = fs.readFileSync(path.resolve(process.cwd(), "src/components/layout/Footer.tsx"), "utf-8");

    expect(footer).toContain('to="/terms"');
    expect(footer).toContain('to="/privacy"');
    expect(footer).toContain('to="/refund-policy"');
    expect(footer).toContain('to="/shipping-policy"');
    expect(footer).toContain('to="/contact"');
    expect(footer).toContain("Kolibaba Seafood Inc.");
    expect(footer).toContain("27ABBFK9637R1ZF");
  });
});
