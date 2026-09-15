import React, { useState } from 'react';
import { Upload, CheckCircle2, AlertCircle, X, Receipt, Building, CreditCard, Send, ShieldCheck, Crown } from 'lucide-react';
import { submitPaymentRequest } from '../services/supabase';

interface PaymentProofModalProps {
  isOpen: boolean;
  onClose: () => void;
  userId: string;
  userEmail: string;
  onSubmitted: () => void;
  selectedPlan?: 'monthly' | 'annual' | 'lifetime';
}

export const PaymentProofModal: React.FC<PaymentProofModalProps> = ({
  isOpen,
  onClose,
  userId,
  userEmail,
  onSubmitted,
  selectedPlan = 'annual'
}) => {
  const [planType, setPlanType] = useState<'monthly' | 'annual' | 'lifetime'>(selectedPlan);
  const [paymentMethod, setPaymentMethod] = useState('bank_transfer');
  const [transactionRef, setTransactionRef] = useState('');
  const [receiptImage, setReceiptImage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  if (!isOpen) return null;

  const getAmount = () => {
    switch (planType) {
      case 'monthly': return 4.99;
      case 'lifetime': return 79.00;
      default: return 39.99;
    }
  };

  const handleReceiptUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setReceiptImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!transactionRef.trim() && !receiptImage) {
      setErrorMessage('Please provide either a transaction reference number or a receipt screenshot.');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);

    const result = await submitPaymentRequest(
      userId,
      userEmail,
      planType,
      getAmount(),
      paymentMethod,
      transactionRef,
      receiptImage || undefined
    );

    setIsSubmitting(false);

    if (result.success) {
      setSuccess(true);
      setTimeout(() => {
        onSubmitted();
        onClose();
      }, 1500);
    } else {
      setErrorMessage(result.error || 'Failed to submit payment verification request.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#181716]/75 backdrop-blur-md animate-in fade-in">
      <div className="bg-white w-full max-w-md rounded-[32px] p-6 shadow-2xl border border-[#EDE8E1] flex flex-col font-grotesk max-h-[92vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-[#EDE8E1]">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-[#FFF0EB] border border-[#FF5722]/30 text-[#FF5722] flex items-center justify-center">
              <Receipt className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-condensed text-lg font-bold text-[#181716]">Submit Payment Proof</h2>
              <p className="text-[11px] text-[#7C7875]">Manual Verification & Account Upgrade</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-full text-[#7C7875] hover:text-[#181716] hover:bg-[#F8F6F4]"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {success ? (
          <div className="py-10 text-center space-y-3">
            <div className="w-16 h-16 bg-[#E8F8F0] text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-sm">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            <h3 className="font-condensed text-xl font-bold text-[#181716]">Proof Submitted!</h3>
            <p className="text-xs text-[#7C7875] max-w-xs mx-auto">
              Your payment reference has been recorded. Once verified by the administrator, your account will be upgraded to Pro Unlimited automatically.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="py-4 space-y-4">
            {errorMessage && (
              <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 text-xs rounded-2xl flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Plan Selector */}
            <div>
              <label className="text-[11px] font-bold text-[#181716] uppercase tracking-wider mb-1.5 block">
                Selected Plan
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'annual', name: 'Annual', price: '$39.99/yr' },
                  { id: 'monthly', name: 'Monthly', price: '$4.99/mo' },
                  { id: 'lifetime', name: 'Lifetime', price: '$79 once' }
                ].map((p) => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => setPlanType(p.id as any)}
                    className={`p-2.5 rounded-2xl border text-center transition-all ${
                      planType === p.id
                        ? 'border-[#FF5722] bg-[#FFF0EB] text-[#FF5722] font-bold shadow-xs'
                        : 'border-[#EDE8E1] bg-[#F8F6F4] text-[#7C7875] hover:border-[#181716]/20'
                    }`}
                  >
                    <span className="block text-xs">{p.name}</span>
                    <span className="block text-[11px] font-condensed">{p.price}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Payment Instructions Box */}
            <div className="bg-[#F8F6F4] p-3.5 rounded-2xl border border-[#EDE8E1] space-y-2">
              <h4 className="text-xs font-bold text-[#181716] flex items-center gap-1.5">
                <Building className="w-3.5 h-3.5 text-[#FF5722]" /> Payment Instructions
              </h4>
              <p className="text-[11px] text-[#7C7875] leading-relaxed">
                Please transfer <strong>${getAmount().toFixed(2)} USD</strong> (or equivalent) using your preferred method:
              </p>
              <div className="bg-white p-2.5 rounded-xl border border-[#EDE8E1] text-xs font-mono space-y-1 text-[#181716]">
                <div><span className="text-[#7C7875]">Bank:</span> Standard Chartered / Chase</div>
                <div><span className="text-[#7C7875]">Account / IBAN:</span> PK36SCBL0000001123456701</div>
                <div><span className="text-[#7C7875]">Beneficiary:</span> CardSnap AI Global</div>
                <div><span className="text-[#7C7875]">Wallet / UPI / Easypaisa:</span> +1 (555) 019-2834</div>
              </div>
            </div>

            {/* Receipt Upload */}
            <div>
              <label className="text-[11px] font-bold text-[#181716] uppercase tracking-wider mb-1.5 block flex items-center justify-between">
                <span>Receipt Screenshot / Transfer Slip</span>
                <span className="text-[10px] text-[#7C7875] font-normal">JPG, PNG or PDF</span>
              </label>

              {receiptImage ? (
                <div className="relative aspect-16/9 rounded-2xl overflow-hidden border border-[#EDE8E1] bg-[#181716]">
                  <img src={receiptImage} alt="Receipt Preview" className="w-full h-full object-contain" />
                  <button
                    type="button"
                    onClick={() => setReceiptImage(null)}
                    className="absolute top-2 right-2 p-1.5 bg-black/70 hover:bg-rose-600 text-white rounded-full transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <label className="flex flex-col items-center justify-center p-4 rounded-2xl border-2 border-dashed border-[#EDE8E1] hover:border-[#FF5722] bg-[#F8F6F4] hover:bg-[#FFF0EB] cursor-pointer transition-all text-center">
                  <Upload className="w-6 h-6 text-[#FF5722] mb-1" />
                  <span className="text-xs font-bold text-[#181716]">Tap to upload receipt image</span>
                  <span className="text-[10px] text-[#7C7875]">Upload photo or screenshot of transaction</span>
                  <input type="file" accept="image/*" onChange={handleReceiptUpload} className="hidden" />
                </label>
              )}
            </div>

            {/* Transaction Reference / Sender Info */}
            <div>
              <label className="text-[11px] font-bold text-[#181716] uppercase tracking-wider mb-1.5 block">
                Transaction ID / Sender Name
              </label>
              <input
                type="text"
                required
                value={transactionRef}
                onChange={(e) => setTransactionRef(e.target.value)}
                placeholder="e.g. TRX-982314 or John Doe"
                className="w-full px-3.5 py-2.5 bg-[#F8F6F4] border border-[#EDE8E1] rounded-2xl text-xs font-semibold text-[#181716] focus:outline-none focus:border-[#FF5722]"
              />
            </div>

            {/* Submit Button */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3.5 bg-gradient-to-r from-[#FF5722] to-[#FF4500] hover:brightness-105 text-white font-condensed font-bold text-sm rounded-full shadow-solar transition-transform active:scale-98 flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isSubmitting ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    <span>Submit Proof for Verification</span>
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

