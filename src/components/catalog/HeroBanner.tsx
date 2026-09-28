import React from 'react';
import { Search, Compass, ShieldCheck, MapPin, Sparkles } from 'lucide-react';

interface HeroBannerProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  selectedLocation: string;
  setSelectedLocation: (loc: string) => void;
  uniqueLocations: string[];
}

export const HeroBanner: React.FC<HeroBannerProps> = ({
  searchQuery,
  setSearchQuery,
  selectedLocation,
  setSelectedLocation,
  uniqueLocations,
}) => {
  return (
    <div className="relative bg-ocean-950 text-white overflow-hidden py-16 md:py-24 border-b border-ocean-800">
      {/* Background Graphic & Texture Overlay */}
      <div className="absolute inset-0 bg-gradient-to-r from-ocean-950 via-ocean-900 to-ocean-800 opacity-95"></div>
      <div 
        className="absolute inset-0 opacity-20 bg-cover bg-center mix-blend-overlay"
        style={{
          backgroundImage: `url('https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&w=2000&q=80')`,
        }}
      ></div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Eyebrow Badge */}
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-ocean-800/80 border border-ocean-700/80 backdrop-blur-md mb-6 text-xs text-sun-300 font-semibold shadow-xs">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Bhoomiputra Coastal Experiences & Artisan Marketplace</span>
        </div>

        {/* Headline & Mission */}
        <div className="max-w-3xl space-y-4">
          <h1 className="font-display text-3xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-white leading-[1.15]">
            Experience the Living Coast. <br />
            <span className="text-sun-300">Support Indigenous Guardians.</span>
          </h1>
          <p className="text-sm sm:text-base text-ocean-100/90 leading-relaxed font-normal max-w-2xl">
            Book authentic dawn harbor walks, tidal mangrove boat safaris, net-weaving workshops, and sun-dried coastal pantry goods. Direct revenue straight to Koli elders, fishermen, and women’s self-help collectives.
          </p>
        </div>

        {/* Search & Location Bar */}
        <div className="mt-8 max-w-3xl bg-white p-2.5 rounded-2xl shadow-modal flex flex-col sm:flex-row items-center gap-2.5 text-slate-800 border border-slate-200">
          
          {/* Text Search */}
          <div className="flex items-center gap-2.5 px-3 py-2 flex-1 w-full border-b sm:border-b-0 sm:border-r border-slate-200">
            <Search className="w-5 h-5 text-ocean-700 shrink-0" />
            <input
              type="text"
              placeholder="Search trails, boat safaris, fish species, masalas..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full text-xs sm:text-sm bg-transparent border-none outline-none text-slate-900 placeholder:text-slate-400"
            />
          </div>

          {/* Location Dropdown */}
          <div className="flex items-center gap-2 px-3 py-2 w-full sm:w-auto shrink-0">
            <MapPin className="w-4 h-4 text-ocean-700 shrink-0" />
            <select
              value={selectedLocation}
              onChange={(e) => setSelectedLocation(e.target.value)}
              className="text-xs sm:text-sm bg-transparent border-none outline-none text-slate-700 font-medium cursor-pointer"
            >
              <option value="all">All Coastal Locations</option>
              {uniqueLocations.map((loc) => (
                <option key={loc} value={loc}>
                  {loc}
                </option>
              ))}
            </select>
          </div>

          {/* Action Trigger */}
          <button 
            className="w-full sm:w-auto px-6 py-2.5 bg-ocean-800 hover:bg-ocean-900 text-white rounded-xl text-xs sm:text-sm font-semibold transition-colors shrink-0 flex items-center justify-center gap-2"
          >
            <Compass className="w-4 h-4 text-sun-300" />
            <span>Search</span>
          </button>
        </div>

        {/* Impact Highlights Bar */}
        <div className="mt-8 flex flex-wrap items-center gap-6 text-xs text-ocean-200 font-medium">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-sun-300" />
            <span>100% Direct Payouts to Hosts</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-sun-300"></span>
            <span>Zero Middlemen Commission</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
            <span>Verified Indigenous Storytellers</span>
          </div>
        </div>

      </div>
    </div>
  );
};
