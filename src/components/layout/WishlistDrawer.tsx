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
        className="fixed inset-0 bg-black/50 backdrop-blur-xs z-50 transition-opacity"
        onClick={() => setIsWishlistOpen(false)}
      />

      {/* Drawer */}
      <div className="fixed inset-y-0 right-0 max-w-full flex z-50">
        <div className="w-screen max-w-md bg-white text-slate-900 shadow-2xl flex flex-col border-l border-slate-200">
          {/* Header */}
          <div className="p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center border border-rose-200">
                <Heart className="w-4 h-4 fill-rose-500 text-rose-500" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="font-display font-bold text-lg text-slate-900">
                    Saved Wishlist
                  </h2>
                  <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-rose-100 text-rose-700">
                    {wishlistItems.length}
                  </span>
                </div>
                <p className="text-xs text-slate-500">
                  Guest wishlist • Saved on your device
                </p>
              </div>
            </div>
            <button
              onClick={() => setIsWishlistOpen(false)}
              className="p-2 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-200/60 transition-colors"
              aria-label="Close wishlist"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Items List */}
          <div className="flex-1 overflow-y-auto p-5 divide-y divide-slate-100">
            {wishlistItems.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-8 text-slate-500">
                <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mb-3">
                  <Heart className="w-8 h-8 text-slate-300" />
                </div>
                <h3 className="font-display font-semibold text-slate-900 text-lg">
                  Your wishlist is empty
                </h3>
                <p className="text-xs text-slate-500 mt-1 max-w-xs">
                  Tap the heart icon on any trail, workshop, or artisanal goods
                  to save it for later without creating an account.
                </p>
                <button
                  onClick={() => setIsWishlistOpen(false)}
                  className="mt-5 px-5 py-2.5 text-xs font-semibold text-white bg-slate-900 hover:bg-black rounded-xl transition-colors cursor-pointer shadow-xs"
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
                        className="w-20 h-20 rounded-xl object-cover border border-slate-200 hover:opacity-90 transition-opacity"
                      />
                    </Link>

                    <div className="flex-1 min-w-0 flex flex-col justify-between">
                      <div>
                        <div className="flex items-start justify-between gap-2">
                          <Link
                            to={detailUrl}
                            onClick={() => setIsWishlistOpen(false)}
                            className="text-sm font-semibold text-slate-900 hover:text-amber-800 line-clamp-1 transition-colors"
                          >
                            {listing.title}
                          </Link>
                          <button
                            onClick={() => removeFromWishlist(listing.id)}
                            className="text-slate-400 hover:text-rose-500 transition-colors p-1"
                            title="Remove from wishlist"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                        <p className="text-xs text-slate-500 mt-0.5 truncate">
                          {listing.location_name || listing.artisan_collective}
                        </p>
                      </div>

                      <div className="flex items-center justify-between mt-2 pt-1">
                        <span className="font-bold text-sm text-slate-900">
                          {formatINR(listing.price_inr)}
                        </span>

                        {isExperience ? (
                          <Link
                            to={detailUrl}
                            onClick={() => setIsWishlistOpen(false)}
                            className="px-3 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold flex items-center gap-1 transition-colors"
                          >
                            <span>Book</span>
                            <ArrowRight className="w-3 h-3" />
                          </Link>
                        ) : (
                          <button
                            onClick={() => handleMoveToCart(listing)}
                            className="px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-black text-white text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
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
            <div className="p-5 border-t border-slate-200 bg-slate-50 space-y-3">
              <div className="flex items-center justify-between text-xs text-slate-500">
                <span>
                  {wishlistItems.length} saved{" "}
                  {wishlistItems.length === 1 ? "item" : "items"}
                </span>
                <button
                  onClick={clearWishlist}
                  className="text-rose-600 hover:text-rose-700 font-medium cursor-pointer transition-colors"
                >
                  Clear all
                </button>
              </div>

              <div className="text-[11px] text-slate-500 bg-white p-2.5 rounded-xl border border-slate-200/80 leading-relaxed">
                <span className="font-semibold text-slate-700">
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
