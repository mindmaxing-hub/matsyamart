import React, { useState, useMemo } from "react";
import { HeroBanner } from "../components/catalog/HeroBanner";
import { CategoryFilter } from "../components/catalog/CategoryFilter";
import { ListingCard } from "../components/catalog/ListingCard";
import { useData } from "../context/DataContext";
import { ListingType } from "../types";
import {
  ShieldCheck,
  HeartHandshake,
  Compass,
  Waves,
  Sparkles,
} from "lucide-react";

export const HomePage: React.FC = () => {
  const { listings, categories } = useData();

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedLocation, setSelectedLocation] = useState("all");
  const [selectedType, setSelectedType] = useState<"all" | ListingType>("all");
  const [selectedCategorySlug, setSelectedCategorySlug] = useState("all");

  // Extract unique locations from active listings
  const uniqueLocations = useMemo(() => {
    const set = new Set<string>();
    listings.forEach((l) => {
      if (l.location_name) {
        // e.g. "Versova Koliwada, Andheri West, Mumbai" -> "Versova Koliwada"
        const primary = l.location_name.split(",")[0]?.trim();
        if (primary) {
          set.add(primary);
        }
      }
    });
    return Array.from(set);
  }, [listings]);

  // Filter listings
  const filteredListings = useMemo(() => {
    return listings.filter((item) => {
      // Type filter
      if (selectedType !== "all" && item.type !== selectedType) {
        return false;
      }

      // Category filter
      if (selectedCategorySlug !== "all") {
        const cat = categories.find((c) => c.slug === selectedCategorySlug);
        if (cat && item.category_id !== cat.id) {
          return false;
        }
      }

      // Location filter
      if (selectedLocation !== "all") {
        const loc = item.location_name || item.artisan_collective || "";
        if (!loc.toLowerCase().includes(selectedLocation.toLowerCase())) {
          return false;
        }
      }

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const inTitle = item.title.toLowerCase().includes(q);
        const inDesc = item.full_description.toLowerCase().includes(q);
        const inHost = item.host_name.toLowerCase().includes(q);
        const inLoc = (item.location_name || item.artisan_collective || "")
          .toLowerCase()
          .includes(q);
        if (!inTitle && !inDesc && !inHost && !inLoc) {
          return false;
        }
      }

      return true;
    });
  }, [
    listings,
    categories,
    selectedType,
    selectedCategorySlug,
    selectedLocation,
    searchQuery,
  ]);

  return (
    <div className="space-y-12 pb-20">
      {/* Hero Documentary Banner */}
      <HeroBanner
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        selectedLocation={selectedLocation}
        setSelectedLocation={setSelectedLocation}
        uniqueLocations={uniqueLocations}
      />

      {/* Main Catalog Section */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Filters */}
        <CategoryFilter
          categories={categories}
          selectedType={selectedType}
          setSelectedType={setSelectedType}
          selectedCategorySlug={selectedCategorySlug}
          setSelectedCategorySlug={setSelectedCategorySlug}
          totalListingsCount={listings.length}
        />

        {/* Listings Grid */}
        {filteredListings.length === 0 ? (
          <div className="p-12 text-center bg-white rounded-3xl border border-slate-200 shadow-xs space-y-3">
            <Compass className="w-10 h-10 text-slate-300 mx-auto" />
            <h3 className="font-display font-bold text-lg text-slate-700">
              No coastal offerings found
            </h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              We couldn't find any tours or artisan items matching your search
              criteria. Try resetting filters or searching for general terms
              like "Versova" or "Fish".
            </p>
            <button
              onClick={() => {
                setSearchQuery("");
                setSelectedLocation("all");
                setSelectedType("all");
                setSelectedCategorySlug("all");
              }}
              className="mt-2 px-4 py-2 text-xs font-semibold text-ocean-800 bg-ocean-100 hover:bg-ocean-200 rounded-xl transition-colors"
            >
              Reset All Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredListings.map((listing) => (
              <ListingCard key={listing.id} listing={listing} />
            ))}
          </div>
        )}

        {/* Community Manifesto Section */}
        <section className="mt-16 bg-ocean-900 text-white rounded-3xl p-8 sm:p-12 border border-ocean-700 relative overflow-hidden shadow-tactile">
          <div className="absolute right-0 bottom-0 opacity-10 pointer-events-none translate-x-12 translate-y-12">
            <Waves className="w-96 h-96" />
          </div>

          <div className="relative z-10 max-w-3xl space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-ocean-800 border border-ocean-600 text-sun-300 text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5" />
              <span>The MatsyaMart Community Charter</span>
            </div>

            <h2 className="font-display font-bold text-2xl sm:text-4xl text-white">
              Centering Indigenous Livelihoods, Ending Tourism Middlemen
            </h2>

            <p className="text-xs sm:text-sm text-ocean-100 leading-relaxed">
              Koliwadas are Mumbai's living ecological cradle. For decades,
              commercial tour operators and commercial seafood aggregators have
              extracted stories and profits while leaving community guides
              undercompensated.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-4 border-t border-ocean-700/80">
              <div className="space-y-1">
                <div className="text-sun-300 font-display font-bold text-2xl">
                  100%
                </div>
                <div className="text-xs font-semibold text-white">
                  Direct Payouts
                </div>
                <p className="text-[11px] text-ocean-200">
                  Tour revenues transfer directly to guide bank accounts without
                  platform cut.
                </p>
              </div>

              <div className="space-y-1">
                <div className="text-sun-300 font-display font-bold text-2xl">
                  Bachat Gats
                </div>
                <div className="text-xs font-semibold text-white">
                  Women Collectives
                </div>
                <p className="text-[11px] text-ocean-200">
                  Sun-dried seafood and masalas are packaged by certified
                  coastal women's collectives.
                </p>
              </div>

              <div className="space-y-1">
                <div className="text-sun-300 font-display font-bold text-2xl">
                  Zero Waste
                </div>
                <div className="text-xs font-semibold text-white">
                  Ecological Care
                </div>
                <p className="text-[11px] text-ocean-200">
                  Small batch tours strictly limited to safe capacities
                  respecting tidal estuaries.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};
