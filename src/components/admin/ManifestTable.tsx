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
    <div className="space-y-4">
      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="p-5 rounded-[16px] bg-[#FFFDFB] border border-[rgba(41,16,11,0.08)] shadow-[0_1px_2px_rgba(41,16,11,0.05),0_8px_28px_-12px_rgba(41,16,11,0.14)]">
          <div className="text-[11px] font-bold tracking-[0.06em] uppercase text-[rgba(41,16,11,0.64)]">
            Filtered bookings
          </div>
          <div className="font-editorial text-[36px] tracking-[-0.02em] leading-[1.1] my-1.5 text-[#29100B]">
            {filteredOrders.length}
          </div>
          <div className="text-[13px] text-[rgba(41,16,11,0.44)]">
            Confirmed guest orders
          </div>
        </div>

        <div className="p-5 rounded-[16px] bg-[#FFFDFB] border border-[rgba(41,16,11,0.08)] shadow-[0_1px_2px_rgba(41,16,11,0.05),0_8px_28px_-12px_rgba(41,16,11,0.14)]">
          <div className="text-[11px] font-bold tracking-[0.06em] uppercase text-[rgba(41,16,11,0.64)]">
            Attendees confirmed
          </div>
          <div className="font-editorial text-[36px] tracking-[-0.02em] leading-[1.1] my-1.5 text-[#29100B]">
            {totalAttendees}
          </div>
          <div className="text-[13px] text-[rgba(41,16,11,0.44)]">
            Across slots
          </div>
        </div>

        <div className="p-5 rounded-[16px] bg-[#FFFDFB] border border-[rgba(41,16,11,0.08)] shadow-[0_1px_2px_rgba(41,16,11,0.05),0_8px_28px_-12px_rgba(41,16,11,0.14)] relative shadow-[inset_3px_0_0_#E3A157]">
          <div className="text-[11px] font-bold tracking-[0.06em] uppercase text-[rgba(41,16,11,0.64)]">
            Community payout
          </div>
          <div className="font-editorial text-[36px] tracking-[-0.02em] leading-[1.1] my-1.5 text-[#29100B]">
            {formatINR(totalRevenue)}
          </div>
          <div className="text-[13px] text-[rgba(41,16,11,0.44)]">
            To guides &amp; storytellers
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
              placeholder="Search name, phone, ref…"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {/* Experience Dropdown & Actions */}
          <div className="w-full sm:w-auto flex items-center gap-2.5">
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

            <button
              onClick={exportCSV}
              className="admin-btn admin-btn-primary text-xs py-2 px-4 cursor-pointer"
            >
              ↓ Export CSV
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
          <table className="w-full text-left text-[13.5px]">
            <thead className="bg-[#FFFDFB] text-[11px] font-bold uppercase tracking-[0.06em] text-[rgba(41,16,11,0.44)] border-b border-[rgba(41,16,11,0.13)]">
              <tr>
                <th className="py-3 px-4">Ticket Ref</th>
                <th className="py-3 px-4">Experience</th>
                <th className="py-3 px-4">Lead Attendee</th>
                <th className="py-3 px-4">Phone</th>
                <th className="py-3 px-4 text-center">Guests</th>
                <th className="py-3 px-4 text-right">Amount</th>
                <th className="py-3 px-4 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[rgba(41,16,11,0.08)]">
              {filteredOrders.length === 0 ? (
                <tr>
                  <td
                    colSpan={7}
                    className="py-12 text-center text-[rgba(41,16,11,0.44)] text-sm"
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
                      className="hover:bg-[#F9EFE7]/40 transition-colors"
                    >
                      <td className="py-3.5 px-4 font-editorial-mono text-[12.5px] text-[#29100B]">
                        {order.order_ref}
                      </td>
                      <td className="py-3.5 px-4 max-w-[220px] truncate text-[#29100B]">
                        <b>{item?.listing?.title || "Community Tour"}</b>
                      </td>
                      <td className="py-3.5 px-4 text-[#29100B]">
                        <div>{order.customer_name}</div>
                        {order.emergency_contact && (
                          <div className="text-[12px] text-[rgba(41,16,11,0.44)]">
                            EC: {order.emergency_contact}
                          </div>
                        )}
                      </td>
                      <td className="py-3.5 px-4 font-editorial-mono text-[12.5px] text-[rgba(41,16,11,0.7)]">
                        {order.customer_phone}
                      </td>
                      <td className="py-3.5 px-4 text-center font-bold text-[#29100B]">
                        {item?.quantity || 1}
                      </td>
                      <td className="py-3.5 px-4 text-right font-bold text-[#29100B]">
                        {formatINR(order.total_amount_inr)}
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <span className="admin-pill admin-pill-line">
                          ● Confirmed
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
