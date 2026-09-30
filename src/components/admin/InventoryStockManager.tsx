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
      <div className="metrics">
        <div className="metric hl">
          <div className="lbl">Total Physical SKUs</div>
          <div className="val">{productListings.length}</div>
          <div className="sub">Cataloged pantry goods</div>
          <div className="tick">↗</div>
        </div>

        <div className="metric">
          <div className="lbl">In-Stock Inventory</div>
          <div className="val">{totalStockUnits}</div>
          <div className="sub">Units ready across village hubs</div>
        </div>

        <div className="metric">
          <div className="lbl">Low Stock Warnings</div>
          <div className="val text-[var(--admin-accent-strong)]">
            {lowStockCount}
          </div>
          <div className="sub">Below replenishment threshold</div>
        </div>

        <div className="metric">
          <div className="lbl">Out of Stock</div>
          <div className="val">{outOfStockCount}</div>
          <div className="sub">Ordering disabled automatically</div>
        </div>
      </div>

      {notification && (
        <div className="p-3.5 bg-[var(--admin-surface)] border border-[var(--admin-accent)] text-[var(--admin-fg)] text-xs rounded-2xl flex items-center gap-2 shadow-xs">
          <CheckCircle2 className="w-4 h-4 text-[var(--admin-accent-strong)] shrink-0" />
          <span className="font-medium">{notification}</span>
        </div>
      )}

      {/* Filter and Export Bar */}
      <div className="admin-card p-4">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 flex-1">
            <div className="admin-search flex-1">
              <span className="text-[var(--admin-faint)]">⌕</span>
              <input
                type="text"
                placeholder="Search product title, batch lot number, or collective..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <select
              value={stockFilter}
              onChange={(e) => setStockFilter(e.target.value)}
              className="admin-select text-xs"
            >
              <option value="all">All Inventory Statuses</option>
              <option value="in">Normal In-Stock</option>
              <option value="low">Low Stock Alerts Only</option>
              <option value="out">Out of Stock Only</option>
            </select>
          </div>

          <button
            onClick={exportInventoryCSV}
            className="admin-btn text-xs font-semibold"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-[var(--admin-accent)]" />
            <span>Export Stock CSV</span>
          </button>
        </div>
      </div>

      {/* Inventory & Freshness Batch Table */}
      <div className="admin-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="grid w-full">
            <thead>
              <tr>
                <th>Artisan Pantry Product</th>
                <th>Lot # &amp; FSSAI</th>
                <th>Packaged Date</th>
                <th>Best Before</th>
                <th style={{ textAlign: "center" }}>Current Stock</th>
                <th style={{ textAlign: "center" }}>Status</th>
                <th style={{ textAlign: "right" }}>Quick Restock Allocation</th>
              </tr>
            </thead>
            <tbody>
              {filteredItems.map(({ listing, batch }) => {
                const isOutOfStock = batch.stock_units === 0;
                const isLowStock =
                  batch.stock_units > 0 &&
                  batch.stock_units <= batch.min_threshold;

                return (
                  <tr key={listing.id}>
                    {/* Product & Collective */}
                    <td>
                      <div className="flex items-center gap-3">
                        <img
                          src={listing.images[0]}
                          alt={listing.title}
                          className="w-10 h-10 rounded-xl object-cover border border-[var(--admin-border-soft)] shrink-0"
                        />
                        <div>
                          <b className="text-[var(--admin-fg)] block">
                            {listing.title}
                          </b>
                          <div className="text-[12px] text-[var(--admin-faint)]">
                            {listing.artisan_collective || "Village Collective"}{" "}
                            · {batch.unit_weight_grams}g
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Lot # & FSSAI */}
                    <td>
                      <div className="font-editorial-mono text-[var(--admin-fg)] text-[11.5px] font-semibold">
                        {batch.lot_number}
                      </div>
                      <div className="text-[11px] text-[var(--admin-faint)]">
                        {batch.fssai_license_ref || "FSSAI Certified"}
                      </div>
                    </td>

                    {/* Packaged Date */}
                    <td className="text-[var(--admin-muted)]">
                      {batch.packaging_date}
                    </td>

                    {/* Best Before */}
                    <td className="font-medium text-[var(--admin-fg)]">
                      {batch.best_before_date}
                    </td>

                    {/* Stock Units Editable */}
                    <td style={{ textAlign: "center" }}>
                      <input
                        type="number"
                        min="0"
                        value={batch.stock_units}
                        onChange={(e) =>
                          handleSetStockDirect(batch.id, Number(e.target.value))
                        }
                        className="w-16 text-center font-bold text-[var(--admin-fg)] bg-[var(--admin-surface)] border border-[var(--admin-border)] rounded-full py-1 px-1.5 outline-none focus:border-[var(--admin-accent-strong)] text-xs font-editorial-mono"
                      />
                    </td>

                    {/* Status Pill */}
                    <td style={{ textAlign: "center" }}>
                      <span
                        className={`admin-pill text-[9.5px] ${
                          isOutOfStock
                            ? "admin-pill-roast"
                            : isLowStock
                              ? "admin-pill-amber"
                              : "admin-pill-line"
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
                    <td style={{ textAlign: "right" }}>
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => handleAdjustStock(batch.id, 10)}
                          className="admin-btn text-[11px] py-1 px-2.5"
                          title="Add 10 units"
                        >
                          +10
                        </button>
                        <button
                          onClick={() => handleAdjustStock(batch.id, 25)}
                          className="admin-btn text-[11px] py-1 px-2.5"
                          title="Add 25 units"
                        >
                          +25
                        </button>
                        <button
                          onClick={() => handleAdjustStock(batch.id, 50)}
                          className="admin-btn admin-btn-primary text-[11px] py-1 px-2.5 font-bold"
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
