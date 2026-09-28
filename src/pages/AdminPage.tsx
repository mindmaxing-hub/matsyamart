import React, { useState } from "react";
import { useData } from "../context/DataContext";
import { supabase, isSupabaseConfigured } from "../lib/supabase";
import { ManifestTable } from "../components/admin/ManifestTable";
import { SlotManager } from "../components/admin/SlotManager";
import { ProposalQueue } from "../components/admin/ProposalQueue";
import {
  ShieldCheck,
  Users,
  Calendar,
  Layers,
  Lock,
  KeyRound,
  Mail,
  ArrowRight,
  AlertCircle,
} from "lucide-react";

export const AdminPage: React.FC = () => {
  const { orders, listings, slots, proposals } = useData();

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
  const [activeTab, setActiveTab] = useState<
    "manifest" | "slots" | "proposals"
  >("manifest");

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

  if (!isAuthenticated) {
    return (
      <div className="min-h-[75vh] flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl border border-slate-200 shadow-modal w-full max-w-md p-8 space-y-6">
          <div className="text-center space-y-2">
            <div className="w-12 h-12 rounded-2xl bg-ocean-900 text-sun-300 flex items-center justify-center mx-auto shadow-md">
              <Lock className="w-6 h-6" />
            </div>
            <h2 className="font-display font-bold text-2xl text-ocean-950">
              Coordinator Portal
            </h2>
            <p className="text-xs text-slate-500">
              Restricted to Bhoomiputra Foundation community leaders & verified
              tour guides.
            </p>
          </div>

          {/* Toggle between Passcode and Supabase Auth */}
          {isSupabaseConfigured && (
            <div className="flex rounded-xl bg-slate-100 p-1 border border-slate-200 text-xs">
              <button
                type="button"
                onClick={() => setAuthMode("passcode")}
                className={`flex-1 py-1.5 rounded-lg font-semibold transition-all ${
                  authMode === "passcode"
                    ? "bg-white text-ocean-950 shadow-xs"
                    : "text-slate-600"
                }`}
              >
                Passcode Gate
              </button>
              <button
                type="button"
                onClick={() => setAuthMode("supabase")}
                className={`flex-1 py-1.5 rounded-lg font-semibold transition-all ${
                  authMode === "supabase"
                    ? "bg-white text-ocean-950 shadow-xs"
                    : "text-slate-600"
                }`}
              >
                Supabase Auth
              </button>
            </div>
          )}

          {authMode === "passcode" ? (
            <form onSubmit={handlePasscodeLogin} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">
                  Enter Coordinator Passcode
                </label>
                <div className="relative">
                  <KeyRound className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    required
                    placeholder="Enter passcode..."
                    value={passcode}
                    onChange={(e) => setPasscode(e.target.value)}
                    className="w-full text-xs pl-9 pr-3 py-3 rounded-xl border border-slate-200 focus:border-ocean-600 outline-none"
                  />
                </div>
              </div>

              {errorMsg && (
                <div className="p-2.5 rounded-lg bg-rose-50 border border-rose-200 text-xs text-rose-700 flex items-center gap-1.5">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}

              <button
                type="submit"
                className="w-full py-3 bg-ocean-800 hover:bg-ocean-900 text-white rounded-xl text-xs font-semibold shadow-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <span>Unlock Admin Dashboard</span>
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
                className="w-full text-center text-[11px] text-ocean-700 hover:underline pt-1 cursor-pointer"
              >
                ⚡ Quick Demo Login (matsya2026)
              </button>
            </form>
          ) : (
            <form onSubmit={handleSupabaseLogin} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">
                  Coordinator Email
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    required
                    placeholder="coordinator@bhoomiputra.org"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full text-xs pl-9 pr-3 py-3 rounded-xl border border-slate-200 focus:border-ocean-600 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">
                  Password
                </label>
                <div className="relative">
                  <KeyRound className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    required
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full text-xs pl-9 pr-3 py-3 rounded-xl border border-slate-200 focus:border-ocean-600 outline-none"
                  />
                </div>
              </div>

              {errorMsg && (
                <div className="p-2.5 rounded-lg bg-rose-50 border border-rose-200 text-xs text-rose-700 flex items-center gap-1.5">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 bg-ocean-800 hover:bg-ocean-900 text-white rounded-xl text-xs font-semibold shadow-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                <span>
                  {isLoading ? "Verifying..." : "Sign In with Supabase"}
                </span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </form>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider bg-ocean-100 text-ocean-800 px-2.5 py-0.5 rounded-full">
              Foundation Ops
            </span>
            <span className="text-xs text-emerald-700 font-semibold flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5" /> Super Admin Access
            </span>
          </div>

          <h1 className="font-display font-bold text-2xl sm:text-3xl text-ocean-950 mt-1">
            Community Manifest & Capacity Control
          </h1>
        </div>

        <button
          onClick={handleLogout}
          className="self-start sm:self-auto px-3.5 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors cursor-pointer"
        >
          Sign Out
        </button>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2 overflow-x-auto scrollbar-none">
        <button
          onClick={() => setActiveTab("manifest")}
          className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer ${
            activeTab === "manifest"
              ? "bg-ocean-900 text-white shadow-xs"
              : "text-slate-600 hover:bg-slate-100"
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Live Attendee Manifest ({orders.length})</span>
        </button>

        <button
          onClick={() => setActiveTab("slots")}
          className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer ${
            activeTab === "slots"
              ? "bg-ocean-900 text-white shadow-xs"
              : "text-slate-600 hover:bg-slate-100"
          }`}
        >
          <Calendar className="w-4 h-4" />
          <span>Slot & Capacity Manager ({slots.length})</span>
        </button>

        <button
          onClick={() => setActiveTab("proposals")}
          className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer ${
            activeTab === "proposals"
              ? "bg-ocean-900 text-white shadow-xs"
              : "text-slate-600 hover:bg-slate-100"
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>Vendor Proposals Queue ({proposals.length})</span>
        </button>
      </div>

      {/* Tab Panels */}
      {activeTab === "manifest" && (
        <ManifestTable orders={orders} listings={listings} />
      )}
      {activeTab === "slots" && (
        <SlotManager slots={slots} listings={listings} />
      )}
      {activeTab === "proposals" && <ProposalQueue proposals={proposals} />}
    </div>
  );
};
