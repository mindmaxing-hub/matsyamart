import React, { useState } from "react";
import { Link } from "../ui/Link";
import { ShoppingBag, Heart, Menu, X, Plus, Ticket } from "lucide-react";
import { useCart } from "../../context/CartContext";
import { useWishlist } from "../../context/WishlistContext";
import { BrandLogo } from "../site/BrandLogo";

export const Navbar: React.FC = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { totalItemsCount, setIsCartOpen } = useCart();
  const { wishlistCount, setIsWishlistOpen } = useWishlist();

  return (
    <header className="sticky top-0 z-50 bg-[#29100b]/90 backdrop-blur-md border-b border-[#dab38c]/20 text-[#f5edeb] transition-all">
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Official Wordmark */}
        <Link to="/" className="group shrink-0" aria-label="MatsyaMart home">
          <BrandLogo
            variant="white"
            eager
            className="h-7 w-auto transition-opacity group-hover:opacity-80 sm:h-8"
          />
        </Link>

        {/* Desktop 4-Pillar Links — Goods → Food → Walks → Workshops */}
        <nav className="hidden lg:flex items-center gap-1 bg-[#35160e]/80 border border-[#dab38c]/20 rounded-full px-3 py-1 lg:absolute lg:left-1/2 lg:-translate-x-1/2">
          <a
            href="/#goods"
            className="text-xs font-medium px-3 py-1 rounded-full text-[#dab38c] hover:text-[#f5edeb] hover:bg-[#481f14] transition-colors"
          >
            Goods
          </a>
          <a
            href="/#food"
            className="text-xs font-medium px-3 py-1 rounded-full text-[#dab38c] hover:text-[#f5edeb] hover:bg-[#481f14] transition-colors"
          >
            Food
          </a>
          <a
            href="/#walks"
            className="text-xs font-medium px-3 py-1 rounded-full text-[#dab38c] hover:text-[#f5edeb] hover:bg-[#481f14] transition-colors"
          >
            Walks
          </a>
          <a
            href="/#workshops"
            className="text-xs font-medium px-3 py-1 rounded-full text-[#dab38c] hover:text-[#f5edeb] hover:bg-[#481f14] transition-colors"
          >
            Workshops
          </a>
        </nav>

        {/* Right Actions */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Desktop Only 3 Actions: Track Passes + Wishlist + Cart */}
          <div className="hidden lg:flex items-center gap-1 sm:gap-2">
            {/* Track Passes Icon (Just left to Wishlist) */}
            <Link
              to="/track"
              className="p-2 text-[#dab38c] hover:text-[#f5edeb] hover:bg-[#35160e] rounded-full transition-colors relative cursor-pointer group"
              title="Track Passes & Orders"
              aria-label="Track Passes & Orders"
            >
              <Ticket className="w-4 h-4 text-[#dab38c] group-hover:text-[#f5edeb] transition-colors" />
            </Link>

            {/* Wishlist Icon */}
            <button
              onClick={() => setIsWishlistOpen(true)}
              className="p-2 text-[#dab38c] hover:text-[#f5edeb] hover:bg-[#35160e] rounded-full transition-colors relative cursor-pointer"
              title="Saved Wishlist"
              aria-label="Wishlist"
            >
              <Heart className="w-4 h-4 text-[#dab38c] hover:text-[#f5edeb] transition-colors" />
              {wishlistCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-[#e3a157] text-[#29100b] font-bold text-[10px] rounded-full flex items-center justify-center shadow-xs">
                  {wishlistCount}
                </span>
              )}
            </button>

            {/* Cart Icon */}
            <button
              onClick={() => setIsCartOpen(true)}
              className="p-2 text-[#dab38c] hover:text-[#f5edeb] hover:bg-[#35160e] rounded-full transition-colors relative cursor-pointer"
              title="Open Cart"
              aria-label="Cart"
            >
              <ShoppingBag className="w-4 h-4 text-[#dab38c] hover:text-[#f5edeb] transition-colors" />
              {totalItemsCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-[#e3a157] text-[#29100b] font-bold text-[10px] rounded-full flex items-center justify-center shadow-xs">
                  {totalItemsCount}
                </span>
              )}
            </button>
          </div>

          {/* + Submit Experience Pill */}
          <Link
            to="/host-with-us"
            className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold bg-[#f5edeb] hover:bg-[#dab38c] text-[#29100b] transition-colors shadow-xs"
          >
            <Plus className="w-3.5 h-3.5 text-[#29100b]" />
            <span>Share Offering</span>
          </Link>

          {/* Mobile & Tablet Menu Trigger */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 text-[#dab38c] hover:text-[#f5edeb] rounded-lg hover:bg-[#35160e] cursor-pointer relative"
            aria-label="Toggle Navigation"
          >
            {mobileMenuOpen ? (
              <X className="w-5 h-5 text-[#f5edeb]" />
            ) : (
              <Menu className="w-5 h-5 text-[#f5edeb]" />
            )}
            {!mobileMenuOpen && (totalItemsCount > 0 || wishlistCount > 0) && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[#e3a157] ring-2 ring-[#29100b]" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile & Tablet Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-[#29100b] border-b border-[#dab38c]/20 px-4 py-4 space-y-4 shadow-2xl">
          {/* 3 Dedicated Action Cards: Track Passes, Wishlist, My Bag */}
          <div className="grid grid-cols-3 gap-2 pb-3 border-b border-[#dab38c]/15">
            {/* 1. Track Passes */}
            <Link
              to="/track"
              onClick={() => setMobileMenuOpen(false)}
              className="flex flex-col items-center justify-center gap-1.5 p-2.5 rounded-2xl bg-[#35160e] hover:bg-[#481f14] text-[#dab38c] hover:text-[#f5edeb] border border-[#dab38c]/15 transition-all text-center group cursor-pointer"
            >
              <Ticket className="w-5 h-5 text-[#e3a157] group-hover:scale-110 transition-transform" />
              <span className="text-[11px] font-semibold leading-tight">Track Passes</span>
            </Link>

            {/* 2. Wishlist */}
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                setIsWishlistOpen(true);
              }}
              className="flex flex-col items-center justify-center gap-1.5 p-2.5 rounded-2xl bg-[#35160e] hover:bg-[#481f14] text-[#dab38c] hover:text-[#f5edeb] border border-[#dab38c]/15 transition-all text-center relative group cursor-pointer"
            >
              <div className="relative">
                <Heart className="w-5 h-5 text-[#e3a157] group-hover:scale-110 transition-transform" />
                {wishlistCount > 0 && (
                  <span className="absolute -top-1.5 -right-2 w-4 h-4 bg-[#e3a157] text-[#29100b] font-bold text-[10px] rounded-full flex items-center justify-center shadow-xs">
                    {wishlistCount}
                  </span>
                )}
              </div>
              <span className="text-[11px] font-semibold leading-tight">Wishlist</span>
            </button>

            {/* 3. Cart / Bag */}
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                setIsCartOpen(true);
              }}
              className="flex flex-col items-center justify-center gap-1.5 p-2.5 rounded-2xl bg-[#35160e] hover:bg-[#481f14] text-[#dab38c] hover:text-[#f5edeb] border border-[#dab38c]/15 transition-all text-center relative group cursor-pointer"
            >
              <div className="relative">
                <ShoppingBag className="w-5 h-5 text-[#e3a157] group-hover:scale-110 transition-transform" />
                {totalItemsCount > 0 && (
                  <span className="absolute -top-1.5 -right-2 w-4 h-4 bg-[#e3a157] text-[#29100b] font-bold text-[10px] rounded-full flex items-center justify-center shadow-xs">
                    {totalItemsCount}
                  </span>
                )}
              </div>
              <span className="text-[11px] font-semibold leading-tight">My Bag</span>
            </button>
          </div>

          {/* 4 Pillars Navigation */}
          <div className="space-y-1.5">
            <div className="text-[10px] font-bold uppercase tracking-wider text-[#dab38c]/60 px-1">
              Explore Offerings
            </div>
            <div className="grid grid-cols-2 gap-2">
              <a
                href="/#goods"
                onClick={() => setMobileMenuOpen(false)}
                className="px-3 py-2 text-xs font-semibold text-[#f5edeb] hover:text-[#e3a157] bg-[#35160e] rounded-xl text-center hover:bg-[#481f14] transition-colors"
              >
                Goods
              </a>
              <a
                href="/#food"
                onClick={() => setMobileMenuOpen(false)}
                className="px-3 py-2 text-xs font-semibold text-[#f5edeb] hover:text-[#e3a157] bg-[#35160e] rounded-xl text-center hover:bg-[#481f14] transition-colors"
              >
                Food
              </a>
              <a
                href="/#walks"
                onClick={() => setMobileMenuOpen(false)}
                className="px-3 py-2 text-xs font-semibold text-[#f5edeb] hover:text-[#e3a157] bg-[#35160e] rounded-xl text-center hover:bg-[#481f14] transition-colors"
              >
                Walks
              </a>
              <a
                href="/#workshops"
                onClick={() => setMobileMenuOpen(false)}
                className="px-3 py-2 text-xs font-semibold text-[#f5edeb] hover:text-[#e3a157] bg-[#35160e] rounded-xl text-center hover:bg-[#481f14] transition-colors"
              >
                Workshops
              </a>
            </div>
          </div>

          {/* Share Offering */}
          <Link
            to="/host-with-us"
            onClick={() => setMobileMenuOpen(false)}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#f5edeb] hover:bg-[#dab38c] text-[#29100b] font-bold text-xs shadow-xs transition-colors"
          >
            <Plus className="w-4 h-4 text-[#29100b]" />
            <span>Share Your Offering</span>
          </Link>
        </div>
      )}
    </header>
  );
};
