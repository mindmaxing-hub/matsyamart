import React from "react";
import {
  Compass,
  Hammer,
  UtensilsCrossed,
  ShoppingBag,
  Layers,
} from "lucide-react";
import { Category, PillarType } from "../../types";

interface CategoryFilterProps {
  categories: Category[];
  selectedPillar: "all" | PillarType;
  setSelectedPillar: (pillar: "all" | PillarType) => void;
  totalListingsCount: number;
  pillarCounts: Record<PillarType, number>;
}

export const CategoryFilter: React.FC<CategoryFilterProps> = ({
  selectedPillar,
  setSelectedPillar,
  totalListingsCount,
  pillarCounts,
}) => {
  return (
    <div className="w-full flex items-center justify-between border-b border-white/10 pb-4 gap-4">
      {/* 4 Pillars Pill Tabs (Lu.ma Style with Bhoomiputra Ocean Glass) */}
      <div className="flex items-center gap-1.5 p-1 sm:p-1.5 bg-[#002836]/90 backdrop-blur-md rounded-full border border-white/15 overflow-x-auto scrollbar-none max-w-full shadow-md shrink-0">
        <button
          onClick={() => setSelectedPillar("all")}
          className={`px-4 py-2 text-xs font-semibold rounded-full transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
            selectedPillar === "all"
              ? "bg-white text-ocean-950 shadow-sm"
              : "text-ocean-200 hover:text-white hover:bg-white/10"
          }`}
        >
          <Layers className="w-3.5 h-3.5" />
          <span>All</span>
          <span className="text-[10px] opacity-70">({totalListingsCount})</span>
        </button>

        <button
          onClick={() => setSelectedPillar("walks")}
          className={`px-4 py-2 text-xs font-semibold rounded-full transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
            selectedPillar === "walks"
              ? "bg-white text-ocean-950 shadow-sm"
              : "text-ocean-200 hover:text-white hover:bg-white/10"
          }`}
        >
          <Compass className="w-3.5 h-3.5" />
          <span>Walks</span>
          <span className="text-[10px] opacity-70">
            ({pillarCounts.walks || 0})
          </span>
        </button>

        <button
          onClick={() => setSelectedPillar("workshops")}
          className={`px-4 py-2 text-xs font-semibold rounded-full transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
            selectedPillar === "workshops"
              ? "bg-white text-ocean-950 shadow-sm"
              : "text-ocean-200 hover:text-white hover:bg-white/10"
          }`}
        >
          <Hammer className="w-3.5 h-3.5" />
          <span>Workshops</span>
          <span className="text-[10px] opacity-70">
            ({pillarCounts.workshops || 0})
          </span>
        </button>

        <button
          onClick={() => setSelectedPillar("food")}
          className={`px-4 py-2 text-xs font-semibold rounded-full transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
            selectedPillar === "food"
              ? "bg-white text-ocean-950 shadow-sm"
              : "text-ocean-200 hover:text-white hover:bg-white/10"
          }`}
        >
          <UtensilsCrossed className="w-3.5 h-3.5" />
          <span>Food</span>
          <span className="text-[10px] opacity-70">
            ({pillarCounts.food || 0})
          </span>
        </button>

        <button
          onClick={() => setSelectedPillar("goods")}
          className={`px-4 py-2 text-xs font-semibold rounded-full transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
            selectedPillar === "goods"
              ? "bg-white text-ocean-950 shadow-sm"
              : "text-ocean-200 hover:text-white hover:bg-white/10"
          }`}
        >
          <ShoppingBag className="w-3.5 h-3.5" />
          <span>Goods</span>
          <span className="text-[10px] opacity-70">
            ({pillarCounts.goods || 0})
          </span>
        </button>
      </div>

      <div className="hidden md:block text-xs text-ocean-200 font-medium">
        Curated coastal experiences & authentic goods
      </div>
    </div>
  );
};
