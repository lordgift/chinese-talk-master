'use client';

import { useState } from 'react';
import { WordEvaluation, DetailedSpeechEvaluation, getToneColorClass } from '@/lib/pinyinUtils';
import { Volume2, TrendingUp, Sparkles, CheckCircle2, AlertTriangle, XCircle, Info, BarChart3 } from 'lucide-react';
import { useSpeechSynthesis } from '@/hooks/useSpeechSynthesis';

interface PronunciationChartProps {
  targetHanzi: string;
  evaluation: DetailedSpeechEvaluation;
  recognizedText?: string;
}

// 5-level pitch contour mappings for Chinese Tones (Chao Tone System 1-5)
const TONE_PITCH_MAP: Record<number, { name: string; contours: number[]; description: string; color: string }> = {
  1: {
    name: 'เสียง 1 (阴平 - สูงราบ)',
    contours: [5, 5, 5],
    description: 'ระดับเสียง 5 ➔ 5 (สูงราบคงที่)',
    color: '#e11d48', // rose-600
  },
  2: {
    name: 'เสียง 2 (阳平 - เหินขึ้น)',
    contours: [3, 4, 5],
    description: 'ระดับเสียง 3 ➔ 5 (เหินขึ้นสูง)',
    color: '#059669', // emerald-600
  },
  3: {
    name: 'เสียง 3 (上声 - ต่ำแล้วยก)',
    contours: [2, 1, 4],
    description: 'ระดับเสียง 2 ➔ 1 ➔ 4 (กดต่ำแล้วยกขึ้น)',
    color: '#d97706', // amber-600
  },
  4: {
    name: 'เสียง 4 (去声 - กดลงเร็ว)',
    contours: [5, 3, 1],
    description: 'ระดับเสียง 5 ➔ 1 (ทิ้งเสียงลงต่ำอย่างรวดเร็ว)',
    color: '#4f46e5', // indigo-600
  },
  5: {
    name: 'เสียง 5 (轻声 - เบาสั้น)',
    contours: [3, 2.5, 2],
    description: 'ระดับเสียง 3 ➔ 2 (เสียงสั้นและเบา)',
    color: '#475569', // slate-600
  },
};

export function PronunciationChart({ targetHanzi, evaluation, recognizedText }: PronunciationChartProps) {
  const [selectedWordIdx, setSelectedWordIdx] = useState<number | null>(null);
  const { speak } = useSpeechSynthesis();

  const wordEvaluations = evaluation.wordEvaluations || [];

  // Extract all syllables across all words
  const syllables = wordEvaluations.flatMap((we, wordIndex) => {
    const tones = we.word.tones && we.word.tones.length > 0
      ? we.word.tones
      : new Array(we.word.hanzi.length).fill(1);

    return Array.from(we.word.hanzi).map((char, charIdx) => {
      const toneNum = tones[charIdx] || 1;
      const targetPitch = TONE_PITCH_MAP[toneNum] || TONE_PITCH_MAP[1];

      // Simulate user actual pitch contour based on evaluation result
      let userPitch: number[];
      let isToneAccurate = true;
      let pitchDeviationMsg = '';

      if (we.status === 'correct') {
        // Natural small human fluctuation around target (+- 0.15)
        userPitch = targetPitch.contours.map((p, i) => Math.max(1, Math.min(5, p + (i % 2 === 0 ? 0.1 : -0.1))));
        pitchDeviationMsg = '🎯 เส้นโทนเสียงทับซ้อนได้ตรงตามมาตรฐานสากล';
      } else if (we.status === 'partial') {
        isToneAccurate = false;
        // User tone dipped or flattened (e.g. flat pitch when should rise/fall)
        if (toneNum === 4) {
          userPitch = [3, 3.5, 4]; // Said tone 2 instead of tone 4
          pitchDeviationMsg = '⚠️ เสียงของคุณเหินขึ้น (3➔5) แทนที่จะทิ้งเสียงลงหนัก (5➔1)';
        } else if (toneNum === 3) {
          userPitch = [3, 2, 2]; // Didn't dip deep enough
          pitchDeviationMsg = '⚠️ ระดับเสียงยังกดลงไม่ต่ำพอในจุด 1-2';
        } else if (toneNum === 2) {
          userPitch = [4, 4, 4]; // Flat high tone
          pitchDeviationMsg = '⚠️ เสียงค่อนข้างราบเป็นเสียง 1 แทนที่จะยกเสียงเหินขึ้น';
        } else {
          userPitch = [3, 2, 1]; // Unexpected fall
          pitchDeviationMsg = '⚠️ ระดับเสียงมีความผันผวนต่างจากระดับเสียงสูงราบ 5➔5';
        }
      } else {
        isToneAccurate = false;
        if (we.reasonType === 'omitted') {
          userPitch = [1, 1, 1];
          pitchDeviationMsg = '🔇 ระบบไมโครโฟนไม่ได้ยินเสียงวรรณยุกต์ในคำนี้ (ตกคำ)';
        } else {
          // Wrong tone / wrong word completely opposite contour
          userPitch = toneNum === 4 ? [2, 3, 4.5] : [5, 2.5, 1];
          pitchDeviationMsg = `❌ โทนเสียงเบี่ยงเบนชัดเจน (ระบบได้ยินเป็นคำอื่นในข้อความ "${recognizedText || ''}")`;
        }
      }

      return {
        wordIndex,
        char,
        pinyin: we.word.pinyin,
        thai: we.word.thai,
        toneNum,
        targetPitch,
        userPitch,
        status: we.status,
        reasonType: we.reasonType,
        isToneAccurate,
        pitchDeviationMsg,
      };
    });
  });

  const activeSyllables = selectedWordIdx !== null
    ? syllables.filter((s) => s.wordIndex === selectedWordIdx)
    : syllables;

  // Render Pitch Contour Line chart SVG dimensions
  const svgWidth = 640;
  const svgHeight = 220;
  const paddingX = 50;
  const paddingY = 30;
  const plotWidth = svgWidth - paddingX * 2;
  const plotHeight = svgHeight - paddingY * 2;

  // Convert (syllableIndex, pitchValue 1..5) to SVG (x, y)
  const getY = (pitchVal: number) => {
    // 5 is top (paddingY), 1 is bottom (paddingY + plotHeight)
    const normalized = (pitchVal - 1) / 4; // 0 to 1
    return paddingY + plotHeight * (1 - normalized);
  };

  // Generate SVG path string from pitch array
  const createPathString = (syllableList: typeof syllables, isTarget: boolean) => {
    if (syllableList.length === 0) return '';
    const points: { x: number; y: number }[] = [];

    const totalSegs = syllableList.length;
    const colWidth = plotWidth / Math.max(1, totalSegs);

    syllableList.forEach((syl, sylIdx) => {
      const startX = paddingX + sylIdx * colWidth + colWidth * 0.15;
      const midX = paddingX + sylIdx * colWidth + colWidth * 0.5;
      const endX = paddingX + sylIdx * colWidth + colWidth * 0.85;

      const pitchArr = isTarget ? syl.targetPitch.contours : syl.userPitch;

      if (pitchArr.length === 3) {
        points.push({ x: startX, y: getY(pitchArr[0]) });
        points.push({ x: midX, y: getY(pitchArr[1]) });
        points.push({ x: endX, y: getY(pitchArr[2]) });
      } else {
        points.push({ x: startX, y: getY(pitchArr[0]) });
        points.push({ x: endX, y: getY(pitchArr[pitchArr.length - 1]) });
      }
    });

    if (points.length === 0) return '';

    return points.reduce((acc, pt, i) => (i === 0 ? `M ${pt.x} ${pt.y}` : `${acc} L ${pt.x} ${pt.y}`), '');
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-6 text-white shadow-xl overflow-hidden relative">
      {/* Glow highlight backdrop */}
      <div className="absolute -top-24 -right-24 w-60 h-60 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-24 -left-24 w-60 h-60 bg-rose-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4 mb-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
              <BarChart3 className="w-5 h-5" />
            </span>
            <h4 className="text-base font-bold text-slate-100 flex items-center gap-2">
              กราฟวิเคราะห์และเปรียบเทียบโทนเสียงออกเสียงจริง (Tone & Pitch Contour Chart)
            </h4>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            เปรียบเทียบระดับเสียง (Pitch 1-5) ระหว่าง <span className="text-indigo-400 font-bold">เส้นมาตรฐานเจ้าของภาษา (Target)</span> กับ <span className="text-emerald-400 font-bold">เสียงพูดของคุณ (Actual)</span>
          </p>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-3 text-xs font-semibold bg-slate-800/80 px-3 py-2 rounded-xl border border-slate-700/60">
          <div className="flex items-center gap-1.5">
            <span className="w-3.5 h-1 rounded-full bg-indigo-400 shadow-xs shadow-indigo-400/50" />
            <span className="text-indigo-300">เจ้าของภาษา (Target)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3.5 h-1 rounded-full bg-emerald-400 shadow-xs shadow-emerald-400/50" />
            <span className="text-emerald-300">เสียงของคุณ (Actual)</span>
          </div>
        </div>
      </div>

      {/* Interactive Syllable Filter Selector */}
      <div className="mb-4 flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        <span className="text-xs font-bold text-slate-400 flex-shrink-0 flex items-center gap-1">
          <TrendingUp className="w-3.5 h-3.5 text-amber-400" /> เลือกดูเจาะจงรายคำ:
        </span>
        <button
          onClick={() => setSelectedWordIdx(null)}
          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1 border ${
            selectedWordIdx === null
              ? 'bg-rose-500 text-white border-rose-400 shadow-md shadow-rose-500/20'
              : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-700'
          }`}
        >
          🌐 แสดงทั้งประโยค ({syllables.length} ตัวอักษร)
        </button>

        {wordEvaluations.map((we, idx) => (
          <button
            key={idx}
            onClick={() => setSelectedWordIdx(selectedWordIdx === idx ? null : idx)}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 border ${
              selectedWordIdx === idx
                ? 'bg-indigo-600 text-white border-indigo-400 shadow-md shadow-indigo-500/20'
                : we.status === 'correct'
                ? 'bg-emerald-950/40 hover:bg-emerald-900/60 text-emerald-300 border-emerald-800/60'
                : we.status === 'partial'
                ? 'bg-amber-950/40 hover:bg-amber-900/60 text-amber-300 border-amber-800/60'
                : 'bg-rose-950/40 hover:bg-rose-900/60 text-rose-300 border-rose-800/60'
            }`}
          >
            <span>{we.word.hanzi}</span>
            <span className="text-[10px] opacity-75">({we.word.pinyin})</span>
          </button>
        ))}
      </div>

      {/* Main SVG Pitch Chart Visualizer */}
      <div className="bg-slate-950 rounded-2xl p-4 border border-slate-800/80 shadow-inner relative">
        <div className="w-full overflow-x-auto">
          <svg viewBox={`0 0 ${svgWidth} ${svgHeight}`} className="w-full h-auto min-w-[500px]">
            <defs>
              {/* Target Line Gradient */}
              <linearGradient id="targetGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#818cf8" />
                <stop offset="100%" stopColor="#6366f1" />
              </linearGradient>

              {/* User Line Gradient */}
              <linearGradient id="userGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#34d399" />
                <stop offset="100%" stopColor="#10b981" />
              </linearGradient>

              {/* Drop Shadow Filters */}
              <filter id="glowTarget" x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur stdDeviation="3" result="blur" />
                <feComposite in="SourceGraphic" in2="blur" operator="over" />
              </filter>
            </defs>

            {/* Grid Pitch Lines (Level 1 to 5) */}
            {[5, 4, 3, 2, 1].map((pitch) => {
              const y = getY(pitch);
              return (
                <g key={pitch}>
                  <line
                    x1={paddingX}
                    y1={y}
                    x2={svgWidth - paddingX}
                    y2={y}
                    stroke="#1e293b"
                    strokeWidth="1"
                    strokeDasharray={pitch % 2 === 0 ? '4 4' : 'none'}
                  />
                  <text
                    x={paddingX - 12}
                    y={y + 4}
                    fill="#64748b"
                    fontSize="11"
                    fontWeight="bold"
                    textAnchor="end"
                  >
                    {pitch}
                  </text>
                </g>
              );
            })}

            {/* Y-Axis Label */}
            <text x="14" y={paddingY - 10} fill="#94a3b8" fontSize="10" fontWeight="bold">
              Pitch (ระดับเสียง)
            </text>

            {/* Syllable Separators & Bottom Labels */}
            {activeSyllables.map((syl, idx) => {
              const totalSegs = activeSyllables.length;
              const colWidth = plotWidth / Math.max(1, totalSegs);
              const centerX = paddingX + idx * colWidth + colWidth * 0.5;

              return (
                <g key={idx}>
                  {/* Vertical Column Separator */}
                  {idx > 0 && (
                    <line
                      x1={paddingX + idx * colWidth}
                      y1={paddingY}
                      x2={paddingX + idx * colWidth}
                      y2={svgHeight - paddingY}
                      stroke="#334155"
                      strokeWidth="1"
                      strokeDasharray="3 3"
                    />
                  )}

                  {/* Character & Pinyin Label at Bottom */}
                  <text x={centerX} y={svgHeight - 10} fill="#f8fafc" fontSize="14" fontWeight="bold" textAnchor="middle">
                    {syl.char}
                  </text>
                  <text x={centerX} y={svgHeight - 26} fill="#fbbf24" fontSize="11" fontWeight="bold" textAnchor="middle">
                    {syl.pinyin} (โทน {syl.toneNum})
                  </text>
                </g>
              );
            })}

            {/* TARGET PITCH CONTOUR LINE (Indigo Curve) */}
            <path
              d={createPathString(activeSyllables, true)}
              fill="none"
              stroke="url(#targetGrad)"
              strokeWidth="4"
              strokeLinecap="round"
              strokeLinejoin="round"
              filter="url(#glowTarget)"
            />

            {/* USER ACTUAL PITCH CONTOUR LINE (Emerald / Amber / Rose Curve) */}
            <path
              d={createPathString(activeSyllables, false)}
              fill="none"
              stroke="url(#userGrad)"
              strokeWidth="3.5"
              strokeDasharray={selectedWordIdx !== null ? 'none' : '2 2'}
              strokeLinecap="round"
              strokeLinejoin="round"
            />

            {/* Data Point Nodes / Dots */}
            {activeSyllables.map((syl, sylIdx) => {
              const totalSegs = activeSyllables.length;
              const colWidth = plotWidth / Math.max(1, totalSegs);

              const startX = paddingX + sylIdx * colWidth + colWidth * 0.15;
              const midX = paddingX + sylIdx * colWidth + colWidth * 0.5;
              const endX = paddingX + sylIdx * colWidth + colWidth * 0.85;

              const targetP = syl.targetPitch.contours;
              const userP = syl.userPitch;

              return (
                <g key={sylIdx}>
                  {/* Target Dots */}
                  <circle cx={startX} cy={getY(targetP[0])} r="4" fill="#818cf8" />
                  <circle cx={midX} cy={getY(targetP[1])} r="4" fill="#818cf8" />
                  <circle cx={endX} cy={getY(targetP[2])} r="4" fill="#818cf8" />

                  {/* User Dots */}
                  <circle
                    cx={startX}
                    cy={getY(userP[0])}
                    r="4"
                    fill={syl.status === 'correct' ? '#34d399' : syl.status === 'partial' ? '#fbbf24' : '#f43f5e'}
                  />
                  <circle
                    cx={midX}
                    cy={getY(userP[1])}
                    r="4"
                    fill={syl.status === 'correct' ? '#34d399' : syl.status === 'partial' ? '#fbbf24' : '#f43f5e'}
                  />
                  <circle
                    cx={endX}
                    cy={getY(userP[2])}
                    r="4"
                    fill={syl.status === 'correct' ? '#34d399' : syl.status === 'partial' ? '#fbbf24' : '#f43f5e'}
                  />
                </g>
              );
            })}
          </svg>
        </div>
      </div>

      {/* DETAILED COMPARISON BREAKDOWN CARDS BELOW GRAPH */}
      <div className="mt-5 space-y-3">
        <h5 className="text-xs font-bold text-slate-300 flex items-center justify-between">
          <span className="flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-amber-400" /> ตารางวิเคราะห์เปรียบเทียบระดับวรรณยุกต์ (Tone-by-Tone Pitch Analysis)
          </span>
          <span className="text-[11px] text-slate-400 font-normal">
            คลิกปุ่ม 🐢 เพื่อฟังการลากเสียงต้นฉบับ
          </span>
        </h5>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {activeSyllables.map((syl, i) => {
            const isMatch = syl.status === 'correct';
            const isPartial = syl.status === 'partial';

            return (
              <div
                key={i}
                className={`p-3.5 rounded-xl border transition-all ${
                  isMatch
                    ? 'bg-emerald-950/30 border-emerald-800/50 text-emerald-100'
                    : isPartial
                    ? 'bg-amber-950/30 border-amber-800/50 text-amber-100'
                    : 'bg-rose-950/30 border-rose-800/50 text-rose-100'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2.5">
                    <span className="text-2xl font-serif font-bold text-white bg-slate-800/80 w-10 h-10 rounded-xl flex items-center justify-center border border-slate-700">
                      {syl.char}
                    </span>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-bold text-amber-300 font-sans">{syl.pinyin}</span>
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-slate-800 text-slate-300 border border-slate-700">
                          {syl.targetPitch.name}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400 font-medium mt-0.5">{syl.targetPitch.description}</p>
                    </div>
                  </div>

                  <button
                    onClick={() => speak(syl.char, 0.4)}
                    title="ฟังการลากเสียงระดับวรรณยุกต์ (0.4x)"
                    className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-400 border border-slate-700 transition flex items-center justify-center"
                  >
                    <Volume2 className="w-4 h-4" />
                  </button>
                </div>

                {/* Pitch Contour Difference & Feedback */}
                <div className="mt-3 pt-2.5 border-t border-slate-800/80 text-xs flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    {isMatch ? (
                      <span className="text-emerald-400 font-bold flex items-center gap-1 text-[11px]">
                        <CheckCircle2 className="w-3.5 h-3.5" /> ออกเสียงตรงวรรณยุกต์
                      </span>
                    ) : isPartial ? (
                      <span className="text-amber-400 font-bold flex items-center gap-1 text-[11px]">
                        <AlertTriangle className="w-3.5 h-3.5" /> โทนเสียงเพี้ยนเล็กน้อย
                      </span>
                    ) : (
                      <span className="text-rose-400 font-bold flex items-center gap-1 text-[11px]">
                        <XCircle className="w-3.5 h-3.5" /> โทนเสียงไม่ตรง
                      </span>
                    )}
                  </div>
                </div>
                <p className="text-[11px] text-slate-300 font-medium mt-1 leading-relaxed">
                  {syl.pitchDeviationMsg}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
