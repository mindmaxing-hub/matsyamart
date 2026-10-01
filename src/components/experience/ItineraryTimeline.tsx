import React from "react";
import { Clock } from "lucide-react";
import { ItineraryItem } from "../../types";

interface ItineraryTimelineProps {
  itinerary: ItineraryItem[];
}

export const ItineraryTimeline: React.FC<ItineraryTimelineProps> = ({
  itinerary,
}) => {
  if (!itinerary || itinerary.length === 0) return null;

  return (
    <div className="space-y-4">
      <h3 className="font-display font-bold text-xl text-[#f5edeb] flex items-center gap-2">
        <Clock className="w-5 h-5 text-[#e3a157]" />
        <span>Experience Itinerary & Route Timeline</span>
      </h3>

      <div className="relative border-l-2 border-[#dab38c]/25 ml-3.5 space-y-6 py-2">
        {itinerary.map((item, idx) => (
          <div key={idx} className="relative pl-6 group">
            {/* Timeline Dot */}
            <div className="absolute -left-[9px] top-1.5 w-4 h-4 rounded-full bg-[#1f0b07] border-2 border-[#e3a157] group-hover:bg-[#e3a157] transition-colors" />

            <div className="bg-[#35160e]/85 border border-[#dab38c]/20 rounded-2xl p-4 shadow-md backdrop-blur-md">
              <span className="text-xs font-bold text-[#e3a157] bg-[#e3a157]/10 border border-[#e3a157]/25 px-2.5 py-0.5 rounded-full inline-block mb-1">
                {item.time}
              </span>
              <h4 className="font-display font-semibold text-base text-[#f5edeb] mt-1">
                {item.title}
              </h4>
              <p className="text-xs text-[#dab38c] mt-1 leading-relaxed">
                {item.description}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
