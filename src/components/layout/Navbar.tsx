import React, { useState } from "react";
import { Link } from "../ui/Link";
import { ShoppingBag, Heart, Menu, X, Plus } from "lucide-react";
import { useCart } from "../../context/CartContext";
import { useWishlist } from "../../context/WishlistContext";

export const Navbar: React.FC = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { totalItemsCount, setIsCartOpen } = useCart();
  const { wishlistCount, setIsWishlistOpen } = useWishlist();

  return (
    <header className="sticky top-0 z-50 bg-[#29100b]/90 backdrop-blur-md border-b border-[#dab38c]/20 text-[#f5edeb] transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Minimal Wordmark */}
        <Link to="/" className="flex items-center gap-1.5 group">
          <span className="font-display font-bold text-xl text-[#f5edeb] tracking-tight leading-none group-hover:text-[#dab38c] transition-colors">
            MatsyaMart
          </span>
          <span className="text-[#e3a157] font-bold text-lg leading-none">
            ✦
          </span>
        </Link>

        {/* Desktop 4-Pillar Links */}
        <nav className="hidden md:flex items-center gap-1 bg-[#35160e]/80 border border-[#dab38c]/20 rounded-full px-3 py-1">
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
          <a
            href="/#food"
            className="text-xs font-medium px-3 py-1 rounded-full text-[#dab38c] hover:text-[#f5edeb] hover:bg-[#481f14] transition-colors"
          >
            Food
          </a>
          <a
            href="/#goods"
            className="text-xs font-medium px-3 py-1 rounded-full text-[#dab38c] hover:text-[#f5edeb] hover:bg-[#481f14] transition-colors"
          >
            Goods
          </a>
        </nav>

        {/* Right Actions: Wishlist + Cart + Submit Experience Button */}
        <div className="flex items-center gap-2 sm:gap-3">
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

          {/* + Submit Experience Pill */}
          <Link
            to="/host-with-us"
            className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold bg-[#f5edeb] hover:bg-[#dab38c] text-[#29100b] transition-colors shadow-xs"
          >
            <Plus className="w-3.5 h-3.5 text-[#29100b]" />
            <span>Submit Experience</span>
          </Link>

          {/* Mobile Menu Trigger */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 text-[#dab38c] hover:text-[#f5edeb] rounded-lg hover:bg-[#35160e] cursor-pointer"
            aria-label="Toggle Navigation"
          >
            {mobileMenuOpen ? (
              <X className="w-5 h-5 text-[#f5edeb]" />
            ) : (
              <Menu className="w-5 h-5 text-[#f5edeb]" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-[#29100b] border-b border-[#dab38c]/20 px-4 py-4 space-y-3 shadow-lg">
          <div className="grid grid-cols-2 gap-2 pb-3 border-b border-[#dab38c]/15">
            <a
              href="/#walks"
              onClick={() => setMobileMenuOpen(false)}
              className="px-3 py-2 text-xs font-semibold text-[#f5edeb] hover:text-[#e3a157] bg-[#35160e] rounded-xl text-center hover:bg-[#481f14] transition-colors"
            >
              🚶 Walks
            </a>
            <a
              href="/#workshops"
              onClick={() => setMobileMenuOpen(false)}
              className="px-3 py-2 text-xs font-semibold text-[#f5edeb] hover:text-[#e3a157] bg-[#35160e] rounded-xl text-center hover:bg-[#481f14] transition-colors"
            >
              🛠️ Workshops
            </a>
            <a
              href="/#food"
              onClick={() => setMobileMenuOpen(false)}
              className="px-3 py-2 text-xs font-semibold text-[#f5edeb] hover:text-[#e3a157] bg-[#35160e] rounded-xl text-center hover:bg-[#481f14] transition-colors"
            >
              🍲 Food
            </a>
            <a
              href="/#goods"
              onClick={() => setMobileMenuOpen(false)}
              className="px-3 py-2 text-xs font-semibold text-[#f5edeb] hover:text-[#e3a157] bg-[#35160e] rounded-xl text-center hover:bg-[#481f14] transition-colors"
            >
              🧺 Goods
            </a>
          </div>

          <Link
            to="/host-with-us"
            onClick={() => setMobileMenuOpen(false)}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#f5edeb] hover:bg-[#dab38c] text-[#29100b] font-bold text-xs shadow-xs transition-colors"
          >
            <Plus className="w-4 h-4 text-[#29100b]" />
            <span>Submit an Experience or Craft</span>
          </Link>
        </div>
      )}
    </header>
  );
};
