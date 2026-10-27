import React, { useState, useMemo } from "react";
import {
  Receipt,
  Search,
  Filter,
  Download,
  Eye,
  ExternalLink,
  Printer,
  CheckCircle2,
  Clock,
  Building2,
  Users,
  Compass,
  Utensils,
  Hammer,
  Package,
  Layers,
  ArrowUpRight,
  ShieldCheck,
  FileSpreadsheet,
  X,
  CreditCard,
  MapPin,
} from "lucide-react";
import { Order, Listing, HostPayoutRecord } from "../../types";
import {
  formatINR,
  formatDate,
  calculateOrderGstBreakdown,
  getItemHsnSacCode,
  getOrderCategoryPrefix,
} from "../../lib/utils";
import { TaxInvoice } from "../order/TaxInvoice";

interface InvoicesWorkspaceProps {
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

type CategoryFilter = "ALL" | "WK" | "FD" | "WS" | "GD";
type TaxRegimeFilter = "ALL" | "INTRA_STATE" | "INTER_STATE";
type TabType = "customer_invoices" | "vendor_vouchers";

export const InvoicesWorkspace: React.FC<InvoicesWorkspaceProps> = ({
  orders,
  listings,
}) => {
  const [activeTab, setActiveTab] = useState<TabType>("customer_invoices");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<CategoryFilter>("ALL");
  const [selectedTaxRegime, setSelectedTaxRegime] = useState<TaxRegimeFilter>("ALL");

  // Selected Order for Tax Invoice Modal
  const [previewOrder, setPreviewOrder] = useState<Order | null>(null);

  // Selected Payout for Remittance Voucher Modal
  const [previewPayout, setPreviewPayout] = useState<HostPayoutRecord | null>(null);

  // Calculate order category
  const getCategoryFromOrder = (order: Order): "WK" | "FD" | "WS" | "GD" => {
    const ref = (order.order_ref || "").toUpperCase();
    if (ref.includes("-WK-") || ref.startsWith("MM-WK-")) return "WK";
    if (ref.includes("-FD-") || ref.startsWith("MM-FD-")) return "FD";
    if (ref.includes("-WS-") || ref.startsWith("MM-WS-")) return "WS";
    if (ref.includes("-GD-") || ref.startsWith("MM-GD-") || ref.includes("-PRD-")) return "GD";
    return getOrderCategoryPrefix(order.items) as "WK" | "FD" | "WS" | "GD";
  };

  // Filtered customer invoices
  const filteredOrders = useMemo(() => {
    return orders.filter((order) => {
      const q = searchQuery.toLowerCase().trim();
      const cat = getCategoryFromOrder(order);

      // Category filter
      if (selectedCategory !== "ALL" && cat !== selectedCategory) {
        return false;
      }

      // Tax breakdown
      const gstInfo = calculateOrderGstBreakdown(
        order.total_amount_inr,
        order.shipping_address?.state,
      );

      // Tax regime filter
      if (selectedTaxRegime === "INTRA_STATE" && gstInfo.isInterState) {
        return false;
      }
      if (selectedTaxRegime === "INTER_STATE" && !gstInfo.isInterState) {
        return false;
      }

      // Search match
      if (q) {
        const matchRef = (order.order_ref || "").toLowerCase().includes(q);
        const matchInv = `inv-${order.order_ref || ""}`.toLowerCase().includes(q);
        const matchName = (order.customer_name || "").toLowerCase().includes(q);
        const matchEmail = (order.customer_email || "").toLowerCase().includes(q);
        const matchPhone = (order.customer_phone || "").toLowerCase().includes(q);
        const matchState = (order.shipping_address?.state || "").toLowerCase().includes(q);
        const matchItems = order.items.some((i) =>
          (i.listing?.title || "").toLowerCase().includes(q),
        );
        return matchRef || matchInv || matchName || matchEmail || matchPhone || matchState || matchItems;
      }

      return true;
    });
  }, [orders, searchQuery, selectedCategory, selectedTaxRegime]);

  // Aggregate KPI Calculations
  const metrics = useMemo(() => {
    let grossInvoiced = 0;
    let taxableTotal = 0;
    let cgstTotal = 0;
    let sgstTotal = 0;
    let igstTotal = 0;
    let intraCount = 0;
    let interCount = 0;

    orders.forEach((order) => {
      grossInvoiced += order.total_amount_inr;
      const gst = calculateOrderGstBreakdown(
        order.total_amount_inr,
        order.shipping_address?.state,
      );
      taxableTotal += gst.taxableValue;
      cgstTotal += gst.cgst;
      sgstTotal += gst.sgst;
      igstTotal += gst.igst;
      if (gst.isInterState) {
        interCount++;
      } else {
        intraCount++;
      }
    });

    return {
      grossInvoiced,
      taxableTotal,
      cgstTotal,
      sgstTotal,
      igstTotal,
      totalGst: cgstTotal + sgstTotal + igstTotal,
      totalInvoices: orders.length,
      intraCount,
      interCount,
    };
  }, [orders]);

  // Export GSTR-1 CSV
  const handleExportGstr1 = () => {
    const headers = [
      "Invoice Number",
      "Invoice Date",
      "Order Reference",
      "Customer Name",
      "Customer Phone",
      "Customer Email",
      "Place of Supply",
      "Supply Type",
      "HSN/SAC Codes",
      "Taxable Value (INR)",
      "CGST 9% (INR)",
      "SGST 9% (INR)",
      "IGST 18% (INR)",
      "Total GST (INR)",
      "Total Invoice Value (INR)",
      "Payment Ref",
    ];

    const rows = orders.map((order) => {
      const gst = calculateOrderGstBreakdown(
        order.total_amount_inr,
        order.shipping_address?.state,
      );
      const hsnCodes = order.items
        .map((i) => getItemHsnSacCode(i.listing).code)
        .filter((val, idx, arr) => arr.indexOf(val) === idx)
        .join("; ");

      return [
        `"INV-${order.order_ref}"`,
        `"${new Date(order.created_at).toISOString().split("T")[0]}"`,
        `"${order.order_ref}"`,
        `"${order.customer_name.replace(/"/g, '""')}"`,
        `"${order.customer_phone}"`,
        `"${order.customer_email}"`,
        `"${gst.placeOfSupply.replace(/"/g, '""')}"`,
        `"${gst.isInterState ? "Inter-State (IGST)" : "Intra-State (CGST+SGST)"}"`,
        `"${hsnCodes}"`,
        gst.taxableValue.toFixed(2),
        gst.cgst.toFixed(2),
        gst.sgst.toFixed(2),
        gst.igst.toFixed(2),
        gst.totalGst.toFixed(2),
        order.total_amount_inr.toFixed(2),
        `"${order.razorpay_payment_id || "PAY_CONFIRMED"}"`,
      ].join(",");
    });

    const csvContent =
      "data:text/csv;charset=utf-8," + [headers.join(","), ...rows].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute(
      "download",
      `GSTR1_KolibabaSeafood_${new Date().toISOString().split("T")[0]}.csv`,
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getCategoryBadge = (cat: "WK" | "FD" | "WS" | "GD") => {
    switch (cat) {
      case "WK":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#3e6d74]/30 text-[#e6fffa] border border-[#5f98a0]/50">
            <Compass className="w-3 h-3 text-[#5f98a0]" /> Walk (WK)
          </span>
        );
      case "FD":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#e3a157]/20 text-[#e3a157] border border-[#e3a157]/40">
            <Utensils className="w-3 h-3 text-[#e3a157]" /> Food (FD)
          </span>
        );
      case "WS":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#dab38c]/20 text-[#dab38c] border border-[#dab38c]/40">
            <Hammer className="w-3 h-3 text-[#dab38c]" /> Workshop (WS)
          </span>
        );
      case "GD":
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-950/60 text-emerald-400 border border-emerald-500/40">
            <Package className="w-3 h-3 text-emerald-400" /> Goods (GD)
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner & Statutory Tax Identity Card */}
      <div className="bg-gradient-to-br from-[#29100B] via-[#35160E] to-[#1F0B07] border border-[#DAB38C]/30 rounded-3xl p-6 text-[#F5EDEB] shadow-xl relative overflow-hidden">
        <div className="absolute -right-10 -bottom-10 opacity-10 pointer-events-none">
          <Receipt className="w-64 h-64 text-[#E3A157]" />
        </div>

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2 max-w-2xl">
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-full text-xs font-mono font-bold bg-[#3D1811] text-[#E3A157] border border-[#DAB38C]/25">
                GSTIN: 27ABBFK9637R1ZF · MAHARASHTRA (STATE 27)
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                Statutory Active
              </span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-display font-bold text-[#F5EDEB] tracking-tight">
              Invoices &amp; Statutory Billing
            </h2>
            <p className="text-xs sm:text-sm text-[#DAB38C]/90 leading-relaxed">
              Official tax invoices issued by{" "}
              <strong className="text-[#F5EDEB]">Kolibaba Seafood Inc.</strong> in strategic
              partnership with{" "}
              <strong className="text-[#E3A157]">Bhoomiputra Foundation</strong>.
              Audit all customer tax invoices (B2C) with state-based GST breakdowns and
              vendor host payout remittance vouchers.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <button
              onClick={handleExportGstr1}
              className="px-4 py-2.5 bg-[#E3A157] hover:bg-[#DAB38C] text-[#29100B] font-bold text-xs rounded-xl shadow-lg transition-all flex items-center gap-2 cursor-pointer"
            >
              <FileSpreadsheet className="w-4 h-4" />
              <span>Export GSTR-1 CSV</span>
            </button>
          </div>
        </div>
      </div>

      {/* KPI Cards Row (Editorial Parchment with Warm Roast Typography) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
        <div className="bg-[#FFFDFB] border border-[rgba(41,16,11,0.08)] shadow-[0_1px_2px_rgba(41,16,11,0.05),0_8px_28px_-12px_rgba(41,16,11,0.14)] rounded-2xl p-4">
          <div className="text-[11px] font-bold tracking-[0.06em] text-[rgba(41,16,11,0.64)] uppercase">
            Gross Invoiced
          </div>
          <div className="font-display text-xl sm:text-2xl font-bold text-[#29100B] mt-1">
            {formatINR(metrics.grossInvoiced)}
          </div>
          <div className="text-[11px] text-[rgba(41,16,11,0.48)] font-medium mt-1">
            {metrics.totalInvoices} tax invoices
          </div>
        </div>

        <div className="bg-[#FFFDFB] border border-[rgba(41,16,11,0.08)] shadow-[0_1px_2px_rgba(41,16,11,0.05),0_8px_28px_-12px_rgba(41,16,11,0.14)] rounded-2xl p-4">
          <div className="text-[11px] font-bold tracking-[0.06em] text-[rgba(41,16,11,0.64)] uppercase">
            Taxable Base
          </div>
          <div className="font-display text-xl sm:text-2xl font-bold text-[#C67F2A] mt-1">
            ₹{metrics.taxableTotal.toLocaleString("en-IN", { maximumFractionDigits: 0 })}
          </div>
          <div className="text-[11px] text-[rgba(41,16,11,0.48)] font-medium mt-1">Exclusive of GST</div>
        </div>

        <div className="bg-[#FFFDFB] border border-[rgba(41,16,11,0.08)] shadow-[0_1px_2px_rgba(41,16,11,0.05),0_8px_28px_-12px_rgba(41,16,11,0.14)] rounded-2xl p-4">
          <div className="text-[11px] font-bold tracking-[0.06em] text-[rgba(41,16,11,0.64)] uppercase">
            CGST (9.0%)
          </div>
          <div className="font-display text-xl sm:text-2xl font-bold text-[#29100B] mt-1">
            ₹{metrics.cgstTotal.toLocaleString("en-IN", { maximumFractionDigits: 0 })}
          </div>
          <div className="text-[11px] text-[rgba(41,16,11,0.48)] font-medium mt-1">Intra-State Central</div>
        </div>

        <div className="bg-[#FFFDFB] border border-[rgba(41,16,11,0.08)] shadow-[0_1px_2px_rgba(41,16,11,0.05),0_8px_28px_-12px_rgba(41,16,11,0.14)] rounded-2xl p-4">
          <div className="text-[11px] font-bold tracking-[0.06em] text-[rgba(41,16,11,0.64)] uppercase">
            SGST (9.0%)
          </div>
          <div className="font-display text-xl sm:text-2xl font-bold text-[#29100B] mt-1">
            ₹{metrics.sgstTotal.toLocaleString("en-IN", { maximumFractionDigits: 0 })}
          </div>
          <div className="text-[11px] text-[rgba(41,16,11,0.48)] font-medium mt-1">Intra-State MH</div>
        </div>

        <div className="bg-[#FFFDFB] border border-[rgba(41,16,11,0.08)] shadow-[0_1px_2px_rgba(41,16,11,0.05),0_8px_28px_-12px_rgba(41,16,11,0.14)] rounded-2xl p-4">
          <div className="text-[11px] font-bold tracking-[0.06em] text-[rgba(41,16,11,0.64)] uppercase">
            IGST (18.0%)
          </div>
          <div className="font-display text-xl sm:text-2xl font-bold text-sky-800 mt-1">
            ₹{metrics.igstTotal.toLocaleString("en-IN", { maximumFractionDigits: 0 })}
          </div>
          <div className="text-[11px] text-[rgba(41,16,11,0.48)] font-medium mt-1">
            {metrics.interCount} Inter-State Orders
          </div>
        </div>

        <div className="bg-[#FFFDFB] border border-[rgba(41,16,11,0.08)] shadow-[0_1px_2px_rgba(41,16,11,0.05),0_8px_28px_-12px_rgba(41,16,11,0.14)] rounded-2xl p-4">
          <div className="text-[11px] font-bold tracking-[0.06em] text-[rgba(41,16,11,0.64)] uppercase">
            Total GST Tax
          </div>
          <div className="font-display text-xl sm:text-2xl font-bold text-emerald-700 mt-1">
            ₹{metrics.totalGst.toLocaleString("en-IN", { maximumFractionDigits: 0 })}
          </div>
          <div className="text-[11px] text-emerald-700 font-bold mt-1">100% Reconciled</div>
        </div>
      </div>

      {/* Tabs Header */}
      <div className="flex border-b border-[rgba(41,16,11,0.12)] gap-4">
        <button
          onClick={() => setActiveTab("customer_invoices")}
          className={`pb-3 text-sm font-semibold flex items-center gap-2 border-b-2 transition-all cursor-pointer ${
            activeTab === "customer_invoices"
              ? "border-[#C67F2A] text-[#29100B] font-bold"
              : "border-transparent text-[rgba(41,16,11,0.54)] hover:text-[#29100B]"
          }`}
        >
          <Receipt className="w-4 h-4 text-[#C67F2A]" />
          <span>Customer Tax Invoices (B2C &amp; B2B)</span>
          <span className="px-2 py-0.5 rounded-full text-xs bg-[rgba(41,16,11,0.06)] text-[#29100B] font-bold">
            {filteredOrders.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab("vendor_vouchers")}
          className={`pb-3 text-sm font-semibold flex items-center gap-2 border-b-2 transition-all cursor-pointer ${
            activeTab === "vendor_vouchers"
              ? "border-[#C67F2A] text-[#29100B] font-bold"
              : "border-transparent text-[rgba(41,16,11,0.54)] hover:text-[#29100B]"
          }`}
        >
          <Users className="w-4 h-4 text-[#C67F2A]" />
          <span>Vendor &amp; Host Payout Vouchers</span>
          <span className="px-2 py-0.5 rounded-full text-xs bg-[rgba(41,16,11,0.06)] text-[#29100B] font-bold">
            {SEED_HOST_PAYOUTS.length}
          </span>
        </button>
      </div>

      {/* TAB 1: CUSTOMER TAX INVOICES */}
      {activeTab === "customer_invoices" && (
        <div className="space-y-4">
          {/* Search & Filters Bar */}
          <div className="bg-[#FFFDFB] border border-[rgba(41,16,11,0.08)] shadow-[0_1px_2px_rgba(41,16,11,0.05),0_8px_28px_-12px_rgba(41,16,11,0.14)] rounded-2xl p-4 flex flex-col md:flex-row gap-4 items-center justify-between">
            {/* Search Input */}
            <div className="relative w-full md:w-80">
              <Search className="w-4 h-4 text-[rgba(41,16,11,0.44)] absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search invoice, order ref, customer..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-[#F5EDEB]/70 border border-[rgba(41,16,11,0.12)] rounded-xl pl-10 pr-4 py-2 text-xs text-[#29100B] placeholder-[rgba(41,16,11,0.4)] focus:outline-none focus:border-[#C67F2A]"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[rgba(41,16,11,0.4)] hover:text-[#29100B]"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Filter Pills */}
            <div className="flex flex-wrap items-center gap-2 w-full md:w-auto justify-start md:justify-end">
              {/* Category Pills */}
              <div className="flex items-center gap-1 bg-[#F5EDEB] p-1 rounded-xl border border-[rgba(41,16,11,0.08)]">
                <button
                  onClick={() => setSelectedCategory("ALL")}
                  className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
                    selectedCategory === "ALL"
                      ? "bg-[#29100B] text-[#E3A157] font-bold shadow-xs"
                      : "text-[rgba(41,16,11,0.64)] hover:text-[#29100B]"
                  }`}
                >
                  All
                </button>
                <button
                  onClick={() => setSelectedCategory("WK")}
                  className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
                    selectedCategory === "WK"
                      ? "bg-[#29100B] text-[#5f98a0] font-bold shadow-xs"
                      : "text-[rgba(41,16,11,0.64)] hover:text-[#29100B]"
                  }`}
                >
                  Walks (WK)
                </button>
                <button
                  onClick={() => setSelectedCategory("FD")}
                  className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
                    selectedCategory === "FD"
                      ? "bg-[#29100B] text-[#E3A157] font-bold shadow-xs"
                      : "text-[rgba(41,16,11,0.64)] hover:text-[#29100B]"
                  }`}
                >
                  Food (FD)
                </button>
                <button
                  onClick={() => setSelectedCategory("WS")}
                  className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
                    selectedCategory === "WS"
                      ? "bg-[#29100B] text-[#DAB38C] font-bold shadow-xs"
                      : "text-[rgba(41,16,11,0.64)] hover:text-[#29100B]"
                  }`}
                >
                  Workshops (WS)
                </button>
                <button
                  onClick={() => setSelectedCategory("GD")}
                  className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
                    selectedCategory === "GD"
                      ? "bg-[#29100B] text-emerald-400 font-bold shadow-xs"
                      : "text-[rgba(41,16,11,0.64)] hover:text-[#29100B]"
                  }`}
                >
                  Goods (GD)
                </button>
              </div>

              {/* Tax Regime Filter */}
              <div className="flex items-center gap-1 bg-[#F5EDEB] p-1 rounded-xl border border-[rgba(41,16,11,0.08)]">
                <button
                  onClick={() => setSelectedTaxRegime("ALL")}
                  className={`px-2 py-1 rounded-lg text-xs font-medium transition-all ${
                    selectedTaxRegime === "ALL"
                      ? "bg-[#29100B] text-[#E3A157] font-bold shadow-xs"
                      : "text-[rgba(41,16,11,0.64)] hover:text-[#29100B]"
                  }`}
                >
                  All States
                </button>
                <button
                  onClick={() => setSelectedTaxRegime("INTRA_STATE")}
                  className={`px-2 py-1 rounded-lg text-xs font-medium transition-all ${
                    selectedTaxRegime === "INTRA_STATE"
                      ? "bg-emerald-100 text-emerald-800 font-bold border border-emerald-300"
                      : "text-[rgba(41,16,11,0.64)] hover:text-[#29100B]"
                  }`}
                >
                  MH (CGST+SGST)
                </button>
                <button
                  onClick={() => setSelectedTaxRegime("INTER_STATE")}
                  className={`px-2 py-1 rounded-lg text-xs font-medium transition-all ${
                    selectedTaxRegime === "INTER_STATE"
                      ? "bg-sky-100 text-sky-800 font-bold border border-sky-300"
                      : "text-[rgba(41,16,11,0.64)] hover:text-[#29100B]"
                  }`}
                >
                  Inter-State (IGST)
                </button>
              </div>
            </div>
          </div>

          {/* Invoices Table */}
          <div className="bg-[#FFFDFB] border border-[rgba(41,16,11,0.08)] rounded-2xl overflow-hidden shadow-md">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-[rgba(41,16,11,0.12)] bg-[#29100B] text-[#F5EDEB] uppercase tracking-wider text-[11px]">
                    <th className="py-3 px-4 font-bold">Invoice &amp; Ref</th>
                    <th className="py-3 px-4 font-bold">Category</th>
                    <th className="py-3 px-4 font-bold">Customer Details</th>
                    <th className="py-3 px-4 font-bold">Place of Supply</th>
                    <th className="py-3 px-4 text-center font-bold">HSN / SAC</th>
                    <th className="py-3 px-4 text-right font-bold">Taxable</th>
                    <th className="py-3 px-4 text-right font-bold">Taxes (GST)</th>
                    <th className="py-3 px-4 text-right font-bold">Total (INR)</th>
                    <th className="py-3 px-4 text-center font-bold">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[rgba(41,16,11,0.06)] text-[#29100B]">
                  {filteredOrders.length === 0 ? (
                    <tr>
                      <td colSpan={9} className="py-12 text-center text-[rgba(41,16,11,0.48)]">
                        No tax invoices found matching your filter criteria.
                      </td>
                    </tr>
                  ) : (
                    filteredOrders.map((order) => {
                      const cat = getCategoryFromOrder(order);
                      const gst = calculateOrderGstBreakdown(
                        order.total_amount_inr,
                        order.shipping_address?.state,
                      );
                      const firstItem = order.items[0];
                      const hsnInfo = getItemHsnSacCode(firstItem?.listing);
                      const invoiceNo = `INV-${order.order_ref}`;

                      return (
                        <tr
                          key={order.id}
                          className="hover:bg-[#F5EDEB]/60 transition-colors"
                        >
                          {/* Invoice & Order Ref */}
                          <td className="py-3.5 px-4">
                            <div className="font-mono font-bold text-[#29100B] text-xs">
                              {invoiceNo}
                            </div>
                            <div className="font-mono text-[11px] text-[#C67F2A] font-semibold">
                              {order.order_ref}
                            </div>
                            <div className="text-[10px] text-[rgba(41,16,11,0.48)]">
                              {formatDate(order.created_at)}
                            </div>
                          </td>

                          {/* Category Badge */}
                          <td className="py-3.5 px-4">{getCategoryBadge(cat)}</td>

                          {/* Customer Details */}
                          <td className="py-3.5 px-4">
                            <div className="font-semibold text-[#29100B]">
                              {order.customer_name}
                            </div>
                            <div className="text-[11px] text-[rgba(41,16,11,0.64)]">
                              {order.customer_email}
                            </div>
                            <div className="text-[10px] font-mono text-[rgba(41,16,11,0.48)]">
                              {order.customer_phone}
                            </div>
                          </td>

                          {/* Place of Supply */}
                          <td className="py-3.5 px-4">
                            <div className="text-xs font-medium text-[#29100B] flex items-center gap-1">
                              <MapPin className="w-3 h-3 text-[#C67F2A]" />
                              <span>{order.shipping_address?.state || "Maharashtra"}</span>
                            </div>
                            <div className="text-[10px]">
                              {gst.isInterState ? (
                                <span className="text-sky-700 font-semibold">
                                  Inter-State Supply (18% IGST)
                                </span>
                              ) : (
                                <span className="text-emerald-700 font-medium">
                                  State Code 27 · Intra-State
                                </span>
                              )}
                            </div>
                          </td>

                          {/* HSN/SAC */}
                          <td className="py-3.5 px-4 text-center font-mono">
                            <span className="px-2 py-0.5 rounded bg-[rgba(41,16,11,0.06)] text-[#29100B] text-[11px] font-semibold border border-[rgba(41,16,11,0.1)]">
                              {hsnInfo.code}
                            </span>
                            <div className="text-[10px] text-[rgba(41,16,11,0.48)] truncate max-w-[120px] mx-auto mt-0.5">
                              {hsnInfo.category}
                            </div>
                          </td>

                          {/* Taxable Amount */}
                          <td className="py-3.5 px-4 text-right font-mono text-[rgba(41,16,11,0.8)] font-medium">
                            ₹{gst.taxableValue.toFixed(2)}
                          </td>

                          {/* Tax Breakdown */}
                          <td className="py-3.5 px-4 text-right font-mono">
                            {gst.isInterState ? (
                              <div>
                                <span className="text-sky-700 font-semibold">
                                  IGST: ₹{gst.igst.toFixed(2)}
                                </span>
                              </div>
                            ) : (
                              <div className="text-[11px] text-[rgba(41,16,11,0.64)] leading-tight">
                                <div>C: ₹{gst.cgst.toFixed(2)}</div>
                                <div>S: ₹{gst.sgst.toFixed(2)}</div>
                              </div>
                            )}
                          </td>

                          {/* Total INR */}
                          <td className="py-3.5 px-4 text-right font-mono font-bold text-[#29100B] text-sm">
                            {formatINR(order.total_amount_inr)}
                          </td>

                          {/* Actions */}
                          <td className="py-3.5 px-4 text-center">
                            <div className="flex items-center justify-center gap-2">
                              <button
                                onClick={() => setPreviewOrder(order)}
                                title="Preview Official Tax Invoice"
                                className="px-2.5 py-1 rounded-lg bg-[#E3A157]/20 hover:bg-[#E3A157] text-[#29100B] font-semibold text-xs border border-[#E3A157]/50 transition-all flex items-center gap-1 cursor-pointer"
                              >
                                <Eye className="w-3.5 h-3.5 text-[#C67F2A]" />
                                <span>Preview</span>
                              </button>
                              <a
                                href={`/order/confirmation/${order.order_ref}?view=invoice`}
                                target="_blank"
                                rel="noreferrer"
                                title="Open Live Invoice URL"
                                className="p-1 rounded-lg hover:bg-[rgba(41,16,11,0.08)] text-[rgba(41,16,11,0.5)] hover:text-[#29100B] transition-colors"
                              >
                                <ExternalLink className="w-3.5 h-3.5" />
                              </a>
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

      {/* TAB 2: VENDOR & HOST PAYOUT VOUCHERS */}
      {activeTab === "vendor_vouchers" && (
        <div className="space-y-4">
          <div className="bg-[#FFFDFB] border border-[rgba(41,16,11,0.08)] shadow-[0_1px_2px_rgba(41,16,11,0.05),0_8px_28px_-12px_rgba(41,16,11,0.14)] rounded-2xl p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h3 className="text-base font-bold text-[#29100B]">
                Community Host &amp; Artisan Payout Vouchers
              </h3>
              <p className="text-xs text-[rgba(41,16,11,0.64)] mt-0.5">
                Statutory payment vouchers for indigenous Koli fishermen guides, home-cooks, and bachat gats.
              </p>
            </div>
            <div className="px-3 py-1.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold">
              Zero Platform Deductions on Guide Retainers
            </div>
          </div>

          <div className="bg-[#FFFDFB] border border-[rgba(41,16,11,0.08)] rounded-2xl overflow-hidden shadow-md">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-[rgba(41,16,11,0.12)] bg-[#29100B] text-[#F5EDEB] uppercase tracking-wider text-[11px]">
                    <th className="py-3 px-4 font-bold">Voucher Ref</th>
                    <th className="py-3 px-4 font-bold">Partner Name &amp; Role</th>
                    <th className="py-3 px-4 font-bold">Koliwada / Village</th>
                    <th className="py-3 px-4 font-bold">Bank / UPI Destination</th>
                    <th className="py-3 px-4 text-right font-bold">Total Earned</th>
                    <th className="py-3 px-4 text-right font-bold">Total Paid</th>
                    <th className="py-3 px-4 text-right font-bold">Pending Balance</th>
                    <th className="py-3 px-4 text-center font-bold">Status</th>
                    <th className="py-3 px-4 text-center font-bold">Voucher</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[rgba(41,16,11,0.06)] text-[#29100B]">
                  {SEED_HOST_PAYOUTS.map((payout) => (
                    <tr
                      key={payout.id}
                      className="hover:bg-[#F5EDEB]/60 transition-colors"
                    >
                      <td className="py-3.5 px-4 font-mono font-bold text-[#29100B]">
                        VCHR-{payout.id.toUpperCase()}
                        <div className="text-[10px] text-[rgba(41,16,11,0.48)] font-mono">
                          UTR: {payout.utr_reference || "N/A"}
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="font-bold text-[#29100B]">
                          {payout.partner_name}
                        </div>
                        <div className="text-[11px] text-[rgba(41,16,11,0.64)] capitalize">
                          {payout.role_type.replace("_", " ")}
                        </div>
                      </td>

                      <td className="py-3.5 px-4 text-[#29100B] font-medium">
                        {payout.koliwada}
                      </td>

                      <td className="py-3.5 px-4 font-mono text-[11px]">
                        <div className="text-[#29100B] font-semibold">{payout.bank_account_mask}</div>
                        <div className="text-[rgba(41,16,11,0.54)] text-[10px]">{payout.upi_id}</div>
                      </td>

                      <td className="py-3.5 px-4 text-right font-mono font-semibold text-[#29100B]">
                        {formatINR(payout.total_earned_inr)}
                      </td>

                      <td className="py-3.5 px-4 text-right font-mono text-emerald-700 font-bold">
                        {formatINR(payout.total_paid_inr)}
                      </td>

                      <td className="py-3.5 px-4 text-right font-mono">
                        {payout.pending_balance_inr > 0 ? (
                          <span className="text-amber-700 font-bold">
                            {formatINR(payout.pending_balance_inr)}
                          </span>
                        ) : (
                          <span className="text-[rgba(41,16,11,0.4)]">₹0</span>
                        )}
                      </td>

                      <td className="py-3.5 px-4 text-center">
                        {payout.status === "disbursed" ? (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                            Disbursed
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-300">
                            Pending Settlement
                          </span>
                        )}
                      </td>

                      <td className="py-3.5 px-4 text-center">
                        <button
                          onClick={() => setPreviewPayout(payout)}
                          className="px-2.5 py-1 rounded-lg bg-[#29100B]/5 hover:bg-[#29100B] text-[#29100B] hover:text-[#F5EDEB] font-medium text-xs transition-colors cursor-pointer border border-[rgba(41,16,11,0.12)]"
                        >
                          View Voucher
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 1: CUSTOMER TAX INVOICE PREVIEW MODAL */}
      {previewOrder && (
        <TaxInvoice
          order={previewOrder}
          onClose={() => setPreviewOrder(null)}
        />
      )}

      {/* MODAL 2: VENDOR REMITTANCE VOUCHER PREVIEW MODAL */}
      {previewPayout && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/85 backdrop-blur-xs">
          <div className="bg-[#29100B] border border-[#DAB38C]/30 rounded-3xl max-w-lg w-full p-6 space-y-4 shadow-2xl relative text-[#F5EDEB]">
            <div className="flex items-center justify-between pb-3 border-b border-[#DAB38C]/20">
              <div className="flex items-center gap-2">
                <Receipt className="w-5 h-5 text-[#E3A157]" />
                <h3 className="font-display font-bold text-base text-[#F5EDEB]">
                  Vendor Remittance Voucher · {previewPayout.partner_name}
                </h3>
              </div>
              <button
                onClick={() => setPreviewPayout(null)}
                className="p-1 rounded-full hover:bg-white/10 text-[#DAB38C] hover:text-[#F5EDEB] cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="bg-[#FFFDFB] text-[#29100B] p-6 rounded-2xl space-y-4 text-xs font-sans shadow-inner">
              <div className="flex justify-between items-start border-b pb-3 border-[rgba(41,16,11,0.14)]">
                <div>
                  <div className="font-bold text-lg font-display text-[#29100B]">Kolibaba Seafood Inc.</div>
                  <div className="text-[10px] text-[rgba(41,16,11,0.64)]">
                    Community Host Settlement Voucher · Bhoomiputra Partnership
                  </div>
                </div>
                <div className="text-right font-mono text-[11px] text-[#29100B]">
                  <div><b>Voucher:</b> VCHR-{previewPayout.id.toUpperCase()}</div>
                  <div><b>Date:</b> {formatDate(previewPayout.last_payout_date || new Date().toISOString())}</div>
                </div>
              </div>

              <div className="space-y-1">
                <div className="text-[10px] font-bold text-[rgba(41,16,11,0.48)] uppercase">Beneficiary Partner</div>
                <div className="font-bold text-sm text-[#29100B]">{previewPayout.partner_name}</div>
                <div className="text-[rgba(41,16,11,0.64)] text-[11px]">
                  Role: <span className="capitalize">{previewPayout.role_type.replace("_", " ")}</span> · {previewPayout.koliwada}
                </div>
                <div className="font-mono text-[11px] pt-1 text-[rgba(41,16,11,0.8)]">
                  Bank Account: {previewPayout.bank_account_mask}<br />
                  UPI VPA: {previewPayout.upi_id}<br />
                  UTR Reference: {previewPayout.utr_reference || "CMS_PENDING"}
                </div>
              </div>

              <div className="border-t border-b border-[rgba(41,16,11,0.12)] py-3 space-y-2">
                <div className="flex justify-between text-[rgba(41,16,11,0.8)]">
                  <span>Gross Maritime Earnings:</span>
                  <span className="font-mono font-semibold">{formatINR(previewPayout.total_earned_inr)}</span>
                </div>
                <div className="flex justify-between text-emerald-800 font-semibold">
                  <span>Disbursed to Bank/UPI:</span>
                  <span className="font-mono">-{formatINR(previewPayout.total_paid_inr)}</span>
                </div>
                <div className="flex justify-between text-[#29100B] font-bold pt-1 border-t border-[rgba(41,16,11,0.12)]">
                  <span>Pending Remittance:</span>
                  <span className="font-mono text-sm">{formatINR(previewPayout.pending_balance_inr)}</span>
                </div>
              </div>

              <div className="text-[10px] text-[rgba(41,16,11,0.54)] leading-tight">
                This document certifies the community host settlement split executed under the
                Bhoomiputra Foundation maritime welfare pact. Zero commission deductions applied.
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => window.print()}
                className="px-4 py-2 bg-[#E3A157] hover:bg-[#DAB38C] text-[#29100B] font-bold text-xs rounded-xl shadow cursor-pointer flex items-center gap-1.5 transition-colors"
              >
                <Printer className="w-4 h-4" />
                <span>Print Voucher</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
