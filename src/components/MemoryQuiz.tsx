'use client';

import { useState } from 'react';
import { MemoryQuizQuestion } from '@/lib/pinyinUtils';
import {
  HelpCircle,
  Volume2,
  CheckCircle2,
  XCircle,
  Sparkles,
  RotateCcw,
  Trophy,
  ChevronRight,
  Brain,
} from 'lucide-react';
import { useSpeechSynthesis } from '@/hooks/useSpeechSynthesis';
import confetti from 'canvas-confetti';
import { playCelebrationSound } from '@/lib/celebrationSound';

interface MemoryQuizProps {
  questions: MemoryQuizQuestion[];
  onComplete: (score: number) => void;
  onRetry: () => void;
  onProceedToVocabSummary?: () => void;
}

export function MemoryQuiz({ 
  questions, 
  onComplete, 
  onRetry, 
  onProceedToVocabSummary 
}: MemoryQuizProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOptionIndex, setSelectedOptionIndex] = useState<number | null>(null);
  const [isAnswerSubmitted, setIsAnswerSubmitted] = useState(false);
  const [correctAnswersCount, setCorrectAnswersCount] = useState(0);
  const [isQuizFinished, setIsQuizFinished] = useState(false);

  const { speak } = useSpeechSynthesis();

  if (!questions || questions.length === 0) {
    return (
      <div className="bg-white p-6 rounded-3xl border border-slate-200 text-center">
        <p className="text-sm text-slate-500">ไม่มีแบบทดสอบสำหรับบทเรียนนี้</p>
      </div>
    );
  }

  const currentQ = questions[currentIndex];

  const handlePlayAudio = (text: string) => {
    speak(text, 0.85);
  };

  const handleSelectOption = (index: number) => {
    if (isAnswerSubmitted) return;
    setSelectedOptionIndex(index);
    setIsAnswerSubmitted(true);

    const isCorrect = currentQ.options[index].isCorrect;
    if (isCorrect) {
      setCorrectAnswersCount((prev) => prev + 1);
      if (typeof window !== 'undefined') {
        playCelebrationSound('correct');
        confetti({ particleCount: 40, spread: 60, origin: { y: 0.7 } });
      }
    }
  };

  const handleNextQuestion = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex((prev) => prev + 1);
      setSelectedOptionIndex(null);
      setIsAnswerSubmitted(false);
    } else {
      setIsQuizFinished(true);
      const finalScore = Math.round((correctAnswersCount / questions.length) * 100);
      onComplete(finalScore);
      if (typeof window !== 'undefined') {
        playCelebrationSound('complete');
        confetti({ particleCount: 70, spread: 80, origin: { y: 0.6 } });
      }
    }
  };

  const handleRestartQuiz = () => {
    setCurrentIndex(0);
    setSelectedOptionIndex(null);
    setIsAnswerSubmitted(false);
    setCorrectAnswersCount(0);
    setIsQuizFinished(false);
    onRetry();
  };

  const totalScorePercent = Math.round((correctAnswersCount / questions.length) * 100);

  return (
    <div className="bg-white border border-slate-200/90 rounded-3xl p-5 sm:p-8 shadow-xs space-y-6">
      {/* Quiz Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 pb-4">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-500 text-white flex items-center justify-center shadow-xs">
            <Brain className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-extrabold px-2.5 py-0.5 rounded-full bg-indigo-100 text-indigo-900 border border-indigo-300">
                ขั้นตอนที่ 3: ทดสอบความจำสั้นๆ
              </span>
              <span className="text-xs text-slate-500 font-semibold">
                ข้อที่ {currentIndex + 1} จาก {questions.length}
              </span>
            </div>
            <h3 className="text-base sm:text-lg font-black text-slate-900 mt-1">
              ทบทวนความจำและความเข้าใจ (Memory Retention Quiz)
            </h3>
          </div>
        </div>

        {/* Progress Pill */}
        <div className="flex items-center gap-1.5">
          {questions.map((_, qIdx) => (
            <span
              key={qIdx}
              className={`w-3 h-3 rounded-full transition-all ${
                qIdx === currentIndex
                  ? 'w-6 bg-indigo-600'
                  : qIdx < currentIndex
                  ? 'bg-emerald-500'
                  : 'bg-slate-200'
              }`}
            />
          ))}
        </div>
      </div>

      {!isQuizFinished ? (
        /* Active Question Display */
        <div className="space-y-6">
          {/* Question Box */}
          <div className="bg-slate-50 border border-slate-200/90 rounded-2xl p-5 sm:p-6 shadow-2xs space-y-4">
            <div className="flex items-start justify-between gap-3">
              <h4 className="text-base sm:text-lg font-bold text-slate-900">
                {currentQ.questionText}
              </h4>

              {currentQ.audioText && (
                <button
                  type="button"
                  onClick={() => handlePlayAudio(currentQ.audioText!)}
                  className="px-3.5 py-2 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-bold border border-indigo-200 shadow-2xs flex items-center gap-1.5 transition cursor-pointer active:scale-95 shrink-0"
                >
                  <Volume2 className="w-4 h-4 text-indigo-600 animate-pulse" />
                  <span>ฟังเสียงอีกครั้ง</span>
                </button>
              )}
            </div>

            {/* If audio listening type, show big listening card */}
            {currentQ.type === 'listen-meaning' && currentQ.promptZh && (
              <div className="p-4 rounded-xl bg-white border border-slate-200 text-center space-y-1">
                <span className="text-3xl font-bold text-slate-900 font-serif">
                  {currentQ.promptZh}
                </span>
                {currentQ.promptPinyin && (
                  <p className="text-xs font-pinyin text-rose-600 font-semibold">
                    {currentQ.promptPinyin}
                  </p>
                )}
              </div>
            )}

            {/* If fill-in blank type, show sentence prompt */}
            {currentQ.type === 'fill-blank' && currentQ.promptZh && (
              <div className="p-4 rounded-xl bg-white border border-slate-200 text-center space-y-1">
                <span className="text-xl sm:text-2xl font-bold text-slate-900 font-serif">
                  {currentQ.promptZh}
                </span>
                {currentQ.promptPinyin && (
                  <p className="text-xs font-pinyin text-rose-600 font-semibold">
                    {currentQ.promptPinyin}
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Options Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {currentQ.options.map((option, idx) => {
              const isSelected = selectedOptionIndex === idx;
              let btnStyle = 'bg-white hover:bg-slate-50 border-slate-200 text-slate-800';

              if (isAnswerSubmitted) {
                if (option.isCorrect) {
                  btnStyle = 'bg-emerald-50 border-emerald-400 text-emerald-900 ring-2 ring-emerald-400/40';
                } else if (isSelected && !option.isCorrect) {
                  btnStyle = 'bg-rose-50 border-rose-400 text-rose-900 ring-2 ring-rose-400/40';
                } else {
                  btnStyle = 'bg-slate-50 border-slate-200 text-slate-400 opacity-60';
                }
              }

              return (
                <button
                  key={idx}
                  type="button"
                  disabled={isAnswerSubmitted}
                  onClick={() => handleSelectOption(idx)}
                  className={`p-4 rounded-2xl border text-left font-medium text-xs sm:text-sm transition-all flex items-center justify-between gap-3 shadow-2xs ${btnStyle} ${
                    !isAnswerSubmitted ? 'cursor-pointer active:scale-95' : 'cursor-default'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <span className="w-6 h-6 rounded-full bg-slate-100 border border-slate-200 text-slate-600 text-xs font-bold flex items-center justify-center shrink-0">
                      {String.fromCharCode(65 + idx)}
                    </span>
                    <div>
                      <div>{option.text}</div>
                      {option.textZh && (
                        <div className="text-xs text-slate-500 font-serif mt-0.5">{option.textZh}</div>
                      )}
                    </div>
                  </div>

                  {isAnswerSubmitted && option.isCorrect && (
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                  )}
                  {isAnswerSubmitted && isSelected && !option.isCorrect && (
                    <XCircle className="w-5 h-5 text-rose-600 shrink-0" />
                  )}
                </button>
              );
            })}
          </div>

          {/* Explanation Banner */}
          {isAnswerSubmitted && (
            <div
              className={`p-4 rounded-2xl border text-xs sm:text-sm font-medium space-y-1 ${
                selectedOptionIndex !== null && currentQ.options[selectedOptionIndex].isCorrect
                  ? 'bg-emerald-50/80 border-emerald-300 text-emerald-900'
                  : 'bg-rose-50/80 border-rose-300 text-rose-900'
              }`}
            >
              <div className="font-bold flex items-center gap-1.5">
                {selectedOptionIndex !== null && currentQ.options[selectedOptionIndex].isCorrect ? (
                  <>
                    <Sparkles className="w-4 h-4 text-emerald-600" />
                    <span>คำตอบถูกต้อง! ยอดเยี่ยมมาก</span>
                  </>
                ) : (
                  <>
                    <HelpCircle className="w-4 h-4 text-rose-600" />
                    <span>ยังไม่ถูกต้องนะ มาดูเฉลยกันครับ</span>
                  </>
                )}
              </div>
              <p className="text-slate-700 text-xs">{currentQ.explanation}</p>
            </div>
          )}

          {/* Next Button */}
          {isAnswerSubmitted && (
            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={handleNextQuestion}
                className="px-6 py-3 rounded-2xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white text-xs sm:text-sm font-bold shadow-md shadow-indigo-500/20 flex items-center gap-2 transition cursor-pointer active:scale-95"
              >
                <span>
                  {currentIndex < questions.length - 1 ? 'ข้อถัดไป ➔' : 'ดูสรุปผลคะแนน 🏆'}
                </span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      ) : (
        /* Quiz Finished Summary Card */
        <div className="text-center py-6 space-y-5">
          <div className="w-20 h-20 mx-auto rounded-3xl bg-gradient-to-br from-amber-400 via-rose-500 to-purple-600 text-white flex items-center justify-center shadow-lg shadow-rose-500/20">
            <Trophy className="w-10 h-10" />
          </div>

          <div>
            <h4 className="text-2xl font-black text-slate-900">
              {totalScorePercent >= 80 ? '🎉 ยอดเยี่ยมมาก! จำได้แม่นยำ' : '👍 ทำได้ดีมาก! มาฝึกฝนบ่อยๆ กันนะ'}
            </h4>
            <p className="text-xs sm:text-sm text-slate-600 mt-1">
              คุณตอบถูกทั้งหมด{' '}
              <span className="font-bold text-emerald-600 text-base">{correctAnswersCount}</span>{' '}
              จาก {questions.length} ข้อ ({totalScorePercent}%)
            </p>
          </div>

          <div className="inline-flex items-center gap-2 p-3 rounded-2xl bg-slate-50 border border-slate-200 text-xs text-slate-700 font-semibold">
            <span>🧠 การทบทวนแบบสั้นๆ ช่วยให้สมองจำคำศัพท์และรูปประโยคได้ยาวนานขึ้น!</span>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3 pt-4">
            <button
              type="button"
              onClick={handleRestartQuiz}
              className="px-5 py-3 rounded-2xl bg-white hover:bg-slate-50 border border-slate-300 text-slate-700 text-xs sm:text-sm font-bold flex items-center gap-2 shadow-2xs transition cursor-pointer active:scale-95"
            >
              <RotateCcw className="w-4 h-4" />
              <span>ทำแบบทดสอบอีกครั้ง</span>
            </button>

            {onProceedToVocabSummary && (
              <button
                type="button"
                onClick={onProceedToVocabSummary}
                className="px-6 py-3 rounded-2xl bg-gradient-to-r from-amber-500 to-rose-500 hover:from-amber-600 hover:to-rose-600 text-white text-xs sm:text-sm font-bold shadow-md shadow-rose-500/20 flex items-center gap-2 transition cursor-pointer active:scale-95"
              >
                <span>ดูสรุปคำศัพท์ & บันทึกคำ ➔</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
