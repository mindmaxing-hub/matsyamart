import React from "react";
import { Link } from "../ui/Link";
import { BrandLogo } from "../site/BrandLogo";
import { ShieldCheck, Truck, RotateCcw, FileText, Phone, MapPin } from "lucide-react";

export const Footer: React.FC = () => {
  return (
    <footer className="bg-[#1f0b07] text-[#dab38c] py-12 border-t border-[#dab38c]/15 text-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Main Clean Row */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 pb-8 border-b border-[#dab38c]/15">
          {/* Logo & One-Liner */}
          <div className="space-y-2 max-w-sm">
            <Link to="/" className="group inline-flex" aria-label="MatsyaMart home">
              <BrandLogo className="h-8 w-auto transition-opacity group-hover:opacity-80" />
            </Link>
            <p className="text-[11px] text-[#dab38c]/80 leading-relaxed">
              Curated coastal experiences and goods, rooted in coastal communities heritage.
            </p>
          </div>

          {/* Quick Links: Goods, Food, Walks, Workshops, Portals */}
          <div className="flex flex-wrap items-center gap-6 text-xs text-[#dab38c]">
            <a
              href="/#goods"
              className="hover:text-[#e3a157] transition-colors"
            >
              Goods
            </a>
            <a href="/#food" className="hover:text-[#e3a157] transition-colors">
              Food
            </a>
            <a
              href="/#walks"
              className="hover:text-[#e3a157] transition-colors"
            >
              Walks
            </a>
            <a
              href="/#workshops"
              className="hover:text-[#e3a157] transition-colors"
            >
              Workshops
            </a>
            <Link
              to="/track"
              className="hover:text-[#e3a157] transition-colors text-[#e3a157] font-medium"
            >
              Track Order / Passes
            </Link>
            <Link
              to="/host-with-us"
              className="hover:text-[#e3a157] transition-colors"
            >
              Share Offering
            </Link>
            <Link
              to="/host"
              className="hover:text-[#e3a157] transition-colors"
            >
              Host Check-In
            </Link>
            <Link
              to="/admin"
              className="hover:text-[#e3a157] transition-colors"
            >
              Coordinator Portal
            </Link>
            <a
              href="https://bhoomiputra.org"
              target="_blank"
              rel="noreferrer"
              className="text-[#e3a157] hover:underline font-medium"
            >
              Bhoomiputra Foundation ↗
            </a>
          </div>
        </div>

        {/* Razorpay Legal & Customer Protection Policies */}
        <div className="py-4 border-b border-[#dab38c]/15">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-2 text-xs font-semibold text-[#f5edeb] uppercase tracking-wider">
              <ShieldCheck className="h-4 w-4 text-[#e3a157]" />
              <span>Customer Protection &amp; Legal Policies</span>
            </div>
            <nav
              aria-label="Legal Policies"
              className="flex flex-wrap items-center gap-x-6 gap-y-2 text-xs"
            >
              <Link
                to="/terms"
                className="text-[#dab38c]/90 hover:text-[#e3a157] underline-offset-4 hover:underline transition-colors flex items-center gap-1.5"
              >
                <FileText className="h-3 w-3 text-[#dab38c]/60" />
                <span>Terms &amp; Conditions</span>
              </Link>
              <Link
                to="/privacy"
                className="text-[#dab38c]/90 hover:text-[#e3a157] underline-offset-4 hover:underline transition-colors flex items-center gap-1.5"
              >
                <ShieldCheck className="h-3 w-3 text-[#dab38c]/60" />
                <span>Privacy Policy</span>
              </Link>
              <Link
                to="/refund-policy"
                className="text-[#dab38c]/90 hover:text-[#e3a157] underline-offset-4 hover:underline transition-colors flex items-center gap-1.5"
              >
                <RotateCcw className="h-3 w-3 text-[#dab38c]/60" />
                <span>Cancellation &amp; Refund</span>
              </Link>
              <Link
                to="/shipping-policy"
                className="text-[#dab38c]/90 hover:text-[#e3a157] underline-offset-4 hover:underline transition-colors flex items-center gap-1.5"
              >
                <Truck className="h-3 w-3 text-[#dab38c]/60" />
                <span>Shipping &amp; Delivery</span>
              </Link>
              <Link
                to="/contact"
                className="text-[#dab38c]/90 hover:text-[#e3a157] underline-offset-4 hover:underline transition-colors flex items-center gap-1.5"
              >
                <Phone className="h-3 w-3 text-[#dab38c]/60" />
                <span>Contact Us</span>
              </Link>
            </nav>
          </div>
        </div>

        {/* Merchant Legal Identity & Registered Address */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 py-2 text-[11px] text-[#dab38c]/75">
          <div className="space-y-1">
            <p className="font-medium text-[#f5edeb]">Operating Merchant Entity</p>
            <p className="leading-relaxed">
              <strong className="text-[#dab38c]">Kolibaba Seafood Inc.</strong> (Brand: MatsyaMart)
            </p>
            <p className="text-[10px] text-[#dab38c]/60">
              Community initiative partner: Bhoomiputra Foundation (Regd. Public Trust No. F-72299)
            </p>
            <p className="text-[10px] font-mono text-[#dab38c]/70">
              GSTIN: 27ABBFK9637R1ZF (Maharashtra)
            </p>
          </div>

          <div className="space-y-1">
            <p className="font-medium text-[#f5edeb] flex items-center gap-1">
              <MapPin className="h-3 w-3 text-[#e3a157]" />
              <span>Registered Office</span>
            </p>
            <p className="leading-relaxed text-[10px]">
              101, Samudra Darshan, Budha Lane 2, Versova, Andheri West, Mumbai, Maharashtra - 400061, India.
            </p>
            <p className="text-[10px] text-[#dab38c]/60">
              Jurisdiction: High Court of Judicature at Bombay, Mumbai.
            </p>
          </div>

          <div className="space-y-1">
            <p className="font-medium text-[#f5edeb] flex items-center gap-1">
              <Phone className="h-3 w-3 text-[#e3a157]" />
              <span>Customer Support &amp; Grievances</span>
            </p>
            <p className="leading-relaxed text-[10px]">
              Email:{" "}
              <a href="mailto:hello@matsyamart.com" className="text-[#e3a157] hover:underline">
                hello@matsyamart.com
              </a>
            </p>
            <p className="leading-relaxed text-[10px]">
              Helpline:{" "}
              <a
                href="https://wa.me/917666511511"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#25D366] hover:underline font-mono"
              >
                +91 76665 11511
              </a>{" "}
              (7:00 AM to 8:00 PM IST)
            </p>
            <p className="text-[10px] text-[#dab38c]/60">
              Online Payments processed securely via Razorpay (PCI-DSS Level 1 compliant).
            </p>
          </div>
        </div>

        {/* Bottom Attribution & Cookie Banner Trigger */}
        <div className="flex flex-col sm:flex-row items-center justify-between text-[11px] text-[#dab38c]/60 gap-3 pt-4 border-t border-[#dab38c]/10">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span>© 2026 MatsyaMart · Rooted in coastal communities heritage · All rights reserved.</span>
          </div>

          <div className="flex items-center gap-4 text-[#dab38c]/70">
            <button
              onClick={() =>
                window.dispatchEvent(new Event("matsyamart_open_cookie_banner"))
              }
              className="hover:text-[#f5edeb] underline underline-offset-2 cursor-pointer transition-colors"
            >
              Cookie Preferences (DPDP)
            </button>
            <span>•</span>
            <span className="hover:text-[#f5edeb]">
              Tidal &amp; Weather Safety
            </span>
            <span>•</span>
            <a
              href="mailto:hello@matsyamart.com"
              className="hover:text-[#e3a157] transition-colors"
            >
              hello@matsyamart.com
            </a>
            <span>•</span>
            <a
              href="https://wa.me/917666511511"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-[#25D366] transition-colors"
            >
              WhatsApp: +91 76665 11511
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};
