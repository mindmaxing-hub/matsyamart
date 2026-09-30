import React, { useState } from "react";
import {
  Package,
  Truck,
  CheckCircle,
  Clock,
  MapPin,
  Phone,
  Search,
  Download,
  AlertCircle,
  ExternalLink,
} from "lucide-react";
import { Order, Listing, FulfillmentStatus } from "../../types";
import { formatINR, formatDate } from "../../lib/utils";

interface ProductOrdersTableProps {
  orders: Order[];
  listings: Listing[];
  onUpdateFulfillment: (
    orderId: string,
    status: FulfillmentStatus,
    courier?: string,
    awb?: string,
  ) => void;
}

export const ProductOrdersTable: React.FC<ProductOrdersTableProps> = ({
  orders,
  listings,
  onUpdateFulfillment,
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [editingOrderId, setEditingOrderId] = useState<string | null>(null);
  const [courierInput, setCourierInput] = useState("");
  const [awbInput, setAwbInput] = useState("");

  // Filter orders that contain at least one physical product
  const productOrders = orders.filter((order) =>
    order.items.some(
      (item) =>
        item.listing?.type === "product" ||
        item.listing?.pillar === "goods" ||
        Boolean(order.shipping_address),
    ),
  );

  const filteredOrders = productOrders.filter((order) => {
    // Status filter
    const status = order.fulfillment_status || "unfulfilled";
    if (statusFilter !== "all" && status !== statusFilter) {
      return false;
    }

    // Search query
    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      const inRef = order.order_ref.toLowerCase().includes(q);
      const inName = order.customer_name.toLowerCase().includes(q);
      const inPhone = order.customer_phone.toLowerCase().includes(q);
      const inCity =
        order.shipping_address?.city.toLowerCase().includes(q) || false;
      const inPincode =
        order.shipping_address?.pincode.toLowerCase().includes(q) || false;
      if (!inRef && !inName && !inPhone && !inCity && !inPincode) return false;
    }

    return true;
  });

  const totalGoodsRevenue = filteredOrders.reduce(
    (sum, o) => sum + o.total_amount_inr,
    0,
  );

  const pendingCount = productOrders.filter(
    (o) => !o.fulfillment_status || o.fulfillment_status === "unfulfilled",
  ).length;

  const shippedCount = productOrders.filter(
    (o) => o.fulfillment_status === "shipped",
  ).length;

  const deliveredCount = productOrders.filter(
    (o) => o.fulfillment_status === "delivered",
  ).length;

  const handleStartEdit = (order: Order) => {
    setEditingOrderId(order.id);
    setCourierInput(order.courier_partner || "Blue Dart Express");
    setAwbInput(order.tracking_awb || "");
  };

  const handleSaveTracking = (
    orderId: string,
    currentStatus?: FulfillmentStatus,
  ) => {
    const nextStatus =
      currentStatus === "unfulfilled" ? "shipped" : currentStatus || "shipped";
    onUpdateFulfillment(orderId, nextStatus, courierInput, awbInput);
    setEditingOrderId(null);
  };

  const exportFulfillmentCSV = () => {
    const headers = [
      "Order Ref",
      "Date",
      "Customer Name",
      "Phone",
      "Address",
      "City",
      "State",
      "Pincode",
      "Items",
      "Total INR",
      "Fulfillment Status",
      "Courier",
      "AWB Tracking",
    ];

    const rows = filteredOrders.map((o) => {
      const itemDesc = o.items
        .map((i) => `${i.quantity}x ${i.listing?.title || "Product"}`)
        .join("; ");
      const addr = o.shipping_address
        ? `"${o.shipping_address.addressLine}, ${o.shipping_address.landmark || ""}"`
        : "N/A";
      return [
        o.order_ref,
        new Date(o.created_at).toLocaleDateString(),
        `"${o.customer_name}"`,
        `"${o.customer_phone}"`,
        addr,
        `"${o.shipping_address?.city || ""}"`,
        `"${o.shipping_address?.state || ""}"`,
        `"${o.shipping_address?.pincode || ""}"`,
        `"${itemDesc}"`,
        o.total_amount_inr,
        o.fulfillment_status || "unfulfilled",
        `"${o.courier_partner || ""}"`,
        `"${o.tracking_awb || ""}"`,
      ].join(",");
    });

    const csvContent =
      "data:text/csv;charset=utf-8," + [headers.join(","), ...rows].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute(
      "download",
      `MatsyaMart_D2C_Fulfillment_${new Date().toISOString().split("T")[0]}.csv`,
    );
    document.body.appendChild(link);
    link.click();
    link.remove();
  };

  return (
    <div className="space-y-4">
      {/* Top Metrics Banner */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="p-5 rounded-[16px] bg-[#FFFDFB] border border-[rgba(41,16,11,0.08)] shadow-[0_1px_2px_rgba(41,16,11,0.05),0_8px_28px_-12px_rgba(41,16,11,0.14)]">
          <div className="text-[11px] font-bold tracking-[0.06em] uppercase text-[rgba(41,16,11,0.64)]">
            Total D2C orders
          </div>
          <div className="font-editorial text-[36px] tracking-[-0.02em] leading-[1.1] my-1.5 text-[#29100B]">
            {productOrders.length}
          </div>
          <div className="text-[13px] text-[rgba(41,16,11,0.44)]">
            Merchandise &amp; pantry
          </div>
        </div>

        <div className="p-5 rounded-[16px] bg-[#FFFDFB] border border-[rgba(41,16,11,0.08)] shadow-[0_1px_2px_rgba(41,16,11,0.05),0_8px_28px_-12px_rgba(41,16,11,0.14)]">
          <div className="text-[11px] font-bold tracking-[0.06em] uppercase text-[rgba(41,16,11,0.64)]">
            Pending packing
          </div>
          <div className="font-editorial text-[36px] tracking-[-0.02em] leading-[1.1] my-1.5 text-[#29100B]">
            {pendingCount}
          </div>
          <div className="text-[13px] text-[rgba(41,16,11,0.44)]">
            Needs label &amp; dispatch
          </div>
        </div>

        <div className="p-5 rounded-[16px] bg-[#FFFDFB] border border-[rgba(41,16,11,0.08)] shadow-[0_1px_2px_rgba(41,16,11,0.05),0_8px_28px_-12px_rgba(41,16,11,0.14)]">
          <div className="text-[11px] font-bold tracking-[0.06em] uppercase text-[rgba(41,16,11,0.64)]">
            In transit
          </div>
          <div className="font-editorial text-[36px] tracking-[-0.02em] leading-[1.1] my-1.5 text-[#29100B]">
            {shippedCount}
          </div>
          <div className="text-[13px] text-[rgba(41,16,11,0.44)]">
            With tracking AWB
          </div>
        </div>

        <div className="p-5 rounded-[16px] bg-[#FFFDFB] border border-[rgba(41,16,11,0.08)] shadow-[0_1px_2px_rgba(41,16,11,0.05),0_8px_28px_-12px_rgba(41,16,11,0.14)] relative shadow-[inset_3px_0_0_#E3A157]">
          <div className="text-[11px] font-bold tracking-[0.06em] uppercase text-[rgba(41,16,11,0.64)]">
            Goods revenue
          </div>
          <div className="font-editorial text-[36px] tracking-[-0.02em] leading-[1.1] my-1.5 text-[#29100B]">
            {formatINR(totalGoodsRevenue)}
          </div>
          <div className="text-[13px] text-[rgba(41,16,11,0.44)]">
            Direct to cooperatives
          </div>
          <div className="absolute top-4 right-4 w-[26px] h-[26px] rounded-full bg-[rgba(227,161,87,0.14)] flex items-center justify-center text-[#C67F2A] font-bold text-xs">
            ↗
          </div>
        </div>
      </div>

      {/* Filter and Export Bar */}
      <div className="admin-card p-4">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 flex-1">
            {/* Search */}
            <div className="admin-search flex-1">
              <span>⌕</span>
              <input
                type="text"
                placeholder="Search by customer name, order ref, phone, city, or pincode…"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="admin-select text-xs py-2 px-3.5"
            >
              <option value="all">All Fulfillment Statuses</option>
              <option value="unfulfilled">Unfulfilled / Pending</option>
              <option value="processing">Processing</option>
              <option value="shipped">Shipped / In Transit</option>
              <option value="delivered">Delivered</option>
            </select>
          </div>

          {/* CSV Export */}
          <button
            onClick={exportFulfillmentCSV}
            className="admin-btn text-xs py-2 px-4 cursor-pointer"
          >
            <span>↓ Shipping manifest format</span>
          </button>
        </div>
      </div>

      {/* Orders Table or Empty State matching HTML */}
      <div className="admin-card overflow-hidden">
        {filteredOrders.length === 0 ? (
          <div className="p-14 text-center text-[rgba(41,16,11,0.44)] space-y-2">
            <div className="font-editorial text-[26px] text-[rgba(41,16,11,0.64)]">
              All caught up — nothing to pack.
            </div>
            <div className="text-[14px]">
              New pantry orders will land here with labels, AWBs and payout
              splits pre-filled.
            </div>
            <div className="pt-3">
              <button
                onClick={exportFulfillmentCSV}
                className="admin-btn text-xs py-2 px-4 cursor-pointer"
              >
                ↓ Shipping manifest format
              </button>
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="bg-slate-50 text-slate-500 font-bold text-[10px] uppercase tracking-wider border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">Order Ref & Date</th>
                  <th className="py-3 px-4">Customer & Phone</th>
                  <th className="py-3 px-4">Delivery Address</th>
                  <th className="py-3 px-4">Artisan Goods Items</th>
                  <th className="py-3 px-4">Total</th>
                  <th className="py-3 px-4">Fulfillment Status</th>
                  <th className="py-3 px-4 text-right">Courier & Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {filteredOrders.map((order) => {
                  const currentStatus =
                    order.fulfillment_status || "unfulfilled";
                  const isEditing = editingOrderId === order.id;

                  return (
                    <tr
                      key={order.id}
                      className="hover:bg-slate-50/80 transition-colors"
                    >
                      {/* Ref & Date */}
                      <td className="py-3.5 px-4 align-top">
                        <div className="font-mono font-bold text-slate-900">
                          {order.order_ref}
                        </div>
                        <div className="text-[10px] text-slate-400 mt-0.5">
                          {formatDate(order.created_at)}
                        </div>
                      </td>

                      {/* Customer & Phone */}
                      <td className="py-3.5 px-4 align-top">
                        <div className="font-semibold text-slate-900">
                          {order.customer_name}
                        </div>
                        <div className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5">
                          <Phone className="w-3 h-3 text-slate-400" />
                          <span>{order.customer_phone}</span>
                        </div>
                      </td>

                      {/* Shipping Address */}
                      <td className="py-3.5 px-4 align-top max-w-xs">
                        {order.shipping_address ? (
                          <div className="space-y-0.5">
                            <div className="text-slate-800 text-[11px] leading-snug">
                              {order.shipping_address.addressLine}
                              {order.shipping_address.landmark && (
                                <span className="text-slate-400">
                                  {" "}
                                  ({order.shipping_address.landmark})
                                </span>
                              )}
                            </div>
                            <div className="text-[10px] text-slate-400">
                              {order.shipping_address.city},{" "}
                              {order.shipping_address.state} -{" "}
                              {order.shipping_address.pincode}
                            </div>
                          </div>
                        ) : (
                          <span className="text-rose-600 text-[11px]">
                            No address provided
                          </span>
                        )}
                      </td>

                      {/* Goods Items */}
                      <td className="py-3.5 px-4 align-top">
                        <div className="space-y-1">
                          {order.items.map((item) => (
                            <div key={item.id} className="text-[11px]">
                              <span className="font-bold text-slate-900">
                                {item.quantity}x
                              </span>{" "}
                              <span className="text-slate-800">
                                {item.listing?.title || "Artisan Catch"}
                              </span>
                              {item.listing?.artisan_collective && (
                                <div className="text-[10px] text-slate-400">
                                  by {item.listing.artisan_collective}
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </td>

                      {/* Total */}
                      <td className="py-3.5 px-4 align-top font-bold text-slate-900">
                        {formatINR(order.total_amount_inr)}
                      </td>

                      {/* Fulfillment Status Selector */}
                      <td className="py-3.5 px-4 align-top">
                        <select
                          value={currentStatus}
                          onChange={(e) =>
                            onUpdateFulfillment(
                              order.id,
                              e.target.value as FulfillmentStatus,
                              order.courier_partner,
                              order.tracking_awb,
                            )
                          }
                          className={`text-[11px] font-semibold rounded-lg px-2.5 py-1 border outline-none cursor-pointer ${
                            currentStatus === "delivered"
                              ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                              : currentStatus === "shipped"
                                ? "bg-sky-50 text-sky-700 border-sky-200"
                                : currentStatus === "processing"
                                  ? "bg-amber-50 text-amber-700 border-amber-200"
                                  : "bg-rose-50 text-rose-700 border-rose-200"
                          }`}
                        >
                          <option value="unfulfilled">Unfulfilled</option>
                          <option value="processing">Processing</option>
                          <option value="shipped">Shipped</option>
                          <option value="delivered">Delivered</option>
                        </select>
                      </td>

                      {/* Courier & Tracking Edit */}
                      <td className="py-3.5 px-4 align-top text-right">
                        {isEditing ? (
                          <div className="space-y-1.5 inline-block text-left bg-slate-50 p-2.5 rounded-xl border border-slate-200 shadow-xs">
                            <input
                              type="text"
                              placeholder="Courier (e.g. Blue Dart)"
                              value={courierInput}
                              onChange={(e) => setCourierInput(e.target.value)}
                              className="w-36 text-[10px] px-2 py-1 bg-white text-slate-900 border border-slate-200 rounded outline-none"
                            />
                            <input
                              type="text"
                              placeholder="AWB / Tracking Number"
                              value={awbInput}
                              onChange={(e) => setAwbInput(e.target.value)}
                              className="w-36 text-[10px] px-2 py-1 bg-white text-slate-900 border border-slate-200 rounded outline-none"
                            />
                            <div className="flex items-center justify-end gap-1.5 pt-1">
                              <button
                                onClick={() => setEditingOrderId(null)}
                                className="px-2 py-0.5 text-[10px] text-slate-500 hover:text-slate-800"
                              >
                                Cancel
                              </button>
                              <button
                                onClick={() =>
                                  handleSaveTracking(
                                    order.id,
                                    order.fulfillment_status,
                                  )
                                }
                                className="px-2 py-0.5 text-[10px] font-bold bg-[#e3a157] hover:bg-[#d97706] text-slate-950 rounded shadow-xs"
                              >
                                Save
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div className="space-y-1">
                            {order.tracking_awb ? (
                              <div className="text-[11px] text-slate-800">
                                <span className="text-slate-400">
                                  {order.courier_partner || "Courier"}:
                                </span>{" "}
                                <span className="font-mono font-bold text-slate-900">
                                  {order.tracking_awb}
                                </span>
                              </div>
                            ) : (
                              <div className="text-[10px] text-slate-400">
                                No tracking added
                              </div>
                            )}
                            <button
                              onClick={() => handleStartEdit(order)}
                              className="text-[10px] text-amber-700 hover:text-amber-800 font-medium hover:underline cursor-pointer"
                            >
                              {order.tracking_awb
                                ? "Edit Tracking"
                                : "+ Add Courier AWB"}
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
