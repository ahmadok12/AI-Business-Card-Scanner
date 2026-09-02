import React, { useState } from 'react';
import type { BusinessCard, MediaItem } from '../types';
import { Mic, Camera, FileText, X } from 'lucide-react';
import { VoiceRecorderModal } from './VoiceRecorderModal';
import { CameraCaptureModal } from './CameraCaptureModal';

interface QuickAttachModalProps {
  card: BusinessCard | null;
  isOpen: boolean;
  onClose: () => void;
  onAddMedia: (media: MediaItem) => void;
}

export const QuickAttachModal: React.FC<QuickAttachModalProps> = ({
  card,
  isOpen,
  onClose,
  onAddMedia
}) => {
  const [isVoiceOpen, setIsVoiceOpen] = useState(false);
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [isTextOpen, setIsTextOpen] = useState(false);
  const [noteTitle, setNoteTitle] = useState('');
  const [noteBody, setNoteBody] = useState('');

  if (!isOpen || !card) return null;

  const handleVoiceSave = (url: string, duration: number, title: string) => {
    onAddMedia({
      id: 'media_' + Date.now(),
      type: 'audio',
      title: title || `Voice Memo - ${card.name}`,
      blockName: card.blockName,
      dataUrl: url,
      audioDuration: duration,
      cardId: card.id,
      cardName: card.name,
      createdAt: Date.now()
    });
    onClose();
  };

  const handlePhotoCapture = (img: string) => {
    const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    onAddMedia({
      id: 'media_' + Date.now(),
      type: 'image',
      title: `Photo - ${card.name} (${timeStr})`,
      blockName: card.blockName,
      dataUrl: img,
      cardId: card.id,
      cardName: card.name,
      createdAt: Date.now()
    });
    onClose();
  };

  const handleTextSave = () => {
    if (!noteBody.trim()) return;
    onAddMedia({
      id: 'media_' + Date.now(),
      type: 'text',
      title: noteTitle.trim() || `Memo - ${card.name}`,
      blockName: card.blockName,
      textContent: noteBody.trim(),
      cardId: card.id,
      cardName: card.name,
      createdAt: Date.now()
    });
    setNoteTitle('');
    setNoteBody('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-3 bg-slate-950/60 backdrop-blur-sm animate-in fade-in">
      <div className="bg-white w-full max-w-sm rounded-3xl p-5 border border-slate-100 shadow-2xl space-y-4">
        <div className="flex items-center justify-between pb-2 border-b border-slate-100">
          <div>
            <h3 className="font-bold text-sm text-slate-900">Attach Media</h3>
            <p className="text-xs text-indigo-600 font-medium">To: {card.name}</p>
          </div>
          <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-slate-600 rounded-full">
            <X className="w-5 h-5" />
          </button>
        </div>

        <p className="text-xs text-slate-500">Choose what you would like to attach:</p>

        <div className="grid grid-cols-3 gap-2.5">
          <button
            onClick={() => setIsVoiceOpen(true)}
            className="flex flex-col items-center justify-center p-3 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-2xl border border-rose-200 shadow-xs transition-transform active:scale-95 text-center gap-1"
          >
            <div className="w-8 h-8 rounded-full bg-rose-500 text-white flex items-center justify-center">
              <Mic className="w-4 h-4" />
            </div>
            <span className="text-[11px] font-bold">Voice Note</span>
          </button>

          <button
            onClick={() => setIsCameraOpen(true)}
            className="flex flex-col items-center justify-center p-3 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-2xl border border-indigo-200 shadow-xs transition-transform active:scale-95 text-center gap-1"
          >
            <div className="w-8 h-8 rounded-full bg-indigo-600 text-white flex items-center justify-center">
              <Camera className="w-4 h-4" />
            </div>
            <span className="text-[11px] font-bold">Photo / Back</span>
          </button>

          <button
            onClick={() => setIsTextOpen(true)}
            className="flex flex-col items-center justify-center p-3 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded-2xl border border-emerald-200 shadow-xs transition-transform active:scale-95 text-center gap-1"
          >
            <div className="w-8 h-8 rounded-full bg-emerald-600 text-white flex items-center justify-center">
              <FileText className="w-4 h-4" />
            </div>
            <span className="text-[11px] font-bold">Text Memo</span>
          </button>
        </div>
      </div>

      <VoiceRecorderModal
        isOpen={isVoiceOpen}
        onClose={() => setIsVoiceOpen(false)}
        onSave={handleVoiceSave}
        defaultBlockName={card.blockName}
        associatedCardName={card.name}
      />

      <CameraCaptureModal
        isOpen={isCameraOpen}
        onClose={() => setIsCameraOpen(false)}
        onCapture={handlePhotoCapture}
        title={`Add Photo for ${card.name}`}
      />

      {isTextOpen && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-3 bg-slate-950/70 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white w-full max-w-sm rounded-3xl shadow-2xl p-4 border border-slate-100 space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h4 className="text-xs font-bold text-slate-900">Add Text Memo</h4>
              <button onClick={() => setIsTextOpen(false)} className="p-1 text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>
            <input
              type="text"
              value={noteTitle}
              onChange={(e) => setNoteTitle(e.target.value)}
              placeholder="Title (optional)..."
              className="w-full px-3 py-1.5 bg-slate-50 border rounded-xl text-xs"
            />
            <textarea
              rows={3}
              value={noteBody}
              onChange={(e) => setNoteBody(e.target.value)}
              placeholder="Type note for this contact..."
              className="w-full px-3 py-1.5 bg-slate-50 border rounded-xl text-xs resize-none"
            />
            <div className="flex items-center gap-2 pt-1">
              <button
                onClick={() => setIsTextOpen(false)}
                className="flex-1 py-2 bg-slate-100 text-slate-700 font-semibold text-xs rounded-xl"
              >
                Cancel
              </button>
              <button
                onClick={handleTextSave}
                disabled={!noteBody.trim()}
                className="flex-1 py-2 bg-emerald-600 text-white font-semibold text-xs rounded-xl disabled:opacity-50"
              >
                Save Memo
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
