import React, { useState, useEffect } from 'react';
import { User, Briefcase, Building, Phone, Mail, Globe, MapPin, Tag, FileText, Check, X, MessageCircle, MessageSquare, QrCode, Camera, Upload, Trash2 } from 'lucide-react';
import type { OCRResult, BusinessCard } from '../types';
import { AttachedMediaSection, StagedMediaItem } from './AttachedMediaSection';
import { CameraCaptureModal } from './CameraCaptureModal';

interface ReviewCardModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (card: BusinessCard, stagedMedia?: StagedMediaItem[]) => void;
  frontImage: string;
  initialOcr: OCRResult;
  defaultBlockName: string;
}

export const ReviewCardModal: React.FC<ReviewCardModalProps> = ({
  isOpen,
  onClose,
  onSave,
  frontImage,
  initialOcr,
  defaultBlockName
}) => {
  const [name, setName] = useState(initialOcr.name || '');
  const [title, setTitle] = useState(initialOcr.title || '');
  const [company, setCompany] = useState(initialOcr.company || '');
  const [phone, setPhone] = useState(initialOcr.phone || '');
  const [secondaryPhone, setSecondaryPhone] = useState(initialOcr.secondaryPhone || '');
  const [whatsapp, setWhatsapp] = useState(initialOcr.whatsapp || initialOcr.phone || '');
  const [whatsappQr, setWhatsappQr] = useState<string | undefined>(initialOcr.whatsappQrUrl);
  const [wechat, setWechat] = useState(initialOcr.wechat || '');
  const [wechatQr, setWechatQr] = useState<string | undefined>(initialOcr.wechatQrUrl);
  const [email, setEmail] = useState(initialOcr.email || '');
  const [website, setWebsite] = useState(initialOcr.website || '');
  const [address, setAddress] = useState(initialOcr.address || '');
  const [socialLinks, setSocialLinks] = useState(initialOcr.socialLinks || '');
  const [notes, setNotes] = useState(initialOcr.notes || '');
  const [blockName, setBlockName] = useState(defaultBlockName || 'General');
  const [tagInput, setTagInput] = useState((initialOcr.tags || []).join(', '));
  
  // Staged Media items attached before saving
  const [stagedMedia, setStagedMedia] = useState<StagedMediaItem[]>([]);

  // Camera modal state for QR codes
  const [cameraTarget, setCameraTarget] = useState<'whatsapp_qr' | 'wechat_qr' | null>(null);

  useEffect(() => {
    // If QR codes detected, sync to state
    if (initialOcr.whatsappQrUrl) setWhatsappQr(initialOcr.whatsappQrUrl);
    if (initialOcr.wechatQrUrl) setWechatQr(initialOcr.wechatQrUrl);
  }, [initialOcr]);

  if (!isOpen) return null;

  const handleAddMedia = (item: StagedMediaItem) => {
    setStagedMedia((prev) => [...prev, item]);
  };

  const handleRemoveMedia = (id: string) => {
    setStagedMedia((prev) => prev.filter((m) => m.id !== id));
  };

  const handleQrUpload = (e: React.ChangeEvent<HTMLInputElement>, target: 'whatsapp' | 'wechat') => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        if (target === 'whatsapp') setWhatsappQr(reader.result as string);
        else setWechatQr(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = () => {
    const cardId = 'card_' + Date.now();
    const tagsArray = tagInput
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean);

    const newCard: BusinessCard = {
      id: cardId,
      name: name.trim() || 'Unnamed Contact',
      title: title.trim(),
      company: company.trim(),
      phone: phone.trim(),
      secondaryPhone: secondaryPhone.trim(),
      whatsapp: whatsapp.trim(),
      whatsappQrUrl: whatsappQr,
      wechat: wechat.trim(),
      wechatQrUrl: wechatQr,
      email: email.trim(),
      website: website.trim(),
      address: address.trim(),
      socialLinks: socialLinks.trim(),
      notes: notes.trim(),
      blockName: blockName.trim() || defaultBlockName || 'General',
      tags: tagsArray,
      frontImageUrl: frontImage,
      createdAt: Date.now(),
      updatedAt: Date.now()
    };

    onSave(newCard, stagedMedia);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-slate-950/60 backdrop-blur-sm overflow-y-auto animate-in fade-in">
      <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl border border-slate-100 flex flex-col max-h-[92vh] overflow-hidden my-auto">
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 bg-white sticky top-0 z-10">
          <div>
            <h2 className="text-base font-bold text-slate-900">Review Contact Details</h2>
            <p className="text-xs text-slate-500">Auto-extracted with Gemini AI</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 overflow-y-auto space-y-4 text-xs">
          {/* Card Preview Banner */}
          <div className="relative rounded-2xl overflow-hidden border border-slate-200 aspect-16/10 bg-slate-50">
            <img src={frontImage} alt="Card Front" className="w-full h-full object-cover" />
            <span className="absolute bottom-1.5 left-1.5 bg-black/60 backdrop-blur-xs text-white text-[10px] px-2 py-0.5 rounded-md">
              Card Front
            </span>
          </div>

          {/* Dedicated Media Section Block BEFORE card is saved */}
          <AttachedMediaSection
            items={stagedMedia}
            onAddItem={handleAddMedia}
            onRemoveItem={handleRemoveMedia}
            defaultBlockName={blockName}
            cardName={name}
          />

          {/* Contact Information Fields */}
          <div className="space-y-3 pt-1">
            <div>
              <label className="text-[11px] font-semibold text-slate-700 flex items-center gap-1.5 mb-1">
                <User className="w-3.5 h-3.5 text-indigo-500" /> Full Name *
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Full Name"
                className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium text-sm"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] font-semibold text-slate-700 flex items-center gap-1.5 mb-1">
                  <Briefcase className="w-3.5 h-3.5 text-indigo-500" /> Job Title
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Product Lead"
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-xs"
                />
              </div>

              <div>
                <label className="text-[11px] font-semibold text-slate-700 flex items-center gap-1.5 mb-1">
                  <Building className="w-3.5 h-3.5 text-indigo-500" /> Company
                </label>
                <input
                  type="text"
                  value={company}
                  onChange={(e) => setCompany(e.target.value)}
                  placeholder="Organization"
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-xs"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] font-semibold text-slate-700 flex items-center gap-1.5 mb-1">
                  <Phone className="w-3.5 h-3.5 text-emerald-500" /> Primary Phone
                </label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+1 (555) 000-0000"
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-xs font-mono"
                />
              </div>

              <div>
                <label className="text-[11px] font-semibold text-slate-700 flex items-center gap-1.5 mb-1">
                  <Phone className="w-3.5 h-3.5 text-slate-400" /> Alternate Phone
                </label>
                <input
                  type="tel"
                  value={secondaryPhone}
                  onChange={(e) => setSecondaryPhone(e.target.value)}
                  placeholder="Office / Mobile"
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-xs font-mono"
                />
              </div>
            </div>

            {/* WhatsApp Section with Dedicated QR Placeholder */}
            <div className="bg-emerald-50/60 p-3.5 rounded-2xl border border-emerald-100 space-y-2.5">
              <div className="flex items-center justify-between">
                <label className="text-[11px] font-bold text-emerald-900 flex items-center gap-1.5">
                  <MessageCircle className="w-4 h-4 text-emerald-600" /> WhatsApp Contact & QR Code
                </label>
                {whatsappQr && (
                  <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-md">
                    ✓ QR Attached
                  </span>
                )}
              </div>

              <input
                type="tel"
                value={whatsapp}
                onChange={(e) => setWhatsapp(e.target.value)}
                placeholder="WhatsApp Number with country code"
                className="w-full px-3 py-2 bg-white border border-emerald-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-xs font-mono"
              />

              {/* Dedicated WhatsApp QR Placeholder Block */}
              <div className="flex items-center gap-3 bg-white p-2.5 rounded-xl border border-emerald-200">
                {whatsappQr ? (
                  <div className="relative w-16 h-16 rounded-lg overflow-hidden border border-emerald-300 shrink-0 bg-white">
                    <img src={whatsappQr} alt="WhatsApp QR" className="w-full h-full object-contain" />
                    <button
                      type="button"
                      onClick={() => setWhatsappQr(undefined)}
                      className="absolute top-0.5 right-0.5 bg-rose-500 text-white p-0.5 rounded-full"
                      title="Remove QR"
                    >
                      <X className="w-2.5 h-2.5" />
                    </button>
                  </div>
                ) : (
                  <div className="w-16 h-16 rounded-lg border-2 border-dashed border-emerald-200 bg-emerald-50/50 flex flex-col items-center justify-center shrink-0 text-emerald-600">
                    <QrCode className="w-6 h-6 stroke-[1.5]" />
                    <span className="text-[8px] font-bold mt-0.5">No QR</span>
                  </div>
                )}

                <div className="flex-1 min-w-0">
                  <span className="text-[11px] font-bold text-slate-800 block">WhatsApp QR Code</span>
                  <p className="text-[10px] text-slate-400 mb-1.5">
                    {whatsappQr ? 'Auto-cropped from card or attached' : 'Auto-cropped from scan or attach below:'}
                  </p>
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => setCameraTarget('whatsapp_qr')}
                      className="flex items-center gap-1 px-2.5 py-1 bg-emerald-100 hover:bg-emerald-200 text-emerald-800 font-semibold text-[10px] rounded-lg transition-colors"
                    >
                      <Camera className="w-3 h-3" /> Snap QR
                    </button>
                    <label className="flex items-center gap-1 px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-[10px] rounded-lg cursor-pointer transition-colors">
                      <Upload className="w-3 h-3" /> Upload
                      <input type="file" accept="image/*" onChange={(e) => handleQrUpload(e, 'whatsapp')} className="hidden" />
                    </label>
                  </div>
                </div>
              </div>
            </div>

            {/* WeChat Section with Dedicated QR Placeholder */}
            <div className="bg-emerald-50/60 p-3.5 rounded-2xl border border-emerald-100 space-y-2.5">
              <div className="flex items-center justify-between">
                <label className="text-[11px] font-bold text-emerald-900 flex items-center gap-1.5">
                  <MessageSquare className="w-4 h-4 text-emerald-600" /> WeChat ID & QR Code
                </label>
                {wechatQr && (
                  <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-md">
                    ✓ QR Attached
                  </span>
                )}
              </div>

              <input
                type="text"
                value={wechat}
                onChange={(e) => setWechat(e.target.value)}
                placeholder="WeChat ID / WX ID / 微信号"
                className="w-full px-3 py-2 bg-white border border-emerald-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-xs"
              />

              {/* Dedicated WeChat QR Placeholder Block */}
              <div className="flex items-center gap-3 bg-white p-2.5 rounded-xl border border-emerald-200">
                {wechatQr ? (
                  <div className="relative w-16 h-16 rounded-lg overflow-hidden border border-emerald-300 shrink-0 bg-white">
                    <img src={wechatQr} alt="WeChat QR" className="w-full h-full object-contain" />
                    <button
                      type="button"
                      onClick={() => setWechatQr(undefined)}
                      className="absolute top-0.5 right-0.5 bg-rose-500 text-white p-0.5 rounded-full"
                      title="Remove QR"
                    >
                      <X className="w-2.5 h-2.5" />
                    </button>
                  </div>
                ) : (
                  <div className="w-16 h-16 rounded-lg border-2 border-dashed border-emerald-200 bg-emerald-50/50 flex flex-col items-center justify-center shrink-0 text-emerald-600">
                    <QrCode className="w-6 h-6 stroke-[1.5]" />
                    <span className="text-[8px] font-bold mt-0.5">No QR</span>
                  </div>
                )}

                <div className="flex-1 min-w-0">
                  <span className="text-[11px] font-bold text-slate-800 block">WeChat QR Code</span>
                  <p className="text-[10px] text-slate-400 mb-1.5">
                    {wechatQr ? 'Auto-cropped from card or attached' : 'Auto-cropped from scan or attach below:'}
                  </p>
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => setCameraTarget('wechat_qr')}
                      className="flex items-center gap-1 px-2.5 py-1 bg-emerald-100 hover:bg-emerald-200 text-emerald-800 font-semibold text-[10px] rounded-lg transition-colors"
                    >
                      <Camera className="w-3 h-3" /> Snap QR
                    </button>
                    <label className="flex items-center gap-1 px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-[10px] rounded-lg cursor-pointer transition-colors">
                      <Upload className="w-3 h-3" /> Upload
                      <input type="file" accept="image/*" onChange={(e) => handleQrUpload(e, 'wechat')} className="hidden" />
                    </label>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] font-semibold text-slate-700 flex items-center gap-1.5 mb-1">
                  <Mail className="w-3.5 h-3.5 text-blue-500" /> Email
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@company.com"
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-xs"
                />
              </div>

              <div>
                <label className="text-[11px] font-semibold text-slate-700 flex items-center gap-1.5 mb-1">
                  <Globe className="w-3.5 h-3.5 text-indigo-500" /> Website
                </label>
                <input
                  type="text"
                  value={website}
                  onChange={(e) => setWebsite(e.target.value)}
                  placeholder="https://example.com"
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-xs"
                />
              </div>
            </div>

            <div>
              <label className="text-[11px] font-semibold text-slate-700 flex items-center gap-1.5 mb-1">
                <MapPin className="w-3.5 h-3.5 text-rose-500" /> Address
              </label>
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Street, City, State, Country"
                className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-xs"
              />
            </div>

            <div>
              <label className="text-[11px] font-semibold text-slate-700 flex items-center gap-1.5 mb-1">
                <Globe className="w-3.5 h-3.5 text-indigo-500" /> Social Links
              </label>
              <input
                type="text"
                value={socialLinks}
                onChange={(e) => setSocialLinks(e.target.value)}
                placeholder="LinkedIn / Twitter profile URL"
                className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-xs"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] font-semibold text-slate-700 flex items-center gap-1.5 mb-1">
                  <Tag className="w-3.5 h-3.5 text-amber-500" /> Block / Group
                </label>
                <input
                  type="text"
                  value={blockName}
                  onChange={(e) => setBlockName(e.target.value)}
                  placeholder="Default block"
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-xs"
                />
              </div>

              <div>
                <label className="text-[11px] font-semibold text-slate-700 flex items-center gap-1.5 mb-1">
                  <Tag className="w-3.5 h-3.5 text-purple-500" /> Tags
                </label>
                <input
                  type="text"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  placeholder="VIP, Tech, Lead"
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-xs"
                />
              </div>
            </div>

            <div>
              <label className="text-[11px] font-semibold text-slate-700 flex items-center gap-1.5 mb-1">
                <FileText className="w-3.5 h-3.5 text-slate-400" /> Notes & Slogans
              </label>
              <textarea
                rows={2}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Additional notes from card..."
                className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-xs resize-none"
              />
            </div>
          </div>
        </div>

        <div className="p-4 border-t border-slate-100 bg-white sticky bottom-0 z-10 flex items-center gap-3">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs rounded-2xl transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="flex-2 flex items-center justify-center gap-2 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs rounded-2xl shadow-md transition-transform active:scale-95"
          >
            <Check className="w-4 h-4" />
            Save Contact Card
          </button>
        </div>
      </div>

      {/* QR Camera Capture modal */}
      {cameraTarget && (
        <CameraCaptureModal
          isOpen={!!cameraTarget}
          onClose={() => setCameraTarget(null)}
          onCapture={(img) => {
            if (cameraTarget === 'whatsapp_qr') setWhatsappQr(img);
            else if (cameraTarget === 'wechat_qr') setWechatQr(img);
            setCameraTarget(null);
          }}
          title={cameraTarget === 'whatsapp_qr' ? 'Snap WhatsApp QR' : 'Snap WeChat QR'}
        />
      )}
    </div>
  );
};
