import React, { useState, useEffect } from 'react';
import {
  ChevronLeft,
  CheckCircle2,
  Phone,
  MessageCircle,
  Copy,
  MapPin,
  Sparkles,
  Plus,
  RefreshCw,
  Edit3,
  BadgeCheck,
  Building2,
  Briefcase,
  Mail,
  FileText,
  QrCode,
  Camera,
  Upload,
  X,
  Share2,
  Globe,
  Tag,
  Sliders,
  Send,
  Workflow
} from 'lucide-react';
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
  const [tags, setTags] = useState<string[]>(
    initialOcr.tags && initialOcr.tags.length > 0
      ? initialOcr.tags
      : ['Robotics', 'KeynoteSpeaker', 'AI-Summit-2025']
  );

  // Edit mode toggle
  const [isEditingAll, setIsEditingAll] = useState(false);
  const [newTagText, setNewTagText] = useState('');
  const [isAddingTag, setIsAddingTag] = useState(false);

  // Workflow automation toggles
  const [crmSyncEnabled, setCrmSyncEnabled] = useState(true);
  const [warmIntroEnabled, setWarmIntroEnabled] = useState(true);

  // Staged Media items attached before saving
  const [stagedMedia, setStagedMedia] = useState<StagedMediaItem[]>([]);

  // Camera modal state for QR codes
  const [cameraTarget, setCameraTarget] = useState<'whatsapp_qr' | 'wechat_qr' | null>(null);
  const [copiedEmail, setCopiedEmail] = useState(false);

  useEffect(() => {
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

  const handleAddTag = () => {
    if (newTagText.trim() && !tags.includes(newTagText.trim())) {
      const updated = [...tags, newTagText.trim()];
      setTags(updated);
      setTagInput(updated.join(', '));
      setNewTagText('');
      setIsAddingTag(false);
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    const updated = tags.filter((t) => t !== tagToRemove);
    setTags(updated);
    setTagInput(updated.join(', '));
  };

  const handleCopyEmail = () => {
    if (email) {
      navigator.clipboard.writeText(email);
      setCopiedEmail(true);
      setTimeout(() => setCopiedEmail(false), 2000);
    }
  };

  const handleSave = () => {
    const cardId = 'card_' + Date.now();
    const finalTags = tags.length > 0 ? tags : tagInput.split(',').map((t) => t.trim()).filter(Boolean);

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
      tags: finalTags,
      frontImageUrl: frontImage,
      createdAt: Date.now(),
      updatedAt: Date.now()
    };

    onSave(newCard, stagedMedia);
    onClose();
  };

  const cleanWhatsappNumber = (whatsapp || phone || '').replace(/[^0-9]/g, '');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/60 backdrop-blur-md overflow-y-auto animate-in fade-in">
      <div className="bg-[#FBF9F7] text-[#181716] w-full max-w-lg rounded-[28px] sm:rounded-[36px] shadow-porcelain border border-[#EAE6E1] flex flex-col max-h-[94vh] overflow-hidden my-auto font-grotesk">
        {/* Top Header */}
        <header className="sticky top-0 z-30 bg-[#FBF9F7]/95 backdrop-blur-xl border-b border-[#EAE6E1]/80 px-4 sm:px-5 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onClose}
              className="w-10 h-10 rounded-full bg-white border border-[#EAE6E1] text-[#181716] shadow-porcelain-sm hover:text-[#FF5722] hover:border-[#FF5722]/30 flex items-center justify-center transition-colors"
              aria-label="Go back"
            >
              <ChevronLeft className="w-5 h-5 -ml-0.5" />
            </button>
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-[#FFF0EB] border border-[#FF5722]/20 flex items-center justify-center text-[#FF5722]">
                <BadgeCheck className="w-4 h-4" />
              </div>
              <h1 className="font-syne font-bold text-base sm:text-lg tracking-tight text-[#181716]">
                Card Verification
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="hidden sm:inline-flex items-center gap-1.5 bg-[#FFF0EB] border border-[#FF5722]/30 text-[#FF5722] px-2.5 py-1 rounded-full text-[11px] font-bold">
              <span className="w-1.5 h-1.5 rounded-full bg-[#FF5722] animate-pulse" />
              AI Verified
            </span>
            <div className="w-8 h-8 rounded-full bg-[#EDE8E1] border-2 border-white flex items-center justify-center font-syne font-bold text-xs text-[#181716]">
              {name ? name.charAt(0).toUpperCase() : 'AI'}
            </div>
          </div>
        </header>

        {/* Scrollable Content Stream */}
        <div className="overflow-y-auto px-3.5 sm:px-5 py-4 space-y-4">
          {/* Viewfinder Background Stage with Perspective Card Preview */}
          <div className="relative w-full rounded-2xl overflow-hidden bg-white border border-[#EAE6E1] p-3 sm:p-4 shadow-porcelain-sm flex flex-col items-center justify-center">
            <div className="absolute inset-0 bg-gradient-to-b from-[#FAF8F5] via-[#F5F3EF]/60 to-[#EDE8E1]/40 pointer-events-none" />

            {/* Top Viewfinder Grid & HUD Accents */}
            <div className="w-full flex items-center justify-between z-10 mb-2.5 px-0.5">
              <div className="flex items-center gap-1.5 bg-[#FFF0EB] border border-[#FF5722]/20 px-2.5 py-1 rounded-full shadow-2xs">
                <span className="w-2 h-2 rounded-full bg-[#FF5722] animate-pulse" />
                <span className="text-[10px] sm:text-[11px] text-[#FF5722] font-bold uppercase tracking-wider">
                  AI OCR Live Reticle
                </span>
              </div>
              <div className="flex items-center gap-1">
                <span className="text-[10px] sm:text-[11px] text-[#7C7875] bg-white/90 border border-[#EAE6E1] px-2.5 py-1 rounded-full shadow-2xs font-medium">
                  ISO 100 • 4K
                </span>
              </div>
            </div>

            {/* Scanned Physical Card Target Preview */}
            <div className="relative w-full max-w-[360px] aspect-[1.75/1] rounded-2xl overflow-hidden shadow-[0_16px_36px_-8px_rgba(0,0,0,0.18)] border border-[#EAE6E1]">
              <img
                src={frontImage}
                alt="Scanned Business Card"
                className="w-full h-full object-cover"
              />

              {/* Optical HUD Overlay */}
              <div className="absolute inset-0 bg-black/25 backdrop-blur-[0.5px] p-3 flex flex-col justify-between">
                {/* AI Bounding Box 1 (Name) */}
                <div className="flex items-center justify-between">
                  <div className="bg-white/95 border-l-2 border-[#FF5722] px-2 py-0.5 rounded-sm shadow-sm backdrop-blur-sm">
                    <span className="font-syne text-[12px] sm:text-[13px] leading-tight text-[#181716] font-bold tracking-tight">
                      {name || 'Contact Name'}
                    </span>
                  </div>
                  <span className="bg-[#FF5722] text-white p-0.5 rounded-full text-[10px]">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                  </span>
                </div>

                {/* AI Bounding Box 2 (Brand / Company) */}
                <div className="bg-white/95 backdrop-blur-md px-2.5 py-0.5 rounded-md max-w-fit shadow-md border border-white/60">
                  <span className="text-[11px] font-bold text-[#FF5722] tracking-wide">
                    {company || title || 'Identified Brand'}
                  </span>
                </div>

                {/* AI Bounding Box 3 (Coordinates & Match) */}
                <div className="flex items-center justify-between pt-1">
                  <div className="bg-black/50 backdrop-blur-md px-2 py-0.5 rounded text-[9px] sm:text-[10px] text-white/90 font-medium truncate max-w-[170px]">
                    {address || 'Coordinates Detected'}
                  </div>
                  <div className="flex gap-1 items-center bg-[#FFF0EB] border border-[#FF5722]/30 text-[#FF5722] px-2.5 py-0.5 rounded-full text-[10px] font-bold shadow-2xs">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#FF5722]" />
                    99.8% Match
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Tactile Sheet Section */}
          <div className="relative w-full bg-white rounded-t-[28px] sm:rounded-t-[36px] -mt-3.5 p-3.5 sm:p-5 pt-2 border-t border-x border-[#EAE6E1] shadow-porcelain-sm z-20 flex flex-col gap-4">
            {/* Drag Pill Indicator */}
            <div className="w-full flex justify-center py-1">
              <div className="w-12 h-1.5 rounded-full bg-[#EDE8E1]" />
            </div>

            {/* Header Section with Semicircular Arc Gauge */}
            <div className="bg-[#F8F6F4] border border-[#EDE8E1] rounded-2xl p-4 flex flex-col items-center relative overflow-hidden shadow-2xs">
              <div className="w-full flex items-center justify-between mb-1">
                <div className="flex items-center gap-1.5">
                  <div className="w-6 h-6 rounded-full bg-[#FFF0EB] flex items-center justify-center text-[#FF5722] shadow-2xs">
                    <Sparkles className="w-3.5 h-3.5 text-[#FF5722]" />
                  </div>
                  <span className="text-[11px] uppercase tracking-wider text-[#FF5722] font-bold">
                    Card Parsed Instant
                  </span>
                </div>
                <div className="flex items-center gap-1.5 bg-white border border-[#EDE8E1] px-2.5 py-0.5 rounded-full shadow-2xs">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#10B981]" />
                  <span className="text-[10px] text-[#181716] font-medium">Live Sync Active</span>
                </div>
              </div>

              {/* Semi-Circular Precision Match Gauge Arc */}
              <div className="relative w-full max-w-[260px] h-[110px] flex flex-col items-center justify-end">
                <svg className="w-full h-[105px] overflow-visible" viewBox="0 0 240 120">
                  <defs>
                    <linearGradient id="gaugeGlowLight" x1="0%" x2="100%" y1="0%" y2="0%">
                      <stop offset="0%" stopColor="#FFA07A" />
                      <stop offset="60%" stopColor="#FF5722" />
                      <stop offset="100%" stopColor="#FF4500" />
                    </linearGradient>
                  </defs>
                  {/* Gauge Ticks Arc */}
                  <g opacity="0.45">
                    <path
                      d="M 25 110 A 95 95 0 0 1 215 110"
                      fill="none"
                      stroke="#E0DAD1"
                      strokeDasharray="2 7"
                      strokeLinecap="round"
                      strokeWidth="12"
                    />
                  </g>
                  {/* Active Gauge Progress */}
                  <path
                    d="M 25 110 A 95 95 0 0 1 211 110"
                    fill="none"
                    stroke="url(#gaugeGlowLight)"
                    strokeDasharray="2 7"
                    strokeLinecap="round"
                    strokeWidth="12"
                  />
                </svg>

                {/* Metric Reading Overlay */}
                <div className="absolute bottom-0 flex flex-col items-center">
                  <span className="font-syne text-2xl sm:text-3xl text-[#181716] tracking-tight font-bold">
                    99.8%
                  </span>
                  <span className="text-[10px] text-[#7C7875] font-bold tracking-wider uppercase -mt-0.5">
                    Neural OCR Accuracy
                  </span>
                </div>
              </div>

              {/* Quick Context Micro Badge */}
              <div className="mt-2 text-center">
                <p className="text-[11px] text-[#666360]">
                  Identified verified contact credentials & corporate domain
                </p>
              </div>
            </div>

            {/* Parsed Information Fields Header */}
            <div className="flex items-center justify-between px-1 pt-1">
              <span className="font-syne font-bold text-sm text-[#181716]">
                Extracted Information
              </span>
              <button
                type="button"
                onClick={() => setIsEditingAll(!isEditingAll)}
                className="text-[11px] text-[#FF5722] hover:text-[#d83900] transition-colors flex items-center gap-1 font-semibold"
              >
                <span>{isEditingAll ? 'Done Editing' : 'Edit All'}</span>
                <Edit3 className="w-3 h-3" />
              </button>
            </div>

            {/* Field Cards - Neo-Tactile Clean Cards */}
            <div className="flex flex-col gap-2.5">
              {/* Full Name & Credentials Field */}
              <div className="bg-[#F8F6F4] border border-[#EDE8E1] rounded-2xl p-3 sm:p-3.5 flex items-center justify-between transition-all hover:border-[#FF5722]/40 shadow-2xs">
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  <div className="w-10 h-10 rounded-xl bg-white border border-[#EDE8E1] flex items-center justify-center text-[#FF5722] shrink-0 shadow-2xs">
                    <BadgeCheck className="w-5 h-5" />
                  </div>
                  <div className="flex flex-col min-w-0 flex-1">
                    <span className="text-[10px] text-[#7C7875] font-medium uppercase tracking-wider">
                      Full Name
                    </span>
                    {isEditingAll ? (
                      <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Full Name"
                        className="w-full bg-white border border-[#EDE8E1] rounded-lg px-2.5 py-1 text-xs text-[#181716] font-semibold focus:outline-none focus:border-[#FF5722] mt-0.5"
                      />
                    ) : (
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <span className="font-syne text-sm text-[#181716] truncate font-bold">
                          {name || 'Unnamed Contact'}
                        </span>
                        <span className="w-3.5 h-3.5 text-[#10B981] shrink-0" title="Verified Human Identity">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                        </span>
                      </div>
                    )}
                  </div>
                </div>
                <span className="bg-[#FFF0EB] text-[#FF5722] border border-[#FF5722]/30 text-[9px] sm:text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider shrink-0 shadow-2xs ml-2">
                  AI Verified
                </span>
              </div>

              {/* Role & Organization Two-Column Split Tile */}
              <div className="grid grid-cols-2 gap-2.5">
                <div className="bg-[#F8F6F4] border border-[#EDE8E1] rounded-2xl p-3 sm:p-3.5 flex flex-col justify-between shadow-2xs">
                  <div className="flex items-center gap-1 text-[#7C7875] mb-1">
                    <Briefcase className="w-3.5 h-3.5 text-[#FF5722]" />
                    <span className="text-[10px] uppercase font-semibold">Designation</span>
                  </div>
                  {isEditingAll ? (
                    <input
                      type="text"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="Role / Title"
                      className="w-full bg-white border border-[#EDE8E1] rounded-lg px-2 py-1 text-xs text-[#181716] font-semibold focus:outline-none focus:border-[#FF5722]"
                    />
                  ) : (
                    <>
                      <span className="text-xs sm:text-sm text-[#181716] font-bold leading-snug truncate">
                        {title || 'Professional'}
                      </span>
                      <span className="text-[10px] text-[#FF5722] font-semibold mt-1">Verified Role</span>
                    </>
                  )}
                </div>

                <div className="bg-[#F8F6F4] border border-[#EDE8E1] rounded-2xl p-3 sm:p-3.5 flex flex-col justify-between shadow-2xs">
                  <div className="flex items-center gap-1 text-[#7C7875] mb-1">
                    <Building2 className="w-3.5 h-3.5 text-[#FF5722]" />
                    <span className="text-[10px] uppercase font-semibold">Company</span>
                  </div>
                  {isEditingAll ? (
                    <input
                      type="text"
                      value={company}
                      onChange={(e) => setCompany(e.target.value)}
                      placeholder="Company"
                      className="w-full bg-white border border-[#EDE8E1] rounded-lg px-2 py-1 text-xs text-[#181716] font-semibold focus:outline-none focus:border-[#FF5722]"
                    />
                  ) : (
                    <>
                      <span className="text-xs sm:text-sm text-[#181716] font-bold leading-snug truncate">
                        {company || 'Organization'}
                      </span>
                      <span className="text-[10px] text-[#666360] mt-1 truncate">Corporate Entity</span>
                    </>
                  )}
                </div>
              </div>

              {/* Phone Number with Quick-Action Triggers */}
              <div className="bg-[#F8F6F4] border border-[#EDE8E1] rounded-2xl p-3 sm:p-3.5 flex items-center justify-between shadow-2xs">
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  <div className="w-10 h-10 rounded-xl bg-white border border-[#EDE8E1] flex items-center justify-center text-[#FF5722] shrink-0 shadow-2xs">
                    <Phone className="w-4 h-4" />
                  </div>
                  <div className="flex flex-col min-w-0 flex-1">
                    <span className="text-[10px] text-[#7C7875] font-medium uppercase tracking-wider">
                      Phone Mobile (Direct)
                    </span>
                    {isEditingAll ? (
                      <input
                        type="tel"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="+1 (555) 000-0000"
                        className="w-full bg-white border border-[#EDE8E1] rounded-lg px-2 py-1 text-xs text-[#181716] font-mono focus:outline-none focus:border-[#FF5722] mt-0.5"
                      />
                    ) : (
                      <span className="text-xs sm:text-sm text-[#181716] font-bold mt-0.5 tracking-wide truncate">
                        {phone || 'Not detected'}
                      </span>
                    )}
                  </div>
                </div>

                {phone && (
                  <div className="flex items-center gap-1.5 shrink-0 ml-2">
                    <a
                      href={`tel:${phone}`}
                      aria-label="Call Contact"
                      className="w-8 h-8 rounded-full bg-white border border-[#EDE8E1] text-[#181716] hover:text-[#FF5722] hover:border-[#FF5722]/40 flex items-center justify-center transition-transform active:scale-95 shadow-2xs"
                    >
                      <Phone className="w-3.5 h-3.5" />
                    </a>
                    {cleanWhatsappNumber && (
                      <a
                        href={`https://wa.me/${cleanWhatsappNumber}`}
                        target="_blank"
                        rel="noreferrer"
                        aria-label="Message via WhatsApp"
                        className="w-8 h-8 rounded-full bg-white border border-[#EDE8E1] text-[#181716] hover:text-[#10B981] hover:border-[#10B981]/40 flex items-center justify-center transition-transform active:scale-95 shadow-2xs"
                      >
                        <MessageCircle className="w-3.5 h-3.5" />
                      </a>
                    )}
                  </div>
                )}
              </div>

              {/* Alternate Phone (if available or editing) */}
              {(secondaryPhone || isEditingAll) && (
                <div className="bg-[#F8F6F4] border border-[#EDE8E1] rounded-2xl p-3 flex items-center justify-between shadow-2xs">
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <div className="w-10 h-10 rounded-xl bg-white border border-[#EDE8E1] flex items-center justify-center text-[#7C7875] shrink-0 shadow-2xs">
                      <Phone className="w-4 h-4" />
                    </div>
                    <div className="flex flex-col min-w-0 flex-1">
                      <span className="text-[10px] text-[#7C7875] font-medium uppercase tracking-wider">
                        Alternate / Office Phone
                      </span>
                      {isEditingAll ? (
                        <input
                          type="tel"
                          value={secondaryPhone}
                          onChange={(e) => setSecondaryPhone(e.target.value)}
                          placeholder="Office / Secondary Phone"
                          className="w-full bg-white border border-[#EDE8E1] rounded-lg px-2 py-1 text-xs text-[#181716] font-mono focus:outline-none focus:border-[#FF5722] mt-0.5"
                        />
                      ) : (
                        <span className="text-xs text-[#181716] font-semibold mt-0.5 truncate">
                          {secondaryPhone}
                        </span>
                      )}
                    </div>
                  </div>
                  {secondaryPhone && (
                    <a
                      href={`tel:${secondaryPhone}`}
                      className="w-8 h-8 rounded-full bg-white border border-[#EDE8E1] text-[#181716] hover:text-[#FF5722] flex items-center justify-center shadow-2xs"
                    >
                      <Phone className="w-3.5 h-3.5" />
                    </a>
                  )}
                </div>
              )}

              {/* Corporate Email Field */}
              <div className="bg-[#F8F6F4] border border-[#EDE8E1] rounded-2xl p-3 sm:p-3.5 flex items-center justify-between shadow-2xs">
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  <div className="w-10 h-10 rounded-xl bg-white border border-[#EDE8E1] flex items-center justify-center text-[#FF5722] shrink-0 shadow-2xs">
                    <Mail className="w-4 h-4" />
                  </div>
                  <div className="flex flex-col min-w-0 flex-1">
                    <span className="text-[10px] text-[#7C7875] font-medium uppercase tracking-wider">
                      Corporate Email
                    </span>
                    {isEditingAll ? (
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="email@company.com"
                        className="w-full bg-white border border-[#EDE8E1] rounded-lg px-2 py-1 text-xs text-[#181716] focus:outline-none focus:border-[#FF5722] mt-0.5"
                      />
                    ) : (
                      <span className="text-xs sm:text-sm text-[#181716] font-semibold truncate mt-0.5">
                        {email || 'Not detected'}
                      </span>
                    )}
                  </div>
                </div>

                {email && (
                  <button
                    type="button"
                    onClick={handleCopyEmail}
                    aria-label="Copy Email"
                    className="w-8 h-8 rounded-full bg-white border border-[#EDE8E1] text-[#7C7875] hover:text-[#FF5722] hover:border-[#FF5722]/40 flex items-center justify-center transition-colors shadow-2xs ml-2"
                  >
                    {copiedEmail ? <CheckCircle2 className="w-3.5 h-3.5 text-[#10B981]" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                )}
              </div>

              {/* Address Location Card */}
              <div className="bg-[#F8F6F4] border border-[#EDE8E1] rounded-2xl p-3 sm:p-3.5 flex items-start gap-3 shadow-2xs">
                <div className="w-10 h-10 rounded-xl bg-white border border-[#EDE8E1] flex items-center justify-center text-[#FF5722] shrink-0 shadow-2xs mt-0.5">
                  <MapPin className="w-4 h-4" />
                </div>
                <div className="flex flex-col min-w-0 flex-1">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] text-[#7C7875] font-medium uppercase tracking-wider">
                      Headquarters HQ
                    </span>
                    <span className="text-[10px] text-[#FF5722] font-semibold">
                      Location
                    </span>
                  </div>
                  {isEditingAll ? (
                    <input
                      type="text"
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      placeholder="Street, City, State, Country"
                      className="w-full bg-white border border-[#EDE8E1] rounded-lg px-2 py-1 text-xs text-[#181716] focus:outline-none focus:border-[#FF5722] mt-1"
                    />
                  ) : (
                    <span className="text-xs text-[#181716] font-medium mt-0.5 leading-snug">
                      {address || 'Not specified'}
                    </span>
                  )}
                </div>
              </div>

              {/* WhatsApp Section with Dedicated QR Slot */}
              <div className="bg-[#F8F6F4] border border-[#EDE8E1] rounded-2xl p-3 sm:p-3.5 space-y-2.5 shadow-2xs">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-[#181716] font-bold text-xs">
                    <MessageCircle className="w-4 h-4 text-[#10B981]" />
                    <span>WhatsApp Contact & Dedicated QR</span>
                  </div>
                  {whatsappQr && (
                    <span className="text-[10px] bg-[#10B981]/15 text-[#10B981] font-bold px-2 py-0.5 rounded-full">
                      ✓ QR Attached
                    </span>
                  )}
                </div>

                <input
                  type="tel"
                  value={whatsapp}
                  onChange={(e) => setWhatsapp(e.target.value)}
                  placeholder="WhatsApp Number with country code"
                  className="w-full px-3 py-1.5 bg-white border border-[#EDE8E1] rounded-xl text-xs text-[#181716] font-mono focus:outline-none focus:border-[#FF5722]"
                />

                {/* Dedicated WhatsApp QR Placeholder Block */}
                <div className="flex items-center gap-3 bg-white p-2.5 rounded-xl border border-[#EDE8E1]">
                  {whatsappQr ? (
                    <div className="relative w-14 h-14 rounded-lg overflow-hidden border border-[#10B981]/40 shrink-0 bg-white">
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
                    <div className="w-14 h-14 rounded-lg border-2 border-dashed border-[#EDE8E1] bg-[#F8F6F4] flex flex-col items-center justify-center shrink-0 text-[#7C7875]">
                      <QrCode className="w-5 h-5 stroke-[1.5]" />
                      <span className="text-[8px] font-bold mt-0.5">No QR</span>
                    </div>
                  )}

                  <div className="flex-1 min-w-0">
                    <span className="text-[11px] font-bold text-[#181716] block">WhatsApp QR Code</span>
                    <p className="text-[10px] text-[#7C7875] mb-1.5">
                      {whatsappQr ? 'Auto-cropped from card or attached' : 'Auto-crop or snap QR below:'}
                    </p>
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => setCameraTarget('whatsapp_qr')}
                        className="flex items-center gap-1 px-2.5 py-1 bg-[#FFF0EB] hover:bg-[#ffe5dc] text-[#FF5722] font-semibold text-[10px] rounded-full transition-colors"
                      >
                        <Camera className="w-3 h-3" /> Snap QR
                      </button>
                      <label className="flex items-center gap-1 px-2.5 py-1 bg-[#EDE8E1] hover:bg-[#E0DAD1] text-[#181716] font-semibold text-[10px] rounded-full cursor-pointer transition-colors">
                        <Upload className="w-3 h-3" /> Upload
                        <input type="file" accept="image/*" onChange={(e) => handleQrUpload(e, 'whatsapp')} className="hidden" />
                      </label>
                    </div>
                  </div>
                </div>
              </div>

              {/* WeChat Section with Dedicated QR Slot */}
              <div className="bg-[#F8F6F4] border border-[#EDE8E1] rounded-2xl p-3 sm:p-3.5 space-y-2.5 shadow-2xs">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-[#181716] font-bold text-xs">
                    <QrCode className="w-4 h-4 text-[#10B981]" />
                    <span>WeChat ID & Dedicated QR</span>
                  </div>
                  {wechatQr && (
                    <span className="text-[10px] bg-[#10B981]/15 text-[#10B981] font-bold px-2 py-0.5 rounded-full">
                      ✓ QR Attached
                    </span>
                  )}
                </div>

                <input
                  type="text"
                  value={wechat}
                  onChange={(e) => setWechat(e.target.value)}
                  placeholder="WeChat ID / WX ID / 微信号"
                  className="w-full px-3 py-1.5 bg-white border border-[#EDE8E1] rounded-xl text-xs text-[#181716] focus:outline-none focus:border-[#FF5722]"
                />

                {/* Dedicated WeChat QR Placeholder Block */}
                <div className="flex items-center gap-3 bg-white p-2.5 rounded-xl border border-[#EDE8E1]">
                  {wechatQr ? (
                    <div className="relative w-14 h-14 rounded-lg overflow-hidden border border-[#10B981]/40 shrink-0 bg-white">
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
                    <div className="w-14 h-14 rounded-lg border-2 border-dashed border-[#EDE8E1] bg-[#F8F6F4] flex flex-col items-center justify-center shrink-0 text-[#7C7875]">
                      <QrCode className="w-5 h-5 stroke-[1.5]" />
                      <span className="text-[8px] font-bold mt-0.5">No QR</span>
                    </div>
                  )}

                  <div className="flex-1 min-w-0">
                    <span className="text-[11px] font-bold text-[#181716] block">WeChat QR Code</span>
                    <p className="text-[10px] text-[#7C7875] mb-1.5">
                      {wechatQr ? 'Auto-cropped from card or attached' : 'Auto-crop or snap QR below:'}
                    </p>
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => setCameraTarget('wechat_qr')}
                        className="flex items-center gap-1 px-2.5 py-1 bg-[#FFF0EB] hover:bg-[#ffe5dc] text-[#FF5722] font-semibold text-[10px] rounded-full transition-colors"
                      >
                        <Camera className="w-3 h-3" /> Snap QR
                      </button>
                      <label className="flex items-center gap-1 px-2.5 py-1 bg-[#EDE8E1] hover:bg-[#E0DAD1] text-[#181716] font-semibold text-[10px] rounded-full cursor-pointer transition-colors">
                        <Upload className="w-3 h-3" /> Upload
                        <input type="file" accept="image/*" onChange={(e) => handleQrUpload(e, 'wechat')} className="hidden" />
                      </label>
                    </div>
                  </div>
                </div>
              </div>

              {/* Website & Social Handles */}
              {(website || socialLinks || isEditingAll) && (
                <div className="grid grid-cols-2 gap-2.5">
                  <div className="bg-[#F8F6F4] border border-[#EDE8E1] rounded-2xl p-3 shadow-2xs">
                    <span className="text-[10px] text-[#7C7875] font-medium uppercase block mb-1">
                      Website
                    </span>
                    <input
                      type="text"
                      value={website}
                      onChange={(e) => setWebsite(e.target.value)}
                      placeholder="https://company.com"
                      className="w-full bg-white border border-[#EDE8E1] rounded-lg px-2 py-1 text-xs text-[#181716] focus:outline-none focus:border-[#FF5722]"
                    />
                  </div>
                  <div className="bg-[#F8F6F4] border border-[#EDE8E1] rounded-2xl p-3 shadow-2xs">
                    <span className="text-[10px] text-[#7C7875] font-medium uppercase block mb-1">
                      Social Profiles
                    </span>
                    <input
                      type="text"
                      value={socialLinks}
                      onChange={(e) => setSocialLinks(e.target.value)}
                      placeholder="LinkedIn / Twitter"
                      className="w-full bg-white border border-[#EDE8E1] rounded-lg px-2 py-1 text-xs text-[#181716] focus:outline-none focus:border-[#FF5722]"
                    />
                  </div>
                </div>
              )}

              {/* Block / Group Category */}
              <div className="bg-[#F8F6F4] border border-[#EDE8E1] rounded-2xl p-3 flex items-center justify-between shadow-2xs">
                <div className="flex items-center gap-2">
                  <Tag className="w-4 h-4 text-[#FF5722]" />
                  <span className="text-xs font-bold text-[#181716]">Contact Block / Category:</span>
                </div>
                <input
                  type="text"
                  value={blockName}
                  onChange={(e) => setBlockName(e.target.value)}
                  placeholder="Default block"
                  className="bg-white border border-[#EDE8E1] rounded-full px-3 py-1 text-xs text-[#181716] font-semibold text-right focus:outline-none focus:border-[#FF5722]"
                />
              </div>

              {/* Auto Categorization Tags Pill Bar */}
              <div className="bg-[#F8F6F4] border border-[#EDE8E1] rounded-2xl p-3 sm:p-3.5 flex flex-col gap-1.5 shadow-2xs">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] text-[#7C7875] font-medium uppercase tracking-wider">
                    AI Auto-Tags
                  </span>
                  <Sparkles className="w-3.5 h-3.5 text-[#FF5722]" />
                </div>
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {tags.map((tg, idx) => (
                    <span
                      key={idx}
                      className="bg-[#EDE8E1] text-[#181716] border border-[#E0DAD1] px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1.5 shadow-2xs"
                    >
                      <span>#{tg}</span>
                      {isEditingAll && (
                        <button
                          type="button"
                          onClick={() => handleRemoveTag(tg)}
                          className="text-[#7C7875] hover:text-rose-500"
                        >
                          ×
                        </button>
                      )}
                    </span>
                  ))}

                  {isAddingTag ? (
                    <div className="flex items-center gap-1">
                      <input
                        type="text"
                        value={newTagText}
                        onChange={(e) => setNewTagText(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleAddTag()}
                        placeholder="Tag name"
                        className="bg-white border border-[#FF5722] rounded-full px-2.5 py-0.5 text-xs text-[#181716] focus:outline-none w-24"
                        autoFocus
                      />
                      <button
                        type="button"
                        onClick={handleAddTag}
                        className="w-6 h-6 rounded-full bg-[#FF5722] text-white flex items-center justify-center text-xs"
                      >
                        ✓
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setIsAddingTag(true)}
                      className="bg-white border border-[#EDE8E1] text-[#7C7875] hover:text-[#181716] hover:border-[#7C7875] px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1 transition-colors"
                    >
                      <Plus className="w-3 h-3" />
                      <span>Tag</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Event Context & Intelligence / Audio Transcribed */}
              <div className="bg-[#F8F6F4] border border-[#EDE8E1] rounded-2xl p-3 sm:p-3.5 flex flex-col gap-1.5 shadow-2xs">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <FileText className="w-3.5 h-3.5 text-[#FF5722]" />
                    <span className="text-[10px] text-[#7C7875] font-medium uppercase tracking-wider">
                      Event Context & Intelligence
                    </span>
                  </div>
                  <span className="text-[10px] text-[#7C7875]">Notes & Memos</span>
                </div>
                {isEditingAll ? (
                  <textarea
                    rows={2}
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Enter notes or transcription..."
                    className="w-full bg-white border border-[#EDE8E1] rounded-xl p-2.5 text-xs text-[#181716] focus:outline-none focus:border-[#FF5722] resize-none"
                  />
                ) : (
                  <div className="bg-[#F5F3EF] border border-[#EDE8E1] rounded-xl p-3 mt-0.5">
                    <p className="text-xs text-[#2B2927] leading-relaxed italic">
                      "{notes || 'Met at networking event following keynote. Saved contact card and credentials.'}"
                    </p>
                  </div>
                )}
              </div>

              {/* Dedicated Attached Media Block BEFORE saving */}
              <div className="pt-1">
                <AttachedMediaSection
                  items={stagedMedia}
                  onAddItem={handleAddMedia}
                  onRemoveItem={handleRemoveMedia}
                  defaultBlockName={blockName}
                  cardName={name}
                />
              </div>

              {/* Tactile Automation Toggles (Reference Neo-Minimal Style) */}
              <div className="bg-[#F8F6F4] border border-[#EDE8E1] rounded-2xl p-3.5 sm:p-4 flex flex-col gap-3 shadow-2xs">
                <span className="text-[10px] text-[#7C7875] uppercase tracking-wider font-bold">
                  Workflow Automations
                </span>

                {/* CRM Direct Pipeline Toggle */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-white border border-[#EDE8E1] flex items-center justify-center text-[#FF5722] shadow-2xs">
                      <Workflow className="w-4 h-4" />
                    </div>
                    <div className="flex flex-col">
                      <span className="text-xs sm:text-sm text-[#181716] font-bold">HubSpot / Salesforce</span>
                      <span className="text-[10px] text-[#666360]">Auto-create lead & route to CRM pipeline</span>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setCrmSyncEnabled(!crmSyncEnabled)}
                    className={`w-12 h-6 px-0.5 rounded-full transition-colors flex items-center cursor-pointer shadow-2xs ${
                      crmSyncEnabled ? 'bg-[#FF5722] justify-end' : 'bg-[#EDE8E1] justify-start'
                    }`}
                  >
                    <div className={`w-5 h-5 rounded-full shadow-md transform transition-transform ${crmSyncEnabled ? 'bg-white' : 'bg-[#7C7875]'}`} />
                  </button>
                </div>

                <div className="w-full h-px bg-[#EDE8E1]" />

                {/* Automated Follow-Up Email Dispatch */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-white border border-[#EDE8E1] flex items-center justify-center text-[#FF5722] shadow-2xs">
                      <Send className="w-4 h-4" />
                    </div>
                    <div className="flex flex-col">
                      <span className="text-xs sm:text-sm text-[#181716] font-bold">Send Warm Intro Note</span>
                      <span className="text-[10px] text-[#666360]">Personalized AI template queued for 9:00 AM</span>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setWarmIntroEnabled(!warmIntroEnabled)}
                    className={`w-12 h-6 px-0.5 rounded-full transition-colors flex items-center cursor-pointer shadow-2xs ${
                      warmIntroEnabled ? 'bg-[#FF5722] justify-end' : 'bg-[#EDE8E1] justify-start'
                    }`}
                  >
                    <div className={`w-5 h-5 rounded-full shadow-md transform transition-transform ${warmIntroEnabled ? 'bg-white' : 'bg-[#7C7875]'}`} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Floating Dock Action Buttons */}
        <div className="p-3.5 sm:p-4 border-t border-[#EAE6E1] bg-[#FBF9F7] sticky bottom-0 z-30 flex items-center gap-2.5">
          {/* Retake Secondary Action */}
          <button
            type="button"
            onClick={onClose}
            className="flex-1 h-[50px] rounded-full bg-[#EDEAE6] hover:bg-[#E4E0DA] text-[#181716] font-syne text-xs sm:text-sm flex items-center justify-center gap-1.5 transition-all active:scale-[0.98] border border-[#E0DAD1] font-bold shadow-2xs"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Retake</span>
          </button>

          {/* Primary Confirmation Solar Action */}
          <button
            type="button"
            onClick={handleSave}
            className="flex-[2] h-[50px] rounded-full bg-gradient-to-r from-[#FF5722] to-[#FF4500] text-white font-syne text-xs sm:text-sm flex items-center justify-center gap-2 shadow-solar hover:shadow-solar-hover transition-all active:scale-[0.98] font-bold"
          >
            <CheckCircle2 className="w-5 h-5" />
            <span>Save to Contacts & CRM</span>
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

