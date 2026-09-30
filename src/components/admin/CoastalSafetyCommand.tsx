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
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        <div className="p-5 rounded-[18px] bg-[var(--admin-surface)] border border-[var(--admin-border-soft)] shadow-[var(--admin-shadow)] relative flex flex-col justify-between shadow-[inset_3px_0_0_var(--admin-accent)]">
          <div className="text-[11px] font-bold tracking-[0.07em] uppercase text-[var(--admin-muted)] flex items-center justify-between">
            <span>Coastal Zones Monitored</span>
            <span className="text-[var(--admin-accent)] font-mono text-sm">
              ↗
            </span>
          </div>
          <div className="font-display font-semibold text-[32px] sm:text-[34px] tracking-tight leading-[1.15] text-[var(--admin-fg)] my-1.5">
            {zones.length}
          </div>
          <div className="text-[12.5px] text-[var(--admin-faint)]">
            Shoreline sectors mapped
          </div>
        </div>

        <div className="p-5 rounded-[18px] bg-[var(--admin-surface)] border border-[var(--admin-border-soft)] shadow-[var(--admin-shadow)] relative flex flex-col justify-between">
          <div className="text-[11px] font-bold tracking-[0.07em] uppercase text-[var(--admin-muted)]">
            Normal Water Conditions
          </div>
          <div className="font-display font-semibold text-[32px] sm:text-[34px] tracking-tight leading-[1.15] text-[var(--admin-fg)] my-1.5">
            {zones.filter((z) => z.status === "normal").length}
          </div>
          <div className="text-[12.5px] text-[var(--admin-faint)]">
            Optimal tidal windows active
          </div>
        </div>

        <div className="p-5 rounded-[18px] bg-[var(--admin-surface)] border border-[var(--admin-border-soft)] shadow-[var(--admin-shadow)] relative flex flex-col justify-between">
          <div className="text-[11px] font-bold tracking-[0.07em] uppercase text-[var(--admin-muted)]">
            Cautionary Swell
          </div>
          <div className="font-display font-semibold text-[32px] sm:text-[34px] tracking-tight leading-[1.15] text-[var(--admin-accent-strong)] my-1.5">
            {cautionZonesCount}
          </div>
          <div className="text-[12.5px] text-[var(--admin-faint)]">
            Increased guide vigilance
          </div>
        </div>

        <div className="p-5 rounded-[18px] bg-[var(--admin-surface)] border border-[var(--admin-border-soft)] shadow-[var(--admin-shadow)] relative flex flex-col justify-between">
          <div className="text-[11px] font-bold tracking-[0.07em] uppercase text-[var(--admin-muted)]">
            Emergency Lockdowns
          </div>
          <div className="font-display font-semibold text-[32px] sm:text-[34px] tracking-tight leading-[1.15] text-[var(--admin-fg)] my-1.5">
            {lockdownZonesCount}
          </div>
          <div className="text-[12.5px] text-[var(--admin-faint)]">
            Tours suspended for safety
          </div>
        </div>
      </div>

      {alertSuccessMsg && (
        <div className="p-3.5 bg-[var(--admin-surface)] border border-[var(--admin-accent)] text-[var(--admin-fg)] text-xs rounded-2xl flex items-center gap-2 shadow-xs">
          <CheckCircle2 className="w-4 h-4 text-[var(--admin-accent-strong)] shrink-0" />
          <span className="font-medium">{alertSuccessMsg}</span>
        </div>
      )}

      {/* Main Grid: Zones Cards on Left, Emergency Hotlines on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* LEFT 2 COLS: Zone Safety Matrix */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-display font-semibold text-2xl text-[var(--admin-fg)]">
              Live Coastal Zone Conditions &amp; Swell Monitor
            </h3>
            <span className="text-xs text-[var(--admin-muted)]">
              Coordinators synced
            </span>
          </div>

          <div className="space-y-4">
            {zones.map((zone) => {
              const isNormal = zone.status === "normal";
              const isCaution = zone.status === "caution";
              const isLockdown = zone.status === "lockdown";

              return (
                <div key={zone.id} className="admin-card p-5 space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[var(--admin-border-soft)] pb-3">
                    <div>
                      <div className="flex items-center gap-2.5 flex-wrap">
                        <span className="font-display font-semibold text-xl text-[var(--admin-fg)]">
                          {zone.zone_name}
                        </span>
                        <span
                          className={`admin-pill text-[9.5px] ${
                            isLockdown
                              ? "admin-pill-roast"
                              : isCaution
                                ? "admin-pill-amber"
                                : "admin-pill-line"
                          }`}
                        >
                          {zone.status.toUpperCase()}
                        </span>
                      </div>
                      <div className="text-[13px] text-[var(--admin-muted)] mt-1 flex items-center gap-3 flex-wrap">
                        <span>Tide: {zone.tide_phase}</span>
                        <span>·</span>
                        <span>Swell: {zone.swell_height_m}m</span>
                      </div>
                    </div>

                    {/* Status Toggles */}
                    <div className="flex items-center gap-1.5 self-start sm:self-auto">
                      <button
                        onClick={() =>
                          handleUpdateZoneStatus(zone.id, "normal")
                        }
                        className={`admin-btn text-xs py-1.5 px-3 ${
                          isNormal
                            ? "bg-[var(--admin-fg)] text-[var(--admin-surface)]"
                            : ""
                        }`}
                      >
                        Normal
                      </button>
                      <button
                        onClick={() =>
                          handleUpdateZoneStatus(zone.id, "caution")
                        }
                        className={`admin-btn text-xs py-1.5 px-3 ${
                          isCaution ? "admin-btn-primary font-bold" : ""
                        }`}
                      >
                        Caution
                      </button>
                      <button
                        onClick={() => setSelectedLockdownZone(zone.id)}
                        className={`admin-btn text-xs py-1.5 px-3 ${
                          isLockdown
                            ? "bg-rose-700 text-white border-transparent"
                            : "text-rose-700 hover:border-rose-400"
                        }`}
                      >
                        Lockdown
                      </button>
                    </div>
                  </div>

                  {/* Advisory Text Editor */}
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-bold tracking-wider uppercase text-[var(--admin-muted)] block">
                      Coastal Advisory &amp; Safety Briefing
                    </label>
                    <input
                      type="text"
                      value={zone.advisory_message}
                      onChange={(e) =>
                        handleUpdateAdvisory(zone.id, e.target.value)
                      }
                      className="w-full text-xs p-2.5 bg-[var(--admin-surface)] border border-[var(--admin-border)] rounded-xl text-[var(--admin-fg)] outline-none focus:border-[var(--admin-accent-strong)]"
                    />
                  </div>

                  {/* Quick Action: Open WhatsApp Broadcast */}
                  <div className="flex items-center justify-between text-xs pt-1">
                    <span className="text-[11.5px] text-[var(--admin-faint)]">
                      Last logged: {formatDate(zone.last_updated)}
                    </span>
                    <a
                      href={`https://wa.me/?text=${encodeURIComponent(
                        `🌊 MATSYAMART COASTAL ADVISORY [${zone.zone_name.toUpperCase()}]: Condition is currently ${zone.status.toUpperCase()}. ${zone.advisory_message}`,
                      )}`}
                      target="_blank"
                      rel="noreferrer"
                      className="text-[var(--admin-accent-strong)] hover:underline font-semibold inline-flex items-center gap-1 cursor-pointer"
                    >
                      <Send className="w-3 h-3" />
                      <span>Broadcast advisory to guides &amp; guests ↗</span>
                    </a>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* RIGHT COL: Emergency Response Hotlines & Protocol */}
        <div className="space-y-5">
          <div className="admin-card p-5 space-y-4">
            <div className="flex items-center gap-2 border-b border-[var(--admin-border-soft)] pb-3">
              <PhoneCall className="w-4 h-4 text-[var(--admin-accent-strong)]" />
              <h4 className="font-display font-semibold text-xl text-[var(--admin-fg)]">
                Coastal Emergency Hotlines
              </h4>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3 bg-[var(--admin-bg)] rounded-xl border border-[var(--admin-border-soft)] space-y-1">
                <div className="font-semibold text-[var(--admin-fg)]">
                  Mumbai Coastal Police (Mahim Post)
                </div>
                <div className="font-mono text-[var(--admin-fg)] font-bold">
                  022-2444 8911
                </div>
                <div className="text-[11px] text-[var(--admin-faint)]">
                  Direct radio link for reef shallows
                </div>
              </div>

              <div className="p-3 bg-[var(--admin-bg)] rounded-xl border border-[var(--admin-border-soft)] space-y-1">
                <div className="font-semibold text-[var(--admin-fg)]">
                  Versova Lifeguard Watchtower
                </div>
                <div className="font-mono text-[var(--admin-fg)] font-bold">
                  +91 98200 44199
                </div>
                <div className="text-[11px] text-[var(--admin-faint)]">
                  Beach patrol &amp; rescue boat dispatch
                </div>
              </div>

              <div className="p-3 bg-[var(--admin-bg)] rounded-xl border border-[var(--admin-border-soft)] space-y-1">
                <div className="font-semibold text-[var(--admin-fg)]">
                  Maharashtra Maritime Board (MMB)
                </div>
                <div className="font-mono text-[var(--admin-fg)] font-bold">
                  022-2266 2110
                </div>
                <div className="text-[11px] text-[var(--admin-faint)]">
                  Trawler traffic &amp; weather notices
                </div>
              </div>

              <div className="p-3 bg-[var(--admin-bg)] rounded-xl border border-[var(--admin-border-soft)] space-y-1">
                <div className="font-semibold text-[var(--admin-fg)]">
                  Indian Navy Coastal SAR Hotline
                </div>
                <div className="font-mono text-rose-700 font-bold">
                  1093 (Toll Free)
                </div>
                <div className="text-[11px] text-[var(--admin-faint)]">
                  Arabian Sea maritime rescue
                </div>
              </div>
            </div>
          </div>

          {/* Safety Protocols Card */}
          <div className="admin-card p-5 space-y-3 bg-[var(--admin-surface)]">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-700" />
              <h4 className="font-display font-semibold text-xl text-[var(--admin-fg)]">
                Safety Checklist Invariants
              </h4>
            </div>
            <ul className="text-xs text-[var(--admin-muted)] space-y-2 list-disc list-inside">
              <li>1 guide assigned for every 12 attendees max.</li>
              <li>Lifejackets mandatory on all boat crossings.</li>
              <li>
                First aid kit with saline rinse &amp; gauze on every reef walk.
              </li>
              <li>Tidal walks terminate 45 min before high tide turn.</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Emergency Lockdown Confirmation Modal */}
      {selectedLockdownZone && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#29100B]/50 backdrop-blur-xs">
          <div className="admin-card w-full max-w-md p-6 space-y-5 border-rose-300">
            <div className="flex items-center gap-2.5 text-rose-700 border-b border-[var(--admin-border-soft)] pb-3">
              <ShieldAlert className="w-5 h-5 shrink-0" />
              <h3 className="font-display font-semibold text-2xl text-[var(--admin-fg)]">
                Initiate Zone Emergency Lockdown
              </h3>
            </div>

            <p className="text-xs text-[var(--admin-muted)] leading-relaxed">
              You are declaring an emergency lockdown for{" "}
              <strong className="text-[var(--admin-fg)] font-bold">
                {zones.find((z) => z.id === selectedLockdownZone)?.zone_name}
              </strong>
              . This will suspend coastal operations, trigger WhatsApp storm
              briefings, and initiate automated voucher credits.
            </p>

            <div>
              <label className="text-[11px] font-bold tracking-wider uppercase text-[var(--admin-muted)] block mb-1.5">
                Emergency Declaration Reason
              </label>
              <input
                type="text"
                value={lockdownReason}
                onChange={(e) => setLockdownReason(e.target.value)}
                className="w-full text-xs p-2.5 bg-[var(--admin-surface)] text-[var(--admin-fg)] border border-[var(--admin-border)] rounded-xl outline-none focus:border-rose-600"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setSelectedLockdownZone(null)}
                className="admin-btn admin-btn-quiet text-xs"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmLockdown}
                className="admin-btn text-xs font-bold text-white bg-rose-700 hover:bg-rose-800 border-transparent"
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
