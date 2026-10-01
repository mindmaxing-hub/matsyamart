import React from "react";
import { ShieldCheck, Anchor, Award } from "lucide-react";
import { Listing } from "../../types";

interface HostProfileCardProps {
  listing: Listing;
}

export const HostProfileCard: React.FC<HostProfileCardProps> = ({
  listing,
}) => {
  return (
    <div className="bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-7 space-y-4 shadow-xs">
      <div className="flex items-start gap-4">
        {/* Host Avatar / Anchor Icon */}
        <div className="w-14 h-14 rounded-2xl bg-slate-900 text-white flex items-center justify-center shrink-0 shadow-xs border border-slate-800">
          <Anchor className="w-7 h-7 text-amber-300" />
        </div>

        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-amber-900 bg-amber-100/90 border border-amber-300/60 px-2 py-0.5 rounded-full">
              Community Lead Host
            </span>
            <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700">
              <ShieldCheck className="w-3.5 h-3.5" /> Verified
            </span>
          </div>

          <h3 className="font-display font-bold text-xl text-slate-900">
            {listing.host_name}
          </h3>

          <p className="text-xs text-slate-500 font-medium">
            {listing.location_name || listing.artisan_collective}
          </p>
        </div>
      </div>

      {listing.host_bio && (
        <p className="text-xs sm:text-sm text-slate-600 leading-relaxed pt-2 border-t border-slate-100">
          {listing.host_bio}
        </p>
      )}

      {/* Community Revenue Pledge */}
      <div className="pt-2 flex items-center gap-2 text-xs font-semibold text-slate-700">
        <Award className="w-4 h-4 text-amber-600 shrink-0" />
        <span>
          Direct-to-host payout backed by community ethical guidelines
        </span>
      </div>
    </div>
  );
};
