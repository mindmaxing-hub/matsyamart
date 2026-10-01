import React, { useState } from "react";
import { useRouterState } from "@tanstack/react-router";
import { Link } from "../ui/Link";
import { ShoppingBag, Heart, Menu, X, Plus } from "lucide-react";
import { useCart } from "../../context/CartContext";
import { useWishlist } from "../../context/WishlistContext";

export const Navbar: React.FC = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { totalItemsCount, setIsCartOpen } = useCart();
  const { wishlistCount, setIsWishlistOpen } = useWishlist();

  let currentPath = "/";
  try {
    const routerState = useRouterState();
    currentPath = routerState?.location?.pathname || "/";
  } catch {
    if (typeof window !== "undefined") {
      currentPath = window.location.pathname;
    }
  }

  return (
    <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-slate-200/80 text-slate-900 transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Minimal Wordmark */}
        <Link to="/" className="flex items-center gap-1.5 group">
          <span className="font-display font-bold text-xl text-slate-900 tracking-tight leading-none group-hover:text-amber-700 transition-colors">
            MatsyaMart
          </span>
          <span className="text-[#e3a157] font-bold text-lg leading-none">
            ✦
          </span>
        </Link>

        {/* Desktop 4-Pillar Links */}
        <nav className="hidden md:flex items-center gap-1 bg-slate-100/80 border border-slate-200/70 rounded-full px-3 py-1">
          <a
            href="/#walks"
            className="text-xs font-medium px-3 py-1 rounded-full text-slate-600 hover:text-slate-900 hover:bg-white transition-colors"
          >
            Walks
          </a>
          <a
            href="/#workshops"
            className="text-xs font-medium px-3 py-1 rounded-full text-slate-600 hover:text-slate-900 hover:bg-white transition-colors"
          >
            Workshops
          </a>
          <a
            href="/#food"
            className="text-xs font-medium px-3 py-1 rounded-full text-slate-600 hover:text-slate-900 hover:bg-white transition-colors"
          >
            Food
          </a>
          <a
            href="/#goods"
            className="text-xs font-medium px-3 py-1 rounded-full text-slate-600 hover:text-slate-900 hover:bg-white transition-colors"
          >
            Goods
          </a>
        </nav>

        {/* Right Actions: Wishlist + Cart + Submit Experience Button */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Wishlist Icon */}
          <button
            onClick={() => setIsWishlistOpen(true)}
            className="p-2 text-slate-600 hover:text-rose-600 hover:bg-slate-100 rounded-full transition-colors relative cursor-pointer"
            title="Saved Wishlist"
            aria-label="Wishlist"
          >
            <Heart className="w-4 h-4 text-slate-800 hover:text-rose-600 transition-colors" />
            {wishlistCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-rose-500 text-white font-bold text-[10px] rounded-full flex items-center justify-center shadow-xs">
                {wishlistCount}
              </span>
            )}
          </button>

          {/* Cart Icon */}
          <button
            onClick={() => setIsCartOpen(true)}
            className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-full transition-colors relative cursor-pointer"
            title="Open Cart"
            aria-label="Cart"
          >
            <ShoppingBag className="w-4 h-4 text-slate-800" />
            {totalItemsCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-amber-500 text-slate-950 font-bold text-[10px] rounded-full flex items-center justify-center shadow-xs">
                {totalItemsCount}
              </span>
            )}
          </button>

          {/* + Submit Experience Pill */}
          <Link
            to="/host-with-us"
            className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold bg-slate-900 text-white hover:bg-black transition-colors shadow-xs"
          >
            <Plus className="w-3.5 h-3.5 text-white" />
            <span>Submit Experience</span>
          </Link>

          {/* Mobile Menu Trigger */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 text-slate-600 hover:text-slate-900 rounded-lg hover:bg-slate-100 cursor-pointer"
            aria-label="Toggle Navigation"
          >
            {mobileMenuOpen ? (
              <X className="w-5 h-5 text-slate-900" />
            ) : (
              <Menu className="w-5 h-5 text-slate-900" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white border-b border-slate-200 px-4 py-4 space-y-3 shadow-lg">
          <div className="grid grid-cols-2 gap-2 pb-3 border-b border-slate-100">
            <a
              href="/#walks"
              onClick={() => setMobileMenuOpen(false)}
              className="px-3 py-2 text-xs font-semibold text-slate-700 hover:text-slate-900 bg-slate-100 rounded-xl text-center hover:bg-slate-200/70 transition-colors"
            >
              🚶 Walks
            </a>
            <a
              href="/#workshops"
              onClick={() => setMobileMenuOpen(false)}
              className="px-3 py-2 text-xs font-semibold text-slate-700 hover:text-slate-900 bg-slate-100 rounded-xl text-center hover:bg-slate-200/70 transition-colors"
            >
              🛠️ Workshops
            </a>
            <a
              href="/#food"
              onClick={() => setMobileMenuOpen(false)}
              className="px-3 py-2 text-xs font-semibold text-slate-700 hover:text-slate-900 bg-slate-100 rounded-xl text-center hover:bg-slate-200/70 transition-colors"
            >
              🍲 Food
            </a>
            <a
              href="/#goods"
              onClick={() => setMobileMenuOpen(false)}
              className="px-3 py-2 text-xs font-semibold text-slate-700 hover:text-slate-900 bg-slate-100 rounded-xl text-center hover:bg-slate-200/70 transition-colors"
            >
              🧺 Goods
            </a>
          </div>

          <Link
            to="/host-with-us"
            onClick={() => setMobileMenuOpen(false)}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-black text-white font-bold text-xs shadow-xs transition-colors"
          >
            <Plus className="w-4 h-4 text-white" />
            <span>Submit an Experience or Craft</span>
          </Link>
        </div>
      )}
    </header>
  );
};
