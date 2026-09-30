import React, { useState, useMemo } from "react";
import { useData } from "../context/DataContext";
import { supabase, isSupabaseConfigured } from "../lib/supabase";
import { ManifestTable } from "../components/admin/ManifestTable";
import { SlotManager } from "../components/admin/SlotManager";
import { ProductOrdersTable } from "../components/admin/ProductOrdersTable";
import { CommunicationsHub } from "../components/admin/CommunicationsHub";
import { SpecialListingsManager } from "../components/admin/SpecialListingsManager";
import { MultiQueueManager } from "../components/admin/MultiQueueManager";
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
} from "lucide-react";

type AdminSectionId =
  | "overview"
  | "queues"
  | "manifest"
  | "goods"
  | "slots"
  | "spotlight"
  | "communications";

interface NavItem {
  id: AdminSectionId;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  heading: string;
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

  // Active section (defaults to review queue matching reference screenshot)
  const [activeSection, setActiveSection] = useState<AdminSectionId>("queues");

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
      heading: "Operations Executive Overview",
      subtitle:
        "Consolidated real-time metrics across coastal walks, D2C pantry goods, community moderation, and tidal schedules.",
    },
    {
      id: "queues",
      label: "Review Queue",
      icon: ShieldCheck,
      heading: "Community Submissions & Moderation Queue",
      subtitle:
        "Review and approve host tour proposals, artisan product submissions, corporate inquiries, and reschedule notices.",
      badge: pendingProposalsCount,
    },
    {
      id: "manifest",
      label: "Events & Walks",
      icon: Calendar,
      heading: "Attendee Manifest & Guest Check-Ins",
      subtitle:
        "Tidal tour attendee lists, digital ticket validation codes, emergency contacts, and printable attendance sheets.",
    },
    {
      id: "goods",
      label: "D2C Goods Orders",
      icon: Package,
      heading: "D2C Physical Goods & Courier Dispatch",
      subtitle:
        "Manage packaging, courier tracking AWB updates, delivery statuses, and artisan collective remittances.",
    },
    {
      id: "slots",
      label: "Tidal Slots & Capacity",
      icon: Clock,
      heading: "Tidal Windows & Booking Capacities",
      subtitle:
        "Control weekend low-tide safari capacity, sunrise slot availability, and village guide assignments.",
    },
    {
      id: "spotlight",
      label: "Special Listings (Hero)",
      icon: Sparkles,
      heading: "Hero Showcase & Curated Spotlight",
      subtitle:
        "Curate and reorder the fanning photo constellation displayed on the public customer storefront hero banner.",
    },
    {
      id: "communications",
      label: "Communications Hub",
      icon: MessageSquare,
      heading: "WhatsApp Passes & Attendee Broadcasts",
      subtitle:
        "Instant WhatsApp digital ticket dispatch, tidal weather advisory broadcasts, and automated email receipts.",
    },
  ];

  const currentNav =
    NAV_ITEMS.find((item) => item.id === activeSection) ?? NAV_ITEMS[0]!;

  // 1. Passcode / Login Gate (Amber Canvas + Elevated Cream Card)
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#e3a157] flex flex-col items-center justify-center p-4 selection:bg-[#29100b] selection:text-[#f5edeb]">
        <div className="bg-[#fdfbf7] rounded-3xl border border-[#dab38c]/40 shadow-2xl w-full max-w-md p-8 space-y-6 text-[#29100b]">
          <div className="text-center space-y-2">
            <div className="w-12 h-12 rounded-2xl bg-[#29100b] text-[#e3a157] border border-[#dab38c]/30 flex items-center justify-center mx-auto shadow-md">
              <Lock className="w-6 h-6" />
            </div>
            <div className="text-[10px] font-bold tracking-[0.25em] text-[#5d3a24]/80 uppercase">
              WORKSPACE AUTHENTICATION
            </div>
            <h2 className="font-display font-bold text-2xl text-[#29100b]">
              MatsyaMart Operations
            </h2>
            <p className="text-xs text-[#5d3a24]/80">
              Restricted to verified coastal community leaders and tour
              coordinators.
            </p>
          </div>

          {/* Toggle between Passcode and Supabase Auth */}
          {isSupabaseConfigured && (
            <div className="flex rounded-xl bg-[#f5ede4] p-1 border border-[#dab38c]/30 text-xs">
              <button
                type="button"
                onClick={() => setAuthMode("passcode")}
                className={`flex-1 py-1.5 rounded-lg font-semibold transition-all cursor-pointer ${
                  authMode === "passcode"
                    ? "bg-[#29100b] text-[#f5edeb] shadow-xs"
                    : "text-[#5d3a24] hover:text-[#29100b]"
                }`}
              >
                Passcode Gate
              </button>
              <button
                type="button"
                onClick={() => setAuthMode("supabase")}
                className={`flex-1 py-1.5 rounded-lg font-semibold transition-all cursor-pointer ${
                  authMode === "supabase"
                    ? "bg-[#29100b] text-[#f5edeb] shadow-xs"
                    : "text-[#5d3a24] hover:text-[#29100b]"
                }`}
              >
                Supabase Auth
              </button>
            </div>
          )}

          {authMode === "passcode" ? (
            <form onSubmit={handlePasscodeLogin} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-[#5d3a24] block mb-1">
                  Enter Coordinator Passcode
                </label>
                <div className="relative">
                  <KeyRound className="w-4 h-4 text-[#5d3a24]/50 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    required
                    placeholder="Enter passcode..."
                    value={passcode}
                    onChange={(e) => setPasscode(e.target.value)}
                    className="w-full text-xs pl-9 pr-3 py-3 rounded-xl bg-white text-[#29100b] border border-[#dab38c]/40 focus:border-[#29100b] outline-none shadow-xs"
                  />
                </div>
              </div>

              {errorMsg && (
                <div className="p-2.5 rounded-lg bg-rose-50 border border-rose-300 text-xs text-rose-800 flex items-center gap-1.5">
                  <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                  <span>{errorMsg}</span>
                </div>
              )}

              <button
                type="submit"
                className="w-full py-3 bg-[#29100b] hover:bg-[#481f14] text-[#f5edeb] rounded-xl text-xs font-bold shadow-md transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <span>Unlock Operations Command Center</span>
                <ArrowRight className="w-3.5 h-3.5 text-[#e3a157]" />
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
                className="w-full text-center text-[11px] text-[#29100b] font-semibold hover:underline pt-1 cursor-pointer"
              >
                ⚡ Quick Demo Login (matsya2026)
              </button>
            </form>
          ) : (
            <form onSubmit={handleSupabaseLogin} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-[#5d3a24] block mb-1">
                  Coordinator Email
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-[#5d3a24]/50 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    required
                    placeholder="coordinator@bhoomiputra.org"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full text-xs pl-9 pr-3 py-3 rounded-xl bg-white text-[#29100b] border border-[#dab38c]/40 focus:border-[#29100b] outline-none shadow-xs"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-[#5d3a24] block mb-1">
                  Password
                </label>
                <div className="relative">
                  <KeyRound className="w-4 h-4 text-[#5d3a24]/50 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    required
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full text-xs pl-9 pr-3 py-3 rounded-xl bg-white text-[#29100b] border border-[#dab38c]/40 focus:border-[#29100b] outline-none shadow-xs"
                  />
                </div>
              </div>

              {errorMsg && (
                <div className="p-2.5 rounded-lg bg-rose-50 border border-rose-300 text-xs text-rose-800 flex items-center gap-1.5">
                  <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                  <span>{errorMsg}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 bg-[#29100b] hover:bg-[#481f14] text-[#f5edeb] rounded-xl text-xs font-bold shadow-md transition-colors flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                <span>
                  {isLoading ? "Verifying..." : "Sign In with Supabase"}
                </span>
                <ArrowRight className="w-3.5 h-3.5 text-[#e3a157]" />
              </button>
            </form>
          )}

          <div className="pt-2 border-t border-[#dab38c]/25 text-center">
            <Link
              to="/"
              className="text-xs text-[#5d3a24] hover:text-[#29100b] inline-flex items-center gap-1 transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5 text-[#e3a157]" />
              <span>Return to Customer Storefront</span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // 2. Main Authenticated Dashboard Shell (Matching Image 2 Lovable Workspace Layout)
  return (
    <div className="min-h-screen flex bg-[#e3a157] text-[#29100b] selection:bg-[#29100b] selection:text-[#f5edeb]">
      {/* LEFT SIDEBAR: Clean rows matching Image 2 */}
      <aside className="w-64 sm:w-72 bg-[#fdfbf7] border-r border-[#dab38c]/35 flex flex-col justify-between shrink-0 min-h-screen sticky top-0 h-screen z-30 shadow-md">
        <div>
          {/* Header Branding */}
          <div className="p-5 border-b border-[#dab38c]/25">
            <div className="text-[10px] font-bold tracking-[0.25em] text-[#5d3a24]/70 uppercase">
              WORKSPACE
            </div>
            <div className="font-display font-bold text-xl text-[#29100b] mt-1 flex items-center gap-1.5">
              <span>MatsyaMart</span>
              <span className="text-[#e3a157] font-bold text-lg leading-none">
                ✦
              </span>
            </div>
            <div className="text-[11px] text-[#5d3a24]/75 mt-0.5">
              Coastal Operations Hub
            </div>
          </div>

          {/* Navigation Rows */}
          <nav className="p-3 space-y-1 overflow-y-auto max-h-[calc(100vh-190px)] scrollbar-none">
            {NAV_ITEMS.map((item) => {
              const isActive = activeSection === item.id;
              const Icon = item.icon;

              return (
                <button
                  key={item.id}
                  onClick={() => setActiveSection(item.id)}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                    isActive
                      ? "bg-[#29100b] text-[#f5edeb] shadow-sm"
                      : "text-[#5d3a24] hover:bg-[#dab38c]/15 hover:text-[#29100b]"
                  }`}
                >
                  <div className="flex items-center gap-2.5 truncate">
                    <Icon
                      className={`w-4 h-4 shrink-0 ${
                        isActive ? "text-[#e3a157]" : "text-[#5d3a24]"
                      }`}
                    />
                    <span className="truncate">{item.label}</span>
                  </div>

                  {item.badge !== undefined && item.badge > 0 && (
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        isActive
                          ? "bg-[#e3a157] text-[#29100b]"
                          : "bg-[#dab38c]/30 text-[#29100b]"
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
        <div className="p-4 border-t border-[#dab38c]/25 space-y-2.5 bg-[#fcf8f2]">
          <Link
            to="/"
            className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-xl border border-[#dab38c]/35 bg-white hover:bg-[#f5edeb] text-xs font-semibold text-[#29100b] transition-colors shadow-xs"
          >
            <ArrowLeft className="w-3.5 h-3.5 text-[#e3a157]" />
            <span>Back to Storefront</span>
          </Link>

          <div className="flex items-center justify-center gap-2 text-[10px] text-[#5d3a24]/75">
            <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse" />
            <span>Live Sync Active</span>
          </div>
        </div>
      </aside>

      {/* RIGHT MAIN WORKSPACE: Amber Background Canvas */}
      <main className="flex-1 flex flex-col min-w-0 bg-[#e3a157] overflow-y-auto min-h-screen">
        {/* Top Header Chrome matching Image 2 */}
        <header className="px-6 sm:px-10 py-3.5 flex items-center justify-between border-b border-[#29100b]/10 bg-[#e3a157] sticky top-0 z-20 backdrop-blur-xs">
          <div className="text-xs font-medium text-[#29100b]/80 flex items-center gap-1.5">
            <span className="opacity-60">Workspace</span>
            <span className="opacity-40">/</span>
            <span className="font-bold text-[#29100b]">{currentNav.label}</span>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-1.5 text-xs text-[#29100b] font-medium">
              <span className="font-mono text-xs">social@bhoomiputra.org</span>
              <span className="text-[10px] font-bold uppercase tracking-wider bg-[#29100b] text-[#f5edeb] px-2 py-0.5 rounded-md">
                ADMIN
              </span>
            </div>

            <button
              onClick={() => window.location.reload()}
              className="px-3 py-1.5 rounded-xl bg-white/80 hover:bg-white text-[#29100b] text-xs font-semibold border border-[#dab38c]/35 transition-all flex items-center gap-1.5 cursor-pointer shadow-xs"
              title="Refresh Data"
            >
              <RotateCcw className="w-3.5 h-3.5 text-[#29100b]" />
              <span>Refresh</span>
            </button>

            <button
              onClick={handleLogout}
              className="px-3 py-1.5 rounded-xl bg-white/80 hover:bg-white text-[#29100b] text-xs font-semibold border border-[#dab38c]/35 transition-all flex items-center gap-1.5 cursor-pointer shadow-xs"
              title="Sign Out"
            >
              <LogOut className="w-3.5 h-3.5 text-[#29100b]" />
              <span>Sign out</span>
            </button>
          </div>
        </header>

        {/* Workspace Canvas Container */}
        <div className="p-6 sm:p-10 space-y-6 max-w-7xl w-full mx-auto">
          {/* View Heading & Subtitle */}
          <div className="space-y-1">
            <h1 className="font-display font-bold text-2xl sm:text-3xl lg:text-4xl text-[#29100b] tracking-tight">
              {currentNav.heading}
            </h1>
            <p className="text-xs sm:text-sm text-[#5d3a24]/90 font-medium">
              {currentNav.subtitle}
            </p>
          </div>

          {/* Elevated Cream Workspace Card */}
          <div className="bg-[#fdfbf7] rounded-3xl border border-[#dab38c]/35 shadow-xl p-6 sm:p-8 min-h-[520px]">
            {/* 1. EXECUTIVE OVERVIEW */}
            {activeSection === "overview" && (
              <div className="space-y-8">
                {/* 4 KPI Metric Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="p-5 rounded-2xl bg-white border border-[#dab38c]/30 shadow-xs space-y-2">
                    <div className="flex items-center justify-between text-xs font-semibold text-[#5d3a24]/80">
                      <span>Total Revenue</span>
                      <TrendingUp className="w-4 h-4 text-[#e3a157]" />
                    </div>
                    <div className="font-display font-bold text-2xl text-[#29100b]">
                      {formatINR(overviewMetrics.totalRevenue)}
                    </div>
                    <div className="text-[11px] text-[#5d3a24]/70">
                      Experiences + D2C Goods
                    </div>
                  </div>

                  <div className="p-5 rounded-2xl bg-white border border-[#dab38c]/30 shadow-xs space-y-2">
                    <div className="flex items-center justify-between text-xs font-semibold text-[#5d3a24]/80">
                      <span>Tidal Walk Bookings</span>
                      <Calendar className="w-4 h-4 text-[#e3a157]" />
                    </div>
                    <div className="font-display font-bold text-2xl text-[#29100b]">
                      {overviewMetrics.experienceOrdersCount}
                    </div>
                    <div className="text-[11px] text-[#5d3a24]/70">
                      Confirmed guest passes
                    </div>
                  </div>

                  <div className="p-5 rounded-2xl bg-white border border-[#dab38c]/30 shadow-xs space-y-2">
                    <div className="flex items-center justify-between text-xs font-semibold text-[#5d3a24]/80">
                      <span>D2C Orders to Ship</span>
                      <Package className="w-4 h-4 text-[#e3a157]" />
                    </div>
                    <div className="font-display font-bold text-2xl text-[#29100b]">
                      {overviewMetrics.pendingFulfillments}
                    </div>
                    <div className="text-[11px] text-[#5d3a24]/70">
                      Awaiting courier tracking AWB
                    </div>
                  </div>

                  <div className="p-5 rounded-2xl bg-white border border-[#dab38c]/30 shadow-xs space-y-2">
                    <div className="flex items-center justify-between text-xs font-semibold text-[#5d3a24]/80">
                      <span>Pending Moderation</span>
                      <ShieldCheck className="w-4 h-4 text-[#e3a157]" />
                    </div>
                    <div className="font-display font-bold text-2xl text-[#29100b]">
                      {pendingProposalsCount}
                    </div>
                    <div className="text-[11px] text-[#5d3a24]/70">
                      Community proposals awaiting review
                    </div>
                  </div>
                </div>

                {/* Quick Navigation Cards */}
                <div className="space-y-3">
                  <h3 className="font-display font-bold text-base text-[#29100b]">
                    Quick Operational Jumps
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <button
                      onClick={() => setActiveSection("queues")}
                      className="p-4 rounded-2xl bg-white hover:bg-[#f5ede4] border border-[#dab38c]/30 text-left transition-colors flex items-center justify-between group cursor-pointer shadow-xs"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-[#29100b] text-[#e3a157] flex items-center justify-center">
                          <ShieldCheck className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="font-semibold text-xs text-[#29100b]">
                            Moderate Submissions
                          </div>
                          <div className="text-[11px] text-[#5d3a24]/70">
                            {pendingProposalsCount} pending decisions
                          </div>
                        </div>
                      </div>
                      <ArrowRight className="w-4 h-4 text-[#5d3a24] group-hover:translate-x-1 transition-transform" />
                    </button>

                    <button
                      onClick={() => setActiveSection("manifest")}
                      className="p-4 rounded-2xl bg-white hover:bg-[#f5ede4] border border-[#dab38c]/30 text-left transition-colors flex items-center justify-between group cursor-pointer shadow-xs"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-[#29100b] text-[#e3a157] flex items-center justify-center">
                          <Calendar className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="font-semibold text-xs text-[#29100b]">
                            Check-In Manifest
                          </div>
                          <div className="text-[11px] text-[#5d3a24]/70">
                            Validate guest passes & export CSV
                          </div>
                        </div>
                      </div>
                      <ArrowRight className="w-4 h-4 text-[#5d3a24] group-hover:translate-x-1 transition-transform" />
                    </button>

                    <button
                      onClick={() => setActiveSection("goods")}
                      className="p-4 rounded-2xl bg-white hover:bg-[#f5ede4] border border-[#dab38c]/30 text-left transition-colors flex items-center justify-between group cursor-pointer shadow-xs"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-[#29100b] text-[#e3a157] flex items-center justify-center">
                          <Package className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="font-semibold text-xs text-[#29100b]">
                            Fulfill D2C Goods
                          </div>
                          <div className="text-[11px] text-[#5d3a24]/70">
                            Update courier tracking AWBs
                          </div>
                        </div>
                      </div>
                      <ArrowRight className="w-4 h-4 text-[#5d3a24] group-hover:translate-x-1 transition-transform" />
                    </button>
                  </div>
                </div>

                {/* Recent Orders Snapshot */}
                <div className="space-y-3 pt-2">
                  <div className="flex items-center justify-between">
                    <h3 className="font-display font-bold text-base text-[#29100b]">
                      Recent Customer Transactions
                    </h3>
                    <button
                      onClick={() => setActiveSection("manifest")}
                      className="text-xs text-[#29100b] font-semibold hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      <span>View All Orders</span>
                      <ArrowRight className="w-3 h-3 text-[#e3a157]" />
                    </button>
                  </div>

                  <div className="border border-[#dab38c]/30 rounded-2xl overflow-hidden bg-white shadow-xs">
                    <div className="divide-y divide-[#dab38c]/20">
                      {orders.slice(0, 5).map((order) => {
                        const isExp = order.items.some(
                          (i) =>
                            i.listing?.type === "experience" ||
                            !order.shipping_address,
                        );

                        return (
                          <div
                            key={order.id}
                            className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                          >
                            <div className="space-y-1">
                              <div className="flex items-center gap-2">
                                <span className="font-mono font-bold text-[#29100b]">
                                  {order.order_ref}
                                </span>
                                <span
                                  className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                    isExp
                                      ? "bg-[#e3a157]/20 text-[#29100b]"
                                      : "bg-emerald-100 text-emerald-900"
                                  }`}
                                >
                                  {isExp
                                    ? "Coastal Experience"
                                    : "Artisan Goods"}
                                </span>
                              </div>
                              <div className="text-[#5d3a24]">
                                {order.customer_name} •{" "}
                                {order.items[0]?.listing?.title || "Tour Item"}
                              </div>
                            </div>

                            <div className="flex items-center gap-4 justify-between sm:justify-end">
                              <div className="text-right">
                                <div className="font-bold text-[#29100b]">
                                  {formatINR(order.total_amount_inr)}
                                </div>
                                <div className="text-[10px] text-[#5d3a24]/70">
                                  {formatDate(order.created_at)}
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
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

            {/* 5. TIDAL SLOTS & CAPACITY */}
            {activeSection === "slots" && (
              <SlotManager slots={slots} listings={listings} />
            )}

            {/* 6. SPECIAL LISTINGS (HERO SPOTLIGHT) */}
            {activeSection === "spotlight" && (
              <SpecialListingsManager
                listings={listings}
                spotlightListingIds={spotlightListingIds}
                onReorder={reorderSpotlight}
                onToggle={toggleSpotlight}
              />
            )}

            {/* 7. COMMUNICATIONS HUB */}
            {activeSection === "communications" && (
              <CommunicationsHub orders={orders} listings={listings} />
            )}
          </div>
        </div>
      </main>
    </div>
  );
};
