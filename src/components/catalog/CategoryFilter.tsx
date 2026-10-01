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
    <div className="w-full flex items-center justify-between border-b border-slate-200 pb-4 gap-4">
      {/* 4 Pillars Pill Tabs (Lu.ma Style) */}
      <div className="flex items-center gap-1.5 p-1 sm:p-1.5 bg-slate-100/90 rounded-full border border-slate-200/80 overflow-x-auto scrollbar-none max-w-full shadow-xs shrink-0">
        <button
          onClick={() => setSelectedPillar("all")}
          className={`px-4 py-2 text-xs font-semibold rounded-full transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
            selectedPillar === "all"
              ? "bg-white text-slate-900 shadow-xs border border-slate-200/90 font-bold"
              : "text-slate-600 hover:text-slate-900 hover:bg-white/60"
          }`}
        >
          <Layers className="w-3.5 h-3.5 text-amber-600" />
          <span>All</span>
          <span className="text-[10px] opacity-70">({totalListingsCount})</span>
        </button>

        <button
          onClick={() => setSelectedPillar("walks")}
          className={`px-4 py-2 text-xs font-semibold rounded-full transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
            selectedPillar === "walks"
              ? "bg-white text-slate-900 shadow-xs border border-slate-200/90 font-bold"
              : "text-slate-600 hover:text-slate-900 hover:bg-white/60"
          }`}
        >
          <Compass className="w-3.5 h-3.5 text-amber-600" />
          <span>Walks</span>
          <span className="text-[10px] opacity-70">
            ({pillarCounts.walks || 0})
          </span>
        </button>

        <button
          onClick={() => setSelectedPillar("workshops")}
          className={`px-4 py-2 text-xs font-semibold rounded-full transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
            selectedPillar === "workshops"
              ? "bg-white text-slate-900 shadow-xs border border-slate-200/90 font-bold"
              : "text-slate-600 hover:text-slate-900 hover:bg-white/60"
          }`}
        >
          <Hammer className="w-3.5 h-3.5 text-amber-600" />
          <span>Workshops</span>
          <span className="text-[10px] opacity-70">
            ({pillarCounts.workshops || 0})
          </span>
        </button>

        <button
          onClick={() => setSelectedPillar("food")}
          className={`px-4 py-2 text-xs font-semibold rounded-full transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
            selectedPillar === "food"
              ? "bg-white text-slate-900 shadow-xs border border-slate-200/90 font-bold"
              : "text-slate-600 hover:text-slate-900 hover:bg-white/60"
          }`}
        >
          <UtensilsCrossed className="w-3.5 h-3.5 text-amber-600" />
          <span>Food</span>
          <span className="text-[10px] opacity-70">
            ({pillarCounts.food || 0})
          </span>
        </button>

        <button
          onClick={() => setSelectedPillar("goods")}
          className={`px-4 py-2 text-xs font-semibold rounded-full transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
            selectedPillar === "goods"
              ? "bg-white text-slate-900 shadow-xs border border-slate-200/90 font-bold"
              : "text-slate-600 hover:text-slate-900 hover:bg-white/60"
          }`}
        >
          <ShoppingBag className="w-3.5 h-3.5 text-amber-600" />
          <span>Goods</span>
          <span className="text-[10px] opacity-70">
            ({pillarCounts.goods || 0})
          </span>
        </button>
      </div>

      <div className="hidden md:block text-xs text-slate-500 font-medium">
        Curated coastal experiences &amp; authentic goods
      </div>
    </div>
  );
};
