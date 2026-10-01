import React from "react";
import { X, Heart, Trash2, ShoppingBag, ArrowRight } from "lucide-react";
import { useWishlist } from "../../context/WishlistContext";
import { useCart } from "../../context/CartContext";
import { formatINR } from "../../lib/utils";
import { Link } from "../ui/Link";
import { Listing } from "../../types";

export const WishlistDrawer: React.FC = () => {
  const {
    wishlistItems,
    isWishlistOpen,
    setIsWishlistOpen,
    removeFromWishlist,
    clearWishlist,
  } = useWishlist();
  const { addItem } = useCart();

  if (!isWishlistOpen) return null;

  const handleMoveToCart = (item: Listing) => {
    addItem(item, 1);
    removeFromWishlist(item.id);
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 transition-opacity"
        onClick={() => setIsWishlistOpen(false)}
      />

      {/* Drawer */}
      <div className="fixed inset-y-0 right-0 max-w-full flex z-50">
        <div className="w-screen max-w-md bg-[#29100b] text-[#f5edeb] shadow-2xl flex flex-col border-l border-[#dab38c]/20">
          {/* Header */}
          <div className="p-5 border-b border-[#dab38c]/15 flex items-center justify-between bg-[#1f0b07]">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-[#35160e] text-rose-400 flex items-center justify-center border border-[#dab38c]/30">
                <Heart className="w-4 h-4 fill-rose-400 text-rose-400" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="font-display font-bold text-lg text-[#f5edeb]">
                    Saved Wishlist
                  </h2>
                  <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-rose-500/20 text-rose-300 border border-rose-500/30">
                    {wishlistItems.length}
                  </span>
                </div>
                <p className="text-xs text-[#dab38c]">
                  Guest wishlist • Saved on your device
                </p>
              </div>
            </div>
            <button
              onClick={() => setIsWishlistOpen(false)}
              className="p-2 text-[#dab38c] hover:text-[#f5edeb] rounded-lg hover:bg-[#35160e] transition-colors cursor-pointer"
              aria-label="Close wishlist"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Items List */}
          <div className="flex-1 overflow-y-auto p-5 divide-y divide-[#dab38c]/10">
            {wishlistItems.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-8 text-[#dab38c]">
                <div className="w-16 h-16 rounded-full bg-[#35160e] flex items-center justify-center mb-3 border border-[#dab38c]/20">
                  <Heart className="w-8 h-8 text-[#dab38c]/40" />
                </div>
                <h3 className="font-display font-semibold text-[#f5edeb] text-lg">
                  Your wishlist is empty
                </h3>
                <p className="text-xs text-[#dab38c]/80 mt-1 max-w-xs">
                  Tap the heart icon on any trail, workshop, or artisanal goods
                  to save it for later without creating an account.
                </p>
                <button
                  onClick={() => setIsWishlistOpen(false)}
                  className="mt-5 px-5 py-2.5 text-xs font-semibold text-[#29100b] bg-[#f5edeb] hover:bg-[#dab38c] rounded-xl transition-colors cursor-pointer shadow-md"
                >
                  Explore Catalog
                </button>
              </div>
            ) : (
              wishlistItems.map((listing) => {
                const isExperience = listing.type === "experience";
                const detailUrl = isExperience
                  ? `/experience/${listing.slug}`
                  : `/product/${listing.slug}`;

                return (
                  <div
                    key={listing.id}
                    className="py-4 flex gap-3.5 first:pt-0 last:pb-0"
                  >
                    <Link
                      to={detailUrl}
                      onClick={() => setIsWishlistOpen(false)}
                      className="shrink-0"
                    >
                      <img
                        src={listing.images[0]}
                        alt={listing.title}
                        className="w-20 h-20 rounded-xl object-cover border border-[#dab38c]/20 hover:opacity-90 transition-opacity"
                      />
                    </Link>

                    <div className="flex-1 min-w-0 flex flex-col justify-between">
                      <div>
                        <div className="flex items-start justify-between gap-2">
                          <Link
                            to={detailUrl}
                            onClick={() => setIsWishlistOpen(false)}
                            className="text-sm font-semibold text-[#f5edeb] hover:text-[#e3a157] line-clamp-1 transition-colors"
                          >
                            {listing.title}
                          </Link>
                          <button
                            onClick={() => removeFromWishlist(listing.id)}
                            className="text-[#dab38c]/60 hover:text-rose-400 transition-colors p-1"
                            title="Remove from wishlist"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                        <p className="text-xs text-[#dab38c] mt-0.5 truncate">
                          {listing.location_name || listing.artisan_collective}
                        </p>
                      </div>

                      <div className="flex items-center justify-between mt-2 pt-1">
                        <span className="font-bold text-sm text-[#e3a157]">
                          {formatINR(listing.price_inr)}
                        </span>

                        {isExperience ? (
                          <Link
                            to={detailUrl}
                            onClick={() => setIsWishlistOpen(false)}
                            className="px-3 py-1.5 rounded-lg bg-[#e3a157] hover:bg-[#dab38c] text-[#29100b] text-xs font-semibold flex items-center gap-1 transition-colors"
                          >
                            <span>Book</span>
                            <ArrowRight className="w-3 h-3" />
                          </Link>
                        ) : (
                          <button
                            onClick={() => handleMoveToCart(listing)}
                            className="px-3 py-1.5 rounded-lg bg-[#e3a157] hover:bg-[#dab38c] text-[#29100b] text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer shadow-md"
                          >
                            <ShoppingBag className="w-3 h-3" />
                            <span>Move to Cart</span>
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Footer */}
          {wishlistItems.length > 0 && (
            <div className="p-5 border-t border-[#dab38c]/15 bg-[#1f0b07] space-y-3">
              <div className="flex items-center justify-between text-xs text-[#dab38c]">
                <span>
                  {wishlistItems.length} saved{" "}
                  {wishlistItems.length === 1 ? "item" : "items"}
                </span>
                <button
                  onClick={clearWishlist}
                  className="text-rose-400 hover:text-rose-300 font-medium cursor-pointer transition-colors"
                >
                  Clear all
                </button>
              </div>

              <div className="text-[11px] text-[#dab38c]/80 bg-[#35160e]/80 p-2.5 rounded-xl border border-[#dab38c]/20 leading-relaxed">
                <span className="font-semibold text-[#f5edeb]">
                  DPDP Act Compliant:
                </span>{" "}
                Saved items are stored on your local browser session and cookies
                without collecting personal data.
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
};
