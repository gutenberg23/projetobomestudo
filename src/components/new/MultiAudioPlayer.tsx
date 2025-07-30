import React, { useRef, useState, useEffect } from 'react';
import { Play, Pause, Volume2, ChevronLeft, ChevronRight } from 'lucide-react';

interface MultiAudioPlayerProps {
  audioUrls: string[];
  label?: string;
}

export const MultiAudioPlayer: React.FC<MultiAudioPlayerProps> = ({ 
  audioUrls, 
  label = "Áudio" 
}) => {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);

  const currentUrl = audioUrls[currentTrackIndex];
  const totalTracks = audioUrls.length;

  // Reset audio when track changes
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.load();
      setCurrentTime(0);
      setDuration(0);
      setIsPlaying(false);
    }
  }, [currentTrackIndex]);

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

  const goToPreviousTrack = () => {
    if (currentTrackIndex > 0) {
      setCurrentTrackIndex(currentTrackIndex - 1);
    }
  };

  const goToNextTrack = () => {
    if (currentTrackIndex < totalTracks - 1) {
      setCurrentTrackIndex(currentTrackIndex + 1);
    }
  };

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  return (
    <div className="flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-200 bg-white hover:bg-[#f8f5ff] border border-[#efefef] hover:border-[#5f2ebe]/20 min-w-[250px] h-10">
      <audio
        ref={audioRef}
        src={currentUrl}
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
      
      {/* Navigation controls for multiple tracks */}
      {totalTracks > 1 && (
        <div className="flex items-center gap-1 ml-2">
          <button
            onClick={goToPreviousTrack}
            disabled={currentTrackIndex === 0}
            className="flex items-center justify-center w-5 h-5 text-[rgba(38,47,60,0.7)] hover:text-[#5f2ebe] disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronLeft size={14} />
          </button>
          
          <span className="text-xs text-[rgba(38,47,60,0.7)] min-w-[25px] text-center">
            {currentTrackIndex + 1}/{totalTracks}
          </span>
          
          <button
            onClick={goToNextTrack}
            disabled={currentTrackIndex === totalTracks - 1}
            className="flex items-center justify-center w-5 h-5 text-[rgba(38,47,60,0.7)] hover:text-[#5f2ebe] disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronRight size={14} />
          </button>
        </div>
      )}
    </div>
  );
};