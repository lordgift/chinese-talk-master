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

export interface Scenario {
  id: string;
  categoryId: 'pinyin-course' | 'food-ordering' | 'travel' | 'shopping' | 'hotel';
  level: 'easy' | 'medium' | 'hard';
  levelTitle: string;
  title: string;
  titleZh: string;
  description: string;
  icon: string;
  location: string;
  estimatedMinutes: number;
  dialogues: DialogueLine[];
}

export interface Category {
  id: 'pinyin-course' | 'food-ordering' | 'travel' | 'shopping' | 'hotel';
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

  // Clean punctuation from target and recognized text
  const cleanTarget = targetHanzi.replace(/[^\u4e00-\u9fa5]/g, '');
  const cleanRecognized = recognizedText.replace(/[^\u4e00-\u9fa5]/g, '');

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
  const cleanRecognized = (recognizedText || '').replace(/[^\u4e00-\u9fa5]/g, '');
  const cleanTarget = targetHanzi.replace(/[^\u4e00-\u9fa5]/g, '');

  let correctCount = 0;
  let missedCount = 0;

  const wordEvaluations: WordEvaluation[] = (words || []).map((w) => {
    const cleanWordHanzi = w.hanzi.replace(/[^\u4e00-\u9fa5]/g, '');
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
