import React, { useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { Listing } from "../../types";
import { formatINR } from "../../lib/utils";

interface SpecialListingsManagerProps {
  listings: Listing[];
  spotlightListingIds: string[];
  onReorder: (fromIndex: number, toIndex: number) => void;
  onToggle: (listingId: string) => void;
}

const PILLAR_ICONS: Record<string, string> = {
  walks: "≈",
  workshops: "◈",
  food: "◐",
  goods: "⬢",
};

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

  const handleAdd = () => {
    if (!selectedToAdd) return;
    onToggle(selectedToAdd);
    setSelectedToAdd("");
  };

  return (
    <div className="space-y-6">
      {/* Spotlight Curate Card */}
      <div className="admin-card overflow-hidden">
        {/* Add listing toolbar */}
        <div className="p-5 border-b border-[var(--admin-border-soft)] flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <div className="flex-1">
            <select
              value={selectedToAdd}
              onChange={(e) => setSelectedToAdd(e.target.value)}
              className="admin-select w-full"
            >
              <option value="">
                — Select an active listing to add to spotlight —
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
            className="admin-btn admin-btn-primary text-xs font-bold disabled:opacity-40"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>+ Add to spotlight</span>
          </button>
        </div>

        {/* Ordered Deck Rows */}
        {spotlightListings.length === 0 ? (
          <div className="p-12 text-center text-[var(--admin-muted)] text-sm">
            <p className="font-display font-semibold text-2xl text-[var(--admin-fg)] mb-1">
              No spotlight cards assigned
            </p>
            <p>Select a listing above to feature in the homepage hero deck.</p>
          </div>
        ) : (
          <div>
            {spotlightListings.map((listing, index) => {
              const detailPath =
                listing.type === "experience"
                  ? `/experience/${listing.slug}`
                  : `/product/${listing.slug}`;

              const isFirst = index === 0;
              const isLast = index === spotlightListings.length - 1;
              const pillarKey = listing.pillar || "walks";
              const iconSymbol = PILLAR_ICONS[pillarKey] || "◈";

              return (
                <div
                  key={listing.id}
                  className="admin-hero-row flex-wrap sm:flex-nowrap"
                >
                  <span className="admin-rank">#{index + 1}</span>

                  <span className="admin-thumb">
                    {listing.images && listing.images[0] ? (
                      <img
                        src={listing.images[0]}
                        alt={listing.title}
                        className="w-full h-full object-cover rounded-[11px]"
                      />
                    ) : (
                      iconSymbol
                    )}
                  </span>

                  <div className="flex-1 min-w-0">
                    <b className="text-[14.5px] text-[var(--admin-fg)] block truncate">
                      {listing.title}
                    </b>
                    <div className="text-[12.5px] text-[var(--admin-faint)] truncate">
                      {formatINR(listing.price_inr)} ·{" "}
                      {listing.pillar || listing.type} · {listing.host_name}
                    </div>
                  </div>

                  <span
                    className={`admin-pill ${
                      index === 0 ? "admin-pill-amber" : "admin-pill-line"
                    }`}
                  >
                    {listing.pillar || listing.type}
                  </span>

                  <div className="flex items-center gap-2">
                    <button
                      className="admin-icon-btn"
                      disabled={isFirst}
                      onClick={() => onReorder(index, index - 1)}
                      aria-label="Move card up"
                      title="Move up"
                    >
                      ↑
                    </button>
                    <button
                      className="admin-icon-btn"
                      disabled={isLast}
                      onClick={() => onReorder(index, index + 1)}
                      aria-label="Move card down"
                      title="Move down"
                    >
                      ↓
                    </button>

                    <a
                      href={detailPath}
                      target="_blank"
                      rel="noreferrer"
                      className="admin-btn admin-btn-quiet text-xs"
                    >
                      View live ↗
                    </a>

                    <button
                      onClick={() => onToggle(listing.id)}
                      className="admin-icon-btn text-[var(--admin-muted)] hover:text-rose-600"
                      title="Remove from spotlight"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
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
