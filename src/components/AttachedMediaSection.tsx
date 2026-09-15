import React, { useState } from 'react';
import { Mic, Camera, FileText, Trash2, X, Plus, Image as ImageIcon, Edit2, Check, FolderPlus, Layers } from 'lucide-react';
import { AudioPlayer } from './AudioPlayer';
import { VoiceRecorderModal } from './VoiceRecorderModal';
import { CameraCaptureModal } from './CameraCaptureModal';

export interface StagedMediaItem {
  id: string;
  type: 'image' | 'audio' | 'text';
  title: string;
  dataUrl?: string;
  textContent?: string;
  audioDuration?: number;
  sectionName?: string;
}

interface AttachedMediaSectionProps {
  items: StagedMediaItem[];
  onAddItem: (item: StagedMediaItem) => void;
  onRemoveItem: (id: string) => void;
  defaultBlockName?: string;
  cardName?: string;
}

export const AttachedMediaSection: React.FC<AttachedMediaSectionProps> = ({
  items,
  onAddItem,
  onRemoveItem,
  defaultBlockName = 'General',
  cardName = ''
}) => {
  // Track custom sections. If no sections created yet, default to Section 1
  const [sections, setSections] = useState<string[]>(() => {
    const existing = new Set<string>();
    items.forEach((it) => {
      if (it.sectionName) existing.add(it.sectionName);
    });
    return existing.size > 0 ? Array.from(existing) : ['Section 1'];
  });

  const [editingSectionIndex, setEditingSectionIndex] = useState<number | null>(null);
  const [editingName, setEditingName] = useState('');

  // Active target section when adding media
  const [activeTargetSection, setActiveTargetSection] = useState<string>('Section 1');

  // Modal triggers
  const [isVoiceOpen, setIsVoiceOpen] = useState(false);
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [isTextOpen, setIsTextOpen] = useState(false);
  const [textInput, setTextInput] = useState('');
  const [textTitle, setTextTitle] = useState('');
  const [lightboxImage, setLightboxImage] = useState<string | null>(null);

  const handleAddSection = () => {
    const nextNum = sections.length + 1;
    const newSecName = `Section ${nextNum}`;
    setSections((prev) => [...prev, newSecName]);
    setActiveTargetSection(newSecName);
  };

  const handleStartRename = (index: number, currentName: string) => {
    setEditingSectionIndex(index);
    setEditingName(currentName);
  };

  const handleSaveRename = (index: number) => {
    if (editingName.trim()) {
      const oldName = sections[index];
      const updatedName = editingName.trim();
      setSections((prev) => {
        const next = [...prev];
        next[index] = updatedName;
        return next;
      });

      // Update any items belonging to this section
      items.forEach((it) => {
        if (it.sectionName === oldName) {
          it.sectionName = updatedName;
        }
      });
      if (activeTargetSection === oldName) {
        setActiveTargetSection(updatedName);
      }
    }
    setEditingSectionIndex(null);
  };

  const handleDeleteSection = (secName: string) => {
    if (confirm(`Delete "${secName}" and all its attached media?`)) {
      setSections((prev) => prev.filter((s) => s !== secName));
      // Remove all items in this section
      items.filter((it) => (it.sectionName || 'Section 1') === secName).forEach((it) => {
        onRemoveItem(it.id);
      });
    }
  };

  const triggerAddVoice = (sec: string) => {
    setActiveTargetSection(sec);
    setIsVoiceOpen(true);
  };

  const triggerAddPhoto = (sec: string) => {
    setActiveTargetSection(sec);
    setIsCameraOpen(true);
  };

  const triggerAddText = (sec: string) => {
    setActiveTargetSection(sec);
    setIsTextOpen(true);
  };

  const handleVoiceSave = (url: string, duration: number, title: string) => {
    onAddItem({
      id: 'media_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4),
      type: 'audio',
      title: title || `${activeTargetSection} - Voice Note`,
      dataUrl: url,
      audioDuration: duration,
      sectionName: activeTargetSection
    });
  };

  const handlePhotoCapture = (img: string) => {
    const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    onAddItem({
      id: 'media_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4),
      type: 'image',
      title: `${activeTargetSection} Photo (${timeStr})`,
      dataUrl: img,
      sectionName: activeTargetSection
    });
  };

  const handleTextSave = () => {
    if (!textInput.trim()) return;
    onAddItem({
      id: 'media_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4),
      type: 'text',
      title: textTitle.trim() || `${activeTargetSection} Note`,
      textContent: textInput.trim(),
      sectionName: activeTargetSection
    });
    setTextInput('');
    setTextTitle('');
    setIsTextOpen(false);
  };

  return (
    <div className="bg-[#F8F6F4] rounded-[22px] p-4 border border-[#EDE8E1] space-y-4 shadow-[0_4px_14px_-2px_rgba(69,66,62,0.05)]">
      {/* Top Header: Section Manager */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-full bg-[#FFF0EB] text-[#FF5722] flex items-center justify-center border border-[#FF5722]/20">
            <Layers className="w-3.5 h-3.5" />
          </div>
          <div>
            <h4 className="font-syne font-bold text-xs text-[#181716]">Product & Topic Sections</h4>
            <p className="text-[10px] text-[#7C7875] font-grotesk">Organize booth photos, voice memos & notes</p>
          </div>
        </div>

        {/* Add Section Button */}
        <button
          type="button"
          onClick={handleAddSection}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-[#181716] hover:bg-[#2A2725] text-white font-grotesk font-semibold text-[11px] rounded-full shadow-sm transition-transform active:scale-95"
        >
          <FolderPlus className="w-3.5 h-3.5 text-[#FF5722]" />
          <span>+ Add Section</span>
        </button>
      </div>

      {/* Sections List */}
      <div className="space-y-3">
        {sections.map((secName, index) => {
          const sectionItems = items.filter(
            (it) => (it.sectionName || 'Section 1') === secName
          );

          return (
            <div
              key={index}
              className="bg-white rounded-[18px] p-3.5 border border-[#EDE8E1] shadow-[0_2px_8px_rgba(69,66,62,0.04)] space-y-3 transition-all"
            >
              {/* Section Name Header */}
              <div className="flex items-center justify-between pb-2 border-b border-[#EDE8E1]">
                {editingSectionIndex === index ? (
                  <div className="flex items-center gap-1.5 flex-1 mr-2">
                    <input
                      type="text"
                      value={editingName}
                      onChange={(e) => setEditingName(e.target.value)}
                      placeholder="e.g. Product A / Booth Samples..."
                      className="w-full px-3 py-1 bg-[#F8F6F4] border border-[#FF5722] rounded-full text-xs font-grotesk font-semibold text-[#181716] focus:outline-none"
                      autoFocus
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') handleSaveRename(index);
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => handleSaveRename(index)}
                      className="p-1.5 bg-emerald-600 text-white rounded-full hover:bg-emerald-700"
                    >
                      <Check className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 flex-1 min-w-0">
                    <span className="font-syne font-bold text-xs text-[#181716] truncate">{secName}</span>
                    <button
                      type="button"
                      onClick={() => handleStartRename(index, secName)}
                      className="p-1 text-[#7C7875] hover:text-[#FF5722] rounded-md transition-colors"
                      title="Rename section"
                    >
                      <Edit2 className="w-3 h-3" />
                    </button>
                    <span className="text-[10px] px-2 py-0.5 bg-[#F8F6F4] text-[#7C7875] rounded-full font-grotesk font-medium border border-[#EDE8E1]">
                      {sectionItems.length} items
                    </span>
                  </div>
                )}

                {sections.length > 1 && (
                  <button
                    type="button"
                    onClick={() => handleDeleteSection(secName)}
                    className="p-1 text-[#7C7875] hover:text-rose-600 rounded-md transition-colors ml-1"
                    title="Delete section"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {/* 3 Action Buttons under this specific section */}
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => triggerAddVoice(secName)}
                  className="flex items-center justify-center gap-1.5 py-2 px-2 bg-[#FFF0EB] hover:bg-[#FFE6DC] text-[#FF5722] font-grotesk font-semibold text-[11px] rounded-full border border-[#FF5722]/20 shadow-2xs transition-all active:scale-95"
                >
                  <Mic className="w-3.5 h-3.5 text-[#FF5722]" />
                  <span>+ Voice</span>
                </button>

                <button
                  type="button"
                  onClick={() => triggerAddPhoto(secName)}
                  className="flex items-center justify-center gap-1.5 py-2 px-2 bg-[#F8F6F4] hover:bg-[#EDE8E1] text-[#181716] font-grotesk font-semibold text-[11px] rounded-full border border-[#EDE8E1] shadow-2xs transition-all active:scale-95"
                >
                  <Camera className="w-3.5 h-3.5 text-[#181716]" />
                  <span>+ Photo</span>
                </button>

                <button
                  type="button"
                  onClick={() => triggerAddText(secName)}
                  className="flex items-center justify-center gap-1.5 py-2 px-2 bg-[#E8F8F0] hover:bg-[#D4F3E4] text-emerald-800 font-grotesk font-semibold text-[11px] rounded-full border border-emerald-200/80 shadow-2xs transition-all active:scale-95"
                >
                  <FileText className="w-3.5 h-3.5 text-emerald-600" />
                  <span>+ Note</span>
                </button>
              </div>

              {/* Media Items in this Section */}
              {sectionItems.length > 0 ? (
                <div className="space-y-2 pt-1">
                  {sectionItems.map((item) => (
                    <div
                      key={item.id}
                      className="bg-[#F8F6F4] rounded-[14px] p-2.5 border border-[#EDE8E1] space-y-1.5"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5 truncate">
                          {item.type === 'audio' && <Mic className="w-3.5 h-3.5 text-[#FF5722] shrink-0" />}
                          {item.type === 'image' && <ImageIcon className="w-3.5 h-3.5 text-[#181716] shrink-0" />}
                          {item.type === 'text' && <FileText className="w-3.5 h-3.5 text-emerald-600 shrink-0" />}
                          <span className="font-grotesk font-semibold text-xs text-[#181716] truncate">{item.title}</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => onRemoveItem(item.id)}
                          className="p-1 text-[#7C7875] hover:text-rose-600 rounded-md transition-colors"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>

                      {/* Audio player */}
                      {item.type === 'audio' && item.dataUrl && (
                        <AudioPlayer src={item.dataUrl} duration={item.audioDuration} compact />
                      )}

                      {/* Image thumbnail */}
                      {item.type === 'image' && item.dataUrl && (
                        <div
                          className="relative aspect-16/9 rounded-[12px] overflow-hidden border border-[#EDE8E1] cursor-pointer bg-[#181716]"
                          onClick={() => setLightboxImage(item.dataUrl || null)}
                        >
                          <img src={item.dataUrl} alt={item.title} className="w-full h-full object-contain" />
                        </div>
                      )}

                      {/* Text note */}
                      {item.type === 'text' && item.textContent && (
                        <p className="text-[11px] text-[#181716] bg-white p-2.5 rounded-[10px] whitespace-pre-line leading-relaxed border border-[#EDE8E1] font-grotesk">
                          {item.textContent}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-[10px] text-[#7C7875] text-center py-1.5 italic font-grotesk">
                  No media attached to {secName} yet. Tap + Voice, + Photo, or + Note above.
                </p>
              )}
            </div>
          );
        })}
      </div>

      {/* Voice Recorder Modal (1-Tap) */}
      <VoiceRecorderModal
        isOpen={isVoiceOpen}
        onClose={() => setIsVoiceOpen(false)}
        onSave={handleVoiceSave}
        defaultBlockName={`${cardName || defaultBlockName} - ${activeTargetSection}`}
        associatedCardName={cardName}
      />

      {/* Camera Photo Modal */}
      <CameraCaptureModal
        isOpen={isCameraOpen}
        onClose={() => setIsCameraOpen(false)}
        onCapture={handlePhotoCapture}
        title={`Add Photo for ${activeTargetSection}`}
      />

      {/* Inline Text Note Creator Modal */}
      {isTextOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#181716]/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white w-full max-w-sm rounded-[24px] shadow-2xl p-5 border border-[#EDE8E1] space-y-3.5">
            <div className="flex items-center justify-between pb-2 border-b border-[#EDE8E1]">
              <div>
                <h4 className="text-xs font-syne font-bold text-[#181716]">Add Text Note</h4>
                <p className="text-[10px] text-[#FF5722] font-grotesk font-semibold">To: {activeTargetSection}</p>
              </div>
              <button onClick={() => setIsTextOpen(false)} className="p-1.5 text-[#7C7875] hover:text-[#181716] rounded-full hover:bg-[#F8F6F4]">
                <X className="w-4 h-4" />
              </button>
            </div>

            <input
              type="text"
              value={textTitle}
              onChange={(e) => setTextTitle(e.target.value)}
              placeholder="Title (e.g. Price Quote / Model Specs)..."
              className="w-full px-3.5 py-2 bg-[#F8F6F4] border border-[#EDE8E1] rounded-xl text-xs font-grotesk text-[#181716] focus:outline-none focus:border-[#FF5722]"
            />

            <textarea
              rows={3}
              value={textInput}
              onChange={(e) => setTextInput(e.target.value)}
              placeholder="Write note or memo for this product..."
              className="w-full px-3.5 py-2 bg-[#F8F6F4] border border-[#EDE8E1] rounded-xl text-xs font-grotesk text-[#181716] resize-none focus:outline-none focus:border-[#FF5722]"
            />

            <div className="flex items-center gap-2 pt-1">
              <button
                type="button"
                onClick={() => setIsTextOpen(false)}
                className="flex-1 py-2 bg-[#F8F6F4] text-[#7C7875] hover:text-[#181716] font-grotesk font-semibold text-xs rounded-full border border-[#EDE8E1]"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleTextSave}
                disabled={!textInput.trim()}
                className="flex-1 py-2 bg-gradient-to-r from-[#FF5722] to-[#FF4500] text-white font-grotesk font-semibold text-xs rounded-full shadow-sm hover:brightness-105 disabled:opacity-50"
              >
                Save Note
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Lightbox */}
      {lightboxImage && (
        <div
          className="fixed inset-0 z-60 bg-black/90 backdrop-blur-md flex items-center justify-center p-4"
          onClick={() => setLightboxImage(null)}
        >
          <img src={lightboxImage} alt="Preview" className="max-w-full max-h-full rounded-2xl object-contain bg-white p-2" />
          <button className="absolute top-4 right-4 text-white p-2 rounded-full bg-slate-800">
            <X className="w-6 h-6" />
          </button>
        </div>
      )}
    </div>
  );
};
