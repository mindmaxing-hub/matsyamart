import React, { useState, useMemo, useEffect } from "react";
import { useData } from "../context/DataContext";
import {
  AdminAuthProvider,
  useAdminAuth,
} from "../context/AdminAuthContext";
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
import { CouponManager } from "../components/admin/CouponManager";
import { StaffRolesManager } from "../components/admin/StaffRolesManager";
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
  Tag,
  Users,
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
  | "coupons"
  | "roles"
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

const AdminPageContent: React.FC = () => {
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

  const {
    user,
    role,
    signInWithGoogle,
    devSignInAs,
    signOut,
    canAccessSection,
    isLoading: isAuthLoading,
  } = useAdminAuth();

  const [activeSection, setActiveSection] = useState<AdminSectionId>("overview");
  const [passcode, setPasscode] = useState("");
  const [passcodeError, setPasscodeError] = useState("");

  // Ensure activeSection is accessible by the user's role
  useEffect(() => {
    if (user && role === "coordinator") {
      setActiveSection("manifest");
    }
  }, [user, role]);

  const pendingProposalsCount = useMemo(
    () => proposals.filter((p) => p.status === "pending_review").length,
    [proposals],
  );

  const overviewMetrics = useMemo(() => {
    const totalRev = orders.reduce((sum, o) => sum + o.total_amount_inr, 0);
    const expCount = orders.filter((o) =>
      o.items.some((i) => i.listing?.type === "experience"),
    ).length;
    const goodsCount = orders.filter((o) =>
      o.items.some((i) => i.listing?.type === "product"),
    ).length;
    const pendingFulfillments = orders.filter(
      (o) =>
        o.fulfillment_status === "unfulfilled" ||
        o.fulfillment_status === "processing",
    ).length;

    return { totalRev, expCount, goodsCount, pendingFulfillments };
  }, [orders]);

  const ALL_NAV_ITEMS: NavItem[] = [
    {
      id: "overview",
      label: "Overview",
      icon: Layers,
      kicker: "Pulse · this morning",
      editorialTitle:
        "The tide is in. <em class='italic text-[#E3A157]'>Here's the harbor.</em>",
      subtitle:
        "Revenue, bookings and active slots across Mumbai's coastal koliwadas — updated live from every booking.",
    },
    {
      id: "queues",
      label: "Review Queues",
      icon: ShieldCheck,
      badge: pendingProposalsCount,
      kicker: "Review & moderation",
      editorialTitle:
        "New proposals, <em class='italic text-[#E3A157]'>ready for a call.</em>",
      subtitle:
        "Village guides, home dining hosts and artisans waiting for onboarding — approve, decline or request details.",
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
        "Packing, AWBs, 10×4 shipping labels, and artisan remittances.",
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
        "Weekend batches, sunrise slots and guide assignments with guest list check-in roster.",
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
        "Reconcile village guide & artisan shares vs platform retainer. Track bank accounts, UPI IDs, and settlements.",
    },
    {
      id: "refunds",
      label: "Refunds & Vouchers",
      icon: RotateCcw,
      kicker: "Disputes · cancellation policy audit",
      editorialTitle:
        "Fair terms, <em class='italic text-[#E3A157]'>smooth vouchers.</em>",
      subtitle:
        "Audit cancellation policy eligibility, track Razorpay refund IDs, and issue digital credit vouchers.",
    },
    {
      id: "spotlight",
      label: "Special Listings (Hero)",
      icon: Sparkles,
      kicker: "Storefront · hero deck",
      editorialTitle:
        "Curate the <em class='italic text-[#E3A157]'>first impression.</em>",
      subtitle:
        "Listings that fan across the homepage banner. Reorder with arrows — card 1 sits far-left.",
    },
    {
      id: "coupons",
      label: "Promos & Coupons",
      icon: Tag,
      kicker: "Promotion Engine · BPF & seasonal discounts",
      editorialTitle:
        "Special terms, <em class='italic text-[#E3A157]'>happy members.</em>",
      subtitle:
        "Manage Bhoomiputra Foundation member codes, percentage discounts, and community seasonal promo codes.",
    },
    {
      id: "roles",
      label: "Staff Roles & Access",
      icon: Users,
      kicker: "RBAC Security · Admin / Manager / Coordinator",
      editorialTitle:
        "Verified staff, <em class='italic text-[#E3A157]'>safe harbours.</em>",
      subtitle:
        "Control Google sign-in permissions across Admin, Manager, and Jetty Coordinator levels.",
    },
    {
      id: "communications",
      label: "Communications Hub",
      icon: MessageSquare,
      kicker: "Dispatch · WhatsApp + email",
      editorialTitle:
        "Messages that <em class='italic text-[#E3A157]'>reach the jetty.</em>",
      subtitle:
        "Tidal advisories, digital passes and receipts from hello@matsyamart.com.",
    },
  ];

  // Filter NAV items based on current role permissions
  const visibleNavItems = useMemo(
    () => ALL_NAV_ITEMS.filter((item) => canAccessSection(item.id)),
    [role],
  );

  const currentNav =
    visibleNavItems.find((item) => item.id === activeSection) ||
    visibleNavItems[0] ||
    ALL_NAV_ITEMS[0]!;

  // 1. Google Auth Gate & Role Tier Switcher (Dark Roast Editorial Theme)
  if (!user) {
    return (
      <div className="min-h-screen bg-[#1f0b07] flex flex-col items-center justify-center p-4 selection:bg-[#e3a157] selection:text-[#29100b] text-[#f5edeb]">
        <div className="bg-[#29100b] rounded-3xl border border-[#dab38c]/25 shadow-2xl w-full max-w-md p-8 sm:p-10 space-y-6">
          {/* Header */}
          <div className="text-center space-y-2">
            <div className="w-14 h-14 rounded-2xl bg-[#35160e] text-[#e3a157] border border-[#dab38c]/30 flex items-center justify-center mx-auto shadow-md">
              <Lock className="w-7 h-7" />
            </div>
            <div className="text-[11px] font-bold tracking-[0.14em] text-[#dab38c]/70 uppercase">
              COASTAL WORKSPACE AUTHENTICATION
            </div>
            <h2 className="font-display font-bold text-3xl text-[#f5edeb]">
              Matsya<em className="italic text-[#e3a157]">Mart</em>
            </h2>
            <p className="text-xs text-[#dab38c] leading-relaxed">
              Google Workspace portal for Kolibaba Seafood Inc &amp; Bhoomiputra Foundation team members.
            </p>
          </div>

          {/* Primary Action: Sign in with Google */}
          <div className="space-y-3 pt-2">
            <button
              onClick={() => signInWithGoogle()}
              disabled={isAuthLoading}
              className="w-full py-3.5 px-4 rounded-2xl bg-[#f5edeb] hover:bg-[#dab38c] text-[#29100b] font-bold text-xs sm:text-sm flex items-center justify-center gap-3 transition-all shadow-lg hover:scale-102 cursor-pointer"
            >
              {/* Google G SVG */}
              <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
              <span>Sign in with Google Workspace</span>
            </button>
          </div>

          {/* Quick Role Tester Buttons (Admin / Manager / Coordinator) */}
          <div className="pt-2 border-t border-[#dab38c]/15 space-y-2.5">
            <div className="text-[10px] font-bold uppercase tracking-wider text-[#dab38c]/60 text-center">
              Direct Role Simulator (Development / Evaluation)
            </div>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => devSignInAs("admin")}
                className="py-2 px-1.5 rounded-xl bg-[#35160e] hover:bg-[#481f14] border border-[#e3a157]/40 text-[#e3a157] text-[11px] font-bold text-center cursor-pointer transition-colors"
                title="Full system access"
              >
                👑 Admin
              </button>
              <button
                type="button"
                onClick={() => devSignInAs("manager")}
                className="py-2 px-1.5 rounded-xl bg-[#35160e] hover:bg-[#481f14] border border-sky-400/40 text-sky-300 text-[11px] font-bold text-center cursor-pointer transition-colors"
                title="Operational & logistical access"
              >
                💼 Manager
              </button>
              <button
                type="button"
                onClick={() => devSignInAs("coordinator")}
                className="py-2 px-1.5 rounded-xl bg-[#35160e] hover:bg-[#481f14] border border-emerald-400/40 text-emerald-300 text-[11px] font-bold text-center cursor-pointer transition-colors"
                title="On-ground check-in & manifest only"
              >
                ⚓ Coordinator
              </button>
            </div>
          </div>

          {/* Passcode alternative */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (passcode.trim() === "matsya2026" || passcode.trim() === "admin") {
                devSignInAs("admin");
              } else {
                setPasscodeError("Invalid passcode (Try: matsya2026)");
              }
            }}
            className="space-y-3 pt-1 border-t border-[#dab38c]/15"
          >
            <div>
              <label className="text-[11px] text-[#dab38c] font-semibold block mb-1">
                Or enter coordinator PIN
              </label>
              <div className="flex gap-2">
                <input
                  type="password"
                  placeholder="matsya2026"
                  value={passcode}
                  onChange={(e) => setPasscode(e.target.value)}
                  className="flex-1 px-3 py-2 bg-[#1f0b07] border border-[#dab38c]/30 rounded-xl text-xs text-[#f5edeb] font-mono outline-none focus:border-[#e3a157]"
                />
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#35160e] hover:bg-[#481f14] border border-[#dab38c]/30 text-[#e3a157] font-bold text-xs rounded-xl cursor-pointer"
                >
                  Enter
                </button>
              </div>
            </div>
            {passcodeError && (
              <div className="text-[11px] text-rose-400">{passcodeError}</div>
            )}
          </form>

          <div className="text-center">
            <Link
              to="/"
              className="text-xs text-[#dab38c]/70 hover:text-[#f5edeb] inline-flex items-center gap-1 transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Storefront</span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // 2. Main Authenticated Dashboard Shell
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

          {/* Navigation Rows (Filtered by RBAC) */}
          <nav className="flex flex-col gap-1 overflow-y-auto max-h-[calc(100vh-210px)] scrollbar-none">
            {visibleNavItems.map((item) => {
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

          <div className="flex items-center gap-3">
            <span className="font-mono text-[12px] text-[rgba(41,16,11,0.64)] hidden sm:inline">
              {user.email}
            </span>

            {/* Role Badge */}
            <span
              className={`text-[10px] font-bold tracking-[0.06em] rounded-full px-2.5 py-0.5 uppercase ${
                role === "admin"
                  ? "bg-[#29100B] text-[#E3A157] border border-[#29100B]"
                  : role === "manager"
                    ? "bg-sky-100 text-sky-800 border border-sky-300"
                    : "bg-emerald-100 text-emerald-800 border border-emerald-300"
              }`}
            >
              {role || "STAFF"}
            </span>

            <button
              onClick={() => signOut()}
              className="p-1.5 rounded-lg hover:bg-[rgba(41,16,11,0.08)] text-[rgba(41,16,11,0.64)] hover:text-[#29100B] transition-colors cursor-pointer"
              title="Sign Out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </header>

        {/* Hero Banner for current section */}
        <section className="px-6 sm:px-8 py-6 border-b border-[rgba(41,16,11,0.08)] bg-[#FFFDFB]/60">
          <div className="max-w-5xl">
            <div className="text-[11px] font-bold tracking-[0.08em] uppercase text-[#C67F2A]">
              {currentNav.kicker}
            </div>
            <h1
              className="font-display text-[28px] sm:text-[34px] tracking-[-0.02em] leading-[1.15] text-[#29100B] mt-1"
              dangerouslySetInnerHTML={{ __html: currentNav.editorialTitle }}
            />
            <p className="text-[13px] text-[rgba(41,16,11,0.64)] mt-1.5 max-w-3xl leading-relaxed">
              {currentNav.subtitle}
            </p>
          </div>
        </section>

        {/* Section Content Area */}
        <div className="p-6 sm:p-8 flex-1 max-w-7xl w-full">
          {/* 1. OVERVIEW */}
          {activeSection === "overview" && (
            <div className="space-y-8">
              {/* Metric Tiles */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="p-5 rounded-[16px] bg-[#FFFDFB] border border-[rgba(41,16,11,0.08)] shadow-[0_1px_2px_rgba(41,16,11,0.05),0_8px_28px_-12px_rgba(41,16,11,0.14)]">
                  <div className="text-[11px] font-bold tracking-[0.06em] uppercase text-[rgba(41,16,11,0.64)]">
                    Gross revenue
                  </div>
                  <div className="font-display text-[36px] tracking-[-0.02em] leading-[1.1] my-1.5 text-[#29100B]">
                    {formatINR(overviewMetrics.totalRev)}
                  </div>
                  <div className="text-[13px] text-[rgba(41,16,11,0.44)]">
                    Across {orders.length} total orders
                  </div>
                </div>

                <div className="p-5 rounded-[16px] bg-[#FFFDFB] border border-[rgba(41,16,11,0.08)] shadow-[0_1px_2px_rgba(41,16,11,0.05),0_8px_28px_-12px_rgba(41,16,11,0.14)]">
                  <div className="text-[11px] font-bold tracking-[0.06em] uppercase text-[rgba(41,16,11,0.64)]">
                    Walks &amp; workshops
                  </div>
                  <div className="font-display text-[36px] tracking-[-0.02em] leading-[1.1] my-1.5 text-[#29100B]">
                    {overviewMetrics.expCount}
                  </div>
                  <div className="text-[13px] text-[rgba(41,16,11,0.44)]">
                    Booked experience passes
                  </div>
                </div>

                <div className="p-5 rounded-[16px] bg-[#FFFDFB] border border-[rgba(41,16,11,0.08)] shadow-[0_1px_2px_rgba(41,16,11,0.05),0_8px_28px_-12px_rgba(41,16,11,0.14)]">
                  <div className="text-[11px] font-bold tracking-[0.06em] uppercase text-[rgba(41,16,11,0.64)]">
                    D2C goods packing
                  </div>
                  <div className="font-display text-[36px] tracking-[-0.02em] leading-[1.1] my-1.5 text-[#29100B]">
                    {overviewMetrics.pendingFulfillments}
                  </div>
                  <div className="text-[13px] text-[rgba(41,16,11,0.44)]">
                    Awaiting courier AWB / label
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
                    Community host proposals
                  </div>
                </div>
              </div>

              {/* Recent Orders Overview */}
              <div className="space-y-3">
                <div className="flex items-baseline gap-3">
                  <h2 className="font-display text-[22px] tracking-[-0.01em] font-normal text-[#29100B]">
                    Recent activity
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
                            {order.coupon_code && (
                              <span className="text-[10px] font-mono bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded font-bold">
                                {order.coupon_code}
                              </span>
                            )}
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

          {/* 11. PROMOS & COUPONS */}
          {activeSection === "coupons" && <CouponManager />}

          {/* 12. STAFF ROLES & ACCESS TIERS */}
          {activeSection === "roles" && <StaffRolesManager />}

          {/* 13. COMMUNICATIONS HUB */}
          {activeSection === "communications" && (
            <CommunicationsHub orders={orders} listings={listings} />
          )}
        </div>
      </main>
    </div>
  );
};

export const AdminPage: React.FC = () => {
  return (
    <AdminAuthProvider>
      <AdminPageContent />
    </AdminAuthProvider>
  );
};
