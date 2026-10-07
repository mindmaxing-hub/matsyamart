import React, { useState } from "react";
import { useAdminAuth } from "../../context/AdminAuthContext";
import { useData } from "../../context/DataContext";
import { RoleLevel } from "../../types";
import {
  Users,
  ShieldCheck,
  Plus,
  Trash2,
  KeyRound,
  Compass,
  AlertCircle,
  X,
  Mail,
} from "lucide-react";

export const StaffRolesManager: React.FC = () => {
  const { staffRoles, updateStaffRole, removeStaffRole, user } = useAdminAuth();
  const { listings } = useData();
  const experienceListings = listings.filter((l) => l.type === "experience");

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [emailInput, setEmailInput] = useState("");
  const [roleInput, setRoleInput] = useState<RoleLevel>("coordinator");
  const [selectedEventIds, setSelectedEventIds] = useState<string[]>([]);
  const [errorMsg, setErrorMsg] = useState("");

  const handleToggleEvent = (id: string) => {
    setSelectedEventIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id],
    );
  };

  const handleSaveStaff = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");

    if (!emailInput.trim() || !emailInput.includes("@")) {
      setErrorMsg("Please enter a valid work email address.");
      return;
    }

    updateStaffRole(
      emailInput.trim(),
      roleInput,
      roleInput === "coordinator" ? selectedEventIds : undefined,
    );

    setEmailInput("");
    setRoleInput("coordinator");
    setSelectedEventIds([]);
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-6 text-[#f5edeb]">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-display font-bold text-xl sm:text-2xl text-[#f5edeb] flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-[#e3a157]" />
            <span>Staff Permissions &amp; Access Tiers</span>
          </h2>
          <p className="text-xs text-[#dab38c] mt-0.5">
            Manage Google Workspace roles across Admin, Manager, and Jetty Coordinator levels
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="px-4 py-2 bg-[#e3a157] hover:bg-[#dab38c] text-[#29100b] font-bold text-xs rounded-xl shadow-md transition-all flex items-center gap-1.5 cursor-pointer"
        >
          <Plus className="w-4 h-4 text-[#29100b]" />
          <span>Add Staff Member</span>
        </button>
      </div>

      {/* Role Level Reference Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="p-4 rounded-2xl bg-[#35160e]/85 border border-[#dab38c]/20 backdrop-blur-md space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#e3a157]">
              ADMIN LEVEL
            </span>
            <span className="text-[10px] bg-[#e3a157]/20 px-1.5 py-0.5 rounded text-[#e3a157] font-mono">
              FULL
            </span>
          </div>
          <div className="text-xs text-[#dab38c] leading-relaxed">
            Unrestricted access: financial payouts, coupons, pricing, and system roles.
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-[#35160e]/85 border border-[#dab38c]/20 backdrop-blur-md space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-sky-400">
              MANAGER LEVEL
            </span>
            <span className="text-[10px] bg-sky-500/20 px-1.5 py-0.5 rounded text-sky-300 font-mono">
              OPS
            </span>
          </div>
          <div className="text-xs text-[#dab38c] leading-relaxed">
            Operations: bookings, courier dispatch, inventory lots, tidal safety, and refunds.
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-[#35160e]/85 border border-[#dab38c]/20 backdrop-blur-md space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-400">
              COORDINATOR
            </span>
            <span className="text-[10px] bg-emerald-500/20 px-1.5 py-0.5 rounded text-emerald-300 font-mono">
              JETTY
            </span>
          </div>
          <div className="text-xs text-[#dab38c] leading-relaxed">
            On-ground: guest manifest roster check-ins and emergency contacts for assigned events.
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
                <th className="py-3 px-4 font-semibold">Assigned Role Tier</th>
                <th className="py-3 px-4 font-semibold">Scope / Assigned Events</th>
                <th className="py-3 px-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#dab38c]/10 text-[#f5edeb]">
              {staffRoles.map((staff) => {
                const isCurrentUser =
                  user?.email.toLowerCase() === staff.email.toLowerCase();

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
                          staff.role === "admin"
                            ? "bg-[#e3a157]/20 text-[#e3a157] border border-[#e3a157]/40"
                            : staff.role === "manager"
                              ? "bg-sky-500/20 text-sky-400 border border-sky-500/40"
                              : "bg-emerald-500/20 text-emerald-400 border border-emerald-500/40"
                        }`}
                      >
                        {staff.role}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 text-[#dab38c]">
                      {staff.role === "admin" ? (
                        <span className="text-xs text-[#dab38c]/80">
                          Full Platform System Access
                        </span>
                      ) : staff.role === "manager" ? (
                        <span className="text-xs text-[#dab38c]/80">
                          All Operations &amp; Fulfillment
                        </span>
                      ) : staff.assigned_event_ids &&
                        staff.assigned_event_ids.length > 0 ? (
                        <div className="flex flex-wrap gap-1">
                          {staff.assigned_event_ids.map((id) => (
                            <span
                              key={id}
                              className="text-[9px] px-2 py-0.5 rounded bg-[#29100b] border border-[#dab38c]/25 text-[#f5edeb]"
                            >
                              {listings.find((l) => l.id === id)?.title || id}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <span className="text-xs text-[#dab38c]/60 italic">
                          All Coastal Trails &amp; Workshops
                        </span>
                      )}
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      {!isCurrentUser && (
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
                <span>Grant Staff Access</span>
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
                  <option value="coordinator">Coordinator (On-ground Check-in only)</option>
                  <option value="manager">Manager (All Operations &amp; Logistics)</option>
                  <option value="admin">Admin (Full System &amp; Promos)</option>
                </select>
              </div>

              {roleInput === "coordinator" && (
                <div>
                  <label className="font-semibold text-[#dab38c] block mb-1.5">
                    Assign Specific Experiences (Optional)
                  </label>
                  <div className="space-y-1.5 max-h-36 overflow-y-auto p-2 bg-[#1f0b07] rounded-xl border border-[#dab38c]/20">
                    {experienceListings.map((exp) => (
                      <label
                        key={exp.id}
                        className="flex items-center gap-2 cursor-pointer hover:bg-[#35160e] p-1 rounded text-[#dab38c] hover:text-[#f5edeb]"
                      >
                        <input
                          type="checkbox"
                          checked={selectedEventIds.includes(exp.id)}
                          onChange={() => handleToggleEvent(exp.id)}
                          className="rounded text-[#e3a157]"
                        />
                        <span className="truncate">{exp.title}</span>
                      </label>
                    ))}
                  </div>
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
