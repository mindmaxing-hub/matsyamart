import React from "react";
import { PolicyNav } from "../components/policies/PolicyNav";
import { PolicyFooterCard } from "../components/policies/PolicyFooterCard";

export const PrivacyPage: React.FC = () => {
  return (
    <div className="bg-[#29100b] text-[#f5edeb] min-h-screen py-12 px-4 sm:px-6 lg:px-8 selection:bg-[#e3a157] selection:text-[#29100b]">
      <div className="max-w-4xl mx-auto">
        <PolicyNav current="privacy" />

        <div className="space-y-4 mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#35160e] text-[#dab38c] border border-[#dab38c]/30 text-xs font-medium">
            Digital Personal Data Protection (DPDP) Act 2023 Compliance
          </div>
          <h1 className="font-display text-3xl sm:text-4xl font-bold text-[#f5edeb] tracking-tight">
            Privacy Policy
          </h1>
          <p className="text-xs text-[#dab38c]/70 font-mono">
            Last Updated: October 26, 2026 · Effective Date: Immediate
          </p>
        </div>

        <div className="space-y-8 text-xs sm:text-sm text-[#dab38c] leading-relaxed">
          {/* Section 1 */}
          <section className="space-y-3 bg-[#1f0b07] p-6 rounded-2xl border border-[#dab38c]/15">
            <h2 className="font-display text-lg font-bold text-[#f5edeb]">
              1. Introduction &amp; Commitment to Privacy
            </h2>
            <p>
              <strong>Kolibaba Seafood Inc.</strong> ("MatsyaMart", "we", "our", or "us"), operating the online platform <a href="https://matsyamart.com" className="text-[#e3a157] underline">matsyamart.com</a>, is committed to safeguarding your personal data and privacy.
            </p>
            <p>
              This Privacy Policy explains how we collect, store, process, and protect your information when you browse our website, order coastal products, or book experiences. We adhere strictly to the Digital Personal Data Protection Act 2023 (DPDP), the Information Technology Act 2000, and the Consumer Protection (E-Commerce) Rules 2020.
            </p>
          </section>

          {/* Section 2 */}
          <section className="space-y-3 bg-[#1f0b07] p-6 rounded-2xl border border-[#dab38c]/15">
            <h2 className="font-display text-lg font-bold text-[#f5edeb]">
              2. Information We Collect
            </h2>
            <p>We collect only the minimum necessary information required to deliver your orders and passes:</p>
            <ul className="list-disc pl-5 space-y-2 text-xs text-[#dab38c]/90">
              <li>
                <strong>Contact &amp; Identity Data:</strong> Full name, mobile number (required for phone OTP authentication and WhatsApp pass delivery), and email address for sending GST Tax Invoices.
              </li>
              <li>
                <strong>Shipping &amp; Delivery Address:</strong> Flat/house number, building name, street, locality, landmark, city, state, and PIN code for physical delivery of fresh catch and pantry goods.
              </li>
              <li>
                <strong>Booking &amp; Attendee Details:</strong> Number of guests, dietary preferences (if applicable for seafood pop-ups), and emergency contact information for outdoor coastal walks.
              </li>
              <li>
                <strong>Transactional Payment Data:</strong> Razorpay Order ID, Payment ID, payment timestamp, and payment method type (e.g. UPI, Card). <strong>Important:</strong> MatsyaMart does not store, see, or process your credit/debit card numbers, CVVs, expiry dates, or UPI MPINs. All payment transactions occur within Razorpay's PCI-DSS Level 1 certified vault.
              </li>
              <li>
                <strong>Technical &amp; Session Data:</strong> IP address, browser type, device information, and essential session cookies necessary for cart persistence and secure checkout.
              </li>
            </ul>
          </section>

          {/* Section 3 */}
          <section className="space-y-3 bg-[#1f0b07] p-6 rounded-2xl border border-[#dab38c]/15">
            <h2 className="font-display text-lg font-bold text-[#f5edeb]">
              3. Purpose &amp; Lawful Basis of Processing
            </h2>
            <p>We process your personal information strictly for legitimate commercial and fulfillment purposes:</p>
            <ul className="list-disc pl-5 space-y-1.5 text-xs text-[#dab38c]/90">
              <li>To confirm, process, and fulfill your orders for fresh coastal goods and artisanal products.</li>
              <li>To generate official GST Tax Invoices and statutory accounting records.</li>
              <li>To issue and verify secure 9:16 mobile admission passes with unique QR codes for community experiences.</li>
              <li>To dispatch real-time delivery tracking alerts and customer service notifications via WhatsApp and Email.</li>
              <li>To comply with legal obligations, tax filings, and law enforcement requests under applicable Indian statutes.</li>
            </ul>
          </section>

          {/* Section 4 */}
          <section className="space-y-3 bg-[#1f0b07] p-6 rounded-2xl border border-[#dab38c]/15">
            <h2 className="font-display text-lg font-bold text-[#f5edeb]">
              4. Data Sharing &amp; Third-Party Processors
            </h2>
            <p>
              We <strong>do not sell, rent, or monetize</strong> your personal data to marketing aggregators or third parties. We share information strictly with vetted service providers necessary to operate the platform:
            </p>
            <ul className="list-disc pl-5 space-y-1.5 text-xs text-[#dab38c]/90">
              <li>
                <strong>Payment Gateway (Razorpay):</strong> To authorize and process payments securely in compliance with RBI standards.
              </li>
              <li>
                <strong>Communication Channels (Meta WhatsApp Cloud API / Fast2SMS):</strong> To send transactional OTPs, ticket passes, and delivery status alerts requested by you.
              </li>
              <li>
                <strong>Local Logistics &amp; Courier Partners:</strong> To deliver physical shipments to your delivery address within designated Mumbai/Maharashtra zones.
              </li>
              <li>
                <strong>Database &amp; Cloud Infrastructure (Supabase):</strong> Stored on secure cloud servers with Row Level Security (RLS) and end-to-end encryption.
              </li>
            </ul>
          </section>

          {/* Section 5 */}
          <section className="space-y-3 bg-[#1f0b07] p-6 rounded-2xl border border-[#dab38c]/15">
            <h2 className="font-display text-lg font-bold text-[#f5edeb]">
              5. Cookie Preferences &amp; Tracking
            </h2>
            <p>
              MatsyaMart utilizes minimal, privacy-first cookies strictly necessary for shopping cart functionality, wishlist state, and security validation. You can review or modify your cookie consent at any time using the <strong>Cookie Preferences</strong> link located in the footer.
            </p>
          </section>

          {/* Section 6 */}
          <section className="space-y-3 bg-[#1f0b07] p-6 rounded-2xl border border-[#dab38c]/15">
            <h2 className="font-display text-lg font-bold text-[#f5edeb]">
              6. Data Retention &amp; User Rights
            </h2>
            <p>
              We retain personal data only as long as necessary to fulfill the purposes outlined in this policy or as mandated by statutory Indian tax and accounting regulations (typically 7 years for GST invoices).
            </p>
            <p>
              Under the DPDP Act 2023, you have the right to request access to your personal data, seek correction of inaccurate information, or request erasure of your details (subject to statutory record-keeping constraints). To exercise these rights, email us at <a href="mailto:hello@matsyamart.com" className="text-[#e3a157] underline">hello@matsyamart.com</a>.
            </p>
          </section>

          {/* Section 7 */}
          <section className="space-y-3 bg-[#1f0b07] p-6 rounded-2xl border border-[#dab38c]/15">
            <h2 className="font-display text-lg font-bold text-[#f5edeb]">
              7. Grievance Redressal Officer (Rule 3(2) IT Rules, 2011)
            </h2>
            <p>
              In accordance with the Information Technology Act 2000 and the Consumer Protection (E-Commerce) Rules 2020, the designated Grievance Officer for MatsyaMart is:
            </p>
            <div className="bg-black/30 p-4 rounded-xl border border-[#dab38c]/20 text-xs space-y-1">
              <div><strong>Designation:</strong> Grievance &amp; Compliance Officer</div>
              <div><strong>Entity:</strong> Kolibaba Seafood Inc. (MatsyaMart)</div>
              <div><strong>Address:</strong> 101, Samudra Darshan, Budha Lane 2, Versova, Andheri West, Mumbai, MH - 400061</div>
              <div><strong>Email:</strong> <a href="mailto:hello@matsyamart.com" className="text-[#e3a157] underline">hello@matsyamart.com</a></div>
              <div><strong>Phone:</strong> +91 76665 11511</div>
              <div><strong>Acknowledgement Timeline:</strong> Within 24 hours of receipt</div>
              <div><strong>Resolution Timeline:</strong> Within 15 business days</div>
            </div>
          </section>
        </div>

        <PolicyFooterCard />
      </div>
    </div>
  );
};
