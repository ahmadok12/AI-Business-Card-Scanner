import React, { useState, useRef, useEffect } from 'react';
import { Play, Pause, Volume2, Download, Trash2 } from 'lucide-react';

interface AudioPlayerProps {
  src?: string;
  title?: string;
  duration?: number;
  onDelete?: () => void;
  compact?: boolean;
}

export const AudioPlayer: React.FC<AudioPlayerProps> = ({
  src,
  title,
  duration = 0,
  onDelete,
  compact = false
}) => {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [totalDuration, setTotalDuration] = useState(duration);
  const [playbackRate, setPlaybackRate] = useState<number>(1);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleLoadedMetadata = () => {
      if (audio.duration && !isNaN(audio.duration) && isFinite(audio.duration)) {
        setTotalDuration(audio.duration);
      }
      setIsLoaded(true);
    };

    const handleTimeUpdate = () => {
      setCurrentTime(audio.currentTime);
    };

    const handleEnded = () => {
      setIsPlaying(false);
      setCurrentTime(0);
    };

    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('ended', handleEnded);

    return () => {
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('ended', handleEnded);
    };
  }, [src]);

  const togglePlay = () => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isPlaying) {
      audio.pause();
      setIsPlaying(false);
    } else {
      audio.playbackRate = playbackRate;
      audio.play().then(() => setIsPlaying(true)).catch((err) => {
        console.warn('Audio play failed:', err);
      });
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const audio = audioRef.current;
    if (!audio) return;
    const newTime = parseFloat(e.target.value);
    audio.currentTime = newTime;
    setCurrentTime(newTime);
  };

  const changeSpeed = (speed: number) => {
    const audio = audioRef.current;
    setPlaybackRate(speed);
    if (audio) {
      audio.playbackRate = speed;
    }
  };

  const formatTime = (seconds: number) => {
    if (isNaN(seconds) || !isFinite(seconds)) return '00:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const downloadAudio = () => {
    if (!src) return;
    const a = document.createElement('a');
    a.href = src;
    a.download = `${title || 'voice-note'}.webm`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <div className={`bg-white rounded-[20px] border border-[#EDE8E1] shadow-[0_4px_14px_-2px_rgba(69,66,62,0.06)] p-4 ${compact ? 'py-3' : 'p-4'}`}>
      <audio ref={audioRef} src={src} preload="metadata" />

      {title && (
        <div className="flex items-center justify-between mb-2.5">
          <div className="flex items-center gap-2 text-[#181716] font-semibold text-sm truncate font-grotesk">
            <Volume2 className="w-4 h-4 text-[#FF5722] shrink-0" />
            <span className="truncate">{title}</span>
          </div>
          <div className="flex items-center gap-1 shrink-0">
            {src && (
              <button
                onClick={downloadAudio}
                title="Download recording"
                className="p-1.5 text-[#7C7875] hover:text-[#181716] rounded-full hover:bg-[#F8F6F4] transition-colors"
              >
                <Download className="w-3.5 h-3.5" />
              </button>
            )}
            {onDelete && (
              <button
                onClick={onDelete}
                title="Delete recording"
                className="p-1.5 text-rose-400 hover:text-rose-600 rounded-full hover:bg-rose-50 transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      )}

      {/* Track Bar & Controls */}
      <div className="flex flex-col gap-2.5">
        <div className="flex items-center gap-3">
          {/* Play/Pause Button */}
          <button
            onClick={togglePlay}
            className="w-10 h-10 rounded-full bg-[#FFF0EB] hover:bg-[#FFE6DC] text-[#FF5722] flex items-center justify-center transition-all active:scale-95 shrink-0 shadow-sm border border-[#FF5722]/20"
          >
            {isPlaying ? <Pause className="w-5 h-5 fill-current" /> : <Play className="w-5 h-5 fill-current ml-0.5" />}
          </button>

          {/* Interactive Scrub Bar */}
          <div className="flex-1 flex flex-col justify-center">
            <input
              type="range"
              min={0}
              max={totalDuration > 0 ? totalDuration : 100}
              step={0.1}
              value={currentTime}
              onChange={handleSeek}
              className="w-full h-1.5 bg-[#EDE8E1] rounded-lg appearance-none cursor-pointer accent-[#FF5722] hover:h-2 transition-all"
            />
            <div className="flex justify-between items-center text-[11px] text-[#7C7875] font-grotesk font-medium mt-1">
              <span>{formatTime(currentTime)}</span>
              <span>{formatTime(totalDuration)}</span>
            </div>
          </div>
        </div>

        {/* Speed Toggles (1x, 1.5x, 2x) */}
        <div className="flex items-center justify-between pt-2 border-t border-[#EDE8E1]">
          <span className="text-[11px] text-[#7C7875] font-grotesk font-semibold uppercase tracking-wider">Speed</span>
          <div className="flex items-center gap-1 bg-[#F8F6F4] p-0.5 rounded-full border border-[#EDE8E1]">
            {[1, 1.5, 2].map((speed) => (
              <button
                key={speed}
                onClick={() => changeSpeed(speed)}
                className={`px-2.5 py-0.5 text-xs font-semibold rounded-full font-grotesk transition-all ${
                  playbackRate === speed
                    ? 'bg-[#FF5722] text-white shadow-sm'
                    : 'text-[#7C7875] hover:text-[#181716]'
                }`}
              >
                {speed}x
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
