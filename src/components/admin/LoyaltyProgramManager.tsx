import React, { useState } from "react";
import { useData } from "../../context/DataContext";
import { useAdminAuth } from "../../context/AdminAuthContext";
import {
  LoyaltyProgramConfig,
  LoyaltyTierConfig,
  LoyaltyStatus,
  PillarType,
  LoyaltyMembership,
} from "../../types";
import { formatINR } from "../../lib/utils";
import {
  Sparkles,
  ShieldCheck,
  ShieldAlert,
  Save,
  Plus,
  Trash2,
  Coins,
  Award,
  Layers,
  Clock,
  CheckCircle2,
  AlertCircle,
  Users,
} from "lucide-react";
import { toast } from "sonner";

const SAMPLE_MEMBERS: LoyaltyMembership[] = [
  {
    id: "mem-01",
    phone: "+91 98200 88219",
    current_tier: "Harbor Custodian (Silver)",
    lifetime_spend_inr: 8400,
    spendable_points: 420,
    pending_points: 150,
    created_at: "2026-09-15T10:00:00Z",
    updated_at: "2026-10-21T18:00:00Z",
  },
  {
    id: "mem-02",
    phone: "+91 98214 77102",
    current_tier: "Coastal Ally (Bronze)",
    lifetime_spend_inr: 2400,
    spendable_points: 120,
    pending_points: 0,
    created_at: "2026-09-28T14:30:00Z",
    updated_at: "2026-10-02T11:00:00Z",
  },
  {
    id: "mem-03",
    phone: "+91 99308 22104",
    current_tier: "Deep Sea Patron (Gold)",
    lifetime_spend_inr: 18500,
    spendable_points: 1250,
    pending_points: 300,
    created_at: "2026-08-10T09:15:00Z",
    updated_at: "2026-10-22T19:30:00Z",
  },
];

export const LoyaltyProgramManager: React.FC = () => {
  const { loyaltyProgram, updateLoyaltyProgram } = useData();
  const { role } = useAdminAuth();

  const isOwner = role === "owner" || role === "admin";

  // Form State
  const [status, setStatus] = useState<LoyaltyStatus>(loyaltyProgram.status);
  const [pointValueINR, setPointValueINR] = useState<number>(
    loyaltyProgram.config.pointValueINR,
  );
  const [maxRedemptionPercent, setMaxRedemptionPercent] = useState<number>(
    loyaltyProgram.config.maxRedemptionPercent,
  );
  const [expiryMonths, setExpiryMonths] = useState<number>(
    loyaltyProgram.config.expiryMonths,
  );
  const [eligiblePillars, setEligiblePillars] = useState<PillarType[]>(
    loyaltyProgram.config.eligiblePillars,
  );
  const [tiers, setTiers] = useState<LoyaltyTierConfig[]>(
    loyaltyProgram.config.tiers,
  );

  // Sample Member state for simulation
  const [members, setMembers] = useState<LoyaltyMembership[]>(SAMPLE_MEMBERS);
  const [selectedMember, setSelectedMember] = useState<LoyaltyMembership | null>(
    null,
  );
  const [adjustmentPoints, setAdjustmentPoints] = useState<number>(50);

  if (!isOwner) {
    return (
      <div className="p-8 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-[#29100B] space-y-3">
        <div className="flex items-center gap-2 text-amber-700 font-bold">
          <ShieldAlert className="w-5 h-5" />
          <span>Restricted Owner Authority</span>
        </div>
        <p className="text-sm text-[#29100B]/80 leading-relaxed">
          The MatsyaPoints Community Loyalty Engine and currency valuation rules are strictly restricted to the platform Owner. Managers and Coordinators do not possess authority to change point redemption ratios or financial reward caps.
        </p>
      </div>
    );
  }

  const handleTogglePillar = (pillar: PillarType) => {
    if (eligiblePillars.includes(pillar)) {
      if (eligiblePillars.length === 1) {
        toast.error("At least one pillar must remain eligible for MatsyaPoints.");
        return;
      }
      setEligiblePillars(eligiblePillars.filter((p) => p !== pillar));
    } else {
      setEligiblePillars([...eligiblePillars, pillar]);
    }
  };

  const handleTierChange = (
    index: number,
    field: keyof LoyaltyTierConfig,
    value: any,
  ) => {
    setTiers((prev) => {
      const copy = [...prev];
      copy[index] = { ...copy[index]!, [field]: value };
      return copy;
    });
  };

  const handleAddTier = () => {
    setTiers((prev) => [
      ...prev,
      {
        tierName: `Harbor Tier ${prev.length + 1}`,
        qualifyingSpendINR: 25000,
        earningRatePercent: 10,
        discountPercent: 12,
      },
    ]);
  };

  const handleRemoveTier = (index: number) => {
    if (tiers.length <= 1) {
      toast.error("You must retain at least one loyalty tier.");
      return;
    }
    setTiers((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSaveProgram = (e: React.FormEvent) => {
    e.preventDefault();

    if (pointValueINR <= 0) {
      toast.error("Point valuation must be greater than ₹0.");
      return;
    }
    if (maxRedemptionPercent < 5 || maxRedemptionPercent > 100) {
      toast.error("Max redemption percent must be between 5% and 100%.");
      return;
    }

    const updatedConfig: LoyaltyProgramConfig = {
      pointValueINR,
      maxRedemptionPercent,
      eligiblePillars,
      expiryMonths,
      tiers,
    };

    updateLoyaltyProgram(updatedConfig, status);
    toast.success(
      `MatsyaPoints rules successfully updated to version v${loyaltyProgram.rule_version + 1}!`,
    );
  };

  const handleManualAdjustment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMember) return;

    setMembers((prev) =>
      prev.map((m) =>
        m.id === selectedMember.id
          ? {
              ...m,
              spendable_points: Math.max(0, m.spendable_points + adjustmentPoints),
              updated_at: new Date().toISOString(),
            }
          : m,
      ),
    );

    toast.success(
      `Adjusted ${adjustmentPoints > 0 ? "+" : ""}${adjustmentPoints} points for ${selectedMember.phone}`,
    );
    setSelectedMember(null);
  };

  return (
    <div className="space-y-8 font-sans">
      {/* Top Banner */}
      <div className="p-6 rounded-[20px] bg-gradient-to-r from-[#29100B] to-[#3D1811] text-[#F5EDEB] border border-[#DAB38C]/20 shadow-lg flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2 text-xs font-mono font-bold uppercase tracking-wider text-[#E3A157]">
            <Sparkles className="w-4 h-4 text-[#E3A157]" />
            <span>COMMUNITY LOYALTY &amp; CASHBACK ENGINE</span>
            <span className="px-2 py-0.5 rounded-full bg-[#E3A157]/20 text-[#E3A157] text-[10px]">
              v{loyaltyProgram.rule_version}
            </span>
          </div>
          <h2 className="text-xl font-bold font-serif text-[#F5EDEB]">
            MatsyaPoints Program Control
          </h2>
          <p className="text-xs text-[#DAB38c]/80 max-w-2xl leading-relaxed">
            Configure customer earn rates, redemption limits, tiered perks, and currency valuation across coastal meals, heritage trails, and artisan pantry orders.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-right">
            <div className="text-[10px] uppercase tracking-wider text-[#DAB38C]/60 font-semibold">
              Engine Status
            </div>
            <div className="text-xs font-bold text-[#E3A157] capitalize">
              {status}
            </div>
          </div>
          <div
            className={`w-3.5 h-3.5 rounded-full ${
              status === "active"
                ? "bg-emerald-400 animate-pulse"
                : status === "paused"
                  ? "bg-amber-400"
                  : "bg-slate-400"
            }`}
          />
        </div>
      </div>

      <form onSubmit={handleSaveProgram} className="space-y-6">
        {/* Core Financial & Redemption Economics */}
        <div className="p-6 rounded-[20px] bg-[#FFFDFB] border border-[#29100B]/10 shadow-sm space-y-5">
          <div className="flex items-center justify-between border-b border-[#29100B]/10 pb-4">
            <div className="flex items-center gap-2 text-sm font-bold text-[#29100B]">
              <Coins className="w-4 h-4 text-[#E3A157]" />
              <span>Currency Valuation &amp; Checkout Redemption Limits</span>
            </div>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as LoyaltyStatus)}
              className="text-xs font-bold py-1.5 px-3 rounded-lg border border-[#29100B]/20 bg-white text-[#29100B] outline-none"
            >
              <option value="active">Active (Earning &amp; Redeeming Live)</option>
              <option value="paused">Paused (Holding Existing Points)</option>
              <option value="draft">Draft (Testing In Sandbox)</option>
            </select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <div>
              <label className="text-xs font-bold text-[#29100B] block mb-1.5">
                Point Conversion Value (INR)
              </label>
              <div className="relative">
                <span className="absolute left-3 top-2.5 text-xs font-bold text-[#29100B]/40">
                  ₹
                </span>
                <input
                  type="number"
                  min="0.1"
                  step="0.1"
                  required
                  value={pointValueINR}
                  onChange={(e) => setPointValueINR(parseFloat(e.target.value) || 1)}
                  className="w-full pl-7 pr-3 py-2 text-sm rounded-xl border border-[#29100B]/20 bg-white font-mono font-bold text-[#29100B] outline-none focus:border-[#E3A157]"
                />
              </div>
              <p className="text-[11px] text-[#29100B]/60 mt-1">
                E.g. 1 point = ₹{pointValueINR.toFixed(2)} checkout credit.
              </p>
            </div>

            <div>
              <label className="text-xs font-bold text-[#29100B] block mb-1.5">
                Max Redemption Cap (% of Order)
              </label>
              <div className="relative">
                <input
                  type="number"
                  min="5"
                  max="100"
                  step="1"
                  required
                  value={maxRedemptionPercent}
                  onChange={(e) =>
                    setMaxRedemptionPercent(parseInt(e.target.value, 10) || 50)
                  }
                  className="w-full px-3 py-2 text-sm rounded-xl border border-[#29100B]/20 bg-white font-mono font-bold text-[#29100B] outline-none focus:border-[#E3A157]"
                />
                <span className="absolute right-3 top-2.5 text-xs font-bold text-[#29100B]/40">
                  %
                </span>
              </div>
              <p className="text-[11px] text-[#29100B]/60 mt-1">
                Maximum percent of an order payable using MatsyaPoints.
              </p>
            </div>

            <div>
              <label className="text-xs font-bold text-[#29100B] block mb-1.5">
                Points Expiration Period
              </label>
              <div className="relative">
                <input
                  type="number"
                  min="1"
                  max="36"
                  required
                  value={expiryMonths}
                  onChange={(e) =>
                    setExpiryMonths(parseInt(e.target.value, 10) || 12)
                  }
                  className="w-full px-3 py-2 text-sm rounded-xl border border-[#29100B]/20 bg-white font-mono font-bold text-[#29100B] outline-none focus:border-[#E3A157]"
                />
                <span className="absolute right-3 top-2.5 text-xs font-bold text-[#29100B]/40">
                  Months
                </span>
              </div>
              <p className="text-[11px] text-[#29100B]/60 mt-1">
                Points expire after this period from last earned order.
              </p>
            </div>
          </div>

          {/* Eligible Pillars */}
          <div className="pt-2">
            <label className="text-xs font-bold text-[#29100B] block mb-2">
              Eligible Pillars for Earning &amp; Redemption
            </label>
            <div className="flex flex-wrap gap-3">
              {(["food", "walks", "workshops", "goods"] as PillarType[]).map(
                (pillar) => {
                  const isChecked = eligiblePillars.includes(pillar);
                  return (
                    <button
                      type="button"
                      key={pillar}
                      onClick={() => handleTogglePillar(pillar)}
                      className={`px-4 py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer capitalize flex items-center gap-2 ${
                        isChecked
                          ? "bg-[#29100B] text-[#F5EDEB] border-[#29100B]"
                          : "bg-white text-[#29100B]/60 border-[#29100B]/20 hover:border-[#29100B]/40"
                      }`}
                    >
                      <span>{isChecked ? "✓" : "○"}</span>
                      <span>{pillar}</span>
                    </button>
                  );
                },
              )}
            </div>
          </div>
        </div>

        {/* Tier Configuration Table */}
        <div className="p-6 rounded-[20px] bg-[#FFFDFB] border border-[#29100B]/10 shadow-sm space-y-5">
          <div className="flex items-center justify-between border-b border-[#29100B]/10 pb-4">
            <div className="flex items-center gap-2 text-sm font-bold text-[#29100B]">
              <Award className="w-4 h-4 text-[#E3A157]" />
              <span>Membership Tiers &amp; Earning Multipliers</span>
            </div>
            <button
              type="button"
              onClick={handleAddTier}
              className="text-xs font-bold text-[#E3A157] hover:text-[#29100B] flex items-center gap-1 transition-colors cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Custom Tier</span>
            </button>
          </div>

          <div className="space-y-4">
            {tiers.map((tier, idx) => (
              <div
                key={idx}
                className="p-4 rounded-xl border border-[#29100B]/10 bg-[#FAF7F5] grid grid-cols-1 sm:grid-cols-4 gap-4 items-center"
              >
                <div>
                  <label className="text-[11px] font-bold text-[#29100B]/70 block mb-1">
                    Tier Name
                  </label>
                  <input
                    type="text"
                    required
                    value={tier.tierName}
                    onChange={(e) =>
                      handleTierChange(idx, "tierName", e.target.value)
                    }
                    className="w-full text-xs font-bold p-2 rounded-lg border border-[#29100B]/20 bg-white text-[#29100B]"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold text-[#29100B]/70 block mb-1">
                    Qualifying Spend (INR)
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="500"
                    required
                    value={tier.qualifyingSpendINR}
                    onChange={(e) =>
                      handleTierChange(
                        idx,
                        "qualifyingSpendINR",
                        parseFloat(e.target.value) || 0,
                      )
                    }
                    className="w-full text-xs font-bold p-2 rounded-lg border border-[#29100B]/20 bg-white font-mono text-[#29100B]"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold text-[#29100B]/70 block mb-1">
                    Earn Rate (% Cashback)
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      min="1"
                      max="50"
                      step="0.5"
                      required
                      value={tier.earningRatePercent}
                      onChange={(e) =>
                        handleTierChange(
                          idx,
                          "earningRatePercent",
                          parseFloat(e.target.value) || 3,
                        )
                      }
                      className="w-full text-xs font-bold p-2 pr-6 rounded-lg border border-[#29100B]/20 bg-white font-mono text-[#29100B]"
                    />
                    <span className="absolute right-2.5 top-2 text-[11px] font-bold text-[#29100B]/40">
                      %
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="flex-1">
                    <label className="text-[11px] font-bold text-[#29100B]/70 block mb-1">
                      Tier Discount (%)
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        min="0"
                        max="30"
                        step="1"
                        value={tier.discountPercent || 0}
                        onChange={(e) =>
                          handleTierChange(
                            idx,
                            "discountPercent",
                            parseFloat(e.target.value) || 0,
                          )
                        }
                        className="w-full text-xs font-bold p-2 pr-6 rounded-lg border border-[#29100B]/20 bg-white font-mono text-[#29100B]"
                      />
                      <span className="absolute right-2.5 top-2 text-[11px] font-bold text-[#29100B]/40">
                        %
                      </span>
                    </div>
                  </div>

                  {tiers.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveTier(idx)}
                      className="p-2 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer mt-4"
                      title="Remove Tier"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Save Bar */}
        <div className="flex justify-end">
          <button
            type="submit"
            className="py-3 px-6 rounded-xl bg-[#29100B] hover:bg-[#3D1811] text-[#F5EDEB] font-bold text-xs flex items-center gap-2 shadow-md transition-all cursor-pointer"
          >
            <Save className="w-4 h-4 text-[#E3A157]" />
            <span>Publish Loyalty Engine Update</span>
          </button>
        </div>
      </form>

      {/* Live Member Balances & Manual Adjustments */}
      <div className="p-6 rounded-[20px] bg-[#FFFDFB] border border-[#29100B]/10 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-[#29100B]/10 pb-4">
          <div className="flex items-center gap-2 text-sm font-bold text-[#29100B]">
            <Users className="w-4 h-4 text-[#E3A157]" />
            <span>Member Accounts &amp; Points Ledger ({members.length})</span>
          </div>
          <span className="text-xs text-[#29100B]/60 font-mono">
            Verified Phone OTP Identity
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-[#29100B]/10 text-[#29100B]/60">
                <th className="py-2.5 px-3 font-semibold">Customer Phone</th>
                <th className="py-2.5 px-3 font-semibold">Tier</th>
                <th className="py-2.5 px-3 font-semibold">Lifetime Spend</th>
                <th className="py-2.5 px-3 font-semibold">Spendable Points</th>
                <th className="py-2.5 px-3 font-semibold">Pending Points</th>
                <th className="py-2.5 px-3 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#29100B]/10">
              {members.map((member) => (
                <tr key={member.id} className="hover:bg-[#FAF7F5] transition-colors">
                  <td className="py-3 px-3 font-mono font-semibold text-[#29100B]">
                    {member.phone}
                  </td>
                  <td className="py-3 px-3">
                    <span className="px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-800 font-medium text-[11px]">
                      {member.current_tier}
                    </span>
                  </td>
                  <td className="py-3 px-3 font-mono font-bold text-[#29100B]">
                    {formatINR(member.lifetime_spend_inr)}
                  </td>
                  <td className="py-3 px-3 font-mono font-bold text-emerald-700">
                    {member.spendable_points} pts
                  </td>
                  <td className="py-3 px-3 font-mono text-amber-700">
                    {member.pending_points} pts
                  </td>
                  <td className="py-3 px-3 text-right">
                    <button
                      onClick={() => setSelectedMember(member)}
                      className="px-2.5 py-1 rounded-lg bg-[#29100B]/5 hover:bg-[#29100B]/10 text-[#29100B] font-semibold text-[11px] transition-colors cursor-pointer"
                    >
                      Adjust Points
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Modal for Manual Adjustment */}
        {selectedMember && (
          <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
            <div className="bg-[#FFFDFB] rounded-2xl max-w-sm w-full p-6 shadow-2xl space-y-4 border border-[#29100B]/20 animate-in fade-in zoom-in-95 duration-150">
              <div className="flex items-center justify-between border-b border-[#29100B]/10 pb-3">
                <div className="font-bold text-sm text-[#29100B]">
                  Adjust Member Points
                </div>
                <button
                  onClick={() => setSelectedMember(null)}
                  className="text-xs text-[#29100B]/60 hover:text-[#29100B]"
                >
                  ✕
                </button>
              </div>

              <div className="text-xs space-y-1">
                <div>
                  <span className="text-[#29100B]/60">Member: </span>
                  <span className="font-mono font-bold text-[#29100B]">
                    {selectedMember.phone}
                  </span>
                </div>
                <div>
                  <span className="text-[#29100B]/60">Current Spendable: </span>
                  <span className="font-mono font-bold text-emerald-700">
                    {selectedMember.spendable_points} pts
                  </span>
                </div>
              </div>

              <form onSubmit={handleManualAdjustment} className="space-y-4 pt-2">
                <div>
                  <label className="text-xs font-bold text-[#29100B] block mb-1">
                    Points Delta (+ or -)
                  </label>
                  <input
                    type="number"
                    step="1"
                    required
                    value={adjustmentPoints}
                    onChange={(e) =>
                      setAdjustmentPoints(parseInt(e.target.value, 10) || 0)
                    }
                    className="w-full p-2.5 rounded-xl border border-[#29100B]/20 text-sm font-mono font-bold"
                  />
                  <p className="text-[11px] text-[#29100B]/60 mt-1">
                    Positive adds points; negative debits points.
                  </p>
                </div>

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setSelectedMember(null)}
                    className="flex-1 py-2 text-xs font-bold rounded-xl border border-[#29100B]/20 text-[#29100B]"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-2 text-xs font-bold rounded-xl bg-[#29100B] text-white shadow"
                  >
                    Apply Adjustment
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
