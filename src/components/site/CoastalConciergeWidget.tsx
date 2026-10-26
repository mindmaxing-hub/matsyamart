import React, { useState } from "react";
import { MessageSquare, X, Compass, ExternalLink } from "lucide-react";
import {
  FAST2SMS_SENDER_DISPLAY,
  FAST2SMS_SENDER_PHONE_ID,
} from "../../lib/fast2smsWhatsApp";

interface CoastalConciergeWidgetProps {
  listingTitle?: string | undefined;
  pillar?: string | undefined;
  hostName?: string | undefined;
  hostPhone?: string | undefined;
}

export const CoastalConciergeWidget: React.FC<CoastalConciergeWidgetProps> = ({
  listingTitle,
  pillar,
  hostName,
  hostPhone,
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const cleanPhone = hostPhone
    ? hostPhone.replace(/\D/g, "")
    : "917666511511";

  const targetNumber = cleanPhone.length === 10 ? `91${cleanPhone}` : cleanPhone;

  const defaultText = listingTitle
    ? `Namaste! I have an inquiry regarding "${listingTitle}" on MatsyaMart.`
    : `Namaste MatsyaMart! I have a question regarding coastal experiences and authentic catch.`;

  const waUrl = `https://wa.me/${targetNumber}?text=${encodeURIComponent(defaultText)}`;

  return (
    <div className="fixed bottom-6 right-6 z-40 print:hidden font-sans">
      {/* Popover Bubble */}
      {isOpen && (
        <div className="mb-3 w-72 sm:w-80 rounded-2xl bg-[#29100b] border border-[#dab38c]/30 shadow-2xl p-4 text-xs space-y-3 animate-in fade-in slide-in-from-bottom-2 duration-200">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-[#35160e] border border-[#e3a157]/40 flex items-center justify-center text-[#e3a157]">
                <Compass className="w-4 h-4" />
              </div>
              <div>
                <h4 className="font-display font-bold text-sm text-[#f5edeb]">
                  Coastal Host Concierge
                </h4>
                <p className="text-[10px] text-[#dab38c]/70">
                  {hostName ? `Host: ${hostName}` : "Kolibaba Seafood & Bhoomiputra"}
                </p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1 rounded-full text-[#dab38c]/60 hover:text-[#f5edeb] hover:bg-[#35160e] cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          <p className="text-[11px] text-[#dab38c] leading-relaxed">
            Need help with tidal schedules, dietary accommodations, or custom group bookings? Chat directly with our indigenous coastal coordinator on WhatsApp.
          </p>

          <a
            href={waUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md transition-all cursor-pointer"
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span>Chat on WhatsApp</span>
            <ExternalLink className="w-3 h-3 opacity-70" />
          </a>
        </div>
      )}

      {/* Floating Pill Toggle Button */}
      <button
        onClick={() => setIsOpen((prev) => !prev)}
        className="group flex items-center gap-2.5 px-4 py-3 rounded-full bg-[#1c0b07] hover:bg-[#29100b] border border-emerald-500/50 hover:border-emerald-400 text-emerald-300 font-bold text-xs shadow-xl transition-all duration-300 hover:scale-105 cursor-pointer backdrop-blur-md"
        aria-label="Open Coastal WhatsApp Concierge"
      >
        <div className="relative">
          <div className="w-6 h-6 rounded-full bg-emerald-600 text-white flex items-center justify-center">
            <MessageSquare className="w-3.5 h-3.5 fill-current" />
          </div>
          <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
        </div>
        <span className="hidden sm:inline-block font-semibold">
          Ask Host on WhatsApp
        </span>
      </button>
    </div>
  );
};
