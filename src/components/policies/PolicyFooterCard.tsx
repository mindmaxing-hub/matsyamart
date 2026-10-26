import React from "react";
import { Building2, Mail, Phone, MapPin, ShieldAlert } from "lucide-react";

export const PolicyFooterCard: React.FC = () => {
  return (
    <div className="mt-12 rounded-2xl bg-[#1f0b07] border border-[#dab38c]/20 p-6 sm:p-8 space-y-5 text-xs text-[#dab38c]">
      <div className="flex items-center gap-2 pb-3 border-b border-[#dab38c]/15">
        <Building2 className="h-5 w-5 text-[#e3a157]" />
        <h3 className="font-display text-base font-bold text-[#f5edeb]">
          Merchant Legal Identity &amp; Statutory Details
        </h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 leading-relaxed">
        <div className="space-y-2">
          <div>
            <span className="text-[10px] uppercase font-bold tracking-wider text-[#dab38c]/60 block font-mono">
              Operating Entity
            </span>
            <span className="font-bold text-[#f5edeb] text-sm">Kolibaba Seafood Inc.</span>
            <span className="block text-[11px] text-[#dab38c]/80">
              Operating trade brand: <strong>MatsyaMart</strong>
            </span>
          </div>

          <div>
            <span className="text-[10px] uppercase font-bold tracking-wider text-[#dab38c]/60 block font-mono">
              Community Partner
            </span>
            <span className="text-[#f5edeb]">Bhoomiputra Foundation</span>
            <span className="block text-[11px] text-[#dab38c]/70">
              Registered Public Charitable Trust (Regd. F-72299)
            </span>
          </div>

          <div>
            <span className="text-[10px] uppercase font-bold tracking-wider text-[#dab38c]/60 block font-mono">
              Goods &amp; Services Tax Identification (GSTIN)
            </span>
            <span className="font-mono font-semibold text-[#f5edeb] bg-black/30 px-2 py-0.5 rounded border border-[#dab38c]/20 inline-block">
              27ABBFK9637R1ZF
            </span>
            <span className="block text-[10px] text-[#dab38c]/60 mt-0.5">
              State Code: 27 (Maharashtra, India)
            </span>
          </div>
        </div>

        <div className="space-y-2">
          <div>
            <span className="text-[10px] uppercase font-bold tracking-wider text-[#dab38c]/60 block font-mono">
              Registered Office Address
            </span>
            <div className="flex items-start gap-1.5 text-[#f5edeb]">
              <MapPin className="h-3.5 w-3.5 text-[#e3a157] shrink-0 mt-0.5" />
              <span>
                101, Samudra Darshan, Budha Lane 2, Versova, Andheri West, Mumbai, Maharashtra - 400061, India
              </span>
            </div>
          </div>

          <div>
            <span className="text-[10px] uppercase font-bold tracking-wider text-[#dab38c]/60 block font-mono">
              Customer Support &amp; Grievance Redressal
            </span>
            <div className="space-y-1">
              <div className="flex items-center gap-1.5">
                <Mail className="h-3.5 w-3.5 text-[#e3a157]" />
                <a href="mailto:hello@matsyamart.com" className="text-[#f5edeb] hover:underline font-medium">
                  hello@matsyamart.com
                </a>
              </div>
              <div className="flex items-center gap-1.5">
                <Phone className="h-3.5 w-3.5 text-[#e3a157]" />
                <a href="tel:+917666511511" className="text-[#f5edeb] hover:underline font-medium">
                  +91 76665 11511
                </a>
                <span className="text-[10px] text-[#dab38c]/60">(Calls &amp; WhatsApp)</span>
              </div>
            </div>
          </div>

          <div>
            <span className="text-[10px] uppercase font-bold tracking-wider text-[#dab38c]/60 block font-mono">
              Operating Hours
            </span>
            <span className="text-[#f5edeb]">
              Monday to Sunday: 7:00 AM to 8:00 PM IST
            </span>
          </div>
        </div>
      </div>

      <div className="pt-3 border-t border-[#dab38c]/15 text-[11px] text-[#dab38c]/70 flex items-center gap-2">
        <ShieldAlert className="h-4 w-4 text-[#e3a157] shrink-0" />
        <span>
          Payment transactions on MatsyaMart are secured via 128-bit encryption and processed through <strong>Razorpay</strong>, complying with RBI payment aggregator directives.
        </span>
      </div>
    </div>
  );
};
