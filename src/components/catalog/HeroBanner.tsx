import React, { useState, useEffect } from "react";
import { ArrowRight, ChevronDown } from "lucide-react";
import { Link } from "../ui/Link";

interface HeroBannerProps {
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
  // 1. Top Left (visible on all screens)
  {
    id: "card-1",
    title: "DAWN HARBOR WALK",
    category: "Walks",
    subtitle: "Versova Village • 6:30 AM",
    image:
      "https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&w=400&q=80",
    rotation: "-5deg",
    delayMs: 150,
    positionClasses: "top-3 left-2 sm:top-8 sm:left-10",
  },
  // 2. Top Right (visible on all screens)
  {
    id: "card-2",
    title: "CRAB CURRY FEAST",
    category: "Food",
    subtitle: "Colaba Coastal Kitchen",
    image:
      "https://images.unsplash.com/photo-1534483509719-3feaee7c30da?auto=format&fit=crop&w=400&q=80",
    rotation: "4deg",
    delayMs: 300,
    positionClasses: "top-3 right-2 sm:top-8 sm:right-12",
  },
  // 3. Mid Left (visible on all screens)
  {
    id: "card-3",
    title: "NET-WEAVING CLASS",
    category: "Workshops",
    subtitle: "Worli Boatyard • 4:00 PM",
    image:
      "https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=400&q=80",
    rotation: "3deg",
    delayMs: 450,
    positionClasses: "top-[36%] -left-1 sm:left-6",
  },
  // 4. Mid Right (visible on all screens)
  {
    id: "card-4",
    title: "MANGROVE SAFARI",
    category: "Walks",
    subtitle: "Thane Flamingo Estuary",
    image:
      "https://images.unsplash.com/photo-1516467508483-a7212febe31a?auto=format&fit=crop&w=400&q=80",
    rotation: "-4deg",
    delayMs: 600,
    positionClasses: "top-[38%] -right-1 sm:right-8",
  },
  // 5. Lower Left (visible on all screens)
  {
    id: "card-5",
    title: "SUN-DRIED JAWLA",
    category: "Goods",
    subtitle: "Madh Island Artisans",
    image:
      "https://images.unsplash.com/photo-1596040033229-a9821ebd058d?auto=format&fit=crop&w=400&q=80",
    rotation: "-3deg",
    delayMs: 750,
    positionClasses: "bottom-14 left-2 sm:bottom-20 sm:left-14",
  },
  // 6. Lower Right (visible on all screens)
  {
    id: "card-6",
    title: "WILD BLOSSOM HONEY",
    category: "Goods",
    subtitle: "Vikhroli Mangrove Guild",
    image:
      "https://images.unsplash.com/photo-1587049352846-4a222e784d38?auto=format&fit=crop&w=400&q=80",
    rotation: "5deg",
    delayMs: 900,
    positionClasses: "bottom-12 right-2 sm:bottom-18 sm:right-16",
  },
  // 7. Top Center Peek (Desktop only)
  {
    id: "card-7",
    title: "BOAT CRAFT MASTERCLASS",
    category: "Workshops",
    subtitle: "Mahim Artisans Guild",
    image:
      "https://images.unsplash.com/photo-1516467508483-a7212febe31a?auto=format&fit=crop&w=400&q=80",
    rotation: "1deg",
    delayMs: 200,
    positionClasses: "top-2 left-1/2 -translate-x-1/2 hidden md:block",
  },
  // 8. Bottom Center Peek (Desktop only)
  {
    id: "card-8",
    title: "HARBOR FRESH BREAKFAST",
    category: "Food",
    subtitle: "Sassoon Dock Collective",
    image:
      "https://images.unsplash.com/photo-1534483509719-3feaee7c30da?auto=format&fit=crop&w=400&q=80",
    rotation: "-2deg",
    delayMs: 850,
    positionClasses: "bottom-6 left-1/2 -translate-x-1/2 hidden md:block",
  },
];

export const HeroBanner: React.FC<HeroBannerProps> = ({
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
      className="relative min-h-[85vh] sm:min-h-[90vh] text-white flex flex-col items-center justify-center overflow-hidden px-4 py-16 sm:py-24 border-b border-white/10 selection:bg-sun-300 selection:text-ocean-950"
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

      {/* Floating Animated Event Stickers (Luma Style, visible on mobile & desktop) */}
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
          <div className="w-20 sm:w-36 lg:w-44 p-1 sm:p-2 bg-[#002E3D]/85 backdrop-blur-xl rounded-xl sm:rounded-2xl border border-white/20 shadow-[0_20px_45px_rgba(0,35,50,0.5)] hover:scale-105 transition-transform">
            <div className="w-full aspect-square sm:aspect-[4/3] rounded-lg sm:rounded-xl overflow-hidden mb-1 sm:mb-2 bg-ocean-950 relative">
              <img
                src={sticker.image}
                alt={sticker.title}
                className="w-full h-full object-cover"
                loading="lazy"
              />
              <span className="absolute top-1 left-1 px-1.5 py-0.5 rounded-full bg-ocean-950/80 backdrop-blur-xs text-[8px] sm:text-[9px] font-bold tracking-wider uppercase text-sun-300 border border-sun-300/25">
                {sticker.category}
              </span>
            </div>
            <div className="px-0.5 sm:px-1">
              <div className="font-display font-bold text-[10px] sm:text-xs text-white truncate tracking-tight">
                {sticker.title}
              </div>
              <div className="hidden sm:block text-[10px] text-ocean-200 truncate">
                {sticker.subtitle}
              </div>
            </div>
          </div>
        </div>
      ))}

      {/* Centered Headline & Action Content (Lu.ma Purity) */}
      <div className="relative z-20 max-w-[260px] sm:max-w-xl lg:max-w-2xl text-center space-y-3 sm:space-y-6 mx-auto">
        {/* Minimal Wordmark / Eyebrow (Lu.ma style) */}
        <div
          className={`inline-flex items-center gap-1.5 text-xs text-ocean-200 font-semibold tracking-wider transition-opacity duration-500 ${
            hasLoaded ? "opacity-100" : "opacity-0"
          }`}
        >
          <span className="font-display font-bold text-sm sm:text-base tracking-tight text-white">
            matsyamart
          </span>
          <span className="text-sun-300 font-bold text-base leading-none">
            ✦
          </span>
          <span className="text-white/40">•</span>
          <span className="text-ocean-200 text-[10px] sm:text-[11px] uppercase tracking-widest font-medium">
            Coastal Experiences
          </span>
        </div>

        {/* Lu.ma-Style Big Headline */}
        <h1
          className={`font-display text-3xl sm:text-6xl lg:text-7xl font-bold tracking-tight text-white leading-[1.05] transition-all duration-700 ${
            hasLoaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
          }`}
        >
          Coastal experiences <br />
          <span className="text-sun-300">start here</span>
        </h1>

        {/* Crisp 1-Line Subtitle */}
        <p
          className={`text-xs sm:text-base text-white/85 max-w-xs sm:max-w-lg mx-auto leading-relaxed font-normal transition-all duration-700 delay-150 ${
            hasLoaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
          }`}
        >
          Authentic village walks, masterclasses, feasts, and artisanal crafts
          curated with coastal communities.
        </p>

        {/* Clean Lu.ma Action Row (Zero clutter) */}
        <div
          className={`flex items-center justify-center gap-3 sm:gap-4 pt-1 sm:pt-4 transition-all duration-700 delay-300 ${
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
            className="px-6 sm:px-7 py-2.5 sm:py-3 rounded-full bg-sun-300 hover:bg-sun-200 text-ocean-950 font-bold text-xs sm:text-sm transition-all shadow-lg hover:scale-105 active:scale-95 cursor-pointer"
          >
            Explore Experiences
          </button>

          <Link
            to="/host-with-us"
            className="inline-flex items-center gap-1 text-xs sm:text-sm font-semibold text-white/80 hover:text-white transition-colors"
          >
            <span>Submit Experience</span>
            <ArrowRight className="w-3.5 h-3.5 text-sun-300" />
          </Link>
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
        className="absolute bottom-3 sm:bottom-5 left-1/2 -translate-x-1/2 text-white/50 hover:text-white text-[10px] uppercase tracking-[0.25em] flex items-center gap-1 cursor-pointer transition-colors"
      >
        <span>SCROLL</span>
        <ChevronDown className="w-3.5 h-3.5 animate-bounce text-sun-300" />
      </div>
    </div>
  );
};
