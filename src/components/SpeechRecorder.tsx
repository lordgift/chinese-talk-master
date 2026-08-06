'use client';

import { useState, useEffect } from 'react';
import { Mic, MicOff, RefreshCw, CheckCircle2, Sparkles, AlertCircle, Award } from 'lucide-react';
import { useSpeechRecognition } from '@/hooks/useSpeechRecognition';
import { evaluateSpeechAccuracy } from '@/lib/pinyinUtils';
import confetti from 'canvas-confetti';

interface SpeechRecorderProps {
  targetHanzi: string;
  targetPinyin: string;
  onComplete: (score: number) => void;
}

export function SpeechRecorder({ targetHanzi, targetPinyin, onComplete }: SpeechRecorderProps) {
  const { isListening, transcript, error, isSupported, startListening, stopListening, setTranscript } =
    useSpeechRecognition();

  const [evaluation, setEvaluation] = useState<ReturnType<typeof evaluateSpeechAccuracy> | null>(null);
  const [hasTested, setHasTested] = useState(false);

  useEffect(() => {
    // Reset state when target changes
    setEvaluation(null);
    setHasTested(false);
    setTranscript('');
  }, [targetHanzi, setTranscript]);

  const handleToggleListening = () => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  };

  const handleEvaluate = () => {
    if (isListening) {
      stopListening();
    }
    const result = evaluateSpeechAccuracy(transcript, targetHanzi);
    setEvaluation(result);
    setHasTested(true);

    if (result.score >= 80) {
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.8 },
      });
    }

    onComplete(result.score);
  };

  const handleReset = () => {
    setTranscript('');
    setEvaluation(null);
    setHasTested(false);
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
            <h4 className="text-sm font-semibold text-white">โหมดฝึกออกเสียงผ่านไมโครโฟน</h4>
            <p className="text-xs text-slate-400">พูดประโยคภาษาจีนเพื่อรับการประเมินความแม่นยำ</p>
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
            <span>คะแนน: {evaluation.score}% (เกรด {evaluation.grade})</span>
          </div>
        )}
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
              🎙️ กำลังรับฟังเสียงพูดของคุณ... (กดปุ่มอีกครั้งเพื่อหยุด)
            </span>
          ) : (
            'แตะปุ่มไมโครโฟน แล้วเริ่มออกเสียงประโยคภาษาจีน'
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
          <p className="text-xs text-slate-400 mb-1">เสียงที่ระบบได้รับบันทึก:</p>
          <p className="text-sm font-semibold text-rose-300 font-serif">"{transcript}"</p>
        </div>
      )}

      {/* Actions & Evaluation Display */}
      <div className="mt-4 pt-3 border-t border-slate-800 flex flex-wrap items-center justify-between gap-3">
        {transcript && !hasTested && (
          <button
            onClick={handleEvaluate}
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/30 transition"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>ตรวจความถูกต้องของประโยค</span>
          </button>
        )}

        {hasTested && (
          <button
            onClick={handleReset}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium flex items-center gap-1.5 border border-slate-700 transition"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>ลองพูดใหม่อีกครั้ง</span>
          </button>
        )}
      </div>

      {/* Feedback Card */}
      {hasTested && evaluation && (
        <div
          className={`mt-4 p-4 rounded-xl border transition-all ${
            evaluation.score >= 80
              ? 'bg-emerald-950/30 border-emerald-800/40 text-emerald-200'
              : evaluation.score >= 60
              ? 'bg-amber-950/30 border-amber-800/40 text-amber-200'
              : 'bg-rose-950/30 border-rose-800/40 text-rose-200'
          }`}
        >
          <div className="flex items-center gap-2 font-bold text-sm mb-1">
            <Sparkles className="w-4 h-4" />
            <span>ผลการประเมินการออกเสียง</span>
          </div>
          <p className="text-xs leading-relaxed">{evaluation.feedbackMsg}</p>
        </div>
      )}
    </div>
  );
}
