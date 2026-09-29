import React, { useState, useMemo } from "react";
import { HeroBanner } from "../components/catalog/HeroBanner";
import { CategoryFilter } from "../components/catalog/CategoryFilter";
import { ListingCard } from "../components/catalog/ListingCard";
import { useData } from "../context/DataContext";
import { PillarType, Listing } from "../types";
import {
  Compass,
  Hammer,
  UtensilsCrossed,
  ShoppingBag,
  ArrowRight,
  Plus,
  Sparkles,
} from "lucide-react";
import { Link } from "../components/ui/Link";

export const HomePage: React.FC = () => {
  const { listings, categories } = useData();

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedLocation, setSelectedLocation] = useState("all");
  const [selectedPillar, setSelectedPillar] = useState<"all" | PillarType>(
    "all",
  );

  // Extract unique locations from active listings
  const uniqueLocations = useMemo(() => {
    const set = new Set<string>();
    listings.forEach((l) => {
      if (l.location_name) {
        const primary = l.location_name.split(",")[0]?.trim();
        if (primary) {
          set.add(primary);
        }
      }
    });
    return Array.from(set);
  }, [listings]);

  // Pillar counts
  const pillarCounts: Record<PillarType, number> = useMemo(() => {
    const counts: Record<PillarType, number> = {
      walks: 0,
      workshops: 0,
      food: 0,
      goods: 0,
    };
    listings.forEach((item) => {
      if (item.pillar && item.pillar in counts) {
        counts[item.pillar] += 1;
      }
    });
    return counts;
  }, [listings]);

  // Filter listings
  const filteredListings = useMemo(() => {
    return listings.filter((item) => {
      // Pillar filter
      if (selectedPillar !== "all" && item.pillar !== selectedPillar) {
        return false;
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
  }, [listings, selectedPillar, selectedLocation, searchQuery]);

  // Specific groups for the 4 pillars (one-by-one presentation)
  const walksListings = useMemo(
    () => listings.filter((l) => l.pillar === "walks"),
    [listings],
  );
  const workshopsListings = useMemo(
    () => listings.filter((l) => l.pillar === "workshops"),
    [listings],
  );
  const foodListings = useMemo(
    () => listings.filter((l) => l.pillar === "food"),
    [listings],
  );
  const goodsListings = useMemo(
    () => listings.filter((l) => l.pillar === "goods"),
    [listings],
  );

  const scrollToCatalog = () => {
    const el = document.getElementById("catalog-feed");
    el?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="bg-[#030D12] text-white min-h-screen space-y-16 pb-24 selection:bg-sun-300 selection:text-ocean-950">
      {/* 1. Lu.ma Animated Hero Banner */}
      <HeroBanner
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        selectedLocation={selectedLocation}
        setSelectedLocation={setSelectedLocation}
        uniqueLocations={uniqueLocations}
        onScrollToCatalog={scrollToCatalog}
      />

      {/* 2. Main Feed Section */}
      <main
        id="catalog-feed"
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16"
      >
        {/* Category Pills & Quick Filter */}
        <CategoryFilter
          categories={categories}
          selectedPillar={selectedPillar}
          setSelectedPillar={setSelectedPillar}
          totalListingsCount={listings.length}
          pillarCounts={pillarCounts}
        />

        {/* If user filtered or searched, show direct results */}
        {selectedPillar !== "all" ||
        searchQuery ||
        selectedLocation !== "all" ? (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="font-display font-bold text-xl sm:text-2xl text-white">
                {selectedPillar !== "all"
                  ? `${selectedPillar.charAt(0).toUpperCase() + selectedPillar.slice(1)} Offerings`
                  : "Search Results"}
              </h2>
              <button
                onClick={() => {
                  setSelectedPillar("all");
                  setSearchQuery("");
                  setSelectedLocation("all");
                }}
                className="text-xs text-sun-300 hover:underline cursor-pointer"
              >
                Reset Filters
              </button>
            </div>

            {filteredListings.length === 0 ? (
              <div className="p-12 text-center bg-[#061822] rounded-3xl border border-white/10 space-y-3">
                <Compass className="w-8 h-8 text-slate-500 mx-auto" />
                <h3 className="font-display font-bold text-base text-slate-300">
                  No offerings found
                </h3>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  Try adjusting your search terms or view all coastal
                  categories.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredListings.map((listing) => (
                  <ListingCard key={listing.id} listing={listing} />
                ))}
              </div>
            )}
          </div>
        ) : (
          /* Default Feed: One-By-One Pillars as requested by Vikas */
          <div className="space-y-20">
            {/* Pillar 1: Walks */}
            <section id="walks" className="space-y-6 scroll-mt-24">
              <div className="flex items-end justify-between border-b border-white/10 pb-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-ocean-800 flex items-center justify-center text-sun-300">
                      <Compass className="w-4 h-4" />
                    </div>
                    <h2 className="font-display font-bold text-xl sm:text-2xl text-white">
                      Coastal Walks & Safaris
                    </h2>
                  </div>
                  <p className="text-xs text-slate-400">
                    Guided dawn village harbor trails and tidal mangrove boat
                    safaris.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {walksListings.map((listing) => (
                  <ListingCard key={listing.id} listing={listing} />
                ))}
              </div>
            </section>

            {/* Pillar 2: Workshops */}
            <section id="workshops" className="space-y-6 scroll-mt-24">
              <div className="flex items-end justify-between border-b border-white/10 pb-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-ocean-800 flex items-center justify-center text-sun-300">
                      <Hammer className="w-4 h-4" />
                    </div>
                    <h2 className="font-display font-bold text-xl sm:text-2xl text-white">
                      Traditional Workshops & Crafts
                    </h2>
                  </div>
                  <p className="text-xs text-slate-400">
                    Hands-on masterclasses in net-weaving, wooden boat
                    carpentry, and maritime knotting.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {workshopsListings.map((listing) => (
                  <ListingCard key={listing.id} listing={listing} />
                ))}
              </div>
            </section>

            {/* Pillar 3: Food */}
            <section id="food" className="space-y-6 scroll-mt-24">
              <div className="flex items-end justify-between border-b border-white/10 pb-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-ocean-800 flex items-center justify-center text-sun-300">
                      <UtensilsCrossed className="w-4 h-4" />
                    </div>
                    <h2 className="font-display font-bold text-xl sm:text-2xl text-white">
                      Coastal Food & Feasts
                    </h2>
                  </div>
                  <p className="text-xs text-slate-400">
                    Authentic harbor breakfasts, traditional crab curries, and
                    home-cooked seafood dining.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {foodListings.map((listing) => (
                  <ListingCard key={listing.id} listing={listing} />
                ))}
              </div>
            </section>

            {/* Pillar 4: Goods */}
            <section id="goods" className="space-y-6 scroll-mt-24">
              <div className="flex items-end justify-between border-b border-white/10 pb-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-ocean-800 flex items-center justify-center text-sun-300">
                      <ShoppingBag className="w-4 h-4" />
                    </div>
                    <h2 className="font-display font-bold text-xl sm:text-2xl text-white">
                      Artisan Goods & Pantry
                    </h2>
                  </div>
                  <p className="text-xs text-slate-400">
                    Naturally sun-cured seasonal catch, stoneground spices, and
                    wild mangrove honey.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {goodsListings.map((listing) => (
                  <ListingCard key={listing.id} listing={listing} />
                ))}
              </div>
            </section>
          </div>
        )}

        {/* 3. Browse by Category Grid (Lu.ma Screenshot 1 Style) */}
        <section className="pt-8 space-y-6 border-t border-white/10">
          <div className="space-y-1">
            <h2 className="font-display font-bold text-xl sm:text-2xl text-white">
              Browse by Pillar
            </h2>
            <p className="text-xs text-slate-400">
              Discover authentic offerings tailored to how you want to
              experience the coast.
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {/* Tile 1: Walks */}
            <button
              onClick={() => {
                setSelectedPillar("walks");
                scrollToCatalog();
              }}
              className="p-5 rounded-2xl bg-[#061822] hover:bg-[#0B2430] border border-white/10 hover:border-white/20 transition-all text-left space-y-3 cursor-pointer group"
            >
              <div className="w-9 h-9 rounded-xl bg-ocean-800/80 flex items-center justify-center text-sun-300 group-hover:scale-110 transition-transform">
                <Compass className="w-5 h-5" />
              </div>
              <div>
                <div className="font-display font-bold text-sm text-white group-hover:text-sun-300 transition-colors">
                  Walks
                </div>
                <div className="text-[11px] text-slate-400">
                  {pillarCounts.walks || 0} Experiences
                </div>
              </div>
            </button>

            {/* Tile 2: Workshops */}
            <button
              onClick={() => {
                setSelectedPillar("workshops");
                scrollToCatalog();
              }}
              className="p-5 rounded-2xl bg-[#061822] hover:bg-[#0B2430] border border-white/10 hover:border-white/20 transition-all text-left space-y-3 cursor-pointer group"
            >
              <div className="w-9 h-9 rounded-xl bg-ocean-800/80 flex items-center justify-center text-sun-300 group-hover:scale-110 transition-transform">
                <Hammer className="w-5 h-5" />
              </div>
              <div>
                <div className="font-display font-bold text-sm text-white group-hover:text-sun-300 transition-colors">
                  Workshops
                </div>
                <div className="text-[11px] text-slate-400">
                  {pillarCounts.workshops || 0} Masterclasses
                </div>
              </div>
            </button>

            {/* Tile 3: Food */}
            <button
              onClick={() => {
                setSelectedPillar("food");
                scrollToCatalog();
              }}
              className="p-5 rounded-2xl bg-[#061822] hover:bg-[#0B2430] border border-white/10 hover:border-white/20 transition-all text-left space-y-3 cursor-pointer group"
            >
              <div className="w-9 h-9 rounded-xl bg-ocean-800/80 flex items-center justify-center text-sun-300 group-hover:scale-110 transition-transform">
                <UtensilsCrossed className="w-5 h-5" />
              </div>
              <div>
                <div className="font-display font-bold text-sm text-white group-hover:text-sun-300 transition-colors">
                  Food & Dining
                </div>
                <div className="text-[11px] text-slate-400">
                  {pillarCounts.food || 0} Feasts
                </div>
              </div>
            </button>

            {/* Tile 4: Goods */}
            <button
              onClick={() => {
                setSelectedPillar("goods");
                scrollToCatalog();
              }}
              className="p-5 rounded-2xl bg-[#061822] hover:bg-[#0B2430] border border-white/10 hover:border-white/20 transition-all text-left space-y-3 cursor-pointer group"
            >
              <div className="w-9 h-9 rounded-xl bg-ocean-800/80 flex items-center justify-center text-sun-300 group-hover:scale-110 transition-transform">
                <ShoppingBag className="w-5 h-5" />
              </div>
              <div>
                <div className="font-display font-bold text-sm text-white group-hover:text-sun-300 transition-colors">
                  Artisan Goods
                </div>
                <div className="text-[11px] text-slate-400">
                  {pillarCounts.goods || 0} Pantry Items
                </div>
              </div>
            </button>
          </div>
        </section>

        {/* 4. Lu.ma-Style Bottom CTA Banner */}
        <section className="pt-12 pb-4 text-center space-y-6">
          <div className="max-w-xl mx-auto space-y-3">
            <h2 className="font-display font-bold text-3xl sm:text-5xl text-white tracking-tight leading-tight">
              Your next unforgettable <br />
              <span className="text-sun-300">memory awaits.</span>
            </h2>
            <p className="text-xs sm:text-sm text-slate-400">
              Immerse yourself in living coastal culture with verified local
              guides and artisans.
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3">
            <button
              onClick={scrollToCatalog}
              className="px-6 py-3 rounded-full bg-white text-ocean-950 font-bold text-xs sm:text-sm hover:bg-slate-100 transition-all shadow-md cursor-pointer"
            >
              Discover Experiences
            </button>
            <Link
              to="/host-with-us"
              className="px-6 py-3 rounded-full bg-white/10 text-white font-semibold text-xs sm:text-sm hover:bg-white/20 border border-white/20 transition-all"
            >
              Partner With Us
            </Link>
          </div>
        </section>
      </main>
    </div>
  );
};
