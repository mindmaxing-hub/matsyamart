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
} from "../types";
import {
  SEED_CATEGORIES,
  SEED_LISTINGS,
  generateSeedSlots,
} from "../data/seedData";
import { generateOrderRef } from "../lib/utils";
import { supabase, isSupabaseConfigured } from "../lib/supabase";

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
}

interface DataContextType {
  listings: Listing[];
  categories: Category[];
  slots: ExperienceSlot[];
  orders: Order[];
  proposals: CommunityVendorProposal[];
  getListingBySlug: (slug: string) => Listing | undefined;
  getSlotsByListingId: (listingId: string) => ExperienceSlot[];
  getOrderByRef: (ref: string) => Order | undefined;
  createOrder: (input: CreateOrderInput) => Promise<Order>;
  addSlot: (
    slot: Omit<ExperienceSlot, "id" | "booked_count" | "is_cancelled">,
  ) => void;
  addRecurringWeekendSlots: (
    listingId: string,
    weeksCount: number,
    capacity: number,
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
}

const DataContext = createContext<DataContextType | undefined>(undefined);

const STORAGE_LISTINGS = "matsyamart_listings_v1";
const STORAGE_SLOTS = "matsyamart_slots_v1";
const STORAGE_ORDERS = "matsyamart_orders_v1";
const STORAGE_PROPOSALS = "matsyamart_proposals_v1";

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
      return [initialMockOrder];
    } catch {
      return [];
    }
  });

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

  // Optionally fetch from Supabase if configured
  useEffect(() => {
    if (!isSupabaseConfigured || !supabase) return;

    async function fetchFromSupabase() {
      try {
        const { data: remoteListings } = await supabase!
          .from("listings")
          .select("*");
        if (remoteListings && remoteListings.length > 0) {
          setListings(remoteListings);
        }

        const { data: remoteSlots } = await supabase!
          .from("experience_slots")
          .select("*");
        if (remoteSlots && remoteSlots.length > 0) {
          setSlots(remoteSlots);
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

  const createOrder = async (input: CreateOrderInput): Promise<Order> => {
    const isExperience = input.items.some(
      (i) => i.listing.type === "experience",
    );
    const orderRef = generateOrderRef(isExperience ? "EXP" : "PRD");

    const totalAmount = input.items.reduce(
      (sum, item) => sum + item.listing.price_inr * item.quantity,
      0,
    );

    const orderId = "ord-" + Math.random().toString(36).substring(2, 9);

    const orderItems: OrderItem[] = input.items.map((item, idx) => ({
      id: `item-${orderId}-${idx}`,
      order_id: orderId,
      listing_id: item.listing.id,
      slot_id: item.slotId,
      quantity: item.quantity,
      unit_price_inr: item.listing.price_inr,
      attendee_details: item.attendeeDetails || [],
      listing: item.listing,
      slot: item.slotId ? slots.find((s) => s.id === item.slotId) : undefined,
    }));

    const newOrder: Order = {
      id: orderId,
      order_ref: orderRef,
      customer_name: input.customerName,
      customer_email: input.customerEmail,
      customer_phone: input.customerPhone,
      total_amount_inr: totalAmount,
      razorpay_order_id: input.razorpayOrderId,
      razorpay_payment_id: input.razorpayPaymentId,
      status: "confirmed",
      shipping_address: input.shippingAddress,
      emergency_contact: input.emergencyContact,
      created_at: new Date().toISOString(),
      items: orderItems,
    };

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

    // If Supabase is active, persist to remote tables
    if (isSupabaseConfigured && supabase) {
      try {
        await supabase.from("orders").insert({
          id: orderId,
          order_ref: orderRef,
          customer_name: input.customerName,
          customer_email: input.customerEmail,
          customer_phone: input.customerPhone,
          total_amount_inr: totalAmount,
          razorpay_order_id: input.razorpayOrderId,
          razorpay_payment_id: input.razorpayPaymentId,
          status: "confirmed",
          shipping_address: input.shippingAddress,
          emergency_contact: input.emergencyContact,
        });

        for (const item of input.items) {
          if (item.slotId) {
            await supabase.rpc("book_experience_slot", {
              p_slot_id: item.slotId,
              p_seats: item.quantity,
            });
          }
        }
      } catch (err) {
        console.warn("Failed to sync order to Supabase", err);
      }
    }

    return newOrder;
  };

  const addSlot = (
    slotData: Omit<ExperienceSlot, "id" | "booked_count" | "is_cancelled">,
  ) => {
    const newSlot: ExperienceSlot = {
      id: "slot-" + Math.random().toString(36).substring(2, 9),
      booked_count: 0,
      is_cancelled: false,
      ...slotData,
    };
    setSlots((prev) => [...prev, newSlot]);
  };

  const addRecurringWeekendSlots = (
    listingId: string,
    weeksCount: number = 4,
    capacity: number = 14,
  ) => {
    const newSlots: ExperienceSlot[] = [];
    const now = new Date();

    for (let w = 0; w < weeksCount; w++) {
      for (const dayOffset of [6, 0]) {
        // Saturday & Sunday
        const date = new Date(now);
        date.setDate(
          now.getDate() + ((dayOffset + 7 - now.getDay()) % 7) + w * 7,
        );

        const start = new Date(date);
        start.setHours(6, 30, 0, 0);
        const end = new Date(date);
        end.setHours(9, 0, 0, 0);

        newSlots.push({
          id: `slot-rec-${listingId}-${w}-${dayOffset}`,
          listing_id: listingId,
          slot_start: start.toISOString(),
          slot_end: end.toISOString(),
          capacity,
          booked_count: 0,
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

  return (
    <DataContext.Provider
      value={{
        listings,
        categories,
        slots,
        orders,
        proposals,
        getListingBySlug,
        getSlotsByListingId,
        getOrderByRef,
        createOrder,
        addSlot,
        addRecurringWeekendSlots,
        toggleCancelSlot,
        addProposal,
        updateProposalStatus,
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
