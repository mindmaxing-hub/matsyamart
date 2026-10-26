import React from "react";
import { PolicyNav } from "../components/policies/PolicyNav";
import { PolicyFooterCard } from "../components/policies/PolicyFooterCard";
import { Truck, MapPin, Zap, ShieldCheck } from "lucide-react";

export const ShippingPolicyPage: React.FC = () => {
  return (
    <div className="bg-[#29100b] text-[#f5edeb] min-h-screen py-12 px-4 sm:px-6 lg:px-8 selection:bg-[#e3a157] selection:text-[#29100b]">
      <div className="max-w-4xl mx-auto">
        <PolicyNav current="shipping" />

        <div className="space-y-4 mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#35160e] text-[#dab38c] border border-[#dab38c]/30 text-xs font-medium">
            Fulfillment &amp; Logistics Standard
          </div>
          <h1 className="font-display text-3xl sm:text-4xl font-bold text-[#f5edeb] tracking-tight">
            Shipping &amp; Delivery Policy
          </h1>
          <p className="text-xs text-[#dab38c]/70 font-mono">
            Last Updated: October 26, 2026 · Effective Date: Immediate
          </p>
        </div>

        {/* Highlight Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <div className="bg-[#1f0b07] p-5 rounded-2xl border border-[#dab38c]/20 space-y-1.5">
            <Zap className="h-5 w-5 text-[#e3a157]" />
            <div className="font-bold text-sm text-[#f5edeb]">Instant Digital Delivery</div>
            <p className="text-[11px] text-[#dab38c]/70">
              Admission passes &amp; GST tax invoices delivered immediately via WhatsApp &amp; Email.
            </p>
          </div>

          <div className="bg-[#1f0b07] p-5 rounded-2xl border border-[#dab38c]/20 space-y-1.5">
            <Truck className="h-5 w-5 text-[#e3a157]" />
            <div className="font-bold text-sm text-[#f5edeb]">Morning Cold-Chain Catch</div>
            <p className="text-[11px] text-[#dab38c]/70">
              Fresh catch orders delivered between 7:00 AM and 11:30 AM across Mumbai.
            </p>
          </div>

          <div className="bg-[#1f0b07] p-5 rounded-2xl border border-[#dab38c]/20 space-y-1.5">
            <MapPin className="h-5 w-5 text-[#e3a157]" />
            <div className="font-bold text-sm text-[#f5edeb]">Real-Time OTP Tracking</div>
            <p className="text-[11px] text-[#dab38c]/70">
              Lookup delivery status anytime at matsyamart.com/track with your mobile number.
            </p>
          </div>
        </div>

        <div className="space-y-8 text-xs sm:text-sm text-[#dab38c] leading-relaxed">
          {/* Section 1 */}
          <section className="space-y-3 bg-[#1f0b07] p-6 rounded-2xl border border-[#dab38c]/15">
            <h2 className="font-display text-lg font-bold text-[#f5edeb]">
              1. Fulfillment Channels
            </h2>
            <p>
              MatsyaMart operates two specialized delivery fulfillment pathways depending on the nature of your purchase:
            </p>
            <ul className="list-disc pl-5 space-y-1 text-xs text-[#dab38c]/90">
              <li>
                <strong>Physical Goods (Fresh Seafood &amp; Artisanal Pantry):</strong> Handled through temperature-regulated coastal logistics in insulated, food-safe packaging.
              </li>
              <li>
                <strong>Digital Passes (Coastal Walks, Workshops &amp; Dining Passes):</strong> Issued as 9:16 mobile admission passes with unique cryptographically verified QR codes.
              </li>
            </ul>
          </section>

          {/* Section 2 */}
          <section className="space-y-3 bg-[#1f0b07] p-6 rounded-2xl border border-[#dab38c]/15">
            <h2 className="font-display text-lg font-bold text-[#f5edeb]">
              2. Serviceable Geographies &amp; Delivery Windows
            </h2>
            <div className="overflow-x-auto mt-2">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-[#dab38c]/20 text-[#f5edeb]">
                    <th className="py-2.5 pr-4 font-semibold">Offering Type</th>
                    <th className="py-2.5 pr-4 font-semibold">Serviceable Locations</th>
                    <th className="py-2.5 font-semibold">Estimated Delivery Timeline</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#dab38c]/10 text-[#dab38c]/90">
                  <tr>
                    <td className="py-2.5 pr-4 font-medium">Fresh Seafood &amp; Daily Catch</td>
                    <td className="py-2.5 pr-4">Mumbai Island City, Western &amp; Eastern Suburbs, Thane, Navi Mumbai</td>
                    <td className="py-2.5">Morning window (7:00 AM to 11:30 AM) on chosen harvest date</td>
                  </tr>
                  <tr>
                    <td className="py-2.5 pr-4 font-medium">Artisanal Pantry Goods (Cured / Spices)</td>
                    <td className="py-2.5 pr-4">All pin codes across Maharashtra and Major Indian Metros</td>
                    <td className="py-2.5">2 to 4 business days via express courier</td>
                  </tr>
                  <tr>
                    <td className="py-2.5 pr-4 font-medium">Experience Passes &amp; Admissions</td>
                    <td className="py-2.5 pr-4">Pan-India (Electronic delivery)</td>
                    <td className="py-2.5 text-emerald-400 font-bold">Instant (within seconds of Razorpay payment)</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          {/* Section 3 */}
          <section className="space-y-3 bg-[#1f0b07] p-6 rounded-2xl border border-[#dab38c]/15">
            <h2 className="font-display text-lg font-bold text-[#f5edeb]">
              3. Digital Delivery of Experience Passes
            </h2>
            <p>
              When booking a coastal walk, boat workshop, or seafood dining experience:
            </p>
            <ul className="list-disc pl-5 space-y-1.5 text-xs text-[#dab38c]/90">
              <li>No physical paper tickets are dispatched via post or courier.</li>
              <li>Immediately after successful payment confirmation via Razorpay, your high-resolution 9:16 Mobile Pass is generated and delivered to your registered mobile number via WhatsApp and to your email address.</li>
              <li>The pass contains your verified QR code, exact meeting location with Google Maps coordinates, tide advisory, and emergency coordinator contacts.</li>
              <li>You can also retrieve and display your admission pass anytime at <a href="/track" className="text-[#e3a157] underline">matsyamart.com/track</a> using your phone OTP.</li>
            </ul>
          </section>

          {/* Section 4 */}
          <section className="space-y-3 bg-[#1f0b07] p-6 rounded-2xl border border-[#dab38c]/15">
            <h2 className="font-display text-lg font-bold text-[#f5edeb]">
              4. Shipping Fees &amp; Order Value Thresholds
            </h2>
            <p>
              Delivery charges are calculated dynamically at checkout based on your delivery PIN code and order weight. Standard delivery fees are transparently itemized on the checkout screen before you proceed to payment via Razorpay. Orders exceeding specified promotion thresholds receive complimentary free delivery.
            </p>
          </section>

          {/* Section 5 */}
          <section className="space-y-3 bg-[#1f0b07] p-6 rounded-2xl border border-[#dab38c]/15">
            <h2 className="font-display text-lg font-bold text-[#f5edeb]">
              5. Order Tracking &amp; Delivery Discrepancies
            </h2>
            <p>
              Once your shipment is out for delivery, you will receive real-time dispatch alerts with courier rider details.
            </p>
            <p>
              If a physical parcel is received with visible signs of tampering or severe damage, we recommend documenting the parcel condition with photos and contacting our customer support hotline within <strong>4 hours</strong> at +91 76665 11511 or <a href="mailto:hello@matsyamart.com" className="text-[#e3a157] underline">hello@matsyamart.com</a> for an immediate replacement or refund.
            </p>
          </section>
        </div>

        <PolicyFooterCard />
      </div>
    </div>
  );
};
