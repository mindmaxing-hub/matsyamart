import React from "react";
import { Link } from "../ui/Link";
import { MapPin, ArrowRight, ShoppingBag, Calendar, Heart } from "lucide-react";
import { Listing } from "../../types";
import { formatINR } from "../../lib/utils";
import { useCart } from "../../context/CartContext";
import { useWishlist } from "../../context/WishlistContext";

interface ListingCardProps {
  listing: Listing;
}

export const ListingCard: React.FC<ListingCardProps> = ({ listing }) => {
  const { addItem } = useCart();
  const { isInWishlist, toggleWishlist } = useWishlist();
  const isExperience = listing.type === "experience";
  const isWishlisted = isInWishlist(listing.id);

  const detailPath = isExperience
    ? `/experience/${listing.slug}`
    : `/product/${listing.slug}`;

  const handleQuickAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addItem(listing, 1);
  };

  const handleWishlistToggle = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggleWishlist(listing);
  };

  const getPillarLabel = () => {
    if (listing.pillar === "walks") return "Trail";
    if (listing.pillar === "workshops") return "Workshop";
    if (listing.pillar === "food") return "Food & Dining";
    if (listing.pillar === "goods") return "Artisan Goods";
    return isExperience ? "Experience" : "Goods";
  };

  return (
    <Link
      to={detailPath}
      className="group block bg-white hover:bg-slate-50/50 border border-slate-200/90 hover:border-amber-300 rounded-2xl sm:rounded-3xl overflow-hidden transition-all duration-300 shadow-xs hover:shadow-lg hover:-translate-y-1 flex flex-col cursor-pointer shrink-0 w-[270px] sm:w-auto snap-start"
    >
      {/* Thumbnail Aspect Container */}
      <div className="relative aspect-[16/10] overflow-hidden bg-slate-100">
        <img
          src={listing.images[0]}
          alt={listing.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />

        {/* Pillar Tag */}
        <div className="absolute top-3 left-3 pointer-events-none">
          <span className="px-2.5 py-1 rounded-full bg-white/95 backdrop-blur-md border border-slate-200/80 text-[10px] font-bold tracking-wider uppercase text-slate-800 shadow-xs">
            {getPillarLabel()}
          </span>
        </div>

        {/* Wishlist Button */}
        <button
          onClick={handleWishlistToggle}
          className={`absolute top-3 right-3 w-8 h-8 rounded-full flex items-center justify-center backdrop-blur-md transition-all duration-200 shadow-xs cursor-pointer z-10 ${
            isWishlisted
              ? "bg-rose-50 border border-rose-200 text-rose-600 shadow-rose-200/50"
              : "bg-white/90 hover:bg-white text-slate-500 hover:text-rose-600 border border-slate-200/80"
          }`}
          title={isWishlisted ? "Remove from wishlist" : "Save to wishlist"}
          aria-label={
            isWishlisted ? "Remove from wishlist" : "Save to wishlist"
          }
        >
          <Heart
            className={`w-4 h-4 transition-transform active:scale-125 ${
              isWishlisted ? "fill-rose-500 text-rose-500" : ""
            }`}
          />
        </button>

        {/* Price Pill */}
        <div className="absolute bottom-3 right-3 pointer-events-none">
          <span className="px-3 py-1 rounded-full bg-white/95 backdrop-blur-md border border-slate-200/90 text-xs font-bold text-slate-900 shadow-xs">
            {formatINR(listing.price_inr)}
          </span>
        </div>
      </div>

      {/* Card Body */}
      <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
        <div className="space-y-1.5">
          {/* Date / Availability Line (Amber Style) */}
          <div className="flex items-center gap-1.5 text-[11px] font-semibold text-amber-800">
            <Calendar className="w-3.5 h-3.5 text-amber-700 shrink-0" />
            <span>
              {isExperience
                ? `Every Weekend • ${listing.duration_minutes ? Math.floor(listing.duration_minutes / 60) + "h " + (listing.duration_minutes % 60 ? (listing.duration_minutes % 60) + "m" : "") : "2h"}`
                : "Handcrafted • Small Batch"}
            </span>
          </div>

          {/* Title */}
          <h3 className="font-display font-bold text-sm sm:text-base text-slate-900 group-hover:text-amber-800 transition-colors line-clamp-2 leading-snug">
            {listing.title}
          </h3>

          {/* Host & Location Line */}
          <div className="flex items-center gap-1.5 text-[11px] text-slate-500 line-clamp-1 pt-0.5">
            <MapPin className="w-3.5 h-3.5 text-amber-600 shrink-0" />
            <span className="truncate">
              {listing.location_name || listing.artisan_collective}
            </span>
          </div>
        </div>

        {/* Action Button Row */}
        <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
          <span className="text-[11px] text-slate-500 font-medium truncate max-w-[55%]">
            By {listing.host_name.split("&")[0]?.trim()}
          </span>

          {isExperience ? (
            <span className="text-xs font-semibold text-amber-800 group-hover:translate-x-0.5 transition-transform flex items-center gap-1">
              <span>Book</span>
              <ArrowRight className="w-3 h-3" />
            </span>
          ) : (
            <button
              onClick={handleQuickAdd}
              className="px-3 py-1 rounded-full bg-slate-900 hover:bg-black text-white text-[11px] font-semibold transition-colors flex items-center gap-1.5 shadow-xs cursor-pointer"
            >
              <ShoppingBag className="w-3 h-3 text-amber-300" />
              <span>Add</span>
            </button>
          )}
        </div>
      </div>
    </Link>
  );
};
