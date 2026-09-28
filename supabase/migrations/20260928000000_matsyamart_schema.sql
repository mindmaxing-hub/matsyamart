-- ==============================================================================
-- MATSYAMART: BHOOMIPUTRA COASTAL EXPERIENCES & ARTISAN MARKETPLACE
-- Database Schema, Functions & Row-Level Security
-- Target Domain: matsyamart.com | Parent: bhoomiputra.org
-- ==============================================================================

-- 1. Custom Types
DO $$ BEGIN
    CREATE TYPE public.app_role AS ENUM ('super_admin', 'community_coordinator', 'vendor');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE public.listing_type AS ENUM ('experience', 'product');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE public.booking_status AS ENUM ('pending_payment', 'confirmed', 'cancelled', 'refunded');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 2. Categories Table
CREATE TABLE IF NOT EXISTS public.categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    description TEXT,
    icon TEXT,
    sort_order INT DEFAULT 10,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Listings Table
CREATE TABLE IF NOT EXISTS public.listings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    category_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
    type listing_type NOT NULL,
    short_summary TEXT NOT NULL,
    full_description TEXT NOT NULL,
    price_inr NUMERIC(10, 2) NOT NULL CHECK (price_inr >= 0),
    currency TEXT DEFAULT 'INR',
    images TEXT[] NOT NULL DEFAULT '{}',
    -- Experience specifics
    location_name TEXT,              -- Public: "Versova Koliwada, Andheri West"
    secret_meeting_point TEXT,       -- Hidden: Disclosed only in confirmed ticket
    duration_minutes INT,            -- e.g. 150 (2.5 hrs)
    included_items TEXT[],           -- e.g. ["Breakfast", "Safety Vests", "Local Guide"]
    things_to_carry TEXT[],          -- e.g. ["Slip-resistant shoes", "Water bottle"]
    itinerary JSONB DEFAULT '[]'::jsonb,
    -- Physical Product specifics
    stock_count INT DEFAULT NULL,
    weight_grams INT DEFAULT NULL,
    artisan_collective TEXT,         -- e.g. "Mahila Bachat Gat, Madh Island"
    is_active BOOLEAN DEFAULT TRUE,
    is_featured BOOLEAN DEFAULT FALSE,
    host_name TEXT NOT NULL,         -- e.g. "Devendra Koli & Versova Youth Collective"
    host_phone TEXT,
    host_bio TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Experience Slots Table
CREATE TABLE IF NOT EXISTS public.experience_slots (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    listing_id UUID NOT NULL REFERENCES public.listings(id) ON DELETE CASCADE,
    slot_start TIMESTAMPTZ NOT NULL,
    slot_end TIMESTAMPTZ NOT NULL,
    capacity INT NOT NULL DEFAULT 15,
    booked_count INT NOT NULL DEFAULT 0,
    is_cancelled BOOLEAN DEFAULT FALSE,
    CONSTRAINT check_capacity CHECK (booked_count <= capacity)
);

-- 5. Orders Table
CREATE TABLE IF NOT EXISTS public.orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_ref TEXT NOT NULL UNIQUE,   -- e.g. "MM-EXP-2026-0042"
    customer_name TEXT NOT NULL,
    customer_email TEXT NOT NULL,
    customer_phone TEXT NOT NULL,
    total_amount_inr NUMERIC(10, 2) NOT NULL,
    razorpay_order_id TEXT UNIQUE,
    razorpay_payment_id TEXT UNIQUE,
    status booking_status NOT NULL DEFAULT 'confirmed',
    shipping_address JSONB DEFAULT NULL,
    emergency_contact TEXT,
    payment_meta JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Order Items Table
CREATE TABLE IF NOT EXISTS public.order_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
    listing_id UUID NOT NULL REFERENCES public.listings(id),
    slot_id UUID REFERENCES public.experience_slots(id),
    quantity INT NOT NULL DEFAULT 1,
    unit_price_inr NUMERIC(10, 2) NOT NULL,
    attendee_details JSONB DEFAULT '[]'::jsonb
);

-- 7. Community Vendor Proposals (Self-listing submissions)
CREATE TABLE IF NOT EXISTS public.community_vendor_proposals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    applicant_name TEXT NOT NULL,
    koliwada_or_village TEXT NOT NULL,
    phone TEXT NOT NULL,
    email TEXT,
    proposal_title TEXT NOT NULL,
    proposal_type listing_type NOT NULL,
    summary TEXT NOT NULL,
    estimated_price_inr NUMERIC(10,2),
    sample_photos TEXT[] DEFAULT '{}',
    status TEXT DEFAULT 'pending_review',
    admin_notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. Atomic Concurrency-Safe Slot Reservation Function
CREATE OR REPLACE FUNCTION public.book_experience_slot(
    p_slot_id UUID,
    p_seats INT
) RETURNS BOOLEAN AS $$
DECLARE
    v_capacity INT;
    v_booked INT;
BEGIN
    SELECT capacity, booked_count INTO v_capacity, v_booked
    FROM public.experience_slots
    WHERE id = p_slot_id FOR UPDATE;

    IF NOT FOUND THEN
        RETURN FALSE;
    END IF;

    IF (v_booked + p_seats) <= v_capacity THEN
        UPDATE public.experience_slots
        SET booked_count = booked_count + p_seats
        WHERE id = p_slot_id;
        RETURN TRUE;
    ELSE
        RETURN FALSE;
    END IF;
END;
$$ LANGUAGE plpgsql;

-- 9. Row Level Security Policies
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.listings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.experience_slots ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.community_vendor_proposals ENABLE ROW LEVEL SECURITY;

-- Public Read Policies
DROP POLICY IF EXISTS "Public can view categories" ON public.categories;
CREATE POLICY "Public can view categories" ON public.categories FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public can view active listings" ON public.listings;
CREATE POLICY "Public can view active listings" ON public.listings FOR SELECT USING (is_active = true);

DROP POLICY IF EXISTS "Public can view uncancelled slots" ON public.experience_slots;
CREATE POLICY "Public can view uncancelled slots" ON public.experience_slots FOR SELECT USING (is_cancelled = false);

-- Order creation policies
DROP POLICY IF EXISTS "Anyone can insert orders" ON public.orders;
CREATE POLICY "Anyone can insert orders" ON public.orders FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Anyone can select orders by ref" ON public.orders;
CREATE POLICY "Anyone can select orders by ref" ON public.orders FOR SELECT USING (true);

DROP POLICY IF EXISTS "Anyone can insert order items" ON public.order_items;
CREATE POLICY "Anyone can insert order items" ON public.order_items FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Anyone can select order items" ON public.order_items;
CREATE POLICY "Anyone can select order items" ON public.order_items FOR SELECT USING (true);

DROP POLICY IF EXISTS "Anyone can insert proposals" ON public.community_vendor_proposals;
CREATE POLICY "Anyone can insert proposals" ON public.community_vendor_proposals FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Public can view proposals" ON public.community_vendor_proposals;
CREATE POLICY "Public can view proposals" ON public.community_vendor_proposals FOR SELECT USING (true);
