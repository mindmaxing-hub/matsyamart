import React from "react";
import { Link } from "../ui/Link";
import { Anchor, Heart } from "lucide-react";

export const Footer: React.FC = () => {
  return (
    <footer className="bg-[#001722] text-ocean-200 py-12 border-t border-white/10 text-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Main Clean Row (Lu.ma Style) */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 pb-8 border-b border-white/10">
          {/* Logo & One-Liner */}
          <div className="space-y-2 max-w-sm">
            <Link to="/" className="flex items-center gap-2.5">
              <img
                src="/bhoomiputra-mark.png"
                alt="Bhoomiputra Foundation"
                className="w-7 h-7 object-contain"
              />
              <span className="font-display font-bold text-lg text-white">
                matsyamart<span className="text-sun-300">✦</span>
              </span>
            </Link>
            <p className="text-[11px] text-ocean-200 leading-relaxed">
              Curated experiential tours and artisanal goods supporting coastal
              communities across Mumbai and Konkan.
            </p>
          </div>

          {/* Quick Links */}
          <div className="flex flex-wrap items-center gap-6 text-xs text-slate-300">
            <a href="/#walks" className="hover:text-sun-300 transition-colors">
              Walks
            </a>
            <a
              href="/#workshops"
              className="hover:text-sun-300 transition-colors"
            >
              Workshops
            </a>
            <a href="/#food" className="hover:text-sun-300 transition-colors">
              Food & Feasts
            </a>
            <a href="/#goods" className="hover:text-sun-300 transition-colors">
              Artisan Goods
            </a>
            <Link
              to="/host-with-us"
              className="hover:text-sun-300 transition-colors"
            >
              Partner With Us
            </Link>
            <Link to="/admin" className="hover:text-sun-300 transition-colors">
              Coordinator Portal
            </Link>
            <a
              href="https://bhoomiputra.org"
              target="_blank"
              rel="noreferrer"
              className="text-sun-300 hover:underline"
            >
              Bhoomiputra Foundation ↗
            </a>
          </div>
        </div>

        {/* Bottom Attribution */}
        <div className="flex flex-col sm:flex-row items-center justify-between text-[11px] text-slate-500 gap-3">
          <div className="flex items-center gap-1.5">
            <span>© 2026 MatsyaMart. Operated in partnership with</span>
            <span className="text-slate-300 font-medium">
              Bhoomiputra Foundation
            </span>
            <span>• Built with</span>
            <Heart className="w-3 h-3 text-rose-400 inline" />
            <span>for coastal communities.</span>
          </div>

          <div className="flex items-center gap-4 text-slate-400">
            <span className="hover:text-white cursor-pointer">
              Community Charter
            </span>
            <span>•</span>
            <span className="hover:text-white cursor-pointer">
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
