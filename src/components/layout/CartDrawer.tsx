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
        <div className="w-screen max-w-md bg-[#29100b] text-[#f5edeb] shadow-2xl flex flex-col border-l border-[#dab38c]/20">
          {/* Header */}
          <div className="p-5 border-b border-[#dab38c]/15 flex items-center justify-between bg-[#35160e]">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-[#5d3a24] text-[#e3a157] flex items-center justify-center border border-[#dab38c]/20">
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
              className="p-2 text-[#dab38c] hover:text-[#f5edeb] rounded-lg hover:bg-[#5d3a24]/50 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Items List */}
          <div className="flex-1 overflow-y-auto p-5 divide-y divide-[#dab38c]/15">
            {items.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-8 text-[#dab38c]">
                <ShoppingBag className="w-12 h-12 text-[#e3a157] mb-3" />
                <h3 className="font-display font-semibold text-[#f5edeb]">
                  Your basket is empty
                </h3>
                <p className="text-xs text-[#dab38c] mt-1 max-w-xs">
                  Discover handcrafted coastal foods, artisanal items, and
                  experiential trails from coastal villages.
                </p>
                <button
                  onClick={() => setIsCartOpen(false)}
                  className="mt-5 px-4 py-2 text-xs font-semibold text-[#29100b] bg-[#f5edeb] hover:bg-[#dab38c] rounded-xl transition-colors cursor-pointer"
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
                          className="text-[#dab38c] hover:text-rose-400 transition-colors p-1"
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
                      <div className="flex items-center border border-[#dab38c]/25 rounded-lg overflow-hidden bg-[#35160e]">
                        <button
                          onClick={() =>
                            updateQuantity(listing.id, quantity - 1)
                          }
                          className="p-1 hover:bg-[#5d3a24] text-[#dab38c] hover:text-[#f5edeb] transition-colors"
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
                          className="p-1 hover:bg-[#5d3a24] text-[#dab38c] hover:text-[#f5edeb] transition-colors"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <div className="text-sm font-bold text-[#e3a157]">
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
            <div className="p-5 border-t border-[#dab38c]/15 bg-[#35160e] space-y-3">
              <div className="flex items-center justify-between text-xs text-[#dab38c]">
                <span>Direct Artisan Support</span>
                <span className="font-semibold text-[#e3a157] flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-[#e3a157]" />{" "}
                  Community-Partnered
                </span>
              </div>

              <div className="flex items-center justify-between text-base font-bold text-[#f5edeb] border-t border-[#dab38c]/15 pt-2">
                <span>Subtotal</span>
                <span className="text-[#e3a157] text-lg font-display">
                  {formatINR(totalAmount)}
                </span>
              </div>

              <button
                onClick={handleOpenCheckout}
                className="w-full py-3.5 px-4 bg-[#f5edeb] hover:bg-[#dab38c] text-[#29100b] rounded-xl font-bold text-sm transition-all shadow-md flex items-center justify-center gap-2 group cursor-pointer"
              >
                <span>Proceed to Checkout</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform text-[#29100b]" />
              </button>

              <button
                onClick={clearCart}
                className="w-full py-1.5 text-[11px] text-[#dab38c] hover:text-rose-400 transition-colors cursor-pointer"
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
