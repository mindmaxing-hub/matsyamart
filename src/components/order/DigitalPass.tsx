import React, { useState, useEffect } from "react";
import confetti from "canvas-confetti";
import {
  Share2,
  Printer,
  CheckCircle,
  Copy,
  Check,
} from "lucide-react";
import { Order } from "../../types";
import { openWhatsApp, buildPassMessage } from "../../lib/whatsapp";
import { generateQrDataUrl } from "../../lib/qr";
import { buildGoogleMapsUrl } from "../../lib/services/places";
import { encodePassPayload } from "../../lib/passPayload";
import { resolvePassCategory, PASS_THEMES } from "../../lib/passThemes";

interface DigitalPassProps {
  order: Order;
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

export const DigitalPass: React.FC<DigitalPassProps> = ({ order }) => {
  const [qrDataUrl, setQrDataUrl] = useState<string>("");
  const [copied, setCopied] = useState<boolean>(false);

  const experienceItem =
    order.items.find((i) => i.listing?.type === "experience") || order.items[0];
  const listing = experienceItem?.listing;
  const slot = experienceItem?.slot;

  const themeCategory = resolvePassCategory(listing);
  const theme = PASS_THEMES[themeCategory];

  useEffect(() => {
    // Launch celebratory confetti on pass load
    try {
      confetti({
        particleCount: 60,
        spread: 70,
        origin: { y: 0.6 },
        colors: ["#29100B", "#E3A157", "#10B981"],
      });
    } catch {
      // Ignore if canvas-confetti fails
    }

    // Generate QR verification pass URL for host scanner (with compressed payload for cross-device support)
    const origin = typeof window !== "undefined" ? window.location.origin : "";
    const payload = encodePassPayload(order);
    const verificationUrl = payload
      ? `${origin}/order/confirmation/${order.order_ref}?p=${payload}`
      : `${origin}/order/confirmation/${order.order_ref}`;
    generateQrDataUrl(verificationUrl, theme.qrDarkColor).then((url) => setQrDataUrl(url));
  }, [order, theme.qrDarkColor]);

  const handlePrint = () => {
    window.print();
  };

  const handleShareWhatsApp = () => {
    const origin = typeof window !== "undefined" ? window.location.origin : "";
    const payload = encodePassPayload(order);
    const passUrl = payload
      ? `${origin}/order/confirmation/${order.order_ref}?p=${payload}`
      : `${origin}/order/confirmation/${order.order_ref}`;

    const text = buildPassMessage({
      guestName: order.customer_name,
      experienceTitle: listing?.title || "Coastal Experience",
      ticketRef: order.order_ref,
      dateStr: slot ? formatPassDate(slot.slot_start) : "Confirmed Schedule",
      timeStr: slot ? formatReportingTime(slot.slot_start) : "As scheduled",
      venue: listing?.location_name || "Mumbai Coast",
      secretPin: listing?.secret_meeting_point,
      mapsUrl: listing?.meeting_point_maps_url,
      passUrl,
      seatsCount: experienceItem?.quantity || 1,
    });

    openWhatsApp(order.customer_phone, text);
  };

  const handleCopyLink = () => {
    const origin = typeof window !== "undefined" ? window.location.origin : "";
    const payload = encodePassPayload(order);
    const passUrl = payload
      ? `${origin}/order/confirmation/${order.order_ref}?p=${payload}`
      : `${origin}/order/confirmation/${order.order_ref}`;
    navigator.clipboard.writeText(passUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const formattedPassDate = formatPassDate(slot?.slot_start);
  const reportingTimeStr = formatReportingTime(slot?.slot_start);
  const admitCount = experienceItem?.quantity || 1;
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
  const hostWaUrl = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(
    `Hi, I hold verified pass ${order.order_ref} for ${listing?.title || "Coastal Experience"}.`,
  )}`;

  return (
    <div className="max-w-md mx-auto space-y-6">
      {/* Print isolation style */}
      <style>{`
        @media print {
          body * {
            visibility: hidden !important;
          }
          #matsyamart-digital-pass, #matsyamart-digital-pass * {
            visibility: visible !important;
          }
          #matsyamart-digital-pass {
            position: fixed !important;
            left: 50% !important;
            top: 50% !important;
            transform: translate(-50%, -50%) !important;
            width: 380px !important;
            box-shadow: none !important;
            z-index: 999999 !important;
            page-break-inside: avoid !important;
          }
        }
      `}</style>

      {/* Confirmation Pill */}
      <div className="text-center print:hidden">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-950/70 text-emerald-300 text-xs font-semibold border border-emerald-500/30">
          <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
          <span>Booking &amp; Payment Confirmed</span>
        </div>
      </div>

      {/* 9:16 VERTICAL OFFICIAL PASS CARD (Exact Category Design) */}
      <div
        id="matsyamart-digital-pass"
        className={`w-full max-w-[390px] mx-auto rounded-[32px] overflow-hidden ${theme.bgClass} border ${theme.borderClass} shadow-[0_20px_60px_rgba(0,0,0,0.65)] select-none text-[#ffffff] transition-all`}
      >
        {/* 1. TOP AERIAL COASTAL BANNER WITH MATSYAMART LOGO & CATEGORY PILL */}
        <div className="relative w-full aspect-[576/275] bg-[#1a0805] overflow-hidden border-b border-white/10">
          <img
            src={theme.headerImage}
            alt={`MatsyaMart ${theme.categoryLabel} Coastal Pass`}
            className="w-full h-full object-cover object-center"
            loading="eager"
            fetchPriority="high"
            decoding="async"
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
              href={hostWaUrl}
              target="_blank"
              rel="noopener noreferrer"
              className={`inline-block text-xs sm:text-sm font-bold transition-colors ${theme.hostPhoneColor}`}
            >
              Host Support WhatsApp: {displayHostPhone}
            </a>
          </div>
        </div>
      </div>

      {/* Action Buttons (External to the pass card) */}
      <div className="flex flex-wrap items-center justify-center gap-2.5 pt-2 print:hidden">
        <button
          onClick={handlePrint}
          className="px-4 py-2 rounded-xl border border-[#dab38c]/30 bg-[#35160e]/80 hover:bg-[#481f14] text-[#f5edeb] text-xs font-semibold flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
        >
          <Printer className="w-3.5 h-3.5 text-[#dab38c]" />
          <span>Print / Save PDF</span>
        </button>

        <button
          onClick={handleShareWhatsApp}
          className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold flex items-center gap-1.5 shadow-md transition-colors cursor-pointer"
        >
          <Share2 className="w-3.5 h-3.5" />
          <span>Share to WhatsApp</span>
        </button>

        <button
          onClick={handleCopyLink}
          className="px-4 py-2 rounded-xl border border-[#dab38c]/30 bg-[#35160e]/80 hover:bg-[#481f14] text-[#f5edeb] text-xs font-semibold flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
        >
          {copied ? (
            <>
              <Check className="w-3.5 h-3.5 text-emerald-400" />
              <span>Link Copied!</span>
            </>
          ) : (
            <>
              <Copy className="w-3.5 h-3.5 text-[#dab38c]" />
              <span>Copy Pass Link</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};
