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
        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium transition ${
          isPlayingThis
            ? 'bg-rose-500 text-white animate-pulse shadow-md shadow-rose-500/30'
            : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700'
        } ${className}`}
      >
        {isPlayingThis ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5 text-rose-400" />}
        <span>{isPlayingThis ? 'กำลังเล่น...' : 'ฟังเสียง'}</span>
      </button>
    );
  }

  return (
    <div className={`flex flex-wrap items-center gap-3 p-2.5 bg-slate-900/90 rounded-xl border border-slate-800 ${className}`}>
      {/* Play Button */}
      <button
        onClick={toggleSpeech}
        className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm transition shadow-lg ${
          isPlayingThis
            ? 'bg-rose-600 text-white animate-pulse shadow-rose-600/40'
            : 'bg-gradient-to-r from-rose-500 to-amber-500 hover:from-rose-600 hover:to-amber-600 text-white shadow-amber-500/20'
        }`}
      >
        {isPlayingThis ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
        <span>{isPlayingThis ? 'หยุดเสียง' : 'ฟังเสียงประโยค'}</span>
      </button>

      {/* Speed Controls */}
      <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-lg border border-slate-800 text-xs">
        <span className="text-slate-400 px-2 flex items-center gap-1">
          <Gauge className="w-3.5 h-3.5 text-amber-400" />
          ความเร็ว:
        </span>
        {[0.5, 0.75, 1.0].map((s) => (
          <button
            key={s}
            onClick={() => handleRateChange(s)}
            className={`px-2.5 py-1 rounded-md transition font-mono font-medium ${
              rate === s
                ? 'bg-amber-500 text-slate-950 font-bold shadow-sm'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            {s === 0.5 ? '0.5x ช้ามาก' : s === 0.75 ? '0.75x ปานกลาง' : '1.0x ปกติ'}
          </button>
        ))}
      </div>
    </div>
  );
}
