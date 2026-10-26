import React from "react";
import { PolicyNav } from "../components/policies/PolicyNav";
import { PolicyFooterCard } from "../components/policies/PolicyFooterCard";
import { Clock, RefreshCcw, CheckCircle2, AlertTriangle } from "lucide-react";

export const RefundPolicyPage: React.FC = () => {
  return (
    <div className="bg-[#29100b] text-[#f5edeb] min-h-screen py-12 px-4 sm:px-6 lg:px-8 selection:bg-[#e3a157] selection:text-[#29100b]">
      <div className="max-w-4xl mx-auto">
        <PolicyNav current="refund" />

        <div className="space-y-4 mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#35160e] text-[#dab38c] border border-[#dab38c]/30 text-xs font-medium">
            Standard Razorpay Compliance Guidelines
          </div>
          <h1 className="font-display text-3xl sm:text-4xl font-bold text-[#f5edeb] tracking-tight">
            Cancellation &amp; Refund Policy
          </h1>
          <p className="text-xs text-[#dab38c]/70 font-mono">
            Last Updated: October 26, 2026 · Effective Date: Immediate
          </p>
        </div>

        {/* Quick Highlights Box for Razorpay Auditor */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <div className="bg-[#1f0b07] p-5 rounded-2xl border border-[#dab38c]/20 space-y-1.5">
            <Clock className="h-5 w-5 text-[#e3a157]" />
            <div className="font-bold text-sm text-[#f5edeb]">2 to 3 Business Days</div>
            <p className="text-[11px] text-[#dab38c]/70">
              Internal approval and initiation timeline for verified refunds.
            </p>
          </div>

          <div className="bg-[#1f0b07] p-5 rounded-2xl border border-[#dab38c]/20 space-y-1.5">
            <RefreshCcw className="h-5 w-5 text-[#e3a157]" />
            <div className="font-bold text-sm text-[#f5edeb]">5 to 7 Business Days</div>
            <p className="text-[11px] text-[#dab38c]/70">
              Direct credit to original payment source (Bank / Card / UPI via Razorpay).
            </p>
          </div>

          <div className="bg-[#1f0b07] p-5 rounded-2xl border border-[#dab38c]/20 space-y-1.5">
            <CheckCircle2 className="h-5 w-5 text-[#e3a157]" />
            <div className="font-bold text-sm text-[#f5edeb]">100% Weather Protection</div>
            <p className="text-[11px] text-[#dab38c]/70">
              Full refund if an outdoor coastal walk or workshop is cancelled due to tides or storms.
            </p>
          </div>
        </div>

        <div className="space-y-8 text-xs sm:text-sm text-[#dab38c] leading-relaxed">
          {/* Section 1: Overview */}
          <section className="space-y-3 bg-[#1f0b07] p-6 rounded-2xl border border-[#dab38c]/15">
            <h2 className="font-display text-lg font-bold text-[#f5edeb]">
              1. Overview
            </h2>
            <p>
              At <strong>MatsyaMart</strong> (operated by <strong>Kolibaba Seafood Inc.</strong>), we take immense pride in delivering top-grade fresh coastal catch, artisanal pantry treasures, and memorable coastal experiences. We understand that circumstances may arise where you need to cancel a booking or request a refund.
            </p>
            <p>
              This policy clearly defines the cancellation windows, return conditions, and refund procedures across all our offerings.
            </p>
          </section>

          {/* Section 2: Experiences, Walks & Workshops */}
          <section className="space-y-3 bg-[#1f0b07] p-6 rounded-2xl border border-[#dab38c]/15">
            <h2 className="font-display text-lg font-bold text-[#f5edeb]">
              2. Cancellation Policy for Coastal Experiences &amp; Workshops
            </h2>
            <p>
              Community experiences (such as shoreline heritage walks, boat navigation workshops, and coastal culinary pop-ups) require advance preparation and slot reservations by community hosts:
            </p>
            <div className="overflow-x-auto mt-2">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-[#dab38c]/20 text-[#f5edeb]">
                    <th className="py-2.5 pr-4 font-semibold">Cancellation Timeframe</th>
                    <th className="py-2.5 pr-4 font-semibold">Refund Entitlement</th>
                    <th className="py-2.5 font-semibold">Rescheduling Option</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#dab38c]/10 text-[#dab38c]/90">
                  <tr>
                    <td className="py-2.5 pr-4 font-medium">24+ hours before start time</td>
                    <td className="py-2.5 pr-4 text-emerald-400 font-bold">100% Full Refund</td>
                    <td className="py-2.5">Free date rescheduling</td>
                  </tr>
                  <tr>
                    <td className="py-2.5 pr-4 font-medium">Within 24 hours of start time</td>
                    <td className="py-2.5 pr-4 text-amber-400 font-bold">50% Partial Refund</td>
                    <td className="py-2.5">Subject to host slot availability</td>
                  </tr>
                  <tr>
                    <td className="py-2.5 pr-4 font-medium">No-show / Missed slot</td>
                    <td className="py-2.5 pr-4 text-red-400 font-bold">No Refund</td>
                    <td className="py-2.5">Not available</td>
                  </tr>
                  <tr>
                    <td className="py-2.5 pr-4 font-medium">Cancellation by Host or Weather Emergency</td>
                    <td className="py-2.5 pr-4 text-emerald-400 font-bold">100% Full Refund</td>
                    <td className="py-2.5">Priority rescheduling</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <p className="text-[11px] text-[#dab38c]/70 pt-2">
              <strong>Marine Weather Clause:</strong> If an experience is cancelled by MatsyaMart or the host due to unsafe coastal tides, rain advisories, or maritime authority directives, you are entitled to a full 100% refund immediately or a credit pass for a future date of your choice.
            </p>
          </section>

          {/* Section 3: Fresh Seafood & Perishable Goods */}
          <section className="space-y-3 bg-[#1f0b07] p-6 rounded-2xl border border-[#dab38c]/15">
            <h2 className="font-display text-lg font-bold text-[#f5edeb]">
              3. Cancellation &amp; Refund Policy for Fresh Catch &amp; Perishables
            </h2>
            <p>
              Fresh seafood and cooked coastal food are perishable items requiring immediate cold-chain handling:
            </p>
            <ul className="list-disc pl-5 space-y-1.5 text-xs text-[#dab38c]/90">
              <li>
                <strong>Cancellation before dispatch:</strong> You may cancel a fresh catch order without penalty up to 6 hours before the scheduled delivery window (prior to morning harvest dispatch).
              </li>
              <li>
                <strong>Once dispatched in active transit:</strong> Orders cannot be cancelled once handed over to the cold-chain courier due to hygiene and food safety guidelines.
              </li>
              <li>
                <strong>Quality Assurance &amp; Damaged Delivery:</strong> If you receive seafood that has suffered temperature abuse, unsealed packaging, or does not meet quality standards, you must inform us within <strong>4 hours of delivery</strong> with photographs via WhatsApp (+91 76665 11511) or email (<a href="mailto:hello@matsyamart.com" className="text-[#e3a157] underline">hello@matsyamart.com</a>). Upon verification, we will promptly dispatch a replacement or issue a 100% refund.
              </li>
            </ul>
          </section>

          {/* Section 4: Non-Perishable Pantry Goods */}
          <section className="space-y-3 bg-[#1f0b07] p-6 rounded-2xl border border-[#dab38c]/15">
            <h2 className="font-display text-lg font-bold text-[#f5edeb]">
              4. Non-Perishable Pantry Goods &amp; Artisanal Crafts
            </h2>
            <p>
              For shelf-stable packaged items (dried fish, coastal spice blends, artisanal crafts):
            </p>
            <ul className="list-disc pl-5 space-y-1 text-xs text-[#dab38c]/90">
              <li>Cancellations are accepted anytime before the courier shipping label is generated.</li>
              <li>If you receive an item that is damaged, defective, or expired, report it within <strong>24 hours of delivery</strong> for an immediate replacement or full refund.</li>
            </ul>
          </section>

          {/* Section 5: Refund Processing Method & Timelines */}
          <section className="space-y-4 bg-[#1f0b07] p-6 rounded-2xl border border-[#dab38c]/15">
            <h2 className="font-display text-lg font-bold text-[#f5edeb]">
              5. Refund Processing Timeline &amp; Mode of Settlement
            </h2>
            <div className="space-y-3 text-xs text-[#dab38c]/90">
              <div className="flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 text-[#e3a157] shrink-0 mt-0.5" />
                <div>
                  <strong>Refund Initiation:</strong> Once a refund request is received and approved by our coordination team, the refund is initiated via the <strong>Razorpay Payment Gateway within 2 to 3 business days</strong>.
                </div>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 text-[#e3a157] shrink-0 mt-0.5" />
                <div>
                  <strong>Original Payment Source:</strong> All refunds are automatically credited strictly back to the original method of payment (your UPI VPA, debit/credit card, or net banking account). We do not issue cash refunds or third-party transfers.
                </div>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 text-[#e3a157] shrink-0 mt-0.5" />
                <div>
                  <strong>Bank Settlement Timeline:</strong> Depending on your card issuing bank or UPI provider, the credited amount will reflect in your account within <strong>5 to 7 business days</strong> following initiation by Razorpay.
                </div>
              </div>
            </div>
          </section>

          {/* Section 6: How to Request a Refund */}
          <section className="space-y-3 bg-[#1f0b07] p-6 rounded-2xl border border-[#dab38c]/15">
            <h2 className="font-display text-lg font-bold text-[#f5edeb]">
              6. How to Submit a Cancellation or Refund Request
            </h2>
            <p>To request a cancellation or refund, please reach out with your <strong>Order Reference</strong> (e.g. MM-EXP-2026-XXXX):</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1 text-xs">
              <div className="p-3 bg-black/30 rounded-xl border border-[#dab38c]/20">
                <div className="font-bold text-[#f5edeb]">Via WhatsApp Support (Fastest)</div>
                <div className="text-[11px] text-[#dab38c]/70 mt-1">Message our helpline at +91 76665 11511 with your order number and photos if applicable.</div>
              </div>
              <div className="p-3 bg-black/30 rounded-xl border border-[#dab38c]/20">
                <div className="font-bold text-[#f5edeb]">Via Email</div>
                <div className="text-[11px] text-[#dab38c]/70 mt-1">Send an email to hello@matsyamart.com with the subject line "Refund Request: [Order Ref]".</div>
              </div>
            </div>
          </section>
        </div>

        <PolicyFooterCard />
      </div>
    </div>
  );
};
