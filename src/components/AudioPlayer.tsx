'use client';

import { Volume2, VolumeX, Gauge } from 'lucide-react';
import { useSpeechSynthesis } from '@/hooks/useSpeechSynthesis';

interface AudioPlayerProps {
  text: string;
  className?: string;
  compact?: boolean;
}

export function AudioPlayer({ text, className = '', compact = false }: AudioPlayerProps) {
  const { speak, stop, isSpeaking, currentText, rate, setRate } = useSpeechSynthesis();
  const isPlayingThis = isSpeaking && currentText === text;

  const toggleSpeech = () => {
    if (isPlayingThis) {
      stop();
    } else {
      speak(text);
    }
  };

  const handleRateChange = (newRate: number) => {
    setRate(newRate);
    if (isPlayingThis) {
      speak(text, newRate);
    }
  };

  if (compact) {
    return (
      <button
        onClick={toggleSpeech}
        title="ฟังเสียงอ่านภาษาจีน"
        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-bold transition shadow-2xs ${
          isPlayingThis
            ? 'bg-rose-600 text-white animate-pulse shadow-md shadow-rose-600/30'
            : 'bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-200'
        } ${className}`}
      >
        {isPlayingThis ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5 text-rose-500" />}
        <span>{isPlayingThis ? 'กำลังเล่น...' : 'ฟังเสียง'}</span>
      </button>
    );
  }

  return (
    <div className={`flex flex-wrap items-center gap-3 p-2.5 bg-white rounded-xl border border-slate-200 shadow-2xs ${className}`}>
      {/* Play Button */}
      <button
        onClick={toggleSpeech}
        className={`flex items-center gap-2 px-4 py-2 rounded-lg font-bold text-xs transition shadow-md ${
          isPlayingThis
            ? 'bg-rose-600 text-white animate-pulse shadow-rose-600/30'
            : 'bg-gradient-to-r from-rose-500 to-amber-500 hover:from-rose-600 hover:to-amber-600 text-white shadow-rose-500/20'
        }`}
      >
        {isPlayingThis ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
        <span>{isPlayingThis ? 'หยุดเสียง' : 'ฟังเสียงประโยค'}</span>
      </button>

      {/* Speed Controls */}
      <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg border border-slate-200 text-xs font-semibold">
        <span className="text-slate-600 px-2 flex items-center gap-1">
          <Gauge className="w-3.5 h-3.5 text-amber-600" />
          ความเร็ว:
        </span>
        {[0.5, 0.75, 1.0].map((s) => (
          <button
            key={s}
            onClick={() => handleRateChange(s)}
            className={`px-2.5 py-1 rounded-md transition font-mono ${
              rate === s
                ? 'bg-amber-500 text-white font-bold shadow-2xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/70'
            }`}
          >
            {s === 0.5 ? '0.5x ช้ามาก' : s === 0.75 ? '0.75x ปานกลาง' : '1.0x ปกติ'}
          </button>
        ))}
      </div>
    </div>
  );
}
