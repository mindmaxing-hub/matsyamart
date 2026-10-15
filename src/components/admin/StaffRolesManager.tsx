import React, { useState } from "react";
import { useAdminAuth } from "../../context/AdminAuthContext";
import { useData } from "../../context/DataContext";
import { RoleLevel, PillarType } from "../../types";
import {
  Users,
  ShieldCheck,
  Plus,
  Trash2,
  KeyRound,
  AlertCircle,
  X,
  Mail,
  Check,
  Package,
  Utensils,
  Compass,
  Palette,
} from "lucide-react";

const ALL_PILLARS: { id: PillarType; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { id: "goods", label: "Goods", icon: Package },
  { id: "food", label: "Food", icon: Utensils },
  { id: "walks", label: "Walks", icon: Compass },
  { id: "workshops", label: "Workshops", icon: Palette },
];

export const StaffRolesManager: React.FC = () => {
  const { staffRoles, updateStaffRole, removeStaffRole, user, role } = useAdminAuth();
  const { listings } = useData();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [emailInput, setEmailInput] = useState("");
  const [roleInput, setRoleInput] = useState<RoleLevel>("coordinator");
  const [selectedPillars, setSelectedPillars] = useState<PillarType[]>(["food"]);
  const [errorMsg, setErrorMsg] = useState("");

  const handleTogglePillar = (pillar: PillarType) => {
    setSelectedPillars((prev) =>
      prev.includes(pillar) ? prev.filter((p) => p !== pillar) : [...prev, pillar],
    );
  };

  // Instant toggle from table row (for Owner)
  const handleQuickTogglePillar = (staffEmail: string, pillar: PillarType, currentPillars: PillarType[] = []) => {
    const updated = currentPillars.includes(pillar)
      ? currentPillars.filter((p) => p !== pillar)
      : [...currentPillars, pillar];

    updateStaffRole(staffEmail, "coordinator", updated);
  };

  const handleSaveStaff = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");

    if (!emailInput.trim() || !emailInput.includes("@")) {
      setErrorMsg("Please enter a valid work email address.");
      return;
    }

    if (roleInput === "coordinator" && selectedPillars.length === 0) {
      setErrorMsg("Please assign at least one pillar to this coordinator.");
      return;
    }

    updateStaffRole(
      emailInput.trim(),
      roleInput,
      roleInput === "coordinator" ? selectedPillars : undefined,
    );

    setEmailInput("");
    setRoleInput("coordinator");
    setSelectedPillars(["food"]);
    setIsModalOpen(false);
  };

  const isOwner = role === "owner" || role === "admin";

  return (
    <div className="space-y-6 text-[#f5edeb]">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-display font-bold text-xl sm:text-2xl text-[#f5edeb] flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-[#e3a157]" />
            <span>Staff Roles &amp; Pillar Assignment</span>
          </h2>
          <p className="text-xs text-[#dab38c] mt-0.5">
            Owner has full access. Coordinators can be assigned any combination of the 4 pillars (Goods, Food, Walks, Workshops) anytime.
          </p>
        </div>

        {isOwner && (
          <button
            onClick={() => setIsModalOpen(true)}
            className="px-4 py-2 bg-[#e3a157] hover:bg-[#dab38c] text-[#29100b] font-bold text-xs rounded-xl shadow-md transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <Plus className="w-4 h-4 text-[#29100b]" />
            <span>Assign Staff Role</span>
          </button>
        )}
      </div>

      {/* Role Level Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="p-4 rounded-2xl bg-[#35160e]/85 border border-[#e3a157]/40 backdrop-blur-md space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#e3a157]">
              👑 OWNER
            </span>
            <span className="text-[10px] bg-[#e3a157]/20 px-1.5 py-0.5 rounded text-[#e3a157] font-mono">
              FULL
            </span>
          </div>
          <div className="text-xs text-[#dab38c] leading-relaxed">
            Full authority: All 4 pillars, financial payouts, coupons, and staff pillar assignments.
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-[#35160e]/85 border border-sky-400/30 backdrop-blur-md space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-sky-400">
              💼 MANAGER
            </span>
            <span className="text-[10px] bg-sky-500/20 px-1.5 py-0.5 rounded text-sky-300 font-mono">
              OPS
            </span>
          </div>
          <div className="text-xs text-[#dab38c] leading-relaxed">
            Operational access across all 4 pillars and event manifests, without role or payout control.
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-[#35160e]/85 border border-emerald-400/30 backdrop-blur-md space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-400">
              ⚓ COORDINATOR
            </span>
            <span className="text-[10px] bg-emerald-500/20 px-1.5 py-0.5 rounded text-emerald-300 font-mono">
              SCOPED
            </span>
          </div>
          <div className="text-xs text-[#dab38c] leading-relaxed">
            Pillar-scoped: Strictly views and operates ONLY the pillars assigned by the Owner.
          </div>
        </div>
      </div>

      {/* Staff Roles Table */}
      <div className="bg-[#35160e]/90 border border-[#dab38c]/25 rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#29100b] text-[#dab38c] border-b border-[#dab38c]/15">
              <tr>
                <th className="py-3 px-4 font-semibold">Authorized Email</th>
                <th className="py-3 px-4 font-semibold">Role Tier</th>
                <th className="py-3 px-4 font-semibold">Assigned Pillars (Click to Toggle)</th>
                <th className="py-3 px-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#dab38c]/10 text-[#f5edeb]">
              {staffRoles.map((staff) => {
                const isCurrentUser =
                  user?.email.toLowerCase() === staff.email.toLowerCase();
                const assigned = staff.assigned_pillars || [];

                return (
                  <tr
                    key={staff.email}
                    className="hover:bg-[#481f14]/50 transition-colors"
                  >
                    <td className="py-3.5 px-4 font-mono font-medium">
                      <div className="flex items-center gap-2">
                        <Mail className="w-3.5 h-3.5 text-[#e3a157]" />
                        <span>{staff.email}</span>
                        {isCurrentUser && (
                          <span className="text-[9px] bg-emerald-500/20 text-emerald-400 px-1.5 py-0.5 rounded font-sans font-bold">
                            YOU
                          </span>
                        )}
                      </div>
                    </td>

                    <td className="py-3.5 px-4 font-bold">
                      <span
                        className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] uppercase font-bold tracking-wider ${
                          staff.role === "owner" || staff.role === "admin"
                            ? "bg-[#e3a157]/20 text-[#e3a157] border border-[#e3a157]/40"
                            : staff.role === "manager"
                              ? "bg-sky-500/20 text-sky-400 border border-sky-500/40"
                              : "bg-emerald-500/20 text-emerald-400 border border-emerald-500/40"
                        }`}
                      >
                        {staff.role}
                      </span>
                    </td>

                    {/* Pillar assignment with 1-click toggles */}
                    <td className="py-3.5 px-4">
                      {staff.role === "owner" || staff.role === "admin" ? (
                        <span className="text-xs text-[#e3a157] font-semibold">
                          ★ All 4 Pillars + Full Governance
                        </span>
                      ) : staff.role === "manager" ? (
                        <span className="text-xs text-sky-300 font-semibold">
                          All 4 Operational Pillars (Goods, Food, Walks, Workshops)
                        </span>
                      ) : (
                        <div className="flex flex-wrap items-center gap-1.5">
                          {ALL_PILLARS.map((p) => {
                            const isAssigned = assigned.includes(p.id);
                            return (
                              <button
                                key={p.id}
                                disabled={!isOwner}
                                onClick={() =>
                                  handleQuickTogglePillar(staff.email, p.id, assigned)
                                }
                                className={`px-2.5 py-1 rounded-lg text-[10px] font-bold flex items-center gap-1 transition-all ${
                                  isAssigned
                                    ? "bg-emerald-900/60 text-emerald-300 border border-emerald-500/50 shadow-xs"
                                    : "bg-[#29100b] text-[#dab38c]/40 border border-[#dab38c]/20 hover:text-[#dab38c]"
                                } ${isOwner ? "cursor-pointer" : "cursor-default"}`}
                                title={
                                  isOwner
                                    ? `Click to ${isAssigned ? "revoke" : "grant"} ${p.label}`
                                    : undefined
                                }
                              >
                                {isAssigned && <Check className="w-3 h-3 text-emerald-400" />}
                                <span>{p.label}</span>
                              </button>
                            );
                          })}
                        </div>
                      )}
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      {isOwner && !isCurrentUser && (
                        <button
                          onClick={() => removeStaffRole(staff.email)}
                          className="p-1.5 hover:bg-[#29100b] rounded-lg text-[#dab38c]/70 hover:text-rose-400 transition-colors cursor-pointer"
                          title="Revoke Access"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Staff Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs">
          <div className="bg-[#29100b] border border-[#dab38c]/30 rounded-3xl w-full max-w-md p-6 space-y-4 shadow-2xl relative">
            <div className="flex items-center justify-between pb-3 border-b border-[#dab38c]/15">
              <h3 className="font-display font-bold text-lg text-[#f5edeb] flex items-center gap-2">
                <Plus className="w-4 h-4 text-[#e3a157]" />
                <span>Grant Staff Role</span>
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 hover:bg-[#35160e] rounded-full text-[#dab38c] hover:text-[#f5edeb] cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {errorMsg && (
              <div className="p-3 rounded-xl bg-rose-950/40 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
                <span>{errorMsg}</span>
              </div>
            )}

            <form onSubmit={handleSaveStaff} className="space-y-4 text-xs">
              <div>
                <label className="font-semibold text-[#dab38c] block mb-1">
                  Google Workspace / Work Email *
                </label>
                <input
                  type="email"
                  required
                  placeholder="e.g. devendra@matsyamart.com"
                  value={emailInput}
                  onChange={(e) => setEmailInput(e.target.value)}
                  className="w-full px-3 py-2 bg-[#35160e] border border-[#dab38c]/30 rounded-xl text-[#f5edeb] placeholder:text-[#dab38c]/40 focus:outline-none focus:border-[#e3a157]"
                />
              </div>

              <div>
                <label className="font-semibold text-[#dab38c] block mb-1">
                  Role Tier *
                </label>
                <select
                  value={roleInput}
                  onChange={(e) => setRoleInput(e.target.value as RoleLevel)}
                  className="w-full px-3 py-2 bg-[#35160e] border border-[#dab38c]/30 rounded-xl text-[#f5edeb] focus:outline-none focus:border-[#e3a157]"
                >
                  <option value="coordinator">Coordinator (Assigned Pillars Only)</option>
                  <option value="manager">Manager (All 4 Operational Pillars)</option>
                  <option value="owner">Owner (Full Authority &amp; Roles)</option>
                </select>
              </div>

              {roleInput === "coordinator" && (
                <div>
                  <label className="font-semibold text-[#dab38c] block mb-1.5">
                    Select Pillars to Assign to this Coordinator *
                  </label>
                  <div className="grid grid-cols-2 gap-2 p-2 bg-[#1f0b07] rounded-xl border border-[#dab38c]/20">
                    {ALL_PILLARS.map((p) => {
                      const Icon = p.icon;
                      const isSelected = selectedPillars.includes(p.id);

                      return (
                        <button
                          key={p.id}
                          type="button"
                          onClick={() => handleTogglePillar(p.id)}
                          className={`p-2 rounded-lg border text-left flex items-center gap-2 transition-all cursor-pointer ${
                            isSelected
                              ? "bg-[#35160e] border-[#e3a157] text-[#f5edeb]"
                              : "bg-[#29100b] border-[#dab38c]/20 text-[#dab38c]/60 hover:text-[#dab38c]"
                          }`}
                        >
                          <Icon className={`w-4 h-4 ${isSelected ? "text-[#e3a157]" : "text-[#dab38c]/50"}`} />
                          <span className="font-bold">{p.label}</span>
                        </button>
                      );
                    })}
                  </div>
                  <p className="text-[10px] text-[#dab38c]/60 mt-1">
                    The coordinator will only see the selected pillars. All other pillars and administrative tools will be hidden.
                  </p>
                </div>
              )}

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-[#35160e] text-[#dab38c] hover:text-[#f5edeb] font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#e3a157] hover:bg-[#dab38c] text-[#29100b] font-bold shadow-md cursor-pointer transition-colors"
                >
                  Save Access
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
