import React from "react";
import { Link } from "../ui/Link";
import { MapPin, ArrowRight, ShoppingBag, Calendar } from "lucide-react";
import { Listing } from "../../types";
import { formatINR } from "../../lib/utils";
import { useCart } from "../../context/CartContext";

interface ListingCardProps {
  listing: Listing;
}

export const ListingCard: React.FC<ListingCardProps> = ({ listing }) => {
  const { addItem } = useCart();
  const isExperience = listing.type === "experience";

  const detailPath = isExperience
    ? `/experience/${listing.slug}`
    : `/product/${listing.slug}`;

  const handleQuickAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addItem(listing, 1);
  };

  const getPillarLabel = () => {
    if (listing.pillar === "walks") return "Walk";
    if (listing.pillar === "workshops") return "Workshop";
    if (listing.pillar === "food") return "Food & Dining";
    if (listing.pillar === "goods") return "Artisan Goods";
    return isExperience ? "Experience" : "Goods";
  };

  return (
    <Link
      to={detailPath}
      className="group block bg-[#002836]/90 hover:bg-[#00384C] border border-white/15 hover:border-sun-300/40 rounded-2xl sm:rounded-3xl overflow-hidden transition-all duration-300 shadow-md hover:shadow-xl hover:-translate-y-1 flex flex-col cursor-pointer backdrop-blur-md shrink-0 w-[270px] sm:w-auto snap-start"
    >
      {/* Thumbnail Aspect Container */}
      <div className="relative aspect-[16/10] overflow-hidden bg-ocean-950">
        <img
          src={listing.images[0]}
          alt={listing.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />

        {/* Pillar Tag */}
        <div className="absolute top-3 left-3 pointer-events-none">
          <span className="px-2.5 py-1 rounded-full bg-ocean-950/80 backdrop-blur-md border border-sun-300/25 text-[10px] font-bold tracking-wider uppercase text-sun-300 shadow-xs">
            {getPillarLabel()}
          </span>
        </div>

        {/* Price Pill */}
        <div className="absolute bottom-3 right-3 pointer-events-none">
          <span className="px-3 py-1 rounded-full bg-[#001D28]/95 backdrop-blur-md border border-sun-300/30 text-xs font-bold text-sun-300 shadow-xs">
            {formatINR(listing.price_inr)}
          </span>
        </div>
      </div>

      {/* Card Body */}
      <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
        <div className="space-y-1.5">
          {/* Date / Availability Line (Luma Gold Style) */}
          <div className="flex items-center gap-1.5 text-[11px] font-semibold text-sun-300">
            <Calendar className="w-3 h-3 text-sun-300 shrink-0" />
            <span>
              {isExperience
                ? `Every Weekend • ${listing.duration_minutes ? Math.floor(listing.duration_minutes / 60) + "h " + (listing.duration_minutes % 60 ? (listing.duration_minutes % 60) + "m" : "") : "2h"}`
                : "Handcrafted • Small Batch"}
            </span>
          </div>

          {/* Title */}
          <h3 className="font-display font-bold text-sm sm:text-base text-white group-hover:text-sun-300 transition-colors line-clamp-2 leading-snug">
            {listing.title}
          </h3>

          {/* Host & Location Line */}
          <div className="flex items-center gap-1 text-[11px] text-ocean-200 line-clamp-1 pt-0.5">
            <MapPin className="w-3 h-3 text-ocean-300 shrink-0" />
            <span className="truncate">
              {listing.location_name || listing.artisan_collective}
            </span>
          </div>
        </div>

        {/* Action Button Row */}
        <div className="pt-2 border-t border-white/10 flex items-center justify-between">
          <span className="text-[11px] text-ocean-200 font-medium truncate max-w-[60%]">
            By {listing.host_name.split("&")[0]?.trim()}
          </span>

          {isExperience ? (
            <span className="text-xs font-semibold text-sun-300 group-hover:translate-x-0.5 transition-transform flex items-center gap-1">
              <span>Book</span>
              <ArrowRight className="w-3 h-3" />
            </span>
          ) : (
            <button
              onClick={handleQuickAdd}
              className="px-2.5 py-1 rounded-full bg-white/10 hover:bg-sun-300 hover:text-ocean-950 text-white text-[11px] font-semibold transition-colors flex items-center gap-1"
            >
              <ShoppingBag className="w-3 h-3" />
              <span>Add</span>
            </button>
          )}
        </div>
      </div>
    </Link>
  );
};
