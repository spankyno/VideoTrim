import React, { useRef, useEffect } from 'react';
import { Play, Pause } from 'lucide-react';
import { EditorState } from '../types';

interface VideoPlayerProps {
  state: EditorState;
  onTimeUpdate: (time: number) => void;
  onDurationChange: (duration: number) => void;
  onTrimChange: (start: number, end: number) => void;
}

const VideoPlayer: React.FC<VideoPlayerProps> = ({ state, onTimeUpdate, onDurationChange, onTrimChange }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = React.useState(false);

  // Handle Video Loading
  useEffect(() => {
    if (videoRef.current && state.videoUrl) {
      videoRef.current.load();
    }
  }, [state.videoUrl]);

  // Sync play state
  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        // If we are at the end of the trim, restart from trimStart
        if (videoRef.current.currentTime >= state.trimEnd) {
            videoRef.current.currentTime = state.trimStart;
        }
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  // Enforce trim boundaries during playback
  const handleTimeUpdate = () => {
    if (videoRef.current) {
      const time = videoRef.current.currentTime;
      onTimeUpdate(time);
      
      // Loop if reaches end of trim
      if (time >= state.trimEnd && isPlaying) {
        videoRef.current.pause();
        setIsPlaying(false);
        videoRef.current.currentTime = state.trimEnd;
      }
    }
  };

  // Formatting helpers
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getPercent = (time: number) => (state.duration > 0 ? (time / state.duration) * 100 : 0);

  return (
    <div className="bg-brand-surface rounded-xl overflow-hidden shadow-xl border border-slate-700">
      {/* Video Element */}
      <div className="relative aspect-video bg-black flex items-center justify-center group">
        {state.videoUrl ? (
          <video
            ref={videoRef}
            src={state.videoUrl}
            className="w-full h-full object-contain"
            onTimeUpdate={handleTimeUpdate}
            onLoadedMetadata={(e) => {
                const duration = e.currentTarget.duration;
                onDurationChange(duration);
                // Initialize trim to full duration if 0
                if (state.trimEnd === 0) onTrimChange(0, duration);
            }}
            onClick={togglePlay}
          />
        ) : (
          <div className="text-slate-500">Vista previa del vídeo</div>
        )}

        {/* Play Overlay */}
        {state.videoUrl && (
            <button 
                onClick={togglePlay}
                className={`absolute inset-0 m-auto w-16 h-16 bg-brand-cyan/20 backdrop-blur-sm rounded-full flex items-center justify-center text-white transition-opacity duration-300 ${isPlaying ? 'opacity-0 group-hover:opacity-100' : 'opacity-100'}`}
            >
                {isPlaying ? <Pause fill="currentColor" /> : <Play fill="currentColor" className="ml-1" />}
            </button>
        )}
      </div>

      {/* Controls */}
      <div className="p-6 space-y-6">
        
        {/* Timestamp Info */}
        <div className="flex justify-between text-sm font-mono text-brand-cyan">
          <span>{formatTime(state.currentTime)}</span>
          <span className="text-slate-400">Total: {formatTime(state.duration)}</span>
        </div>

        {/* Custom Trim Slider */}
        <div className="relative h-12 select-none group/slider">
           <style>{`
             .range-thumb-fix::-webkit-slider-thumb {
               pointer-events: auto;
               width: 24px;
               height: 48px;
               -webkit-appearance: none;
               cursor: ew-resize;
             }
             .range-thumb-fix::-moz-range-thumb {
               pointer-events: auto;
               width: 24px;
               height: 48px;
               border: none;
               cursor: ew-resize;
             }
           `}</style>
           
           {/* Background Track */}
           <div className="absolute top-1/2 left-0 right-0 h-2 bg-slate-700 rounded-full -translate-y-1/2 overflow-hidden">
               {/* Selection Highlight */}
               <div 
                 className="absolute top-0 h-full bg-brand-cyan opacity-50"
                 style={{ 
                    left: `${getPercent(state.trimStart)}%`, 
                    width: `${getPercent(state.trimEnd - state.trimStart)}%` 
                 }}
               />
               {/* Playhead */}
               <div 
                className="absolute top-0 w-0.5 h-full bg-white z-10"
                style={{ left: `${getPercent(state.currentTime)}%` }}
               />
           </div>

           {/* Input Sliders (Invisible but functional) */}
           {/* We use specific pointer-events handling to allow clicking through the invisible track */}
           <input 
             type="range"
             min={0}
             max={state.duration}
             step={0.1}
             value={state.trimStart}
             onChange={(e) => {
                 const val = parseFloat(e.target.value);
                 if (val < state.trimEnd - 1) onTrimChange(val, state.trimEnd);
             }}
             className="absolute top-1/2 -translate-y-1/2 w-full h-12 opacity-0 pointer-events-none range-thumb-fix z-20"
           />
           <input 
             type="range"
             min={0}
             max={state.duration}
             step={0.1}
             value={state.trimEnd}
             onChange={(e) => {
                 const val = parseFloat(e.target.value);
                 if (val > state.trimStart + 1) onTrimChange(state.trimStart, val);
             }}
             className="absolute top-1/2 -translate-y-1/2 w-full h-12 opacity-0 pointer-events-none range-thumb-fix z-20"
           />

           {/* Visible Thumbs */}
            <div 
             className="absolute top-1/2 -translate-y-1/2 w-4 h-8 bg-brand-cyan rounded-sm border-2 border-white pointer-events-none z-10 shadow-lg flex items-center justify-center"
             style={{ left: `calc(${getPercent(state.trimStart)}% - 8px)` }}
            >
                <div className="w-0.5 h-4 bg-slate-900/50"></div>
            </div>
            <div 
             className="absolute top-1/2 -translate-y-1/2 w-4 h-8 bg-brand-cyan rounded-sm border-2 border-white pointer-events-none z-10 shadow-lg flex items-center justify-center"
             style={{ left: `calc(${getPercent(state.trimEnd)}% - 8px)` }}
            >
                <div className="w-0.5 h-4 bg-slate-900/50"></div>
            </div>
        </div>

        <div className="flex justify-between text-xs text-slate-400">
            <div>Inicio: {formatTime(state.trimStart)}</div>
            <div>Fin: {formatTime(state.trimEnd)}</div>
        </div>

      </div>
    </div>
  );
};

export default VideoPlayer;