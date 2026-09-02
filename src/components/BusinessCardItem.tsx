import React from 'react';
import type { BusinessCard } from '../types';
import { Phone, Mail, Paperclip, ChevronRight, Building2 } from 'lucide-react';
import { WhatsAppIcon, WeChatIcon } from './BrandIcons';

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
  const cleanWhatsapp = (card.whatsapp || card.phone || '').replace(/[^0-9]/g, '');

  return (
    <div
      onClick={() => onOpenCardDetail(card)}
      className="group relative bg-white hover:bg-slate-50/80 rounded-2xl p-4 border border-slate-200/80 shadow-xs hover:shadow-md transition-all duration-200 cursor-pointer overflow-hidden active:scale-[0.99]"
      style={{
        background: 'linear-gradient(135deg, #ffffff 0%, #fafbfd 100%)'
      }}
    >
      {/* Subtle top luxury card accent line */}
      <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-indigo-500 via-indigo-400 to-slate-300 opacity-80" />

      {/* Top Bar: Company Name & Block Tag */}
      <div className="flex items-center justify-between gap-2 mb-2">
        <div className="flex items-center gap-1.5 min-w-0">
          <Building2 className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
          <span className="font-bold text-xs text-indigo-950 truncate tracking-tight uppercase">
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
          <div className="w-10 h-10 rounded-xl overflow-hidden border border-slate-200 shrink-0 bg-slate-100 shadow-2xs">
            <img src={card.frontImageUrl} alt={card.name} className="w-full h-full object-cover" />
          </div>
        ) : (
          <div className="w-10 h-10 rounded-xl bg-slate-900 text-white font-bold text-sm flex items-center justify-center shrink-0 shadow-2xs">
            {card.name.charAt(0).toUpperCase()}
          </div>
        )}
      </div>

      {/* Minimal Footer: Call, Official WhatsApp, Official WeChat icons + Quick Attach */}
      <div className="flex items-center justify-between pt-2.5 border-t border-slate-100/90 text-xs">
        {/* Quick Action Icons */}
        <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
          {/* Call Icon */}
          {card.phone ? (
            <a
              href={`tel:${card.phone}`}
              className="w-7 h-7 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 flex items-center justify-center transition-colors border border-emerald-100"
              title={`Call ${card.phone}`}
            >
              <Phone className="w-3.5 h-3.5" />
            </a>
          ) : (
            <div className="w-7 h-7 rounded-lg bg-slate-50 text-slate-300 flex items-center justify-center opacity-40">
              <Phone className="w-3.5 h-3.5" />
            </div>
          )}

          {/* Official WhatsApp Icon */}
          {cleanWhatsapp ? (
            <a
              href={`https://wa.me/${cleanWhatsapp}`}
              target="_blank"
              rel="noreferrer"
              className="w-7 h-7 rounded-lg bg-[#25D366] hover:bg-[#20bd5a] text-white flex items-center justify-center transition-all shadow-xs active:scale-95"
              title={`WhatsApp Chat: ${card.whatsapp || card.phone}`}
            >
              <WhatsAppIcon className="w-4 h-4 fill-white" />
            </a>
          ) : (
            <div
              className="w-7 h-7 rounded-lg bg-slate-50 text-slate-300 flex items-center justify-center opacity-40"
              title="No WhatsApp number"
            >
              <WhatsAppIcon className="w-4 h-4 fill-slate-300" />
            </div>
          )}

          {/* Official WeChat Icon */}
          {card.wechat ? (
            <button
              type="button"
              onClick={() => {
                navigator.clipboard.writeText(card.wechat || '');
                alert(`WeChat ID (${card.wechat}) copied to clipboard!`);
              }}
              className="w-7 h-7 rounded-lg bg-[#07C160] hover:bg-[#06ad56] text-white flex items-center justify-center transition-all shadow-xs active:scale-95"
              title={`WeChat ID: ${card.wechat} (Click to copy)`}
            >
              <WeChatIcon className="w-4 h-4 fill-white" />
            </button>
          ) : (
            <div
              className="w-7 h-7 rounded-lg bg-slate-50 text-slate-300 flex items-center justify-center opacity-40"
              title="No WeChat ID"
            >
              <WeChatIcon className="w-4 h-4 fill-slate-300" />
            </div>
          )}

          {/* Email Icon */}
          {card.email && (
            <a
              href={`mailto:${card.email}`}
              className="w-7 h-7 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-600 flex items-center justify-center transition-colors border border-blue-100"
              title={`Email: ${card.email}`}
            >
              <Mail className="w-3.5 h-3.5" />
            </a>
          )}
        </div>

        {/* Right Side: + Media button & arrow */}
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

          <div className="w-5 h-5 flex items-center justify-center text-slate-300 group-hover:text-indigo-600 group-hover:translate-x-0.5 transition-all">
            <ChevronRight className="w-4 h-4" />
          </div>
        </div>
      </div>
    </div>
  );
};
