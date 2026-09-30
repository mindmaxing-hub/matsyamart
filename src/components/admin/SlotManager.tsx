import React, { useState } from "react";
import {
  Calendar,
  Plus,
  Clock,
  Users,
  AlertTriangle,
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
    <div className="space-y-5">
      {/* Top Filter & Batch Action Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-[#29100b] p-3.5 rounded-2xl border border-[#dab38c]/20">
        <div className="flex-1 max-w-md">
          <select
            value={selectedListingId}
            onChange={(e) => setSelectedListingId(e.target.value)}
            className="w-full text-xs p-2.5 bg-[#35160e] text-[#f5edeb] rounded-xl border border-[#dab38c]/30 outline-none font-medium focus:border-[#e3a157]"
          >
            {experienceListings.map((l) => (
              <option key={l.id} value={l.id}>
                {l.title}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <button
            onClick={handleGenerateWeekendBatches}
            className="flex-1 sm:flex-none px-3.5 py-2.5 bg-[#35160e] hover:bg-[#5d3a24] text-[#e3a157] border border-[#dab38c]/25 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors shadow-xs cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5 text-[#e3a157]" />
            <span>Generate Weekend Batches (4 Weeks)</span>
          </button>

          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="flex-1 sm:flex-none px-4 py-2.5 bg-[#e3a157] hover:bg-[#dab38c] text-[#29100b] rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-colors shadow-xs cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add Single Slot</span>
          </button>
        </div>
      </div>

      {successMsg && (
        <div className="p-3 bg-emerald-950/60 border border-emerald-800/50 text-emerald-300 text-xs rounded-xl flex items-center gap-2">
          <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Add Slot Modal / Inline Form */}
      {showAddForm && (
        <form
          onSubmit={handleCreateSlot}
          className="bg-[#35160e] border border-[#dab38c]/25 p-5 rounded-2xl space-y-4"
        >
          <div className="font-display font-bold text-sm text-[#f5edeb]">
            Create New Time Slot
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
            <div>
              <label className="text-xs font-medium text-[#dab38c]/80 block mb-1">
                Date
              </label>
              <input
                type="date"
                required
                value={slotDate}
                onChange={(e) => setSlotDate(e.target.value)}
                className="w-full text-xs p-2 bg-[#29100b] text-[#f5edeb] rounded-xl border border-[#dab38c]/30 outline-none focus:border-[#e3a157]"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-[#dab38c]/80 block mb-1">
                Start Time
              </label>
              <input
                type="time"
                required
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="w-full text-xs p-2 bg-[#29100b] text-[#f5edeb] rounded-xl border border-[#dab38c]/30 outline-none focus:border-[#e3a157]"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-[#dab38c]/80 block mb-1">
                End Time
              </label>
              <input
                type="time"
                required
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                className="w-full text-xs p-2 bg-[#29100b] text-[#f5edeb] rounded-xl border border-[#dab38c]/30 outline-none focus:border-[#e3a157]"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-[#dab38c]/80 block mb-1">
                Guest Capacity
              </label>
              <input
                type="number"
                min="1"
                max="50"
                value={capacity}
                onChange={(e) => setCapacity(Number(e.target.value))}
                className="w-full text-xs p-2 bg-[#29100b] text-[#f5edeb] rounded-xl border border-[#dab38c]/30 outline-none focus:border-[#e3a157]"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setShowAddForm(false)}
              className="px-3 py-1.5 text-xs text-[#dab38c] bg-[#29100b] border border-[#dab38c]/25 rounded-lg hover:text-[#f5edeb] cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 text-xs font-bold text-[#29100b] bg-[#e3a157] hover:bg-[#dab38c] rounded-lg shadow-xs cursor-pointer"
            >
              Save Slot
            </button>
          </div>
        </form>
      )}

      {/* Slots List */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
        {filteredSlots.length === 0 ? (
          <div className="col-span-full p-8 text-center bg-[#29100b] rounded-2xl border border-[#dab38c]/20 text-[#dab38c]/60 text-xs">
            No scheduled slots found for this experience.
          </div>
        ) : (
          filteredSlots.map((slot) => {
            const booked = slot.booked_count;
            const cap = slot.capacity;
            const isFull = booked >= cap;

            return (
              <div
                key={slot.id}
                className={`p-4 rounded-2xl border transition-all ${
                  slot.is_cancelled
                    ? "bg-rose-950/40 border-rose-800/40 opacity-75"
                    : "bg-[#35160e]/85 border-[#dab38c]/20 hover:border-[#e3a157]/40 shadow-md"
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-[#f5edeb]">
                      <Calendar className="w-3.5 h-3.5 text-[#e3a157]" />
                      <span>{formatDate(slot.slot_start)}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-xs text-[#dab38c]/80">
                      <Clock className="w-3.5 h-3.5 text-[#dab38c]/50" />
                      <span>
                        {formatSlotRange(slot.slot_start, slot.slot_end)}
                      </span>
                    </div>
                  </div>

                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase border ${
                      slot.is_cancelled
                        ? "bg-rose-950/60 text-rose-300 border-rose-800/50"
                        : isFull
                          ? "bg-amber-950/60 text-amber-300 border-amber-800/50"
                          : "bg-emerald-950/60 text-emerald-300 border-emerald-800/50"
                    }`}
                  >
                    {slot.is_cancelled
                      ? "Cancelled"
                      : isFull
                        ? "Full"
                        : "Active"}
                  </span>
                </div>

                <div className="mt-4 pt-3 border-t border-[#dab38c]/15 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1 text-[#dab38c]/80">
                    <Users className="w-3.5 h-3.5 text-[#dab38c]/50" />
                    <span>
                      <strong className="text-[#e3a157]">{booked}</strong> /{" "}
                      {cap} booked
                    </span>
                  </div>

                  <button
                    onClick={() => toggleCancelSlot(slot.id)}
                    className={`text-[11px] font-semibold px-2 py-1 rounded-md transition-colors cursor-pointer ${
                      slot.is_cancelled
                        ? "text-emerald-400 hover:bg-emerald-950/40"
                        : "text-rose-400 hover:bg-rose-950/40"
                    }`}
                  >
                    {slot.is_cancelled ? "Restore Slot" : "Emergency Cancel"}
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
