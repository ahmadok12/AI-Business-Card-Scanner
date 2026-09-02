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
    <div className="bg-slate-50/95 rounded-2xl p-4 border border-slate-200/90 space-y-4">
      {/* Top Header: Section Manager */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center">
            <Layers className="w-3.5 h-3.5" />
          </div>
          <div>
            <h4 className="font-bold text-xs text-slate-900">Product & Topic Sections</h4>
            <p className="text-[10px] text-slate-400">Organize booth photos, voice memos & notes</p>
          </div>
        </div>

        {/* Add Section Button */}
        <button
          type="button"
          onClick={handleAddSection}
          className="flex items-center gap-1 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-[11px] rounded-xl shadow-xs transition-transform active:scale-95"
        >
          <FolderPlus className="w-3.5 h-3.5" />
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
              className="bg-white rounded-2xl p-3.5 border border-slate-200 shadow-2xs space-y-3 transition-all"
            >
              {/* Section Name Header */}
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                {editingSectionIndex === index ? (
                  <div className="flex items-center gap-1.5 flex-1 mr-2">
                    <input
                      type="text"
                      value={editingName}
                      onChange={(e) => setEditingName(e.target.value)}
                      placeholder="e.g. Product A / Booth Samples..."
                      className="w-full px-2.5 py-1 bg-slate-50 border border-indigo-300 rounded-lg text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      autoFocus
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') handleSaveRename(index);
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => handleSaveRename(index)}
                      className="p-1 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700"
                    >
                      <Check className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 flex-1 min-w-0">
                    <span className="font-bold text-xs text-slate-900 truncate">{secName}</span>
                    <button
                      type="button"
                      onClick={() => handleStartRename(index, secName)}
                      className="p-1 text-slate-400 hover:text-indigo-600 rounded-md transition-colors"
                      title="Rename section"
                    >
                      <Edit2 className="w-3 h-3" />
                    </button>
                    <span className="text-[10px] px-1.5 py-0.2 bg-slate-100 text-slate-500 rounded-full font-semibold">
                      {sectionItems.length} items
                    </span>
                  </div>
                )}

                {sections.length > 1 && (
                  <button
                    type="button"
                    onClick={() => handleDeleteSection(secName)}
                    className="p-1 text-slate-400 hover:text-rose-600 rounded-md transition-colors ml-1"
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
                  className="flex items-center justify-center gap-1.5 py-2 px-2 bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold text-[11px] rounded-xl border border-rose-200/80 shadow-2xs transition-all active:scale-95"
                >
                  <Mic className="w-3.5 h-3.5 text-rose-600" />
                  <span>+ Voice</span>
                </button>

                <button
                  type="button"
                  onClick={() => triggerAddPhoto(secName)}
                  className="flex items-center justify-center gap-1.5 py-2 px-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold text-[11px] rounded-xl border border-indigo-200/80 shadow-2xs transition-all active:scale-95"
                >
                  <Camera className="w-3.5 h-3.5 text-indigo-600" />
                  <span>+ Photo</span>
                </button>

                <button
                  type="button"
                  onClick={() => triggerAddText(secName)}
                  className="flex items-center justify-center gap-1.5 py-2 px-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-bold text-[11px] rounded-xl border border-emerald-200/80 shadow-2xs transition-all active:scale-95"
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
                      className="bg-slate-50/80 rounded-xl p-2.5 border border-slate-200/70 space-y-1.5"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5 truncate">
                          {item.type === 'audio' && <Mic className="w-3.5 h-3.5 text-rose-500 shrink-0" />}
                          {item.type === 'image' && <ImageIcon className="w-3.5 h-3.5 text-indigo-500 shrink-0" />}
                          {item.type === 'text' && <FileText className="w-3.5 h-3.5 text-emerald-500 shrink-0" />}
                          <span className="font-semibold text-xs text-slate-800 truncate">{item.title}</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => onRemoveItem(item.id)}
                          className="p-1 text-slate-400 hover:text-rose-600 rounded-md transition-colors"
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
                          className="relative aspect-16/9 rounded-lg overflow-hidden border border-slate-200 cursor-pointer bg-slate-900"
                          onClick={() => setLightboxImage(item.dataUrl || null)}
                        >
                          <img src={item.dataUrl} alt={item.title} className="w-full h-full object-contain" />
                        </div>
                      )}

                      {/* Text note */}
                      {item.type === 'text' && item.textContent && (
                        <p className="text-[11px] text-slate-700 bg-white p-2 rounded-lg whitespace-pre-line leading-relaxed border border-slate-200/60">
                          {item.textContent}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-[10px] text-slate-400 text-center py-1.5 italic">
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-slate-950/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white w-full max-w-sm rounded-3xl shadow-2xl p-4 border border-slate-100 space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div>
                <h4 className="text-xs font-bold text-slate-900">Add Text Note</h4>
                <p className="text-[10px] text-indigo-600 font-semibold">To: {activeTargetSection}</p>
              </div>
              <button onClick={() => setIsTextOpen(false)} className="p-1 text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>

            <input
              type="text"
              value={textTitle}
              onChange={(e) => setTextTitle(e.target.value)}
              placeholder="Title (e.g. Price Quote / Model Specs)..."
              className="w-full px-3 py-1.5 bg-slate-50 border rounded-xl text-xs"
            />

            <textarea
              rows={3}
              value={textInput}
              onChange={(e) => setTextInput(e.target.value)}
              placeholder="Write note or memo for this product..."
              className="w-full px-3 py-1.5 bg-slate-50 border rounded-xl text-xs resize-none"
            />

            <div className="flex items-center gap-2 pt-1">
              <button
                type="button"
                onClick={() => setIsTextOpen(false)}
                className="flex-1 py-2 bg-slate-100 text-slate-700 font-semibold text-xs rounded-xl"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleTextSave}
                disabled={!textInput.trim()}
                className="flex-1 py-2 bg-emerald-600 text-white font-semibold text-xs rounded-xl disabled:opacity-50"
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
