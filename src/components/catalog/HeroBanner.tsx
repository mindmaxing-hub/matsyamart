import React, { useState, useEffect } from "react";
import { Link } from "../ui/Link";
import { ArrowRight, ChevronDown } from "lucide-react";
import { useData } from "../../context/DataContext";
import { BrandLogo } from "../site/BrandLogo";

interface HeroBannerProps {
  onScrollToCatalog?: () => void;
}

// Gentle rotational degrees to create the organic Lu.ma fanned card deck
const ROTATIONS = [
  "-4deg",
  "2.5deg",
  "-1.5deg",
  "3.5deg",
  "-2deg",
  "3deg",
  "-3deg",
];

export const HeroBanner: React.FC<HeroBannerProps> = ({
  onScrollToCatalog,
}) => {
  const { listings } = useData();
  const [hasLoaded, setHasLoaded] = useState(false);

  // Take top 7 listings across all pillars for the hero deck
  const displayListings = listings.slice(0, 7);

  useEffect(() => {
    const timer = setTimeout(() => setHasLoaded(true), 50);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div
      className="relative text-[#f5edeb] flex flex-col items-center justify-start overflow-hidden pt-12 sm:pt-16 md:pt-20 pb-4 sm:pb-6 selection:bg-[#e3a157] selection:text-[#29100b]"
      style={{
        background: `
          radial-gradient(1100px 550px at 50% 0%, rgba(93, 58, 36, 0.45), transparent 75%),
          linear-gradient(180deg, #1f0b07 0%, #240c08 30%, #29100b 75%, #29100b 100%)
        `,
      }}
    >
      <div className="relative z-20 w-full max-w-md sm:max-w-2xl lg:max-w-4xl text-center space-y-4 sm:space-y-5 mx-auto px-4">
        {/* Official Wordmark + Koli Identity Eyebrow Stack */}
        <div
          className={`flex flex-col items-center gap-2 transition-opacity duration-500 ${
            hasLoaded ? "opacity-100" : "opacity-0"
          }`}
        >
          <BrandLogo
            eager
            className="h-9 w-auto sm:h-11"
          />
          {/* Koli Community Badge */}
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#35160e] border border-[#dab38c]/25 text-[10px] sm:text-xs text-[#dab38c] font-medium">
            🐟 By the Koli Coastal Community
          </div>
        </div>

        {/* Big Headline: 3-line Lu.ma Stacked Layout */}
        <h1
          className={`font-display text-[clamp(2.85rem,11.5vw,6.25rem)] font-bold tracking-[-0.035em] text-[#f5edeb] leading-[0.93] sm:leading-[0.92] transition-all duration-700 px-2 ${
            hasLoaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
          }`}
        >
          <span className="block whitespace-nowrap">Coastal</span>
          <span className="block whitespace-nowrap">experiences</span>
          <span className="ocean-glow-text block whitespace-nowrap">
            start here
          </span>
        </h1>

        {/* Subtitle */}
        <p
          className={`text-sm sm:text-base text-[#dab38c] max-w-lg mx-auto leading-relaxed font-normal transition-all duration-700 delay-150 px-2 ${
            hasLoaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
          }`}
        >
          From harbor walks to dawn feasts and artisan workshops, MatsyaMart makes every experience feel effortless.
        </p>

        {/* Action Row */}
        <div
          className={`flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 pt-1 sm:pt-2 transition-all duration-700 delay-300 ${
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
            className="px-6 sm:px-7 py-2.5 sm:py-3 rounded-full bg-[#f5edeb] hover:bg-[#dab38c] text-[#29100b] font-bold text-xs sm:text-sm transition-all shadow-xl hover:scale-105 active:scale-95 cursor-pointer"
          >
            Explore Experiences
          </button>

          <Link
            to="/host-with-us"
            className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-[#dab38c] hover:text-[#f5edeb] transition-colors"
          >
            <span>Share Your Offering</span>
            <ArrowRight className="w-3.5 h-3.5 text-[#e3a157]" />
          </Link>
        </div>
      </div>

      {/* 2. BOTTOM SECTION: Event Card Collage */}
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
                className="group shrink-0 w-28 sm:w-36 md:w-44 p-1.5 sm:p-2 bg-[#35160e]/85 backdrop-blur-xl rounded-xl sm:rounded-2xl border border-[#dab38c]/25 shadow-[0_15px_35px_rgba(41,16,11,0.7)] hover:scale-105 hover:-translate-y-1 transition-all hover:border-[#e3a157]/60 block cursor-pointer"
                style={{
                  transform: `rotate(${rotation})`,
                }}
              >
                <div className="w-full aspect-[4/3] rounded-lg sm:rounded-xl overflow-hidden mb-1.5 sm:mb-2 bg-[#29100b] relative">
                  <img
                    src={listing.images[0]}
                    alt={listing.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    loading="lazy"
                  />
                  <span className="absolute top-1 left-1 px-1.5 py-0.5 rounded-full bg-[#29100b]/90 backdrop-blur-xs text-[7px] sm:text-[8px] font-bold tracking-wider uppercase text-[#e3a157] border border-[#e3a157]/30">
                    {categoryLabel}
                  </span>
                </div>
                <div className="px-0.5 sm:px-1">
                  <div className="font-display font-bold text-[9px] sm:text-xs text-[#f5edeb] group-hover:text-[#dab38c] transition-colors truncate tracking-tight">
                    {listing.title}
                  </div>
                  <div className="text-[8px] sm:text-[10px] text-[#dab38c]/80 truncate">
                    {subtitle}
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Floating Animated Scroll Down Cue */}
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
        className="pt-4 text-[#dab38c]/60 hover:text-[#f5edeb] text-[10px] uppercase tracking-[0.25em] flex items-center gap-1 cursor-pointer transition-colors"
      >
        <span>SCROLL</span>
        <ChevronDown className="w-3.5 h-3.5 animate-bounce text-[#e3a157]" />
      </div>
    </div>
  );
};
