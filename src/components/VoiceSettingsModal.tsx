'use client';

import { useState } from 'react';
import {
  Volume2,
  X,
  Sparkles,
  RotateCcw,
  Sliders,
  CheckCircle2,
  User,
  Zap,
  Info,
  Play,
  Gauge,
  Music,
} from 'lucide-react';
import { useSpeechSynthesis } from '@/hooks/useSpeechSynthesis';

interface VoiceSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const TEST_PHRASES = [
  {
    label: '👋 ทักทายทั่วไป',
    text: '你好！欢迎使用华语Talk Master。',
    pinyin: 'Nǐ hǎo! Huānyíng shǐyòng Huáyǔ Talk Master.',
    thai: 'สวัสดี! ยินดีต้อนรับสู่ 华语Talk Master',
  },
  {
    label: '🍜 ซื้อของ/ถามราคา',
    text: '老板，请问这个多少钱？',
    pinyin: 'Lǎobǎn, qǐngwèn zhège duōshǎo qián?',
    thai: 'เถ้าแก่ ขอถามหน่อยอันนี้ราคาเท่าไหร่?',
  },
  {
    label: '🚇 เดินทาง/ถามทาง',
    text: '请问地铁站在哪里？',
    pinyin: 'Qǐngwèn dìtiězhàn zài nǎlǐ?',
    thai: 'ขอถามหน่อย สถานีรถไฟใต้ดินอยู่ที่ไหน?',
  },
];

export function VoiceSettingsModal({ isOpen, onClose }: VoiceSettingsModalProps) {
  const {
    speak,
    stop,
    isSpeaking,
    currentText,
    availableVoices,
    selectedVoiceURI,
    pitch,
    rate,
    volume,
    updateSettings,
  } = useSpeechSynthesis();

  const [activeVoiceURI, setActiveVoiceURI] = useState<string | null>(selectedVoiceURI);
  const [activePitch, setActivePitch] = useState<number>(pitch);
  const [activeRate, setActiveRate] = useState<number>(rate);
  const [activeVolume, setActiveVolume] = useState<number>(volume);
  const [testPlayingIndex, setTestPlayingIndex] = useState<number | null>(null);

  if (!isOpen) return null;

  const handleVoiceSelect = (uri: string) => {
    setActiveVoiceURI(uri);
    updateSettings({ voiceURI: uri });
  };

  const handlePitchChange = (newPitch: number) => {
    setActivePitch(newPitch);
    updateSettings({ pitch: newPitch });
  };

  const handleRateChange = (newRate: number) => {
    setActiveRate(newRate);
    updateSettings({ rate: newRate });
  };

  const handleVolumeChange = (newVol: number) => {
    setActiveVolume(newVol);
    updateSettings({ volume: newVol });
  };

  const handleResetDefaults = () => {
    setActivePitch(1.0);
    setActiveRate(1.0);
    setActiveVolume(1.0);
    const defaultVoiceURI = availableVoices.length > 0 ? availableVoices[0].voice.voiceURI : null;
    setActiveVoiceURI(defaultVoiceURI);
    updateSettings({
      pitch: 1.0,
      rate: 1.0,
      volume: 1.0,
      voiceURI: defaultVoiceURI,
    });
  };

  const handlePlayTest = (index: number, text: string, customSpeed?: number) => {
    setTestPlayingIndex(index);
    speak(text, customSpeed ?? activeRate, activePitch);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md animate-fadeIn">
      <div className="bg-white border border-slate-200 rounded-3xl p-5 sm:p-7 max-w-xl w-full text-slate-900 shadow-2xl relative overflow-hidden flex flex-col max-h-[90vh]">
        {/* Ambient Top Glow */}
        <div className="absolute -top-20 -right-20 w-48 h-48 bg-rose-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-20 -left-20 w-48 h-48 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-3.5 mb-4 relative z-10 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-rose-500 to-amber-500 text-white flex items-center justify-center shadow-xs">
              <Sliders className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-black text-slate-900">
                  ตั้งค่าเสียงพูดภาษาจีน (Voice Settings)
                </h3>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-50 text-rose-700 border border-rose-200">
                  TTS
                </span>
              </div>
              <p className="text-xs text-slate-500">
                เลือกเสียงผู้พูด ปรับระดับความทุ้ม-แหลม และความเร็วในการออกเสียง
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition cursor-pointer touch-manipulation"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content Body */}
        <div className="overflow-y-auto pr-1 space-y-5 flex-1 relative z-10">
          {/* Section 1: Voice Engine Selection */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-extrabold text-slate-800 flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-rose-500" />
                <span>เลือกเสียงผู้พูด (Voice Engine):</span>
              </label>
              <span className="text-[11px] text-slate-500 font-semibold">
                ตรวจพบ {availableVoices.length} เสียง
              </span>
            </div>

            {availableVoices.length === 0 ? (
              <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200 text-xs text-amber-900 space-y-1">
                <p className="font-bold flex items-center gap-1.5">
                  <Info className="w-4 h-4 text-amber-600 shrink-0" />
                  <span>กำลังค้นหารายชื่อเสียงภาษาจีนบนอุปกรณ์ของคุณ...</span>
                </p>
                <p className="text-[11px] text-amber-800">
                  ระบบจะใช้เสียงจีนกลางมาตรฐานของเบราว์เซอร์อัตโนมัติ
                </p>
              </div>
            ) : (
              <div className="space-y-2 max-h-48 overflow-y-auto p-1 border border-slate-200 rounded-2xl bg-slate-50/50">
                {availableVoices.map((fv) => {
                  const isSelected = activeVoiceURI === fv.voice.voiceURI;
                  return (
                    <button
                      key={fv.voice.voiceURI}
                      type="button"
                      onClick={() => handleVoiceSelect(fv.voice.voiceURI)}
                      className={`w-full p-3 rounded-xl border text-left transition-all flex items-center justify-between gap-3 cursor-pointer touch-manipulation select-none active:scale-[0.99] ${
                        isSelected
                          ? 'bg-white border-rose-500 ring-2 ring-rose-400/40 shadow-xs'
                          : 'bg-white hover:bg-slate-100/80 border-slate-200/90'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <span className="text-lg shrink-0">
                          {fv.gender === 'female' ? '👩' : fv.gender === 'male' ? '👨' : '🤖'}
                        </span>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-xs font-bold text-slate-900 truncate">
                              {fv.name}
                            </span>
                            {fv.isNatural && (
                              <span className="text-[10px] font-bold px-2 py-0.2 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300 flex items-center gap-0.5">
                                <Sparkles className="w-2.5 h-2.5 text-emerald-600" />
                                <span>เสียงธรรมชาติ</span>
                              </span>
                            )}
                          </div>
                          <p className="text-[10px] text-slate-500 font-mono mt-0.5">
                            {fv.lang} • {fv.gender === 'female' ? 'เสียงผู้หญิง' : fv.gender === 'male' ? 'เสียงผู้ชาย' : 'เสียงระบบ'}
                          </p>
                        </div>
                      </div>

                      {isSelected ? (
                        <CheckCircle2 className="w-5 h-5 text-rose-500 shrink-0" />
                      ) : (
                        <div className="w-4 h-4 rounded-full border border-slate-300 shrink-0" />
                      )}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Section 2: Pitch & Rate Sliders */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 bg-slate-50 p-4 rounded-2xl border border-slate-200">
            {/* Pitch (ความทุ้ม-แหลม) */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="font-extrabold text-slate-800 flex items-center gap-1">
                  <Music className="w-3.5 h-3.5 text-indigo-500" />
                  <span>ระดับเสียง (Pitch):</span>
                </span>
                <span className="font-mono font-bold text-indigo-600 bg-white px-2 py-0.5 rounded-md border border-slate-200">
                  {activePitch.toFixed(1)}x
                </span>
              </div>
              <input
                type="range"
                min="0.6"
                max="1.4"
                step="0.1"
                value={activePitch}
                onChange={(e) => handlePitchChange(parseFloat(e.target.value))}
                className="w-full accent-indigo-600 cursor-pointer"
              />
              <div className="flex items-center justify-between text-[10px] text-slate-400 font-medium">
                <span>0.6x (ทุ้มลึก)</span>
                <span>1.0x (ปกติ)</span>
                <span>1.4x (แหลมใส)</span>
              </div>
            </div>

            {/* Speed / Rate (ความเร็ว) */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="font-extrabold text-slate-800 flex items-center gap-1">
                  <Gauge className="w-3.5 h-3.5 text-amber-500" />
                  <span>ความเร็วพื้นฐาน (Speed):</span>
                </span>
                <span className="font-mono font-bold text-amber-700 bg-white px-2 py-0.5 rounded-md border border-slate-200">
                  {activeRate.toFixed(1)}x
                </span>
              </div>
              <input
                type="range"
                min="0.6"
                max="1.3"
                step="0.1"
                value={activeRate}
                onChange={(e) => handleRateChange(parseFloat(e.target.value))}
                className="w-full accent-amber-500 cursor-pointer"
              />
              <div className="flex items-center justify-between text-[10px] text-slate-400 font-medium">
                <span>0.6x (ช้าชัด)</span>
                <span>1.0x (ปกติ)</span>
                <span>1.3x (คล่อง)</span>
              </div>
            </div>
          </div>

          {/* Section 3: Interactive Sound Test Bar */}
          <div className="space-y-2.5">
            <label className="text-xs font-extrabold text-slate-800 flex items-center gap-1.5">
              <Volume2 className="w-3.5 h-3.5 text-emerald-600" />
              <span>กดทดลองฟังเสียงที่ปรับแต่ง (Test Preview):</span>
            </label>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              {TEST_PHRASES.map((phrase, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handlePlayTest(idx, phrase.text)}
                  className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer touch-manipulation select-none active:scale-95 flex flex-col justify-between min-h-[64px] ${
                    isSpeaking && currentText === phrase.text
                      ? 'bg-rose-50 border-rose-400 ring-2 ring-rose-400/40 shadow-xs'
                      : 'bg-white hover:bg-slate-50 border-slate-200 shadow-2xs'
                  }`}
                >
                  <div className="flex items-center justify-between w-full">
                    <span className="text-[11px] font-bold text-slate-800">{phrase.label}</span>
                    <Play className={`w-3.5 h-3.5 ${isSpeaking && currentText === phrase.text ? 'text-rose-600 fill-rose-600 animate-pulse' : 'text-slate-400'}`} />
                  </div>
                  <div className="font-serif text-xs font-bold text-slate-900 mt-1 truncate">
                    {phrase.text}
                  </div>
                  <div className="text-[10px] text-slate-500 truncate mt-0.5">
                    {phrase.thai}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Helper Tips */}
          <div className="bg-amber-50/70 p-3 rounded-2xl border border-amber-200/80 text-[11px] text-amber-900 space-y-1">
            <p className="font-bold flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5 text-amber-600" />
              <span>เคล็ดลับสำหรับเสียงที่เป็นธรรมชาติที่สุด:</span>
            </p>
            <p className="text-amber-800 font-normal leading-relaxed">
              • บน <strong>iPhone / iPad:</strong> ไปที่ <em>Settings ➔ Accessibility ➔ Spoken Content ➔ Voices ➔ Chinese</em> เพื่อดาวน์โหลดเสียง <strong>Ting-Ting (Enhanced)</strong><br />
              • บน <strong>Chrome / Android:</strong> เลือก <strong>Google 普通话</strong> จะได้เสียงที่นุ่มนวลและเป็นธรรมชาติที่สุดครับ
            </p>
          </div>
        </div>

        {/* Modal Footer Controls */}
        <div className="mt-4 pt-3.5 border-t border-slate-100 flex items-center justify-between gap-3 relative z-10 shrink-0">
          <button
            type="button"
            onClick={handleResetDefaults}
            className="px-3.5 py-2 rounded-xl text-xs font-bold text-slate-600 hover:text-slate-900 hover:bg-slate-100 border border-slate-200 transition cursor-pointer flex items-center gap-1.5 active:scale-95"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>คืนค่าเริ่มต้น</span>
          </button>

          <button
            type="button"
            onClick={onClose}
            className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-rose-500 to-amber-500 hover:from-rose-600 hover:to-amber-600 text-white text-xs font-bold shadow-md shadow-rose-500/20 transition cursor-pointer active:scale-95"
          >
            <span>บันทึก & ใช้งานเสียงนี้ ✨</span>
          </button>
        </div>
      </div>
    </div>
  );
}
