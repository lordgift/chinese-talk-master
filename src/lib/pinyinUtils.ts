export interface WordBreakdown {
  hanzi: string;
  pinyin: string;
  thai: string;
  tones?: number[]; // Array of tone numbers 1, 2, 3, 4, 5 for each syllable
}

export interface DialogueLine {
  id: string;
  speaker: 'ai' | 'user';
  speakerName: string;
  avatar: string;
  hanzi: string;
  pinyin: string;
  thai: string;
  audioHint?: string;
  words: WordBreakdown[];
}

export type CategoryId =
  | 'survival-foundation'
  | 'travel-transport'
  | 'dining-shopping'
  | 'hotel-stay'
  | 'weather-climate';

export interface SentenceExpansionStep {
  stepNumber: number;
  hanzi: string;
  pinyin: string;
  thai: string;
  addedPart?: string; // New word or chunk added at this step
  explanation?: string;
}

export interface SentenceExpansion {
  id: string;
  targetHanzi: string;
  targetPinyin: string;
  targetThai: string;
  scenarioContext?: string;
  steps: SentenceExpansionStep[];
  scrambledWords?: { hanzi: string; pinyin: string; thai: string }[];
}

export interface MemoryQuizOption {
  text: string;
  textZh?: string;
  isCorrect: boolean;
}

export interface MemoryQuizQuestion {
  id: string;
  type: 'listen-meaning' | 'fill-blank' | 'scenario-response';
  questionText: string;
  audioText?: string;
  promptZh?: string;
  promptPinyin?: string;
  options: MemoryQuizOption[];
  explanation: string;
}

export interface Scenario {
  id: string;
  categoryId: CategoryId;
  level: 'easy' | 'medium' | 'hard';
  levelTitle: string;
  title: string;
  titleZh: string;
  description: string;
  icon: string;
  location: string;
  estimatedMinutes: number;
  dialogues: DialogueLine[];
  coreKeywords?: WordBreakdown[];
  expansions?: SentenceExpansion[];
  memoryQuiz?: MemoryQuizQuestion[];
}

export interface Category {
  id: CategoryId;
  title: string;
  titleZh: string;
  description: string;
  icon: string;
  color: string;
  bgGradient: string;
  scenariosCount: number;
  isAvailable: boolean;
}

export interface WordEvaluation {
  word: WordBreakdown;
  status: 'correct' | 'partial' | 'missed';
  matchedCharsCount: number;
  totalCharsCount: number;
  reasonType?: 'mispronounced' | 'wrong_word' | 'omitted';
  reasonExplanation?: string;
}

export interface DetailedSpeechEvaluation {
  score: number;
  grade: 'S' | 'A' | 'B' | 'C';
  feedbackMsg: string;
  wordEvaluations: WordEvaluation[];
  correctCount: number;
  missedCount: number;
}

/**
 * Get Tailwind CSS color for Pinyin tones
 */
export function getToneColorClass(tone?: number): { text: string; bg: string; border: string } {
  switch (tone) {
    case 1:
      return { text: 'text-rose-600 font-bold', bg: 'bg-rose-50', border: 'border-rose-200' };
    case 2:
      return { text: 'text-emerald-700 font-bold', bg: 'bg-emerald-50', border: 'border-emerald-200' };
    case 3:
      return { text: 'text-amber-700 font-bold', bg: 'bg-amber-50', border: 'border-amber-200' };
    case 4:
      return { text: 'text-indigo-700 font-bold', bg: 'bg-indigo-50', border: 'border-indigo-200' };
    case 5:
    default:
      return { text: 'text-slate-600 font-semibold', bg: 'bg-slate-100', border: 'border-slate-200' };
  }
}

function getCleanComparableText(text: string): string {
  if (!text) return '';
  // Convert Pinyin ü / v variants to normalized yu for flexible matching
  const normalized = text
    .toLowerCase()
    .replace(/ü|ǖ|ǘ|ǚ|ǜ|v/gi, 'yu')
    .replace(/于|迂|余|鱼/g, 'yu');

  // If text has Chinese characters, use Chinese characters + letters
  const clean = normalized.replace(/[^\u4e00-\u9fa5a-z0-9]/g, '');
  if (clean.length > 0) return clean;

  // Fallback: strip punctuation only
  return normalized.replace(/[^\w]/g, '');
}

/**
 * Calculate similarity between user speech input and target Chinese text
 */
export function evaluateSpeechAccuracy(recognizedText: string, targetHanzi: string): {
  score: number;
  matchedChars: boolean[];
  feedbackMsg: string;
  grade: 'S' | 'A' | 'B' | 'C';
} {
  if (!recognizedText || recognizedText.trim() === '') {
    return {
      score: 0,
      matchedChars: new Array(targetHanzi.length).fill(false),
      feedbackMsg: 'ยังไม่ได้รับเสียงพูด ลองกดไมค์แล้วออกเสียงอีกครั้งนะครับ',
      grade: 'C',
    };
  }

  const cleanTarget = getCleanComparableText(targetHanzi);
  const cleanRecognized = getCleanComparableText(recognizedText);

  if (cleanTarget.length === 0) {
    return {
      score: 100,
      matchedChars: [],
      feedbackMsg: 'ยอดเยี่ยมมากครับ!',
      grade: 'S',
    };
  }

  let matchCount = 0;
  const matchedChars: boolean[] = [];

  for (let i = 0; i < cleanTarget.length; i++) {
    const char = cleanTarget[i];
    if (cleanRecognized.includes(char)) {
      matchCount++;
      matchedChars.push(true);
    } else {
      matchedChars.push(false);
    }
  }

  const rawScore = Math.round((matchCount / cleanTarget.length) * 100);
  // Bonus score if exact substring match
  const finalScore = cleanRecognized.includes(cleanTarget) ? 100 : Math.min(100, rawScore);

  let feedbackMsg = '';
  let grade: 'S' | 'A' | 'B' | 'C' = 'C';

  if (finalScore >= 90) {
    grade = 'S';
    feedbackMsg = '🎉 สุดยอดมาก! ออกเสียงได้ถูกต้องแม่นยำทุกคำ';
  } else if (finalScore >= 75) {
    grade = 'A';
    feedbackMsg = '👍 ดีมาก! ออกเสียงได้ใกล้เคียงส่วนใหญ่ ลองดูคำที่พลาดเพื่อปรับปรุงอีกนิด';
  } else if (finalScore >= 50) {
    grade = 'B';
    feedbackMsg = '💪 พยายามได้ดี! ลองกดปุ่มลำโพงฟังเสียงคำที่พลาดเฉพาะคำอีกครั้งนะครับ';
  } else {
    grade = 'C';
    feedbackMsg = '💡 ลองเปิดฟังเสียงตัวอย่างช้าๆ (0.5x) แล้วฝึกเน้นออกเสียงทีละคำนะครับ';
  }

  return {
    score: finalScore,
    matchedChars,
    feedbackMsg,
    grade,
  };
}

/**
 * Perform detailed Word-by-Word pronunciation evaluation with specific error classification
 */
export function evaluateWordByWordPronunciation(
  recognizedText: string,
  targetHanzi: string,
  words: WordBreakdown[]
): DetailedSpeechEvaluation {
  const baseResult = evaluateSpeechAccuracy(recognizedText, targetHanzi);
  const cleanRecognized = getCleanComparableText(recognizedText);
  const cleanTarget = getCleanComparableText(targetHanzi);

  let correctCount = 0;
  let missedCount = 0;

  const wordEvaluations: WordEvaluation[] = (words || []).map((w) => {
    const cleanWordHanzi = getCleanComparableText(w.hanzi || w.pinyin);
    let matchedCount = 0;

    for (const char of cleanWordHanzi) {
      if (cleanRecognized.includes(char)) {
        matchedCount++;
      }
    }

    let status: 'correct' | 'partial' | 'missed' = 'missed';
    let reasonType: 'mispronounced' | 'wrong_word' | 'omitted' | undefined = undefined;
    let reasonExplanation: string | undefined = undefined;

    if (matchedCount === cleanWordHanzi.length && cleanWordHanzi.length > 0) {
      status = 'correct';
      correctCount++;
    } else if (matchedCount > 0) {
      status = 'partial';
      missedCount++;
      reasonType = 'mispronounced';
      reasonExplanation = `🔊 ออกเสียงเพี้ยนบางวรรณยุกต์/พยัญชนะ (ระบบได้ยินเสียงคล้ายกันเป็น "${cleanRecognized}")`;
    } else {
      status = 'missed';
      missedCount++;

      if (!cleanRecognized || cleanRecognized.length === 0) {
        reasonType = 'omitted';
        reasonExplanation = `🔇 พูดตกคำนี้ไป หรือไมค์ไม่ได้ยินเสียงคำว่า "${w.hanzi}"`;
      } else {
        // Check if user spoke a completely different word vs mispronounced tone
        // Find if any character in cleanRecognized is totally outside cleanTarget
        const extraChars = Array.from(cleanRecognized).filter((c) => !cleanTarget.includes(c));

        if (extraChars.length > 0) {
          reasonType = 'wrong_word';
          reasonExplanation = `❌ พูดผิดคำไปเลย (คุณพูดได้เป็นคำว่า "${cleanRecognized}" แทนคำเป้าหมาย "${w.hanzi}")`;
        } else {
          reasonType = 'mispronounced';
          reasonExplanation = `🔊 ออกเสียงไม่ถูกต้อง/วรรณยุกต์เพี้ยน (ระบบได้ยินเป็น "${cleanRecognized}")`;
        }
      }
    }

    return {
      word: w,
      status,
      matchedCharsCount: matchedCount,
      totalCharsCount: cleanWordHanzi.length,
      reasonType,
      reasonExplanation,
    };
  });

  return {
    ...baseResult,
    wordEvaluations,
    correctCount,
    missedCount,
  };
}

/**
 * Get or automatically generate sentence expansion ladder for a scenario
 */
export function getScenarioExpansions(scenario: Scenario): SentenceExpansion[] {
  if (scenario.expansions && scenario.expansions.length > 0) {
    return scenario.expansions;
  }

  // Fallback: Generate progressive expansions from user dialogues
  const userDialogues = scenario.dialogues.filter((d) => d.speaker === 'user');
  const targetList = userDialogues.length > 0 ? userDialogues : scenario.dialogues;

  return targetList.map((dlg, dIdx) => {
    const words = dlg.words || [];
    const steps: SentenceExpansionStep[] = [];

    if (words.length <= 1) {
      steps.push({
        stepNumber: 1,
        hanzi: dlg.hanzi,
        pinyin: dlg.pinyin,
        thai: dlg.thai,
        addedPart: dlg.hanzi,
        explanation: 'ฝึกฟังและออกเสียงทั้งประโยค/คำนี้ให้คล่องปาก',
      });
    } else {
      // Step 1: First essential word
      steps.push({
        stepNumber: 1,
        hanzi: words[0].hanzi,
        pinyin: words[0].pinyin,
        thai: words[0].thai,
        addedPart: words[0].hanzi,
        explanation: `เริ่มต้นจำคำศัพท์กุญแจสำคัญ: "${words[0].thai}"`,
      });

      // Middle steps (if more than 2 words)
      if (words.length > 2) {
        const midWords = words.slice(0, 2);
        const midHanzi = midWords.map((w) => w.hanzi).join('');
        const midPinyin = midWords.map((w) => w.pinyin).join(' ');
        const midThai = midWords.map((w) => w.thai).join(' + ');

        steps.push({
          stepNumber: 2,
          hanzi: midHanzi,
          pinyin: midPinyin,
          thai: midThai,
          addedPart: words[1].hanzi,
          explanation: `เติมคำเพิ่ม: "${words[1].hanzi}" (${words[1].thai})`,
        });
      }

      // Final step: Full sentence
      steps.push({
        stepNumber: steps.length + 1,
        hanzi: dlg.hanzi,
        pinyin: dlg.pinyin,
        thai: dlg.thai,
        addedPart: dlg.hanzi,
        explanation: 'รวมเป็นประโยคสมบูรณ์พร้อมใช้พูดจริง!',
      });
    }

    // Scramble words for the assembly game
    const scrambled = [...words].sort(() => Math.random() - 0.5);

    return {
      id: `exp-${scenario.id}-${dIdx + 1}`,
      targetHanzi: dlg.hanzi,
      targetPinyin: dlg.pinyin,
      targetThai: dlg.thai,
      scenarioContext: dlg.thai,
      steps,
      scrambledWords: scrambled.map((w) => ({ hanzi: w.hanzi, pinyin: w.pinyin, thai: w.thai })),
    };
  });
}

/**
 * Get or automatically generate memory quiz questions for a scenario
 */
export function getScenarioMemoryQuiz(scenario: Scenario): MemoryQuizQuestion[] {
  if (scenario.memoryQuiz && scenario.memoryQuiz.length > 0) {
    return scenario.memoryQuiz;
  }

  const allWords = scenario.dialogues.flatMap((d) => d.words || []);
  const uniqueWords = allWords.filter(
    (w, idx, self) => self.findIndex((item) => item.hanzi === w.hanzi) === idx
  );

  const questions: MemoryQuizQuestion[] = [];

  // Question 1: Listen to a core word and pick Thai meaning
  if (uniqueWords.length > 0) {
    const targetWord = uniqueWords[0];
    const distractorWords = uniqueWords.slice(1, 4);
    const options = [
      { text: targetWord.thai, textZh: targetWord.hanzi, isCorrect: true },
      ...distractorWords.map((w) => ({ text: w.thai, textZh: w.hanzi, isCorrect: false })),
    ];
    // Add generic distractors if needed
    if (options.length < 3) {
      options.push(
        { text: 'ราคาเท่าไหร่', textZh: '多少钱', isCorrect: false },
        { text: 'ขอบคุณมาก', textZh: '非常感谢', isCorrect: false }
      );
    }

    questions.push({
      id: `quiz-${scenario.id}-1`,
      type: 'listen-meaning',
      questionText: '🎧 ฟังเสียงภาษาจีนแล้วเลือกว่ามีความหมายตรงกับข้อใด?',
      audioText: targetWord.hanzi,
      promptZh: targetWord.hanzi,
      promptPinyin: targetWord.pinyin,
      options: options.slice(0, 4).sort(() => Math.random() - 0.5),
      explanation: `"${targetWord.hanzi}" (${targetWord.pinyin}) แปลว่า "${targetWord.thai}"`,
    });
  }

  // Question 2: Fill in the blank for a user dialogue line
  const userDlg = scenario.dialogues.find((d) => d.speaker === 'user' && d.words.length >= 2);
  if (userDlg && userDlg.words.length >= 2) {
    const missingWord = userDlg.words[userDlg.words.length - 1];
    const blankSentence = userDlg.hanzi.replace(missingWord.hanzi, '_____');

    const otherWords = uniqueWords.filter((w) => w.hanzi !== missingWord.hanzi);
    const options = [
      { text: `${missingWord.hanzi} (${missingWord.thai})`, textZh: missingWord.hanzi, isCorrect: true },
      ...otherWords.slice(0, 3).map((w) => ({ text: `${w.hanzi} (${w.thai})`, textZh: w.hanzi, isCorrect: false })),
    ];

    questions.push({
      id: `quiz-${scenario.id}-2`,
      type: 'fill-blank',
      questionText: `🧩 เติมคำในช่องว่างเพื่อให้ประโยคสมบูรณ์: "${userDlg.thai}"`,
      promptZh: blankSentence,
      promptPinyin: userDlg.pinyin,
      options: options.slice(0, 4).sort(() => Math.random() - 0.5),
      explanation: `ประโยคที่ถูกต้องคือ "${userDlg.hanzi}" (${userDlg.pinyin}) - ${userDlg.thai}`,
    });
  }

  // Question 3: Scenario Response Choice
  const firstUserDlg = scenario.dialogues.find((d) => d.speaker === 'user');
  if (firstUserDlg) {
    const otherUserDlgs = scenario.dialogues.filter((d) => d.speaker === 'user' && d.id !== firstUserDlg.id);
    const options = [
      { text: `${firstUserDlg.hanzi} (${firstUserDlg.pinyin})`, textZh: firstUserDlg.hanzi, isCorrect: true },
      ...otherUserDlgs.slice(0, 2).map((d) => ({
        text: `${d.hanzi} (${d.pinyin})`,
        textZh: d.hanzi,
        isCorrect: false,
      })),
      { text: '谢谢，再见 (Xièxie, zàijiàn)', textZh: '谢谢，再见', isCorrect: false },
    ];

    questions.push({
      id: `quiz-${scenario.id}-3`,
      type: 'scenario-response',
      questionText: `💬 ในสถานการณ์ "${scenario.title}": หากคุณต้องการพูดว่า "${firstUserDlg.thai}" ควรพูดว่าอย่างไร?`,
      options: options.slice(0, 4).sort(() => Math.random() - 0.5),
      explanation: `คำตอบคือ "${firstUserDlg.hanzi}" (${firstUserDlg.pinyin}) แปลว่า "${firstUserDlg.thai}"`,
    });
  }

  return questions;
}
