import React, { useState, useMemo } from "react";
import { Order, Listing, ExperienceSlot, OrderItem, PinVisibilityType } from "../../types";
import { useData } from "../../context/DataContext";
import { formatINR, formatDate, formatTime } from "../../lib/utils";
import { MobilePass } from "./MobilePass";
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
  Plus,
  X,
  Trash2,
  Sparkles,
  Edit2,
} from "lucide-react";
import { toast } from "sonner";
import { ImageDropzone } from "./ImageDropzone";
import {
  openWhatsApp,
  buildPassMessage,
  buildGuideManifestMessage,
} from "../../lib/whatsapp";
import { buildGoogleMapsUrl } from "../../lib/services/places";
import { SharedCoordinateInput } from "./SharedCoordinateInput";
import { SessionsAndVenuesManager } from "./SessionsAndVenuesManager";

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
  const { updateAttendeeCheckIn, addListing, updateListing, deleteListing, addSlot } = useData();

  const [activeSubTab, setActiveSubTab] = useState<"trails" | "guides" | "manifest">("trails");
  const [selectedTicketOrder, setSelectedTicketOrder] = useState<{
    order: Order;
    item: OrderItem;
  } | null>(null);

  const [manifestSearch, setManifestSearch] = useState("");

  // Add Walk Trail Modal State
  const [isAddWalkOpen, setIsAddWalkOpen] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newGuideName, setNewGuideName] = useState("Pranay Koli");
  const [newGuidePhone, setNewGuidePhone] = useState("+91 98201 44512");
  const [newPrice, setNewPrice] = useState("850");
  const [newDuration, setNewDuration] = useState("150");
  const [newLocationName, setNewLocationName] = useState("Versova Koliwada Harbor Jetty");
  const [newSecretNotes, setNewSecretNotes] = useState("Meet near the net-mending platform at Gate 2. Guide carries a blue MatsyaMart pennant.");
  const [newLat, setNewLat] = useState<number>(19.1316);
  const [newLng, setNewLng] = useState<number>(72.8109);
  const [newPinVisibility, setNewPinVisibility] = useState<PinVisibilityType>("public");
  const [newMapsUrl, setNewMapsUrl] = useState("https://www.google.com/maps/search/?api=1&query=19.1316,72.8109");
  const [newSummary, setNewSummary] = useState("Dawn exploration of traditional intertidal fishing methods, artisanal net casting, and mangrove nursery ecology led by community custodians.");
  const [newIncluded, setNewIncluded] = useState("Community Elder Guide, High-tide safety briefing, Traditional cutting chai, Mud boots");
  const [newImage, setNewImage] = useState("https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80");
  const [newSlotDate, setNewSlotDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 1); // Tomorrow
    return d.toISOString().split("T")[0];
  });
  const [newSlotStart, setNewSlotStart] = useState("06:30");
  const [newSlotEnd, setNewSlotEnd] = useState("09:00");
  const [newCapacity, setNewCapacity] = useState("15");

  const handleCreateWalk = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) {
      toast.error("Please enter a walk title.");
      return;
    }

    const slug = newTitle
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");

    const includedArray = newIncluded
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);

    const mapsUrl = buildGoogleMapsUrl(newLat, newLng);

    const created = addListing({
      title: newTitle.trim(),
      slug: `${slug}-${Date.now().toString().slice(-4)}`,
      type: "experience",
      pillar: "walks",
      price_inr: Number(newPrice) || 850,
      currency: "INR",
      images: [newImage.trim()],
      short_summary: newSummary.trim(),
      full_description: `${newSummary.trim()}\n\nEssentials Included:\n${includedArray.map((i) => `• ${i}`).join("\n")}`,
      location_name: newLocationName.trim(),
      secret_meeting_point: newSecretNotes.trim(),
      latitude: newLat,
      longitude: newLng,
      meeting_point_maps_url: mapsUrl,
      duration_minutes: Number(newDuration) || 150,
      host_name: newGuideName.trim() || "Pranay Koli",
      host_phone: newGuidePhone.trim() || "+91 98201 44512",
      host_bio: "Experienced indigenous coastal navigator and intertidal naturalist.",
      included_items: includedArray,
      is_active: true,
      is_featured: true,
    });

    if (newSlotDate && newSlotStart && newSlotEnd) {
      const startDateTime = new Date(`${newSlotDate}T${newSlotStart}:00`);
      const endDateTime = new Date(`${newSlotDate}T${newSlotEnd}:00`);

      addSlot({
        listing_id: created.id,
        slot_start: startDateTime.toISOString(),
        slot_end: endDateTime.toISOString(),
        capacity: Number(newCapacity) || 15,
      });
    }

    toast.success(`Created walk trail "${newTitle}"!`);
    setIsAddWalkOpen(false);
    setNewTitle("");
  };

  // Edit Walk Trail Modal State
  const [editingWalk, setEditingWalk] = useState<Listing | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editGuideName, setEditGuideName] = useState("");
  const [editGuidePhone, setEditGuidePhone] = useState("");
  const [editPrice, setEditPrice] = useState("850");
  const [editDuration, setEditDuration] = useState("150");
  const [editLocationName, setEditLocationName] = useState("");
  const [editSecretNotes, setEditSecretNotes] = useState("");
  const [editLat, setEditLat] = useState<number>(19.1316);
  const [editLng, setEditLng] = useState<number>(72.8109);
  const [editPinVisibility, setEditPinVisibility] = useState<PinVisibilityType>("public");
  const [editMapsUrl, setEditMapsUrl] = useState("");
  const [editSummary, setEditSummary] = useState("");
  const [editIncluded, setEditIncluded] = useState("");
  const [editImage, setEditImage] = useState("");

  const handleOpenEditWalk = (walk: Listing) => {
    setEditingWalk(walk);
    setEditTitle(walk.title || "");
    setEditGuideName(walk.host_name || "");
    setEditGuidePhone(walk.host_phone || "");
    setEditPrice(String(walk.price_inr || "850"));
    setEditDuration(String(walk.duration_minutes || "150"));
    setEditLocationName(walk.location_name || "");
    setEditSecretNotes(walk.secret_meeting_point || "");
    const lat = walk.latitude || 19.1316;
    const lng = walk.longitude || 72.8109;
    setEditLat(lat);
    setEditLng(lng);
    setEditPinVisibility("public");
    setEditMapsUrl(walk.meeting_point_maps_url || buildGoogleMapsUrl(lat, lng));
    setEditSummary(walk.short_summary || "");
    setEditIncluded((walk.included_items || []).join(", "));
    setEditImage(walk.images?.[0] || "");
  };

  const handleSaveEditWalk = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingWalk) return;
    if (!editTitle.trim()) {
      toast.error("Please enter a walk title.");
      return;
    }

    const includedArray = editIncluded
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);

    const mapsUrl = buildGoogleMapsUrl(editLat, editLng);

    updateListing(editingWalk.id, {
      title: editTitle.trim(),
      price_inr: Number(editPrice) || editingWalk.price_inr,
      duration_minutes: Number(editDuration) || 150,
      host_name: editGuideName.trim() || editingWalk.host_name,
      host_phone: editGuidePhone.trim() || editingWalk.host_phone,
      location_name: editLocationName.trim(),
      secret_meeting_point: editSecretNotes.trim(),
      latitude: editLat,
      longitude: editLng,
      meeting_point_maps_url: mapsUrl,
      included_items: includedArray,
      short_summary: editSummary.trim(),
      full_description: `${editSummary.trim()}\n\nEssentials Included:\n${includedArray.map((i) => `• ${i}`).join("\n")}`,
      images: editImage.trim() ? [editImage.trim()] : editingWalk.images,
    });

    toast.success(`Updated "${editTitle.trim()}" successfully!`);
    setEditingWalk(null);
  };

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

  const handleSendPassToWalker = (att: (typeof walkAttendees)[0]) => {
    const ticketRef = `MM-PASS-${att.order.order_ref.replace(/[^A-Za-z0-9]/g, "").slice(-6).toUpperCase()}`;
    const passUrl = `${typeof window !== "undefined" ? window.location.origin : ""}/order/confirmation/${att.order.order_ref}`;

    const text = buildPassMessage({
      guestName: att.name,
      experienceTitle: att.listing?.title || "Coastal Trail",
      ticketRef,
      dateStr: att.slot ? formatDate(att.slot.slot_start) : "Tomorrow",
      timeStr: att.slot ? formatTime(att.slot.slot_start) : "06:15 AM Dawn",
      venue: att.listing?.location_name || "Versova Harbor",
      secretPin: att.listing?.secret_meeting_point,
      mapsUrl: att.listing?.meeting_point_maps_url,
      passUrl,
    });

    openWhatsApp(att.phone, text);
    toast.success(`WhatsApp pass generated for ${att.name}`);
  };

  const handleSendManifestToGuide = (walkListing?: Listing) => {
    const targetWalk = walkListing || walkListings[0];
    if (!targetWalk) {
      toast.error("No active trail found.");
      return;
    }

    const attendeesList = walkAttendees.map((a) => ({
      name: a.name,
      phone: a.phone,
      seats: a.item.quantity || 1,
    }));

    const text = buildGuideManifestMessage({
      walkTitle: targetWalk.title,
      guideName: targetWalk.host_name || "Community Guide",
      dateStr: "Tomorrow Morning",
      departureTimeStr: "06:15 AM (Low Tide Window)",
      meetingPoint: targetWalk.location_name || "Versova Harbor Jetty",
      totalWalkers: attendeesList.reduce((sum, a) => sum + a.seats, 0) || attendeesList.length,
      attendees: attendeesList,
    });

    openWhatsApp(targetWalk.host_phone || "+91 76665 11511", text);
    toast.success(`Trail manifest dispatched to guide ${targetWalk.host_name || "Lead Guide"} via WhatsApp!`);
  };

  return (
    <div className="space-y-6 text-[#f5edeb]">
      {/* 9:16 Mobile Pass Modal */}
      {selectedTicketOrder && (
        <MobilePass
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

        <button
          onClick={() => setIsAddWalkOpen(true)}
          className="px-4 py-2 bg-[#e3a157] hover:bg-[#dab38c] text-[#29100b] font-bold text-xs rounded-xl shadow-md transition-all flex items-center gap-1.5 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Add Walk Trail</span>
        </button>
      </div>

      {/* Add Walk Trail Modal */}
      {isAddWalkOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs">
          <div className="bg-[#29100b] border border-[#dab38c]/30 rounded-3xl max-w-xl w-full p-6 space-y-4 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-[#dab38c]/15">
              <div className="flex items-center gap-2">
                <Compass className="w-5 h-5 text-[#e3a157]" />
                <h3 className="font-display font-bold text-base text-[#f5edeb]">
                  Add New Coastal Walk Trail
                </h3>
              </div>
              <button
                onClick={() => setIsAddWalkOpen(false)}
                className="p-1.5 hover:bg-[#35160e] rounded-full text-[#dab38c] hover:text-[#f5edeb] cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateWalk} className="space-y-4 text-xs">
              <div>
                <label className="block text-[11px] font-bold text-[#dab38c] uppercase mb-1">
                  Walk / Trail Title *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Dawn Versova Mangrove & Intertidal Forage Walk"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full px-3 py-2 bg-[#35160e] border border-[#dab38c]/30 rounded-xl text-xs text-[#f5edeb] focus:border-[#e3a157] outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-[#dab38c] uppercase mb-1">
                    Lead Guide / Custodian
                  </label>
                  <input
                    type="text"
                    value={newGuideName}
                    onChange={(e) => setNewGuideName(e.target.value)}
                    className="w-full px-3 py-2 bg-[#35160e] border border-[#dab38c]/30 rounded-xl text-xs text-[#f5edeb] focus:border-[#e3a157] outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-[#dab38c] uppercase mb-1">
                    Guide Phone (WhatsApp)
                  </label>
                  <input
                    type="text"
                    value={newGuidePhone}
                    onChange={(e) => setNewGuidePhone(e.target.value)}
                    className="w-full px-3 py-2 bg-[#35160e] border border-[#dab38c]/30 rounded-xl text-xs text-[#f5edeb] focus:border-[#e3a157] outline-none font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-[#dab38c] uppercase mb-1">
                    Price per Walker (₹) *
                  </label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={newPrice}
                    onChange={(e) => setNewPrice(e.target.value)}
                    className="w-full px-3 py-2 bg-[#35160e] border border-[#dab38c]/30 rounded-xl text-xs text-[#f5edeb] focus:border-[#e3a157] outline-none font-mono"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-[#dab38c] uppercase mb-1">
                    Duration (Minutes)
                  </label>
                  <input
                    type="number"
                    min="30"
                    value={newDuration}
                    onChange={(e) => setNewDuration(e.target.value)}
                    className="w-full px-3 py-2 bg-[#35160e] border border-[#dab38c]/30 rounded-xl text-xs text-[#f5edeb] focus:border-[#e3a157] outline-none font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-[#dab38c] uppercase mb-1">
                  Rendezvous Location
                </label>
                <input
                  type="text"
                  value={newLocationName}
                  onChange={(e) => setNewLocationName(e.target.value)}
                  className="w-full px-3 py-2 bg-[#35160e] border border-[#dab38c]/30 rounded-xl text-xs text-[#f5edeb] focus:border-[#e3a157] outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-[#dab38c] uppercase mb-1">
                  Secret Meeting Pin / Instructions
                </label>
                <input
                  type="text"
                  value={newSecretNotes}
                  onChange={(e) => setNewSecretNotes(e.target.value)}
                  className="w-full px-3 py-2 bg-[#35160e] border border-[#dab38c]/30 rounded-xl text-xs text-[#f5edeb] focus:border-[#e3a157] outline-none"
                />
              </div>

              {/* Shared Coordinate Input with Range Validation */}
              <SharedCoordinateInput
                latitude={newLat}
                longitude={newLng}
                mapsUrl={newMapsUrl}
                pinVisibility={newPinVisibility}
                onChange={({ latitude, longitude, pinVisibility, mapsUrl }) => {
                  setNewLat(latitude);
                  setNewLng(longitude);
                  setNewPinVisibility(pinVisibility);
                  setNewMapsUrl(mapsUrl);
                }}
              />

              <div>
                <label className="block text-[11px] font-bold text-[#dab38c] uppercase mb-1">
                  Included Essentials (comma separated)
                </label>
                <input
                  type="text"
                  value={newIncluded}
                  onChange={(e) => setNewIncluded(e.target.value)}
                  className="w-full px-3 py-2 bg-[#35160e] border border-[#dab38c]/30 rounded-xl text-xs text-[#f5edeb] focus:border-[#e3a157] outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-[#dab38c] uppercase mb-1">
                  Short Summary &amp; Experience Flow
                </label>
                <textarea
                  rows={2}
                  value={newSummary}
                  onChange={(e) => setNewSummary(e.target.value)}
                  className="w-full px-3 py-2 bg-[#35160e] border border-[#dab38c]/30 rounded-xl text-xs text-[#f5edeb] focus:border-[#e3a157] outline-none resize-none"
                />
              </div>

              <ImageDropzone
                value={newImage}
                onChange={setNewImage}
                label="Trail Cover Photo"
                helperText="Drop scenic trail picture, or browse from device"
              />

              {/* Initial Departure Slot */}
              <div className="p-3 bg-[#35160e]/90 border border-[#dab38c]/25 rounded-2xl space-y-2">
                <div className="flex items-center gap-1.5 text-[#e3a157] font-bold text-[11px] uppercase tracking-wider">
                  <Clock className="w-3.5 h-3.5" />
                  <span>Initial Departure Slot &amp; Capacity</span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  <div>
                    <label className="block text-[10px] text-[#dab38c]/70 font-bold mb-0.5">Date</label>
                    <input
                      type="date"
                      value={newSlotDate}
                      onChange={(e) => setNewSlotDate(e.target.value)}
                      className="w-full px-2 py-1.5 bg-[#29100b] border border-[#dab38c]/25 rounded-lg text-xs text-[#f5edeb] outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-[#dab38c]/70 font-bold mb-0.5">Start Time</label>
                    <input
                      type="time"
                      value={newSlotStart}
                      onChange={(e) => setNewSlotStart(e.target.value)}
                      className="w-full px-2 py-1.5 bg-[#29100b] border border-[#dab38c]/25 rounded-lg text-xs text-[#f5edeb] outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-[#dab38c]/70 font-bold mb-0.5">End Time</label>
                    <input
                      type="time"
                      value={newSlotEnd}
                      onChange={(e) => setNewSlotEnd(e.target.value)}
                      className="w-full px-2 py-1.5 bg-[#29100b] border border-[#dab38c]/25 rounded-lg text-xs text-[#f5edeb] outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-[#dab38c]/70 font-bold mb-0.5">Capacity</label>
                    <input
                      type="number"
                      min="1"
                      value={newCapacity}
                      onChange={(e) => setNewCapacity(e.target.value)}
                      className="w-full px-2 py-1.5 bg-[#29100b] border border-[#dab38c]/25 rounded-lg text-xs text-[#f5edeb] outline-none font-mono"
                    />
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#dab38c]/15">
                <button
                  type="button"
                  onClick={() => setIsAddWalkOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs text-[#dab38c] hover:bg-[#35160e] cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#e3a157] hover:bg-[#dab38c] text-[#29100b] font-bold text-xs rounded-xl shadow-md transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Publish Walk Trail</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Walk Trail Modal */}
      {editingWalk && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs">
          <div className="bg-[#29100b] border border-[#dab38c]/30 rounded-3xl max-w-xl w-full p-6 space-y-4 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-[#dab38c]/15">
              <div className="flex items-center gap-2">
                <Edit2 className="w-5 h-5 text-[#e3a157]" />
                <h3 className="font-display font-bold text-base text-[#f5edeb]">
                  Edit Coastal Walk Trail
                </h3>
              </div>
              <button
                onClick={() => setEditingWalk(null)}
                className="p-1.5 hover:bg-[#35160e] rounded-full text-[#dab38c] hover:text-[#f5edeb] cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveEditWalk} className="space-y-4 text-xs">
              <div>
                <label className="block text-[11px] font-bold text-[#dab38c] uppercase mb-1">
                  Walk / Trail Title *
                </label>
                <input
                  type="text"
                  required
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  className="w-full px-3 py-2 bg-[#35160e] border border-[#dab38c]/30 rounded-xl text-xs text-[#f5edeb] focus:border-[#e3a157] outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-[#dab38c] uppercase mb-1">
                    Lead Guide / Custodian
                  </label>
                  <input
                    type="text"
                    value={editGuideName}
                    onChange={(e) => setEditGuideName(e.target.value)}
                    className="w-full px-3 py-2 bg-[#35160e] border border-[#dab38c]/30 rounded-xl text-xs text-[#f5edeb] focus:border-[#e3a157] outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-[#dab38c] uppercase mb-1">
                    Guide Phone (WhatsApp)
                  </label>
                  <input
                    type="text"
                    value={editGuidePhone}
                    onChange={(e) => setEditGuidePhone(e.target.value)}
                    className="w-full px-3 py-2 bg-[#35160e] border border-[#dab38c]/30 rounded-xl text-xs text-[#f5edeb] focus:border-[#e3a157] outline-none font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-[#dab38c] uppercase mb-1">
                    Price per Walker (₹) *
                  </label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={editPrice}
                    onChange={(e) => setEditPrice(e.target.value)}
                    className="w-full px-3 py-2 bg-[#35160e] border border-[#dab38c]/30 rounded-xl text-xs text-[#f5edeb] focus:border-[#e3a157] outline-none font-mono"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-[#dab38c] uppercase mb-1">
                    Duration (Minutes)
                  </label>
                  <input
                    type="number"
                    min="30"
                    value={editDuration}
                    onChange={(e) => setEditDuration(e.target.value)}
                    className="w-full px-3 py-2 bg-[#35160e] border border-[#dab38c]/30 rounded-xl text-xs text-[#f5edeb] focus:border-[#e3a157] outline-none font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-[#dab38c] uppercase mb-1">
                  Rendezvous Location
                </label>
                <input
                  type="text"
                  value={editLocationName}
                  onChange={(e) => setEditLocationName(e.target.value)}
                  className="w-full px-3 py-2 bg-[#35160e] border border-[#dab38c]/30 rounded-xl text-xs text-[#f5edeb] focus:border-[#e3a157] outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-[#dab38c] uppercase mb-1">
                  Secret Meeting Pin / Instructions
                </label>
                <input
                  type="text"
                  value={editSecretNotes}
                  onChange={(e) => setEditSecretNotes(e.target.value)}
                  className="w-full px-3 py-2 bg-[#35160e] border border-[#dab38c]/30 rounded-xl text-xs text-[#f5edeb] focus:border-[#e3a157] outline-none"
                />
              </div>

              {/* Shared Coordinate Input with Range Validation */}
              <SharedCoordinateInput
                latitude={editLat}
                longitude={editLng}
                mapsUrl={editMapsUrl}
                pinVisibility={editPinVisibility}
                onChange={({ latitude, longitude, pinVisibility, mapsUrl }) => {
                  setEditLat(latitude);
                  setEditLng(longitude);
                  setEditPinVisibility(pinVisibility);
                  setEditMapsUrl(mapsUrl);
                }}
              />

              <div>
                <label className="block text-[11px] font-bold text-[#dab38c] uppercase mb-1">
                  Included Essentials (comma separated)
                </label>
                <input
                  type="text"
                  value={editIncluded}
                  onChange={(e) => setEditIncluded(e.target.value)}
                  className="w-full px-3 py-2 bg-[#35160e] border border-[#dab38c]/30 rounded-xl text-xs text-[#f5edeb] focus:border-[#e3a157] outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-[#dab38c] uppercase mb-1">
                  Short Summary &amp; Experience Flow
                </label>
                <textarea
                  rows={2}
                  value={editSummary}
                  onChange={(e) => setEditSummary(e.target.value)}
                  className="w-full px-3 py-2 bg-[#35160e] border border-[#dab38c]/30 rounded-xl text-xs text-[#f5edeb] focus:border-[#e3a157] outline-none resize-none"
                />
              </div>

              <ImageDropzone
                value={editImage}
                onChange={setEditImage}
                label="Trail Cover Photo"
                helperText="Drop replacement trail picture, or browse from device"
              />

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#dab38c]/15">
                <button
                  type="button"
                  onClick={() => setEditingWalk(null)}
                  className="px-4 py-2 rounded-xl text-xs text-[#dab38c] hover:bg-[#35160e] cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#e3a157] hover:bg-[#dab38c] text-[#29100b] font-bold text-xs rounded-xl shadow-md transition-all cursor-pointer"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

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
                <div className="flex items-center gap-2">
                  <span className="text-[#dab38c]">
                    Guide: <strong className="text-[#f5edeb]">{walk.host_name}</strong>
                  </span>
                  {walk.meeting_point_maps_url && (
                    <a
                      href={walk.meeting_point_maps_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-sky-950/70 border border-sky-400/40 text-[10px] font-bold text-sky-300 hover:text-sky-200 hover:bg-sky-900 transition-colors"
                      title="View exact meeting point on Google Maps"
                    >
                      <MapPin className="w-2.5 h-2.5 text-sky-400" />
                      <span>Maps</span>
                      <ExternalLink className="w-2.5 h-2.5" />
                    </a>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-emerald-400 font-semibold text-[11px]">
                    ● Open for Registration
                  </span>
                  <button
                    onClick={() => handleOpenEditWalk(walk)}
                    className="p-1 text-[#dab38c] hover:text-[#e3a157] hover:bg-[#35160e] rounded-lg transition-colors cursor-pointer"
                    title="Edit walk trail details & photo"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => {
                      if (confirm(`Remove walk trail "${walk.title}"?`)) {
                        deleteListing(walk.id);
                        toast.success("Walk trail removed.");
                      }
                    }}
                    className="p-1 rounded-lg hover:bg-rose-950/60 text-[#dab38c]/60 hover:text-rose-400 transition-colors cursor-pointer"
                    title="Delete walk trail"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* SUB-TAB 2: Reusable Guides, Rendezvous Pins & Sessions */}
      {activeSubTab === "guides" && (
        <SessionsAndVenuesManager
          pillar="walks"
          listings={walkListings}
          slots={slots}
          venueLabel="Trail Rendezvous Point"
          partnerRoleLabel="Lead Guide"
        />
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
            <div className="flex items-center gap-3">
              <button
                onClick={() => handleSendManifestToGuide()}
                className="px-3.5 py-2 bg-[#25D366] hover:bg-[#20ba59] text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center gap-1.5 cursor-pointer"
                title="Send tomorrow's walker manifest to lead guide on WhatsApp"
              >
                <span>Send Manifest to Guide (WhatsApp)</span>
              </button>
              <div className="text-xs text-[#dab38c]">
                Total Walkers: <strong className="text-[#f5edeb]">{walkAttendees.length}</strong>
              </div>
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
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => handleSendPassToWalker(att)}
                              className="px-2.5 py-1 bg-[#25D366] hover:bg-[#20ba59] text-white font-bold text-xs rounded-xl shadow-xs transition-all inline-flex items-center gap-1 cursor-pointer"
                              title="Send 9:16 verified pass on WhatsApp"
                            >
                              <span>WhatsApp</span>
                            </button>
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
                              <span>Pass</span>
                            </button>
                          </div>
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
