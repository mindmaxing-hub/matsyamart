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
  meeting_point_maps_url?: string | undefined; // Generated from lat/lng
  latitude?: number | undefined;
  longitude?: number | undefined;
  duration_minutes?: number | undefined;
  included_items?: string[] | undefined;
  things_to_carry?: string[] | undefined;
  itinerary?: ItineraryItem[] | undefined;
  // Physical Product Specifics
  stock_count?: number | undefined;
  low_stock_threshold?: number | undefined;
  weight_grams?: number | undefined;
  artisan_collective?: string | undefined;
  // Food & Workshop Specifics
  dietary_tags?: string[] | undefined;
  materials_provided?: string[] | undefined;
  meal_type?: "breakfast" | "lunch" | "high_tea" | "dinner" | "snacks" | undefined;
  custom_tags?: string[] | undefined;
  // Meta
  is_active: boolean;
  is_featured: boolean;
  spotlight_order?: number | undefined;
  host_name: string;
  host_phone?: string | undefined;
  host_bio?: string | undefined;
  entity_name?: string | undefined;
  partner_id?: string | undefined;
  place_id?: string | undefined;
  created_at?: string | undefined;
  updated_at?: string | undefined;
}

/* =======================================================================
   CANONICAL NORMALIZED WORKSPACE ENTITIES
   ======================================================================= */

export type PinVisibilityType = "public" | "confirmed_guests_only";

export interface Partner {
  id: string;
  name: string;
  role_type?: "guide" | "cook" | "artisan" | "custodian" | undefined;
  entity_name?: string | undefined;
  phone: string;
  bio?: string | undefined;
  portrait_url?: string | undefined;
  is_verified: boolean;
  active?: boolean | undefined;
  created_at?: string | undefined;
  updated_at?: string | undefined;
}

export interface Place {
  id: string;
  name: string;
  address?: string | undefined;
  latitude: number; // Decimal range -90..90
  longitude: number; // Decimal range -180..180
  arrival_instructions?: string | undefined;
  pin_visibility: PinVisibilityType;
  photos: string[];
  meeting_point_maps_url?: string | undefined;
  created_at?: string | undefined;
  updated_at?: string | undefined;
}

export interface OfferingPlace {
  id: string;
  offering_id: string;
  place_id: string;
  created_at?: string | undefined;
}

export interface Session {
  id: string;
  offering_id?: string | undefined;
  listing_id: string; // Backward-compatible alias
  place_id?: string | undefined;
  slot_start: string; // ISO String
  slot_end: string; // ISO String
  capacity: number;
  booked_count: number;
  revision_number?: number | undefined;
  is_cancelled: boolean;
  created_at?: string | undefined;
  updated_at?: string | undefined;
}

// ExperienceSlot is backward-compatible alias for Session
export type ExperienceSlot = Session;

export interface ZoneSafetyIncident {
  id: string;
  zone_name: string;
  status: "normal" | "caution" | "lockdown";
  swell_height_m: number;
  tide_phase: string;
  advisory_message: string;
  last_updated: string;
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

export interface SessionHost {
  id: string;
  session_id: string;
  partner_id: string;
  host_user_id?: string | undefined;
  created_at?: string | undefined;
}

export interface AttendeeDetail {
  id?: string | undefined;
  fullName: string;
  phone: string;
  email?: string | undefined;
  checked_in?: boolean | undefined;
  check_in_time?: string | undefined;
  check_in_actor_id?: string | undefined;
  check_in_method?: string | undefined;
}

export interface BookingItem {
  id: string;
  order_id: string;
  offering_id: string;
  session_id?: string | undefined;
  quantity: number;
  unit_price_inr: number;
  discount_allocated_inr: number;
  net_revenue_inr: number;
  attendees?: AttendeeDetail[] | undefined;
  created_at?: string | undefined;
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

export interface AttendanceEvent {
  id: string;
  attendee_id: string;
  actor_id: string;
  event_type: "check_in" | "correction";
  method: "qr_camera" | "qr_upload" | "manual_ref" | "admin_override";
  notes?: string | undefined;
  recorded_at: string;
}

export type DispatchStatus =
  | "queued"
  | "sending"
  | "accepted"
  | "delivered"
  | "failed"
  | "externally_sent";

export interface DispatchJob {
  id: string;
  session_id: string;
  recipient_partner_id?: string | undefined;
  recipient_phone: string;
  language: "en" | "hi" | "mr";
  status: DispatchStatus;
  scheduled_for: string; // 18:00 IST previous day
  sent_at?: string | undefined;
  provider_ref?: string | undefined;
  attempt_count: number;
  notes?: string | undefined;
  created_at: string;
}

export type AgreementType =
  | "none"
  | "percent_net_item"
  | "fixed_unit"
  | "fixed_session"
  | "manual";

export interface PayoutAgreement {
  id: string;
  partner_id: string;
  offering_id?: string | undefined;
  agreement_type: AgreementType;
  rate_value: number;
  effective_from: string;
  created_at?: string | undefined;
}

export interface PayoutSettlement {
  id: string;
  partner_id: string;
  amount_inr: number;
  settlement_ref: string;
  transfer_date: string;
  status: "completed" | "processing" | "cancelled";
  notes?: string | undefined;
  created_at: string;
}

export interface PayoutAccrual {
  id: string;
  booking_item_id: string;
  partner_id: string;
  gross_allocated_inr: number;
  net_accrual_inr: number;
  settlement_id?: string | undefined;
  status: "accrued" | "settled" | "reversal";
  created_at: string;
}

export type LoyaltyStatus = "draft" | "active" | "paused";

export interface LoyaltyTierConfig {
  tierName: string;
  qualifyingSpendINR: number;
  earningRatePercent: number; // e.g. 5% back in points
  discountPercent?: number | undefined;
}

export interface LoyaltyProgramConfig {
  pointValueINR: number; // e.g. 1 point = ₹1
  maxRedemptionPercent: number; // e.g. max 50% of order payable in points
  eligiblePillars: PillarType[];
  expiryMonths: number;
  tiers: LoyaltyTierConfig[];
}

export interface LoyaltyProgram {
  id: string;
  status: LoyaltyStatus;
  rule_version: number;
  config: LoyaltyProgramConfig;
  created_at: string;
}

export interface LoyaltyMembership {
  id: string;
  user_id?: string | undefined;
  phone: string;
  name?: string | undefined;
  email?: string | undefined;
  current_tier: string;
  lifetime_spend_inr: number;
  spendable_points: number;
  pending_points: number;
  created_at: string;
  updated_at: string;
}

export type LoyaltyEventType =
  | "earn_pending"
  | "earn_confirmed"
  | "redemption_held"
  | "redemption_spent"
  | "reversal"
  | "manual_adjustment";

export interface LoyaltyLedgerEntry {
  id: string;
  membership_id: string;
  order_id?: string | undefined;
  points_delta: number;
  event_type: LoyaltyEventType;
  expiry_at?: string | undefined;
  rule_version: number;
  notes?: string | undefined;
  created_at: string;
}

export interface ShippingAddress {
  addressLine: string;
  landmark?: string | undefined;
  city: string;
  state: string;
  pincode: string;
}

export type FulfillmentStatus =
  | "unfulfilled"
  | "processing"
  | "shipped"
  | "delivered";

export interface Order {
  id: string;
  order_ref: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  total_amount_inr: number;
  coupon_code?: string | undefined;
  discount_amount_inr?: number | undefined;
  loyalty_points_redeemed?: number | undefined;
  loyalty_discount_inr?: number | undefined;
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
  role_type: "guide" | "artisan_collective" | "cook";
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

export interface Coupon {
  id: string;
  code: string;
  description?: string | undefined;
  discount_type: "percent" | "flat";
  discount_value: number;
  min_order_inr: number;
  applicable_pillars: PillarType[];
  max_uses?: number | undefined;
  used_count: number;
  expires_at?: string | undefined;
  is_active: boolean;
  created_at: string;
}

export type RoleLevel = "owner" | "admin" | "manager" | "coordinator" | "host";

export interface AdminUserRole {
  email: string;
  role: RoleLevel;
  assigned_pillars?: PillarType[] | undefined;
  assigned_event_ids?: string[] | undefined;
  created_at?: string | undefined;
}

export interface StockAlert {
  listingId: string;
  title: string;
  currentStock: number;
  threshold: number;
  severity: "warning" | "critical";
}
