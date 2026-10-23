import React, { useState, useMemo } from "react";
import {
  Download,
  Printer,
  Search,
  Users,
  Phone,
  ShieldAlert,
  CheckCircle2,
  Clock,
  Filter,
} from "lucide-react";
import { Order, Listing } from "../../types";
import { formatINR, formatDate, formatTime } from "../../lib/utils";
import { useData } from "../../context/DataContext";
import {
  buildCanonicalManifest,
  exportManifestCsv,
  ManifestRow,
} from "../../lib/services/manifest";

interface ManifestTableProps {
  orders: Order[];
  listings: Listing[];
}

export const ManifestTable: React.FC<ManifestTableProps> = ({
  orders,
  listings,
}) => {
  const { slots } = useData();
  const [filterListingId, setFilterListingId] = useState<string>("all");
  const [filterStatus, setFilterStatus] = useState<"all" | "checked_in" | "pending">("all");
  const [searchTerm, setSearchTerm] = useState<string>("");

  const experienceListings = useMemo(() => {
    return listings.filter((l) => l.type === "experience");
  }, [listings]);

  // Canonical Manifest rows expanded per seat
  const allRows = useMemo(() => {
    return buildCanonicalManifest(orders, listings, slots);
  }, [orders, listings, slots]);

  // Filtered rows
  const filteredRows = useMemo(() => {
    return allRows.filter((r) => {
      if (filterListingId !== "all" && r.offeringId !== filterListingId) {
        return false;
      }
      if (filterStatus === "checked_in" && !r.checkedIn) {
        return false;
      }
      if (filterStatus === "pending" && r.checkedIn) {
        return false;
      }
      if (searchTerm.trim()) {
        const q = searchTerm.toLowerCase();
        const inRef = r.orderRef.toLowerCase().includes(q);
        const inCust = r.customerName.toLowerCase().includes(q);
        const inAtt = r.attendeeName.toLowerCase().includes(q);
        const inPhone = r.attendeePhone.includes(q) || r.customerPhone.includes(q);
        const inTitle = r.offeringTitle.toLowerCase().includes(q);
        if (!inRef && !inCust && !inAtt && !inPhone && !inTitle) return false;
      }
      return true;
    });
  }, [allRows, filterListingId, filterStatus, searchTerm]);

  const totalSeats = filteredRows.length;
  const checkedInCount = filteredRows.filter((r) => r.checkedIn).length;
  const totalRevenue = filteredRows.reduce((sum, r) => sum + r.unitPriceINR, 0);

  const handleExportCSV = () => {
    const filename = `MatsyaMart_Unified_Manifest_${new Date().toISOString().split("T")[0]}.csv`;
    const csvContent = exportManifestCsv(filteredRows);
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-4">
      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="p-5 rounded-[16px] bg-[#FFFDFB] border border-[rgba(41,16,11,0.08)] shadow-[0_1px_2px_rgba(41,16,11,0.05),0_8px_28px_-12px_rgba(41,16,11,0.14)]">
          <div className="text-[11px] font-bold tracking-[0.06em] uppercase text-[rgba(41,16,11,0.64)]">
            Total Seats Booked
          </div>
          <div className="font-display font-semibold text-[36px] tracking-[-0.02em] leading-[1.1] my-1.5 text-[#29100B]">
            {totalSeats}
          </div>
          <div className="text-[13px] text-[rgba(41,16,11,0.44)]">
            Verified attendee seats
          </div>
        </div>

        <div className="p-5 rounded-[16px] bg-[#FFFDFB] border border-[rgba(41,16,11,0.08)] shadow-[0_1px_2px_rgba(41,16,11,0.05),0_8px_28px_-12px_rgba(41,16,11,0.14)]">
          <div className="text-[11px] font-bold tracking-[0.06em] uppercase text-[rgba(41,16,11,0.64)]">
            On-Ground Check-Ins
          </div>
          <div className="font-display font-semibold text-[36px] tracking-[-0.02em] leading-[1.1] my-1.5 text-emerald-600">
            {checkedInCount}
          </div>
          <div className="text-[13px] text-[rgba(41,16,11,0.44)]">
            {totalSeats > 0 ? `${Math.round((checkedInCount / totalSeats) * 100)}% arrived` : "0% arrived"}
          </div>
        </div>

        <div className="p-5 rounded-[16px] bg-[#FFFDFB] border border-[rgba(41,16,11,0.08)] shadow-[0_1px_2px_rgba(41,16,11,0.05),0_8px_28px_-12px_rgba(41,16,11,0.14)] relative shadow-[inset_3px_0_0_#E3A157]">
          <div className="text-[11px] font-bold tracking-[0.06em] uppercase text-[rgba(41,16,11,0.64)]">
            Gross Ticket Value
          </div>
          <div className="font-display font-semibold text-[36px] tracking-[-0.02em] leading-[1.1] my-1.5 text-[#29100B]">
            {formatINR(totalRevenue)}
          </div>
          <div className="text-[13px] text-[rgba(41,16,11,0.44)]">
            Verified ticket proceeds
          </div>
          <div className="absolute top-4 right-4 w-[26px] h-[26px] rounded-full bg-[rgba(227,161,87,0.14)] flex items-center justify-center text-[#C67F2A] font-bold text-xs">
            ↗
          </div>
        </div>
      </div>

      {/* Filter and Action Bar */}
      <div className="admin-card p-4">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          {/* Search Input */}
          <div className="admin-search flex-1 w-full sm:w-auto">
            <span>⌕</span>
            <input
              type="text"
              placeholder="Search attendee, lead guest, phone, ticket ref…"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {/* Filters & Actions */}
          <div className="w-full sm:w-auto flex flex-wrap items-center gap-2.5">
            <select
              value={filterListingId}
              onChange={(e) => setFilterListingId(e.target.value)}
              className="admin-select text-xs py-2 px-3.5"
            >
              <option value="all">All Experiences &amp; Events</option>
              {experienceListings.map((l) => (
                <option key={l.id} value={l.id}>
                  {l.title}
                </option>
              ))}
            </select>

            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as any)}
              className="admin-select text-xs py-2 px-3.5"
            >
              <option value="all">All Arrival Statuses</option>
              <option value="checked_in">Checked In Only</option>
              <option value="pending">Pending Arrival Only</option>
            </select>

            <button
              onClick={handleExportCSV}
              className="admin-btn admin-btn-primary text-xs py-2 px-4 cursor-pointer flex items-center gap-1.5"
              title="Export verified CSV with formula defense and UTF-8 BOM"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export CSV</span>
            </button>

            <button
              onClick={() => window.print()}
              className="admin-btn admin-btn-quiet text-xs py-2 px-3 cursor-pointer"
              title="Print Manifest"
            >
              <Printer className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Manifest Grid Table */}
      <div className="admin-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-[13px]">
            <thead className="bg-[#FFFDFB] text-[11px] font-bold uppercase tracking-[0.06em] text-[rgba(41,16,11,0.44)] border-b border-[rgba(41,16,11,0.13)]">
              <tr>
                <th className="py-3 px-4">Ticket Ref</th>
                <th className="py-3 px-4">Experience &amp; Session</th>
                <th className="py-3 px-4">Attendee / Seat</th>
                <th className="py-3 px-4">Contact Phone</th>
                <th className="py-3 px-4">Lead Guest</th>
                <th className="py-3 px-4 text-center">Arrival Status</th>
                <th className="py-3 px-4 text-right">Seat Price</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[rgba(41,16,11,0.08)]">
              {filteredRows.length === 0 ? (
                <tr>
                  <td
                    colSpan={7}
                    className="py-12 text-center text-[rgba(41,16,11,0.44)] text-sm"
                  >
                    No attendee seats found matching current filters.
                  </td>
                </tr>
              ) : (
                filteredRows.map((row) => (
                  <tr
                    key={row.bookingId}
                    className="hover:bg-[#F9EFE7]/40 transition-colors"
                  >
                    <td className="py-3 px-4 font-mono text-[12px] text-[#29100B]">
                      {row.orderRef}
                    </td>
                    <td className="py-3 px-4 max-w-[200px] truncate text-[#29100B]">
                      <b className="block truncate">{row.offeringTitle}</b>
                      {row.sessionStart && (
                        <span className="text-[11px] text-[rgba(41,16,11,0.5)] font-mono">
                          {formatDate(row.sessionStart)} · {formatTime(row.sessionStart)}
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-[#29100B]">
                      <div className="font-semibold">{row.attendeeName}</div>
                      <div className="text-[11px] text-[#C67F2A] font-mono">
                        Seat #{row.seatIndex}
                      </div>
                    </td>
                    <td className="py-3 px-4 font-mono text-[12px] text-[rgba(41,16,11,0.7)]">
                      {row.attendeePhone}
                    </td>
                    <td className="py-3 px-4 text-[12px] text-[#29100B]">
                      <div>{row.customerName}</div>
                      <div className="text-[11px] text-[rgba(41,16,11,0.44)] font-mono">
                        {row.customerEmail}
                      </div>
                    </td>
                    <td className="py-3 px-4 text-center">
                      {row.checkedIn ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[11px] font-bold">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                          <span>Checked In</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-800 text-[11px] font-bold">
                          <Clock className="w-3 h-3 text-amber-600" />
                          <span>Pending</span>
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-right font-bold text-[#29100B]">
                      {formatINR(row.unitPriceINR)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
