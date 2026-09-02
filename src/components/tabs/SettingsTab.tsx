import React, { useState } from 'react';
import type { AppSettings, BusinessCard, MediaItem } from '../../types';
import { Sparkles, Sliders, Database, Download, Upload, Trash2, Eye, EyeOff, RefreshCw, Shield, Sparkle } from 'lucide-react';
import { testGeminiApiKey } from '../../services/gemini';

interface SettingsTabProps {
  settings: AppSettings;
  onUpdateSettings: (newSettings: AppSettings) => void;
  onLoadDemoData: () => void;
  onClearAllData: () => void;
  cards: BusinessCard[];
  media: MediaItem[];
  onImportBackup: (cards: BusinessCard[], media: MediaItem[]) => void;
  showToast: (type: 'success' | 'error' | 'info', message: string) => void;
}

export const SettingsTab: React.FC<SettingsTabProps> = ({
  settings,
  onUpdateSettings,
  onLoadDemoData,
  onClearAllData,
  cards,
  media,
  onImportBackup,
  showToast
}) => {
  const [apiKey, setApiKey] = useState(settings.geminiApiKey);
  const [model, setModel] = useState(settings.geminiModel || 'gemini-3-flash-preview');
  const [defaultBlock, setDefaultBlock] = useState(settings.defaultBlockName);
  const [autoCapture, setAutoCapture] = useState(settings.autoCaptureEnabled);
  const [showKey, setShowKey] = useState(false);
  const [isTestingKey, setIsTestingKey] = useState(false);

  const handleSave = () => {
    onUpdateSettings({
      ...settings,
      geminiApiKey: apiKey.trim(),
      geminiModel: model,
      defaultBlockName: defaultBlock.trim() || 'General',
      autoCaptureEnabled: autoCapture
    });
    showToast('success', 'Settings saved successfully');
  };

  const handleTestKey = async () => {
    if (!apiKey.trim()) {
      showToast('error', 'Please enter a Gemini API Key first');
      return;
    }
    setIsTestingKey(true);
    try {
      await testGeminiApiKey(apiKey.trim(), model);
      showToast('success', 'Gemini API Key verified and working!');
    } catch (err: any) {
      showToast('error', `Verification failed: ${err.message || 'Check key and permissions'}`);
    } finally {
      setIsTestingKey(false);
    }
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
    <div className="flex flex-col gap-5 pb-24 animate-in fade-in text-xs">
      <div className="px-1">
        <h1 className="text-xl font-bold text-slate-900">Settings</h1>
        <p className="text-xs text-slate-500">Configure AI OCR, Default Block Name, & Data</p>
      </div>

      <div className="bg-white rounded-3xl p-5 border border-slate-100 shadow-xs space-y-4">
        <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
          <div className="w-7 h-7 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-bold text-slate-900 text-sm">Gemini AI Model & OCR</h3>
            <p className="text-[11px] text-slate-400">Google Gemini API key and model selection</p>
          </div>
        </div>

        <div>
          <label className="text-[11px] font-semibold text-slate-700 block mb-1.5">
            Gemini API Key
          </label>
          <div className="relative">
            <input
              type={showKey ? 'text' : 'password'}
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="Paste your Gemini API key..."
              className="w-full pl-3.5 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-mono text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <button
              type="button"
              onClick={() => setShowKey(!showKey)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            >
              {showKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
          <div className="flex items-center justify-between mt-2">
            <span className="text-[10px] text-slate-400">Pre-configured with your API key</span>
            <button
              onClick={handleTestKey}
              disabled={isTestingKey}
              className="text-[11px] font-semibold text-indigo-600 hover:text-indigo-700 bg-indigo-50 hover:bg-indigo-100 px-3 py-1 rounded-lg transition-colors flex items-center gap-1.5"
            >
              {isTestingKey ? <RefreshCw className="w-3 h-3 animate-spin" /> : <Shield className="w-3 h-3" />}
              {isTestingKey ? 'Verifying...' : 'Test Connection'}
            </button>
          </div>
        </div>

        <div>
          <label className="text-[11px] font-semibold text-slate-700 block mb-1.5">
            Gemini Model (Default: Least Resource Model)
          </label>
          <select
            value={model}
            onChange={(e) => setModel(e.target.value)}
            className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
          >
            <option value="gemini-3-flash-preview">gemini-3-flash-preview (Fastest & Lightest - Recommended)</option>
            <option value="gemini-3.5-flash-lite">gemini-3.5-flash-lite (Ultra-Lightweight Flash)</option>
            <option value="gemini-3.7-flash">gemini-3.7-flash (Gemini 3.7 Flash)</option>
            <option value="gemini-flash-latest">gemini-flash-latest (Auto Latest Flash)</option>
          </select>
        </div>
      </div>

      <div className="bg-white rounded-3xl p-5 border border-slate-100 shadow-xs space-y-4">
        <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
          <div className="w-7 h-7 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
            <Sliders className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-bold text-slate-900 text-sm">Defaults & Scanner Preferences</h3>
            <p className="text-[11px] text-slate-400">Save time during card captures</p>
          </div>
        </div>

        <div>
          <label className="text-[11px] font-semibold text-slate-700 block mb-1">
            Default Block / Category Name
          </label>
          <input
            type="text"
            value={defaultBlock}
            onChange={(e) => setDefaultBlock(e.target.value)}
            placeholder="e.g. Networking / Leads"
            className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          <p className="text-[10px] text-slate-400 mt-1">
            This name will be assigned automatically to all new cards, photos, and voice notes so you don't need to re-enter it each time.
          </p>
        </div>

        <div className="flex items-center justify-between pt-2 border-t border-slate-100">
          <div>
            <span className="font-semibold text-xs text-slate-800 block">Auto-Capture Cards</span>
            <span className="text-[10px] text-slate-400">
              Automatically snap card when held steady in guide frame
            </span>
          </div>
          <button
            type="button"
            onClick={() => setAutoCapture(!autoCapture)}
            className={`w-11 h-6 rounded-full transition-colors relative ${
              autoCapture ? 'bg-indigo-600' : 'bg-slate-200'
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
          className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl shadow-xs transition-transform active:scale-98"
        >
          Save Preferences
        </button>
      </div>

      <div className="bg-white rounded-3xl p-5 border border-slate-100 shadow-xs space-y-3">
        <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
          <div className="w-7 h-7 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <Database className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-bold text-slate-900 text-sm">Data & Backup</h3>
            <p className="text-[11px] text-slate-400">Offline IndexedDB storage</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={handleExportBackup}
            className="flex items-center justify-center gap-2 p-3 bg-slate-50 hover:bg-slate-100 text-slate-700 font-semibold rounded-xl border border-slate-200 transition-colors"
          >
            <Download className="w-4 h-4 text-indigo-600" />
            <span>Export JSON</span>
          </button>

          <label className="flex items-center justify-center gap-2 p-3 bg-slate-50 hover:bg-slate-100 text-slate-700 font-semibold rounded-xl border border-slate-200 cursor-pointer transition-colors">
            <Upload className="w-4 h-4 text-indigo-600" />
            <span>Import JSON</span>
            <input type="file" accept=".json" onChange={handleImportFile} className="hidden" />
          </label>
        </div>

        <button
          onClick={onLoadDemoData}
          className="w-full flex items-center justify-center gap-2 py-2.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-semibold rounded-xl transition-colors"
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
          className="w-full flex items-center justify-center gap-2 py-2.5 bg-rose-50 hover:bg-rose-100 text-rose-600 font-semibold rounded-xl transition-colors"
        >
          <Trash2 className="w-4 h-4" />
          Clear All App Data
        </button>
      </div>
    </div>
  );
};
