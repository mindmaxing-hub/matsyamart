import React, { useState } from "react";
import { Link } from "../components/ui/Link";
import { useData } from "../context/DataContext";
import { useCart } from "../context/CartContext";
import {
  ArrowLeft,
  ShoppingBag,
  Package,
  ShieldCheck,
  CheckCircle2,
  Sparkles,
  Truck,
  Heart,
  Plus,
  Minus,
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

  const listing = slug ? getListingBySlug(slug) : undefined;

  const [quantity, setQuantity] = useState(1);
  const [activeImgIdx, setActiveImgIdx] = useState(0);
  const [isInstantCheckoutOpen, setIsInstantCheckoutOpen] = useState(false);
  const [addedAlert, setAddedAlert] = useState(false);

  if (!listing) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center space-y-4">
        <h2 className="font-display font-bold text-2xl text-slate-800">
          Product Not Found
        </h2>
        <Link
          to="/"
          className="inline-flex items-center gap-1.5 px-4 py-2 bg-ocean-800 text-white rounded-xl text-xs font-semibold"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Return to Catalog
        </Link>
      </div>
    );
  }

  const handleAddToCart = () => {
    addItem(listing, quantity);
    setAddedAlert(true);
    setTimeout(() => setAddedAlert(false), 2500);
  };

  const totalAmount = listing.price_inr * quantity;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Back to Catalog */}
      <div>
        <Link
          to="/"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-ocean-700 hover:text-ocean-900 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Artisan Catalog
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
        {/* Left Column: Product Imagery (6 Cols) */}
        <div className="lg:col-span-6 space-y-3">
          <div className="aspect-square w-full rounded-3xl overflow-hidden bg-slate-100 border border-slate-200 shadow-tactile relative">
            <img
              src={listing.images[activeImgIdx] || listing.images[0]}
              alt={listing.title}
              className="w-full h-full object-cover"
            />
            <div className="absolute top-4 left-4">
              <span className="text-[11px] font-bold px-3 py-1 rounded-full uppercase tracking-wider bg-amber-600 text-white shadow-xs">
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
                  className={`w-20 h-20 rounded-2xl overflow-hidden border-2 transition-all ${
                    activeImgIdx === idx
                      ? "border-amber-600 ring-2 ring-amber-600/30"
                      : "border-transparent opacity-70 hover:opacity-100"
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
              <span className="text-xs font-semibold text-amber-800 bg-amber-100 px-2.5 py-0.5 rounded-full">
                {listing.artisan_collective || "Coastal Women's Collective"}
              </span>
              <span className="text-xs text-slate-400">•</span>
              <span className="text-xs text-slate-500 font-medium flex items-center gap-1">
                <Package className="w-3.5 h-3.5 text-slate-400" />
                Net Wt:{" "}
                {listing.weight_grams ? `${listing.weight_grams}g` : "Standard"}
              </span>
            </div>

            <h1 className="font-display font-bold text-2xl sm:text-3xl text-ocean-950">
              {listing.title}
            </h1>

            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              {listing.short_summary}
            </p>
          </div>

          {/* Price & Quantity Box */}
          <div className="p-6 bg-slate-50 border border-slate-200/80 rounded-3xl space-y-5">
            <div className="flex items-baseline justify-between">
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                  Direct Price
                </span>
                <div className="font-display font-bold text-3xl text-ocean-950">
                  {formatINR(listing.price_inr)}
                  <span className="text-xs font-normal text-slate-500 font-sans">
                    {" "}
                    / pack
                  </span>
                </div>
              </div>

              {/* Quantity Picker */}
              <div className="flex items-center gap-3">
                <span className="text-xs font-semibold text-slate-600">
                  Qty:
                </span>
                <div className="flex items-center border border-slate-300 rounded-xl bg-white overflow-hidden shadow-xs">
                  <button
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    className="p-2 hover:bg-slate-100 text-slate-700 transition-colors"
                  >
                    <Minus className="w-3.5 h-3.5" />
                  </button>
                  <span className="px-4 text-xs font-bold text-slate-900">
                    {quantity}
                  </span>
                  <button
                    onClick={() => setQuantity((q) => q + 1)}
                    className="p-2 hover:bg-slate-100 text-slate-700 transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>

            {/* Total Calculation */}
            <div className="flex justify-between items-center text-xs font-semibold text-slate-700 border-t border-slate-200/80 pt-3">
              <span>
                Subtotal ({quantity} {quantity === 1 ? "pack" : "packs"})
              </span>
              <span className="font-display font-bold text-base text-ocean-900">
                {formatINR(totalAmount)}
              </span>
            </div>

            {/* Action Buttons */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              <button
                onClick={handleAddToCart}
                className="py-3.5 px-4 bg-white hover:bg-slate-100 text-ocean-900 border border-slate-300 rounded-xl text-xs font-semibold transition-all shadow-xs flex items-center justify-center gap-2"
              >
                <ShoppingBag className="w-4 h-4 text-ocean-700" />
                <span>{addedAlert ? "Added to Bag! ✓" : "Add to Bag"}</span>
              </button>

              <button
                onClick={() => setIsInstantCheckoutOpen(true)}
                className="py-3.5 px-4 bg-ocean-800 hover:bg-ocean-900 text-white rounded-xl text-xs font-semibold transition-all shadow-md flex items-center justify-center gap-2"
              >
                <Sparkles className="w-4 h-4 text-sun-300" />
                <span>Buy Now with UPI</span>
              </button>
            </div>

            {/* Direct Dispatch Note */}
            <div className="flex items-center gap-2 text-[11px] text-slate-500 pt-1">
              <Truck className="w-3.5 h-3.5 text-ocean-700 shrink-0" />
              <span>
                Ships across Mumbai & India via direct coastal collective
                logistics.
              </span>
            </div>
          </div>

          {/* Full Narrative & Bachat Gat Story */}
          <div className="space-y-4 pt-2">
            <h3 className="font-display font-bold text-lg text-ocean-950">
              Harvest & Collective Production Story
            </h3>
            <div className="text-xs sm:text-sm text-slate-700 leading-relaxed whitespace-pre-line">
              {listing.full_description}
            </div>
          </div>

          {/* Collective Trust Box */}
          <div className="p-5 rounded-2xl bg-ocean-50/60 border border-ocean-100 flex items-start gap-3 text-xs text-ocean-900">
            <Heart className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <div className="font-bold">Community Fair-Wage Guarantee</div>
              <p className="text-slate-600 leading-relaxed text-[11px]">
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
