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
    <div className="flex items-center justify-between border-b border-white/10 pb-4 flex-wrap gap-4">
      {/* 4 Pillars Pill Tabs (Lu.ma Style) */}
      <div className="inline-flex items-center gap-1.5 p-1 bg-[#061822] rounded-full border border-white/10 overflow-x-auto max-w-full">
        <button
          onClick={() => setSelectedPillar("all")}
          className={`px-4 py-2 text-xs font-semibold rounded-full transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
            selectedPillar === "all"
              ? "bg-white text-ocean-950 shadow-sm"
              : "text-slate-400 hover:text-white"
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
              : "text-slate-400 hover:text-white"
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
              : "text-slate-400 hover:text-white"
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
              : "text-slate-400 hover:text-white"
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
              : "text-slate-400 hover:text-white"
          }`}
        >
          <ShoppingBag className="w-3.5 h-3.5" />
          <span>Goods</span>
          <span className="text-[10px] opacity-70">
            ({pillarCounts.goods || 0})
          </span>
        </button>
      </div>

      <div className="text-xs text-slate-400 font-medium">
        Curated coastal experiences & authentic goods
      </div>
    </div>
  );
};
