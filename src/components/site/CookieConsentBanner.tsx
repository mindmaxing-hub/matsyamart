import React, { useState, useEffect } from "react";
import { ShieldCheck, Cookie, X, Check } from "lucide-react";

const DPDP_CONSENT_KEY = "matsyamart_dpdp_consent_v1";

interface ConsentPreferences {
  essential: boolean; // Always true
  analytics: boolean;
  preferences: boolean;
  timestamp: string;
}

export const CookieConsentBanner: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [analyticsOptIn, setAnalyticsOptIn] = useState(false);

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout> | undefined;
    try {
      const saved = localStorage.getItem(DPDP_CONSENT_KEY);
      if (!saved) {
        timer = setTimeout(() => setIsVisible(true), 1000);
      }
    } catch {
      // Storage unavailable
    }
    return () => {
      if (timer) clearTimeout(timer);
    };
  }, []);

  useEffect(() => {
    const handleReopen = () => {
      setIsVisible(true);
      setShowDetails(true);
    };
    window.addEventListener("matsyamart_open_cookie_banner", handleReopen);
    return () =>
      window.removeEventListener("matsyamart_open_cookie_banner", handleReopen);
  }, []);

  const saveConsent = (prefs: ConsentPreferences) => {
    try {
      localStorage.setItem(DPDP_CONSENT_KEY, JSON.stringify(prefs));
    } catch (e) {
      console.warn("Could not save consent preference:", e);
    }
    setIsVisible(false);
  };

  const handleAcceptAll = () => {
    saveConsent({
      essential: true,
      analytics: true,
      preferences: true,
      timestamp: new Date().toISOString(),
    });
  };

  const handleAcceptEssential = () => {
    saveConsent({
      essential: true,
      analytics: false,
      preferences: false,
      timestamp: new Date().toISOString(),
    });
  };

  const handleSaveCustom = () => {
    saveConsent({
      essential: true,
      analytics: analyticsOptIn,
      preferences: true,
      timestamp: new Date().toISOString(),
    });
  };

  if (!isVisible) return null;

  return (
    <aside
      role="region"
      aria-label="Privacy and Cookie Consent"
      className="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-6 sm:max-w-lg z-50 bg-[#29100b]/95 backdrop-blur-md border border-[#dab38c]/30 rounded-2xl shadow-2xl p-5 text-[#f5edeb] transition-all animate-in fade-in slide-in-from-bottom-5 duration-300"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2 text-[#f5edeb] font-semibold text-sm">
          <div className="w-7 h-7 rounded-lg bg-[#35160e] border border-[#dab38c]/30 text-[#e3a157] flex items-center justify-center shrink-0">
            <Cookie className="w-4 h-4 text-[#e3a157]" />
          </div>
          <span>Digital Privacy & Cookie Consent</span>
        </div>
        <button
          onClick={handleAcceptEssential}
          className="text-[#dab38c] hover:text-[#f5edeb] p-1 rounded-lg"
          title="Dismiss and keep essential only"
          aria-label="Dismiss and accept essential cookies only"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      <p className="text-xs text-[#dab38c] mt-2.5 leading-relaxed">
        Under the{" "}
        <strong className="text-[#f5edeb] font-medium">
          Digital Personal Data Protection Act (DPDP), 2023
        </strong>
        , MatsyaMart uses essential session storage and cookies to retain your
        basket items and guest wishlist locally without requiring an account or
        collecting personal identifiers.
      </p>

      {showDetails && (
        <div className="mt-3.5 pt-3 border-t border-[#dab38c]/15 space-y-2 text-xs">
          <div className="flex items-center justify-between p-2 rounded-lg bg-[#35160e]/80 border border-[#dab38c]/20">
            <div className="pr-2">
              <p className="font-semibold text-[#f5edeb] flex items-center gap-1">
                <span>Essential Functional Storage</span>
                <span className="text-[10px] text-emerald-400 bg-emerald-950/60 px-1.5 py-0.5 rounded font-mono font-medium border border-emerald-600/30">
                  Required
                </span>
              </p>
              <p className="text-[11px] text-[#dab38c]/80 mt-0.5">
                Anonymous guest wishlist (
                <code className="text-[#e3a157]">matsyamart_wishlist</code>) and
                basket state. Stored on device only.
              </p>
            </div>
            <div className="w-5 h-5 rounded bg-emerald-600 text-white flex items-center justify-center shrink-0">
              <Check className="w-3.5 h-3.5 stroke-[3]" />
            </div>
          </div>

          <div className="flex items-center justify-between p-2 rounded-lg bg-[#35160e]/80 border border-[#dab38c]/20">
            <div className="pr-2">
              <p className="font-semibold text-[#f5edeb] flex items-center gap-1">
                <span>Anonymous Performance</span>
                <span className="text-[10px] text-[#dab38c] bg-[#29100b] px-1.5 py-0.5 rounded font-mono font-medium border border-[#dab38c]/20">
                  Optional
                </span>
              </p>
              <p className="text-[11px] text-[#dab38c]/80 mt-0.5">
                Aggregated page views and speed metrics to improve experience
                trails.
              </p>
            </div>
            <input
              type="checkbox"
              id="analytics-optin"
              checked={analyticsOptIn}
              onChange={(e) => setAnalyticsOptIn(e.target.checked)}
              className="w-4 h-4 rounded text-[#e3a157] border-[#dab38c]/30 focus:ring-[#e3a157] cursor-pointer"
            />
          </div>
        </div>
      )}

      {/* Buttons */}
      <div className="mt-4 flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-[#dab38c]/15">
        <button
          onClick={() => setShowDetails(!showDetails)}
          className="text-xs text-[#dab38c] hover:text-[#f5edeb] underline font-medium cursor-pointer"
        >
          {showDetails ? "Hide options" : "Manage preferences"}
        </button>

        <div className="flex items-center gap-2">
          {showDetails ? (
            <button
              onClick={handleSaveCustom}
              className="px-3 py-1.5 rounded-lg border border-[#dab38c]/30 text-[#f5edeb] hover:bg-[#35160e] text-xs font-semibold cursor-pointer transition-colors"
            >
              Save Choices
            </button>
          ) : (
            <button
              onClick={handleAcceptEssential}
              className="px-3 py-1.5 rounded-lg border border-[#dab38c]/30 text-[#f5edeb] hover:bg-[#35160e] text-xs font-semibold cursor-pointer transition-colors"
            >
              Essential Only
            </button>
          )}

          <button
            onClick={handleAcceptAll}
            className="px-3.5 py-1.5 rounded-lg bg-[#e3a157] hover:bg-[#dab38c] text-[#29100b] text-xs font-bold shadow-md cursor-pointer transition-colors flex items-center gap-1"
          >
            <ShieldCheck className="w-3.5 h-3.5 text-[#29100b]" />
            <span>Accept All</span>
          </button>
        </div>
      </div>
    </aside>
  );
};
