import React, { useState, useMemo } from "react";
import { Order, Listing, ExperienceSlot, OrderItem } from "../../types";
import { useData } from "../../context/DataContext";
import { formatINR, formatDate, formatTime } from "../../lib/utils";
import { BookMyShowPass } from "./BookMyShowPass";
import {
  Compass,
  MapPin,
  Clock,
  Users,
  Ticket,
  Calendar,
  ExternalLink,
  CheckCircle2,
  AlertCircle,
  Phone,
  Waves,
  Search,
} from "lucide-react";

interface WalksWorkspaceProps {
  orders: Order[];
  listings: Listing[];
  slots: ExperienceSlot[];
}

export const WalksWorkspace: React.FC<WalksWorkspaceProps> = ({
  orders,
  listings,
  slots,
}) => {
  const { updateAttendeeCheckIn } = useData();

  const [activeSubTab, setActiveSubTab] = useState<"trails" | "guides" | "manifest">("trails");
  const [selectedTicketOrder, setSelectedTicketOrder] = useState<{
    order: Order;
    item: OrderItem;
  } | null>(null);

  const [manifestSearch, setManifestSearch] = useState("");

  // Walks listings
  const walkListings = useMemo(() => {
    return listings.filter((l) => l.pillar === "walks" && l.type === "experience");
  }, [listings]);

  // Walks orders
  const walkOrders = useMemo(() => {
    return orders.filter((o) =>
      o.items.some((item) => item.listing?.pillar === "walks"),
    );
  }, [orders]);

  // Flattened guest manifest for Walks
  const walkAttendees = useMemo(() => {
    const list: {
      order: Order;
      item: OrderItem;
      attendeeIndex: number;
      name: string;
      phone: string;
      checkedIn: boolean;
      slot?: ExperienceSlot | undefined;
      listing?: Listing | undefined;
      emergencyContact?: string | undefined;
    }[] = [];

    walkOrders.forEach((order) => {
      order.items
        .filter((item) => item.listing?.pillar === "walks")
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
              emergencyContact: order.emergency_contact,
            });
          });
        });
    });

    return list.filter((a) => {
      return (
        a.name.toLowerCase().includes(manifestSearch.toLowerCase()) ||
        a.phone.includes(manifestSearch) ||
        a.order.order_ref.toLowerCase().includes(manifestSearch.toLowerCase()) ||
        (a.listing?.title &&
          a.listing.title.toLowerCase().includes(manifestSearch.toLowerCase()))
      );
    });
  }, [walkOrders, manifestSearch]);

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
            onClick={() => setActiveSubTab("trails")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeSubTab === "trails"
                ? "bg-[#e3a157] text-[#29100b] shadow-md"
                : "text-[#dab38c] hover:text-[#f5edeb] hover:bg-[#481f14]"
            }`}
          >
            🚶 Coastal Trails &amp; Tidal Schedules ({walkListings.length})
          </button>
          <button
            onClick={() => setActiveSubTab("guides")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeSubTab === "guides"
                ? "bg-[#e3a157] text-[#29100b] shadow-md"
                : "text-[#dab38c] hover:text-[#f5edeb] hover:bg-[#481f14]"
            }`}
          >
            🧭 Guides &amp; Meeting Pins
          </button>
          <button
            onClick={() => setActiveSubTab("manifest")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeSubTab === "manifest"
                ? "bg-[#e3a157] text-[#29100b] shadow-md"
                : "text-[#dab38c] hover:text-[#f5edeb] hover:bg-[#481f14]"
            }`}
          >
            📋 Trail Manifest &amp; QR Passes ({walkAttendees.length})
          </button>
        </div>
      </div>

      {/* SUB-TAB 1: Trails & Tidal Schedules */}
      {activeSubTab === "trails" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {walkListings.map((walk) => (
            <div
              key={walk.id}
              className="bg-[#35160e]/90 border border-[#dab38c]/25 rounded-3xl p-5 shadow-xl flex flex-col justify-between space-y-4"
            >
              <div className="space-y-3">
                <div className="relative h-44 rounded-2xl overflow-hidden border border-[#dab38c]/20">
                  <img
                    src={walk.images[0]}
                    alt={walk.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-2.5 left-2.5 bg-[#1f0b07]/85 backdrop-blur-xs px-3 py-1 rounded-full text-[11px] font-bold text-sky-300 border border-[#dab38c]/30 flex items-center gap-1.5">
                    <Waves className="w-3.5 h-3.5" />
                    <span>Low-Tide Window Controlled</span>
                  </div>
                  <div className="absolute bottom-2.5 right-2.5 bg-[#29100b]/90 px-3 py-1 rounded-xl text-xs font-bold font-mono text-[#f5edeb] border border-[#dab38c]/30">
                    {formatINR(walk.price_inr)} / person
                  </div>
                </div>

                <div>
                  <h3 className="font-display font-bold text-lg text-[#f5edeb]">
                    {walk.title}
                  </h3>
                  <p className="text-xs text-[#dab38c]/80 mt-1 line-clamp-2">
                    {walk.short_summary}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="p-2.5 bg-[#29100b] rounded-xl border border-[#dab38c]/15">
                    <div className="text-[10px] text-[#dab38c]/70 uppercase font-bold">Duration</div>
                    <div className="font-bold text-[#f5edeb] mt-0.5">{walk.duration_minutes || 150} Minutes</div>
                  </div>
                  <div className="p-2.5 bg-[#29100b] rounded-xl border border-[#dab38c]/15">
                    <div className="text-[10px] text-[#dab38c]/70 uppercase font-bold">Terrain</div>
                    <div className="font-bold text-[#f5edeb] mt-0.5">Harbor &amp; Wet Jetty</div>
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-[#dab38c]/15 flex items-center justify-between text-xs">
                <span className="text-[#dab38c]">
                  Guide: <strong className="text-[#f5edeb]">{walk.host_name}</strong>
                </span>
                <span className="text-emerald-400 font-semibold text-[11px]">
                  ● Open for Registration
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* SUB-TAB 2: Guides & Meeting Pins */}
      {activeSubTab === "guides" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {walkListings.map((walk) => (
            <div
              key={walk.id}
              className="bg-[#35160e]/90 border border-[#dab38c]/25 rounded-2xl p-5 shadow-xl space-y-4"
            >
              <div className="flex items-start justify-between">
                <div>
                  <h4 className="font-display font-bold text-base text-[#f5edeb]">
                    {walk.host_name}
                  </h4>
                  <div className="text-xs text-[#dab38c] font-mono mt-0.5">
                    {walk.host_phone || "+91 98201 44512"}
                  </div>
                </div>
                {walk.meeting_point_maps_url && (
                  <a
                    href={walk.meeting_point_maps_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3 py-1 bg-[#29100b] hover:bg-[#1f0b07] border border-[#dab38c]/30 rounded-xl text-[11px] font-bold text-sky-400 flex items-center gap-1"
                  >
                    <span>Google Maps GPS</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                )}
              </div>

              <div className="p-3 bg-[#29100b] rounded-xl border border-[#dab38c]/15 text-xs text-[#dab38c] space-y-1">
                <div className="text-[10px] uppercase font-bold tracking-wider text-[#e3a157]">
                  Rendezvous Location
                </div>
                <div>{walk.location_name}</div>
                {walk.secret_meeting_point && (
                  <div className="text-[11px] text-[#dab38c]/70 mt-1">
                    {walk.secret_meeting_point}
                  </div>
                )}
              </div>

              <div className="p-3 bg-[#29100b] rounded-xl border border-[#dab38c]/15 text-xs space-y-1">
                <div className="text-[10px] uppercase font-bold tracking-wider text-emerald-400">
                  Included Essentials
                </div>
                <ul className="list-disc list-inside text-[11px] text-[#dab38c] space-y-0.5">
                  {walk.included_items?.map((item, idx) => (
                    <li key={idx}>{item}</li>
                  )) || <li>Community guide &amp; traditional tea</li>}
                </ul>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* SUB-TAB 3: Trail Manifest & QR Passes */}
      {activeSubTab === "manifest" && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 text-[#dab38c]/60 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search walker by name, phone, order ref, trail..."
                value={manifestSearch}
                onChange={(e) => setManifestSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-[#35160e]/80 border border-[#dab38c]/25 rounded-xl text-xs text-[#f5edeb] placeholder-[#dab38c]/50 outline-none focus:border-[#e3a157]"
              />
            </div>
            <div className="text-xs text-[#dab38c]">
              Total Walkers on Trail: <strong className="text-[#f5edeb]">{walkAttendees.length}</strong>
            </div>
          </div>

          <div className="bg-[#35160e]/90 border border-[#dab38c]/25 rounded-2xl overflow-hidden shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#29100b] text-[#dab38c] border-b border-[#dab38c]/15">
                  <tr>
                    <th className="py-3 px-4 font-semibold">Walker Name &amp; Phone</th>
                    <th className="py-3 px-4 font-semibold">Trail Route</th>
                    <th className="py-3 px-4 font-semibold">Departure Window</th>
                    <th className="py-3 px-4 font-semibold">Order Ref</th>
                    <th className="py-3 px-4 font-semibold">Emergency Contact</th>
                    <th className="py-3 px-4 font-semibold">Check-in Status</th>
                    <th className="py-3 px-4 font-semibold text-right">Pass</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#dab38c]/10 text-[#f5edeb]">
                  {walkAttendees.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="text-center py-10 text-[#dab38c]/60">
                        No walkers found matching the manifest search.
                      </td>
                    </tr>
                  ) : (
                    walkAttendees.map((att, idx) => (
                      <tr key={idx} className="hover:bg-[#481f14]/50 transition-colors">
                        <td className="py-3.5 px-4">
                          <div className="font-semibold text-sm">{att.name}</div>
                          <div className="text-[11px] text-[#dab38c] font-mono">
                            {att.phone}
                          </div>
                        </td>

                        <td className="py-3.5 px-4 font-medium text-xs max-w-[180px] truncate">
                          {att.listing?.title || "Coastal Trail"}
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
                            <span className="text-[#dab38c]/70">06:15 AM Dawn</span>
                          )}
                        </td>

                        <td className="py-3.5 px-4 font-mono text-[#e3a157] font-semibold">
                          {att.order.order_ref}
                        </td>

                        <td className="py-3.5 px-4 text-xs text-[#dab38c] font-mono">
                          {att.emergencyContact || "On File"}
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
                            <span>{att.checkedIn ? "Checked-In" : "Check-In"}</span>
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
                            <span>Ticket</span>
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
