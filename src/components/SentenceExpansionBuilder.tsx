'use client';

import { useState } from 'react';
import { SentenceExpansion } from '@/lib/pinyinUtils';
import {
  Volume2,
  Mic,
  Puzzle,
  RotateCcw,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  ChevronRight,
  ChevronLeft,
  Lightbulb,
  Delete,
} from 'lucide-react';
import { useSpeechSynthesis } from '@/hooks/useSpeechSynthesis';
import { useSpeechRecognition } from '@/hooks/useSpeechRecognition';
import confetti from 'canvas-confetti';

interface SentenceExpansionBuilderProps {
  expansions: SentenceExpansion[];
  onProceedToDialogue: () => void;
}

export function SentenceExpansionBuilder({
  expansions,
  onProceedToDialogue,
}: SentenceExpansionBuilderProps) {
  const [activeExpIndex, setActiveExpIndex] = useState(0);
  const [selectedWordIndices, setSelectedWordIndices] = useState<number[]>([]);
  const [isAssemblyCorrect, setIsAssemblyCorrect] = useState<boolean | null>(null);
  const [showHint, setShowHint] = useState(false);

  const { speak } = useSpeechSynthesis();
  const { isListening, transcript, startListening, stopListening } = useSpeechRecognition();
  const [isMicTesting, setIsMicTesting] = useState(false);
  const [speechSuccess, setSpeechSuccess] = useState<boolean | null>(null);

  const currentExpansion = expansions[activeExpIndex];

  if (!currentExpansion) {
    return (
      <div className="bg-white p-6 rounded-3xl border border-slate-200 text-center">
        <p className="text-sm text-slate-500">ไม่มีข้อมูลการเรียงประโยคในบทนี้</p>
        <button
          type="button"
          onClick={onProceedToDialogue}
          className="mt-4 px-6 py-2.5 rounded-xl bg-rose-500 text-white text-xs font-bold"
        >
          ไปฝึกบทสนทนา ➔
        </button>
      </div>
    );
  }

  // Scrambled word pool
  const puzzleWords =
    currentExpansion.scrambledWords && currentExpansion.scrambledWords.length > 0
      ? currentExpansion.scrambledWords
      : [{ hanzi: currentExpansion.targetHanzi, pinyin: currentExpansion.targetPinyin, thai: currentExpansion.targetThai }];

  const handleSelectPuzzleWord = (idx: number) => {
    if (selectedWordIndices.includes(idx)) {
      // Remove word if already selected
      const nextIndices = selectedWordIndices.filter((i) => i !== idx);
      setSelectedWordIndices(nextIndices);
      setIsAssemblyCorrect(null);
    } else {
      const nextIndices = [...selectedWordIndices, idx];
      setSelectedWordIndices(nextIndices);

      // Check if assembled sentence matches target
      const assembledHanzi = nextIndices.map((i) => puzzleWords[i].hanzi).join('');
      const cleanTarget = currentExpansion.targetHanzi.replace(/[^\u4e00-\u9fa5a-zA-Z0-9]/g, '');
      const cleanAssembled = assembledHanzi.replace(/[^\u4e00-\u9fa5a-zA-Z0-9]/g, '');

      if (cleanAssembled === cleanTarget) {
        setIsAssemblyCorrect(true);
        speak(currentExpansion.targetHanzi, 0.85);
        if (typeof window !== 'undefined') {
          confetti({ particleCount: 60, spread: 70, origin: { y: 0.7 } });
        }
      } else if (nextIndices.length === puzzleWords.length) {
        setIsAssemblyCorrect(false);
      }
    }
  };

  const handleRemoveLastWord = () => {
    if (selectedWordIndices.length > 0) {
      setSelectedWordIndices((prev) => prev.slice(0, -1));
      setIsAssemblyCorrect(null);
    }
  };

  const handleResetPuzzle = () => {
    setSelectedWordIndices([]);
    setIsAssemblyCorrect(null);
    setSpeechSuccess(null);
    setIsMicTesting(false);
  };

  const handleMicTest = () => {
    if (isListening) {
      stopListening();
      setIsMicTesting(true);
      const cleanRecognized = (transcript || '').replace(/[^\u4e00-\u9fa5]/g, '');
      const cleanTarget = currentExpansion.targetHanzi.replace(/[^\u4e00-\u9fa5]/g, '');
      const isMatch =
        cleanRecognized.length > 0 &&
        (cleanRecognized.includes(cleanTarget) || cleanTarget.includes(cleanRecognized));
      setSpeechSuccess(isMatch);
      if (isMatch && typeof window !== 'undefined') {
        confetti({ particleCount: 40, spread: 60, origin: { y: 0.75 } });
      }
    } else {
      setIsMicTesting(true);
      setSpeechSuccess(null);
      startListening();
    }
  };

  const handleNextExpansion = () => {
    if (activeExpIndex < expansions.length - 1) {
      setActiveExpIndex((prev) => prev + 1);
      setSelectedWordIndices([]);
      setIsAssemblyCorrect(null);
      setShowHint(false);
      setSpeechSuccess(null);
      setIsMicTesting(false);
    } else {
      onProceedToDialogue();
    }
  };

  const handlePrevExpansion = () => {
    if (activeExpIndex > 0) {
      setActiveExpIndex((prev) => prev - 1);
      setSelectedWordIndices([]);
      setIsAssemblyCorrect(null);
      setShowHint(false);
      setSpeechSuccess(null);
      setIsMicTesting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white border border-slate-200/90 rounded-3xl p-5 sm:p-7 shadow-xs">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-amber-500 to-rose-500 text-white flex items-center justify-center shadow-xs">
              <Puzzle className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-extrabold px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-900 border border-amber-300">
                  ขั้นตอนที่ 2: เรียงคำเป็นประโยค
                </span>
                <span className="text-xs text-slate-500 font-semibold">
                  ประโยคที่ {activeExpIndex + 1} จาก {expansions.length}
                </span>
              </div>
              <h3 className="text-base sm:text-lg font-black text-slate-900 mt-1">
                🧩 ลองเรียงคำเป็นประโยคให้ถูกต้อง
              </h3>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setShowHint(!showHint)}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold border transition cursor-pointer flex items-center gap-1.5 active:scale-95 ${
                showHint
                  ? 'bg-amber-100 text-amber-900 border-amber-300 shadow-2xs'
                  : 'bg-white hover:bg-slate-50 text-slate-700 border-slate-200'
              }`}
            >
              <Lightbulb className="w-3.5 h-3.5 text-amber-600" />
              <span>{showHint ? 'ซ่อนคำใบ้' : '💡 ดูคำใบ้'}</span>
            </button>
          </div>
        </div>

        {/* Target Meaning & Prompt Card */}
        <div className="mt-5 p-5 rounded-2xl bg-gradient-to-r from-amber-50/80 via-rose-50/60 to-indigo-50/60 border border-amber-200/80 space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="space-y-1">
              <div className="text-[11px] font-bold text-amber-900 uppercase tracking-wide flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                <span>ประโยคภาษาไทยที่ต้องการสร้าง:</span>
              </div>
              <div className="text-lg sm:text-xl font-black text-slate-900">
                &quot;{currentExpansion.targetThai}&quot;
              </div>
              {currentExpansion.scenarioContext && (
                <p className="text-xs text-slate-600 font-medium">
                  บริบท: {currentExpansion.scenarioContext}
                </p>
              )}
            </div>

            <button
              type="button"
              onClick={() => speak(currentExpansion.targetHanzi, 0.8)}
              className="px-4 py-2.5 rounded-xl bg-white hover:bg-slate-100 text-slate-800 text-xs font-bold border border-slate-200 shadow-2xs flex items-center gap-1.5 transition cursor-pointer active:scale-95 shrink-0"
              title="ฟังเสียงประโยคต้นแบบ"
            >
              <Volume2 className="w-4 h-4 text-rose-500" />
              <span>ฟังเสียงประโยค 🔊</span>
            </button>
          </div>

          {/* Hint Pinyin Drawer */}
          {showHint && (
            <div className="pt-3 border-t border-amber-200/70 text-xs flex flex-wrap items-center gap-2">
              <span className="font-bold text-amber-900">💡 คำใบ้ Pinyin:</span>
              <span className="font-pinyin font-extrabold text-rose-600 text-sm">
                {currentExpansion.targetPinyin}
              </span>
            </div>
          )}
        </div>

        {/* Interactive Word Assembly Workspace */}
        <div className="mt-6 p-5 sm:p-7 bg-slate-50/90 rounded-3xl border border-slate-200 space-y-6">
          <div className="flex items-center justify-between">
            <h4 className="text-xs sm:text-sm font-bold text-slate-900 flex items-center gap-2">
              <span>👇 แตะเลือกบล็อกคำศัพท์ด้านล่าง เพื่อเรียงเป็นประโยค:</span>
            </h4>

            {selectedWordIndices.length > 0 && (
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleRemoveLastWord}
                  className="px-3 py-1.5 rounded-lg bg-white border border-slate-200 text-slate-600 hover:text-slate-900 text-xs font-semibold flex items-center gap-1 cursor-pointer transition shadow-2xs hover:bg-slate-100"
                  title="ลบคำล่าสุด"
                >
                  <Delete className="w-3.5 h-3.5 text-slate-500" />
                  <span>ลบคำล่าสุด</span>
                </button>
                <button
                  type="button"
                  onClick={handleResetPuzzle}
                  className="px-3 py-1.5 rounded-lg bg-white border border-slate-200 text-slate-600 hover:text-rose-600 text-xs font-semibold flex items-center gap-1 cursor-pointer transition shadow-2xs hover:bg-slate-100"
                  title="เริ่มใหม่ทั้งหมด"
                >
                  <RotateCcw className="w-3.5 h-3.5 text-slate-500" />
                  <span>เริ่มใหม่</span>
                </button>
              </div>
            )}
          </div>

          {/* Assembled Sentence Slot Box */}
          <div
            className={`min-h-[84px] p-4 sm:p-5 rounded-2xl border-2 transition-all flex flex-wrap items-center gap-2.5 justify-center shadow-inner ${
              isAssemblyCorrect === true
                ? 'bg-emerald-50/60 border-emerald-400'
                : isAssemblyCorrect === false
                ? 'bg-rose-50/40 border-rose-300'
                : selectedWordIndices.length > 0
                ? 'bg-white border-amber-300 ring-2 ring-amber-200/50'
                : 'bg-white border-dashed border-slate-300'
            }`}
          >
            {selectedWordIndices.length === 0 ? (
              <span className="text-xs sm:text-sm text-slate-400 font-medium italic">
                (แตะเลือกบล็อกคำศัพท์ด้านล่างตามลำดับที่ถูกต้อง)
              </span>
            ) : (
              selectedWordIndices.map((idx, pos) => {
                const word = puzzleWords[idx];
                return (
                  <button
                    key={`${idx}-${pos}`}
                    type="button"
                    onClick={() => handleSelectPuzzleWord(idx)}
                    className="px-4 py-2.5 rounded-2xl bg-gradient-to-r from-amber-500 to-rose-500 text-white font-serif font-bold text-lg shadow-md hover:scale-105 transition cursor-pointer active:scale-95 flex flex-col items-center group relative"
                    title="แตะเพื่อนำคำนี้ออก"
                  >
                    <span className="text-lg leading-tight tracking-wide">{word.hanzi}</span>
                    <span className="text-[11px] font-pinyin font-semibold opacity-95">
                      {word.pinyin}
                    </span>
                    <span className="absolute -top-1 -right-1 w-4 h-4 bg-white/90 text-slate-700 rounded-full text-[10px] font-black flex items-center justify-center opacity-0 group-hover:opacity-100 transition shadow-xs">
                      ✕
                    </span>
                  </button>
                );
              })
            )}
          </div>

          {/* Scrambled Word Bank */}
          <div className="space-y-2.5">
            <span className="text-xs font-bold text-slate-600">คำศัพท์สำหรับเลือก:</span>
            <div className="flex flex-wrap items-center gap-2.5 justify-center">
              {puzzleWords.map((word, idx) => {
                const isSelected = selectedWordIndices.includes(idx);
                return (
                  <button
                    key={idx}
                    type="button"
                    disabled={isSelected}
                    onClick={() => handleSelectPuzzleWord(idx)}
                    className={`px-4 py-3 rounded-2xl border transition-all cursor-pointer touch-manipulation select-none text-center ${
                      isSelected
                        ? 'opacity-25 bg-slate-200 border-slate-300 cursor-not-allowed scale-95'
                        : 'bg-white hover:bg-amber-50/80 border-slate-300 hover:border-amber-400 shadow-2xs hover:shadow-md active:scale-95'
                    }`}
                  >
                    <div className="text-xl font-black text-slate-900 font-serif tracking-wide">
                      {word.hanzi}
                    </div>
                    <div className="text-xs font-pinyin font-bold text-rose-600 mt-0.5">
                      {word.pinyin}
                    </div>
                    <div className="text-[11px] text-slate-500 font-medium">{word.thai}</div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Result Feedback Banner */}
          {isAssemblyCorrect !== null && (
            <div
              className={`p-4 sm:p-5 rounded-2xl border text-xs sm:text-sm font-bold transition-all ${
                isAssemblyCorrect
                  ? 'bg-emerald-50 border-emerald-300 text-emerald-900 shadow-xs space-y-3'
                  : 'bg-rose-50 border-rose-300 text-rose-900 flex items-center justify-between gap-3'
              }`}
            >
              {isAssemblyCorrect ? (
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="w-6 h-6 text-emerald-600 shrink-0 mt-0.5" />
                    <div>
                      <div className="text-sm sm:text-base font-black text-emerald-900">
                        🎉 ถูกต้องยอดเยี่ยม! เรียงประโยคได้ถูกต้อง 100%
                      </div>
                      <div className="flex flex-wrap items-baseline gap-2 mt-1">
                        <span className="text-lg font-black text-slate-900 font-serif">
                          {currentExpansion.targetHanzi}
                        </span>
                        <span className="text-sm font-pinyin font-extrabold text-rose-600">
                          ({currentExpansion.targetPinyin})
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {/* Speak Test on Assembled Sentence */}
                    <button
                      type="button"
                      onClick={handleMicTest}
                      className={`px-3.5 py-2 rounded-xl text-xs font-bold border shadow-2xs flex items-center gap-1.5 transition cursor-pointer active:scale-95 ${
                        isListening
                          ? 'bg-rose-600 text-white border-rose-700 animate-pulse'
                          : 'bg-white hover:bg-rose-50 text-rose-700 border-rose-200'
                      }`}
                      title="ฝึกออกเสียงประโยคนี้"
                    >
                      <Mic className="w-4 h-4" />
                      <span>{isListening ? 'กำลังฟัง...' : '🎙️ ฝึกพูดประโยคนี้'}</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => speak(currentExpansion.targetHanzi, 0.85)}
                      className="px-3.5 py-2 rounded-xl bg-white hover:bg-slate-100 text-slate-800 text-xs font-bold border border-slate-200 shadow-2xs flex items-center gap-1.5 transition cursor-pointer active:scale-95"
                    >
                      <Volume2 className="w-4 h-4 text-emerald-600" />
                      <span>ฟังอีกครั้ง</span>
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="flex items-center gap-2">
                    <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
                    <div>
                      <div>ยังเรียงลำดับคำไม่ถูกต้อง</div>
                      <div className="text-xs text-rose-700 font-normal mt-0.5">
                        แตะที่คำในกล่องเพื่อนำออก หรือกด &quot;เริ่มใหม่&quot; แล้วลองอีกครั้งนะ
                      </div>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={handleResetPuzzle}
                    className="px-3.5 py-2 rounded-xl bg-white border border-rose-300 text-rose-800 text-xs font-bold flex items-center gap-1 shadow-2xs hover:bg-rose-100 cursor-pointer shrink-0"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>เริ่มใหม่</span>
                  </button>
                </>
              )}

              {/* Mic feedback if tested */}
              {isMicTesting && speechSuccess !== null && (
                <div
                  className={`mt-2 p-2.5 rounded-xl border text-xs font-bold flex items-center gap-2 ${
                    speechSuccess
                      ? 'bg-emerald-100/70 border-emerald-300 text-emerald-900'
                      : 'bg-amber-100/70 border-amber-300 text-amber-900'
                  }`}
                >
                  {speechSuccess ? (
                    <>
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      <span>🎉 ยอดเยี่ยม! ออกเสียงประโยคนี้ได้ชัดเจนมาก</span>
                    </>
                  ) : (
                    <>
                      <AlertCircle className="w-4 h-4 text-amber-600" />
                      <span>
                        💡 ใกล้เคียงแล้ว ได้ยินเป็น &quot;{transcript}&quot; ลองกดฟังเสียงอีกครั้งนะ
                      </span>
                    </>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Bottom Pagination & Navigation */}
        <div className="mt-8 pt-6 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
          <button
            type="button"
            onClick={handlePrevExpansion}
            disabled={activeExpIndex === 0}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold border flex items-center gap-1.5 transition ${
              activeExpIndex === 0
                ? 'opacity-40 bg-slate-100 border-slate-200 text-slate-400 cursor-not-allowed'
                : 'bg-white hover:bg-slate-50 border-slate-200 text-slate-700 shadow-2xs cursor-pointer active:scale-95'
            }`}
          >
            <ChevronLeft className="w-4 h-4" />
            <span>ประโยคก่อนหน้า</span>
          </button>

          <div className="flex items-center gap-1.5">
            {expansions.map((_, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => {
                  setActiveExpIndex(idx);
                  setSelectedWordIndices([]);
                  setIsAssemblyCorrect(null);
                  setShowHint(false);
                  setSpeechSuccess(null);
                  setIsMicTesting(false);
                }}
                className={`h-2.5 rounded-full transition-all cursor-pointer ${
                  idx === activeExpIndex
                    ? 'w-6 bg-gradient-to-r from-amber-500 to-rose-500'
                    : 'w-2.5 bg-slate-200 hover:bg-slate-300'
                }`}
                title={`ไปที่ประโยค ${idx + 1}`}
              />
            ))}
          </div>

          <button
            type="button"
            onClick={handleNextExpansion}
            className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-rose-500 to-amber-500 hover:from-rose-600 hover:to-amber-600 text-white text-xs sm:text-sm font-bold shadow-md shadow-rose-500/20 flex items-center gap-2 transition cursor-pointer active:scale-95"
          >
            <span>
              {activeExpIndex < expansions.length - 1
                ? 'ประโยคถัดไป ➔'
                : 'ไปฝึกบทบาทสนทนาจริง 💬'}
            </span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
