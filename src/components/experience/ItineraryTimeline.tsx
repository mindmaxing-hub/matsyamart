import React from 'react';
import { Clock } from 'lucide-react';
import { ItineraryItem } from '../../types';

interface ItineraryTimelineProps {
  itinerary: ItineraryItem[];
}

export const ItineraryTimeline: React.FC<ItineraryTimelineProps> = ({ itinerary }) => {
  if (!itinerary || itinerary.length === 0) return null;

  return (
    <div className="space-y-4">
      <h3 className="font-display font-bold text-xl text-ocean-950 flex items-center gap-2">
        <Clock className="w-5 h-5 text-ocean-700" />
        <span>Experience Itinerary & Route Timeline</span>
      </h3>

      <div className="relative border-l-2 border-ocean-200 ml-3.5 space-y-6 py-2">
        {itinerary.map((item, idx) => (
          <div key={idx} className="relative pl-6 group">
            {/* Timeline Dot */}
            <div className="absolute -left-[9px] top-1.5 w-4 h-4 rounded-full bg-white border-2 border-ocean-600 group-hover:bg-sun-300 transition-colors" />
            
            <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-4 shadow-xs">
              <span className="text-xs font-bold text-ocean-800 bg-ocean-100/80 px-2.5 py-0.5 rounded-full inline-block mb-1">
                {item.time}
              </span>
              <h4 className="font-display font-semibold text-base text-slate-900 mt-1">
                {item.title}
              </h4>
              <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                {item.description}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
