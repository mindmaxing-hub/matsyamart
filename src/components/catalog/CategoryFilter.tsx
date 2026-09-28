import React from "react";
import {
  Compass,
  Sparkles,
  Sailboat,
  UtensilsCrossed,
  Hammer,
  Fish,
  Layers,
} from "lucide-react";
import { Category, ListingType } from "../../types";

interface CategoryFilterProps {
  categories: Category[];
  selectedType: "all" | ListingType;
  setSelectedType: (type: "all" | ListingType) => void;
  selectedCategorySlug: string;
  setSelectedCategorySlug: (slug: string) => void;
  totalListingsCount: number;
}

export const CategoryFilter: React.FC<CategoryFilterProps> = ({
  categories,
  selectedType,
  setSelectedType,
  selectedCategorySlug,
  setSelectedCategorySlug,
  totalListingsCount,
}) => {
  const getCategoryIcon = (slug: string) => {
    switch (slug) {
      case "heritage-walks":
        return <Compass className="w-4 h-4" />;
      case "boat-safaris":
        return <Sailboat className="w-4 h-4" />;
      case "workshops":
        return <Hammer className="w-4 h-4" />;
      case "culinary-trails":
        return <UtensilsCrossed className="w-4 h-4" />;
      case "artisan-goods":
        return <Sparkles className="w-4 h-4" />;
      case "sun-dried-pantry":
        return <Fish className="w-4 h-4" />;
      default:
        return <Layers className="w-4 h-4" />;
    }
  };

  return (
    <div className="space-y-4">
      {/* Top Level Type Tabs */}
      <div className="flex items-center justify-between border-b border-slate-200 pb-3 flex-wrap gap-3">
        <div className="inline-flex p-1 bg-slate-100 rounded-xl border border-slate-200">
          <button
            onClick={() => {
              setSelectedType("all");
              setSelectedCategorySlug("all");
            }}
            className={`px-4 py-2 text-xs sm:text-sm font-semibold rounded-lg transition-all ${
              selectedType === "all"
                ? "bg-ocean-900 text-white shadow-xs"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            All Catalog ({totalListingsCount})
          </button>

          <button
            onClick={() => {
              setSelectedType("experience");
              setSelectedCategorySlug("all");
            }}
            className={`px-4 py-2 text-xs sm:text-sm font-semibold rounded-lg transition-all ${
              selectedType === "experience"
                ? "bg-ocean-800 text-white shadow-xs"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            Coastal Experiences & Tours
          </button>

          <button
            onClick={() => {
              setSelectedType("product");
              setSelectedCategorySlug("all");
            }}
            className={`px-4 py-2 text-xs sm:text-sm font-semibold rounded-lg transition-all ${
              selectedType === "product"
                ? "bg-amber-600 text-white shadow-xs"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            Artisan Goods & Pantry
          </button>
        </div>

        <div className="text-xs text-slate-500 font-medium">
          Showing authentic Koliwada initiatives
        </div>
      </div>

      {/* Category Pills Slider */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        <button
          onClick={() => setSelectedCategorySlug("all")}
          className={`px-3.5 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all flex items-center gap-1.5 border ${
            selectedCategorySlug === "all"
              ? "bg-ocean-900 text-white border-ocean-900 shadow-xs"
              : "bg-white text-slate-700 border-slate-200 hover:border-slate-300 hover:bg-slate-50"
          }`}
        >
          <Layers className="w-3.5 h-3.5" />
          <span>All Categories</span>
        </button>

        {categories.map((cat) => {
          const isSelected = selectedCategorySlug === cat.slug;
          return (
            <button
              key={cat.id}
              onClick={() => setSelectedCategorySlug(cat.slug)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all flex items-center gap-1.5 border ${
                isSelected
                  ? "bg-ocean-800 text-white border-ocean-800 shadow-xs"
                  : "bg-white text-slate-700 border-slate-200 hover:border-slate-300 hover:bg-slate-50"
              }`}
            >
              {getCategoryIcon(cat.slug)}
              <span>{cat.name}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
