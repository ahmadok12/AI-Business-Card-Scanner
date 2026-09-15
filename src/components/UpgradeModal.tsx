import React, { useState } from 'react';
import { Sparkles, Check, X, Crown, ReceiptText, Clock, Zap } from 'lucide-react';
import type { PaymentRequest } from '../services/supabase';

interface UpgradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  scansUsed: number;
  maxScans: number;
  onUpgradeSimulated: () => void;
  onOpenSettings: () => void;
  onOpenPaymentProof?: (plan: 'annual' | 'monthly' | 'lifetime') => void;
  pendingPayment?: PaymentRequest | null;
}

export const UpgradeModal: React.FC<UpgradeModalProps> = ({
  isOpen,
  onClose,
  scansUsed,
  maxScans,
  onUpgradeSimulated,
  onOpenSettings,
  onOpenPaymentProof,
  pendingPayment
}) => {
  const [selectedPlan, setSelectedPlan] = useState<'monthly' | 'annual' | 'lifetime'>('annual');

  if (!isOpen) return null;

  const planPrices = {
    annual: '$39.99/yr',
    monthly: '$4.99/mo',
    lifetime: '$79.00 once'
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#181716]/70 backdrop-blur-md animate-in fade-in">
      <div className="bg-white w-full max-w-sm rounded-[28px] shadow-2xl border border-[#EDE8E1] flex flex-col max-h-[92vh] overflow-hidden my-auto">
        {/* Banner */}
        <div className="bg-[#181716] p-5 text-white relative text-center border-b border-white/5">
          <button
            onClick={onClose}
            className="absolute top-3 right-3 p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#FF5722] to-[#FF8A65] text-white flex items-center justify-center mx-auto mb-2.5 shadow-lg shadow-[#FF5722]/30">
            <Crown className="w-6 h-6 fill-current" />
          </div>

          <span className="text-[10px] font-grotesk font-bold uppercase tracking-wider bg-[#FF5722]/20 text-[#FF8A65] px-3 py-0.5 rounded-full border border-[#FF5722]/40 inline-block mb-1.5">
            Free Trial Limit Reached
          </span>

          <h2 className="text-lg font-syne font-bold">Unlock Unlimited Scans</h2>
          <p className="text-xs text-white/70 font-grotesk mt-0.5">
            You've used {scansUsed} of {maxScans} free OCR scans on this device.
          </p>
        </div>

        {/* Feature List & Options */}
        <div className="p-4 space-y-3.5 overflow-y-auto text-xs font-grotesk">
          {pendingPayment && (
            <div className="bg-amber-50 border border-amber-200 rounded-[18px] p-3 text-amber-900 text-xs flex items-start gap-2.5">
              <Clock className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold font-syne text-[11px]">Payment Proof Under Review</p>
                <p className="text-[10px] text-amber-700 font-grotesk mt-0.5 leading-relaxed">
                  Ref #{pendingPayment.transaction_reference || pendingPayment.id.slice(0, 8)}. Admin is verifying your transfer. Pro will activate as soon as approved!
                </p>
              </div>
            </div>
          )}

          <div className="bg-[#F8F6F4] rounded-[20px] p-3.5 border border-[#EDE8E1] space-y-2.5">
            <h4 className="font-syne font-bold text-xs text-[#181716] flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-[#FF5722]" /> CardSnap Pro Features
            </h4>
            <ul className="space-y-1.5 text-[11px] text-[#181716]/80">
              <li className="flex items-center gap-2">
                <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span><strong>Unlimited AI OCR card scans</strong> with instant auto-capture</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span><strong>WeChat & WhatsApp QR auto-crop</strong> & direct chat links</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span><strong>1-Tap Voice notes</strong> with 1x, 1.5x, 2x playback speed</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span><strong>Unlimited media storage</strong> & instant vCard (.vcf) exports</span>
              </li>
            </ul>
          </div>

          {/* Pricing Plan Selector */}
          <div className="space-y-2">
            <label className="text-[11px] font-grotesk font-bold text-[#181716] block uppercase tracking-wider">Choose a Plan</label>

            <div
              onClick={() => setSelectedPlan('annual')}
              className={`p-3 rounded-[18px] border transition-all cursor-pointer flex items-center justify-between relative ${
                selectedPlan === 'annual'
                  ? 'border-[#FF5722] bg-[#FFF0EB]/50 shadow-xs'
                  : 'border-[#EDE8E1] bg-white hover:border-[#181716]/20'
              }`}
            >
              <span className="absolute -top-2.5 right-3 text-[9px] font-grotesk font-bold bg-gradient-to-r from-[#FF5722] to-[#FF4500] text-white px-2.5 py-0.5 rounded-full shadow-xs">
                BEST VALUE • SAVE 33%
              </span>
              <div>
                <span className="font-syne font-bold text-xs text-[#181716] block">Annual Pro Plan</span>
                <span className="text-[10px] text-[#7C7875] font-grotesk">$3.33 / mo ($39.99/yr)</span>
              </div>
              <div className="text-right">
                <span className="font-syne font-bold text-sm text-[#FF5722]">$39.99</span>
                <span className="text-[10px] text-[#7C7875] block font-grotesk">/ year</span>
              </div>
            </div>

            <div
              onClick={() => setSelectedPlan('monthly')}
              className={`p-3 rounded-[18px] border transition-all cursor-pointer flex items-center justify-between ${
                selectedPlan === 'monthly'
                  ? 'border-[#FF5722] bg-[#FFF0EB]/50 shadow-xs'
                  : 'border-[#EDE8E1] bg-white hover:border-[#181716]/20'
              }`}
            >
              <div>
                <span className="font-syne font-bold text-xs text-[#181716] block">Monthly Pro Plan</span>
                <span className="text-[10px] text-[#7C7875] font-grotesk">Flexible month-to-month</span>
              </div>
              <div className="text-right">
                <span className="font-syne font-bold text-sm text-[#181716]">$4.99</span>
                <span className="text-[10px] text-[#7C7875] block font-grotesk">/ month</span>
              </div>
            </div>

            <div
              onClick={() => setSelectedPlan('lifetime')}
              className={`p-3 rounded-[18px] border transition-all cursor-pointer flex items-center justify-between ${
                selectedPlan === 'lifetime'
                  ? 'border-[#FF5722] bg-[#FFF0EB]/50 shadow-xs'
                  : 'border-[#EDE8E1] bg-white hover:border-[#181716]/20'
              }`}
            >
              <div>
                <span className="font-syne font-bold text-xs text-[#181716] block">Lifetime Access</span>
                <span className="text-[10px] text-[#7C7875] font-grotesk">One-time payment, forever</span>
              </div>
              <div className="text-right">
                <span className="font-syne font-bold text-sm text-[#181716]">$79.00</span>
                <span className="text-[10px] text-[#7C7875] block font-grotesk">one-time</span>
              </div>
            </div>
          </div>
        </div>

        {/* Action Footer */}
        <div className="p-4 border-t border-[#EDE8E1] bg-white space-y-2">
          {onOpenPaymentProof && (
            <button
              onClick={() => {
                onClose();
                onOpenPaymentProof(selectedPlan);
              }}
              className="w-full flex items-center justify-center gap-2 py-3 bg-gradient-to-r from-[#FF5722] to-[#FF4500] hover:brightness-105 text-white font-grotesk font-semibold text-xs rounded-full shadow-lg shadow-[#FF5722]/25 transition-transform active:scale-98"
            >
              <ReceiptText className="w-4 h-4 text-white" />
              <span>Pay & Submit Proof ({planPrices[selectedPlan]})</span>
            </button>
          )}

          <button
            onClick={onUpgradeSimulated}
            className="w-full flex items-center justify-center gap-1.5 py-2.5 bg-[#F5F3EF] hover:bg-[#EDE8E1] text-[#181716] font-grotesk font-semibold text-[11px] rounded-full transition-colors border border-[#EDE8E1]"
          >
            <Zap className="w-3.5 h-3.5 fill-current text-amber-500" />
            <span>Instant Test Upgrade (Simulate)</span>
          </button>

          <div className="text-center pt-1">
            <button
              onClick={() => {
                onClose();
                onOpenSettings();
              }}
              className="text-[11px] font-grotesk font-semibold text-[#7C7875] hover:text-[#FF5722] transition-colors"
            >
              Have your own Gemini API key? Enter in Settings →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
