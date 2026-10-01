import React, { useState, useEffect, useMemo } from "react";
import { ArrowRight, ChevronDown } from "lucide-react";
import { Link } from "../ui/Link";
import { useData } from "../../context/DataContext";

interface HeroBannerProps {
  onScrollToCatalog?: () => void;
}

const ROTATIONS = [
  "-3deg",
  "2deg",
  "-2deg",
  "3deg",
  "-3deg",
  "2deg",
  "-1deg",
  "3deg",
];

export const HeroBanner: React.FC<HeroBannerProps> = ({
  onScrollToCatalog,
}) => {
  const { listings, spotlightListingIds } = useData();
  const [hasLoaded, setHasLoaded] = useState(false);

  // Resolve spotlight listings in exact ordered sequence
  const displayListings = useMemo(() => {
    const list = spotlightListingIds
      .map((id) => listings.find((l) => l.id === id))
      .filter((l): l is NonNullable<typeof l> => Boolean(l && l.is_active));
    return list.length > 0 ? list : listings.slice(0, 6);
  }, [spotlightListingIds, listings]);

  useEffect(() => {
    const timer = setTimeout(() => setHasLoaded(true), 50);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div
      className="relative text-slate-900 flex flex-col items-center justify-start overflow-hidden pt-12 sm:pt-16 md:pt-20 pb-10 selection:bg-[#e3a157] selection:text-slate-900"
      style={{
        background: `
          radial-gradient(1100px 550px at 50% 12%, rgba(227, 161, 87, 0.09), transparent 70%),
          linear-gradient(180deg, #FFFFFF 0%, #FAFAF9 60%, #F5EDEB 100%)
        `,
      }}
    >
      {/* 1. TOP SECTION: Focal Point Typography (100% Unobstructed, Exactly like Lu.ma) */}
      <div className="relative z-20 w-full max-w-sm sm:max-w-xl lg:max-w-2xl text-center space-y-4 sm:space-y-6 mx-auto px-4">
        {/* Minimal Wordmark / Eyebrow (Lu.ma Style) */}
        <div
          className={`inline-flex items-center gap-1 text-sm sm:text-base font-semibold tracking-wider transition-opacity duration-500 ${
            hasLoaded ? "opacity-100" : "opacity-0"
          }`}
        >
          <span className="font-display font-bold tracking-tight text-slate-900">
            MatsyaMart
          </span>
          <span className="text-[#e3a157] font-bold leading-none">✦</span>
        </div>

        {/* Lu.ma-Style Big Headline (Exact 4 Words) */}
        <h1
          className={`font-display text-4xl sm:text-6xl lg:text-7xl font-bold tracking-tight text-slate-900 leading-[1.06] transition-all duration-700 px-2 ${
            hasLoaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
          }`}
        >
          Coastal experiences <br />
          <span className="text-amber-700">start here</span>
        </h1>

        {/* Lu.ma-Style Subtitle (Exact 15 Words matching Lu.ma's 15 words) */}
        <p
          className={`text-xs sm:text-base text-slate-600 max-w-xs sm:max-w-xl mx-auto leading-relaxed font-normal transition-all duration-700 delay-150 px-2 ${
            hasLoaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
          }`}
        >
          From harbor walks to dawn feasts and artisan workshops, MatsyaMart
          makes every experience feel effortless.
        </p>

        {/* Clean Lu.ma Action Row */}
        <div
          className={`flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 pt-1 transition-all duration-700 delay-300 ${
            hasLoaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
          }`}
        >
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
            className="px-6 sm:px-7 py-2.5 sm:py-3 rounded-full bg-slate-900 hover:bg-black text-white font-bold text-xs sm:text-sm transition-all shadow-lg hover:scale-105 active:scale-95 cursor-pointer"
          >
            Explore Experiences
          </button>

          <Link
            to="/host-with-us"
            className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-slate-700 hover:text-slate-900 transition-colors"
          >
            <span>Submit Experience</span>
            <ArrowRight className="w-3.5 h-3.5 text-amber-700" />
          </Link>
        </div>
      </div>

      {/* 2. BOTTOM SECTION: Event Card Collage (Below Headlines & Buttons — Image 3 Lu.ma Style) */}
      <div
        className={`w-full max-w-6xl mx-auto pt-8 sm:pt-12 px-4 transition-all duration-1000 delay-400 ${
          hasLoaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
        }`}
      >
        {/* Responsive Scrolling/Fanning Card Deck */}
        <div className="flex items-center justify-start sm:justify-center gap-3 sm:gap-4 md:gap-5 overflow-x-auto pb-4 pt-2 scrollbar-none px-2 sm:px-4">
          {displayListings.map((listing, index) => {
            const rotation = ROTATIONS[index % ROTATIONS.length];
            const detailPath =
              listing.type === "experience"
                ? `/experience/${listing.slug}`
                : `/product/${listing.slug}`;
            const categoryLabel =
              listing.pillar === "walks"
                ? "Walks"
                : listing.pillar === "workshops"
                  ? "Workshops"
                  : listing.pillar === "food"
                    ? "Food"
                    : "Goods";
            const subtitle =
              listing.type === "experience"
                ? listing.location_name?.split(",")[0] || "Mumbai Coastal"
                : listing.artisan_collective || "Artisanal Goods";

            return (
              <Link
                key={listing.id}
                to={detailPath}
                className="group shrink-0 w-28 sm:w-36 md:w-44 p-1.5 sm:p-2 bg-white rounded-xl sm:rounded-2xl border border-slate-200 shadow-md hover:scale-105 hover:-translate-y-1 transition-all hover:border-amber-400 block cursor-pointer"
                style={{
                  transform: `rotate(${rotation})`,
                }}
              >
                <div className="w-full aspect-[4/3] rounded-lg sm:rounded-xl overflow-hidden mb-1.5 sm:mb-2 bg-slate-100 relative">
                  <img
                    src={listing.images[0]}
                    alt={listing.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    loading="lazy"
                  />
                  <span className="absolute top-1 left-1 px-1.5 py-0.5 rounded-full bg-white/90 backdrop-blur-xs text-[7px] sm:text-[8px] font-bold tracking-wider uppercase text-slate-800 border border-slate-200">
                    {categoryLabel}
                  </span>
                </div>
                <div className="px-0.5 sm:px-1">
                  <div className="font-display font-bold text-[9px] sm:text-xs text-slate-900 group-hover:text-amber-800 transition-colors truncate tracking-tight">
                    {listing.title}
                  </div>
                  <div className="text-[8px] sm:text-[10px] text-slate-500 truncate">
                    {subtitle}
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Floating Animated Scroll Down Cue (Seamless flow into feed) */}
      <div
        onClick={() => {
          if (onScrollToCatalog) {
            onScrollToCatalog();
          } else {
            document
              .getElementById("catalog-feed")
              ?.scrollIntoView({ behavior: "smooth" });
          }
        }}
        className="pt-4 text-slate-400 hover:text-slate-700 text-[10px] uppercase tracking-[0.25em] flex items-center gap-1 cursor-pointer transition-colors"
      >
        <span>SCROLL</span>
        <ChevronDown className="w-3.5 h-3.5 animate-bounce text-amber-600" />
      </div>
    </div>
  );
};
