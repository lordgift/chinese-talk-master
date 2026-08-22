'use client';

import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useSpeechSynthesis } from '@/hooks/useSpeechSynthesis';
import { SavedWord } from '@/lib/userProgress';
import { getToneColorClass } from '@/lib/pinyinUtils';
import { X, Star, Volume2, Search, Trash2, BookOpen, Sparkles } from 'lucide-react';

interface SavedWordsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SavedWordsModal({ isOpen, onClose }: SavedWordsModalProps) {
  const { userSavedWords, toggleSaveWord } = useAuth();
  const { speak, isSpeaking, currentText } = useSpeechSynthesis();
  const [searchQuery, setSearchQuery] = useState('');

  if (!isOpen) return null;

  const savedList = Object.values(userSavedWords).sort(
    (a, b) => new Date(b.savedAt).getTime() - new Date(a.savedAt).getTime()
  );

  const filteredWords = savedList.filter((w) => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return true;
    return (
      w.hanzi.toLowerCase().includes(q) ||
      w.pinyin.toLowerCase().includes(q) ||
      w.thai.toLowerCase().includes(q) ||
      (w.scenarioTitle && w.scenarioTitle.toLowerCase().includes(q))
    );
  });

  const handlePlayAudio = (hanzi: string, rate: number = 0.85) => {
    speak(hanzi, rate);
  };

  const handleRemoveWord = async (word: SavedWord) => {
    await toggleSaveWord({
      hanzi: word.hanzi,
      pinyin: word.pinyin,
      thai: word.thai,
      tones: word.tones,
      scenarioId: word.scenarioId,
      scenarioTitle: word.scenarioTitle,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full max-h-[85vh] flex flex-col border border-slate-100 overflow-hidden">
        {/* Modal Header */}
        <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-amber-500/10 via-rose-500/10 to-amber-500/5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500 text-white flex items-center justify-center shadow-md">
              <Star className="w-5 h-5 fill-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-black text-slate-900">คลังคำศัพท์ที่บันทึกไว้</h3>
                <span className="px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 text-xs font-bold border border-amber-200">
                  {savedList.length} คำ
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                คำศัพท์ที่คุณเลือกบันทึกไว้ทบทวนจากทุกบทเรียน
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-white hover:bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-500 hover:text-slate-700 transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Search Bar */}
        <div className="p-4 border-b border-slate-100 bg-slate-50/50">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="ค้นหาคำศัพท์, พินอิน, ความหมาย หรือบทเรียน..."
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-2xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500 transition"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs"
              >
                ✕
              </button>
            )}
          </div>
        </div>

        {/* Words List */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-3">
          {savedList.length === 0 ? (
            <div className="py-12 text-center text-slate-400 flex flex-col items-center">
              <div className="w-16 h-16 rounded-full bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-500 mb-3">
                <Star className="w-8 h-8" />
              </div>
              <p className="text-sm font-bold text-slate-700">ยังไม่มีคำศัพท์ที่บันทึกไว้</p>
              <p className="text-xs text-slate-500 max-w-xs mt-1">
                เมื่อเรียนจบแต่ละบทเรียน สามารถแตะไอคอน ⭐ ที่การ์ดคำศัพท์เพื่อบันทึกคำที่ต้องการมาไว้ที่นี่ได้เลย
              </p>
            </div>
          ) : filteredWords.length === 0 ? (
            <div className="py-12 text-center text-slate-400">
              <p className="text-sm font-semibold text-slate-600">ไม่พบคำศัพท์ที่ตรงกับการค้นหา</p>
            </div>
          ) : (
            filteredWords.map((word) => {
              const isCurrentWordPlaying = isSpeaking && currentText === word.hanzi;
              return (
                <div
                  key={word.id}
                  className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-2xs hover:shadow-md hover:border-amber-300 transition flex items-center justify-between gap-4 group"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 flex-wrap">
                      <span className="text-xl sm:text-2xl font-black text-slate-900 font-serif tracking-wide">
                        {word.hanzi}
                      </span>
                      <span className="text-xs sm:text-sm font-pinyin font-bold text-rose-600">
                        {word.pinyin}
                      </span>
                      {word.tones && word.tones.length > 0 && (
                        <div className="flex items-center gap-1">
                          {word.tones.map((tone, tIdx) => (
                            <span
                              key={tIdx}
                              className={`w-4 h-4 rounded-full text-[9px] font-bold flex items-center justify-center border ${getToneColorClass(
                                tone
                              )}`}
                            >
                              {tone === 5 ? '•' : tone}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                    <div className="text-xs sm:text-sm text-slate-600 font-medium mt-1">
                      {word.thai}
                    </div>
                    {word.scenarioTitle && (
                      <div className="flex items-center gap-1 text-[11px] text-slate-400 mt-1.5 font-medium">
                        <BookOpen className="w-3 h-3" />
                        <span className="truncate">{word.scenarioTitle}</span>
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      type="button"
                      onClick={() => handlePlayAudio(word.hanzi, 0.85)}
                      className={`p-2 rounded-xl border transition cursor-pointer active:scale-95 ${
                        isCurrentWordPlaying
                          ? 'bg-rose-500 text-white border-rose-600 ring-2 ring-rose-300 animate-pulse'
                          : 'bg-slate-50 hover:bg-rose-50 text-slate-600 hover:text-rose-600 border-slate-200'
                      }`}
                      title="ฟังเสียงอ่านปกติ"
                    >
                      <Volume2 className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handlePlayAudio(word.hanzi, 0.6)}
                      className="px-2 py-1.5 rounded-xl border bg-slate-50 hover:bg-amber-50 text-slate-500 hover:text-amber-700 border-slate-200 text-[10px] font-bold transition cursor-pointer active:scale-95"
                      title="ฟังเสียงอ่านช้า 0.6x"
                    >
                      0.6x
                    </button>
                    <button
                      type="button"
                      onClick={() => handleRemoveWord(word)}
                      className="p-2 rounded-xl border border-slate-200 hover:border-red-300 text-slate-400 hover:text-red-600 hover:bg-red-50 transition cursor-pointer active:scale-95"
                      title="นำออกจากรายการที่บันทึก"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3.5 border-t border-slate-100 bg-slate-50/60 flex items-center justify-between text-xs text-slate-500">
          <div className="flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <span>บันทึกและซิงค์ข้อมูลอัตโนมัติ</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold transition cursor-pointer"
          >
            ปิด
          </button>
        </div>
      </div>
    </div>
  );
}
