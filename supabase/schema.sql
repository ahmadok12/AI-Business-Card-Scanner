-- ==============================================================================
-- CARDSNAP AI - SUPABASE DATABASE SCHEMA
-- Execute this script in your Supabase Project: Dashboard -> SQL Editor -> Run
-- ==============================================================================

-- 1. Create Profiles Table (Tied to Supabase Auth)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    email TEXT NOT NULL,
    full_name TEXT,
    phone_number TEXT,
    company TEXT,
    plan_tier TEXT DEFAULT 'free' CHECK (plan_tier IN ('free', 'pro')),
    scans_used INTEGER DEFAULT 0,
    max_scans INTEGER DEFAULT 10,
    is_admin BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS on Profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Profiles Policies
CREATE POLICY "Users can view their own profile"
    ON public.profiles FOR SELECT
    USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
    ON public.profiles FOR UPDATE
    USING (auth.uid() = id);

CREATE POLICY "Admins can view all profiles"
    ON public.profiles FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles WHERE id = auth.uid() AND is_admin = TRUE
        )
    );

CREATE POLICY "Admins can update any profile"
    ON public.profiles FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles WHERE id = auth.uid() AND is_admin = TRUE
        )
    );

-- 2. Create Payment Requests Table (Manual Payment Verification)
CREATE TABLE IF NOT EXISTS public.payment_requests (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    user_email TEXT NOT NULL,
    plan_type TEXT DEFAULT 'annual' CHECK (plan_type IN ('monthly', 'annual', 'lifetime')),
    amount NUMERIC NOT NULL,
    payment_method TEXT DEFAULT 'bank_transfer',
    transaction_reference TEXT,
    receipt_image_url TEXT,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
    admin_notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    verified_at TIMESTAMPTZ
);

-- Enable RLS on Payment Requests
ALTER TABLE public.payment_requests ENABLE ROW LEVEL SECURITY;

-- Payment Requests Policies
CREATE POLICY "Users can view their own payment requests"
    ON public.payment_requests FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own payment requests"
    ON public.payment_requests FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can view all payment requests"
    ON public.payment_requests FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles WHERE id = auth.uid() AND is_admin = TRUE
        )
    );

CREATE POLICY "Admins can update payment requests"
    ON public.payment_requests FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles WHERE id = auth.uid() AND is_admin = TRUE
        )
    );

-- 3. Automatic Trigger: Create Profile When User Verifies OTP
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, email, plan_tier, scans_used, max_scans, is_admin)
    VALUES (
        NEW.id,
        NEW.email,
        'free',
        0,
        10,
        -- Automatically make the first user or specific domain an admin if needed
        FALSE
    )
    ON CONFLICT (id) DO NOTHING;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 4. Automatic Trigger: Upgrade User to Pro When Payment is Approved
CREATE OR REPLACE FUNCTION public.handle_payment_status_change()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.status = 'approved' AND (OLD.status IS DISTINCT FROM 'approved') THEN
        UPDATE public.profiles
        SET plan_tier = 'pro',
            updated_at = NOW()
        WHERE id = NEW.user_id;

        NEW.verified_at = NOW();
    ELSIF NEW.status = 'rejected' AND OLD.status = 'approved' THEN
        UPDATE public.profiles
        SET plan_tier = 'free',
            updated_at = NOW()
        WHERE id = NEW.user_id;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_payment_request_status_change ON public.payment_requests;
CREATE TRIGGER on_payment_request_status_change
    BEFORE UPDATE ON public.payment_requests
    FOR EACH ROW EXECUTE FUNCTION public.handle_payment_status_change();

-- 5. Storage Bucket for Payment Receipts
INSERT INTO storage.buckets (id, name, public)
VALUES ('receipts', 'receipts', true)
ON CONFLICT (id) DO NOTHING;

-- Storage RLS Policies
CREATE POLICY "Users can upload their receipt"
    ON storage.objects FOR INSERT
    WITH CHECK (bucket_id = 'receipts' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can read their own receipt"
    ON storage.objects FOR SELECT
    USING (bucket_id = 'receipts' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Public or Admin can view receipts"
    ON storage.objects FOR SELECT
    USING (bucket_id = 'receipts');

