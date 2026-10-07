import React from "react";
import { useData } from "../../context/DataContext";
import { ExperienceSlot, Listing } from "../../types";
import { formatTime, formatDate } from "../../lib/utils";
import {
  Users,
  CheckCircle2,
  XCircle,
  Phone,
  Mail,
  Printer,
  X,
  MapPin,
  Calendar,
  Clock,
  ShieldAlert,
} from "lucide-react";

interface GuestListViewProps {
  slot: ExperienceSlot;
  listing?: Listing | undefined;
  onClose: () => void;
}

export const GuestListView: React.FC<GuestListViewProps> = ({
  slot,
  listing,
  onClose,
}) => {
  const { orders, updateAttendeeCheckIn } = useData();

  // Find all orders that booked this slot
  const slotBookings = orders.flatMap((order) => {
    return order.items
      .filter((item) => item.slot_id === slot.id)
      .map((item) => ({
        order,
        item,
      }));
  });

  const totalBookedAttendees = slotBookings.reduce(
    (sum, b) => sum + b.item.quantity,
    0,
  );

  const checkedInCount = slotBookings.reduce((sum, b) => {
    const attendees = b.item.attendee_details || [];
    const checked = attendees.filter((a) => a.checked_in).length;
    return sum + checked;
  }, 0);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs">
      <div className="bg-[#29100b] border border-[#dab38c]/30 rounded-3xl max-w-3xl w-full p-6 space-y-5 shadow-2xl relative max-h-[90vh] flex flex-col text-[#f5edeb]">
        {/* Header */}
        <div className="flex items-start justify-between pb-4 border-b border-[#dab38c]/20">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#35160e] text-[#e3a157] text-[10px] font-bold border border-[#dab38c]/20 uppercase">
              Host Manifest · Guest Roster
            </div>
            <h3 className="font-display font-bold text-xl text-[#f5edeb] mt-1">
              {listing?.title || "Coastal Experience"}
            </h3>
            <div className="flex flex-wrap items-center gap-3 text-xs text-[#dab38c] mt-1">
              <span className="flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-[#e3a157]" />
                {formatDate(slot.slot_start)}
              </span>
              <span>·</span>
              <span className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-[#e3a157]" />
                {formatTime(slot.slot_start)} – {formatTime(slot.slot_end)}
              </span>
              <span>·</span>
              <span className="flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-[#e3a157]" />
                {listing?.location_name?.split(",")[0] || "Mumbai Coast"}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 print:hidden">
            <button
              onClick={handlePrint}
              className="p-2 rounded-xl bg-[#35160e] hover:bg-[#481f14] text-[#dab38c] hover:text-[#f5edeb] border border-[#dab38c]/30 cursor-pointer"
              title="Print Guest List"
            >
              <Printer className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-[#35160e] hover:bg-[#481f14] text-[#dab38c] hover:text-[#f5edeb] border border-[#dab38c]/30 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Quick Stats Bar */}
        <div className="grid grid-cols-3 gap-3 p-3 bg-[#35160e]/80 rounded-2xl border border-[#dab38c]/20 text-xs">
          <div>
            <div className="text-[10px] text-[#dab38c] uppercase font-bold">
              Capacity
            </div>
            <div className="text-base font-bold font-display text-[#f5edeb]">
              {slot.capacity} seats
            </div>
          </div>
          <div>
            <div className="text-[10px] text-[#dab38c] uppercase font-bold">
              Total Booked
            </div>
            <div className="text-base font-bold font-display text-[#e3a157]">
              {totalBookedAttendees} guests ({slotBookings.length} orders)
            </div>
          </div>
          <div>
            <div className="text-[10px] text-[#dab38c] uppercase font-bold">
              Checked In
            </div>
            <div className="text-base font-bold font-display text-emerald-400">
              {checkedInCount} / {totalBookedAttendees}
            </div>
          </div>
        </div>

        {/* Guest Table */}
        <div className="overflow-y-auto flex-1 border border-[#dab38c]/20 rounded-2xl bg-[#1f0b07]">
          {slotBookings.length === 0 ? (
            <div className="py-12 text-center text-xs text-[#dab38c]">
              <Users className="w-8 h-8 text-[#e3a157]/40 mx-auto mb-2" />
              <span>No bookings recorded for this event slot yet.</span>
            </div>
          ) : (
            <table className="w-full text-left text-xs">
              <thead className="bg-[#29100b] text-[#dab38c] border-b border-[#dab38c]/15 sticky top-0">
                <tr>
                  <th className="py-2.5 px-3 font-semibold">Attendee / Lead</th>
                  <th className="py-2.5 px-3 font-semibold">Contact</th>
                  <th className="py-2.5 px-3 font-semibold">Ticket Ref</th>
                  <th className="py-2.5 px-3 font-semibold">Emergency Contact</th>
                  <th className="py-2.5 px-3 font-semibold text-right">Check-in</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#dab38c]/10 text-[#f5edeb]">
                {slotBookings.map(({ order, item }) => {
                  const attendees = item.attendee_details || [];
                  const displayAttendees =
                    attendees.length > 0
                      ? attendees
                      : [
                          {
                            fullName: order.customer_name,
                            phone: order.customer_phone,
                            email: order.customer_email,
                            checked_in: false,
                          },
                        ];

                  return displayAttendees.map((att, aIdx) => {
                    const isCheckedIn = Boolean(att.checked_in);

                    return (
                      <tr
                        key={`${order.id}-${item.id}-${aIdx}`}
                        className="hover:bg-[#35160e]/50 transition-colors"
                      >
                        {/* Attendee Name */}
                        <td className="py-3 px-3">
                          <div className="font-bold text-sm text-[#f5edeb]">
                            {att.fullName || order.customer_name}
                          </div>
                          {aIdx === 0 && (
                            <span className="text-[10px] text-[#e3a157] font-semibold">
                              (Lead Booker)
                            </span>
                          )}
                        </td>

                        {/* Contact */}
                        <td className="py-3 px-3">
                          <div className="flex items-center gap-1 font-mono text-[11px] text-[#dab38c]">
                            <Phone className="w-3 h-3 text-[#e3a157]" />
                            <a
                              href={`tel:${att.phone || order.customer_phone}`}
                              className="hover:underline"
                            >
                              {att.phone || order.customer_phone}
                            </a>
                          </div>
                          {(att.email || order.customer_email) && (
                            <div className="flex items-center gap-1 text-[10px] text-[#dab38c]/70 mt-0.5 truncate max-w-[160px]">
                              <Mail className="w-2.5 h-2.5" />
                              <span>{att.email || order.customer_email}</span>
                            </div>
                          )}
                        </td>

                        {/* Order Ref */}
                        <td className="py-3 px-3 font-mono text-[11px] font-semibold text-[#e3a157]">
                          {order.order_ref}
                        </td>

                        {/* Emergency Contact */}
                        <td className="py-3 px-3 text-[#dab38c] text-[11px]">
                          {order.emergency_contact ? (
                            <span className="flex items-center gap-1">
                              <ShieldAlert className="w-3 h-3 text-rose-400 shrink-0" />
                              <span>{order.emergency_contact}</span>
                            </span>
                          ) : (
                            <span className="text-[10px] opacity-40">—</span>
                          )}
                        </td>

                        {/* Check-in Toggle */}
                        <td className="py-3 px-3 text-right">
                          <button
                            onClick={() =>
                              updateAttendeeCheckIn(
                                order.id,
                                item.id,
                                aIdx,
                                !isCheckedIn,
                              )
                            }
                            className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold cursor-pointer transition-all ${
                              isCheckedIn
                                ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/30"
                                : "bg-[#35160e] text-[#dab38c] border border-[#dab38c]/30 hover:bg-[#481f14]"
                            }`}
                          >
                            {isCheckedIn ? (
                              <>
                                <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                                <span>Checked In</span>
                              </>
                            ) : (
                              <span>Mark Check-in</span>
                            )}
                          </button>
                        </td>
                      </tr>
                    );
                  });
                })}
              </tbody>
            </table>
          )}
        </div>

        {/* Footer info */}
        <div className="flex items-center justify-between text-[11px] text-[#dab38c]/70 pt-2 border-t border-[#dab38c]/15">
          <span>
            Host Contact: <b>{listing?.host_name || "Community Host"}</b> ({listing?.host_phone || "+91 98201 44512"})
          </span>
          <span className="font-mono text-[10px]">
            MatsyaMart Operational Dispatch
          </span>
        </div>
      </div>
    </div>
  );
};
