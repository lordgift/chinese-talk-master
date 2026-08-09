'use client';

import { useState, use } from 'react';
import Link from 'next/link';
import { SCENARIOS } from '@/data/scenarios';
import { Header } from '@/components/Header';
import { PinyinCard } from '@/components/PinyinCard';
import { SpeechRecorder } from '@/components/SpeechRecorder';
import { VocabPrep } from '@/components/VocabPrep';
import { ScoreModal } from '@/components/ScoreModal';
import { AudioPlayer } from '@/components/AudioPlayer';
import {
  ArrowLeft,
  ChevronRight,
  ChevronLeft,
  BookOpen,
  ListOrdered,
  Mic,
  User,
  Bot,
  Sparkles,
} from 'lucide-react';
import { useSpeechSynthesis } from '@/hooks/useSpeechSynthesis';
import { DetailedSpeechEvaluation, WordBreakdown } from '@/lib/pinyinUtils';

interface PageProps {
  params: Promise<{
    scenarioId: string;
  }>;
}

export default function SessionPage({ params }: PageProps) {
  const resolvedParams = use(params);
  const scenario = SCENARIOS.find((s) => s.id === resolvedParams.scenarioId);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [mode, setMode] = useState<'vocab' | 'step' | 'overview'>('vocab');
  const [scores, setScores] = useState<Record<number, number>>({});
  const [evaluations, setEvaluations] = useState<Record<number, DetailedSpeechEvaluation | undefined>>({});
  const [isCompleted, setIsCompleted] = useState(false);

  const { speak } = useSpeechSynthesis();

  if (!scenario) {
    return (
      <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col">
        <Header />
        <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
          <h2 className="text-xl font-bold text-rose-600">ไม่พบบทสนทนาที่ต้องการ</h2>
          <p className="text-xs text-slate-500 mt-2">โปรดเลือกบทสนทนาจากหน้าหลัก</p>
          <Link
            href="/"
            className="mt-4 px-4 py-2 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-800 text-xs font-semibold shadow-xs"
          >
            กลับสู่หน้าหลัก
          </Link>
        </div>
      </div>
    );
  }

  // Extract all words across all dialogue lines in this scenario
  const allScenarioWords: WordBreakdown[] = scenario.dialogues.flatMap((d) => d.words);
  const currentDialogue = scenario.dialogues[currentIndex];
  const isUserTurn = currentDialogue.speaker === 'user';

  const handleScoreUpdate = (score: number, evalResult?: DetailedSpeechEvaluation) => {
    setScores((prev) => ({ ...prev, [currentIndex]: score }));
    setEvaluations((prev) => ({ ...prev, [currentIndex]: evalResult }));
  };

  const handleStartDialogue = () => {
    setMode('step');
    setCurrentIndex(0);
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
    if (scenario.dialogues[0]?.speaker === 'ai') {
      speak(scenario.dialogues[0].hanzi);
    }
  };

  const handleNext = () => {
    if (currentIndex < scenario.dialogues.length - 1) {
      const nextIndex = currentIndex + 1;
      setCurrentIndex(nextIndex);

      // Auto speak if AI line
      if (scenario.dialogues[nextIndex].speaker === 'ai') {
        speak(scenario.dialogues[nextIndex].hanzi);
      }
    } else {
      setIsCompleted(true);
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
    }
  };

  const calculateAverageScore = () => {
    const userTurnIndices = scenario.dialogues
      .map((d, index) => (d.speaker === 'user' ? index : -1))
      .filter((index) => index !== -1);

    if (userTurnIndices.length === 0) return 0;

    let totalScore = 0;
    userTurnIndices.forEach((idx) => {
      totalScore += scores[idx] || 0;
    });

    return Math.round(totalScore / userTurnIndices.length);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col font-sans selection:bg-rose-500 selection:text-white">
      <Header />

      {/* Breadcrumb & Navigation Header */}
      <div className="bg-white/80 border-b border-slate-200 py-3.5 px-4 sm:px-6">
        <div className="max-w-4xl mx-auto flex flex-wrap items-center justify-between gap-3 text-xs">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 font-semibold text-slate-600 hover:text-slate-900 transition"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>กลับหน้าเลือกบทเรียน</span>
          </Link>

          {/* Practice Mode Toggle */}
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-2xl border border-slate-200 overflow-x-auto max-w-full">
            <button
              type="button"
              onClick={() => setMode('vocab')}
              className={`px-3.5 py-2 rounded-xl transition font-semibold flex items-center gap-1.5 touch-manipulation select-none cursor-pointer active:scale-95 min-h-[38px] whitespace-nowrap ${
                mode === 'vocab'
                  ? 'bg-gradient-to-r from-amber-500 to-rose-500 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>📚 1. ปูพื้นฐานคำศัพท์</span>
            </button>

            <button
              type="button"
              onClick={() => setMode('step')}
              className={`px-3.5 py-2 rounded-xl transition font-semibold flex items-center gap-1.5 touch-manipulation select-none cursor-pointer active:scale-95 min-h-[38px] whitespace-nowrap ${
                mode === 'step'
                  ? 'bg-gradient-to-r from-rose-500 to-amber-500 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Mic className="w-3.5 h-3.5" />
              <span>💬 2. ฝึกพูดในบทบาทลูกค้า</span>
            </button>

            <button
              type="button"
              onClick={() => setMode('overview')}
              className={`px-3.5 py-2 rounded-xl transition font-semibold flex items-center gap-1.5 touch-manipulation select-none cursor-pointer active:scale-95 min-h-[38px] whitespace-nowrap ${
                mode === 'overview'
                  ? 'bg-white text-slate-900 shadow-xs border border-slate-200'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <ListOrdered className="w-3.5 h-3.5" />
              <span>ภาพรวมบทเรียน</span>
            </button>
          </div>
        </div>
      </div>

      {/* Scenario Title Banner */}
      <div className="bg-gradient-to-b from-slate-100/90 to-slate-50 border-b border-slate-200 py-6">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-rose-50 text-rose-700 border border-rose-200">
                {scenario.levelTitle}
              </span>
              <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200 flex items-center gap-1">
                <User className="w-3 h-3 text-amber-600" /> คุณสวมบทบาท: ลูกค้า / นักท่องเที่ยว
              </span>
            </div>

            <h1 className="text-xl sm:text-2xl font-black text-slate-900 mt-2 flex items-center gap-2">
              {scenario.title}
              <span className="text-base text-amber-700 font-serif font-semibold">({scenario.titleZh})</span>
            </h1>
            <p className="text-xs text-slate-600 mt-1">{scenario.description}</p>
          </div>

          <div className="text-right text-xs text-slate-600 bg-white/80 p-2.5 rounded-xl border border-slate-200 shadow-2xs">
            <div>สถานที่: <span className="text-slate-900 font-bold">{scenario.location}</span></div>
            <div>จำนวนประโยค: <span className="text-rose-600 font-bold">{scenario.dialogues.length} ประโยค</span></div>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-8 flex-1 w-full">
        {mode === 'vocab' ? (
          /* Step 1: Vocabulary Prep Mode */
          <VocabPrep words={allScenarioWords} onStartDialogue={handleStartDialogue} />
        ) : mode === 'step' ? (
          /* Step 2: Step-by-Step Dialogue Practice Mode */
          <div className="space-y-6">
            {/* Step Progress & Roleplay Helper Bar */}
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-600 font-medium">
                  ความคืบหน้าประโยคที่ <span className="font-bold text-slate-900">{currentIndex + 1}</span> จาก {scenario.dialogues.length}
                </span>
                <span className="text-amber-700 font-mono font-bold">
                  {Math.round(((currentIndex + 1) / scenario.dialogues.length) * 100)}%
                </span>
              </div>
              <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden border border-slate-200">
                <div
                  className="h-full bg-gradient-to-r from-rose-500 to-amber-500 transition-all duration-300 rounded-full"
                  style={{
                    width: `${((currentIndex + 1) / scenario.dialogues.length) * 100}%`,
                  }}
                />
              </div>

              {/* Clear Turn Status Banner */}
              {!isUserTurn ? (
                <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-3 flex flex-wrap items-center justify-between gap-2 text-xs">
                  <div className="flex items-center gap-2 text-indigo-900 font-bold">
                    <Bot className="w-4 h-4 text-indigo-600 animate-pulse" />
                    <span>🔊 1. ฟังคู่สนทนาพูด ({currentDialogue.speakerName})</span>
                  </div>
                  <span className="text-[11px] text-indigo-700 font-medium">
                    ฟังเสียงบทพูดของคู่สนทนาเพื่อทำความเข้าใจ แล้วกด &quot;ตาคุณพูดตอบ&quot;
                  </span>
                </div>
              ) : (
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 flex flex-wrap items-center justify-between gap-2 text-xs">
                  <div className="flex items-center gap-2 text-amber-900 font-bold">
                    <User className="w-4 h-4 text-amber-600" />
                    <span>🎙️ 2. คิวคุณออกเสียงพูดตอบ ({currentDialogue.speakerName})</span>
                  </div>
                  <span className="text-[11px] text-amber-700 font-medium">
                    กดปุ่มไมโครโฟนสีแดงด้านล่าง แล้วลองอ่านประโยคตอบภาษาจีน
                  </span>
                </div>
              )}
            </div>

            {/* IF USER TURN & PRECEDING DIALOGUE IS AI: Show Preceding AI Context Bubble */}
            {isUserTurn && currentIndex > 0 && scenario.dialogues[currentIndex - 1].speaker === 'ai' && (
              <div className="bg-indigo-50/90 border border-indigo-200/90 rounded-2xl p-4 shadow-2xs space-y-2">
                <div className="flex items-center justify-between text-xs font-bold text-indigo-900 border-b border-indigo-200/80 pb-2">
                  <div className="flex items-center gap-1.5">
                    <Bot className="w-4 h-4 text-indigo-600" />
                    <span>💬 คู่สนทนา ({scenario.dialogues[currentIndex - 1].speakerName}) เพิ่งพูดว่า:</span>
                  </div>
                  <AudioPlayer text={scenario.dialogues[currentIndex - 1].hanzi} />
                </div>

                <div className="flex flex-wrap items-baseline gap-2">
                  <span className="text-base sm:text-lg font-black text-slate-900">
                    {scenario.dialogues[currentIndex - 1].hanzi}
                  </span>
                  <span className="text-xs text-rose-600 font-serif font-semibold">
                    ({scenario.dialogues[currentIndex - 1].pinyin})
                  </span>
                </div>

                <p className="text-xs text-slate-600 font-medium">
                  คำแปล: <span className="text-slate-800 font-bold">&quot;{scenario.dialogues[currentIndex - 1].thai}&quot;</span>
                </p>
              </div>
            )}

            {/* Current Sentence Card with Green/Yellow/Red highlights */}
            <PinyinCard
              dialogue={currentDialogue}
              isCurrent={true}
              wordEvaluations={evaluations[currentIndex]?.wordEvaluations}
            />

            {/* Action Area: AI Turn Action vs User Speech Recorder */}
            {!isUserTurn ? (
              /* AI Staff Speaking Action Box */
              <div className="bg-indigo-50/80 border border-indigo-200 rounded-2xl p-4 sm:p-5 shadow-2xs flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <AudioPlayer text={currentDialogue.hanzi} />
                  <span className="text-xs text-indigo-900 font-bold">
                    ฟังเสียง {currentDialogue.speakerName} อีกครั้ง
                  </span>
                </div>

                <button
                  type="button"
                  onClick={handleNext}
                  className="px-5 py-3 rounded-xl bg-gradient-to-r from-rose-500 to-amber-500 hover:from-rose-600 hover:to-amber-600 text-white text-xs sm:text-sm font-bold flex items-center gap-1.5 shadow-md shadow-rose-500/20 transition cursor-pointer touch-manipulation select-none active:scale-95 min-h-[44px]"
                >
                  <span>🎙️ ฟังจบแล้ว ➔ ไปที่คิวออกเสียงพูดของคุณ</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            ) : (
              /* User Speech Recorder Practice Box */
              <div className="space-y-3">
                <SpeechRecorder
                  targetHanzi={currentDialogue.hanzi}
                  targetPinyin={currentDialogue.pinyin}
                  words={currentDialogue.words}
                  onComplete={handleScoreUpdate}
                />
              </div>
            )}

            {/* Step Navigation Controls */}
            <div className="flex items-center justify-between gap-4 pt-4 border-t border-slate-200">
              <button
                type="button"
                onClick={handlePrev}
                disabled={currentIndex === 0}
                className={`px-4.5 py-3 rounded-xl text-xs sm:text-sm font-semibold flex items-center gap-1.5 border transition touch-manipulation select-none min-h-[44px] ${
                  currentIndex === 0
                    ? 'opacity-40 cursor-not-allowed bg-slate-100 border-slate-200 text-slate-400'
                    : 'bg-white hover:bg-slate-100 border-slate-200 text-slate-700 shadow-2xs cursor-pointer active:scale-95'
                }`}
              >
                <ChevronLeft className="w-4 h-4" />
                <span>ประโยคก่อนหน้า</span>
              </button>

              <button
                type="button"
                onClick={handleNext}
                className="px-6 py-3 rounded-xl bg-gradient-to-r from-rose-500 to-amber-500 hover:from-rose-600 hover:to-amber-600 text-white text-xs sm:text-sm font-bold flex items-center gap-1.5 shadow-md shadow-rose-500/20 transition cursor-pointer touch-manipulation select-none active:scale-95 min-h-[44px]"
              >
                <span>
                  {currentIndex === scenario.dialogues.length - 1 ? 'เสร็จสิ้นบทเรียน' : 'ประโยคถัดไป'}
                </span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        ) : (
          /* Overview Mode */
          <div className="space-y-4">
            <div className="bg-amber-50/70 p-4 rounded-2xl border border-amber-200/80 mb-6 text-xs text-amber-900 font-medium">
              💡 โหมดภาพรวมบทสนทนา: คุณสามารถคลิกฟังเสียงหรือแตะที่แต่ละคำเพื่อตรวจดู Pinyin และคำแปลภาษาไทยของทุกประโยคในบทนี้ได้อย่างอิสระ
            </div>

            {scenario.dialogues.map((dlg, idx) => (
              <PinyinCard
                key={dlg.id}
                dialogue={dlg}
                isCurrent={idx === currentIndex}
                wordEvaluations={evaluations[idx]?.wordEvaluations}
              />
            ))}
          </div>
        )}
      </main>

      {/* Completion Modal */}
      {isCompleted && (
        <ScoreModal
          scenarioId={scenario.id}
          scenarioTitle={scenario.title}
          totalScore={calculateAverageScore()}
          onRetry={() => {
            setIsCompleted(false);
            setCurrentIndex(0);
            setScores({});
            setEvaluations({});
          }}
        />
      )}
    </div>
  );
}
