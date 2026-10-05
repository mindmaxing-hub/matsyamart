import React, { useState, useEffect } from "react";
import confetti from "canvas-confetti";
import {
  ShieldCheck,
  MapPin,
  Calendar,
  Clock,
  Phone,
  Share2,
  Printer,
  Anchor,
  CheckCircle,
  ExternalLink,
} from "lucide-react";
import { Order } from "../../types";
import { formatINR, formatDate, formatTime } from "../../lib/utils";
import { generateQrDataUrl } from "../../lib/qr";
import { BrandLogo } from "../site/BrandLogo";

interface DigitalPassProps {
  order: Order;
}

export const DigitalPass: React.FC<DigitalPassProps> = ({ order }) => {
  const [qrDataUrl, setQrDataUrl] = useState<string>("");
  const [copied, setCopied] = useState<boolean>(false);

  useEffect(() => {
    // Launch celebratory confetti on pass load
    try {
      confetti({
        particleCount: 60,
        spread: 70,
        origin: { y: 0.6 },
        colors: ["#0F172A", "#E3A157", "#10B981"],
      });
    } catch {
      // Ignore if canvas-confetti is not loaded
    }

    // Generate QR verification pass
    const verificationUrl = `${window.location.origin}/order/confirmation/${order.order_ref}`;
    generateQrDataUrl(verificationUrl).then((url) => setQrDataUrl(url));
  }, [order.order_ref]);

  const handlePrint = () => {
    window.print();
  };

  const handleShareWhatsApp = () => {
    const text = encodeURIComponent(
      `⚓ My MatsyaMart Coastal Pass for ${order.items[0]?.listing?.title || "Community Tour"} is confirmed! Ticket Code: ${order.order_ref}. View pass: ${window.location.href}`,
    );
    window.open(`https://api.whatsapp.com/send?text=${text}`, "_blank");
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const primaryItem = order.items[0];
  const listing = primaryItem?.listing;
  const slot = primaryItem?.slot;
  const isExperience = listing?.type === "experience";

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Confirmation Banner */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-950/70 text-emerald-300 text-xs font-semibold border border-emerald-500/30">
          <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
          <span>Booking & Payment Confirmed</span>
        </div>
        <h1 className="font-display font-bold text-2xl sm:text-3xl text-[#f5edeb]">
          Your Verified Coastal Digital Pass
        </h1>
        <p className="text-xs text-[#dab38c] max-w-md mx-auto">
          Please present this pass on your phone or provide ticket code{" "}
          <span className="font-mono font-bold text-[#e3a157] bg-[#1f0b07] px-2 py-0.5 rounded border border-[#dab38c]/25">
            {order.order_ref}
          </span>{" "}
          upon arrival.
        </p>
      </div>

      {/* Maritime Permit Card */}
      <div className="bg-[#29100b] rounded-3xl border border-[#dab38c]/30 shadow-2xl overflow-hidden relative text-[#f5edeb]">
        {/* Pass Header Band */}
        <div className="bg-[#1f0b07] text-[#f5edeb] p-6 flex items-start justify-between relative overflow-hidden border-b border-[#dab38c]/20">
          <div className="relative z-10 space-y-1">
            <div className="flex items-center gap-2">
              <BrandLogo className="h-7 w-auto max-w-[150px]" />
              <span className="text-[10px] uppercase font-bold tracking-wider bg-[#35160e] text-[#dab38c] px-2 py-0.5 rounded border border-[#dab38c]/20">
                Official Boarding Permit
              </span>
            </div>
            <h2 className="font-display font-bold text-xl text-[#f5edeb] pt-1">
              {listing?.title || "Community Experience"}
            </h2>
            <div className="text-xs text-[#dab38c] flex items-center gap-1.5 pt-0.5">
              <Anchor className="w-3.5 h-3.5 text-[#e3a157]" />
              <span>Host: {listing?.host_name || "Indigenous Collective"}</span>
            </div>
          </div>

          <div className="relative z-10 text-right shrink-0">
            <span className="text-[10px] uppercase tracking-wider text-[#dab38c]/70 block">
              Ticket Ref
            </span>
            <span className="font-mono font-bold text-sm text-[#e3a157] bg-[#29100b] px-2.5 py-1 rounded-lg border border-[#dab38c]/30 block mt-0.5">
              {order.order_ref}
            </span>
          </div>
        </div>

        {/* Pass Core Body */}
        <div className="p-6 sm:p-8 space-y-6">
          {/* Schedule & Timing Grid */}
          {slot && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-2xl bg-[#35160e]/80 border border-[#dab38c]/20">
              <div className="space-y-1">
                <span className="text-[11px] font-bold text-[#dab38c] uppercase tracking-wider flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-[#e3a157]" /> Date of
                  Experience
                </span>
                <span className="font-display font-bold text-base text-[#f5edeb] block">
                  {formatDate(slot.slot_start)}
                </span>
              </div>

              <div className="space-y-1">
                <span className="text-[11px] font-bold text-[#dab38c] uppercase tracking-wider flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-[#e3a157]" /> Reporting
                  Time
                </span>
                <span className="font-display font-bold text-base text-[#f5edeb] block">
                  {formatTime(slot.slot_start)} sharp
                </span>
              </div>
            </div>
          )}

          {/* Secret Meeting Point Unlocked */}
          {isExperience && listing?.secret_meeting_point && (
            <div className="p-5 rounded-2xl bg-[#35160e]/90 border border-[#e3a157]/40 space-y-2">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#e3a157] animate-ping" />
                <span className="text-xs font-bold uppercase tracking-wider text-[#e3a157] flex items-center gap-1">
                  <MapPin className="w-4 h-4 text-[#e3a157]" />
                  Secret Meeting Point & Coordinates (Unlocked)
                </span>
              </div>

              <p className="text-xs sm:text-sm text-[#f5edeb] font-medium leading-relaxed">
                {listing.secret_meeting_point}
              </p>

              <div className="pt-2">
                <a
                  href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                    listing.secret_meeting_point,
                  )}`}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#e3a157] hover:bg-[#dab38c] text-[#29100b] text-xs font-bold transition-colors shadow-xs"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>Open Coordinates in Google Maps</span>
                </a>
              </div>
            </div>
          )}

          {/* Guest Breakdown & QR Code Row */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-6 pt-4 border-t border-dashed border-[#dab38c]/25">
            <div className="space-y-3 w-full sm:w-auto">
              <div>
                <span className="text-[10px] uppercase font-bold text-[#dab38c]/70">
                  Lead Attendee
                </span>
                <div className="font-display font-bold text-base text-[#f5edeb]">
                  {order.customer_name}
                </div>
                <div className="text-xs text-[#dab38c]">
                  {order.customer_phone}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 text-xs">
                <div>
                  <span className="text-[10px] uppercase font-bold text-[#dab38c]/70">
                    Guests
                  </span>
                  <div className="font-semibold text-[#f5edeb]">
                    {primaryItem?.quantity || 1} Person(s)
                  </div>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-[#dab38c]/70">
                    Amount Paid
                  </span>
                  <div className="font-semibold text-[#e3a157] font-display">
                    {formatINR(order.total_amount_inr)}
                  </div>
                </div>
              </div>

              {listing?.host_phone && (
                <div className="pt-2 text-xs flex items-center gap-2 text-[#dab38c]">
                  <Phone className="w-3.5 h-3.5 text-[#e3a157]" />
                  <span>
                    Host Support WhatsApp:{" "}
                    <strong className="text-[#f5edeb]">
                      {listing.host_phone}
                    </strong>
                  </span>
                </div>
              )}
            </div>

            {/* QR Code */}
            <div className="shrink-0 flex flex-col items-center">
              {qrDataUrl ? (
                <img
                  src={qrDataUrl}
                  alt="Boarding Pass QR"
                  className="w-32 h-32 rounded-xl border border-[#dab38c]/30 p-1 shadow-xs bg-white"
                />
              ) : (
                <div className="w-32 h-32 rounded-xl bg-[#1f0b07] border border-[#dab38c]/20 flex items-center justify-center text-xs text-[#dab38c]">
                  Generating QR...
                </div>
              )}
              <span className="text-[10px] text-[#dab38c]/70 font-mono mt-1">
                Scan for Gate Entry
              </span>
            </div>
          </div>
        </div>

        {/* Card Tear-off Footer */}
        <div className="bg-[#1f0b07] border-t border-[#dab38c]/20 px-6 py-4 flex flex-wrap items-center justify-between text-xs text-[#dab38c] gap-2">
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>
              Community-Verified Booking • Weather monitored by harbour port
            </span>
          </div>
          <span className="font-mono text-[11px] text-[#dab38c]/70">
            {new Date(order.created_at).toLocaleDateString()}
          </span>
        </div>
      </div>

      {/* Action Buttons: Print, WhatsApp Share, Copy Link */}
      <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
        <button
          onClick={handlePrint}
          className="px-4 py-2.5 rounded-xl border border-[#dab38c]/30 bg-[#35160e]/80 hover:bg-[#481f14] text-[#f5edeb] text-xs font-semibold flex items-center gap-2 shadow-xs transition-colors cursor-pointer"
        >
          <Printer className="w-4 h-4 text-[#dab38c]" />
          <span>Print / Save PDF</span>
        </button>

        <button
          onClick={handleShareWhatsApp}
          className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold flex items-center gap-2 shadow-md transition-colors cursor-pointer"
        >
          <Share2 className="w-4 h-4" />
          <span>Share to WhatsApp</span>
        </button>

        <button
          onClick={handleCopyLink}
          className="px-4 py-2.5 rounded-xl border border-[#dab38c]/30 bg-[#35160e]/80 hover:bg-[#481f14] text-[#f5edeb] text-xs font-semibold flex items-center gap-2 shadow-xs transition-colors cursor-pointer"
        >
          <span>{copied ? "Link Copied! ✓" : "Copy Pass Link"}</span>
        </button>
      </div>
    </div>
  );
};
