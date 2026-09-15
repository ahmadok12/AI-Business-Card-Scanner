import React, { useState } from 'react';
import type { AppSettings, BusinessCard, MediaItem } from '../../types';
import { Sliders, Database, Download, Upload, Trash2, Sparkle, Crown, Zap } from 'lucide-react';

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
  onResetScans
}) => {
  const [defaultBlock, setDefaultBlock] = useState(settings.defaultBlockName);
  const [autoCapture, setAutoCapture] = useState(settings.autoCaptureEnabled);

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

  return (
    <div className="flex flex-col gap-5 pb-24 animate-in fade-in text-xs font-grotesk">
      <div className="px-1">
        <h1 className="font-syne text-xl font-bold text-[#181716]">Settings</h1>
        <p className="text-xs text-[#7C7875]">Preferences, Quota & Data Management</p>
      </div>

      {/* Plan & Usage Card */}
      <div className="bg-white rounded-[24px] p-5 border border-[#EDE8E1] shadow-porcelain-sm space-y-3">
        <div className="flex items-center justify-between pb-2 border-b border-[#EDE8E1]">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-[#FFF0EB] text-[#FF5722] flex items-center justify-center shadow-2xs">
              <Crown className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-syne font-bold text-[#181716] text-sm">Subscription & Device Quota</h3>
              <p className="text-[10px] text-[#7C7875] font-mono">Device ID: {deviceId.slice(0, 16)}...</p>
            </div>
          </div>
          <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
            isProUser ? 'bg-[#FFF0EB] text-[#FF5722] border border-[#FF5722]/30' : 'bg-[#EDE8E1] text-[#181716]'
          }`}>
            {isProUser ? 'PRO UNLIMITED' : 'FREE TRIAL'}
          </span>
        </div>

        {isProUser ? (
          <div className="p-3 bg-[#FFF0EB] rounded-2xl border border-[#FF5722]/30 text-[#FF5722] text-xs font-bold">
            🎉 Active Pro access with unlimited OCR card scans on this device.
          </div>
        ) : (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-[#181716]">Free OCR Scans Used:</span>
              <span className="font-bold text-[#FF5722]">{scansUsed} / {maxScans} scans</span>
            </div>
            {/* Progress Bar */}
            <div className="w-full h-2.5 bg-[#EDE8E1] rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-[#FF5722] to-[#FF4500] rounded-full transition-all duration-300 shadow-2xs"
                style={{ width: `${Math.min(100, (scansUsed / maxScans) * 100)}%` }}
              />
            </div>
            <div className="flex items-center justify-between pt-1">
              <span className="text-[10px] text-[#7C7875]">
                {Math.max(0, maxScans - scansUsed)} free scans remaining
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

        {onResetScans && (
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
