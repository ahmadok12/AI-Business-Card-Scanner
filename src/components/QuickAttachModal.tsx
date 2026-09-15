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
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-[#181716]/60 backdrop-blur-sm animate-in fade-in">
      <div className="bg-white w-full max-w-sm rounded-[28px] p-5 border border-[#EDE8E1] shadow-2xl space-y-4">
        <div className="flex items-center justify-between pb-2 border-b border-[#EDE8E1]">
          <div>
            <h3 className="font-syne font-bold text-sm text-[#181716]">Attach Media</h3>
            <p className="text-xs text-[#FF5722] font-grotesk font-semibold">To: {card.name}</p>
          </div>
          <button onClick={onClose} className="p-1.5 text-[#7C7875] hover:text-[#181716] rounded-full hover:bg-[#F8F6F4]">
            <X className="w-5 h-5" />
          </button>
        </div>

        <p className="text-xs text-[#7C7875] font-grotesk">Choose what you would like to attach:</p>

        <div className="grid grid-cols-3 gap-2.5">
          <button
            onClick={() => setIsVoiceOpen(true)}
            className="flex flex-col items-center justify-center p-3 bg-[#FFF0EB] hover:bg-[#FFE6DC] text-[#FF5722] rounded-[20px] border border-[#FF5722]/20 shadow-xs transition-transform active:scale-95 text-center gap-1.5"
          >
            <div className="w-9 h-9 rounded-full bg-gradient-to-r from-[#FF5722] to-[#FF4500] text-white flex items-center justify-center shadow-sm">
              <Mic className="w-4 h-4" />
            </div>
            <span className="text-[11px] font-grotesk font-bold">Voice Note</span>
          </button>

          <button
            onClick={() => setIsCameraOpen(true)}
            className="flex flex-col items-center justify-center p-3 bg-[#F8F6F4] hover:bg-[#EDE8E1] text-[#181716] rounded-[20px] border border-[#EDE8E1] shadow-xs transition-transform active:scale-95 text-center gap-1.5"
          >
            <div className="w-9 h-9 rounded-full bg-[#181716] text-white flex items-center justify-center shadow-sm">
              <Camera className="w-4 h-4" />
            </div>
            <span className="text-[11px] font-grotesk font-bold">Photo / Back</span>
          </button>

          <button
            onClick={() => setIsTextOpen(true)}
            className="flex flex-col items-center justify-center p-3 bg-[#E8F8F0] hover:bg-[#D4F3E4] text-emerald-800 rounded-[20px] border border-emerald-200/70 shadow-xs transition-transform active:scale-95 text-center gap-1.5"
          >
            <div className="w-9 h-9 rounded-full bg-emerald-600 text-white flex items-center justify-center shadow-sm">
              <FileText className="w-4 h-4" />
            </div>
            <span className="text-[11px] font-grotesk font-bold">Text Memo</span>
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
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-[#181716]/70 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white w-full max-w-sm rounded-[24px] shadow-2xl p-5 border border-[#EDE8E1] space-y-3.5">
            <div className="flex items-center justify-between pb-2 border-b border-[#EDE8E1]">
              <h4 className="text-xs font-syne font-bold text-[#181716]">Add Text Memo</h4>
              <button onClick={() => setIsTextOpen(false)} className="p-1.5 text-[#7C7875] hover:text-[#181716] rounded-full hover:bg-[#F8F6F4]">
                <X className="w-4 h-4" />
              </button>
            </div>
            <input
              type="text"
              value={noteTitle}
              onChange={(e) => setNoteTitle(e.target.value)}
              placeholder="Title (optional)..."
              className="w-full px-3.5 py-2 bg-[#F8F6F4] border border-[#EDE8E1] rounded-xl text-xs font-grotesk text-[#181716] focus:outline-none focus:border-[#FF5722]"
            />
            <textarea
              rows={3}
              value={noteBody}
              onChange={(e) => setNoteBody(e.target.value)}
              placeholder="Type note for this contact..."
              className="w-full px-3.5 py-2 bg-[#F8F6F4] border border-[#EDE8E1] rounded-xl text-xs font-grotesk text-[#181716] resize-none focus:outline-none focus:border-[#FF5722]"
            />
            <div className="flex items-center gap-2 pt-1">
              <button
                onClick={() => setIsTextOpen(false)}
                className="flex-1 py-2 bg-[#F8F6F4] text-[#7C7875] hover:text-[#181716] font-grotesk font-semibold text-xs rounded-full border border-[#EDE8E1]"
              >
                Cancel
              </button>
              <button
                onClick={handleTextSave}
                disabled={!noteBody.trim()}
                className="flex-1 py-2 bg-gradient-to-r from-[#FF5722] to-[#FF4500] text-white font-grotesk font-semibold text-xs rounded-full shadow-sm hover:brightness-105 disabled:opacity-50"
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
