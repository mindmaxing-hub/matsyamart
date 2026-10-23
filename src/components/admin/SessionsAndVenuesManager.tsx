import React, { useState, useMemo } from "react";
import {
  MapPin,
  Calendar,
  Clock,
  Users,
  Plus,
  Edit2,
  Trash2,
  ExternalLink,
  UserCheck,
  ShieldCheck,
  AlertCircle,
  Eye,
  EyeOff,
  Image as ImageIcon,
  Check,
  X,
  Phone,
  Compass,
} from "lucide-react";
import { useData } from "../../context/DataContext";
import { Listing, ExperienceSlot, Place, Partner, PinVisibilityType } from "../../types";
import { formatDate, formatTime } from "../../lib/utils";
import { buildGoogleMapsUrl } from "../../lib/services/places";
import { SharedCoordinateInput } from "./SharedCoordinateInput";
import { toast } from "sonner";

interface SessionsAndVenuesManagerProps {
  pillar: "food" | "walks" | "workshops";
  listings: Listing[];
  slots: ExperienceSlot[];
  venueLabel?: string;
  partnerRoleLabel?: string;
}

export const SessionsAndVenuesManager: React.FC<SessionsAndVenuesManagerProps> = ({
  pillar,
  listings,
  slots,
  venueLabel = "Venue & Meeting Point",
  partnerRoleLabel = "Host / Custodian",
}) => {
  const {
    places,
    partners,
    addPlace,
    updatePlace,
    deletePlace,
    addPartner,
    updatePartner,
    addSlot,
    deleteSlot,
    updateSessionRevision,
    updateListing,
  } = useData();

  const [selectedOfferingId, setSelectedOfferingId] = useState<string>("all");

  // Place Modal State
  const [isPlaceModalOpen, setIsPlaceModalOpen] = useState(false);
  const [editingPlace, setEditingPlace] = useState<Place | null>(null);
  const [placeName, setPlaceName] = useState("");
  const [placeAddress, setPlaceAddress] = useState("");
  const [placeArrivalNotes, setPlaceArrivalNotes] = useState("");
  const [placeLat, setPlaceLat] = useState<number>(19.1316);
  const [placeLng, setPlaceLng] = useState<number>(72.8109);
  const [placeMapsUrl, setPlaceMapsUrl] = useState("");
  const [placeVisibility, setPlaceVisibility] = useState<PinVisibilityType>("public");
  const [placePhoto, setPlacePhoto] = useState("");

  // Partner Modal State
  const [isPartnerModalOpen, setIsPartnerModalOpen] = useState(false);
  const [editingPartner, setEditingPartner] = useState<Partner | null>(null);
  const [partnerName, setPartnerName] = useState("");
  const [partnerPhone, setPartnerPhone] = useState("");
  const [partnerBio, setPartnerBio] = useState("");
  const [partnerEntityName, setPartnerEntityName] = useState("");
  const [partnerPortrait, setPartnerPortrait] = useState("");

  // Session Modal State
  const [isSessionModalOpen, setIsSessionModalOpen] = useState(false);
  const [editingSession, setEditingSession] = useState<ExperienceSlot | null>(null);
  const [targetListingId, setTargetListingId] = useState<string>("");
  const [sessionPlaceId, setSessionPlaceId] = useState<string>("");
  const [sessionDate, setSessionDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return d.toISOString().split("T")[0];
  });
  const [sessionStart, setSessionStart] = useState("10:00");
  const [sessionEnd, setSessionEnd] = useState("13:00");
  const [sessionCapacity, setSessionCapacity] = useState("12");
  const [sessionRevisionNote, setSessionRevisionNote] = useState("");

  // Filter listings
  const filteredListings = useMemo(() => {
    if (selectedOfferingId === "all") return listings;
    return listings.filter((l) => l.id === selectedOfferingId);
  }, [listings, selectedOfferingId]);

  // Open Add Place Modal
  const openNewPlaceModal = () => {
    setEditingPlace(null);
    setPlaceName("");
    setPlaceAddress("Versova Koliwada, Andheri West, Mumbai");
    setPlaceArrivalNotes("Rendezvous coordinates provided on confirmed pass.");
    setPlaceLat(19.1316);
    setPlaceLng(72.8109);
    setPlaceMapsUrl("https://maps.google.com/?q=19.1316,72.8109");
    setPlaceVisibility("public");
    setPlacePhoto("");
    setIsPlaceModalOpen(true);
  };

  // Open Edit Place Modal
  const openEditPlaceModal = (p: Place) => {
    setEditingPlace(p);
    setPlaceName(p.name);
    setPlaceAddress(p.address || "");
    setPlaceArrivalNotes(p.arrival_instructions || "");
    setPlaceLat(p.latitude);
    setPlaceLng(p.longitude);
    setPlaceMapsUrl(
      p.meeting_point_maps_url ||
        (p.latitude && p.longitude ? buildGoogleMapsUrl(p.latitude, p.longitude) : ""),
    );
    setPlaceVisibility(p.pin_visibility);
    setPlacePhoto(p.photos?.[0] || "");
    setIsPlaceModalOpen(true);
  };

  // Save Place
  const handleSavePlace = (e: React.FormEvent) => {
    e.preventDefault();
    if (!placeName.trim()) {
      toast.error("Place name is required");
      return;
    }

    if (editingPlace) {
      updatePlace(editingPlace.id, {
        name: placeName.trim(),
        address: placeAddress.trim(),
        arrival_instructions: placeArrivalNotes.trim(),
        latitude: placeLat,
        longitude: placeLng,
        meeting_point_maps_url: placeMapsUrl || buildGoogleMapsUrl(placeLat, placeLng),
        pin_visibility: placeVisibility,
        photos: placePhoto.trim() ? [placePhoto.trim()] : editingPlace.photos,
      });
      toast.success(`Updated place "${placeName}"`);
    } else {
      addPlace({
        name: placeName.trim(),
        address: placeAddress.trim(),
        arrival_instructions: placeArrivalNotes.trim(),
        latitude: placeLat,
        longitude: placeLng,
        meeting_point_maps_url: placeMapsUrl || buildGoogleMapsUrl(placeLat, placeLng),
        pin_visibility: placeVisibility,
        photos: placePhoto.trim() ? [placePhoto.trim()] : [],
      });
      toast.success(`Created place "${placeName}"`);
    }
    setIsPlaceModalOpen(false);
  };

  // Open Add Partner Modal
  const openNewPartnerModal = () => {
    setEditingPartner(null);
    setPartnerName("");
    setPartnerPhone("+91 98201 44512");
    setPartnerBio("");
    setPartnerEntityName("");
    setPartnerPortrait("");
    setIsPartnerModalOpen(true);
  };

  // Open Edit Partner Modal
  const openEditPartnerModal = (p: Partner) => {
    setEditingPartner(p);
    setPartnerName(p.name);
    setPartnerPhone(p.phone || "");
    setPartnerBio(p.bio || "");
    setPartnerEntityName(p.entity_name || "");
    setPartnerPortrait(p.portrait_url || "");
    setIsPartnerModalOpen(true);
  };

  // Save Partner
  const handleSavePartner = (e: React.FormEvent) => {
    e.preventDefault();
    if (!partnerName.trim()) {
      toast.error("Partner name is required");
      return;
    }

    const roleMap: Record<string, Partner["role_type"]> = {
      food: "cook",
      walks: "guide",
      workshops: "artisan",
    };

    if (editingPartner) {
      updatePartner(editingPartner.id, {
        name: partnerName.trim(),
        phone: partnerPhone.trim(),
        bio: partnerBio.trim(),
        entity_name: partnerEntityName.trim() || undefined,
        portrait_url: partnerPortrait.trim() || undefined,
      });
      toast.success(`Updated ${partnerRoleLabel} "${partnerName}"`);
    } else {
      addPartner({
        name: partnerName.trim(),
        role_type: roleMap[pillar] || "guide",
        phone: partnerPhone.trim(),
        bio: partnerBio.trim(),
        entity_name: partnerEntityName.trim() || undefined,
        portrait_url: partnerPortrait.trim() || undefined,
        is_verified: true,
        active: true,
      });
      toast.success(`Added ${partnerRoleLabel} "${partnerName}"`);
    }
    setIsPartnerModalOpen(false);
  };

  // Open Add Session Modal
  const openNewSessionModal = (offeringId?: string) => {
    setEditingSession(null);
    setTargetListingId(offeringId || listings[0]?.id || "");
    setSessionPlaceId(places[0]?.id || "");
    setSessionDate(() => {
      const d = new Date();
      d.setDate(d.getDate() + 1);
      return d.toISOString().split("T")[0];
    });
    setSessionStart("10:00");
    setSessionEnd("13:00");
    setSessionCapacity("12");
    setSessionRevisionNote("");
    setIsSessionModalOpen(true);
  };

  // Open Edit Session Modal
  const openEditSessionModal = (s: ExperienceSlot) => {
    setEditingSession(s);
    setTargetListingId(s.listing_id || s.offering_id || "");
    setSessionPlaceId(s.place_id || places[0]?.id || "");
    const startDate = new Date(s.slot_start);
    setSessionDate(startDate.toISOString().split("T")[0]);
    setSessionStart(startDate.toTimeString().substring(0, 5));
    const endDate = new Date(s.slot_end);
    setSessionEnd(endDate.toTimeString().substring(0, 5));
    setSessionCapacity(String(s.capacity));
    setSessionRevisionNote("");
    setIsSessionModalOpen(true);
  };

  // Save Session
  const handleSaveSession = (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetListingId) {
      toast.error("Please select an offering");
      return;
    }

    const startISO = new Date(`${sessionDate}T${sessionStart}:00`).toISOString();
    const endISO = new Date(`${sessionDate}T${sessionEnd}:00`).toISOString();
    const cap = Number(sessionCapacity) || 12;

    if (editingSession) {
      // Editing existing session revision
      const hasBookings = editingSession.booked_count > 0;
      if (hasBookings && !sessionRevisionNote.trim()) {
        toast.error("This session has active bookings. Please provide an audit reason for the revision.");
        return;
      }

      updateSessionRevision(editingSession.id, {
        slot_start: startISO,
        slot_end: endISO,
        capacity: cap,
        place_id: sessionPlaceId || undefined,
      });
      toast.success(
        `Session revised (Rev #${(editingSession.revision_number || 1) + 1}). Notification queued for ${editingSession.booked_count} booked guests.`,
      );
    } else {
      // Adding new session
      addSlot({
        listing_id: targetListingId,
        offering_id: targetListingId,
        place_id: sessionPlaceId || undefined,
        slot_start: startISO,
        slot_end: endISO,
        capacity: cap,
      });
      toast.success("New dated session added successfully!");
    }
    setIsSessionModalOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Top Filter and Actions Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-4 rounded-2xl bg-[#35160e]/80 border border-[#dab38c]/20">
        <div className="flex flex-wrap items-center gap-2.5">
          <label className="text-xs font-bold text-[#dab38c] uppercase tracking-wider">
            Filter Offering:
          </label>
          <select
            value={selectedOfferingId}
            onChange={(e) => setSelectedOfferingId(e.target.value)}
            className="px-3 py-1.5 bg-[#1f0b07] border border-[#dab38c]/30 rounded-xl text-xs text-[#f5edeb] focus:border-[#e3a157] outline-hidden"
          >
            <option value="all">All {listings.length} Offerings</option>
            {listings.map((l) => (
              <option key={l.id} value={l.id}>
                {l.title}
              </option>
            ))}
          </select>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={openNewPlaceModal}
            className="px-3 py-1.5 bg-[#29100b] hover:bg-[#1f0b07] border border-[#dab38c]/30 text-[#e3a157] rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow-xs cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>New Reusable Place</span>
          </button>
          <button
            type="button"
            onClick={openNewPartnerModal}
            className="px-3 py-1.5 bg-[#29100b] hover:bg-[#1f0b07] border border-[#dab38c]/30 text-[#e3a157] rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow-xs cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>New {partnerRoleLabel}</span>
          </button>
          <button
            type="button"
            onClick={() => openNewSessionModal()}
            className="px-3.5 py-1.5 bg-[#e3a157] hover:bg-[#d49042] text-[#29100b] rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow-md cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Dated Session</span>
          </button>
        </div>
      </div>

      {/* Offerings, Reusable Places, and Dated Sessions Grid */}
      <div className="space-y-6">
        {filteredListings.map((offering) => {
          const offeringSlots = slots.filter(
            (s) => s.listing_id === offering.id || s.offering_id === offering.id,
          );
          // Find associated place or fallback
          const assignedPlace =
            places.find((p) => p.id === offering.place_id) ||
            places[0] ||
            null;
          // Find associated partner or fallback
          const assignedPartner =
            partners.find((p) => p.id === offering.partner_id) ||
            partners.find((p) => p.name === offering.host_name) ||
            null;

          const mapsUrl = assignedPlace
            ? buildGoogleMapsUrl(assignedPlace.latitude, assignedPlace.longitude)
            : offering.meeting_point_maps_url || "";

          return (
            <div
              key={offering.id}
              className="bg-[#35160e]/90 border border-[#dab38c]/25 rounded-3xl p-5 sm:p-6 shadow-xl space-y-5"
            >
              {/* Header: Offering Title & Meta */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[#dab38c]/15">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded-full bg-[#e3a157]/20 border border-[#e3a157]/40 text-[#e3a157] text-[10px] font-bold uppercase tracking-wider">
                      {pillar}
                    </span>
                    <h3 className="font-display font-bold text-lg text-[#f5edeb]">
                      {offering.title}
                    </h3>
                  </div>
                  <p className="text-xs text-[#dab38c]/80 mt-1 line-clamp-1">
                    {offering.short_summary}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => openNewSessionModal(offering.id)}
                    className="px-3 py-1.5 bg-[#e3a157]/15 hover:bg-[#e3a157]/25 text-[#e3a157] border border-[#e3a157]/40 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Schedule Session</span>
                  </button>
                </div>
              </div>

              {/* Middle Row: Venue Place Card & Host Partner Card */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Reusable Place Card */}
                <div className="p-4 rounded-2xl bg-[#29100b]/80 border border-[#dab38c]/20 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="text-[11px] font-bold uppercase tracking-wider text-[#e3a157] flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5" />
                      <span>{venueLabel}</span>
                    </div>
                    {assignedPlace && (
                      <div className="flex items-center gap-1.5">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold flex items-center gap-1 border ${
                            assignedPlace.pin_visibility === "public"
                              ? "bg-emerald-500/15 border-emerald-500/30 text-emerald-300"
                              : "bg-amber-500/15 border-amber-500/30 text-amber-300"
                          }`}
                        >
                          {assignedPlace.pin_visibility === "public" ? (
                            <>
                              <Eye className="w-2.5 h-2.5" />
                              <span>Public Pin</span>
                            </>
                          ) : (
                            <>
                              <EyeOff className="w-2.5 h-2.5" />
                              <span>Guests Only</span>
                            </>
                          )}
                        </span>
                        <button
                          type="button"
                          onClick={() => openEditPlaceModal(assignedPlace)}
                          className="p-1 hover:bg-[#35160e] text-[#dab38c] hover:text-[#f5edeb] rounded-lg transition-colors cursor-pointer"
                          title="Edit Place Details"
                        >
                          <Edit2 className="w-3 h-3" />
                        </button>
                      </div>
                    )}
                  </div>

                  <div>
                    <h4 className="font-bold text-sm text-[#f5edeb]">
                      {assignedPlace?.name || offering.location_name || "Versova Gaothan Courtyard"}
                    </h4>
                    <p className="text-xs text-[#dab38c]/80 mt-0.5">
                      {assignedPlace?.address || "Andheri West, Mumbai, Maharashtra 400061"}
                    </p>
                  </div>

                  {assignedPlace && (
                    <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-[#dab38c]/15 text-[11px]">
                      <div className="font-mono text-[#dab38c]/80">
                        {assignedPlace.latitude.toFixed(6)}, {assignedPlace.longitude.toFixed(6)}
                      </div>
                      <a
                        href={mapsUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sky-400 hover:text-sky-300 font-bold flex items-center gap-1 hover:underline"
                      >
                        <span>Verified Maps GPS</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  )}

                  {assignedPlace?.arrival_instructions && (
                    <div className="text-[11px] text-[#dab38c]/70 italic bg-[#1f0b07] p-2 rounded-xl border border-[#dab38c]/10">
                      Arrival: {assignedPlace.arrival_instructions}
                    </div>
                  )}
                </div>

                {/* Host / Partner Card */}
                <div className="p-4 rounded-2xl bg-[#29100b]/80 border border-[#dab38c]/20 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="text-[11px] font-bold uppercase tracking-wider text-[#e3a157] flex items-center gap-1.5">
                      <UserCheck className="w-3.5 h-3.5" />
                      <span>{partnerRoleLabel}</span>
                    </div>
                    {assignedPartner && (
                      <button
                        type="button"
                        onClick={() => openEditPartnerModal(assignedPartner)}
                        className="p-1 hover:bg-[#35160e] text-[#dab38c] hover:text-[#f5edeb] rounded-lg transition-colors cursor-pointer"
                        title="Edit Partner Profile"
                      >
                        <Edit2 className="w-3 h-3" />
                      </button>
                    )}
                  </div>

                  <div className="flex items-start gap-3">
                    {assignedPartner?.portrait_url ? (
                      <img
                        src={assignedPartner.portrait_url}
                        alt={assignedPartner.name}
                        className="w-12 h-12 rounded-xl object-cover border border-[#dab38c]/30 shrink-0"
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-xl bg-[#1f0b07] border border-[#dab38c]/30 flex items-center justify-center text-[#e3a157] font-bold text-sm shrink-0">
                        {(assignedPartner?.name || offering.host_name || "K")[0]}
                      </div>
                    )}
                    <div className="min-w-0 flex-1">
                      <h4 className="font-bold text-sm text-[#f5edeb] truncate">
                        {assignedPartner?.name || offering.host_name}
                      </h4>
                      {assignedPartner?.entity_name && (
                        <div className="text-[11px] text-[#e3a157] font-medium">
                          {assignedPartner.entity_name}
                        </div>
                      )}
                      <div className="text-xs text-[#dab38c] font-mono mt-0.5 flex items-center gap-1">
                        <Phone className="w-3 h-3 text-[#dab38c]/60" />
                        <span>{assignedPartner?.phone || offering.host_phone || "+91 98201 44512"}</span>
                      </div>
                    </div>
                  </div>

                  {assignedPartner?.bio && (
                    <p className="text-[11px] text-[#dab38c]/80 line-clamp-2">
                      {assignedPartner.bio}
                    </p>
                  )}
                </div>
              </div>

              {/* Bottom: Dated Sessions List */}
              <div className="space-y-2 pt-2">
                <div className="flex items-center justify-between text-xs font-bold text-[#dab38c] uppercase tracking-wider">
                  <div className="flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-[#e3a157]" />
                    <span>Dated Sessions ({offeringSlots.length})</span>
                  </div>
                  <span className="text-[11px] font-normal normal-case text-[#dab38c]/70">
                    Auto-notice sent previous day at 18:00 IST
                  </span>
                </div>

                {offeringSlots.length === 0 ? (
                  <div className="p-4 rounded-2xl bg-[#29100b]/40 border border-dashed border-[#dab38c]/25 text-center text-xs text-[#dab38c]/60">
                    No active sessions scheduled. Click "+ Schedule Session" above to open slots.
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {offeringSlots.map((slot) => {
                      const isPast = new Date(slot.slot_end) < new Date();
                      return (
                        <div
                          key={slot.id}
                          className={`p-3.5 rounded-2xl border transition-all ${
                            isPast
                              ? "bg-[#29100b]/40 border-[#dab38c]/10 opacity-70"
                              : "bg-[#29100b]/80 border-[#dab38c]/25 shadow-md hover:border-[#e3a157]/40"
                          }`}
                        >
                          <div className="flex items-start justify-between">
                            <div>
                              <div className="font-bold text-xs text-[#f5edeb]">
                                {formatDate(slot.slot_start)}
                              </div>
                              <div className="text-[11px] text-[#dab38c] flex items-center gap-1 mt-0.5">
                                <Clock className="w-3 h-3 text-[#e3a157]" />
                                <span>
                                  {formatTime(slot.slot_start)} – {formatTime(slot.slot_end)}
                                </span>
                              </div>
                            </div>
                            <span className="px-2 py-0.5 rounded-md bg-[#1f0b07] border border-[#dab38c]/20 text-[10px] font-mono text-[#dab38c]">
                              Rev #{slot.revision_number || 1}
                            </span>
                          </div>

                          <div className="mt-2.5 pt-2 border-t border-[#dab38c]/15 flex items-center justify-between text-xs">
                            <span className="text-emerald-400 font-mono font-medium">
                              {slot.booked_count}/{slot.capacity} booked
                            </span>
                            <div className="flex items-center gap-1.5">
                              <button
                                type="button"
                                onClick={() => openEditSessionModal(slot)}
                                className="p-1 hover:bg-[#35160e] text-[#dab38c] hover:text-[#f5edeb] rounded-lg transition-colors cursor-pointer"
                                title="Edit Session Time or Capacity"
                              >
                                <Edit2 className="w-3 h-3" />
                              </button>
                              <button
                                type="button"
                                onClick={() => {
                                  if (
                                    confirm(
                                      slot.booked_count > 0
                                        ? `Warning: This session has ${slot.booked_count} booked guest(s). Deleting it will cancel their passes. Proceed?`
                                        : "Remove this session slot?",
                                    )
                                  ) {
                                    deleteSlot(slot.id);
                                    toast.success("Session removed");
                                  }
                                }}
                                className="p-1 hover:bg-[#35160e] text-rose-400 hover:text-rose-300 rounded-lg transition-colors cursor-pointer"
                                title="Delete Session"
                              >
                                <Trash2 className="w-3 h-3" />
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* MODAL 1: Place Editor */}
      {isPlaceModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-xs">
          <div className="w-full max-w-lg bg-[#35160e] border border-[#dab38c]/30 rounded-3xl p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-[#dab38c]/20">
              <h3 className="font-display font-bold text-base text-[#f5edeb] flex items-center gap-2">
                <MapPin className="w-4 h-4 text-[#e3a157]" />
                <span>{editingPlace ? "Edit Reusable Place" : "Create Reusable Place"}</span>
              </h3>
              <button
                type="button"
                onClick={() => setIsPlaceModalOpen(false)}
                className="p-1 hover:bg-[#29100b] text-[#dab38c] rounded-lg transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSavePlace} className="space-y-4 text-xs">
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-[#dab38c] mb-1">
                  Place / Venue Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Versova Ancestral Courtyard, Villa 4"
                  value={placeName}
                  onChange={(e) => setPlaceName(e.target.value)}
                  className="w-full px-3 py-2 bg-[#1f0b07] border border-[#dab38c]/30 rounded-xl text-xs text-[#f5edeb] focus:border-[#e3a157] outline-hidden"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-[#dab38c] mb-1">
                  Postal Address
                </label>
                <input
                  type="text"
                  placeholder="Street, Koliwada, City, Pincode"
                  value={placeAddress}
                  onChange={(e) => setPlaceAddress(e.target.value)}
                  className="w-full px-3 py-2 bg-[#1f0b07] border border-[#dab38c]/30 rounded-xl text-xs text-[#f5edeb] focus:border-[#e3a157] outline-hidden"
                />
              </div>

              {/* Shared Coordinate Input with Range Validation and Pin Visibility */}
              <SharedCoordinateInput
                latitude={placeLat}
                longitude={placeLng}
                mapsUrl={placeMapsUrl}
                pinVisibility={placeVisibility}
                required
                onChange={({ latitude, longitude, pinVisibility, mapsUrl }) => {
                  setPlaceLat(latitude);
                  setPlaceLng(longitude);
                  setPlaceVisibility(pinVisibility);
                  setPlaceMapsUrl(mapsUrl);
                }}
              />

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-[#dab38c] mb-1">
                  Arrival &amp; Secret Access Instructions
                </label>
                <textarea
                  rows={2}
                  placeholder="e.g. Pass through the blue arch; ring bell at Villa 4. Host will meet you."
                  value={placeArrivalNotes}
                  onChange={(e) => setPlaceArrivalNotes(e.target.value)}
                  className="w-full px-3 py-2 bg-[#1f0b07] border border-[#dab38c]/30 rounded-xl text-xs text-[#f5edeb] focus:border-[#e3a157] outline-hidden resize-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-[#dab38c] mb-1">
                  Place Photo URL (Optional)
                </label>
                <input
                  type="url"
                  placeholder="https://..."
                  value={placePhoto}
                  onChange={(e) => setPlacePhoto(e.target.value)}
                  className="w-full px-3 py-2 bg-[#1f0b07] border border-[#dab38c]/30 rounded-xl text-xs text-[#f5edeb] focus:border-[#e3a157] outline-hidden"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#dab38c]/20">
                <button
                  type="button"
                  onClick={() => setIsPlaceModalOpen(false)}
                  className="px-4 py-2 bg-[#29100b] hover:bg-[#1f0b07] text-[#dab38c] rounded-xl font-bold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#e3a157] hover:bg-[#d49042] text-[#29100b] rounded-xl font-bold shadow-md cursor-pointer"
                >
                  Save Place
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: Partner Editor */}
      {isPartnerModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-xs">
          <div className="w-full max-w-lg bg-[#35160e] border border-[#dab38c]/30 rounded-3xl p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-[#dab38c]/20">
              <h3 className="font-display font-bold text-base text-[#f5edeb] flex items-center gap-2">
                <UserCheck className="w-4 h-4 text-[#e3a157]" />
                <span>{editingPartner ? `Edit ${partnerRoleLabel}` : `Add ${partnerRoleLabel}`}</span>
              </h3>
              <button
                type="button"
                onClick={() => setIsPartnerModalOpen(false)}
                className="p-1 hover:bg-[#29100b] text-[#dab38c] rounded-lg transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSavePartner} className="space-y-4 text-xs">
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-[#dab38c] mb-1">
                  Full Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Captain Ramesh Koli"
                  value={partnerName}
                  onChange={(e) => setPartnerName(e.target.value)}
                  className="w-full px-3 py-2 bg-[#1f0b07] border border-[#dab38c]/30 rounded-xl text-xs text-[#f5edeb] focus:border-[#e3a157] outline-hidden"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-[#dab38c] mb-1">
                  Entity / Collective Name (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Versova Fisherfolk Welfare Collective"
                  value={partnerEntityName}
                  onChange={(e) => setPartnerEntityName(e.target.value)}
                  className="w-full px-3 py-2 bg-[#1f0b07] border border-[#dab38c]/30 rounded-xl text-xs text-[#f5edeb] focus:border-[#e3a157] outline-hidden"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-[#dab38c] mb-1">
                  WhatsApp Contact Phone *
                </label>
                <input
                  type="text"
                  required
                  placeholder="+91 98201 44512"
                  value={partnerPhone}
                  onChange={(e) => setPartnerPhone(e.target.value)}
                  className="w-full px-3 py-2 bg-[#1f0b07] border border-[#dab38c]/30 rounded-xl text-xs text-[#f5edeb] font-mono focus:border-[#e3a157] outline-hidden"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-[#dab38c] mb-1">
                  Portrait Photo URL
                </label>
                <input
                  type="url"
                  placeholder="https://images.unsplash.com/..."
                  value={partnerPortrait}
                  onChange={(e) => setPartnerPortrait(e.target.value)}
                  className="w-full px-3 py-2 bg-[#1f0b07] border border-[#dab38c]/30 rounded-xl text-xs text-[#f5edeb] focus:border-[#e3a157] outline-hidden"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-[#dab38c] mb-1">
                  Bio &amp; Heritage Background
                </label>
                <textarea
                  rows={3}
                  placeholder="4th-generation Koli heritage custodian with 25+ years experience..."
                  value={partnerBio}
                  onChange={(e) => setPartnerBio(e.target.value)}
                  className="w-full px-3 py-2 bg-[#1f0b07] border border-[#dab38c]/30 rounded-xl text-xs text-[#f5edeb] focus:border-[#e3a157] outline-hidden resize-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#dab38c]/20">
                <button
                  type="button"
                  onClick={() => setIsPartnerModalOpen(false)}
                  className="px-4 py-2 bg-[#29100b] hover:bg-[#1f0b07] text-[#dab38c] rounded-xl font-bold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#e3a157] hover:bg-[#d49042] text-[#29100b] rounded-xl font-bold shadow-md cursor-pointer"
                >
                  Save {partnerRoleLabel}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: Session Schedule Editor */}
      {isSessionModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-xs">
          <div className="w-full max-w-lg bg-[#35160e] border border-[#dab38c]/30 rounded-3xl p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-[#dab38c]/20">
              <h3 className="font-display font-bold text-base text-[#f5edeb] flex items-center gap-2">
                <Calendar className="w-4 h-4 text-[#e3a157]" />
                <span>
                  {editingSession
                    ? `Revise Session (Rev #${(editingSession.revision_number || 1) + 1})`
                    : "Add Dated Session"}
                </span>
              </h3>
              <button
                type="button"
                onClick={() => setIsSessionModalOpen(false)}
                className="p-1 hover:bg-[#29100b] text-[#dab38c] rounded-lg transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveSession} className="space-y-4 text-xs">
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-[#dab38c] mb-1">
                  Offering *
                </label>
                <select
                  required
                  value={targetListingId}
                  onChange={(e) => setTargetListingId(e.target.value)}
                  className="w-full px-3 py-2 bg-[#1f0b07] border border-[#dab38c]/30 rounded-xl text-xs text-[#f5edeb] focus:border-[#e3a157] outline-hidden"
                >
                  {listings.map((l) => (
                    <option key={l.id} value={l.id}>
                      {l.title}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-[#dab38c] mb-1">
                  Assigned Place / Venue
                </label>
                <select
                  value={sessionPlaceId}
                  onChange={(e) => setSessionPlaceId(e.target.value)}
                  className="w-full px-3 py-2 bg-[#1f0b07] border border-[#dab38c]/30 rounded-xl text-xs text-[#f5edeb] focus:border-[#e3a157] outline-hidden"
                >
                  <option value="">Default Offering Location</option>
                  {places.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} ({p.pin_visibility === "public" ? "Public" : "Guests Only"})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-[#dab38c] mb-1">
                  Session Date *
                </label>
                <input
                  type="date"
                  required
                  value={sessionDate}
                  onChange={(e) => setSessionDate(e.target.value)}
                  className="w-full px-3 py-2 bg-[#1f0b07] border border-[#dab38c]/30 rounded-xl text-xs text-[#f5edeb] focus:border-[#e3a157] outline-hidden"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-[#dab38c] mb-1">
                    Start Time *
                  </label>
                  <input
                    type="time"
                    required
                    value={sessionStart}
                    onChange={(e) => setSessionStart(e.target.value)}
                    className="w-full px-3 py-2 bg-[#1f0b07] border border-[#dab38c]/30 rounded-xl text-xs text-[#f5edeb] focus:border-[#e3a157] outline-hidden"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-[#dab38c] mb-1">
                    End Time *
                  </label>
                  <input
                    type="time"
                    required
                    value={sessionEnd}
                    onChange={(e) => setSessionEnd(e.target.value)}
                    className="w-full px-3 py-2 bg-[#1f0b07] border border-[#dab38c]/30 rounded-xl text-xs text-[#f5edeb] focus:border-[#e3a157] outline-hidden"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-[#dab38c] mb-1">
                  Guest Capacity *
                </label>
                <input
                  type="number"
                  required
                  min={1}
                  max={100}
                  value={sessionCapacity}
                  onChange={(e) => setSessionCapacity(e.target.value)}
                  className="w-full px-3 py-2 bg-[#1f0b07] border border-[#dab38c]/30 rounded-xl text-xs text-[#f5edeb] focus:border-[#e3a157] outline-hidden"
                />
              </div>

              {editingSession && editingSession.booked_count > 0 && (
                <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/30 space-y-2">
                  <div className="flex items-center gap-1.5 text-amber-300 font-bold">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>Active Bookings Revision Audit</span>
                  </div>
                  <p className="text-[11px] text-[#dab38c]">
                    This session has {editingSession.booked_count} confirmed guest(s). An audit reason is required to notify guests of the schedule or venue revision.
                  </p>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Tide schedule adjusted by 30 mins; venue upgraded"
                    value={sessionRevisionNote}
                    onChange={(e) => setSessionRevisionNote(e.target.value)}
                    className="w-full px-3 py-2 bg-[#1f0b07] border border-amber-500/40 rounded-xl text-xs text-[#f5edeb] focus:border-amber-400 outline-hidden"
                  />
                </div>
              )}

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#dab38c]/20">
                <button
                  type="button"
                  onClick={() => setIsSessionModalOpen(false)}
                  className="px-4 py-2 bg-[#29100b] hover:bg-[#1f0b07] text-[#dab38c] rounded-xl font-bold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#e3a157] hover:bg-[#d49042] text-[#29100b] rounded-xl font-bold shadow-md cursor-pointer"
                >
                  {editingSession ? "Apply Revision" : "Create Session"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
