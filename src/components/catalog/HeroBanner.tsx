import React, { useState, useEffect } from "react";
import { Search, MapPin, Compass, Plus, ArrowRight } from "lucide-react";
import { Link } from "../ui/Link";

interface HeroBannerProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  selectedLocation: string;
  setSelectedLocation: (loc: string) => void;
  uniqueLocations: string[];
  onScrollToCatalog?: () => void;
}

interface FloatingCard {
  id: string;
  title: string;
  category: "Walks" | "Workshops" | "Food" | "Goods";
  subtitle: string;
  image: string;
  rotation: string;
  delayMs: number;
  positionClasses: string;
}

const FLOATING_STICKERS: FloatingCard[] = [
  // 1. Top Left
  {
    id: "card-1",
    title: "DAWN HARBOR WALK",
    category: "Walks",
    subtitle: "Versova Village • 6:30 AM",
    image:
      "https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&w=400&q=80",
    rotation: "-5deg",
    delayMs: 150,
    positionClasses: "top-8 left-4 lg:left-12 hidden md:block",
  },
  // 2. Top Mid-Right
  {
    id: "card-2",
    title: "CRAB CURRY FEAST",
    category: "Food",
    subtitle: "Colaba Coastal Kitchen",
    image:
      "https://images.unsplash.com/photo-1534483509719-3feaee7c30da?auto=format&fit=crop&w=400&q=80",
    rotation: "4deg",
    delayMs: 300,
    positionClasses: "top-6 right-6 lg:right-16 hidden md:block",
  },
  // 3. Mid Left
  {
    id: "card-3",
    title: "NET-WEAVING CLASS",
    category: "Workshops",
    subtitle: "Worli Boatyard • 4:00 PM",
    image:
      "https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=400&q=80",
    rotation: "3deg",
    delayMs: 450,
    positionClasses:
      "top-1/2 -translate-y-12 -left-2 lg:left-8 hidden lg:block",
  },
  // 4. Mid Right
  {
    id: "card-4",
    title: "MANGROVE SAFARI",
    category: "Walks",
    subtitle: "Thane Flamingo Estuary",
    image:
      "https://images.unsplash.com/photo-1516467508483-a7212febe31a?auto=format&fit=crop&w=400&q=80",
    rotation: "-4deg",
    delayMs: 600,
    positionClasses:
      "top-1/2 -translate-y-8 -right-2 lg:right-8 hidden lg:block",
  },
  // 5. Bottom Left
  {
    id: "card-5",
    title: "SUN-DRIED JAWLA",
    category: "Goods",
    subtitle: "Madh Island Artisans",
    image:
      "https://images.unsplash.com/photo-1596040033229-a9821ebd058d?auto=format&fit=crop&w=400&q=80",
    rotation: "-3deg",
    delayMs: 750,
    positionClasses: "bottom-12 left-10 lg:left-24 hidden md:block",
  },
  // 6. Bottom Right
  {
    id: "card-6",
    title: "WILD BLOSSOM HONEY",
    category: "Goods",
    subtitle: "Vikhroli Mangrove Guild",
    image:
      "https://images.unsplash.com/photo-1587049352846-4a222e784d38?auto=format&fit=crop&w=400&q=80",
    rotation: "5deg",
    delayMs: 900,
    positionClasses: "bottom-10 right-10 lg:right-28 hidden md:block",
  },
];

export const HeroBanner: React.FC<HeroBannerProps> = ({
  searchQuery,
  setSearchQuery,
  selectedLocation,
  setSelectedLocation,
  uniqueLocations,
  onScrollToCatalog,
}) => {
  const [hasLoaded, setHasLoaded] = useState(false);

  useEffect(() => {
    // Trigger smooth staggered entrance on mount
    const timer = setTimeout(() => setHasLoaded(true), 50);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div
      className="relative min-h-[620px] lg:min-h-[720px] text-white flex flex-col items-center justify-center overflow-hidden px-4 py-20 sm:py-28 border-b border-white/10 selection:bg-sun-300 selection:text-ocean-950"
      style={{
        background: `
          radial-gradient(1200px 700px at 20% 10%, rgba(0, 161, 219, 0.45), transparent 60%),
          radial-gradient(900px 600px at 85% 30%, rgba(0, 117, 156, 0.55), transparent 55%),
          linear-gradient(180deg, #005673 0%, #003B4F 50%, #00222E 100%)
        `,
      }}
    >
      {/* Subtle Ambient Ocean Light Shimmer */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[850px] h-[550px] bg-radial from-ocean-400/25 via-ocean-500/10 to-transparent blur-3xl opacity-80" />
        <div className="absolute bottom-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-radial from-sun-300/15 via-transparent to-transparent blur-3xl opacity-60" />
      </div>

      {/* Floating Animated Event Stickers (Luma Style, popping in one-by-one with frosted oceanic glass) */}
      {FLOATING_STICKERS.map((sticker) => (
        <div
          key={sticker.id}
          className={`absolute pointer-events-none transition-all duration-700 ${sticker.positionClasses} z-10`}
          style={
            hasLoaded
              ? {
                  animation: `lumaPopIn 0.8s cubic-bezier(0.16, 1, 0.3, 1) ${sticker.delayMs}ms forwards, lumaFloat 6s ease-in-out ${sticker.delayMs + 800}ms infinite`,
                  ["--rot" as string]: sticker.rotation,
                  opacity: 0,
                }
              : { opacity: 0 }
          }
        >
          <div className="w-36 lg:w-44 p-2 bg-[#002E3D]/85 backdrop-blur-xl rounded-2xl border border-white/20 shadow-[0_20px_45px_rgba(0,35,50,0.5)] hover:scale-105 transition-transform">
            <div className="w-full aspect-[4/3] rounded-xl overflow-hidden mb-2 bg-ocean-950 relative">
              <img
                src={sticker.image}
                alt={sticker.title}
                className="w-full h-full object-cover"
                loading="lazy"
              />
              <span className="absolute top-1.5 left-1.5 px-2 py-0.5 rounded-full bg-ocean-950/80 backdrop-blur-xs text-[9px] font-bold tracking-wider uppercase text-sun-300 border border-sun-300/25">
                {sticker.category}
              </span>
            </div>
            <div className="px-1">
              <div className="font-display font-bold text-xs text-white truncate tracking-tight">
                {sticker.title}
              </div>
              <div className="text-[10px] text-ocean-200 truncate">
                {sticker.subtitle}
              </div>
            </div>
          </div>
        </div>
      ))}

      {/* Centered Headline & Command Center Content */}
      <div className="relative z-20 max-w-3xl text-center space-y-6 mx-auto">
        {/* Bhoomiputra Official Eyebrow Tag */}
        <div
          className={`inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-[11px] uppercase tracking-[0.22em] text-white/90 bg-white/10 border border-white/20 backdrop-blur-md shadow-sm transition-opacity duration-500 ${
            hasLoaded ? "opacity-100" : "opacity-0"
          }`}
        >
          <span className="w-1.5 h-1.5 rounded-full bg-ocean-300 animate-pulse" />
          <span>SONS OF THE SOIL · MMR COASTAL EXPERIENCES</span>
        </div>

        {/* Editorial Display Headline */}
        <h1
          className={`font-display text-4xl sm:text-6xl lg:text-7xl font-bold tracking-tight text-white leading-[1.05] transition-all duration-700 ${
            hasLoaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
          }`}
        >
          Authentic coastal <br />
          <span>communities. </span>
          <br className="hidden sm:inline" />
          <span className="text-sun-300">Experiences start here</span>
        </h1>

        {/* Luminous Subtitle */}
        <p
          className={`text-sm sm:text-lg text-white/80 max-w-2xl mx-auto leading-relaxed font-normal transition-all duration-700 delay-150 ${
            hasLoaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
          }`}
        >
          Discover guided village walks, traditional masterclasses, home-cooked
          feasts, and artisanal crafts across Mumbai and the Konkan coast.
        </p>

        {/* Spacious, High-Contrast Command Search & Location Bar */}
        <div
          className={`w-full max-w-2xl mx-auto pt-2 transition-all duration-700 delay-300 ${
            hasLoaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
          }`}
        >
          <div className="bg-white/15 hover:bg-white/20 focus-within:bg-white/25 backdrop-blur-xl border border-white/30 focus-within:border-sun-300 rounded-3xl sm:rounded-full p-2 sm:p-2.5 shadow-2xl transition-all flex flex-col sm:flex-row items-center gap-2 group">
            {/* Search Input Field */}
            <div className="flex items-center gap-2 pl-3 sm:pl-4 flex-1 min-w-0 w-full sm:w-auto">
              <Search className="w-5 h-5 text-sun-300 shrink-0 group-focus-within:scale-110 transition-transform" />
              <input
                type="text"
                placeholder="Search walks, workshops, feasts, crafts..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    if (onScrollToCatalog) {
                      onScrollToCatalog();
                    } else {
                      document
                        .getElementById("catalog-feed")
                        ?.scrollIntoView({ behavior: "smooth" });
                    }
                  }
                }}
                className="w-full bg-transparent border-none outline-none text-sm sm:text-base text-white placeholder:text-white/60 font-normal py-1.5"
              />
            </div>

            {/* Location Selector Divider */}
            <div className="hidden sm:block h-7 w-[1px] bg-white/25 mx-1" />

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

            {/* Primary Action Button */}
            <button
              onClick={() => {
                if (onScrollToCatalog) {
                  onScrollToCatalog();
                } else {
                  document
                    .getElementById("catalog-feed")
                    ?.scrollIntoView({ behavior: "smooth" });
                }
              }}
              className="w-full sm:w-auto px-6 py-3 rounded-full bg-sun-300 hover:bg-sun-200 text-ocean-950 font-bold text-xs sm:text-sm transition-all shadow-md hover:scale-105 active:scale-95 flex items-center justify-center gap-1.5 shrink-0 cursor-pointer"
            >
              <span>Explore</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          {/* Quick Popular Suggestions */}
          <div className="flex flex-wrap items-center justify-center gap-2 pt-3 text-xs text-white/75">
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
                onClick={() => {
                  setSearchQuery(chip.query);
                  if (onScrollToCatalog) {
                    onScrollToCatalog();
                  } else {
                    document
                      .getElementById("catalog-feed")
                      ?.scrollIntoView({ behavior: "smooth" });
                  }
                }}
                className="px-3 py-1 rounded-full bg-white/10 hover:bg-white/20 border border-white/15 text-white/90 hover:text-white transition-all cursor-pointer text-[11px]"
              >
                {chip.label}
              </button>
            ))}
          </div>

          {/* Secondary Quick Jump & Partner Link */}
          <div className="flex items-center justify-center gap-4 pt-4 text-xs text-white/70">
            <button
              onClick={() => {
                if (onScrollToCatalog) {
                  onScrollToCatalog();
                } else {
                  document
                    .getElementById("catalog-feed")
                    ?.scrollIntoView({ behavior: "smooth" });
                }
              }}
              className="hover:text-sun-300 transition-colors flex items-center gap-1 cursor-pointer"
            >
              <span>Browse All 4 Pillars</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
            <span className="text-white/30">•</span>
            <Link
              to="/host-with-us"
              className="hover:text-sun-300 transition-colors flex items-center gap-1"
            >
              <span>Partner With Us</span>
              <Plus className="w-3.5 h-3.5 text-sun-300" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
