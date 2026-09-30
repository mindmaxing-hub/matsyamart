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

  // Focus on orders that include experiences
  const experienceOrders = orders.filter((order) =>
    order.items.some(
      (i) => i.listing?.type === "experience" || !order.shipping_address,
    ),
  );

  const filteredOrders = experienceOrders.filter((order) => {
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
        <div className="p-4 rounded-2xl bg-[#35160e]/80 border border-[#dab38c]/20 text-[#f5edeb] shadow-md">
          <div className="text-xs font-semibold text-[#dab38c]/70 uppercase tracking-wider">
            Filtered Bookings
          </div>
          <div className="font-display font-bold text-2xl text-[#f5edeb] mt-1">
            {filteredOrders.length}
          </div>
          <div className="text-[10px] text-[#dab38c]/60 mt-0.5">
            Confirmed guest orders
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-[#35160e]/80 border border-[#dab38c]/20 text-[#f5edeb] shadow-md">
          <div className="text-xs font-semibold text-[#dab38c]/70 uppercase tracking-wider">
            Total Attendees Confirmed
          </div>
          <div className="font-display font-bold text-2xl text-[#e3a157] mt-1">
            {totalAttendees}
          </div>
          <div className="text-[10px] text-[#dab38c]/60 mt-0.5">
            Registered guests across slots
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-[#35160e]/80 border border-[#dab38c]/20 text-[#f5edeb] shadow-md">
          <div className="text-xs font-semibold text-[#dab38c]/70 uppercase tracking-wider">
            Direct Community Payout
          </div>
          <div className="font-display font-bold text-2xl text-emerald-300 mt-1">
            {formatINR(totalRevenue)}
          </div>
          <div className="text-[10px] text-[#dab38c]/60 mt-0.5">
            Disbursed to guides and storytellers
          </div>
        </div>
      </div>

      {/* Filter and Action Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-[#29100b] p-3.5 rounded-2xl border border-[#dab38c]/20">
        {/* Search Input */}
        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 text-[#dab38c]/50 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search name, phone, ref..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full text-xs pl-9 pr-3 py-2 bg-[#35160e] text-[#f5edeb] rounded-xl border border-[#dab38c]/30 outline-none focus:border-[#e3a157]"
          />
        </div>

        {/* Experience Dropdown */}
        <div className="w-full sm:w-auto flex items-center gap-2">
          <select
            value={filterListingId}
            onChange={(e) => setFilterListingId(e.target.value)}
            className="text-xs p-2 bg-[#35160e] text-[#f5edeb] rounded-xl border border-[#dab38c]/30 outline-none font-medium focus:border-[#e3a157]"
          >
            <option value="all">All Experiences & Events</option>
            {experienceListings.map((l) => (
              <option key={l.id} value={l.id}>
                {l.title}
              </option>
            ))}
          </select>

          {/* Export CSV Button */}
          <button
            onClick={exportCSV}
            className="px-3.5 py-2 bg-[#e3a157] hover:bg-[#dab38c] text-[#29100b] rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors shrink-0 shadow-xs cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </button>

          {/* Print Button */}
          <button
            onClick={() => window.print()}
            className="p-2 border border-[#dab38c]/20 hover:bg-[#35160e] rounded-xl text-[#dab38c] hover:text-[#f5edeb] transition-colors shrink-0 cursor-pointer"
            title="Print Manifest"
          >
            <Printer className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Manifest Table */}
      <div className="bg-[#29100b] rounded-2xl border border-[#dab38c]/20 overflow-hidden shadow-lg">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-[#dab38c]">
            <thead className="bg-[#35160e] text-[11px] font-bold uppercase tracking-wider text-[#e3a157] border-b border-[#dab38c]/15">
              <tr>
                <th className="py-3 px-4">Ticket Ref</th>
                <th className="py-3 px-4">Experience / Event</th>
                <th className="py-3 px-4">Lead Attendee</th>
                <th className="py-3 px-4">Phone / WhatsApp</th>
                <th className="py-3 px-4 text-center">Guests</th>
                <th className="py-3 px-4">Emergency Contact</th>
                <th className="py-3 px-4 text-right">Amount</th>
                <th className="py-3 px-4 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#dab38c]/10 font-medium">
              {filteredOrders.length === 0 ? (
                <tr>
                  <td
                    colSpan={8}
                    className="py-8 text-center text-[#dab38c]/60 text-xs"
                  >
                    No bookings found matching current filters.
                  </td>
                </tr>
              ) : (
                filteredOrders.map((order) => {
                  const item = order.items[0];
                  return (
                    <tr
                      key={order.id}
                      className="hover:bg-[#35160e]/50 transition-colors"
                    >
                      <td className="py-3.5 px-4 font-mono font-bold text-[#f5edeb]">
                        {order.order_ref}
                      </td>
                      <td className="py-3.5 px-4 max-w-[200px] truncate text-[#f5edeb] font-semibold">
                        {item?.listing?.title || "Community Tour"}
                      </td>
                      <td className="py-3.5 px-4 text-[#f5edeb]">
                        {order.customer_name}
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-1.5 text-[#dab38c]">
                          <Phone className="w-3 h-3 text-[#e3a157]" />
                          <span>{order.customer_phone}</span>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-center font-bold text-[#e3a157]">
                        {item?.quantity || 1}
                      </td>
                      <td className="py-3.5 px-4 text-[#dab38c]/70 text-[11px]">
                        {order.emergency_contact || "None registered"}
                      </td>
                      <td className="py-3.5 px-4 text-right font-display font-bold text-[#e3a157]">
                        {formatINR(order.total_amount_inr)}
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-emerald-950/60 text-emerald-300 border border-emerald-800/50">
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
