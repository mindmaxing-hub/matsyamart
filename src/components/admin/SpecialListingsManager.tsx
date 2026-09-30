import React, { useState } from "react";
import {
  ArrowUp,
  ArrowDown,
  ExternalLink,
  Sparkles,
  Trash2,
  Plus,
  Eye,
  CheckCircle2,
  Compass,
  Hammer,
  UtensilsCrossed,
  ShoppingBag,
} from "lucide-react";
import { Listing } from "../../types";
import { formatINR } from "../../lib/utils";

interface SpecialListingsManagerProps {
  listings: Listing[];
  spotlightListingIds: string[];
  onReorder: (fromIndex: number, toIndex: number) => void;
  onToggle: (listingId: string) => void;
}

export const SpecialListingsManager: React.FC<SpecialListingsManagerProps> = ({
  listings,
  spotlightListingIds,
  onReorder,
  onToggle,
}) => {
  const [selectedToAdd, setSelectedToAdd] = useState<string>("");

  // Map spotlight IDs to full listing objects in exact order
  const spotlightListings = spotlightListingIds
    .map((id) => listings.find((l) => l.id === id))
    .filter((l): l is Listing => Boolean(l));

  // Available active listings not currently in the spotlight
  const availableToAdd = listings.filter(
    (l) => l.is_active && !spotlightListingIds.includes(l.id),
  );

  // Category counts in the current spotlight
  const categoryCounts = spotlightListings.reduce(
    (acc, l) => {
      const p = l.pillar || (l.type === "experience" ? "walks" : "goods");
      acc[p] = (acc[p] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>,
  );

  const handleAdd = () => {
    if (!selectedToAdd) return;
    onToggle(selectedToAdd);
    setSelectedToAdd("");
  };

  const getPillarIcon = (pillar?: string) => {
    switch (pillar) {
      case "walks":
        return <Compass className="w-3.5 h-3.5 text-[#e3a157]" />;
      case "workshops":
        return <Hammer className="w-3.5 h-3.5 text-[#e3a157]" />;
      case "food":
        return <UtensilsCrossed className="w-3.5 h-3.5 text-[#e3a157]" />;
      case "goods":
      default:
        return <ShoppingBag className="w-3.5 h-3.5 text-[#e3a157]" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Description & Metrics Card */}
      <div className="bg-[#35160e]/80 border border-[#dab38c]/20 rounded-2xl p-5 text-[#f5edeb] backdrop-blur-md space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#e3a157]" />
              <h2 className="font-display font-bold text-lg text-[#f5edeb]">
                Hero Showcase & Special Listings Manager
              </h2>
            </div>
            <p className="text-xs text-[#dab38c]/80 leading-relaxed max-w-2xl">
              Manage the curated card deck showcased on the homepage hero
              banner. Reorder cards using the arrows to adjust display priority,
              click to preview live listings, or add new experiences and
              artisanal goods.
            </p>
          </div>

          {/* Quick Balance Counter */}
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-[11px] font-semibold text-[#dab38c] bg-[#29100b] px-3 py-1 rounded-full border border-[#dab38c]/20">
              Total Featured: {spotlightListings.length}
            </span>
            <span className="text-[11px] text-[#dab38c]/80 bg-[#29100b] px-2.5 py-1 rounded-full border border-[#dab38c]/20">
              Walks: {categoryCounts["walks"] || 0}
            </span>
            <span className="text-[11px] text-[#dab38c]/80 bg-[#29100b] px-2.5 py-1 rounded-full border border-[#dab38c]/20">
              Workshops: {categoryCounts["workshops"] || 0}
            </span>
            <span className="text-[11px] text-[#dab38c]/80 bg-[#29100b] px-2.5 py-1 rounded-full border border-[#dab38c]/20">
              Food: {categoryCounts["food"] || 0}
            </span>
            <span className="text-[11px] text-[#dab38c]/80 bg-[#29100b] px-2.5 py-1 rounded-full border border-[#dab38c]/20">
              Goods: {categoryCounts["goods"] || 0}
            </span>
          </div>
        </div>

        {/* Add Listing Bar */}
        {availableToAdd.length > 0 && (
          <div className="pt-3 border-t border-[#dab38c]/15 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <div className="flex-1">
              <select
                value={selectedToAdd}
                onChange={(e) => setSelectedToAdd(e.target.value)}
                className="w-full text-xs bg-[#29100b] text-[#f5edeb] border border-[#dab38c]/30 rounded-xl px-3 py-2.5 outline-none focus:border-[#e3a157]"
              >
                <option value="">
                  -- Select an active listing to add to hero spotlight --
                </option>
                {availableToAdd.map((item) => (
                  <option key={item.id} value={item.id}>
                    [{item.pillar?.toUpperCase() || item.type.toUpperCase()}]{" "}
                    {item.title} ({formatINR(item.price_inr)})
                  </option>
                ))}
              </select>
            </div>
            <button
              onClick={handleAdd}
              disabled={!selectedToAdd}
              className="px-4 py-2.5 rounded-xl bg-[#e3a157] hover:bg-[#dab38c] text-[#29100b] font-bold text-xs transition-colors flex items-center justify-center gap-1.5 disabled:opacity-40 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add to Spotlight</span>
            </button>
          </div>
        )}
      </div>

      {/* Ordered Spotlight List */}
      <div className="bg-[#29100b] border border-[#dab38c]/20 rounded-2xl overflow-hidden shadow-lg">
        <div className="p-4 border-b border-[#dab38c]/15 flex items-center justify-between">
          <span className="text-xs font-bold text-[#dab38c] uppercase tracking-wider">
            Active Hero Deck Sequence ({spotlightListings.length} Cards)
          </span>
          <span className="text-[11px] text-[#dab38c]/60">
            Card 1 appears on the far-left of the hero banner
          </span>
        </div>

        {spotlightListings.length === 0 ? (
          <div className="p-12 text-center text-[#dab38c]/60 text-xs">
            No listings currently added to the spotlight. Add listings above to
            populate the hero banner.
          </div>
        ) : (
          <div className="divide-y divide-[#dab38c]/10">
            {spotlightListings.map((listing, index) => {
              const detailPath =
                listing.type === "experience"
                  ? `/experience/${listing.slug}`
                  : `/product/${listing.slug}`;

              const isFirst = index === 0;
              const isLast = index === spotlightListings.length - 1;

              return (
                <div
                  key={listing.id}
                  className="p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 hover:bg-[#35160e]/50 transition-colors"
                >
                  {/* Left: Sequence Badge + Thumbnail + Details */}
                  <div className="flex items-center gap-3.5 min-w-0 flex-1">
                    {/* Position Badge */}
                    <div className="w-8 h-8 rounded-xl bg-[#35160e] border border-[#dab38c]/30 text-[#e3a157] font-bold text-xs flex items-center justify-center shrink-0">
                      #{index + 1}
                    </div>

                    {/* Image Thumbnail */}
                    <img
                      src={listing.images[0]}
                      alt={listing.title}
                      className="w-14 h-11 object-cover rounded-lg border border-[#dab38c]/20 shrink-0"
                    />

                    {/* Title & Metadata */}
                    <div className="min-w-0 space-y-0.5">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-display font-semibold text-xs sm:text-sm text-[#f5edeb] truncate">
                          {listing.title}
                        </span>
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#35160e] border border-[#dab38c]/20 text-[10px] font-bold uppercase text-[#e3a157]">
                          {getPillarIcon(listing.pillar)}
                          <span>{listing.pillar || listing.type}</span>
                        </span>
                      </div>
                      <div className="text-[11px] text-[#dab38c]/70 flex items-center gap-3 flex-wrap">
                        <span>Price: {formatINR(listing.price_inr)}</span>
                        <span>•</span>
                        <span>Host/Artisan: {listing.host_name}</span>
                        <span>•</span>
                        <span className="text-[#dab38c]/50">
                          Slug: {listing.slug}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Right: Actions (Move Up, Move Down, View Live, Remove) */}
                  <div className="flex items-center gap-1.5 self-end sm:self-auto shrink-0">
                    {/* Move Up */}
                    <button
                      onClick={() => onReorder(index, index - 1)}
                      disabled={isFirst}
                      title="Move card left/earlier in sequence"
                      className="p-2 rounded-lg bg-[#35160e] hover:bg-[#5d3a24] text-[#dab38c] hover:text-[#f5edeb] border border-[#dab38c]/20 disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer"
                    >
                      <ArrowUp className="w-4 h-4" />
                    </button>

                    {/* Move Down */}
                    <button
                      onClick={() => onReorder(index, index + 1)}
                      disabled={isLast}
                      title="Move card right/later in sequence"
                      className="p-2 rounded-lg bg-[#35160e] hover:bg-[#5d3a24] text-[#dab38c] hover:text-[#f5edeb] border border-[#dab38c]/20 disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer"
                    >
                      <ArrowDown className="w-4 h-4" />
                    </button>

                    {/* View Live Listing */}
                    <a
                      href={detailPath}
                      target="_blank"
                      rel="noreferrer"
                      title="View listing live on site"
                      className="px-3 py-2 rounded-lg bg-[#35160e] hover:bg-[#5d3a24] text-[#e3a157] hover:text-[#f5edeb] border border-[#dab38c]/20 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>View Live ↗</span>
                    </a>

                    {/* Remove from Spotlight */}
                    <button
                      onClick={() => onToggle(listing.id)}
                      title="Remove from hero spotlight deck"
                      className="p-2 rounded-lg bg-rose-950/40 hover:bg-rose-900/60 text-rose-300 hover:text-rose-100 border border-rose-800/40 transition-colors cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
