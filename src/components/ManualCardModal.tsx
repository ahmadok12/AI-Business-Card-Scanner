import React, { useState } from 'react';
import type { BusinessCard } from '../types';
import {
  X,
  User,
  Building,
  Briefcase,
  Phone,
  Mail,
  Globe,
  MapPin,
  Share2,
  Tag,
  FileText,
  Camera,
  Upload,
  QrCode,
  Check,
  Save,
  MessageSquare,
  Sparkles,
  WifiOff,
  ChevronLeft
} from 'lucide-react';
import { AttachedMediaSection, StagedMediaItem } from './AttachedMediaSection';
import { CameraCaptureModal } from './CameraCaptureModal';

interface ManualCardModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (newCard: BusinessCard, stagedMedia?: StagedMediaItem[]) => void;
  defaultBlockName?: string;
}

export const ManualCardModal: React.FC<ManualCardModalProps> = ({
  isOpen,
  onClose,
  onSave,
  defaultBlockName = 'General'
}) => {
  const [name, setName] = useState('');
  const [title, setTitle] = useState('');
  const [company, setCompany] = useState('');
  const [phone, setPhone] = useState('');
  const [secondaryPhone, setSecondaryPhone] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [whatsappQr, setWhatsappQr] = useState<string | undefined>(undefined);
  const [wechat, setWechat] = useState('');
  const [wechatQr, setWechatQr] = useState<string | undefined>(undefined);
  const [email, setEmail] = useState('');
  const [website, setWebsite] = useState('');
  const [address, setAddress] = useState('');
  const [socialLinks, setSocialLinks] = useState('');
  const [notes, setNotes] = useState('');
  const [blockName, setBlockName] = useState(defaultBlockName);
  const [tagInput, setTagInput] = useState('Manual Entry');
  const [tags, setTags] = useState<string[]>(['Manual Entry']);
  const [frontImage, setFrontImage] = useState<string | undefined>(undefined);
  const [stagedMedia, setStagedMedia] = useState<StagedMediaItem[]>([]);
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [errorNotice, setErrorNotice] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleAddTag = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      const val = tagInput.trim().replace(/^,|,$/g, '');
      if (val && !tags.includes(val)) {
        setTags([...tags, val]);
        setTagInput('');
      }
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter((t) => t !== tagToRemove));
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setFrontImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleQrUpload = (type: 'whatsapp' | 'wechat', e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        if (type === 'whatsapp') {
          setWhatsappQr(reader.result as string);
        } else {
          setWechatQr(reader.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setErrorNotice('Please enter at least a contact or company name.');
      return;
    }

    const cardId = 'card_manual_' + Date.now();
    const finalTags = tags.length > 0 ? tags : ['Manual Entry'];

    const newCard: BusinessCard = {
      id: cardId,
      name: name.trim(),
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
      tags: finalTags,
      frontImageUrl: frontImage,
      createdAt: Date.now(),
      updatedAt: Date.now()
    };

    onSave(newCard, stagedMedia);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/60 backdrop-blur-md overflow-y-auto animate-in fade-in">
      <div className="bg-[#FBF9F7] text-[#181716] w-full max-w-lg rounded-[28px] sm:rounded-[36px] shadow-porcelain border border-[#EDE8E1] flex flex-col max-h-[94vh] overflow-hidden my-auto font-grotesk">
        {/* Top Header */}
        <header className="sticky top-0 z-30 bg-[#FBF9F7]/95 backdrop-blur-xl border-b border-[#EDE8E1]/80 px-4 sm:px-5 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onClose}
              className="w-10 h-10 rounded-full bg-white border border-[#EDE8E1] text-[#181716] shadow-porcelain-sm hover:text-[#FF5722] hover:border-[#FF5722]/30 flex items-center justify-center transition-colors"
              aria-label="Go back"
            >
              <ChevronLeft className="w-5 h-5 -ml-0.5" />
            </button>
            <div>
              <div className="flex items-center gap-1.5">
                <h1 className="font-condensed font-bold text-base sm:text-lg tracking-tight text-[#181716]">
                  Manual Card Entry
                </h1>
                <span className="flex items-center gap-1 bg-[#FFF0EB] text-[#FF5722] border border-[#FF5722]/30 text-[10px] font-bold px-2 py-0.5 rounded-full">
                  <WifiOff className="w-3 h-3" /> Offline Ready
                </span>
              </div>
              <p className="text-[11px] text-[#7C7875]">Saved locally to your device without AI</p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white hover:bg-[#F8F6F4] text-[#7C7875] hover:text-[#181716] border border-[#EDE8E1] flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </header>

        {/* Scrollable Form Body */}
        <form onSubmit={handleSave} className="overflow-y-auto px-4 sm:px-5 py-4 space-y-4">
          {errorNotice && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 text-xs rounded-2xl font-semibold flex items-center justify-between">
              <span>{errorNotice}</span>
              <button type="button" onClick={() => setErrorNotice(null)} className="text-rose-500 hover:text-rose-700">
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Optional Card Photo Slot */}
          <div className="bg-white rounded-2xl p-3.5 border border-[#EDE8E1] shadow-porcelain-sm">
            <label className="text-xs font-bold text-[#181716] mb-2 block flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Camera className="w-3.5 h-3.5 text-[#FF5722]" /> Card Photo (Optional)
              </span>
              <span className="text-[10px] text-[#7C7875] font-normal">Optional visual reference</span>
            </label>

            {frontImage ? (
              <div className="relative aspect-16/9 rounded-xl overflow-hidden border border-[#EDE8E1] bg-[#181716] group">
                <img src={frontImage} alt="Card Preview" className="w-full h-full object-contain" />
                <button
                  type="button"
                  onClick={() => setFrontImage(undefined)}
                  className="absolute top-2 right-2 p-1.5 bg-black/70 hover:bg-rose-600 text-white rounded-full transition-colors"
                  title="Remove photo"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setIsCameraOpen(true)}
                  className="flex items-center justify-center gap-2 p-3 rounded-xl border border-dashed border-[#EDE8E1] hover:border-[#FF5722] bg-[#F8F6F4] hover:bg-[#FFF0EB] text-[#181716] text-xs font-semibold transition-all active:scale-98"
                >
                  <Camera className="w-4 h-4 text-[#FF5722]" />
                  <span>Snap Photo</span>
                </button>

                <label className="flex items-center justify-center gap-2 p-3 rounded-xl border border-dashed border-[#EDE8E1] hover:border-[#FF5722] bg-[#F8F6F4] hover:bg-[#FFF0EB] text-[#181716] text-xs font-semibold cursor-pointer transition-all active:scale-98">
                  <Upload className="w-4 h-4 text-[#FF5722]" />
                  <span>Upload Image</span>
                  <input type="file" accept="image/*" onChange={handlePhotoUpload} className="hidden" />
                </label>
              </div>
            )}
          </div>

          {/* Primary Identity Section */}
          <div className="bg-white rounded-2xl p-4 border border-[#EDE8E1] shadow-porcelain-sm space-y-3">
            <h3 className="text-xs font-bold text-[#181716] uppercase tracking-wider flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-[#FF5722]" /> Contact Identity
            </h3>

            <div>
              <label className="text-[11px] font-bold text-[#7C7875] mb-1 block">
                Full Name <span className="text-[#FF5722]">*</span>
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  if (errorNotice) setErrorNotice(null);
                }}
                placeholder="e.g. Sarah Jenkins"
                className="w-full px-3.5 py-2.5 bg-[#F8F6F4] border border-[#EDE8E1] rounded-xl text-xs font-semibold text-[#181716] focus:outline-none focus:border-[#FF5722]"
              />
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              <div>
                <label className="text-[11px] font-bold text-[#7C7875] mb-1 block">Job Title</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. VP of Product"
                  className="w-full px-3 py-2 bg-[#F8F6F4] border border-[#EDE8E1] rounded-xl text-xs text-[#181716] focus:outline-none focus:border-[#FF5722]"
                />
              </div>
              <div>
                <label className="text-[11px] font-bold text-[#7C7875] mb-1 block">Company</label>
                <input
                  type="text"
                  value={company}
                  onChange={(e) => setCompany(e.target.value)}
                  placeholder="e.g. Apex Innovations"
                  className="w-full px-3 py-2 bg-[#F8F6F4] border border-[#EDE8E1] rounded-xl text-xs text-[#181716] focus:outline-none focus:border-[#FF5722]"
                />
              </div>
            </div>
          </div>

          {/* Communication Details */}
          <div className="bg-white rounded-2xl p-4 border border-[#EDE8E1] shadow-porcelain-sm space-y-3">
            <h3 className="text-xs font-bold text-[#181716] uppercase tracking-wider flex items-center gap-1.5">
              <Phone className="w-3.5 h-3.5 text-[#FF5722]" /> Phone & Email
            </h3>

            <div className="grid grid-cols-2 gap-2.5">
              <div>
                <label className="text-[11px] font-bold text-[#7C7875] mb-1 block">Phone Number</label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+1 (415) 555-0199"
                  className="w-full px-3 py-2 bg-[#F8F6F4] border border-[#EDE8E1] rounded-xl text-xs text-[#181716] focus:outline-none focus:border-[#FF5722]"
                />
              </div>
              <div>
                <label className="text-[11px] font-bold text-[#7C7875] mb-1 block">Secondary Phone</label>
                <input
                  type="tel"
                  value={secondaryPhone}
                  onChange={(e) => setSecondaryPhone(e.target.value)}
                  placeholder="Mobile / Work"
                  className="w-full px-3 py-2 bg-[#F8F6F4] border border-[#EDE8E1] rounded-xl text-xs text-[#181716] focus:outline-none focus:border-[#FF5722]"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              <div>
                <label className="text-[11px] font-bold text-[#7C7875] mb-1 block">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@company.com"
                  className="w-full px-3 py-2 bg-[#F8F6F4] border border-[#EDE8E1] rounded-xl text-xs text-[#181716] focus:outline-none focus:border-[#FF5722]"
                />
              </div>
              <div>
                <label className="text-[11px] font-bold text-[#7C7875] mb-1 block">Website</label>
                <input
                  type="text"
                  value={website}
                  onChange={(e) => setWebsite(e.target.value)}
                  placeholder="https://example.com"
                  className="w-full px-3 py-2 bg-[#F8F6F4] border border-[#EDE8E1] rounded-xl text-xs text-[#181716] focus:outline-none focus:border-[#FF5722]"
                />
              </div>
            </div>
          </div>

          {/* Direct Messaging & QR Codes */}
          <div className="bg-white rounded-2xl p-4 border border-[#EDE8E1] shadow-porcelain-sm space-y-3">
            <h3 className="text-xs font-bold text-[#181716] uppercase tracking-wider flex items-center gap-1.5">
              <MessageSquare className="w-3.5 h-3.5 text-[#FF5722]" /> WhatsApp & WeChat
            </h3>

            {/* WhatsApp */}
            <div className="p-3 bg-[#F8F6F4] rounded-xl border border-[#EDE8E1] space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[#181716] flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-[#25D366]" /> WhatsApp
                </span>
                <label className="text-[10px] font-bold text-[#FF5722] hover:underline cursor-pointer flex items-center gap-1">
                  <QrCode className="w-3 h-3" />
                  {whatsappQr ? 'Replace QR' : '+ Add QR'}
                  <input type="file" accept="image/*" onChange={(e) => handleQrUpload('whatsapp', e)} className="hidden" />
                </label>
              </div>
              <input
                type="text"
                value={whatsapp}
                onChange={(e) => setWhatsapp(e.target.value)}
                placeholder="WhatsApp Number (e.g. +14155550199)"
                className="w-full px-3 py-1.5 bg-white border border-[#EDE8E1] rounded-lg text-xs text-[#181716] focus:outline-none focus:border-[#FF5722]"
              />
              {whatsappQr && (
                <div className="flex items-center gap-2 p-1.5 bg-white rounded-lg border border-[#EDE8E1]">
                  <img src={whatsappQr} alt="WhatsApp QR" className="w-10 h-10 object-contain rounded" />
                  <span className="text-[10px] text-emerald-700 font-semibold">QR Code Attached</span>
                  <button type="button" onClick={() => setWhatsappQr(undefined)} className="ml-auto text-rose-500 text-xs p-1">
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
            </div>

            {/* WeChat */}
            <div className="p-3 bg-[#F8F6F4] rounded-xl border border-[#EDE8E1] space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[#181716] flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-[#07C160]" /> WeChat
                </span>
                <label className="text-[10px] font-bold text-[#FF5722] hover:underline cursor-pointer flex items-center gap-1">
                  <QrCode className="w-3 h-3" />
                  {wechatQr ? 'Replace QR' : '+ Add QR'}
                  <input type="file" accept="image/*" onChange={(e) => handleQrUpload('wechat', e)} className="hidden" />
                </label>
              </div>
              <input
                type="text"
                value={wechat}
                onChange={(e) => setWechat(e.target.value)}
                placeholder="WeChat ID / Phone"
                className="w-full px-3 py-1.5 bg-white border border-[#EDE8E1] rounded-lg text-xs text-[#181716] focus:outline-none focus:border-[#FF5722]"
              />
              {wechatQr && (
                <div className="flex items-center gap-2 p-1.5 bg-white rounded-lg border border-[#EDE8E1]">
                  <img src={wechatQr} alt="WeChat QR" className="w-10 h-10 object-contain rounded" />
                  <span className="text-[10px] text-emerald-700 font-semibold">QR Code Attached</span>
                  <button type="button" onClick={() => setWechatQr(undefined)} className="ml-auto text-rose-500 text-xs p-1">
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Location & Social */}
          <div className="bg-white rounded-2xl p-4 border border-[#EDE8E1] shadow-porcelain-sm space-y-3">
            <h3 className="text-xs font-bold text-[#181716] uppercase tracking-wider flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-[#FF5722]" /> Location & Socials
            </h3>

            <div>
              <label className="text-[11px] font-bold text-[#7C7875] mb-1 block">Address / Location</label>
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="e.g. 500 Howard St, San Francisco, CA"
                className="w-full px-3.5 py-2 bg-[#F8F6F4] border border-[#EDE8E1] rounded-xl text-xs text-[#181716] focus:outline-none focus:border-[#FF5722]"
              />
            </div>

            <div>
              <label className="text-[11px] font-bold text-[#7C7875] mb-1 block">LinkedIn / Social Profile</label>
              <input
                type="text"
                value={socialLinks}
                onChange={(e) => setSocialLinks(e.target.value)}
                placeholder="linkedin.com/in/username"
                className="w-full px-3.5 py-2 bg-[#F8F6F4] border border-[#EDE8E1] rounded-xl text-xs text-[#181716] focus:outline-none focus:border-[#FF5722]"
              />
            </div>
          </div>

          {/* Event Block & Tags */}
          <div className="bg-white rounded-2xl p-4 border border-[#EDE8E1] shadow-porcelain-sm space-y-3">
            <h3 className="text-xs font-bold text-[#181716] uppercase tracking-wider flex items-center gap-1.5">
              <Tag className="w-3.5 h-3.5 text-[#FF5722]" /> Organization & Tags
            </h3>

            <div>
              <label className="text-[11px] font-bold text-[#7C7875] mb-1 block">Event / Block Name</label>
              <input
                type="text"
                value={blockName}
                onChange={(e) => setBlockName(e.target.value)}
                placeholder="e.g. CES 2026 / Booth A"
                className="w-full px-3.5 py-2 bg-[#F8F6F4] border border-[#EDE8E1] rounded-xl text-xs text-[#181716] focus:outline-none focus:border-[#FF5722]"
              />
            </div>

            <div>
              <label className="text-[11px] font-bold text-[#7C7875] mb-1 block">Tags (press Enter or comma)</label>
              <div className="flex flex-wrap gap-1.5 mb-2">
                {tags.map((tg) => (
                  <span
                    key={tg}
                    className="inline-flex items-center gap-1 px-2.5 py-1 bg-[#FFF0EB] border border-[#FF5722]/30 text-[#FF5722] rounded-full text-[11px] font-semibold"
                  >
                    #{tg}
                    <button type="button" onClick={() => handleRemoveTag(tg)} className="hover:text-rose-600">
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
              <input
                type="text"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={handleAddTag}
                placeholder="Type tag and press Enter..."
                className="w-full px-3.5 py-2 bg-[#F8F6F4] border border-[#EDE8E1] rounded-xl text-xs text-[#181716] focus:outline-none focus:border-[#FF5722]"
              />
            </div>

            <div>
              <label className="text-[11px] font-bold text-[#7C7875] mb-1 block">Notes & Comments</label>
              <textarea
                rows={2}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Meeting notes, booth discussions, follow-ups..."
                className="w-full px-3.5 py-2 bg-[#F8F6F4] border border-[#EDE8E1] rounded-xl text-xs text-[#181716] resize-none focus:outline-none focus:border-[#FF5722]"
              />
            </div>
          </div>

          {/* Attached Media Section */}
          <div>
            <AttachedMediaSection
              items={stagedMedia}
              onAddItem={(m) => setStagedMedia((prev) => [...prev, m])}
              onRemoveItem={(id) => setStagedMedia((prev) => prev.filter((i) => i.id !== id))}
              defaultBlockName={blockName || defaultBlockName}
              cardName={name || 'New Contact'}
            />
          </div>

          {/* Bottom Action Buttons */}
          <div className="sticky bottom-0 bg-[#FBF9F7]/95 backdrop-blur-md pt-2 pb-1 flex items-center gap-3 border-t border-[#EDE8E1]">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 bg-[#EDEAE6] hover:bg-[#E4E0DA] text-[#181716] font-condensed text-xs font-bold rounded-full border border-[#E0DAD1] transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-[2] py-3 bg-gradient-to-r from-[#FF5722] to-[#FF4500] hover:brightness-105 text-white font-condensed text-xs font-bold rounded-full shadow-solar transition-all flex items-center justify-center gap-2"
            >
              <Save className="w-4 h-4" />
              <span>Save Contact to Database</span>
            </button>
          </div>
        </form>

        {/* Snap card photo modal */}
        <CameraCaptureModal
          isOpen={isCameraOpen}
          onClose={() => setIsCameraOpen(false)}
          onCapture={(base64) => setFrontImage(base64)}
          title="Take Business Card Photo"
        />
      </div>
    </div>
  );
};
