import React from "react";
import { Link } from "../ui/Link";
import { Anchor, Heart } from "lucide-react";

export const Footer: React.FC = () => {
  return (
    <footer className="bg-slate-50 text-slate-600 py-12 border-t border-slate-200 text-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Main Clean Row (Lu.ma Style) */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 pb-8 border-b border-slate-200">
          {/* Logo & One-Liner */}
          <div className="space-y-2 max-w-sm">
            <Link to="/" className="flex items-center gap-2 group">
              <div className="w-6 h-6 rounded-md bg-amber-50 border border-amber-300/60 flex items-center justify-center text-[#e3a157] font-bold text-xs shadow-xs group-hover:border-amber-400 transition-colors">
                ✦
              </div>
              <span className="font-display font-bold text-lg text-slate-900 group-hover:text-amber-700 transition-colors">
                MatsyaMart<span className="text-[#e3a157]">✦</span>
              </span>
            </Link>
            <p className="text-[11px] text-slate-500 leading-relaxed">
              Curated experiential tours and artisanal goods supporting coastal
              communities across Mumbai and Konkan.
            </p>
          </div>

          {/* Quick Links */}
          <div className="flex flex-wrap items-center gap-6 text-xs text-slate-600">
            <a
              href="/#walks"
              className="hover:text-slate-900 transition-colors"
            >
              Walks
            </a>
            <a
              href="/#workshops"
              className="hover:text-slate-900 transition-colors"
            >
              Workshops
            </a>
            <a href="/#food" className="hover:text-slate-900 transition-colors">
              Food &amp; Feasts
            </a>
            <a
              href="/#goods"
              className="hover:text-slate-900 transition-colors"
            >
              Artisan Goods
            </a>
            <Link
              to="/host-with-us"
              className="hover:text-slate-900 transition-colors"
            >
              Partner With Us
            </Link>
            <Link
              to="/admin"
              className="hover:text-slate-900 transition-colors"
            >
              Coordinator Portal
            </Link>
            <a
              href="https://bhoomiputra.org"
              target="_blank"
              rel="noreferrer"
              className="text-amber-700 hover:text-amber-800 hover:underline font-medium"
            >
              Bhoomiputra Foundation ↗
            </a>
          </div>
        </div>

        {/* Bottom Attribution */}
        <div className="flex flex-col sm:flex-row items-center justify-between text-[11px] text-slate-500 gap-3">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span>© 2026 MatsyaMart. Operated in partnership with</span>
            <span className="text-slate-700 font-medium">
              Bhoomiputra Foundation
            </span>
            <span>• Built with</span>
            <Heart className="w-3 h-3 text-[#e3a157] inline" />
            <span>for coastal communities.</span>
          </div>

          <div className="flex items-center gap-4 text-slate-500">
            <button
              onClick={() =>
                window.dispatchEvent(new Event("matsyamart_open_cookie_banner"))
              }
              className="hover:text-slate-800 underline underline-offset-2 cursor-pointer transition-colors"
            >
              Cookie Preferences (DPDP)
            </button>
            <span>•</span>
            <span className="hover:text-slate-800 cursor-pointer">
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
