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
        className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 transition-opacity"
        onClick={() => setIsCartOpen(false)}
      />

      {/* Drawer */}
      <div className="fixed inset-y-0 right-0 max-w-full flex z-50">
        <div className="w-screen max-w-md bg-[#29100b] text-[#f5edeb] shadow-2xl flex flex-col border-l border-[#dab38c]/20">
          {/* Header */}
          <div className="p-5 border-b border-[#dab38c]/15 flex items-center justify-between bg-[#1f0b07]">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-[#35160e] text-[#e3a157] flex items-center justify-center border border-[#dab38c]/30">
                <ShoppingBag className="w-4 h-4 text-[#e3a157]" />
              </div>
              <div>
                <h2 className="font-display font-bold text-lg text-[#f5edeb]">
                  Your Basket
                </h2>
                <p className="text-xs text-[#dab38c]">
                  Supporting indigenous artisans & collectives
                </p>
              </div>
            </div>
            <button
              onClick={() => setIsCartOpen(false)}
              className="p-2 text-[#dab38c] hover:text-[#f5edeb] rounded-lg hover:bg-[#35160e] transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Items List */}
          <div className="flex-1 overflow-y-auto p-5 divide-y divide-[#dab38c]/10">
            {items.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-8 text-[#dab38c]">
                <ShoppingBag className="w-12 h-12 text-[#dab38c]/40 mb-3" />
                <h3 className="font-display font-semibold text-[#f5edeb] text-lg">
                  Your basket is empty
                </h3>
                <p className="text-xs text-[#dab38c]/80 mt-1 max-w-xs">
                  Discover handcrafted coastal foods, artisanal items, and
                  experiential trails from coastal villages.
                </p>
                <button
                  onClick={() => setIsCartOpen(false)}
                  className="mt-5 px-5 py-2.5 text-xs font-semibold text-[#29100b] bg-[#f5edeb] hover:bg-[#dab38c] rounded-xl transition-colors cursor-pointer shadow-md"
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
                    className="w-20 h-20 rounded-xl object-cover border border-[#dab38c]/20 shrink-0"
                  />
                  <div className="flex-1 min-w-0 flex flex-col justify-between">
                    <div>
                      <div className="flex items-start justify-between gap-2">
                        <h4 className="text-sm font-semibold text-[#f5edeb] line-clamp-1">
                          {listing.title}
                        </h4>
                        <button
                          onClick={() => removeItem(listing.id)}
                          className="text-[#dab38c]/60 hover:text-rose-400 transition-colors p-1"
                          title="Remove item"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                      <p className="text-xs text-[#dab38c] mt-0.5">
                        {listing.weight_grams
                          ? `${listing.weight_grams}g`
                          : listing.artisan_collective}
                      </p>
                    </div>

                    <div className="flex items-center justify-between mt-2">
                      {/* Quantity Controls */}
                      <div className="flex items-center border border-[#dab38c]/30 rounded-lg bg-[#35160e] overflow-hidden">
                        <button
                          onClick={() =>
                            updateQuantity(listing.id, quantity - 1)
                          }
                          className="p-1 hover:bg-[#481f14] text-[#dab38c] transition-colors"
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </button>
                        <span className="px-3 text-xs font-semibold text-[#f5edeb]">
                          {quantity}
                        </span>
                        <button
                          onClick={() =>
                            updateQuantity(listing.id, quantity + 1)
                          }
                          className="p-1 hover:bg-[#481f14] text-[#dab38c] transition-colors"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <div className="text-right">
                        <span className="font-display font-semibold text-sm text-[#e3a157]">
                          {formatINR(listing.price_inr * quantity)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer Checkout Summary */}
          {items.length > 0 && (
            <div className="p-5 border-t border-[#dab38c]/15 bg-[#1f0b07] space-y-4">
              <div className="space-y-1.5 text-xs text-[#dab38c]">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span>{formatINR(totalAmount)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Direct Collective Packaging</span>
                  <span className="text-emerald-400 font-medium">Free</span>
                </div>
                <div className="flex justify-between text-base font-bold text-[#f5edeb] pt-2 border-t border-[#dab38c]/15">
                  <span>Total Amount</span>
                  <span className="font-display text-[#e3a157]">
                    {formatINR(totalAmount)}
                  </span>
                </div>
              </div>

              <div className="space-y-2">
                <button
                  onClick={handleOpenCheckout}
                  className="w-full py-3.5 rounded-xl bg-[#e3a157] hover:bg-[#dab38c] text-[#29100b] font-bold text-xs flex items-center justify-center gap-2 shadow-lg transition-all cursor-pointer"
                >
                  <span>Proceed to Instant Checkout</span>
                  <ArrowRight className="w-4 h-4" />
                </button>

                <div className="flex items-center justify-between text-[11px] text-[#dab38c]/70 px-1 pt-1">
                  <span className="flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                    Direct-to-host payout guaranteed
                  </span>
                  <button
                    onClick={clearCart}
                    className="hover:text-rose-400 transition-colors"
                  >
                    Clear All
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Checkout Modal Bridge */}
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
