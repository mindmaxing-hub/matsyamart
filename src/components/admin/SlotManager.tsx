import React, { useState } from 'react';
import { Calendar, Plus, Clock, Users, AlertTriangle, CheckCircle, Sparkles } from 'lucide-react';
import { ExperienceSlot, Listing } from '../../types';
import { useData } from '../../context/DataContext';
import { formatDate, formatSlotRange } from '../../lib/utils';

interface SlotManagerProps {
  slots: ExperienceSlot[];
  listings: Listing[];
}

export const SlotManager: React.FC<SlotManagerProps> = ({ slots, listings }) => {
  const { addSlot, addRecurringWeekendSlots, toggleCancelSlot } = useData();

  const experienceListings = listings.filter((l) => l.type === 'experience');
  const [selectedListingId, setSelectedListingId] = useState<string>(experienceListings[0]?.id || '');

  // Form State for Single Slot
  const [slotDate, setSlotDate] = useState<string>('');
  const [startTime, setStartTime] = useState<string>('06:30');
  const [endTime, setEndTime] = useState<string>('09:00');
  const [capacity, setCapacity] = useState<number>(14);
  const [showAddForm, setShowAddForm] = useState<boolean>(false);
  const [successMsg, setSuccessMsg] = useState<string>('');

  const filteredSlots = slots.filter(
    (s) => !selectedListingId || s.listing_id === selectedListingId
  ).sort((a, b) => new Date(a.slot_start).getTime() - new Date(b.slot_start).getTime());

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

    setSuccessMsg('Slot created successfully!');
    setShowAddForm(false);
    setTimeout(() => setSuccessMsg(''), 3000);
  };

  const handleGenerateWeekendBatches = () => {
    if (!selectedListingId) return;
    addRecurringWeekendSlots(selectedListingId, 4, 14);
    setSuccessMsg('Generated next 4 weeks of Saturday & Sunday dawn slots (8 new batches)!');
    setTimeout(() => setSuccessMsg(''), 4000);
  };

  return (
    <div className="space-y-6">
      
      {/* Top Filter and Actions */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-slate-200">
        <div>
          <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1">
            Select Coastal Experience
          </label>
          <select
            value={selectedListingId}
            onChange={(e) => setSelectedListingId(e.target.value)}
            className="text-xs sm:text-sm font-semibold p-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none text-ocean-950"
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
            className="flex-1 sm:flex-none px-3.5 py-2.5 bg-ocean-50 hover:bg-ocean-100 text-ocean-800 border border-ocean-200 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors shadow-xs"
          >
            <Sparkles className="w-3.5 h-3.5 text-sun-300" />
            <span>Generate Weekend Batches (4 Weeks)</span>
          </button>

          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="flex-1 sm:flex-none px-4 py-2.5 bg-ocean-800 hover:bg-ocean-900 text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors shadow-xs"
          >
            <Plus className="w-4 h-4" />
            <span>Add Single Slot</span>
          </button>
        </div>
      </div>

      {successMsg && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-xl flex items-center gap-2">
          <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Add Slot Modal / Inline Form */}
      {showAddForm && (
        <form onSubmit={handleCreateSlot} className="bg-slate-50 border border-slate-200 p-5 rounded-2xl space-y-4">
          <div className="font-display font-bold text-sm text-slate-800">Create New Time Slot</div>
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
            <div>
              <label className="text-xs font-medium text-slate-600 block mb-1">Date</label>
              <input
                type="date"
                required
                value={slotDate}
                onChange={(e) => setSlotDate(e.target.value)}
                className="w-full text-xs p-2 bg-white rounded-xl border border-slate-200 outline-none"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-slate-600 block mb-1">Start Time</label>
              <input
                type="time"
                required
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="w-full text-xs p-2 bg-white rounded-xl border border-slate-200 outline-none"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-slate-600 block mb-1">End Time</label>
              <input
                type="time"
                required
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                className="w-full text-xs p-2 bg-white rounded-xl border border-slate-200 outline-none"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-slate-600 block mb-1">Guest Capacity</label>
              <input
                type="number"
                min="1"
                max="50"
                value={capacity}
                onChange={(e) => setCapacity(Number(e.target.value))}
                className="w-full text-xs p-2 bg-white rounded-xl border border-slate-200 outline-none"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setShowAddForm(false)}
              className="px-3 py-1.5 text-xs text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-100"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 text-xs font-semibold text-white bg-ocean-800 hover:bg-ocean-900 rounded-lg shadow-xs"
            >
              Save Slot
            </button>
          </div>
        </form>
      )}

      {/* Slots List */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
        {filteredSlots.length === 0 ? (
          <div className="col-span-full p-8 text-center bg-white rounded-2xl border border-slate-200 text-slate-400 text-xs">
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
                    ? 'bg-rose-50/60 border-rose-200 opacity-75'
                    : 'bg-white border-slate-200 hover:shadow-xs'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-ocean-950">
                      <Calendar className="w-3.5 h-3.5 text-ocean-700" />
                      <span>{formatDate(slot.slot_start)}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-xs text-slate-600">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      <span>{formatSlotRange(slot.slot_start, slot.slot_end)}</span>
                    </div>
                  </div>

                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                      slot.is_cancelled
                        ? 'bg-rose-100 text-rose-800'
                        : isFull
                        ? 'bg-amber-100 text-amber-800'
                        : 'bg-emerald-100 text-emerald-800'
                    }`}
                  >
                    {slot.is_cancelled ? 'Cancelled' : isFull ? 'Full' : 'Active'}
                  </span>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1 text-slate-600">
                    <Users className="w-3.5 h-3.5 text-slate-400" />
                    <span>
                      <strong className="text-slate-900">{booked}</strong> / {cap} booked
                    </span>
                  </div>

                  <button
                    onClick={() => toggleCancelSlot(slot.id)}
                    className={`text-[11px] font-semibold px-2 py-1 rounded-md transition-colors ${
                      slot.is_cancelled
                        ? 'text-emerald-700 hover:bg-emerald-50'
                        : 'text-rose-600 hover:bg-rose-50'
                    }`}
                  >
                    {slot.is_cancelled ? 'Restore Slot' : 'Emergency Cancel'}
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
