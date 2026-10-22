import React, { useState, useEffect } from "react";
import { Order, OrderItem, Listing, ExperienceSlot } from "../../types";
import { formatINR, formatDate, formatTime } from "../../lib/utils";
import { generateQrDataUrl } from "../../lib/qr";
import {
  Ticket,
  Calendar,
  Clock,
  MapPin,
  ExternalLink,
  Printer,
  X,
  Share2,
  CheckCircle2,
  User,
  Utensils,
  AlertTriangle,
  Sparkles,
  Copy,
  Check,
  ShieldCheck,
} from "lucide-react";
import { toast } from "sonner";

export interface MobilePassProps {
  order: Order;
  item?: OrderItem;
  onClose: () => void;
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

  const [qrDataUrl, setQrDataUrl] = useState<string>("");
  const [copied, setCopied] = useState(false);

  const isConfirmed = order.status === "confirmed";
  const ticketRef = `MM-PASS-${order.order_ref.replace(/[^A-Za-z0-9]/g, "").slice(-6).toUpperCase()}`;
  const verificationUrl = `${typeof window !== "undefined" ? window.location.origin : ""}/order/confirmation/${order.order_ref}`;

  useEffect(() => {
    // Generate high contrast scannable QR
    generateQrDataUrl(verificationUrl).then((url) => setQrDataUrl(url));
  }, [verificationUrl]);

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

  const handleShareWhatsApp = () => {
    const guestPhone = order.customer_phone?.replace(/[^0-9]/g, "") || "";
    const text = encodeURIComponent(
      `🎟️ *MatsyaMart Official 9:16 Mobile Pass*\n\n` +
        `*Experience:* ${listing?.title || "Coastal Feast Experience"}\n` +
        `*Pass Ref:* ${ticketRef}\n` +
        `*Date:* ${slot ? formatDate(slot.slot_start) : "Confirmed Schedule"}\n` +
        `*Time:* ${slot ? `${formatTime(slot.slot_start)} – ${formatTime(slot.slot_end)}` : "As scheduled"}\n` +
        `*Venue:* ${listing?.location_name || "Mumbai Coast"}\n` +
        (listing?.secret_meeting_point ? `*Secret Arrival Note:* ${listing.secret_meeting_point}\n` : "") +
        (listing?.meeting_point_maps_url ? `*Google Maps GPS:* ${listing.meeting_point_maps_url}\n` : "") +
        `*Status:* ${isConfirmed ? "✅ Confirmed & Paid" : "⏳ Payment Pending"}\n\n` +
        `👉 *Open Your Verified Mobile Pass:* ${verificationUrl}`,
    );

    const waUrl = guestPhone
      ? `https://wa.me/${guestPhone}?text=${text}`
      : `https://api.whatsapp.com/send?text=${text}`;
    window.open(waUrl, "_blank");
  };

  const formattedDate = slot ? formatDate(slot.slot_start) : "Nov 4, 2026";
  const formattedTimeStr = slot ? formatTime(slot.slot_start) : "10:00 AM";

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
            height: 675px !important;
            box-shadow: none !important;
            border-radius: 24px !important;
            z-index: 999999 !important;
            page-break-inside: avoid !important;
          }
        }
      `}</style>

      <div className="relative w-full max-w-md my-auto flex flex-col items-center space-y-4">
        {/* Top Control Strip */}
        <div className="w-full flex items-center justify-between px-2 text-[#f5edeb] print:hidden">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-1 rounded-full bg-[#00759B]/40 border border-[#4dc6f4]/40 text-[#cfeffc] text-xs font-bold flex items-center gap-1.5 shadow-sm">
              <Sparkles className="w-3.5 h-3.5 text-[#ffde59]" />
              <span>9:16 Mobile Pass</span>
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopyLink}
              className="p-2 hover:bg-white/10 text-[#cfeffc] hover:text-white rounded-xl transition-colors cursor-pointer"
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

        {/* 9:16 MOBILE PASS BODY (Matching Luma photo ratio & vibrant oceanic palette) */}
        <div
          id="printable-mobile-ticket"
          className="relative w-full max-w-[360px] sm:max-w-[380px] aspect-[9/16] rounded-[36px] overflow-hidden shadow-[0_25px_70px_rgba(0,117,155,0.45)] border-2 border-[#4dc6f4]/40 flex flex-col justify-between p-6 sm:p-7 select-none text-white"
          style={{
            background:
              "linear-gradient(180deg, #0968A6 0%, #00759B 40%, #005674 75%, #00364A 100%)",
          }}
        >
          {/* Subtle Coastal Radial Glow Overlay */}
          <div
            className="absolute inset-0 pointer-events-none opacity-45 mix-blend-screen"
            style={{
              background:
                "radial-gradient(400px 300px at 80% 15%, rgba(148,220,248,0.4), transparent 60%)",
            }}
          />

          {/* 1. TOP HEADER STRIP: Logo on Left, Time & Date on Right */}
          <div className="relative z-10 flex items-start justify-between">
            {/* Brand Logo */}
            <div className="flex items-center gap-1.5">
              <span className="font-display font-extrabold text-2xl sm:text-[26px] tracking-tight text-white flex items-center">
                matsyamart
                <span className="text-[#ffde59] text-xl ml-0.5 animate-pulse">✦</span>
              </span>
            </div>

            {/* Time & Date */}
            <div className="text-right">
              <div className="text-xs sm:text-[13px] font-semibold text-[#cfeffc] tracking-tight">
                {formattedTimeStr}
              </div>
              <div className="font-display font-bold text-base sm:text-lg text-white leading-tight mt-0.5">
                {formattedDate}
              </div>
            </div>
          </div>

          {/* 2. EVENT TITLE & THUMBNAIL POSTER SECTION */}
          <div className="relative z-10 grid grid-cols-12 gap-3 items-start my-auto pt-2">
            <div className="col-span-8 pr-1 space-y-1">
              <span className="inline-flex items-center gap-1 text-[10px] uppercase font-bold tracking-widest text-[#cfeffc] bg-white/10 px-2 py-0.5 rounded-full border border-white/15">
                {listing?.pillar === "food"
                  ? "Seafood Feast"
                  : listing?.pillar === "walks"
                    ? "Heritage Walk"
                    : listing?.pillar === "workshops"
                      ? "Masterclass"
                      : "Coastal Experience"}
              </span>
              <h2 className="font-display font-bold text-lg sm:text-[21px] leading-[1.2] text-white text-balance drop-shadow-sm">
                {listing?.title || "Sassoon Docks Dawn Heritage Walk & Seafood Feast"}
              </h2>
            </div>

            <div className="col-span-4 flex justify-end">
              <div className="relative w-16 h-20 sm:w-18 sm:h-22 rounded-2xl overflow-hidden border-2 border-white/30 shadow-lg bg-[#004A63]">
                {listing?.images?.[0] ? (
                  <img
                    src={listing.images[0]}
                    alt={listing.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-xs font-bold font-display text-[#cfeffc]">
                    MM
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
              </div>
            </div>
          </div>

          {/* 3. DETAILS METADATA (LOCATION, GUEST, HOST) */}
          <div className="relative z-10 space-y-4 pt-1">
            {/* Location */}
            <div>
              <div className="text-[10px] font-bold uppercase tracking-[0.16em] text-[#94dcf8]">
                LOCATION
              </div>
              <div className="font-display font-bold text-base sm:text-[17px] text-white leading-tight mt-0.5 flex items-center gap-1.5">
                <span>{listing?.location_name || "Versova Koliwada, Mumbai"}</span>
                {listing?.meeting_point_maps_url && (
                  <a
                    href={listing.meeting_point_maps_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[#ffde59] hover:underline inline-flex items-center"
                    title="Open in Google Maps"
                  >
                    <MapPin className="w-3.5 h-3.5" />
                  </a>
                )}
              </div>
              {listing?.secret_meeting_point && (
                <div className="text-[11px] text-[#cfeffc]/80 line-clamp-1 mt-0.5">
                  {listing.secret_meeting_point}
                </div>
              )}
            </div>

            {/* Guest & Host Two-Column */}
            <div className="grid grid-cols-2 gap-3 pt-1 border-t border-white/15">
              <div>
                <div className="text-[10px] font-bold uppercase tracking-[0.16em] text-[#94dcf8]">
                  GUEST
                </div>
                <div className="font-bold text-sm sm:text-[15px] text-white truncate mt-0.5">
                  {order.customer_name || "Verified Attendee"}
                </div>
                <div className="text-[10px] font-mono text-[#cfeffc] mt-0.5">
                  {item?.quantity || 1} Seat{(item?.quantity || 1) > 1 ? "s" : ""} Booked
                </div>
              </div>

              <div>
                <div className="text-[10px] font-bold uppercase tracking-[0.16em] text-[#94dcf8]">
                  HOST
                </div>
                <div className="font-bold text-sm sm:text-[15px] text-white truncate mt-0.5">
                  {listing?.host_name || "MatsyaMart Custodians"}
                </div>
                <div className="text-[10px] font-mono text-[#cfeffc] mt-0.5">
                  {listing?.host_phone || "+91 76665 11511"}
                </div>
              </div>
            </div>
          </div>

          {/* 4. HERO QR CODE & ENTRY VALIDATION (Centered on clean white card) */}
          <div className="relative z-10 pt-3">
            <div className="bg-white rounded-[28px] p-4 sm:p-4.5 shadow-2xl flex flex-col items-center justify-center text-center">
              {/* QR Code Container */}
              <div className="relative">
                {qrDataUrl ? (
                  <img
                    src={qrDataUrl}
                    alt="Entry Pass QR"
                    className="w-40 h-40 sm:w-44 sm:h-44 object-contain mx-auto"
                  />
                ) : (
                  <div className="w-40 h-40 flex items-center justify-center bg-neutral-100 text-neutral-400 font-mono text-xs rounded-xl">
                    Generating QR...
                  </div>
                )}
              </div>

              {/* Pass Ref & Security Status */}
              <div className="w-full pt-2.5 border-t border-neutral-100 mt-2 flex items-center justify-between text-neutral-800">
                <span className="font-mono text-xs sm:text-[13px] font-black tracking-wider text-[#004A63]">
                  {ticketRef}
                </span>

                <span
                  className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                    isConfirmed
                      ? "bg-emerald-50 text-emerald-700 border border-emerald-300"
                      : "bg-amber-50 text-amber-800 border border-amber-300"
                  }`}
                >
                  <ShieldCheck className="w-3 h-3" />
                  <span>{isConfirmed ? "PAID PASS" : "PENDING"}</span>
                </span>
              </div>
            </div>

            {/* Bottom Security / Organizer Tag */}
            <div className="text-center mt-2.5 text-[10px] text-[#cfeffc]/75 font-medium tracking-wide">
              Verified by Bhoomiputra Foundation &amp; MatsyaMart
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Backwards-compatible export
export const BookMyShowPass = MobilePass;
export type BookMyShowPassProps = MobilePassProps;
