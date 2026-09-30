export type ListingType = "experience" | "product";

export type PillarType = "walks" | "workshops" | "food" | "goods";

export type BookingStatus =
  "pending_payment" | "confirmed" | "cancelled" | "refunded";

export interface Category {
  id: string;
  name: string;
  slug: string;
  pillar?: PillarType | undefined;
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
  pillar?: PillarType | undefined;
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
  spotlight_order?: number | undefined;
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

export type FulfillmentStatus =
  "unfulfilled" | "processing" | "shipped" | "delivered";

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
  fulfillment_status?: FulfillmentStatus | undefined;
  courier_partner?: string | undefined;
  tracking_awb?: string | undefined;
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

export interface HostPayoutRecord {
  id: string;
  partner_name: string;
  role_type: "guide" | "artisan_collective";
  koliwada: string;
  upi_id: string;
  bank_account_mask: string;
  total_earned_inr: number;
  total_paid_inr: number;
  pending_balance_inr: number;
  last_payout_date?: string | undefined;
  utr_reference?: string | undefined;
  status: "pending" | "processing" | "disbursed";
}

export interface InventoryBatchItem {
  id: string;
  listing_id: string;
  lot_number: string;
  packaging_date: string;
  best_before_date: string;
  stock_units: number;
  min_threshold: number;
  unit_weight_grams: number;
  fssai_license_ref?: string | undefined;
}

export interface ZoneSafetyIncident {
  id: string;
  zone_name: string;
  status: "normal" | "caution" | "lockdown";
  swell_height_m: number;
  tide_phase: string;
  advisory_message: string;
  last_updated: string;
}

export interface RefundTicket {
  id: string;
  order_ref: string;
  customer_name: string;
  customer_phone: string;
  tour_or_item_name: string;
  booking_date: string;
  request_date: string;
  hours_before_tour: number;
  amount_paid_inr: number;
  cancellation_reason: string;
  eligibility: "full_refund" | "partial_or_credit" | "non_refundable";
  status: "requested" | "refunded" | "credit_voucher_issued" | "declined";
  razorpay_refund_id?: string | undefined;
  credit_voucher_code?: string | undefined;
  admin_notes?: string | undefined;
}
