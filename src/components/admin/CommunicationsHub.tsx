import React, { useState } from "react";
import { CheckCircle } from "lucide-react";
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
    "Coastal Briefing: High tide at 6:45 AM tomorrow. Arrive 15 min early at the jetty with water-resistant footwear.",
  );
  const [statusMsg, setStatusMsg] = useState<string>("");

  const experienceListings = listings.filter((l) => l.type === "experience");

  const formatPhoneForWA = (rawPhone: string) => {
    return rawPhone.replace(/[^\d]/g, "");
  };

  const handleSimulateResendEmail = (orderRef: string) => {
    setStatusMsg(`Receipt and digital pass resent for ${orderRef}`);
    setTimeout(() => setStatusMsg(""), 3000);
  };

  return (
    <div className="space-y-6">
      {statusMsg && (
        <div className="p-3.5 bg-[var(--admin-surface)] border border-[var(--admin-accent)] text-[var(--admin-fg)] text-xs rounded-2xl flex items-center gap-2 shadow-xs">
          <CheckCircle className="w-4 h-4 text-[var(--admin-accent-strong)] shrink-0" />
          <span className="font-medium">{statusMsg}</span>
        </div>
      )}

      <div className="admin-two-grid">
        {/* LEFT COLUMN: WhatsApp Coordinator Dispatch */}
        <div className="admin-card p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2.5">
              <b className="text-[15px] text-[var(--admin-fg)]">
                WhatsApp Coordinator Dispatch
              </b>
              <span className="admin-pill admin-pill-amber ml-auto">
                Live gateway
              </span>
            </div>
            <p className="text-[13px] text-[var(--admin-muted)] mt-1 mb-4">
              Tidal broadcasts &amp; instant passes
            </p>

            <label className="text-[11px] font-bold tracking-wider uppercase text-[var(--admin-muted)] block">
              Tidal &amp; weather broadcast
            </label>

            <select
              value={selectedExperienceId}
              onChange={(e) => setSelectedExperienceId(e.target.value)}
              className="admin-select w-full my-2 text-xs"
            >
              {experienceListings.map((l) => (
                <option key={l.id} value={l.id}>
                  {l.title}
                </option>
              ))}
            </select>

            <textarea
              className="admin-ta"
              value={customBroadcastText}
              onChange={(e) => setCustomBroadcastText(e.target.value)}
              rows={3}
            />

            <div className="flex items-center gap-2.5 mt-3">
              <span className="text-[12.5px] text-[var(--admin-faint)]">
                {customBroadcastText.length} chars · coordinates auto-appended
              </span>
              <a
                href={`https://wa.me/?text=${encodeURIComponent(customBroadcastText)}`}
                target="_blank"
                rel="noreferrer"
                className="admin-btn admin-btn-primary text-xs font-bold ml-auto"
              >
                ↗ Open in WhatsApp
              </a>
            </div>
          </div>

          {/* Quick WA Passes List */}
          <div className="border-t border-[var(--admin-border-soft)] mt-6 pt-4 space-y-3">
            <label className="text-[11px] font-bold tracking-wider uppercase text-[var(--admin-muted)] block">
              Direct attendee passes
            </label>
            <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
              {orders.slice(0, 4).map((order) => {
                const cleanPhone = formatPhoneForWA(order.customer_phone);
                const isExp = order.items.some(
                  (i) => i.listing?.type === "experience",
                );
                const passUrl = `${typeof window !== "undefined" ? window.location.origin : ""}/order/confirmation/${order.order_ref}`;
                const defaultMsg = `⚓ Namaste ${order.customer_name}! Your MatsyaMart pass for ${order.items[0]?.listing?.title || "Experience"} is confirmed (Ref: ${order.order_ref}). Pass: ${passUrl}`;
                const waLink = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(defaultMsg)}`;

                return (
                  <div
                    key={order.id}
                    className="flex items-center justify-between gap-3 p-2.5 rounded-xl border border-[var(--admin-border-soft)] bg-[var(--admin-surface)]"
                  >
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-[12.5px] text-[var(--admin-fg)] font-semibold">
                          {order.order_ref}
                        </span>
                        <span className="admin-pill admin-pill-line text-[9.5px]">
                          {isExp ? "Event pass" : "Goods order"}
                        </span>
                      </div>
                      <div className="text-[13px] text-[var(--admin-muted)] truncate">
                        {order.customer_name} · {order.customer_phone}
                      </div>
                    </div>
                    <a
                      href={waLink}
                      target="_blank"
                      rel="noreferrer"
                      className="admin-btn text-xs font-semibold py-1.5 px-3 shrink-0"
                    >
                      Send WA pass
                    </a>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Email Confirmations & Invoicing */}
        <div className="admin-card p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2.5">
              <b className="text-[15px] text-[var(--admin-fg)]">
                Email Confirmations &amp; Invoicing
              </b>
              <span className="admin-pill admin-pill-line ml-auto">
                SMTP active
              </span>
            </div>
            <p className="text-[13px] text-[var(--admin-muted)] mt-1 mb-4">
              Receipts, .ics attachments &amp; delivery logs
            </p>

            <div className="admin-kv">
              <div className="admin-kv-cell">
                <small className="admin-kv-label">Delivery</small>
                <b className="admin-kv-val text-emerald-700">99.4%</b>
              </div>
              <div className="admin-kv-cell">
                <small className="admin-kv-label">Calendar .ics</small>
                <b className="admin-kv-val">Auto</b>
              </div>
              <div className="admin-kv-cell">
                <small className="admin-kv-label">Tax invoice</small>
                <b className="admin-kv-val">On</b>
              </div>
            </div>

            <label className="text-[11px] font-bold tracking-wider uppercase text-[var(--admin-muted)] block mt-4 mb-2">
              Dispatch ledger
            </label>

            <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
              {orders.slice(0, 5).map((order) => (
                <div
                  key={order.id}
                  className="flex items-center justify-between gap-3 p-3 rounded-xl border border-[var(--admin-border-soft)] bg-[var(--admin-surface)]"
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-[12.5px] text-[var(--admin-fg)] font-semibold">
                        {order.order_ref}
                      </span>
                      <span className="admin-pill admin-pill-amber text-[9.5px]">
                        Delivered
                      </span>
                    </div>
                    <div className="text-[13px] text-[var(--admin-muted)] truncate">
                      {order.customer_email} ·{" "}
                      {formatINR(order.total_amount_inr)}
                    </div>
                    <div className="text-[11.5px] text-[var(--admin-faint)]">
                      {formatDate(order.created_at)}
                    </div>
                  </div>

                  <button
                    onClick={() => handleSimulateResendEmail(order.order_ref)}
                    className="admin-btn text-xs font-semibold py-1.5 px-3 shrink-0"
                  >
                    Resend email
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
