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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-slate-950/60 backdrop-blur-sm overflow-y-auto animate-in fade-in">
      <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl border border-slate-100 flex flex-col max-h-[92vh] overflow-hidden my-auto">
        {/* Top Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-100 bg-white sticky top-0 z-10">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-indigo-50 text-indigo-700 border border-indigo-100">
              {current.blockName}
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setIsEditing(!isEditing)}
              className="p-2 text-slate-500 hover:text-indigo-600 rounded-full hover:bg-slate-100 transition-colors"
              title="Edit Card"
            >
              <Edit3 className="w-4 h-4" />
            </button>
            <button
              onClick={handleShare}
              className="p-2 text-slate-500 hover:text-indigo-600 rounded-full hover:bg-slate-100 transition-colors"
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
              className="p-2 text-rose-400 hover:text-rose-600 rounded-full hover:bg-rose-50 transition-colors"
              title="Delete Contact"
            >
              <Trash2 className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 transition-colors ml-1"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="p-5 overflow-y-auto space-y-5 text-slate-700 text-xs">
          {/* Scanned Image Banner */}
          {current.frontImageUrl && (
            <div
              className="relative rounded-2xl overflow-hidden border border-slate-200 aspect-16/9 bg-slate-900 group cursor-pointer"
              onClick={() => setLightboxImage(current.frontImageUrl || null)}
            >
              <img src={current.frontImageUrl} alt="Card Front" className="w-full h-full object-contain" />
              <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-xs font-medium">
                Click to view full image
              </div>
            </div>
          )}

          {/* Primary Contact Header */}
          <div>
            {isEditing ? (
              <div className="space-y-2">
                <input
                  type="text"
                  value={editedCard?.name || ''}
                  onChange={(e) => setEditedCard(prev => prev ? { ...prev, name: e.target.value } : null)}
                  className="w-full px-3 py-1.5 border rounded-xl font-bold text-base text-slate-900"
                  placeholder="Name"
                />
                <input
                  type="text"
                  value={editedCard?.title || ''}
                  onChange={(e) => setEditedCard(prev => prev ? { ...prev, title: e.target.value } : null)}
                  className="w-full px-3 py-1.5 border rounded-xl text-xs"
                  placeholder="Job Title"
                />
                <input
                  type="text"
                  value={editedCard?.company || ''}
                  onChange={(e) => setEditedCard(prev => prev ? { ...prev, company: e.target.value } : null)}
                  className="w-full px-3 py-1.5 border rounded-xl text-xs font-semibold text-indigo-600"
                  placeholder="Company"
                />
              </div>
            ) : (
              <div>
                <h1 className="text-xl font-bold text-slate-900">{current.name}</h1>
                {current.title && <p className="text-xs font-medium text-slate-600 mt-0.5">{current.title}</p>}
                {current.company && <p className="text-xs font-bold text-indigo-600 mt-0.5">{current.company}</p>}
              </div>
            )}
          </div>

          {/* Quick Action Dial Buttons */}
          <div className="grid grid-cols-4 gap-2 pt-1">
            {current.phone ? (
              <a
                href={`tel:${current.phone}`}
                className="flex flex-col items-center justify-center p-2.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded-2xl transition-all active:scale-95 text-center gap-1"
              >
                <Phone className="w-4 h-4" />
                <span className="text-[10px] font-semibold">Call</span>
              </a>
            ) : (
              <div className="flex flex-col items-center justify-center p-2.5 bg-slate-50 text-slate-300 rounded-2xl text-center gap-1 opacity-50">
                <Phone className="w-4 h-4" />
                <span className="text-[10px]">Call</span>
              </div>
            )}

            {cleanWhatsappNumber ? (
              <a
                href={`https://wa.me/${cleanWhatsappNumber}`}
                target="_blank"
                rel="noreferrer"
                className="flex flex-col items-center justify-center p-2.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-2xl transition-all active:scale-95 text-center gap-1 shadow-xs"
              >
                <MessageCircle className="w-4 h-4 fill-current" />
                <span className="text-[10px] font-bold">WhatsApp</span>
              </a>
            ) : (
              <div className="flex flex-col items-center justify-center p-2.5 bg-slate-50 text-slate-300 rounded-2xl text-center gap-1 opacity-50">
                <MessageCircle className="w-4 h-4" />
                <span className="text-[10px]">WhatsApp</span>
              </div>
            )}

            {current.email ? (
              <a
                href={`mailto:${current.email}`}
                className="flex flex-col items-center justify-center p-2.5 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-2xl transition-all active:scale-95 text-center gap-1"
              >
                <Mail className="w-4 h-4" />
                <span className="text-[10px] font-semibold">Email</span>
              </a>
            ) : (
              <div className="flex flex-col items-center justify-center p-2.5 bg-slate-50 text-slate-300 rounded-2xl text-center gap-1 opacity-50">
                <Mail className="w-4 h-4" />
                <span className="text-[10px]">Email</span>
              </div>
            )}

            <button
              onClick={() => downloadVCard(current)}
              className="flex flex-col items-center justify-center p-2.5 bg-purple-50 hover:bg-purple-100 text-purple-700 rounded-2xl transition-all active:scale-95 text-center gap-1"
              title="Download vCard (.vcf)"
            >
              <Download className="w-4 h-4" />
              <span className="text-[10px] font-semibold">Save vCard</span>
            </button>
          </div>

          {/* Dedicated Media Section Block AFTER card is saved */}
          <AttachedMediaSection
            items={stagedItems}
            onAddItem={handleAddMediaStaged}
            onRemoveItem={onDeleteMedia}
            defaultBlockName={card.blockName}
            cardName={card.name}
          />

          {/* QR Codes Display Section (WhatsApp QR & WeChat QR) */}
          {(current.whatsappQrUrl || current.wechatQrUrl) && (
            <div className="bg-emerald-50/70 rounded-2xl p-4 border border-emerald-200/80 space-y-3">
              <div className="flex items-center gap-1.5">
                <QrCode className="w-4 h-4 text-emerald-700" />
                <h3 className="font-bold text-xs text-emerald-950">Scanned QR Codes</h3>
              </div>

              <div className="grid grid-cols-2 gap-3">
                {current.whatsappQrUrl && (
                  <div className="bg-white rounded-xl p-2.5 border border-emerald-200 flex flex-col items-center text-center">
                    <span className="text-[10px] font-bold text-emerald-800 mb-1 flex items-center gap-1">
                      <MessageCircle className="w-3 h-3 text-emerald-600" /> WhatsApp QR
                    </span>
                    <div
                      className="w-24 h-24 rounded-lg overflow-hidden border border-slate-200 cursor-pointer p-1 bg-white hover:scale-105 transition-transform"
                      onClick={() => setLightboxImage(current.whatsappQrUrl || null)}
                    >
                      <img src={current.whatsappQrUrl} alt="WhatsApp QR" className="w-full h-full object-contain" />
                    </div>
                    <span className="text-[9px] text-slate-400 mt-1">Tap to enlarge</span>
                  </div>
                )}

                {current.wechatQrUrl && (
                  <div className="bg-white rounded-xl p-2.5 border border-emerald-200 flex flex-col items-center text-center">
                    <span className="text-[10px] font-bold text-emerald-800 mb-1 flex items-center gap-1">
                      <MessageSquare className="w-3 h-3 text-emerald-600" /> WeChat QR
                    </span>
                    <div
                      className="w-24 h-24 rounded-lg overflow-hidden border border-slate-200 cursor-pointer p-1 bg-white hover:scale-105 transition-transform"
                      onClick={() => setLightboxImage(current.wechatQrUrl || null)}
                    >
                      <img src={current.wechatQrUrl} alt="WeChat QR" className="w-full h-full object-contain" />
                    </div>
                    <span className="text-[9px] text-slate-400 mt-1">Tap to enlarge</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Complete Contact Information Details */}
          <div className="bg-slate-50 rounded-2xl p-4 space-y-3.5 border border-slate-100">
            <h3 className="font-bold text-xs text-slate-900 border-b border-slate-200/60 pb-2">
              Complete Contact Details
            </h3>

            {/* Phones */}
            {current.phone && (
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5 text-slate-500">
                  <Phone className="w-3.5 h-3.5 text-emerald-500" />
                  <span>Primary Phone</span>
                </div>
                <a href={`tel:${current.phone}`} className="font-mono text-xs font-semibold text-slate-900 hover:text-emerald-600">
                  {current.phone}
                </a>
              </div>
            )}

            {current.secondaryPhone && (
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5 text-slate-500">
                  <Phone className="w-3.5 h-3.5 text-slate-400" />
                  <span>Alternate Phone</span>
                </div>
                <a href={`tel:${current.secondaryPhone}`} className="font-mono text-xs font-semibold text-slate-900 hover:text-emerald-600">
                  {current.secondaryPhone}
                </a>
              </div>
            )}

            {/* WhatsApp */}
            {current.whatsapp && (
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5 text-emerald-700">
                  <MessageCircle className="w-3.5 h-3.5 text-emerald-600" />
                  <span>WhatsApp</span>
                </div>
                <a
                  href={`https://wa.me/${cleanWhatsappNumber}`}
                  target="_blank"
                  rel="noreferrer"
                  className="font-mono text-xs font-bold text-emerald-600 hover:underline flex items-center gap-1"
                >
                  {current.whatsapp} <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            )}

            {/* WeChat */}
            {current.wechat && (
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5 text-emerald-700">
                  <MessageSquare className="w-3.5 h-3.5 text-emerald-600" />
                  <span>WeChat ID</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="font-mono text-xs font-bold text-slate-900">{current.wechat}</span>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(current.wechat || '');
                      alert('WeChat ID copied to clipboard!');
                    }}
                    className="text-[10px] bg-slate-200 hover:bg-slate-300 px-2 py-0.5 rounded text-slate-700 font-semibold"
                  >
                    Copy
                  </button>
                </div>
              </div>
            )}

            {/* Email */}
            {current.email && (
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5 text-slate-500">
                  <Mail className="w-3.5 h-3.5 text-blue-500" />
                  <span>Email</span>
                </div>
                <a href={`mailto:${current.email}`} className="text-xs font-semibold text-blue-600 hover:underline truncate max-w-[200px]">
                  {current.email}
                </a>
              </div>
            )}

            {/* Website */}
            {current.website && (
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5 text-slate-500">
                  <Globe className="w-3.5 h-3.5 text-indigo-500" />
                  <span>Website</span>
                </div>
                <a
                  href={current.website.startsWith('http') ? current.website : `https://${current.website}`}
                  target="_blank"
                  rel="noreferrer"
                  className="text-xs font-semibold text-indigo-600 hover:underline truncate max-w-[200px]"
                >
                  {current.website}
                </a>
              </div>
            )}

            {/* Address */}
            {current.address && (
              <div className="flex items-start justify-between gap-4 pt-1 border-t border-slate-200/50">
                <div className="flex items-center gap-2.5 text-slate-500 shrink-0">
                  <MapPin className="w-3.5 h-3.5 text-rose-500" />
                  <span>Address</span>
                </div>
                <a
                  href={`https://maps.google.com/?q=${encodeURIComponent(current.address)}`}
                  target="_blank"
                  rel="noreferrer"
                  className="text-xs text-slate-900 text-right hover:text-indigo-600 hover:underline"
                >
                  {current.address}
                </a>
              </div>
            )}

            {/* Social Links */}
            {current.socialLinks && (
              <div className="flex items-center justify-between pt-1 border-t border-slate-200/50">
                <div className="flex items-center gap-2.5 text-slate-500 shrink-0">
                  <Globe className="w-3.5 h-3.5 text-purple-500" />
                  <span>Social Handles</span>
                </div>
                <span className="text-xs text-slate-900 truncate max-w-[200px]">{current.socialLinks}</span>
              </div>
            )}

            {/* Tags */}
            {current.tags && current.tags.length > 0 && (
              <div className="flex items-center gap-2 pt-1 border-t border-slate-200/50 flex-wrap">
                <Tag className="w-3.5 h-3.5 text-slate-400" />
                {current.tags.map((tag) => (
                  <span key={tag} className="text-[10px] font-semibold px-2 py-0.5 bg-indigo-50 text-indigo-600 rounded-md">
                    #{tag}
                  </span>
                ))}
              </div>
            )}

            {/* Notes */}
            {current.notes && (
              <div className="pt-2 border-t border-slate-200/50 space-y-1">
                <div className="flex items-center gap-2 text-slate-500">
                  <FileText className="w-3.5 h-3.5 text-slate-400" />
                  <span className="font-semibold text-[11px] uppercase tracking-wider">Notes & Slogans</span>
                </div>
                <p className="text-xs text-slate-700 bg-white p-2.5 rounded-xl border border-slate-200/70 whitespace-pre-line leading-relaxed">
                  {current.notes}
                </p>
              </div>
            )}

            {/* Timestamp */}
            <div className="flex items-center gap-1.5 text-[10px] text-slate-400 pt-2 border-t border-slate-200/40">
              <Calendar className="w-3 h-3" />
              <span>Saved on {new Date(current.createdAt).toLocaleDateString([], { month: 'long', day: 'numeric', year: 'numeric' })}</span>
            </div>
          </div>
        </div>

        {/* Edit Footer */}
        {isEditing && (
          <div className="p-4 border-t border-slate-100 bg-white sticky bottom-0 z-10 flex items-center gap-3">
            <button
              onClick={() => setIsEditing(false)}
              className="flex-1 py-2.5 bg-slate-100 text-slate-700 font-semibold text-xs rounded-xl"
            >
              Cancel
            </button>
            <button
              onClick={handleSaveEdit}
              className="flex-1 flex items-center justify-center gap-1.5 py-2.5 bg-indigo-600 text-white font-semibold text-xs rounded-xl shadow-md"
            >
              <Check className="w-4 h-4" /> Save Changes
            </button>
          </div>
        )}
      </div>

      {/* Lightbox for viewing photos and QR codes */}
      {lightboxImage && (
        <div
          className="fixed inset-0 z-60 bg-black/90 backdrop-blur-md flex items-center justify-center p-4"
          onClick={() => setLightboxImage(null)}
        >
          <img src={lightboxImage} alt="Full preview" className="max-w-full max-h-full rounded-2xl object-contain bg-white p-2" />
          <button className="absolute top-4 right-4 text-white p-2 rounded-full bg-slate-800">
            <X className="w-6 h-6" />
          </button>
        </div>
      )}
    </div>
  );
};
