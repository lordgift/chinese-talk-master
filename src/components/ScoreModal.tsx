'use client';

import Link from 'next/link';
import { Trophy, Star, RotateCcw, Home, CloudCheck, HardDrive } from 'lucide-react';
import confetti from 'canvas-confetti';
import { useEffect, useState } from 'react';
import { trackEvent } from '@/lib/firebase';
import { useAuth } from '@/context/AuthContext';
import { saveScenarioProgress } from '@/lib/userProgress';

interface ScoreModalProps {
  scenarioId: string;
  scenarioTitle: string;
  totalScore: number;
  onRetry: () => void;
}

export function ScoreModal({ scenarioId, scenarioTitle, totalScore, onRetry }: ScoreModalProps) {
  const { user, loginWithGoogle, refreshProgress } = useAuth();
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    trackEvent('session_complete', {
      scenario_id: scenarioId,
      scenario_title: scenarioTitle,
      total_score: totalScore,
    });

    if (totalScore > 0) {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
      });
    }

    // Save study progress
    const saveProgress = async () => {
      await saveScenarioProgress(user?.uid, scenarioId, totalScore, scenarioTitle);
      await refreshProgress();
      setIsSaved(true);
    };

    saveProgress();
  }, [scenarioId, scenarioTitle, totalScore, user]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-md animate-fadeIn">
      <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 max-w-md w-full text-center shadow-2xl relative overflow-hidden text-slate-900">
        {/* Glow backdrop */}
        <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-48 h-48 bg-amber-400/20 rounded-full blur-3xl pointer-events-none" />

        {/* Trophy icon */}
        <div className="w-20 h-20 mx-auto rounded-3xl bg-gradient-to-tr from-amber-500 to-rose-500 flex items-center justify-center text-white shadow-lg shadow-amber-500/25 mb-4 animate-bounce">
          <Trophy className="w-10 h-10" />
        </div>

        <h2 className="text-2xl font-black text-slate-900 tracking-wide">ยินดีด้วย! สำเร็จบทสนทนา</h2>
        <p className="text-sm text-slate-600 mt-1 font-medium">{scenarioTitle}</p>

        {/* Stars */}
        <div className="flex items-center justify-center gap-2 my-4">
          {[1, 2, 3].map((star) => (
            <Star
              key={star}
              className={`w-8 h-8 ${
                star <= (totalScore >= 80 ? 3 : totalScore >= 60 ? 2 : totalScore > 0 ? 1 : 0)
                  ? 'text-amber-500 fill-amber-500 animate-pulse'
                  : 'text-slate-300'
              }`}
            />
          ))}
        </div>

        {/* Score gauge */}
        <div className="bg-slate-50 rounded-2xl p-4 my-4 border border-slate-200">
          <p className="text-xs text-slate-500 mb-1 font-mono uppercase font-bold">คะแนนการออกเสียงเฉลี่ย</p>
          <div className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-600 via-rose-600 to-emerald-600">
            {totalScore}%
          </div>
          <p className="text-xs text-slate-700 mt-2 font-medium">
            {totalScore >= 80
              ? '🌟 ยอดเยี่ยมมาก! คุณมีความแม่นยำในการออกเสียงวรรณยุกต์ Pinyin ระดับสูง'
              : totalScore >= 60
              ? '👍 ทำได้ดีมาก! ฝึกฝนบ่อยๆ จะช่วยให้ออกเสียงเป็นธรรมชาติยิ่งขึ้น'
              : totalScore > 0
              ? '💪 ฝึกซ้อมอย่างต่อเนื่อง แล้วคุณจะเชี่ยวชาญขึ้นแน่นอน!'
              : '🔇 คุณยังไม่ได้ลองกดพูดบันทึกเสียงในบทนี้ กด "ฝึกใหม่อีกครั้ง" แล้วเริ่มกดไมค์เพื่อฝึกพูดได้เลยนะครับ'}
          </p>
        </div>

        {/* Cloud Sync Status / Optional Login Notice */}
        <div className="my-3">
          {user ? (
            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-semibold">
              <CloudCheck className="w-4 h-4 text-emerald-600" />
              <span>บันทึกผลการเรียนลง Cloud แล้ว ☁️</span>
            </div>
          ) : (
            <div className="bg-amber-50/80 p-3 rounded-xl border border-amber-200 text-left text-xs text-amber-900 flex items-start justify-between gap-2">
              <div className="flex items-start gap-2">
                <HardDrive className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold">บันทึกผลลงในเครื่องแล้ว 💾</p>
                  <p className="text-[11px] text-amber-800 font-normal">
                    เข้าสู่ระบบ Google เพื่อสำรองประวัติการเรียนลง Cloud ☁️
                  </p>
                </div>
              </div>
              <button
                onClick={loginWithGoogle}
                className="px-2.5 py-1 rounded-lg bg-amber-600 hover:bg-amber-700 text-white text-[11px] font-bold shrink-0 shadow-xs cursor-pointer"
              >
                Sign In
              </button>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 mt-4">
          <button
            onClick={onRetry}
            className="flex-1 py-3 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold flex items-center justify-center gap-2 border border-slate-200 transition shadow-2xs cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" />
            <span>ฝึกใหม่อีกครั้ง</span>
          </button>

          <Link
            href="/"
            className="flex-1 py-3 px-4 rounded-xl bg-gradient-to-r from-rose-500 to-amber-500 hover:from-rose-600 hover:to-amber-600 text-white text-xs font-bold flex items-center justify-center gap-2 shadow-md shadow-rose-500/20 transition"
          >
            <Home className="w-4 h-4" />
            <span>เลือกบทอื่น</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
