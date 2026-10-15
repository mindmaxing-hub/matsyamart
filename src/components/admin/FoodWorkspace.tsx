import React, { useState, useMemo } from "react";
import { Order, Listing, ExperienceSlot, OrderItem } from "../../types";
import { useData } from "../../context/DataContext";
import { formatINR, formatDate, formatTime } from "../../lib/utils";
import { BookMyShowPass } from "./BookMyShowPass";
import {
  Utensils,
  MapPin,
  Clock,
  Users,
  Ticket,
  Calendar,
  ExternalLink,
  CheckCircle2,
  AlertCircle,
  Plus,
  Search,
  Sparkles,
} from "lucide-react";

interface FoodWorkspaceProps {
  orders: Order[];
  listings: Listing[];
  slots: ExperienceSlot[];
}

export const FoodWorkspace: React.FC<FoodWorkspaceProps> = ({
  orders,
  listings,
  slots,
}) => {
  const { updateAttendeeCheckIn } = useData();

  const [activeSubTab, setActiveSubTab] = useState<"dinners" | "venues" | "roster">("dinners");
  const [selectedTicketOrder, setSelectedTicketOrder] = useState<{
    order: Order;
    item: OrderItem;
  } | null>(null);

  const [guestSearch, setGuestSearch] = useState("");

  // Food experiences
  const foodListings = useMemo(() => {
    return listings.filter((l) => l.pillar === "food" && l.type === "experience");
  }, [listings]);

  // Food orders
  const foodOrders = useMemo(() => {
    return orders.filter((o) =>
      o.items.some((item) => item.listing?.pillar === "food"),
    );
  }, [orders]);

  // Flattened guest roster for Food
  const foodAttendees = useMemo(() => {
    const list: {
      order: Order;
      item: OrderItem;
      attendeeIndex: number;
      name: string;
      phone: string;
      checkedIn: boolean;
      slot?: ExperienceSlot | undefined;
      listing?: Listing | undefined;
    }[] = [];

    foodOrders.forEach((order) => {
      order.items
        .filter((item) => item.listing?.pillar === "food")
        .forEach((item) => {
          const attendees = item.attendee_details || [
            { fullName: order.customer_name, phone: order.customer_phone },
          ];

          attendees.forEach((att, idx) => {
            list.push({
              order,
              item,
              attendeeIndex: idx,
              name: att.fullName,
              phone: att.phone,
              checkedIn: !!att.checked_in,
              slot: item.slot,
              listing: item.listing,
            });
          });
        });
    });

    return list.filter((a) => {
      return (
        a.name.toLowerCase().includes(guestSearch.toLowerCase()) ||
        a.phone.includes(guestSearch) ||
        a.order.order_ref.toLowerCase().includes(guestSearch.toLowerCase()) ||
        (a.listing?.title &&
          a.listing.title.toLowerCase().includes(guestSearch.toLowerCase()))
      );
    });
  }, [foodOrders, guestSearch]);

  return (
    <div className="space-y-6 text-[#f5edeb]">
      {/* BookMyShow Digital Pass Modal */}
      {selectedTicketOrder && (
        <BookMyShowPass
          order={selectedTicketOrder.order}
          item={selectedTicketOrder.item}
          onClose={() => setSelectedTicketOrder(null)}
        />
      )}

      {/* Sub-Tab Navigation Strip */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-2 border-b border-[#dab38c]/20">
        <div className="flex items-center gap-1.5 p-1 bg-[#35160e]/80 border border-[#dab38c]/20 rounded-2xl">
          <button
            onClick={() => setActiveSubTab("dinners")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeSubTab === "dinners"
                ? "bg-[#e3a157] text-[#29100b] shadow-md"
                : "text-[#dab38c] hover:text-[#f5edeb] hover:bg-[#481f14]"
            }`}
          >
            🍲 Gatherings &amp; Menus ({foodListings.length})
          </button>
          <button
            onClick={() => setActiveSubTab("venues")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeSubTab === "venues"
                ? "bg-[#e3a157] text-[#29100b] shadow-md"
                : "text-[#dab38c] hover:text-[#f5edeb] hover:bg-[#481f14]"
            }`}
          >
            🏡 Venues &amp; Seating Windows
          </button>
          <button
            onClick={() => setActiveSubTab("roster")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeSubTab === "roster"
                ? "bg-[#e3a157] text-[#29100b] shadow-md"
                : "text-[#dab38c] hover:text-[#f5edeb] hover:bg-[#481f14]"
            }`}
          >
            👥 Guest Roster &amp; BookMyShow Passes ({foodAttendees.length})
          </button>
        </div>
      </div>

      {/* SUB-TAB 1: Dinners & Menus */}
      {activeSubTab === "dinners" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {foodListings.map((dinner) => (
            <div
              key={dinner.id}
              className="bg-[#35160e]/90 border border-[#dab38c]/25 rounded-3xl p-5 shadow-xl flex flex-col justify-between space-y-4"
            >
              <div className="space-y-3">
                <div className="relative h-44 rounded-2xl overflow-hidden border border-[#dab38c]/20">
                  <img
                    src={dinner.images[0]}
                    alt={dinner.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-2.5 left-2.5 bg-[#1f0b07]/85 backdrop-blur-xs px-3 py-1 rounded-full text-[11px] font-bold text-[#e3a157] border border-[#dab38c]/30">
                    Seafood Feasting Experience
                  </div>
                  <div className="absolute bottom-2.5 right-2.5 bg-[#29100b]/90 px-3 py-1 rounded-xl text-xs font-bold font-mono text-[#f5edeb] border border-[#dab38c]/30">
                    {formatINR(dinner.price_inr)} / plate
                  </div>
                </div>

                <div>
                  <h3 className="font-display font-bold text-lg text-[#f5edeb]">
                    {dinner.title}
                  </h3>
                  <p className="text-xs text-[#dab38c]/80 mt-1 line-clamp-2">
                    {dinner.short_summary}
                  </p>
                </div>

                {/* Multi-Course Menu Preview */}
                <div className="p-3 bg-[#29100b] rounded-2xl border border-[#dab38c]/20 space-y-1.5 text-xs">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-[#e3a157]">
                    Traditional Course Highlights
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-[11px] text-[#dab38c]">
                    <div>🐟 Fresh Catch Surmai / Pomfret</div>
                    <div>🥥 Sol Kadhi Digestive</div>
                    <div>🦀 Mud Crab Masala &amp; Bhakri</div>
                    <div>🌾 Ancestral Rice &amp; Sweets</div>
                  </div>
                </div>

                {/* Host Cook Details */}
                <div className="flex items-center justify-between text-xs pt-1">
                  <div>
                    <span className="text-[#dab38c]/70">Cook &amp; Custodian:</span>{" "}
                    <strong className="text-[#f5edeb]">{dinner.host_name}</strong>
                  </div>
                  <span className="text-[#dab38c] font-mono text-[11px]">
                    {dinner.host_phone || "+91 98201 44512"}
                  </span>
                </div>
              </div>

              <div className="pt-3 border-t border-[#dab38c]/15 flex items-center justify-between text-xs">
                <span className="text-[#dab38c] flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-[#e3a157]" />
                  {dinner.duration_minutes || 180} mins feast
                </span>
                <span className="text-emerald-400 font-semibold text-[11px]">
                  ● Open for Bookings
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* SUB-TAB 2: Venues & Seating Windows */}
      {activeSubTab === "venues" && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {foodListings.map((dinner) => (
              <div
                key={dinner.id}
                className="bg-[#35160e]/90 border border-[#dab38c]/25 rounded-2xl p-5 shadow-xl space-y-4"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="font-display font-bold text-base text-[#f5edeb]">
                      {dinner.location_name || "Versova Gaothan, Mumbai"}
                    </h4>
                    <p className="text-xs text-[#dab38c] mt-0.5">
                      {dinner.title}
                    </p>
                  </div>
                  {dinner.meeting_point_maps_url && (
                    <a
                      href={dinner.meeting_point_maps_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 py-1 bg-[#29100b] hover:bg-[#1f0b07] border border-[#dab38c]/30 rounded-xl text-[11px] font-bold text-sky-400 flex items-center gap-1"
                    >
                      <span>Google Maps</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                </div>

                <div className="p-3 bg-[#29100b] rounded-xl border border-[#dab38c]/15 text-xs text-[#dab38c] space-y-1">
                  <div className="text-[10px] uppercase font-bold tracking-wider text-[#e3a157]">
                    Arrival &amp; Secret Courtyard Note
                  </div>
                  <div>{dinner.secret_meeting_point || "Rendezvous details provided to confirmed guests."}</div>
                </div>

                {/* Seating Capacities & Windows */}
                <div className="space-y-2 pt-2 border-t border-[#dab38c]/15 text-xs">
                  <div className="text-[10px] uppercase font-bold tracking-wider text-[#dab38c]/70">
                    Active Seating Windows
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div className="p-2.5 rounded-xl bg-[#29100b]/60 border border-[#dab38c]/20">
                      <div className="font-bold text-xs text-[#f5edeb]">Afternoon Feast</div>
                      <div className="text-[10px] text-[#dab38c]">12:30 PM – 03:00 PM</div>
                      <div className="text-[11px] font-mono text-emerald-400 mt-1">
                        Capacity: 12 Guests Max
                      </div>
                    </div>

                    <div className="p-2.5 rounded-xl bg-[#29100b]/60 border border-[#dab38c]/20">
                      <div className="font-bold text-xs text-[#f5edeb]">Sunset Coastal Supper</div>
                      <div className="text-[10px] text-[#dab38c]">06:30 PM – 09:30 PM</div>
                      <div className="text-[11px] font-mono text-emerald-400 mt-1">
                        Capacity: 14 Guests Max
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SUB-TAB 3: Guest Roster & BookMyShow Passes */}
      {activeSubTab === "roster" && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 text-[#dab38c]/60 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search guest by name, phone, order ref, feast..."
                value={guestSearch}
                onChange={(e) => setGuestSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-[#35160e]/80 border border-[#dab38c]/25 rounded-xl text-xs text-[#f5edeb] placeholder-[#dab38c]/50 outline-none focus:border-[#e3a157]"
              />
            </div>
            <div className="text-xs text-[#dab38c]">
              Total Booked Dining Guests: <strong className="text-[#f5edeb]">{foodAttendees.length}</strong>
            </div>
          </div>

          <div className="bg-[#35160e]/90 border border-[#dab38c]/25 rounded-2xl overflow-hidden shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#29100b] text-[#dab38c] border-b border-[#dab38c]/15">
                  <tr>
                    <th className="py-3 px-4 font-semibold">Guest Name &amp; Phone</th>
                    <th className="py-3 px-4 font-semibold">Feasting Gathering</th>
                    <th className="py-3 px-4 font-semibold">Slot Schedule</th>
                    <th className="py-3 px-4 font-semibold">Order Ref</th>
                    <th className="py-3 px-4 font-semibold">On-Ground Check-in</th>
                    <th className="py-3 px-4 font-semibold text-right">Digital Pass</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#dab38c]/10 text-[#f5edeb]">
                  {foodAttendees.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="text-center py-10 text-[#dab38c]/60">
                        No food dining guests found matching the search.
                      </td>
                    </tr>
                  ) : (
                    foodAttendees.map((att, idx) => (
                      <tr key={idx} className="hover:bg-[#481f14]/50 transition-colors">
                        <td className="py-3.5 px-4">
                          <div className="font-semibold text-sm">{att.name}</div>
                          <div className="text-[11px] text-[#dab38c] font-mono">
                            {att.phone}
                          </div>
                        </td>

                        <td className="py-3.5 px-4 font-medium text-xs max-w-[200px] truncate">
                          {att.listing?.title || "Coastal Dining Feast"}
                        </td>

                        <td className="py-3.5 px-4 text-xs">
                          {att.slot ? (
                            <div>
                              <div>{formatDate(att.slot.slot_start)}</div>
                              <div className="text-[10px] text-[#dab38c] font-mono">
                                {formatTime(att.slot.slot_start)}
                              </div>
                            </div>
                          ) : (
                            <span className="text-[#dab38c]/70">Standard Seating</span>
                          )}
                        </td>

                        <td className="py-3.5 px-4 font-mono text-[#e3a157] font-semibold">
                          {att.order.order_ref}
                        </td>

                        <td className="py-3.5 px-4">
                          <button
                            onClick={() =>
                              updateAttendeeCheckIn(
                                att.order.id,
                                att.item.id,
                                att.attendeeIndex,
                                !att.checkedIn,
                              )
                            }
                            className={`px-3 py-1 rounded-xl text-[11px] font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                              att.checkedIn
                                ? "bg-emerald-950/80 text-emerald-300 border border-emerald-500/50 shadow-xs"
                                : "bg-[#29100b] text-[#dab38c] border border-[#dab38c]/30 hover:bg-[#35160e]"
                            }`}
                          >
                            <CheckCircle2
                              className={`w-3.5 h-3.5 ${
                                att.checkedIn ? "text-emerald-400" : "text-[#dab38c]/50"
                              }`}
                            />
                            <span>{att.checkedIn ? "Arrived / Seated" : "Mark Arrived"}</span>
                          </button>
                        </td>

                        <td className="py-3.5 px-4 text-right">
                          <button
                            onClick={() =>
                              setSelectedTicketOrder({
                                order: att.order,
                                item: att.item,
                              })
                            }
                            className="px-3 py-1 bg-[#e3a157] hover:bg-[#dab38c] text-[#29100b] font-bold text-xs rounded-xl shadow-xs transition-all inline-flex items-center gap-1 cursor-pointer"
                          >
                            <Ticket className="w-3.5 h-3.5" />
                            <span>BookMyShow Pass</span>
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
