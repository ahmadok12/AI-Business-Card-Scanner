import React, { useState, useRef, useEffect } from 'react';
import {
  Sparkles,
  ArrowRight,
  Mail,
  Phone,
  User,
  Building2,
  CheckCircle2,
  AlertCircle,
  Loader2,
  ChevronRight,
  ShieldCheck,
  Zap,
  QrCode,
  Mic
} from 'lucide-react';
import { sendEmailOtp, verifyEmailOtp, updateUserProfile, UserProfile } from '../services/supabase';

interface OnboardingScreenProps {
  onComplete: () => void;
  currentUser?: { id: string; email?: string } | null;
  userProfile?: UserProfile | null;
  onAuthSuccess?: (user: { id: string; email?: string }) => void;
}

export const OnboardingScreen: React.FC<OnboardingScreenProps> = ({
  onComplete,
  currentUser,
  userProfile,
  onAuthSuccess
}) => {
  const [step, setStep] = useState<1 | 2>(currentUser ? 2 : 1);

  // Step 1: Sign in state
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [isOtpSent, setIsOtpSent] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [countdown, setCountdown] = useState(0);

  // Step 2: Profile fields
  const [fullName, setFullName] = useState(userProfile?.full_name || '');
  const [phoneNumber, setPhoneNumber] = useState(userProfile?.phone_number || '');
  const [company, setCompany] = useState(userProfile?.company || '');
  const [isSavingProfile, setIsSavingProfile] = useState(false);

  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Timer countdown for OTP resend
  useEffect(() => {
    let timer: any;
    if (countdown > 0) {
      timer = setTimeout(() => setCountdown((c) => c - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [countdown]);

  // If user signs in mid-flow, transition to step 2
  useEffect(() => {
    if (currentUser && step === 1) {
      setStep(2);
    }
  }, [currentUser]);

  const handleSendCode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes('@')) {
      setErrorMessage('Please enter a valid email address');
      return;
    }

    setIsLoading(true);
    setErrorMessage('');

    const { error } = await sendEmailOtp(email);
    setIsLoading(false);

    if (error) {
      setErrorMessage(error);
    } else {
      setIsOtpSent(true);
      setCountdown(60);
      setTimeout(() => inputRefs.current[0]?.focus(), 100);
    }
  };

  const handleOtpChange = (index: number, val: string) => {
    if (!/^\d*$/.test(val)) return;

    const newOtp = [...otp];
    newOtp[index] = val.slice(-1);
    setOtp(newOtp);

    // Auto-advance
    if (val && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }

    // Auto-submit on 6th digit
    if (newOtp.every((d) => d !== '') && index === 5) {
      handleVerify(newOtp.join(''));
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').trim();
    if (/^\d{6}$/.test(pasted)) {
      const digits = pasted.split('');
      setOtp(digits);
      inputRefs.current[5]?.focus();
      handleVerify(pasted);
    }
  };

  const handleVerify = async (codeToVerify?: string) => {
    const token = codeToVerify || otp.join('');
    if (token.length !== 6) {
      setErrorMessage('Please enter the full 6-digit code');
      return;
    }

    setIsLoading(true);
    setErrorMessage('');

    const { user, error } = await verifyEmailOtp(email, token);
    setIsLoading(false);

    if (error) {
      setErrorMessage(error);
    } else if (user) {
      if (onAuthSuccess) {
        onAuthSuccess({ id: user.id, email: user.email });
      }
      setStep(2);
    }
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingProfile(true);

    // Save locally
    const localProfile = {
      fullName: fullName.trim(),
      phoneNumber: phoneNumber.trim(),
      company: company.trim()
    };
    try {
      localStorage.setItem('cardsnap_user_profile', JSON.stringify(localProfile));
    } catch {}

    // Save to Supabase if signed in
    if (currentUser) {
      await updateUserProfile(currentUser.id, {
        full_name: fullName.trim(),
        phone_number: phoneNumber.trim(),
        company: company.trim()
      });
    }

    setIsSavingProfile(false);
    onComplete();
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#FBF9F7] flex items-center justify-center p-4 overflow-y-auto font-grotesk">
      <div className="w-full max-w-sm my-auto flex flex-col justify-between min-h-[580px] bg-white rounded-[32px] border border-[#EDE8E1] shadow-2xl p-6 sm:p-7 relative overflow-hidden">
        {/* Background glow accents */}
        <div className="absolute -top-20 -right-20 w-44 h-44 rounded-full bg-[#FF5722]/10 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-20 -left-20 w-44 h-44 rounded-full bg-[#FF8A65]/10 blur-3xl pointer-events-none" />

        {/* Top Header & Progress */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-[#FF5722] to-[#FF4500] text-white flex items-center justify-center font-syne font-bold text-lg shadow-solar">
                CS
              </div>
              <div>
                <span className="font-syne font-bold text-base text-[#181716] block">CardSnap AI</span>
                <span className="text-[10px] text-[#7C7875] font-mono">Business Card Hub</span>
              </div>
            </div>

            {/* Step Pill */}
            <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-[#F5F3EF] border border-[#EDE8E1] text-[#7C7875]">
              Step {step} of 2
            </span>
          </div>

          {/* Step 1: Sign in with 6-digit OTP */}
          {step === 1 && (
            <div className="space-y-4 pt-1 animate-in fade-in">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider bg-[#FFF0EB] text-[#FF5722] px-2.5 py-0.5 rounded-full border border-[#FF5722]/30 inline-block mb-1.5 font-condensed">
                  Welcome Aboard
                </span>
                <h1 className="font-syne text-xl font-bold text-[#181716] leading-tight">
                  Digitize Business Cards in 1 Tap
                </h1>
                <p className="text-xs text-[#7C7875] mt-1">
                  Sign in to sync cards across devices, unlock 10 cloud scans, and enable instant WhatsApp/WeChat exports.
                </p>
              </div>

              {/* Feature Highlights */}
              <div className="grid grid-cols-3 gap-2 pt-1">
                <div className="bg-[#F8F6F4] p-2 rounded-2xl border border-[#EDE8E1] text-center">
                  <Zap className="w-4 h-4 text-[#FF5722] mx-auto mb-1" />
                  <span className="text-[10px] font-bold text-[#181716] block">AI OCR</span>
                  <span className="text-[9px] text-[#7C7875]">Instant capture</span>
                </div>
                <div className="bg-[#F8F6F4] p-2 rounded-2xl border border-[#EDE8E1] text-center">
                  <QrCode className="w-4 h-4 text-[#FF5722] mx-auto mb-1" />
                  <span className="text-[10px] font-bold text-[#181716] block">QR Links</span>
                  <span className="text-[9px] text-[#7C7875]">WhatsApp/Chat</span>
                </div>
                <div className="bg-[#F8F6F4] p-2 rounded-2xl border border-[#EDE8E1] text-center">
                  <Mic className="w-4 h-4 text-[#FF5722] mx-auto mb-1" />
                  <span className="text-[10px] font-bold text-[#181716] block">Voice Notes</span>
                  <span className="text-[9px] text-[#7C7875]">1-Tap attach</span>
                </div>
              </div>

              {/* Error Message */}
              {errorMessage && (
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-2xl flex items-start gap-2 text-rose-700 text-xs">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span className="text-[11px] leading-relaxed">{errorMessage}</span>
                </div>
              )}

              {/* Email Input / OTP Form */}
              {!isOtpSent ? (
                <form onSubmit={handleSendCode} className="space-y-3 pt-1">
                  <div>
                    <label className="text-[11px] font-bold text-[#181716] block mb-1">
                      Email Address
                    </label>
                    <div className="relative">
                      <Mail className="w-4 h-4 text-[#7C7875] absolute left-3.5 top-3" />
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="you@company.com"
                        required
                        className="w-full pl-10 pr-4 py-2.5 bg-[#F5F3EF] border border-[#EDE8E1] rounded-full text-xs text-[#181716] font-medium focus:outline-none focus:border-[#FF5722] transition-colors"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full flex items-center justify-center gap-2 py-3 bg-gradient-to-r from-[#FF5722] to-[#FF4500] hover:brightness-105 disabled:opacity-50 text-white font-syne font-bold text-xs rounded-full shadow-solar transition-transform active:scale-98"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        <span>Sending 6-Digit Code...</span>
                      </>
                    ) : (
                      <>
                        <span>Continue with Email Code</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </>
                    )}
                  </button>
                </form>
              ) : (
                <div className="space-y-3.5 pt-1 animate-in fade-in">
                  <div>
                    <div className="flex items-center justify-between text-[11px] mb-1">
                      <span className="font-bold text-[#181716]">Enter 6-Digit Verification Code</span>
                      <button
                        type="button"
                        onClick={() => setIsOtpSent(false)}
                        className="text-[#FF5722] hover:underline font-semibold text-[10px]"
                      >
                        Change
                      </button>
                    </div>
                    <p className="text-[10px] text-[#7C7875] mb-2.5">
                      Sent to <strong>{email}</strong>
                    </p>

                    {/* 6 Digit Box Inputs */}
                    <div className="flex justify-between gap-1.5" onPaste={handlePaste}>
                      {otp.map((digit, i) => (
                        <input
                          key={i}
                          ref={(el) => {
                            inputRefs.current[i] = el;
                          }}
                          type="text"
                          inputMode="numeric"
                          maxLength={1}
                          value={digit}
                          onChange={(e) => handleOtpChange(i, e.target.value)}
                          onKeyDown={(e) => handleKeyDown(i, e)}
                          className="w-11 h-12 text-center text-lg font-syne font-bold bg-[#F8F6F4] border border-[#EDE8E1] rounded-2xl focus:outline-none focus:border-[#FF5722] focus:bg-white text-[#181716] shadow-2xs transition-all"
                        />
                      ))}
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleVerify()}
                    disabled={isLoading || otp.some((d) => d === '')}
                    className="w-full flex items-center justify-center gap-2 py-3 bg-gradient-to-r from-[#FF5722] to-[#FF4500] hover:brightness-105 disabled:opacity-50 text-white font-syne font-bold text-xs rounded-full shadow-solar transition-transform active:scale-98"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        <span>Verifying...</span>
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Verify & Continue</span>
                      </>
                    )}
                  </button>

                  <div className="text-center">
                    {countdown > 0 ? (
                      <span className="text-[10px] text-[#7C7875]">Resend code in {countdown}s</span>
                    ) : (
                      <button
                        type="button"
                        onClick={handleSendCode}
                        className="text-[10px] font-bold text-[#FF5722] hover:underline"
                      >
                        Didn't get code? Resend
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Step 2: Profile Customization */}
          {step === 2 && (
            <div className="space-y-4 pt-1 animate-in fade-in">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider bg-[#FFF0EB] text-[#FF5722] px-2.5 py-0.5 rounded-full border border-[#FF5722]/30 inline-block mb-1.5 font-condensed">
                  Personalize Profile
                </span>
                <h1 className="font-syne text-xl font-bold text-[#181716] leading-tight">
                  What's Your Name & Number?
                </h1>
                <p className="text-xs text-[#7C7875] mt-1">
                  We'll attach this info to your digital business card and outgoing exports.
                </p>
              </div>

              <form onSubmit={handleSaveProfile} className="space-y-3 pt-1">
                <div>
                  <label className="text-[11px] font-bold text-[#181716] block mb-1">
                    Your Full Name
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-[#7C7875] absolute left-3.5 top-3" />
                    <input
                      type="text"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="e.g. Sarah Jenkins"
                      className="w-full pl-10 pr-4 py-2.5 bg-[#F5F3EF] border border-[#EDE8E1] rounded-full text-xs text-[#181716] font-medium focus:outline-none focus:border-[#FF5722] transition-colors"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[11px] font-bold text-[#181716] block mb-1">
                    Mobile Number (WhatsApp / Calling)
                  </label>
                  <div className="relative">
                    <Phone className="w-4 h-4 text-[#7C7875] absolute left-3.5 top-3" />
                    <input
                      type="tel"
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                      placeholder="e.g. +1 555 234 5678"
                      className="w-full pl-10 pr-4 py-2.5 bg-[#F5F3EF] border border-[#EDE8E1] rounded-full text-xs text-[#181716] font-medium focus:outline-none focus:border-[#FF5722] transition-colors"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[11px] font-bold text-[#181716] block mb-1">
                    Company or Professional Title (Optional)
                  </label>
                  <div className="relative">
                    <Building2 className="w-4 h-4 text-[#7C7875] absolute left-3.5 top-3" />
                    <input
                      type="text"
                      value={company}
                      onChange={(e) => setCompany(e.target.value)}
                      placeholder="e.g. Acme Corp • Sales Director"
                      className="w-full pl-10 pr-4 py-2.5 bg-[#F5F3EF] border border-[#EDE8E1] rounded-full text-xs text-[#181716] font-medium focus:outline-none focus:border-[#FF5722] transition-colors"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isSavingProfile}
                  className="w-full flex items-center justify-center gap-2 py-3 bg-gradient-to-r from-[#FF5722] to-[#FF4500] hover:brightness-105 disabled:opacity-50 text-white font-syne font-bold text-xs rounded-full shadow-solar transition-transform active:scale-98"
                >
                  {isSavingProfile ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Saving Profile...</span>
                    </>
                  ) : (
                    <>
                      <span>Save & Get Started</span>
                      <ChevronRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>
            </div>
          )}
        </div>

        {/* Bottom Actions: Skip Button */}
        <div className="pt-5 border-t border-[#EDE8E1] text-center space-y-2">
          {step === 1 ? (
            <div className="space-y-1">
              <button
                type="button"
                onClick={() => setStep(2)}
                className="w-full py-2 bg-[#F5F3EF] hover:bg-[#EDE8E1] text-[#181716] font-bold text-xs rounded-full transition-colors"
              >
                Continue to Profile Setup →
              </button>
              <button
                type="button"
                onClick={onComplete}
                className="text-[11px] font-bold text-[#7C7875] hover:text-[#181716] transition-colors py-1 inline-block"
              >
                Skip sign in and start scanning
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={onComplete}
              className="text-[11px] font-bold text-[#7C7875] hover:text-[#181716] transition-colors py-1 inline-block"
            >
              Skip for now & go to Homepage
            </button>
          )}
        </div>
      </div>
    </div>
  );
};