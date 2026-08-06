'use client';

import { useState } from 'react';
import { WordBreakdown, getToneColorClass } from '@/lib/pinyinUtils';
import { Volume2, BookOpen, Mic, CheckCircle2, Sparkles } from 'lucide-react';
import { useSpeechSynthesis } from '@/hooks/useSpeechSynthesis';
import { useSpeechRecognition } from '@/hooks/useSpeechRecognition';

interface VocabPrepProps {
  words: WordBreakdown[];
  onStartDialogue: () => void;
}

export function VocabPrep({ words, onStartDialogue }: VocabPrepProps) {
  const [activeWordIndex, setActiveWordIndex] = useState(0);
  const { speak } = useSpeechSynthesis();
  const { isListening, transcript, startListening, stopListening } = useSpeechRecognition();
  const [wordScores, setWordScores] = useState<Record<number, boolean>>({});

  // Deduplicate words list by Hanzi
  const uniqueWords = words.filter(
    (w, idx, self) => self.findIndex((item) => item.hanzi === w.hanzi) === idx
  );

  const currentWord = uniqueWords[activeWordIndex];

  const handlePlayWord = (word: WordBreakdown) => {
    speak(word.hanzi, 0.75);
  };

  const handleTestWord = () => {
    if (isListening) {
      stopListening();
      const cleanRecognized = (transcript || '').replace(/[^\u4e00-\u9fa5]/g, '');
      const cleanWord = currentWord.hanzi.replace(/[^\u4e00-\u9fa5]/g, '');
      const isMatched = cleanRecognized.includes(cleanWord);
      setWordScores((prev) => ({ ...prev, [activeWordIndex]: isMatched }));
    } else {
      startListening();
    }
  };

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-5 sm:p-8 shadow-2xl text-white">
      {/* Title */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center border border-amber-500/30">
            <BookOpen className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              ขั้นตอนที่ 1: เรียนรู้คำศัพท์พื้นฐานประจำบทนี้
              <span className="text-xs px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 font-normal">
                {uniqueWords.length} คำศัพท์
              </span>
            </h3>
            <p className="text-xs text-slate-400">
              ฟังเสียงและทำความเข้าใจความหมายทีละคำ ก่อนเริ่มฝึกสนทนาทั้งประโยค
            </p>
          </div>
        </div>

        <button
          onClick={onStartDialogue}
          className="px-4 py-2 rounded-xl bg-gradient-to-r from-rose-500 to-amber-500 hover:from-rose-600 hover:to-amber-600 text-white text-xs font-bold shadow-lg shadow-rose-500/25 transition"
        >
          <span>พร้อมแล้ว ไปฝึกบทสนทนา 💬</span>
        </button>
      </div>

      {/* Main Flashcard Display */}
      {currentWord && (
        <div className="bg-slate-950/90 border border-slate-800 rounded-2xl p-6 mb-6 text-center relative overflow-hidden">
          <div className="absolute top-3 right-3 text-xs text-slate-500 font-mono">
            คำที่ {activeWordIndex + 1} / {uniqueWords.length}
          </div>

          {/* Tone badges */}
          <div className="flex items-center justify-center gap-1 mb-2">
            {currentWord.tones?.map((t, idx) => {
              const toneStyle = getToneColorClass(t);
              return (
                <span
                  key={idx}
                  className={`text-[10px] px-2 py-0.5 rounded-md border font-semibold ${toneStyle.bg} ${toneStyle.text} ${toneStyle.border}`}
                >
                  วรรณยุกต์ Tone {t}
                </span>
              );
            })}
          </div>

          {/* Pinyin */}
          <p className="text-lg font-bold text-amber-400 tracking-wide font-sans mb-1">
            {currentWord.pinyin}
          </p>

          {/* Hanzi */}
          <h2 className="text-5xl font-black text-white tracking-widest font-serif my-3">
            {currentWord.hanzi}
          </h2>

          {/* Thai Meaning */}
          <div className="inline-block px-4 py-1.5 rounded-full bg-slate-900 border border-slate-800 text-sm font-medium text-slate-200">
            คำแปล: <span className="text-amber-300 font-bold">{currentWord.thai}</span>
          </div>

          {/* Audio & Mic practice controls */}
          <div className="flex flex-wrap items-center justify-center gap-3 mt-6">
            <button
              onClick={() => handlePlayWord(currentWord)}
              className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold flex items-center gap-2 border border-slate-700 shadow-md transition"
            >
              <Volume2 className="w-4 h-4 text-rose-400" />
              <span>ฟังเสียงอ่าน (0.75x)</span>
            </button>

            <button
              onClick={handleTestWord}
              className={`px-5 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 shadow-md transition ${
                isListening
                  ? 'bg-rose-600 text-white animate-pulse shadow-rose-600/40'
                  : 'bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/30'
              }`}
            >
              <Mic className="w-4 h-4 text-rose-400" />
              <span>{isListening ? 'กำลังรับฟังเสียงคำนี้...' : 'ลองฝึกออกเสียงคำนี้'}</span>
            </button>
          </div>

          {transcript && (
            <p className="mt-3 text-xs text-rose-300 font-serif">เสียงที่ฟังได้: "{transcript}"</p>
          )}

          {wordScores[activeWordIndex] !== undefined && (
            <div
              className={`mt-4 p-3 rounded-xl border text-xs font-semibold inline-flex items-center gap-2 ${
                wordScores[activeWordIndex]
                  ? 'bg-emerald-950/40 border-emerald-500 text-emerald-300'
                  : 'bg-amber-950/40 border-amber-500 text-amber-300'
              }`}
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>
                {wordScores[activeWordIndex]
                  ? '🎉 ถูกต้อง! คุณออกเสียงคำนี้ได้ชัดเจน'
                  : '💡 ใกล้เคียงแล้ว ลองเปิดฟังเสียงอ่านแล้วฝึกใหม่อีกครั้งครับ'}
              </span>
            </div>
          )}
        </div>
      )}

      {/* Vocabulary Grid List */}
      <h4 className="text-xs font-bold text-slate-300 mb-3 flex items-center gap-1.5">
        <Sparkles className="w-4 h-4 text-amber-400" />
        รายการคำศัพท์ทั้งหมดในบทเรียนนี้ (คลิกเพื่อดูและฝึกฟังทีละคำ):
      </h4>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5">
        {uniqueWords.map((word, idx) => {
          const isActive = idx === activeWordIndex;
          return (
            <button
              key={idx}
              onClick={() => {
                setActiveWordIndex(idx);
                handlePlayWord(word);
              }}
              className={`p-3 rounded-xl border text-left transition-all ${
                isActive
                  ? 'bg-amber-500/20 border-amber-400 ring-2 ring-amber-400/50 scale-[1.02]'
                  : 'bg-slate-950/60 border-slate-800 hover:bg-slate-800/60 hover:border-slate-700'
              }`}
            >
              <div className="flex items-center justify-between text-xs text-amber-300/90 font-medium">
                <span>{word.pinyin}</span>
                <Volume2 className="w-3.5 h-3.5 text-slate-500 group-hover:text-amber-400" />
              </div>

              <div className="text-xl font-bold text-white font-serif my-1">{word.hanzi}</div>
              <div className="text-xs text-slate-400 font-light truncate">{word.thai}</div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
