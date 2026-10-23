-- ==============================================================================
-- MATSYAMART CANONICAL OPERATIONS, SECURITY & LOYALTY UPGRADE
-- Migration: 20261023000000_upgrade_canonical_matsyamart.sql
-- ==============================================================================

-- 1. Create Enums
DO $$ BEGIN
    CREATE TYPE public.staff_role AS ENUM ('owner', 'manager', 'coordinator', 'host');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE public.pin_visibility_type AS ENUM ('public', 'confirmed_guests_only');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE public.dispatch_status AS ENUM ('queued', 'sending', 'accepted', 'delivered', 'failed', 'externally_sent');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE public.agreement_type AS ENUM ('none', 'percent_net_item', 'fixed_unit', 'fixed_session', 'manual');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE public.loyalty_status AS ENUM ('draft', 'active', 'paused');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE public.loyalty_event_type AS ENUM ('earn_pending', 'earn_confirmed', 'redemption_held', 'redemption_spent', 'reversal', 'manual_adjustment');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 2. Staff Memberships & Workspace Grants (Protected RBAC)
CREATE TABLE IF NOT EXISTS public.staff_memberships (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    role staff_role NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_staff_user UNIQUE (user_id)
);

CREATE TABLE IF NOT EXISTS public.workspace_grants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    staff_membership_id UUID NOT NULL REFERENCES public.staff_memberships(id) ON DELETE CASCADE,
    pillar TEXT NOT NULL CHECK (pillar IN ('food', 'walks', 'workshops', 'goods')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_staff_pillar UNIQUE (staff_membership_id, pillar)
);

-- 3. Partners (Reusable Hosts, Artisans, Collectives)
CREATE TABLE IF NOT EXISTS public.partners (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    entity_name TEXT,
    phone TEXT,
    bio TEXT,
    portrait_url TEXT,
    is_verified BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4. Places (Reusable Locations with Decimal Coordinates)
CREATE TABLE IF NOT EXISTS public.places (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    latitude NUMERIC(9, 6) NOT NULL CHECK (latitude >= -90.0 AND latitude <= 90.0),
    longitude NUMERIC(9, 6) NOT NULL CHECK (longitude >= -180.0 AND longitude <= 180.0),
    arrival_instructions TEXT,
    pin_visibility pin_visibility_type NOT NULL DEFAULT 'public',
    photos TEXT[] NOT NULL DEFAULT '{}',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 5. Offering - Place Junction
CREATE TABLE IF NOT EXISTS public.offering_places (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    offering_id UUID NOT NULL REFERENCES public.listings(id) ON DELETE CASCADE,
    place_id UUID NOT NULL REFERENCES public.places(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_offering_place UNIQUE (offering_id, place_id)
);

-- 6. Sessions (Normalized Experience Slots with Revision Tracking)
CREATE TABLE IF NOT EXISTS public.sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    offering_id UUID NOT NULL REFERENCES public.listings(id) ON DELETE RESTRICT,
    place_id UUID REFERENCES public.places(id) ON DELETE SET NULL,
    slot_start TIMESTAMPTZ NOT NULL,
    slot_end TIMESTAMPTZ NOT NULL,
    capacity INT NOT NULL CHECK (capacity > 0),
    booked_count INT NOT NULL DEFAULT 0 CHECK (booked_count >= 0 AND booked_count <= capacity),
    revision_number INT NOT NULL DEFAULT 1,
    is_cancelled BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 7. Session - Host Assignment
CREATE TABLE IF NOT EXISTS public.session_hosts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id UUID NOT NULL REFERENCES public.sessions(id) ON DELETE CASCADE,
    partner_id UUID NOT NULL REFERENCES public.partners(id) ON DELETE CASCADE,
    host_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_session_partner UNIQUE (session_id, partner_id)
);

-- 8. Booking Items (Normalized Commercial Snapshots)
CREATE TABLE IF NOT EXISTS public.booking_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
    offering_id UUID NOT NULL REFERENCES public.listings(id) ON DELETE RESTRICT,
    session_id UUID REFERENCES public.sessions(id) ON DELETE RESTRICT,
    quantity INT NOT NULL CHECK (quantity > 0),
    unit_price_inr NUMERIC(10, 2) NOT NULL CHECK (unit_price_inr >= 0),
    discount_allocated_inr NUMERIC(10, 2) NOT NULL DEFAULT 0 CHECK (discount_allocated_inr >= 0),
    net_revenue_inr NUMERIC(10, 2) NOT NULL CHECK (net_revenue_inr >= 0),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 9. Attendees (Stable Per-Seat Admission IDs)
CREATE TABLE IF NOT EXISTS public.attendees (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    booking_item_id UUID NOT NULL REFERENCES public.booking_items(id) ON DELETE CASCADE,
    session_id UUID NOT NULL REFERENCES public.sessions(id) ON DELETE RESTRICT,
    full_name TEXT,
    phone TEXT,
    email TEXT,
    checked_in BOOLEAN NOT NULL DEFAULT FALSE,
    check_in_time TIMESTAMPTZ,
    check_in_actor_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    check_in_method TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 10. Attendance Events (Immutable Audit Log)
CREATE TABLE IF NOT EXISTS public.attendance_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    attendee_id UUID NOT NULL REFERENCES public.attendees(id) ON DELETE CASCADE,
    actor_id UUID NOT NULL REFERENCES auth.users(id),
    event_type TEXT NOT NULL CHECK (event_type IN ('check_in', 'correction')),
    method TEXT NOT NULL,
    notes TEXT,
    recorded_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 11. Dispatch Jobs (Durable WhatsApp Queue & History)
CREATE TABLE IF NOT EXISTS public.dispatch_jobs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id UUID NOT NULL REFERENCES public.sessions(id) ON DELETE CASCADE,
    recipient_partner_id UUID REFERENCES public.partners(id) ON DELETE SET NULL,
    recipient_phone TEXT NOT NULL,
    language TEXT NOT NULL DEFAULT 'en' CHECK (language IN ('en', 'hi', 'mr')),
    status dispatch_status NOT NULL DEFAULT 'queued',
    scheduled_for TIMESTAMPTZ NOT NULL,
    sent_at TIMESTAMPTZ,
    provider_ref TEXT,
    attempt_count INT NOT NULL DEFAULT 0,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 12. Payout Agreements & Settlements (Flexible Community Accounting)
CREATE TABLE IF NOT EXISTS public.payout_agreements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    partner_id UUID NOT NULL REFERENCES public.partners(id) ON DELETE CASCADE,
    offering_id UUID REFERENCES public.listings(id) ON DELETE SET NULL,
    agreement_type agreement_type NOT NULL DEFAULT 'percent_net_item',
    rate_value NUMERIC(10, 2) NOT NULL CHECK (rate_value >= 0),
    effective_from TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.payout_settlements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    partner_id UUID NOT NULL REFERENCES public.partners(id) ON DELETE RESTRICT,
    amount_inr NUMERIC(10, 2) NOT NULL CHECK (amount_inr > 0),
    settlement_ref TEXT NOT NULL,
    transfer_date TIMESTAMPTZ NOT NULL,
    status TEXT NOT NULL DEFAULT 'completed',
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.payout_accruals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    booking_item_id UUID NOT NULL REFERENCES public.booking_items(id) ON DELETE RESTRICT,
    partner_id UUID NOT NULL REFERENCES public.partners(id) ON DELETE RESTRICT,
    gross_allocated_inr NUMERIC(10, 2) NOT NULL,
    net_accrual_inr NUMERIC(10, 2) NOT NULL,
    settlement_id UUID REFERENCES public.payout_settlements(id) ON DELETE SET NULL,
    status TEXT NOT NULL DEFAULT 'accrued',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 13. Full Configurable Loyalty Engine
CREATE TABLE IF NOT EXISTS public.loyalty_programs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    status loyalty_status NOT NULL DEFAULT 'draft',
    rule_version INT NOT NULL DEFAULT 1,
    config JSONB NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.loyalty_memberships (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    phone TEXT NOT NULL UNIQUE,
    current_tier TEXT NOT NULL DEFAULT 'bronze',
    lifetime_spend_inr NUMERIC(12, 2) NOT NULL DEFAULT 0,
    spendable_points INT NOT NULL DEFAULT 0,
    pending_points INT NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.loyalty_ledger (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    membership_id UUID NOT NULL REFERENCES public.loyalty_memberships(id) ON DELETE CASCADE,
    order_id UUID REFERENCES public.orders(id) ON DELETE SET NULL,
    points_delta INT NOT NULL,
    event_type loyalty_event_type NOT NULL,
    expiry_at TIMESTAMPTZ,
    rule_version INT NOT NULL DEFAULT 1,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ==============================================================================
-- RLS HELPER FUNCTIONS
-- ==============================================================================

CREATE OR REPLACE FUNCTION public.current_staff_role()
RETURNS public.staff_role AS $$
    SELECT role FROM public.staff_memberships
    WHERE user_id = auth.uid() AND is_active = TRUE
    LIMIT 1;
$$ LANGUAGE sql STABLE SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.has_workspace_grant(p_pillar TEXT)
RETURNS BOOLEAN AS $$
    SELECT EXISTS (
        SELECT 1 FROM public.staff_memberships sm
        JOIN public.workspace_grants wg ON wg.staff_membership_id = sm.id
        WHERE sm.user_id = auth.uid()
          AND sm.is_active = TRUE
          AND (sm.role IN ('owner', 'manager') OR wg.pillar = p_pillar)
    );
$$ LANGUAGE sql STABLE SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.is_assigned_host(p_session_id UUID)
RETURNS BOOLEAN AS $$
    SELECT EXISTS (
        SELECT 1 FROM public.session_hosts sh
        WHERE sh.session_id = p_session_id
          AND sh.host_user_id = auth.uid()
    );
$$ LANGUAGE sql STABLE SECURITY DEFINER;

-- ==============================================================================
-- ROW LEVEL SECURITY: HARDENING & ZERO-TRUST POLICIES
-- ==============================================================================

-- Enable RLS on all tables
ALTER TABLE public.staff_memberships ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workspace_grants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.partners ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.places ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.offering_places ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.session_hosts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.booking_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.attendees ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.attendance_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.dispatch_jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payout_agreements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payout_settlements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payout_accruals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.loyalty_programs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.loyalty_memberships ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.loyalty_ledger ENABLE ROW LEVEL SECURITY;

-- 1. DROP ALL INSECURE LEGACY POLICIES
DROP POLICY IF EXISTS "Anyone can select orders by ref" ON public.orders;
DROP POLICY IF EXISTS "Anyone can select order items" ON public.order_items;
DROP POLICY IF EXISTS "Public can view proposals" ON public.community_vendor_proposals;

-- 2. Staff Memberships Policies
CREATE POLICY "Owner and Manager can view staff"
    ON public.staff_memberships FOR SELECT
    USING (public.current_staff_role() IN ('owner', 'manager') OR user_id = auth.uid());

CREATE POLICY "Owner can manage staff"
    ON public.staff_memberships FOR ALL
    USING (public.current_staff_role() = 'owner');

-- 3. Workspace Grants Policies
CREATE POLICY "Staff can view workspace grants"
    ON public.workspace_grants FOR SELECT
    USING (public.current_staff_role() IN ('owner', 'manager'));

CREATE POLICY "Owner and Manager can manage workspace grants"
    ON public.workspace_grants FOR ALL
    USING (public.current_staff_role() IN ('owner', 'manager'));

-- 4. Places Policies (Protect Secret Coordinates)
CREATE POLICY "Public can view public places"
    ON public.places FOR SELECT
    USING (
        pin_visibility = 'public'
        OR public.current_staff_role() IN ('owner', 'manager', 'coordinator')
        OR EXISTS (
            SELECT 1 FROM public.sessions s
            JOIN public.booking_items bi ON bi.session_id = s.id
            JOIN public.orders o ON o.id = bi.order_id
            WHERE s.place_id = public.places.id
              AND (o.customer_email = auth.jwt() ->> 'email' OR o.customer_phone = auth.jwt() ->> 'phone')
        )
    );

CREATE POLICY "Staff can manage places"
    ON public.places FOR ALL
    USING (public.current_staff_role() IN ('owner', 'manager', 'coordinator'));

-- 5. Sessions Policies
CREATE POLICY "Public can view active uncancelled sessions"
    ON public.sessions FOR SELECT
    USING (is_cancelled = FALSE OR public.current_staff_role() IS NOT NULL);

CREATE POLICY "Staff can manage sessions"
    ON public.sessions FOR ALL
    USING (public.current_staff_role() IN ('owner', 'manager', 'coordinator'));

-- 6. Orders & Booking Items Strict Scoping
CREATE POLICY "Staff can view granted orders"
    ON public.orders FOR SELECT
    USING (
        public.current_staff_role() IN ('owner', 'manager')
        OR customer_email = auth.jwt() ->> 'email'
        OR customer_phone = auth.jwt() ->> 'phone'
    );

CREATE POLICY "Staff can view granted booking items"
    ON public.booking_items FOR SELECT
    USING (
        public.current_staff_role() IN ('owner', 'manager')
        OR EXISTS (
            SELECT 1 FROM public.listings l
            WHERE l.id = public.booking_items.offering_id
              AND public.has_workspace_grant(l.pillar)
        )
        OR EXISTS (
            SELECT 1 FROM public.orders o
            WHERE o.id = public.booking_items.order_id
              AND (o.customer_email = auth.jwt() ->> 'email' OR o.customer_phone = auth.jwt() ->> 'phone')
        )
    );

-- 7. Attendees & Check-In Scoping
CREATE POLICY "Scoped view of attendees"
    ON public.attendees FOR SELECT
    USING (
        public.current_staff_role() IN ('owner', 'manager')
        OR public.is_assigned_host(session_id)
        OR EXISTS (
            SELECT 1 FROM public.booking_items bi
            JOIN public.listings l ON l.id = bi.offering_id
            WHERE bi.id = public.attendees.booking_item_id
              AND public.has_workspace_grant(l.pillar)
        )
        OR EXISTS (
            SELECT 1 FROM public.booking_items bi
            JOIN public.orders o ON o.id = bi.order_id
            WHERE bi.id = public.attendees.booking_item_id
              AND (o.customer_email = auth.jwt() ->> 'email' OR o.customer_phone = auth.jwt() ->> 'phone')
        )
    );

CREATE POLICY "Hosts and Staff can check-in attendees"
    ON public.attendees FOR UPDATE
    USING (
        public.current_staff_role() IN ('owner', 'manager', 'coordinator')
        OR public.is_assigned_host(session_id)
    );

-- 8. Community Proposals (Privileged Review)
CREATE POLICY "Public can submit proposals"
    ON public.community_vendor_proposals FOR INSERT
    WITH CHECK (TRUE);

CREATE POLICY "Only staff can read and review proposals"
    ON public.community_vendor_proposals FOR SELECT
    USING (public.current_staff_role() IN ('owner', 'manager'));

CREATE POLICY "Only staff can update proposals"
    ON public.community_vendor_proposals FOR UPDATE
    USING (public.current_staff_role() IN ('owner', 'manager'));

-- 9. Payouts (Owner Only Financial Authority)
CREATE POLICY "Owner can manage payouts"
    ON public.payout_agreements FOR ALL
    USING (public.current_staff_role() = 'owner');

CREATE POLICY "Owner can manage settlements"
    ON public.payout_settlements FOR ALL
    USING (public.current_staff_role() = 'owner');

CREATE POLICY "Owner can view accruals"
    ON public.payout_accruals FOR SELECT
    USING (public.current_staff_role() = 'owner');

-- 10. Loyalty Engine Policies
CREATE POLICY "Public can view active loyalty program"
    ON public.loyalty_programs FOR SELECT
    USING (status = 'active' OR public.current_staff_role() = 'owner');

CREATE POLICY "Owner can manage loyalty program"
    ON public.loyalty_programs FOR ALL
    USING (public.current_staff_role() = 'owner');

CREATE POLICY "Members can view their own loyalty balance"
    ON public.loyalty_memberships FOR SELECT
    USING (
        user_id = auth.uid()
        OR phone = auth.jwt() ->> 'phone'
        OR public.current_staff_role() = 'owner'
    );
