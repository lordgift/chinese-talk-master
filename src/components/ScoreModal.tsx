'use client';

import Link from 'next/link';
import { Trophy, Star, ArrowRight, RotateCcw, Home } from 'lucide-react';
import confetti from 'canvas-confetti';
import { useEffect } from 'react';

interface ScoreModalProps {
  scenarioTitle: string;
  totalScore: number;
  onRetry: () => void;
}

export function ScoreModal({ scenarioTitle, totalScore, onRetry }: ScoreModalProps) {
  useEffect(() => {
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
    });
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 max-w-md w-full text-center shadow-2xl shadow-rose-500/20 relative overflow-hidden">
        {/* Glow backdrop */}
        <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-48 h-48 bg-amber-500/20 rounded-full blur-3xl pointer-events-none" />

        {/* Trophy icon */}
        <div className="w-20 h-20 mx-auto rounded-3xl bg-gradient-to-tr from-amber-500 to-rose-500 flex items-center justify-center text-slate-950 shadow-xl shadow-amber-500/30 mb-4 animate-bounce">
          <Trophy className="w-10 h-10" />
        </div>

        <h2 className="text-2xl font-black text-white tracking-wide">ยินดีด้วย! สำเร็จบทสนทนา</h2>
        <p className="text-sm text-slate-300 mt-1">{scenarioTitle}</p>

        {/* Stars */}
        <div className="flex items-center justify-center gap-2 my-4">
          {[1, 2, 3].map((star) => (
            <Star
              key={star}
              className={`w-8 h-8 ${
                star <= (totalScore >= 80 ? 3 : totalScore >= 60 ? 2 : 1)
                  ? 'text-amber-400 fill-amber-400 animate-pulse'
                  : 'text-slate-700'
              }`}
            />
          ))}
        </div>

        {/* Score gauge */}
        <div className="bg-slate-950/80 rounded-2xl p-4 my-4 border border-slate-800">
          <p className="text-xs text-slate-400 mb-1 font-mono uppercase">คะแนนการออกเสียงเฉลี่ย</p>
          <div className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-rose-300 to-emerald-300">
            {totalScore}%
          </div>
          <p className="text-xs text-slate-300 mt-2">
            {totalScore >= 80
              ? '🌟 ยอดเยี่ยมมาก! คุณมีความแม่นยำในการออกเสียงวรรณยุกต์ Pinyin ระดับสูง'
              : totalScore >= 60
              ? '👍 ทำได้ดีมาก! ฝึกฝนบ่อยๆ จะช่วยให้ออกเสียงเป็นธรรมชาติยิ่งขึ้น'
              : '💪 ฝึกซ้อมอย่างต่อเนื่อง แล้วคุณจะเชี่ยวชาญขึ้นแน่นอน!'}
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 mt-6">
          <button
            onClick={onRetry}
            className="flex-1 py-3 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold flex items-center justify-center gap-2 border border-slate-700 transition"
          >
            <RotateCcw className="w-4 h-4" />
            <span>ฝึกใหม่อีกครั้ง</span>
          </button>

          <Link
            href="/"
            className="flex-1 py-3 px-4 rounded-xl bg-gradient-to-r from-rose-500 to-amber-500 hover:from-rose-600 hover:to-amber-600 text-white text-xs font-bold flex items-center justify-center gap-2 shadow-lg shadow-rose-500/25 transition"
          >
            <Home className="w-4 h-4" />
            <span>เลือกบทอื่น</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
