import React from 'react';
import { ShieldCheck, Anchor, Award } from 'lucide-react';
import { Listing } from '../../types';

interface HostProfileCardProps {
  listing: Listing;
}

export const HostProfileCard: React.FC<HostProfileCardProps> = ({ listing }) => {
  return (
    <div className="bg-ocean-50/60 border border-ocean-200/80 rounded-3xl p-6 sm:p-7 space-y-4">
      
      <div className="flex items-start gap-4">
        {/* Host Avatar / Anchor Icon */}
        <div className="w-14 h-14 rounded-2xl bg-ocean-900 text-white flex items-center justify-center shrink-0 shadow-md border border-ocean-700">
          <Anchor className="w-7 h-7 text-sun-300" />
        </div>

        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-ocean-700 bg-ocean-100 px-2 py-0.5 rounded-full">
              Community Lead Host
            </span>
            <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700">
              <ShieldCheck className="w-3.5 h-3.5" /> Verified
            </span>
          </div>

          <h3 className="font-display font-bold text-xl text-ocean-950">
            {listing.host_name}
          </h3>

          <p className="text-xs text-slate-500 font-medium">
            {listing.location_name || listing.artisan_collective}
          </p>
        </div>
      </div>

      {listing.host_bio && (
        <p className="text-xs sm:text-sm text-slate-700 leading-relaxed pt-2 border-t border-ocean-200/60">
          {listing.host_bio}
        </p>
      )}

      {/* Community Revenue Pledge */}
      <div className="pt-2 flex items-center gap-2 text-xs font-semibold text-ocean-800">
        <Award className="w-4 h-4 text-sun-300 shrink-0" />
        <span>Direct-to-host payout backed by Bhoomiputra Foundation ethical guidelines</span>
      </div>

    </div>
  );
};
