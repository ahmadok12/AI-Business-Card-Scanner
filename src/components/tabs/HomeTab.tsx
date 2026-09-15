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
    <div className="flex flex-col gap-5 pb-24 animate-in fade-in font-grotesk">
      {/* Hero Card - Volcanic Slate Substrate with Solar Punctuation */}
      <div className="bg-[#181716] rounded-[28px] p-5 text-white shadow-porcelain relative overflow-hidden border border-[#2D2B29]">
        <div className="absolute -right-8 -top-8 w-36 h-36 bg-[#FF5722]/15 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute right-4 bottom-2 w-24 h-24 bg-[#FF4500]/10 rounded-full blur-xl pointer-events-none" />

        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-white/10 backdrop-blur-md flex items-center justify-center text-[#FF5722] border border-white/10">
              <Sparkles className="w-4 h-4 text-[#FF5722]" />
            </div>
            <span className="font-syne font-bold text-sm tracking-wide text-white">CardSnap AI</span>
          </div>
          {isProUser ? (
            <span className="text-[11px] bg-[#FF5722]/20 text-[#FF8A65] px-2.5 py-0.5 rounded-full font-bold border border-[#FF5722]/40">
              ★ PRO UNLIMITED
            </span>
          ) : (
            <button
              onClick={onOpenUpgrade}
              className="text-[11px] bg-white/10 hover:bg-white/20 text-white px-2.5 py-0.5 rounded-full font-semibold border border-white/20 flex items-center gap-1.5 transition-colors"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-[#10B981]" />
              {Math.max(0, maxScans - scansUsed)} of {maxScans} Free Scans Left
            </button>
          )}
        </div>

        <h1 className="font-syne text-xl sm:text-2xl font-bold mb-1 tracking-tight text-white">
          Smart Business Card Scanner
        </h1>
        <p className="text-xs text-[#CAC6C4] mb-5">
          Scan physical cards, extract neural OCR intelligence, and attach 1-tap voice notes.
        </p>

        <div className="grid grid-cols-3 gap-2.5 pt-3 border-t border-white/10">
          <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-2.5 text-center border border-white/5">
            <span className="font-syne text-lg font-bold block text-white">{cards.length}</span>
            <span className="text-[10px] text-[#CAC6C4] font-medium">Total Cards</span>
          </div>
          <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-2.5 text-center border border-white/5">
            <span className="font-syne text-lg font-bold block text-white">{totalAudioCount}</span>
            <span className="text-[10px] text-[#CAC6C4] font-medium">Voice Notes</span>
          </div>
          <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-2.5 text-center border border-white/5">
            <span className="font-syne text-lg font-bold block text-white">{totalMediaCount}</span>
            <span className="text-[10px] text-[#CAC6C4] font-medium">Media Items</span>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-[11px] font-bold text-[#7C7875] uppercase tracking-wider mb-2.5 px-1">
          Quick Actions
        </h2>
        <div className="grid grid-cols-3 gap-2.5">
          <button
            onClick={onOpenScanner}
            className="flex flex-col items-center justify-center p-3.5 bg-white hover:bg-[#F8F6F4] border border-[#EDE8E1] hover:border-[#FF5722]/40 rounded-[20px] shadow-porcelain-sm transition-all active:scale-95 group text-center"
          >
            <div className="w-10 h-10 rounded-2xl bg-[#FFF0EB] group-hover:bg-[#FF5722] text-[#FF5722] group-hover:text-white flex items-center justify-center mb-1.5 transition-colors shadow-2xs">
              <Camera className="w-5 h-5" />
            </div>
            <span className="text-xs font-bold text-[#181716]">Scan Card</span>
            <span className="text-[10px] text-[#7C7875]">AI Reticle</span>
          </button>

          <button
            onClick={onOpenVoiceRecorder}
            className="flex flex-col items-center justify-center p-3.5 bg-white hover:bg-[#F8F6F4] border border-[#EDE8E1] hover:border-[#FF5722]/40 rounded-[20px] shadow-porcelain-sm transition-all active:scale-95 group text-center"
          >
            <div className="w-10 h-10 rounded-2xl bg-[#FFF0EB] group-hover:bg-[#FF5722] text-[#FF5722] group-hover:text-white flex items-center justify-center mb-1.5 transition-colors shadow-2xs">
              <Mic className="w-5 h-5" />
            </div>
            <span className="text-xs font-bold text-[#181716]">Record Voice</span>
            <span className="text-[10px] text-[#7C7875]">1-Tap Memo</span>
          </button>

          <button
            onClick={onOpenAddPhoto}
            className="flex flex-col items-center justify-center p-3.5 bg-white hover:bg-[#F8F6F4] border border-[#EDE8E1] hover:border-[#FF5722]/40 rounded-[20px] shadow-porcelain-sm transition-all active:scale-95 group text-center"
          >
            <div className="w-10 h-10 rounded-2xl bg-[#FFF0EB] group-hover:bg-[#FF5722] text-[#FF5722] group-hover:text-white flex items-center justify-center mb-1.5 transition-colors shadow-2xs">
              <ImageIcon className="w-5 h-5" />
            </div>
            <span className="text-xs font-bold text-[#181716]">Add Photo</span>
            <span className="text-[10px] text-[#7C7875]">Camera / Files</span>
          </button>
        </div>
      </div>

      {/* Recently Saved Cards List */}
      <div>
        <div className="flex items-center justify-between mb-3 px-1">
          <div>
            <h2 className="font-syne text-sm font-bold text-[#181716]">Recently Saved Cards</h2>
            <p className="text-[11px] text-[#7C7875]">Latest 10 scanned contacts</p>
          </div>
          {cards.length === 0 && (
            <button
              onClick={onLoadDemoData}
              className="text-xs font-bold text-[#FF5722] bg-[#FFF0EB] hover:bg-[#ffe5dc] px-3 py-1 rounded-full border border-[#FF5722]/30 transition-colors shadow-2xs"
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
          <div className="bg-white rounded-[28px] border border-[#EDE8E1] p-8 text-center shadow-porcelain-sm">
            <div className="w-14 h-14 rounded-2xl bg-[#FFF0EB] text-[#FF5722] flex items-center justify-center mx-auto mb-3 shadow-2xs">
              <Camera className="w-7 h-7" />
            </div>
            <h3 className="font-syne text-sm font-bold text-[#181716] mb-1">No Cards Scanned Yet</h3>
            <p className="text-xs text-[#7C7875] max-w-xs mx-auto mb-4">
              Tap the Scan button below to capture your first business card with Gemini OCR.
            </p>
            <div className="flex items-center justify-center gap-2">
              <button
                onClick={onOpenScanner}
                className="px-4 py-2 bg-gradient-to-r from-[#FF5722] to-[#FF4500] text-white font-bold text-xs rounded-full shadow-solar transition-transform active:scale-95"
              >
                Scan Now
              </button>
              <button
                onClick={onLoadDemoData}
                className="px-4 py-2 bg-[#EDE8E1] hover:bg-[#E0DAD1] text-[#181716] font-bold text-xs rounded-full transition-colors"
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
