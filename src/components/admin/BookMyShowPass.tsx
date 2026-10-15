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
} from "lucide-react";

interface BookMyShowPassProps {
  order: Order;
  item?: OrderItem;
  onClose: () => void;
}

export const BookMyShowPass: React.FC<BookMyShowPassProps> = ({
  order,
  item: propItem,
  onClose,
}) => {
  const item = propItem || order.items.find((i) => i.listing?.type === "experience") || order.items[0];
  const listing: Listing | undefined = item?.listing;
  const slot: ExperienceSlot | undefined = item?.slot;

  const [qrDataUrl, setQrDataUrl] = useState<string>("");

  const ticketRef = `${order.order_ref}-${item?.id?.slice(-4) || "01"}`;
  const verificationUrl = `${typeof window !== "undefined" ? window.location.origin : ""}/order/confirmation/${order.order_ref}`;

  useEffect(() => {
    generateQrDataUrl(verificationUrl).then((url) => setQrDataUrl(url));
  }, [verificationUrl]);

  const handlePrint = () => {
    window.print();
  };

  const handleShareWhatsApp = () => {
    const text = encodeURIComponent(
      `🎟️ MatsyaMart Digital Pass: ${listing?.title || "Coastal Experience"}\n` +
        `Ref: ${order.order_ref}\n` +
        `Date: ${slot ? formatDate(slot.slot_start) : "Confirmed"}\n` +
        `Venue: ${listing?.location_name || "Mumbai"}\n` +
        `View Pass: ${verificationUrl}`,
    );
    window.open(`https://api.whatsapp.com/send?text=${text}`, "_blank");
  };

  const attendees = item?.attendee_details || [
    { fullName: order.customer_name, phone: order.customer_phone },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-xs overflow-y-auto">
      {/* Print isolation for BookMyShow Pass */}
      <style>{`
        @media print {
          body * {
            visibility: hidden !important;
          }
          #printable-bms-ticket, #printable-bms-ticket * {
            visibility: visible !important;
          }
          #printable-bms-ticket {
            position: fixed !important;
            left: 50% !important;
            top: 20px !important;
            transform: translateX(-50%) !important;
            width: 700px !important;
            max-width: 95% !important;
            background: #ffffff !important;
            color: #000000 !important;
            box-shadow: none !important;
            border: 2px solid #000000 !important;
            z-index: 999999 !important;
          }
        }
      `}</style>

      <div className="relative w-full max-w-2xl my-auto space-y-3">
        {/* Modal Controls */}
        <div className="flex items-center justify-between px-2 text-[#f5edeb] print:hidden">
          <div className="flex items-center gap-2">
            <Ticket className="w-5 h-5 text-[#e3a157]" />
            <span className="font-display font-bold text-sm sm:text-base">
              Digital Pass &amp; Entry Ticket
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleShareWhatsApp}
              className="p-2 hover:bg-[#35160e] text-[#dab38c] hover:text-[#f5edeb] rounded-xl transition-colors cursor-pointer"
              title="Share via WhatsApp"
            >
              <Share2 className="w-4 h-4" />
            </button>
            <button
              onClick={handlePrint}
              className="px-3.5 py-1.5 bg-[#e3a157] hover:bg-[#dab38c] text-[#29100b] font-bold text-xs rounded-xl shadow-md transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span>Print Ticket</span>
            </button>
            <button
              onClick={onClose}
              className="p-2 hover:bg-[#35160e] text-[#dab38c] hover:text-[#f5edeb] rounded-full transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* BOOKMYSHOW STYLE TICKET BODY */}
        <div
          id="printable-bms-ticket"
          className="bg-white text-neutral-900 rounded-3xl shadow-2xl overflow-hidden border border-neutral-200"
        >
          {/* Header Banner */}
          <div className="bg-[#1f0b07] text-[#f5edeb] px-6 py-4 flex items-center justify-between border-b border-[#dab38c]/30">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-[#e3a157] text-[#29100b] font-black text-sm flex items-center justify-center font-display">
                MM
              </div>
              <div>
                <div className="text-[10px] uppercase font-bold tracking-widest text-[#e3a157]">
                  MatsyaMart · Verified Pass
                </div>
                <div className="text-xs text-[#dab38c]">
                  Kolibaba Seafood Inc &amp; Bhoomiputra Foundation
                </div>
              </div>
            </div>
            <div className="text-right">
              <span className="px-2.5 py-1 rounded-full bg-[#35160e] border border-[#dab38c]/40 text-[#dab38c] font-mono text-[11px] font-bold">
                {ticketRef}
              </span>
            </div>
          </div>

          {/* Main Ticket Layout: Two-Column (Details on Left, QR & Check-in on Right) */}
          <div className="grid grid-cols-1 md:grid-cols-12 divide-y md:divide-y-0 md:divide-x divide-dashed divide-neutral-300 relative">
            {/* LEFT NOTCH CUTOUT */}
            <div className="hidden md:block absolute -left-4 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-[#1f0b07] border-r border-[#dab38c]/30 z-10 print:hidden" />

            {/* LEFT PANE: Event, Venue, Time, Host */}
            <div className="md:col-span-8 p-6 space-y-4">
              <div>
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider mb-2 bg-amber-100 text-amber-900">
                  {listing?.pillar === "food"
                    ? "🍲 Coastal Food Gathering"
                    : listing?.pillar === "walks"
                      ? "🚶 Heritage Walk & Trail"
                      : listing?.pillar === "workshops"
                        ? "🎨 Hands-On Workshop"
                        : "⚓ Coastal Experience"}
                </div>
                <h2 className="font-display font-bold text-xl sm:text-2xl text-neutral-900 leading-tight">
                  {listing?.title || "Mumbai Coastal Experience"}
                </h2>
                <p className="text-xs text-neutral-500 mt-1">
                  Hosted by <strong className="text-neutral-800">{listing?.host_name || "Community Custodians"}</strong>
                </p>
              </div>

              {/* Date & Time Grid */}
              <div className="grid grid-cols-2 gap-3 p-3.5 bg-neutral-50 rounded-2xl border border-neutral-200">
                <div className="flex items-start gap-2.5">
                  <Calendar className="w-4 h-4 text-[#e3a157] mt-0.5 shrink-0" />
                  <div>
                    <div className="text-[10px] uppercase font-bold text-neutral-500">
                      Date
                    </div>
                    <div className="text-xs font-bold text-neutral-900">
                      {slot ? formatDate(slot.slot_start) : "Confirmed Slot"}
                    </div>
                  </div>
                </div>

                <div className="flex items-start gap-2.5">
                  <Clock className="w-4 h-4 text-[#e3a157] mt-0.5 shrink-0" />
                  <div>
                    <div className="text-[10px] uppercase font-bold text-neutral-500">
                      Time Slot
                    </div>
                    <div className="text-xs font-bold text-neutral-900">
                      {slot
                        ? `${formatTime(slot.slot_start)} – ${formatTime(slot.slot_end)}`
                        : "Dawn Schedule"}
                    </div>
                  </div>
                </div>
              </div>

              {/* Venue & Google Maps Link */}
              <div className="p-3.5 bg-neutral-50 rounded-2xl border border-neutral-200 space-y-1.5">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-2">
                    <MapPin className="w-4 h-4 text-emerald-600 mt-0.5 shrink-0" />
                    <div>
                      <div className="text-[10px] uppercase font-bold text-neutral-500">
                        Venue / Secret Meeting Point
                      </div>
                      <div className="text-xs font-semibold text-neutral-900">
                        {listing?.location_name || "Versova Jetty, Mumbai"}
                      </div>
                      {listing?.secret_meeting_point && (
                        <div className="text-[11px] text-neutral-600 mt-0.5">
                          {listing.secret_meeting_point}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {listing?.meeting_point_maps_url && (
                  <a
                    href={listing.meeting_point_maps_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-[11px] font-bold text-blue-600 hover:text-blue-800 transition-colors pt-1"
                  >
                    <span>Open in Google Maps GPS</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                )}
              </div>

              {/* Dietary / Special Notes for Food */}
              {listing?.pillar === "food" && (
                <div className="flex items-center gap-2 p-2.5 rounded-xl bg-orange-50 border border-orange-200 text-orange-950 text-[11px]">
                  <Utensils className="w-3.5 h-3.5 text-orange-700 shrink-0" />
                  <span>
                    <strong>Menu:</strong> Authentic coastal home-cooked feast. Let host know upon arrival of any seafood preferences.
                  </span>
                </div>
              )}
            </div>

            {/* RIGHT PANE: QR Code, Pass Validation, Seat Count */}
            <div className="md:col-span-4 p-6 flex flex-col items-center justify-between bg-neutral-50/60 text-center">
              <div className="w-full space-y-3">
                <div className="text-[10px] uppercase font-bold tracking-wider text-neutral-500">
                  SCAN FOR ON-GROUND ENTRY
                </div>

                {/* QR Code Container */}
                <div className="p-3 bg-white rounded-2xl border-2 border-neutral-300 shadow-xs inline-block">
                  {qrDataUrl ? (
                    <img
                      src={qrDataUrl}
                      alt="Entry Pass QR"
                      className="w-36 h-36 mx-auto object-contain"
                    />
                  ) : (
                    <div className="w-36 h-36 flex items-center justify-center bg-neutral-100 text-neutral-400 font-mono text-xs">
                      Loading QR...
                    </div>
                  )}
                </div>

                <div className="font-mono text-xs font-bold text-neutral-800">
                  {order.order_ref}
                </div>
              </div>

              {/* Attendee / Guest Details */}
              <div className="w-full pt-4 border-t border-neutral-200 mt-4 space-y-1.5 text-left text-[11px]">
                <div className="flex justify-between items-center text-neutral-500 text-[10px] uppercase font-bold">
                  <span>Guest</span>
                  <span>Seats: {item?.quantity || 1}</span>
                </div>
                <div className="font-bold text-xs text-neutral-900 truncate">
                  {order.customer_name}
                </div>
                <div className="text-neutral-500 font-mono text-[10px]">
                  {order.customer_phone}
                </div>
                <div className="pt-2 flex justify-between items-center text-xs font-bold border-t border-dashed border-neutral-300">
                  <span className="text-neutral-600">Total Paid</span>
                  <span className="font-mono text-emerald-700">
                    {formatINR(item ? item.unit_price_inr * item.quantity : order.total_amount_inr)}
                  </span>
                </div>
              </div>
            </div>

            {/* RIGHT NOTCH CUTOUT */}
            <div className="hidden md:block absolute -right-4 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-[#1f0b07] border-l border-[#dab38c]/30 z-10 print:hidden" />
          </div>

          {/* Ticket Footer Tear-Off Notice */}
          <div className="bg-neutral-100 px-6 py-2.5 border-t border-neutral-200 flex flex-col sm:flex-row items-center justify-between text-[10px] text-neutral-500 gap-1">
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              <span>Present this pass or QR to your coordinator on arrival</span>
            </div>
            <div>Bhoomiputra Foundation · Kolibaba Seafood Inc</div>
          </div>
        </div>
      </div>
    </div>
  );
};
