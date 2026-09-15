import React, { useState, useMemo } from 'react';
import { MediaItem } from '../../types';
import { Search, Mic, Camera, Image as ImageIcon, FileText, Plus, Download, Trash2, X, Play, Volume2, Copy } from 'lucide-react';
import { AudioPlayer } from '../AudioPlayer';
import { VoiceRecorderModal } from '../VoiceRecorderModal';
import { CameraCaptureModal } from '../CameraCaptureModal';

interface MediaTabProps {
  mediaItems: MediaItem[];
  onAddMedia: (media: MediaItem) => void;
  onDeleteMedia: (id: string) => void;
  defaultBlockName: string;
}

export const MediaTab: React.FC<MediaTabProps> = ({
  mediaItems,
  onAddMedia,
  onDeleteMedia,
  defaultBlockName
}) => {
  const [activeFilter, setActiveFilter] = useState<'all' | 'image' | 'audio' | 'text'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isVoiceModalOpen, setIsVoiceModalOpen] = useState(false);
  const [isCameraModalOpen, setIsCameraModalOpen] = useState(false);
  const [isTextNoteModalOpen, setIsTextNoteModalOpen] = useState(false);
  const [textNoteTitle, setTextNoteTitle] = useState('');
  const [textNoteBody, setTextNoteBody] = useState('');
  const [lightboxImage, setLightboxImage] = useState<string | null>(null);

  // Filtered media items
  const filteredItems = useMemo(() => {
    return mediaItems.filter((item) => {
      const matchesFilter = activeFilter === 'all' || item.type === activeFilter;
      const query = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !query ||
        item.title.toLowerCase().includes(query) ||
        (item.blockName && item.blockName.toLowerCase().includes(query)) ||
        (item.cardName && item.cardName.toLowerCase().includes(query)) ||
        (item.textContent && item.textContent.toLowerCase().includes(query));

      return matchesFilter && matchesSearch;
    });
  }, [mediaItems, activeFilter, searchQuery]);

  const handleVoiceSave = (url: string, duration: number, title: string) => {
    const newItem: MediaItem = {
      id: 'media_' + Date.now(),
      type: 'audio',
      title: title || `Voice Note - ${defaultBlockName}`,
      blockName: defaultBlockName,
      dataUrl: url,
      audioDuration: duration,
      createdAt: Date.now()
    };
    onAddMedia(newItem);
  };

  const handlePhotoCapture = (img: string) => {
    const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const dateStr = new Date().toLocaleDateString([], { month: 'short', day: 'numeric' });
    const newItem: MediaItem = {
      id: 'media_' + Date.now(),
      type: 'image',
      title: `Photo - ${defaultBlockName} (${dateStr} ${timeStr})`,
      blockName: defaultBlockName,
      dataUrl: img,
      createdAt: Date.now()
    };
    onAddMedia(newItem);
  };

  const handleSaveTextNote = () => {
    if (!textNoteBody.trim()) return;
    const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const dateStr = new Date().toLocaleDateString([], { month: 'short', day: 'numeric' });
    const newItem: MediaItem = {
      id: 'media_' + Date.now(),
      type: 'text',
      title: textNoteTitle.trim() || `Note - ${defaultBlockName} (${dateStr} ${timeStr})`,
      blockName: defaultBlockName,
      textContent: textNoteBody.trim(),
      createdAt: Date.now()
    };
    onAddMedia(newItem);
    setTextNoteTitle('');
    setTextNoteBody('');
    setIsTextNoteModalOpen(false);
  };

  return (
    <div className="flex flex-col gap-4 pb-24 animate-in fade-in font-grotesk">
      {/* Header */}
      <div className="flex items-center justify-between px-1">
        <div>
          <h1 className="font-syne text-xl font-bold text-[#181716]">Media Library</h1>
          <p className="text-xs text-[#7C7875]">
            Pictures, voice recordings, and memos
          </p>
        </div>
      </div>

      {/* Quick Media Action Row */}
      <div className="grid grid-cols-3 gap-2">
        {/* 1-Tap Record Voice */}
        <button
          onClick={() => setIsVoiceModalOpen(true)}
          className="flex items-center justify-center gap-1.5 p-3 bg-white hover:bg-[#F8F6F4] text-[#181716] font-bold text-xs rounded-full border border-[#EDE8E1] shadow-porcelain-sm transition-transform active:scale-95"
        >
          <div className="w-6 h-6 rounded-full bg-[#FFF0EB] flex items-center justify-center text-[#FF5722]">
            <Mic className="w-3.5 h-3.5" />
          </div>
          <span>Voice Note</span>
        </button>

        {/* Add Photo with Camera Capture Option */}
        <button
          onClick={() => setIsCameraModalOpen(true)}
          className="flex items-center justify-center gap-1.5 p-3 bg-white hover:bg-[#F8F6F4] text-[#181716] font-bold text-xs rounded-full border border-[#EDE8E1] shadow-porcelain-sm transition-transform active:scale-95"
        >
          <div className="w-6 h-6 rounded-full bg-[#FFF0EB] flex items-center justify-center text-[#FF5722]">
            <Camera className="w-3.5 h-3.5" />
          </div>
          <span>Add Photo</span>
        </button>

        {/* Add Text Note */}
        <button
          onClick={() => setIsTextNoteModalOpen(true)}
          className="flex items-center justify-center gap-1.5 p-3 bg-white hover:bg-[#F8F6F4] text-[#181716] font-bold text-xs rounded-full border border-[#EDE8E1] shadow-porcelain-sm transition-transform active:scale-95"
        >
          <div className="w-6 h-6 rounded-full bg-[#FFF0EB] flex items-center justify-center text-[#FF5722]">
            <FileText className="w-3.5 h-3.5" />
          </div>
          <span>Add Note</span>
        </button>
      </div>

      {/* Top Filter Pills */}
      <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
        {[
          { id: 'all', label: 'All Items', icon: null },
          { id: 'image', label: 'Pictures', icon: ImageIcon },
          { id: 'audio', label: 'Voice Notes', icon: Mic },
          { id: 'text', label: 'Text Notes', icon: FileText }
        ].map((tab) => {
          const Icon = tab.icon;
          const count =
            tab.id === 'all'
              ? mediaItems.length
              : mediaItems.filter((m) => m.type === tab.id).length;

          return (
            <button
              key={tab.id}
              onClick={() => setActiveFilter(tab.id as any)}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold shrink-0 transition-all ${
                activeFilter === tab.id
                  ? 'bg-[#181716] text-white font-bold shadow-2xs'
                  : 'bg-[#EDE8E1] text-[#45423E] hover:bg-[#E0DAD1]'
              }`}
            >
              {Icon && <Icon className="w-3.5 h-3.5" />}
              <span>{tab.label}</span>
              <span
                className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                  activeFilter === tab.id
                    ? 'bg-white/20 text-white'
                    : 'bg-[#F5F3EF] text-[#7C7875]'
                }`}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search className="w-4 h-4 text-[#7C7875] absolute left-3.5 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search pictures, recordings, or text..."
          className="w-full pl-10 pr-4 py-2.5 bg-[#F5F3EF] border border-[#EDE8E1] rounded-full text-xs text-[#181716] placeholder:text-[#7C7875] focus:outline-none focus:border-[#FF5722] focus:bg-white shadow-2xs transition-all"
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery('')}
            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-semibold text-[#7C7875] hover:text-[#181716]"
          >
            Clear
          </button>
        )}
      </div>

      {/* Media Feed / Grid */}
      {filteredItems.length > 0 ? (
        <div className="space-y-3">
          {filteredItems.map((item) => (
            <div key={item.id} className="animate-in fade-in duration-150">
              {/* Voice Note item with Audio Player (1x, 1.5x, 2x speeds & Track bar) */}
              {item.type === 'audio' && (
                <div className="bg-white rounded-[22px] border border-[#EDE8E1] shadow-porcelain-sm p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-[#FFF0EB] text-[#FF5722] flex items-center justify-center shadow-2xs">
                        <Mic className="w-4 h-4" />
                      </div>
                      <div>
                        <h4 className="font-bold text-xs text-[#181716]">{item.title}</h4>
                        <div className="flex items-center gap-2 text-[10px] text-[#7C7875]">
                          <span>{item.blockName}</span>
                          {item.cardName && <span>• Linked to {item.cardName}</span>}
                          <span>• {new Date(item.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric' })}</span>
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => onDeleteMedia(item.id)}
                      className="p-1.5 text-[#7C7875] hover:text-rose-600 rounded-full hover:bg-rose-50 transition-colors"
                      title="Delete Voice Note"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Playback Track Bar & Speed Selector (1x, 1.5x, 2x) */}
                  <AudioPlayer
                    src={item.dataUrl}
                    duration={item.audioDuration}
                    compact
                  />
                </div>
              )}

              {/* Image Item */}
              {item.type === 'image' && (
                <div className="bg-white rounded-[22px] border border-[#EDE8E1] shadow-porcelain-sm p-3.5 flex flex-col gap-2.5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full bg-[#FFF0EB] text-[#FF5722] flex items-center justify-center shadow-2xs">
                        <ImageIcon className="w-3.5 h-3.5" />
                      </div>
                      <div>
                        <h4 className="font-bold text-xs text-[#181716] truncate">{item.title}</h4>
                        <span className="text-[10px] text-[#7C7875]">
                          {item.blockName} • {new Date(item.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                        </span>
                      </div>
                    </div>
                    <button
                      onClick={() => onDeleteMedia(item.id)}
                      className="p-1.5 text-[#7C7875] hover:text-rose-600 rounded-full hover:bg-rose-50 transition-colors"
                      title="Delete Image"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  {item.dataUrl && (
                    <div
                      className="relative rounded-xl overflow-hidden border border-[#EDE8E1] aspect-16/9 bg-[#181716] cursor-pointer group"
                      onClick={() => setLightboxImage(item.dataUrl || null)}
                    >
                      <img src={item.dataUrl} alt={item.title} className="w-full h-full object-contain" />
                      <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-xs font-medium">
                        Click to view full image
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Text Note Item */}
              {item.type === 'text' && (
                <div className="bg-white rounded-[22px] border border-[#EDE8E1] shadow-porcelain-sm p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-[#FFF0EB] text-[#FF5722] flex items-center justify-center shadow-2xs">
                        <FileText className="w-4 h-4" />
                      </div>
                      <div>
                        <h4 className="font-bold text-xs text-[#181716]">{item.title}</h4>
                        <span className="text-[10px] text-[#7C7875]">
                          {item.blockName} • {new Date(item.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => {
                          if (item.textContent) {
                            navigator.clipboard.writeText(item.textContent);
                            alert('Note copied to clipboard!');
                          }
                        }}
                        className="p-1.5 text-[#7C7875] hover:text-[#181716] rounded-full hover:bg-[#F8F6F4] transition-colors"
                        title="Copy text"
                      >
                        <Copy className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => onDeleteMedia(item.id)}
                        className="p-1.5 text-[#7C7875] hover:text-rose-600 rounded-full hover:bg-rose-50 transition-colors"
                        title="Delete note"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <p className="text-xs text-[#2B2927] bg-[#F8F6F4] p-3 rounded-xl border border-[#EDE8E1] whitespace-pre-line leading-relaxed">
                    {item.textContent}
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-[28px] border border-[#EDE8E1] p-8 text-center shadow-porcelain-sm">
          <div className="w-12 h-12 rounded-2xl bg-[#FFF0EB] text-[#FF5722] flex items-center justify-center mx-auto mb-3 shadow-2xs">
            <ImageIcon className="w-6 h-6" />
          </div>
          <h3 className="font-syne text-sm font-bold text-[#181716] mb-1">No Media Found</h3>
          <p className="text-xs text-[#7C7875] mb-4">
            Record a voice note or add pictures with your camera.
          </p>
        </div>
      )}

      {/* Voice Recorder Modal (1-Tap start) */}
      <VoiceRecorderModal
        isOpen={isVoiceModalOpen}
        onClose={() => setIsVoiceModalOpen(false)}
        onSave={handleVoiceSave}
        defaultBlockName={defaultBlockName}
      />

      {/* Camera Capture Modal */}
      <CameraCaptureModal
        isOpen={isCameraModalOpen}
        onClose={() => setIsCameraModalOpen(false)}
        onCapture={handlePhotoCapture}
        title="Capture Photo"
      />

      {/* Add Text Note Modal */}
      {isTextNoteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/60 backdrop-blur-md animate-in fade-in">
          <div className="bg-white w-full max-w-md rounded-[28px] shadow-porcelain p-5 border border-[#EDE8E1]">
            <div className="flex items-center justify-between pb-3 border-b border-[#EDE8E1] mb-3">
              <h3 className="font-syne text-sm font-bold text-[#181716]">New Text Note</h3>
              <button
                onClick={() => setIsTextNoteModalOpen(false)}
                className="w-7 h-7 rounded-full bg-[#F5F3EF] flex items-center justify-center text-[#7C7875] hover:text-[#181716]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-[11px] font-semibold text-[#7C7875] block mb-1">Title</label>
                <input
                  type="text"
                  value={textNoteTitle}
                  onChange={(e) => setTextNoteTitle(e.target.value)}
                  placeholder="Note title (optional)..."
                  className="w-full px-3.5 py-2 bg-[#F5F3EF] border border-[#EDE8E1] rounded-full text-xs text-[#181716] focus:outline-none focus:border-[#FF5722]"
                />
              </div>

              <div>
                <label className="text-[11px] font-semibold text-[#7C7875] block mb-1">Note Content *</label>
                <textarea
                  rows={4}
                  value={textNoteBody}
                  onChange={(e) => setTextNoteBody(e.target.value)}
                  placeholder="Type notes, meeting memos, conversation details..."
                  className="w-full px-3.5 py-2 bg-[#F5F3EF] border border-[#EDE8E1] rounded-2xl text-xs text-[#181716] focus:outline-none focus:border-[#FF5722] resize-none"
                />
              </div>

              <div className="flex items-center gap-2 pt-2">
                <button
                  onClick={() => setIsTextNoteModalOpen(false)}
                  className="flex-1 py-2.5 bg-[#EDE8E1] hover:bg-[#E0DAD1] text-[#181716] font-bold text-xs rounded-full"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveTextNote}
                  disabled={!textNoteBody.trim()}
                  className="flex-1 py-2.5 bg-gradient-to-r from-[#FF5722] to-[#FF4500] hover:opacity-95 disabled:opacity-50 text-white font-bold text-xs rounded-full shadow-solar"
                >
                  Save Note
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Lightbox for viewing photos */}
      {lightboxImage && (
        <div
          className="fixed inset-0 z-60 bg-black/90 backdrop-blur-md flex items-center justify-center p-4"
          onClick={() => setLightboxImage(null)}
        >
          <img src={lightboxImage} alt="Full preview" className="max-w-full max-h-full rounded-2xl object-contain" />
          <button className="absolute top-4 right-4 text-white p-2 rounded-full bg-slate-800">
            <X className="w-6 h-6" />
          </button>
        </div>
      )}
    </div>
  );
};
