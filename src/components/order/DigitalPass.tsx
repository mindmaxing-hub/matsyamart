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
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 text-xs font-semibold border border-emerald-200">
          <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
          <span>Booking & Payment Confirmed</span>
        </div>
        <h1 className="font-display font-bold text-2xl sm:text-3xl text-slate-900">
          Your Verified Coastal Digital Pass
        </h1>
        <p className="text-xs text-slate-500 max-w-md mx-auto">
          Please present this pass on your phone or provide ticket code{" "}
          <span className="font-mono font-bold text-slate-900">
            {order.order_ref}
          </span>{" "}
          upon arrival.
        </p>
      </div>

      {/* Maritime Permit Card */}
      <div className="bg-white rounded-3xl border-2 border-slate-900 shadow-xl overflow-hidden relative">
        {/* Pass Header Band */}
        <div className="bg-slate-900 text-white p-6 flex items-start justify-between relative overflow-hidden border-b border-slate-800">
          <div className="relative z-10 space-y-1">
            <div className="flex items-center gap-2">
              <span className="font-display font-bold text-lg text-amber-400">
                MatsyaMart
              </span>
              <span className="text-[10px] uppercase font-bold tracking-wider bg-slate-800 text-slate-200 px-2 py-0.5 rounded border border-slate-700">
                Official Boarding Permit
              </span>
            </div>
            <h2 className="font-display font-bold text-xl text-white pt-1">
              {listing?.title || "Community Experience"}
            </h2>
            <div className="text-xs text-slate-300 flex items-center gap-1.5 pt-0.5">
              <Anchor className="w-3.5 h-3.5 text-amber-400" />
              <span>Host: {listing?.host_name || "Indigenous Collective"}</span>
            </div>
          </div>

          <div className="relative z-10 text-right shrink-0">
            <span className="text-[10px] uppercase tracking-wider text-slate-400 block">
              Ticket Ref
            </span>
            <span className="font-mono font-bold text-sm text-amber-400 bg-slate-950 px-2.5 py-1 rounded-lg border border-slate-800 block mt-0.5">
              {order.order_ref}
            </span>
          </div>
        </div>

        {/* Pass Core Body */}
        <div className="p-6 sm:p-8 space-y-6">
          {/* Schedule & Timing Grid */}
          {slot && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-200/90">
              <div className="space-y-1">
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-amber-700" /> Date of
                  Experience
                </span>
                <span className="font-display font-bold text-base text-slate-900 block">
                  {formatDate(slot.slot_start)}
                </span>
              </div>

              <div className="space-y-1">
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-amber-700" /> Reporting
                  Time
                </span>
                <span className="font-display font-bold text-base text-slate-900 block">
                  {formatTime(slot.slot_start)} sharp
                </span>
              </div>
            </div>
          )}

          {/* Secret Meeting Point Unlocked */}
          {isExperience && listing?.secret_meeting_point && (
            <div className="p-5 rounded-2xl bg-amber-50/80 border-2 border-amber-300/80 space-y-2">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping" />
                <span className="text-xs font-bold uppercase tracking-wider text-amber-900 flex items-center gap-1">
                  <MapPin className="w-4 h-4 text-amber-700" />
                  Secret Meeting Point & Coordinates (Unlocked)
                </span>
              </div>

              <p className="text-xs sm:text-sm text-slate-800 font-medium leading-relaxed">
                {listing.secret_meeting_point}
              </p>

              <div className="pt-2">
                <a
                  href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                    listing.secret_meeting_point,
                  )}`}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-black text-white text-xs font-semibold transition-colors shadow-xs"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>Open Coordinates in Google Maps</span>
                </a>
              </div>
            </div>
          )}

          {/* Guest Breakdown & QR Code Row */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-6 pt-4 border-t border-dashed border-slate-200">
            <div className="space-y-3 w-full sm:w-auto">
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400">
                  Lead Attendee
                </span>
                <div className="font-display font-bold text-base text-slate-900">
                  {order.customer_name}
                </div>
                <div className="text-xs text-slate-600">
                  {order.customer_phone}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 text-xs">
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400">
                    Guests
                  </span>
                  <div className="font-semibold text-slate-800">
                    {primaryItem?.quantity || 1} Person(s)
                  </div>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400">
                    Amount Paid
                  </span>
                  <div className="font-semibold text-slate-900 font-display">
                    {formatINR(order.total_amount_inr)}
                  </div>
                </div>
              </div>

              {listing?.host_phone && (
                <div className="pt-2 text-xs flex items-center gap-2 text-slate-700">
                  <Phone className="w-3.5 h-3.5 text-amber-700" />
                  <span>
                    Host Support WhatsApp:{" "}
                    <strong className="text-slate-900">
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
                  className="w-32 h-32 rounded-xl border border-slate-200 p-1 shadow-xs bg-white"
                />
              ) : (
                <div className="w-32 h-32 rounded-xl bg-slate-100 flex items-center justify-center text-xs text-slate-400">
                  Generating QR...
                </div>
              )}
              <span className="text-[10px] text-slate-400 font-mono mt-1">
                Scan for Gate Entry
              </span>
            </div>
          </div>
        </div>

        {/* Card Tear-off Footer */}
        <div className="bg-slate-50 border-t border-slate-200 px-6 py-4 flex flex-wrap items-center justify-between text-xs text-slate-500 gap-2">
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>
              Community-Verified Booking • Weather monitored by harbour port
            </span>
          </div>
          <span className="font-mono text-[11px] text-slate-400">
            {new Date(order.created_at).toLocaleDateString()}
          </span>
        </div>
      </div>

      {/* Action Buttons: Print, WhatsApp Share, Copy Link */}
      <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
        <button
          onClick={handlePrint}
          className="px-4 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold flex items-center gap-2 shadow-xs transition-colors cursor-pointer"
        >
          <Printer className="w-4 h-4 text-slate-600" />
          <span>Print / Save PDF</span>
        </button>

        <button
          onClick={handleShareWhatsApp}
          className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold flex items-center gap-2 shadow-xs transition-colors cursor-pointer"
        >
          <Share2 className="w-4 h-4" />
          <span>Share to WhatsApp</span>
        </button>

        <button
          onClick={handleCopyLink}
          className="px-4 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold flex items-center gap-2 shadow-xs transition-colors cursor-pointer"
        >
          <span>{copied ? "Link Copied! ✓" : "Copy Pass Link"}</span>
        </button>
      </div>
    </div>
  );
};
