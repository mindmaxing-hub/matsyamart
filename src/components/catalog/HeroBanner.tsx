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
    <div className="relative min-h-[580px] lg:min-h-[680px] bg-[#030D12] text-white flex flex-col items-center justify-center overflow-hidden px-4 py-16 sm:py-24 border-b border-white/10 selection:bg-sun-300 selection:text-ocean-950">
      {/* Subtle Ambient Radial Lighting */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[500px] bg-radial from-ocean-900/30 via-ocean-950/10 to-transparent blur-3xl opacity-80" />
        <div className="absolute bottom-1/4 left-1/2 -translate-x-1/2 w-[400px] h-[250px] bg-radial from-sun-300/10 via-transparent to-transparent blur-2xl opacity-60" />
      </div>

      {/* Floating Animated Event Stickers (Luma Style, popping in one-by-one) */}
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
          <div className="w-36 lg:w-44 p-2 bg-[#0B2430]/80 backdrop-blur-md rounded-2xl border border-white/15 shadow-2xl hover:scale-105 transition-transform">
            <div className="w-full aspect-[4/3] rounded-xl overflow-hidden mb-2 bg-ocean-950 relative">
              <img
                src={sticker.image}
                alt={sticker.title}
                className="w-full h-full object-cover"
                loading="lazy"
              />
              <span className="absolute top-1.5 left-1.5 px-2 py-0.5 rounded-full bg-black/70 backdrop-blur-xs text-[9px] font-bold tracking-wider uppercase text-sun-300">
                {sticker.category}
              </span>
            </div>
            <div className="px-1">
              <div className="font-display font-bold text-xs text-white truncate tracking-tight">
                {sticker.title}
              </div>
              <div className="text-[10px] text-slate-400 truncate">
                {sticker.subtitle}
              </div>
            </div>
          </div>
        </div>
      ))}

      {/* Centered Headline Content */}
      <div className="relative z-20 max-w-3xl text-center space-y-6 mx-auto">
        {/* Brand Kicker */}
        <div
          className={`inline-flex items-center gap-1.5 text-xs text-slate-400 font-semibold tracking-wide transition-opacity duration-500 ${
            hasLoaded ? "opacity-100" : "opacity-0"
          }`}
        >
          <span>matsyamart</span>
          <span className="text-sun-300">✦</span>
          <span className="text-slate-500">•</span>
          <span className="text-slate-400">Coastal Community Experiences</span>
        </div>

        {/* Lu.ma-Style Big Headline */}
        <h1
          className={`font-display text-4xl sm:text-6xl lg:text-7xl font-bold tracking-tight text-white leading-[1.08] transition-all duration-700 ${
            hasLoaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
          }`}
        >
          Authentic coastal <br />
          <span>experiences </span>
          <span className="text-sun-300">start here</span>
        </h1>

        {/* Clean, Non-bloated 1-Line Subtitle */}
        <p
          className={`text-sm sm:text-base text-slate-300 max-w-xl mx-auto leading-relaxed font-normal transition-all duration-700 delay-150 ${
            hasLoaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
          }`}
        >
          Discover guided village walks, traditional workshops, home-cooked
          feasts, and artisanal goods across Mumbai and the Konkan coast.
        </p>

        {/* Clean Pill Action Buttons */}
        <div
          className={`flex flex-wrap items-center justify-center gap-3 pt-2 transition-all duration-700 delay-300 ${
            hasLoaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
          }`}
        >
          <button
            onClick={() => {
              if (onScrollToCatalog) {
                onScrollToCatalog();
              } else {
                const el = document.getElementById("catalog-feed");
                el?.scrollIntoView({ behavior: "smooth" });
              }
            }}
            className="px-6 py-3 rounded-full bg-white text-ocean-950 font-bold text-xs sm:text-sm hover:bg-slate-100 transition-all shadow-md hover:scale-105 active:scale-95 cursor-pointer flex items-center gap-2"
          >
            <span>Explore Experiences</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          <Link
            to="/host-with-us"
            className="px-6 py-3 rounded-full bg-white/10 text-white font-semibold text-xs sm:text-sm hover:bg-white/20 border border-white/20 transition-all hover:scale-105 active:scale-95 flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4 text-sun-300" />
            <span>Submit an Experience</span>
          </Link>
        </div>

        {/* Minimal Search & Location Filter Pill */}
        <div
          className={`pt-6 max-w-lg mx-auto transition-all duration-700 delay-500 ${
            hasLoaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
          }`}
        >
          <div className="bg-[#0B2430]/90 p-1.5 rounded-full border border-white/15 backdrop-blur-md shadow-2xl flex items-center gap-2">
            <div className="flex items-center gap-2 pl-3.5 flex-1 min-w-0">
              <Search className="w-4 h-4 text-sun-300 shrink-0" />
              <input
                type="text"
                placeholder="Search walks, workshops, food, goods..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-transparent border-none outline-none text-xs sm:text-sm text-white placeholder:text-slate-400"
              />
            </div>

            {/* Location Selector */}
            <div className="flex items-center gap-1 pr-1 border-l border-white/10 pl-2 shrink-0">
              <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <select
                value={selectedLocation}
                onChange={(e) => setSelectedLocation(e.target.value)}
                className="bg-transparent border-none outline-none text-xs text-slate-300 font-medium cursor-pointer pr-1"
              >
                <option value="all" className="bg-ocean-950 text-white">
                  All Locations
                </option>
                {uniqueLocations.map((loc) => (
                  <option
                    key={loc}
                    value={loc}
                    className="bg-ocean-950 text-white"
                  >
                    {loc}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
