import React, { useState, useMemo } from "react";
import { Order, Listing, FulfillmentStatus } from "../../types";
import { useData } from "../../context/DataContext";
import { formatINR, formatDate } from "../../lib/utils";
import { CourierLabel } from "./CourierLabel";
import {
  Package,
  Boxes,
  Plus,
  Printer,
  Search,
  Filter,
  CheckCircle,
  AlertTriangle,
  ArrowUpDown,
  Tag,
  Truck,
  Edit2,
  X,
  TrendingDown,
} from "lucide-react";

interface GoodsWorkspaceProps {
  orders: Order[];
  listings: Listing[];
}

export const GoodsWorkspace: React.FC<GoodsWorkspaceProps> = ({
  orders,
  listings,
}) => {
  const {
    updateOrderFulfillment,
    addListing,
    updateListing,
    restockListing,
    updateStockThreshold,
  } = useData();

  const [activeSubTab, setActiveSubTab] = useState<"orders" | "catalog" | "stock">("orders");
  const [selectedOrderForLabel, setSelectedOrderForLabel] = useState<Order | null>(null);

  // Orders State
  const [orderSearch, setOrderSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [editingAwbOrderId, setEditingAwbOrderId] = useState<string | null>(null);
  const [awbInput, setAwbInput] = useState("");

  // Product Catalog Modal State
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newPrice, setNewPrice] = useState("");
  const [newStock, setNewStock] = useState("25");
  const [newThreshold, setNewThreshold] = useState("5");
  const [newWeight, setNewWeight] = useState("500");
  const [newCollective, setNewCollective] = useState("");
  const [newSummary, setNewSummary] = useState("");
  const [newImage, setNewImage] = useState("");

  // Filter goods orders
  const goodsOrders = useMemo(() => {
    return orders.filter((o) =>
      o.items.some((item) => item.listing?.type === "product"),
    );
  }, [orders]);

  const filteredOrders = useMemo(() => {
    return goodsOrders.filter((order) => {
      const matchesSearch =
        order.order_ref.toLowerCase().includes(orderSearch.toLowerCase()) ||
        order.customer_name.toLowerCase().includes(orderSearch.toLowerCase()) ||
        order.customer_phone.includes(orderSearch) ||
        (order.shipping_address?.pincode &&
          order.shipping_address.pincode.includes(orderSearch));

      const matchesStatus =
        statusFilter === "all" || order.fulfillment_status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [goodsOrders, orderSearch, statusFilter]);

  // Physical goods listings
  const productListings = useMemo(() => {
    return listings.filter((l) => l.type === "product");
  }, [listings]);

  const handleSaveAwb = (orderId: string) => {
    updateOrderFulfillment(
      orderId,
      "shipped",
      "Blue Dart Express",
      awbInput.trim() || undefined,
    );
    setEditingAwbOrderId(null);
    setAwbInput("");
  };

  const handleCreateProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newPrice) return;

    addListing({
      title: newTitle.trim(),
      slug: newTitle.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-"),
      type: "product",
      pillar: "goods",
      category_id: "cat-goods",
      short_summary: newSummary.trim() || "Artisanal coastal produce",
      full_description: newSummary.trim() || "Authentic coastal pantry product prepared by local cooperatives.",
      price_inr: Number(newPrice) || 500,
      currency: "INR",
      stock_count: Number(newStock) || 0,
      low_stock_threshold: Number(newThreshold) || 5,
      weight_grams: Number(newWeight) || 500,
      artisan_collective: newCollective.trim() || "Koli Coastal Collective",
      images: [
        newImage.trim() ||
          "https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?auto=format&fit=crop&w=800&q=80",
      ],
      is_active: true,
      is_featured: false,
      host_name: newCollective.trim() || "Koli Collective",
    });

    setIsAddModalOpen(false);
    setNewTitle("");
    setNewPrice("");
    setNewStock("25");
    setNewThreshold("5");
    setNewWeight("500");
    setNewCollective("");
    setNewSummary("");
    setNewImage("");
  };

  return (
    <div className="space-y-6 text-[#f5edeb]">
      {/* Thermal Courier Label Modal */}
      {selectedOrderForLabel && (
        <CourierLabel
          order={selectedOrderForLabel}
          onClose={() => setSelectedOrderForLabel(null)}
        />
      )}

      {/* Add Product Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs">
          <div className="bg-[#29100b] border border-[#dab38c]/30 rounded-3xl max-w-lg w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-[#dab38c]/15">
              <div className="flex items-center gap-2">
                <Package className="w-5 h-5 text-[#e3a157]" />
                <h3 className="font-display font-bold text-base text-[#f5edeb]">
                  Add New Coastal Good
                </h3>
              </div>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="p-1.5 hover:bg-[#35160e] rounded-full text-[#dab38c] hover:text-[#f5edeb]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateProduct} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-[#dab38c] font-semibold mb-1">
                  Product Title *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Artisanal Sun-Dried Bombay Duck"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full px-3 py-2 bg-[#1f0b07] border border-[#dab38c]/30 rounded-xl text-[#f5edeb] outline-none focus:border-[#e3a157]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[#dab38c] font-semibold mb-1">
                    Price (INR) *
                  </label>
                  <input
                    type="number"
                    required
                    placeholder="450"
                    value={newPrice}
                    onChange={(e) => setNewPrice(e.target.value)}
                    className="w-full px-3 py-2 bg-[#1f0b07] border border-[#dab38c]/30 rounded-xl text-[#f5edeb] outline-none focus:border-[#e3a157]"
                  />
                </div>
                <div>
                  <label className="block text-[#dab38c] font-semibold mb-1">
                    Weight (grams)
                  </label>
                  <input
                    type="number"
                    placeholder="500"
                    value={newWeight}
                    onChange={(e) => setNewWeight(e.target.value)}
                    className="w-full px-3 py-2 bg-[#1f0b07] border border-[#dab38c]/30 rounded-xl text-[#f5edeb] outline-none focus:border-[#e3a157]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[#dab38c] font-semibold mb-1">
                    Initial Stock Count
                  </label>
                  <input
                    type="number"
                    value={newStock}
                    onChange={(e) => setNewStock(e.target.value)}
                    className="w-full px-3 py-2 bg-[#1f0b07] border border-[#dab38c]/30 rounded-xl text-[#f5edeb] outline-none focus:border-[#e3a157]"
                  />
                </div>
                <div>
                  <label className="block text-[#dab38c] font-semibold mb-1">
                    Low-Stock Threshold Alert
                  </label>
                  <input
                    type="number"
                    value={newThreshold}
                    onChange={(e) => setNewThreshold(e.target.value)}
                    className="w-full px-3 py-2 bg-[#1f0b07] border border-[#dab38c]/30 rounded-xl text-[#f5edeb] outline-none focus:border-[#e3a157]"
                    placeholder="5"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[#dab38c] font-semibold mb-1">
                  Artisan Collective / Maker
                </label>
                <input
                  type="text"
                  placeholder="e.g. Madh Island Mahila Bachat Gat"
                  value={newCollective}
                  onChange={(e) => setNewCollective(e.target.value)}
                  className="w-full px-3 py-2 bg-[#1f0b07] border border-[#dab38c]/30 rounded-xl text-[#f5edeb] outline-none focus:border-[#e3a157]"
                />
              </div>

              <div>
                <label className="block text-[#dab38c] font-semibold mb-1">
                  Short Description
                </label>
                <textarea
                  rows={2}
                  placeholder="Catch harvested at dawn, sun-cured using natural sea salt."
                  value={newSummary}
                  onChange={(e) => setNewSummary(e.target.value)}
                  className="w-full px-3 py-2 bg-[#1f0b07] border border-[#dab38c]/30 rounded-xl text-[#f5edeb] outline-none focus:border-[#e3a157]"
                />
              </div>

              <div>
                <label className="block text-[#dab38c] font-semibold mb-1">
                  Image URL (optional)
                </label>
                <input
                  type="url"
                  placeholder="https://..."
                  value={newImage}
                  onChange={(e) => setNewImage(e.target.value)}
                  className="w-full px-3 py-2 bg-[#1f0b07] border border-[#dab38c]/30 rounded-xl text-[#f5edeb] outline-none focus:border-[#e3a157]"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-[#dab38c]/15">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-[#dab38c] hover:bg-[#35160e]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#e3a157] hover:bg-[#dab38c] text-[#29100b] font-bold rounded-xl shadow-md"
                >
                  Create Product
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Sub-Tab Navigation Strip */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-2 border-b border-[#dab38c]/20">
        <div className="flex items-center gap-1.5 p-1 bg-[#35160e]/80 border border-[#dab38c]/20 rounded-2xl">
          <button
            onClick={() => setActiveSubTab("orders")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeSubTab === "orders"
                ? "bg-[#e3a157] text-[#29100b] shadow-md"
                : "text-[#dab38c] hover:text-[#f5edeb] hover:bg-[#481f14]"
            }`}
          >
            📦 Orders &amp; 4×6 Labels ({goodsOrders.length})
          </button>
          <button
            onClick={() => setActiveSubTab("catalog")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeSubTab === "catalog"
                ? "bg-[#e3a157] text-[#29100b] shadow-md"
                : "text-[#dab38c] hover:text-[#f5edeb] hover:bg-[#481f14]"
            }`}
          >
            🏷️ Product Catalog ({productListings.length})
          </button>
          <button
            onClick={() => setActiveSubTab("stock")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeSubTab === "stock"
                ? "bg-[#e3a157] text-[#29100b] shadow-md"
                : "text-[#dab38c] hover:text-[#f5edeb] hover:bg-[#481f14]"
            }`}
          >
            📊 Stock &amp; Alerts
          </button>
        </div>

        {activeSubTab === "catalog" && (
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="px-4 py-2 bg-[#e3a157] hover:bg-[#dab38c] text-[#29100b] font-bold text-xs rounded-xl shadow-md transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <Plus className="w-4 h-4 text-[#29100b]" />
            <span>Add New Product</span>
          </button>
        )}
      </div>

      {/* SUB-TAB 1: D2C Orders & 4x6 Thermal Shipping Labels */}
      {activeSubTab === "orders" && (
        <div className="space-y-4">
          {/* Filter Bar */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 text-[#dab38c]/60 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search by order ref, customer, phone, pincode..."
                value={orderSearch}
                onChange={(e) => setOrderSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-[#35160e]/80 border border-[#dab38c]/25 rounded-xl text-xs text-[#f5edeb] placeholder-[#dab38c]/50 outline-none focus:border-[#e3a157]"
              />
            </div>

            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-[#dab38c]" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2 bg-[#35160e]/80 border border-[#dab38c]/25 rounded-xl text-xs text-[#f5edeb] outline-none"
              >
                <option value="all">All Fulfillment Statuses</option>
                <option value="unfulfilled">Unfulfilled</option>
                <option value="processing">Processing</option>
                <option value="shipped">Shipped</option>
                <option value="delivered">Delivered</option>
              </select>
            </div>
          </div>

          {/* Orders Table */}
          <div className="bg-[#35160e]/90 border border-[#dab38c]/25 rounded-2xl overflow-hidden shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#29100b] text-[#dab38c] border-b border-[#dab38c]/15">
                  <tr>
                    <th className="py-3 px-4 font-semibold">Order Ref &amp; Date</th>
                    <th className="py-3 px-4 font-semibold">Customer &amp; Phone</th>
                    <th className="py-3 px-4 font-semibold">Delivery Address</th>
                    <th className="py-3 px-4 font-semibold">Goods Ordered</th>
                    <th className="py-3 px-4 font-semibold">Amount</th>
                    <th className="py-3 px-4 font-semibold">Fulfillment</th>
                    <th className="py-3 px-4 font-semibold text-right">Label &amp; AWB</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#dab38c]/10 text-[#f5edeb]">
                  {filteredOrders.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="text-center py-10 text-[#dab38c]/60">
                        No physical goods orders match the search criteria.
                      </td>
                    </tr>
                  ) : (
                    filteredOrders.map((order) => {
                      const shipping = order.shipping_address;
                      const productItems = order.items.filter(
                        (i) => i.listing?.type === "product",
                      );

                      return (
                        <tr
                          key={order.id}
                          className="hover:bg-[#481f14]/50 transition-colors"
                        >
                          <td className="py-3.5 px-4 font-mono font-medium">
                            <div>{order.order_ref}</div>
                            <div className="text-[10px] text-[#dab38c]/60 font-sans">
                              {formatDate(order.created_at)}
                            </div>
                          </td>

                          <td className="py-3.5 px-4">
                            <div className="font-semibold">{order.customer_name}</div>
                            <div className="text-[11px] text-[#dab38c]/80 font-mono">
                              {order.customer_phone}
                            </div>
                          </td>

                          <td className="py-3.5 px-4 max-w-[200px] truncate text-[11px] text-[#dab38c]">
                            {shipping ? (
                              <span>
                                {shipping.addressLine}, {shipping.city} –{" "}
                                <strong className="font-mono text-[#f5edeb]">
                                  {shipping.pincode}
                                </strong>
                              </span>
                            ) : (
                              <span className="text-[#dab38c]/50">No address recorded</span>
                            )}
                          </td>

                          <td className="py-3.5 px-4">
                            <div className="space-y-0.5 max-w-[220px]">
                              {productItems.map((item, idx) => (
                                <div key={idx} className="truncate text-[11px]">
                                  <span className="font-bold text-[#e3a157]">
                                    {item.quantity}x
                                  </span>{" "}
                                  <span>{item.listing?.title || "Item"}</span>
                                </div>
                              ))}
                            </div>
                          </td>

                          <td className="py-3.5 px-4 font-mono font-bold text-[#e3a157]">
                            {formatINR(order.total_amount_inr)}
                          </td>

                          <td className="py-3.5 px-4">
                            <select
                              value={order.fulfillment_status || "unfulfilled"}
                              onChange={(e) =>
                                updateOrderFulfillment(
                                  order.id,
                                  e.target.value as FulfillmentStatus,
                                )
                              }
                              className={`px-2 py-1 rounded-lg text-[11px] font-bold outline-none border cursor-pointer ${
                                order.fulfillment_status === "delivered"
                                  ? "bg-emerald-900/50 text-emerald-300 border-emerald-500/40"
                                  : order.fulfillment_status === "shipped"
                                    ? "bg-sky-900/50 text-sky-300 border-sky-500/40"
                                    : order.fulfillment_status === "processing"
                                      ? "bg-amber-900/50 text-amber-300 border-amber-500/40"
                                      : "bg-[#29100b] text-[#dab38c] border-[#dab38c]/30"
                              }`}
                            >
                              <option value="unfulfilled">Unfulfilled</option>
                              <option value="processing">Processing</option>
                              <option value="shipped">Shipped</option>
                              <option value="delivered">Delivered</option>
                            </select>
                          </td>

                          <td className="py-3.5 px-4 text-right">
                            <div className="flex flex-col items-end gap-1.5">
                              <button
                                onClick={() => setSelectedOrderForLabel(order)}
                                className="px-3 py-1 bg-[#e3a157] hover:bg-[#dab38c] text-[#29100b] font-bold text-[11px] rounded-lg shadow-sm transition-all flex items-center gap-1 cursor-pointer"
                              >
                                <Printer className="w-3.5 h-3.5" />
                                <span>Print 4×6" Label</span>
                              </button>

                              {editingAwbOrderId === order.id ? (
                                <div className="flex items-center gap-1 mt-1">
                                  <input
                                    type="text"
                                    placeholder="Enter AWB"
                                    value={awbInput}
                                    onChange={(e) => setAwbInput(e.target.value)}
                                    className="px-2 py-0.5 bg-[#1f0b07] border border-[#dab38c]/40 rounded text-[10px] w-24 text-[#f5edeb] font-mono outline-none"
                                  />
                                  <button
                                    onClick={() => handleSaveAwb(order.id)}
                                    className="px-1.5 py-0.5 bg-emerald-600 text-white rounded text-[10px] font-bold"
                                  >
                                    Save
                                  </button>
                                </div>
                              ) : (
                                <button
                                  onClick={() => {
                                    setEditingAwbOrderId(order.id);
                                    setAwbInput(order.tracking_awb || "");
                                  }}
                                  className="text-[10px] text-[#dab38c]/70 hover:text-[#e3a157] underline font-mono cursor-pointer"
                                >
                                  {order.tracking_awb
                                    ? `AWB: ${order.tracking_awb}`
                                    : "+ Add AWB"}
                                </button>
                              )}
                            </div>
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
      )}

      {/* SUB-TAB 2: Product Catalog & Add/Edit */}
      {activeSubTab === "catalog" && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {productListings.map((product) => {
            const isLowStock =
              (product.stock_count ?? 0) <= (product.low_stock_threshold ?? 5);

            return (
              <div
                key={product.id}
                className="bg-[#35160e]/90 border border-[#dab38c]/25 rounded-2xl p-4 flex flex-col justify-between shadow-xl space-y-3"
              >
                <div className="space-y-2">
                  <div className="relative h-36 rounded-xl overflow-hidden border border-[#dab38c]/20">
                    <img
                      src={product.images[0] || "https://images.unsplash.com/photo-1534422298391-e4f8c172dddb"}
                      alt={product.title}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-2 right-2 flex gap-1">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          product.is_active
                            ? "bg-emerald-950/80 text-emerald-400 border border-emerald-500/40"
                            : "bg-neutral-900/80 text-neutral-400"
                        }`}
                      >
                        {product.is_active ? "● Live" : "Draft"}
                      </span>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-display font-bold text-base text-[#f5edeb] leading-snug">
                      {product.title}
                    </h4>
                    <p className="text-xs text-[#dab38c]/80 line-clamp-2 mt-0.5">
                      {product.short_summary}
                    </p>
                  </div>
                </div>

                <div className="space-y-3 pt-2 border-t border-[#dab38c]/15 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-base font-bold text-[#e3a157]">
                      {formatINR(product.price_inr)}
                    </span>
                    <span className="text-[11px] text-[#dab38c]">
                      {product.weight_grams ? `${product.weight_grams}g` : "Standard pack"}
                    </span>
                  </div>

                  <div className="flex items-center justify-between p-2 rounded-xl bg-[#29100b] border border-[#dab38c]/20">
                    <span className="text-[11px] text-[#dab38c]">In Stock:</span>
                    <span
                      className={`font-mono font-bold text-xs ${
                        isLowStock ? "text-rose-400 flex items-center gap-1" : "text-emerald-400"
                      }`}
                    >
                      {isLowStock && <AlertTriangle className="w-3.5 h-3.5" />}
                      {product.stock_count ?? 0} units
                    </span>
                  </div>

                  <div className="flex items-center justify-between gap-2 pt-1">
                    <button
                      onClick={() =>
                        updateListing(product.id, { is_active: !product.is_active })
                      }
                      className="text-[11px] text-[#dab38c] hover:text-[#f5edeb] underline cursor-pointer"
                    >
                      {product.is_active ? "Deactivate" : "Activate"}
                    </button>
                    <button
                      onClick={() => restockListing(product.id, 10)}
                      className="px-3 py-1 bg-[#35160e] hover:bg-[#481f14] border border-[#e3a157]/40 text-[#e3a157] font-bold rounded-lg text-[11px] cursor-pointer"
                    >
                      +10 Restock
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* SUB-TAB 3: Stock Management & Custom Threshold Alerts */}
      {activeSubTab === "stock" && (
        <div className="space-y-4">
          <div className="p-4 bg-[#35160e]/80 border border-[#dab38c]/25 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div>
              <h4 className="font-display font-bold text-sm text-[#f5edeb]">
                Inventory Restocking &amp; Low-Stock Thresholds
              </h4>
              <p className="text-xs text-[#dab38c]">
                Set custom alert thresholds per item. Items falling below their threshold appear in the top-bar Operations Inbox.
              </p>
            </div>
          </div>

          <div className="bg-[#35160e]/90 border border-[#dab38c]/25 rounded-2xl overflow-hidden shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#29100b] text-[#dab38c] border-b border-[#dab38c]/15">
                  <tr>
                    <th className="py-3 px-4 font-semibold">Product Name</th>
                    <th className="py-3 px-4 font-semibold">Artisan Collective</th>
                    <th className="py-3 px-4 font-semibold">Current Stock</th>
                    <th className="py-3 px-4 font-semibold">Alert Threshold</th>
                    <th className="py-3 px-4 font-semibold">Status</th>
                    <th className="py-3 px-4 font-semibold text-right">Quick Restock</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#dab38c]/10 text-[#f5edeb]">
                  {productListings.map((product) => {
                    const threshold = product.low_stock_threshold ?? 5;
                    const stock = product.stock_count ?? 0;
                    const isCritical = stock === 0;
                    const isLow = stock <= threshold && !isCritical;

                    return (
                      <tr
                        key={product.id}
                        className={`transition-colors ${
                          isCritical
                            ? "bg-rose-950/20"
                            : isLow
                              ? "bg-amber-950/20"
                              : "hover:bg-[#481f14]/40"
                        }`}
                      >
                        <td className="py-3 px-4 font-medium">
                          <div className="font-semibold text-sm">{product.title}</div>
                          <div className="text-[10px] text-[#dab38c]/60 font-mono">
                            {formatINR(product.price_inr)} · {product.weight_grams}g
                          </div>
                        </td>

                        <td className="py-3 px-4 text-[#dab38c]">
                          {product.artisan_collective || "Koli Collective"}
                        </td>

                        <td className="py-3 px-4 font-mono font-bold text-sm">
                          <span
                            className={
                              isCritical
                                ? "text-rose-400"
                                : isLow
                                  ? "text-amber-400"
                                  : "text-emerald-400"
                            }
                          >
                            {stock} units
                          </span>
                        </td>

                        <td className="py-3 px-4">
                          <div className="flex items-center gap-1.5">
                            <span className="text-[11px] text-[#dab38c]">≤</span>
                            <input
                              type="number"
                              min="1"
                              max="100"
                              value={threshold}
                              onChange={(e) =>
                                updateStockThreshold(product.id, Number(e.target.value))
                              }
                              className="w-14 px-2 py-1 bg-[#1f0b07] border border-[#dab38c]/30 rounded-lg text-xs text-[#f5edeb] font-mono outline-none text-center"
                            />
                            <span className="text-[10px] text-[#dab38c]/60">units</span>
                          </div>
                        </td>

                        <td className="py-3 px-4">
                          {isCritical ? (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-rose-900/60 text-rose-300 border border-rose-500/40 text-[10px] font-bold">
                              <AlertTriangle className="w-3 h-3" />
                              Out of Stock
                            </span>
                          ) : isLow ? (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-900/60 text-amber-300 border border-amber-500/40 text-[10px] font-bold">
                              <TrendingDown className="w-3 h-3" />
                              Low Stock
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-900/60 text-emerald-300 border border-emerald-500/40 text-[10px] font-bold">
                              <CheckCircle className="w-3 h-3" />
                              Healthy
                            </span>
                          )}
                        </td>

                        <td className="py-3 px-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => restockListing(product.id, 5)}
                              className="px-2.5 py-1 bg-[#35160e] hover:bg-[#481f14] border border-[#dab38c]/30 rounded-lg text-xs text-[#dab38c] hover:text-[#f5edeb] font-mono cursor-pointer"
                            >
                              +5
                            </button>
                            <button
                              onClick={() => restockListing(product.id, 15)}
                              className="px-2.5 py-1 bg-[#35160e] hover:bg-[#481f14] border border-[#dab38c]/30 rounded-lg text-xs text-[#dab38c] hover:text-[#f5edeb] font-mono cursor-pointer"
                            >
                              +15
                            </button>
                            <button
                              onClick={() => restockListing(product.id, 50)}
                              className="px-2.5 py-1 bg-[#e3a157] hover:bg-[#dab38c] text-[#29100b] rounded-lg text-xs font-bold font-mono cursor-pointer shadow-xs"
                            >
                              +50
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
