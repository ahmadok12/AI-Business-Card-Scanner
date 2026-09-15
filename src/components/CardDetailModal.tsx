import { downloadImageToDevice } from '../services/imageUtils';
import React, { useState } from 'react';
import type { BusinessCard, MediaItem } from '../types';
import { Phone, Mail, Globe, MapPin, Download, Trash2, Edit3, X, Share2, MessageCircle, MessageSquare, QrCode, Tag, FileText, Calendar, ExternalLink, Check } from 'lucide-react';
import { downloadVCard } from '../services/vcard';
import { AttachedMediaSection, StagedMediaItem } from './AttachedMediaSection';

interface CardDetailModalProps {
  card: BusinessCard | null;
  isOpen: boolean;
  onClose: () => void;
  onDelete: (id: string) => void;
  onUpdate: (updatedCard: BusinessCard) => void;
  associatedMedia: MediaItem[];
  onAddMedia: (media: MediaItem) => void;
  onDeleteMedia: (id: string) => void;
}

export const CardDetailModal: React.FC<CardDetailModalProps> = ({
  card,
  isOpen,
  onClose,
  onDelete,
  onUpdate,
  associatedMedia,
  onAddMedia,
  onDeleteMedia
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedCard, setEditedCard] = useState<BusinessCard | null>(card);
  const [lightboxImage, setLightboxImage] = useState<string | null>(null);

  React.useEffect(() => {
    setEditedCard(card);
    setIsEditing(false);
  }, [card]);

  if (!isOpen || !card) return null;

  const current = isEditing && editedCard ? editedCard : card;

  const handleSaveEdit = () => {
    if (editedCard) {
      onUpdate(editedCard);
      setIsEditing(false);
    }
  };

  const handleAddMediaStaged = (item: StagedMediaItem) => {
    const newMedia: MediaItem = {
      id: item.id,
      type: item.type,
      title: item.title,
      blockName: card.blockName,
      dataUrl: item.dataUrl,
      textContent: item.textContent,
      audioDuration: item.audioDuration,
      sectionName: item.sectionName || 'Section 1',
      cardId: card.id,
      cardName: card.name,
      createdAt: Date.now()
    };
    onAddMedia(newMedia);
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${card.name} - ${card.company}`,
          text: `Contact: ${card.name}\n${card.title ? card.title + ' at ' : ''}${card.company}\nPhone: ${card.phone || 'N/A'}\nWhatsApp: ${card.whatsapp || 'N/A'}\nEmail: ${card.email || 'N/A'}`
        });
      } catch (err) {
        console.log('Share dismissed');
      }
    } else {
      navigator.clipboard.writeText(`${card.name}\n${card.company}\n${card.phone}\n${card.email}`);
      alert('Contact info copied to clipboard!');
    }
  };

  const stagedItems: StagedMediaItem[] = associatedMedia.map((m) => ({
    id: m.id,
    type: m.type,
    title: m.title,
    dataUrl: m.dataUrl,
    textContent: m.textContent,
    audioDuration: m.audioDuration,
    sectionName: m.sectionName || 'Section 1'
  }));

  const cleanWhatsappNumber = (current.whatsapp || current.phone || '').replace(/[^0-9]/g, '');
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/60 backdrop-blur-md overflow-y-auto animate-in fade-in">
      <div className="bg-[#FBF9F7] text-[#181716] w-full max-w-lg rounded-[28px] sm:rounded-[36px] shadow-porcelain border border-[#EDE8E1] flex flex-col max-h-[94vh] overflow-hidden my-auto font-grotesk">
        {/* Top Header */}
        <div className="flex items-center justify-between px-4 sm:px-5 py-3.5 border-b border-[#EDE8E1] bg-[#FBF9F7]/95 backdrop-blur-xl sticky top-0 z-20">
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full text-[10px] sm:text-[11px] font-bold bg-[#FFF0EB] text-[#FF5722] border border-[#FF5722]/30 uppercase tracking-wider">
              {current.blockName || 'General'}
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setIsEditing(!isEditing)}
              className="w-9 h-9 text-[#7C7875] hover:text-[#FF5722] rounded-full bg-white border border-[#EDE8E1] hover:border-[#FF5722]/30 flex items-center justify-center transition-colors shadow-2xs"
              title="Edit Card"
            >
              <Edit3 className="w-4 h-4" />
            </button>
            <button
              onClick={handleShare}
              className="w-9 h-9 text-[#7C7875] hover:text-[#FF5722] rounded-full bg-white border border-[#EDE8E1] hover:border-[#FF5722]/30 flex items-center justify-center transition-colors shadow-2xs"
              title="Share Contact"
            >
              <Share2 className="w-4 h-4" />
            </button>
            <button
              onClick={() => {
                if (confirm(`Delete contact for ${card.name}?`)) {
                  onDelete(card.id);
                  onClose();
                }
              }}
              className="w-9 h-9 text-[#7C7875] hover:text-rose-600 rounded-full bg-white border border-[#EDE8E1] hover:border-rose-300 flex items-center justify-center transition-colors shadow-2xs"
              title="Delete Contact"
            >
              <Trash2 className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="w-9 h-9 text-[#7C7875] hover:text-[#181716] rounded-full bg-white border border-[#EDE8E1] flex items-center justify-center transition-colors ml-1 shadow-2xs"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="p-4 sm:p-5 overflow-y-auto space-y-4 text-xs">
          {/* Scanned Image Banner */}
          {current.frontImageUrl && (
            <div
              className="relative rounded-2xl overflow-hidden border border-[#EDE8E1] aspect-16/9 bg-[#181716] group cursor-pointer shadow-porcelain-sm"
              onClick={() => setLightboxImage(current.frontImageUrl || null)}
            >
              <img src={current.frontImageUrl} alt="Card Front" className="w-full h-full object-contain" />
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-xs font-semibold">
                Tap to view full image
              </div>
            </div>
          )}

          {/* Primary Contact Header */}
          <div className="bg-white rounded-[22px] p-4 border border-[#EDE8E1] shadow-porcelain-sm">
            {isEditing ? (
              <div className="space-y-2">
                <input
                  type="text"
                  value={editedCard?.name || ''}
                  onChange={(e) => setEditedCard(prev => prev ? { ...prev, name: e.target.value } : null)}
                  className="w-full px-3 py-1.5 border border-[#EDE8E1] rounded-xl font-bold font-syne text-base text-[#181716] focus:outline-none focus:border-[#FF5722]"
                  placeholder="Name"
                />
                <input
                  type="text"
                  value={editedCard?.title || ''}
                  onChange={(e) => setEditedCard(prev => prev ? { ...prev, title: e.target.value } : null)}
                  className="w-full px-3 py-1.5 border border-[#EDE8E1] rounded-xl text-xs focus:outline-none focus:border-[#FF5722]"
                  placeholder="Job Title"
                />
                <input
                  type="text"
                  value={editedCard?.company || ''}
                  onChange={(e) => setEditedCard(prev => prev ? { ...prev, company: e.target.value } : null)}
                  className="w-full px-3 py-1.5 border border-[#EDE8E1] rounded-xl text-xs font-semibold text-[#FF5722] focus:outline-none focus:border-[#FF5722]"
                  placeholder="Company"
                />
              </div>
            ) : (
              <div>
                <h1 className="font-syne text-xl font-bold text-[#181716]">{current.name}</h1>
                {current.title && <p className="text-xs font-medium text-[#7C7875] mt-0.5">{current.title}</p>}
                {current.company && <p className="text-xs font-bold text-[#FF5722] mt-0.5">{current.company}</p>}
              </div>
            )}
          </div>

          {/* Quick Action Dial Buttons */}
          <div className="grid grid-cols-4 gap-2 pt-0.5">
            {current.phone ? (
              <a
                href={`tel:${current.phone}`}
                className="flex flex-col items-center justify-center p-2.5 bg-white hover:bg-[#F8F6F4] text-[#181716] rounded-2xl border border-[#EDE8E1] transition-all active:scale-95 text-center gap-1 shadow-2xs"
              >
                <div className="w-8 h-8 rounded-full bg-[#FFF0EB] text-[#FF5722] flex items-center justify-center">
                  <Phone className="w-4 h-4" />
                </div>
                <span className="text-[10px] font-bold">Call</span>
              </a>
            ) : (
              <div className="flex flex-col items-center justify-center p-2.5 bg-white text-[#7C7875]/40 rounded-2xl text-center gap-1 border border-[#EDE8E1] opacity-60">
                <div className="w-8 h-8 rounded-full bg-[#F5F3EF] flex items-center justify-center">
                  <Phone className="w-4 h-4" />
                </div>
                <span className="text-[10px]">Call</span>
              </div>
            )}

            {cleanWhatsappNumber ? (
              <a
                href={`https://wa.me/${cleanWhatsappNumber}`}
                target="_blank"
                rel="noreferrer"
                className="flex flex-col items-center justify-center p-2.5 bg-[#25D366] hover:bg-[#20bd5a] text-white rounded-2xl transition-all active:scale-95 text-center gap-1 shadow-2xs"
              >
                <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                  <MessageCircle className="w-4 h-4 fill-current" />
                </div>
                <span className="text-[10px] font-bold">WhatsApp</span>
              </a>
            ) : (
              <div className="flex flex-col items-center justify-center p-2.5 bg-white text-[#7C7875]/40 rounded-2xl text-center gap-1 border border-[#EDE8E1] opacity-60">
                <div className="w-8 h-8 rounded-full bg-[#F5F3EF] flex items-center justify-center">
                  <MessageCircle className="w-4 h-4" />
                </div>
                <span className="text-[10px]">WhatsApp</span>
              </div>
            )}

            {current.email ? (
              <a
                href={`mailto:${current.email}`}
                className="flex flex-col items-center justify-center p-2.5 bg-white hover:bg-[#F8F6F4] text-[#181716] rounded-2xl border border-[#EDE8E1] transition-all active:scale-95 text-center gap-1 shadow-2xs"
              >
                <div className="w-8 h-8 rounded-full bg-[#FFF0EB] text-[#FF5722] flex items-center justify-center">
                  <Mail className="w-4 h-4" />
                </div>
                <span className="text-[10px] font-bold">Email</span>
              </a>
            ) : (
              <div className="flex flex-col items-center justify-center p-2.5 bg-white text-[#7C7875]/40 rounded-2xl text-center gap-1 border border-[#EDE8E1] opacity-60">
                <div className="w-8 h-8 rounded-full bg-[#F5F3EF] flex items-center justify-center">
                  <Mail className="w-4 h-4" />
                </div>
                <span className="text-[10px]">Email</span>
              </div>
            )}

            <button
              onClick={() => downloadVCard(current)}
              className="flex flex-col items-center justify-center p-2.5 bg-white hover:bg-[#F8F6F4] text-[#181716] rounded-2xl border border-[#EDE8E1] transition-all active:scale-95 text-center gap-1 shadow-2xs"
              title="Download vCard (.vcf)"
            >
              <div className="w-8 h-8 rounded-full bg-[#EDE8E1] text-[#181716] flex items-center justify-center">
                <Download className="w-4 h-4" />
              </div>
              <span className="text-[10px] font-bold">Save vCard</span>
            </button>
          </div>

          {/* Dedicated Media Section Block AFTER card is saved */}
          <div className="pt-1">
            <AttachedMediaSection
              items={stagedItems}
              onAddItem={handleAddMediaStaged}
              onRemoveItem={onDeleteMedia}
              defaultBlockName={card.blockName}
              cardName={card.name}
            />
          </div>

          {/* QR Codes Display Section (WhatsApp QR & WeChat QR) */}
          {(current.whatsappQrUrl || current.wechatQrUrl) && (
            <div className="bg-[#F8F6F4] rounded-[22px] p-4 border border-[#EDE8E1] space-y-3 shadow-2xs">
              <div className="flex items-center gap-1.5">
                <QrCode className="w-4 h-4 text-[#10B981]" />
                <h3 className="font-syne font-bold text-xs text-[#181716]">Scanned QR Codes</h3>
              </div>

              <div className="grid grid-cols-2 gap-3">
                {current.whatsappQrUrl && (
                  <div className="bg-white rounded-2xl p-3 border border-[#EDE8E1] flex flex-col items-center text-center shadow-2xs">
                    <span className="text-[11px] font-bold text-[#181716] mb-1.5 flex items-center gap-1">
                      <MessageCircle className="w-3.5 h-3.5 text-[#10B981]" /> WhatsApp QR
                    </span>
                    <div
                      className="w-24 h-24 rounded-xl overflow-hidden border border-[#EDE8E1] cursor-pointer p-1 bg-white hover:scale-105 transition-transform shadow-2xs mb-2"
                      onClick={() => setLightboxImage(current.whatsappQrUrl || null)}
                      title="Tap to enlarge"
                    >
                      <img src={current.whatsappQrUrl} alt="WhatsApp QR" className="w-full h-full object-contain" />
                    </div>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        downloadImageToDevice(current.whatsappQrUrl!, `${current.name}_WhatsApp_QR.png`);
                      }}
                      className="w-full flex items-center justify-center gap-1 py-1.5 px-2 bg-[#FFF0EB] hover:bg-[#ffe5dc] text-[#FF5722] font-bold text-[10px] rounded-full transition-colors border border-[#FF5722]/30"
                    >
                      <Download className="w-3 h-3" /> Save to Device
                    </button>
                  </div>
                )}

                {current.wechatQrUrl && (
                  <div className="bg-white rounded-2xl p-3 border border-[#EDE8E1] flex flex-col items-center text-center shadow-2xs">
                    <span className="text-[11px] font-bold text-[#181716] mb-1.5 flex items-center gap-1">
                      <MessageSquare className="w-3.5 h-3.5 text-[#10B981]" /> WeChat QR
                    </span>
                    <div
                      className="w-24 h-24 rounded-xl overflow-hidden border border-[#EDE8E1] cursor-pointer p-1 bg-white hover:scale-105 transition-transform shadow-2xs mb-2"
                      onClick={() => setLightboxImage(current.wechatQrUrl || null)}
                      title="Tap to enlarge"
                    >
                      <img src={current.wechatQrUrl} alt="WeChat QR" className="w-full h-full object-contain" />
                    </div>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        downloadImageToDevice(current.wechatQrUrl!, `${current.name}_WeChat_QR.png`);
                      }}
                      className="w-full flex items-center justify-center gap-1 py-1.5 px-2 bg-[#FFF0EB] hover:bg-[#ffe5dc] text-[#FF5722] font-bold text-[10px] rounded-full transition-colors border border-[#FF5722]/30"
                    >
                      <Download className="w-3 h-3" /> Save to Device
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Complete Contact Information Details */}
          <div className="bg-white rounded-[22px] p-4 space-y-3.5 border border-[#EDE8E1] shadow-porcelain-sm">
            <h3 className="font-syne font-bold text-xs text-[#181716] border-b border-[#EDE8E1] pb-2">
              Complete Contact Details
            </h3>

            {/* Phones */}
            {current.phone && (
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5 text-[#7C7875]">
                  <Phone className="w-3.5 h-3.5 text-[#FF5722]" />
                  <span>Primary Phone</span>
                </div>
                <a href={`tel:${current.phone}`} className="font-mono text-xs font-bold text-[#181716] hover:text-[#FF5722]">
                  {current.phone}
                </a>
              </div>
            )}

            {current.secondaryPhone && (
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5 text-[#7C7875]">
                  <Phone className="w-3.5 h-3.5 text-[#7C7875]" />
                  <span>Alternate Phone</span>
                </div>
                <a href={`tel:${current.secondaryPhone}`} className="font-mono text-xs font-semibold text-[#181716] hover:text-[#FF5722]">
                  {current.secondaryPhone}
                </a>
              </div>
            )}

            {/* WhatsApp */}
            {current.whatsapp && (
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5 text-[#7C7875]">
                  <MessageCircle className="w-3.5 h-3.5 text-[#10B981]" />
                  <span>WhatsApp</span>
                </div>
                <a
                  href={`https://wa.me/${cleanWhatsappNumber}`}
                  target="_blank"
                  rel="noreferrer"
                  className="font-mono text-xs font-bold text-[#10B981] hover:underline flex items-center gap-1"
                >
                  {current.whatsapp} <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            )}

            {/* WeChat */}
            {current.wechat && (
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5 text-[#7C7875]">
                  <MessageSquare className="w-3.5 h-3.5 text-[#10B981]" />
                  <span>WeChat ID</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="font-mono text-xs font-bold text-[#181716]">{current.wechat}</span>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(current.wechat || '');
                      alert('WeChat ID copied to clipboard!');
                    }}
                    className="text-[10px] bg-[#EDE8E1] hover:bg-[#E0DAD1] px-2 py-0.5 rounded-full text-[#181716] font-bold"
                  >
                    Copy
                  </button>
                </div>
              </div>
            )}

            {/* Email */}
            {current.email && (
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5 text-[#7C7875]">
                  <Mail className="w-3.5 h-3.5 text-[#FF5722]" />
                  <span>Email</span>
                </div>
                <a href={`mailto:${current.email}`} className="text-xs font-semibold text-[#181716] hover:text-[#FF5722] hover:underline truncate max-w-[200px]">
                  {current.email}
                </a>
              </div>
            )}

            {/* Website */}
            {current.website && (
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5 text-[#7C7875]">
                  <Globe className="w-3.5 h-3.5 text-[#FF5722]" />
                  <span>Website</span>
                </div>
                <a
                  href={current.website.startsWith('http') ? current.website : `https://${current.website}`}
                  target="_blank"
                  rel="noreferrer"
                  className="text-xs font-semibold text-[#181716] hover:text-[#FF5722] hover:underline truncate max-w-[200px]"
                >
                  {current.website}
                </a>
              </div>
            )}

            {/* Address */}
            {current.address && (
              <div className="flex items-start justify-between gap-4 pt-1 border-t border-[#EDE8E1]">
                <div className="flex items-center gap-2.5 text-[#7C7875] shrink-0">
                  <MapPin className="w-3.5 h-3.5 text-[#FF5722]" />
                  <span>Address</span>
                </div>
                <a
                  href={`https://maps.google.com/?q=${encodeURIComponent(current.address)}`}
                  target="_blank"
                  rel="noreferrer"
                  className="text-xs text-[#181716] text-right hover:text-[#FF5722] hover:underline"
                >
                  {current.address}
                </a>
              </div>
            )}

            {/* Social Links */}
            {current.socialLinks && (
              <div className="flex items-center justify-between pt-1 border-t border-[#EDE8E1]">
                <div className="flex items-center gap-2.5 text-[#7C7875] shrink-0">
                  <Globe className="w-3.5 h-3.5 text-[#FF5722]" />
                  <span>Social Handles</span>
                </div>
                <span className="text-xs text-[#181716] truncate max-w-[200px]">{current.socialLinks}</span>
              </div>
            )}

            {/* Tags */}
            {current.tags && current.tags.length > 0 && (
              <div className="flex items-center gap-2 pt-1 border-t border-[#EDE8E1] flex-wrap">
                <Tag className="w-3.5 h-3.5 text-[#7C7875]" />
                {current.tags.map((tag) => (
                  <span key={tag} className="text-[10px] font-bold px-2.5 py-0.5 bg-[#EDE8E1] text-[#181716] rounded-full">
                    #{tag}
                  </span>
                ))}
              </div>
            )}

            {/* Notes */}
            {current.notes && (
              <div className="pt-2 border-t border-[#EDE8E1] space-y-1">
                <div className="flex items-center gap-2 text-[#7C7875]">
                  <FileText className="w-3.5 h-3.5 text-[#FF5722]" />
                  <span className="font-bold text-[11px] uppercase tracking-wider">Notes & Intelligence</span>
                </div>
                <p className="text-xs text-[#2B2927] bg-[#F8F6F4] p-3 rounded-xl border border-[#EDE8E1] whitespace-pre-line leading-relaxed italic">
                  "{current.notes}"
                </p>
              </div>
            )}

            {/* Timestamp */}
            <div className="flex items-center gap-1.5 text-[10px] text-[#7C7875] pt-2 border-t border-[#EDE8E1]">
              <Calendar className="w-3 h-3" />
              <span>Saved on {new Date(current.createdAt).toLocaleDateString([], { month: 'long', day: 'numeric', year: 'numeric' })}</span>
            </div>
          </div>
        </div>

        {/* Edit Footer */}
        {isEditing && (
          <div className="p-4 border-t border-[#EDE8E1] bg-[#FBF9F7] sticky bottom-0 z-20 flex items-center gap-3">
            <button
              onClick={() => setIsEditing(false)}
              className="flex-1 py-2.5 bg-[#EDE8E1] hover:bg-[#E0DAD1] text-[#181716] font-bold text-xs rounded-full"
            >
              Cancel
            </button>
            <button
              onClick={handleSaveEdit}
              className="flex-1 flex items-center justify-center gap-1.5 py-2.5 bg-gradient-to-r from-[#FF5722] to-[#FF4500] hover:opacity-95 text-white font-bold text-xs rounded-full shadow-solar"
            >
              <Check className="w-4 h-4" /> Save Changes
            </button>
          </div>
        )}
      </div>

      {/* Lightbox for viewing photos and QR codes */}
      {lightboxImage && (
        <div
          className="fixed inset-0 z-60 bg-black/90 backdrop-blur-md flex flex-col items-center justify-center p-4"
          onClick={() => setLightboxImage(null)}
        >
          <div className="absolute top-4 right-4 flex items-center gap-2 z-70" onClick={(e) => e.stopPropagation()}>
            <button
              type="button"
              onClick={() => downloadImageToDevice(lightboxImage, `${current.name}_scanned_image.png`)}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-white/20 hover:bg-white/30 text-white rounded-full text-xs font-semibold backdrop-blur-md transition-colors"
            >
              <Download className="w-4 h-4" />
              <span>Save to Device</span>
            </button>
            <button
              onClick={() => setLightboxImage(null)}
              className="text-white p-2 rounded-full bg-slate-800/80 hover:bg-slate-700 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          <img src={lightboxImage} alt="Full preview" className="max-w-full max-h-[82vh] rounded-2xl object-contain bg-white p-2" />
        </div>
      )}
    </div>
  );
};
