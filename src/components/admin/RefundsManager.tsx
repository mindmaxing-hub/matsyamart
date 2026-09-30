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
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-500">
            <span>Pending Refund Requests</span>
            <Clock className="w-4 h-4 text-amber-600" />
          </div>
          <div className="font-display font-bold text-2xl text-amber-600">
            {pendingRequests} Requests
          </div>
          <div className="text-[11px] text-slate-400">
            Awaiting coordinator audit
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-500">
            <span>Cash Refunds Processed</span>
            <RotateCcw className="w-4 h-4 text-rose-500" />
          </div>
          <div className="font-display font-bold text-2xl text-slate-900">
            {formatINR(totalRefundedInr)}
          </div>
          <div className="text-[11px] text-slate-400">
            Via original payment gateway
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-500">
            <span>Store Credit Vouchers</span>
            <Ticket className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="font-display font-bold text-2xl text-emerald-600">
            {vouchersIssuedCount} Vouchers
          </div>
          <div className="text-[11px] text-slate-400">
            Retained 100% platform revenue
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-500">
            <span>Policy Compliance Rate</span>
            <ShieldCheck className="w-4 h-4 text-[#e3a157]" />
          </div>
          <div className="font-display font-bold text-2xl text-slate-900">
            98.8%
          </div>
          <div className="text-[11px] text-slate-400">
            Zero chargeback disputes
          </div>
        </div>
      </div>

      {actionSuccessMsg && (
        <div className="p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-xl flex items-center gap-2 shadow-xs">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{actionSuccessMsg}</span>
        </div>
      )}

      {/* Filter and Export Bar */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 shadow-xs">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 flex-1">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search customer name, order ref, or phone..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full text-xs pl-9 pr-3 py-2 bg-white text-slate-900 border border-slate-200 rounded-xl outline-none focus:border-slate-900 shadow-xs"
            />
          </div>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="text-xs bg-white text-slate-900 border border-slate-200 rounded-xl px-3 py-2 outline-none focus:border-slate-900 shadow-xs"
          >
            <option value="all">All Request Statuses</option>
            <option value="requested">Pending Decision</option>
            <option value="refunded">Cash Refunded</option>
            <option value="credit_voucher_issued">Store Credit Issued</option>
            <option value="declined">Declined</option>
          </select>
        </div>

        {/* CSV Export */}
        <button
          onClick={exportRefundsCSV}
          className="px-4 py-2 rounded-xl bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-xs"
        >
          <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
          <span>Export Refunds CSV</span>
        </button>
      </div>

      {/* Refunds Table */}
      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-slate-50 text-slate-500 font-bold text-[10px] uppercase tracking-wider border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">Ticket Ref & Guest</th>
                <th className="py-3 px-4">Tour / Item</th>
                <th className="py-3 px-4">Notice Window</th>
                <th className="py-3 px-4">Cancellation Reason</th>
                <th className="py-3 px-4 text-right">Amount</th>
                <th className="py-3 px-4 text-center">Policy Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {filteredTickets.map((t) => {
                const isPending = t.status === "requested";

                return (
                  <tr
                    key={t.id}
                    className="hover:bg-slate-50/80 transition-colors"
                  >
                    {/* Ref & Guest */}
                    <td className="py-3.5 px-4 align-top">
                      <div className="font-mono font-bold text-slate-900">
                        {t.order_ref}
                      </div>
                      <div className="font-semibold text-slate-800 mt-0.5">
                        {t.customer_name}
                      </div>
                      <div className="text-[10px] text-slate-400">
                        {t.customer_phone}
                      </div>
                    </td>

                    {/* Tour Name */}
                    <td className="py-3.5 px-4 align-top max-w-[200px]">
                      <div className="font-semibold text-slate-900 truncate">
                        {t.tour_or_item_name}
                      </div>
                      <div className="text-[10px] text-slate-400 mt-0.5">
                        Booked for: {t.booking_date}
                      </div>
                    </td>

                    {/* Notice Window */}
                    <td className="py-3.5 px-4 align-top">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase border ${
                          t.hours_before_tour >= 48
                            ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                            : t.hours_before_tour >= 24
                              ? "bg-amber-50 text-amber-700 border-amber-200"
                              : "bg-rose-50 text-rose-700 border-rose-200"
                        }`}
                      >
                        {t.hours_before_tour}h Notice
                      </span>
                      <div className="text-[10px] text-slate-400 mt-1">
                        {t.hours_before_tour >= 48
                          ? "100% Refund Eligible"
                          : t.hours_before_tour >= 24
                            ? "50% Cash or 100% Credit"
                            : "Standby Fee Retained"}
                      </div>
                    </td>

                    {/* Cancellation Reason */}
                    <td className="py-3.5 px-4 align-top max-w-xs">
                      <div className="text-slate-600 text-[11px] leading-relaxed">
                        {t.cancellation_reason}
                      </div>
                      {t.admin_notes && (
                        <div className="text-[10px] text-slate-400 italic mt-0.5">
                          Note: {t.admin_notes}
                        </div>
                      )}
                    </td>

                    {/* Amount */}
                    <td className="py-3.5 px-4 align-top text-right font-bold text-slate-900">
                      {formatINR(t.amount_paid_inr)}
                    </td>

                    {/* Status Pill */}
                    <td className="py-3.5 px-4 align-top text-center">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase border ${
                          t.status === "refunded"
                            ? "bg-rose-50 text-rose-700 border-rose-200"
                            : t.status === "credit_voucher_issued"
                              ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                              : t.status === "declined"
                                ? "bg-slate-100 text-slate-700 border-slate-200"
                                : "bg-amber-50 text-amber-700 border-amber-200"
                        }`}
                      >
                        {t.status.replace(/_/g, " ")}
                      </span>
                      {t.credit_voucher_code && (
                        <div className="font-mono text-emerald-700 font-bold text-[10px] mt-1">
                          {t.credit_voucher_code}
                        </div>
                      )}
                    </td>

                    {/* Actions */}
                    <td className="py-3.5 px-4 align-top text-right">
                      {isPending ? (
                        <div className="flex items-center justify-end gap-1.5 flex-wrap">
                          <button
                            onClick={() => handleOpenAction(t, "credit")}
                            className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold transition-colors cursor-pointer shadow-xs inline-flex items-center gap-1"
                            title="Issue 100% store credit voucher code"
                          >
                            <Ticket className="w-3 h-3" />
                            <span>Credit Voucher</span>
                          </button>

                          <button
                            onClick={() => handleOpenAction(t, "refund")}
                            className="px-2.5 py-1 bg-white hover:bg-slate-50 text-rose-600 border border-rose-200 rounded-lg text-xs font-semibold transition-colors cursor-pointer shadow-xs"
                            title="Log Razorpay refund reference"
                          >
                            Cash Refund
                          </button>

                          <button
                            onClick={() => handleDecline(t.id)}
                            className="px-2 py-1 text-slate-400 hover:text-slate-700 text-xs font-medium cursor-pointer"
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
                          className="text-[11px] text-emerald-700 hover:underline inline-flex items-center gap-1"
                        >
                          <Send className="w-3 h-3" />
                          <span>WhatsApp Update</span>
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl w-full max-w-md p-6 space-y-5 text-slate-900">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="font-display font-bold text-base text-slate-900">
                  {actionType === "refund"
                    ? "Confirm Cash Refund"
                    : "Issue Store Credit Voucher"}
                </h3>
                <p className="text-xs text-slate-500">
                  {selectedTicket.customer_name} • {selectedTicket.order_ref}
                </p>
              </div>
              <button
                onClick={() => {
                  setSelectedTicket(null);
                  setActionType(null);
                }}
                className="text-slate-400 hover:text-slate-700 text-lg leading-none cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleConfirmAction} className="space-y-4">
              {actionType === "refund" ? (
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">
                    Razorpay Gateway Refund ID
                  </label>
                  <input
                    type="text"
                    required
                    value={razorpayRefundId}
                    onChange={(e) => setRazorpayRefundId(e.target.value)}
                    className="w-full text-xs px-3 py-2.5 bg-white text-slate-900 border border-slate-200 rounded-xl outline-none focus:border-slate-900 shadow-xs"
                  />
                  <span className="text-[10px] text-slate-400 mt-1 block">
                    Refund Amount: {formatINR(selectedTicket.amount_paid_inr)}
                  </span>
                </div>
              ) : (
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">
                    Generated Store Credit Voucher Code
                  </label>
                  <input
                    type="text"
                    required
                    value={voucherCode}
                    onChange={(e) => setVoucherCode(e.target.value)}
                    className="w-full text-xs px-3 py-2.5 bg-white text-slate-900 border border-slate-200 rounded-xl outline-none font-mono font-bold focus:border-slate-900 shadow-xs"
                  />
                  <span className="text-[10px] text-emerald-600 mt-1 block">
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
                  className="px-4 py-2 text-xs font-semibold text-slate-600 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 cursor-pointer shadow-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className={`px-4 py-2 text-xs font-bold rounded-xl shadow-xs cursor-pointer flex items-center gap-1.5 ${
                    actionType === "refund"
                      ? "bg-rose-600 hover:bg-rose-700 text-white"
                      : "bg-[#e3a157] hover:bg-[#d97706] text-slate-950"
                  }`}
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
