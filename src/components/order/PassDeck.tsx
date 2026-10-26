import React, { useState, useEffect, useMemo } from "react";
import confetti from "canvas-confetti";
import {
  Share2,
  Printer,
  CheckCircle,
  Copy,
  Check,
  ChevronLeft,
  ChevronRight,
  Compass,
  Utensils,
  Hammer,
  Ticket,
  MapPin,
  ExternalLink,
} from "lucide-react";
import { Order, OrderItem, Listing, ExperienceSlot, AttendeeDetail } from "../../types";
import { openWhatsApp, buildPassMessage } from "../../lib/whatsapp";
import { buildMultiPassWhatsAppMessage } from "../../lib/fast2smsWhatsApp";
import { generateQrDataUrl } from "../../lib/qr";
import { buildGoogleMapsUrl } from "../../lib/services/places";
import { encodePassPayload } from "../../lib/passPayload";
import {
  resolvePassCategory,
  PASS_THEMES,
  PassThemeCategory,
  PassThemeConfig,
} from "../../lib/passThemes";

export interface IndividualPass {
  index: number;
  total: number;
  ticketRef: string;
  item: OrderItem;
  listing: Listing;
  slot?: ExperienceSlot | undefined;
  attendee: AttendeeDetail;
  category: PassThemeCategory;
  theme: PassThemeConfig;
  seatNumber: number;
}

interface PassDeckProps {
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

export const PassDeck: React.FC<PassDeckProps> = ({ order }) => {
  const [copied, setCopied] = useState<boolean>(false);
  const [activePassIndex, setActivePassIndex] = useState<number>(0);
  const [qrCodeUrls, setQrCodeUrls] = useState<Record<string, string>>({});

  // 1. Synthesize all discrete individual passes across all experience items
  const passes: IndividualPass[] = useMemo(() => {
    const result: IndividualPass[] = [];
    const experienceItems = order.items.filter(
      (i) => i.listing?.type === "experience" || !i.listing?.type,
    );

    // If pure goods order somehow gets rendered in PassDeck, provide fallback
    const itemsToProcess =
      experienceItems.length > 0
        ? experienceItems
        : order.items.slice(0, 1);

    let globalPassCounter = 1;

    itemsToProcess.forEach((item, itemIdx) => {
      const listing: Listing = item.listing || {
        id: `fallback-${itemIdx}`,
        title: "Coastal Experience",
        slug: "coastal-experience",
        type: "experience",
        pillar: "walks",
        price_inr: item.unit_price_inr,
        currency: "INR",
        host_name: "Community Guide",
        short_summary: "Coastal community offering",
        full_description: "",
        images: ["https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=600"],
        is_active: true,
        is_featured: false,
      };

      const category = resolvePassCategory(listing);
      const theme = PASS_THEMES[category];
      const qty = Math.max(1, item.quantity);

      for (let seatIdx = 0; seatIdx < qty; seatIdx++) {
        const attendee =
          item.attendee_details?.[seatIdx] || {
            fullName:
              seatIdx === 0
                ? order.customer_name
                : `Guest ${seatIdx + 1} (${order.customer_name})`,
            phone: order.customer_phone,
            email: order.customer_email,
          };

        result.push({
          index: globalPassCounter - 1,
          total: 0, // Assigned below
          ticketRef: `${order.order_ref}-T${globalPassCounter}`,
          item,
          listing,
          slot: item.slot,
          attendee,
          category,
          theme,
          seatNumber: seatIdx + 1,
        });

        globalPassCounter++;
      }
    });

    const totalCount = result.length;
    return result.map((p) => ({ ...p, total: totalCount }));
  }, [order]);

  const currentPass = passes[activePassIndex] || passes[0];

  // 2. Generate QR Codes for all passes
  useEffect(() => {
    try {
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.6 },
        colors: ["#29100B", "#E3A157", "#10B981"],
      });
    } catch {
      // Ignore if canvas-confetti fails
    }

    const origin = typeof window !== "undefined" ? window.location.origin : "";
    const payload = encodePassPayload(order);

    passes.forEach((pass) => {
      const verificationUrl = payload
        ? `${origin}/order/confirmation/${order.order_ref}?p=${payload}&ticket=${pass.ticketRef}`
        : `${origin}/order/confirmation/${order.order_ref}?ticket=${pass.ticketRef}`;

      generateQrDataUrl(verificationUrl, pass.theme.qrDarkColor).then((url) => {
        setQrCodeUrls((prev) => ({ ...prev, [pass.ticketRef]: url }));
      });
    });
  }, [order, passes]);

  // Keyboard navigation between passes
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") {
        setActivePassIndex((prev) => Math.max(0, prev - 1));
      } else if (e.key === "ArrowRight") {
        setActivePassIndex((prev) => Math.min(passes.length - 1, prev + 1));
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [passes.length]);

  if (!currentPass) return null;

  const handlePrint = () => {
    window.print();
  };

  const handleShareWhatsApp = (pass: IndividualPass) => {
    const origin = typeof window !== "undefined" ? window.location.origin : "";
    const payload = encodePassPayload(order);
    const passUrl = payload
      ? `${origin}/order/confirmation/${order.order_ref}?p=${payload}&ticket=${pass.ticketRef}`
      : `${origin}/order/confirmation/${order.order_ref}?ticket=${pass.ticketRef}`;

    const text = buildPassMessage({
      guestName: pass.attendee.fullName || order.customer_name,
      experienceTitle: pass.listing.title,
      ticketRef: pass.ticketRef,
      dateStr: pass.slot ? formatPassDate(pass.slot.slot_start) : "Confirmed Schedule",
      timeStr: pass.slot ? formatReportingTime(pass.slot.slot_start) : "As scheduled",
      venue: pass.listing.location_name || "Mumbai Coast",
      secretPin: pass.listing.secret_meeting_point,
      mapsUrl: pass.listing.meeting_point_maps_url,
      passUrl,
      seatsCount: 1,
    });

    const targetPhone = pass.attendee.phone || order.customer_phone;
    openWhatsApp(targetPhone, text);
  };

  const handleShareAllWhatsApp = () => {
    const origin = typeof window !== "undefined" ? window.location.origin : "";
    const payload = encodePassPayload(order);
    const passUrl = payload
      ? `${origin}/order/confirmation/${order.order_ref}?p=${payload}`
      : `${origin}/order/confirmation/${order.order_ref}`;

    const text = buildMultiPassWhatsAppMessage({
      guestName: order.customer_name || "Valued Patron",
      orderRef: order.order_ref,
      items: passes.map((p) => ({
        title: p.listing.title,
        pillar: (p.listing.pillar || "walks") as "walks" | "workshops" | "food" | "goods",
        dateStr: p.slot ? formatPassDate(p.slot.slot_start) : undefined,
        timeStr: p.slot ? formatReportingTime(p.slot.slot_start) : undefined,
        venue: p.listing.location_name || "Versova / Sassoon Coast",
        mapsUrl: p.listing.meeting_point_maps_url,
        passRef: p.ticketRef,
        attendeeName: p.attendee.fullName,
      })),
      totalPaidINR: order.total_amount_inr,
      digitalPassUrl: passUrl,
      emergencyPhone: order.emergency_contact,
    });

    const targetPhone = order.customer_phone;
    openWhatsApp(targetPhone, text);
  };

  const handleCopyLink = (pass: IndividualPass) => {
    const origin = typeof window !== "undefined" ? window.location.origin : "";
    const payload = encodePassPayload(order);
    const passUrl = payload
      ? `${origin}/order/confirmation/${order.order_ref}?p=${payload}&ticket=${pass.ticketRef}`
      : `${origin}/order/confirmation/${order.order_ref}?ticket=${pass.ticketRef}`;
    navigator.clipboard.writeText(passUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

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
    currentPass.listing.secret_meeting_point ||
    currentPass.listing.location_name ||
    getDefaultVenueForPillar(currentPass.listing.pillar);

  const mapsUrl =
    currentPass.listing.meeting_point_maps_url ||
    (currentPass.listing.latitude && currentPass.listing.longitude
      ? buildGoogleMapsUrl(currentPass.listing.latitude, currentPass.listing.longitude)
      : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(meetingAddress)}`);

  const displayHostPhone = currentPass.listing.host_phone || "+91 99204 77158";
  const cleanPhone = displayHostPhone.replace(/[^0-9]/g, "");
  const hostWaUrl = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(
    `Hi, I hold verified ticket ${currentPass.ticketRef} for ${currentPass.listing.title}.`,
  )}`;

  const getPillarIcon = (category: PassThemeCategory) => {
    switch (category) {
      case "walk":
        return <Compass className="w-3.5 h-3.5" />;
      case "food":
        return <Utensils className="w-3.5 h-3.5" />;
      case "workshop":
        return <Hammer className="w-3.5 h-3.5" />;
      default:
        return <Ticket className="w-3.5 h-3.5" />;
    }
  };

  return (
    <div className="max-w-xl mx-auto space-y-6">
      {/* Strict Print Stylesheet */}
      <style>{`
        @media print {
          body * {
            visibility: hidden !important;
          }
          #matsyamart-print-area, #matsyamart-print-area * {
            visibility: visible !important;
          }
          #matsyamart-print-area {
            position: absolute !important;
            left: 0 !important;
            top: 0 !important;
            width: 100% !important;
            box-shadow: none !important;
            z-index: 999999 !important;
          }
          .pass-print-card {
            page-break-after: always !important;
            break-after: page !important;
            margin: 0 auto 30px !important;
            max-width: 380px !important;
          }
          .no-print {
            display: none !important;
          }
        }
      `}</style>

      {/* Confirmation Pill */}
      <div className="text-center print:hidden">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-950/70 text-emerald-300 text-xs font-semibold border border-emerald-500/30">
          <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
          <span>
            {passes.length > 1
              ? `${passes.length} Official Admission Passes Confirmed`
              : "Official Boarding Pass Confirmed"}
          </span>
        </div>
      </div>

      {/* APPLE WALLET PASS DECK SWITCHER HEADER */}
      {passes.length > 1 && (
        <div className="p-3 sm:p-4 rounded-2xl bg-[#1c0b07] border border-[#dab38c]/25 print:hidden space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Ticket className="w-4 h-4 text-[#e3a157]" />
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-[#f5edeb]">
                Apple Wallet Pass Deck · Pass {activePassIndex + 1} of {passes.length}
              </span>
            </div>

            <div className="flex items-center gap-1.5">
              <button
                type="button"
                disabled={activePassIndex === 0}
                onClick={() => setActivePassIndex((prev) => Math.max(0, prev - 1))}
                className="p-1.5 rounded-lg bg-[#35160e] hover:bg-[#481f14] disabled:opacity-40 disabled:cursor-not-allowed text-[#dab38c] transition-all cursor-pointer"
                title="Previous Pass (Arrow Left)"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                type="button"
                disabled={activePassIndex === passes.length - 1}
                onClick={() => setActivePassIndex((prev) => Math.min(passes.length - 1, prev + 1))}
                className="p-1.5 rounded-lg bg-[#35160e] hover:bg-[#481f14] disabled:opacity-40 disabled:cursor-not-allowed text-[#dab38c] transition-all cursor-pointer"
                title="Next Pass (Arrow Right)"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Quick-Select Ticket Pills */}
          <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-thin">
            {passes.map((pass, idx) => {
              const isSelected = idx === activePassIndex;
              return (
                <button
                  key={pass.ticketRef}
                  type="button"
                  onClick={() => setActivePassIndex(idx)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-medium flex items-center gap-1.5 shrink-0 transition-all cursor-pointer border ${
                    isSelected
                      ? "bg-[#e3a157] text-[#1f0b07] font-bold border-[#e3a157] shadow"
                      : "bg-[#2b120c] text-[#dab38c]/70 hover:text-white border-[#dab38c]/20"
                  }`}
                >
                  {getPillarIcon(pass.category)}
                  <span className="truncate max-w-[140px]">
                    {idx + 1}. {pass.attendee.fullName || `Guest ${idx + 1}`}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* PRINT AREA: Single active pass in webview; all passes in print stylesheet */}
      <div id="matsyamart-print-area">
        {/* SINGLE ACTIVE PASS (Shown in browser) */}
        <div className="print:hidden">
          <div
            className={`w-full max-w-[390px] mx-auto rounded-[32px] overflow-hidden ${currentPass.theme.bgClass} border ${currentPass.theme.borderClass} shadow-[0_24px_70px_rgba(0,0,0,0.7)] select-none text-[#ffffff] transition-all`}
          >
            {/* 1. TOP AERIAL BANNER */}
            <div className="relative w-full aspect-[576/275] bg-[#1a0805] overflow-hidden border-b border-white/10">
              <img
                src={currentPass.theme.headerImage}
                alt={`MatsyaMart ${currentPass.theme.categoryLabel} Coastal Pass`}
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
              {/* Ticket Ref & Attendee Tag */}
              <div className="space-y-1">
                <div className="inline-block px-3 py-1 rounded-full text-[10px] font-mono font-bold tracking-wider uppercase bg-white/15 text-white border border-white/20">
                  Ticket #{currentPass.ticketRef}
                </div>
                <h2 className="font-display font-bold text-2xl sm:text-[26px] text-[#ffffff] tracking-tight leading-tight mt-1">
                  We are happy to host you!
                </h2>
                <div className="text-xs font-semibold text-emerald-300">
                  Admit 1 Guest: <strong>{currentPass.attendee.fullName}</strong>
                </div>
              </div>

              {/* Experience Title */}
              <div
                className={`font-bold text-base sm:text-lg ${currentPass.theme.titleColor} max-w-[280px] mx-auto leading-snug`}
              >
                {currentPass.listing.title}
              </div>

              {/* Centered QR Code */}
              <div className="flex justify-center pt-1 pb-1">
                <div className="bg-white p-3.5 sm:p-4 rounded-2xl shadow-xl flex items-center justify-center">
                  {qrCodeUrls[currentPass.ticketRef] ? (
                    <img
                      src={qrCodeUrls[currentPass.ticketRef]}
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
              <div className="space-y-1 text-xs sm:text-sm text-[#ffffff] font-medium tracking-wide">
                <div>Date - {formatPassDate(currentPass.slot?.slot_start)}</div>
                <div>Admit - 1 Person ({currentPass.attendee.fullName})</div>
                <div>Ticket Ref - {currentPass.ticketRef}</div>
              </div>

              {/* Location & Directions Row */}
              <div
                className={`grid grid-cols-12 gap-3 items-center pt-4 border-t ${currentPass.theme.dividerColor} text-left`}
              >
                {/* Left Column: Reporting Time & Address */}
                <div className="col-span-8 space-y-1 pr-1">
                  <div className="text-xs sm:text-sm font-semibold text-[#ffffff]">
                    Reporting Time - {formatReportingTime(currentPass.slot?.slot_start)}
                  </div>
                  <div
                    className={`text-[11px] sm:text-xs ${currentPass.theme.subtextColor} leading-relaxed`}
                  >
                    at {meetingAddress}
                  </div>
                </div>

                {/* Right Column: 3D Map Pin & Directions */}
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
                      className={`text-[11px] font-bold underline underline-offset-2 transition-colors ${currentPass.theme.directionsLinkColor}`}
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
                  className={`inline-block text-xs sm:text-sm font-bold transition-colors ${currentPass.theme.hostPhoneColor}`}
                >
                  Host Support WhatsApp: {displayHostPhone}
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* PRINT ALL PASSES (Rendered during window.print()) */}
        <div className="hidden print:block space-y-8">
          {passes.map((pass) => {
            const passMeeting =
              pass.listing.secret_meeting_point ||
              pass.listing.location_name ||
              getDefaultVenueForPillar(pass.listing.pillar);

            return (
              <div
                key={pass.ticketRef}
                className={`pass-print-card rounded-[28px] overflow-hidden ${pass.theme.bgClass} border ${pass.theme.borderClass} text-[#ffffff] p-6 text-center space-y-4`}
              >
                <div className="text-[10px] uppercase font-mono font-bold tracking-wider text-white/80">
                  MatsyaMart Official Admission Pass · {pass.ticketRef}
                </div>
                <h3 className="font-bold text-xl text-white">{pass.listing.title}</h3>
                <div className="text-sm font-bold text-emerald-300">
                  Admit 1 Guest: {pass.attendee.fullName}
                </div>

                <div className="flex justify-center py-2">
                  {qrCodeUrls[pass.ticketRef] && (
                    <img
                      src={qrCodeUrls[pass.ticketRef]}
                      alt="QR"
                      className="w-36 h-36 object-contain bg-white p-2 rounded-xl"
                    />
                  )}
                </div>

                <div className="text-xs space-y-1">
                  <div><b>Date:</b> {formatPassDate(pass.slot?.slot_start)}</div>
                  <div><b>Reporting Time:</b> {formatReportingTime(pass.slot?.slot_start)}</div>
                  <div><b>Venue:</b> {passMeeting}</div>
                  <div><b>Host Support:</b> {pass.listing.host_phone || "+91 99204 77158"}</div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Action Buttons (External to the pass card) */}
      <div className="flex flex-wrap items-center justify-center gap-2.5 pt-2 print:hidden">
        <button
          onClick={handlePrint}
          className="px-4 py-2 rounded-xl border border-[#dab38c]/30 bg-[#35160e]/80 hover:bg-[#481f14] text-[#f5edeb] text-xs font-semibold flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
        >
          <Printer className="w-3.5 h-3.5 text-[#dab38c]" />
          <span>
            {passes.length > 1
              ? `Print All ${passes.length} Passes`
              : "Print / Save PDF"}
          </span>
        </button>

        {passes.length > 1 ? (
          <>
            <button
              onClick={handleShareAllWhatsApp}
              className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold flex items-center gap-1.5 shadow-md transition-colors cursor-pointer"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>Send All {passes.length} Passes to WhatsApp</span>
            </button>
            <button
              onClick={() => handleShareWhatsApp(currentPass)}
              className="px-3.5 py-2 rounded-xl border border-emerald-500/40 bg-emerald-950/40 hover:bg-emerald-900/50 text-emerald-300 text-xs font-semibold flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
            >
              <span>Share Pass {activePassIndex + 1} Only</span>
            </button>
          </>
        ) : (
          <button
            onClick={() => handleShareWhatsApp(currentPass)}
            className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold flex items-center gap-1.5 shadow-md transition-colors cursor-pointer"
          >
            <Share2 className="w-3.5 h-3.5" />
            <span>Send Pass to WhatsApp</span>
          </button>
        )}

        <button
          onClick={() => handleCopyLink(currentPass)}
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
