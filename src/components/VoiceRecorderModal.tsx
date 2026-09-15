import React, { useState, useEffect, useRef } from 'react';
import { Mic, Square, Save, X, RefreshCw } from 'lucide-react';
import { AudioPlayer } from './AudioPlayer';

interface VoiceRecorderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (audioBlobUrl: string, durationSeconds: number, noteTitle: string) => void;
  defaultBlockName: string;
  associatedCardName?: string;
  associatedCardId?: string;
}

export const VoiceRecorderModal: React.FC<VoiceRecorderModalProps> = ({
  isOpen,
  onClose,
  onSave,
  defaultBlockName,
  associatedCardName
}) => {
  const [isRecording, setIsRecording] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const [recordedAudioUrl, setRecordedAudioUrl] = useState<string | null>(null);
  const [recordedDuration, setRecordedDuration] = useState(0);
  const [customTitle, setCustomTitle] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<any>(null);

  useEffect(() => {
    if (isOpen) {
      // Auto-populate default title
      const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      const dateStr = new Date().toLocaleDateString([], { month: 'short', day: 'numeric' });
      const initialTitle = associatedCardName
        ? `Voice Memo - ${associatedCardName} (${dateStr} ${timeStr})`
        : `Voice Note - ${defaultBlockName} (${dateStr} ${timeStr})`;
      setCustomTitle(initialTitle);
      setRecordedAudioUrl(null);
      setSeconds(0);
      setErrorMsg(null);

      // Instant 1-tap start recording on open!
      startRecording();
    } else {
      stopRecordingCleanup();
    }

    return () => {
      stopRecordingCleanup();
    };
  }, [isOpen]);

  const startRecording = async () => {
    try {
      setErrorMsg(null);
      audioChunksRef.current = [];
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const reader = new FileReader();
        reader.readAsDataURL(audioBlob);
        reader.onloadend = () => {
          const base64data = reader.result as string;
          setRecordedAudioUrl(base64data);
        };
        // Stop audio tracks
        stream.getTracks().forEach((track) => track.stop());
      };

      mediaRecorder.start(200);
      setIsRecording(true);
      setSeconds(0);

      timerRef.current = setInterval(() => {
        setSeconds((prev) => prev + 1);
      }, 1000);
    } catch (err: any) {
      console.error('Error accessing microphone:', err);
      setErrorMsg('Microphone access denied or not available. Please allow microphone permissions.');
      setIsRecording(false);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    setRecordedDuration(seconds);
    setIsRecording(false);
  };

  const stopRecordingCleanup = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    setIsRecording(false);
  };

  const handleSave = () => {
    if (recordedAudioUrl) {
      onSave(recordedAudioUrl, recordedDuration || seconds || 1, customTitle || 'Voice Note');
      onClose();
    }
  };

  const handleRerecord = () => {
    setRecordedAudioUrl(null);
    setSeconds(0);
    startRecording();
  };

  if (!isOpen) return null;

  const formatTimer = (sec: number) => {
    const mins = Math.floor(sec / 60);
    const s = sec % 60;
    return `${mins.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#181716]/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-md rounded-[28px] p-6 shadow-2xl border border-[#EDE8E1] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-[#EDE8E1]">
          <div>
            <h3 className="text-base font-syne font-bold text-[#181716]">
              {isRecording ? 'Recording Voice Note' : 'Voice Memo'}
            </h3>
            <p className="text-xs text-[#FF5722] font-grotesk font-medium">
              {associatedCardName ? `Linked to ${associatedCardName}` : `Block: ${defaultBlockName}`}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-[#7C7875] hover:text-[#181716] rounded-full hover:bg-[#F8F6F4] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Error message */}
        {errorMsg && (
          <div className="my-4 p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl font-grotesk">
            {errorMsg}
          </div>
        )}

        {/* Recording Animation & Timer */}
        {isRecording && (
          <div className="py-8 flex flex-col items-center justify-center">
            <div className="relative mb-6">
              <div className="w-24 h-24 rounded-full bg-[#FFF0EB] recording-pulse flex items-center justify-center" />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-16 h-16 rounded-full bg-gradient-to-r from-[#FF5722] to-[#FF4500] text-white flex items-center justify-center shadow-lg shadow-[#FF5722]/30">
                  <Mic className="w-8 h-8" />
                </div>
              </div>
            </div>

            <div className="text-3xl font-syne font-bold text-[#181716] mb-1">
              {formatTimer(seconds)}
            </div>
            <p className="text-xs font-grotesk font-semibold text-[#FF5722] animate-pulse">
              ● Recording in progress... Speak clearly
            </p>

            <button
              onClick={stopRecording}
              className="mt-6 flex items-center gap-2 px-6 py-3 bg-[#181716] hover:bg-[#2A2725] text-white font-grotesk font-semibold text-sm rounded-full shadow-md transition-transform active:scale-95"
            >
              <Square className="w-4 h-4 fill-current" />
              Stop & Review
            </button>
          </div>
        )}

        {/* Review & Save after recording */}
        {!isRecording && recordedAudioUrl && (
          <div className="py-4 flex flex-col gap-4">
            <div>
              <label className="text-xs font-grotesk font-semibold text-[#181716] mb-1.5 block">Title / Note Name</label>
              <input
                type="text"
                value={customTitle}
                onChange={(e) => setCustomTitle(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-[#F8F6F4] border border-[#EDE8E1] rounded-xl text-sm font-grotesk text-[#181716] focus:outline-none focus:border-[#FF5722]"
                placeholder="Enter title..."
              />
            </div>

            {/* Audio playback preview with 1x, 1.5x, 2x speeds */}
            <div>
              <label className="text-xs font-grotesk font-semibold text-[#7C7875] mb-1.5 block">Preview Audio</label>
              <AudioPlayer src={recordedAudioUrl} duration={recordedDuration || seconds} />
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                onClick={handleRerecord}
                className="flex-1 flex items-center justify-center gap-2 py-3 bg-[#F8F6F4] hover:bg-[#EDE8E1] text-[#181716] font-grotesk font-semibold text-sm rounded-full border border-[#EDE8E1] transition-colors"
              >
                <RefreshCw className="w-4 h-4" />
                Re-record
              </button>
              <button
                onClick={handleSave}
                className="flex-1 flex items-center justify-center gap-2 py-3 bg-gradient-to-r from-[#FF5722] to-[#FF4500] text-white font-grotesk font-semibold text-sm rounded-full shadow-md shadow-[#FF5722]/20 hover:brightness-105 transition-transform active:scale-95"
              >
                <Save className="w-4 h-4" />
                Save Note
              </button>
            </div>
          </div>
        )}

        {/* Fallback if stopped without recording */}
        {!isRecording && !recordedAudioUrl && !errorMsg && (
          <div className="py-8 flex flex-col items-center justify-center">
            <button
              onClick={startRecording}
              className="w-20 h-20 rounded-full bg-gradient-to-r from-[#FF5722] to-[#FF4500] text-white flex items-center justify-center shadow-lg shadow-[#FF5722]/30 transition-transform active:scale-95"
            >
              <Mic className="w-8 h-8" />
            </button>
            <p className="mt-4 text-sm font-grotesk font-medium text-[#7C7875]">Tap to start recording</p>
          </div>
        )}
      </div>
    </div>
  );
};
