import React from "react";
import { PolicyNav } from "../components/policies/PolicyNav";
import { PolicyFooterCard } from "../components/policies/PolicyFooterCard";

export const TermsPage: React.FC = () => {
  return (
    <div className="bg-[#29100b] text-[#f5edeb] min-h-screen py-12 px-4 sm:px-6 lg:px-8 selection:bg-[#e3a157] selection:text-[#29100b]">
      <div className="max-w-4xl mx-auto">
        <PolicyNav current="terms" />

        <div className="space-y-4 mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#35160e] text-[#dab38c] border border-[#dab38c]/30 text-xs font-medium">
            Official Merchant Agreement
          </div>
          <h1 className="font-display text-3xl sm:text-4xl font-bold text-[#f5edeb] tracking-tight">
            Terms &amp; Conditions
          </h1>
          <p className="text-xs text-[#dab38c]/70 font-mono">
            Last Updated: October 26, 2026 · Effective Date: Immediate
          </p>
        </div>

        <div className="space-y-8 text-xs sm:text-sm text-[#dab38c] leading-relaxed">
          {/* Section 1 */}
          <section className="space-y-3 bg-[#1f0b07] p-6 rounded-2xl border border-[#dab38c]/15">
            <h2 className="font-display text-lg font-bold text-[#f5edeb]">
              1. Platform Overview &amp; Acceptance of Terms
            </h2>
            <p>
              Welcome to <strong>MatsyaMart</strong> (<a href="https://matsyamart.com" className="text-[#e3a157] underline">matsyamart.com</a>). MatsyaMart is a direct-to-community coastal e-commerce and experiential booking platform operated by <strong>Kolibaba Seafood Inc.</strong> in strategic partnership with <strong>Bhoomiputra Foundation</strong> (Registered Public Charitable Trust No. F-72299).
            </p>
            <p>
              By accessing, browsing, registering, or making any purchase on MatsyaMart, you agree to be legally bound by these Terms and Conditions, our Privacy Policy, Cancellation &amp; Refund Policy, and Shipping &amp; Delivery Policy. If you do not agree with any part of these terms, please refrain from using our services.
            </p>
          </section>

          {/* Section 2 */}
          <section className="space-y-3 bg-[#1f0b07] p-6 rounded-2xl border border-[#dab38c]/15">
            <h2 className="font-display text-lg font-bold text-[#f5edeb]">
              2. Offerings: Goods &amp; Community Experiences
            </h2>
            <p>
              MatsyaMart connects consumers with indigenous coastal fishing community livelihoods through two distinct categories:
            </p>
            <ul className="list-disc pl-5 space-y-1.5 text-xs text-[#dab38c]/90">
              <li>
                <strong>Coastal Goods &amp; Pantry Products:</strong> Fresh daily catch, artisanal cured fish, sun-dried coastal seafood, and heritage spices harvested by local Koli fisherfolk.
              </li>
              <li>
                <strong>Community Experiences &amp; Passes:</strong> Guided shoreline walks, traditional net-weaving workshops, boat navigation cohorts, and coastal food feasts hosted by verified local community hosts.
              </li>
            </ul>
            <p>
              We endeavor to accurately display product weights, cut types, and experience schedules. Because fresh catch depends on daily tides and seasonal marine conditions, minor natural variations in size, texture, and harvest volume may occur.
            </p>
          </section>

          {/* Section 3 */}
          <section className="space-y-3 bg-[#1f0b07] p-6 rounded-2xl border border-[#dab38c]/15">
            <h2 className="font-display text-lg font-bold text-[#f5edeb]">
              3. Pricing, GST Invoices &amp; Razorpay Payments
            </h2>
            <p>
              All prices displayed on MatsyaMart are quoted in Indian Rupees (INR) and are inclusive of applicable statutory taxes (CGST, SGST, or IGST) under GSTIN 27ABBFK9637R1ZF.
            </p>
            <p>
              Payment collection is handled securely via <strong>Razorpay</strong>, an authorized Payment Aggregator under Reserve Bank of India (RBI) guidelines. MatsyaMart accepts:
            </p>
            <ul className="list-disc pl-5 space-y-1 text-xs text-[#dab38c]/90">
              <li>Unified Payments Interface (UPI): Google Pay, PhonePe, Paytm, BHIM, and bank UPI apps</li>
              <li>Debit &amp; Credit Cards: Visa, MasterCard, RuPay, and American Express</li>
              <li>Internet Banking across all major scheduled commercial banks</li>
              <li>Authorized Digital Wallets</li>
            </ul>
            <p>
              Upon successful payment authorization, an official digital Tax Invoice is automatically generated with a verifiable Order Reference (e.g. MM-EXP-2026-XXXX or MM-PRD-2026-XXXX) and dispatched via Email and WhatsApp.
            </p>
          </section>

          {/* Section 4 */}
          <section className="space-y-3 bg-[#1f0b07] p-6 rounded-2xl border border-[#dab38c]/15">
            <h2 className="font-display text-lg font-bold text-[#f5edeb]">
              4. User Responsibilities &amp; Verification
            </h2>
            <p>
              To complete an order or experience booking, you must provide a valid Indian mobile number. A One-Time Password (OTP) verification is required to safeguard against fraudulent bookings and ensure accurate delivery of admission passes.
            </p>
            <p>
              You agree to provide accurate, current, and complete delivery and contact information. Kolibaba Seafood Inc. shall not be responsible for delivery delays or failed admissions resulting from incorrect address inputs or unreachable phone numbers.
            </p>
          </section>

          {/* Section 5 */}
          <section className="space-y-3 bg-[#1f0b07] p-6 rounded-2xl border border-[#dab38c]/15">
            <h2 className="font-display text-lg font-bold text-[#f5edeb]">
              5. Coastal Experience Safety &amp; Tidal Advisories
            </h2>
            <p>
              Participants attending outdoor coastal walks and shoreline workshops acknowledge that intertidal environments involve wet surfaces, changing marine tides, and outdoor weather conditions.
            </p>
            <ul className="list-disc pl-5 space-y-1 text-xs text-[#dab38c]/90">
              <li>Guests must adhere to all safety guidelines and instructions provided by the community host.</li>
              <li>Children under 16 years must be accompanied by an adult guardian at all times.</li>
              <li>In the event of storm warnings, extreme tides, or government maritime advisories, experiences will be rescheduled or refunded 100% in accordance with our Refund Policy.</li>
            </ul>
          </section>

          {/* Section 6 */}
          <section className="space-y-3 bg-[#1f0b07] p-6 rounded-2xl border border-[#dab38c]/15">
            <h2 className="font-display text-lg font-bold text-[#f5edeb]">
              6. Intellectual Property Rights
            </h2>
            <p>
              All trademarks, trade names, logos, digital admission passes, images, product descriptions, and software code on MatsyaMart are the exclusive intellectual property of Kolibaba Seafood Inc. or its partner Bhoomiputra Foundation. No material may be reproduced, distributed, or modified without prior written authorization.
            </p>
          </section>

          {/* Section 7 */}
          <section className="space-y-3 bg-[#1f0b07] p-6 rounded-2xl border border-[#dab38c]/15">
            <h2 className="font-display text-lg font-bold text-[#f5edeb]">
              7. Limitation of Liability
            </h2>
            <p>
              To the fullest extent permitted by Indian law, Kolibaba Seafood Inc., its directors, community partners, and local hosts shall not be liable for any indirect, incidental, punitive, or consequential damages resulting from the use or inability to use the platform, delivery delays caused by courier partners, or unforeseen natural weather events. Our aggregate liability for any claim shall not exceed the total transaction amount paid for the specific order.
            </p>
          </section>

          {/* Section 8 */}
          <section className="space-y-3 bg-[#1f0b07] p-6 rounded-2xl border border-[#dab38c]/15">
            <h2 className="font-display text-lg font-bold text-[#f5edeb]">
              8. Governing Law &amp; Dispute Resolution
            </h2>
            <p>
              These Terms shall be interpreted and enforced strictly in accordance with the laws of the Republic of India. In the event of any dispute, controversy, or claim arising out of these terms, the courts located in <strong>Mumbai, Maharashtra</strong> shall have exclusive jurisdiction.
            </p>
          </section>
        </div>

        <PolicyFooterCard />
      </div>
    </div>
  );
};
