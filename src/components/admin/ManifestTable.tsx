import React, { useState } from "react";
import {
  Download,
  Printer,
  Search,
  Users,
  Phone,
  ShieldAlert,
  CheckCircle2,
} from "lucide-react";
import { Order, Listing } from "../../types";
import { formatINR, formatDate } from "../../lib/utils";

interface ManifestTableProps {
  orders: Order[];
  listings: Listing[];
}

export const ManifestTable: React.FC<ManifestTableProps> = ({
  orders,
  listings,
}) => {
  const [filterListingId, setFilterListingId] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState<string>("");

  const experienceListings = listings.filter((l) => l.type === "experience");

  const filteredOrders = orders.filter((order) => {
    // Filter by listing
    if (filterListingId !== "all") {
      const match = order.items.some((i) => i.listing_id === filterListingId);
      if (!match) return false;
    }

    // Filter by search term
    if (searchTerm.trim()) {
      const query = searchTerm.toLowerCase();
      const inRef = order.order_ref.toLowerCase().includes(query);
      const inName = order.customer_name.toLowerCase().includes(query);
      const inPhone = order.customer_phone.toLowerCase().includes(query);
      if (!inRef && !inName && !inPhone) return false;
    }

    return true;
  });

  const totalAttendees = filteredOrders.reduce((sum, order) => {
    const expCount = order.items.reduce((s, i) => s + i.quantity, 0);
    return sum + expCount;
  }, 0);

  const totalRevenue = filteredOrders.reduce(
    (sum, order) => sum + order.total_amount_inr,
    0,
  );

  const exportCSV = () => {
    const headers = [
      "Order Ref",
      "Date Booked",
      "Experience Title",
      "Customer Name",
      "Phone",
      "Email",
      "Guests Count",
      "Emergency Contact",
      "Total Amount (INR)",
      "Status",
    ];

    const rows = filteredOrders.map((o) => {
      const firstItem = o.items[0];
      return [
        o.order_ref,
        new Date(o.created_at).toLocaleDateString(),
        `"${firstItem?.listing?.title || "Tour"}"`,
        `"${o.customer_name}"`,
        `"${o.customer_phone}"`,
        `"${o.customer_email}"`,
        firstItem?.quantity || 1,
        `"${o.emergency_contact || "N/A"}"`,
        o.total_amount_inr,
        o.status,
      ].join(",");
    });

    const csvContent =
      "data:text/csv;charset=utf-8," + [headers.join(","), ...rows].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute(
      "download",
      `MatsyaMart_Manifest_${new Date().toISOString().split("T")[0]}.csv`,
    );
    document.body.appendChild(link);
    link.click();
    link.remove();
  };

  return (
    <div className="space-y-5">
      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-xs">
          <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            Filtered Bookings
          </div>
          <div className="font-display font-bold text-2xl text-ocean-950 mt-1">
            {filteredOrders.length}
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-xs">
          <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            Total Attendees Confirmed
          </div>
          <div className="font-display font-bold text-2xl text-ocean-700 mt-1">
            {totalAttendees}
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-xs">
          <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            Direct Community Payout
          </div>
          <div className="font-display font-bold text-2xl text-emerald-700 mt-1">
            {formatINR(totalRevenue)}
          </div>
        </div>
      </div>

      {/* Filter and Action Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-3 rounded-2xl border border-slate-200">
        {/* Search Input */}
        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search name, phone, ref..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full text-xs pl-9 pr-3 py-2 bg-slate-50 rounded-xl border border-slate-200 outline-none"
          />
        </div>

        {/* Experience Dropdown */}
        <div className="w-full sm:w-auto flex items-center gap-2">
          <select
            value={filterListingId}
            onChange={(e) => setFilterListingId(e.target.value)}
            className="text-xs p-2 bg-slate-50 rounded-xl border border-slate-200 outline-none font-medium text-slate-700"
          >
            <option value="all">All Experiences & Products</option>
            {experienceListings.map((l) => (
              <option key={l.id} value={l.id}>
                {l.title}
              </option>
            ))}
          </select>

          {/* Export CSV Button */}
          <button
            onClick={exportCSV}
            className="px-3.5 py-2 bg-ocean-800 hover:bg-ocean-900 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors shrink-0 shadow-xs"
          >
            <Download className="w-3.5 h-3.5 text-sun-300" />
            <span>Export CSV</span>
          </button>

          {/* Print Button */}
          <button
            onClick={() => window.print()}
            className="p-2 border border-slate-200 hover:bg-slate-100 rounded-xl text-slate-600 transition-colors shrink-0"
            title="Print Manifest"
          >
            <Printer className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Manifest Table */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600">
            <thead className="bg-slate-50 text-[11px] font-bold uppercase tracking-wider text-slate-400 border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">Ticket Ref</th>
                <th className="py-3 px-4">Experience / Product</th>
                <th className="py-3 px-4">Lead Attendee</th>
                <th className="py-3 px-4">Phone / WhatsApp</th>
                <th className="py-3 px-4 text-center">Guests</th>
                <th className="py-3 px-4">Emergency Contact</th>
                <th className="py-3 px-4 text-right">Amount</th>
                <th className="py-3 px-4 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-slate-400">
                    No bookings found matching current filters.
                  </td>
                </tr>
              ) : (
                filteredOrders.map((order) => {
                  const item = order.items[0];
                  return (
                    <tr
                      key={order.id}
                      className="hover:bg-slate-50/80 transition-colors"
                    >
                      <td className="py-3.5 px-4 font-mono font-bold text-ocean-900">
                        {order.order_ref}
                      </td>
                      <td className="py-3.5 px-4 max-w-[200px] truncate text-slate-900 font-semibold">
                        {item?.listing?.title || "Community Item"}
                      </td>
                      <td className="py-3.5 px-4 text-slate-800">
                        {order.customer_name}
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-1 text-slate-700">
                          <Phone className="w-3 h-3 text-ocean-600" />
                          <span>{order.customer_phone}</span>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-center font-bold text-slate-900">
                        {item?.quantity || 1}
                      </td>
                      <td className="py-3.5 px-4 text-slate-500 text-[11px]">
                        {order.emergency_contact || "None registered"}
                      </td>
                      <td className="py-3.5 px-4 text-right font-display font-bold text-ocean-950">
                        {formatINR(order.total_amount_inr)}
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-emerald-50 text-emerald-700 border border-emerald-200">
                          <CheckCircle2 className="w-3 h-3" /> Confirmed
                        </span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
