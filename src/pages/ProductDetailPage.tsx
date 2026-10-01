import React, { useState } from "react";
import { Link } from "../components/ui/Link";
import { useData } from "../context/DataContext";
import { useCart } from "../context/CartContext";
import { useWishlist } from "../context/WishlistContext";
import {
  ArrowLeft,
  ShoppingBag,
  Package,
  Truck,
  Heart,
  Plus,
  Minus,
  Sparkles,
} from "lucide-react";
import { formatINR } from "../lib/utils";
import { CheckoutModal } from "../components/order/CheckoutModal";

interface ProductDetailPageProps {
  slug?: string;
}

export const ProductDetailPage: React.FC<ProductDetailPageProps> = ({
  slug: slugProp,
}) => {
  let slug = slugProp;
  if (!slug && typeof window !== "undefined") {
    const parts = window.location.pathname.split("/");
    slug = parts[parts.length - 1];
  }

  const { getListingBySlug } = useData();
  const { addItem } = useCart();
  const { isInWishlist, toggleWishlist } = useWishlist();

  const listing = slug ? getListingBySlug(slug) : undefined;

  const [quantity, setQuantity] = useState(1);
  const [activeImgIdx, setActiveImgIdx] = useState(0);
  const [isInstantCheckoutOpen, setIsInstantCheckoutOpen] = useState(false);
  const [addedAlert, setAddedAlert] = useState(false);

  if (!listing) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center space-y-4">
        <h2 className="font-display font-bold text-2xl text-[#f5edeb]">
          Product Not Found
        </h2>
        <Link
          to="/"
          className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#e3a157] text-[#29100b] rounded-xl text-xs font-bold hover:bg-[#dab38c] transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Return to Catalog
        </Link>
      </div>
    );
  }

  const isWishlisted = isInWishlist(listing.id);

  const handleAddToCart = () => {
    addItem(listing, quantity);
    setAddedAlert(true);
    setTimeout(() => setAddedAlert(false), 2500);
  };

  const totalAmount = listing.price_inr * quantity;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Back to Catalog & Wishlist */}
      <div className="flex items-center justify-between">
        <Link
          to="/"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#dab38c] hover:text-[#f5edeb] transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Artisan Catalog
        </Link>

        <button
          onClick={() => toggleWishlist(listing)}
          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border transition-all cursor-pointer shadow-xs ${
            isWishlisted
              ? "bg-rose-950/70 text-rose-300 border-rose-500/40 shadow-rose-950"
              : "bg-[#35160e]/80 text-[#dab38c] hover:text-[#f5edeb] border-[#dab38c]/25 hover:border-[#e3a157]/50"
          }`}
          title={
            isWishlisted ? "Saved in guest wishlist" : "Save to guest wishlist"
          }
        >
          <Heart
            className={`w-3.5 h-3.5 ${
              isWishlisted ? "fill-rose-400 text-rose-400" : ""
            }`}
          />
          <span>{isWishlisted ? "Saved" : "Save Item"}</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
        {/* Left Column: Product Imagery (6 Cols) */}
        <div className="lg:col-span-6 space-y-3">
          <div className="aspect-square w-full rounded-3xl overflow-hidden bg-[#1f0b07] border border-[#dab38c]/25 shadow-xl relative">
            <img
              src={listing.images[activeImgIdx] || listing.images[0]}
              alt={listing.title}
              className="w-full h-full object-cover"
            />
            <div className="absolute top-4 left-4">
              <span className="text-[11px] font-bold px-3 py-1 rounded-full uppercase tracking-wider bg-[#e3a157] text-[#29100b] shadow-md">
                Handcrafted / Chemical-Free
              </span>
            </div>
          </div>

          {/* Thumbnails */}
          {listing.images.length > 1 && (
            <div className="flex items-center gap-3">
              {listing.images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveImgIdx(idx)}
                  className={`w-20 h-20 rounded-2xl overflow-hidden border-2 transition-all cursor-pointer bg-[#1f0b07] ${
                    activeImgIdx === idx
                      ? "border-[#e3a157] ring-2 ring-[#e3a157]/40"
                      : "border-[#dab38c]/20 opacity-60 hover:opacity-100"
                  }`}
                >
                  <img
                    src={img}
                    alt="Thumb"
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right Column: Pricing, Origin & Cart Triggers (6 Cols) */}
        <div className="lg:col-span-6 space-y-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-[#e3a157] bg-[#e3a157]/10 px-2.5 py-0.5 rounded-full border border-[#e3a157]/30">
                {listing.artisan_collective || "Coastal Women's Collective"}
              </span>
              <span className="text-xs text-[#dab38c]/40">•</span>
              <span className="text-xs text-[#dab38c] font-medium flex items-center gap-1">
                <Package className="w-3.5 h-3.5 text-[#e3a157]" />
                Net Wt:{" "}
                {listing.weight_grams ? `${listing.weight_grams}g` : "Standard"}
              </span>
            </div>

            <h1 className="font-display font-bold text-2xl sm:text-3xl text-[#f5edeb]">
              {listing.title}
            </h1>

            <p className="text-xs sm:text-sm text-[#dab38c] leading-relaxed">
              {listing.short_summary}
            </p>
          </div>

          {/* Price & Quantity Box */}
          <div className="p-6 bg-[#35160e]/85 backdrop-blur-md border border-[#dab38c]/25 rounded-3xl space-y-5 shadow-xl">
            <div className="flex items-baseline justify-between">
              <div>
                <span className="text-[10px] uppercase font-bold text-[#dab38c]/70 tracking-wider">
                  Direct Price
                </span>
                <div className="font-display font-bold text-3xl text-[#f5edeb]">
                  {formatINR(listing.price_inr)}
                  <span className="text-sm font-normal text-[#dab38c] font-sans">
                    {" "}
                    / pack
                  </span>
                </div>
              </div>

              {/* Quantity Picker */}
              <div className="flex items-center gap-3">
                <span className="text-xs font-semibold text-[#dab38c]">
                  Qty:
                </span>
                <div className="flex items-center border border-[#dab38c]/30 rounded-xl bg-[#1f0b07] overflow-hidden shadow-xs">
                  <button
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    className="p-2 hover:bg-[#35160e] text-[#dab38c] hover:text-[#f5edeb] transition-colors cursor-pointer"
                  >
                    <Minus className="w-3.5 h-3.5" />
                  </button>
                  <span className="px-4 text-xs font-bold text-[#f5edeb]">
                    {quantity}
                  </span>
                  <button
                    onClick={() => setQuantity((q) => q + 1)}
                    className="p-2 hover:bg-[#35160e] text-[#dab38c] hover:text-[#f5edeb] transition-colors cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>

            {/* Total Calculation */}
            <div className="flex justify-between items-center text-xs font-semibold text-[#dab38c] border-t border-[#dab38c]/20 pt-3">
              <span>
                Subtotal ({quantity} {quantity === 1 ? "pack" : "packs"})
              </span>
              <span className="font-display font-bold text-base text-[#f5edeb]">
                {formatINR(totalAmount)}
              </span>
            </div>

            {/* Action Buttons */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              <button
                onClick={handleAddToCart}
                className="py-3.5 px-4 bg-[#481f14] hover:bg-[#5a271a] text-[#f5edeb] border border-[#dab38c]/30 rounded-xl text-xs font-semibold transition-all shadow-xs flex items-center justify-center gap-2 cursor-pointer"
              >
                <ShoppingBag className="w-4 h-4 text-[#e3a157]" />
                <span>
                  {addedAlert ? "Added to Basket! ✓" : "Add to Basket"}
                </span>
              </button>

              <button
                onClick={() => setIsInstantCheckoutOpen(true)}
                className="py-3.5 px-4 bg-[#e3a157] hover:bg-[#dab38c] text-[#29100b] font-bold rounded-xl text-xs transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
              >
                <Sparkles className="w-4 h-4 text-[#29100b]" />
                <span>Buy Now with UPI</span>
              </button>
            </div>

            {/* Direct Dispatch Note */}
            <div className="flex items-center gap-2 text-[11px] text-[#dab38c]/80 pt-1">
              <Truck className="w-3.5 h-3.5 text-[#e3a157] shrink-0" />
              <span>
                Ships across Mumbai & India via direct coastal collective
                logistics.
              </span>
            </div>
          </div>

          {/* Full Narrative & Bachat Gat Story */}
          <div className="space-y-4 pt-2">
            <h3 className="font-display font-bold text-lg text-[#f5edeb]">
              Harvest & Collective Production Story
            </h3>
            <div className="text-xs sm:text-sm text-[#dab38c] leading-relaxed whitespace-pre-line">
              {listing.full_description}
            </div>
          </div>

          {/* Collective Trust Box */}
          <div className="p-5 rounded-2xl bg-[#35160e]/85 border border-[#dab38c]/20 shadow-md backdrop-blur-md flex items-start gap-3 text-xs text-[#dab38c]">
            <Heart className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <div className="font-bold text-[#f5edeb]">
                Community Fair-Wage Guarantee
              </div>
              <p className="text-[#dab38c]/85 leading-relaxed text-[11px]">
                By buying this, you provide clean, dignified income directly to
                indigenous coastal women processors and mangrove conservation
                cooperatives.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Instant Checkout Modal */}
      {isInstantCheckoutOpen && (
        <CheckoutModal
          items={[
            {
              listing,
              quantity,
            },
          ]}
          onClose={() => setIsInstantCheckoutOpen(false)}
        />
      )}
    </div>
  );
};
