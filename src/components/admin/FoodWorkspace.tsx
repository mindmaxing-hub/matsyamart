import React, { useState, useMemo } from "react";
import { Order, Listing, ExperienceSlot, OrderItem, PinVisibilityType, ItineraryItem } from "../../types";
import { useData } from "../../context/DataContext";
import { formatINR, formatDate, formatTime } from "../../lib/utils";
import { MobilePass } from "./MobilePass";
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
  Phone,
  Share2,
  Download,
  FileSpreadsheet,
  X,
  Trash2,
  Filter,
  Edit2,
} from "lucide-react";
import { toast } from "sonner";
import { ImageDropzone } from "./ImageDropzone";
import { buildGoogleMapsUrl } from "../../lib/services/places";
import { SharedCoordinateInput } from "./SharedCoordinateInput";
import { SessionsAndVenuesManager } from "./SessionsAndVenuesManager";
import {
  ScheduleSlotBuilder,
  ScheduleSlotBuilderState,
  ItineraryBuilder,
  TagsBuilder,
  HostBioInput,
} from "./RichExperienceFields";

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
  const {
    updateAttendeeCheckIn,
    addListing,
    updateListing,
    deleteListing,
    addSlot,
    deleteSlot,
    addRecurringWeekendSlots,
    addBatchSlots,
  } = useData();

  const [activeSubTab, setActiveSubTab] = useState<"dinners" | "venues" | "roster">("dinners");
  const [selectedTicketOrder, setSelectedTicketOrder] = useState<{
    order: Order;
    item: OrderItem;
  } | null>(null);

  const [guestSearch, setGuestSearch] = useState("");
  const [selectedFeastFilter, setSelectedFeastFilter] = useState<string>("all");
  const [dateFilter, setDateFilter] = useState<"all" | "tomorrow" | "today">("all");

  // Modal 1: Add Food Gathering / Feast
  const [isAddFeastOpen, setIsAddFeastOpen] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newCookName, setNewCookName] = useState("");
  const [newCookPhone, setNewCookPhone] = useState("");
  const [newCookBio, setNewCookBio] = useState("");
  const [newPrice, setNewPrice] = useState("1200");
  const [newDuration, setNewDuration] = useState("180");
  const [newLocationName, setNewLocationName] = useState("Versova Gaothan Courtyard, Andheri West");
  const [newSecretNotes, setNewSecretNotes] = useState("Pass the blue arched gate; coordinator will welcome you at Villa 4.");
  const [newLat, setNewLat] = useState<number>(19.1316);
  const [newLng, setNewLng] = useState<number>(72.8109);
  const [newPinVisibility, setNewPinVisibility] = useState<PinVisibilityType>("public");
  const [newMapsUrl, setNewMapsUrl] = useState("https://www.google.com/maps/search/?api=1&query=19.1316,72.8109");
  const [newCourses, setNewCourses] = useState("Fresh Surmai Fry, Mud Crab Masala, Sol Kadhi Digestive, Kolim Rice & Modak");
  const [newSummary, setNewSummary] = useState("Authentic home-cooked Koli seafood banquet prepared fresh by community custodians in their ancestral courtyard.");
  const [newImage, setNewImage] = useState("https://images.unsplash.com/photo-1544025162-d76694265947?q=80&w=1200&auto=format&fit=crop");
  const [newMealType, setNewMealType] = useState<"breakfast" | "lunch" | "high_tea" | "dinner" | "snacks">("lunch");
  const [newCustomTags, setNewCustomTags] = useState("UNLIMITED THALI, SIGNATURE");
  
  // Rich Experience States for Add Feast Modal
  const [newScheduleState, setNewScheduleState] = useState<ScheduleSlotBuilderState>({
    mode: "recurring",
    recurringDays: ["saturday", "sunday"],
    recurringWeeks: 4,
    recurringStartTime: "12:30",
    recurringEndTime: "15:00",
    recurringCapacity: 12,
    customSlots: [],
    singleDate: (() => {
      const d = new Date();
      d.setDate(d.getDate() + 1);
      return d.toISOString().split("T")[0] || "";
    })(),
    singleStartTime: "12:30",
    singleEndTime: "15:00",
    singleCapacity: 12,
  });

  const [newItinerary, setNewItinerary] = useState<ItineraryItem[]>([
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

  const [newIncludedItems, setNewIncludedItems] = useState<string[]>([
    "5-Course Traditional Seafood Thali",
    "Unlimited Steamed Rice & Fresh Bhakris",
    "Fresh Catch Surmai / Pomfret Fry",
    "Mud Crab Masala Coastal Gravy",
    "Chilled Kokum Sol Kadhi Refills",
    "Ukdiche Modak Sweet Finale",
  ]);

  const [newThingsToCarry, setNewThingsToCarry] = useState<string[]>([
    "Appetite for rich coastal spices and generous portions",
    "Casual, comfortable clothing suited for courtyard seating",
    "Personal water bottle if preferred",
  ]);

  // Modal 2: Add Venue & Seating Window
  const [isAddVenueOpen, setIsAddVenueOpen] = useState(false);
  const [venueFeastId, setVenueFeastId] = useState("");
  const [venueLocationName, setVenueLocationName] = useState("");
  const [venueMapsUrl, setVenueMapsUrl] = useState("");
  const [venueSecretNotes, setVenueSecretNotes] = useState("");
  const [venueWindowName, setVenueWindowName] = useState("Sunset Seafood Banquet");
  const [venueDate, setVenueDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 2);
    return d.toISOString().split("T")[0];
  });
  const [venueStartTime, setVenueStartTime] = useState("18:30");
  const [venueEndTime, setVenueEndTime] = useState("21:30");
  const [venueCapacity, setVenueCapacity] = useState("14");

  // Modal 3: Edit Food Gathering / Feast
  const [editingFeast, setEditingFeast] = useState<Listing | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editCookName, setEditCookName] = useState("");
  const [editCookPhone, setEditCookPhone] = useState("");
  const [editCookBio, setEditCookBio] = useState("");
  const [editPrice, setEditPrice] = useState("1200");
  const [editDuration, setEditDuration] = useState("180");
  const [editLocationName, setEditLocationName] = useState("");
  const [editSecretNotes, setEditSecretNotes] = useState("");
  const [editLat, setEditLat] = useState<number>(19.1316);
  const [editLng, setEditLng] = useState<number>(72.8109);
  const [editPinVisibility, setEditPinVisibility] = useState<PinVisibilityType>("public");
  const [editMapsUrl, setEditMapsUrl] = useState("");
  const [editCourses, setEditCourses] = useState("");
  const [editSummary, setEditSummary] = useState("");
  const [editImage, setEditImage] = useState("");
  const [editMealType, setEditMealType] = useState<"breakfast" | "lunch" | "high_tea" | "dinner" | "snacks">("lunch");
  const [editCustomTags, setEditCustomTags] = useState("");
  const [editItinerary, setEditItinerary] = useState<ItineraryItem[]>([]);
  const [editIncludedItems, setEditIncludedItems] = useState<string[]>([]);
  const [editThingsToCarry, setEditThingsToCarry] = useState<string[]>([]);

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
      totalPaid: number;
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
              name: att.fullName || order.customer_name,
              phone: att.phone || order.customer_phone,
              checkedIn: !!att.checked_in,
              slot: item.slot,
              listing: item.listing,
              totalPaid: item.unit_price_inr * (item.quantity || 1),
            });
          });
        });
    });

    const now = new Date();
    const todayStr = now.toISOString().split("T")[0] || "";
    const tomorrow = new Date(now);
    tomorrow.setDate(now.getDate() + 1);
    const tomorrowStr = tomorrow.toISOString().split("T")[0] || "";

    return list.filter((a) => {
      // Feast filter
      if (selectedFeastFilter !== "all" && a.listing?.id !== selectedFeastFilter) {
        return false;
      }

      // Date filter
      if (dateFilter === "today") {
        if (!a.slot || !todayStr || !a.slot.slot_start.startsWith(todayStr)) return false;
      } else if (dateFilter === "tomorrow") {
        if (!a.slot || !tomorrowStr || !a.slot.slot_start.startsWith(tomorrowStr)) return false;
      }

      // Search
      const needle = guestSearch.toLowerCase().trim();
      if (!needle) return true;
      return (
        a.name.toLowerCase().includes(needle) ||
        a.phone.includes(needle) ||
        a.order.order_ref.toLowerCase().includes(needle) ||
        (a.listing?.title && a.listing.title.toLowerCase().includes(needle))
      );
    });
  }, [foodOrders, guestSearch, selectedFeastFilter, dateFilter]);

  // Target Cook & Manifest stats for day-before CRM flow
  const targetFeast = useMemo(() => {
    if (selectedFeastFilter !== "all") {
      return foodListings.find((l) => l.id === selectedFeastFilter);
    }
    return foodListings[0];
  }, [foodListings, selectedFeastFilter]);

  const totalConfirmedPlates = useMemo(() => {
    return foodAttendees.length;
  }, [foodAttendees]);

  const totalFeastRevenue = useMemo(() => {
    return foodAttendees.reduce((sum, a) => sum + (a.item.unit_price_inr || 1200), 0);
  }, [foodAttendees]);

  // 1. WhatsApp Manifest to Cook
  const handleSendManifestToCook = () => {
    if (!targetFeast) {
      toast.error("Please select a feast gathering first.");
      return;
    }

    const cookPhone = targetFeast.host_phone?.replace(/[^0-9]/g, "") || "";
    const attendeesLines =
      foodAttendees.length > 0
        ? foodAttendees
            .map(
              (a, idx) =>
                `${idx + 1}. *${a.name}* (1 Plate) - Ph: ${a.phone} [${a.order.order_ref}]`,
            )
            .join("\n")
        : "_No confirmed bookings logged yet._";

    const text = encodeURIComponent(
      `🍲 *MATSYAMART COOK MANIFEST: GUEST ROSTER*\n\n` +
        `*Cook & Custodian:* ${targetFeast.host_name}\n` +
        `*Feast:* ${targetFeast.title}\n` +
        `*Venue:* ${targetFeast.location_name || "Versova Courtyard"}\n` +
        `*Total Expected Guests:* ${totalConfirmedPlates} Plates Confirmed\n\n` +
        `📋 *CONFIRMED GUEST LIST:*\n${attendeesLines}\n\n` +
        `*Secret Arrival Note:* ${targetFeast.secret_meeting_point || "Rendezvous at courtyard gate."}\n\n` +
        `_Generated via MatsyaMart Operations Hub CRM for Bhoomiputra Foundation._`,
    );

    const waUrl = cookPhone
      ? `https://wa.me/${cookPhone}?text=${text}`
      : `https://api.whatsapp.com/send?text=${text}`;
    window.open(waUrl, "_blank");
    toast.success(`Manifest prepared for ${targetFeast.host_name}!`);
  };

  // 2. Download Cook Manifest as CSV
  const handleDownloadCsv = () => {
    if (foodAttendees.length === 0) {
      toast.error("No attendees found for export.");
      return;
    }

    const headers = [
      "Guest Name",
      "Phone",
      "Feast Title",
      "Cook Name",
      "Date & Slot",
      "Venue",
      "Order Ref",
      "Amount Paid (INR)",
      "Checked In",
    ];

    const rows = foodAttendees.map((a) => [
      `"${a.name.replace(/"/g, '""')}"`,
      `"${a.phone}"`,
      `"${(a.listing?.title || "").replace(/"/g, '""')}"`,
      `"${(a.listing?.host_name || "").replace(/"/g, '""')}"`,
      `"${a.slot ? formatDate(a.slot.slot_start) + " " + formatTime(a.slot.slot_start) : "Standard"}"`,
      `"${(a.listing?.location_name || "").replace(/"/g, '""')}"`,
      `"${a.order.order_ref}"`,
      `"${a.item.unit_price_inr}"`,
      `"${a.checkedIn ? "Yes" : "No"}"`,
    ]);

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `matsyamart_cook_manifest_${new Date().toISOString().split("T")[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("Downloaded Cook Roster CSV!");
  };

  // 3. Send Pass Directly to Guest via WhatsApp
  const handleSendPassToGuest = (att: typeof foodAttendees[0]) => {
    const guestPhone = att.phone?.replace(/[^0-9]/g, "") || "";
    const passRef = `MM-PASS-${att.order.order_ref.replace(/[^A-Za-z0-9]/g, "").slice(-6).toUpperCase()}`;
    const verificationUrl = `${typeof window !== "undefined" ? window.location.origin : ""}/order/confirmation/${att.order.order_ref}`;

    const text = encodeURIComponent(
      `🎟️ *MatsyaMart Official 9:16 Mobile Pass*\n\n` +
        `Hi *${att.name}*, your coastal seafood feast entry pass is confirmed!\n\n` +
        `*Feast:* ${att.listing?.title || "Coastal Feast"}\n` +
        `*Cook & Host:* ${att.listing?.host_name || "Community Host"}\n` +
        `*Pass ID:* ${passRef}\n` +
        `*Venue:* ${att.listing?.location_name || "Versova Koliwada"}\n` +
        (att.slot ? `*Schedule:* ${formatDate(att.slot.slot_start)} at ${formatTime(att.slot.slot_start)}\n` : "") +
        (att.listing?.secret_meeting_point ? `*Secret Arrival Note:* ${att.listing.secret_meeting_point}\n` : "") +
        (att.listing?.meeting_point_maps_url ? `*Google Maps GPS:* ${att.listing.meeting_point_maps_url}\n` : "") +
        `\n👉 *View/Save Your 9:16 Mobile Pass:* ${verificationUrl}`,
    );

    const waUrl = guestPhone
      ? `https://wa.me/${guestPhone}?text=${text}`
      : `https://api.whatsapp.com/send?text=${text}`;
    window.open(waUrl, "_blank");
    toast.success(`WhatsApp pass generated for ${att.name}`);
  };

  // 4. Create New Food Feast Gathering
  const handleCreateFeast = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) {
      toast.error("Please enter a feast title.");
      return;
    }

    const coursesArray = newCourses
      .split(",")
      .map((c) => c.trim())
      .filter(Boolean);

    const slug = newTitle
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");

    const mapsUrl = buildGoogleMapsUrl(newLat, newLng);

    const created = addListing({
      title: newTitle.trim(),
      slug: `${slug}-${Date.now().toString().slice(-4)}`,
      type: "experience",
      pillar: "food",
      price_inr: Number(newPrice) || 1200,
      currency: "INR",
      images: [newImage.trim()],
      short_summary: newSummary.trim(),
      full_description: `${newSummary.trim()}\n\nTraditional Courses:\n${coursesArray.map((c) => `• ${c}`).join("\n")}`,
      location_name: newLocationName.trim(),
      secret_meeting_point: newSecretNotes.trim(),
      latitude: newLat,
      longitude: newLng,
      meeting_point_maps_url: mapsUrl,
      duration_minutes: Number(newDuration) || 180,
      host_name: newCookName.trim() || "Ashwini Tandel",
      host_phone: newCookPhone.trim() || "+91 99284 77158",
      host_bio: newCookBio.trim() || "Heritage home cook and community custodian in Mumbai's original coastal settlements.",
      dietary_tags: coursesArray,
      meal_type: newMealType,
      custom_tags: newCustomTags.split(",").map((t) => t.trim()).filter(Boolean),
      included_items: newIncludedItems,
      things_to_carry: newThingsToCarry,
      itinerary: newItinerary,
      is_active: true,
      is_featured: true,
    });

    // Generate slots based on schedule state
    let slotsCreatedCount = 0;
    if (newScheduleState.mode === "recurring") {
      addRecurringWeekendSlots(
        created.id,
        newScheduleState.recurringWeeks,
        newScheduleState.recurringCapacity,
        newScheduleState.recurringStartTime,
        newScheduleState.recurringEndTime,
        newScheduleState.recurringDays,
      );
      slotsCreatedCount = newScheduleState.recurringWeeks * newScheduleState.recurringDays.length;
    } else if (newScheduleState.mode === "custom" && newScheduleState.customSlots.length > 0) {
      const customBatch = newScheduleState.customSlots.map((s) => ({
        listing_id: created.id,
        offering_id: created.id,
        slot_start: new Date(`${s.date}T${s.startTime}:00`).toISOString(),
        slot_end: new Date(`${s.date}T${s.endTime}:00`).toISOString(),
        capacity: Number(s.capacity) || 12,
      }));
      addBatchSlots(customBatch);
      slotsCreatedCount = customBatch.length;
    } else if (newScheduleState.singleDate && newScheduleState.singleStartTime && newScheduleState.singleEndTime) {
      addSlot({
        listing_id: created.id,
        offering_id: created.id,
        slot_start: new Date(`${newScheduleState.singleDate}T${newScheduleState.singleStartTime}:00`).toISOString(),
        slot_end: new Date(`${newScheduleState.singleDate}T${newScheduleState.singleEndTime}:00`).toISOString(),
        capacity: Number(newScheduleState.singleCapacity) || 12,
      });
      slotsCreatedCount = 1;
    }

    toast.success(`Created "${newTitle}" with ${slotsCreatedCount} scheduled calendar dates & full rich details!`);
    setIsAddFeastOpen(false);
    // Reset form
    setNewTitle("");
    setNewCookName("");
    setNewCookPhone("");
  };

  // 5. Add New Venue / Seating Window
  const handleCreateVenueWindow = (e: React.FormEvent) => {
    e.preventDefault();
    const targetListing = foodListings.find((l) => l.id === venueFeastId) || foodListings[0];
    if (!targetListing) {
      toast.error("Please create a food feast first.");
      return;
    }

    const startDateTime = new Date(`${venueDate}T${venueStartTime}:00`);
    const endDateTime = new Date(`${venueDate}T${venueEndTime}:00`);

    addSlot({
      listing_id: targetListing.id,
      slot_start: startDateTime.toISOString(),
      slot_end: endDateTime.toISOString(),
      capacity: Number(venueCapacity) || 12,
    });

    toast.success(`Seating window "${venueWindowName}" opened for ${targetListing.title}!`);
    setIsAddVenueOpen(false);
  };

  // 6. Open & Save Edit Feast
  const handleOpenEditFeast = (feast: Listing) => {
    setEditingFeast(feast);
    setEditTitle(feast.title || "");
    setEditCookName(feast.host_name || "");
    setEditCookPhone(feast.host_phone || "");
    setEditCookBio(feast.host_bio || "");
    setEditPrice(String(feast.price_inr || "1200"));
    setEditDuration(String(feast.duration_minutes || "180"));
    setEditLocationName(feast.location_name || "");
    setEditSecretNotes(feast.secret_meeting_point || "");
    const lat = feast.latitude || 19.1316;
    const lng = feast.longitude || 72.8109;
    setEditLat(lat);
    setEditLng(lng);
    setEditPinVisibility("public");
    setEditMapsUrl(feast.meeting_point_maps_url || buildGoogleMapsUrl(lat, lng));
    setEditCourses((feast.dietary_tags || []).join(", "));
    setEditSummary(feast.short_summary || "");
    setEditImage(feast.images?.[0] || "");
    setEditMealType(feast.meal_type || "lunch");
    setEditCustomTags((feast.custom_tags || []).join(", "));
    setEditItinerary(feast.itinerary ? [...feast.itinerary] : []);
    setEditIncludedItems(feast.included_items ? [...feast.included_items] : []);
    setEditThingsToCarry(feast.things_to_carry ? [...feast.things_to_carry] : []);
  };

  const handleSaveEditFeast = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingFeast) return;
    if (!editTitle.trim()) {
      toast.error("Please enter a feast title.");
      return;
    }

    const coursesArray = editCourses
      .split(",")
      .map((c) => c.trim())
      .filter(Boolean);

    const mapsUrl = buildGoogleMapsUrl(editLat, editLng);

    updateListing(editingFeast.id, {
      title: editTitle.trim(),
      price_inr: Number(editPrice) || editingFeast.price_inr,
      duration_minutes: Number(editDuration) || 180,
      host_name: editCookName.trim() || editingFeast.host_name,
      host_phone: editCookPhone.trim() || editingFeast.host_phone,
      host_bio: editCookBio.trim() || editingFeast.host_bio,
      location_name: editLocationName.trim(),
      secret_meeting_point: editSecretNotes.trim(),
      latitude: editLat,
      longitude: editLng,
      meeting_point_maps_url: mapsUrl,
      dietary_tags: coursesArray,
      meal_type: editMealType,
      custom_tags: editCustomTags.split(",").map((t) => t.trim()).filter(Boolean),
      included_items: editIncludedItems,
      things_to_carry: editThingsToCarry,
      itinerary: editItinerary,
      short_summary: editSummary.trim(),
      full_description: `${editSummary.trim()}\n\nTraditional Courses:\n${coursesArray.map((c) => `• ${c}`).join("\n")}`,
      images: editImage.trim() ? [editImage.trim()] : editingFeast.images,
    });

    toast.success(`Updated "${editTitle.trim()}" successfully!`);
    setEditingFeast(null);
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

      {/* Sub-Tab Navigation Strip & Action Bar */}
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
            👥 Cook CRM Roster &amp; Passes ({foodAttendees.length})
          </button>
        </div>

        {/* Primary CTA Buttons according to active tab */}
        <div className="flex items-center gap-2">
          {activeSubTab === "dinners" && (
            <button
              onClick={() => setIsAddFeastOpen(true)}
              className="px-4 py-2 bg-[#e3a157] hover:bg-[#dab38c] text-[#29100b] font-bold text-xs rounded-xl shadow-md transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Add Food Gathering</span>
            </button>
          )}

          {activeSubTab === "venues" && (
            <button
              onClick={() => {
                const firstListing = foodListings[0];
                if (firstListing && !venueFeastId) {
                  setVenueFeastId(firstListing.id);
                  setVenueLocationName(firstListing.location_name || "Versova Courtyard");
                  setVenueMapsUrl(firstListing.meeting_point_maps_url || "");
                  setVenueSecretNotes(firstListing.secret_meeting_point || "");
                }
                setIsAddVenueOpen(true);
              }}
              className="px-4 py-2 bg-[#e3a157] hover:bg-[#dab38c] text-[#29100b] font-bold text-xs rounded-xl shadow-md transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Add Venue &amp; Seating Window</span>
            </button>
          )}

          {activeSubTab === "roster" && (
            <div className="flex items-center gap-2">
              <button
                onClick={handleSendManifestToCook}
                className="px-3.5 py-2 bg-[#25D366] hover:bg-[#20ba59] text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center gap-1.5 cursor-pointer"
                title="Send Tomorrow's Guest List to Cook via WhatsApp"
              >
                <Share2 className="w-4 h-4" />
                <span>WhatsApp to Cook</span>
              </button>
              <button
                onClick={handleDownloadCsv}
                className="px-3 py-2 bg-[#35160e] hover:bg-[#481f14] border border-[#dab38c]/30 text-[#e3a157] font-bold text-xs rounded-xl transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <Download className="w-4 h-4" />
                <span className="hidden sm:inline">Download CSV</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* SUB-TAB 1: Dinners & Menus */}
      {activeSubTab === "dinners" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between text-xs text-[#dab38c]">
            <div>
              Showing <strong className="text-white">{foodListings.length}</strong> active food experience gathering{foodListings.length > 1 ? "s" : ""}
            </div>
            <button
              onClick={() => setIsAddFeastOpen(true)}
              className="text-[#e3a157] hover:underline flex items-center gap-1 font-semibold cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" /> Add another feast
            </button>
          </div>

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
                    <div className="absolute top-2.5 left-2.5 flex flex-wrap gap-1.5 max-w-[80%]">
                      <span className="bg-[#1f0b07]/85 backdrop-blur-xs px-2.5 py-0.5 rounded-full text-[10px] font-bold text-[#e3a157] border border-[#dab38c]/30 uppercase tracking-wider">
                        {dinner.meal_type ? `🍽️ ${dinner.meal_type}` : "🍽️ Feast"}
                      </span>
                      {dinner.custom_tags && dinner.custom_tags.length > 0 && (
                        <span className="bg-[#29100b]/85 backdrop-blur-xs px-2 py-0.5 rounded-full text-[9px] font-bold text-[#f5edeb] border border-[#dab38c]/25 uppercase">
                          {dinner.custom_tags[0]}
                        </span>
                      )}
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
                      {dinner.dietary_tags && dinner.dietary_tags.length > 0 ? (
                        dinner.dietary_tags.slice(0, 4).map((tag, i) => (
                          <div key={i} className="truncate">
                            🦀 {tag}
                          </div>
                        ))
                      ) : (
                        <>
                          <div>🐟 Fresh Catch Surmai / Pomfret</div>
                          <div>🥥 Sol Kadhi Digestive</div>
                          <div>🦀 Mud Crab Masala &amp; Bhakri</div>
                          <div>🌾 Ancestral Rice &amp; Sweets</div>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Host Cook Details */}
                  <div className="flex items-center justify-between text-xs pt-1">
                    <div>
                      <span className="text-[#dab38c]/70">Cook &amp; Custodian:</span>{" "}
                      <strong className="text-[#f5edeb]">{dinner.host_name}</strong>
                    </div>
                    <span className="text-[#dab38c] font-mono text-[11px]">
                      {dinner.host_phone || "+91 99284 77158"}
                    </span>
                  </div>
                </div>

                <div className="pt-3 border-t border-[#dab38c]/15 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className="text-[#dab38c] flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-[#e3a157]" />
                      {dinner.duration_minutes || 180} mins feast
                    </span>
                    {dinner.meeting_point_maps_url && (
                      <a
                        href={dinner.meeting_point_maps_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-sky-950/70 border border-sky-400/40 text-[10px] font-bold text-sky-300 hover:text-sky-200 hover:bg-sky-900 transition-colors"
                        title="View feast venue on Google Maps"
                      >
                        <MapPin className="w-2.5 h-2.5 text-sky-400" />
                        <span>Maps</span>
                        <ExternalLink className="w-2.5 h-2.5" />
                      </a>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-emerald-400 font-semibold text-[11px]">
                      ● Open for Bookings
                    </span>
                    <button
                      onClick={() => handleOpenEditFeast(dinner)}
                      className="p-1 text-[#dab38c] hover:text-[#e3a157] hover:bg-[#35160e] rounded-lg transition-colors cursor-pointer"
                      title="Edit feast details & photo"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => {
                        if (confirm(`Remove feast "${dinner.title}"?`)) {
                          deleteListing(dinner.id);
                          toast.success("Feast removed");
                        }
                      }}
                      className="p-1 text-red-400 hover:text-red-300 hover:bg-red-950/30 rounded-lg transition-colors cursor-pointer"
                      title="Delete feast"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SUB-TAB 2: Reusable Venues, Seating Windows & Cooks */}
      {activeSubTab === "venues" && (
        <SessionsAndVenuesManager
          pillar="food"
          listings={foodListings}
          slots={slots}
          venueLabel="Courtyard Feast Venue"
          partnerRoleLabel="Heritage Cook"
        />
      )}

      {/* SUB-TAB 3: Guest Roster & Cook CRM Manifest */}
      {activeSubTab === "roster" && (
        <div className="space-y-5">
          {/* MatsyaMart Cook CRM Command Card */}
          <div className="bg-gradient-to-br from-[#35160e] via-[#29100b] to-[#1f0b07] border border-[#dab38c]/30 rounded-3xl p-5 sm:p-6 shadow-2xl space-y-4">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              <div>
                <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#e3a157] flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-[#ffde59]" />
                  <span>MATSYAMART COOK CRM &amp; DAY-BEFORE DISPATCH ENGINE</span>
                </div>
                <h3 className="font-display font-bold text-xl text-white mt-1">
                  {targetFeast ? targetFeast.title : "Coastal Seafood Dining"}
                </h3>
                <p className="text-xs text-[#dab38c]/80 mt-0.5">
                  Assigned Cook: <strong className="text-white">{targetFeast?.host_name || "Community Cook"}</strong> ·{" "}
                  WhatsApp: <strong className="text-[#ffde59] font-mono">{targetFeast?.host_phone || "+91 99284 77158"}</strong>
                </p>
              </div>

              {/* One-Click Cook WhatsApp Manifest & CSV Buttons */}
              <div className="flex flex-wrap items-center gap-2.5">
                <button
                  onClick={handleSendManifestToCook}
                  className="px-4 py-2.5 bg-[#25D366] hover:bg-[#20ba59] text-white font-bold text-xs rounded-xl shadow-lg transition-all flex items-center gap-2 cursor-pointer"
                >
                  <Share2 className="w-4 h-4" />
                  <span>Send Roster to Cook (WhatsApp)</span>
                </button>
                <button
                  onClick={handleDownloadCsv}
                  className="px-3.5 py-2.5 bg-white/10 hover:bg-white/20 border border-white/20 text-[#f5edeb] font-bold text-xs rounded-xl transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <FileSpreadsheet className="w-4 h-4 text-[#e3a157]" />
                  <span>Export CSV</span>
                </button>
              </div>
            </div>

            {/* Quick Metrics Bar */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-3 border-t border-[#dab38c]/20 text-xs">
              <div className="p-3 bg-[#1f0b07]/80 rounded-2xl border border-[#dab38c]/15">
                <div className="text-[10px] uppercase font-bold text-[#dab38c]/70">Total Guests</div>
                <div className="font-display text-xl font-bold text-white mt-0.5">{totalConfirmedPlates}</div>
              </div>
              <div className="p-3 bg-[#1f0b07]/80 rounded-2xl border border-[#dab38c]/15">
                <div className="text-[10px] uppercase font-bold text-[#dab38c]/70">Total Plates</div>
                <div className="font-display text-xl font-bold text-[#e3a157] mt-0.5">{totalConfirmedPlates} Plates</div>
              </div>
              <div className="p-3 bg-[#1f0b07]/80 rounded-2xl border border-[#dab38c]/15">
                <div className="text-[10px] uppercase font-bold text-[#dab38c]/70">Cook Settlement</div>
                <div className="font-display text-xl font-bold text-emerald-400 mt-0.5">{formatINR(totalFeastRevenue)}</div>
              </div>
              <div className="p-3 bg-[#1f0b07]/80 rounded-2xl border border-[#dab38c]/15">
                <div className="text-[10px] uppercase font-bold text-[#dab38c]/70">Venue GPS</div>
                <div className="text-[11px] font-semibold text-sky-400 truncate mt-1">
                  {targetFeast?.location_name || "Versova Courtyard"}
                </div>
              </div>
            </div>
          </div>

          {/* Filters Bar */}
          <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2">
              {/* Feast Selector */}
              <select
                value={selectedFeastFilter}
                onChange={(e) => setSelectedFeastFilter(e.target.value)}
                className="px-3 py-2 bg-[#35160e] border border-[#dab38c]/30 rounded-xl text-xs text-[#f5edeb] outline-none"
              >
                <option value="all">All Feasts &amp; Gatherings</option>
                {foodListings.map((f) => (
                  <option key={f.id} value={f.id}>
                    {f.title}
                  </option>
                ))}
              </select>

              {/* Date Filter Pills */}
              <div className="inline-flex rounded-xl bg-[#35160e] border border-[#dab38c]/20 p-1 text-xs">
                {(["all", "tomorrow", "today"] as const).map((d) => (
                  <button
                    key={d}
                    onClick={() => setDateFilter(d)}
                    className={`px-3 py-1 rounded-lg font-bold capitalize transition-all cursor-pointer ${
                      dateFilter === d ? "bg-[#e3a157] text-[#29100b]" : "text-[#dab38c] hover:text-white"
                    }`}
                  >
                    {d === "all" ? "All Schedules" : d}
                  </button>
                ))}
              </div>
            </div>

            {/* Guest Search Input */}
            <div className="relative flex-1 max-w-sm">
              <Search className="w-4 h-4 text-[#dab38c]/60 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search guest by name, phone, order ref..."
                value={guestSearch}
                onChange={(e) => setGuestSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-[#35160e]/80 border border-[#dab38c]/25 rounded-xl text-xs text-[#f5edeb] placeholder-[#dab38c]/50 outline-none focus:border-[#e3a157]"
              />
            </div>
          </div>

          {/* Attendees Table */}
          <div className="bg-[#35160e]/90 border border-[#dab38c]/25 rounded-2xl overflow-hidden shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#29100b] text-[#dab38c] border-b border-[#dab38c]/15">
                  <tr>
                    <th className="py-3 px-4 font-semibold">Guest &amp; Phone</th>
                    <th className="py-3 px-4 font-semibold">Feasting Gathering</th>
                    <th className="py-3 px-4 font-semibold">Slot Schedule</th>
                    <th className="py-3 px-4 font-semibold">Order Ref</th>
                    <th className="py-3 px-4 font-semibold">On-Ground Check-in</th>
                    <th className="py-3 px-4 font-semibold text-right">Pass Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#dab38c]/10 text-[#f5edeb]">
                  {foodAttendees.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="text-center py-10 text-[#dab38c]/60">
                        No food dining guests found matching the selected filters.
                      </td>
                    </tr>
                  ) : (
                    foodAttendees.map((att, idx) => (
                      <tr key={idx} className="hover:bg-[#481f14]/50 transition-colors">
                        <td className="py-3.5 px-4">
                          <div className="font-semibold text-sm">{att.name}</div>
                          <div className="text-[11px] text-[#dab38c] font-mono">{att.phone}</div>
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
                          <div className="inline-flex items-center gap-1.5">
                            <button
                              onClick={() => handleSendPassToGuest(att)}
                              className="px-2.5 py-1 bg-[#25D366] hover:bg-[#20ba59] text-white font-bold text-xs rounded-xl shadow-xs transition-all inline-flex items-center gap-1 cursor-pointer"
                              title="Send 9:16 Pass via WhatsApp directly to this guest"
                            >
                              <Share2 className="w-3 h-3" />
                              <span className="hidden sm:inline">WhatsApp</span>
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
                              <span>View 9:16 Pass</span>
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

      {/* MODAL 1: ADD FOOD GATHERING (NEW FEAST) */}
      {isAddFeastOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs overflow-y-auto">
          <div className="relative w-full max-w-xl bg-[#29100b] border border-[#dab38c]/30 rounded-3xl p-6 text-[#f5edeb] shadow-2xl my-auto space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#dab38c]/20">
              <div className="flex items-center gap-2">
                <Utensils className="w-5 h-5 text-[#e3a157]" />
                <h3 className="font-display font-bold text-lg text-white">Add Food Gathering &amp; Feast</h3>
              </div>
              <button onClick={() => setIsAddFeastOpen(false)} className="text-[#dab38c] hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateFeast} className="space-y-4 text-xs">
              <div>
                <label className="font-semibold text-[#dab38c] block mb-1">Feast Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Versova Koli Crab Masala &amp; Surmai Feast"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full px-3 py-2 bg-[#1f0b07] border border-[#dab38c]/30 rounded-xl text-white outline-none focus:border-[#e3a157]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-[#dab38c] block mb-1">Meal Schedule Type *</label>
                  <select
                    value={newMealType}
                    onChange={(e) => setNewMealType(e.target.value as any)}
                    className="w-full px-3 py-2 bg-[#1f0b07] border border-[#dab38c]/30 rounded-xl text-white outline-none focus:border-[#e3a157] cursor-pointer"
                  >
                    <option value="lunch" className="bg-[#29100b]">☀️ Lunch Feast</option>
                    <option value="dinner" className="bg-[#29100b]">🌙 Dinner Banquet</option>
                    <option value="breakfast" className="bg-[#29100b]">🌅 Harbor Breakfast</option>
                    <option value="high_tea" className="bg-[#29100b]">☕ High Tea &amp; Fritters</option>
                    <option value="snacks" className="bg-[#29100b]">🍢 Late Evening Snacks</option>
                  </select>
                </div>
                <div>
                  <label className="font-semibold text-[#dab38c] block mb-1">Custom Badges / Tags</label>
                  <input
                    type="text"
                    placeholder="e.g. UNLIMITED THALI, SIGNATURE, SPICY"
                    value={newCustomTags}
                    onChange={(e) => setNewCustomTags(e.target.value)}
                    className="w-full px-3 py-2 bg-[#1f0b07] border border-[#dab38c]/30 rounded-xl text-white outline-none focus:border-[#e3a157]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-[#dab38c] block mb-1">Cook / Host Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Ashwini Tandel"
                    value={newCookName}
                    onChange={(e) => setNewCookName(e.target.value)}
                    className="w-full px-3 py-2 bg-[#1f0b07] border border-[#dab38c]/30 rounded-xl text-white outline-none focus:border-[#e3a157]"
                  />
                </div>
                <div>
                  <label className="font-semibold text-[#dab38c] block mb-1">Cook WhatsApp Phone *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. +91 99284 77158"
                    value={newCookPhone}
                    onChange={(e) => setNewCookPhone(e.target.value)}
                    className="w-full px-3 py-2 bg-[#1f0b07] border border-[#dab38c]/30 rounded-xl text-white outline-none focus:border-[#e3a157]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-[#dab38c] block mb-1">Price per plate (₹ INR) *</label>
                  <input
                    type="number"
                    required
                    value={newPrice}
                    onChange={(e) => setNewPrice(e.target.value)}
                    className="w-full px-3 py-2 bg-[#1f0b07] border border-[#dab38c]/30 rounded-xl text-white outline-none focus:border-[#e3a157]"
                  />
                </div>
                <div>
                  <label className="font-semibold text-[#dab38c] block mb-1">Duration (Minutes)</label>
                  <input
                    type="number"
                    value={newDuration}
                    onChange={(e) => setNewDuration(e.target.value)}
                    className="w-full px-3 py-2 bg-[#1f0b07] border border-[#dab38c]/30 rounded-xl text-white outline-none focus:border-[#e3a157]"
                  />
                </div>
              </div>

              <div>
                <label className="font-semibold text-[#dab38c] block mb-1">Venue / Courtyard Name *</label>
                <input
                  type="text"
                  required
                  value={newLocationName}
                  onChange={(e) => setNewLocationName(e.target.value)}
                  className="w-full px-3 py-2 bg-[#1f0b07] border border-[#dab38c]/30 rounded-xl text-white outline-none focus:border-[#e3a157]"
                />
              </div>

              <div>
                <label className="font-semibold text-[#dab38c] block mb-1">Secret Arrival Note (On Ticket Pass)</label>
                <input
                  type="text"
                  value={newSecretNotes}
                  onChange={(e) => setNewSecretNotes(e.target.value)}
                  className="w-full px-3 py-2 bg-[#1f0b07] border border-[#dab38c]/30 rounded-xl text-white outline-none focus:border-[#e3a157]"
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
                <label className="font-semibold text-[#dab38c] block mb-1">Course Highlights (comma separated)</label>
                <input
                  type="text"
                  value={newCourses}
                  onChange={(e) => setNewCourses(e.target.value)}
                  className="w-full px-3 py-2 bg-[#1f0b07] border border-[#dab38c]/30 rounded-xl text-white outline-none focus:border-[#e3a157]"
                />
              </div>

              {/* Host Heritage Story */}
              <HostBioInput
                value={newCookBio}
                onChange={setNewCookBio}
                roleLabel="Cook & Custodian"
              />

              {/* What's Included Builder */}
              <TagsBuilder
                label="What's Included in This Feast Pass"
                sublabel="Dishes, beverages & inclusions displayed on frontend"
                icon="included"
                items={newIncludedItems}
                onChange={setNewIncludedItems}
                presetSuggestions={[
                  "5-Course Traditional Seafood Thali",
                  "Unlimited Steamed Rice & Bhakris",
                  "Fresh Catch Surmai / Pomfret Fry",
                  "Mud Crab Masala Coastal Gravy",
                  "Chilled Kokum Sol Kadhi Refills",
                  "Ukdiche Modak Sweet Finale",
                ]}
              />

              {/* Things to Carry Builder */}
              <TagsBuilder
                label="Essential Guidelines & Things to Bring"
                sublabel="Guest instructions & checklist"
                icon="carry"
                items={newThingsToCarry}
                onChange={setNewThingsToCarry}
                presetSuggestions={[
                  "Appetite for bold authentic coastal spices",
                  "Casual comfortable attire for courtyard seating",
                  "Personal water bottle if preferred",
                ]}
              />

              {/* Experience Itinerary & Course Timeline Builder */}
              <ItineraryBuilder
                itinerary={newItinerary}
                onChange={setNewItinerary}
                pillar="food"
              />

              <ImageDropzone
                value={newImage}
                onChange={setNewImage}
                label="Feast Cover Photo"
                helperText="Drag & drop appetizing food picture, or browse from device"
              />

              {/* Multi-Slot & Recurring Schedule Builder */}
              <ScheduleSlotBuilder
                state={newScheduleState}
                onChange={setNewScheduleState}
                defaultTimePreset="lunch"
              />

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddFeastOpen(false)}
                  className="px-4 py-2 text-[#dab38c] hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#e3a157] hover:bg-[#dab38c] text-[#29100b] font-bold rounded-xl shadow-md cursor-pointer"
                >
                  Publish Feast &amp; Open Seating
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: EDIT FOOD GATHERING / FEAST */}
      {editingFeast && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs overflow-y-auto">
          <div className="relative w-full max-w-xl bg-[#29100b] border border-[#dab38c]/30 rounded-3xl p-6 text-[#f5edeb] shadow-2xl my-auto max-h-[90vh] overflow-y-auto space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#dab38c]/20">
              <div className="flex items-center gap-2">
                <Edit2 className="w-5 h-5 text-[#e3a157]" />
                <h3 className="font-display font-bold text-lg text-white">Edit Feast Gathering</h3>
              </div>
              <button
                onClick={() => setEditingFeast(null)}
                className="text-[#dab38c] hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEditFeast} className="space-y-4 text-xs">
              <div>
                <label className="font-semibold text-[#dab38c] block mb-1">Feast Title *</label>
                <input
                  type="text"
                  required
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  className="w-full px-3 py-2 bg-[#1f0b07] border border-[#dab38c]/30 rounded-xl text-white outline-none focus:border-[#e3a157]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-[#dab38c] block mb-1">Meal Schedule Type *</label>
                  <select
                    value={editMealType}
                    onChange={(e) => setEditMealType(e.target.value as any)}
                    className="w-full px-3 py-2 bg-[#1f0b07] border border-[#dab38c]/30 rounded-xl text-white outline-none focus:border-[#e3a157] cursor-pointer"
                  >
                    <option value="lunch" className="bg-[#29100b]">☀️ Lunch Feast</option>
                    <option value="dinner" className="bg-[#29100b]">🌙 Dinner Banquet</option>
                    <option value="breakfast" className="bg-[#29100b]">🌅 Harbor Breakfast</option>
                    <option value="high_tea" className="bg-[#29100b]">☕ High Tea &amp; Fritters</option>
                    <option value="snacks" className="bg-[#29100b]">🍢 Late Evening Snacks</option>
                  </select>
                </div>
                <div>
                  <label className="font-semibold text-[#dab38c] block mb-1">Custom Badges / Tags</label>
                  <input
                    type="text"
                    placeholder="e.g. UNLIMITED THALI, SIGNATURE, SPICY"
                    value={editCustomTags}
                    onChange={(e) => setEditCustomTags(e.target.value)}
                    className="w-full px-3 py-2 bg-[#1f0b07] border border-[#dab38c]/30 rounded-xl text-white outline-none focus:border-[#e3a157]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-[#dab38c] block mb-1">Cook / Host Name *</label>
                  <input
                    type="text"
                    required
                    value={editCookName}
                    onChange={(e) => setEditCookName(e.target.value)}
                    className="w-full px-3 py-2 bg-[#1f0b07] border border-[#dab38c]/30 rounded-xl text-white outline-none focus:border-[#e3a157]"
                  />
                </div>
                <div>
                  <label className="font-semibold text-[#dab38c] block mb-1">Cook WhatsApp Phone *</label>
                  <input
                    type="text"
                    required
                    value={editCookPhone}
                    onChange={(e) => setEditCookPhone(e.target.value)}
                    className="w-full px-3 py-2 bg-[#1f0b07] border border-[#dab38c]/30 rounded-xl text-white outline-none focus:border-[#e3a157] font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="font-semibold text-[#dab38c] block mb-1">Cook Heritage Bio</label>
                <input
                  type="text"
                  value={editCookBio}
                  onChange={(e) => setEditCookBio(e.target.value)}
                  className="w-full px-3 py-2 bg-[#1f0b07] border border-[#dab38c]/30 rounded-xl text-white outline-none focus:border-[#e3a157]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-[#dab38c] block mb-1">Price per plate (₹ INR) *</label>
                  <input
                    type="number"
                    required
                    value={editPrice}
                    onChange={(e) => setEditPrice(e.target.value)}
                    className="w-full px-3 py-2 bg-[#1f0b07] border border-[#dab38c]/30 rounded-xl text-white outline-none focus:border-[#e3a157] font-mono"
                  />
                </div>
                <div>
                  <label className="font-semibold text-[#dab38c] block mb-1">Duration (Minutes)</label>
                  <input
                    type="number"
                    value={editDuration}
                    onChange={(e) => setEditDuration(e.target.value)}
                    className="w-full px-3 py-2 bg-[#1f0b07] border border-[#dab38c]/30 rounded-xl text-white outline-none focus:border-[#e3a157] font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="font-semibold text-[#dab38c] block mb-1">Venue / Courtyard Name *</label>
                <input
                  type="text"
                  required
                  value={editLocationName}
                  onChange={(e) => setEditLocationName(e.target.value)}
                  className="w-full px-3 py-2 bg-[#1f0b07] border border-[#dab38c]/30 rounded-xl text-white outline-none focus:border-[#e3a157]"
                />
              </div>

              <div>
                <label className="font-semibold text-[#dab38c] block mb-1">Secret Arrival Note</label>
                <input
                  type="text"
                  value={editSecretNotes}
                  onChange={(e) => setEditSecretNotes(e.target.value)}
                  className="w-full px-3 py-2 bg-[#1f0b07] border border-[#dab38c]/30 rounded-xl text-white outline-none focus:border-[#e3a157]"
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
                <label className="font-semibold text-[#dab38c] block mb-1">Course Highlights (comma separated)</label>
                <input
                  type="text"
                  value={editCourses}
                  onChange={(e) => setEditCourses(e.target.value)}
                  className="w-full px-3 py-2 bg-[#1f0b07] border border-[#dab38c]/30 rounded-xl text-white outline-none focus:border-[#e3a157]"
                />
              </div>

              {/* Host Heritage Story */}
              <HostBioInput
                value={editCookBio}
                onChange={setEditCookBio}
                roleLabel="Cook & Custodian"
              />

              {/* What's Included Builder */}
              <TagsBuilder
                label="What's Included in This Feast Pass"
                sublabel="Dishes, beverages & inclusions displayed on frontend"
                icon="included"
                items={editIncludedItems}
                onChange={setEditIncludedItems}
                presetSuggestions={[
                  "5-Course Traditional Seafood Thali",
                  "Unlimited Steamed Rice & Bhakris",
                  "Fresh Catch Surmai / Pomfret Fry",
                  "Mud Crab Masala Coastal Gravy",
                  "Chilled Kokum Sol Kadhi Refills",
                  "Ukdiche Modak Sweet Finale",
                ]}
              />

              {/* Things to Carry Builder */}
              <TagsBuilder
                label="Essential Guidelines & Things to Bring"
                sublabel="Guest instructions & checklist"
                icon="carry"
                items={editThingsToCarry}
                onChange={setEditThingsToCarry}
                presetSuggestions={[
                  "Appetite for bold authentic coastal spices",
                  "Casual comfortable attire for courtyard seating",
                  "Personal water bottle if preferred",
                ]}
              />

              {/* Experience Itinerary & Course Timeline Builder */}
              <ItineraryBuilder
                itinerary={editItinerary}
                onChange={setEditItinerary}
                pillar="food"
              />

              {/* Quick Recurring Weekend Generator for Existing Feast */}
              {editingFeast && (
                <div className="p-3 bg-[#1f0b07] rounded-xl border border-[#dab38c]/20 flex items-center justify-between gap-2 flex-wrap">
                  <div>
                    <div className="text-[11px] font-bold text-[#e3a157]">
                      Need More Customer Booking Dates?
                    </div>
                    <div className="text-[10px] text-[#dab38c]/70">
                      Generate the next 4 upcoming weekends of seating slots instantly
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      addRecurringWeekendSlots(
                        editingFeast.id,
                        4,
                        12,
                        "12:30",
                        "15:00",
                        ["saturday", "sunday"],
                      );
                      toast.success(
                        `Generated 8 upcoming weekend slots for "${editingFeast.title}"!`,
                      );
                    }}
                    className="px-3 py-1.5 bg-[#e3a157] hover:bg-[#dab38c] text-[#29100b] font-bold text-[11px] rounded-lg cursor-pointer"
                  >
                    + Generate 4 Weeks (8 Slots)
                  </button>
                </div>
              )}

              <div>
                <label className="font-semibold text-[#dab38c] block mb-1">Short Description</label>
                <textarea
                  rows={2}
                  value={editSummary}
                  onChange={(e) => setEditSummary(e.target.value)}
                  className="w-full px-3 py-2 bg-[#1f0b07] border border-[#dab38c]/30 rounded-xl text-white outline-none focus:border-[#e3a157] resize-none"
                />
              </div>

              <ImageDropzone
                value={editImage}
                onChange={setEditImage}
                label="Feast Cover Photo"
                helperText="Drop replacement feast picture, or browse from device"
              />

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#dab38c]/20">
                <button
                  type="button"
                  onClick={() => setEditingFeast(null)}
                  className="px-4 py-2 rounded-xl text-[#dab38c] hover:bg-[#35160e] cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#e3a157] hover:bg-[#dab38c] text-[#29100b] font-bold rounded-xl shadow-md cursor-pointer"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {isAddVenueOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs overflow-y-auto">
          <div className="relative w-full max-w-lg bg-[#29100b] border border-[#dab38c]/30 rounded-3xl p-6 text-[#f5edeb] shadow-2xl my-auto space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#dab38c]/20">
              <div className="flex items-center gap-2">
                <MapPin className="w-5 h-5 text-[#e3a157]" />
                <h3 className="font-display font-bold text-lg text-white">Add Venue Seating Window</h3>
              </div>
              <button onClick={() => setIsAddVenueOpen(false)} className="text-[#dab38c] hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateVenueWindow} className="space-y-4 text-xs">
              <div>
                <label className="font-semibold text-[#dab38c] block mb-1">Select Feast Gathering *</label>
                <select
                  value={venueFeastId}
                  onChange={(e) => {
                    setVenueFeastId(e.target.value);
                    const sel = foodListings.find((l) => l.id === e.target.value);
                    if (sel) {
                      setVenueLocationName(sel.location_name || "");
                      setVenueMapsUrl(sel.meeting_point_maps_url || "");
                      setVenueSecretNotes(sel.secret_meeting_point || "");
                    }
                  }}
                  className="w-full px-3 py-2 bg-[#1f0b07] border border-[#dab38c]/30 rounded-xl text-white outline-none"
                >
                  {foodListings.map((f) => (
                    <option key={f.id} value={f.id}>
                      {f.title} ({f.host_name})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="font-semibold text-[#dab38c] block mb-1">Window Title</label>
                <input
                  type="text"
                  value={venueWindowName}
                  onChange={(e) => setVenueWindowName(e.target.value)}
                  placeholder="e.g. Afternoon Lunch Feast / Sunset Supper"
                  className="w-full px-3 py-2 bg-[#1f0b07] border border-[#dab38c]/30 rounded-xl text-white outline-none"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="font-semibold text-[#dab38c] block mb-1">Date *</label>
                  <input
                    type="date"
                    required
                    value={venueDate}
                    onChange={(e) => setVenueDate(e.target.value)}
                    className="w-full px-3 py-2 bg-[#1f0b07] border border-[#dab38c]/30 rounded-xl text-white"
                  />
                </div>
                <div>
                  <label className="font-semibold text-[#dab38c] block mb-1">Start Time *</label>
                  <input
                    type="time"
                    required
                    value={venueStartTime}
                    onChange={(e) => setVenueStartTime(e.target.value)}
                    className="w-full px-3 py-2 bg-[#1f0b07] border border-[#dab38c]/30 rounded-xl text-white"
                  />
                </div>
                <div>
                  <label className="font-semibold text-[#dab38c] block mb-1">End Time *</label>
                  <input
                    type="time"
                    required
                    value={venueEndTime}
                    onChange={(e) => setVenueEndTime(e.target.value)}
                    className="w-full px-3 py-2 bg-[#1f0b07] border border-[#dab38c]/30 rounded-xl text-white"
                  />
                </div>
              </div>

              <div>
                <label className="font-semibold text-[#dab38c] block mb-1">Seating Capacity (Max Guests) *</label>
                <input
                  type="number"
                  required
                  value={venueCapacity}
                  onChange={(e) => setVenueCapacity(e.target.value)}
                  className="w-full px-3 py-2 bg-[#1f0b07] border border-[#dab38c]/30 rounded-xl text-white"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddVenueOpen(false)}
                  className="px-4 py-2 text-[#dab38c] hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#e3a157] hover:bg-[#dab38c] text-[#29100b] font-bold rounded-xl shadow-md cursor-pointer"
                >
                  Save Seating Window
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
