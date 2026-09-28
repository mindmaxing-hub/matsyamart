export type ListingType = 'experience' | 'product';

export type BookingStatus = 'pending_payment' | 'confirmed' | 'cancelled' | 'refunded';

export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  icon?: string;
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
  category_id?: string;
  type: ListingType;
  short_summary: string;
  full_description: string;
  price_inr: number;
  currency: string;
  images: string[];
  // Experience Specifics
  location_name?: string;
  secret_meeting_point?: string;
  duration_minutes?: number;
  included_items?: string[];
  things_to_carry?: string[];
  itinerary?: ItineraryItem[];
  // Physical Product Specifics
  stock_count?: number;
  weight_grams?: number;
  artisan_collective?: string;
  // Meta
  is_active: boolean;
  is_featured: boolean;
  host_name: string;
  host_phone?: string;
  host_bio?: string;
  created_at?: string;
  updated_at?: string;
}

export interface ExperienceSlot {
  id: string;
  listing_id: string;
  slot_start: string; // ISO String
  slot_end: string;   // ISO String
  capacity: number;
  booked_count: number;
  is_cancelled: boolean;
}

export interface AttendeeDetail {
  fullName: string;
  phone: string;
  email?: string;
}

export interface OrderItem {
  id: string;
  order_id: string;
  listing_id: string;
  slot_id?: string;
  quantity: number;
  unit_price_inr: number;
  attendee_details?: AttendeeDetail[];
  listing?: Listing;
  slot?: ExperienceSlot;
}

export interface ShippingAddress {
  addressLine: string;
  landmark?: string;
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
  razorpay_order_id?: string;
  razorpay_payment_id?: string;
  status: BookingStatus;
  shipping_address?: ShippingAddress;
  emergency_contact?: string;
  payment_meta?: Record<string, unknown>;
  created_at: string;
  items: OrderItem[];
}

export interface CommunityVendorProposal {
  id: string;
  applicant_name: string;
  koliwada_or_village: string;
  phone: string;
  email?: string;
  proposal_title: string;
  proposal_type: ListingType;
  summary: string;
  estimated_price_inr?: number;
  sample_photos?: string[];
  status: 'pending_review' | 'approved' | 'rejected';
  admin_notes?: string;
  created_at: string;
}

export interface CartItem {
  listing: Listing;
  quantity: number;
  slot?: ExperienceSlot;
  attendeeDetails?: AttendeeDetail[];
}
