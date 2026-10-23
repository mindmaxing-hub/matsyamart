import React, { useState, useMemo } from "react";
import { Order, Listing, ExperienceSlot, OrderItem, PinVisibilityType } from "../../types";
import { useData } from "../../context/DataContext";
import { formatINR, formatDate, formatTime } from "../../lib/utils";
import { MobilePass } from "./MobilePass";
import { ImageDropzone } from "./ImageDropzone";
import {
  openWhatsApp,
  buildPassMessage,
  buildArtisanRosterMessage,
} from "../../lib/whatsapp";
import { buildGoogleMapsUrl } from "../../lib/services/places";
import { SharedCoordinateInput } from "./SharedCoordinateInput";
import { SessionsAndVenuesManager } from "./SessionsAndVenuesManager";
import {
  Palette,
  MapPin,
  Clock,
  Users,
  Ticket,
  Calendar,
  ExternalLink,
  CheckCircle2,
  AlertCircle,
  Scissors,
  Search,
  Hammer,
  Plus,
  X,
  Trash2,
  Sparkles,
  Phone,
  Edit2,
} from "lucide-react";
import { toast } from "sonner";

interface WorkshopsWorkspaceProps {
  orders: Order[];
  listings: Listing[];
  slots: ExperienceSlot[];
}

export const WorkshopsWorkspace: React.FC<WorkshopsWorkspaceProps> = ({
  orders,
  listings,
  slots,
}) => {
  const { updateAttendeeCheckIn, addListing, updateListing, deleteListing, addSlot } = useData();

  const [activeSubTab, setActiveSubTab] = useState<"sessions" | "instructors" | "roster">("sessions");
  const [selectedTicketOrder, setSelectedTicketOrder] = useState<{
    order: Order;
    item: OrderItem;
  } | null>(null);

  const [rosterSearch, setRosterSearch] = useState("");

  // Add Workshop Modal State
  const [isAddWorkshopOpen, setIsAddWorkshopOpen] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newInstructorName, setNewInstructorName] = useState("Kashinath Nakhawa");
  const [newInstructorPhone, setNewInstructorPhone] = useState("+91 98192 33410");
  const [newPrice, setNewPrice] = useState("1500");
  const [newDuration, setNewDuration] = useState("180");
  const [newLocationName, setNewLocationName] = useState("Sassoon Dock Heritage Shed, Colaba");
  const [newSecretNotes, setNewSecretNotes] = useState("Enter Gate 3, heritage shed on the right overlooking dry dock.");
  const [newLat, setNewLat] = useState<number>(18.9142);
  const [newLng, setNewLng] = useState<number>(72.8277);
  const [newPinVisibility, setNewPinVisibility] = useState<PinVisibilityType>("public");
  const [newMapsUrl, setNewMapsUrl] = useState("https://www.google.com/maps/search/?api=1&query=18.9142,72.8277");
  const [newSummary, setNewSummary] = useState("Hands-on traditional net-weaving masterclass using indigenous shuttle tools and natural fiber knotting techniques.");
  const [newMaterials, setNewMaterials] = useState("Braided nylon cord, Brass shuttle needle, Mesh gauge sticks, Take-home net planter");
  const [newImage, setNewImage] = useState("https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&w=1200&q=80");
  const [newSlotDate, setNewSlotDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 1); // Tomorrow
    return d.toISOString().split("T")[0];
  });
  const [newSlotStart, setNewSlotStart] = useState("14:00");
  const [newSlotEnd, setNewSlotEnd] = useState("17:00");
  const [newCapacity, setNewCapacity] = useState("10");

  // Edit Workshop Modal State
  const [editingWorkshop, setEditingWorkshop] = useState<Listing | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editInstructorName, setEditInstructorName] = useState("");
  const [editInstructorPhone, setEditInstructorPhone] = useState("");
  const [editPrice, setEditPrice] = useState("");
  const [editDuration, setEditDuration] = useState("");
  const [editLocationName, setEditLocationName] = useState("");
  const [editSecretNotes, setEditSecretNotes] = useState("");
  const [editLat, setEditLat] = useState<number>(18.9142);
  const [editLng, setEditLng] = useState<number>(72.8277);
  const [editPinVisibility, setEditPinVisibility] = useState<PinVisibilityType>("public");
  const [editMapsUrl, setEditMapsUrl] = useState("");
  const [editMaterials, setEditMaterials] = useState("");
  const [editSummary, setEditSummary] = useState("");
  const [editImage, setEditImage] = useState("");

  const handleOpenEditWorkshop = (workshop: Listing) => {
    setEditingWorkshop(workshop);
    setEditTitle(workshop.title || "");
    setEditInstructorName(workshop.host_name || "");
    setEditInstructorPhone(workshop.host_phone || "");
    setEditPrice(String(workshop.price_inr || 1500));
    setEditDuration(String(workshop.duration_minutes || 180));
    setEditLocationName(workshop.location_name || "");
    setEditSecretNotes(workshop.secret_meeting_point || "");
    const lat = workshop.latitude || 18.9142;
    const lng = workshop.longitude || 72.8277;
    setEditLat(lat);
    setEditLng(lng);
    setEditPinVisibility("public");
    setEditMapsUrl(workshop.meeting_point_maps_url || buildGoogleMapsUrl(lat, lng));
    setEditMaterials(workshop.included_items ? workshop.included_items.join(", ") : "");
    setEditSummary(workshop.short_summary || "");
    setEditImage(workshop.images?.[0] || "");
  };

  const handleSaveEditWorkshop = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingWorkshop) return;
    if (!editTitle.trim()) {
      toast.error("Please enter a workshop title.");
      return;
    }

    const materialsArray = editMaterials
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);

    const mapsUrl = buildGoogleMapsUrl(editLat, editLng);

    updateListing(editingWorkshop.id, {
      title: editTitle.trim(),
      price_inr: Number(editPrice) || editingWorkshop.price_inr,
      images: editImage ? [editImage.trim()] : editingWorkshop.images,
      short_summary: editSummary.trim(),
      full_description: `${editSummary.trim()}\n\nMaterials Provided:\n${materialsArray.map((m) => `• ${m}`).join("\n")}`,
      location_name: editLocationName.trim(),
      secret_meeting_point: editSecretNotes.trim(),
      latitude: editLat,
      longitude: editLng,
      meeting_point_maps_url: mapsUrl,
      duration_minutes: Number(editDuration) || editingWorkshop.duration_minutes,
      host_name: editInstructorName.trim() || editingWorkshop.host_name,
      host_phone: editInstructorPhone.trim() || editingWorkshop.host_phone,
      included_items: materialsArray.length > 0 ? materialsArray : editingWorkshop.included_items,
    });

    toast.success("Workshop updated successfully!");
    setEditingWorkshop(null);
  };

  const handleCreateWorkshop = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) {
      toast.error("Please enter a workshop title.");
      return;
    }

    const slug = newTitle
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");

    const materialsArray = newMaterials
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);

    const mapsUrl = buildGoogleMapsUrl(newLat, newLng);

    const created = addListing({
      title: newTitle.trim(),
      slug: `${slug}-${Date.now().toString().slice(-4)}`,
      type: "experience",
      pillar: "workshops",
      price_inr: Number(newPrice) || 1500,
      currency: "INR",
      images: [newImage.trim()],
      short_summary: newSummary.trim(),
      full_description: `${newSummary.trim()}\n\nMaterials Provided:\n${materialsArray.map((m) => `• ${m}`).join("\n")}`,
      location_name: newLocationName.trim(),
      secret_meeting_point: newSecretNotes.trim(),
      latitude: newLat,
      longitude: newLng,
      meeting_point_maps_url: mapsUrl,
      duration_minutes: Number(newDuration) || 180,
      host_name: newInstructorName.trim() || "Kashinath Nakhawa",
      host_phone: newInstructorPhone.trim() || "+91 98192 33410",
      host_bio: "Master net-weaving artisan and maritime elder with 35 years preserving coastal craft.",
      included_items: materialsArray,
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
        capacity: Number(newCapacity) || 10,
      });
    }

    toast.success(`Created workshop masterclass "${newTitle}"!`);
    setIsAddWorkshopOpen(false);
    setNewTitle("");
  };

  // Workshops listings
  const workshopListings = useMemo(() => {
    return listings.filter((l) => l.pillar === "workshops" && l.type === "experience");
  }, [listings]);

  // Workshops orders
  const workshopOrders = useMemo(() => {
    return orders.filter((o) =>
      o.items.some((item) => item.listing?.pillar === "workshops"),
    );
  }, [orders]);

  // Flattened guest roster for Workshops
  const workshopAttendees = useMemo(() => {
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

    workshopOrders.forEach((order) => {
      order.items
        .filter((item) => item.listing?.pillar === "workshops")
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
        a.name.toLowerCase().includes(rosterSearch.toLowerCase()) ||
        a.phone.includes(rosterSearch) ||
        a.order.order_ref.toLowerCase().includes(rosterSearch.toLowerCase()) ||
        (a.listing?.title &&
          a.listing.title.toLowerCase().includes(rosterSearch.toLowerCase()))
      );
    });
  }, [workshopOrders, rosterSearch]);

  const handleSendPassToParticipant = (att: (typeof workshopAttendees)[0]) => {
    const ticketRef = `MM-PASS-${att.order.order_ref.replace(/[^A-Za-z0-9]/g, "").slice(-6).toUpperCase()}`;
    const passUrl = `${typeof window !== "undefined" ? window.location.origin : ""}/order/confirmation/${att.order.order_ref}`;

    const text = buildPassMessage({
      guestName: att.name,
      experienceTitle: att.listing?.title || "Craft Masterclass",
      ticketRef,
      dateStr: att.slot ? formatDate(att.slot.slot_start) : "Weekend Session",
      timeStr: att.slot ? formatTime(att.slot.slot_start) : "02:00 PM",
      venue: att.listing?.location_name || "Sassoon Dock Heritage Shed",
      secretPin: att.listing?.secret_meeting_point,
      mapsUrl: att.listing?.meeting_point_maps_url,
      passUrl,
    });

    openWhatsApp(att.phone, text);
    toast.success(`WhatsApp pass generated for ${att.name}`);
  };

  const handleSendRosterToArtisan = (workshopListing?: Listing) => {
    const targetWorkshop = workshopListing || workshopListings[0];
    if (!targetWorkshop) {
      toast.error("No active workshop found.");
      return;
    }

    const attendeesList = workshopAttendees.map((a) => ({
      name: a.name,
      phone: a.phone,
    }));

    const text = buildArtisanRosterMessage({
      workshopTitle: targetWorkshop.title,
      artisanName: targetWorkshop.host_name || "Master Artisan",
      dateStr: "Tomorrow Afternoon",
      timeStr: "02:00 PM – 05:00 PM",
      studioVenue: targetWorkshop.location_name || "Heritage Workshop Shed",
      totalParticipants: attendeesList.length,
      materialsList: targetWorkshop.included_items ? targetWorkshop.included_items.join(", ") : undefined,
      attendees: attendeesList,
    });

    openWhatsApp(targetWorkshop.host_phone || "+91 76665 11511", text);
    toast.success(`Masterclass roster dispatched to artisan ${targetWorkshop.host_name || "Instructor"} via WhatsApp!`);
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
            onClick={() => setActiveSubTab("sessions")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeSubTab === "sessions"
                ? "bg-[#e3a157] text-[#29100b] shadow-md"
                : "text-[#dab38c] hover:text-[#f5edeb] hover:bg-[#481f14]"
            }`}
          >
            🎨 Masterclasses &amp; Sessions ({workshopListings.length})
          </button>
          <button
            onClick={() => setActiveSubTab("instructors")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeSubTab === "instructors"
                ? "bg-[#e3a157] text-[#29100b] shadow-md"
                : "text-[#dab38c] hover:text-[#f5edeb] hover:bg-[#481f14]"
            }`}
          >
            ✂️ Instructors &amp; Material Kits
          </button>
          <button
            onClick={() => setActiveSubTab("roster")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeSubTab === "roster"
                ? "bg-[#e3a157] text-[#29100b] shadow-md"
                : "text-[#dab38c] hover:text-[#f5edeb] hover:bg-[#481f14]"
            }`}
          >
            📋 Participant Roster &amp; Passes ({workshopAttendees.length})
          </button>
        </div>

        <button
          onClick={() => setIsAddWorkshopOpen(true)}
          className="px-4 py-2 bg-[#e3a157] hover:bg-[#dab38c] text-[#29100b] font-bold text-xs rounded-xl shadow-md transition-all flex items-center gap-1.5 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Add Workshop Masterclass</span>
        </button>
      </div>

      {/* Add Workshop Modal */}
      {isAddWorkshopOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs">
          <div className="bg-[#29100b] border border-[#dab38c]/30 rounded-3xl max-w-xl w-full p-6 space-y-4 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-[#dab38c]/15">
              <div className="flex items-center gap-2">
                <Palette className="w-5 h-5 text-[#e3a157]" />
                <h3 className="font-display font-bold text-base text-[#f5edeb]">
                  Add New Workshop Masterclass
                </h3>
              </div>
              <button
                onClick={() => setIsAddWorkshopOpen(false)}
                className="p-1.5 hover:bg-[#35160e] rounded-full text-[#dab38c] hover:text-[#f5edeb] cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateWorkshop} className="space-y-4 text-xs">
              <div>
                <label className="block text-[11px] font-bold text-[#dab38c] uppercase mb-1">
                  Masterclass Title *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Traditional Net Weaving & Knotting Masterclass"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full px-3 py-2 bg-[#35160e] border border-[#dab38c]/30 rounded-xl text-xs text-[#f5edeb] focus:border-[#e3a157] outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-[#dab38c] uppercase mb-1">
                    Instructor / Artisan
                  </label>
                  <input
                    type="text"
                    value={newInstructorName}
                    onChange={(e) => setNewInstructorName(e.target.value)}
                    className="w-full px-3 py-2 bg-[#35160e] border border-[#dab38c]/30 rounded-xl text-xs text-[#f5edeb] focus:border-[#e3a157] outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-[#dab38c] uppercase mb-1">
                    Instructor Phone (WhatsApp)
                  </label>
                  <input
                    type="text"
                    value={newInstructorPhone}
                    onChange={(e) => setNewInstructorPhone(e.target.value)}
                    className="w-full px-3 py-2 bg-[#35160e] border border-[#dab38c]/30 rounded-xl text-xs text-[#f5edeb] focus:border-[#e3a157] outline-none font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-[#dab38c] uppercase mb-1">
                    Price per Seat (₹) *
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
                  Studio / Workshop Venue
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
                  Secret Arrival Directions
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
                  Included Toolkits &amp; Materials (comma separated)
                </label>
                <input
                  type="text"
                  value={newMaterials}
                  onChange={(e) => setNewMaterials(e.target.value)}
                  className="w-full px-3 py-2 bg-[#35160e] border border-[#dab38c]/30 rounded-xl text-xs text-[#f5edeb] focus:border-[#e3a157] outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-[#dab38c] uppercase mb-1">
                  Description &amp; Hands-on Curriculum
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
                label="Workshop Cover Photo"
              />

              {/* Initial Session Slot */}
              <div className="p-3 bg-[#35160e]/90 border border-[#dab38c]/25 rounded-2xl space-y-2">
                <div className="flex items-center gap-1.5 text-[#e3a157] font-bold text-[11px] uppercase tracking-wider">
                  <Clock className="w-3.5 h-3.5" />
                  <span>Initial Masterclass Slot &amp; Bench Capacity</span>
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
                  onClick={() => setIsAddWorkshopOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs text-[#dab38c] hover:bg-[#35160e] cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#e3a157] hover:bg-[#dab38c] text-[#29100b] font-bold text-xs rounded-xl shadow-md transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Publish Masterclass</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Workshop Modal */}
      {editingWorkshop && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs">
          <div className="bg-[#29100b] border border-[#dab38c]/30 rounded-3xl max-w-xl w-full p-6 space-y-4 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-[#dab38c]/15">
              <div className="flex items-center gap-2">
                <Edit2 className="w-5 h-5 text-[#e3a157]" />
                <h3 className="font-display font-bold text-base text-[#f5edeb]">
                  Edit Workshop Masterclass
                </h3>
              </div>
              <button
                onClick={() => setEditingWorkshop(null)}
                className="p-1.5 hover:bg-[#35160e] rounded-full text-[#dab38c] hover:text-[#f5edeb] cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveEditWorkshop} className="space-y-4 text-xs">
              <div>
                <label className="block text-[11px] font-bold text-[#dab38c] uppercase mb-1">
                  Masterclass Title *
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
                    Instructor / Artisan
                  </label>
                  <input
                    type="text"
                    value={editInstructorName}
                    onChange={(e) => setEditInstructorName(e.target.value)}
                    className="w-full px-3 py-2 bg-[#35160e] border border-[#dab38c]/30 rounded-xl text-xs text-[#f5edeb] focus:border-[#e3a157] outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-[#dab38c] uppercase mb-1">
                    Instructor Phone (WhatsApp)
                  </label>
                  <input
                    type="text"
                    value={editInstructorPhone}
                    onChange={(e) => setEditInstructorPhone(e.target.value)}
                    className="w-full px-3 py-2 bg-[#35160e] border border-[#dab38c]/30 rounded-xl text-xs text-[#f5edeb] focus:border-[#e3a157] outline-none font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-[#dab38c] uppercase mb-1">
                    Price per Seat (₹) *
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
                  Studio / Workshop Venue
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
                  Secret Arrival Directions
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
                  Included Toolkits &amp; Materials (comma separated)
                </label>
                <input
                  type="text"
                  value={editMaterials}
                  onChange={(e) => setEditMaterials(e.target.value)}
                  className="w-full px-3 py-2 bg-[#35160e] border border-[#dab38c]/30 rounded-xl text-xs text-[#f5edeb] focus:border-[#e3a157] outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-[#dab38c] uppercase mb-1">
                  Description &amp; Hands-on Curriculum
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
                label="Workshop Cover Photo"
              />

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#dab38c]/15">
                <button
                  type="button"
                  onClick={() => setEditingWorkshop(null)}
                  className="px-4 py-2 rounded-xl text-xs text-[#dab38c] hover:bg-[#35160e] cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#e3a157] hover:bg-[#dab38c] text-[#29100b] font-bold text-xs rounded-xl shadow-md transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Save Changes</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* SUB-TAB 1: Sessions */}
      {activeSubTab === "sessions" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {workshopListings.map((workshop) => (
            <div
              key={workshop.id}
              className="bg-[#35160e]/90 border border-[#dab38c]/25 rounded-3xl p-5 shadow-xl flex flex-col justify-between space-y-4"
            >
              <div className="space-y-3">
                <div className="relative h-44 rounded-2xl overflow-hidden border border-[#dab38c]/20">
                  <img
                    src={workshop.images[0]}
                    alt={workshop.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-2.5 left-2.5 bg-[#1f0b07]/85 backdrop-blur-xs px-3 py-1 rounded-full text-[11px] font-bold text-amber-300 border border-[#dab38c]/30 flex items-center gap-1.5">
                    <Scissors className="w-3.5 h-3.5" />
                    <span>Hands-On Masterclass</span>
                  </div>
                  <div className="absolute bottom-2.5 right-2.5 bg-[#29100b]/90 px-3 py-1 rounded-xl text-xs font-bold font-mono text-[#f5edeb] border border-[#dab38c]/30">
                    {formatINR(workshop.price_inr)} / participant
                  </div>
                </div>

                <div>
                  <h3 className="font-display font-bold text-lg text-[#f5edeb]">
                    {workshop.title}
                  </h3>
                  <p className="text-xs text-[#dab38c]/80 mt-1 line-clamp-2">
                    {workshop.short_summary}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="p-2.5 bg-[#29100b] rounded-xl border border-[#dab38c]/15">
                    <div className="text-[10px] text-[#dab38c]/70 uppercase font-bold">Session Duration</div>
                    <div className="font-bold text-[#f5edeb] mt-0.5">{workshop.duration_minutes || 120} Minutes</div>
                  </div>
                  <div className="p-2.5 bg-[#29100b] rounded-xl border border-[#dab38c]/15">
                    <div className="text-[10px] text-[#dab38c]/70 uppercase font-bold">Batch Size</div>
                    <div className="font-bold text-[#f5edeb] mt-0.5">Max 10 per Bench</div>
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-[#dab38c]/15 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span className="text-[#dab38c]">
                    Instructor: <strong className="text-[#f5edeb]">{workshop.host_name}</strong>
                  </span>
                  {workshop.meeting_point_maps_url && (
                    <a
                      href={workshop.meeting_point_maps_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-sky-950/70 border border-sky-400/40 text-[10px] font-bold text-sky-300 hover:text-sky-200 hover:bg-sky-900 transition-colors"
                      title="View workshop venue on Google Maps"
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
                    onClick={() => handleOpenEditWorkshop(workshop)}
                    className="p-1 rounded-lg hover:bg-[#35160e] text-[#dab38c]/70 hover:text-[#e3a157] transition-colors cursor-pointer"
                    title="Edit masterclass"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => {
                      if (confirm(`Remove masterclass "${workshop.title}"?`)) {
                        deleteListing(workshop.id);
                        toast.success("Masterclass removed.");
                      }
                    }}
                    className="p-1 rounded-lg hover:bg-rose-950/60 text-[#dab38c]/60 hover:text-rose-400 transition-colors cursor-pointer"
                    title="Delete workshop"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* SUB-TAB 2: Reusable Artisans, Studios & Dated Sessions */}
      {activeSubTab === "instructors" && (
        <SessionsAndVenuesManager
          pillar="workshops"
          listings={workshopListings}
          slots={slots}
          venueLabel="Artisan Studio / Heritage Shed"
          partnerRoleLabel="Master Craftsman"
        />
      )}

      {/* SUB-TAB 3: Participant Roster & Passes */}
      {activeSubTab === "roster" && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 text-[#dab38c]/60 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search participant by name, phone, order ref..."
                value={rosterSearch}
                onChange={(e) => setRosterSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-[#35160e]/80 border border-[#dab38c]/25 rounded-xl text-xs text-[#f5edeb] placeholder-[#dab38c]/50 outline-none focus:border-[#e3a157]"
              />
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => handleSendRosterToArtisan()}
                className="px-3.5 py-2 bg-[#25D366] hover:bg-[#20ba59] text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center gap-1.5 cursor-pointer"
                title="Send enrolled participant roster to artisan on WhatsApp"
              >
                <span>Send Roster to Artisan (WhatsApp)</span>
              </button>
              <div className="text-xs text-[#dab38c]">
                Enrolled: <strong className="text-[#f5edeb]">{workshopAttendees.length}</strong>
              </div>
            </div>
          </div>

          <div className="bg-[#35160e]/90 border border-[#dab38c]/25 rounded-2xl overflow-hidden shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#29100b] text-[#dab38c] border-b border-[#dab38c]/15">
                  <tr>
                    <th className="py-3 px-4 font-semibold">Participant Name &amp; Phone</th>
                    <th className="py-3 px-4 font-semibold">Masterclass Title</th>
                    <th className="py-3 px-4 font-semibold">Session Schedule</th>
                    <th className="py-3 px-4 font-semibold">Order Ref</th>
                    <th className="py-3 px-4 font-semibold">On-Ground Check-in</th>
                    <th className="py-3 px-4 font-semibold text-right">Pass</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#dab38c]/10 text-[#f5edeb]">
                  {workshopAttendees.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="text-center py-10 text-[#dab38c]/60">
                        No workshop participants found matching the search.
                      </td>
                    </tr>
                  ) : (
                    workshopAttendees.map((att, idx) => (
                      <tr key={idx} className="hover:bg-[#481f14]/50 transition-colors">
                        <td className="py-3.5 px-4">
                          <div className="font-semibold text-sm">{att.name}</div>
                          <div className="text-[11px] text-[#dab38c] font-mono">
                            {att.phone}
                          </div>
                        </td>

                        <td className="py-3.5 px-4 font-medium text-xs max-w-[200px] truncate">
                          {att.listing?.title || "Craft Workshop"}
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
                            <span className="text-[#dab38c]/70">Weekend Studio Session</span>
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
                            <span>{att.checkedIn ? "Enrolled & In-Studio" : "Check-In"}</span>
                          </button>
                        </td>

                        <td className="py-3.5 px-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => handleSendPassToParticipant(att)}
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
