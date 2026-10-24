import React, { useState, useEffect } from "react";
import { Order, OrderItem, Listing, ExperienceSlot } from "../../types";
import { generateQrDataUrl } from "../../lib/qr";
import { buildGoogleMapsUrl } from "../../lib/services/places";
import { encodePassPayload } from "../../lib/passPayload";
import { resolvePassCategory, PASS_THEMES } from "../../lib/passThemes";
import {
  Printer,
  X,
  Share2,
  Copy,
  Check,
  Sparkles,
} from "lucide-react";
import { toast } from "sonner";

export interface MobilePassProps {
  order: Order;
  item?: OrderItem;
  onClose: () => void;
}

function formatPassDate(isoDate?: string): string {
  if (!isoDate) return "12/12/2026";
  try {
    const d = new Date(isoDate);
    const day = String(d.getDate()).padStart(2, "0");
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const year = d.getFullYear();
    return `${day}/${month}/${year}`;
  } catch {
    return "12/12/2026";
  }
}

function formatReportingTime(isoDate?: string): string {
  if (!isoDate) return "6:30 pm";
  try {
    const d = new Date(isoDate);
    return d
      .toLocaleTimeString("en-IN", {
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      })
      .toLowerCase();
  } catch {
    return "6:30 pm";
  }
}

export const MobilePass: React.FC<MobilePassProps> = ({
  order,
  item: propItem,
  onClose,
}) => {
  const item =
    propItem ||
    order.items.find((i) => i.listing?.type === "experience") ||
    order.items[0];
  const listing: Listing | undefined = item?.listing;
  const slot: ExperienceSlot | undefined = item?.slot;

  const themeCategory = resolvePassCategory(listing);
  const theme = PASS_THEMES[themeCategory];

  const [qrDataUrl, setQrDataUrl] = useState<string>("");
  const [copied, setCopied] = useState(false);

  const payload = encodePassPayload(order);
  const origin = typeof window !== "undefined" ? window.location.origin : "";
  const verificationUrl = payload
    ? `${origin}/order/confirmation/${order.order_ref}?p=${payload}`
    : `${origin}/order/confirmation/${order.order_ref}`;

  useEffect(() => {
    // Generate high contrast scannable QR matching category tone
    generateQrDataUrl(verificationUrl, theme.qrDarkColor).then((url) => setQrDataUrl(url));
  }, [verificationUrl, theme.qrDarkColor]);

  const handlePrint = () => {
    window.print();
  };

  const handleCopyLink = () => {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(verificationUrl);
      setCopied(true);
      toast.success("Mobile Pass link copied to clipboard!");
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const formattedPassDate = formatPassDate(slot?.slot_start);
  const reportingTimeStr = formatReportingTime(slot?.slot_start);
  const admitCount = item?.quantity || 1;
  const amountPaid = order.total_amount_inr || 2400;

  const getDefaultVenueForPillar = (pillar?: string) => {
    switch (pillar) {
      case "food":
        return "Versova Gaothan Dining Courtyard, Andheri West, Mumbai - 400061";
      case "workshops":
        return "Mahim Bay Net-Weaving Guild, Mahim West, Mumbai - 400016";
      case "walks":
      default:
        return "Historic Sassoon Docks Clock Tower Arch, Colaba, Mumbai - 400005";
    }
  };

  const meetingAddress =
    listing?.secret_meeting_point ||
    listing?.location_name ||
    getDefaultVenueForPillar(listing?.pillar);

  const mapsUrl =
    listing?.meeting_point_maps_url ||
    (listing?.latitude && listing?.longitude
      ? buildGoogleMapsUrl(listing.latitude, listing.longitude)
      : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(meetingAddress)}`);

  const displayHostPhone = listing?.host_phone || "+91 99204 77158";
  const cleanPhone = displayHostPhone.replace(/[^0-9]/g, "");

  const handleShareWhatsApp = () => {
    const guestPhone = order.customer_phone?.replace(/[^0-9]/g, "") || "";
    const text = encodeURIComponent(
      `🎟️ *MatsyaMart Official Mobile Pass*\n\n` +
        `*Experience:* ${listing?.title || "Coastal Feast Experience"}\n` +
        `*Pass Ref:* ${order.order_ref}\n` +
        `*Date:* ${formattedPassDate}\n` +
        `*Reporting Time:* ${reportingTimeStr}\n` +
        `*Venue:* ${meetingAddress}\n` +
        (mapsUrl ? `*Google Maps Directions:* ${mapsUrl}\n` : "") +
        `*Admit:* ${admitCount} Person(s)\n\n` +
        `👉 *Open Your Verified Mobile Pass:* ${verificationUrl}`,
    );

    const waUrl = guestPhone
      ? `https://wa.me/${guestPhone}?text=${text}`
      : `https://api.whatsapp.com/send?text=${text}`;
    window.open(waUrl, "_blank");
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/90 backdrop-blur-md overflow-y-auto">
      {/* Print isolation for 9:16 mobile pass */}
      <style>{`
        @media print {
          body * {
            visibility: hidden !important;
          }
          #printable-mobile-ticket, #printable-mobile-ticket * {
            visibility: visible !important;
          }
          #printable-mobile-ticket {
            position: fixed !important;
            left: 50% !important;
            top: 50% !important;
            transform: translate(-50%, -50%) !important;
            width: 380px !important;
            box-shadow: none !important;
            border-radius: 32px !important;
            z-index: 999999 !important;
            page-break-inside: avoid !important;
          }
        }
      `}</style>

      <div className="relative w-full max-w-md my-auto flex flex-col items-center space-y-4">
        {/* Top Control Strip */}
        <div className="w-full flex items-center justify-between px-2 text-[#f5edeb] print:hidden">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-1 rounded-full bg-[#e3a157]/20 border border-[#e3a157]/40 text-[#e3a157] text-xs font-bold flex items-center gap-1.5 shadow-xs">
              <Sparkles className="w-3.5 h-3.5 text-[#e3a157]" />
              <span>Official Guest Pass Preview</span>
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopyLink}
              className="p-2 hover:bg-white/10 text-[#dab38c] hover:text-white rounded-xl transition-colors cursor-pointer"
              title="Copy Pass URL"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
            </button>
            <button
              onClick={handleShareWhatsApp}
              className="px-3 py-1.5 bg-[#25D366] hover:bg-[#20ba59] text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center gap-1.5 cursor-pointer"
              title="Send to Guest on WhatsApp"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>WhatsApp</span>
            </button>
            <button
              onClick={handlePrint}
              className="px-3 py-1.5 bg-white/15 hover:bg-white/25 text-white font-bold text-xs rounded-xl border border-white/20 transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Print</span>
            </button>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/10 text-white/70 hover:text-white rounded-full transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* 9:16 VERTICAL OFFICIAL PASS CARD (Exact Category Design) */}
        <div
          id="printable-mobile-ticket"
          className={`w-full max-w-[380px] rounded-[32px] overflow-hidden ${theme.bgClass} border ${theme.borderClass} shadow-[0_25px_70px_rgba(0,0,0,0.85)] select-none text-[#ffffff] transition-all`}
        >
          {/* 1. TOP AERIAL COASTAL BANNER WITH MATSYAMART LOGO & CATEGORY PILL */}
          <div className="relative w-full aspect-[576/275] bg-[#1a0805] overflow-hidden border-b border-white/10">
            <img
              src={theme.headerImage}
              alt={`MatsyaMart ${theme.categoryLabel} Coastal Pass`}
              className="w-full h-full object-cover object-center"
              loading="eager"
              width={576}
              height={275}
            />
          </div>

          {/* 2. PASS MAIN BODY */}
          <div className="p-6 sm:p-7 space-y-5 text-center">
            {/* Headline */}
            <h2 className="font-display font-bold text-2xl sm:text-[27px] text-[#ffffff] tracking-tight leading-tight">
              We are happy to host you! Yay!
            </h2>

            {/* Experience Title */}
            <div
              className={`font-bold text-base sm:text-lg ${theme.titleColor} max-w-[280px] mx-auto leading-snug`}
            >
              {listing?.title || "Sassoon Docks Dawn Heritage Walk & Coastal Seafood Feast"}
            </div>

            {/* Centered QR Code */}
            <div className="flex justify-center pt-1 pb-1">
              <div className="bg-white p-3.5 sm:p-4 rounded-2xl shadow-xl flex items-center justify-center">
                {qrDataUrl ? (
                  <img
                    src={qrDataUrl}
                    alt="Ticket QR Code"
                    className="w-40 h-40 sm:w-44 sm:h-44 object-contain"
                    width={176}
                    height={176}
                  />
                ) : (
                  <div className="w-40 h-40 sm:w-44 sm:h-44 flex items-center justify-center text-xs text-stone-500 font-mono">
                    Generating QR...
                  </div>
                )}
              </div>
            </div>

            {/* Details Summary */}
            <div className="space-y-1.5 text-xs sm:text-sm text-[#ffffff] font-medium tracking-wide">
              <div>Date - {formattedPassDate}</div>
              <div>Admit - {admitCount} Person{admitCount > 1 ? "s" : ""}</div>
              <div>Amount Paid - INR {amountPaid}</div>
            </div>

            {/* Location & Directions Row */}
            <div
              className={`grid grid-cols-12 gap-3 items-center pt-4 border-t ${theme.dividerColor} text-left`}
            >
              {/* Left Column: Reporting Time & Address */}
              <div className="col-span-8 space-y-1 pr-1">
                <div className="text-xs sm:text-sm font-semibold text-[#ffffff]">
                  Reporting Time - {reportingTimeStr}
                </div>
                <div
                  className={`text-[11px] sm:text-xs ${theme.subtextColor} leading-relaxed`}
                >
                  at {meetingAddress}
                </div>
              </div>

              {/* Right Column: 3D Map Pin & Click for Directions */}
              <div className="col-span-4 flex flex-col items-center justify-center text-center">
                <a
                  href={mapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex flex-col items-center gap-1 cursor-pointer transition-transform hover:scale-105 active:scale-95"
                  title="Open location in Google Maps"
                >
                  <img
                    src="/directions-map-pin.png"
                    alt="Directions Map Pin"
                    className="w-14 h-11 object-contain drop-shadow-md group-hover:brightness-110 transition-all"
                    width={56}
                    height={44}
                  />
                  <span
                    className={`text-[11px] font-bold underline underline-offset-2 transition-colors ${theme.directionsLinkColor}`}
                  >
                    Click for Directions
                  </span>
                </a>
              </div>
            </div>

            {/* Host Support WhatsApp Footer */}
            <div className="pt-2">
              <a
                href={`https://wa.me/${cleanPhone}?text=${encodeURIComponent(
                  `Hi, I have a question regarding pass ${order.order_ref}.`,
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className={`inline-block text-xs sm:text-sm font-bold transition-colors ${theme.hostPhoneColor}`}
              >
                Host Support WhatsApp: {displayHostPhone}
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export const BookMyShowPass = MobilePass;
export type BookMyShowPassProps = MobilePassProps;
