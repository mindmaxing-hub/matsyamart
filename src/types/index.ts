export type ListingType = "experience" | "product";

export type BookingStatus =
  "pending_payment" | "confirmed" | "cancelled" | "refunded";

export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string | undefined;
  icon?: string | undefined;
  sort_order: number;
}

export interface ItineraryItem {
  time: string;
  title: string;
  description: string;
}

export interface Listing {
  id: string;
  title: string;
  slug: string;
  category_id?: string | undefined;
  type: ListingType;
  short_summary: string;
  full_description: string;
  price_inr: number;
  currency: string;
  images: string[];
  // Experience Specifics
  location_name?: string | undefined;
  secret_meeting_point?: string | undefined;
  duration_minutes?: number | undefined;
  included_items?: string[] | undefined;
  things_to_carry?: string[] | undefined;
  itinerary?: ItineraryItem[] | undefined;
  // Physical Product Specifics
  stock_count?: number | undefined;
  weight_grams?: number | undefined;
  artisan_collective?: string | undefined;
  // Meta
  is_active: boolean;
  is_featured: boolean;
  host_name: string;
  host_phone?: string | undefined;
  host_bio?: string | undefined;
  created_at?: string | undefined;
  updated_at?: string | undefined;
}

export interface ExperienceSlot {
  id: string;
  listing_id: string;
  slot_start: string; // ISO String
  slot_end: string; // ISO String
  capacity: number;
  booked_count: number;
  is_cancelled: boolean;
}

export interface AttendeeDetail {
  fullName: string;
  phone: string;
  email?: string | undefined;
}

export interface OrderItem {
  id: string;
  order_id: string;
  listing_id: string;
  slot_id?: string | undefined;
  quantity: number;
  unit_price_inr: number;
  attendee_details?: AttendeeDetail[] | undefined;
  listing?: Listing | undefined;
  slot?: ExperienceSlot | undefined;
}

export interface ShippingAddress {
  addressLine: string;
  landmark?: string | undefined;
  city: string;
  state: string;
  pincode: string;
}

export interface Order {
  id: string;
  order_ref: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  total_amount_inr: number;
  razorpay_order_id?: string | undefined;
  razorpay_payment_id?: string | undefined;
  status: BookingStatus;
  shipping_address?: ShippingAddress | undefined;
  emergency_contact?: string | undefined;
  payment_meta?: Record<string, unknown> | undefined;
  created_at: string;
  items: OrderItem[];
}

export interface CommunityVendorProposal {
  id: string;
  applicant_name: string;
  koliwada_or_village: string;
  phone: string;
  email?: string | undefined;
  proposal_title: string;
  proposal_type: ListingType;
  summary: string;
  estimated_price_inr?: number | undefined;
  sample_photos?: string[] | undefined;
  status: "pending_review" | "approved" | "rejected";
  admin_notes?: string | undefined;
  created_at: string;
}

export interface CartItem {
  listing: Listing;
  quantity: number;
  slot?: ExperienceSlot | undefined;
  attendeeDetails?: AttendeeDetail[] | undefined;
}
