'use client';

import { Volume2, VolumeX, Gauge } from 'lucide-react';
import { useSpeechSynthesis } from '@/hooks/useSpeechSynthesis';

interface AudioPlayerProps {
  text: string;
  className?: string;
  compact?: boolean;
}

export function AudioPlayer({ text, className = '', compact = false }: AudioPlayerProps) {
  const { speak, stop, isSpeaking, currentText, rate } = useSpeechSynthesis();
  const isPlayingThis = isSpeaking && currentText === text;

  const handleNormalPlay = () => {
    if (isPlayingThis && rate === 1.0) {
      stop();
    } else {
      speak(text, 1.0);
    }
  };

  const handleSlowPlay = () => {
    if (isPlayingThis && rate === 0.5) {
      stop();
    } else {
      speak(text, 0.5);
    }
  };

  return (
    <div
      className={`inline-flex items-center p-1 bg-slate-100/90 rounded-2xl border border-slate-200/90 shadow-2xs ${className}`}
    >
      {/* Primary Normal Speed Play Button */}
      <button
        type="button"
        onClick={handleNormalPlay}
        title="ฟังเสียงอ่านปกติ (1.0x)"
        className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all shadow-xs touch-manipulation select-none cursor-pointer active:scale-95 min-h-[40px] ${
          isPlayingThis && rate === 1.0
            ? 'bg-rose-600 text-white animate-pulse shadow-rose-600/30'
            : 'bg-rose-500 hover:bg-rose-600 text-white shadow-rose-500/20'
        }`}
      >
        {isPlayingThis && rate === 1.0 ? (
          <VolumeX className="w-4 h-4" />
        ) : (
          <Volume2 className="w-4 h-4 text-white" />
        )}
        <span>{isPlayingThis && rate === 1.0 ? 'หยุด' : 'ฟังเสียง'}</span>
      </button>

      {/* Integrated Slow Speed Button (0.5x) */}
      <button
        type="button"
        onClick={handleSlowPlay}
        title="ฟังเสียงช้าๆ (0.5x)"
        className={`flex items-center gap-1 px-3 py-2 rounded-xl text-xs font-bold transition-all font-mono touch-manipulation select-none cursor-pointer active:scale-95 min-h-[40px] ${
          isPlayingThis && rate === 0.5
            ? 'bg-amber-500 text-white animate-pulse shadow-xs'
            : 'text-amber-800 hover:bg-amber-200/60'
        }`}
      >
        <Gauge className="w-3.5 h-3.5 text-amber-700 flex-shrink-0" />
        <span>0.5x ช้า</span>
      </button>
    </div>
  );
}
