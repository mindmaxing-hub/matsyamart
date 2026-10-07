import React from "react";
import { Link } from "../ui/Link";
import { MapPin, ArrowRight, ShoppingBag, Calendar, Heart } from "lucide-react";
import { Listing } from "../../types";
import { formatINR } from "../../lib/utils";
import { useCart } from "../../context/CartContext";
import { useWishlist } from "../../context/WishlistContext";
import { useData } from "../../context/DataContext";

interface ListingCardProps {
  listing: Listing;
}

export const ListingCard: React.FC<ListingCardProps> = ({ listing }) => {
  const { addItem } = useCart();
  const { isInWishlist, toggleWishlist } = useWishlist();
  const { slots } = useData();
  const isExperience = listing.type === "experience";
  const isWishlisted = isInWishlist(listing.id);

  // Compute open slot availability for experience cards
  const now = new Date();
  const hasOpenSlots = isExperience
    ? slots.some(
        (s) =>
          s.listing_id === listing.id &&
          !s.is_cancelled &&
          s.booked_count < s.capacity &&
          new Date(s.slot_start) > now,
      )
    : false;

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
      className="group block bg-[#35160e]/85 hover:bg-[#481f14] border border-[#dab38c]/20 hover:border-[#e3a157]/45 rounded-2xl sm:rounded-3xl overflow-hidden transition-all duration-300 shadow-md hover:shadow-xl hover:-translate-y-1 flex flex-col cursor-pointer backdrop-blur-md shrink-0 w-[270px] sm:w-auto snap-start"
    >
      {/* Thumbnail Aspect Container */}
      <div className="relative aspect-[16/10] overflow-hidden bg-[#29100b]">
        <img
          src={listing.images[0]}
          alt={listing.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />

        {/* Pillar Tag — top left */}
        <div className="absolute top-3 left-3 pointer-events-none">
          <span className="px-2.5 py-1 rounded-full bg-[#29100b]/85 backdrop-blur-md border border-[#e3a157]/30 text-[10px] font-bold tracking-wider uppercase text-[#e3a157] shadow-xs">
            {getPillarLabel()}
          </span>
        </div>

        {/* Wishlist Button — top right */}
        <button
          onClick={handleWishlistToggle}
          className={`absolute top-3 right-3 w-8 h-8 rounded-full flex items-center justify-center backdrop-blur-md transition-all duration-200 shadow-xs cursor-pointer z-10 ${
            isWishlisted
              ? "bg-[#29100b]/90 border border-rose-500/50 text-rose-400"
              : "bg-[#29100b]/80 hover:bg-[#29100b] text-[#dab38c] hover:text-rose-400 border border-[#dab38c]/30"
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

        {/* Open / Full Badge — bottom left (experience only) */}
        {isExperience && (
          <div className="absolute bottom-3 left-3 pointer-events-none">
            {hasOpenSlots ? (
              <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-900/80 backdrop-blur-md border border-emerald-500/40 text-[9px] font-bold text-emerald-400">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Open
              </span>
            ) : (
              <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#29100b]/80 backdrop-blur-md border border-[#dab38c]/20 text-[9px] font-bold text-[#dab38c]/60">
                <span className="w-1.5 h-1.5 rounded-full bg-[#dab38c]/40" />
                Full
              </span>
            )}
          </div>
        )}

        {/* Price Pill — bottom right */}
        <div className="absolute bottom-3 right-3 pointer-events-none">
          <span className="px-3 py-1 rounded-full bg-[#29100b]/95 backdrop-blur-md border border-[#e3a157]/35 text-xs font-bold text-[#e3a157] shadow-xs">
            {formatINR(listing.price_inr)}
          </span>
        </div>
      </div>

      {/* Card Body */}
      <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
        <div className="space-y-1.5">
          {/* Date / Availability Line */}
          <div className="flex items-center gap-1.5 text-[11px] font-semibold text-[#e3a157]">
            <Calendar className="w-3.5 h-3.5 text-[#e3a157] shrink-0" />
            <span>
              {isExperience
                ? `Every Weekend • ${listing.duration_minutes ? Math.floor(listing.duration_minutes / 60) + "h " + (listing.duration_minutes % 60 ? (listing.duration_minutes % 60) + "m" : "") : "2h"}`
                : "Handcrafted • Small Batch"}
            </span>
          </div>

          {/* Title */}
          <h3 className="font-display font-bold text-sm sm:text-base text-[#f5edeb] group-hover:text-[#e3a157] transition-colors line-clamp-2 leading-snug">
            {listing.title}
          </h3>

          {/* Host & Location Line */}
          <div className="flex items-center gap-1.5 text-[11px] text-[#dab38c] line-clamp-1 pt-0.5">
            <MapPin className="w-3.5 h-3.5 text-[#e3a157] shrink-0" />
            <span className="truncate">
              {listing.location_name || listing.artisan_collective}
            </span>
          </div>
        </div>

        {/* Action Button Row */}
        <div className="pt-2 border-t border-[#dab38c]/15 flex items-center justify-between">
          <span className="text-[11px] text-[#dab38c] font-medium truncate max-w-[55%]">
            By {listing.host_name.split("&")[0]?.trim()}
          </span>

          {isExperience ? (
            <span className="text-xs font-semibold text-[#e3a157] group-hover:translate-x-0.5 transition-transform flex items-center gap-1">
              <span>Book</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </span>
          ) : (
            <button
              onClick={handleQuickAdd}
              className="px-3 py-1 rounded-full bg-[#5d3a24]/50 hover:bg-[#e3a157] hover:text-[#29100b] text-[#f5edeb] text-[11px] font-semibold transition-colors flex items-center gap-1.5 border border-[#dab38c]/30 shadow-xs cursor-pointer"
            >
              <ShoppingBag className="w-3.5 h-3.5 text-[#e3a157]" />
              <span>Add</span>
            </button>
          )}
        </div>
      </div>
    </Link>
  );
};
