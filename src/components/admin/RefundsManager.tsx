import React, { useState } from "react";
import {
  RotateCcw,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  FileSpreadsheet,
  Ticket,
  Search,
  MessageSquare,
  CreditCard,
  Send,
  Clock,
  ShieldCheck,
} from "lucide-react";
import { Order, RefundTicket } from "../../types";
import { formatINR, formatDate } from "../../lib/utils";

interface RefundsManagerProps {
  orders: Order[];
}

const SEED_REFUND_TICKETS: RefundTicket[] = [
  {
    id: "ref-01",
    order_ref: "MM-EXP-2026-0038",
    customer_name: "Meera Sen",
    customer_phone: "+91 98200 88219",
    tour_or_item_name: "Thane Flamingo Estuary Boat Safari",
    booking_date: "2026-10-04",
    request_date: "2026-10-01",
    hours_before_tour: 54, // >48h
    amount_paid_inr: 2200,
    cancellation_reason: "Family emergency / sudden travel to Bangalore",
    eligibility: "full_refund",
    status: "requested",
  },
  {
    id: "ref-02",
    order_ref: "MM-EXP-2026-0012",
    customer_name: "Anirudh Sharma",
    customer_phone: "+91 98214 77102",
    tour_or_item_name: "Night Crabbing & Lantern Fishing Safari",
    booking_date: "2026-10-02",
    request_date: "2026-10-01",
    hours_before_tour: 31, // 24-48h
    amount_paid_inr: 1200,
    cancellation_reason: "High viral fever & unable to walk rocky shallows",
    eligibility: "partial_or_credit",
    status: "requested",
  },
  {
    id: "ref-03",
    order_ref: "MM-EXP-2026-0044",
    customer_name: "Kavit Desai",
    customer_phone: "+91 99308 22104",
    tour_or_item_name: "Dawn Heritage Trail & Traditional Koli Breakfast",
    booking_date: "2026-10-01",
    request_date: "2026-10-01",
    hours_before_tour: 4, // <24h
    amount_paid_inr: 3300,
    cancellation_reason: "Car breakdown on Western Express Highway at 5 AM",
    eligibility: "non_refundable",
    status: "requested",
  },
  {
    id: "ref-04",
    order_ref: "MM-EXP-2026-0021",
    customer_name: "Radhika Nair",
    customer_phone: "+91 98201 33499",
    tour_or_item_name: "Artisanal Sun-Dried Seafood Hamper",
    booking_date: "2026-09-29",
    request_date: "2026-09-27",
    hours_before_tour: 72,
    amount_paid_inr: 2400,
    cancellation_reason: "Duplicate accidental order placed on mobile",
    eligibility: "full_refund",
    status: "refunded",
    razorpay_refund_id: "rfnd_P9x03Kz9104",
    admin_notes: "Processed full refund via Razorpay Dashboard",
  },
];

export const RefundsManager: React.FC<RefundsManagerProps> = ({ orders }) => {
  const [tickets, setTickets] = useState<RefundTicket[]>(() => {
    try {
      const saved = localStorage.getItem("matsyamart_refund_tickets_v1");
      return saved ? JSON.parse(saved) : SEED_REFUND_TICKETS;
    } catch {
      return SEED_REFUND_TICKETS;
    }
  });

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedTicket, setSelectedTicket] = useState<RefundTicket | null>(
    null,
  );
  const [actionType, setActionType] = useState<"refund" | "credit" | null>(
    null,
  );
  const [razorpayRefundId, setRazorpayRefundId] = useState("");
  const [voucherCode, setVoucherCode] = useState("");
  const [actionSuccessMsg, setActionSuccessMsg] = useState("");

  const saveTickets = (updated: RefundTicket[]) => {
    setTickets(updated);
    try {
      localStorage.setItem(
        "matsyamart_refund_tickets_v1",
        JSON.stringify(updated),
      );
    } catch (e) {
      console.warn("Storage error", e);
    }
  };

  const handleOpenAction = (
    ticket: RefundTicket,
    type: "refund" | "credit",
  ) => {
    setSelectedTicket(ticket);
    setActionType(type);
    if (type === "refund") {
      setRazorpayRefundId(`rfnd_${Date.now().toString().slice(-9)}`);
    } else {
      const randomStr = Math.random()
        .toString(36)
        .substring(2, 6)
        .toUpperCase();
      setVoucherCode(`MM-CREDIT-${randomStr}`);
    }
  };

  const handleConfirmAction = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTicket || !actionType) return;

    const updated = tickets.map((t) => {
      if (t.id === selectedTicket.id) {
        if (actionType === "refund") {
          return {
            ...t,
            status: "refunded" as const,
            razorpay_refund_id: razorpayRefundId,
            admin_notes: `Processed cash refund of ${formatINR(t.amount_paid_inr)} via Razorpay`,
          };
        } else {
          return {
            ...t,
            status: "credit_voucher_issued" as const,
            credit_voucher_code: voucherCode,
            admin_notes: `Issued 100% store credit voucher code ${voucherCode}`,
          };
        }
      }
      return t;
    });

    saveTickets(updated);
    setActionSuccessMsg(
      actionType === "refund"
        ? `Refund of ${formatINR(selectedTicket.amount_paid_inr)} logged successfully.`
        : `Store credit voucher ${voucherCode} created successfully!`,
    );
    setSelectedTicket(null);
    setActionType(null);
    setTimeout(() => setActionSuccessMsg(""), 3500);
  };

  const handleDecline = (ticketId: string) => {
    const updated = tickets.map((t) =>
      t.id === ticketId
        ? {
            ...t,
            status: "declined" as const,
            admin_notes:
              "Declined per cancellation policy (<24h notice; host already dispatched).",
          }
        : t,
    );
    saveTickets(updated);
    setActionSuccessMsg("Cancellation request declined per policy rules.");
    setTimeout(() => setActionSuccessMsg(""), 3000);
  };

  // Metrics
  const pendingRequests = tickets.filter(
    (t) => t.status === "requested",
  ).length;
  const totalRefundedInr = tickets
    .filter((t) => t.status === "refunded")
    .reduce((sum, t) => sum + t.amount_paid_inr, 0);
  const vouchersIssuedCount = tickets.filter(
    (t) => t.status === "credit_voucher_issued",
  ).length;

  const filteredTickets = tickets.filter((t) => {
    if (statusFilter !== "all" && t.status !== statusFilter) return false;
    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      const inRef = t.order_ref.toLowerCase().includes(q);
      const inName = t.customer_name.toLowerCase().includes(q);
      const inPhone = t.customer_phone.toLowerCase().includes(q);
      if (!inRef && !inName && !inPhone) return false;
    }
    return true;
  });

  const exportRefundsCSV = () => {
    const headers = [
      "Order Ref",
      "Customer Name",
      "Phone",
      "Tour/Product",
      "Amount Paid",
      "Hours Notice",
      "Cancellation Reason",
      "Policy Eligibility",
      "Status",
      "Refund Reference / Voucher",
    ];

    const rows = filteredTickets.map((t) => {
      const refOrVoucher =
        t.razorpay_refund_id || t.credit_voucher_code || "N/A";
      return [
        t.order_ref,
        `"${t.customer_name}"`,
        `"${t.customer_phone}"`,
        `"${t.tour_or_item_name}"`,
        t.amount_paid_inr,
        t.hours_before_tour,
        `"${t.cancellation_reason}"`,
        t.eligibility,
        t.status,
        `"${refOrVoucher}"`,
      ].join(",");
    });

    const csvContent =
      "data:text/csv;charset=utf-8," + [headers.join(","), ...rows].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute(
      "download",
      `MatsyaMart_Refunds_${new Date().toISOString().split("T")[0]}.csv`,
    );
    document.body.appendChild(link);
    link.click();
    link.remove();
  };

  return (
    <div className="space-y-6">
      {/* 4 Financial Split Cards */}
      <div className="metrics">
        <div className="metric hl">
          <div className="lbl">Pending Refund Requests</div>
          <div className="val text-[var(--admin-accent-strong)]">
            {pendingRequests}
          </div>
          <div className="sub">Awaiting coordinator audit</div>
          <div className="tick">↗</div>
        </div>

        <div className="metric">
          <div className="lbl">Cash Refunds Processed</div>
          <div className="val">{formatINR(totalRefundedInr)}</div>
          <div className="sub">Via original payment gateway</div>
        </div>

        <div className="metric">
          <div className="lbl">Store Credit Vouchers</div>
          <div className="val">{vouchersIssuedCount}</div>
          <div className="sub">Retained 100% platform revenue</div>
        </div>

        <div className="metric">
          <div className="lbl">Policy Compliance Rate</div>
          <div className="val">98.8%</div>
          <div className="sub">Zero chargeback disputes</div>
        </div>
      </div>

      {actionSuccessMsg && (
        <div className="p-3.5 bg-[var(--admin-surface)] border border-[var(--admin-accent)] text-[var(--admin-fg)] text-xs rounded-2xl flex items-center gap-2 shadow-xs">
          <CheckCircle2 className="w-4 h-4 text-[var(--admin-accent-strong)] shrink-0" />
          <span className="font-medium">{actionSuccessMsg}</span>
        </div>
      )}

      {/* Filter and Export Bar */}
      <div className="admin-card p-4">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 flex-1">
            <div className="admin-search flex-1">
              <span className="text-[var(--admin-faint)]">⌕</span>
              <input
                type="text"
                placeholder="Search customer name, order ref, or phone..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="admin-select text-xs"
            >
              <option value="all">All Request Statuses</option>
              <option value="requested">Pending Decision</option>
              <option value="refunded">Cash Refunded</option>
              <option value="credit_voucher_issued">Store Credit Issued</option>
              <option value="declined">Declined</option>
            </select>
          </div>

          <button
            onClick={exportRefundsCSV}
            className="admin-btn text-xs font-semibold"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-[var(--admin-accent)]" />
            <span>Export Refunds CSV</span>
          </button>
        </div>
      </div>

      {/* Refunds Table */}
      <div className="admin-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="grid w-full">
            <thead>
              <tr>
                <th>Ticket Ref &amp; Guest</th>
                <th>Tour / Item</th>
                <th>Notice Window</th>
                <th>Cancellation Reason</th>
                <th style={{ textAlign: "right" }}>Amount</th>
                <th style={{ textAlign: "center" }}>Policy Status</th>
                <th style={{ textAlign: "right" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredTickets.map((t) => {
                const isPending = t.status === "requested";

                return (
                  <tr key={t.id}>
                    {/* Ref & Guest */}
                    <td>
                      <div className="font-editorial-mono font-bold text-[var(--admin-fg)] text-[12px]">
                        {t.order_ref}
                      </div>
                      <div className="font-semibold text-[var(--admin-fg)] mt-0.5">
                        {t.customer_name}
                      </div>
                      <div className="text-[11px] text-[var(--admin-faint)]">
                        {t.customer_phone}
                      </div>
                    </td>

                    {/* Tour Name */}
                    <td className="max-w-[200px]">
                      <b className="text-[var(--admin-fg)] block truncate">
                        {t.tour_or_item_name}
                      </b>
                      <div className="text-[11px] text-[var(--admin-faint)] mt-0.5">
                        Booked for: {t.booking_date}
                      </div>
                    </td>

                    {/* Notice Window */}
                    <td>
                      <span
                        className={`admin-pill text-[9.5px] ${
                          t.hours_before_tour >= 48
                            ? "admin-pill-line"
                            : t.hours_before_tour >= 24
                              ? "admin-pill-amber"
                              : "admin-pill-roast"
                        }`}
                      >
                        {t.hours_before_tour}h Notice
                      </span>
                      <div className="text-[11px] text-[var(--admin-faint)] mt-1">
                        {t.hours_before_tour >= 48
                          ? "100% Refund Eligible"
                          : t.hours_before_tour >= 24
                            ? "50% Cash or 100% Credit"
                            : "Standby Fee Retained"}
                      </div>
                    </td>

                    {/* Cancellation Reason */}
                    <td className="max-w-xs">
                      <div className="text-[var(--admin-muted)] text-[12px] leading-relaxed">
                        {t.cancellation_reason}
                      </div>
                      {t.admin_notes && (
                        <div className="text-[11px] text-[var(--admin-faint)] italic mt-0.5">
                          Note: {t.admin_notes}
                        </div>
                      )}
                    </td>

                    {/* Amount */}
                    <td style={{ textAlign: "right" }}>
                      <b className="text-[var(--admin-fg)]">
                        {formatINR(t.amount_paid_inr)}
                      </b>
                    </td>

                    {/* Status Pill */}
                    <td style={{ textAlign: "center" }}>
                      <span
                        className={`admin-pill text-[9.5px] ${
                          t.status === "refunded"
                            ? "admin-pill-roast"
                            : t.status === "credit_voucher_issued"
                              ? "admin-pill-line"
                              : t.status === "declined"
                                ? "admin-pill-line opacity-60"
                                : "admin-pill-amber"
                        }`}
                      >
                        {t.status.replace(/_/g, " ")}
                      </span>
                      {t.credit_voucher_code && (
                        <div className="font-editorial-mono text-[var(--admin-accent-strong)] font-bold text-[11px] mt-1">
                          {t.credit_voucher_code}
                        </div>
                      )}
                    </td>

                    {/* Actions */}
                    <td style={{ textAlign: "right" }}>
                      {isPending ? (
                        <div className="flex items-center justify-end gap-1.5 flex-wrap">
                          <button
                            onClick={() => handleOpenAction(t, "credit")}
                            className="admin-btn admin-btn-primary text-xs font-bold py-1 px-2.5"
                            title="Issue 100% store credit voucher code"
                          >
                            Credit voucher
                          </button>

                          <button
                            onClick={() => handleOpenAction(t, "refund")}
                            className="admin-btn text-xs py-1 px-2.5"
                            title="Log Razorpay refund reference"
                          >
                            Cash refund
                          </button>

                          <button
                            onClick={() => handleDecline(t.id)}
                            className="admin-btn admin-btn-quiet text-xs py-1 px-2 text-[var(--admin-faint)]"
                            title="Decline cancellation"
                          >
                            Decline
                          </button>
                        </div>
                      ) : (
                        <a
                          href={`https://wa.me/${t.customer_phone.replace(/[^\d]/g, "")}?text=${encodeURIComponent(
                            `Namaste ${t.customer_name}! Updating you regarding your MatsyaMart cancellation for ${t.order_ref}. ${t.status === "credit_voucher_issued" ? `Your store credit voucher is ${t.credit_voucher_code} valid for 6 months.` : `Your refund has been processed.`}`,
                          )}`}
                          target="_blank"
                          rel="noreferrer"
                          className="text-[12px] text-[var(--admin-accent-strong)] hover:underline inline-flex items-center gap-1 font-semibold"
                        >
                          <Send className="w-3 h-3" />
                          <span>WhatsApp Update ↗</span>
                        </a>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Action Modal (Cash Refund or Credit Voucher) */}
      {selectedTicket && actionType && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#29100B]/50 backdrop-blur-xs">
          <div className="admin-card w-full max-w-md p-6 space-y-5">
            <div className="flex items-center justify-between border-b border-[var(--admin-border-soft)] pb-3">
              <div>
                <h3 className="font-editorial text-2xl text-[var(--admin-fg)]">
                  {actionType === "refund"
                    ? "Confirm Cash Refund"
                    : "Issue Store Credit Voucher"}
                </h3>
                <p className="text-xs text-[var(--admin-muted)]">
                  {selectedTicket.customer_name} · {selectedTicket.order_ref}
                </p>
              </div>
              <button
                onClick={() => {
                  setSelectedTicket(null);
                  setActionType(null);
                }}
                className="text-[var(--admin-muted)] hover:text-[var(--admin-fg)] text-lg leading-none cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleConfirmAction} className="space-y-4">
              {actionType === "refund" ? (
                <div>
                  <label className="text-[11px] font-bold tracking-wider uppercase text-[var(--admin-muted)] block mb-1.5">
                    Razorpay Gateway Refund ID
                  </label>
                  <input
                    type="text"
                    required
                    value={razorpayRefundId}
                    onChange={(e) => setRazorpayRefundId(e.target.value)}
                    className="w-full text-xs p-2.5 bg-[var(--admin-surface)] text-[var(--admin-fg)] border border-[var(--admin-border)] rounded-xl outline-none focus:border-[var(--admin-accent-strong)] font-editorial-mono"
                  />
                  <span className="text-[11px] text-[var(--admin-faint)] mt-1 block">
                    Refund Amount: {formatINR(selectedTicket.amount_paid_inr)}
                  </span>
                </div>
              ) : (
                <div>
                  <label className="text-[11px] font-bold tracking-wider uppercase text-[var(--admin-muted)] block mb-1.5">
                    Generated Store Credit Voucher Code
                  </label>
                  <input
                    type="text"
                    required
                    value={voucherCode}
                    onChange={(e) => setVoucherCode(e.target.value)}
                    className="w-full text-xs p-2.5 bg-[var(--admin-surface)] text-[var(--admin-fg)] border border-[var(--admin-border)] rounded-xl outline-none font-editorial-mono font-bold focus:border-[var(--admin-accent-strong)]"
                  />
                  <span className="text-[11.5px] text-[var(--admin-accent-strong)] mt-1 block">
                    Valid for 180 days across any coastal safari or pantry item.
                  </span>
                </div>
              )}

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setSelectedTicket(null);
                    setActionType(null);
                  }}
                  className="admin-btn admin-btn-quiet text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="admin-btn admin-btn-primary text-xs font-bold"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>
                    {actionType === "refund"
                      ? "Confirm Refund Log"
                      : "Issue Voucher"}
                  </span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
