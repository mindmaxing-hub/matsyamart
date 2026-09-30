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
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        <div className="p-5 rounded-[18px] bg-[var(--admin-surface)] border border-[var(--admin-border-soft)] shadow-[var(--admin-shadow)] relative flex flex-col justify-between shadow-[inset_3px_0_0_var(--admin-accent)]">
          <div className="text-[11px] font-bold tracking-[0.07em] uppercase text-[var(--admin-muted)] flex items-center justify-between">
            <span>Community Earnings (85%)</span>
            <span className="text-[var(--admin-accent)] font-mono text-sm">
              ↗
            </span>
          </div>
          <div className="font-display font-semibold text-[32px] sm:text-[34px] tracking-tight leading-[1.15] text-[var(--admin-fg)] my-1.5">
            {formatINR(totalCommunityEarnings)}
          </div>
          <div className="text-[12.5px] text-[var(--admin-faint)]">
            Direct host &amp; artisan allocation
          </div>
        </div>

        <div className="p-5 rounded-[18px] bg-[var(--admin-surface)] border border-[var(--admin-border-soft)] shadow-[var(--admin-shadow)] relative flex flex-col justify-between">
          <div className="text-[11px] font-bold tracking-[0.07em] uppercase text-[var(--admin-muted)]">
            Outstanding Balance Due
          </div>
          <div className="font-display font-semibold text-[32px] sm:text-[34px] tracking-tight leading-[1.15] text-[var(--admin-accent-strong)] my-1.5">
            {formatINR(totalOutstanding)}
          </div>
          <div className="text-[12.5px] text-[var(--admin-faint)]">
            Awaiting bank / UPI remittance
          </div>
        </div>

        <div className="p-5 rounded-[18px] bg-[var(--admin-surface)] border border-[var(--admin-border-soft)] shadow-[var(--admin-shadow)] relative flex flex-col justify-between">
          <div className="text-[11px] font-bold tracking-[0.07em] uppercase text-[var(--admin-muted)]">
            Total Disbursed to Date
          </div>
          <div className="font-display font-semibold text-[32px] sm:text-[34px] tracking-tight leading-[1.15] text-[var(--admin-fg)] my-1.5">
            {formatINR(totalDisbursed)}
          </div>
          <div className="text-[12.5px] text-[var(--admin-faint)]">
            Settled via UPI / IMPS UTR
          </div>
        </div>

        <div className="p-5 rounded-[18px] bg-[var(--admin-surface)] border border-[var(--admin-border-soft)] shadow-[var(--admin-shadow)] relative flex flex-col justify-between">
          <div className="text-[11px] font-bold tracking-[0.07em] uppercase text-[var(--admin-muted)]">
            MatsyaMart Retainer (15%)
          </div>
          <div className="font-display font-semibold text-[32px] sm:text-[34px] tracking-tight leading-[1.15] text-[var(--admin-fg)] my-1.5">
            {formatINR(platformRetainer)}
          </div>
          <div className="text-[12.5px] text-[var(--admin-faint)]">
            Operations, safety &amp; platform
          </div>
        </div>
      </div>

      {payoutSuccessMsg && (
        <div className="p-3.5 bg-[var(--admin-surface)] border border-[var(--admin-accent)] text-[var(--admin-fg)] text-xs rounded-2xl flex items-center gap-2 shadow-xs">
          <CheckCircle2 className="w-4 h-4 text-[var(--admin-accent-strong)] shrink-0" />
          <span className="font-medium">{payoutSuccessMsg}</span>
        </div>
      )}

      {/* Filter and Action Bar */}
      <div className="admin-card p-4">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 flex-1">
            <div className="admin-search flex-1">
              <span className="text-[var(--admin-faint)]">⌕</span>
              <input
                type="text"
                placeholder="Search partner name, Koliwada village, or UPI..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="admin-select text-xs"
            >
              <option value="all">All Community Partners</option>
              <option value="guide">Tour Hosts &amp; Guides</option>
              <option value="artisan_collective">Artisan Cooperatives</option>
            </select>
          </div>

          <button
            onClick={exportPayoutsCSV}
            className="admin-btn text-xs font-semibold"
          >
            <Download className="w-3.5 h-3.5 text-[var(--admin-accent)]" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Partners Payout Ledger Table */}
      <div className="admin-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-[var(--admin-border)] bg-[rgba(245,237,235,0.45)]">
                <th className="py-3.5 px-4 font-bold text-[11px] text-[var(--admin-muted)] uppercase tracking-wider whitespace-nowrap">
                  Community Partner
                </th>
                <th className="py-3.5 px-4 font-bold text-[11px] text-[var(--admin-muted)] uppercase tracking-wider whitespace-nowrap">
                  Role &amp; Location
                </th>
                <th className="py-3.5 px-4 font-bold text-[11px] text-[var(--admin-muted)] uppercase tracking-wider whitespace-nowrap">
                  UPI &amp; Account Details
                </th>
                <th className="py-3.5 px-4 font-bold text-[11px] text-[var(--admin-muted)] uppercase tracking-wider whitespace-nowrap text-right">
                  Total Earned (85%)
                </th>
                <th className="py-3.5 px-4 font-bold text-[11px] text-[var(--admin-muted)] uppercase tracking-wider whitespace-nowrap text-right">
                  Paid to Date
                </th>
                <th className="py-3.5 px-4 font-bold text-[11px] text-[var(--admin-muted)] uppercase tracking-wider whitespace-nowrap text-right">
                  Balance Due
                </th>
                <th className="py-3.5 px-4 font-bold text-[11px] text-[var(--admin-muted)] uppercase tracking-wider whitespace-nowrap text-center">
                  Status
                </th>
                <th className="py-3.5 px-4 font-bold text-[11px] text-[var(--admin-muted)] uppercase tracking-wider whitespace-nowrap text-right">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--admin-border-soft)]">
              {filteredPayouts.map((partner) => {
                const isPaidInFull = partner.pending_balance_inr === 0;

                return (
                  <tr
                    key={partner.id}
                    className="hover:bg-[rgba(227,161,87,0.03)] transition-colors"
                  >
                    {/* Partner Name */}
                    <td className="py-3.5 px-4 align-middle">
                      <b className="text-[var(--admin-fg)] text-[13px]">
                        {partner.partner_name}
                      </b>
                    </td>

                    {/* Role & Village */}
                    <td className="py-3.5 px-4 align-middle">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span
                          className={`admin-pill text-[9.5px] ${
                            partner.role_type === "guide"
                              ? "admin-pill-amber"
                              : "admin-pill-line"
                          }`}
                        >
                          {partner.role_type === "guide"
                            ? "Tour Host"
                            : "Artisan Co-Op"}
                        </span>
                        <span className="text-[var(--admin-muted)] text-[12px]">
                          {partner.koliwada}
                        </span>
                      </div>
                    </td>

                    {/* UPI & Bank Account */}
                    <td className="py-3.5 px-4 align-middle">
                      <div className="space-y-0.5">
                        <div className="font-mono text-[var(--admin-fg)] text-[11.5px] font-medium">
                          {partner.upi_id}
                        </div>
                        <div className="text-[11px] text-[var(--admin-faint)]">
                          {partner.bank_account_mask}
                        </div>
                      </div>
                    </td>

                    {/* Total Earned */}
                    <td className="py-3.5 px-4 align-middle text-right">
                      <b className="text-[var(--admin-fg)]">
                        {formatINR(partner.total_earned_inr)}
                      </b>
                    </td>

                    {/* Paid */}
                    <td className="py-3.5 px-4 align-middle text-right">
                      <span className="text-[var(--admin-muted)] font-medium">
                        {formatINR(partner.total_paid_inr)}
                      </span>
                    </td>

                    {/* Balance Due */}
                    <td className="py-3.5 px-4 align-middle text-right">
                      <b
                        className={
                          partner.pending_balance_inr > 0
                            ? "text-[var(--admin-accent-strong)]"
                            : "text-[var(--admin-faint)]"
                        }
                      >
                        {formatINR(partner.pending_balance_inr)}
                      </b>
                    </td>

                    {/* Status Pill */}
                    <td className="py-3.5 px-4 align-middle text-center">
                      <span
                        className={`admin-pill text-[9.5px] ${
                          isPaidInFull ? "admin-pill-line" : "admin-pill-amber"
                        }`}
                      >
                        {isPaidInFull ? "Disbursed" : "Pending Due"}
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="py-3.5 px-4 align-middle text-right">
                      {partner.pending_balance_inr > 0 ? (
                        <button
                          onClick={() => handleOpenDisbursement(partner)}
                          className="admin-btn admin-btn-primary text-xs font-bold py-1.5 px-3.5"
                        >
                          Record payout
                        </button>
                      ) : (
                        <span className="text-[11.5px] text-[var(--admin-faint)] italic font-mono">
                          Settled · {partner.utr_reference?.slice(-6)}
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#29100B]/50 backdrop-blur-xs">
          <div className="admin-card w-full max-w-md p-6 space-y-5">
            <div className="flex items-center justify-between border-b border-[var(--admin-border-soft)] pb-3">
              <div>
                <h3 className="font-display font-semibold text-2xl text-[var(--admin-fg)]">
                  Record Community Remittance
                </h3>
                <p className="text-xs text-[var(--admin-muted)]">
                  Log UPI / NEFT bank settlement reference for accounts audit.
                </p>
              </div>
              <button
                onClick={() => setSelectedPartnerId(null)}
                className="text-[var(--admin-muted)] hover:text-[var(--admin-fg)] text-lg leading-none cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleConfirmDisbursement} className="space-y-4">
              <div>
                <label className="text-[11px] font-bold tracking-wider uppercase text-[var(--admin-muted)] block mb-1.5">
                  Disbursement Amount (INR)
                </label>
                <input
                  type="number"
                  required
                  min="1"
                  value={disbursementAmount}
                  onChange={(e) => setDisbursementAmount(e.target.value)}
                  className="w-full text-xs p-2.5 bg-[var(--admin-surface)] text-[var(--admin-fg)] rounded-xl border border-[var(--admin-border)] outline-none focus:border-[var(--admin-accent-strong)]"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold tracking-wider uppercase text-[var(--admin-muted)] block mb-1.5">
                  Bank / UPI UTR Transaction Reference
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. CMS202610010042"
                  value={utrInput}
                  onChange={(e) => setUtrInput(e.target.value)}
                  className="w-full text-xs p-2.5 bg-[var(--admin-surface)] text-[var(--admin-fg)] rounded-xl border border-[var(--admin-border)] outline-none focus:border-[var(--admin-accent-strong)] font-mono"
                />
              </div>

              <div className="p-3 bg-[var(--admin-bg)] rounded-xl border border-[var(--admin-border-soft)] text-xs text-[var(--admin-muted)] space-y-1">
                <div className="flex justify-between">
                  <span>Destination UPI:</span>
                  <span className="font-mono font-bold text-[var(--admin-fg)]">
                    {payouts.find((p) => p.id === selectedPartnerId)?.upi_id}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Account:</span>
                  <span className="text-[var(--admin-fg)]">
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
                  className="admin-btn admin-btn-quiet text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="admin-btn admin-btn-primary text-xs font-bold"
                >
                  Confirm settlement
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
