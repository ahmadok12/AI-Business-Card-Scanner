import React, { useState, useEffect } from 'react';
import type { AppSettings, BusinessCard, MediaItem } from '../../types';
import {
  Sliders,
  Database,
  Download,
  Upload,
  Trash2,
  Sparkle,
  Crown,
  Zap,
  Mail,
  ShieldCheck,
  LogOut,
  LogIn,
  CheckCircle2,
  XCircle,
  Clock,
  ExternalLink,
  ReceiptText,
  RefreshCw
} from 'lucide-react';
import {
  UserProfile,
  PaymentRequestRecord,
  getAdminPaymentRequests,
  updatePaymentStatus
} from '../../services/supabase';

interface SettingsTabProps {
  settings: AppSettings;
  onUpdateSettings: (newSettings: AppSettings) => void;
  onLoadDemoData: () => void;
  onClearAllData: () => void;
  cards: BusinessCard[];
  media: MediaItem[];
  onImportBackup: (cards: BusinessCard[], media: MediaItem[]) => void;
  showToast: (type: 'success' | 'error' | 'info', message: string) => void;
  scansUsed?: number;
  maxScans?: number;
  isProUser?: boolean;
  deviceId?: string;
  onOpenUpgrade?: () => void;
  onResetScans?: () => void;
  currentUser?: { id: string; email?: string } | null;
  userProfile?: UserProfile | null;
  onOpenAuth?: () => void;
  onSignOut?: () => void;
  onOpenPaymentProof?: () => void;
}

export const SettingsTab: React.FC<SettingsTabProps> = ({
  settings,
  onUpdateSettings,
  onLoadDemoData,
  onClearAllData,
  cards,
  media,
  onImportBackup,
  showToast,
  scansUsed = 0,
  maxScans = 10,
  isProUser = false,
  deviceId = '',
  onOpenUpgrade,
  onResetScans,
  currentUser,
  userProfile,
  onOpenAuth,
  onSignOut,
  onOpenPaymentProof
}) => {
  const [defaultBlock, setDefaultBlock] = useState(settings.defaultBlockName);
  const [autoCapture, setAutoCapture] = useState(settings.autoCaptureEnabled);
  const [adminRequests, setAdminRequests] = useState<PaymentRequestRecord[]>([]);
  const [isLoadingAdmin, setIsLoadingAdmin] = useState(false);
  const [selectedReceipt, setSelectedReceipt] = useState<string | null>(null);

  useEffect(() => {
    if (userProfile?.is_admin) {
      loadAdminRequests();
    }
  }, [userProfile?.is_admin]);

  const loadAdminRequests = async () => {
    setIsLoadingAdmin(true);
    try {
      const data = await getAdminPaymentRequests();
      setAdminRequests(data);
    } catch {
      showToast('error', 'Could not load payment requests');
    } finally {
      setIsLoadingAdmin(false);
    }
  };

  const handleApprove = async (id: string) => {
    const ok = await updatePaymentStatus(id, 'approved', 'Verified and approved by admin');
    if (ok) {
      showToast('success', 'Payment verified! User account upgraded to Pro.');
      loadAdminRequests();
    } else {
      showToast('error', 'Failed to approve payment');
    }
  };

  const handleReject = async (id: string) => {
    const ok = await updatePaymentStatus(id, 'rejected', 'Transaction reference or receipt could not be verified');
    if (ok) {
      showToast('info', 'Payment request rejected');
      loadAdminRequests();
    } else {
      showToast('error', 'Failed to reject payment');
    }
  };

  const handleSave = () => {
    onUpdateSettings({
      ...settings,
      defaultBlockName: defaultBlock.trim() || 'General',
      autoCaptureEnabled: autoCapture
    });
    showToast('success', 'Preferences saved successfully');
  };

  const handleExportBackup = () => {
    const backupData = {
      version: 1,
      timestamp: Date.now(),
      cards,
      media,
      settings
    };
    const jsonStr = JSON.stringify(backupData, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `cardscanner_backup_${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showToast('success', 'Backup downloaded');
  };

  const handleImportFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const parsed = JSON.parse(event.target?.result as string);
          if (Array.isArray(parsed.cards)) {
            onImportBackup(parsed.cards, parsed.media || []);
            showToast('success', `Restored ${parsed.cards.length} cards and ${(parsed.media || []).length} media items!`);
          } else {
            showToast('error', 'Invalid backup format');
          }
        } catch (err) {
          showToast('error', 'Failed to read JSON backup');
        }
      };
      reader.readAsText(file);
    }
  };

  // Determine effective display quota
  const effectiveScansUsed = userProfile ? userProfile.scans_used : scansUsed;
  const effectiveMaxScans = userProfile ? userProfile.max_scans : maxScans;
  const effectiveIsPro = userProfile ? userProfile.plan_tier === 'pro' : isProUser;

  return (
    <div className="flex flex-col gap-5 pb-24 animate-in fade-in text-xs font-grotesk">
      <div className="px-1">
        <h1 className="font-syne text-xl font-bold text-[#181716]">Settings</h1>
        <p className="text-xs text-[#7C7875]">Account, Cloud Sync & Preferences</p>
      </div>

      {/* Supabase Account & Cloud Sync Card */}
      <div className="bg-white rounded-[24px] p-5 border border-[#EDE8E1] shadow-porcelain-sm space-y-3.5">
        <div className="flex items-center justify-between pb-2 border-b border-[#EDE8E1]">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-[#FFF0EB] text-[#FF5722] flex items-center justify-center shadow-2xs">
              <Mail className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-syne font-bold text-[#181716] text-sm">Account & Cloud Sync</h3>
              <p className="text-[10px] text-[#7C7875]">Supabase Passwordless 6-Digit OTP</p>
            </div>
          </div>
          {currentUser ? (
            <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Connected
            </span>
          ) : (
            <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-[#EDE8E1] text-[#7C7875]">
              Guest / Offline
            </span>
          )}
        </div>

        {currentUser ? (
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-[#F8F6F4] rounded-[18px] border border-[#EDE8E1]">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-[#181716] text-white flex items-center justify-center font-bold text-xs">
                  {currentUser.email ? currentUser.email[0].toUpperCase() : 'U'}
                </div>
                <div>
                  <p className="font-bold text-xs text-[#181716] font-syne">{currentUser.email}</p>
                  <p className="text-[10px] text-[#7C7875]">
                    Role: {userProfile?.is_admin ? '⚡ Administrator' : 'Standard User'} • Tier: {effectiveIsPro ? '👑 Pro Unlimited' : 'Free Trial'}
                  </p>
                </div>
              </div>
              <button
                onClick={onSignOut}
                className="flex items-center gap-1 px-3 py-1.5 bg-white hover:bg-rose-50 text-rose-600 rounded-full border border-[#EDE8E1] text-[11px] font-bold transition-colors"
              >
                <LogOut className="w-3 h-3" /> Sign Out
              </button>
            </div>

            <div className="flex items-center gap-2">
              {!effectiveIsPro && onOpenPaymentProof && (
                <button
                  onClick={onOpenPaymentProof}
                  className="flex-1 flex items-center justify-center gap-1.5 py-2.5 bg-gradient-to-r from-[#FF5722] to-[#FF4500] text-white font-bold text-xs rounded-full shadow-solar transition-transform active:scale-98"
                >
                  <ReceiptText className="w-3.5 h-3.5" /> Submit Bank/Wallet Payment Proof
                </button>
              )}
            </div>
          </div>
        ) : (
          <div className="space-y-2.5">
            <p className="text-[11px] text-[#7C7875] leading-relaxed">
              You are using local offline storage. Sign in with a 6-digit email code to sync cards across devices, preserve your 10 free scans in Supabase cloud, and submit payment verification.
            </p>
            <button
              onClick={onOpenAuth}
              className="w-full flex items-center justify-center gap-2 py-3 bg-[#181716] hover:bg-[#2c2b29] text-white font-bold text-xs rounded-full transition-transform active:scale-98 shadow-sm"
            >
              <LogIn className="w-3.5 h-3.5 text-[#FF8A65]" />
              <span>Sign In with Email (6-Digit OTP)</span>
            </button>
          </div>
        )}
      </div>

      {/* Admin Panel: Payment Verification (Visible Only To Admins) */}
      {userProfile?.is_admin && (
        <div className="bg-white rounded-[24px] p-5 border-2 border-[#FF5722]/30 shadow-porcelain-sm space-y-3.5">
          <div className="flex items-center justify-between pb-2 border-b border-[#EDE8E1]">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-[#FF5722] to-[#FF8A65] text-white flex items-center justify-center shadow-2xs">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-syne font-bold text-[#181716] text-sm">Admin Payment Verification</h3>
                <p className="text-[10px] text-[#7C7875]">Approve manual bank/wallet transfer proofs</p>
              </div>
            </div>
            <button
              onClick={loadAdminRequests}
              disabled={isLoadingAdmin}
              className="p-2 rounded-full hover:bg-[#F5F3EF] text-[#7C7875] hover:text-[#181716] transition-colors"
              title="Refresh requests"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoadingAdmin ? 'animate-spin' : ''}`} />
            </button>
          </div>

          {adminRequests.length === 0 ? (
            <p className="text-center py-4 text-[11px] text-[#7C7875]">No payment requests submitted yet.</p>
          ) : (
            <div className="space-y-2.5 max-h-80 overflow-y-auto pr-1">
              {adminRequests.map((req) => (
                <div
                  key={req.id}
                  className="p-3 bg-[#F8F6F4] rounded-[18px] border border-[#EDE8E1] space-y-2"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="font-bold text-xs text-[#181716] block font-syne">{req.user_email}</span>
                      <span className="text-[10px] text-[#7C7875]">
                        Plan: <strong className="uppercase text-[#181716]">{req.plan_type}</strong> • ${req.amount} via {req.payment_method}
                      </span>
                      {req.transaction_reference && (
                        <span className="block text-[10px] font-mono text-[#FF5722] mt-0.5">
                          Ref: {req.transaction_reference}
                        </span>
                      )}
                    </div>
                    <span
                      className={`text-[9px] font-bold px-2 py-0.5 rounded-full uppercase ${
                        req.status === 'approved'
                          ? 'bg-emerald-100 text-emerald-700'
                          : req.status === 'rejected'
                          ? 'bg-rose-100 text-rose-700'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {req.status}
                    </span>
                  </div>

                  {req.receipt_image_url && (
                    <div className="pt-1">
                      <button
                        onClick={() => setSelectedReceipt(req.receipt_image_url || null)}
                        className="flex items-center gap-1 text-[10px] font-bold text-[#FF5722] hover:underline"
                      >
                        <ExternalLink className="w-3 h-3" /> View Submitted Receipt
                      </button>
                    </div>
                  )}

                  {req.status === 'pending' && (
                    <div className="flex items-center gap-2 pt-1.5 border-t border-[#EDE8E1]">
                      <button
                        onClick={() => handleApprove(req.id)}
                        className="flex-1 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-full font-bold text-[11px] flex items-center justify-center gap-1 shadow-xs transition-colors"
                      >
                        <CheckCircle2 className="w-3 h-3" /> Approve (Set Pro)
                      </button>
                      <button
                        onClick={() => handleReject(req.id)}
                        className="py-1.5 px-3 bg-white hover:bg-rose-50 text-rose-600 rounded-full font-bold text-[11px] border border-rose-200 transition-colors"
                      >
                        <XCircle className="w-3 h-3" /> Reject
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Plan & Usage Card */}
      <div className="bg-white rounded-[24px] p-5 border border-[#EDE8E1] shadow-porcelain-sm space-y-3">
        <div className="flex items-center justify-between pb-2 border-b border-[#EDE8E1]">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-[#FFF0EB] text-[#FF5722] flex items-center justify-center shadow-2xs">
              <Crown className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-syne font-bold text-[#181716] text-sm">Subscription & Quota</h3>
              <p className="text-[10px] text-[#7C7875] font-mono">
                {currentUser ? `Cloud Synced: ${currentUser.email}` : `Device ID: ${deviceId.slice(0, 16)}...`}
              </p>
            </div>
          </div>
          <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
            effectiveIsPro ? 'bg-[#FFF0EB] text-[#FF5722] border border-[#FF5722]/30' : 'bg-[#EDE8E1] text-[#181716]'
          }`}>
            {effectiveIsPro ? 'PRO UNLIMITED' : 'FREE TRIAL'}
          </span>
        </div>

        {effectiveIsPro ? (
          <div className="p-3 bg-[#FFF0EB] rounded-2xl border border-[#FF5722]/30 text-[#FF5722] text-xs font-bold">
            🎉 Active Pro access with unlimited OCR card scans.
          </div>
        ) : (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-[#181716]">Free OCR Scans Used:</span>
              <span className="font-bold text-[#FF5722]">{effectiveScansUsed} / {effectiveMaxScans} scans</span>
            </div>
            {/* Progress Bar */}
            <div className="w-full h-2.5 bg-[#EDE8E1] rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-[#FF5722] to-[#FF4500] rounded-full transition-all duration-300 shadow-2xs"
                style={{ width: `${Math.min(100, (effectiveScansUsed / effectiveMaxScans) * 100)}%` }}
              />
            </div>
            <div className="flex items-center justify-between pt-1">
              <span className="text-[10px] text-[#7C7875]">
                {Math.max(0, effectiveMaxScans - effectiveScansUsed)} free scans remaining
              </span>
              <button
                onClick={onOpenUpgrade}
                className="flex items-center gap-1 text-[11px] font-bold text-[#FF5722] hover:text-[#d83900]"
              >
                <Zap className="w-3 h-3 fill-current" /> Upgrade to Unlimited
              </button>
            </div>
          </div>
        )}

        {onResetScans && !currentUser && (
          <div className="pt-1 border-t border-[#EDE8E1] flex justify-end">
            <button
              onClick={() => {
                onResetScans();
                showToast('info', 'Free scans count reset to 0');
              }}
              className="text-[10px] text-[#7C7875] hover:text-[#181716]"
            >
              Reset Scans (Testing only)
            </button>
          </div>
        )}
      </div>

      {/* Receipt Preview Lightbox Modal */}
      {selectedReceipt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#181716]/80 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-[24px] p-4 max-w-sm w-full space-y-3 relative border border-[#EDE8E1]">
            <div className="flex items-center justify-between pb-2 border-b border-[#EDE8E1]">
              <h4 className="font-syne font-bold text-sm text-[#181716]">Submitted Receipt</h4>
              <button
                onClick={() => setSelectedReceipt(null)}
                className="p-1.5 rounded-full hover:bg-[#F5F3EF] text-[#7C7875]"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>
            <div className="max-h-[70vh] overflow-y-auto rounded-xl bg-[#F8F6F4] flex items-center justify-center p-2">
              <img
                src={selectedReceipt}
                alt="Payment Receipt"
                className="max-w-full rounded-lg object-contain shadow-xs"
              />
            </div>
          </div>
        </div>
      )}

      {/* Defaults & Scanner Preferences */}
      <div className="bg-white rounded-[24px] p-5 border border-[#EDE8E1] shadow-porcelain-sm space-y-4">
        <div className="flex items-center gap-2 pb-2 border-b border-[#EDE8E1]">
          <div className="w-8 h-8 rounded-xl bg-[#FFF0EB] text-[#FF5722] flex items-center justify-center shadow-2xs">
            <Sliders className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-syne font-bold text-[#181716] text-sm">Defaults & Preferences</h3>
            <p className="text-[11px] text-[#7C7875]">Default category name & scanner settings</p>
          </div>
        </div>

        <div>
          <label className="text-[11px] font-semibold text-[#181716] block mb-1">
            Default Block / Category Name
          </label>
          <input
            type="text"
            value={defaultBlock}
            onChange={(e) => setDefaultBlock(e.target.value)}
            placeholder="e.g. Networking / Leads"
            className="w-full px-3.5 py-2.5 bg-[#F5F3EF] border border-[#EDE8E1] rounded-full text-xs text-[#181716] font-medium focus:outline-none focus:border-[#FF5722]"
          />
          <p className="text-[10px] text-[#7C7875] mt-1">
            Assigned automatically to all new cards, photos, and voice notes so you don't need to re-enter it each time.
          </p>
        </div>

        <div className="flex items-center justify-between pt-2 border-t border-[#EDE8E1]">
          <div>
            <span className="font-bold text-xs text-[#181716] block">Auto-Capture Cards</span>
            <span className="text-[10px] text-[#7C7875]">
              Automatically snap card when held steady in guide frame
            </span>
          </div>
          <button
            type="button"
            onClick={() => setAutoCapture(!autoCapture)}
            className={`w-12 h-6 rounded-full transition-colors relative cursor-pointer shadow-2xs ${
              autoCapture ? 'bg-[#FF5722]' : 'bg-[#EDE8E1]'
            }`}
          >
            <div
              className={`w-4 h-4 rounded-full bg-white transition-transform absolute top-1 ${
                autoCapture ? 'right-1' : 'left-1'
              }`}
            />
          </button>
        </div>

        <button
          onClick={handleSave}
          className="w-full py-2.5 bg-gradient-to-r from-[#FF5722] to-[#FF4500] hover:opacity-95 text-white font-syne font-bold text-xs rounded-full shadow-solar transition-transform active:scale-98"
        >
          Save Preferences
        </button>
      </div>

      {/* Data & Backup */}
      <div className="bg-white rounded-[24px] p-5 border border-[#EDE8E1] shadow-porcelain-sm space-y-3">
        <div className="flex items-center gap-2 pb-2 border-b border-[#EDE8E1]">
          <div className="w-8 h-8 rounded-xl bg-[#FFF0EB] text-[#FF5722] flex items-center justify-center shadow-2xs">
            <Database className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-syne font-bold text-[#181716] text-sm">Data & Backup</h3>
            <p className="text-[11px] text-[#7C7875]">100% on-device private IndexedDB storage</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={handleExportBackup}
            className="flex items-center justify-center gap-2 p-3 bg-[#F5F3EF] hover:bg-[#EDE8E1] text-[#181716] font-bold rounded-full border border-[#EDE8E1] transition-colors"
          >
            <Download className="w-4 h-4 text-[#FF5722]" />
            <span>Export JSON</span>
          </button>

          <label className="flex items-center justify-center gap-2 p-3 bg-[#F5F3EF] hover:bg-[#EDE8E1] text-[#181716] font-bold rounded-full border border-[#EDE8E1] cursor-pointer transition-colors">
            <Upload className="w-4 h-4 text-[#FF5722]" />
            <span>Import JSON</span>
            <input type="file" accept=".json" onChange={handleImportFile} className="hidden" />
          </label>
        </div>

        <button
          onClick={onLoadDemoData}
          className="w-full flex items-center justify-center gap-2 py-2.5 bg-[#FFF0EB] hover:bg-[#ffe5dc] text-[#FF5722] font-bold text-xs rounded-full border border-[#FF5722]/30 transition-colors"
        >
          <Sparkle className="w-4 h-4" />
          Load Demo Sample Contacts & Media
        </button>

        <button
          onClick={() => {
            if (confirm('Are you sure you want to delete all saved business cards and media?')) {
              onClearAllData();
              showToast('info', 'Database cleared');
            }
          }}
          className="w-full flex items-center justify-center gap-2 py-2.5 bg-[#EDE8E1] hover:bg-[#E0DAD1] text-rose-600 font-bold text-xs rounded-full transition-colors"
        >
          <Trash2 className="w-4 h-4" />
          Clear All App Data
        </button>
      </div>
    </div>
  );
};
