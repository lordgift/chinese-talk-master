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
  categoryId: 'food-ordering' | 'travel' | 'shopping' | 'hotel';
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
  id: 'food-ordering' | 'travel' | 'shopping' | 'hotel';
  title: string;
  titleZh: string;
  description: string;
  icon: string;
  color: string;
  bgGradient: string;
  scenariosCount: number;
  isAvailable: boolean;
}

/**
 * Get Tailwind CSS color for Pinyin tones
 * Tone 1 (High): Red/Coral
 * Tone 2 (Rising): Green
 * Tone 3 (Falling-Rising): Amber/Yellow
 * Tone 4 (Falling): Purple/Indigo
 * Neutral Tone 5: Gray
 */
export function getToneColorClass(tone?: number): { text: string; bg: string; border: string } {
  switch (tone) {
    case 1:
      return { text: 'text-rose-500 font-semibold', bg: 'bg-rose-500/10', border: 'border-rose-500/30' };
    case 2:
      return { text: 'text-emerald-500 font-semibold', bg: 'bg-emerald-500/10', border: 'border-emerald-500/30' };
    case 3:
      return { text: 'text-amber-500 font-semibold', bg: 'bg-amber-500/10', border: 'border-amber-500/30' };
    case 4:
      return { text: 'text-indigo-500 font-semibold', bg: 'bg-indigo-500/10', border: 'border-indigo-500/30' };
    case 5:
    default:
      return { text: 'text-slate-400 font-medium', bg: 'bg-slate-500/10', border: 'border-slate-500/20' };
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
    feedbackMsg = '🎉 สุดยอดมาก! ออกเสียงได้ชัดเจนและถูกต้องตามวรรณยุกต์';
  } else if (finalScore >= 75) {
    grade = 'A';
    feedbackMsg = '👍 ดีมาก! ออกเสียงได้ใกล้เคียง พยายามเน้นเสียงวรรณยุกต์อีกนิด';
  } else if (finalScore >= 50) {
    grade = 'B';
    feedbackMsg = '💪 พยายามได้ดี! ลองเปิดฟังเสียงตัวอย่างและลองใหม่อีกครั้ง';
  } else {
    grade = 'C';
    feedbackMsg = '💡 แนะนำให้กดปุ่มลำโพงฟังเสียงช้าๆ (0.5x) แล้วฝึกออกเสียงตามนะครับ';
  }

  return {
    score: finalScore,
    matchedChars,
    feedbackMsg,
    grade,
  };
}
