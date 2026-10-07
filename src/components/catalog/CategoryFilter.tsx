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
    <div className="w-full flex items-center justify-between border-b border-[#dab38c]/15 pb-4 gap-4">
      {/* 4 Pillars Pill Tabs — Goods → Food → Walks → Workshops */}
      <div className="flex items-center gap-1.5 p-1 sm:p-1.5 bg-[#35160e]/80 rounded-full border border-[#dab38c]/20 backdrop-blur-md overflow-x-auto scrollbar-none max-w-full shadow-md shrink-0">
        <button
          onClick={() => setSelectedPillar("all")}
          className={`px-4 py-2 text-xs font-semibold rounded-full transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
            selectedPillar === "all"
              ? "bg-[#f5edeb] text-[#29100b] shadow-md border-transparent font-bold"
              : "text-[#dab38c] hover:text-[#f5edeb] hover:bg-[#481f14]"
          }`}
        >
          <Layers className="w-3.5 h-3.5 text-[#e3a157]" />
          <span>All</span>
          <span className="text-[10px] opacity-70">({totalListingsCount})</span>
        </button>

        <button
          onClick={() => setSelectedPillar("goods")}
          className={`px-4 py-2 text-xs font-semibold rounded-full transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
            selectedPillar === "goods"
              ? "bg-[#f5edeb] text-[#29100b] shadow-md border-transparent font-bold"
              : "text-[#dab38c] hover:text-[#f5edeb] hover:bg-[#481f14]"
          }`}
        >
          <ShoppingBag className="w-3.5 h-3.5 text-[#e3a157]" />
          <span>Goods</span>
          <span className="text-[10px] opacity-70">
            ({pillarCounts.goods || 0})
          </span>
        </button>

        <button
          onClick={() => setSelectedPillar("food")}
          className={`px-4 py-2 text-xs font-semibold rounded-full transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
            selectedPillar === "food"
              ? "bg-[#f5edeb] text-[#29100b] shadow-md border-transparent font-bold"
              : "text-[#dab38c] hover:text-[#f5edeb] hover:bg-[#481f14]"
          }`}
        >
          <UtensilsCrossed className="w-3.5 h-3.5 text-[#e3a157]" />
          <span>Food</span>
          <span className="text-[10px] opacity-70">
            ({pillarCounts.food || 0})
          </span>
        </button>

        <button
          onClick={() => setSelectedPillar("walks")}
          className={`px-4 py-2 text-xs font-semibold rounded-full transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
            selectedPillar === "walks"
              ? "bg-[#f5edeb] text-[#29100b] shadow-md border-transparent font-bold"
              : "text-[#dab38c] hover:text-[#f5edeb] hover:bg-[#481f14]"
          }`}
        >
          <Compass className="w-3.5 h-3.5 text-[#e3a157]" />
          <span>Walks</span>
          <span className="text-[10px] opacity-70">
            ({pillarCounts.walks || 0})
          </span>
        </button>

        <button
          onClick={() => setSelectedPillar("workshops")}
          className={`px-4 py-2 text-xs font-semibold rounded-full transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
            selectedPillar === "workshops"
              ? "bg-[#f5edeb] text-[#29100b] shadow-md border-transparent font-bold"
              : "text-[#dab38c] hover:text-[#f5edeb] hover:bg-[#481f14]"
          }`}
        >
          <Hammer className="w-3.5 h-3.5 text-[#e3a157]" />
          <span>Workshops</span>
          <span className="text-[10px] opacity-70">
            ({pillarCounts.workshops || 0})
          </span>
        </button>
      </div>
    </div>
  );
};
