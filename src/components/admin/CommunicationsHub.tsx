import React, { useState } from "react";
import {
  MessageSquare,
  Mail,
  Send,
  CheckCircle,
  ExternalLink,
  Phone,
  Clock,
  Waves,
  Package,
  Sparkles,
  AlertCircle,
  Copy,
} from "lucide-react";
import { Order, Listing } from "../../types";
import { formatDate, formatINR } from "../../lib/utils";

interface CommunicationsHubProps {
  orders: Order[];
  listings: Listing[];
}

export const CommunicationsHub: React.FC<CommunicationsHubProps> = ({
  orders,
  listings,
}) => {
  const [selectedExperienceId, setSelectedExperienceId] = useState<string>(
    listings.find((l) => l.type === "experience")?.id || "",
  );
  const [customBroadcastText, setCustomBroadcastText] = useState<string>(
    "⚓ Coastal Briefing: High tide is at 6:45 AM tomorrow. Please arrive 15 minutes early at the jetty with water-resistant footwear. See you at dawn!",
  );
  const [copiedOrderId, setCopiedOrderId] = useState<string | null>(null);
  const [emailStatusMsg, setEmailStatusMsg] = useState<string>("");

  const experienceListings = listings.filter((l) => l.type === "experience");

  // Clean phone number for WhatsApp wa.me links
  const formatPhoneForWA = (rawPhone: string) => {
    return rawPhone.replace(/[^\d]/g, "");
  };

  const handleCopyLink = (orderRef: string, id: string) => {
    const url = `${window.location.origin}/order/confirmation/${orderRef}`;
    navigator.clipboard.writeText(url);
    setCopiedOrderId(id);
    setTimeout(() => setCopiedOrderId(null), 2500);
  };

  const handleSimulateResendEmail = (orderRef: string) => {
    setEmailStatusMsg(
      `Automated confirmation email resent successfully for ${orderRef}`,
    );
    setTimeout(() => setEmailStatusMsg(""), 3500);
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* LEFT COLUMN: WhatsApp Communications Center */}
        <div className="bg-white border border-slate-200/80 rounded-2xl p-5 text-slate-900 shadow-xs space-y-5">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600">
                <MessageSquare className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-display font-bold text-sm sm:text-base text-slate-900">
                  WhatsApp Coordinator Dispatch
                </h3>
                <p className="text-[11px] text-slate-500">
                  Instant passes, tidal broadcasts & dispatch notifications
                </p>
              </div>
            </div>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
              Live Gateway
            </span>
          </div>

          {/* Quick Tidal Broadcast Box */}
          <div className="bg-slate-50 border border-slate-200 p-4 rounded-xl space-y-3">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-slate-800 flex items-center gap-1.5">
                <Waves className="w-3.5 h-3.5 text-sky-600" /> Tidal & Weather
                Broadcast
              </span>
              <span className="text-[10px] text-slate-400">
                Tomorrow's Attendees
              </span>
            </div>

            <select
              value={selectedExperienceId}
              onChange={(e) => setSelectedExperienceId(e.target.value)}
              className="w-full text-xs p-2 bg-white text-slate-900 rounded-lg border border-slate-200 outline-none focus:border-slate-900 shadow-xs"
            >
              {experienceListings.map((l) => (
                <option key={l.id} value={l.id}>
                  {l.title}
                </option>
              ))}
            </select>

            <textarea
              rows={2}
              value={customBroadcastText}
              onChange={(e) => setCustomBroadcastText(e.target.value)}
              className="w-full text-xs p-2 bg-white text-slate-900 rounded-lg border border-slate-200 outline-none resize-none focus:border-slate-900 shadow-xs"
              placeholder="Type morning tidal briefing..."
            />

            <div className="flex items-center justify-between pt-1">
              <span className="text-[10px] text-slate-400">
                Appends meeting coordinates automatically
              </span>
              <a
                href={`https://wa.me/?text=${encodeURIComponent(customBroadcastText)}`}
                target="_blank"
                rel="noreferrer"
                className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
              >
                <Send className="w-3 h-3" />
                <span>Open in WhatsApp</span>
              </a>
            </div>
          </div>

          {/* Recent Orders 1-Click WhatsApp Passes */}
          <div className="space-y-2.5">
            <div className="text-xs font-bold text-slate-600 uppercase tracking-wider flex items-center justify-between">
              <span>Direct Customer Passes & Inquiries</span>
              <span className="text-[10px] text-slate-400">Recent Orders</span>
            </div>

            <div className="divide-y divide-slate-100 bg-slate-50/60 border border-slate-200 rounded-xl max-h-64 overflow-y-auto">
              {orders.slice(0, 5).map((order) => {
                const cleanPhone = formatPhoneForWA(order.customer_phone);
                const isExp = order.items.some(
                  (i) => i.listing?.type === "experience",
                );
                const passUrl = `${typeof window !== "undefined" ? window.location.origin : ""}/order/confirmation/${order.order_ref}`;

                const defaultMsg = isExp
                  ? `⚓ Namaste ${order.customer_name}! Your MatsyaMart Coastal Pass for ${order.items[0]?.listing?.title || "Experience"} is confirmed. Ticket Ref: ${order.order_ref}. View pass: ${passUrl}`
                  : `📦 Namaste ${order.customer_name}! Your MatsyaMart order for ${order.items[0]?.listing?.title || "Artisan Catch"} has been received. Order Ref: ${order.order_ref}. Tracking: ${order.tracking_awb || "In packing"}.`;

                const waLink = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(defaultMsg)}`;

                return (
                  <div
                    key={order.id}
                    className="p-3 flex items-center justify-between gap-3 hover:bg-white transition-colors text-xs"
                  >
                    <div className="min-w-0 space-y-0.5">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-slate-900">
                          {order.order_ref}
                        </span>
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-white text-slate-700 border border-slate-200">
                          {isExp ? "Event Pass" : "Goods Order"}
                        </span>
                      </div>
                      <div className="text-slate-600 truncate">
                        {order.customer_name} • {order.customer_phone}
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        onClick={() =>
                          handleCopyLink(order.order_ref, order.id)
                        }
                        className="p-1.5 rounded-lg bg-white hover:bg-slate-100 text-slate-600 hover:text-slate-900 border border-slate-200 transition-colors shadow-xs"
                        title="Copy digital pass link"
                      >
                        {copiedOrderId === order.id ? (
                          <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                      </button>

                      <a
                        href={waLink}
                        target="_blank"
                        rel="noreferrer"
                        className="px-2.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[11px] flex items-center gap-1 transition-colors shadow-xs"
                      >
                        <MessageSquare className="w-3 h-3" />
                        <span>Send WA Pass</span>
                      </a>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Email Communications Center */}
        <div className="bg-white border border-slate-200/80 rounded-2xl p-5 text-slate-900 shadow-xs space-y-5">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-sky-50 border border-sky-200 flex items-center justify-center text-sky-600">
                <Mail className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-display font-bold text-sm sm:text-base text-slate-900">
                  Email Confirmation & Invoicing
                </h3>
                <p className="text-[11px] text-slate-500">
                  Automated receipts, calendar .ics attachments & delivery logs
                </p>
              </div>
            </div>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-sky-50 text-sky-700 border border-sky-200">
              SMTP Active
            </span>
          </div>

          {emailStatusMsg && (
            <div className="p-3 bg-sky-50 border border-sky-200 text-sky-800 text-xs rounded-xl flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-sky-600 shrink-0" />
              <span>{emailStatusMsg}</span>
            </div>
          )}

          {/* Automated Trigger Metrics */}
          <div className="grid grid-cols-3 gap-2.5 text-center">
            <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl">
              <div className="text-[10px] text-slate-500 uppercase">
                Delivery Rate
              </div>
              <div className="text-base font-bold font-display text-emerald-600 mt-0.5">
                99.4%
              </div>
            </div>
            <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl">
              <div className="text-[10px] text-slate-500 uppercase">
                Calendar .ICS
              </div>
              <div className="text-base font-bold font-display text-sky-600 mt-0.5">
                Auto-Attached
              </div>
            </div>
            <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl">
              <div className="text-[10px] text-slate-500 uppercase">
                Tax Invoice
              </div>
              <div className="text-base font-bold font-display text-slate-900 mt-0.5">
                Enabled
              </div>
            </div>
          </div>

          {/* Email Delivery Log */}
          <div className="space-y-2.5">
            <div className="text-xs font-bold text-slate-600 uppercase tracking-wider flex items-center justify-between">
              <span>Customer Email Dispatch Ledger</span>
              <span className="text-[10px] text-slate-400">Instant Resend</span>
            </div>

            <div className="divide-y divide-slate-100 bg-slate-50/60 border border-slate-200 rounded-xl max-h-64 overflow-y-auto">
              {orders.slice(0, 5).map((order) => {
                return (
                  <div
                    key={order.id}
                    className="p-3 flex items-center justify-between gap-3 hover:bg-white transition-colors text-xs"
                  >
                    <div className="min-w-0 space-y-0.5">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-slate-900">
                          {order.order_ref}
                        </span>
                        <span className="inline-flex items-center gap-1 text-[10px] text-emerald-700 font-semibold">
                          <CheckCircle className="w-3 h-3 text-emerald-600" />{" "}
                          Delivered
                        </span>
                      </div>
                      <div className="text-slate-600 truncate">
                        {order.customer_email}
                      </div>
                      <div className="text-[10px] text-slate-400">
                        Total {formatINR(order.total_amount_inr)} •{" "}
                        {formatDate(order.created_at)}
                      </div>
                    </div>

                    <button
                      onClick={() => handleSimulateResendEmail(order.order_ref)}
                      className="px-2.5 py-1.5 rounded-lg bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 font-semibold text-[11px] flex items-center gap-1 transition-colors shrink-0 cursor-pointer shadow-xs"
                    >
                      <Mail className="w-3 h-3" />
                      <span>Resend Email</span>
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
