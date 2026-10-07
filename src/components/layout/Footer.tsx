import React from "react";
import { Link } from "../ui/Link";
import { Heart } from "lucide-react";

export const Footer: React.FC = () => {
  return (
    <footer className="bg-[#1f0b07] text-[#dab38c] py-12 border-t border-[#dab38c]/15 text-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Main Clean Row (Lu.ma Style) */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 pb-8 border-b border-[#dab38c]/15">
          {/* Logo & One-Liner */}
          <div className="space-y-2 max-w-sm">
            <Link to="/" className="flex items-center gap-2 group">
              <div className="w-6 h-6 rounded-md bg-[#35160e] border border-[#dab38c]/30 flex items-center justify-center text-[#e3a157] font-bold text-xs shadow-xs group-hover:border-[#e3a157]/60 transition-colors">
                ✦
              </div>
              <span className="font-display font-bold text-lg text-[#f5edeb] group-hover:text-[#dab38c] transition-colors">
                MatsyaMart<span className="text-[#e3a157]">✦</span>
              </span>
            </Link>
            <p className="text-[11px] text-[#dab38c]/80 leading-relaxed">
              Curated coastal experiences and goods, rooted in Koli fishing heritage.
            </p>
          </div>

          {/* Quick Links — Goods → Food → Walks → Workshops */}
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
              to="/host-with-us"
              className="hover:text-[#e3a157] transition-colors"
            >
              Share Offering
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

        {/* Bottom Attribution */}
        <div className="flex flex-col sm:flex-row items-center justify-between text-[11px] text-[#dab38c]/60 gap-3">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span>© 2026 MatsyaMart · Rooted in Koli fishing heritage ·</span>
            <span className="text-[#dab38c] font-medium">
              A Bhoomiputra Foundation initiative
            </span>
            <span>· Operated by</span>
            <span className="text-[#dab38c] font-medium">
              Kolibaba Seafood Inc
            </span>
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
            <span className="hover:text-[#f5edeb] cursor-pointer">
              Tidal &amp; Weather Safety
            </span>
            <span>•</span>
            <span>WhatsApp: +91 98201 44512</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
