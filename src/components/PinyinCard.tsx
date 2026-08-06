'use client';

import { useState } from 'react';
import { DialogueLine, getToneColorClass, WordEvaluation } from '@/lib/pinyinUtils';
import { AudioPlayer } from './AudioPlayer';
import { Info, CheckCircle2, XCircle, AlertTriangle } from 'lucide-react';
import { useSpeechSynthesis } from '@/hooks/useSpeechSynthesis';

interface PinyinCardProps {
  dialogue: DialogueLine;
  isCurrent?: boolean;
  wordEvaluations?: WordEvaluation[];
}

export function PinyinCard({ dialogue, isCurrent = false, wordEvaluations }: PinyinCardProps) {
  const [selectedWord, setSelectedWord] = useState<string | null>(null);
  const { speak } = useSpeechSynthesis();

  const isUser = dialogue.speaker === 'user';

  const handleWordClick = (wordHanzi: string) => {
    setSelectedWord(selectedWord === wordHanzi ? null : wordHanzi);
    speak(wordHanzi, 0.75); // Speak individual word clearly
  };

  const getWordEval = (hanzi: string): WordEvaluation | undefined => {
    if (!wordEvaluations) return undefined;
    return wordEvaluations.find((we) => we.word.hanzi === hanzi);
  };

  return (
    <div
      className={`rounded-2xl p-4 sm:p-5 transition-all duration-300 border ${
        isUser
          ? 'bg-white border-amber-300 shadow-sm ml-4 sm:ml-8'
          : 'bg-white border-slate-200 mr-4 sm:mr-8 shadow-2xs'
      } ${isCurrent ? 'ring-2 ring-rose-400/70 shadow-md shadow-rose-500/10' : ''}`}
    >
      {/* Header / Speaker avatar */}
      <div className="flex items-center justify-between gap-3 mb-3 border-b border-slate-100 pb-2.5">
        <div className="flex items-center gap-2.5">
          <span className="text-2xl p-1.5 rounded-xl bg-slate-100 border border-slate-200">
            {dialogue.avatar}
          </span>
          <div>
            <span
              className={`text-xs font-bold px-2.5 py-0.5 rounded-md ${
                isUser
                  ? 'bg-amber-100 text-amber-900 border border-amber-300'
                  : 'bg-indigo-100 text-indigo-900 border border-indigo-300'
              }`}
            >
              {dialogue.speakerName}
            </span>
          </div>
        </div>

        {/* Audio player for full sentence */}
        <AudioPlayer text={dialogue.hanzi} compact />
      </div>

      {/* Main Chinese Sentence Display with Pinyin */}
      <div className="my-4">
        {/* Full Pinyin text string */}
        <p className="text-sm font-bold text-amber-800 font-sans tracking-wide mb-1 select-all">
          {dialogue.pinyin}
        </p>

        {/* Big Hanzi text with interactive clickable word pills */}
        <div className="flex flex-wrap items-baseline gap-2 py-1">
          {dialogue.words.map((word, idx) => {
            const isSelected = selectedWord === word.hanzi;
            const evalResult = getWordEval(word.hanzi);

            // Determine border & background styling based on Green/Yellow/Red evaluation status
            let evalBorderClass = 'bg-slate-50 border-slate-200 hover:border-amber-400 hover:bg-amber-50/60';
            let hanziColorClass = 'text-slate-900';
            let statusBadge = null;

            if (evalResult) {
              if (evalResult.status === 'correct') {
                evalBorderClass =
                  'bg-emerald-50 border-emerald-400 ring-2 ring-emerald-400/50 shadow-xs';
                hanziColorClass = 'text-emerald-900 font-extrabold';
                statusBadge = (
                  <span className="text-[9px] font-bold px-1.5 py-0.2 rounded-full bg-emerald-600 text-white flex items-center gap-0.5 mt-1">
                    <CheckCircle2 className="w-2.5 h-2.5" /> 🟢 ถูกต้อง
                  </span>
                );
              } else if (evalResult.status === 'partial') {
                evalBorderClass =
                  'bg-amber-50 border-amber-400 ring-2 ring-amber-400/50 shadow-xs';
                hanziColorClass = 'text-amber-900 font-extrabold';
                statusBadge = (
                  <span className="text-[9px] font-bold px-1.5 py-0.2 rounded-full bg-amber-500 text-white flex items-center gap-0.5 mt-1">
                    <AlertTriangle className="w-2.5 h-2.5" /> 🟡 ใกล้เคียง
                  </span>
                );
              } else {
                evalBorderClass =
                  'bg-rose-50 border-rose-400 ring-2 ring-rose-400/50 shadow-xs';
                hanziColorClass = 'text-rose-700 font-extrabold';
                statusBadge = (
                  <span className="text-[9px] font-bold px-1.5 py-0.2 rounded-full bg-rose-600 text-white flex items-center gap-0.5 mt-1 animate-pulse">
                    <XCircle className="w-2.5 h-2.5" /> 🔴 พลาด
                  </span>
                );
              }
            } else if (isSelected) {
              evalBorderClass = 'bg-amber-100/70 border-amber-400 scale-105 shadow-xs';
            }

            return (
              <button
                key={idx}
                onClick={() => handleWordClick(word.hanzi)}
                className={`group relative flex flex-col items-center p-2 rounded-xl border transition-all ${evalBorderClass}`}
              >
                {/* Tone styled Pinyin */}
                <span className="text-xs font-semibold text-slate-600 group-hover:text-amber-800">
                  {word.pinyin}
                </span>

                {/* Hanzi */}
                <span className={`text-2xl font-bold tracking-wider my-0.5 font-serif ${hanziColorClass}`}>
                  {word.hanzi}
                </span>

                {/* Thai Word Meaning Pill */}
                <span className="text-[11px] text-slate-500 font-medium group-hover:text-slate-700">
                  {word.thai}
                </span>

                {/* Green/Yellow/Red evaluation badge if tested */}
                {statusBadge}

                {/* Tone indicator bar */}
                {!statusBadge && word.tones && (
                  <div className="flex items-center gap-1 mt-1">
                    {word.tones.map((t, tIdx) => {
                      const toneStyle = getToneColorClass(t);
                      return (
                        <span
                          key={tIdx}
                          title={`Tone ${t}`}
                          className={`text-[9px] px-1 py-0.2 rounded border ${toneStyle.bg} ${toneStyle.text} ${toneStyle.border}`}
                        >
                          T{t}
                        </span>
                      );
                    })}
                  </div>
                )}
              </button>
            );
          })}
        </div>

        {/* Thai sentence translation */}
        <p className="text-sm text-slate-800 mt-3 font-medium flex items-center gap-2 bg-slate-100/70 p-2.5 rounded-lg border border-slate-200">
          <span className="text-slate-500 text-xs font-mono uppercase font-bold">TH:</span>
          <span>{dialogue.thai}</span>
        </p>
      </div>

      {/* Audio hint or Tone sandhi rule tooltip if present */}
      {dialogue.audioHint && (
        <div className="mt-3 text-xs text-amber-900 bg-amber-50 border border-amber-200 rounded-xl p-2.5 flex items-start gap-2 font-medium">
          <Info className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
          <div>{dialogue.audioHint}</div>
        </div>
      )}
    </div>
  );
}
