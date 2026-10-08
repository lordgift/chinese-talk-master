'use client';

import { useState, use, useMemo, useSyncExternalStore } from 'react';
import Link from 'next/link';
import { SCENARIOS } from '@/data/scenarios';
import { Header } from '@/components/Header';
import { useAuth } from '@/context/AuthContext';
import { PinyinCard } from '@/components/PinyinCard';
import { SpeechRecorder } from '@/components/SpeechRecorder';
import { VocabPrep } from '@/components/VocabPrep';
import { SentenceExpansionBuilder } from '@/components/SentenceExpansionBuilder';
import { MemoryQuiz } from '@/components/MemoryQuiz';
import { ScoreModal } from '@/components/ScoreModal';
import { AudioPlayer } from '@/components/AudioPlayer';
import {
  ArrowLeft,
  ChevronRight,
  ChevronLeft,
  BookOpen,
  Layers,
  Puzzle,
  ListOrdered,
  Mic,
  Brain,
  User,
  Bot,
  Sparkles,
  Volume2,
  X,
} from 'lucide-react';
import { useSpeechSynthesis } from '@/hooks/useSpeechSynthesis';
import {
  DetailedSpeechEvaluation,
  DialogueLine,
  MemoryQuizQuestion,
  WordBreakdown,
  getScenarioExpansions,
  getScenarioMemoryQuiz,
} from '@/lib/pinyinUtils';

const subscribeNoop = () => () => {};

function pickDialogueVariants(lines: DialogueLine[], round: number): DialogueLine[] {
  return lines.map((line) => {
    if (line.speaker !== 'ai' || !line.variants?.length) return line;
    // First round keeps the scripted line; later rounds pick randomly among all replies
    const options = [line, ...line.variants];
    const pick = round === 0 ? line : options[Math.floor(Math.random() * options.length)];
    if (pick === line) return line;
    return {
      ...line,
      hanzi: pick.hanzi,
      pinyin: pick.pinyin,
      thai: pick.thai,
      words: pick.words ?? [],
      audioHint: undefined, // hint was written for the scripted line
    };
  });
}

interface PageProps {
  params: Promise<{
    scenarioId: string;
  }>;
}

export default function SessionPage({ params }: PageProps) {
  const resolvedParams = use(params);
  const scenario = SCENARIOS.find((s) => s.id === resolvedParams.scenarioId);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [mode, setMode] = useState<'expansion' | 'step' | 'quiz' | 'vocab' | 'overview'>('expansion');
  const [scores, setScores] = useState<Record<number, number>>({});
  const [evaluations, setEvaluations] = useState<Record<number, DetailedSpeechEvaluation | undefined>>({});
  const [isCompleted, setIsCompleted] = useState(false);
  const [quizScore, setQuizScore] = useState<number | null>(null);
  const [showImageModal, setShowImageModal] = useState(false);

  const { speak } = useSpeechSynthesis();

  // Shuffled puzzles/quizzes are generated on the client only (avoids SSR hydration mismatch)
  // and memoized so re-renders don't reshuffle words under the user's selections
  const isClient = useSyncExternalStore(subscribeNoop, () => true, () => false);
  const expansions = useMemo(
    () => (isClient && scenario ? getScenarioExpansions(scenario) : null),
    [isClient, scenario]
  );
  // Quiz is generated when the learner opens it (not during render), so it can include
  // review words from their latest progress without reshuffling mid-quiz
  const [quizQuestions, setQuizQuestions] = useState<MemoryQuizQuestion[] | null>(null);
  const { userProgress, userSavedWords } = useAuth();

  // AI partner lines may have several natural replies; pick one per practice round (client only)
  // so learners get used to answers that don't match the script word for word
  const [variantRound, setVariantRound] = useState(0);
  const dialogues = useMemo(
    () => (scenario ? (isClient ? pickDialogueVariants(scenario.dialogues, variantRound) : scenario.dialogues) : []),
    [isClient, scenario, variantRound]
  );

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
  const allScenarioWords: WordBreakdown[] = dialogues.flatMap((d) => d.words || []);
  const currentDialogue = dialogues[currentIndex];
  const isUserTurn = currentDialogue?.speaker === 'user';

  const handleScoreUpdate = (score: number, evalResult?: DetailedSpeechEvaluation) => {
    setScores((prev) => ({ ...prev, [currentIndex]: score }));
    setEvaluations((prev) => ({ ...prev, [currentIndex]: evalResult }));
  };

  const handleStartExpansion = () => {
    setMode('expansion');
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleStartDialogue = () => {
    setMode('step');
    setCurrentIndex(0);
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
    if (dialogues[0]?.speaker === 'ai') {
      speak(dialogues[0].hanzi);
    }
  };

  // Review pool: saved words first, then words from finished lessons with the lowest best score
  const buildReviewWords = (): WordBreakdown[] => {
    const saved: WordBreakdown[] = Object.values(userSavedWords).map((w) => ({
      hanzi: w.hanzi,
      pinyin: w.pinyin,
      thai: w.thai,
      tones: w.tones,
    }));
    const fromLessons = Object.values(userProgress)
      .filter((p) => p.scenarioId !== scenario.id)
      .sort((a, b) => a.bestScore - b.bestScore)
      .flatMap((p) => SCENARIOS.find((sc) => sc.id === p.scenarioId)?.dialogues.flatMap((d) => d.words || []) ?? []);
    return [...saved, ...fromLessons];
  };

  const openQuiz = (regenerate = false) => {
    if (regenerate || !quizQuestions) {
      setQuizQuestions(getScenarioMemoryQuiz(scenario, buildReviewWords()));
    }
    setMode('quiz');
  };

  const handleStartQuiz = () => {
    openQuiz();
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleStartVocabSummary = () => {
    setMode('vocab');
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleNext = () => {
    if (currentIndex < dialogues.length - 1) {
      const nextIndex = currentIndex + 1;
      setCurrentIndex(nextIndex);

      // Auto speak if AI line
      if (dialogues[nextIndex].speaker === 'ai') {
        speak(dialogues[nextIndex].hanzi);
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
    const userTurnIndices = dialogues
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

      {/* Breadcrumb & 4-Stage Navigation Bar */}
      <div className="bg-white/90 border-b border-slate-200/80 py-3 px-4 sm:px-6 sticky top-14 sm:top-16 z-30 backdrop-blur-md">
        <div className="max-w-5xl mx-auto flex flex-wrap items-center justify-between gap-3 text-xs">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 font-semibold text-slate-600 hover:text-slate-900 transition"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>กลับหน้าหลัก</span>
          </Link>

          {/* 4-Stage Learning Mode Tabs */}
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-2xl border border-slate-200 overflow-x-auto max-w-full">
            <button
              type="button"
              onClick={() => setMode('expansion')}
              className={`px-3 py-1.5 rounded-xl transition font-bold flex items-center gap-1.5 touch-manipulation select-none cursor-pointer active:scale-95 min-h-[36px] whitespace-nowrap ${
                mode === 'expansion'
                  ? 'bg-gradient-to-r from-amber-500 to-rose-500 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Puzzle className="w-3.5 h-3.5" />
              <span>1. 🧩 เรียงคำเป็นประโยค</span>
            </button>

            <button
              type="button"
              onClick={() => setMode('step')}
              className={`px-3 py-1.5 rounded-xl transition font-bold flex items-center gap-1.5 touch-manipulation select-none cursor-pointer active:scale-95 min-h-[36px] whitespace-nowrap ${
                mode === 'step'
                  ? 'bg-rose-500 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Mic className="w-3.5 h-3.5" />
              <span>2. 💬 สนทนาจริง</span>
            </button>

            <button
              type="button"
              onClick={() => openQuiz()}
              className={`px-3 py-1.5 rounded-xl transition font-bold flex items-center gap-1.5 touch-manipulation select-none cursor-pointer active:scale-95 min-h-[36px] whitespace-nowrap ${
                mode === 'quiz'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Brain className="w-3.5 h-3.5" />
              <span>3. 🧠 ควิซทบทวน</span>
            </button>

            <button
              type="button"
              onClick={() => setMode('vocab')}
              className={`px-3 py-1.5 rounded-xl transition font-bold flex items-center gap-1.5 touch-manipulation select-none cursor-pointer active:scale-95 min-h-[36px] whitespace-nowrap ${
                mode === 'vocab'
                  ? 'bg-amber-500 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>4. 📚 สรุปคำศัพท์</span>
            </button>

            <button
              type="button"
              onClick={() => setMode('overview')}
              className={`px-2.5 py-1.5 rounded-xl transition font-semibold flex items-center gap-1 touch-manipulation select-none cursor-pointer active:scale-95 min-h-[36px] whitespace-nowrap ${
                mode === 'overview'
                  ? 'bg-white text-slate-900 shadow-2xs border border-slate-200'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <ListOrdered className="w-3.5 h-3.5" />
              <span>ภาพรวม</span>
            </button>
          </div>
        </div>
      </div>

      {/* Scenario Title Banner & Ghibli Scene Hero */}
      <div className="bg-gradient-to-b from-slate-100/90 to-slate-50 border-b border-slate-200 py-5 sm:py-7">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-center">
            {/* Left Column: Info & Badges */}
            <div className={`${scenario.image ? 'md:col-span-7' : 'md:col-span-12'} space-y-3`}>
              <div className="flex items-center gap-2 flex-wrap">
                <span
                  className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${
                    scenario.level === 'easy'
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                      : scenario.level === 'medium'
                      ? 'bg-amber-50 text-amber-700 border-amber-200'
                      : 'bg-rose-50 text-rose-700 border-rose-200'
                  }`}
                >
                  {scenario.levelTitle}
                </span>
                <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200 flex items-center gap-1">
                  <User className="w-3 h-3 text-amber-600" /> สวมบทบาท: ลูกค้า / นักท่องเที่ยว
                </span>
                <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-sky-50 text-sky-700 border border-sky-200 flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-sky-500" /> สไตล์ Ghibli 2D
                </span>
              </div>

              <div>
                <h1 className="text-xl sm:text-2xl font-black text-slate-900 flex flex-wrap items-baseline gap-2">
                  <span>{scenario.title}</span>
                  <span className="text-base text-amber-700 font-serif font-semibold">({scenario.titleZh})</span>
                </h1>
                <p className="text-xs sm:text-sm text-slate-600 mt-1.5 leading-relaxed">{scenario.description}</p>
              </div>

              <div className="flex flex-wrap items-center gap-4 text-xs text-slate-600 pt-1">
                <div className="flex items-center gap-1.5 font-medium bg-white/80 px-3 py-1.5 rounded-xl border border-slate-200 shadow-2xs">
                  <span className="text-slate-400">📍 สถานที่:</span>
                  <span className="text-slate-900 font-bold">{scenario.location}</span>
                </div>
                <div className="flex items-center gap-1.5 font-medium bg-white/80 px-3 py-1.5 rounded-xl border border-slate-200 shadow-2xs">
                  <span className="text-slate-400">💬 จำนวน:</span>
                  <span className="text-rose-600 font-bold">{dialogues.length} ประโยค</span>
                </div>
              </div>
            </div>

            {/* Right Column: Interactive Ghibli Illustration Card */}
            {scenario.image && (
              <div className="md:col-span-5">
                <div
                  onClick={() => setShowImageModal(true)}
                  className="group relative rounded-2xl overflow-hidden border border-slate-200/90 shadow-md hover:shadow-xl transition-all duration-300 cursor-pointer aspect-[16/9] bg-slate-900/5 ring-1 ring-black/5 hover:ring-rose-400/40"
                  title={scenario.title}
                >
                  <img
                    src={scenario.image}
                    alt={scenario.imageAlt || scenario.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/20 via-transparent to-black/5 pointer-events-none" />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Fullscreen Ghibli Image Modal */}
      {showImageModal && scenario.image && (
        <div
          onClick={() => setShowImageModal(false)}
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-200"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative max-w-4xl w-full bg-white rounded-3xl overflow-hidden shadow-2xl border border-slate-200/80 flex flex-col max-h-[90vh]"
          >
            <div className="relative aspect-[16/9] w-full bg-slate-950 flex items-center justify-center overflow-hidden">
              <img
                src={scenario.image}
                alt={scenario.imageAlt || scenario.title}
                className="w-full h-full object-contain"
              />
              <button
                type="button"
                onClick={() => setShowImageModal(false)}
                className="absolute top-3.5 right-3.5 w-9 h-9 rounded-full bg-black/60 hover:bg-black/90 text-white flex items-center justify-center backdrop-blur-md transition-colors cursor-pointer border border-white/20"
                title="ปิด"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-5 sm:p-6 bg-white space-y-2 overflow-y-auto">
              <div className="flex items-center justify-between gap-2 flex-wrap">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-rose-50 text-rose-700 border border-rose-200">
                    {scenario.location}
                  </span>
                  <span className="text-xs font-medium text-slate-500">ภาพประกอบสถานการณ์สไตล์ Ghibli 2D</span>
                </div>
                <span className="text-xs text-slate-400">ภาพจำลองเพื่อสร้างจินตนาการและการเรียนรู้</span>
              </div>
              <h3 className="text-lg font-bold text-slate-900">{scenario.title}</h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">{scenario.description}</p>
            </div>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-8 flex-1 w-full">
        {mode === 'expansion' ? (
          /* Step 1: Progressive Sentence Expansion & Chunk Listening */
          expansions ? (
            <SentenceExpansionBuilder
              expansions={expansions}
              onProceedToDialogue={handleStartDialogue}
            />
          ) : (
            <div className="bg-white p-6 rounded-3xl border border-slate-200 text-center text-sm text-slate-400">กำลังโหลด...</div>
          )
        ) : mode === 'step' ? (
          /* Step 2: Step-by-Step Dialogue Practice Mode */
          <div className="space-y-6">
            {/* Step Progress & Roleplay Helper Bar */}
            <div className="bg-white p-4 rounded-3xl border border-slate-200 shadow-xs space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-600 font-medium">
                  ความคืบหน้าประโยคที่ <span className="font-bold text-slate-900">{currentIndex + 1}</span> จาก {dialogues.length}
                </span>
                <span className="text-amber-700 font-mono font-bold">
                  {Math.round(((currentIndex + 1) / dialogues.length) * 100)}%
                </span>
              </div>
              <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden border border-slate-200">
                <div
                  className="h-full bg-gradient-to-r from-rose-500 to-amber-500 transition-all duration-300 rounded-full"
                  style={{
                    width: `${((currentIndex + 1) / dialogues.length) * 100}%`,
                  }}
                />
              </div>

              {/* Clear Turn Status Banner */}
              {!isUserTurn ? (
                <div className="bg-indigo-50 border border-indigo-200 rounded-2xl p-3 flex flex-wrap items-center justify-between gap-2 text-xs">
                  <div className="flex items-center gap-2 text-indigo-900 font-bold">
                    <Bot className="w-4 h-4 text-indigo-600 animate-pulse" />
                    <span>🔊 1. ฟังคู่สนทนาพูด ({currentDialogue.speakerName})</span>
                  </div>
                  <span className="text-[11px] text-indigo-700 font-medium">
                    ฟังเสียงบทพูดของคู่สนทนาเพื่อทำความเข้าใจ แล้วกด &quot;ตาคุณพูดตอบ&quot;
                  </span>
                </div>
              ) : (
                <div className="bg-amber-50 border border-amber-200 rounded-2xl p-3 flex flex-wrap items-center justify-between gap-2 text-xs">
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
            {isUserTurn && currentIndex > 0 && dialogues[currentIndex - 1].speaker === 'ai' && (
              <div className="bg-indigo-50/90 border border-indigo-200/90 rounded-2xl p-4 shadow-2xs space-y-2">
                <div className="flex items-center justify-between text-xs font-bold text-indigo-900 border-b border-indigo-200/80 pb-2">
                  <div className="flex items-center gap-1.5">
                    <Bot className="w-4 h-4 text-indigo-600" />
                    <span>💬 คู่สนทนา ({dialogues[currentIndex - 1].speakerName}) เพิ่งพูดว่า:</span>
                  </div>
                  <AudioPlayer text={dialogues[currentIndex - 1].hanzi} />
                </div>

                <div className="flex flex-wrap items-baseline gap-2">
                  <span className="text-base sm:text-lg font-black text-slate-900">
                    {dialogues[currentIndex - 1].hanzi}
                  </span>
                  <span className="text-xs text-rose-600 font-serif font-semibold">
                    ({dialogues[currentIndex - 1].pinyin})
                  </span>
                </div>

                <p className="text-xs text-slate-600 font-medium">
                  คำแปล: <span className="text-slate-800 font-bold">&quot;{dialogues[currentIndex - 1].thai}&quot;</span>
                </p>
              </div>
            )}

            {/* AI Partner Turn VS User Speech Practice Box */}
            {!isUserTurn ? (
              /* Dedicated AI Partner Cool Sky-Indigo Theme Card */
              <div className="rounded-3xl bg-gradient-to-br from-sky-950 via-indigo-950 to-slate-950 border-2 border-sky-400/60 p-5 sm:p-8 shadow-2xl space-y-6 text-white relative overflow-hidden">
                {/* Glow Ambient background lights */}
                <div className="absolute -top-20 -left-20 w-60 h-60 bg-sky-500/20 rounded-full blur-3xl pointer-events-none" />
                <div className="absolute -bottom-20 -right-20 w-60 h-60 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none" />

                {/* Header: AI Avatar & Speaking Badge */}
                <div className="flex flex-wrap items-center justify-between border-b border-sky-800/70 pb-4 gap-3 relative z-10">
                  <div className="flex items-center gap-3">
                    <span className="text-3xl p-3 rounded-2xl bg-sky-900/80 border border-sky-600/80 shadow-inner">
                      {currentDialogue.avatar || '👨‍💼'}
                    </span>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-base sm:text-lg font-black text-white">
                          {currentDialogue.speakerName}
                        </h3>
                        <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-sky-400/20 text-sky-200 border border-sky-400/40">
                          🤖 คู่สนทนา (AI Partner)
                        </span>
                      </div>
                      <p className="text-xs text-sky-300 font-medium mt-1 flex items-center gap-1.5">
                        <Volume2 className="w-4 h-4 text-sky-400 animate-pulse" />
                        <span>กำลังพูดเปิดบทสนทนา / ถามคำถามกับคุณ</span>
                      </p>
                    </div>
                  </div>

                  <AudioPlayer text={currentDialogue.hanzi} />
                </div>

                {/* Main Speech Content Display */}
                <div className="bg-slate-900/90 backdrop-blur-md rounded-2xl p-4 sm:p-6 border border-sky-700/50 shadow-inner relative z-10 text-slate-900">
                  <PinyinCard
                    dialogue={currentDialogue}
                    isCurrent={true}
                    wordEvaluations={evaluations[currentIndex]?.wordEvaluations}
                  />
                </div>

                {!!scenario.dialogues[currentIndex]?.variants?.length && (
                  <p className="relative z-10 text-[11px] text-sky-200/90 text-center -mt-2">
                    🎲 คนจีนตอบประโยคนี้ได้หลายแบบ ฝึกรอบหน้าคุณอาจได้ยินคำตอบแบบอื่น ลองฟังจับใจความให้ได้นะครับ
                  </p>
                )}

                {/* Prominent Action Button to Proceed to User Turn */}
                <div className="pt-2 flex justify-center relative z-10">
                  <button
                    type="button"
                    onClick={handleNext}
                    className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-gradient-to-r from-rose-500 via-amber-500 to-rose-600 hover:from-rose-600 hover:to-amber-600 text-white text-sm sm:text-base font-black shadow-xl shadow-rose-500/30 transition-all cursor-pointer touch-manipulation select-none active:scale-95 flex items-center justify-center gap-3 group"
                  >
                    <span>🎙️ ฟังจบแล้ว ➔ ไปที่คิวออกเสียงพูดของคุณ</span>
                    <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </button>
                </div>
              </div>
            ) : (
              /* User Customer Speech Practice Warm Card */
              <div className="rounded-3xl bg-gradient-to-br from-amber-500/10 via-rose-500/5 to-emerald-500/10 border-2 border-amber-400/90 p-5 sm:p-7 shadow-xl space-y-5 relative overflow-hidden bg-white">
                <div className="absolute -top-16 -right-16 w-48 h-48 bg-amber-400/15 rounded-full blur-2xl pointer-events-none" />

                <div className="flex items-center justify-between border-b border-amber-200/90 pb-4 relative z-10">
                  <div className="flex items-center gap-3">
                    <span className="text-3xl p-2.5 rounded-2xl bg-amber-50 border border-amber-200 shadow-2xs">
                      {currentDialogue.avatar || '🙋‍♂️'}
                    </span>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-base sm:text-lg font-black text-amber-950">
                          {currentDialogue.speakerName} (คุณ)
                        </h3>
                        <span className="text-[11px] font-extrabold px-3 py-0.5 rounded-full bg-amber-500 text-white shadow-xs">
                          🎙️ ตาคุณออกเสียงพูดตอบ
                        </span>
                      </div>
                      <p className="text-xs text-amber-800 font-medium mt-0.5">
                        ลองกดไมค์สีแดงด้านล่าง แล้วพูดประโยคภาษาจีนโต้ตอบคู่สนทนา
                      </p>
                    </div>
                  </div>
                </div>

                <div className="relative z-10 space-y-4">
                  <PinyinCard
                    dialogue={currentDialogue}
                    isCurrent={true}
                    wordEvaluations={evaluations[currentIndex]?.wordEvaluations}
                  />

                  <SpeechRecorder
                    targetHanzi={currentDialogue.hanzi}
                    targetPinyin={currentDialogue.pinyin}
                    words={currentDialogue.words}
                    onComplete={handleScoreUpdate}
                  />
                </div>
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
                  {currentIndex === dialogues.length - 1 ? 'เสร็จสิ้นบทเรียน' : 'ประโยคถัดไป'}
                </span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        ) : mode === 'quiz' ? (
          /* Step 3: Memory Retention Quick-Quiz */
          quizQuestions ? (
            <MemoryQuiz
              questions={quizQuestions}
              onComplete={(score) => setQuizScore(score)}
              onRetry={() => {
                setQuizScore(null);
                openQuiz(true); // fresh listening/review questions each round
              }}
              onProceedToVocabSummary={handleStartVocabSummary}
            />
          ) : (
            <div className="bg-white p-6 rounded-3xl border border-slate-200 text-center text-sm text-slate-400">กำลังโหลด...</div>
          )
        ) : mode === 'vocab' ? (
          /* Step 4: Vocabulary Summary & Personal Word Bookmark */
          <VocabPrep
            words={allScenarioWords}
            coreKeywords={scenario.coreKeywords}
            scenarioId={scenario.id}
            scenarioTitle={scenario.title}
            onStartExpansion={handleStartExpansion}
            onStartDialogue={handleStartDialogue}
            onRetryLesson={() => {
              setIsCompleted(false);
              setCurrentIndex(0);
              setScores({});
              setEvaluations({});
              setVariantRound((r) => r + 1);
              setMode('step');
            }}
          />
        ) : (
          /* Overview Mode */
          <div className="space-y-4">
            <div className="bg-amber-50/70 p-4 rounded-2xl border border-amber-200/80 mb-6 text-xs text-amber-900 font-medium">
              💡 โหมดภาพรวมบทสนทนา: คุณสามารถคลิกฟังเสียงหรือแตะที่แต่ละคำเพื่อตรวจดู Pinyin และคำแปลภาษาไทยของทุกประโยคในบทนี้ได้อย่างอิสระ
            </div>

            {dialogues.map((dlg, idx) => {
              const original = scenario.dialogues[idx];
              const alternatives = original.variants?.length
                ? [original, ...original.variants].filter((v) => v.hanzi !== dlg.hanzi)
                : [];
              return (
                <div key={dlg.id} className="space-y-2">
                  <PinyinCard
                    dialogue={dlg}
                    isCurrent={idx === currentIndex}
                    wordEvaluations={evaluations[idx]?.wordEvaluations}
                  />
                  {alternatives.length > 0 && (
                    <div className="ml-4 sm:ml-8 p-3 rounded-xl bg-sky-50 border border-sky-200 text-xs text-sky-900 space-y-1.5">
                      <p className="font-bold">🎲 คู่สนทนาอาจตอบแบบอื่นได้:</p>
                      {alternatives.map((alt) => (
                        <div key={alt.hanzi} className="flex items-start gap-2">
                          <AudioPlayer text={alt.hanzi} compact />
                          <div>
                            <p className="font-bold text-sm text-slate-900">{alt.hanzi}</p>
                            <p className="text-amber-800">{alt.pinyin}</p>
                            <p className="text-slate-600">{alt.thai}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
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
            setVariantRound((r) => r + 1);
          }}
          onProceedToQuiz={() => {
            setIsCompleted(false);
            handleStartQuiz();
          }}
          onProceedToVocabSummary={() => {
            setIsCompleted(false);
            handleStartVocabSummary();
          }}
        />
      )}
    </div>
  );
}
