import React, { useState, useEffect } from "react";
import { MessageCircle, Share2, Sparkles, X } from "lucide-react";
import {
  MATSYAMART_WHATSAPP_NUMBER,
  MATSYAMART_WHATSAPP_DISPLAY,
  buildWhatsAppUrl,
} from "../../lib/whatsapp";

export function WhatsAppIcon({ size = 26 }: { size?: number }) {
  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.46 1.32 4.96L2 22l5.25-1.38a9.9 9.9 0 0 0 4.79 1.22h.01c5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.82 9.82 0 0 0 12.04 2Zm0 18.13h-.01a8.23 8.23 0 0 1-4.19-1.15l-.3-.18-3.11.82.83-3.04-.2-.31a8.21 8.21 0 0 1-1.26-4.36c0-4.54 3.7-8.24 8.25-8.24 2.2 0 4.27.86 5.83 2.42a8.19 8.19 0 0 1 2.41 5.83c0 4.54-3.7 8.21-8.25 8.21Zm4.52-6.16c-.25-.12-1.47-.72-1.69-.81-.23-.08-.39-.12-.56.13-.16.24-.64.8-.78.97-.15.16-.29.18-.54.06-.25-.13-1.05-.39-1.99-1.23-.74-.66-1.23-1.47-1.38-1.72-.14-.25-.01-.38.11-.5.11-.11.25-.29.37-.44.13-.15.17-.25.25-.41.09-.17.04-.31-.02-.43-.06-.12-.56-1.34-.76-1.84-.2-.48-.4-.42-.56-.43h-.48c-.16 0-.43.06-.65.31-.22.25-.85.83-.85 2.03s.87 2.35.99 2.51c.12.16 1.71 2.61 4.15 3.66.58.25 1.03.4 1.39.51.58.19 1.11.16 1.53.1.47-.07 1.47-.6 1.67-1.18.21-.58.21-1.07.15-1.18-.06-.1-.22-.16-.47-.28Z" />
    </svg>
  );
}

export const WhatsAppChat: React.FC = () => {
  const [showTooltip, setShowTooltip] = useState(false);
  const [currentPath, setCurrentPath] = useState("/");

  useEffect(() => {
    if (typeof window !== "undefined") {
      setCurrentPath(window.location.pathname);
    }
  }, []);

  const isExperience = currentPath.includes("/experience/");
  const isProduct = currentPath.includes("/product/");

  const defaultMsg = isExperience
    ? "Namaste MatsyaMart! I'm interested in booking a coastal experience and have a quick question."
    : isProduct
      ? "Namaste MatsyaMart! I'm looking at your artisanal coastal pantry goods and would like to order."
      : "Namaste MatsyaMart! I would like to know more about upcoming coastal walks, feasts, and masterclasses.";

  const waUrl = buildWhatsAppUrl(MATSYAMART_WHATSAPP_NUMBER, defaultMsg);

  return (
    <div
      className="fixed bottom-6 right-6 z-40 print:hidden flex items-end gap-3"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      {/* Pill Tooltip */}
      {showTooltip && (
        <div className="hidden sm:flex items-center gap-2 px-3.5 py-2 bg-[#1f0b07] text-[#f5edeb] border border-[#dab38c]/30 rounded-2xl shadow-2xl text-xs backdrop-blur-md animate-in fade-in slide-in-from-right-2">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
          <span className="font-medium">Chat with MatsyaMart</span>
          <span className="text-[#dab38c]/60 font-mono text-[11px]">
            {MATSYAMART_WHATSAPP_DISPLAY}
          </span>
        </div>
      )}

      {/* Floating Action Button */}
      <a
        href={waUrl}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Chat with MatsyaMart on WhatsApp"
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
        className="group relative flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366] text-white shadow-[0_12px_35px_-8px_rgba(37,211,102,0.85)] ring-2 ring-white/20 transition-all hover:scale-110 active:scale-95 focus:outline-hidden cursor-pointer"
      >
        <WhatsAppIcon size={30} />

        {/* Pulse Beacon */}
        <span className="absolute -top-1 -right-1 flex h-4 w-4">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75" />
          <span className="relative inline-flex rounded-full h-4 w-4 bg-[#ffde59] border-2 border-[#1f0b07]" />
        </span>
      </a>
    </div>
  );
};
