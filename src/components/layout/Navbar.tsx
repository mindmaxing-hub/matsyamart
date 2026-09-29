import React, { useState } from "react";
import { useRouterState } from "@tanstack/react-router";
import { Link } from "../ui/Link";
import { ShoppingBag, Menu, X, Anchor, Plus } from "lucide-react";
import { useCart } from "../../context/CartContext";

export const Navbar: React.FC = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { totalItemsCount, setIsCartOpen } = useCart();

  let currentPath = "/";
  try {
    const routerState = useRouterState();
    currentPath = routerState?.location?.pathname || "/";
  } catch {
    if (typeof window !== "undefined") {
      currentPath = window.location.pathname;
    }
  }

  const isActive = (path: string) => currentPath === path;

  return (
    <header className="sticky top-0 z-50 bg-[#004A63]/90 backdrop-blur-md border-b border-white/10 text-white transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand Logo with Bhoomiputra Official Mark */}
        <Link to="/" className="flex items-center gap-3 group">
          <img
            src="/bhoomiputra-mark.png"
            alt="Bhoomiputra Foundation"
            className="w-8 h-8 object-contain group-hover:scale-105 transition-transform"
          />
          <div className="flex flex-col">
            <div className="flex items-center gap-1.5">
              <span className="font-display font-bold text-lg text-white tracking-tight leading-none">
                matsyamart
              </span>
              <span className="text-sun-300 font-bold text-sm leading-none">
                ✦
              </span>
            </div>
            <span className="text-[9px] uppercase tracking-wider text-ocean-200 font-semibold leading-tight">
              Bhoomiputra Foundation
            </span>
          </div>
        </Link>

        {/* Desktop 4-Pillar Links (Luma Style) */}
        <nav className="hidden md:flex items-center gap-1 bg-white/5 border border-white/10 rounded-full px-3 py-1">
          <a
            href="/#walks"
            className="text-xs font-medium px-3 py-1 rounded-full text-slate-300 hover:text-white hover:bg-white/10 transition-colors"
          >
            Walks
          </a>
          <a
            href="/#workshops"
            className="text-xs font-medium px-3 py-1 rounded-full text-slate-300 hover:text-white hover:bg-white/10 transition-colors"
          >
            Workshops
          </a>
          <a
            href="/#food"
            className="text-xs font-medium px-3 py-1 rounded-full text-slate-300 hover:text-white hover:bg-white/10 transition-colors"
          >
            Food
          </a>
          <a
            href="/#goods"
            className="text-xs font-medium px-3 py-1 rounded-full text-slate-300 hover:text-white hover:bg-white/10 transition-colors"
          >
            Goods
          </a>
        </nav>

        {/* Right Actions: Cart + + Submit Experience Button */}
        <div className="flex items-center gap-3">
          {/* Cart Icon */}
          <button
            onClick={() => setIsCartOpen(true)}
            className="p-2 text-slate-300 hover:text-white hover:bg-white/10 rounded-full transition-colors relative"
            title="Open Cart"
            aria-label="Cart"
          >
            <ShoppingBag className="w-4 h-4" />
            {totalItemsCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-sun-300 text-ocean-950 font-bold text-[10px] rounded-full flex items-center justify-center animate-pulse">
                {totalItemsCount}
              </span>
            )}
          </button>

          {/* + Submit Experience Pill (Luma Style) */}
          <Link
            to="/host-with-us"
            className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold bg-white text-ocean-950 hover:bg-slate-100 transition-colors shadow-xs"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Submit Experience</span>
          </Link>

          {/* Mobile Menu Trigger */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 text-slate-400 hover:text-white rounded-lg hover:bg-white/10"
            aria-label="Toggle Navigation"
          >
            {mobileMenuOpen ? (
              <X className="w-5 h-5" />
            ) : (
              <Menu className="w-5 h-5" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-[#003B4F] border-b border-white/10 px-4 py-4 space-y-3">
          <div className="grid grid-cols-2 gap-2 pb-3 border-b border-white/10">
            <a
              href="/#walks"
              onClick={() => setMobileMenuOpen(false)}
              className="px-3 py-2 text-xs font-semibold text-slate-300 hover:text-white bg-white/5 rounded-xl text-center"
            >
              🚶 Walks
            </a>
            <a
              href="/#workshops"
              onClick={() => setMobileMenuOpen(false)}
              className="px-3 py-2 text-xs font-semibold text-slate-300 hover:text-white bg-white/5 rounded-xl text-center"
            >
              🛠️ Workshops
            </a>
            <a
              href="/#food"
              onClick={() => setMobileMenuOpen(false)}
              className="px-3 py-2 text-xs font-semibold text-slate-300 hover:text-white bg-white/5 rounded-xl text-center"
            >
              🍲 Food
            </a>
            <a
              href="/#goods"
              onClick={() => setMobileMenuOpen(false)}
              className="px-3 py-2 text-xs font-semibold text-slate-300 hover:text-white bg-white/5 rounded-xl text-center"
            >
              🧺 Goods
            </a>
          </div>

          <Link
            to="/host-with-us"
            onClick={() => setMobileMenuOpen(false)}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-sun-300 text-ocean-950 font-bold text-xs shadow-xs"
          >
            <Plus className="w-4 h-4" />
            <span>Submit an Experience or Craft</span>
          </Link>
        </div>
      )}
    </header>
  );
};
