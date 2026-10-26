import React from "react";
import { Sparkles, AlertCircle } from "lucide-react";

interface UrgencyBadgeEditorProps {
  active: boolean;
  onActiveChange: (active: boolean) => void;
  badgeText: string;
  onBadgeTextChange: (text: string) => void;
  customCapacity?: number | undefined;
  onCustomCapacityChange?: ((cap?: number | undefined) => void) | undefined;
  placeholder?: string | undefined;
}

export const UrgencyBadgeEditor: React.FC<UrgencyBadgeEditorProps> = ({
  active,
  onActiveChange,
  badgeText,
  onBadgeTextChange,
  customCapacity,
  onCustomCapacityChange,
  placeholder = "e.g. Only 3 spots remaining for this tide!",
}) => {
  return (
    <div className="p-3.5 rounded-xl bg-[#29100b] border border-[#dab38c]/25 space-y-2.5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-[#e3a157]" />
          <span className="text-[11px] font-bold text-[#e3a157] uppercase tracking-wider">
            Retail Scarcity & Capacity Urgency
          </span>
        </div>
        <label className="flex items-center gap-1.5 cursor-pointer text-xs select-none">
          <input
            type="checkbox"
            checked={active}
            onChange={(e) => onActiveChange(e.target.checked)}
            className="accent-[#e3a157] rounded cursor-pointer"
          />
          <span className="text-[11px] font-semibold text-[#dab38c]">
            {active ? "Badge Active" : "Disabled"}
          </span>
        </label>
      </div>

      <div className="space-y-2">
        <div>
          <label className="block text-[10px] font-bold text-[#dab38c]/80 uppercase mb-1">
            Urgency / Scarcity Badge Text
          </label>
          <input
            type="text"
            value={badgeText}
            onChange={(e) => onBadgeTextChange(e.target.value)}
            placeholder={placeholder}
            className="w-full px-3 py-1.5 bg-[#1f0b07] border border-[#dab38c]/30 rounded-lg text-xs text-[#f5edeb] focus:border-[#e3a157] outline-none placeholder:text-[#dab38c]/30"
          />
        </div>

        {onCustomCapacityChange && (
          <div className="flex items-center gap-2">
            <label className="text-[10px] font-bold text-[#dab38c]/80 uppercase">
              Urgency Capacity Trigger:
            </label>
            <input
              type="number"
              min="1"
              max="100"
              value={customCapacity ?? ""}
              onChange={(e) =>
                onCustomCapacityChange(e.target.value ? Number(e.target.value) : undefined)
              }
              placeholder="e.g. 3"
              className="w-20 px-2 py-1 bg-[#1f0b07] border border-[#dab38c]/30 rounded-lg text-xs text-[#f5edeb] focus:border-[#e3a157] outline-none font-mono"
            />
            <span className="text-[10px] text-[#dab38c]/60">seats/items left</span>
          </div>
        )}
      </div>

      {active && badgeText && (
        <div className="pt-1 flex items-center gap-2 text-[11px]">
          <span className="text-[#dab38c]/60">Preview:</span>
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-300 font-bold text-[10px]">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
            {badgeText}
          </span>
        </div>
      )}
    </div>
  );
};
