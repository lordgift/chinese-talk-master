'use client';

import { useState, useEffect } from 'react';
import { Mic, MicOff, Sparkles, AlertCircle, Award, Volume2, XCircle, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { useSpeechRecognition } from '@/hooks/useSpeechRecognition';
import { evaluateWordByWordPronunciation, DetailedSpeechEvaluation, WordBreakdown } from '@/lib/pinyinUtils';
import { useSpeechSynthesis } from '@/hooks/useSpeechSynthesis';
import confetti from 'canvas-confetti';

interface SpeechRecorderProps {
  targetHanzi: string;
  targetPinyin: string;
  words: WordBreakdown[];
  onComplete: (score: number, evaluationResult?: DetailedSpeechEvaluation) => void;
}

export function SpeechRecorder({ targetHanzi, targetPinyin, words, onComplete }: SpeechRecorderProps) {
  const { isListening, transcript, error, isSupported, startListening, stopListening, setTranscript } =
    useSpeechRecognition();
  const { speak } = useSpeechSynthesis();

  const [evaluation, setEvaluation] = useState<DetailedSpeechEvaluation | null>(null);
  const [hasTested, setHasTested] = useState(false);

  useEffect(() => {
    // Reset state when target changes
    setEvaluation(null);
    setHasTested(false);
    setTranscript('');
  }, [targetHanzi, setTranscript]);

  // Auto-evaluate immediately when user finishes speaking (mic turns off with transcript)
  useEffect(() => {
    if (!isListening && transcript && transcript.trim() !== '' && !hasTested) {
      const timer = setTimeout(() => {
        const result = evaluateWordByWordPronunciation(transcript, targetHanzi, words);
        setEvaluation(result);
        setHasTested(true);

        if (result.score >= 80) {
          confetti({
            particleCount: 50,
            spread: 60,
            origin: { y: 0.8 },
          });
        }

        onComplete(result.score, result);
      }, 200);

      return () => clearTimeout(timer);
    }
  }, [isListening, transcript, hasTested, targetHanzi, words, onComplete]);

  const handleToggleListening = () => {
    if (isListening) {
      stopListening();
    } else {
      setHasTested(false);
      setTranscript('');
      setEvaluation(null);
      startListening();
    }
  };

  const handlePlayWord = (wordHanzi: string) => {
    speak(wordHanzi, 0.5); // Play missed word slowly at 0.5x
  };

  if (!isSupported) {
    return (
      <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-900 flex items-center gap-2 font-medium">
        <AlertCircle className="w-4 h-4 text-amber-600 flex-shrink-0" />
        <span>
          เบราว์เซอร์ของคุณยังไม่รองรับ Web Speech Recognition โดยตรง คุณยังสามารถฝึกฟังเสียงตัวอย่างและตรวจเช็ค Pinyin ได้ตามปกติครับ
        </span>
      </div>
    );
  }

  return (
    <div className="bg-white border border-slate-200/90 rounded-2xl p-4 sm:p-6 shadow-sm text-slate-900">
      <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center border border-rose-200">
            <Mic className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-slate-900">โหมดฝึกออกเสียง & ตรวจสอบอัตโนมัติ</h4>
            <p className="text-xs text-slate-500">กดปุ่มไมค์เพื่อพูด (พูดจบระบบจะตรวจและแสดงผลให้อัตโนมัติ)</p>
          </div>
        </div>

        {hasTested && evaluation && (
          <div
            className={`px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1.5 border ${
              evaluation.score >= 85
                ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                : evaluation.score >= 60
                ? 'bg-amber-50 text-amber-800 border-amber-200'
                : 'bg-rose-50 text-rose-800 border-rose-200'
            }`}
          >
            <Award className="w-3.5 h-3.5" />
            <span>คะแนนรวม: {evaluation.score}% (เกรด {evaluation.grade})</span>
          </div>
        )}
      </div>

      {/* Target Preview */}
      <div className="mb-4 bg-slate-50 p-3 rounded-xl border border-slate-200">
        <p className="text-xs text-slate-500 mb-1 font-mono">ประโยคเป้าหมายที่ต้องพูด:</p>
        <p className="text-base font-bold text-slate-900 font-serif">{targetHanzi}</p>
        <p className="text-xs text-amber-800 font-bold">{targetPinyin}</p>
      </div>

      {/* Mic Record Controls */}
      <div className="flex flex-col items-center justify-center gap-3 my-4">
        <button
          onClick={handleToggleListening}
          className={`relative w-20 h-20 rounded-full flex items-center justify-center transition-all duration-300 shadow-lg ${
            isListening
              ? 'bg-rose-600 text-white scale-110 shadow-rose-600/40 animate-pulse'
              : 'bg-gradient-to-tr from-rose-500 to-amber-500 hover:from-rose-600 hover:to-amber-600 text-white shadow-rose-500/25 hover:scale-105'
          }`}
        >
          {isListening ? (
            <>
              <span className="absolute inset-0 rounded-full bg-rose-500 opacity-75 animate-ping" />
              <MicOff className="w-8 h-8 relative z-10" />
            </>
          ) : (
            <Mic className="w-8 h-8" />
          )}
        </button>

        <p className="text-xs text-slate-600 font-medium">
          {isListening ? (
            <span className="text-rose-600 font-bold animate-pulse flex items-center gap-1">
              🎙️ กำลังรับฟังเสียงพูด... (พูดจบระบบจะตรวจและแสดงผลทันที)
            </span>
          ) : (
            'แตะปุ่มไมโครโฟน แล้วพูดประโยคภาษาจีน (กดไมค์ซ้ำเมื่อต้องการพูดใหม่)'
          )}
        </p>
      </div>

      {/* Error message */}
      {error && (
        <div className="my-3 p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800 flex items-center gap-2 font-medium">
          <AlertCircle className="w-4 h-4 flex-shrink-0 text-rose-600" />
          <span>{error}</span>
        </div>
      )}

      {/* Speech Transcript Output */}
      {transcript && (
        <div className="my-3 p-3 bg-slate-50 rounded-xl border border-slate-200">
          <p className="text-xs text-slate-500 mb-1 font-medium">เสียงที่ระบบได้รับบันทึกจากคุณ:</p>
          <p className="text-sm font-bold text-rose-600 font-serif">"{transcript}"</p>
        </div>
      )}

      {/* DETAILED WORD-BY-WORD DIAGNOSTIC PANEL WITH GREEN/YELLOW/RED PILLS */}
      {hasTested && evaluation && (
        <div className="mt-5 pt-4 border-t border-slate-200 space-y-4">
          <div
            className={`p-4 rounded-xl border transition-all ${
              evaluation.score >= 80
                ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                : evaluation.score >= 60
                ? 'bg-amber-50 border-amber-200 text-amber-900'
                : 'bg-rose-50 border-rose-200 text-rose-900'
            }`}
          >
            <div className="flex items-center gap-2 font-bold text-sm mb-1">
              <Sparkles className="w-4 h-4" />
              <span>สรุปผลการประเมินการออกเสียง</span>
            </div>
            <p className="text-xs leading-relaxed font-medium">{evaluation.feedbackMsg}</p>
          </div>

          {/* Word & Character Color Pills Breakdown */}
          <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
            <h5 className="text-xs font-bold text-slate-900 mb-3 flex items-center justify-between">
              <span>🔍 ผลการไฮไลท์สีรายตัวอักษร/คำ (Character Color Diagnostic):</span>
              <span className="text-[11px] font-semibold text-slate-500">
                ถูกต้อง {evaluation.correctCount} / {evaluation.wordEvaluations.length} คำ
              </span>
            </h5>

            <div className="flex flex-wrap gap-2.5">
              {evaluation.wordEvaluations.map((we, idx) => {
                const isCorrect = we.status === 'correct';
                const isPartial = we.status === 'partial';

                return (
                  <div
                    key={idx}
                    className={`flex flex-col items-center p-3 rounded-xl border transition-all shadow-2xs ${
                      isCorrect
                        ? 'bg-emerald-50 border-emerald-400 text-emerald-900 ring-1 ring-emerald-400/50'
                        : isPartial
                        ? 'bg-amber-50 border-amber-400 text-amber-900 ring-1 ring-amber-400/50'
                        : 'bg-rose-50 border-rose-400 text-rose-900 ring-1 ring-rose-400/50'
                    }`}
                  >
                    <div className="flex items-center gap-1 mb-1">
                      {isCorrect ? (
                        <span className="text-[10px] font-bold px-1.5 py-0.2 rounded-full bg-emerald-600 text-white flex items-center gap-0.5">
                          <CheckCircle2 className="w-3 h-3" /> 🟢 ถูกต้อง
                        </span>
                      ) : isPartial ? (
                        <span className="text-[10px] font-bold px-1.5 py-0.2 rounded-full bg-amber-500 text-white flex items-center gap-0.5">
                          <AlertTriangle className="w-3 h-3" /> 🟡 ใกล้เคียง
                        </span>
                      ) : (
                        <span className="text-[10px] font-bold px-1.5 py-0.2 rounded-full bg-rose-600 text-white flex items-center gap-0.5 animate-pulse">
                          <XCircle className="w-3 h-3" /> 🔴 พลาด
                        </span>
                      )}
                    </div>

                    <span className="text-xs font-bold text-slate-700 mt-1">{we.word.pinyin}</span>
                    <span className="text-2xl font-bold font-serif my-1">{we.word.hanzi}</span>
                    <span className="text-[11px] text-slate-600 font-medium">{we.word.thai}</span>

                    {!isCorrect && (
                      <button
                        onClick={() => handlePlayWord(we.word.hanzi)}
                        title="ฟังเสียงเฉพาะคำนี้ (ช้า 0.5x)"
                        className="mt-2.5 px-2.5 py-1 rounded-lg bg-white hover:bg-slate-100 text-[10px] font-bold text-amber-800 border border-slate-200 flex items-center gap-1 transition shadow-2xs"
                      >
                        <Volume2 className="w-3.5 h-3.5 text-amber-600" />
                        <span>ฟังเสียงคำนี้</span>
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
