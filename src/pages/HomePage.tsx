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
  Search,
  MapPin,
  X,
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
    <div className="bg-[#001D28] text-white min-h-screen space-y-12 sm:space-y-16 pb-24 selection:bg-sun-300 selection:text-ocean-950">
      {/* 1. Minimal Lu.ma Hero (Zero text bloat, 3-line punchy typography) */}
      <HeroBanner onScrollToCatalog={scrollToCatalog} />

      {/* 2. Main Discovery Section */}
      <main
        id="catalog-feed"
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12 sm:space-y-16"
      >
        {/* 2. Lu.ma Signature "Browse by Category" Squircle Tile Grid */}
        <section className="space-y-4 pt-2">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-display font-bold text-xl sm:text-2xl text-white tracking-tight">
                Browse by Category
              </h2>
              <p className="text-xs text-ocean-200 mt-0.5">
                4 pillars of living coastal culture and heritage
              </p>
            </div>
            {selectedPillar !== "all" && (
              <button
                onClick={() => setSelectedPillar("all")}
                className="text-xs text-sun-300 hover:underline cursor-pointer"
              >
                Show All Categories
              </button>
            )}
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
            {/* Pillar 1: Walks */}
            <button
              onClick={() => {
                setSelectedPillar("walks");
                scrollToCatalog();
              }}
              className={`p-4 sm:p-5 rounded-2xl sm:rounded-3xl border transition-all text-left space-y-3 cursor-pointer group backdrop-blur-md shadow-md hover:-translate-y-0.5 ${
                selectedPillar === "walks"
                  ? "bg-[#00384C] border-sun-300 ring-2 ring-sun-300/40"
                  : "bg-[#002836]/90 hover:bg-[#00384C] border-white/15 hover:border-white/30"
              }`}
            >
              <div className="w-10 h-10 rounded-2xl bg-[#00AFEF]/15 border border-[#00AFEF]/30 flex items-center justify-center text-[#4DC6F4] group-hover:scale-110 transition-transform">
                <Compass className="w-5 h-5" />
              </div>
              <div>
                <div className="font-display font-bold text-sm sm:text-base text-white group-hover:text-sun-300 transition-colors">
                  Walks
                </div>
                <div className="text-[11px] text-ocean-200 font-medium">
                  {pillarCounts.walks || 0} Experiences
                </div>
              </div>
            </button>

            {/* Pillar 2: Workshops */}
            <button
              onClick={() => {
                setSelectedPillar("workshops");
                scrollToCatalog();
              }}
              className={`p-4 sm:p-5 rounded-2xl sm:rounded-3xl border transition-all text-left space-y-3 cursor-pointer group backdrop-blur-md shadow-md hover:-translate-y-0.5 ${
                selectedPillar === "workshops"
                  ? "bg-[#00384C] border-sun-300 ring-2 ring-sun-300/40"
                  : "bg-[#002836]/90 hover:bg-[#00384C] border-white/15 hover:border-white/30"
              }`}
            >
              <div className="w-10 h-10 rounded-2xl bg-[#FFDE59]/15 border border-[#FFDE59]/30 flex items-center justify-center text-sun-300 group-hover:scale-110 transition-transform">
                <Hammer className="w-5 h-5" />
              </div>
              <div>
                <div className="font-display font-bold text-sm sm:text-base text-white group-hover:text-sun-300 transition-colors">
                  Workshops
                </div>
                <div className="text-[11px] text-ocean-200 font-medium">
                  {pillarCounts.workshops || 0} Masterclasses
                </div>
              </div>
            </button>

            {/* Pillar 3: Food */}
            <button
              onClick={() => {
                setSelectedPillar("food");
                scrollToCatalog();
              }}
              className={`p-4 sm:p-5 rounded-2xl sm:rounded-3xl border transition-all text-left space-y-3 cursor-pointer group backdrop-blur-md shadow-md hover:-translate-y-0.5 ${
                selectedPillar === "food"
                  ? "bg-[#00384C] border-sun-300 ring-2 ring-sun-300/40"
                  : "bg-[#002836]/90 hover:bg-[#00384C] border-white/15 hover:border-white/30"
              }`}
            >
              <div className="w-10 h-10 rounded-2xl bg-[#F59E0B]/15 border border-[#F59E0B]/30 flex items-center justify-center text-amber-400 group-hover:scale-110 transition-transform">
                <UtensilsCrossed className="w-5 h-5" />
              </div>
              <div>
                <div className="font-display font-bold text-sm sm:text-base text-white group-hover:text-sun-300 transition-colors">
                  Food & Feasts
                </div>
                <div className="text-[11px] text-ocean-200 font-medium">
                  {pillarCounts.food || 0} Feasts
                </div>
              </div>
            </button>

            {/* Pillar 4: Goods */}
            <button
              onClick={() => {
                setSelectedPillar("goods");
                scrollToCatalog();
              }}
              className={`p-4 sm:p-5 rounded-2xl sm:rounded-3xl border transition-all text-left space-y-3 cursor-pointer group backdrop-blur-md shadow-md hover:-translate-y-0.5 ${
                selectedPillar === "goods"
                  ? "bg-[#00384C] border-sun-300 ring-2 ring-sun-300/40"
                  : "bg-[#002836]/90 hover:bg-[#00384C] border-white/15 hover:border-white/30"
              }`}
            >
              <div className="w-10 h-10 rounded-2xl bg-[#10B981]/15 border border-[#10B981]/30 flex items-center justify-center text-emerald-400 group-hover:scale-110 transition-transform">
                <ShoppingBag className="w-5 h-5" />
              </div>
              <div>
                <div className="font-display font-bold text-sm sm:text-base text-white group-hover:text-sun-300 transition-colors">
                  Artisan Goods
                </div>
                <div className="text-[11px] text-ocean-200 font-medium">
                  {pillarCounts.goods || 0} Pantry Crafts
                </div>
              </div>
            </button>
          </div>
        </section>

        {/* 3. Prominent Command Search & Discovery Bar */}
        <section className="space-y-4">
          <div className="bg-white/10 hover:bg-white/15 focus-within:bg-white/20 backdrop-blur-xl border border-white/20 focus-within:border-sun-300 rounded-3xl sm:rounded-full p-2 sm:p-2.5 shadow-xl transition-all max-w-2xl mx-auto flex flex-col sm:flex-row items-center gap-2 group">
            {/* Search Input Field */}
            <div className="flex items-center gap-2 pl-3 sm:pl-4 flex-1 min-w-0 w-full sm:w-auto">
              <Search className="w-5 h-5 text-sun-300 shrink-0 group-focus-within:scale-110 transition-transform" />
              <input
                type="text"
                placeholder="Search walks, workshops, feasts, crafts..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-transparent border-none outline-none text-sm sm:text-base text-white placeholder:text-white/60 font-normal py-1.5"
              />
            </div>

            {/* Location Selector Divider */}
            <div className="hidden sm:block h-7 w-[1px] bg-white/20 mx-1" />

            {/* Location Dropdown */}
            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-white/10 sm:bg-transparent rounded-full sm:rounded-none w-full sm:w-auto shrink-0">
              <MapPin className="w-4 h-4 text-ocean-300 shrink-0" />
              <select
                value={selectedLocation}
                onChange={(e) => setSelectedLocation(e.target.value)}
                className="bg-transparent border-none outline-none text-xs sm:text-sm text-white font-medium cursor-pointer pr-1 w-full sm:w-auto"
              >
                <option value="all" className="bg-[#003B4F] text-white">
                  All Locations
                </option>
                {uniqueLocations.map((loc) => (
                  <option
                    key={loc}
                    value={loc}
                    className="bg-[#003B4F] text-white"
                  >
                    {loc}
                  </option>
                ))}
              </select>
            </div>

            {/* Clear Button if active */}
            {searchQuery || selectedLocation !== "all" ? (
              <button
                onClick={() => {
                  setSearchQuery("");
                  setSelectedLocation("all");
                }}
                className="w-full sm:w-auto px-4 py-2 rounded-full bg-white/10 hover:bg-white/20 text-xs font-semibold text-white cursor-pointer flex items-center justify-center gap-1"
              >
                <X className="w-3.5 h-3.5" />
                <span>Clear</span>
              </button>
            ) : null}
          </div>

          {/* Quick Suggestion Chips */}
          <div className="flex flex-wrap items-center justify-center gap-2 text-xs text-white/70">
            <span className="font-semibold text-white/50 text-[11px]">
              Popular:
            </span>
            {[
              { label: "Dawn Harbor Walk", query: "Harbor Walk" },
              { label: "Net-Weaving Class", query: "Net-Weaving" },
              { label: "Crab Feast", query: "Crab" },
              { label: "Mangrove Safari", query: "Mangrove" },
              { label: "Sun-Dried Jawla", query: "Jawla" },
            ].map((chip) => (
              <button
                key={chip.label}
                type="button"
                onClick={() => setSearchQuery(chip.query)}
                className="px-3 py-1 rounded-full bg-white/10 hover:bg-white/20 border border-white/15 text-white/90 hover:text-white transition-all cursor-pointer text-[11px]"
              >
                {chip.label}
              </button>
            ))}
          </div>
        </section>

        {/* 4. Category Pills Filter Bar */}
        <CategoryFilter
          categories={categories}
          selectedPillar={selectedPillar}
          setSelectedPillar={setSelectedPillar}
          totalListingsCount={listings.length}
          pillarCounts={pillarCounts}
        />

        {/* 5. Filtered Results OR One-by-One Discovery Rails */}
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
              <div className="p-12 text-center bg-[#002E3D]/80 backdrop-blur-md rounded-3xl border border-white/15 space-y-3">
                <Compass className="w-8 h-8 text-ocean-300 mx-auto" />
                <h3 className="font-display font-bold text-base text-white">
                  No offerings found
                </h3>
                <p className="text-xs text-ocean-200 max-w-sm mx-auto">
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
          /* Default Feed: One-By-One Pillars with Lu.ma Mobile Touch-Swipe Rails */
          <div className="space-y-16">
            {/* Pillar 1: Walks */}
            <section id="walks" className="space-y-4 scroll-mt-24">
              <div className="flex items-end justify-between border-b border-white/10 pb-3">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-lg bg-[#00AFEF]/15 border border-[#00AFEF]/30 flex items-center justify-center text-[#4DC6F4]">
                      <Compass className="w-3.5 h-3.5" />
                    </div>
                    <h2 className="font-display font-bold text-lg sm:text-xl text-white">
                      Coastal Walks & Safaris
                    </h2>
                  </div>
                  <p className="text-xs text-ocean-200">
                    Guided dawn village harbor trails and tidal mangrove boat
                    safaris.
                  </p>
                </div>
              </div>

              {/* Mobile horizontal swipe / Desktop grid */}
              <div className="flex sm:grid overflow-x-auto sm:overflow-x-visible snap-x snap-mandatory sm:snap-none sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6 scrollbar-none pb-2 -mx-4 px-4 sm:mx-0 sm:px-0">
                {walksListings.map((listing) => (
                  <ListingCard key={listing.id} listing={listing} />
                ))}
              </div>
            </section>

            {/* Pillar 2: Workshops */}
            <section id="workshops" className="space-y-4 scroll-mt-24">
              <div className="flex items-end justify-between border-b border-white/10 pb-3">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-lg bg-[#FFDE59]/15 border border-[#FFDE59]/30 flex items-center justify-center text-sun-300">
                      <Hammer className="w-3.5 h-3.5" />
                    </div>
                    <h2 className="font-display font-bold text-lg sm:text-xl text-white">
                      Traditional Workshops & Crafts
                    </h2>
                  </div>
                  <p className="text-xs text-ocean-200">
                    Hands-on masterclasses in net-weaving and wooden boat
                    carpentry.
                  </p>
                </div>
              </div>

              {/* Mobile horizontal swipe / Desktop grid */}
              <div className="flex sm:grid overflow-x-auto sm:overflow-x-visible snap-x snap-mandatory sm:snap-none sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6 scrollbar-none pb-2 -mx-4 px-4 sm:mx-0 sm:px-0">
                {workshopsListings.map((listing) => (
                  <ListingCard key={listing.id} listing={listing} />
                ))}
              </div>
            </section>

            {/* Pillar 3: Food */}
            <section id="food" className="space-y-4 scroll-mt-24">
              <div className="flex items-end justify-between border-b border-white/10 pb-3">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-lg bg-[#F59E0B]/15 border border-[#F59E0B]/30 flex items-center justify-center text-amber-400">
                      <UtensilsCrossed className="w-3.5 h-3.5" />
                    </div>
                    <h2 className="font-display font-bold text-lg sm:text-xl text-white">
                      Coastal Food & Feasts
                    </h2>
                  </div>
                  <p className="text-xs text-ocean-200">
                    Authentic harbor breakfasts, crab curries, and home-cooked
                    seafood dining.
                  </p>
                </div>
              </div>

              {/* Mobile horizontal swipe / Desktop grid */}
              <div className="flex sm:grid overflow-x-auto sm:overflow-x-visible snap-x snap-mandatory sm:snap-none sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6 scrollbar-none pb-2 -mx-4 px-4 sm:mx-0 sm:px-0">
                {foodListings.map((listing) => (
                  <ListingCard key={listing.id} listing={listing} />
                ))}
              </div>
            </section>

            {/* Pillar 4: Goods */}
            <section id="goods" className="space-y-4 scroll-mt-24">
              <div className="flex items-end justify-between border-b border-white/10 pb-3">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-lg bg-[#10B981]/15 border border-[#10B981]/30 flex items-center justify-center text-emerald-400">
                      <ShoppingBag className="w-3.5 h-3.5" />
                    </div>
                    <h2 className="font-display font-bold text-lg sm:text-xl text-white">
                      Artisan Goods & Pantry
                    </h2>
                  </div>
                  <p className="text-xs text-ocean-200">
                    Naturally sun-cured seasonal catch, stoneground spices, and
                    wild mangrove honey.
                  </p>
                </div>
              </div>

              {/* Mobile horizontal swipe / Desktop grid */}
              <div className="flex sm:grid overflow-x-auto sm:overflow-x-visible snap-x snap-mandatory sm:snap-none sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6 scrollbar-none pb-2 -mx-4 px-4 sm:mx-0 sm:px-0">
                {goodsListings.map((listing) => (
                  <ListingCard key={listing.id} listing={listing} />
                ))}
              </div>
            </section>
          </div>
        )}

        {/* 6. Lu.ma-Style Bottom CTA Banner with Bhoomiputra Ocean Gradient */}
        <section className="pt-8 pb-4">
          <div className="max-w-3xl mx-auto p-8 sm:p-12 rounded-3xl bg-gradient-to-br from-[#003B4F] via-[#004A63] to-[#002E3D] border border-white/20 shadow-2xl relative overflow-hidden text-center space-y-6">
            <div className="max-w-xl mx-auto space-y-3">
              <h2 className="font-display font-bold text-3xl sm:text-5xl text-white tracking-tight leading-tight">
                Your next unforgettable <br />
                <span className="text-sun-300">coastal memory awaits.</span>
              </h2>
              <p className="text-xs sm:text-sm text-ocean-100">
                Immerse yourself in living coastal culture with verified local
                guides, hosts, and artisanal collectives.
              </p>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-3">
              <button
                onClick={scrollToCatalog}
                className="px-6 py-3 rounded-full bg-sun-300 hover:bg-sun-200 text-ocean-950 font-bold text-xs sm:text-sm transition-all shadow-md hover:scale-105 active:scale-95 cursor-pointer"
              >
                Discover Experiences
              </button>
              <Link
                to="/host-with-us"
                className="px-6 py-3 rounded-full bg-white/10 text-white font-semibold text-xs sm:text-sm hover:bg-white/20 border border-white/20 transition-all hover:scale-105 active:scale-95"
              >
                Partner With Us
              </Link>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};
