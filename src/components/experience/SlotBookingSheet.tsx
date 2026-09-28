import React, { useState, useMemo } from "react";
import {
  Calendar,
  Clock,
  Users,
  ShieldAlert,
  Sparkles,
  CheckCircle2,
  ChevronUp,
  X,
} from "lucide-react";
import { Listing, ExperienceSlot } from "../../types";
import { formatINR, formatSlotRange, formatDate } from "../../lib/utils";
import { CheckoutModal } from "../order/CheckoutModal";

interface SlotBookingSheetProps {
  listing: Listing;
  slots: ExperienceSlot[];
}

export const SlotBookingSheet: React.FC<SlotBookingSheetProps> = ({
  listing,
  slots,
}) => {
  // Group slots by Date (YYYY-MM-DD)
  const slotsByDate = useMemo(() => {
    const map: Record<string, ExperienceSlot[]> = {};
    slots.forEach((s) => {
      const dateKey = s.slot_start.split("T")[0];
      if (!dateKey) return;
      const list = map[dateKey];
      if (!list) {
        map[dateKey] = [s];
      } else {
        list.push(s);
      }
    });
    return map;
  }, [slots]);

  const availableDateKeys = Object.keys(slotsByDate).sort();
  const initialDate = availableDateKeys[0] || "";
  const initialSlots = initialDate ? slotsByDate[initialDate] : undefined;
  const initialSlot = initialSlots?.[0];

  const [selectedDate, setSelectedDate] = useState<string>(initialDate);
  const [selectedSlotId, setSelectedSlotId] = useState<string>(
    initialSlot ? initialSlot.id : "",
  );

  const [guestCount, setGuestCount] = useState<number>(1);
  const [isCheckoutModalOpen, setIsCheckoutModalOpen] =
    useState<boolean>(false);
  const [isMobileDrawerOpen, setIsMobileDrawerOpen] = useState<boolean>(false);

  // When date changes, update default selected slot
  const handleDateSelect = (dateKey: string) => {
    setSelectedDate(dateKey);
    const daySlots = slotsByDate[dateKey] || [];
    const firstDaySlot = daySlots[0];
    if (firstDaySlot) {
      setSelectedSlotId(firstDaySlot.id);
      setGuestCount(1);
    }
  };

  const currentSlot = slots.find((s) => s.id === selectedSlotId);
  const remainingSeats = currentSlot
    ? Math.max(0, currentSlot.capacity - currentSlot.booked_count)
    : 0;
  const totalAmount = listing.price_inr * guestCount;

  const renderBookingForm = () => (
    <div className="space-y-6">
      {/* Price Header */}
      <div className="flex items-baseline justify-between border-b border-slate-100 pb-4">
        <div>
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
            Price Per Person
          </span>
          <div className="font-display font-bold text-3xl text-ocean-950">
            {formatINR(listing.price_inr)}
            <span className="text-sm font-normal text-slate-500 font-sans">
              {" "}
              / guest
            </span>
          </div>
        </div>
        <div className="text-right">
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-100">
            <CheckCircle2 className="w-3.5 h-3.5" /> Instant Confirmation
          </span>
        </div>
      </div>

      {slots.length === 0 ? (
        <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-xs text-amber-800 space-y-1">
          <div className="font-bold">No upcoming dates scheduled</div>
          <p>
            Tidal slots are coordinated directly with community boatmen
            according to the lunar cycle. Check back shortly!
          </p>
        </div>
      ) : (
        <>
          {/* Step 1: Select Date */}
          <div className="space-y-2.5">
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-ocean-700" />
              <span>1. Select Date</span>
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {availableDateKeys.slice(0, 6).map((dateKey) => {
                const isSelected = selectedDate === dateKey;
                const d = new Date(dateKey);
                const dayName = d.toLocaleDateString("en-IN", {
                  weekday: "short",
                });
                const dayNum = d.toLocaleDateString("en-IN", {
                  day: "numeric",
                  month: "short",
                });

                return (
                  <button
                    key={dateKey}
                    type="button"
                    onClick={() => handleDateSelect(dateKey)}
                    className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                      isSelected
                        ? "bg-ocean-900 text-white border-ocean-900 shadow-xs"
                        : "bg-slate-50 text-slate-700 border-slate-200 hover:border-slate-300 hover:bg-white"
                    }`}
                  >
                    <div className="text-[10px] font-semibold uppercase tracking-wider opacity-80">
                      {dayName}
                    </div>
                    <div className="text-xs font-bold mt-0.5">{dayNum}</div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Step 2: Select Time Slot */}
          {selectedDate && slotsByDate[selectedDate] && (
            <div className="space-y-2.5">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-ocean-700" />
                <span>2. Available Time Slot</span>
              </label>
              <div className="space-y-2">
                {(slotsByDate[selectedDate] || []).map((slot) => {
                  const isSelected = selectedSlotId === slot.id;
                  const left = Math.max(0, slot.capacity - slot.booked_count);
                  const isSoldOut = left <= 0;

                  return (
                    <button
                      key={slot.id}
                      type="button"
                      disabled={isSoldOut}
                      onClick={() => {
                        setSelectedSlotId(slot.id);
                        if (guestCount > left) setGuestCount(left);
                      }}
                      className={`w-full p-3 rounded-xl border text-left flex items-center justify-between transition-all cursor-pointer ${
                        isSoldOut
                          ? "opacity-40 bg-slate-100 border-slate-200 cursor-not-allowed"
                          : isSelected
                            ? "bg-ocean-50 text-ocean-950 border-ocean-600 ring-2 ring-ocean-600/20"
                            : "bg-white text-slate-800 border-slate-200 hover:bg-slate-50"
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <span
                          className={`w-2 h-2 rounded-full ${isSoldOut ? "bg-slate-400" : left <= 4 ? "bg-amber-500" : "bg-emerald-500"}`}
                        />
                        <span className="text-xs font-semibold">
                          {formatSlotRange(slot.slot_start, slot.slot_end)}
                        </span>
                      </div>
                      <div className="text-right">
                        <span
                          className={`text-[11px] font-semibold ${isSoldOut ? "text-rose-600" : left <= 4 ? "text-amber-700" : "text-slate-500"}`}
                        >
                          {isSoldOut ? "Sold out" : `${left} seats remaining`}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Step 3: Guest Counter */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5 text-ocean-700" />
                <span>3. Number of Guests</span>
              </label>
              <span className="text-xs text-slate-500 font-medium">
                Max {remainingSeats} spots
              </span>
            </div>

            <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-200">
              <div className="text-xs text-slate-700">
                <span className="font-semibold block">
                  {guestCount} {guestCount === 1 ? "Attendee" : "Attendees"}
                </span>
                <span className="text-[11px] text-slate-500">
                  Includes breakfast & safety gear
                </span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  disabled={guestCount <= 1}
                  onClick={() => setGuestCount((c) => Math.max(1, c - 1))}
                  className="w-8 h-8 rounded-lg bg-white border border-slate-300 text-slate-700 font-bold hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center transition-colors cursor-pointer"
                >
                  -
                </button>
                <span className="w-6 text-center font-bold text-sm text-slate-800">
                  {guestCount}
                </span>
                <button
                  type="button"
                  disabled={guestCount >= remainingSeats}
                  onClick={() =>
                    setGuestCount((c) => Math.min(remainingSeats, c + 1))
                  }
                  className="w-8 h-8 rounded-lg bg-white border border-slate-300 text-slate-700 font-bold hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center transition-colors cursor-pointer"
                >
                  +
                </button>
              </div>
            </div>
          </div>

          {/* Price Breakdown */}
          <div className="p-4 rounded-2xl bg-ocean-50/70 border border-ocean-100 space-y-2 text-xs">
            <div className="flex justify-between text-slate-600">
              <span>
                {formatINR(listing.price_inr)} × {guestCount}{" "}
                {guestCount === 1 ? "guest" : "guests"}
              </span>
              <span className="font-medium text-slate-800">
                {formatINR(totalAmount)}
              </span>
            </div>
            <div className="flex justify-between text-slate-600">
              <span>Community Host Payout</span>
              <span className="font-semibold text-emerald-700">
                100% Direct
              </span>
            </div>
            <div className="flex justify-between text-base font-bold text-ocean-950 pt-2 border-t border-ocean-200/60">
              <span>Total Payable</span>
              <span className="font-display">{formatINR(totalAmount)}</span>
            </div>
          </div>

          {/* Action Trigger */}
          <button
            type="button"
            disabled={remainingSeats <= 0 || !selectedSlotId}
            onClick={() => {
              setIsMobileDrawerOpen(false);
              setIsCheckoutModalOpen(true);
            }}
            className="w-full py-4 bg-ocean-800 hover:bg-ocean-900 disabled:bg-slate-300 disabled:cursor-not-allowed text-white font-semibold text-sm rounded-2xl shadow-md transition-all flex items-center justify-center gap-2 group cursor-pointer"
          >
            <Sparkles className="w-4 h-4 text-sun-300" />
            <span>Proceed to Reserve Spot</span>
          </button>

          <p className="text-[11px] text-slate-400 text-center flex items-center justify-center gap-1">
            <ShieldAlert className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <span>Secret meeting point coordinates unlocked upon booking</span>
          </p>
        </>
      )}
    </div>
  );

  return (
    <>
      {/* Desktop Sticky Container */}
      <div className="hidden lg:block bg-white rounded-3xl border border-slate-200/90 shadow-tactile p-6">
        {renderBookingForm()}
      </div>

      {/* Mobile Floating Sticky Bottom Bar (Visible on mobile screens) */}
      <div className="lg:hidden fixed bottom-0 inset-x-0 bg-white/95 backdrop-blur-md border-t border-slate-200 p-3.5 z-40 shadow-modal flex items-center justify-between">
        <div>
          <span className="text-[10px] text-slate-400 uppercase font-semibold block">
            Total Price
          </span>
          <div className="font-display font-bold text-lg text-ocean-950">
            {formatINR(totalAmount)}
            <span className="text-xs font-normal text-slate-500 font-sans">
              {" "}
              ({guestCount} {guestCount === 1 ? "guest" : "guests"})
            </span>
          </div>
        </div>

        <button
          onClick={() => setIsMobileDrawerOpen(true)}
          className="px-5 py-2.5 bg-ocean-800 hover:bg-ocean-900 text-white rounded-xl text-xs font-semibold shadow-xs flex items-center gap-1.5 transition-colors cursor-pointer"
        >
          <span>Select Date & Book</span>
          <ChevronUp className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Mobile Bottom Sheet Modal */}
      {isMobileDrawerOpen && (
        <div className="lg:hidden fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-end">
          <div className="w-full bg-white rounded-t-3xl max-h-[90vh] overflow-y-auto p-6 space-y-4 shadow-modal animate-slide-up">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <span className="font-display font-bold text-base text-ocean-950">
                Choose Date & Guests
              </span>
              <button
                onClick={() => setIsMobileDrawerOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {renderBookingForm()}
          </div>
        </div>
      )}

      {/* Checkout Modal */}
      {isCheckoutModalOpen && (
        <CheckoutModal
          items={[
            {
              listing,
              quantity: guestCount,
              slotId: selectedSlotId,
            },
          ]}
          onClose={() => setIsCheckoutModalOpen(false)}
        />
      )}
    </>
  );
};
