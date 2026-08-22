'use client';

import { useState } from 'react';
import { SentenceExpansion, SentenceExpansionStep } from '@/lib/pinyinUtils';
import {
  Volume2,
  Mic,
  Layers,
  ArrowRight,
  Sparkles,
  RotateCcw,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Puzzle,
  PlayCircle,
  ChevronRight,
  ChevronLeft,
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
  const [activeStepIndex, setActiveStepIndex] = useState(0);
  const [activeTab, setActiveTab] = useState<'ladder' | 'puzzle'>('ladder');

  // Interactive Puzzle Assembly State
  const [selectedWordIndices, setSelectedWordIndices] = useState<number[]>([]);
  const [isAssemblyCorrect, setIsAssemblyCorrect] = useState<boolean | null>(null);

  const { speak } = useSpeechSynthesis();
  const { isListening, transcript, startListening, stopListening } = useSpeechRecognition();
  const [testedStepIndex, setTestedStepIndex] = useState<number | null>(null);
  const [stepSpeechSuccess, setStepSpeechSuccess] = useState<boolean | null>(null);

  const currentExpansion = expansions[activeExpIndex];

  if (!currentExpansion) {
    return (
      <div className="bg-white p-6 rounded-3xl border border-slate-200 text-center">
        <p className="text-sm text-slate-500">ไม่มีข้อมูลการต่อประโยคในบทนี้</p>
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

  const steps = currentExpansion.steps;

  // Play audio for specific chunk/step
  const handlePlayChunk = (step: SentenceExpansionStep, rate = 0.8) => {
    speak(step.hanzi, rate);
  };

  // Mic speech test for current chunk
  const handleMicTest = (stepIdx: number, step: SentenceExpansionStep) => {
    if (isListening) {
      stopListening();
      setTestedStepIndex(stepIdx);
      const cleanRecognized = (transcript || '').replace(/[^\u4e00-\u9fa5]/g, '');
      const cleanTarget = step.hanzi.replace(/[^\u4e00-\u9fa5]/g, '');
      const isMatch = cleanRecognized.includes(cleanTarget) || cleanTarget.includes(cleanRecognized);
      setStepSpeechSuccess(isMatch);
      if (isMatch && typeof window !== 'undefined') {
        confetti({ particleCount: 30, spread: 60, origin: { y: 0.8 } });
      }
    } else {
      setTestedStepIndex(stepIdx);
      setStepSpeechSuccess(null);
      startListening();
    }
  };

  // Puzzle / Assembly Handling
  const puzzleWords = currentExpansion.scrambledWords || [];

  const handleSelectPuzzleWord = (idx: number) => {
    if (selectedWordIndices.includes(idx)) {
      // Remove word
      setSelectedWordIndices((prev) => prev.filter((i) => i !== idx));
      setIsAssemblyCorrect(null);
    } else {
      const nextIndices = [...selectedWordIndices, idx];
      setSelectedWordIndices(nextIndices);

      // Check if assembled sentence matches target
      const assembledHanzi = nextIndices.map((i) => puzzleWords[i].hanzi).join('');
      const cleanTarget = currentExpansion.targetHanzi.replace(/[^\u4e00-\u9fa5]/g, '');
      const cleanAssembled = assembledHanzi.replace(/[^\u4e00-\u9fa5]/g, '');

      if (cleanAssembled === cleanTarget) {
        setIsAssemblyCorrect(true);
        speak(currentExpansion.targetHanzi);
        if (typeof window !== 'undefined') {
          confetti({ particleCount: 60, spread: 70, origin: { y: 0.7 } });
        }
      } else if (nextIndices.length === puzzleWords.length) {
        setIsAssemblyCorrect(false);
      }
    }
  };

  const handleResetPuzzle = () => {
    setSelectedWordIndices([]);
    setIsAssemblyCorrect(null);
  };

  const handleNextExpansion = () => {
    if (activeExpIndex < expansions.length - 1) {
      setActiveExpIndex((prev) => prev + 1);
      setActiveStepIndex(0);
      setSelectedWordIndices([]);
      setIsAssemblyCorrect(null);
      setTestedStepIndex(null);
      setStepSpeechSuccess(null);
    } else {
      onProceedToDialogue();
    }
  };

  const handlePrevExpansion = () => {
    if (activeExpIndex > 0) {
      setActiveExpIndex((prev) => prev - 1);
      setActiveStepIndex(0);
      setSelectedWordIndices([]);
      setIsAssemblyCorrect(null);
      setTestedStepIndex(null);
      setStepSpeechSuccess(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white border border-slate-200/90 rounded-3xl p-5 sm:p-7 shadow-xs">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-amber-500 to-rose-500 text-white flex items-center justify-center shadow-xs">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-extrabold px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-900 border border-amber-300">
                  ขั้นตอนที่ 2: ต่อประโยคทีละขั้น
                </span>
                <span className="text-xs text-slate-500 font-semibold">
                  ประโยคเป้าหมายที่ {activeExpIndex + 1} จาก {expansions.length}
                </span>
              </div>
              <h3 className="text-base sm:text-lg font-black text-slate-900 mt-1">
                เรียนรู้แบบขั้นบันได: จากศัพท์สั้นสู่ประโยคสมบูรณ์
              </h3>
            </div>
          </div>

          {/* Toggle Mode: Ladder vs Assembly Puzzle */}
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-2xl border border-slate-200">
            <button
              type="button"
              onClick={() => setActiveTab('ladder')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'ladder'
                  ? 'bg-white text-slate-900 shadow-2xs'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <Layers className="w-3.5 h-3.5 text-amber-600" />
              <span>ขั้นบันไดคำศัพท์</span>
            </button>
            {puzzleWords.length > 0 && (
              <button
                type="button"
                onClick={() => setActiveTab('puzzle')}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-1.5 ${
                  activeTab === 'puzzle'
                    ? 'bg-gradient-to-r from-amber-500 to-rose-500 text-white shadow-2xs'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                <Puzzle className="w-3.5 h-3.5" />
                <span>🧩 ลองเรียงคำเป็นประโยค</span>
              </button>
            )}
          </div>
        </div>

        {/* Target Sentence Summary Card */}
        <div className="mt-4 p-4 rounded-2xl bg-gradient-to-r from-amber-50/70 via-rose-50/50 to-indigo-50/60 border border-amber-200/80 flex flex-wrap items-center justify-between gap-3">
          <div>
            <div className="text-[11px] font-bold text-amber-900 uppercase tracking-wide flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-amber-600" />
              <span>ประโยคเป้าหมายที่ต้องจำให้ได้:</span>
            </div>
            <div className="flex flex-wrap items-baseline gap-2 mt-1">
              <h4 className="text-xl sm:text-2xl font-black text-slate-900 font-serif tracking-wide">
                {currentExpansion.targetHanzi}
              </h4>
              <span className="text-sm font-pinyin font-extrabold text-rose-600">
                ({currentExpansion.targetPinyin})
              </span>
            </div>
            <p className="text-xs text-slate-700 font-medium mt-0.5">
              ความหมาย: <span className="font-bold text-slate-900">&quot;{currentExpansion.targetThai}&quot;</span>
            </p>
          </div>

          <button
            type="button"
            onClick={() => speak(currentExpansion.targetHanzi, 0.85)}
            className="px-4 py-2 rounded-xl bg-white hover:bg-slate-100 text-slate-800 text-xs font-bold border border-slate-200 shadow-2xs flex items-center gap-1.5 transition cursor-pointer active:scale-95 min-h-[40px]"
          >
            <Volume2 className="w-4 h-4 text-rose-500" />
            <span>ฟังประโยคเต็ม</span>
          </button>
        </div>

        {/* Main Content Area */}
        {activeTab === 'ladder' ? (
          /* Progressive Step Ladder View */
          <div className="mt-6 space-y-4">
            <div className="flex items-center justify-between text-xs text-slate-500 font-semibold px-1">
              <span>👇 กดฟังเสียงและฝึกพูดทีละขั้นบันได (ค่อยๆ ขยายประโยค):</span>
              <span>
                ขั้นที่ {activeStepIndex + 1} จาก {steps.length} ขั้น
              </span>
            </div>

            <div className="space-y-3">
              {steps.map((step, sIdx) => {
                const isActive = sIdx === activeStepIndex;
                const isFinal = sIdx === steps.length - 1;
                const isTested = testedStepIndex === sIdx;

                return (
                  <div
                    key={sIdx}
                    onClick={() => {
                      setActiveStepIndex(sIdx);
                      handlePlayChunk(step);
                    }}
                    className={`rounded-2xl p-4 sm:p-5 border transition-all cursor-pointer touch-manipulation select-none active:scale-[0.99] ${
                      isActive
                        ? isFinal
                          ? 'bg-gradient-to-r from-emerald-50 to-teal-50 border-emerald-400 ring-2 ring-emerald-400/40 shadow-sm'
                          : 'bg-gradient-to-r from-amber-50 to-rose-50 border-amber-400 ring-2 ring-amber-400/40 shadow-sm'
                        : 'bg-slate-50/70 border-slate-200 hover:bg-slate-100/70 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      {/* Left: Step Badge & Hanzi/Pinyin */}
                      <div className="flex items-start gap-3">
                        <span
                          className={`w-7 h-7 rounded-xl flex items-center justify-center text-xs font-black shrink-0 mt-0.5 ${
                            isActive
                              ? isFinal
                                ? 'bg-emerald-600 text-white shadow-2xs'
                                : 'bg-amber-500 text-white shadow-2xs'
                              : 'bg-slate-200 text-slate-700'
                          }`}
                        >
                          {sIdx + 1}
                        </span>

                        <div>
                          {/* Step Tag */}
                          <div className="flex items-center gap-2 mb-1">
                            <span
                              className={`text-[10px] font-extrabold px-2 py-0.5 rounded-md ${
                                isFinal
                                  ? 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                                  : sIdx === 0
                                  ? 'bg-amber-100 text-amber-900 border border-amber-300'
                                  : 'bg-sky-100 text-sky-900 border border-sky-300'
                              }`}
                            >
                              {sIdx === 0
                                ? '🎯 1. คำศัพท์หลัก'
                                : isFinal
                                ? '🏆 รวมเป็นประโยคสมบูรณ์'
                                : `➕ เติมส่วนขยายขั้นที่ ${sIdx + 1}`}
                            </span>

                            {step.addedPart && sIdx > 0 && (
                              <span className="text-[10px] font-semibold text-rose-600 bg-rose-50 px-2 py-0.5 rounded-md border border-rose-200">
                                คำที่เติมเพิ่ม: &quot;{step.addedPart}&quot;
                              </span>
                            )}
                          </div>

                          {/* Hanzi */}
                          <h5
                            className={`text-2xl sm:text-3xl font-black font-serif tracking-wider ${
                              isActive ? 'text-slate-900' : 'text-slate-700'
                            }`}
                          >
                            {step.hanzi}
                          </h5>

                          {/* Pinyin */}
                          <p className="text-sm font-pinyin font-extrabold text-amber-800 mt-0.5">
                            {step.pinyin}
                          </p>

                          {/* Thai Meaning */}
                          <p className="text-xs text-slate-600 font-medium mt-1">
                            แปลว่า: <span className="text-slate-900 font-bold">&quot;{step.thai}&quot;</span>
                          </p>

                          {step.explanation && (
                            <p className="text-[11px] text-slate-500 mt-1 italic flex items-center gap-1">
                              <HelpCircle className="w-3 h-3 text-slate-400" />
                              <span>{step.explanation}</span>
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Right: Audio Play & Mic Test Buttons */}
                      <div className="flex items-center gap-2 self-center sm:self-auto shrink-0">
                        {/* Audio Listen */}
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handlePlayChunk(step, 0.75);
                          }}
                          className="px-3.5 py-2.5 rounded-xl bg-white hover:bg-slate-100 text-slate-800 text-xs font-bold border border-slate-200 shadow-2xs flex items-center gap-1.5 transition cursor-pointer active:scale-95"
                          title="ฟังเสียงท่อนนี้ (ช้า 0.75x)"
                        >
                          <Volume2 className="w-4 h-4 text-rose-500" />
                          <span className="hidden sm:inline">ฟังเสียงสั้น (0.75x)</span>
                          <span className="sm:hidden">ฟัง</span>
                        </button>

                        {/* Mic Speech Test for Chunk */}
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleMicTest(sIdx, step);
                          }}
                          className={`px-3.5 py-2.5 rounded-xl text-xs font-bold border shadow-2xs flex items-center gap-1.5 transition cursor-pointer active:scale-95 ${
                            isListening && testedStepIndex === sIdx
                              ? 'bg-rose-600 text-white border-rose-700 animate-pulse'
                              : 'bg-rose-50 hover:bg-rose-100 text-rose-700 border-rose-200'
                          }`}
                          title="ฝึกออกเสียงท่อนสั้นนี้"
                        >
                          <Mic className="w-4 h-4" />
                          <span className="hidden sm:inline">
                            {isListening && testedStepIndex === sIdx
                              ? 'กำลังฟัง...'
                              : 'ฝึกพูดท่อนนี้'}
                          </span>
                        </button>
                      </div>
                    </div>

                    {/* Feedback if user spoke this step */}
                    {isTested && stepSpeechSuccess !== null && (
                      <div
                        className={`mt-3 p-2.5 rounded-xl border text-xs font-bold flex items-center gap-2 ${
                          stepSpeechSuccess
                            ? 'bg-emerald-50 border-emerald-300 text-emerald-800'
                            : 'bg-amber-50 border-amber-300 text-amber-800'
                        }`}
                      >
                        {stepSpeechSuccess ? (
                          <>
                            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                            <span>🎉 ยอดเยี่ยม! ออกเสียงท่อนสั้นนี้ได้ชัดเจนมาก</span>
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
                );
              })}
            </div>
          </div>
        ) : (
          /* Interactive Word Assembly Puzzle Mode */
          <div className="mt-6 p-5 sm:p-6 bg-slate-50/80 rounded-2xl border border-slate-200/90 space-y-6">
            <div>
              <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Puzzle className="w-4 h-4 text-amber-600" />
                <span>แตะที่กล่องคำศัพท์ด้านล่าง เพื่อเรียงต่อเป็นประโยคที่ถูกต้อง:</span>
              </h4>
              <p className="text-xs text-slate-500 mt-0.5">
                ประโยคภาษาไทยที่ต้องการ: <span className="font-bold text-slate-800">&quot;{currentExpansion.targetThai}&quot;</span>
              </p>
            </div>

            {/* Assembled Sentence Slot Box */}
            <div className="min-h-[70px] p-4 rounded-2xl bg-white border-2 border-dashed border-slate-300 flex flex-wrap items-center gap-2 justify-center shadow-inner">
              {selectedWordIndices.length === 0 ? (
                <span className="text-xs text-slate-400 italic">
                  (กดเลือกบล็อกคำศัพท์ด้านล่างตามลำดับที่ถูกต้อง)
                </span>
              ) : (
                selectedWordIndices.map((idx) => {
                  const word = puzzleWords[idx];
                  return (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handleSelectPuzzleWord(idx)}
                      className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-rose-500 text-white font-serif font-bold text-lg shadow-sm hover:scale-105 transition cursor-pointer active:scale-95 flex flex-col items-center"
                    >
                      <span className="text-base">{word.hanzi}</span>
                      <span className="text-[10px] font-pinyin opacity-90">{word.pinyin}</span>
                    </button>
                  );
                })
              )}
            </div>

            {/* Scrambled Word Pool */}
            <div className="space-y-2">
              <span className="text-xs font-bold text-slate-600">คำศัพท์สำหรับเลือก:</span>
              <div className="flex flex-wrap items-center gap-2 justify-center">
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
                          ? 'opacity-30 bg-slate-200 border-slate-300 cursor-not-allowed scale-95'
                          : 'bg-white hover:bg-amber-50 border-slate-300 hover:border-amber-400 shadow-2xs hover:shadow-md active:scale-95'
                      }`}
                    >
                      <div className="text-xl font-black text-slate-900 font-serif">{word.hanzi}</div>
                      <div className="text-xs font-pinyin font-bold text-rose-600">{word.pinyin}</div>
                      <div className="text-[11px] text-slate-500">{word.thai}</div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Puzzle Result Feedback */}
            {isAssemblyCorrect !== null && (
              <div
                className={`p-4 rounded-2xl border text-xs sm:text-sm font-bold flex items-center justify-between gap-3 ${
                  isAssemblyCorrect
                    ? 'bg-emerald-50 border-emerald-300 text-emerald-900 shadow-xs'
                    : 'bg-rose-50 border-rose-300 text-rose-900'
                }`}
              >
                <div className="flex items-center gap-2">
                  {isAssemblyCorrect ? (
                    <>
                      <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                      <div>
                        <div>🎉 ถูกต้องยอดเยี่ยม! เรียงประโยคได้ถูกต้อง 100%</div>
                        <div className="text-xs text-emerald-700 font-normal mt-0.5">
                          {currentExpansion.targetHanzi} ({currentExpansion.targetPinyin})
                        </div>
                      </div>
                    </>
                  ) : (
                    <>
                      <AlertCircle className="w-5 h-5 text-rose-600" />
                      <div>
                        <div>ยังเรียงลำดับคำไม่ถูกต้อง ลองกดรีเซ็ตแล้วเรียงใหม่อีกครั้งนะครับ</div>
                      </div>
                    </>
                  )}
                </div>

                <button
                  type="button"
                  onClick={handleResetPuzzle}
                  className="px-3.5 py-2 rounded-xl bg-white border border-slate-300 text-slate-700 text-xs font-bold flex items-center gap-1 shadow-2xs hover:bg-slate-50 cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>เริ่มใหม่</span>
                </button>
              </div>
            )}
          </div>
        )}

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
                  setActiveStepIndex(0);
                  setSelectedWordIndices([]);
                  setIsAssemblyCorrect(null);
                }}
                className={`w-2.5 h-2.5 rounded-full transition-all cursor-pointer ${
                  idx === activeExpIndex
                    ? 'w-6 bg-gradient-to-r from-amber-500 to-rose-500'
                    : 'bg-slate-200 hover:bg-slate-300'
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
