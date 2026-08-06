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
      <div className="min-h-screen bg-slate-950 text-white flex flex-col">
        <Header />
        <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
          <h2 className="text-xl font-bold text-rose-400">ไม่พบบทสนทนาที่ต้องการ</h2>
          <p className="text-xs text-slate-400 mt-2">โปรดเลือกบทสนทนาจากหน้าหลัก</p>
          <Link
            href="/"
            className="mt-4 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold"
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
    const scoreValues = Object.values(scores);
    if (scoreValues.length === 0) return 90; // Default baseline if not recorded
    const sum = scoreValues.reduce((acc, curr) => acc + curr, 0);
    return Math.round(sum / scoreValues.length);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-rose-500 selection:text-white">
      <Header />

      {/* Breadcrumb & Navigation Header */}
      <div className="bg-slate-900/80 border-b border-slate-800 py-3.5 px-4 sm:px-6">
        <div className="max-w-4xl mx-auto flex flex-wrap items-center justify-between gap-3 text-xs">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 font-medium text-slate-400 hover:text-white transition"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>กลับหน้าเลือกบทเรียน</span>
          </Link>

          {/* Practice Mode Toggle */}
          <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800">
            <button
              onClick={() => setMode('vocab')}
              className={`px-3 py-1.5 rounded-lg transition font-semibold flex items-center gap-1.5 ${
                mode === 'vocab'
                  ? 'bg-gradient-to-r from-amber-500 to-rose-500 text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>📚 1. ปูพื้นฐานคำศัพท์</span>
            </button>

            <button
              onClick={() => setMode('step')}
              className={`px-3 py-1.5 rounded-lg transition font-semibold flex items-center gap-1.5 ${
                mode === 'step'
                  ? 'bg-gradient-to-r from-rose-500 to-amber-500 text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Mic className="w-3.5 h-3.5" />
              <span>💬 2. ฝึกพูดในบทบาทลูกค้า</span>
            </button>

            <button
              onClick={() => setMode('overview')}
              className={`px-3 py-1.5 rounded-lg transition font-medium flex items-center gap-1.5 ${
                mode === 'overview'
                  ? 'bg-slate-800 text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <ListOrdered className="w-3.5 h-3.5" />
              <span>ภาพรวมบทเรียน</span>
            </button>
          </div>
        </div>
      </div>

      {/* Scenario Title Banner */}
      <div className="bg-gradient-to-b from-slate-900/90 to-slate-950 border-b border-slate-800/80 py-6">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30">
                {scenario.levelTitle}
              </span>
              <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 flex items-center gap-1">
                <User className="w-3 h-3" /> คุณสวมบทบาท: ลูกค้า / นักท่องเที่ยว
              </span>
            </div>

            <h1 className="text-xl sm:text-2xl font-black text-white mt-2 flex items-center gap-2">
              {scenario.title}
              <span className="text-base text-amber-400 font-serif font-medium">({scenario.titleZh})</span>
            </h1>
            <p className="text-xs text-slate-400 mt-1">{scenario.description}</p>
          </div>

          <div className="text-right text-xs text-slate-400 bg-slate-950/60 p-2.5 rounded-xl border border-slate-800">
            <div>สถานที่: <span className="text-slate-200 font-medium">{scenario.location}</span></div>
            <div>จำนวนประโยค: <span className="text-rose-400 font-bold">{scenario.dialogues.length} ประโยค</span></div>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-8 flex-1 w-full">
        {mode === 'vocab' ? (
          /* Step 1: Vocabulary Prep Mode */
          <VocabPrep words={allScenarioWords} onStartDialogue={() => setMode('step')} />
        ) : mode === 'step' ? (
          /* Step 2: Step-by-Step Dialogue Practice Mode */
          <div className="space-y-6">
            {/* Step Progress Bar */}
            <div className="bg-slate-900 p-4 rounded-2xl border border-slate-800">
              <div className="flex items-center justify-between text-xs mb-2">
                <span className="text-slate-400">
                  ความคืบหน้าประโยคที่ {currentIndex + 1} จาก {scenario.dialogues.length}
                </span>
                <span className="text-amber-400 font-mono font-bold">
                  {Math.round(((currentIndex + 1) / scenario.dialogues.length) * 100)}%
                </span>
              </div>
              <div className="w-full h-2 bg-slate-950 rounded-full overflow-hidden border border-slate-800">
                <div
                  className="h-full bg-gradient-to-r from-rose-500 to-amber-500 transition-all duration-300 rounded-full"
                  style={{
                    width: `${((currentIndex + 1) / scenario.dialogues.length) * 100}%`,
                  }}
                />
              </div>
            </div>

            {/* Current Sentence Card with Green/Yellow/Red highlights */}
            <PinyinCard
              dialogue={currentDialogue}
              isCurrent={true}
              wordEvaluations={evaluations[currentIndex]?.wordEvaluations}
            />

            {/* Distinct Role Card: AI Staff Speaking VS User Customer Practice */}
            {!isUserTurn ? (
              /* AI Staff Speaking Card */
              <div className="bg-slate-900/90 border border-indigo-500/30 rounded-2xl p-5 shadow-xl text-white">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-3">
                  <div className="flex items-center gap-2 text-indigo-300 font-bold text-xs">
                    <Bot className="w-4 h-4 text-indigo-400" />
                    <span>บทพูดของ {currentDialogue.speakerName} (ฟังเพื่อเตรียมตอบในฐานะลูกค้า)</span>
                  </div>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                    🔊 ฟังเสียงโต้ตอบจากพนักงาน
                  </span>
                </div>

                <p className="text-xs text-slate-300 mb-3">
                  ประโยคนี้เป็นคำถาม/คำพูดของคู่สนทนา ให้กดฟังเสียงอ่านแล้วเตรียมตอบกลับในประโยคถัดไปครับ
                </p>

                <div className="flex items-center justify-between gap-3">
                  <AudioPlayer text={currentDialogue.hanzi} />

                  <button
                    onClick={handleNext}
                    className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-rose-500 to-amber-500 hover:from-rose-600 hover:to-amber-600 text-white text-xs font-bold flex items-center gap-1.5 shadow-lg shadow-rose-500/25 transition"
                  >
                    <span>ไปยังประโยคตอบของคุณ (ลูกค้า)</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ) : (
              /* User Customer Speech Practice Card */
              <div className="space-y-3">
                <div className="flex items-center justify-between text-xs px-3 py-2 rounded-xl bg-amber-500/10 border border-amber-500/30 font-semibold text-amber-300">
                  <span className="flex items-center gap-2">
                    <User className="w-4 h-4 text-amber-400" />
                    <span>บทพูดของคุณในฐานะลูกค้า ({currentDialogue.speakerName}): กดไมค์เพื่อออกเสียงโต้ตอบ</span>
                  </span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                    🎙️ ถึงคิวคุณออกเสียง
                  </span>
                </div>

                <SpeechRecorder
                  targetHanzi={currentDialogue.hanzi}
                  targetPinyin={currentDialogue.pinyin}
                  words={currentDialogue.words}
                  onComplete={handleScoreUpdate}
                />
              </div>
            )}

            {/* Step Navigation Controls */}
            <div className="flex items-center justify-between gap-4 pt-4 border-t border-slate-800">
              <button
                onClick={handlePrev}
                disabled={currentIndex === 0}
                className={`px-4 py-2.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 border transition ${
                  currentIndex === 0
                    ? 'opacity-40 cursor-not-allowed bg-slate-900 border-slate-800 text-slate-500'
                    : 'bg-slate-900 hover:bg-slate-800 border-slate-700 text-slate-200'
                }`}
              >
                <ChevronLeft className="w-4 h-4" />
                <span>ประโยคก่อนหน้า</span>
              </button>

              <button
                onClick={handleNext}
                className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-rose-500 to-amber-500 hover:from-rose-600 hover:to-amber-600 text-white text-xs font-bold flex items-center gap-1.5 shadow-lg shadow-rose-500/25 transition"
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
            <div className="bg-slate-900/60 p-4 rounded-2xl border border-slate-800 mb-6 text-xs text-slate-300">
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
