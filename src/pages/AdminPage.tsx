import React, { useState, useMemo } from "react";
import { useData } from "../context/DataContext";
import { supabase, isSupabaseConfigured } from "../lib/supabase";
import { ManifestTable } from "../components/admin/ManifestTable";
import { SlotManager } from "../components/admin/SlotManager";
import { ProductOrdersTable } from "../components/admin/ProductOrdersTable";
import { CommunicationsHub } from "../components/admin/CommunicationsHub";
import { SpecialListingsManager } from "../components/admin/SpecialListingsManager";
import { MultiQueueManager } from "../components/admin/MultiQueueManager";
import { HostPayoutsLedger } from "../components/admin/HostPayoutsLedger";
import { InventoryStockManager } from "../components/admin/InventoryStockManager";
import { CoastalSafetyCommand } from "../components/admin/CoastalSafetyCommand";
import { RefundsManager } from "../components/admin/RefundsManager";
import { Link } from "../components/ui/Link";
import { formatINR, formatDate } from "../lib/utils";
import {
  ShieldCheck,
  Calendar,
  Layers,
  Lock,
  KeyRound,
  Mail,
  ArrowRight,
  ArrowLeft,
  AlertCircle,
  Sparkles,
  Package,
  MessageSquare,
  Clock,
  RotateCcw,
  LogOut,
  TrendingUp,
  Compass,
  CheckCircle2,
  ExternalLink,
  Wallet,
  Boxes,
  Radio,
} from "lucide-react";

type AdminSectionId =
  | "overview"
  | "queues"
  | "manifest"
  | "goods"
  | "inventory"
  | "slots"
  | "safety"
  | "payouts"
  | "refunds"
  | "spotlight"
  | "communications";

interface NavItem {
  id: AdminSectionId;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  kicker: string;
  editorialTitle: string;
  subtitle: string;
  badge?: number;
}

export const AdminPage: React.FC = () => {
  const {
    orders,
    listings,
    slots,
    proposals,
    spotlightListingIds,
    reorderSpotlight,
    toggleSpotlight,
    updateOrderFulfillment,
  } = useData();

  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    if (typeof window === "undefined") return false;
    return sessionStorage.getItem("matsya_admin_auth") === "true";
  });

  const [authMode, setAuthMode] = useState<"passcode" | "supabase">("passcode");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passcode, setPasscode] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Active section (defaults to overview matching redesign)
  const [activeSection, setActiveSection] =
    useState<AdminSectionId>("overview");

  const handlePasscodeLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (passcode.trim() === "matsya2026" || passcode.trim() === "admin") {
      setIsAuthenticated(true);
      sessionStorage.setItem("matsya_admin_auth", "true");
      setErrorMsg("");
    } else {
      setErrorMsg(
        "Invalid coordinator passcode. (Default demo pass: matsya2026)",
      );
    }
  };

  const handleSupabaseLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isSupabaseConfigured || !supabase) {
      setErrorMsg(
        "Supabase credentials not configured in environment variables.",
      );
      return;
    }

    setIsLoading(true);
    setErrorMsg("");

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        setErrorMsg(error.message);
      } else if (data.session) {
        setIsAuthenticated(true);
        sessionStorage.setItem("matsya_admin_auth", "true");
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Authentication error.";
      setErrorMsg(msg);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    if (typeof window !== "undefined") {
      sessionStorage.removeItem("matsya_admin_auth");
    }
    if (isSupabaseConfigured && supabase) {
      supabase.auth.signOut().catch(console.warn);
    }
  };

  // Pending count for Review Queue badge
  const pendingProposalsCount = useMemo(() => {
    return proposals.filter((p) => p.status === "pending_review").length;
  }, [proposals]);

  // Operational metrics for Overview
  const overviewMetrics = useMemo(() => {
    const totalRevenue = orders.reduce((sum, o) => sum + o.total_amount_inr, 0);
    const experienceOrders = orders.filter((o) =>
      o.items.some(
        (i) => i.listing?.type === "experience" || !o.shipping_address,
      ),
    );
    const productOrders = orders.filter((o) =>
      o.items.some(
        (i) => i.listing?.type === "product" || Boolean(o.shipping_address),
      ),
    );
    const pendingFulfillments = productOrders.filter(
      (o) => o.fulfillment_status === "unfulfilled" || !o.fulfillment_status,
    ).length;

    return {
      totalRevenue,
      experienceOrdersCount: experienceOrders.length,
      productOrdersCount: productOrders.length,
      pendingFulfillments,
      totalListings: listings.length,
      activeSpotlightCount: spotlightListingIds.length,
    };
  }, [orders, listings, spotlightListingIds]);

  const NAV_ITEMS: NavItem[] = [
    {
      id: "overview",
      label: "Executive Overview",
      icon: Layers,
      kicker: "Daily pulse · Today",
      editorialTitle:
        "Good morning — here's the coast <em class='italic text-[#E3A157]'>at a glance.</em>",
      subtitle:
        "One calm surface for walks, pantry goods, moderation and tides. No noise, just what needs you today.",
    },
    {
      id: "queues",
      label: "Review Queue",
      icon: ShieldCheck,
      kicker: `Moderation · ${pendingProposalsCount} waiting`,
      editorialTitle:
        "Review queue, <em class='italic text-[#E3A157]'>without the dread.</em>",
      subtitle:
        "Host tours, artisan goods, corporate asks and reschedules — each with just enough context to say yes or no with confidence.",
      badge: pendingProposalsCount,
    },
    {
      id: "manifest",
      label: "Events & Walks",
      icon: Calendar,
      kicker: "Manifest · Versova trail & bookings",
      editorialTitle:
        "Who's coming, <em class='italic text-[#E3A157]'>all checked in.</em>",
      subtitle:
        "Ticket refs, emergency contacts and payouts — printable in one click, searchable in one keystroke.",
    },
    {
      id: "goods",
      label: "D2C Goods Orders",
      icon: Package,
      kicker: "Pantry & craft · fulfilment",
      editorialTitle:
        "Parcels out, <em class='italic text-[#E3A157]'>money home.</em>",
      subtitle:
        "Packing, AWBs and artisan remittances. Right now the shelf is quiet — that's fine, the layout stays ready.",
    },
    {
      id: "inventory",
      label: "Artisan Stock & Batches",
      icon: Boxes,
      kicker: "Inventory · batch freshness & lots",
      editorialTitle:
        "Pantry fresh, <em class='italic text-[#E3A157]'>never empty.</em>",
      subtitle:
        "Monitor physical pantry shelf-stock, lot harvest numbers, shelf-life expiry dates, and allocate batch replenishment.",
    },
    {
      id: "slots",
      label: "Tidal Slots & Capacity",
      icon: Clock,
      kicker: "Capacity · low-tide windows",
      editorialTitle:
        "Tides you can <em class='italic text-[#E3A157]'>actually sell.</em>",
      subtitle:
        "Weekend batches, sunrise slots and guide assignments. Fill is shown as a quiet bar — no shouting colours.",
    },
    {
      id: "safety",
      label: "Coastal Weather & Safety",
      icon: Radio,
      kicker: "Safety matrix · Arabian Sea swell",
      editorialTitle:
        "Swell watched, <em class='italic text-[#E3A157]'>fishers safe.</em>",
      subtitle:
        "Real-time tidal windows, swell heights, IMD warnings, lifeguard directories, and 1-click zone emergency lockdowns.",
    },
    {
      id: "payouts",
      label: "Host & Artisan Payouts",
      icon: Wallet,
      kicker: "Reconciliation · 85/15 community split",
      editorialTitle:
        "Money split, <em class='italic text-[#E3A157]'>community paid.</em>",
      subtitle:
        "Reconcile 85% village guide & artisan shares vs 15% platform retainer. Track bank accounts, UPI IDs, and UTR settlements.",
    },
    {
      id: "refunds",
      label: "Refunds & Vouchers",
      icon: RotateCcw,
      kicker: "Disputes · cancellation policy audit",
      editorialTitle:
        "Fair terms, <em class='italic text-[#E3A157]'>smooth vouchers.</em>",
      subtitle:
        "Audit cancellation policy eligibility (>48h vs <24h), track Razorpay refund IDs, and issue digital credit vouchers.",
    },
    {
      id: "spotlight",
      label: "Special Listings (Hero)",
      icon: Sparkles,
      kicker: "Storefront · hero deck",
      editorialTitle:
        "Curate the <em class='italic text-[#E3A157]'>first impression.</em>",
      subtitle:
        "Six cards fan across the homepage banner. Reorder with arrows — card 1 sits far-left.",
    },
    {
      id: "communications",
      label: "Communications Hub",
      icon: MessageSquare,
      kicker: "Dispatch · WhatsApp + email",
      editorialTitle:
        "Messages that <em class='italic text-[#E3A157]'>reach the jetty.</em>",
      subtitle:
        "Tidal advisories, digital passes and receipts — one amber button per panel, everything else stays quiet.",
    },
  ];

  const currentNav =
    NAV_ITEMS.find((item) => item.id === activeSection) ?? NAV_ITEMS[0]!;

  // 1. Passcode / Login Gate (Warm Cream Canvas + Elevated Editorial Card)
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#F5EDEB] flex flex-col items-center justify-center p-4 selection:bg-[#29100B] selection:text-[#F5EDEB] font-body-sans">
        <div className="bg-[#FFFDFB] rounded-[24px] border border-[rgba(41,16,11,0.1)] shadow-[0_1px_2px_rgba(41,16,11,0.05),0_12px_36px_-12px_rgba(41,16,11,0.16)] w-full max-w-md p-8 sm:p-10 space-y-6 text-[#29100B]">
          <div className="text-center space-y-2">
            <div className="w-12 h-12 rounded-2xl bg-[#29100B] text-[#E3A157] border border-[#29100B] flex items-center justify-center mx-auto shadow-md">
              <Lock className="w-6 h-6" />
            </div>
            <div className="text-[11px] font-bold tracking-[0.14em] text-[rgba(41,16,11,0.48)] uppercase">
              WORKSPACE AUTHENTICATION
            </div>
            <h2 className="font-display text-3xl text-[#29100B]">
              Matsya<em className="italic text-[#E3A157]">Mart</em>
            </h2>
            <p className="text-[13px] text-[rgba(41,16,11,0.64)]">
              Coastal Operations Hub · Restricted to verified coordinators.
            </p>
          </div>

          {/* Toggle between Passcode and Supabase Auth */}
          {isSupabaseConfigured && (
            <div className="flex rounded-full bg-[#F5EDEB] p-1 border border-[rgba(41,16,11,0.1)] text-xs">
              <button
                type="button"
                onClick={() => setAuthMode("passcode")}
                className={`flex-1 py-1.5 rounded-full font-semibold transition-all cursor-pointer ${
                  authMode === "passcode"
                    ? "bg-[#29100B] text-[#F5EDEB] shadow-xs"
                    : "text-[rgba(41,16,11,0.64)] hover:text-[#29100B]"
                }`}
              >
                Passcode Gate
              </button>
              <button
                type="button"
                onClick={() => setAuthMode("supabase")}
                className={`flex-1 py-1.5 rounded-full font-semibold transition-all cursor-pointer ${
                  authMode === "supabase"
                    ? "bg-[#29100B] text-[#F5EDEB] shadow-xs"
                    : "text-[rgba(41,16,11,0.64)] hover:text-[#29100B]"
                }`}
              >
                Supabase Auth
              </button>
            </div>
          )}

          {authMode === "passcode" ? (
            <form onSubmit={handlePasscodeLogin} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-[#29100B] block mb-1.5">
                  Enter Coordinator Passcode
                </label>
                <div className="relative">
                  <KeyRound className="w-4 h-4 text-[rgba(41,16,11,0.44)] absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    required
                    placeholder="Enter passcode..."
                    value={passcode}
                    onChange={(e) => setPasscode(e.target.value)}
                    className="w-full text-xs pl-10 pr-3 py-3 rounded-full bg-[#FFFDFB] text-[#29100B] border border-[rgba(41,16,11,0.15)] focus:border-[#C67F2A] outline-none shadow-xs font-mono"
                  />
                </div>
              </div>

              {errorMsg && (
                <div className="p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700 flex items-center gap-1.5">
                  <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
                  <span>{errorMsg}</span>
                </div>
              )}

              <button
                type="submit"
                className="admin-btn admin-btn-primary w-full py-3 text-xs font-bold shadow-md cursor-pointer"
              >
                <span>Unlock Operations Command Center</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>

              <button
                type="button"
                onClick={() => {
                  setPasscode("matsya2026");
                  setIsAuthenticated(true);
                  if (typeof window !== "undefined") {
                    sessionStorage.setItem("matsya_admin_auth", "true");
                  }
                }}
                className="w-full text-center text-[12px] text-[rgba(41,16,11,0.64)] font-semibold hover:text-[#29100B] hover:underline pt-1 cursor-pointer"
              >
                ⚡ Quick Demo Login (matsya2026)
              </button>
            </form>
          ) : (
            <form onSubmit={handleSupabaseLogin} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-[#29100B] block mb-1.5">
                  Coordinator Email
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-[rgba(41,16,11,0.44)] absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    required
                    placeholder="coordinator@bhoomiputra.org"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full text-xs pl-10 pr-3 py-3 rounded-full bg-[#FFFDFB] text-[#29100B] border border-[rgba(41,16,11,0.15)] focus:border-[#C67F2A] outline-none shadow-xs"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-[#29100B] block mb-1.5">
                  Password
                </label>
                <div className="relative">
                  <KeyRound className="w-4 h-4 text-[rgba(41,16,11,0.44)] absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    required
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full text-xs pl-10 pr-3 py-3 rounded-full bg-[#FFFDFB] text-[#29100B] border border-[rgba(41,16,11,0.15)] focus:border-[#C67F2A] outline-none shadow-xs"
                  />
                </div>
              </div>

              {errorMsg && (
                <div className="p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700 flex items-center gap-1.5">
                  <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
                  <span>{errorMsg}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={isLoading}
                className="admin-btn admin-btn-primary w-full py-3 text-xs font-bold shadow-md cursor-pointer disabled:opacity-50"
              >
                <span>
                  {isLoading ? "Verifying..." : "Sign In with Supabase"}
                </span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </form>
          )}

          <div className="pt-2 border-t border-[rgba(41,16,11,0.08)] text-center">
            <Link
              to="/"
              className="text-xs text-[rgba(41,16,11,0.64)] hover:text-[#29100B] inline-flex items-center gap-1 transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Return to Customer Storefront</span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // 2. Main Authenticated Dashboard Shell (Matching matsya-mart-admin-redesign.html)
  return (
    <div className="min-h-screen flex bg-[#F5EDEB] text-[#29100B] font-sans selection:bg-[#29100B] selection:text-[#F5EDEB]">
      {/* LEFT SIDEBAR: Roast Anchor #29100B */}
      <aside className="w-[272px] shrink-0 bg-[#29100B] text-[#F5EDEB] border-r border-[#29100B] flex flex-col justify-between sticky top-0 h-screen z-30 p-[22px_16px_16px]">
        <div>
          {/* Header Branding */}
          <div className="pb-3.5 mb-3.5 border-b border-[rgba(245,237,235,0.14)]">
            <div className="text-[11px] tracking-[0.14em] uppercase text-[rgba(245,237,235,0.48)] font-semibold px-3">
              WORKSPACE
            </div>
            <div className="font-display text-[30px] tracking-[-0.02em] leading-[1.05] px-3 pt-0.5 text-[#F5EDEB]">
              <span>Matsya</span>
              <em className="italic text-[#E3A157]">Mart</em>
            </div>
            <div className="text-[13px] text-[rgba(245,237,235,0.6)] px-3 pt-0.5">
              Coastal Operations Hub
            </div>
          </div>

          {/* Navigation Rows */}
          <nav className="flex flex-col gap-1 overflow-y-auto max-h-[calc(100vh-210px)] scrollbar-none">
            {NAV_ITEMS.map((item) => {
              const isActive = activeSection === item.id;
              const Icon = item.icon;

              return (
                <button
                  key={item.id}
                  onClick={() => setActiveSection(item.id)}
                  className={`flex items-center gap-[11px] w-full text-left p-[11px_12px] rounded-[12px] text-[14px] transition-all cursor-pointer ${
                    isActive
                      ? "bg-[#E3A157] text-[#29100B] font-bold shadow-[0_4px_14px_-4px_rgba(227,161,87,0.5)]"
                      : "text-[rgba(245,237,235,0.68)] hover:bg-[rgba(245,237,235,0.08)] hover:text-[#F5EDEB] font-medium"
                  }`}
                >
                  <Icon
                    className={`w-[17px] h-[17px] shrink-0 ${
                      isActive ? "opacity-100" : "opacity-85"
                    }`}
                  />
                  <span className="truncate">{item.label}</span>

                  {item.badge !== undefined && item.badge > 0 && (
                    <span
                      className={`ml-auto text-[12px] font-bold min-w-[24px] h-[22px] inline-flex items-center justify-center rounded-full px-2 ${
                        isActive
                          ? "bg-[#29100B] text-[#E3A157] border border-[#29100B]"
                          : "bg-[rgba(227,161,87,0.16)] border border-[rgba(227,161,87,0.45)] text-[#F5EDEB]"
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Sidebar Footer: Return to Storefront & Status */}
        <div className="mt-auto flex flex-col gap-2.5 pt-3 border-t border-[rgba(245,237,235,0.1)]">
          <Link
            to="/"
            className="border border-[rgba(245,237,235,0.22)] bg-transparent hover:border-[#E3A157] hover:bg-[rgba(227,161,87,0.1)] text-[#F5EDEB] rounded-[12px] p-2.5 text-[14px] font-semibold cursor-pointer flex items-center justify-center gap-2 transition-all"
          >
            <span>← Back to Storefront</span>
          </Link>

          <div className="flex items-center justify-center gap-2 text-[12.5px] text-[rgba(245,237,235,0.55)]">
            <span className="w-[7px] h-[7px] rounded-full bg-[#E3A157] shadow-[0_0_0_4px_rgba(227,161,87,0.2)] animate-pulse" />
            <span>Live Sync Active</span>
          </div>
        </div>
      </aside>

      {/* RIGHT MAIN WORKSPACE: Warm Creme Canvas */}
      <main className="flex-1 flex flex-col min-w-0 bg-[#F5EDEB] overflow-y-auto min-h-screen">
        {/* Top Header Chrome */}
        <header className="sticky top-0 z-20 bg-[#F5EDEB]/90 backdrop-blur-md border-b border-[rgba(41,16,11,0.13)] px-6 sm:px-8 py-3 flex items-center justify-between">
          <div className="text-[13px] text-[rgba(41,16,11,0.44)] flex items-center gap-1.5">
            <span>Workspace</span>
            <span>&nbsp;/&nbsp;</span>
            <strong className="text-[#29100B] font-semibold">
              {currentNav.label}
            </strong>
          </div>

          <div className="flex items-center gap-2.5">
            <span className="font-mono text-[12.5px] text-[rgba(41,16,11,0.64)] hidden sm:inline">
              social@bhoomiputra.org
            </span>
            <span className="text-[10.5px] font-bold tracking-[0.06em] border border-[#29100B] rounded-full px-2.5 py-0.5 uppercase text-[#29100B]">
              Admin
            </span>

            <button
              onClick={() => window.location.reload()}
              className="admin-btn text-xs py-1.5 px-3 cursor-pointer"
              title="Refresh Data"
            >
              <RotateCcw className="w-3.5 h-3.5 text-[rgba(41,16,11,0.64)]" />
              <span>Refresh</span>
            </button>

            <button
              onClick={handleLogout}
              className="admin-btn admin-btn-quiet text-xs py-1.5 px-3 cursor-pointer"
              title="Sign Out"
            >
              <LogOut className="w-3.5 h-3.5 text-[rgba(41,16,11,0.64)]" />
              <span>Sign out →</span>
            </button>
          </div>
        </header>

        {/* Workspace Canvas Container */}
        <div className="p-6 sm:p-8 pb-20 max-w-[1140px] w-full mx-auto space-y-6">
          {/* Editorial Page Header & Kicker */}
          <div>
            <div className="admin-page-kicker">{currentNav.kicker}</div>
            <h1
              className="font-display font-normal text-[36px] sm:text-[40px] tracking-[-0.02em] leading-[1.05] text-[#29100B] max-w-[24ch]"
              dangerouslySetInnerHTML={{ __html: currentNav.editorialTitle }}
            />
            <p className="text-[rgba(41,16,11,0.64)] text-[15px] mt-2 max-w-[65ch]">
              {currentNav.subtitle}
            </p>
          </div>

          {/* Section Rendering */}
          {/* 1. EXECUTIVE OVERVIEW */}
          {activeSection === "overview" && (
            <div className="space-y-7">
              {/* 4 KPI Metric Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                <div className="p-5 rounded-[16px] bg-[#FFFDFB] border border-[rgba(41,16,11,0.08)] shadow-[0_1px_2px_rgba(41,16,11,0.05),0_8px_28px_-12px_rgba(41,16,11,0.14)] relative shadow-[inset_3px_0_0_#E3A157]">
                  <div className="text-[11px] font-bold tracking-[0.06em] uppercase text-[rgba(41,16,11,0.64)]">
                    Total revenue
                  </div>
                  <div className="font-display text-[36px] tracking-[-0.02em] leading-[1.1] my-1.5 text-[#29100B]">
                    {formatINR(overviewMetrics.totalRevenue)}
                  </div>
                  <div className="text-[13px] text-[rgba(41,16,11,0.44)]">
                    Experiences + D2C Goods
                  </div>
                  <div className="absolute top-4 right-4 w-[26px] h-[26px] rounded-full bg-[rgba(227,161,87,0.14)] flex items-center justify-center text-[#C67F2A] font-bold text-xs">
                    ↗
                  </div>
                </div>

                <div className="p-5 rounded-[16px] bg-[#FFFDFB] border border-[rgba(41,16,11,0.08)] shadow-[0_1px_2px_rgba(41,16,11,0.05),0_8px_28px_-12px_rgba(41,16,11,0.14)]">
                  <div className="text-[11px] font-bold tracking-[0.06em] uppercase text-[rgba(41,16,11,0.64)]">
                    Tidal walk bookings
                  </div>
                  <div className="font-display text-[36px] tracking-[-0.02em] leading-[1.1] my-1.5 text-[#29100B]">
                    {overviewMetrics.experienceOrdersCount}
                  </div>
                  <div className="text-[13px] text-[rgba(41,16,11,0.44)]">
                    Confirmed guest passes
                  </div>
                </div>

                <div className="p-5 rounded-[16px] bg-[#FFFDFB] border border-[rgba(41,16,11,0.08)] shadow-[0_1px_2px_rgba(41,16,11,0.05),0_8px_28px_-12px_rgba(41,16,11,0.14)]">
                  <div className="text-[11px] font-bold tracking-[0.06em] uppercase text-[rgba(41,16,11,0.64)]">
                    D2C orders to ship
                  </div>
                  <div className="font-display text-[36px] tracking-[-0.02em] leading-[1.1] my-1.5 text-[#29100B]">
                    {overviewMetrics.pendingFulfillments}
                  </div>
                  <div className="text-[13px] text-[rgba(41,16,11,0.44)]">
                    Awaiting courier AWB
                  </div>
                </div>

                <div className="p-5 rounded-[16px] bg-[#FFFDFB] border border-[rgba(41,16,11,0.08)] shadow-[0_1px_2px_rgba(41,16,11,0.05),0_8px_28px_-12px_rgba(41,16,11,0.14)]">
                  <div className="text-[11px] font-bold tracking-[0.06em] uppercase text-[rgba(41,16,11,0.64)]">
                    Pending moderation
                  </div>
                  <div className="font-display text-[36px] tracking-[-0.02em] leading-[1.1] my-1.5 text-[#29100B]">
                    {pendingProposalsCount}
                  </div>
                  <div className="text-[13px] text-[rgba(41,16,11,0.44)]">
                    Community proposals awaiting review
                  </div>
                </div>
              </div>

              {/* Quick Navigation Cards: Needs your eye */}
              <div className="space-y-3 pt-2">
                <div className="flex items-baseline gap-3">
                  <h2 className="font-display text-[22px] tracking-[-0.01em] font-normal text-[#29100B]">
                    Needs your eye
                  </h2>
                  <p className="text-[13px] text-[rgba(41,16,11,0.44)] ml-auto">
                    6 jumps · sorted by urgency
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  <button
                    onClick={() => setActiveSection("queues")}
                    className="flex items-center gap-3.5 p-4 rounded-[16px] bg-[#FFFDFB] border border-[rgba(41,16,11,0.08)] hover:border-[#C67F2A] hover:-translate-y-0.5 transition-all text-left cursor-pointer shadow-[0_1px_2px_rgba(41,16,11,0.05),0_8px_28px_-12px_rgba(41,16,11,0.14)] group"
                  >
                    <span className="w-[38px] h-[38px] rounded-[12px] bg-[rgba(227,161,87,0.14)] border border-[rgba(198,127,42,0.3)] flex items-center justify-center shrink-0 text-[#29100B] font-bold text-base">
                      ◈
                    </span>
                    <div>
                      <b className="block text-[14px] text-[#29100B]">
                        Moderate submissions
                      </b>
                      <span className="text-[12.5px] text-[rgba(41,16,11,0.64)]">
                        {pendingProposalsCount} pending decisions
                      </span>
                    </div>
                    <span className="ml-auto text-[#C67F2A] text-lg font-bold group-hover:translate-x-1 transition-transform">
                      →
                    </span>
                  </button>

                  <button
                    onClick={() => setActiveSection("manifest")}
                    className="flex items-center gap-3.5 p-4 rounded-[16px] bg-[#FFFDFB] border border-[rgba(41,16,11,0.08)] hover:border-[#C67F2A] hover:-translate-y-0.5 transition-all text-left cursor-pointer shadow-[0_1px_2px_rgba(41,16,11,0.05),0_8px_28px_-12px_rgba(41,16,11,0.14)] group"
                  >
                    <span className="w-[38px] h-[38px] rounded-[12px] bg-[rgba(227,161,87,0.14)] border border-[rgba(198,127,42,0.3)] flex items-center justify-center shrink-0 text-[#29100B] font-bold text-base">
                      ◐
                    </span>
                    <div>
                      <b className="block text-[14px] text-[#29100B]">
                        Check-in manifest
                      </b>
                      <span className="text-[12.5px] text-[rgba(41,16,11,0.64)]">
                        Validate passes &amp; export CSV
                      </span>
                    </div>
                    <span className="ml-auto text-[#C67F2A] text-lg font-bold group-hover:translate-x-1 transition-transform">
                      →
                    </span>
                  </button>

                  <button
                    onClick={() => setActiveSection("slots")}
                    className="flex items-center gap-3.5 p-4 rounded-[16px] bg-[#FFFDFB] border border-[rgba(41,16,11,0.08)] hover:border-[#C67F2A] hover:-translate-y-0.5 transition-all text-left cursor-pointer shadow-[0_1px_2px_rgba(41,16,11,0.05),0_8px_28px_-12px_rgba(41,16,11,0.14)] group"
                  >
                    <span className="w-[38px] h-[38px] rounded-[12px] bg-[rgba(227,161,87,0.14)] border border-[rgba(198,127,42,0.3)] flex items-center justify-center shrink-0 text-[#29100B] font-bold text-base">
                      ≈
                    </span>
                    <div>
                      <b className="block text-[14px] text-[#29100B]">
                        Tidal capacity
                      </b>
                      <span className="text-[12.5px] text-[rgba(41,16,11,0.64)]">
                        {slots.length} low-tide windows open
                      </span>
                    </div>
                    <span className="ml-auto text-[#C67F2A] text-lg font-bold group-hover:translate-x-1 transition-transform">
                      →
                    </span>
                  </button>

                  <button
                    onClick={() => setActiveSection("payouts")}
                    className="flex items-center gap-3.5 p-4 rounded-[16px] bg-[#FFFDFB] border border-[rgba(41,16,11,0.08)] hover:border-[#C67F2A] hover:-translate-y-0.5 transition-all text-left cursor-pointer shadow-[0_1px_2px_rgba(41,16,11,0.05),0_8px_28px_-12px_rgba(41,16,11,0.14)] group"
                  >
                    <span className="w-[38px] h-[38px] rounded-[12px] bg-[rgba(227,161,87,0.14)] border border-[rgba(198,127,42,0.3)] flex items-center justify-center shrink-0 text-[#29100B] font-bold text-base">
                      ₹
                    </span>
                    <div>
                      <b className="block text-[14px] text-[#29100B]">
                        Host payouts ledger
                      </b>
                      <span className="text-[12.5px] text-[rgba(41,16,11,0.64)]">
                        85/15 split &amp; UTR settlements
                      </span>
                    </div>
                    <span className="ml-auto text-[#C67F2A] text-lg font-bold group-hover:translate-x-1 transition-transform">
                      →
                    </span>
                  </button>

                  <button
                    onClick={() => setActiveSection("inventory")}
                    className="flex items-center gap-3.5 p-4 rounded-[16px] bg-[#FFFDFB] border border-[rgba(41,16,11,0.08)] hover:border-[#C67F2A] hover:-translate-y-0.5 transition-all text-left cursor-pointer shadow-[0_1px_2px_rgba(41,16,11,0.05),0_8px_28px_-12px_rgba(41,16,11,0.14)] group"
                  >
                    <span className="w-[38px] h-[38px] rounded-[12px] bg-[rgba(227,161,87,0.14)] border border-[rgba(198,127,42,0.3)] flex items-center justify-center shrink-0 text-[#29100B] font-bold text-base">
                      ⬢
                    </span>
                    <div>
                      <b className="block text-[14px] text-[#29100B]">
                        Pantry stock &amp; lots
                      </b>
                      <span className="text-[12.5px] text-[rgba(41,16,11,0.64)]">
                        Expiry dates &amp; quick restock
                      </span>
                    </div>
                    <span className="ml-auto text-[#C67F2A] text-lg font-bold group-hover:translate-x-1 transition-transform">
                      →
                    </span>
                  </button>

                  <button
                    onClick={() => setActiveSection("safety")}
                    className="flex items-center gap-3.5 p-4 rounded-[16px] bg-[#FFFDFB] border border-[rgba(41,16,11,0.08)] hover:border-[#C67F2A] hover:-translate-y-0.5 transition-all text-left cursor-pointer shadow-[0_1px_2px_rgba(41,16,11,0.05),0_8px_28px_-12px_rgba(41,16,11,0.14)] group"
                  >
                    <span className="w-[38px] h-[38px] rounded-[12px] bg-[rgba(227,161,87,0.14)] border border-[rgba(198,127,42,0.3)] flex items-center justify-center shrink-0 text-[#29100B] font-bold text-base">
                      〜
                    </span>
                    <div>
                      <b className="block text-[14px] text-[#29100B]">
                        Coastal swell &amp; safety
                      </b>
                      <span className="text-[12.5px] text-[rgba(41,16,11,0.64)]">
                        Live zone matrix &amp; alerts
                      </span>
                    </div>
                    <span className="ml-auto text-[#C67F2A] text-lg font-bold group-hover:translate-x-1 transition-transform">
                      →
                    </span>
                  </button>
                </div>
              </div>

              {/* Recent Orders Snapshot */}
              <div className="space-y-3 pt-2">
                <div className="flex items-baseline gap-3">
                  <h2 className="font-display text-[22px] tracking-[-0.01em] font-normal text-[#29100B]">
                    Latest transactions
                  </h2>
                  <p className="text-[13px] text-[rgba(41,16,11,0.44)] ml-auto">
                    <button
                      onClick={() => setActiveSection("manifest")}
                      className="hover:underline cursor-pointer"
                    >
                      View all orders →
                    </button>
                  </p>
                </div>

                <div className="bg-[#FFFDFB] border border-[rgba(41,16,11,0.08)] rounded-[20px] shadow-[0_1px_2px_rgba(41,16,11,0.05),0_8px_28px_-12px_rgba(41,16,11,0.14)] overflow-hidden divide-y divide-[rgba(41,16,11,0.08)]">
                  {orders.slice(0, 5).map((order) => {
                    const isExp = order.items.some(
                      (i) =>
                        i.listing?.type === "experience" ||
                        !order.shipping_address,
                    );

                    return (
                      <div
                        key={order.id}
                        className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs hover:bg-[#F9EFE7]/40 transition-colors"
                      >
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-mono font-medium text-[12.5px] text-[#29100B]">
                              {order.order_ref}
                            </span>
                            <span
                              className={
                                isExp
                                  ? "admin-pill admin-pill-amber"
                                  : "admin-pill admin-pill-line"
                              }
                            >
                              {isExp ? "Coastal Experience" : "Artisan Goods"}
                            </span>
                          </div>
                          <div className="mt-1 text-[14px] text-[#29100B]">
                            <b>{order.customer_name}</b>{" "}
                            <span className="text-[rgba(41,16,11,0.44)]">
                              · {order.items[0]?.listing?.title || "Tour Item"}
                            </span>
                          </div>
                        </div>

                        <div className="text-right sm:ml-auto">
                          <b className="text-[15px] text-[#29100B]">
                            {formatINR(order.total_amount_inr)}
                          </b>
                          <div className="text-[12.5px] text-[rgba(41,16,11,0.44)]">
                            {formatDate(order.created_at)}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* 2. REVIEW & MODERATION QUEUE */}
          {activeSection === "queues" && (
            <MultiQueueManager proposals={proposals} />
          )}

          {/* 3. EVENTS & WALKS MANIFEST */}
          {activeSection === "manifest" && (
            <ManifestTable orders={orders} listings={listings} />
          )}

          {/* 4. D2C GOODS ORDERS */}
          {activeSection === "goods" && (
            <ProductOrdersTable
              orders={orders}
              listings={listings}
              onUpdateFulfillment={updateOrderFulfillment}
            />
          )}

          {/* 5. ARTISAN INVENTORY & FRESHNESS BATCHES */}
          {activeSection === "inventory" && (
            <InventoryStockManager listings={listings} />
          )}

          {/* 6. TIDAL SLOTS & CAPACITY */}
          {activeSection === "slots" && (
            <SlotManager slots={slots} listings={listings} />
          )}

          {/* 7. COASTAL WEATHER & SAFETY COMMAND */}
          {activeSection === "safety" && (
            <CoastalSafetyCommand slots={slots} listings={listings} />
          )}

          {/* 8. HOST & ARTISAN PAYOUTS LEDGER */}
          {activeSection === "payouts" && (
            <HostPayoutsLedger orders={orders} listings={listings} />
          )}

          {/* 9. REFUNDS & DISPUTES CONSOLE */}
          {activeSection === "refunds" && <RefundsManager orders={orders} />}

          {/* 10. SPECIAL LISTINGS (HERO SPOTLIGHT) */}
          {activeSection === "spotlight" && (
            <SpecialListingsManager
              listings={listings}
              spotlightListingIds={spotlightListingIds}
              onReorder={reorderSpotlight}
              onToggle={toggleSpotlight}
            />
          )}

          {/* 11. COMMUNICATIONS HUB */}
          {activeSection === "communications" && (
            <CommunicationsHub orders={orders} listings={listings} />
          )}
        </div>
      </main>
    </div>
  );
};
