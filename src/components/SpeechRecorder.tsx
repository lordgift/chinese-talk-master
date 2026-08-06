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
      <div className="p-4 bg-amber-950/30 border border-amber-800/40 rounded-xl text-xs text-amber-200 flex items-center gap-2">
        <AlertCircle className="w-4 h-4 text-amber-400 flex-shrink-0" />
        <span>
          เบราว์เซอร์ของคุณยังไม่รองรับ Web Speech Recognition โดยตรง คุณยังสามารถฝึกฟังเสียงตัวอย่างและตรวจเช็ค Pinyin ได้ตามปกติครับ
        </span>
      </div>
    );
  }

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 sm:p-6 shadow-xl text-white">
      <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-rose-500/20 text-rose-400 flex items-center justify-center border border-rose-500/30">
            <Mic className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-sm font-semibold text-white">โหมดฝึกออกเสียง & ตรวจสอบอัตโนมัติ</h4>
            <p className="text-xs text-slate-400">กดปุ่มไมค์เพื่อพูด (พูดจบระบบจะตรวจและแสดงผลให้อัตโนมัติ)</p>
          </div>
        </div>

        {hasTested && evaluation && (
          <div
            className={`px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1.5 border ${
              evaluation.score >= 85
                ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                : evaluation.score >= 60
                ? 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                : 'bg-rose-500/20 text-rose-300 border-rose-500/30'
            }`}
          >
            <Award className="w-3.5 h-3.5" />
            <span>คะแนนรวม: {evaluation.score}% (เกรด {evaluation.grade})</span>
          </div>
        )}
      </div>

      {/* Status Legend Bar */}
      <div className="mb-4 flex flex-wrap items-center gap-3 text-xs bg-slate-950/80 p-2.5 rounded-xl border border-slate-800/80">
        <span className="text-slate-400 font-medium">คำอธิบายสีออกเสียง:</span>
        <span className="px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-semibold flex items-center gap-1">
          🟢 เขียว: ถูกต้องชัดเจน
        </span>
        <span className="px-2 py-0.5 rounded-md bg-amber-500/20 text-amber-300 border border-amber-500/30 font-semibold flex items-center gap-1">
          🟡 เหลือง: ใกล้เคียง
        </span>
        <span className="px-2 py-0.5 rounded-md bg-rose-500/20 text-rose-300 border border-rose-500/30 font-semibold flex items-center gap-1">
          🔴 แดง: ออกเสียงไม่ชัด/พลาด
        </span>
      </div>

      {/* Target Preview */}
      <div className="mb-4 bg-slate-950/70 p-3 rounded-xl border border-slate-800/80">
        <p className="text-xs text-slate-400 mb-1 font-mono">ประโยคเป้าหมายที่ต้องพูด:</p>
        <p className="text-base font-bold text-amber-300 font-serif">{targetHanzi}</p>
        <p className="text-xs text-slate-300">{targetPinyin}</p>
      </div>

      {/* Mic Record Controls */}
      <div className="flex flex-col items-center justify-center gap-3 my-4">
        <button
          onClick={handleToggleListening}
          className={`relative w-20 h-20 rounded-full flex items-center justify-center transition-all duration-300 shadow-2xl ${
            isListening
              ? 'bg-rose-600 text-white scale-110 shadow-rose-600/50 animate-pulse'
              : 'bg-gradient-to-tr from-rose-500 to-amber-500 hover:from-rose-600 hover:to-amber-600 text-white shadow-rose-500/30 hover:scale-105'
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

        <p className="text-xs text-slate-300 font-medium">
          {isListening ? (
            <span className="text-rose-400 font-bold animate-pulse flex items-center gap-1">
              🎙️ กำลังรับฟังเสียงพูด... (พูดจบระบบจะตรวจและแสดงผลทันที)
            </span>
          ) : (
            'แตะปุ่มไมโครโฟน แล้วพูดประโยคภาษาจีน (กดไมค์ซ้ำเมื่อต้องการพูดใหม่)'
          )}
        </p>
      </div>

      {/* Error message */}
      {error && (
        <div className="my-3 p-3 bg-rose-950/40 border border-rose-800/50 rounded-xl text-xs text-rose-300 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 flex-shrink-0 text-rose-400" />
          <span>{error}</span>
        </div>
      )}

      {/* Speech Transcript Output */}
      {transcript && (
        <div className="my-3 p-3 bg-slate-950 rounded-xl border border-slate-800">
          <p className="text-xs text-slate-400 mb-1">เสียงที่ระบบได้รับบันทึกจากคุณ:</p>
          <p className="text-sm font-semibold text-rose-300 font-serif">"{transcript}"</p>
        </div>
      )}

      {/* DETAILED WORD-BY-WORD DIAGNOSTIC PANEL WITH GREEN/YELLOW/RED PILLS */}
      {hasTested && evaluation && (
        <div className="mt-5 pt-4 border-t border-slate-800/80 space-y-4">
          <div
            className={`p-4 rounded-xl border transition-all ${
              evaluation.score >= 80
                ? 'bg-emerald-950/30 border-emerald-800/40 text-emerald-200'
                : evaluation.score >= 60
                ? 'bg-amber-950/30 border-amber-800/40 text-amber-200'
                : 'bg-rose-950/30 border-rose-800/40 text-rose-200'
            }`}
          >
            <div className="flex items-center gap-2 font-bold text-sm mb-1">
              <Sparkles className="w-4 h-4" />
              <span>สรุปผลการประเมินการออกเสียง</span>
            </div>
            <p className="text-xs leading-relaxed">{evaluation.feedbackMsg}</p>
          </div>

          {/* Word & Character Color Pills Breakdown */}
          <div className="bg-slate-950/90 rounded-xl p-4 border border-slate-800">
            <h5 className="text-xs font-bold text-white mb-3 flex items-center justify-between">
              <span>🔍 ผลการไฮไลท์สีรายตัวอักษร/คำ (Character Color Diagnostic):</span>
              <span className="text-[11px] font-normal text-slate-400">
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
                    className={`flex flex-col items-center p-3 rounded-xl border transition-all shadow-md ${
                      isCorrect
                        ? 'bg-emerald-950/60 border-emerald-500 text-emerald-200 ring-1 ring-emerald-500/50 shadow-emerald-500/10'
                        : isPartial
                        ? 'bg-amber-950/60 border-amber-500 text-amber-200 ring-1 ring-amber-500/50 shadow-amber-500/10'
                        : 'bg-rose-950/60 border-rose-500 text-rose-200 ring-1 ring-rose-500/50 shadow-rose-500/10'
                    }`}
                  >
                    <div className="flex items-center gap-1 mb-1">
                      {isCorrect ? (
                        <span className="text-[10px] font-bold px-1.5 py-0.2 rounded-full bg-emerald-500 text-slate-950 flex items-center gap-0.5">
                          <CheckCircle2 className="w-3 h-3" /> 🟢 ถูกต้อง
                        </span>
                      ) : isPartial ? (
                        <span className="text-[10px] font-bold px-1.5 py-0.2 rounded-full bg-amber-500 text-slate-950 flex items-center gap-0.5">
                          <AlertTriangle className="w-3 h-3" /> 🟡 ใกล้เคียง
                        </span>
                      ) : (
                        <span className="text-[10px] font-bold px-1.5 py-0.2 rounded-full bg-rose-600 text-white flex items-center gap-0.5 animate-pulse">
                          <XCircle className="w-3 h-3" /> 🔴 พลาด
                        </span>
                      )}
                    </div>

                    <span className="text-xs font-semibold text-slate-300 mt-1">{we.word.pinyin}</span>
                    <span className="text-2xl font-bold font-serif my-1">{we.word.hanzi}</span>
                    <span className="text-[11px] text-slate-400 font-light">{we.word.thai}</span>

                    {!isCorrect && (
                      <button
                        onClick={() => handlePlayWord(we.word.hanzi)}
                        title="ฟังเสียงเฉพาะคำนี้ (ช้า 0.5x)"
                        className="mt-2.5 px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 text-[10px] font-semibold text-amber-300 border border-slate-700 flex items-center gap-1 transition shadow"
                      >
                        <Volume2 className="w-3.5 h-3.5 text-amber-400" />
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
