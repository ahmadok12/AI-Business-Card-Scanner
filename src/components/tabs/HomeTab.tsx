import { BusinessCardItem } from '../BusinessCardItem';
import React from 'react';
import type { BusinessCard } from '../../types';
import { Sparkles, Eye, Paperclip, Camera, Mic, Image as ImageIcon, MessageCircle } from 'lucide-react';

interface HomeTabProps {
  cards: BusinessCard[];
  onOpenScanner: () => void;
  onOpenVoiceRecorder: () => void;
  onOpenAddPhoto: () => void;
  onOpenCardDetail: (card: BusinessCard) => void;
  onOpenQuickAttach: (card: BusinessCard) => void;
  onLoadDemoData: () => void;
  totalMediaCount: number;
  totalAudioCount: number;
  scansUsed?: number;
  maxScans?: number;
  isProUser?: boolean;
  onOpenUpgrade?: () => void;
}

export const HomeTab: React.FC<HomeTabProps> = ({
  cards,
  onOpenScanner,
  onOpenVoiceRecorder,
  onOpenAddPhoto,
  onOpenCardDetail,
  onOpenQuickAttach,
  onLoadDemoData,
  totalMediaCount,
  totalAudioCount,
  scansUsed = 0,
  maxScans = 10,
  isProUser = false,
  onOpenUpgrade
}) => {
  const recentCards = cards.slice(0, 10);

  return (
    <div className="flex flex-col gap-5 pb-24 animate-in fade-in">
      <div className="bg-gradient-to-br from-indigo-600 via-indigo-700 to-slate-900 rounded-3xl p-5 text-white shadow-xl relative overflow-hidden">
        <div className="absolute -right-8 -top-8 w-36 h-36 bg-white/10 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute right-4 bottom-2 w-24 h-24 bg-emerald-400/10 rounded-full blur-xl pointer-events-none" />

        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-emerald-300" />
            </div>
            <span className="font-bold text-sm tracking-wide">CardSnap AI</span>
          </div>
          {isProUser ? (
            <span className="text-[11px] bg-amber-400/20 text-amber-300 px-2.5 py-0.5 rounded-full font-bold border border-amber-400/30">
              ★ PRO PLAN (Unlimited)
            </span>
          ) : (
            <button
              onClick={onOpenUpgrade}
              className="text-[11px] bg-white/20 hover:bg-white/30 text-white px-2.5 py-0.5 rounded-full font-semibold border border-white/30 flex items-center gap-1 transition-colors"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              {Math.max(0, maxScans - scansUsed)} of {maxScans} Free Scans Left
            </button>
          )}
        </div>

        <h1 className="text-xl font-bold mb-1">Smart Business Card Scanner</h1>
        <p className="text-xs text-indigo-100/80 mb-5">
          Scan cards, extract details with AI, and record 1-tap voice notes.
        </p>

        <div className="grid grid-cols-3 gap-2.5 pt-3 border-t border-white/10">
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-2.5 text-center">
            <span className="text-lg font-bold block">{cards.length}</span>
            <span className="text-[10px] text-indigo-200">Total Cards</span>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-2.5 text-center">
            <span className="text-lg font-bold block">{totalAudioCount}</span>
            <span className="text-[10px] text-indigo-200">Voice Notes</span>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-2.5 text-center">
            <span className="text-lg font-bold block">{totalMediaCount}</span>
            <span className="text-[10px] text-indigo-200">Media Items</span>
          </div>
        </div>
      </div>

      <div>
        <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2.5 px-1">
          Quick Actions
        </h2>
        <div className="grid grid-cols-3 gap-2.5">
          <button
            onClick={onOpenScanner}
            className="flex flex-col items-center justify-center p-3.5 bg-white hover:bg-indigo-50/50 border border-slate-200/80 rounded-2xl shadow-xs transition-all active:scale-95 group text-center"
          >
            <div className="w-10 h-10 rounded-2xl bg-indigo-50 group-hover:bg-indigo-600 text-indigo-600 group-hover:text-white flex items-center justify-center mb-1.5 transition-colors shadow-xs">
              <Camera className="w-5 h-5" />
            </div>
            <span className="text-xs font-bold text-slate-800">Scan Card</span>
            <span className="text-[10px] text-slate-400">AI Scanner</span>
          </button>

          <button
            onClick={onOpenVoiceRecorder}
            className="flex flex-col items-center justify-center p-3.5 bg-white hover:bg-rose-50/50 border border-slate-200/80 rounded-2xl shadow-xs transition-all active:scale-95 group text-center"
          >
            <div className="w-10 h-10 rounded-2xl bg-rose-50 group-hover:bg-rose-600 text-rose-600 group-hover:text-white flex items-center justify-center mb-1.5 transition-colors shadow-xs">
              <Mic className="w-5 h-5" />
            </div>
            <span className="text-xs font-bold text-slate-800">Record Voice</span>
            <span className="text-[10px] text-slate-400">1-Tap Memo</span>
          </button>

          <button
            onClick={onOpenAddPhoto}
            className="flex flex-col items-center justify-center p-3.5 bg-white hover:bg-emerald-50/50 border border-slate-200/80 rounded-2xl shadow-xs transition-all active:scale-95 group text-center"
          >
            <div className="w-10 h-10 rounded-2xl bg-emerald-50 group-hover:bg-emerald-600 text-emerald-600 group-hover:text-white flex items-center justify-center mb-1.5 transition-colors shadow-xs">
              <ImageIcon className="w-5 h-5" />
            </div>
            <span className="text-xs font-bold text-slate-800">Add Photo</span>
            <span className="text-[10px] text-slate-400">Camera / Files</span>
          </button>
        </div>
      </div>

      <div>
        <div className="flex items-center justify-between mb-3 px-1">
          <div>
            <h2 className="text-sm font-bold text-slate-900">Recently Saved Cards</h2>
            <p className="text-[11px] text-slate-400">Latest 10 scanned contacts</p>
          </div>
          {cards.length === 0 && (
            <button
              onClick={onLoadDemoData}
              className="text-xs font-semibold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 px-3 py-1 rounded-xl transition-colors"
            >
              Load Demo Cards
            </button>
          )}
        </div>

        {recentCards.length > 0 ? (
          <div className="space-y-3">
            {recentCards.map((card) => (
              <BusinessCardItem
                key={card.id}
                card={card}
                onOpenCardDetail={onOpenCardDetail}
                onOpenQuickAttach={onOpenQuickAttach}
              />
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-3xl border border-slate-100 p-8 text-center shadow-xs">
            <div className="w-14 h-14 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto mb-3">
              <Camera className="w-7 h-7" />
            </div>
            <h3 className="text-sm font-bold text-slate-800 mb-1">No Cards Scanned Yet</h3>
            <p className="text-xs text-slate-400 max-w-xs mx-auto mb-4">
              Tap the Scan button below to capture your first business card with Gemini OCR.
            </p>
            <div className="flex items-center justify-center gap-2">
              <button
                onClick={onOpenScanner}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs rounded-xl shadow-xs transition-colors"
              >
                Scan Now
              </button>
              <button
                onClick={onLoadDemoData}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs rounded-xl transition-colors"
              >
                Load Demo Cards
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
