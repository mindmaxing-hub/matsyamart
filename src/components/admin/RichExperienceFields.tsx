import React, { useState } from "react";
import {
  Calendar,
  Clock,
  Plus,
  Trash2,
  CheckCircle2,
  Sparkles,
  ChevronDown,
  ChevronUp,
  FileText,
  Utensils,
  Backpack,
  UserCheck,
} from "lucide-react";
import { ItineraryItem, ExperienceSlot } from "../../types";

/* =======================================================================
   1. SCHEDULE & SLOT BUILDER
   ======================================================================= */

export type SlotMode = "recurring" | "custom" | "single";

export interface CustomSlotItem {
  id: string;
  date: string;
  startTime: string;
  endTime: string;
  capacity: number;
}

export interface ScheduleSlotBuilderState {
  mode: SlotMode;
  // Recurring config
  recurringDays: ("saturday" | "sunday")[];
  recurringWeeks: number;
  recurringStartTime: string;
  recurringEndTime: string;
  recurringCapacity: number;
  // Custom multi-slot config
  customSlots: CustomSlotItem[];
  // Single slot config
  singleDate: string;
  singleStartTime: string;
  singleEndTime: string;
  singleCapacity: number;
}

interface ScheduleSlotBuilderProps {
  state: ScheduleSlotBuilderState;
  onChange: (newState: ScheduleSlotBuilderState) => void;
  defaultTimePreset?: "lunch" | "dinner" | "morning" | "afternoon";
}

export const ScheduleSlotBuilder: React.FC<ScheduleSlotBuilderProps> = ({
  state,
  onChange,
  defaultTimePreset = "lunch",
}) => {
  const [isOpen, setIsOpen] = useState(true);

  const applyPreset = (preset: "lunch" | "dinner" | "morning" | "afternoon") => {
    let start = "12:30";
    let end = "15:00";
    if (preset === "dinner") {
      start = "19:30";
      end = "22:00";
    } else if (preset === "morning") {
      start = "06:30";
      end = "09:00";
    } else if (preset === "afternoon") {
      start = "16:00";
      end = "18:30";
    }
    onChange({
      ...state,
      recurringStartTime: start,
      recurringEndTime: end,
      singleStartTime: start,
      singleEndTime: end,
    });
  };

  const handleDayToggle = (day: "saturday" | "sunday") => {
    const exists = state.recurringDays.includes(day);
    let nextDays = exists
      ? state.recurringDays.filter((d) => d !== day)
      : [...state.recurringDays, day];
    if (nextDays.length === 0) {
      nextDays = [day]; // Always keep at least one
    }
    onChange({ ...state, recurringDays: nextDays });
  };

  const addCustomSlotRow = () => {
    const nextDate = new Date();
    nextDate.setDate(nextDate.getDate() + (state.customSlots.length + 1) * 2);
    const dateStr = nextDate.toISOString().split("T")[0] || "";
    onChange({
      ...state,
      customSlots: [
        ...state.customSlots,
        {
          id: "cslot-" + Math.random().toString(36).substring(2, 7),
          date: dateStr,
          startTime: state.recurringStartTime || "12:30",
          endTime: state.recurringEndTime || "15:00",
          capacity: state.recurringCapacity || 12,
        },
      ],
    });
  };

  const removeCustomSlotRow = (id: string) => {
    onChange({
      ...state,
      customSlots: state.customSlots.filter((s) => s.id !== id),
    });
  };

  const updateCustomSlotRow = (id: string, updates: Partial<CustomSlotItem>) => {
    onChange({
      ...state,
      customSlots: state.customSlots.map((s) => (s.id === id ? { ...s, ...updates } : s)),
    });
  };

  // Preview recurring calculation
  const totalRecurringSlots = state.recurringDays.length * state.recurringWeeks;

  return (
    <div className="border border-[#dab38c]/25 bg-[#1f0b07]/90 rounded-2xl overflow-hidden transition-all">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-4 py-3 bg-[#29100b] hover:bg-[#35160e] flex items-center justify-between text-left transition-colors cursor-pointer"
      >
        <div className="flex items-center gap-2.5">
          <Calendar className="w-4 h-4 text-[#e3a157]" />
          <div>
            <div className="font-bold text-xs text-[#f5edeb] flex items-center gap-2">
              <span>Schedule &amp; Seating Slots Generator</span>
              <span className="text-[10px] px-2 py-0.5 rounded-full font-mono font-semibold bg-[#e3a157]/20 text-[#e3a157] border border-[#e3a157]/30">
                {state.mode === "recurring"
                  ? `${totalRecurringSlots} Weekend Slots (${state.recurringWeeks} Wks)`
                  : state.mode === "custom"
                  ? `${state.customSlots.length} Custom Dates`
                  : "Single Slot"}
              </span>
            </div>
            <div className="text-[10px] text-[#dab38c]/70">
              Control the booking calendar dates customers see on the frontend
            </div>
          </div>
        </div>
        {isOpen ? (
          <ChevronUp className="w-4 h-4 text-[#dab38c]" />
        ) : (
          <ChevronDown className="w-4 h-4 text-[#dab38c]" />
        )}
      </button>

      {isOpen && (
        <div className="p-4 space-y-4 text-xs">
          {/* Mode Selector */}
          <div>
            <label className="text-[11px] font-bold text-[#dab38c] uppercase tracking-wider block mb-1.5">
              Scheduling Method
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => onChange({ ...state, mode: "recurring" })}
                className={`py-2 px-2.5 rounded-xl text-center border font-semibold transition-all cursor-pointer ${
                  state.mode === "recurring"
                    ? "bg-[#e3a157] text-[#29100b] border-[#e3a157] shadow-sm font-bold"
                    : "bg-[#29100b] text-[#dab38c] border-[#dab38c]/30 hover:border-[#dab38c]"
                }`}
              >
                <Sparkles className="w-3.5 h-3.5 mx-auto mb-1" />
                <span>Recurring Weekends</span>
              </button>
              <button
                type="button"
                onClick={() => onChange({ ...state, mode: "custom" })}
                className={`py-2 px-2.5 rounded-xl text-center border font-semibold transition-all cursor-pointer ${
                  state.mode === "custom"
                    ? "bg-[#e3a157] text-[#29100b] border-[#e3a157] shadow-sm font-bold"
                    : "bg-[#29100b] text-[#dab38c] border-[#dab38c]/30 hover:border-[#dab38c]"
                }`}
              >
                <Calendar className="w-3.5 h-3.5 mx-auto mb-1" />
                <span>Custom Multi-Date</span>
              </button>
              <button
                type="button"
                onClick={() => onChange({ ...state, mode: "single" })}
                className={`py-2 px-2.5 rounded-xl text-center border font-semibold transition-all cursor-pointer ${
                  state.mode === "single"
                    ? "bg-[#e3a157] text-[#29100b] border-[#e3a157] shadow-sm font-bold"
                    : "bg-[#29100b] text-[#dab38c] border-[#dab38c]/30 hover:border-[#dab38c]"
                }`}
              >
                <Clock className="w-3.5 h-3.5 mx-auto mb-1" />
                <span>Single Slot</span>
              </button>
            </div>
          </div>

          {/* Quick Timing Presets */}
          <div className="flex items-center gap-1.5 flex-wrap pt-1">
            <span className="text-[10px] text-[#dab38c]/70 font-semibold mr-1">Time Presets:</span>
            <button
              type="button"
              onClick={() => applyPreset("lunch")}
              className="px-2 py-0.5 rounded-lg bg-[#29100b] border border-[#dab38c]/30 text-[10px] text-[#dab38c] hover:text-[#f5edeb] hover:border-[#e3a157] cursor-pointer"
            >
              ☀️ Lunch (12:30 - 15:00)
            </button>
            <button
              type="button"
              onClick={() => applyPreset("dinner")}
              className="px-2 py-0.5 rounded-lg bg-[#29100b] border border-[#dab38c]/30 text-[10px] text-[#dab38c] hover:text-[#f5edeb] hover:border-[#e3a157] cursor-pointer"
            >
              🌙 Dinner (19:30 - 22:00)
            </button>
            <button
              type="button"
              onClick={() => applyPreset("morning")}
              className="px-2 py-0.5 rounded-lg bg-[#29100b] border border-[#dab38c]/30 text-[10px] text-[#dab38c] hover:text-[#f5edeb] hover:border-[#e3a157] cursor-pointer"
            >
              🌅 Morning Walk (06:30 - 09:00)
            </button>
            <button
              type="button"
              onClick={() => applyPreset("afternoon")}
              className="px-2 py-0.5 rounded-lg bg-[#29100b] border border-[#dab38c]/30 text-[10px] text-[#dab38c] hover:text-[#f5edeb] hover:border-[#e3a157] cursor-pointer"
            >
              🎨 Afternoon (16:00 - 18:30)
            </button>
          </div>

          {/* Option 1: Recurring Weekend Schedule */}
          {state.mode === "recurring" && (
            <div className="p-3.5 bg-[#29100b] rounded-xl border border-[#dab38c]/20 space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-bold text-[11px] text-[#e3a157]">1. Select Recurring Days</span>
                <span className="text-[10px] text-[#dab38c]">Applies every weekend</span>
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => handleDayToggle("saturday")}
                  className={`flex-1 py-1.5 px-3 rounded-lg border font-semibold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                    state.recurringDays.includes("saturday")
                      ? "bg-emerald-950/80 border-emerald-500 text-emerald-300"
                      : "bg-[#1f0b07] border-[#dab38c]/30 text-[#dab38c]/60"
                  }`}
                >
                  <CheckCircle2
                    className={`w-3.5 h-3.5 ${
                      state.recurringDays.includes("saturday") ? "text-emerald-400" : "opacity-30"
                    }`}
                  />
                  <span>Every Saturday</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleDayToggle("sunday")}
                  className={`flex-1 py-1.5 px-3 rounded-lg border font-semibold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                    state.recurringDays.includes("sunday")
                      ? "bg-emerald-950/80 border-emerald-500 text-emerald-300"
                      : "bg-[#1f0b07] border-[#dab38c]/30 text-[#dab38c]/60"
                  }`}
                >
                  <CheckCircle2
                    className={`w-3.5 h-3.5 ${
                      state.recurringDays.includes("sunday") ? "text-emerald-400" : "opacity-30"
                    }`}
                  />
                  <span>Every Sunday</span>
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-4 gap-2.5 pt-1">
                <div>
                  <label className="text-[10px] font-semibold text-[#dab38c] block mb-1">
                    Weeks Horizon
                  </label>
                  <select
                    value={state.recurringWeeks}
                    onChange={(e) =>
                      onChange({ ...state, recurringWeeks: Number(e.target.value) || 4 })
                    }
                    className="w-full px-2 py-1.5 bg-[#1f0b07] border border-[#dab38c]/30 rounded-lg text-white outline-none cursor-pointer"
                  >
                    <option value={4} className="bg-[#29100b]">Next 4 Weeks (1 Month)</option>
                    <option value={8} className="bg-[#29100b]">Next 8 Weeks (2 Months)</option>
                    <option value={12} className="bg-[#29100b]">Next 12 Weeks (3 Months)</option>
                  </select>
                </div>
                <div>
                  <label className="text-[10px] font-semibold text-[#dab38c] block mb-1">
                    Start Time
                  </label>
                  <input
                    type="time"
                    value={state.recurringStartTime}
                    onChange={(e) => onChange({ ...state, recurringStartTime: e.target.value })}
                    className="w-full px-2 py-1.5 bg-[#1f0b07] border border-[#dab38c]/30 rounded-lg text-white outline-none"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-semibold text-[#dab38c] block mb-1">
                    End Time
                  </label>
                  <input
                    type="time"
                    value={state.recurringEndTime}
                    onChange={(e) => onChange({ ...state, recurringEndTime: e.target.value })}
                    className="w-full px-2 py-1.5 bg-[#1f0b07] border border-[#dab38c]/30 rounded-lg text-white outline-none"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-semibold text-[#dab38c] block mb-1">
                    Capacity (Seats)
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={100}
                    value={state.recurringCapacity}
                    onChange={(e) =>
                      onChange({ ...state, recurringCapacity: Number(e.target.value) || 12 })
                    }
                    className="w-full px-2 py-1.5 bg-[#1f0b07] border border-[#dab38c]/30 rounded-lg text-white outline-none"
                  />
                </div>
              </div>

              <div className="p-2.5 rounded-lg bg-emerald-950/40 border border-emerald-500/30 text-[11px] text-emerald-300 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>
                  Will auto-generate <strong>{totalRecurringSlots} upcoming weekend slots</strong> in
                  the customer booking calendar with {state.recurringCapacity} seats each.
                </span>
              </div>
            </div>
          )}

          {/* Option 2: Custom Multi-Date List */}
          {state.mode === "custom" && (
            <div className="p-3.5 bg-[#29100b] rounded-xl border border-[#dab38c]/20 space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-bold text-[11px] text-[#e3a157]">Custom Date Batches</span>
                <button
                  type="button"
                  onClick={addCustomSlotRow}
                  className="px-2.5 py-1 bg-[#e3a157] hover:bg-[#dab38c] text-[#29100b] font-bold rounded-lg text-[10px] flex items-center gap-1 cursor-pointer"
                >
                  <Plus className="w-3 h-3" />
                  <span>Add Another Date</span>
                </button>
              </div>

              {state.customSlots.length === 0 ? (
                <div className="text-center py-4 text-[#dab38c]/60 italic">
                  No custom dates added. Click "+ Add Another Date" above to add specific event dates.
                </div>
              ) : (
                <div className="space-y-2">
                  {state.customSlots.map((slot, idx) => (
                    <div
                      key={slot.id}
                      className="grid grid-cols-12 gap-2 items-center bg-[#1f0b07] p-2 rounded-lg border border-[#dab38c]/20"
                    >
                      <div className="col-span-4 sm:col-span-4">
                        <label className="text-[9px] text-[#dab38c]/70 block">Date #{idx + 1}</label>
                        <input
                          type="date"
                          value={slot.date}
                          onChange={(e) => updateCustomSlotRow(slot.id, { date: e.target.value })}
                          className="w-full px-2 py-1 bg-[#29100b] border border-[#dab38c]/30 rounded text-white text-[11px]"
                        />
                      </div>
                      <div className="col-span-3 sm:col-span-3">
                        <label className="text-[9px] text-[#dab38c]/70 block">Start</label>
                        <input
                          type="time"
                          value={slot.startTime}
                          onChange={(e) =>
                            updateCustomSlotRow(slot.id, { startTime: e.target.value })
                          }
                          className="w-full px-2 py-1 bg-[#29100b] border border-[#dab38c]/30 rounded text-white text-[11px]"
                        />
                      </div>
                      <div className="col-span-3 sm:col-span-3">
                        <label className="text-[9px] text-[#dab38c]/70 block">End</label>
                        <input
                          type="time"
                          value={slot.endTime}
                          onChange={(e) => updateCustomSlotRow(slot.id, { endTime: e.target.value })}
                          className="w-full px-2 py-1 bg-[#29100b] border border-[#dab38c]/30 rounded text-white text-[11px]"
                        />
                      </div>
                      <div className="col-span-2 sm:col-span-2 flex items-center gap-1 pt-3.5">
                        <input
                          type="number"
                          title="Capacity"
                          placeholder="Cap"
                          value={slot.capacity}
                          onChange={(e) =>
                            updateCustomSlotRow(slot.id, {
                              capacity: Number(e.target.value) || 12,
                            })
                          }
                          className="w-full px-1.5 py-1 bg-[#29100b] border border-[#dab38c]/30 rounded text-white text-[11px]"
                        />
                        <button
                          type="button"
                          onClick={() => removeCustomSlotRow(slot.id)}
                          className="p-1 text-red-400 hover:text-red-300 hover:bg-red-950/40 rounded cursor-pointer"
                          title="Remove slot"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Option 3: Single Slot */}
          {state.mode === "single" && (
            <div className="p-3.5 bg-[#29100b] rounded-xl border border-[#dab38c]/20 space-y-3">
              <div className="text-[11px] font-bold text-[#e3a157]">Single Date &amp; Window</div>
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-2">
                <div>
                  <label className="text-[10px] text-[#dab38c] block mb-1">Date</label>
                  <input
                    type="date"
                    value={state.singleDate}
                    onChange={(e) => onChange({ ...state, singleDate: e.target.value })}
                    className="w-full px-2 py-1.5 bg-[#1f0b07] border border-[#dab38c]/30 rounded-lg text-white"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-[#dab38c] block mb-1">Start Time</label>
                  <input
                    type="time"
                    value={state.singleStartTime}
                    onChange={(e) => onChange({ ...state, singleStartTime: e.target.value })}
                    className="w-full px-2 py-1.5 bg-[#1f0b07] border border-[#dab38c]/30 rounded-lg text-white"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-[#dab38c] block mb-1">End Time</label>
                  <input
                    type="time"
                    value={state.singleEndTime}
                    onChange={(e) => onChange({ ...state, singleEndTime: e.target.value })}
                    className="w-full px-2 py-1.5 bg-[#1f0b07] border border-[#dab38c]/30 rounded-lg text-white"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-[#dab38c] block mb-1">Capacity</label>
                  <input
                    type="number"
                    value={state.singleCapacity}
                    onChange={(e) =>
                      onChange({ ...state, singleCapacity: Number(e.target.value) || 12 })
                    }
                    className="w-full px-2 py-1.5 bg-[#1f0b07] border border-[#dab38c]/30 rounded-lg text-white"
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

/* =======================================================================
   2. ITINERARY & TIMELINE BUILDER
   ======================================================================= */

interface ItineraryBuilderProps {
  itinerary: ItineraryItem[];
  onChange: (items: ItineraryItem[]) => void;
  pillar?: "food" | "walks" | "workshops";
}

export const ItineraryBuilder: React.FC<ItineraryBuilderProps> = ({
  itinerary,
  onChange,
  pillar = "food",
}) => {
  const [isOpen, setIsOpen] = useState(true);

  const addStep = () => {
    const defaultTime =
      itinerary.length > 0 ? "Step " + (itinerary.length + 1) : "12:30 PM";
    onChange([
      ...itinerary,
      {
        time: defaultTime,
        title: "",
        description: "",
      },
    ]);
  };

  const removeStep = (index: number) => {
    onChange(itinerary.filter((_, idx) => idx !== index));
  };

  const updateStep = (index: number, field: keyof ItineraryItem, value: string) => {
    onChange(
      itinerary.map((item, idx) => (idx === index ? { ...item, [field]: value } : item)),
    );
  };

  const loadTemplate = () => {
    if (pillar === "food") {
      onChange([
        {
          time: "12:30 PM",
          title: "Courtyard Welcome & Sol Kadhi Refreshment",
          description: "Arrive at the coastal home courtyard. Sip freshly churned kokum sol kadhi while the host introduces today's fresh morning catch.",
        },
        {
          time: "01:00 PM",
          title: "Appetizers: Crispy Rava Fry Platter",
          description: "Live fried Surmai and golden prawns seasoned with artisanal Koli masala straight from the cast-iron skillet.",
        },
        {
          time: "01:45 PM",
          title: "The Main Coastal Thali: Crab Masala & Steamed Bhakri",
          description: "Rich, slow-simmered mud crab curry served with piping-hot rice bhakris, fragrant fish ambat, and steamed coastal rice.",
        },
        {
          time: "02:30 PM",
          title: "Sweet Finale & Custodian Conversation",
          description: "Traditional Ukdiche Modak sweet dumplings paired with tales of indigenous fishing routes and ancestral recipes.",
        },
      ]);
    } else if (pillar === "walks") {
      onChange([
        {
          time: "06:00 AM",
          title: "Harbour Gate Rendezvous & Safety Briefing",
          description: "Meet your licensed indigenous navigator. Receive high-traction safety gumboots and tidal morning briefing.",
        },
        {
          time: "06:30 AM",
          title: "Deep-Sea Trawler Landing & Live Fish Auction",
          description: "Walk between docking wooden trawlers. Witness the dynamic open-outcry bidding and grading of king prawns and pomfret.",
        },
        {
          time: "07:30 AM",
          title: "Prawn Peeling Courtyards & Ice Mills",
          description: "Meet veteran women grading catch and see the historic salt-block ice crushers powering the port.",
        },
        {
          time: "08:15 AM",
          title: "Fishermen Canteen Breakfast & Masala Chai",
          description: "Conclude at a historic 60-year-old port canteen with fresh spicy fish cutlets, pav, and hot tea.",
        },
      ]);
    } else {
      onChange([
        {
          time: "04:00 PM",
          title: "Artisanal Materials & Marine Heritage Intro",
          description: "Examine natural hemp fibers, coir cords, and indigenous shuttle needles used across coastal Mumbai.",
        },
        {
          time: "04:30 PM",
          title: "Hands-on Weaving & Mesh Knotting",
          description: "Step-by-step masterclass with a master craftsman learning classic diamond knot geometries.",
        },
        {
          time: "05:30 PM",
          title: "Finishing Your Take-Home Artifact & Q&A",
          description: "Complete your woven souvenir, test load tension, and hear oral histories of maritime sustainability.",
        },
      ]);
    }
  };

  return (
    <div className="border border-[#dab38c]/25 bg-[#1f0b07]/90 rounded-2xl overflow-hidden transition-all">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-4 py-3 bg-[#29100b] hover:bg-[#35160e] flex items-center justify-between text-left transition-colors cursor-pointer"
      >
        <div className="flex items-center gap-2.5">
          <Clock className="w-4 h-4 text-[#e3a157]" />
          <div>
            <div className="font-bold text-xs text-[#f5edeb] flex items-center gap-2">
              <span>Experience Itinerary &amp; Timeline Builder</span>
              <span className="text-[10px] px-2 py-0.5 rounded-full font-mono font-semibold bg-[#e3a157]/20 text-[#e3a157] border border-[#e3a157]/30">
                {itinerary.length} Steps
              </span>
            </div>
            <div className="text-[10px] text-[#dab38c]/70">
              Renders the interactive step-by-step route and course timeline on the frontend
            </div>
          </div>
        </div>
        {isOpen ? (
          <ChevronUp className="w-4 h-4 text-[#dab38c]" />
        ) : (
          <ChevronDown className="w-4 h-4 text-[#dab38c]" />
        )}
      </button>

      {isOpen && (
        <div className="p-4 space-y-3 text-xs">
          <div className="flex items-center justify-between flex-wrap gap-2 pb-1">
            <span className="text-[11px] font-semibold text-[#dab38c]">
              Chronological Steps (Times, Courses, or Stages)
            </span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={loadTemplate}
                className="px-2.5 py-1 rounded-lg bg-[#29100b] border border-[#dab38c]/30 text-[10px] font-semibold text-[#e3a157] hover:bg-[#35160e] cursor-pointer flex items-center gap-1"
              >
                <Sparkles className="w-3 h-3" />
                <span>Load {pillar.toUpperCase()} Template</span>
              </button>
              <button
                type="button"
                onClick={addStep}
                className="px-2.5 py-1 rounded-lg bg-[#e3a157] hover:bg-[#dab38c] text-[#29100b] font-bold text-[10px] cursor-pointer flex items-center gap-1"
              >
                <Plus className="w-3 h-3" />
                <span>Add Step</span>
              </button>
            </div>
          </div>

          {itinerary.length === 0 ? (
            <div className="p-4 rounded-xl bg-[#29100b]/60 border border-dashed border-[#dab38c]/30 text-center text-[#dab38c]/70">
              No itinerary steps yet. Click <strong>"Load Template"</strong> to populate recommended
              stages, or <strong>"Add Step"</strong> to customize your own schedule.
            </div>
          ) : (
            <div className="space-y-2.5">
              {itinerary.map((step, idx) => (
                <div
                  key={idx}
                  className="p-3 bg-[#29100b] rounded-xl border border-[#dab38c]/20 space-y-2 relative"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#e3a157]">
                      Stage #{idx + 1}
                    </span>
                    <button
                      type="button"
                      onClick={() => removeStep(idx)}
                      className="text-red-400 hover:text-red-300 p-1 cursor-pointer"
                      title="Remove step"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    <div>
                      <label className="text-[10px] text-[#dab38c] block mb-0.5">
                        Time / Tag (e.g. 12:30 PM) *
                      </label>
                      <input
                        type="text"
                        required
                        value={step.time}
                        onChange={(e) => updateStep(idx, "time", e.target.value)}
                        placeholder="e.g. 12:30 PM / Course 1"
                        className="w-full px-2 py-1 bg-[#1f0b07] border border-[#dab38c]/30 rounded text-white text-[11px]"
                      />
                    </div>
                    <div className="sm:col-span-2">
                      <label className="text-[10px] text-[#dab38c] block mb-0.5">
                        Step Title *
                      </label>
                      <input
                        type="text"
                        required
                        value={step.title}
                        onChange={(e) => updateStep(idx, "title", e.target.value)}
                        placeholder="e.g. Sol Kadhi Welcome & Spice Orientation"
                        className="w-full px-2 py-1 bg-[#1f0b07] border border-[#dab38c]/30 rounded text-white text-[11px]"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-[10px] text-[#dab38c] block mb-0.5">
                      Detailed Narrative / Notes
                    </label>
                    <textarea
                      rows={2}
                      value={step.description}
                      onChange={(e) => updateStep(idx, "description", e.target.value)}
                      placeholder="What happens during this segment? What will guests taste or explore?"
                      className="w-full px-2 py-1 bg-[#1f0b07] border border-[#dab38c]/30 rounded text-white text-[11px] resize-none"
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

/* =======================================================================
   3. WHAT'S INCLUDED & THINGS TO CARRY BUILDER
   ======================================================================= */

interface TagsBuilderProps {
  label: string;
  sublabel: string;
  icon?: "included" | "carry";
  items: string[];
  onChange: (items: string[]) => void;
  presetSuggestions?: string[];
  placeholder?: string;
}

export const TagsBuilder: React.FC<TagsBuilderProps> = ({
  label,
  sublabel,
  icon = "included",
  items,
  onChange,
  presetSuggestions = [],
  placeholder = "Type item and press Add or Enter...",
}) => {
  const [inputVal, setInputVal] = useState("");

  const addItem = (val: string) => {
    const trimmed = val.trim();
    if (!trimmed) return;
    if (!items.includes(trimmed)) {
      onChange([...items, trimmed]);
    }
    setInputVal("");
  };

  const removeItem = (target: string) => {
    onChange(items.filter((i) => i !== target));
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      addItem(inputVal);
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="font-semibold text-[#dab38c] text-xs flex items-center gap-1.5">
          {icon === "included" ? (
            <Utensils className="w-3.5 h-3.5 text-emerald-400" />
          ) : (
            <Backpack className="w-3.5 h-3.5 text-[#e3a157]" />
          )}
          <span>{label}</span>
        </label>
        <span className="text-[10px] text-[#dab38c]/70">{sublabel}</span>
      </div>

      <div className="flex gap-2">
        <input
          type="text"
          value={inputVal}
          onChange={(e) => setInputVal(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className="flex-1 px-3 py-1.5 bg-[#1f0b07] border border-[#dab38c]/30 rounded-xl text-white text-xs outline-none focus:border-[#e3a157]"
        />
        <button
          type="button"
          onClick={() => addItem(inputVal)}
          className="px-3 py-1.5 bg-[#29100b] hover:bg-[#35160e] border border-[#dab38c]/40 text-[#dab38c] hover:text-white rounded-xl text-xs font-semibold cursor-pointer"
        >
          Add
        </button>
      </div>

      {presetSuggestions.length > 0 && (
        <div className="flex items-center gap-1.5 flex-wrap pt-0.5">
          <span className="text-[10px] text-[#dab38c]/60 font-semibold">Suggested:</span>
          {presetSuggestions.map((s, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => addItem(s)}
              className="px-2 py-0.5 rounded-full bg-[#1f0b07] border border-[#dab38c]/25 text-[10px] text-[#dab38c] hover:text-white hover:border-[#e3a157] cursor-pointer"
            >
              + {s}
            </button>
          ))}
        </div>
      )}

      {/* Render Chips */}
      {items.length > 0 && (
        <div className="flex flex-wrap gap-1.5 pt-1">
          {items.map((item, idx) => (
            <span
              key={idx}
              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs font-medium border ${
                icon === "included"
                  ? "bg-emerald-950/60 text-emerald-300 border-emerald-600/40"
                  : "bg-[#29100b] text-[#dab38c] border-[#dab38c]/40"
              }`}
            >
              <span>{item}</span>
              <button
                type="button"
                onClick={() => removeItem(item)}
                className="text-red-400 hover:text-red-200 cursor-pointer text-sm leading-none"
              >
                ×
              </button>
            </span>
          ))}
        </div>
      )}
    </div>
  );
};

/* =======================================================================
   4. HOST BIO / HERITAGE STORY
   ======================================================================= */

interface HostBioInputProps {
  value: string;
  onChange: (val: string) => void;
  roleLabel?: string;
}

export const HostBioInput: React.FC<HostBioInputProps> = ({
  value,
  onChange,
  roleLabel = "Cook & Custodian",
}) => {
  return (
    <div>
      <label className="font-semibold text-[#dab38c] text-xs block mb-1 flex items-center gap-1.5">
        <UserCheck className="w-3.5 h-3.5 text-[#e3a157]" />
        <span>{roleLabel} Heritage Story &amp; Bio</span>
      </label>
      <textarea
        rows={3}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={`Share the custodian's heritage story, family coastal lineage, recipes passed through generations, and why this experience is unique...`}
        className="w-full px-3 py-2 bg-[#1f0b07] border border-[#dab38c]/30 rounded-xl text-white text-xs outline-none focus:border-[#e3a157] resize-none"
      />
    </div>
  );
};
