import React, { useRef, useState } from 'react';
import { Play, Pause, Volume2 } from 'lucide-react';

interface AudioPlayerProps {
  audioUrl: string;
  label?: string;
}

export const AudioPlayer: React.FC<AudioPlayerProps> = ({ audioUrl, label = "Áudio" }) => {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  const togglePlayPause = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
    }
  };

  const handleLoadedMetadata = () => {
    if (audioRef.current) {
      setDuration(audioRef.current.duration);
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = parseFloat(e.target.value);
    if (audioRef.current) {
      audioRef.current.currentTime = time;
      setCurrentTime(time);
    }
  };

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  return (
    <div className="flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-200 bg-white hover:bg-[#f8f5ff] border border-[#efefef] hover:border-[#5f2ebe]/20 min-w-[200px] h-10">
      <audio
        ref={audioRef}
        src={audioUrl}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onEnded={() => setIsPlaying(false)}
      />
      
      <button
        onClick={togglePlayPause}
        className="flex items-center justify-center w-4 h-4 bg-[#c8ff20] hover:bg-[#b8ef10] text-black rounded-full transition-colors flex-shrink-0"
      >
        {isPlaying ? <Pause size={12} /> : <Play size={12} />}
      </button>
      
      <div className="flex-1 flex items-center gap-2 min-w-0">
        <Volume2 size={14} className="text-[rgba(38,47,60,0.7)] flex-shrink-0" />
        <span className="text-sm font-medium text-[rgba(38,47,60,0.7)] truncate">{label}</span>
        
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <input
            type="range"
            min="0"
            max={duration || 0}
            value={currentTime}
            onChange={handleSeek}
            className="flex-1 h-1 bg-gray-200 rounded-lg appearance-none cursor-pointer"
            style={{
              background: `linear-gradient(to right, #5f2ebe 0%, #5f2ebe ${(currentTime / duration) * 100}%, #e5e7eb ${(currentTime / duration) * 100}%, #e5e7eb 100%)`
            }}
          />
          <span className="text-xs text-[rgba(38,47,60,0.7)] min-w-[35px] flex-shrink-0">
            {formatTime(currentTime)}
          </span>
        </div>
      </div>
    </div>
  );
};