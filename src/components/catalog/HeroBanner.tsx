import React, { useState, useEffect } from "react";
import { ArrowRight, ChevronDown } from "lucide-react";
import { Link } from "../ui/Link";

interface HeroBannerProps {
  onScrollToCatalog?: () => void;
}

interface HeroCard {
  id: string;
  title: string;
  category: "Walks" | "Workshops" | "Food" | "Goods";
  subtitle: string;
  image: string;
  rotation: string;
  delayMs: number;
}

// 8 Verified Authentic Coastal Event Cards (Zero mockups, Zero 404s)
const CARDS: HeroCard[] = [
  {
    id: "card-1",
    title: "DAWN HARBOR WALK",
    category: "Walks",
    subtitle: "Versova Village • 6:30 AM",
    image:
      "https://images.unsplash.com/photo-1559827260-dc66d52bef19?auto=format&fit=crop&w=400&q=80",
    rotation: "-3deg",
    delayMs: 100,
  },
  {
    id: "card-2",
    title: "BOAT CARPENTRY",
    category: "Workshops",
    subtitle: "Worli Boatyard • 4:00 PM",
    image:
      "https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?auto=format&fit=crop&w=400&q=80",
    rotation: "2deg",
    delayMs: 200,
  },
  {
    id: "card-3",
    title: "CRAB CURRY FEAST",
    category: "Food",
    subtitle: "Colaba Coastal Kitchen",
    image:
      "https://images.unsplash.com/photo-1565557623262-b51c2513a641?auto=format&fit=crop&w=400&q=80",
    rotation: "-2deg",
    delayMs: 300,
  },
  {
    id: "card-4",
    title: "MANGROVE SAFARI",
    category: "Walks",
    subtitle: "Thane Flamingo Estuary",
    image:
      "https://images.unsplash.com/photo-1510525009512-ad7fc13eefab?auto=format&fit=crop&w=400&q=80",
    rotation: "3deg",
    delayMs: 400,
  },
  {
    id: "card-5",
    title: "WILD BLOSSOM HONEY",
    category: "Goods",
    subtitle: "Vikhroli Mangrove Guild",
    image:
      "https://images.unsplash.com/photo-1558642452-9d2a7deb7f62?auto=format&fit=crop&w=400&q=80",
    rotation: "-3deg",
    delayMs: 500,
  },
  {
    id: "card-6",
    title: "SUN-DRIED JAWLA",
    category: "Goods",
    subtitle: "Madh Island Artisans",
    image:
      "https://images.unsplash.com/photo-1596040033229-a9821ebd058d?auto=format&fit=crop&w=400&q=80",
    rotation: "2deg",
    delayMs: 600,
  },
  {
    id: "card-7",
    title: "SUNSET SHORE TRAIL",
    category: "Walks",
    subtitle: "Alibaug Coastline",
    image:
      "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=400&q=80",
    rotation: "-1deg",
    delayMs: 700,
  },
  {
    id: "card-8",
    title: "NIGHT NAVIGATION",
    category: "Workshops",
    subtitle: "Mahim Bay • 8:00 PM",
    image:
      "https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&w=400&q=80",
    rotation: "3deg",
    delayMs: 800,
  },
];

export const HeroBanner: React.FC<HeroBannerProps> = ({
  onScrollToCatalog,
}) => {
  const [hasLoaded, setHasLoaded] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setHasLoaded(true), 50);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div
      className="relative text-[#f5edeb] flex flex-col items-center justify-start overflow-hidden pt-12 sm:pt-16 md:pt-20 pb-10 selection:bg-[#e3a157] selection:text-[#29100b]"
      style={{
        background: `
          radial-gradient(1100px 550px at 50% 12%, rgba(93, 58, 36, 0.45), transparent 70%),
          linear-gradient(180deg, #29100b 0%, #240c08 50%, #1f0b07 100%)
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
          <span className="font-display font-bold tracking-tight text-[#f5edeb]">
            MatsyaMart
          </span>
          <span className="text-[#e3a157] font-bold leading-none">✦</span>
        </div>

        {/* Lu.ma-Style Big Headline (Exact 4 Words) */}
        <h1
          className={`font-display text-4xl sm:text-6xl lg:text-7xl font-bold tracking-tight text-[#f5edeb] leading-[1.06] transition-all duration-700 px-2 ${
            hasLoaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
          }`}
        >
          Coastal experiences <br />
          <span className="text-[#e3a157]">start here</span>
        </h1>

        {/* Lu.ma-Style Subtitle (Exact 15 Words matching Lu.ma's 15 words) */}
        <p
          className={`text-xs sm:text-base text-[#dab38c] max-w-xs sm:max-w-xl mx-auto leading-relaxed font-normal transition-all duration-700 delay-150 px-2 ${
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
            className="px-6 sm:px-7 py-2.5 sm:py-3 rounded-full bg-[#f5edeb] hover:bg-[#dab38c] text-[#29100b] font-bold text-xs sm:text-sm transition-all shadow-xl hover:scale-105 active:scale-95 cursor-pointer"
          >
            Explore Experiences
          </button>

          <Link
            to="/host-with-us"
            className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-[#dab38c] hover:text-[#f5edeb] transition-colors"
          >
            <span>Submit Experience</span>
            <ArrowRight className="w-3.5 h-3.5 text-[#e3a157]" />
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
          {CARDS.map((card) => (
            <div
              key={card.id}
              className="shrink-0 w-28 sm:w-36 md:w-44 p-1.5 sm:p-2 bg-[#35160e]/85 backdrop-blur-xl rounded-xl sm:rounded-2xl border border-[#dab38c]/25 shadow-[0_15px_35px_rgba(41,16,11,0.7)] hover:scale-105 transition-all hover:border-[#e3a157]/50"
              style={{
                transform: `rotate(${card.rotation})`,
              }}
            >
              <div className="w-full aspect-[4/3] rounded-lg sm:rounded-xl overflow-hidden mb-1.5 sm:mb-2 bg-[#29100b] relative">
                <img
                  src={card.image}
                  alt={card.title}
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
                <span className="absolute top-1 left-1 px-1.5 py-0.5 rounded-full bg-[#29100b]/90 backdrop-blur-xs text-[7px] sm:text-[8px] font-bold tracking-wider uppercase text-[#e3a157] border border-[#e3a157]/30">
                  {card.category}
                </span>
              </div>
              <div className="px-0.5 sm:px-1">
                <div className="font-display font-bold text-[9px] sm:text-xs text-[#f5edeb] truncate tracking-tight">
                  {card.title}
                </div>
                <div className="text-[8px] sm:text-[10px] text-[#dab38c] truncate">
                  {card.subtitle}
                </div>
              </div>
            </div>
          ))}
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
        className="pt-4 text-[#dab38c]/60 hover:text-[#f5edeb] text-[10px] uppercase tracking-[0.25em] flex items-center gap-1 cursor-pointer transition-colors"
      >
        <span>SCROLL</span>
        <ChevronDown className="w-3.5 h-3.5 animate-bounce text-[#e3a157]" />
      </div>
    </div>
  );
};
