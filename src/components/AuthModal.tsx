import React, { useState, useRef, useEffect } from 'react';
import { Mail, KeyRound, ArrowRight, CheckCircle2, AlertCircle, X, RefreshCw, ShieldCheck, Sparkles } from 'lucide-react';
import { sendEmailOtp, verifyEmailOtp } from '../services/supabase';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAuthSuccess: (user: any) => void;
  initialEmail?: string;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  onAuthSuccess,
  initialEmail = ''
}) => {
  const [step, setStep] = useState<'email' | 'otp'>('email');
  const [email, setEmail] = useState(initialEmail);
  const [otpDigits, setOtpDigits] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [resendCooldown, setResendCooldown] = useState(0);

  const digitInputs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    if (isOpen) {
      setStep('email');
      setErrorMessage(null);
      setSuccessMessage(null);
      setOtpDigits(['', '', '', '', '', '']);
      if (initialEmail) setEmail(initialEmail);
    }
  }, [isOpen, initialEmail]);

  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setTimeout(() => setResendCooldown(resendCooldown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendCooldown]);

  if (!isOpen) return null;

  const handleSendCode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !email.includes('@')) {
      setErrorMessage('Please enter a valid email address');
      return;
    }

    setLoading(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    const { error } = await sendEmailOtp(email);
    setLoading(false);

    if (error) {
      setErrorMessage(error);
    } else {
      setStep('otp');
      setSuccessMessage(`We sent a 6-digit code to ${email}`);
      setResendCooldown(45);
      setTimeout(() => {
        digitInputs.current[0]?.focus();
      }, 100);
    }
  };

  const handleDigitChange = (index: number, value: string) => {
    // Handle paste of 6 digits
    if (value.length > 1) {
      const pasted = value.replace(/[^0-9]/g, '').slice(0, 6);
      if (pasted.length > 0) {
        const newDigits = [...otpDigits];
        for (let i = 0; i < 6; i++) {
          newDigits[i] = pasted[i] || '';
        }
        setOtpDigits(newDigits);
        if (pasted.length === 6) {
          verifyToken(newDigits.join(''));
        } else {
          digitInputs.current[Math.min(5, pasted.length)]?.focus();
        }
        return;
      }
    }

    const char = value.slice(-1).replace(/[^0-9]/g, '');
    const newDigits = [...otpDigits];
    newDigits[index] = char;
    setOtpDigits(newDigits);

    if (char && index < 5) {
      digitInputs.current[index + 1]?.focus();
    }

    if (newDigits.every((d) => d !== '')) {
      verifyToken(newDigits.join(''));
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otpDigits[index] && index > 0) {
      digitInputs.current[index - 1]?.focus();
    }
  };

  const verifyToken = async (tokenString: string) => {
    if (tokenString.length !== 6) return;

    setLoading(true);
    setErrorMessage(null);

    const { user, error } = await verifyEmailOtp(email, tokenString);
    setLoading(false);

    if (error) {
      setErrorMessage(error);
      setOtpDigits(['', '', '', '', '', '']);
      digitInputs.current[0]?.focus();
    } else if (user) {
      setSuccessMessage('Successfully verified!');
      setTimeout(() => {
        onAuthSuccess(user);
        onClose();
      }, 400);
    }
  };

  const handleManualVerifySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    verifyToken(otpDigits.join(''));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#181716]/70 backdrop-blur-md animate-in fade-in">
      <div className="bg-white w-full max-w-sm rounded-[32px] p-6 shadow-2xl border border-[#EDE8E1] flex flex-col font-grotesk relative">
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full text-[#7C7875] hover:text-[#181716] hover:bg-[#F8F6F4] transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Header Icon & Brand */}
        <div className="text-center pt-2 pb-4">
          <div className="w-14 h-14 rounded-2xl bg-[#FFF0EB] border border-[#FF5722]/30 text-[#FF5722] flex items-center justify-center mx-auto mb-3 shadow-md">
            {step === 'email' ? <Mail className="w-7 h-7" /> : <KeyRound className="w-7 h-7" />}
          </div>
          <h2 className="font-condensed text-xl font-bold text-[#181716]">
            {step === 'email' ? 'Sign In with Email' : 'Enter 6-Digit Code'}
          </h2>
          <p className="text-xs text-[#7C7875] mt-1 max-w-xs mx-auto">
            {step === 'email'
              ? 'Passwordless authentication. We will email you a 6-digit login code.'
              : `Code sent to ${email}. Check your inbox or spam folder.`}
          </p>
        </div>

        {/* Error Notice */}
        {errorMessage && (
          <div className="mb-4 p-3 bg-rose-50 border border-rose-200 text-rose-800 text-xs rounded-2xl flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            <span className="leading-tight">{errorMessage}</span>
          </div>
        )}

        {/* Success Notice */}
        {successMessage && !errorMessage && (
          <div className="mb-4 p-2.5 bg-[#E8F8F0] border border-emerald-200 text-emerald-800 text-xs rounded-2xl flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span className="leading-tight">{successMessage}</span>
          </div>
        )}

        {/* Step 1: Email Form */}
        {step === 'email' && (
          <form onSubmit={handleSendCode} className="space-y-4">
            <div>
              <label className="text-[11px] font-bold text-[#181716] uppercase tracking-wider mb-1.5 block">
                Your Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-[#7C7875] absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  autoFocus
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@company.com"
                  className="w-full pl-10 pr-3.5 py-3 bg-[#F8F6F4] border border-[#EDE8E1] rounded-2xl text-sm font-semibold text-[#181716] focus:outline-none focus:border-[#FF5722]"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 bg-gradient-to-r from-[#FF5722] to-[#FF4500] hover:brightness-105 text-white font-condensed font-bold text-sm rounded-full shadow-solar transition-transform active:scale-98 flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <span>Send Verification Code</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        )}

        {/* Step 2: 6-Digit OTP Form */}
        {step === 'otp' && (
          <form onSubmit={handleManualVerifySubmit} className="space-y-4">
            <div>
              <label className="text-[11px] font-bold text-[#181716] uppercase tracking-wider mb-2 block text-center">
                6-Digit Verification Code
              </label>
              <div className="flex items-center justify-center gap-2">
                {otpDigits.map((digit, idx) => (
                  <input
                    key={idx}
                    ref={(el) => { digitInputs.current[idx] = el; }}
                    type="text"
                    inputMode="numeric"
                    maxLength={idx === 0 ? 6 : 1}
                    value={digit}
                    onChange={(e) => handleDigitChange(idx, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(idx, e)}
                    className="w-11 h-13 text-center text-xl font-bold font-condensed bg-[#F8F6F4] border border-[#EDE8E1] focus:border-[#FF5722] rounded-xl text-[#181716] focus:outline-none shadow-2xs transition-all"
                  />
                ))}
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || otpDigits.some((d) => !d)}
              className="w-full py-3.5 bg-gradient-to-r from-[#FF5722] to-[#FF4500] hover:brightness-105 text-white font-condensed font-bold text-sm rounded-full shadow-solar transition-transform active:scale-98 flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <ShieldCheck className="w-4 h-4" />
                  <span>Verify & Sign In</span>
                </>
              )}
            </button>

            <div className="flex items-center justify-between text-xs pt-1 px-1">
              <button
                type="button"
                onClick={() => setStep('email')}
                className="text-[#7C7875] hover:text-[#181716] transition-colors"
              >
                Change Email
              </button>
              <button
                type="button"
                disabled={resendCooldown > 0 || loading}
                onClick={handleSendCode}
                className="text-[#FF5722] font-semibold disabled:opacity-40 transition-colors"
              >
                {resendCooldown > 0 ? `Resend code (${resendCooldown}s)` : 'Resend Code'}
              </button>
            </div>
          </form>
        )}

        {/* Security Footer Note */}
        <div className="mt-5 pt-3 border-t border-[#EDE8E1] text-center">
          <p className="text-[10px] text-[#7C7875] flex items-center justify-center gap-1">
            <Sparkles className="w-3 h-3 text-[#FF5722]" />
            Encrypted session via Supabase Auth
          </p>
        </div>
      </div>
    </div>
  );
};

