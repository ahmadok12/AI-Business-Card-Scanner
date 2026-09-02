import React, { useState } from 'react';
import { Mic, Camera, FileText, Trash2, X, Plus, Image as ImageIcon } from 'lucide-react';
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
  const [isVoiceOpen, setIsVoiceOpen] = useState(false);
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [isTextOpen, setIsTextOpen] = useState(false);
  const [textInput, setTextInput] = useState('');
  const [textTitle, setTextTitle] = useState('');
  const [lightboxImage, setLightboxImage] = useState<string | null>(null);

  const handleVoiceSave = (url: string, duration: number, title: string) => {
    onAddItem({
      id: 'media_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4),
      type: 'audio',
      title: title || `Voice Memo - ${cardName || defaultBlockName}`,
      dataUrl: url,
      audioDuration: duration
    });
  };

  const handlePhotoCapture = (img: string) => {
    const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    onAddItem({
      id: 'media_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4),
      type: 'image',
      title: `Photo (${timeStr})`,
      dataUrl: img
    });
  };

  const handleTextSave = () => {
    if (!textInput.trim()) return;
    onAddItem({
      id: 'media_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4),
      type: 'text',
      title: textTitle.trim() || 'Text Memo',
      textContent: textInput.trim()
    });
    setTextInput('');
    setTextTitle('');
    setIsTextOpen(false);
  };

  return (
    <div className="bg-slate-50/90 rounded-2xl p-3.5 border border-slate-200/90 space-y-3">
      {/* Block Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <span className="font-bold text-xs text-slate-800">Attached Media</span>
          <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-indigo-100 text-indigo-700 font-bold">
            {items.length}
          </span>
        </div>
        <span className="text-[10px] text-slate-400">Voice, photos & notes</span>
      </div>

      {/* 3 Action Buttons in 1 Small Block */}
      <div className="grid grid-cols-3 gap-2">
        <button
          type="button"
          onClick={() => setIsVoiceOpen(true)}
          className="flex items-center justify-center gap-1.5 py-2 px-2.5 bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold text-[11px] rounded-xl border border-rose-200 shadow-2xs transition-all active:scale-95"
        >
          <Mic className="w-3.5 h-3.5 text-rose-600" />
          <span>+ Voice</span>
        </button>

        <button
          type="button"
          onClick={() => setIsCameraOpen(true)}
          className="flex items-center justify-center gap-1.5 py-2 px-2.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold text-[11px] rounded-xl border border-indigo-200 shadow-2xs transition-all active:scale-95"
        >
          <Camera className="w-3.5 h-3.5 text-indigo-600" />
          <span>+ Photo</span>
        </button>

        <button
          type="button"
          onClick={() => setIsTextOpen(true)}
          className="flex items-center justify-center gap-1.5 py-2 px-2.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-bold text-[11px] rounded-xl border border-emerald-200 shadow-2xs transition-all active:scale-95"
        >
          <FileText className="w-3.5 h-3.5 text-emerald-600" />
          <span>+ Note</span>
        </button>
      </div>

      {/* List of Attached Media Items */}
      {items.length > 0 && (
        <div className="space-y-2 pt-1 border-t border-slate-200/60">
          {items.map((item) => (
            <div key={item.id} className="bg-white rounded-xl p-2.5 border border-slate-200/80 shadow-2xs space-y-1.5">
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
                  className="relative aspect-16/9 rounded-lg overflow-hidden border border-slate-100 cursor-pointer bg-slate-900"
                  onClick={() => setLightboxImage(item.dataUrl || null)}
                >
                  <img src={item.dataUrl} alt={item.title} className="w-full h-full object-contain" />
                </div>
              )}

              {/* Text note */}
              {item.type === 'text' && item.textContent && (
                <p className="text-[11px] text-slate-600 bg-slate-50 p-2 rounded-lg whitespace-pre-line leading-relaxed border border-slate-100">
                  {item.textContent}
                </p>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Voice Recorder Modal (1-Tap) */}
      <VoiceRecorderModal
        isOpen={isVoiceOpen}
        onClose={() => setIsVoiceOpen(false)}
        onSave={handleVoiceSave}
        defaultBlockName={defaultBlockName}
        associatedCardName={cardName}
      />

      {/* Camera Photo Modal */}
      <CameraCaptureModal
        isOpen={isCameraOpen}
        onClose={() => setIsCameraOpen(false)}
        onCapture={handlePhotoCapture}
        title={`Add Photo for ${cardName || 'Card'}`}
      />

      {/* Inline Text Note Creator Modal */}
      {isTextOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-slate-950/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white w-full max-w-sm rounded-3xl shadow-2xl p-4 border border-slate-100 space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h4 className="text-xs font-bold text-slate-900">Add Text Note</h4>
              <button onClick={() => setIsTextOpen(false)} className="p-1 text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>

            <input
              type="text"
              value={textTitle}
              onChange={(e) => setTextTitle(e.target.value)}
              placeholder="Title (optional)..."
              className="w-full px-3 py-1.5 bg-slate-50 border rounded-xl text-xs"
            />

            <textarea
              rows={3}
              value={textInput}
              onChange={(e) => setTextInput(e.target.value)}
              placeholder="Write note or memo..."
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
          <img src={lightboxImage} alt="Preview" className="max-w-full max-h-full rounded-2xl object-contain" />
          <button className="absolute top-4 right-4 text-white p-2 rounded-full bg-slate-800">
            <X className="w-6 h-6" />
          </button>
        </div>
      )}
    </div>
  );
};
