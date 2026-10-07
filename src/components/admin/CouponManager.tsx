import React, { useState } from "react";
import { useData } from "../../context/DataContext";
import { Coupon, PillarType } from "../../types";
import { formatINR } from "../../lib/utils";
import {
  Tag,
  Plus,
  Trash2,
  CheckCircle2,
  XCircle,
  Clock,
  Sparkles,
  AlertCircle,
  X,
  Percent,
  Coins,
} from "lucide-react";

export const CouponManager: React.FC = () => {
  const { coupons, addCoupon, deleteCoupon, toggleCouponStatus } = useData();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [code, setCode] = useState("");
  const [description, setDescription] = useState("");
  const [discountType, setDiscountType] = useState<"percent" | "flat">("percent");
  const [discountValue, setDiscountValue] = useState<number>(15);
  const [minOrderInr, setMinOrderInr] = useState<number>(0);
  const [applicablePillars, setApplicablePillars] = useState<PillarType[]>([
    "food",
    "walks",
    "workshops",
  ]);
  const [maxUses, setMaxUses] = useState<string>("");
  const [expiresAt, setExpiresAt] = useState<string>("");
  const [formError, setFormError] = useState("");

  const handlePillarToggle = (pillar: PillarType) => {
    setApplicablePillars((prev) =>
      prev.includes(pillar)
        ? prev.filter((p) => p !== pillar)
        : [...prev, pillar],
    );
  };

  const handleCreateCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");

    if (!code.trim()) {
      setFormError("Coupon code is required");
      return;
    }

    if (discountValue <= 0) {
      setFormError("Discount value must be greater than zero");
      return;
    }

    if (applicablePillars.length === 0) {
      setFormError("Select at least one applicable category");
      return;
    }

    addCoupon({
      code: code.trim().toUpperCase(),
      description: description.trim() || undefined,
      discount_type: discountType,
      discount_value: Number(discountValue),
      min_order_inr: Number(minOrderInr) || 0,
      applicable_pillars: applicablePillars,
      max_uses: maxUses ? parseInt(maxUses) : undefined,
      expires_at: expiresAt ? new Date(expiresAt).toISOString() : undefined,
      is_active: true,
    });

    // Reset and close
    setCode("");
    setDescription("");
    setDiscountValue(15);
    setMinOrderInr(0);
    setApplicablePillars(["food", "walks", "workshops"]);
    setMaxUses("");
    setExpiresAt("");
    setIsModalOpen(false);
  };

  const activeCount = coupons.filter((c) => c.is_active).length;
  const totalUses = coupons.reduce((sum, c) => sum + c.used_count, 0);

  return (
    <div className="space-y-6 text-[#f5edeb]">
      {/* Top Header & Actions */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-display font-bold text-xl sm:text-2xl text-[#f5edeb] flex items-center gap-2">
            <Tag className="w-5 h-5 text-[#e3a157]" />
            <span>Coupon &amp; Discount Management</span>
          </h2>
          <p className="text-xs text-[#dab38c] mt-0.5">
            Configure promotional promo codes, member discounts, and seasonal offers
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="px-4 py-2 bg-[#e3a157] hover:bg-[#dab38c] text-[#29100b] font-bold text-xs rounded-xl shadow-md transition-all flex items-center gap-1.5 cursor-pointer"
        >
          <Plus className="w-4 h-4 text-[#29100b]" />
          <span>New Coupon Code</span>
        </button>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="p-4 rounded-2xl bg-[#35160e]/85 border border-[#dab38c]/20 backdrop-blur-md">
          <div className="text-[11px] font-semibold text-[#dab38c] uppercase tracking-wider">
            Active Promo Codes
          </div>
          <div className="text-2xl font-bold font-display text-[#f5edeb] mt-1">
            {activeCount} <span className="text-xs text-[#dab38c]/60 font-sans">/ {coupons.length}</span>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-[#35160e]/85 border border-[#dab38c]/20 backdrop-blur-md">
          <div className="text-[11px] font-semibold text-[#dab38c] uppercase tracking-wider">
            Total Times Redeemed
          </div>
          <div className="text-2xl font-bold font-display text-[#e3a157] mt-1">
            {totalUses} orders
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-[#35160e]/85 border border-[#dab38c]/20 backdrop-blur-md flex items-center justify-between">
          <div>
            <div className="text-[11px] font-semibold text-[#dab38c] uppercase tracking-wider">
              Bhoomiputra Member Code
            </div>
            <div className="text-sm font-bold font-mono text-emerald-400 mt-1 flex items-center gap-1.5">
              <span>BHOOMI2025</span>
              <span className="text-[10px] bg-emerald-500/20 px-1.5 py-0.5 rounded text-emerald-300 font-sans font-normal">
                15% (Experiences)
              </span>
            </div>
          </div>
          <Sparkles className="w-5 h-5 text-[#e3a157]" />
        </div>
      </div>

      {/* Coupons Table */}
      <div className="bg-[#35160e]/90 border border-[#dab38c]/25 rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#29100b] text-[#dab38c] border-b border-[#dab38c]/15">
              <tr>
                <th className="py-3 px-4 font-semibold">Promo Code</th>
                <th className="py-3 px-4 font-semibold">Discount</th>
                <th className="py-3 px-4 font-semibold">Applicable To</th>
                <th className="py-3 px-4 font-semibold">Usage</th>
                <th className="py-3 px-4 font-semibold">Min Order</th>
                <th className="py-3 px-4 font-semibold">Status</th>
                <th className="py-3 px-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#dab38c]/10 text-[#f5edeb]">
              {coupons.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-[#dab38c]">
                    No coupons configured. Create your first promotional code above.
                  </td>
                </tr>
              ) : (
                coupons.map((coupon) => (
                  <tr
                    key={coupon.id}
                    className="hover:bg-[#481f14]/50 transition-colors"
                  >
                    {/* Code & Description */}
                    <td className="py-3.5 px-4 font-mono font-bold text-sm text-[#e3a157]">
                      <div>{coupon.code}</div>
                      {coupon.description && (
                        <div className="text-[10px] font-sans font-normal text-[#dab38c]/80 line-clamp-1">
                          {coupon.description}
                        </div>
                      )}
                    </td>

                    {/* Discount Value */}
                    <td className="py-3.5 px-4 font-semibold">
                      {coupon.discount_type === "percent" ? (
                        <span className="inline-flex items-center gap-1 text-emerald-400">
                          <Percent className="w-3.5 h-3.5" />
                          <span>{coupon.discount_value}% off</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-emerald-400">
                          <Coins className="w-3.5 h-3.5" />
                          <span>₹{coupon.discount_value} flat off</span>
                        </span>
                      )}
                    </td>

                    {/* Pillars */}
                    <td className="py-3.5 px-4">
                      <div className="flex flex-wrap gap-1">
                        {coupon.applicable_pillars.map((p) => (
                          <span
                            key={p}
                            className="text-[9px] uppercase px-1.5 py-0.5 rounded bg-[#29100b] border border-[#dab38c]/20 text-[#dab38c]"
                          >
                            {p}
                          </span>
                        ))}
                      </div>
                    </td>

                    {/* Usage Count */}
                    <td className="py-3.5 px-4 text-[#dab38c]">
                      <span className="font-semibold text-[#f5edeb]">
                        {coupon.used_count}
                      </span>
                      {coupon.max_uses ? (
                        <span> / {coupon.max_uses}</span>
                      ) : (
                        <span className="text-[10px] opacity-60"> (unlimited)</span>
                      )}
                    </td>

                    {/* Min Order */}
                    <td className="py-3.5 px-4 text-[#dab38c]">
                      {coupon.min_order_inr > 0
                        ? formatINR(coupon.min_order_inr)
                        : "₹0"}
                    </td>

                    {/* Status Toggle */}
                    <td className="py-3.5 px-4">
                      <button
                        onClick={() => toggleCouponStatus(coupon.id)}
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold cursor-pointer transition-colors ${
                          coupon.is_active
                            ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/30"
                            : "bg-zinc-700/40 text-zinc-400 border border-zinc-600/30 hover:bg-zinc-700/60"
                        }`}
                      >
                        {coupon.is_active ? (
                          <>
                            <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                            <span>Active</span>
                          </>
                        ) : (
                          <>
                            <XCircle className="w-3 h-3 text-zinc-400" />
                            <span>Paused</span>
                          </>
                        )}
                      </button>
                    </td>

                    {/* Actions */}
                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => deleteCoupon(coupon.id)}
                        className="p-1.5 hover:bg-[#29100b] rounded-lg text-[#dab38c]/70 hover:text-rose-400 transition-colors cursor-pointer"
                        title="Delete Coupon"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create Coupon Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs">
          <div className="bg-[#29100b] border border-[#dab38c]/30 rounded-3xl w-full max-w-lg p-6 space-y-5 shadow-2xl relative">
            <div className="flex items-center justify-between pb-3 border-b border-[#dab38c]/15">
              <h3 className="font-display font-bold text-lg text-[#f5edeb] flex items-center gap-2">
                <Plus className="w-4 h-4 text-[#e3a157]" />
                <span>Create New Promo Code</span>
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 hover:bg-[#35160e] rounded-full text-[#dab38c] hover:text-[#f5edeb] cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {formError && (
              <div className="p-3 rounded-xl bg-rose-950/40 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleCreateCoupon} className="space-y-4 text-xs">
              {/* Code */}
              <div>
                <label className="font-semibold text-[#dab38c] block mb-1">
                  Coupon Code *
                </label>
                <input
                  type="text"
                  required
                  value={code}
                  onChange={(e) => setCode(e.target.value.toUpperCase())}
                  placeholder="e.g. MONSOON20 / BHOOMI15"
                  className="w-full px-3 py-2 bg-[#35160e] border border-[#dab38c]/30 rounded-xl text-sm font-mono text-[#f5edeb] placeholder:text-[#dab38c]/40 focus:outline-none focus:border-[#e3a157]"
                />
              </div>

              {/* Description */}
              <div>
                <label className="font-semibold text-[#dab38c] block mb-1">
                  Description / Campaign
                </label>
                <input
                  type="text"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="e.g. 15% discount for Bhoomiputra Foundation members"
                  className="w-full px-3 py-2 bg-[#35160e] border border-[#dab38c]/30 rounded-xl text-[#f5edeb] placeholder:text-[#dab38c]/40 focus:outline-none focus:border-[#e3a157]"
                />
              </div>

              {/* Discount Type & Value */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-[#dab38c] block mb-1">
                    Discount Type *
                  </label>
                  <select
                    value={discountType}
                    onChange={(e) =>
                      setDiscountType(e.target.value as "percent" | "flat")
                    }
                    className="w-full px-3 py-2 bg-[#35160e] border border-[#dab38c]/30 rounded-xl text-[#f5edeb] focus:outline-none focus:border-[#e3a157]"
                  >
                    <option value="percent">Percentage (% off)</option>
                    <option value="flat">Flat Amount (₹ off)</option>
                  </select>
                </div>

                <div>
                  <label className="font-semibold text-[#dab38c] block mb-1">
                    Discount Value ({discountType === "percent" ? "%" : "₹"}) *
                  </label>
                  <input
                    type="number"
                    required
                    min={1}
                    max={discountType === "percent" ? 100 : 5000}
                    value={discountValue}
                    onChange={(e) => setDiscountValue(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-[#35160e] border border-[#dab38c]/30 rounded-xl text-[#f5edeb] focus:outline-none focus:border-[#e3a157]"
                  />
                </div>
              </div>

              {/* Applicable Pillars */}
              <div>
                <label className="font-semibold text-[#dab38c] block mb-1.5">
                  Applies to Categories *
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {(["goods", "food", "walks", "workshops"] as PillarType[]).map(
                    (p) => {
                      const isSelected = applicablePillars.includes(p);
                      return (
                        <button
                          key={p}
                          type="button"
                          onClick={() => handlePillarToggle(p)}
                          className={`py-2 px-2 rounded-xl text-center capitalize font-semibold border transition-all cursor-pointer ${
                            isSelected
                              ? "bg-[#e3a157] text-[#29100b] border-transparent"
                              : "bg-[#35160e] text-[#dab38c] border-[#dab38c]/25 hover:bg-[#481f14]"
                          }`}
                        >
                          {p}
                        </button>
                      );
                    },
                  )}
                </div>
                <div className="text-[10px] text-[#dab38c]/60 mt-1">
                  Note: Bhoomiputra member discount applies to Food, Walks &amp; Workshops (not Goods).
                </div>
              </div>

              {/* Min Order & Max Uses */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-[#dab38c] block mb-1">
                    Min Cart Value (₹)
                  </label>
                  <input
                    type="number"
                    min={0}
                    value={minOrderInr}
                    onChange={(e) => setMinOrderInr(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-[#35160e] border border-[#dab38c]/30 rounded-xl text-[#f5edeb] focus:outline-none focus:border-[#e3a157]"
                  />
                </div>

                <div>
                  <label className="font-semibold text-[#dab38c] block mb-1">
                    Max Redemptions
                  </label>
                  <input
                    type="number"
                    min={1}
                    placeholder="Unlimited"
                    value={maxUses}
                    onChange={(e) => setMaxUses(e.target.value)}
                    className="w-full px-3 py-2 bg-[#35160e] border border-[#dab38c]/30 rounded-xl text-[#f5edeb] placeholder:text-[#dab38c]/40 focus:outline-none focus:border-[#e3a157]"
                  />
                </div>
              </div>

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
                  Save Coupon
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
