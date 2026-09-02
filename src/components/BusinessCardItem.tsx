import React from 'react';
import type { BusinessCard } from '../types';
import { Phone, Mail, MessageCircle, Paperclip, ChevronRight, Building2 } from 'lucide-react';

interface BusinessCardItemProps {
  card: BusinessCard;
  onOpenCardDetail: (card: BusinessCard) => void;
  onOpenQuickAttach: (card: BusinessCard) => void;
}

export const BusinessCardItem: React.FC<BusinessCardItemProps> = ({
  card,
  onOpenCardDetail,
  onOpenQuickAttach
}) => {
  return (
    <div
      onClick={() => onOpenCardDetail(card)}
      className="group relative bg-white hover:bg-slate-50/80 rounded-2xl p-4 border border-slate-200/80 shadow-xs hover:shadow-md transition-all duration-200 cursor-pointer overflow-hidden active:scale-[0.99]"
      style={{
        background: 'linear-gradient(135deg, #ffffff 0%, #fafbfd 100%)'
      }}
    >
      {/* Decorative subtle top edge line for luxury card feel */}
      <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-indigo-500 via-indigo-400 to-slate-300 opacity-80" />

      {/* Top Bar: Company Name / Block Tag */}
      <div className="flex items-center justify-between gap-2 mb-2.5">
        <div className="flex items-center gap-1.5 min-w-0">
          <Building2 className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
          <span className="font-bold text-xs text-indigo-900 truncate tracking-tight uppercase">
            {card.company || card.blockName || 'Business Contact'}
          </span>
        </div>

        {card.blockName && card.company && (
          <span className="text-[10px] font-medium text-slate-400 px-2 py-0.5 rounded-full bg-slate-100 shrink-0">
            {card.blockName}
          </span>
        )}
      </div>

      {/* Main Content Area: Person & Role */}
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="min-w-0 flex-1">
          <h3 className="font-bold text-base text-slate-900 tracking-tight truncate group-hover:text-indigo-600 transition-colors">
            {card.name}
          </h3>
          {card.title && (
            <p className="text-xs font-medium text-slate-500 truncate mt-0.5">
              {card.title}
            </p>
          )}
        </div>

        {/* Thumbnail or Monogram badge */}
        {card.frontImageUrl ? (
          <div className="w-11 h-11 rounded-xl overflow-hidden border border-slate-200 shrink-0 bg-slate-100 shadow-2xs">
            <img src={card.frontImageUrl} alt={card.name} className="w-full h-full object-cover" />
          </div>
        ) : (
          <div className="w-11 h-11 rounded-xl bg-slate-900 text-white font-bold text-sm flex items-center justify-center shrink-0 shadow-2xs">
            {card.name.charAt(0).toUpperCase()}
          </div>
        )}
      </div>

      {/* Minimal Footer: Minimal Contact Info & Discreet Attach Media button */}
      <div className="flex items-center justify-between pt-2.5 border-t border-slate-100/90 text-xs text-slate-500">
        {/* Left minimal contact chip */}
        <div className="flex items-center gap-3 min-w-0 truncate text-[11px]">
          {card.phone ? (
            <span className="flex items-center gap-1 font-mono text-slate-600 truncate">
              <Phone className="w-3 h-3 text-slate-400 shrink-0" />
              <span className="truncate">{card.phone}</span>
            </span>
          ) : card.email ? (
            <span className="flex items-center gap-1 text-slate-600 truncate">
              <Mail className="w-3 h-3 text-slate-400 shrink-0" />
              <span className="truncate">{card.email}</span>
            </span>
          ) : null}

          {card.whatsapp && (
            <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded-md flex items-center gap-0.5 shrink-0 border border-emerald-100">
              <MessageCircle className="w-2.5 h-2.5 text-emerald-600" /> WhatsApp
            </span>
          )}
        </div>

        {/* Right Actions: Minimal Attach Button + Card Arrow */}
        <div className="flex items-center gap-1.5 shrink-0">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onOpenQuickAttach(card);
            }}
            className="flex items-center gap-1 px-2.5 py-1 bg-slate-100 hover:bg-indigo-50 hover:text-indigo-600 text-slate-600 rounded-lg text-[11px] font-semibold transition-colors"
            title="Attach media (voice/photo/note)"
          >
            <Paperclip className="w-3 h-3" />
            <span>+ Media</span>
          </button>

          <div className="w-6 h-6 rounded-lg flex items-center justify-center text-slate-300 group-hover:text-indigo-600 group-hover:translate-x-0.5 transition-all">
            <ChevronRight className="w-4 h-4" />
          </div>
        </div>
      </div>
    </div>
  );
};
