import React from 'react';
import type { BusinessCard } from '../types';
import { Phone, Mail, Building2, Eye, Paperclip } from 'lucide-react';
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
      className="group relative bg-white hover:bg-[#F8F6F4] rounded-[22px] p-4 border border-[#EDE8E1] shadow-porcelain-sm hover:shadow-porcelain transition-all duration-200 cursor-pointer overflow-hidden active:scale-[0.99] font-grotesk"
    >
      {/* Subtle top luxury card solar accent line */}
      <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-[#FF5722] via-[#FF8A65] to-[#EDE8E1] opacity-90" />

      {/* Top Bar: Company Name & Block Tag */}
      <div className="flex items-center justify-between gap-2 mb-2">
        <div className="flex items-center gap-1.5 min-w-0">
          <Building2 className="w-3.5 h-3.5 text-[#FF5722] shrink-0" />
          <span className="font-bold text-[11px] text-[#181716] truncate tracking-wider uppercase">
            {card.company || card.blockName || 'Business Contact'}
          </span>
        </div>

        {card.blockName && (
          <span className="text-[10px] font-semibold text-[#7C7875] px-2 py-0.5 rounded-full bg-[#EDE8E1] shrink-0">
            {card.blockName}
          </span>
        )}
      </div>

      {/* Main Content Area: Person & Role */}
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="min-w-0 flex-1">
          <h3 className="font-syne font-bold text-base text-[#181716] tracking-tight truncate group-hover:text-[#FF5722] transition-colors">
            {card.name}
          </h3>
          {card.title && (
            <p className="text-xs font-medium text-[#7C7875] truncate mt-0.5">
              {card.title}
            </p>
          )}
        </div>

        {/* Thumbnail or Monogram badge */}
        {card.frontImageUrl ? (
          <div className="w-10 h-10 rounded-xl overflow-hidden border border-[#EDE8E1] shrink-0 bg-[#F8F6F4] shadow-2xs">
            <img src={card.frontImageUrl} alt={card.name} className="w-full h-full object-cover" />
          </div>
        ) : (
          <div className="w-10 h-10 rounded-xl bg-[#181716] text-white font-syne font-bold text-sm flex items-center justify-center shrink-0 shadow-2xs">
            {card.name.charAt(0).toUpperCase()}
          </div>
        )}
      </div>

      {/* Minimal Footer: Left (Call, WhatsApp, WeChat) | Right (Only 2 text buttons: View, Attach Media) */}
      <div className="flex items-center justify-between pt-2.5 border-t border-[#EDE8E1] text-xs">
        {/* Left Side: Quick Action Icons */}
        <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
          {/* Call Icon */}
          {card.phone ? (
            <a
              href={`tel:${card.phone}`}
              className="w-7 h-7 rounded-full bg-white hover:bg-[#FFF0EB] text-[#181716] hover:text-[#FF5722] flex items-center justify-center transition-colors border border-[#EDE8E1] shadow-2xs"
              title={`Call ${card.phone}`}
            >
              <Phone className="w-3.5 h-3.5" />
            </a>
          ) : (
            <div className="w-7 h-7 rounded-full bg-[#F5F3EF] text-[#7C7875]/40 flex items-center justify-center border border-[#EDE8E1]">
              <Phone className="w-3.5 h-3.5" />
            </div>
          )}

          {/* Official WhatsApp Icon */}
          {cleanWhatsapp ? (
            <a
              href={`https://wa.me/${cleanWhatsapp}`}
              target="_blank"
              rel="noreferrer"
              className="w-7 h-7 rounded-full bg-[#25D366] hover:bg-[#20bd5a] text-white flex items-center justify-center transition-all shadow-2xs active:scale-95"
              title={`WhatsApp Chat: ${card.whatsapp || card.phone}`}
            >
              <WhatsAppIcon className="w-3.5 h-3.5 fill-white" />
            </a>
          ) : (
            <div
              className="w-7 h-7 rounded-full bg-[#F5F3EF] text-[#7C7875]/40 flex items-center justify-center border border-[#EDE8E1]"
              title="No WhatsApp number"
            >
              <WhatsAppIcon className="w-3.5 h-3.5 fill-[#7C7875]/40" />
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
              className="w-7 h-7 rounded-full bg-[#07C160] hover:bg-[#06ad56] text-white flex items-center justify-center transition-all shadow-2xs active:scale-95"
              title={`WeChat ID: ${card.wechat} (Click to copy)`}
            >
              <WeChatIcon className="w-3.5 h-3.5 fill-white" />
            </button>
          ) : (
            <div
              className="w-7 h-7 rounded-full bg-[#F5F3EF] text-[#7C7875]/40 flex items-center justify-center border border-[#EDE8E1]"
              title="No WeChat ID"
            >
              <WeChatIcon className="w-3.5 h-3.5 fill-[#7C7875]/40" />
            </div>
          )}

          {/* Email Icon */}
          {card.email && (
            <a
              href={`mailto:${card.email}`}
              className="w-7 h-7 rounded-full bg-white hover:bg-[#FFF0EB] text-[#181716] hover:text-[#FF5722] flex items-center justify-center transition-colors border border-[#EDE8E1] shadow-2xs"
              title={`Email: ${card.email}`}
            >
              <Mail className="w-3.5 h-3.5" />
            </a>
          )}
        </div>

        {/* Right Side: ONLY 2 text buttons: View and Attach Media */}
        <div className="flex items-center gap-1.5 shrink-0" onClick={(e) => e.stopPropagation()}>
          <button
            type="button"
            onClick={() => onOpenCardDetail(card)}
            className="flex items-center gap-1 px-3 py-1 bg-[#FFF0EB] hover:bg-[#ffe5dc] text-[#FF5722] font-bold text-[11px] rounded-full transition-all active:scale-95 border border-[#FF5722]/30 shadow-2xs"
          >
            <Eye className="w-3 h-3" />
            <span>View</span>
          </button>

          <button
            type="button"
            onClick={() => onOpenQuickAttach(card)}
            className="flex items-center gap-1 px-3 py-1 bg-[#EDE8E1] hover:bg-[#E0DAD1] text-[#181716] font-bold text-[11px] rounded-full transition-all active:scale-95 border border-[#E0DAD1] shadow-2xs"
          >
            <Paperclip className="w-3 h-3 text-[#7C7875]" />
            <span>Attach media</span>
          </button>
        </div>
      </div>
    </div>
  );
};
