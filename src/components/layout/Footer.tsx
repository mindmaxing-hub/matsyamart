import React from "react";
import { Link } from "../ui/Link";
import { Anchor, Heart } from "lucide-react";

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
              Curated experiential tours and artisanal goods supporting coastal
              communities across Mumbai and Konkan.
            </p>
          </div>

          {/* Quick Links */}
          <div className="flex flex-wrap items-center gap-6 text-xs text-[#dab38c]">
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
            <a href="/#food" className="hover:text-[#e3a157] transition-colors">
              Food & Feasts
            </a>
            <a
              href="/#goods"
              className="hover:text-[#e3a157] transition-colors"
            >
              Artisan Goods
            </a>
            <Link
              to="/host-with-us"
              className="hover:text-[#e3a157] transition-colors"
            >
              Partner With Us
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
              className="text-[#e3a157] hover:underline"
            >
              Bhoomiputra Foundation ↗
            </a>
          </div>
        </div>

        {/* Bottom Attribution */}
        <div className="flex flex-col sm:flex-row items-center justify-between text-[11px] text-[#dab38c]/60 gap-3">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span>© 2026 MatsyaMart. Operated in partnership with</span>
            <span className="text-[#dab38c] font-medium">
              Bhoomiputra Foundation
            </span>
            <span>• Built with</span>
            <Heart className="w-3 h-3 text-[#e3a157] inline" />
            <span>for coastal communities.</span>
          </div>

          <div className="flex items-center gap-4 text-[#dab38c]/70">
            <span className="hover:text-[#f5edeb] cursor-pointer">
              Community Charter
            </span>
            <span>•</span>
            <span className="hover:text-[#f5edeb] cursor-pointer">
              Tidal & Weather Safety
            </span>
            <span>•</span>
            <span>WhatsApp: +91 98201 44512</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
