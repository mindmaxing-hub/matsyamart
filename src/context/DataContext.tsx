import React, { createContext, useContext, useState, useEffect } from "react";
import {
  Listing,
  Category,
  ExperienceSlot,
  Order,
  CommunityVendorProposal,
  OrderItem,
  ShippingAddress,
  AttendeeDetail,
  FulfillmentStatus,
  Coupon,
  StockAlert,
  Partner,
  Place,
  LoyaltyProgram,
  LoyaltyProgramConfig,
  LoyaltyStatus,
} from "../types";
import {
  SEED_CATEGORIES,
  SEED_LISTINGS,
  SEED_PARTNERS,
  SEED_PLACES,
  generateSeedSlots,
} from "../data/seedData";
import { generateOrderRef } from "../lib/utils";
import { supabase, isSupabaseConfigured } from "../lib/supabase";
import { DEFAULT_LOYALTY_CONFIG } from "../lib/services/loyalty";

interface CreateOrderInput {
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  items: {
    listing: Listing;
    quantity: number;
    slotId?: string | undefined;
    attendeeDetails?: AttendeeDetail[] | undefined;
  }[];
  shippingAddress?: ShippingAddress | undefined;
  emergencyContact?: string | undefined;
  razorpayPaymentId?: string | undefined;
  razorpayOrderId?: string | undefined;
  couponCode?: string | undefined;
  discountAmount?: number | undefined;
  pointsRedeemed?: number | undefined;
  pointsDiscountAmount?: number | undefined;
}

interface ValidateCouponResult {
  valid: boolean;
  coupon?: Coupon;
  discountAmount?: number;
  error?: string;
}

interface DataContextType {
  listings: Listing[];
  categories: Category[];
  slots: ExperienceSlot[];
  orders: Order[];
  proposals: CommunityVendorProposal[];
  coupons: Coupon[];
  partners: Partner[];
  places: Place[];
  loyaltyProgram: LoyaltyProgram;
  spotlightListingIds: string[];
  lowStockAlerts: StockAlert[];
  getListingBySlug: (slug: string) => Listing | undefined;
  getSlotsByListingId: (listingId: string) => ExperienceSlot[];
  getOrderByRef: (ref: string) => Order | undefined;
  addOrHydrateOrder: (order: Order) => void;
  createOrder: (input: CreateOrderInput) => Promise<Order>;
  addListing: (listing: Omit<Listing, "id">) => Listing;
  deleteListing: (id: string) => void;
  updateListing: (id: string, updates: Partial<Listing>) => void;
  restockListing: (id: string, additionalQuantity: number) => void;
  updateStockThreshold: (id: string, threshold: number) => void;
  addPartner: (partner: Omit<Partner, "id">) => Partner;
  updatePartner: (id: string, updates: Partial<Partner>) => void;
  deletePartner: (id: string) => void;
  addPlace: (place: Omit<Place, "id">) => Place;
  updatePlace: (id: string, updates: Partial<Place>) => void;
  deletePlace: (id: string) => void;
  addSlot: (
    slot: Omit<ExperienceSlot, "id" | "booked_count" | "is_cancelled" | "revision_number">,
  ) => void;
  addBatchSlots: (
    slots: Omit<ExperienceSlot, "id" | "booked_count" | "is_cancelled" | "revision_number">[],
  ) => void;
  deleteSlot: (slotId: string) => void;
  updateSessionRevision: (slotId: string, updates: Partial<ExperienceSlot>) => void;
  updateLoyaltyProgram: (config: LoyaltyProgramConfig, status?: LoyaltyStatus) => void;
  addRecurringWeekendSlots: (
    listingId: string,
    weeksCount?: number,
    capacity?: number,
    startTime?: string,
    endTime?: string,
    days?: ("saturday" | "sunday")[],
  ) => void;
  toggleCancelSlot: (slotId: string) => void;
  addProposal: (
    proposal: Omit<CommunityVendorProposal, "id" | "status" | "created_at">,
  ) => void;
  updateProposalStatus: (
    proposalId: string,
    status: "approved" | "rejected",
    notes?: string,
  ) => void;
  reorderSpotlight: (fromIndex: number, toIndex: number) => void;
  toggleSpotlight: (listingId: string) => void;
  setSpotlightListingIds: (ids: string[]) => void;
  updateOrderFulfillment: (
    orderId: string,
    status: FulfillmentStatus,
    courier?: string,
    awb?: string,
  ) => void;
  addCoupon: (
    coupon: Omit<Coupon, "id" | "used_count" | "created_at">,
  ) => void;
  deleteCoupon: (couponId: string) => void;
  toggleCouponStatus: (couponId: string) => void;
  validateCoupon: (
    code: string,
    cartItems: { listing: Listing; quantity: number }[],
  ) => ValidateCouponResult;
  updateAttendeeCheckIn: (
    orderId: string,
    itemId: string,
    attendeeIndex: number,
    checkedIn: boolean,
  ) => void;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

const STORAGE_LISTINGS = "matsyamart_listings_v2";
const STORAGE_SLOTS = "matsyamart_slots_v2";
const STORAGE_ORDERS = "matsyamart_orders_v1";
const STORAGE_PROPOSALS = "matsyamart_proposals_v1";
const STORAGE_SPOTLIGHT = "matsyamart_spotlight_v1";
const STORAGE_COUPONS = "matsyamart_coupons_v1";
const STORAGE_PARTNERS = "matsyamart_partners_v2";
const STORAGE_PLACES = "matsyamart_places_v2";
const STORAGE_LOYALTY = "matsyamart_loyalty_v2";

const SEED_COUPONS: Coupon[] = [
  {
    id: "coup-bhoomi-2025",
    code: "BHOOMI2025",
    description: "Bhoomiputra Foundation Member Discount (Food, Walks, Workshops)",
    discount_type: "percent",
    discount_value: 15,
    min_order_inr: 0,
    applicable_pillars: ["food", "walks", "workshops"],
    used_count: 3,
    is_active: true,
    created_at: new Date(Date.now() - 3600000 * 48).toISOString(),
  },
  {
    id: "coup-coastal-10",
    code: "COASTAL10",
    description: "Welcome Coastal Community Discount",
    discount_type: "percent",
    discount_value: 10,
    min_order_inr: 500,
    applicable_pillars: ["goods", "food", "walks", "workshops"],
    used_count: 8,
    is_active: true,
    created_at: new Date(Date.now() - 3600000 * 72).toISOString(),
  },
  {
    id: "coup-fish-100",
    code: "FISHFEAST100",
    description: "Special Flat ₹100 Off on Coastal Feasts",
    discount_type: "flat",
    discount_value: 100,
    min_order_inr: 1000,
    applicable_pillars: ["food"],
    used_count: 14,
    is_active: true,
    created_at: new Date(Date.now() - 3600000 * 96).toISOString(),
  },
];

export const DataProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [categories] = useState<Category[]>(SEED_CATEGORIES);

  const [listings, setListings] = useState<Listing[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_LISTINGS);
      return saved ? JSON.parse(saved) : SEED_LISTINGS;
    } catch {
      return SEED_LISTINGS;
    }
  });

  const [slots, setSlots] = useState<ExperienceSlot[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_SLOTS);
      return saved ? JSON.parse(saved) : generateSeedSlots();
    } catch {
      return generateSeedSlots();
    }
  });

  const [orders, setOrders] = useState<Order[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_ORDERS);
      if (saved) return JSON.parse(saved);

      // Initial mock confirmed order for instant manifest testing
      const initialMockOrder: Order = {
        id: "ord-seed-01",
        order_ref: "MM-EXP-2026-0042",
        customer_name: "Priya Deshmukh",
        customer_email: "priya.deshmukh@example.com",
        customer_phone: "+91 98200 11223",
        total_amount_inr: 1900,
        status: "confirmed",
        emergency_contact: "Ajay Deshmukh (+91 98200 44556)",
        razorpay_payment_id: "pay_sim_seed99281",
        created_at: new Date(Date.now() - 3600000 * 24).toISOString(),
        items: [
          {
            id: "item-seed-01",
            order_id: "ord-seed-01",
            listing_id: "exp-versova-trail",
            slot_id: "slot-versova-1",
            quantity: 2,
            unit_price_inr: 950,
            attendee_details: [
              {
                fullName: "Priya Deshmukh",
                phone: "+91 98200 11223",
                email: "priya.deshmukh@example.com",
              },
              { fullName: "Rohan Deshmukh", phone: "+91 98200 11224" },
            ],
            listing: SEED_LISTINGS[0]!,
          },
        ],
      };

      const initialMockProductOrder: Order = {
        id: "ord-seed-02",
        order_ref: "MM-PRD-2026-0089",
        customer_name: "Aditya Nair",
        customer_email: "aditya.nair@example.com",
        customer_phone: "+91 98199 44321",
        total_amount_inr: 1200,
        status: "confirmed",
        fulfillment_status: "processing",
        courier_partner: "Blue Dart Express",
        tracking_awb: "BD992817441IN",
        shipping_address: {
          addressLine: "Flat 402, Sea Breeze Apts, 14th Road, Khar West",
          landmark: "Near Khar Gymkhana",
          city: "Mumbai",
          state: "Maharashtra",
          pincode: "400052",
        },
        razorpay_payment_id: "pay_sim_seed99282",
        created_at: new Date(Date.now() - 3600000 * 12).toISOString(),
        items: [
          {
            id: "item-seed-02",
            order_id: "ord-seed-02",
            listing_id: "prd-jawla-basket",
            quantity: 1,
            unit_price_inr: 650,
            listing: SEED_LISTINGS.find((l) => l.id === "prd-jawla-basket"),
          },
          {
            id: "item-seed-03",
            order_id: "ord-seed-02",
            listing_id: "prd-mangrove-honey",
            quantity: 1,
            unit_price_inr: 550,
            listing: SEED_LISTINGS.find((l) => l.id === "prd-mangrove-honey"),
          },
        ],
      };

      return [initialMockOrder, initialMockProductOrder];
    } catch {
      return [];
    }
  });

  const DEFAULT_SPOTLIGHT_IDS = [
    "exp-seafood-thali-madh",
    "exp-net-weaving",
    "exp-sassoon-trail",
    "exp-thane-flamingo",
    "prd-mangrove-honey",
    "prd-jawla-basket",
    "exp-versova-trail",
  ];

  const [spotlightListingIds, setSpotlightListingIds] = useState<string[]>(
    () => {
      try {
        const saved = localStorage.getItem(STORAGE_SPOTLIGHT);
        if (saved) {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed) && parsed.length > 0) return parsed;
        }
        return DEFAULT_SPOTLIGHT_IDS;
      } catch {
        return DEFAULT_SPOTLIGHT_IDS;
      }
    },
  );

  const [proposals, setProposals] = useState<CommunityVendorProposal[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_PROPOSALS);
      if (saved) return JSON.parse(saved);

      const initialProposal: CommunityVendorProposal = {
        id: "prop-seed-01",
        applicant_name: "Suresh Nakawa",
        koliwada_or_village: "Mahim Koliwada",
        phone: "+91 98211 55667",
        email: "suresh.nakawa@example.com",
        proposal_title: "Night Crabbing & Lantern Fishing Safari",
        proposal_type: "experience",
        summary:
          "Walk the Mahim Bay rocky shallows during spring low-tide with brass lanterns and hand-nets to catch Mud Crabs and Stone Lobsters.",
        estimated_price_inr: 1100,
        sample_photos: [
          "https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&w=800&q=80",
        ],
        status: "pending_review",
        admin_notes: "Community elder verified. Needs safety gear check.",
        created_at: new Date(Date.now() - 3600000 * 48).toISOString(),
      };
      return [initialProposal];
    } catch {
      return [];
    }
  });

  // Sync to local storage
  useEffect(() => {
    localStorage.setItem(STORAGE_LISTINGS, JSON.stringify(listings));
  }, [listings]);

  useEffect(() => {
    localStorage.setItem(STORAGE_SLOTS, JSON.stringify(slots));
  }, [slots]);

  useEffect(() => {
    localStorage.setItem(STORAGE_ORDERS, JSON.stringify(orders));
  }, [orders]);

  useEffect(() => {
    localStorage.setItem(STORAGE_PROPOSALS, JSON.stringify(proposals));
  }, [proposals]);

  useEffect(() => {
    localStorage.setItem(
      STORAGE_SPOTLIGHT,
      JSON.stringify(spotlightListingIds),
    );
  }, [spotlightListingIds]);

  const [coupons, setCoupons] = useState<Coupon[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_COUPONS);
      if (saved) return JSON.parse(saved);
      return SEED_COUPONS;
    } catch {
      return SEED_COUPONS;
    }
  });

  const [partners, setPartners] = useState<Partner[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_PARTNERS);
      return saved ? JSON.parse(saved) : SEED_PARTNERS;
    } catch {
      return SEED_PARTNERS;
    }
  });

  const [places, setPlaces] = useState<Place[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_PLACES);
      return saved ? JSON.parse(saved) : SEED_PLACES;
    } catch {
      return SEED_PLACES;
    }
  });

  const [loyaltyProgram, setLoyaltyProgram] = useState<LoyaltyProgram>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_LOYALTY);
      return saved
        ? JSON.parse(saved)
        : {
            id: "prog-default",
            status: "active" as const,
            rule_version: 1,
            config: DEFAULT_LOYALTY_CONFIG,
            created_at: new Date().toISOString(),
          };
    } catch {
      return {
        id: "prog-default",
        status: "active" as const,
        rule_version: 1,
        config: DEFAULT_LOYALTY_CONFIG,
        created_at: new Date().toISOString(),
      };
    }
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_COUPONS, JSON.stringify(coupons));
  }, [coupons]);

  useEffect(() => {
    localStorage.setItem(STORAGE_PARTNERS, JSON.stringify(partners));
  }, [partners]);

  useEffect(() => {
    localStorage.setItem(STORAGE_PLACES, JSON.stringify(places));
  }, [places]);

  useEffect(() => {
    localStorage.setItem(STORAGE_LOYALTY, JSON.stringify(loyaltyProgram));
  }, [loyaltyProgram]);

  // Optionally fetch from Supabase if configured
  useEffect(() => {
    if (!isSupabaseConfigured || !supabase) return;

    async function fetchFromSupabase() {
      try {
        const { data: remoteListings } = await supabase!
          .from("listings")
          .select("*");
        if (remoteListings && remoteListings.length > 0) {
          // Merge: remote listings take precedence by ID, but all canonical seed listings are preserved
          setListings((prevListings) => {
            const remoteMap = new Map(remoteListings.map((l: Listing) => [l.id, l]));
            const merged = [...remoteListings];
            for (const seed of SEED_LISTINGS) {
              if (!remoteMap.has(seed.id)) {
                merged.push(seed);
              }
            }
            return merged;
          });
        }

        const { data: remoteSlots } = await supabase!
          .from("experience_slots")
          .select("*");
        if (remoteSlots && remoteSlots.length > 0) {
          setSlots((prevSlots) => {
            const remoteSlotMap = new Map(remoteSlots.map((s: ExperienceSlot) => [s.id, s]));
            const merged = [...remoteSlots];
            for (const seedSlot of generateSeedSlots()) {
              if (!remoteSlotMap.has(seedSlot.id)) {
                merged.push(seedSlot);
              }
            }
            return merged;
          });
        }
      } catch (err) {
        console.warn("Supabase fetch failed; relying on local seed data", err);
      }
    }

    fetchFromSupabase();
  }, []);

  const getListingBySlug = (slug: string) => {
    return listings.find((l) => l.slug === slug);
  };

  const getSlotsByListingId = (listingId: string) => {
    return slots.filter((s) => s.listing_id === listingId && !s.is_cancelled);
  };

  const getOrderByRef = (ref: string) => {
    return orders.find((o) => o.order_ref.toLowerCase() === ref.toLowerCase());
  };

  const addOrHydrateOrder = (incomingOrder: Order) => {
    setOrders((prev) => {
      const exists = prev.some(
        (o) =>
          o.order_ref.toLowerCase() === incomingOrder.order_ref.toLowerCase() ||
          o.id === incomingOrder.id,
      );
      if (exists) {
        return prev.map((o) =>
          o.order_ref.toLowerCase() === incomingOrder.order_ref.toLowerCase() ||
          o.id === incomingOrder.id
            ? { ...o, ...incomingOrder }
            : o,
        );
      }
      return [incomingOrder, ...prev];
    });
  };

  const createOrder = async (input: CreateOrderInput): Promise<Order> => {
    const isExperience = input.items.some(
      (i) => i.listing.type === "experience",
    );
    const orderRef = generateOrderRef(isExperience ? "EXP" : "PRD");

    const subtotalAmount = input.items.reduce(
      (sum, item) => sum + item.listing.price_inr * item.quantity,
      0,
    );

    const discountAmount = Math.min(subtotalAmount, input.discountAmount || 0);
    const finalTotalAmount = Math.max(0, subtotalAmount - discountAmount);

    const orderId =
      typeof crypto !== "undefined" && crypto.randomUUID
        ? crypto.randomUUID()
        : "ord-" + Math.random().toString(36).substring(2, 9);

    const orderItems: OrderItem[] = input.items.map((item, idx) => {
      const itemId =
        typeof crypto !== "undefined" && crypto.randomUUID
          ? crypto.randomUUID()
          : `item-${orderId}-${idx}`;
      return {
        id: itemId,
        order_id: orderId,
        listing_id: item.listing.id,
        slot_id: item.slotId,
        quantity: item.quantity,
        unit_price_inr: item.listing.price_inr,
        attendee_details: item.attendeeDetails || [],
        listing: item.listing,
        slot: item.slotId ? slots.find((s) => s.id === item.slotId) : undefined,
      };
    });

    const newOrder: Order = {
      id: orderId,
      order_ref: orderRef,
      customer_name: input.customerName,
      customer_email: input.customerEmail,
      customer_phone: input.customerPhone,
      total_amount_inr: finalTotalAmount,
      coupon_code: input.couponCode || undefined,
      discount_amount_inr: discountAmount > 0 ? discountAmount : undefined,
      loyalty_points_redeemed: input.pointsRedeemed,
      loyalty_discount_inr: input.pointsDiscountAmount,
      razorpay_order_id: input.razorpayOrderId,
      razorpay_payment_id: input.razorpayPaymentId,
      status: "confirmed",
      fulfillment_status: isExperience ? undefined : "unfulfilled",
      shipping_address: input.shippingAddress,
      emergency_contact: input.emergencyContact,
      created_at: new Date().toISOString(),
      items: orderItems,
    };

    // Increment coupon used_count if a coupon was used
    if (input.couponCode) {
      setCoupons((prev) =>
        prev.map((c) =>
          c.code.toUpperCase() === input.couponCode?.toUpperCase()
            ? { ...c, used_count: c.used_count + 1 }
            : c,
        ),
      );
    }

    // Atomically increment booked_count on slots
    setSlots((prev) =>
      prev.map((slot) => {
        const matchingItem = input.items.find((i) => i.slotId === slot.id);
        if (matchingItem) {
          return {
            ...slot,
            booked_count: Math.min(
              slot.capacity,
              slot.booked_count + matchingItem.quantity,
            ),
          };
        }
        return slot;
      }),
    );

    // Save order
    setOrders((prev) => [newOrder, ...prev]);

    // If Supabase is active, persist to remote tables with full relational schema
    if (isSupabaseConfigured && supabase) {
      try {
        const { error: orderError } = await supabase.from("orders").insert({
          id: orderId,
          order_ref: orderRef,
          customer_name: input.customerName,
          customer_email: input.customerEmail,
          customer_phone: input.customerPhone,
          total_amount_inr: finalTotalAmount,
          coupon_code: input.couponCode,
          discount_amount_inr: discountAmount,
          razorpay_order_id: input.razorpayOrderId,
          razorpay_payment_id: input.razorpayPaymentId,
          status: "confirmed",
          shipping_address: input.shippingAddress,
          emergency_contact: input.emergencyContact,
        });

        if (orderError) {
          console.error("Supabase order insert error:", orderError);
        }

        for (const item of orderItems) {
          await supabase.from("booking_items").insert({
            id: item.id,
            order_id: orderId,
            offering_id: item.listing_id,
            session_id: item.slot_id || null,
            quantity: item.quantity,
            unit_price_inr: item.unit_price_inr,
            discount_allocated_inr: 0,
            net_revenue_inr: item.unit_price_inr * item.quantity,
          });

          if (item.slot_id) {
            await supabase.rpc("book_experience_slot", {
              p_slot_id: item.slot_id,
              p_seats: item.quantity,
            });
          }

          if (item.attendee_details && item.attendee_details.length > 0) {
            for (const att of item.attendee_details) {
              await supabase.from("attendees").insert({
                booking_item_id: item.id,
                session_id: item.slot_id || null,
                full_name: att.fullName,
                phone: att.phone,
                email: att.email || null,
                checked_in: Boolean(att.checked_in),
              });
            }
          }
        }
      } catch (err) {
        console.error("Failed to sync order transaction to Supabase:", err);
      }
    }

    return newOrder;
  };

  const addPartner = (partnerData: Omit<Partner, "id">): Partner => {
    const id =
      typeof crypto !== "undefined" && crypto.randomUUID
        ? crypto.randomUUID()
        : "part-" + Math.random().toString(36).substring(2, 9);
    const newPartner: Partner = {
      id,
      ...partnerData,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    setPartners((prev) => [newPartner, ...prev]);
    return newPartner;
  };

  const updatePartner = (id: string, updates: Partial<Partner>) => {
    setPartners((prev) =>
      prev.map((p) =>
        p.id === id ? { ...p, ...updates, updated_at: new Date().toISOString() } : p,
      ),
    );
  };

  const deletePartner = (id: string) => {
    setPartners((prev) => prev.filter((p) => p.id !== id));
  };

  const addPlace = (placeData: Omit<Place, "id">): Place => {
    const id =
      typeof crypto !== "undefined" && crypto.randomUUID
        ? crypto.randomUUID()
        : "place-" + Math.random().toString(36).substring(2, 9);
    const newPlace: Place = {
      id,
      ...placeData,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    setPlaces((prev) => [newPlace, ...prev]);
    return newPlace;
  };

  const updatePlace = (id: string, updates: Partial<Place>) => {
    setPlaces((prev) =>
      prev.map((p) =>
        p.id === id ? { ...p, ...updates, updated_at: new Date().toISOString() } : p,
      ),
    );
  };

  const deletePlace = (id: string) => {
    setPlaces((prev) => prev.filter((p) => p.id !== id));
  };

  const updateSessionRevision = (
    slotId: string,
    updates: Partial<ExperienceSlot>,
  ) => {
    setSlots((prev) =>
      prev.map((s) =>
        s.id === slotId
          ? {
              ...s,
              ...updates,
              revision_number: (s.revision_number || 1) + 1,
              updated_at: new Date().toISOString(),
            }
          : s,
      ),
    );
  };

  const updateLoyaltyProgram = (
    config: LoyaltyProgramConfig,
    status?: LoyaltyStatus,
  ) => {
    setLoyaltyProgram((prev) => ({
      ...prev,
      status: status !== undefined ? status : prev.status,
      rule_version: prev.rule_version + 1,
      config,
    }));
  };

  const addSlot = (
    slotData: Omit<ExperienceSlot, "id" | "booked_count" | "is_cancelled" | "revision_number">,
  ) => {
    const id =
      typeof crypto !== "undefined" && crypto.randomUUID
        ? crypto.randomUUID()
        : "slot-" + Math.random().toString(36).substring(2, 9);
    const offeringId = (slotData as any).offering_id || (slotData as any).listing_id || "";
    const listingId = (slotData as any).listing_id || offeringId;
    const newSlot: ExperienceSlot = {
      ...slotData,
      id,
      offering_id: offeringId,
      listing_id: listingId,
      booked_count: 0,
      revision_number: 1,
      is_cancelled: false,
    };
    setSlots((prev) => [...prev, newSlot]);
  };

  const addBatchSlots = (
    newSlotsData: Omit<ExperienceSlot, "id" | "booked_count" | "is_cancelled" | "revision_number">[],
  ) => {
    if (!newSlotsData || newSlotsData.length === 0) return;
    const createdSlots: ExperienceSlot[] = newSlotsData.map((slotData, idx) => {
      const id =
        typeof crypto !== "undefined" && crypto.randomUUID
          ? crypto.randomUUID()
          : "slot-" + Math.random().toString(36).substring(2, 9) + "-" + idx;
      const offeringId = (slotData as any).offering_id || (slotData as any).listing_id || "";
      const listingId = (slotData as any).listing_id || offeringId;
      return {
        ...slotData,
        id,
        offering_id: offeringId,
        listing_id: listingId,
        booked_count: 0,
        revision_number: 1,
        is_cancelled: false,
      };
    });
    setSlots((prev) => [...prev, ...createdSlots]);
  };

  const deleteSlot = (slotId: string) => {
    setSlots((prev) => prev.filter((s) => s.id !== slotId));
  };

  const addRecurringWeekendSlots = (
    listingId: string,
    weeksCount: number = 4,
    capacity: number = 14,
    startTime: string = "06:30",
    endTime: string = "09:00",
    days: ("saturday" | "sunday")[] = ["saturday", "sunday"],
  ) => {
    const newSlots: ExperienceSlot[] = [];
    const now = new Date();

    const [startH, startM] = startTime.split(":").map(Number);
    const [endH, endM] = endTime.split(":").map(Number);

    const dayMap: Record<string, number> = {
      sunday: 0,
      saturday: 6,
    };

    const targetDayOffsets = (days || ["saturday", "sunday"])
      .map((d) => dayMap[d])
      .filter((d) => d !== undefined);

    if (targetDayOffsets.length === 0) {
      targetDayOffsets.push(6, 0);
    }

    for (let w = 0; w < weeksCount; w++) {
      for (const dayOffset of targetDayOffsets) {
        const date = new Date(now);
        let diff = (dayOffset - now.getDay() + 7) % 7;
        if (diff === 0 && w === 0) {
          const testStart = new Date(now);
          testStart.setHours(startH ?? 6, startM ?? 30, 0, 0);
          if (now.getTime() >= testStart.getTime()) {
            diff = 7;
          }
        }
        date.setDate(now.getDate() + diff + w * 7);

        const start = new Date(date);
        start.setHours(startH ?? 6, startM ?? 30, 0, 0);
        const end = new Date(date);
        end.setHours(endH ?? 9, endM ?? 0, 0, 0);

        newSlots.push({
          id: `slot-rec-${listingId}-${w}-${dayOffset}-${Date.now().toString().slice(-4)}`,
          offering_id: listingId,
          listing_id: listingId,
          slot_start: start.toISOString(),
          slot_end: end.toISOString(),
          capacity,
          booked_count: 0,
          revision_number: 1,
          is_cancelled: false,
        });
      }
    }

    setSlots((prev) => [...prev, ...newSlots]);
  };

  const toggleCancelSlot = (slotId: string) => {
    setSlots((prev) =>
      prev.map((s) =>
        s.id === slotId ? { ...s, is_cancelled: !s.is_cancelled } : s,
      ),
    );
  };

  const addProposal = (
    propData: Omit<CommunityVendorProposal, "id" | "status" | "created_at">,
  ) => {
    const newProp: CommunityVendorProposal = {
      id: "prop-" + Math.random().toString(36).substring(2, 9),
      status: "pending_review",
      created_at: new Date().toISOString(),
      ...propData,
    };
    setProposals((prev) => [newProp, ...prev]);

    if (isSupabaseConfigured && supabase) {
      Promise.resolve(
        supabase.from("community_vendor_proposals").insert(newProp),
      ).catch(console.warn);
    }
  };

  const updateProposalStatus = (
    proposalId: string,
    status: "approved" | "rejected",
    notes?: string,
  ) => {
    setProposals((prev) =>
      prev.map((p) =>
        p.id === proposalId
          ? {
              ...p,
              status,
              admin_notes: notes !== undefined ? notes : p.admin_notes,
            }
          : p,
      ),
    );
  };

  const reorderSpotlight = (fromIndex: number, toIndex: number) => {
    setSpotlightListingIds((prev) => {
      if (
        fromIndex < 0 ||
        fromIndex >= prev.length ||
        toIndex < 0 ||
        toIndex >= prev.length
      ) {
        return prev;
      }
      const updated = [...prev];
      const [moved] = updated.splice(fromIndex, 1);
      if (moved) {
        updated.splice(toIndex, 0, moved);
      }
      return updated;
    });
  };

  const toggleSpotlight = (listingId: string) => {
    setSpotlightListingIds((prev) => {
      if (prev.includes(listingId)) {
        return prev.filter((id) => id !== listingId);
      } else {
        return [...prev, listingId];
      }
    });
  };

  const updateOrderFulfillment = (
    orderId: string,
    status: FulfillmentStatus,
    courier?: string,
    awb?: string,
  ) => {
    setOrders((prev) =>
      prev.map((order) => {
        if (order.id !== orderId) return order;
        return {
          ...order,
          fulfillment_status: status,
          courier_partner:
            courier !== undefined ? courier : order.courier_partner,
          tracking_awb: awb !== undefined ? awb : order.tracking_awb,
        };
      }),
    );
  };

  const addCoupon = (
    couponData: Omit<Coupon, "id" | "used_count" | "created_at">,
  ) => {
    const newCoupon: Coupon = {
      id: "coup-" + Math.random().toString(36).substring(2, 9),
      used_count: 0,
      created_at: new Date().toISOString(),
      ...couponData,
      code: couponData.code.trim().toUpperCase(),
    };
    setCoupons((prev) => [newCoupon, ...prev]);
  };

  const deleteCoupon = (couponId: string) => {
    setCoupons((prev) => prev.filter((c) => c.id !== couponId));
  };

  const toggleCouponStatus = (couponId: string) => {
    setCoupons((prev) =>
      prev.map((c) => (c.id === couponId ? { ...c, is_active: !c.is_active } : c)),
    );
  };

  const validateCoupon = (
    rawCode: string,
    cartItems: { listing: Listing; quantity: number }[],
  ): ValidateCouponResult => {
    const code = rawCode.trim().toUpperCase();
    if (!code) {
      return { valid: false, error: "Please enter a coupon code." };
    }

    const coupon = coupons.find((c) => c.code.toUpperCase() === code);
    if (!coupon) {
      return { valid: false, error: "Invalid coupon code." };
    }

    if (!coupon.is_active) {
      return { valid: false, error: "This coupon is no longer active." };
    }

    if (coupon.expires_at && new Date(coupon.expires_at) < new Date()) {
      return { valid: false, error: "This coupon has expired." };
    }

    if (coupon.max_uses && coupon.used_count >= coupon.max_uses) {
      return { valid: false, error: "This coupon has reached its usage limit." };
    }

    // Check eligible items based on applicable_pillars
    const eligibleItems = cartItems.filter((i) =>
      i.listing.pillar
        ? coupon.applicable_pillars.includes(i.listing.pillar)
        : false,
    );

    if (eligibleItems.length === 0) {
      return {
        valid: false,
        error: `Coupon applies only to ${coupon.applicable_pillars.join(", ")}. None found in your cart.`,
      };
    }

    const eligibleTotal = eligibleItems.reduce(
      (sum, i) => sum + i.listing.price_inr * i.quantity,
      0,
    );

    const cartTotal = cartItems.reduce(
      (sum, i) => sum + i.listing.price_inr * i.quantity,
      0,
    );

    if (cartTotal < coupon.min_order_inr) {
      return {
        valid: false,
        error: `Minimum order amount of ₹${coupon.min_order_inr} required.`,
      };
    }

    let discountAmount = 0;
    if (coupon.discount_type === "percent") {
      discountAmount = Math.round(
        (eligibleTotal * coupon.discount_value) / 100,
      );
    } else {
      discountAmount = Math.min(coupon.discount_value, eligibleTotal);
    }

    return {
      valid: true,
      coupon,
      discountAmount,
    };
  };

  const updateAttendeeCheckIn = (
    orderId: string,
    itemId: string,
    attendeeIndex: number,
    checkedIn: boolean,
  ) => {
    setOrders((prev) =>
      prev.map((order) => {
        if (order.id !== orderId) return order;
        const updatedItems = order.items.map((item) => {
          if (item.id !== itemId) return item;
          const currentAttendees = [...(item.attendee_details || [])];
          // Defensive guard: Ensure attendee array has entries up to item.quantity
          while (currentAttendees.length < item.quantity) {
            const seatNum = currentAttendees.length + 1;
            currentAttendees.push({
              fullName: seatNum === 1 ? order.customer_name : `Guest ${seatNum}`,
              phone: seatNum === 1 ? order.customer_phone : (order.customer_phone || ""),
              checked_in: false,
            });
          }
          if (currentAttendees[attendeeIndex]) {
            currentAttendees[attendeeIndex] = {
              ...currentAttendees[attendeeIndex]!,
              checked_in: checkedIn,
              check_in_time: checkedIn ? new Date().toISOString() : undefined,
            };
          }
          return {
            ...item,
            attendee_details: currentAttendees,
          };
        });
        return {
          ...order,
          items: updatedItems,
        };
      }),
    );
  };

  // Derived Low-Stock Alerts for Goods Inventory
  const lowStockAlerts: StockAlert[] = listings
    .filter((l) => l.type === "product" && typeof l.stock_count === "number")
    .filter((l) => {
      const threshold = l.low_stock_threshold ?? 5;
      return (l.stock_count ?? 0) <= threshold;
    })
    .map((l) => {
      const threshold = l.low_stock_threshold ?? 5;
      const count = l.stock_count ?? 0;
      return {
        listingId: l.id,
        title: l.title,
        currentStock: count,
        threshold,
        severity: count === 0 ? ("critical" as const) : ("warning" as const),
      };
    });

  const addListing = (newListingData: Omit<Listing, "id">): Listing => {
    const prefix =
      newListingData.type === "experience"
        ? newListingData.pillar
          ? `exp-${newListingData.pillar}`
          : "exp"
        : "prod";
    const newListing: Listing = {
      ...newListingData,
      id: `${prefix}-${Date.now()}`,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    setListings((prev) => [newListing, ...prev]);

    if (isSupabaseConfigured && supabase) {
      Promise.resolve(supabase.from("listings").insert(newListing))
        .then(({ error }) => {
          if (error) console.warn("Supabase addListing sync failed:", error);
        })
        .catch((err: unknown) => console.warn("Supabase addListing exception:", err));
    }

    return newListing;
  };

  const deleteListing = (id: string) => {
    setListings((prev) => prev.filter((l) => l.id !== id));
    setSlots((prev) => prev.filter((s) => s.listing_id !== id));

    if (isSupabaseConfigured && supabase) {
      Promise.resolve(supabase.from("listings").delete().eq("id", id))
        .then(({ error }) => {
          if (error) console.warn("Supabase deleteListing sync failed:", error);
        })
        .catch((err: unknown) => console.warn("Supabase deleteListing exception:", err));
    }
  };

  const updateListing = (id: string, updates: Partial<Listing>) => {
    setListings((prev) =>
      prev.map((l) =>
        l.id === id
          ? { ...l, ...updates, updated_at: new Date().toISOString() }
          : l,
      ),
    );

    if (isSupabaseConfigured && supabase) {
      Promise.resolve(supabase.from("listings").update(updates).eq("id", id))
        .then(({ error }) => {
          if (error) console.warn("Supabase updateListing sync failed:", error);
        })
        .catch((err: unknown) => console.warn("Supabase updateListing exception:", err));
    }
  };

  const restockListing = (id: string, additionalQuantity: number) => {
    setListings((prev) =>
      prev.map((l) =>
        l.id === id
          ? {
              ...l,
              stock_count: Math.max(0, (l.stock_count ?? 0) + additionalQuantity),
              updated_at: new Date().toISOString(),
            }
          : l,
      ),
    );
  };

  const updateStockThreshold = (id: string, threshold: number) => {
    setListings((prev) =>
      prev.map((l) =>
        l.id === id
          ? {
              ...l,
              low_stock_threshold: Math.max(0, threshold),
              updated_at: new Date().toISOString(),
            }
          : l,
      ),
    );
  };

  return (
    <DataContext.Provider
      value={{
        listings,
        categories,
        slots,
        orders,
        proposals,
        coupons,
        partners,
        places,
        loyaltyProgram,
        spotlightListingIds,
        lowStockAlerts,
        getListingBySlug,
        getSlotsByListingId,
        getOrderByRef,
        addOrHydrateOrder,
        createOrder,
        addListing,
        deleteListing,
        updateListing,
        restockListing,
        updateStockThreshold,
        addPartner,
        updatePartner,
        deletePartner,
        addPlace,
        updatePlace,
        deletePlace,
        addSlot,
        addBatchSlots,
        deleteSlot,
        updateSessionRevision,
        updateLoyaltyProgram,
        addRecurringWeekendSlots,
        toggleCancelSlot,
        addProposal,
        updateProposalStatus,
        reorderSpotlight,
        toggleSpotlight,
        setSpotlightListingIds,
        updateOrderFulfillment,
        addCoupon,
        deleteCoupon,
        toggleCouponStatus,
        validateCoupon,
        updateAttendeeCheckIn,
      }}
    >
      {children}
    </DataContext.Provider>
  );
};

export const useData = () => {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error("useData must be used within a DataProvider");
  }
  return context;
};
