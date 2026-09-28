import React, { useState } from "react";
import {
  X,
  Trash2,
  Plus,
  Minus,
  ArrowRight,
  ShoppingBag,
  ShieldCheck,
} from "lucide-react";
import { useCart } from "../../context/CartContext";
import { formatINR } from "../../lib/utils";
import { CheckoutModal } from "../order/CheckoutModal";

export const CartDrawer: React.FC = () => {
  const {
    items,
    removeItem,
    updateQuantity,
    clearCart,
    totalAmount,
    isCartOpen,
    setIsCartOpen,
  } = useCart();
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);

  if (!isCartOpen) return null;

  const handleOpenCheckout = () => {
    setIsCartOpen(false);
    setIsCheckoutOpen(true);
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-xs z-50 transition-opacity"
        onClick={() => setIsCartOpen(false)}
      />

      {/* Drawer */}
      <div className="fixed inset-y-0 right-0 max-w-full flex z-50">
        <div className="w-screen max-w-md bg-white shadow-2xl flex flex-col">
          {/* Header */}
          <div className="p-5 border-b border-slate-200 flex items-center justify-between bg-ocean-50">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-ocean-800 text-white flex items-center justify-center">
                <ShoppingBag className="w-4 h-4" />
              </div>
              <div>
                <h2 className="font-display font-bold text-lg text-ocean-900">
                  Your Basket
                </h2>
                <p className="text-xs text-slate-500">
                  Supporting indigenous artisans & collectives
                </p>
              </div>
            </div>
            <button
              onClick={() => setIsCartOpen(false)}
              className="p-2 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-200/50 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Items List */}
          <div className="flex-1 overflow-y-auto p-5 divide-y divide-slate-100">
            {items.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-8 text-slate-500">
                <ShoppingBag className="w-12 h-12 text-slate-300 mb-3" />
                <h3 className="font-display font-semibold text-slate-700">
                  Your basket is empty
                </h3>
                <p className="text-xs text-slate-500 mt-1 max-w-xs">
                  Discover handcrafted coastal foods, sun-dried seafood, and
                  experiential trails from Koli villages.
                </p>
                <button
                  onClick={() => setIsCartOpen(false)}
                  className="mt-5 px-4 py-2 text-xs font-semibold text-ocean-800 bg-ocean-100 hover:bg-ocean-200 rounded-xl transition-colors"
                >
                  Explore Catalog
                </button>
              </div>
            ) : (
              items.map(({ listing, quantity }) => (
                <div
                  key={listing.id}
                  className="py-4 flex gap-3.5 first:pt-0 last:pb-0"
                >
                  <img
                    src={listing.images[0]}
                    alt={listing.title}
                    className="w-20 h-20 rounded-xl object-cover border border-slate-100 shrink-0"
                  />
                  <div className="flex-1 min-w-0 flex flex-col justify-between">
                    <div>
                      <div className="flex items-start justify-between gap-2">
                        <h4 className="text-sm font-semibold text-slate-800 line-clamp-1">
                          {listing.title}
                        </h4>
                        <button
                          onClick={() => removeItem(listing.id)}
                          className="text-slate-400 hover:text-rose-500 transition-colors p-1"
                          title="Remove item"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                      <p className="text-xs text-slate-500 mt-0.5">
                        {listing.weight_grams
                          ? `${listing.weight_grams}g`
                          : listing.artisan_collective}
                      </p>
                    </div>

                    <div className="flex items-center justify-between mt-2">
                      {/* Quantity Controls */}
                      <div className="flex items-center border border-slate-200 rounded-lg overflow-hidden bg-slate-50">
                        <button
                          onClick={() =>
                            updateQuantity(listing.id, quantity - 1)
                          }
                          className="p-1 hover:bg-slate-200 text-slate-600 transition-colors"
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </button>
                        <span className="px-3 text-xs font-semibold text-slate-700">
                          {quantity}
                        </span>
                        <button
                          onClick={() =>
                            updateQuantity(listing.id, quantity + 1)
                          }
                          className="p-1 hover:bg-slate-200 text-slate-600 transition-colors"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <div className="text-sm font-bold text-ocean-900">
                        {formatINR(listing.price_inr * quantity)}
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer & Checkout Trigger */}
          {items.length > 0 && (
            <div className="p-5 border-t border-slate-200 bg-slate-50 space-y-3">
              <div className="flex items-center justify-between text-xs text-slate-500">
                <span>Direct Artisan Revenue</span>
                <span className="font-semibold text-emerald-700 flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5" /> 100% to Community
                </span>
              </div>

              <div className="flex items-center justify-between text-base font-bold text-slate-900 border-t border-slate-200 pt-2">
                <span>Subtotal</span>
                <span className="text-ocean-900 text-lg font-display">
                  {formatINR(totalAmount)}
                </span>
              </div>

              <button
                onClick={handleOpenCheckout}
                className="w-full py-3.5 px-4 bg-ocean-800 hover:bg-ocean-900 text-white rounded-xl font-semibold text-sm transition-all shadow-md flex items-center justify-center gap-2 group"
              >
                <span>Proceed to Checkout</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>

              <button
                onClick={clearCart}
                className="w-full py-1.5 text-[11px] text-slate-400 hover:text-rose-500 transition-colors"
              >
                Clear all items
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Checkout Modal for Basket */}
      {isCheckoutOpen && (
        <CheckoutModal
          items={items.map((i) => ({
            listing: i.listing,
            quantity: i.quantity,
          }))}
          onClose={() => setIsCheckoutOpen(false)}
        />
      )}
    </>
  );
};
