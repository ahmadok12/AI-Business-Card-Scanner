import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || 'https://jiupvduvrnoruqgjqbdq.supabase.co';
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_5etCwAKYrsoP-O1RYDNfGA_Y9NPeZOD';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true
  }
});

export interface UserProfile {
  id: string;
  email: string;
  plan_tier: 'free' | 'pro';
  scans_used: number;
  max_scans: number;
  is_admin?: boolean;
  created_at?: string;
}

export interface PaymentRequestRecord {
  id: string;
  user_id: string;
  user_email: string;
  plan_type: 'monthly' | 'annual' | 'lifetime';
  amount: number;
  payment_method: string;
  transaction_reference?: string;
  receipt_image_url?: string;
  status: 'pending' | 'approved' | 'rejected';
  admin_notes?: string;
  created_at?: string;
  verified_at?: string;
}

export type PaymentRequest = PaymentRequestRecord;

// -------------------------------------------------------------
// Authentication with 6-Digit Email OTP
// -------------------------------------------------------------

export const sendEmailOtp = async (email: string): Promise<{ error: string | null }> => {
  try {
    const { error } = await supabase.auth.signInWithOtp({
      email: email.trim().toLowerCase(),
      options: {
        shouldCreateUser: true
      }
    });

    if (error) {
      return { error: error.message };
    }
    return { error: null };
  } catch (err: any) {
    return { error: err.message || 'Failed to send verification code' };
  }
};

export const verifyEmailOtp = async (
  email: string,
  token: string
): Promise<{ user: any | null; error: string | null }> => {
  try {
    const { data, error } = await supabase.auth.verifyOtp({
      email: email.trim().toLowerCase(),
      token: token.trim(),
      type: 'email'
    });

    if (error) {
      return { user: null, error: error.message };
    }

    // Refresh profile in background
    if (data.user) {
      await getOrCreateUserProfile(data.user.id, data.user.email || email);
    }

    return { user: data.user, error: null };
  } catch (err: any) {
    return { user: null, error: err.message || 'Verification failed' };
  }
};

export const signOutUser = async (): Promise<void> => {
  try {
    await supabase.auth.signOut();
  } catch (err) {
    console.warn('Sign out error:', err);
  }
};

export const getCurrentSession = async () => {
  try {
    const { data } = await supabase.auth.getSession();
    return data.session;
  } catch {
    return null;
  }
};

// -------------------------------------------------------------
// User Profile & Scan Quota Management
// -------------------------------------------------------------

export const getOrCreateUserProfile = async (
  userId: string,
  email: string
): Promise<UserProfile | null> => {
  try {
    // Try fetching existing profile
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .maybeSingle();

    if (data && !error) {
      return data as UserProfile;
    }

    // Fallback: create if trigger didn't fire
    const newProfile: UserProfile = {
      id: userId,
      email,
      plan_tier: 'free',
      scans_used: 0,
      max_scans: 10
    };

    const { data: inserted, error: insertErr } = await supabase
      .from('profiles')
      .upsert(newProfile)
      .select()
      .maybeSingle();

    if (insertErr) {
      console.warn('Profile upsert notice:', insertErr.message);
      return newProfile;
    }
    return inserted as UserProfile;
  } catch (err) {
    console.warn('Error fetching profile:', err);
    return null;
  }
};

export const incrementServerScanCount = async (userId: string): Promise<number | null> => {
  try {
    const { data: profile } = await supabase
      .from('profiles')
      .select('scans_used, plan_tier')
      .eq('id', userId)
      .single();

    if (!profile) return null;

    const nextCount = (profile.scans_used || 0) + 1;
    await supabase
      .from('profiles')
      .update({ scans_used: nextCount, updated_at: new Date().toISOString() })
      .eq('id', userId);

    return nextCount;
  } catch (err) {
    console.warn('Increment quota error:', err);
    return null;
  }
};

// -------------------------------------------------------------
// Manual Payment Verification
// -------------------------------------------------------------

export const submitPaymentRequest = async (
  userId: string,
  userEmail: string,
  planType: 'monthly' | 'annual' | 'lifetime',
  amount: number,
  paymentMethod: string,
  transactionRef: string,
  receiptBase64?: string
): Promise<{ success: boolean; error?: string }> => {
  try {
    let receiptUrl: string | undefined = undefined;

    // Optional upload to receipts storage bucket
    if (receiptBase64 && receiptBase64.startsWith('data:image')) {
      try {
        const fileExt = receiptBase64.substring('data:image/'.length, receiptBase64.indexOf(';base64'));
        const fileName = `${userId}/${Date.now()}.${fileExt || 'jpg'}`;
        const response = await fetch(receiptBase64);
        const blob = await response.blob();

        const { error: uploadError } = await supabase.storage
          .from('receipts')
          .upload(fileName, blob, { contentType: `image/${fileExt || 'jpeg'}`, upsert: true });

        if (!uploadError) {
          const { data: publicUrlData } = supabase.storage.from('receipts').getPublicUrl(fileName);
          receiptUrl = publicUrlData.publicUrl;
        } else {
          // If storage bucket isn't set up yet, save base64 inline or note
          receiptUrl = receiptBase64;
        }
      } catch (uploadErr) {
        console.warn('Storage upload error, saving inline:', uploadErr);
        receiptUrl = receiptBase64;
      }
    }

    const { error: insertError } = await supabase.from('payment_requests').insert({
      user_id: userId,
      user_email: userEmail,
      plan_type: planType,
      amount: amount,
      payment_method: paymentMethod,
      transaction_reference: transactionRef.trim(),
      receipt_image_url: receiptUrl,
      status: 'pending'
    });

    if (insertError) {
      return { success: false, error: insertError.message };
    }

    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message || 'Payment submission failed' };
  }
};

export const getUserPendingPayment = async (userId: string): Promise<PaymentRequestRecord | null> => {
  try {
    const { data } = await supabase
      .from('payment_requests')
      .select('*')
      .eq('user_id', userId)
      .eq('status', 'pending')
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    return data as PaymentRequestRecord | null;
  } catch {
    return null;
  }
};

export const getAdminPaymentRequests = async (): Promise<PaymentRequestRecord[]> => {
  try {
    const { data, error } = await supabase
      .from('payment_requests')
      .select('*')
      .order('created_at', { ascending: false });

    if (error || !data) return [];
    return data as PaymentRequestRecord[];
  } catch {
    return [];
  }
};

export const updatePaymentStatus = async (
  requestId: string,
  newStatus: 'approved' | 'rejected',
  adminNotes?: string
): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('payment_requests')
      .update({
        status: newStatus,
        admin_notes: adminNotes || '',
        verified_at: newStatus === 'approved' ? new Date().toISOString() : null
      })
      .eq('id', requestId);

    return !error;
  } catch {
    return false;
  }
};

