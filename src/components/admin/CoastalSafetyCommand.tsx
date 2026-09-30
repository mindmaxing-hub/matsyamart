import React, { useState } from "react";
import {
  Waves,
  AlertTriangle,
  ShieldAlert,
  ShieldCheck,
  PhoneCall,
  Clock,
  Compass,
  Radio,
  Send,
  CheckCircle2,
  Calendar,
} from "lucide-react";
import { ExperienceSlot, Listing, ZoneSafetyIncident } from "../../types";
import { formatDate } from "../../lib/utils";

interface CoastalSafetyCommandProps {
  slots: ExperienceSlot[];
  listings: Listing[];
}

const SEED_SAFETY_ZONES: ZoneSafetyIncident[] = [
  {
    id: "zone-01",
    zone_name: "Mahim Bay & Rocky Intertidal Shelf",
    status: "normal",
    swell_height_m: 0.6,
    tide_phase: "Spring Low Tide 0.32m (Optimal)",
    advisory_message:
      "Water clarity good. Reef walk conditions safe. Non-slip reef shoes mandatory for rocky shelf.",
    last_updated: new Date().toISOString(),
  },
  {
    id: "zone-02",
    zone_name: "Versova Koliwada Coast & Channel",
    status: "caution",
    swell_height_m: 1.4,
    tide_phase: "Mid Tide Falling (Moderate Current)",
    advisory_message:
      "Moderate channel chop outside the jetty breakwater. Lifejackets required for all boat transitions.",
    last_updated: new Date().toISOString(),
  },
  {
    id: "zone-03",
    zone_name: "Thane Creek Flamingo Estuary",
    status: "normal",
    swell_height_m: 0.2,
    tide_phase: "Low Slag Tide (Calm Waters)",
    advisory_message:
      "Sheltered estuary conditions. Flamingo feeding visible along western mudflats.",
    last_updated: new Date().toISOString(),
  },
  {
    id: "zone-04",
    zone_name: "Uran Coastal Mangrove Zone",
    status: "normal",
    swell_height_m: 0.4,
    tide_phase: "Ebb Tide (Safe Mud Crossing)",
    advisory_message:
      "Mangrove boardwalk accessible. Low tide exposed crab channels.",
    last_updated: new Date().toISOString(),
  },
];

export const CoastalSafetyCommand: React.FC<CoastalSafetyCommandProps> = ({
  slots,
  listings,
}) => {
  const [zones, setZones] = useState<ZoneSafetyIncident[]>(() => {
    try {
      const saved = localStorage.getItem("matsyamart_safety_zones_v1");
      return saved ? JSON.parse(saved) : SEED_SAFETY_ZONES;
    } catch {
      return SEED_SAFETY_ZONES;
    }
  });

  const [selectedLockdownZone, setSelectedLockdownZone] = useState<
    string | null
  >(null);
  const [lockdownReason, setLockdownReason] = useState<string>(
    "IMD High Swell & Arabian Sea Surge Warning",
  );
  const [alertSuccessMsg, setAlertSuccessMsg] = useState<string>("");

  const saveZones = (updated: ZoneSafetyIncident[]) => {
    setZones(updated);
    try {
      localStorage.setItem(
        "matsyamart_safety_zones_v1",
        JSON.stringify(updated),
      );
    } catch (e) {
      console.warn("Storage error", e);
    }
  };

  const handleUpdateZoneStatus = (
    zoneId: string,
    status: "normal" | "caution" | "lockdown",
  ) => {
    const updated = zones.map((z) => {
      if (z.id === zoneId) {
        return {
          ...z,
          status,
          last_updated: new Date().toISOString(),
        };
      }
      return z;
    });
    saveZones(updated);
    setAlertSuccessMsg(
      `Zone status updated to ${status.toUpperCase()} successfully.`,
    );
    setTimeout(() => setAlertSuccessMsg(""), 3000);
  };

  const handleUpdateAdvisory = (zoneId: string, msg: string) => {
    const updated = zones.map((z) =>
      z.id === zoneId
        ? {
            ...z,
            advisory_message: msg,
            last_updated: new Date().toISOString(),
          }
        : z,
    );
    saveZones(updated);
  };

  const handleConfirmLockdown = () => {
    if (!selectedLockdownZone) return;
    const target = zones.find((z) => z.id === selectedLockdownZone);
    if (!target) return;

    handleUpdateZoneStatus(selectedLockdownZone, "lockdown");
    setAlertSuccessMsg(
      `LOCKDOWN PROTOCOL ACTIVATED for ${target.zone_name}. Emergency advisory broadcast generated!`,
    );
    setSelectedLockdownZone(null);
    setTimeout(() => setAlertSuccessMsg(""), 4000);
  };

  const cautionZonesCount = zones.filter((z) => z.status === "caution").length;
  const lockdownZonesCount = zones.filter(
    (z) => z.status === "lockdown",
  ).length;

  return (
    <div className="space-y-6">
      {/* 4 Safety Status KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-500">
            <span>Coastal Zones Monitored</span>
            <Compass className="w-4 h-4 text-[#e3a157]" />
          </div>
          <div className="font-display font-bold text-2xl text-slate-900">
            {zones.length} Zones
          </div>
          <div className="text-[11px] text-slate-400">
            Mumbai & Thane shoreline
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-500">
            <span>Normal Water Conditions</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="font-display font-bold text-2xl text-emerald-600">
            {zones.filter((z) => z.status === "normal").length} Zones
          </div>
          <div className="text-[11px] text-slate-400">
            Optimal tidal window active
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-500">
            <span>Cautionary Swell</span>
            <AlertTriangle className="w-4 h-4 text-amber-600" />
          </div>
          <div className="font-display font-bold text-2xl text-amber-600">
            {cautionZonesCount} Zones
          </div>
          <div className="text-[11px] text-slate-400">
            Increased guide vigilance
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-500">
            <span>Emergency Lockdowns</span>
            <ShieldAlert className="w-4 h-4 text-rose-600" />
          </div>
          <div className="font-display font-bold text-2xl text-rose-600">
            {lockdownZonesCount} Zones
          </div>
          <div className="text-[11px] text-slate-400">
            Tours suspended for safety
          </div>
        </div>
      </div>

      {alertSuccessMsg && (
        <div className="p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-xl flex items-center gap-2 shadow-xs">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{alertSuccessMsg}</span>
        </div>
      )}

      {/* Main Grid: Zones Cards on Left, Emergency Hotlines on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* LEFT 2 COLS: Zone Safety Matrix */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-display font-bold text-base text-slate-900">
              Live Coastal Zone Conditions & Swell Monitor
            </h3>
            <span className="text-xs text-slate-500">
              Updated automatically via coordinator network
            </span>
          </div>

          <div className="space-y-4">
            {zones.map((zone) => {
              const isNormal = zone.status === "normal";
              const isCaution = zone.status === "caution";
              const isLockdown = zone.status === "lockdown";

              return (
                <div
                  key={zone.id}
                  className={`bg-white rounded-2xl border p-5 space-y-4 shadow-xs transition-all ${
                    isLockdown
                      ? "border-rose-300 ring-2 ring-rose-100"
                      : isCaution
                        ? "border-amber-300 ring-2 ring-amber-50"
                        : "border-slate-200/80"
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-display font-bold text-base text-slate-900">
                          {zone.zone_name}
                        </span>
                        <span
                          className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase border ${
                            isNormal
                              ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                              : isCaution
                                ? "bg-amber-50 text-amber-700 border-amber-200"
                                : "bg-rose-50 text-rose-700 border-rose-200 animate-pulse"
                          }`}
                        >
                          {zone.status.toUpperCase()}
                        </span>
                      </div>
                      <div className="text-xs text-slate-500 mt-1 flex items-center gap-3 flex-wrap">
                        <span>Tide: {zone.tide_phase}</span>
                        <span>•</span>
                        <span>Swell: {zone.swell_height_m}m</span>
                      </div>
                    </div>

                    {/* Status Toggles */}
                    <div className="flex items-center gap-1.5 self-start sm:self-auto">
                      <button
                        onClick={() =>
                          handleUpdateZoneStatus(zone.id, "normal")
                        }
                        className={`px-2.5 py-1 text-xs font-semibold rounded-lg border transition-all cursor-pointer ${
                          isNormal
                            ? "bg-emerald-600 text-white border-emerald-600 shadow-xs"
                            : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
                        }`}
                      >
                        Normal
                      </button>
                      <button
                        onClick={() =>
                          handleUpdateZoneStatus(zone.id, "caution")
                        }
                        className={`px-2.5 py-1 text-xs font-semibold rounded-lg border transition-all cursor-pointer ${
                          isCaution
                            ? "bg-amber-600 text-white border-amber-600 shadow-xs"
                            : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
                        }`}
                      >
                        Caution
                      </button>
                      <button
                        onClick={() => setSelectedLockdownZone(zone.id)}
                        className={`px-2.5 py-1 text-xs font-semibold rounded-lg border transition-all cursor-pointer ${
                          isLockdown
                            ? "bg-rose-600 text-white border-rose-600 shadow-xs"
                            : "bg-white text-rose-600 border-rose-200 hover:bg-rose-50"
                        }`}
                      >
                        Lockdown
                      </button>
                    </div>
                  </div>

                  {/* Advisory Text Editor */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-600 block">
                      Coastal Advisory & Safety Briefing
                    </label>
                    <input
                      type="text"
                      value={zone.advisory_message}
                      onChange={(e) =>
                        handleUpdateAdvisory(zone.id, e.target.value)
                      }
                      className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 outline-none focus:bg-white focus:border-slate-900 shadow-xs"
                    />
                  </div>

                  {/* Quick Action: Open WhatsApp Broadcast */}
                  <div className="flex items-center justify-between text-xs pt-1">
                    <span className="text-[11px] text-slate-400">
                      Last logged: {formatDate(zone.last_updated)}
                    </span>
                    <a
                      href={`https://wa.me/?text=${encodeURIComponent(
                        `🌊 MATSYAMART COASTAL ADVISORY [${zone.zone_name.toUpperCase()}]: Condition is currently ${zone.status.toUpperCase()}. ${zone.advisory_message}`,
                      )}`}
                      target="_blank"
                      rel="noreferrer"
                      className="text-emerald-700 hover:text-emerald-800 font-semibold inline-flex items-center gap-1 cursor-pointer"
                    >
                      <Send className="w-3 h-3" />
                      <span>Broadcast Advisory to Guides & Guests</span>
                    </a>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* RIGHT COL: Emergency Response Hotlines & Protocol */}
        <div className="space-y-5">
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-4">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
              <PhoneCall className="w-4 h-4 text-rose-600" />
              <h4 className="font-display font-bold text-sm text-slate-900">
                Coastal Emergency Hotlines
              </h4>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 space-y-1">
                <div className="font-semibold text-slate-900">
                  Mumbai Coastal Police (Mahim Post)
                </div>
                <div className="font-mono text-slate-700 font-bold">
                  022-2444 8911
                </div>
                <div className="text-[10px] text-slate-400">
                  Direct radio link for reef shallows
                </div>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 space-y-1">
                <div className="font-semibold text-slate-900">
                  Versova Lifeguard Watchtower
                </div>
                <div className="font-mono text-slate-700 font-bold">
                  +91 98200 44199
                </div>
                <div className="text-[10px] text-slate-400">
                  Beach patrol & rescue boat dispatch
                </div>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 space-y-1">
                <div className="font-semibold text-slate-900">
                  Maharashtra Maritime Board (MMB)
                </div>
                <div className="font-mono text-slate-700 font-bold">
                  022-2266 2110
                </div>
                <div className="text-[10px] text-slate-400">
                  Trawler traffic & weather notices
                </div>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 space-y-1">
                <div className="font-semibold text-slate-900">
                  Indian Navy Coastal SAR Hotline
                </div>
                <div className="font-mono text-rose-700 font-bold">
                  1093 (Toll Free)
                </div>
                <div className="text-[10px] text-slate-400">
                  Arabian Sea maritime rescue
                </div>
              </div>
            </div>
          </div>

          {/* Safety Protocols Card */}
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 shadow-xs space-y-3">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <h4 className="font-display font-bold text-sm text-slate-900">
                Safety Checklist Invariants
              </h4>
            </div>
            <ul className="text-xs text-slate-600 space-y-2 list-disc list-inside">
              <li>1 guide assigned for every 12 attendees max.</li>
              <li>Lifejackets mandatory on all boat crossings.</li>
              <li>
                First aid kit with saline rinse & gauze on every reef walk.
              </li>
              <li>Tidal walks terminate 45 min before high tide turn.</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Emergency Lockdown Confirmation Modal */}
      {selectedLockdownZone && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
          <div className="bg-white rounded-3xl border border-rose-300 shadow-2xl w-full max-w-md p-6 space-y-5 text-slate-900">
            <div className="flex items-center gap-2.5 text-rose-600 border-b border-slate-100 pb-3">
              <ShieldAlert className="w-5 h-5 shrink-0" />
              <h3 className="font-display font-bold text-base text-slate-900">
                Initiate Zone Emergency Lockdown
              </h3>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              You are declaring an emergency lockdown for{" "}
              <strong className="text-slate-900 font-bold">
                {zones.find((z) => z.id === selectedLockdownZone)?.zone_name}
              </strong>
              . This will suspend coastal operations, trigger WhatsApp storm
              briefings, and initiate automated voucher credits.
            </p>

            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">
                Emergency Declaration Reason
              </label>
              <input
                type="text"
                value={lockdownReason}
                onChange={(e) => setLockdownReason(e.target.value)}
                className="w-full text-xs px-3 py-2 bg-white text-slate-900 border border-slate-200 rounded-xl outline-none focus:border-rose-600 shadow-xs"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setSelectedLockdownZone(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 cursor-pointer shadow-xs"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmLockdown}
                className="px-4 py-2 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-xl shadow-xs cursor-pointer flex items-center gap-1.5"
              >
                <ShieldAlert className="w-3.5 h-3.5" />
                <span>Confirm Emergency Lockdown</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
