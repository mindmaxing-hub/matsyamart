import React, { useState, useMemo } from "react";
import {
  Wallet,
  ArrowUpRight,
  CheckCircle2,
  Clock,
  Download,
  Building2,
  Users,
  Search,
  ExternalLink,
  ShieldCheck,
  CreditCard,
  FileSpreadsheet,
} from "lucide-react";
import { Order, Listing, HostPayoutRecord } from "../../types";
import { formatINR, formatDate } from "../../lib/utils";

interface HostPayoutsLedgerProps {
  orders: Order[];
  listings: Listing[];
}

const SEED_HOST_PAYOUTS: HostPayoutRecord[] = [
  {
    id: "payout-01",
    partner_name: "Suresh Nakawa",
    role_type: "guide",
    koliwada: "Mahim Koliwada",
    upi_id: "suresh.nakawa@okhdfcbank",
    bank_account_mask: "HDFC •••• 4091",
    total_earned_inr: 18700,
    total_paid_inr: 12000,
    pending_balance_inr: 6700,
    last_payout_date: new Date(Date.now() - 3600000 * 72).toISOString(),
    utr_reference: "CMS202609280019",
    status: "pending",
  },
  {
    id: "payout-02",
    partner_name: "Prathamesh Patil",
    role_type: "guide",
    koliwada: "Versova Koliwada",
    upi_id: "prathamesh.patil@okaxis",
    bank_account_mask: "AXIS •••• 8122",
    total_earned_inr: 15300,
    total_paid_inr: 15300,
    pending_balance_inr: 0,
    last_payout_date: new Date(Date.now() - 3600000 * 24).toISOString(),
    utr_reference: "CMS202609300084",
    status: "disbursed",
  },
  {
    id: "payout-03",
    partner_name: "Versova Koli Mahila Bachat Gat",
    role_type: "artisan_collective",
    koliwada: "Versova Village",
    upi_id: "versova.bachat@sbi",
    bank_account_mask: "SBI •••• 5519",
    total_earned_inr: 11200,
    total_paid_inr: 7500,
    pending_balance_inr: 3700,
    last_payout_date: new Date(Date.now() - 3600000 * 120).toISOString(),
    utr_reference: "CMS202609250041",
    status: "pending",
  },
  {
    id: "payout-04",
    partner_name: "Devendra Koli",
    role_type: "guide",
    koliwada: "Thane Creek Estuary",
    upi_id: "devendra.naturalist@okicici",
    bank_account_mask: "ICICI •••• 6631",
    total_earned_inr: 8500,
    total_paid_inr: 8500,
    pending_balance_inr: 0,
    last_payout_date: new Date(Date.now() - 3600000 * 48).toISOString(),
    utr_reference: "CMS202609290055",
    status: "disbursed",
  },
  {
    id: "payout-05",
    partner_name: "Malvan Coastal Salt & Spice Cooperative",
    role_type: "artisan_collective",
    koliwada: "Sindhudurg Coast",
    upi_id: "malvan.spices@kotak",
    bank_account_mask: "KOTAK •••• 2940",
    total_earned_inr: 6800,
    total_paid_inr: 4000,
    pending_balance_inr: 2800,
    last_payout_date: new Date(Date.now() - 3600000 * 96).toISOString(),
    utr_reference: "CMS202609270032",
    status: "pending",
  },
];

export const HostPayoutsLedger: React.FC<HostPayoutsLedgerProps> = ({
  orders,
}) => {
  const [payouts, setPayouts] = useState<HostPayoutRecord[]>(() => {
    try {
      const saved = localStorage.getItem("matsyamart_host_payouts_v1");
      return saved ? JSON.parse(saved) : SEED_HOST_PAYOUTS;
    } catch {
      return SEED_HOST_PAYOUTS;
    }
  });

  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("all");
  const [selectedPartnerId, setSelectedPartnerId] = useState<string | null>(
    null,
  );
  const [disbursementAmount, setDisbursementAmount] = useState<string>("");
  const [utrInput, setUtrInput] = useState<string>("");
  const [payoutSuccessMsg, setPayoutSuccessMsg] = useState<string>("");

  // Calculate live platform figures
  const totalGMV = useMemo(() => {
    return orders.reduce((sum, o) => sum + o.total_amount_inr, 0);
  }, [orders]);

  const totalCommunityEarnings = useMemo(() => {
    return payouts.reduce((sum, p) => sum + p.total_earned_inr, 0);
  }, [payouts]);

  const totalDisbursed = useMemo(() => {
    return payouts.reduce((sum, p) => sum + p.total_paid_inr, 0);
  }, [payouts]);

  const totalOutstanding = useMemo(() => {
    return payouts.reduce((sum, p) => sum + p.pending_balance_inr, 0);
  }, [payouts]);

  const platformRetainer = useMemo(() => {
    return Math.round(totalGMV * 0.15);
  }, [totalGMV]);

  const filteredPayouts = payouts.filter((p) => {
    if (roleFilter !== "all" && p.role_type !== roleFilter) return false;
    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      const inName = p.partner_name.toLowerCase().includes(q);
      const inKoliwada = p.koliwada.toLowerCase().includes(q);
      const inUpi = p.upi_id.toLowerCase().includes(q);
      if (!inName && !inKoliwada && !inUpi) return false;
    }
    return true;
  });

  const handleOpenDisbursement = (p: HostPayoutRecord) => {
    setSelectedPartnerId(p.id);
    setDisbursementAmount(String(p.pending_balance_inr));
    setUtrInput(`UTR${Date.now().toString().slice(-8)}`);
  };

  const handleConfirmDisbursement = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPartnerId) return;

    const amt = Number(disbursementAmount);
    if (isNaN(amt) || amt <= 0) return;

    const updated = payouts.map((p) => {
      if (p.id === selectedPartnerId) {
        const nextPaid = p.total_paid_inr + amt;
        const nextPending = Math.max(0, p.pending_balance_inr - amt);
        return {
          ...p,
          total_paid_inr: nextPaid,
          pending_balance_inr: nextPending,
          status: (nextPending === 0 ? "disbursed" : "pending") as
            "disbursed" | "pending",
          last_payout_date: new Date().toISOString(),
          utr_reference: utrInput || `CMS${Date.now().toString().slice(-8)}`,
        };
      }
      return p;
    });

    setPayouts(updated);
    try {
      localStorage.setItem(
        "matsyamart_host_payouts_v1",
        JSON.stringify(updated),
      );
    } catch (e) {
      console.warn("Storage error", e);
    }

    setPayoutSuccessMsg(
      `Disbursed ${formatINR(amt)} successfully with UTR ${utrInput || "Recorded"}!`,
    );
    setSelectedPartnerId(null);
    setTimeout(() => setPayoutSuccessMsg(""), 3500);
  };

  const exportPayoutsCSV = () => {
    const headers = [
      "Partner Name",
      "Role",
      "Koliwada / Village",
      "UPI ID",
      "Bank Account",
      "Total Earned (85%)",
      "Total Paid",
      "Outstanding Balance",
      "Status",
      "Last UTR Reference",
      "Last Payout Date",
    ];

    const rows = filteredPayouts.map((p) => {
      return [
        `"${p.partner_name}"`,
        p.role_type,
        `"${p.koliwada}"`,
        p.upi_id,
        `"${p.bank_account_mask}"`,
        p.total_earned_inr,
        p.total_paid_inr,
        p.pending_balance_inr,
        p.status,
        p.utr_reference || "N/A",
        p.last_payout_date
          ? new Date(p.last_payout_date).toLocaleDateString()
          : "N/A",
      ].join(",");
    });

    const csvContent =
      "data:text/csv;charset=utf-8," + [headers.join(","), ...rows].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute(
      "download",
      `MatsyaMart_Community_Payouts_${new Date().toISOString().split("T")[0]}.csv`,
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
            <span>Community Earnings (85%)</span>
            <Wallet className="w-4 h-4 text-[#e3a157]" />
          </div>
          <div className="font-display font-bold text-2xl text-slate-900">
            {formatINR(totalCommunityEarnings)}
          </div>
          <div className="text-[11px] text-slate-400">
            Direct host & artisan allocation
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-500">
            <span>Outstanding Balance Due</span>
            <Clock className="w-4 h-4 text-amber-600" />
          </div>
          <div className="font-display font-bold text-2xl text-amber-600">
            {formatINR(totalOutstanding)}
          </div>
          <div className="text-[11px] text-slate-400">
            Awaiting bank / UPI remittance
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-500">
            <span>Total Disbursed to Date</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="font-display font-bold text-2xl text-emerald-600">
            {formatINR(totalDisbursed)}
          </div>
          <div className="text-[11px] text-slate-400">
            Settled via UPI / IMPS UTR
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-500">
            <span>MatsyaMart Retainer (15%)</span>
            <ShieldCheck className="w-4 h-4 text-slate-700" />
          </div>
          <div className="font-display font-bold text-2xl text-slate-900">
            {formatINR(platformRetainer)}
          </div>
          <div className="text-[11px] text-slate-400">
            Operations, insurance & gateway
          </div>
        </div>
      </div>

      {payoutSuccessMsg && (
        <div className="p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-xl flex items-center gap-2 shadow-xs">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{payoutSuccessMsg}</span>
        </div>
      )}

      {/* Filter and Action Bar */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 shadow-xs">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 flex-1">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search partner name, Koliwada village, or UPI..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full text-xs pl-9 pr-3 py-2 bg-white text-slate-900 border border-slate-200 rounded-xl outline-none focus:border-slate-900 shadow-xs"
            />
          </div>

          {/* Role Filter */}
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="text-xs bg-white text-slate-900 border border-slate-200 rounded-xl px-3 py-2 outline-none focus:border-slate-900 shadow-xs"
          >
            <option value="all">All Community Partners</option>
            <option value="guide">Tour Guides & Storytellers</option>
            <option value="artisan_collective">Artisan Cooperatives</option>
          </select>
        </div>

        {/* CSV Export */}
        <button
          onClick={exportPayoutsCSV}
          className="px-4 py-2 rounded-xl bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-xs"
        >
          <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
          <span>Export Payouts CSV</span>
        </button>
      </div>

      {/* Partners Payout Ledger Table */}
      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-slate-50 text-slate-500 font-bold text-[10px] uppercase tracking-wider border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">Community Partner</th>
                <th className="py-3 px-4">Role & Location</th>
                <th className="py-3 px-4">UPI & Account Details</th>
                <th className="py-3 px-4 text-right">Total Earned (85%)</th>
                <th className="py-3 px-4 text-right">Paid to Date</th>
                <th className="py-3 px-4 text-right">Balance Due</th>
                <th className="py-3 px-4 text-center">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {filteredPayouts.map((partner) => {
                const isPaidInFull = partner.pending_balance_inr === 0;

                return (
                  <tr
                    key={partner.id}
                    className="hover:bg-slate-50/80 transition-colors"
                  >
                    {/* Partner Name */}
                    <td className="py-3.5 px-4 font-semibold text-slate-900">
                      {partner.partner_name}
                    </td>

                    {/* Role & Village */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase border ${
                            partner.role_type === "guide"
                              ? "bg-amber-50 text-amber-800 border-amber-200"
                              : "bg-emerald-50 text-emerald-800 border-emerald-200"
                          }`}
                        >
                          {partner.role_type === "guide"
                            ? "Tour Host"
                            : "Artisan Co-Op"}
                        </span>
                        <span className="text-slate-500 text-[11px]">
                          {partner.koliwada}
                        </span>
                      </div>
                    </td>

                    {/* UPI & Bank Account */}
                    <td className="py-3.5 px-4">
                      <div className="space-y-0.5">
                        <div className="font-mono text-slate-800 text-[11px] font-medium">
                          {partner.upi_id}
                        </div>
                        <div className="text-[10px] text-slate-400">
                          {partner.bank_account_mask}
                        </div>
                      </div>
                    </td>

                    {/* Total Earned */}
                    <td className="py-3.5 px-4 text-right font-bold text-slate-900">
                      {formatINR(partner.total_earned_inr)}
                    </td>

                    {/* Paid */}
                    <td className="py-3.5 px-4 text-right font-medium text-emerald-600">
                      {formatINR(partner.total_paid_inr)}
                    </td>

                    {/* Balance Due */}
                    <td className="py-3.5 px-4 text-right font-bold">
                      <span
                        className={
                          partner.pending_balance_inr > 0
                            ? "text-amber-600"
                            : "text-slate-400"
                        }
                      >
                        {formatINR(partner.pending_balance_inr)}
                      </span>
                    </td>

                    {/* Status Pill */}
                    <td className="py-3.5 px-4 text-center">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase border ${
                          isPaidInFull
                            ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                            : "bg-amber-50 text-amber-700 border-amber-200"
                        }`}
                      >
                        {isPaidInFull ? "Disbursed" : "Pending Due"}
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="py-3.5 px-4 text-right">
                      {partner.pending_balance_inr > 0 ? (
                        <button
                          onClick={() => handleOpenDisbursement(partner)}
                          className="px-3 py-1.5 bg-[#e3a157] hover:bg-[#d97706] text-slate-950 font-bold text-xs rounded-lg transition-colors shadow-xs cursor-pointer inline-flex items-center gap-1"
                        >
                          <CreditCard className="w-3.5 h-3.5" />
                          <span>Record Payout</span>
                        </button>
                      ) : (
                        <span className="text-[11px] text-slate-400 italic">
                          Settled (Ref: {partner.utr_reference?.slice(-6)})
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Record Disbursement Modal */}
      {selectedPartnerId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl w-full max-w-md p-6 space-y-5 text-slate-900">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="font-display font-bold text-base text-slate-900">
                  Record Community Remittance
                </h3>
                <p className="text-xs text-slate-500">
                  Log UPI / NEFT bank settlement reference for accounts audit.
                </p>
              </div>
              <button
                onClick={() => setSelectedPartnerId(null)}
                className="text-slate-400 hover:text-slate-700 text-lg leading-none cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleConfirmDisbursement} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">
                  Disbursement Amount (INR)
                </label>
                <input
                  type="number"
                  required
                  min="1"
                  value={disbursementAmount}
                  onChange={(e) => setDisbursementAmount(e.target.value)}
                  className="w-full text-xs px-3 py-2.5 bg-white text-slate-900 border border-slate-200 rounded-xl outline-none focus:border-slate-900 shadow-xs"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">
                  Bank / UPI UTR Transaction Reference
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. UTR30948210984"
                  value={utrInput}
                  onChange={(e) => setUtrInput(e.target.value)}
                  className="w-full text-xs px-3 py-2.5 bg-white text-slate-900 border border-slate-200 rounded-xl outline-none focus:border-slate-900 shadow-xs"
                />
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-[11px] text-slate-600 space-y-1">
                <div className="flex justify-between">
                  <span>Destination UPI:</span>
                  <span className="font-mono font-bold text-slate-800">
                    {payouts.find((p) => p.id === selectedPartnerId)?.upi_id}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Account:</span>
                  <span className="text-slate-700">
                    {
                      payouts.find((p) => p.id === selectedPartnerId)
                        ?.bank_account_mask
                    }
                  </span>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setSelectedPartnerId(null)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 cursor-pointer shadow-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-bold text-slate-950 bg-[#e3a157] hover:bg-[#d97706] rounded-xl shadow-xs cursor-pointer flex items-center gap-1.5"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Confirm Settlement</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
