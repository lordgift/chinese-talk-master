'use client';

import { useState } from 'react';
import Link from 'next/link';
import { WordBreakdown, getToneColorClass } from '@/lib/pinyinUtils';
import {
  Volume2,
  BookOpen,
  Mic,
  CheckCircle2,
  Sparkles,
  Eye,
  EyeOff,
  ChevronRight,
  ChevronLeft,
  Star,
  RotateCcw,
  ArrowLeft,
} from 'lucide-react';
import { useSpeechSynthesis } from '@/hooks/useSpeechSynthesis';
import { useSpeechRecognition } from '@/hooks/useSpeechRecognition';
import { useAuth } from '@/context/AuthContext';
import confetti from 'canvas-confetti';

interface VocabPrepProps {
  words: WordBreakdown[];
  coreKeywords?: WordBreakdown[];
  scenarioId?: string;
  scenarioTitle?: string;
  onStartExpansion?: () => void;
  onStartDialogue: () => void;
  onRetryLesson?: () => void;
}

export function VocabPrep({
  words,
  coreKeywords,
  scenarioId,
  scenarioTitle,
  onStartExpansion,
  onStartDialogue,
  onRetryLesson,
}: VocabPrepProps) {
  const [activeWordIndex, setActiveWordIndex] = useState(0);
  const [hidePinyin, setHidePinyin] = useState(false);
  const [hideThai, setHideThai] = useState(false);
  const [isRevealed, setIsRevealed] = useState(false);
  const [filterMode, setFilterMode] = useState<'all' | 'saved' | 'core'>('all');

  const { speak, isSpeaking, currentText } = useSpeechSynthesis();
  const { isListening, transcript, startListening, stopListening } = useSpeechRecognition();
  const { isWordSaved, toggleSaveWord } = useAuth();
  const [wordScores, setWordScores] = useState<Record<number, boolean>>({});

  // Deduplicate words list by Hanzi
  const uniqueAllWords = words.filter(
    (w, idx, self) => self.findIndex((item) => item.hanzi === w.hanzi) === idx
  );

  const savedWordsList = uniqueAllWords.filter((w) => isWordSaved(w.hanzi));

  const displayedWords =
    filterMode === 'saved'
      ? savedWordsList
      : filterMode === 'core' && coreKeywords && coreKeywords.length > 0
      ? coreKeywords
      : uniqueAllWords;

  const currentWord = displayedWords[activeWordIndex] || displayedWords[0];

  const handlePlayWord = (word: WordBreakdown, rate = 0.75) => {
    speak(word.hanzi, rate);
  };

  const handleToggleBookmark = async (word: WordBreakdown) => {
    const isNowSaved = await toggleSaveWord({
      hanzi: word.hanzi,
      pinyin: word.pinyin,
      thai: word.thai,
      tones: word.tones,
      scenarioId,
      scenarioTitle,
    });

    if (isNowSaved && typeof window !== 'undefined') {
      confetti({ particleCount: 30, spread: 50, origin: { y: 0.8 } });
    }
  };

  const handleTestWord = () => {
    if (isListening) {
      stopListening();
      const cleanRecognized = (transcript || '').replace(/[^\u4e00-\u9fa5]/g, '');
      const cleanWord = currentWord?.hanzi ? currentWord.hanzi.replace(/[^\u4e00-\u9fa5]/g, '') : '';
      const isMatched = cleanRecognized.includes(cleanWord) || cleanWord.includes(cleanRecognized);
      setWordScores((prev) => ({ ...prev, [activeWordIndex]: isMatched }));
      if (isMatched && typeof window !== 'undefined') {
        confetti({ particleCount: 25, spread: 60, origin: { y: 0.8 } });
      }
    } else {
      startListening();
    }
  };

  const handleNextWord = () => {
    if (activeWordIndex < displayedWords.length - 1) {
      setActiveWordIndex((prev) => prev + 1);
      setIsRevealed(false);
    }
  };

  const handlePrevWord = () => {
    if (activeWordIndex > 0) {
      setActiveWordIndex((prev) => prev - 1);
      setIsRevealed(false);
    }
  };

  return (
    <div className="bg-white border border-slate-200/90 rounded-3xl p-5 sm:p-8 shadow-xs text-slate-900 space-y-6">
      {/* Top Header Banner */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 pb-4">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center border border-amber-200 shadow-2xs">
            <BookOpen className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-extrabold px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-900 border border-amber-300">
                ขั้นตอนที่ 4: สรุปคำศัพท์ท้ายบทเรียน
              </span>
              <span className="text-xs px-2 py-0.5 rounded-full bg-rose-50 text-rose-700 border border-rose-200 font-bold">
                {uniqueAllWords.length} คำศัพท์
              </span>
              {savedWordsList.length > 0 && (
                <span className="text-xs px-2 py-0.5 rounded-full bg-amber-500 text-white font-bold flex items-center gap-1 shadow-2xs">
                  <Star className="w-3 h-3 fill-white" /> บันทึกแล้ว {savedWordsList.length} คำ
                </span>
              )}
            </div>
            <h3 className="text-base sm:text-lg font-black text-slate-900 mt-1">
              สรุปคำศัพท์ประจำบทเรียน & บันทึกคำศัพท์ที่ต้องการ
            </h3>
          </div>
        </div>

        {/* Memory Flashcard Toggles */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            type="button"
            onClick={() => setHidePinyin(!hidePinyin)}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition cursor-pointer flex items-center gap-1.5 ${
              hidePinyin
                ? 'bg-rose-50 border-rose-300 text-rose-700 shadow-2xs'
                : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
            title="ซ่อน Pinyin เพื่อฝึกจำตัวอักษรจีน"
          >
            {hidePinyin ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
            <span>{hidePinyin ? 'ซ่อนพินอินอยู่' : 'ซ่อนพินอิน (ทายใจ)'}</span>
          </button>

          <button
            type="button"
            onClick={() => setHideThai(!hideThai)}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition cursor-pointer flex items-center gap-1.5 ${
              hideThai
                ? 'bg-rose-50 border-rose-300 text-rose-700 shadow-2xs'
                : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
            title="ซ่อนคำแปลไทยเพื่อทดสอบความจำ"
          >
            {hideThai ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
            <span>{hideThai ? 'ซ่อนคำแปลอยู่' : 'ซ่อนคำแปล (ทายความหมาย)'}</span>
          </button>
        </div>
      </div>

      {/* Main Interactive Flashcard Card */}
      {currentWord ? (
        <div className="bg-gradient-to-b from-slate-50 to-amber-50/20 border border-slate-200/90 rounded-3xl p-6 sm:p-8 text-center relative overflow-hidden shadow-2xs">
          {/* Top Word Controls: Counter + Bookmark Star Button */}
          <div className="flex items-center justify-between">
            <button
              type="button"
              onClick={() => handleToggleBookmark(currentWord)}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-bold transition cursor-pointer active:scale-95 ${
                isWordSaved(currentWord.hanzi)
                  ? 'bg-amber-500 text-white border-amber-600 shadow-xs'
                  : 'bg-white hover:bg-amber-50 text-slate-600 hover:text-amber-700 border-slate-200'
              }`}
              title="บันทึกคำนี้ลงคลังคำศัพท์ส่วนตัว"
            >
              <Star
                className={`w-4 h-4 ${
                  isWordSaved(currentWord.hanzi) ? 'fill-white text-white' : 'text-amber-500'
                }`}
              />
              <span>{isWordSaved(currentWord.hanzi) ? 'บันทึกแล้ว ⭐' : 'บันทึกคำนี้'}</span>
            </button>

            <div className="text-xs text-slate-400 font-mono font-bold">
              คำที่ {activeWordIndex + 1} / {displayedWords.length}
            </div>
          </div>

          {/* Tone badges */}
          <div className="flex items-center justify-center gap-1.5 mt-2 mb-2">
            {currentWord.tones?.map((t, idx) => {
              const toneStyle = getToneColorClass(t);
              return (
                <span
                  key={idx}
                  className={`text-xs px-2.5 py-0.5 rounded-md border font-bold ${toneStyle.bg} ${toneStyle.text} ${toneStyle.border}`}
                >
                  วรรณยุกต์ Tone {t}
                </span>
              );
            })}
          </div>

          {/* Large Pinyin Display or Mask */}
          <div className="my-2 min-h-[36px] flex items-center justify-center">
            {hidePinyin && !isRevealed ? (
              <button
                type="button"
                onClick={() => setIsRevealed(true)}
                className="px-4 py-1.5 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-600 text-xs font-bold transition cursor-pointer"
              >
                👀 แตะเพื่อเปิดดู Pinyin
              </button>
            ) : (
              <p className="text-2xl sm:text-3xl font-extrabold text-rose-600 font-pinyin tracking-wide">
                {currentWord.pinyin}
              </p>
            )}
          </div>

          {/* Big Hanzi */}
          <h2 className="text-5xl sm:text-7xl font-black text-slate-900 tracking-wider font-serif my-4">
            {currentWord.hanzi}
          </h2>

          {/* Thai Meaning Display or Mask */}
          <div className="my-2 min-h-[40px] flex items-center justify-center">
            {hideThai && !isRevealed ? (
              <button
                type="button"
                onClick={() => setIsRevealed(true)}
                className="px-4 py-1.5 rounded-xl bg-amber-100 hover:bg-amber-200 text-amber-900 text-xs font-bold transition cursor-pointer"
              >
                🔍 แตะเพื่อเฉลยความหมายไทย
              </button>
            ) : (
              <div className="inline-block px-5 py-2 rounded-full bg-white border border-slate-200 text-sm sm:text-base font-medium text-slate-700 shadow-2xs">
                คำแปล: <span className="text-amber-800 font-bold">{currentWord.thai}</span>
              </div>
            )}
          </div>

          {/* Controls: Audio Slow/Normal & Mic Speech Practice */}
          <div className="flex flex-wrap items-center justify-center gap-3 mt-6">
            <button
              type="button"
              onClick={() => handlePlayWord(currentWord, 0.75)}
              className="px-5 py-3 rounded-xl bg-white hover:bg-slate-100 text-slate-800 text-xs sm:text-sm font-bold flex items-center gap-2 border border-slate-200 shadow-2xs transition cursor-pointer active:scale-95 min-h-[44px]"
            >
              <Volume2 className="w-4 h-4 text-rose-500" />
              <span>ฟังเสียงอ่าน (0.75x)</span>
            </button>

            <button
              type="button"
              onClick={() => handlePlayWord(currentWord, 1.0)}
              className="px-4 py-3 rounded-xl bg-white hover:bg-slate-100 text-slate-600 text-xs font-bold flex items-center gap-1.5 border border-slate-200 shadow-2xs transition cursor-pointer active:scale-95 min-h-[44px]"
            >
              <Volume2 className="w-3.5 h-3.5 text-slate-500" />
              <span>ความเร็วปกติ (1.0x)</span>
            </button>

            <button
              type="button"
              onClick={handleTestWord}
              className={`px-5 py-3 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 shadow-2xs transition cursor-pointer active:scale-95 min-h-[44px] ${
                isListening
                  ? 'bg-rose-600 text-white animate-pulse shadow-rose-600/30'
                  : 'bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200'
              }`}
            >
              <Mic className="w-4 h-4" />
              <span>{isListening ? 'กำลังรับฟังเสียงคำนี้...' : 'ลองฝึกออกเสียงคำนี้'}</span>
            </button>
          </div>

          {transcript && (
            <p className="mt-3 text-xs text-rose-700 font-serif font-medium">
              เสียงที่ได้ยิน: &quot;{transcript}&quot;
            </p>
          )}

          {wordScores[activeWordIndex] !== undefined && (
            <div
              className={`mt-4 p-3 rounded-xl border text-xs font-bold inline-flex items-center gap-2 ${
                wordScores[activeWordIndex]
                  ? 'bg-emerald-50 border-emerald-300 text-emerald-800'
                  : 'bg-amber-50 border-amber-300 text-amber-800'
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

          {/* Flashcard Next/Prev Controls */}
          <div className="flex items-center justify-between gap-4 mt-6 pt-4 border-t border-slate-200/60">
            <button
              type="button"
              onClick={handlePrevWord}
              disabled={activeWordIndex === 0}
              className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1 border transition ${
                activeWordIndex === 0
                  ? 'opacity-40 bg-slate-100 border-slate-200 text-slate-400 cursor-not-allowed'
                  : 'bg-white hover:bg-slate-50 border-slate-200 text-slate-700 shadow-2xs cursor-pointer active:scale-95'
              }`}
            >
              <ChevronLeft className="w-4 h-4" />
              <span>คำก่อนหน้า</span>
            </button>

            <span className="text-xs text-slate-500 font-medium">
              คำที่ {activeWordIndex + 1} จาก {displayedWords.length}
            </span>

            <button
              type="button"
              onClick={handleNextWord}
              disabled={activeWordIndex === displayedWords.length - 1}
              className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1 border transition ${
                activeWordIndex === displayedWords.length - 1
                  ? 'opacity-40 bg-slate-100 border-slate-200 text-slate-400 cursor-not-allowed'
                  : 'bg-white hover:bg-slate-50 border-slate-200 text-slate-700 shadow-2xs cursor-pointer active:scale-95'
              }`}
            >
              <span>คำถัดไป</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      ) : (
        <div className="py-12 text-center text-slate-400 bg-slate-50 rounded-3xl border border-dashed border-slate-200">
          <p className="text-sm font-bold text-slate-600">ไม่มีคำศัพท์ในหมวดหมู่นี้</p>
          <p className="text-xs text-slate-400 mt-1">แตะปุ่มด้านล่างเพื่อแสดงคำศัพท์ทั้งหมด</p>
          <button
            type="button"
            onClick={() => setFilterMode('all')}
            className="mt-3 px-4 py-2 bg-amber-500 text-white rounded-xl text-xs font-bold"
          >
            แสดงคำศัพท์ทั้งหมด
          </button>
        </div>
      )}

      {/* Vocabulary Grid List */}
      <div className="space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h4 className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-amber-600" />
            <span>คลังคำศัพท์ทั้งหมดในบทเรียน (แตะ ⭐ เพื่อบันทึกคำศัพท์):</span>
          </h4>

          <div className="flex items-center gap-1 text-xs">
            <button
              type="button"
              onClick={() => {
                setFilterMode('all');
                setActiveWordIndex(0);
              }}
              className={`px-2.5 py-1 rounded-lg font-bold transition cursor-pointer ${
                filterMode === 'all'
                  ? 'bg-slate-900 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              ทั้งหมด ({uniqueAllWords.length})
            </button>

            {savedWordsList.length > 0 && (
              <button
                type="button"
                onClick={() => {
                  setFilterMode('saved');
                  setActiveWordIndex(0);
                }}
                className={`px-2.5 py-1 rounded-lg font-bold transition cursor-pointer flex items-center gap-1 ${
                  filterMode === 'saved'
                    ? 'bg-amber-500 text-white'
                    : 'bg-amber-50 text-amber-800 hover:bg-amber-100 border border-amber-200'
                }`}
              >
                <Star className="w-3 h-3 fill-current" />
                <span>บันทึกไว้ ({savedWordsList.length})</span>
              </button>
            )}

            {coreKeywords && coreKeywords.length > 0 && (
              <button
                type="button"
                onClick={() => {
                  setFilterMode('core');
                  setActiveWordIndex(0);
                }}
                className={`px-2.5 py-1 rounded-lg font-bold transition cursor-pointer ${
                  filterMode === 'core'
                    ? 'bg-rose-500 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                คำกุญแจ ({coreKeywords.length})
              </button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5">
          {displayedWords.map((word, idx) => {
            const isActive = idx === activeWordIndex;
            const isSaved = isWordSaved(word.hanzi);
            const isPlayingThis = isSpeaking && currentText === word.hanzi;

            return (
              <div
                key={idx}
                className={`p-3.5 rounded-2xl border text-left transition-all relative group flex flex-col justify-between ${
                  isActive
                    ? 'bg-amber-50 border-amber-400 ring-2 ring-amber-400/50 shadow-xs'
                    : 'bg-slate-50/90 border-slate-200 hover:bg-amber-50/40 hover:border-amber-300'
                }`}
              >
                {/* Header: Pinyin & Star toggle */}
                <div className="flex items-center justify-between text-xs text-amber-800 font-bold mb-1">
                  <span className="font-pinyin text-sm font-extrabold">{word.pinyin}</span>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleToggleBookmark(word);
                    }}
                    className={`p-1 rounded-full transition cursor-pointer hover:scale-110 active:scale-90 ${
                      isSaved
                        ? 'text-amber-500'
                        : 'text-slate-300 hover:text-amber-500'
                    }`}
                    title={isSaved ? 'นำออกจากคำศัพท์ที่บันทึก' : 'บันทึกคำนี้'}
                  >
                    <Star className={`w-4 h-4 ${isSaved ? 'fill-amber-500' : ''}`} />
                  </button>
                </div>

                {/* Hanzi */}
                <div
                  onClick={() => {
                    setActiveWordIndex(idx);
                    setIsRevealed(false);
                    handlePlayWord(word, 0.75);
                  }}
                  className="text-xl font-bold text-slate-900 font-serif my-1 cursor-pointer hover:text-rose-600 transition"
                >
                  {word.hanzi}
                </div>

                {/* Thai Meaning & Play Action */}
                <div className="flex items-center justify-between mt-1 pt-1.5 border-t border-slate-200/60">
                  <span className="text-xs text-slate-600 font-medium truncate flex-1 pr-1">
                    {word.thai}
                  </span>
                  <button
                    type="button"
                    onClick={() => handlePlayWord(word, 0.75)}
                    className={`p-1 rounded-lg transition cursor-pointer active:scale-95 ${
                      isPlayingThis
                        ? 'bg-rose-500 text-white'
                        : 'hover:bg-slate-200 text-slate-500 hover:text-slate-800'
                    }`}
                    title="ฟังเสียงอ่าน"
                  >
                    <Volume2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Bottom Action Buttons: Retry / Go to Home */}
      <div className="mt-8 pt-6 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
        <Link
          href="/"
          className="px-5 py-3 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs sm:text-sm font-bold transition cursor-pointer flex items-center gap-1.5"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>กลับหน้าหลักบทเรียน</span>
        </Link>

        <div className="flex items-center gap-2 flex-wrap">
          {onRetryLesson && (
            <button
              type="button"
              onClick={onRetryLesson}
              className="px-4 py-3 rounded-2xl bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 text-xs sm:text-sm font-bold transition cursor-pointer flex items-center gap-1.5"
            >
              <RotateCcw className="w-4 h-4 text-slate-500" />
              <span>ฝึกบทสนทนานี้ซ้ำ 💬</span>
            </button>
          )}

          <button
            type="button"
            onClick={onStartDialogue}
            className="px-6 py-3.5 rounded-2xl bg-gradient-to-r from-amber-500 to-rose-500 hover:from-amber-600 hover:to-rose-600 text-white text-xs sm:text-sm font-bold shadow-md shadow-rose-500/20 transition cursor-pointer touch-manipulation select-none active:scale-95 flex items-center gap-2"
          >
            <span>ทบทวนการสนทนา ➔</span>
          </button>
        </div>
      </div>
    </div>
  );
}
