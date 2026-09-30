import React, { useState } from "react";
import {
  Calendar,
  Plus,
  Clock,
  Users,
  CheckCircle,
  Sparkles,
} from "lucide-react";
import { ExperienceSlot, Listing } from "../../types";
import { useData } from "../../context/DataContext";
import { formatDate, formatSlotRange } from "../../lib/utils";

interface SlotManagerProps {
  slots: ExperienceSlot[];
  listings: Listing[];
}

export const SlotManager: React.FC<SlotManagerProps> = ({
  slots,
  listings,
}) => {
  const { addSlot, addRecurringWeekendSlots, toggleCancelSlot } = useData();

  const experienceListings = listings.filter((l) => l.type === "experience");
  const [selectedListingId, setSelectedListingId] = useState<string>(
    experienceListings[0]?.id || "",
  );

  // Form State for Single Slot
  const [slotDate, setSlotDate] = useState<string>("");
  const [startTime, setStartTime] = useState<string>("06:30");
  const [endTime, setEndTime] = useState<string>("09:00");
  const [capacity, setCapacity] = useState<number>(14);
  const [showAddForm, setShowAddForm] = useState<boolean>(false);
  const [successMsg, setSuccessMsg] = useState<string>("");

  const filteredSlots = slots
    .filter((s) => !selectedListingId || s.listing_id === selectedListingId)
    .sort(
      (a, b) =>
        new Date(a.slot_start).getTime() - new Date(b.slot_start).getTime(),
    );

  const selectedListing = experienceListings.find(
    (l) => l.id === selectedListingId,
  );

  const handleCreateSlot = (e: React.FormEvent) => {
    e.preventDefault();
    if (!slotDate || !selectedListingId) return;

    const start = new Date(`${slotDate}T${startTime}:00`);
    const end = new Date(`${slotDate}T${endTime}:00`);

    addSlot({
      listing_id: selectedListingId,
      slot_start: start.toISOString(),
      slot_end: end.toISOString(),
      capacity: Number(capacity),
    });

    setSuccessMsg("Slot created successfully!");
    setShowAddForm(false);
    setTimeout(() => setSuccessMsg(""), 3000);
  };

  const handleGenerateWeekendBatches = () => {
    if (!selectedListingId) return;
    addRecurringWeekendSlots(selectedListingId, 4, 14);
    setSuccessMsg("Generated 4 upcoming weekend batches successfully!");
    setTimeout(() => setSuccessMsg(""), 3000);
  };

  return (
    <div className="space-y-6">
      {/* Top Filter & Batch Action Bar */}
      <div className="admin-card p-5">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3.5">
          <div className="flex-1">
            <select
              value={selectedListingId}
              onChange={(e) => setSelectedListingId(e.target.value)}
              className="admin-select w-full md:max-w-md"
            >
              {experienceListings.map((l) => (
                <option key={l.id} value={l.id}>
                  {l.title}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2.5 flex-wrap">
            <button
              onClick={handleGenerateWeekendBatches}
              className="admin-btn text-xs font-semibold"
            >
              <Sparkles className="w-3.5 h-3.5 text-[var(--admin-accent)]" />
              <span>Generate weekends (4 wks)</span>
            </button>

            <button
              onClick={() => setShowAddForm(!showAddForm)}
              className="admin-btn admin-btn-primary text-xs font-bold"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>+ Add single slot</span>
            </button>
          </div>
        </div>
      </div>

      {successMsg && (
        <div className="p-3.5 bg-[var(--admin-surface)] border border-[var(--admin-accent)] text-[var(--admin-fg)] text-xs rounded-2xl flex items-center gap-2 shadow-xs">
          <CheckCircle className="w-4 h-4 text-[var(--admin-accent-strong)] shrink-0" />
          <span className="font-medium">{successMsg}</span>
        </div>
      )}

      {/* Add Slot Modal / Inline Form */}
      {showAddForm && (
        <form onSubmit={handleCreateSlot} className="admin-card p-6 space-y-4">
          <div className="font-display font-semibold text-xl text-[var(--admin-fg)]">
            Create New Coastal Time Slot
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3.5">
            <div>
              <label className="text-[11px] font-bold tracking-wider uppercase text-[var(--admin-muted)] block mb-1.5">
                Date
              </label>
              <input
                type="date"
                required
                value={slotDate}
                onChange={(e) => setSlotDate(e.target.value)}
                className="w-full text-xs p-2.5 bg-[var(--admin-surface)] text-[var(--admin-fg)] rounded-xl border border-[var(--admin-border)] outline-none focus:border-[var(--admin-accent-strong)]"
              />
            </div>
            <div>
              <label className="text-[11px] font-bold tracking-wider uppercase text-[var(--admin-muted)] block mb-1.5">
                Start Time
              </label>
              <input
                type="time"
                required
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="w-full text-xs p-2.5 bg-[var(--admin-surface)] text-[var(--admin-fg)] rounded-xl border border-[var(--admin-border)] outline-none focus:border-[var(--admin-accent-strong)]"
              />
            </div>
            <div>
              <label className="text-[11px] font-bold tracking-wider uppercase text-[var(--admin-muted)] block mb-1.5">
                End Time
              </label>
              <input
                type="time"
                required
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                className="w-full text-xs p-2.5 bg-[var(--admin-surface)] text-[var(--admin-fg)] rounded-xl border border-[var(--admin-border)] outline-none focus:border-[var(--admin-accent-strong)]"
              />
            </div>
            <div>
              <label className="text-[11px] font-bold tracking-wider uppercase text-[var(--admin-muted)] block mb-1.5">
                Guest Capacity
              </label>
              <input
                type="number"
                min="1"
                max="50"
                value={capacity}
                onChange={(e) => setCapacity(Number(e.target.value))}
                className="w-full text-xs p-2.5 bg-[var(--admin-surface)] text-[var(--admin-fg)] rounded-xl border border-[var(--admin-border)] outline-none focus:border-[var(--admin-accent-strong)]"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setShowAddForm(false)}
              className="admin-btn admin-btn-quiet text-xs"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="admin-btn admin-btn-primary text-xs font-bold"
            >
              Save Slot
            </button>
          </div>
        </form>
      )}

      {/* Slots Grid */}
      <div className="admin-slots-grid">
        {filteredSlots.length === 0 ? (
          <div className="col-span-full p-12 text-center admin-card text-[var(--admin-muted)] text-sm">
            <p className="font-display font-semibold text-2xl text-[var(--admin-fg)] mb-1">
              No tidal slots scheduled
            </p>
            <p>Select another experience or generate weekend batches above.</p>
          </div>
        ) : (
          filteredSlots.map((slot) => {
            const booked = slot.booked_count;
            const cap = slot.capacity;
            const percent = Math.min(100, Math.round((booked / cap) * 100));

            return (
              <div
                key={slot.id}
                className={`admin-slot-card transition-all ${
                  slot.is_cancelled ? "opacity-60 bg-[var(--admin-bg)]" : ""
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="font-bold text-[14.5px] text-[var(--admin-fg)]">
                    {formatDate(slot.slot_start)}
                  </span>
                  <span
                    className={`inline-flex items-center gap-1.5 text-[11px] font-bold tracking-wider uppercase ${
                      slot.is_cancelled
                        ? "text-[var(--admin-muted)]"
                        : "text-[var(--admin-fg)]"
                    }`}
                  >
                    <span
                      className={`w-2 h-2 rounded-full ${
                        slot.is_cancelled
                          ? "bg-[var(--admin-border)]"
                          : percent >= 100
                            ? "bg-[var(--admin-fg)]"
                            : "bg-[var(--admin-accent)]"
                      }`}
                    />
                    {slot.is_cancelled
                      ? "Cancelled"
                      : percent >= 100
                        ? "Full"
                        : "Active"}
                  </span>
                </div>

                <div className="text-[13px] text-[var(--admin-muted)] mt-1">
                  {formatSlotRange(slot.slot_start, slot.slot_end)} ·{" "}
                  {selectedListing?.location_name ||
                    selectedListing?.secret_meeting_point ||
                    "Tidal Window"}
                </div>

                {/* Smooth Progress Bar */}
                <div className="admin-bar">
                  <i
                    className="admin-bar-fill"
                    style={{ width: `${percent}%` }}
                  />
                </div>

                <div className="flex items-center justify-between text-[13px] pt-1 text-[var(--admin-muted)]">
                  <span>
                    <b className="text-[var(--admin-fg)] font-semibold">
                      {booked}
                    </b>{" "}
                    / {cap} booked
                  </span>

                  <button
                    onClick={() => toggleCancelSlot(slot.id)}
                    className="text-xs font-semibold underline underline-offset-2 hover:text-[var(--admin-fg)] transition-colors cursor-pointer text-[var(--admin-muted)]"
                  >
                    {slot.is_cancelled ? "Restore slot" : "Emergency cancel"}
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
