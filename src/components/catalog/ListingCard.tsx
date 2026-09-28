import React from 'react';
import { Link } from 'react-router-dom';
import { Clock, MapPin, Package, ArrowRight, ShoppingBag, ShieldCheck } from 'lucide-react';
import { Listing } from '../../types';
import { formatINR, formatDuration } from '../../lib/utils';
import { useCart } from '../../context/CartContext';

interface ListingCardProps {
  listing: Listing;
}

export const ListingCard: React.FC<ListingCardProps> = ({ listing }) => {
  const { addItem } = useCart();
  const isExperience = listing.type === 'experience';

  const detailPath = isExperience ? `/experience/${listing.slug}` : `/product/${listing.slug}`;

  const handleQuickAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addItem(listing, 1);
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 shadow-tactile hover:shadow-tactile-hover transition-all duration-300 flex flex-col overflow-hidden group">
      
      {/* Image Container with Badges */}
      <Link to={detailPath} className="relative aspect-[16/10] overflow-hidden bg-slate-100 block">
        <img
          src={listing.images[0]}
          alt={listing.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />
        
        {/* Floating Top Badges */}
        <div className="absolute top-3 inset-x-3 flex items-center justify-between pointer-events-none">
          {/* Type Badge */}
          <span
            className={`text-[11px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider backdrop-blur-md shadow-xs ${
              isExperience
                ? 'bg-ocean-900/90 text-white border border-ocean-700/80'
                : 'bg-amber-600/90 text-white border border-amber-500/80'
            }`}
          >
            {isExperience ? 'Experience' : 'Artisan Good'}
          </span>

          {/* Metric Pill */}
          <span className="text-[11px] font-semibold px-2.5 py-1 rounded-full bg-white/95 text-slate-800 backdrop-blur-md border border-slate-200 shadow-xs flex items-center gap-1">
            {isExperience ? (
              <>
                <Clock className="w-3 h-3 text-ocean-700" />
                <span>{formatDuration(listing.duration_minutes)}</span>
              </>
            ) : (
              <>
                <Package className="w-3 h-3 text-amber-700" />
                <span>{listing.weight_grams ? `${listing.weight_grams}g` : 'Authentic'}</span>
              </>
            )}
          </span>
        </div>

        {/* Community Host Pill on Bottom of Image */}
        <div className="absolute bottom-2.5 left-3 right-3 pointer-events-none">
          <div className="bg-black/60 backdrop-blur-md text-white text-[11px] font-medium py-1 px-2.5 rounded-lg flex items-center gap-1.5 line-clamp-1 border border-white/20">
            <ShieldCheck className="w-3.5 h-3.5 text-sun-300 shrink-0" />
            <span className="truncate">{listing.host_name}</span>
          </div>
        </div>
      </Link>

      {/* Card Content Area */}
      <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
        
        <div className="space-y-2">
          {/* Location / Collective Tag */}
          <div className="flex items-center gap-1 text-[11px] font-medium text-slate-500">
            <MapPin className="w-3.5 h-3.5 text-ocean-700 shrink-0" />
            <span className="truncate">
              {listing.location_name || listing.artisan_collective}
            </span>
          </div>

          {/* Title */}
          <Link to={detailPath} className="block group-hover:text-ocean-700 transition-colors">
            <h3 className="font-display font-bold text-base sm:text-lg text-slate-900 leading-snug line-clamp-2">
              {listing.title}
            </h3>
          </Link>

          {/* Short Summary */}
          <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
            {listing.short_summary}
          </p>
        </div>

        {/* Pricing & Call to Action */}
        <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-3">
          <div>
            <div className="text-[10px] text-slate-400 uppercase font-semibold tracking-wider">
              {isExperience ? 'Per Attendee' : 'Direct Price'}
            </div>
            <div className="font-display font-bold text-lg text-ocean-950">
              {formatINR(listing.price_inr)}
              <span className="text-xs font-normal text-slate-500 font-sans">
                {isExperience ? ' / person' : ' / pack'}
              </span>
            </div>
          </div>

          {/* Action Button */}
          {isExperience ? (
            <Link
              to={detailPath}
              className="px-4 py-2 bg-ocean-800 hover:bg-ocean-900 text-white rounded-xl text-xs font-semibold transition-all shadow-xs flex items-center gap-1.5 hover:gap-2 group/btn"
            >
              <span>Reserve Spot</span>
              <ArrowRight className="w-3.5 h-3.5 transition-transform" />
            </Link>
          ) : (
            <button
              onClick={handleQuickAdd}
              className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-semibold transition-all shadow-xs flex items-center gap-1.5"
            >
              <ShoppingBag className="w-3.5 h-3.5" />
              <span>Add to Bag</span>
            </button>
          )}
        </div>

      </div>

    </div>
  );
};
