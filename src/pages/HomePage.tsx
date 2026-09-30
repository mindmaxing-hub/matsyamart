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
    <div className="bg-[#29100b] text-[#f5edeb] min-h-screen space-y-10 sm:space-y-14 pb-24 selection:bg-[#e3a157] selection:text-[#29100b]">
      {/* 1. Minimal Lu.ma Hero (Zero text bloat, 3-line punchy typography) */}
      <HeroBanner onScrollToCatalog={scrollToCatalog} />

      {/* 2. Main Discovery Section */}
      <main
        id="catalog-feed"
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10 sm:space-y-14"
      >
        {/* 2. Lu.ma Signature "Browse by Category" Squircle Tile Grid */}
        <section className="space-y-4 pt-0">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-display font-bold text-xl sm:text-2xl text-[#f5edeb] tracking-tight">
                Browse by Category
              </h2>
              <p className="text-xs text-[#dab38c] mt-0.5">
                4 pillars of living coastal culture and heritage
              </p>
            </div>
            {selectedPillar !== "all" && (
              <button
                onClick={() => setSelectedPillar("all")}
                className="text-xs text-[#e3a157] hover:underline cursor-pointer"
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
                  ? "bg-[#481f14] border-[#e3a157] ring-2 ring-[#e3a157]/40"
                  : "bg-[#35160e]/85 hover:bg-[#481f14] border-[#dab38c]/20 hover:border-[#e3a157]/40"
              }`}
            >
              <div className="w-10 h-10 rounded-2xl bg-[#e3a157]/15 border border-[#e3a157]/30 flex items-center justify-center text-[#e3a157] group-hover:scale-110 transition-transform">
                <Compass className="w-5 h-5 text-[#e3a157]" />
              </div>
              <div>
                <div className="font-display font-bold text-sm sm:text-base text-[#f5edeb] group-hover:text-[#e3a157] transition-colors">
                  Walks
                </div>
                <div className="text-[11px] text-[#dab38c] font-medium">
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
                  ? "bg-[#481f14] border-[#e3a157] ring-2 ring-[#e3a157]/40"
                  : "bg-[#35160e]/85 hover:bg-[#481f14] border-[#dab38c]/20 hover:border-[#e3a157]/40"
              }`}
            >
              <div className="w-10 h-10 rounded-2xl bg-[#e3a157]/15 border border-[#e3a157]/30 flex items-center justify-center text-[#e3a157] group-hover:scale-110 transition-transform">
                <Hammer className="w-5 h-5 text-[#e3a157]" />
              </div>
              <div>
                <div className="font-display font-bold text-sm sm:text-base text-[#f5edeb] group-hover:text-[#e3a157] transition-colors">
                  Workshops
                </div>
                <div className="text-[11px] text-[#dab38c] font-medium">
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
                  ? "bg-[#481f14] border-[#e3a157] ring-2 ring-[#e3a157]/40"
                  : "bg-[#35160e]/85 hover:bg-[#481f14] border-[#dab38c]/20 hover:border-[#e3a157]/40"
              }`}
            >
              <div className="w-10 h-10 rounded-2xl bg-[#e3a157]/15 border border-[#e3a157]/30 flex items-center justify-center text-[#e3a157] group-hover:scale-110 transition-transform">
                <UtensilsCrossed className="w-5 h-5 text-[#e3a157]" />
              </div>
              <div>
                <div className="font-display font-bold text-sm sm:text-base text-[#f5edeb] group-hover:text-[#e3a157] transition-colors">
                  Food & Feasts
                </div>
                <div className="text-[11px] text-[#dab38c] font-medium">
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
                  ? "bg-[#481f14] border-[#e3a157] ring-2 ring-[#e3a157]/40"
                  : "bg-[#35160e]/85 hover:bg-[#481f14] border-[#dab38c]/20 hover:border-[#e3a157]/40"
              }`}
            >
              <div className="w-10 h-10 rounded-2xl bg-[#e3a157]/15 border border-[#e3a157]/30 flex items-center justify-center text-[#e3a157] group-hover:scale-110 transition-transform">
                <ShoppingBag className="w-5 h-5 text-[#e3a157]" />
              </div>
              <div>
                <div className="font-display font-bold text-sm sm:text-base text-[#f5edeb] group-hover:text-[#e3a157] transition-colors">
                  Artisan Goods
                </div>
                <div className="text-[11px] text-[#dab38c] font-medium">
                  {pillarCounts.goods || 0} Pantry Crafts
                </div>
              </div>
            </button>
          </div>
        </section>

        {/* 3. Prominent Command Search & Discovery Bar */}
        <section className="space-y-4">
          <div className="bg-[#35160e]/90 hover:bg-[#3d1a11] focus-within:bg-[#481f14] backdrop-blur-xl border border-[#dab38c]/25 focus-within:border-[#e3a157] rounded-3xl sm:rounded-full p-2 sm:p-2.5 shadow-xl transition-all max-w-2xl mx-auto flex flex-col sm:flex-row items-center gap-2 group">
            {/* Search Input Field */}
            <div className="flex items-center gap-2 pl-3 sm:pl-4 flex-1 min-w-0 w-full sm:w-auto">
              <Search className="w-5 h-5 text-[#e3a157] shrink-0 group-focus-within:scale-110 transition-transform" />
              <input
                type="text"
                placeholder="Search walks, workshops, feasts, crafts..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-transparent border-none outline-none text-sm sm:text-base text-[#f5edeb] placeholder:text-[#dab38c]/60 font-normal py-1.5"
              />
            </div>

            {/* Location Selector Divider */}
            <div className="hidden sm:block h-7 w-[1px] bg-[#dab38c]/20 mx-1" />

            {/* Location Dropdown */}
            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-[#29100b]/50 sm:bg-transparent rounded-full sm:rounded-none w-full sm:w-auto shrink-0">
              <MapPin className="w-4 h-4 text-[#e3a157] shrink-0" />
              <select
                value={selectedLocation}
                onChange={(e) => setSelectedLocation(e.target.value)}
                className="bg-transparent border-none outline-none text-xs sm:text-sm text-[#f5edeb] font-medium cursor-pointer pr-1 w-full sm:w-auto"
              >
                <option value="all" className="bg-[#29100b] text-[#f5edeb]">
                  All Locations
                </option>
                {uniqueLocations.map((loc) => (
                  <option
                    key={loc}
                    value={loc}
                    className="bg-[#29100b] text-[#f5edeb]"
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
                className="w-full sm:w-auto px-4 py-2 rounded-full bg-[#5d3a24]/50 hover:bg-[#5d3a24] text-xs font-semibold text-[#f5edeb] cursor-pointer flex items-center justify-center gap-1"
              >
                <X className="w-3.5 h-3.5 text-[#e3a157]" />
                <span>Clear</span>
              </button>
            ) : null}
          </div>

          {/* Quick Suggestion Chips */}
          <div className="flex flex-wrap items-center justify-center gap-2 text-xs text-[#dab38c]">
            <span className="font-semibold text-[#dab38c]/70 text-[11px]">
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
                className="px-3 py-1 rounded-full bg-[#35160e] hover:bg-[#481f14] border border-[#dab38c]/20 text-[#dab38c] hover:text-[#f5edeb] hover:border-[#e3a157]/50 transition-all cursor-pointer text-[11px]"
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
              <h2 className="font-display font-bold text-xl sm:text-2xl text-[#f5edeb]">
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
                className="text-xs text-[#e3a157] hover:underline cursor-pointer"
              >
                Reset Filters
              </button>
            </div>

            {filteredListings.length === 0 ? (
              <div className="p-12 text-center bg-[#35160e]/80 backdrop-blur-md rounded-3xl border border-[#dab38c]/20 space-y-3">
                <Compass className="w-8 h-8 text-[#e3a157] mx-auto" />
                <h3 className="font-display font-bold text-base text-[#f5edeb]">
                  No offerings found
                </h3>
                <p className="text-xs text-[#dab38c] max-w-sm mx-auto">
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
              <div className="flex items-end justify-between border-b border-[#dab38c]/15 pb-3">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-lg bg-[#e3a157]/15 border border-[#e3a157]/30 flex items-center justify-center text-[#e3a157]">
                      <Compass className="w-3.5 h-3.5 text-[#e3a157]" />
                    </div>
                    <h2 className="font-display font-bold text-lg sm:text-xl text-[#f5edeb]">
                      Coastal Walks & Safaris
                    </h2>
                  </div>
                  <p className="text-xs text-[#dab38c]">
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
              <div className="flex items-end justify-between border-b border-[#dab38c]/15 pb-3">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-lg bg-[#e3a157]/15 border border-[#e3a157]/30 flex items-center justify-center text-[#e3a157]">
                      <Hammer className="w-3.5 h-3.5 text-[#e3a157]" />
                    </div>
                    <h2 className="font-display font-bold text-lg sm:text-xl text-[#f5edeb]">
                      Traditional Workshops & Crafts
                    </h2>
                  </div>
                  <p className="text-xs text-[#dab38c]">
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
              <div className="flex items-end justify-between border-b border-[#dab38c]/15 pb-3">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-lg bg-[#e3a157]/15 border border-[#e3a157]/30 flex items-center justify-center text-[#e3a157]">
                      <UtensilsCrossed className="w-3.5 h-3.5 text-[#e3a157]" />
                    </div>
                    <h2 className="font-display font-bold text-lg sm:text-xl text-[#f5edeb]">
                      Coastal Food & Feasts
                    </h2>
                  </div>
                  <p className="text-xs text-[#dab38c]">
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
              <div className="flex items-end justify-between border-b border-[#dab38c]/15 pb-3">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-lg bg-[#e3a157]/15 border border-[#e3a157]/30 flex items-center justify-center text-[#e3a157]">
                      <ShoppingBag className="w-3.5 h-3.5 text-[#e3a157]" />
                    </div>
                    <h2 className="font-display font-bold text-lg sm:text-xl text-[#f5edeb]">
                      Artisan Goods & Pantry
                    </h2>
                  </div>
                  <p className="text-xs text-[#dab38c]">
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

        {/* 6. Lu.ma-Style Bottom CTA Banner with Warm Coffee Gradient */}
        <section className="pt-8 pb-4">
          <div className="max-w-3xl mx-auto p-8 sm:p-12 rounded-3xl bg-gradient-to-br from-[#35160e] via-[#481f14] to-[#29100b] border border-[#dab38c]/25 shadow-2xl relative overflow-hidden text-center space-y-6">
            <div className="max-w-xl mx-auto space-y-3">
              <h2 className="font-display font-bold text-3xl sm:text-5xl text-[#f5edeb] tracking-tight leading-tight">
                Your next unforgettable <br />
                <span className="text-[#e3a157]">coastal memory awaits.</span>
              </h2>
              <p className="text-xs sm:text-sm text-[#dab38c]">
                Immerse yourself in living coastal culture with verified local
                guides, hosts, and artisanal collectives.
              </p>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-3">
              <button
                onClick={scrollToCatalog}
                className="px-6 py-3 rounded-full bg-[#f5edeb] hover:bg-[#dab38c] text-[#29100b] font-bold text-xs sm:text-sm transition-all shadow-md hover:scale-105 active:scale-95 cursor-pointer"
              >
                Discover Experiences
              </button>
              <Link
                to="/host-with-us"
                className="px-6 py-3 rounded-full bg-[#5d3a24]/50 text-[#f5edeb] font-semibold text-xs sm:text-sm hover:bg-[#5d3a24] border border-[#dab38c]/30 transition-all hover:scale-105 active:scale-95"
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
