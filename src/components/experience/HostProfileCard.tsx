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
    <div className="bg-[#35160e]/85 border border-[#dab38c]/20 rounded-3xl p-6 sm:p-7 space-y-4 shadow-md backdrop-blur-md">
      <div className="flex items-start gap-4">
        {/* Host Avatar / Anchor Icon */}
        <div className="w-14 h-14 rounded-2xl bg-[#481f14] text-[#e3a157] flex items-center justify-center shrink-0 shadow-md border border-[#dab38c]/30">
          <Anchor className="w-7 h-7 text-[#e3a157]" />
        </div>

        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#e3a157] bg-[#29100b]/80 border border-[#e3a157]/30 px-2.5 py-0.5 rounded-full">
              Community Lead Host
            </span>
            <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-400">
              <ShieldCheck className="w-3.5 h-3.5" /> Verified
            </span>
          </div>

          <h3 className="font-display font-bold text-xl text-[#f5edeb]">
            {listing.host_name}
          </h3>

          <p className="text-xs text-[#dab38c] font-medium">
            {listing.location_name || listing.artisan_collective}
          </p>
        </div>
      </div>

      {listing.host_bio && (
        <p className="text-xs sm:text-sm text-[#dab38c] leading-relaxed pt-2 border-t border-[#dab38c]/15">
          {listing.host_bio}
        </p>
      )}

      {/* Community Revenue Pledge */}
      <div className="pt-2 flex items-center gap-2 text-xs font-semibold text-[#dab38c]">
        <Award className="w-4 h-4 text-[#e3a157] shrink-0" />
        <span>
          Direct-to-host payout backed by community ethical guidelines
        </span>
      </div>
    </div>
  );
};
