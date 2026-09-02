import React, { useState } from 'react';
import { Sparkles, Check, X, ShieldCheck, Zap, Crown, CreditCard } from 'lucide-react';

interface UpgradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  scansUsed: number;
  maxScans: number;
  onUpgradeSimulated: () => void;
  onOpenSettings: () => void;
}

export const UpgradeModal: React.FC<UpgradeModalProps> = ({
  isOpen,
  onClose,
  scansUsed,
  maxScans,
  onUpgradeSimulated,
  onOpenSettings
}) => {
  const [selectedPlan, setSelectedPlan] = useState<'monthly' | 'annual' | 'lifetime'>('annual');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3.5 bg-slate-950/70 backdrop-blur-md animate-in fade-in">
      <div className="bg-white w-full max-w-sm rounded-3xl shadow-2xl border border-slate-100 flex flex-col max-h-[92vh] overflow-hidden my-auto">
        {/* Banner */}
        <div className="bg-gradient-to-br from-indigo-600 via-indigo-700 to-slate-900 p-5 text-white relative text-center">
          <button
            onClick={onClose}
            className="absolute top-3 right-3 p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="w-12 h-12 rounded-2xl bg-amber-400 text-slate-900 flex items-center justify-center mx-auto mb-2 shadow-lg">
            <Crown className="w-6 h-6 fill-current" />
          </div>

          <span className="text-[10px] font-bold uppercase tracking-wider bg-amber-400/20 text-amber-300 px-2.5 py-0.5 rounded-full border border-amber-400/30 inline-block mb-1.5">
            Free Trial Limit Reached
          </span>

          <h2 className="text-lg font-bold">Unlock Unlimited Scans</h2>
          <p className="text-xs text-indigo-100/80 mt-0.5">
            You've used {scansUsed} of {maxScans} free OCR scans on this device.
          </p>
        </div>

        {/* Feature List */}
        <div className="p-4 space-y-4 overflow-y-auto text-xs">
          <div className="bg-indigo-50/60 rounded-2xl p-3 border border-indigo-100 space-y-2">
            <h4 className="font-bold text-xs text-indigo-950 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-indigo-600" /> CardSnap Pro Features
            </h4>
            <ul className="space-y-1.5 text-[11px] text-slate-700">
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
            <label className="text-[11px] font-bold text-slate-700 block">Choose a Plan</label>

            <div
              onClick={() => setSelectedPlan('annual')}
              className={`p-3 rounded-2xl border transition-all cursor-pointer flex items-center justify-between relative ${
                selectedPlan === 'annual'
                  ? 'border-indigo-600 bg-indigo-50/50 shadow-xs'
                  : 'border-slate-200 bg-white hover:border-slate-300'
              }`}
            >
              <span className="absolute -top-2 right-3 text-[9px] font-bold bg-indigo-600 text-white px-2 py-0.2 rounded-full shadow-xs">
                BEST VALUE • SAVE 33%
              </span>
              <div>
                <span className="font-bold text-xs text-slate-900 block">Annual Pro Plan</span>
                <span className="text-[10px] text-slate-500">$3.33 / month (billed $39.99/yr)</span>
              </div>
              <div className="text-right">
                <span className="font-bold text-sm text-indigo-600">$39.99</span>
                <span className="text-[10px] text-slate-400 block">/ year</span>
              </div>
            </div>

            <div
              onClick={() => setSelectedPlan('monthly')}
              className={`p-3 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${
                selectedPlan === 'monthly'
                  ? 'border-indigo-600 bg-indigo-50/50 shadow-xs'
                  : 'border-slate-200 bg-white hover:border-slate-300'
              }`}
            >
              <div>
                <span className="font-bold text-xs text-slate-900 block">Monthly Pro Plan</span>
                <span className="text-[10px] text-slate-500">Flexible month-to-month billing</span>
              </div>
              <div className="text-right">
                <span className="font-bold text-sm text-slate-900">$4.99</span>
                <span className="text-[10px] text-slate-400 block">/ month</span>
              </div>
            </div>

            <div
              onClick={() => setSelectedPlan('lifetime')}
              className={`p-3 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${
                selectedPlan === 'lifetime'
                  ? 'border-indigo-600 bg-indigo-50/50 shadow-xs'
                  : 'border-slate-200 bg-white hover:border-slate-300'
              }`}
            >
              <div>
                <span className="font-bold text-xs text-slate-900 block">Lifetime Access</span>
                <span className="text-[10px] text-slate-500">One-time payment, forever unlimited</span>
              </div>
              <div className="text-right">
                <span className="font-bold text-sm text-slate-900">$79.00</span>
                <span className="text-[10px] text-slate-400 block">one-time</span>
              </div>
            </div>
          </div>
        </div>

        {/* Action Footer */}
        <div className="p-4 border-t border-slate-100 bg-white space-y-2">
          <button
            onClick={onUpgradeSimulated}
            className="w-full flex items-center justify-center gap-2 py-3 bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 text-white font-bold text-xs rounded-2xl shadow-md transition-transform active:scale-98"
          >
            <Zap className="w-4 h-4 fill-current text-amber-300" />
            <span>Upgrade to Unlimited ($39.99/yr)</span>
          </button>

          <div className="text-center pt-1">
            <button
              onClick={() => {
                onClose();
                onOpenSettings();
              }}
              className="text-[11px] font-semibold text-slate-500 hover:text-indigo-600 transition-colors"
            >
              Have your own Gemini API key? Enter in Settings →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
