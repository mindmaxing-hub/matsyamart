import React, { useState, useMemo } from "react";
import {
  Package,
  AlertTriangle,
  Plus,
  RefreshCw,
  FileSpreadsheet,
  Calendar,
  Tag,
  CheckCircle2,
  ShieldCheck,
  Search,
} from "lucide-react";
import { Listing, InventoryBatchItem } from "../../types";
import { formatINR } from "../../lib/utils";

interface InventoryStockManagerProps {
  listings: Listing[];
}

const SEED_INVENTORY_BATCHES: InventoryBatchItem[] = [
  {
    id: "batch-01",
    listing_id: "prod-01", // Sun-Dried Jawla
    lot_number: "MM-JW-2026-SEP02",
    packaging_date: "2026-09-18",
    best_before_date: "2027-03-18",
    stock_units: 42,
    min_threshold: 10,
    unit_weight_grams: 250,
    fssai_license_ref: "FSSAI #21526019000412",
  },
  {
    id: "batch-02",
    listing_id: "prod-02", // Coastal Lal Masala
    lot_number: "MM-LM-2026-SEP08",
    packaging_date: "2026-09-20",
    best_before_date: "2027-09-20",
    stock_units: 4, // Low stock!
    min_threshold: 10,
    unit_weight_grams: 500,
    fssai_license_ref: "FSSAI #21526019000412",
  },
  {
    id: "batch-03",
    listing_id: "prod-03", // Bombil Fillets
    lot_number: "MM-BD-2026-SEP01",
    packaging_date: "2026-09-15",
    best_before_date: "2026-12-15",
    stock_units: 18,
    min_threshold: 8,
    unit_weight_grams: 300,
    fssai_license_ref: "FSSAI #21526019000412",
  },
  {
    id: "batch-04",
    listing_id: "prod-04", // Black Pomfret Pickle
    lot_number: "MM-PP-2026-AUG28",
    packaging_date: "2026-08-28",
    best_before_date: "2027-02-28",
    stock_units: 0, // Out of stock!
    min_threshold: 6,
    unit_weight_grams: 350,
    fssai_license_ref: "FSSAI #21526019000412",
  },
  {
    id: "batch-05",
    listing_id: "prod-05", // Kokum Butter
    lot_number: "MM-KB-2026-SEP12",
    packaging_date: "2026-09-12",
    best_before_date: "2027-09-12",
    stock_units: 25,
    min_threshold: 5,
    unit_weight_grams: 150,
    fssai_license_ref: "FSSAI #21526019000412",
  },
];

export const InventoryStockManager: React.FC<InventoryStockManagerProps> = ({
  listings,
}) => {
  const productListings = useMemo(() => {
    return listings.filter(
      (l) =>
        l.type === "product" || l.pillar === "goods" || Boolean(l.stock_count),
    );
  }, [listings]);

  const [batches, setBatches] = useState<InventoryBatchItem[]>(() => {
    try {
      const saved = localStorage.getItem("matsyamart_inventory_batches_v1");
      return saved ? JSON.parse(saved) : SEED_INVENTORY_BATCHES;
    } catch {
      return SEED_INVENTORY_BATCHES;
    }
  });

  const [searchTerm, setSearchTerm] = useState("");
  const [stockFilter, setStockFilter] = useState<string>("all");
  const [notification, setNotification] = useState<string>("");

  const saveBatches = (newBatches: InventoryBatchItem[]) => {
    setBatches(newBatches);
    try {
      localStorage.setItem(
        "matsyamart_inventory_batches_v1",
        JSON.stringify(newBatches),
      );
    } catch (e) {
      console.warn("Storage error", e);
    }
  };

  const handleAdjustStock = (batchId: string, delta: number) => {
    const updated = batches.map((b) => {
      if (b.id === batchId) {
        const nextUnits = Math.max(0, b.stock_units + delta);
        return { ...b, stock_units: nextUnits };
      }
      return b;
    });
    saveBatches(updated);
    setNotification(
      `Updated inventory: ${delta > 0 ? `+${delta}` : delta} units recorded.`,
    );
    setTimeout(() => setNotification(""), 3000);
  };

  const handleSetStockDirect = (batchId: string, units: number) => {
    const val = Math.max(0, isNaN(units) ? 0 : units);
    const updated = batches.map((b) =>
      b.id === batchId ? { ...b, stock_units: val } : b,
    );
    saveBatches(updated);
  };

  // Metrics
  const totalStockUnits = batches.reduce((sum, b) => sum + b.stock_units, 0);
  const lowStockCount = batches.filter(
    (b) => b.stock_units > 0 && b.stock_units <= b.min_threshold,
  ).length;
  const outOfStockCount = batches.filter((b) => b.stock_units === 0).length;

  const filteredItems = productListings
    .map((listing, index) => {
      const batch =
        batches.find((b) => b.listing_id === listing.id) ||
        batches[index % batches.length]!;
      return { listing, batch };
    })
    .filter(({ listing, batch }) => {
      if (
        stockFilter === "low" &&
        (batch.stock_units === 0 || batch.stock_units > batch.min_threshold)
      ) {
        return false;
      }
      if (stockFilter === "out" && batch.stock_units > 0) {
        return false;
      }
      if (stockFilter === "in" && batch.stock_units <= batch.min_threshold) {
        return false;
      }

      if (searchTerm.trim()) {
        const q = searchTerm.toLowerCase();
        const inTitle = listing.title.toLowerCase().includes(q);
        const inLot = batch.lot_number.toLowerCase().includes(q);
        const inCollective = (listing.artisan_collective || "")
          .toLowerCase()
          .includes(q);
        if (!inTitle && !inLot && !inCollective) return false;
      }
      return true;
    });

  const exportInventoryCSV = () => {
    const headers = [
      "Product Name",
      "Lot Number",
      "Artisan Collective",
      "Stock Units",
      "Threshold",
      "Weight (g)",
      "Packaging Date",
      "Best Before Date",
      "Status",
    ];

    const rows = filteredItems.map(({ listing, batch }) => {
      const status =
        batch.stock_units === 0
          ? "OUT_OF_STOCK"
          : batch.stock_units <= batch.min_threshold
            ? "LOW_STOCK"
            : "IN_STOCK";

      return [
        `"${listing.title}"`,
        batch.lot_number,
        `"${listing.artisan_collective || "Koli Collective"}"`,
        batch.stock_units,
        batch.min_threshold,
        batch.unit_weight_grams,
        batch.packaging_date,
        batch.best_before_date,
        status,
      ].join(",");
    });

    const csvContent =
      "data:text/csv;charset=utf-8," + [headers.join(","), ...rows].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute(
      "download",
      `MatsyaMart_Pantry_Inventory_${new Date().toISOString().split("T")[0]}.csv`,
    );
    document.body.appendChild(link);
    link.click();
    link.remove();
  };

  return (
    <div className="space-y-6">
      {/* 4 KPI Stock Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-500">
            <span>Total Physical SKUs</span>
            <Package className="w-4 h-4 text-[#e3a157]" />
          </div>
          <div className="font-display font-bold text-2xl text-slate-900">
            {productListings.length}
          </div>
          <div className="text-[11px] text-slate-400">
            Cataloged artisan goods
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-500">
            <span>In-Stock Inventory</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="font-display font-bold text-2xl text-emerald-600">
            {totalStockUnits} Units
          </div>
          <div className="text-[11px] text-slate-400">
            Ready in village hubs
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-500">
            <span>Low Stock Warnings</span>
            <AlertTriangle className="w-4 h-4 text-amber-600" />
          </div>
          <div className="font-display font-bold text-2xl text-amber-600">
            {lowStockCount} SKUs
          </div>
          <div className="text-[11px] text-slate-400">
            Below replenishment threshold
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-500">
            <span>Out of Stock</span>
            <AlertTriangle className="w-4 h-4 text-rose-500" />
          </div>
          <div className="font-display font-bold text-2xl text-rose-600">
            {outOfStockCount} SKUs
          </div>
          <div className="text-[11px] text-slate-400">
            Ordering disabled automatically
          </div>
        </div>
      </div>

      {notification && (
        <div className="p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-xl flex items-center gap-2 shadow-xs">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{notification}</span>
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
              placeholder="Search product title, batch lot number, or collective..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full text-xs pl-9 pr-3 py-2 bg-white text-slate-900 border border-slate-200 rounded-xl outline-none focus:border-slate-900 shadow-xs"
            />
          </div>

          {/* Stock Filter */}
          <select
            value={stockFilter}
            onChange={(e) => setStockFilter(e.target.value)}
            className="text-xs bg-white text-slate-900 border border-slate-200 rounded-xl px-3 py-2 outline-none focus:border-slate-900 shadow-xs"
          >
            <option value="all">All Inventory Statuses</option>
            <option value="in">Normal In-Stock</option>
            <option value="low">Low Stock Alerts Only</option>
            <option value="out">Out of Stock Only</option>
          </select>
        </div>

        {/* CSV Export */}
        <button
          onClick={exportInventoryCSV}
          className="px-4 py-2 rounded-xl bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-xs"
        >
          <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
          <span>Export Stock CSV</span>
        </button>
      </div>

      {/* Inventory & Freshness Batch Table */}
      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-slate-50 text-slate-500 font-bold text-[10px] uppercase tracking-wider border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">Artisan Pantry Product</th>
                <th className="py-3 px-4">Lot # & FSSAI</th>
                <th className="py-3 px-4">Packaged Date</th>
                <th className="py-3 px-4">Best Before</th>
                <th className="py-3 px-4 text-center">Current Stock</th>
                <th className="py-3 px-4 text-center">Status</th>
                <th className="py-3 px-4 text-right">
                  Quick Restock Allocation
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {filteredItems.map(({ listing, batch }) => {
                const isOutOfStock = batch.stock_units === 0;
                const isLowStock =
                  batch.stock_units > 0 &&
                  batch.stock_units <= batch.min_threshold;

                return (
                  <tr
                    key={listing.id}
                    className="hover:bg-slate-50/80 transition-colors"
                  >
                    {/* Product & Collective */}
                    <td className="py-3.5 px-4 align-middle">
                      <div className="flex items-center gap-3">
                        <img
                          src={listing.images[0]}
                          alt={listing.title}
                          className="w-10 h-10 rounded-lg object-cover border border-slate-200 shrink-0"
                        />
                        <div>
                          <div className="font-semibold text-slate-900">
                            {listing.title}
                          </div>
                          <div className="text-[11px] text-slate-500">
                            {listing.artisan_collective || "Village Collective"}{" "}
                            • {batch.unit_weight_grams}g
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Lot # & FSSAI */}
                    <td className="py-3.5 px-4 align-middle">
                      <div className="font-mono text-slate-800 text-[11px] font-semibold">
                        {batch.lot_number}
                      </div>
                      <div className="text-[10px] text-slate-400">
                        {batch.fssai_license_ref || "FSSAI Certified"}
                      </div>
                    </td>

                    {/* Packaged Date */}
                    <td className="py-3.5 px-4 align-middle text-slate-600">
                      {batch.packaging_date}
                    </td>

                    {/* Best Before */}
                    <td className="py-3.5 px-4 align-middle font-medium text-slate-700">
                      {batch.best_before_date}
                    </td>

                    {/* Stock Units Editable */}
                    <td className="py-3.5 px-4 align-middle text-center">
                      <input
                        type="number"
                        min="0"
                        value={batch.stock_units}
                        onChange={(e) =>
                          handleSetStockDirect(batch.id, Number(e.target.value))
                        }
                        className="w-16 text-center font-bold text-slate-900 bg-white border border-slate-200 rounded-lg py-1 px-1.5 outline-none focus:border-slate-900 text-xs shadow-xs"
                      />
                    </td>

                    {/* Status Pill */}
                    <td className="py-3.5 px-4 align-middle text-center">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase border ${
                          isOutOfStock
                            ? "bg-rose-50 text-rose-700 border-rose-200"
                            : isLowStock
                              ? "bg-amber-50 text-amber-700 border-amber-200"
                              : "bg-emerald-50 text-emerald-700 border-emerald-200"
                        }`}
                      >
                        {isOutOfStock
                          ? "Out of Stock"
                          : isLowStock
                            ? "Low Stock"
                            : "In Stock"}
                      </span>
                    </td>

                    {/* Quick Restock Actions */}
                    <td className="py-3.5 px-4 align-middle text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => handleAdjustStock(batch.id, 10)}
                          className="px-2.5 py-1 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 font-semibold text-[11px] rounded-lg transition-colors cursor-pointer shadow-xs"
                          title="Add 10 units"
                        >
                          +10
                        </button>
                        <button
                          onClick={() => handleAdjustStock(batch.id, 25)}
                          className="px-2.5 py-1 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 font-semibold text-[11px] rounded-lg transition-colors cursor-pointer shadow-xs"
                          title="Add 25 units"
                        >
                          +25
                        </button>
                        <button
                          onClick={() => handleAdjustStock(batch.id, 50)}
                          className="px-2.5 py-1 bg-[#e3a157] hover:bg-[#d97706] text-slate-950 font-bold text-[11px] rounded-lg transition-colors cursor-pointer shadow-xs"
                          title="Add 50 units"
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
  );
};
