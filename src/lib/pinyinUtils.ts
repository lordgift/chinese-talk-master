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

export const CHINESE_LEXICON: Record<string, { pinyin: string; thai: string; tones?: number[] }> = {
  '你好': { pinyin: 'nǐ hǎo', thai: 'สวัสดี', tones: [3, 3] },
  '您好': { pinyin: 'nín hǎo', thai: 'สวัสดี (สุภาพ)', tones: [2, 3] },
  '请问': { pinyin: 'qǐng wèn', thai: 'ขอถามหน่อย', tones: [3, 4] },
  '请': { pinyin: 'qǐng', thai: 'กรุณา/โปรด/ขอ', tones: [3] },
  '这是什么': { pinyin: 'zhè shì shén me', thai: 'นี่คืออะไร', tones: [4, 4, 2, 5] },
  '这是': { pinyin: 'zhè shì', thai: 'นี่คือ', tones: [4, 4] },
  '是什么': { pinyin: 'shì shén me', thai: 'คืออะไร', tones: [4, 2, 5] },
  '什么': { pinyin: 'shén me', thai: 'อะไร', tones: [2, 5] },
  '这个': { pinyin: 'zhè ge', thai: 'อันนี้', tones: [4, 5] },
  '那个': { pinyin: 'nà ge', thai: 'อันนั้น', tones: [4, 5] },
  '特产': { pinyin: 'tè chǎn', thai: 'ของฝาก/ของขึ้นชื่อ', tones: [4, 3] },
  '茶叶': { pinyin: 'chá yè', thai: 'ใบชา', tones: [2, 4] },
  '特产茶叶': { pinyin: 'tè chǎn chá yè', thai: 'ใบชาของฝากขึ้นชื่อ', tones: [4, 3, 2, 4] },
  '你要买吗': { pinyin: 'nǐ yào mǎi ma', thai: 'คุณจะซื้อไหม', tones: [3, 4, 3, 5] },
  '你要': { pinyin: 'nǐ yào', thai: 'คุณจะ/คุณต้องการ', tones: [3, 4] },
  '买吗': { pinyin: 'mǎi ma', thai: 'ซื้อไหม', tones: [3, 5] },
  '买': { pinyin: 'mǎi', thai: 'ซื้อ', tones: [3] },
  '卖': { pinyin: 'mài', thai: 'ขาย', tones: [4] },
  '我要': { pinyin: 'wǒ yào', thai: 'ฉันเอา/ฉันต้องการ', tones: [3, 4] },
  '我不要': { pinyin: 'wǒ bù yào', thai: 'ฉันไม่เอา', tones: [3, 4, 4] },
  '不要': { pinyin: 'bú yào', thai: 'ไม่เอา', tones: [2, 4] },
  '我': { pinyin: 'wǒ', thai: 'ฉัน/ผม', tones: [3] },
  '你': { pinyin: 'nǐ', thai: 'คุณ/เธอ', tones: [3] },
  '您': { pinyin: 'nín', thai: 'ท่าน/คุณ (สุภาพ)', tones: [2] },
  '他': { pinyin: 'tā', thai: 'เขา (ผู้ชาย)', tones: [1] },
  '她': { pinyin: 'tā', thai: 'เธอ (ผู้หญิง)', tones: [1] },
  '它': { pinyin: 'tā', thai: 'มัน', tones: [1] },
  '我们': { pinyin: 'wǒ men', thai: 'พวกเรา', tones: [3, 5] },
  '你们': { pinyin: 'nǐ men', thai: 'พวกคุณ', tones: [3, 5] },
  '他们': { pinyin: 'tā men', thai: 'พวกเขา', tones: [1, 5] },
  '多少钱': { pinyin: 'duō shao qián', thai: 'ราคาเท่าไหร่', tones: [1, 5, 2] },
  '这个多少钱': { pinyin: 'zhè ge duō shao qián', thai: 'อันนี้ราคาเท่าไหร่', tones: [4, 5, 1, 5, 2] },
  '一百块': { pinyin: 'yī bǎi kuài', thai: '100 หยวน', tones: [1, 3, 4] },
  '你还要': { pinyin: 'nǐ hái yào', thai: 'คุณยังเอาอีกไหม', tones: [3, 2, 4] },
  '还要': { pinyin: 'hái yào', thai: 'ยังเอา/ต้องการเพิ่ม', tones: [2, 4] },
  '这个大盒的吗': { pinyin: 'zhè ge dà hé de ma', thai: 'กล่องใหญ่อันนี้ไหม', tones: [4, 5, 4, 2, 5, 5] },
  '大盒的': { pinyin: 'dà hé de', thai: 'กล่องใหญ่', tones: [4, 2, 5] },
  '大盒': { pinyin: 'dà hé', thai: 'กล่องใหญ่', tones: [4, 2] },
  '大': { pinyin: 'dà', thai: 'ใหญ่', tones: [4] },
  '小': { pinyin: 'xiǎo', thai: 'เล็ก', tones: [3] },
  '好的': { pinyin: 'hǎo de', thai: 'โอเค/ได้ครับ', tones: [3, 5] },
  '不用了': { pinyin: 'bù yòng le', thai: 'ไม่ต้องแล้ว/ไม่เอาแล้ว', tones: [4, 4, 5] },
  '谢谢': { pinyin: 'xiè xie', thai: 'ขอบคุณ', tones: [4, 5] },
  '谢': { pinyin: 'xiè', thai: 'ขอบคุณ', tones: [4] },
  '非常感谢': { pinyin: 'fēi cháng gǎn xiè', thai: 'ขอบคุณมากๆ', tones: [1, 2, 3, 4] },
  '感谢': { pinyin: 'gǎn xiè', thai: 'ขอบคุณ', tones: [3, 4] },
  '对不起': { pinyin: 'duì bu qǐ', thai: 'ขอโทษ', tones: [4, 5, 3] },
  '对': { pinyin: 'duì', thai: 'ถูก/ใช่', tones: [4] },
  '不': { pinyin: 'bù', thai: 'ไม่', tones: [4] },
  '起': { pinyin: 'qǐ', thai: 'ลุกขึ้น/เริ่ม', tones: [3] },
  '好': { pinyin: 'hǎo', thai: 'ดี/ตกลง', tones: [3] },
  '的': { pinyin: 'de', thai: 'ของ/ที่', tones: [5] },
  '要': { pinyin: 'yào', thai: 'เอา/ต้องการ/จะ', tones: [4] },
  '不好意思': { pinyin: 'bù hǎo yì si', thai: 'ขอโทษที/เกรงใจ', tones: [4, 3, 4, 5] },
  '我听不懂': { pinyin: 'wǒ tīng bù dǒng', thai: 'ฉันฟังไม่ออก', tones: [3, 1, 4, 3] },
  '听不懂': { pinyin: 'tīng bù dǒng', thai: 'ฟังไม่ออก/ฟังไม่เข้าใจ', tones: [1, 4, 3] },
  '听得懂': { pinyin: 'tīng de dǒng', thai: 'ฟังเข้าใจ', tones: [1, 5, 3] },
  '你会说英语吗': { pinyin: 'nǐ huì shuō yīng yǔ ma', thai: 'คุณพูดภาษาอังกฤษได้ไหม', tones: [3, 4, 1, 1, 3, 5] },
  '你会': { pinyin: 'nǐ huì', thai: 'คุณสามารถ/เป็น', tones: [3, 4] },
  '说英语吗': { pinyin: 'shuō yīng yǔ ma', thai: 'พูดภาษาอังกฤษไหม', tones: [1, 1, 3, 5] },
  '说英语': { pinyin: 'shuō yīng yǔ', thai: 'พูดภาษาอังกฤษ', tones: [1, 1, 3] },
  '说': { pinyin: 'shuō', thai: 'พูด', tones: [1] },
  '英语': { pinyin: 'yīng yǔ', thai: 'ภาษาอังกฤษ', tones: [1, 3] },
  '中文': { pinyin: 'zhōng wén', thai: 'ภาษาจีน', tones: [1, 2] },
  '汉语': { pinyin: 'hàn yǔ', thai: 'ภาษาจีน', tones: [4, 3] },
  '泰语': { pinyin: 'tài yǔ', thai: 'ภาษาไทย', tones: [4, 3] },
  '泰国人': { pinyin: 'tài guó rén', thai: 'คนไทย', tones: [4, 2, 2] },
  '中国人': { pinyin: 'zhōng guó rén', thai: 'คนจีน', tones: [1, 2, 2] },
  '中国人吗': { pinyin: 'zhōng guó rén ma', thai: 'คนจีนไหม', tones: [1, 2, 2, 5] },
  '我是泰国人': { pinyin: 'wǒ shì tài guó rén', thai: 'ฉันเป็นคนไทย', tones: [3, 4, 4, 2, 2] },
  '你是中国人吗': { pinyin: 'nǐ shì zhōng guó rén ma', thai: 'คุณเป็นคนจีนใช่ไหม', tones: [3, 4, 1, 2, 2, 5] },
  '不是': { pinyin: 'bú shì', thai: 'ไม่ใช่', tones: [2, 4] },
  '是': { pinyin: 'shì', thai: 'ใช่/คือ/เป็น', tones: [4] },
  '能听懂': { pinyin: 'néng tīng dǒng', thai: 'สามารถฟังเข้าใจ', tones: [2, 1, 3] },
  '一点点': { pinyin: 'yī diǎn diǎn', thai: 'นิดหน่อย', tones: [1, 3, 3] },
  '一点点英语': { pinyin: 'yī diǎn diǎn yīng yǔ', thai: 'ภาษาอังกฤษนิดหน่อย', tones: [1, 3, 3, 1, 3] },
  '我能听懂一点点英语': { pinyin: 'wǒ néng tīng dǒng yī diǎn diǎn yīng yǔ', thai: 'ฉันฟังภาษาอังกฤษออกนิดหน่อย', tones: [3, 2, 1, 3, 1, 3, 3, 1, 3] },
  '太好了': { pinyin: 'tài hǎo le', thai: 'ดีมากๆ/เยี่ยมเลย', tones: [4, 3, 5] },
  '用英语': { pinyin: 'yòng yīng yǔ', thai: 'ใช้ภาษาอังกฤษ', tones: [4, 1, 3] },
  '聊吧': { pinyin: 'liáo ba', thai: 'คุยกันเถอะ', tones: [2, 5] },
  '我们用英语聊吧': { pinyin: 'wǒ men yòng yīng yǔ liáo ba', thai: 'พวกเราคุยภาษาอังกฤษกันเถอะ', tones: [3, 5, 4, 1, 3, 2, 5] },
  '需要什么帮助': { pinyin: 'xū yào shén me bāng zhù', thai: 'ต้องการความช่วยเหลืออะไร', tones: [1, 4, 2, 5, 1, 4] },
  '帮助': { pinyin: 'bāng zhù', thai: 'ความช่วยเหลือ', tones: [1, 4] },
  '需要': { pinyin: 'xū yào', thai: 'ต้องการ/จำเป็น', tones: [1, 4] },
  '不需要': { pinyin: 'bù xū yào', thai: 'ไม่ต้องการ/ไม่ต้อง', tones: [4, 1, 4] },
  '地铁站': { pinyin: 'dì tiě zhàn', thai: 'สถานีรถไฟฟ้าใต้ดิน', tones: [4, 3, 4] },
  '在哪里': { pinyin: 'zài nǎ lǐ', thai: 'อยู่ที่ไหน', tones: [4, 3, 3] },
  '在': { pinyin: 'zài', thai: 'อยู่/ที่', tones: [4] },
  '哪里': { pinyin: 'nǎ lǐ', thai: 'ที่ไหน', tones: [3, 3] },
  '买票': { pinyin: 'mǎi piào', thai: 'ซื้อตั๋ว', tones: [3, 4] },
  '买票吗': { pinyin: 'mǎi piào ma', thai: 'ซื้อตั๋วไหม', tones: [3, 4, 5] },
  '请问买票吗': { pinyin: 'qǐng wèn mǎi piào ma', thai: 'ขอถามหน่อยซื้อตั๋วไหม', tones: [3, 4, 3, 4, 5] },
  '我不冷': { pinyin: 'wǒ bù lěng', thai: 'ฉันไม่หนาว', tones: [3, 4, 3] },
  '穿这件外套刚刚好': { pinyin: 'chuān zhè jiàn wài tào gāng gāng hǎo', thai: 'ใส่เสื้อตัวนี้กำลังพอดี', tones: [1, 4, 4, 4, 4, 1, 1, 3] },
  '穿这件外套': { pinyin: 'chuān zhè jiàn wài tào', thai: 'ใส่เสื้อตัวนี้', tones: [1, 4, 4, 4, 4] },
  '刚刚好': { pinyin: 'gāng gāng hǎo', thai: 'กำลังพอดี', tones: [1, 1, 3] },
  '有一点热': { pinyin: 'yǒu yī diǎn rè', thai: 'ร้อนนิดหน่อย', tones: [3, 1, 3, 4] },
  '我们去买冰饮料吧': { pinyin: 'wǒ men qù mǎi bīng yǐn liào ba', thai: 'พวกเราไปซื้อเครื่องดื่มเย็นกันเถอะ', tones: [3, 5, 4, 3, 1, 3, 4, 5] },
  '去买冰饮料吧': { pinyin: 'qù mǎi bīng yǐn liào ba', thai: 'ไปซื้อเครื่องดื่มเย็นกันเถอะ', tones: [4, 3, 1, 3, 4, 5] },
  '这里平时主要是热': { pinyin: 'zhè lǐ píng shí zhǔ yào shì rè', thai: 'ที่นี่ปกติส่วนใหญ่จะร้อน', tones: [4, 3, 2, 2, 3, 4, 4, 4] },
  '这里平时': { pinyin: 'zhè lǐ píng shí', thai: 'ที่นี่ปกติ', tones: [4, 3, 2, 2] },
  '主要是热': { pinyin: 'zhǔ yào shì rè', thai: 'ส่วนใหญ่จะร้อน', tones: [3, 4, 4, 4] },
  '只有冬天比较冷': { pinyin: 'zhǐ yǒu dōng tiān bǐ jiào lěng', thai: 'มีแค่หน้าหนาวที่ค่อนข้างเย็น', tones: [3, 3, 1, 1, 3, 4, 3] },
  '只有': { pinyin: 'zhǐ yǒu', thai: 'มีแค่/เพียงแต่', tones: [3, 3] },
  '冬天': { pinyin: 'dōng tiān', thai: 'ฤดูหนาว', tones: [1, 1] },
  '比较冷': { pinyin: 'bǐ jiào lěng', thai: 'ค่อนข้างหนาว', tones: [3, 4, 3] },
  '现在是雨季': { pinyin: 'xiàn zài shì yǔ jì', thai: 'ตอนนี้คือหน้าฝน', tones: [4, 4, 4, 3, 4] },
  '现在是': { pinyin: 'xiàn zài shì', thai: 'ตอนนี้คือ', tones: [4, 4, 4] },
  '雨季': { pinyin: 'yǔ jì', thai: 'หน้าฝน', tones: [3, 4] },
  '在中国的八月': { pinyin: 'zài zhōng guó de bā yuè', thai: 'ในเดือนสิงหาคมของจีน', tones: [4, 1, 2, 5, 1, 4] },
  '在中国的八月是夏天': { pinyin: 'zài zhōng guó de bā yuè shì xià tiān', thai: 'เดือนสิงหาคมในจีนคือหน้าร้อน', tones: [4, 1, 2, 5, 1, 4, 4, 4, 1] },
  '是夏天': { pinyin: 'shì xià tiān', thai: 'คือฤดูร้อน', tones: [4, 4, 1] },
  '夏天': { pinyin: 'xià tiān', thai: 'ฤดูร้อน', tones: [4, 1] },
  '有猪肉、鸡肉还是鱼肉': { pinyin: 'yǒu zhū ròu, jī ròu hái shi yú ròu', thai: 'มีหมู ไก่ หรือว่าปลา', tones: [3, 1, 4, 1, 4, 2, 5, 2, 4] },
  '有': { pinyin: 'yǒu', thai: 'มี', tones: [3] },
  '猪肉': { pinyin: 'zhū ròu', thai: 'เนื้อหมู', tones: [1, 4] },
  '鸡肉': { pinyin: 'jī ròu', thai: 'เนื้อไก่', tones: [1, 4] },
  '牛肉': { pinyin: 'niú ròu', thai: 'เนื้อวัว', tones: [2, 4] },
  '羊肉': { pinyin: 'yáng ròu', thai: 'เนื้อแพะ/แกะ', tones: [2, 4] },
  '鱼肉': { pinyin: 'yú ròu', thai: 'เนื้อปลา', tones: [2, 4] },
  '海鲜': { pinyin: 'hǎi xiān', thai: 'อาหารทะเล', tones: [3, 1] },
  '还是': { pinyin: 'hái shi', thai: 'หรือว่า', tones: [2, 5] },
  '有的': { pinyin: 'yǒu de', thai: 'มีครับ/ค่ะ', tones: [3, 5] },
  '这道菜是猪肉': { pinyin: 'zhè dào cài shì zhū ròu', thai: 'เมนูนี้คือเนื้อหมู', tones: [4, 4, 4, 4, 1, 4] },
  '这道菜': { pinyin: 'zhè dào cài', thai: 'จานนี้/เมนูนี้', tones: [4, 4, 4] },
  '一份猪肉': { pinyin: 'yī fèn zhū ròu', thai: 'เนื้อหมู 1 ที่', tones: [1, 4, 1, 4] },
  '一份': { pinyin: 'yī fèn', thai: '1 ที่/1 จาน', tones: [1, 4] },
  '一杯奶茶': { pinyin: 'yī bēi nǎi chá', thai: 'ชานม 1 แก้ว', tones: [1, 1, 3, 2] },
  '一杯': { pinyin: 'yī bēi', thai: '1 แก้ว', tones: [1, 1] },
  '奶茶': { pinyin: 'nǎi chá', thai: 'ชานม', tones: [3, 2] },
  '咖啡': { pinyin: 'kā fēi', thai: 'กาแฟ', tones: [1, 1] },
  '太贵了': { pinyin: 'tài guì le', thai: 'แพงเกินไปแล้ว', tones: [4, 4, 5] },
  '可以便宜一点吗': { pinyin: 'kě yǐ pián yi yī diǎn ma', thai: 'ลดราคาหน่อยได้ไหม', tones: [3, 3, 2, 5, 1, 3, 5] },
  '便宜一点吗': { pinyin: 'pián yi yī diǎn ma', thai: 'ลดราคาหน่อยได้ไหม', tones: [2, 5, 1, 3, 5] },
  '可以': { pinyin: 'kě yǐ', thai: 'ได้/สามารถ', tones: [3, 3] },
  '不可以': { pinyin: 'bù kě yǐ', thai: 'ไม่ได้', tones: [4, 3, 3] },
  '便宜一点': { pinyin: 'pián yi yī diǎn', thai: 'ถูกลงหน่อย', tones: [2, 5, 1, 3] },
  '我用支付宝': { pinyin: 'wǒ yòng zhī fù bào', thai: 'ฉันใช้ Alipay', tones: [3, 4, 1, 4, 4] },
  '我用': { pinyin: 'wǒ yòng', thai: 'ฉันใช้', tones: [3, 4] },
  '支付宝': { pinyin: 'zhī fù bào', thai: 'Alipay', tones: [1, 4, 4] },
  '微信支付': { pinyin: 'wēi xìn zhī fù', thai: 'WeChat Pay', tones: [1, 4, 1, 4] },
  '请扫这里': { pinyin: 'qǐng sǎo zhè lǐ', thai: 'โปรดสแกนตรงนี้', tones: [3, 3, 4, 3] },
  '扫这里': { pinyin: 'sǎo zhè lǐ', thai: 'สแกนตรงนี้', tones: [3, 4, 3] },
  '办理入住': { pinyin: 'bàn lǐ rù zhù', thai: 'เช็คอินเข้าพัก', tones: [4, 3, 4, 4] },
  '我要办理入住': { pinyin: 'wǒ yào bàn lǐ rù zhù', thai: 'ฉันต้องการเช็คอิน', tones: [3, 4, 4, 3, 4, 4] },
  '请出示您的护照': { pinyin: 'qǐng chū shì nín de hù zhào', thai: 'โปรดแสดงพาสปอร์ตของคุณ', tones: [3, 1, 4, 2, 5, 4, 4] },
  '请出示': { pinyin: 'qǐng chū shì', thai: 'โปรดแสดง', tones: [3, 1, 4] },
  '您的护照': { pinyin: 'nín de hù zhào', thai: 'พาสปอร์ตของคุณ', tones: [2, 5, 4, 4] },
  '护照': { pinyin: 'hù zhào', thai: 'พาสปอร์ต', tones: [4, 4] },
  '这是我的护照': { pinyin: 'zhè shì wǒ de hù zhào', thai: 'นี่คือพาสปอร์ตของฉัน', tones: [4, 4, 3, 5, 4, 4] },
  '我的护照': { pinyin: 'wǒ de hù zhào', thai: 'พาสปอร์ตของฉัน', tones: [3, 5, 4, 4] },
  '我的': { pinyin: 'wǒ de', thai: 'ของฉัน', tones: [3, 5] },
  '您的': { pinyin: 'nín de', thai: 'ของคุณ', tones: [2, 5] },
  '您有': { pinyin: 'nín yǒu', thai: 'คุณมี', tones: [2, 3] },
  '可以先寄行李吗': { pinyin: 'kě yǐ xiān jì xíng li ma', thai: 'ขอฝากกระเป๋าก่อนได้ไหม', tones: [3, 3, 1, 4, 2, 5, 5] },
  '先寄行李': { pinyin: 'xiān jì xíng li', thai: 'ฝากกระเป๋าเดินทางไว้ก่อน', tones: [1, 4, 2, 5] },
  '寄行李吗': { pinyin: 'jì xíng li ma', thai: 'ฝากกระเป๋าเดินทางไหม', tones: [4, 2, 5, 5] },
  '寄行李': { pinyin: 'jì xíng li', thai: 'ฝากกระเป๋าเดินทาง', tones: [4, 2, 5] },
  '先': { pinyin: 'xiān', thai: 'ก่อน/ไว้ก่อน', tones: [1] },
  '可以的': { pinyin: 'kě yǐ de', thai: 'ได้ครับ/ค่ะ', tones: [3, 3, 5] },
  '请问您有几件行李': { pinyin: 'qǐng wèn nín yǒu jǐ jiàn xíng li', thai: 'ขอถามหน่อยคุณมีสัมภาระกี่ชิ้น', tones: [3, 4, 2, 3, 3, 4, 2, 5] },
  '几件行李': { pinyin: 'jǐ jiàn xíng li', thai: 'สัมภาระกี่ชิ้น', tones: [3, 4, 2, 5] },
  '有两件大行李箱和一个背包': { pinyin: 'yǒu liǎng jiàn dà xíng li xiāng hé yī gè bèi bāo', thai: 'มีกระเป๋าเดินทางใบใหญ่ 2 ใบและเป้ 1 ใบ', tones: [3, 3, 4, 4, 2, 5, 1, 2, 1, 4, 4, 1] },
  '两件大行李箱': { pinyin: 'liǎng jiàn dà xíng li xiāng', thai: 'กระเป๋าเดินทางใบใหญ่ 2 ใบ', tones: [3, 4, 4, 2, 5, 1] },
  '两件': { pinyin: 'liǎng jiàn', thai: '2 ชิ้น/2 ใบ', tones: [3, 4] },
  '行李箱': { pinyin: 'xíng li xiāng', thai: 'กระเป๋าเดินทาง', tones: [2, 5, 1] },
  '和一个背包': { pinyin: 'hé yī gè bèi bāo', thai: 'และกระเป๋าเป้ 1 ใบ', tones: [2, 1, 4, 4, 1] },
  '和': { pinyin: 'hé', thai: 'และ', tones: [2] },
  '背包': { pinyin: 'bèi bāo', thai: 'กระเป๋าเป้', tones: [4, 1] },
  '这是您的行李牌': { pinyin: 'zhè shì nín de xíng li pái', thai: 'นี่คือป้ายรับกระเป๋าของคุณ', tones: [4, 4, 2, 5, 2, 5, 2] },
  '行李牌': { pinyin: 'xíng li pái', thai: 'ป้ายรับกระเป๋า', tones: [2, 5, 2] },
  '请拿好': { pinyin: 'qǐng ná hǎo', thai: 'โปรดเก็บไว้ให้ดี', tones: [3, 2, 3] },
  '拿好': { pinyin: 'ná hǎo', thai: 'เก็บรักษาไว้ให้ดี', tones: [2, 3] },
  '我几点取都可以吗': { pinyin: 'wǒ jǐ diǎn qǔ dōu kě yǐ ma', thai: 'ฉันมารับตอนกี่โมงก็ได้ใช่ไหม', tones: [3, 3, 3, 3, 1, 3, 3, 5] },
  '几点取': { pinyin: 'jǐ diǎn qǔ', thai: 'รับกี่โมง', tones: [3, 3, 3] },
  '都可以吗': { pinyin: 'dōu kě yǐ ma', thai: 'ก็ได้ใช่ไหม', tones: [1, 3, 3, 5] },
  '都可以': { pinyin: 'dōu kě yǐ', thai: 'ได้ทั้งหมด', tones: [1, 3, 3] },
  '是的': { pinyin: 'shì de', thai: 'ใช่ครับ/ค่ะ', tones: [4, 5] },
  '随时凭行李牌来领取': { pinyin: 'suí shí píng xíng li pái lái lǐng qǔ', thai: 'มารับได้ตลอดเวลาโดยแสดงป้ายรับกระเป๋า', tones: [2, 2, 2, 2, 5, 2, 2, 3, 3] },
  '随时': { pinyin: 'suí shí', thai: 'ตลอดเวลา/เมื่อไหร่ก็ได้', tones: [2, 2] },
  '凭行李牌': { pinyin: 'píng xíng li pái', thai: 'โดยใช้ป้ายรับกระเป๋า', tones: [2, 2, 5, 2] },
  '来领取': { pinyin: 'lái lǐng qǔ', thai: 'มารับของ', tones: [2, 3, 3] },
  '领取': { pinyin: 'lǐng qǔ', thai: 'รับของ/เบิกรับ', tones: [3, 3] },
  'Wi-Fi 密码是什么': { pinyin: 'Wi-Fi mì mǎ shì shén me', thai: 'รหัสผ่าน Wi-Fi คืออะไร', tones: [4, 3, 4, 2, 5] },
  'Wi-Fi 密码': { pinyin: 'Wi-Fi mì mǎ', thai: 'รหัสผ่าน Wi-Fi', tones: [4, 3] },
  '密码是': { pinyin: 'mì mǎ shì', thai: 'รหัสผ่านคือ', tones: [4, 3, 4] },
  '密码': { pinyin: 'mì mǎ', thai: 'รหัสผ่าน', tones: [4, 3] },
  '密码是房间号': { pinyin: 'mì mǎ shì fáng jiān hào', thai: 'รหัสผ่านคือหมายเลขห้อง', tones: [4, 3, 4, 2, 1, 4] },
  '房间号': { pinyin: 'fáng jiān hào', thai: 'หมายเลขห้อง', tones: [2, 1, 4] },
  '或者输入八个八': { pinyin: 'huò zhě shū rù bā gè bā', thai: 'หรือกรอกเลข 8 แปดตัว', tones: [4, 3, 1, 4, 1, 4, 1] },
  '或者输入': { pinyin: 'huò zhě shū rù', thai: 'หรือกรอก/ใส่', tones: [4, 3, 1, 4] },
  '八个八': { pinyin: 'bā gè bā', thai: 'เลข 8 แปดตัว (88888888)', tones: [1, 4, 1] },
  '需要输入手机号码验证吗': { pinyin: 'xū yào shū rù shǒu jī hào mǎ yàn zhèng ma', thai: 'ต้องกรอกเบอร์มือถือเพื่อยืนยันไหม', tones: [1, 4, 1, 4, 3, 1, 4, 3, 4, 4, 5] },
  '需要输入': { pinyin: 'xū yào shū rù', thai: 'จำเป็นต้องกรอก', tones: [1, 4, 1, 4] },
  '输入': { pinyin: 'shū rù', thai: 'กรอก/ใส่ข้อมูล', tones: [1, 4] },
  '手机号码': { pinyin: 'shǒu jī hào mǎ', thai: 'หมายเลขโทรศัพท์มือถือ', tones: [3, 1, 4, 3] },
  '验证吗': { pinyin: 'yàn zhèng ma', thai: 'ยืนยันไหม', tones: [4, 4, 5] },
  '验证': { pinyin: 'yàn zhèng', thai: 'ยืนยันตัวตน', tones: [4, 4] },
  '直接连接房间 Wi-Fi 就可以了': { pinyin: 'zhí jiē lián jiē fáng jiān Wi-Fi jiù kě yǐ le', thai: 'เชื่อมต่อ Wi-Fi ห้องโดยตรงได้เลย', tones: [2, 1, 2, 1, 2, 1, 4, 3, 3, 5] },
  '直接连接': { pinyin: 'zhí jiē lián jiē', thai: 'เชื่อมต่อโดยตรง', tones: [2, 1, 2, 1] },
  '房间 Wi-Fi': { pinyin: 'fáng jiān Wi-Fi', thai: 'Wi-Fi ห้องพัก', tones: [2, 1] },
  '房间': { pinyin: 'fáng jiān', thai: 'ห้องพัก', tones: [2, 1] },
  '就可以了': { pinyin: 'jiù kě yǐ le', thai: 'ก็ใช้ได้แล้ว/ได้เลย', tones: [4, 3, 3, 5] },
  '网络速度快吗': { pinyin: 'wǎng lù sù dù kuài ma', thai: 'ความเร็วเน็ตเร็วไหม', tones: [3, 4, 4, 4, 4, 5] },
  '网络': { pinyin: 'wǎng lù', thai: 'อินเทอร์เน็ต/เครือข่าย', tones: [3, 4] },
  '速度快吗': { pinyin: 'sù dù kuài ma', thai: 'ความเร็วเร็วไหม', tones: [4, 4, 4, 5] },
  '速度很快': { pinyin: 'sù dù hěn kuài', thai: 'ความเร็วเร็วมาก', tones: [4, 4, 3, 4] },
  '看视频和工作都没问题': { pinyin: 'kàn shì pín hé gōng zuò dōu méi wèn tí', thai: 'ดูวิดีโอและทำงานไม่มีปัญหาเลย', tones: [4, 4, 2, 2, 1, 4, 1, 2, 4, 2] },
  '看视频和工作': { pinyin: 'kàn shì pín hé gōng zuò', thai: 'ดูวิดีโอและทำงาน', tones: [4, 4, 2, 2, 1, 4] },
  '看视频': { pinyin: 'kàn shì pín', thai: 'ดูวิดีโอ/คลิป', tones: [4, 4, 2] },
  '工作': { pinyin: 'gōng zuò', thai: 'ทำงาน', tones: [1, 4] },
  '都没问题': { pinyin: 'dōu méi wèn tí', thai: 'ไม่มีปัญหาทั้งหมด', tones: [1, 2, 4, 2] },
  '没问题': { pinyin: 'méi wèn tí', thai: 'ไม่มีปัญหา', tones: [2, 4, 2] },
  '需要打扫房间吗': { pinyin: 'xū yào dǎ sǎo fáng jiān ma', thai: 'ต้องการทำความสะอาดห้องไหม', tones: [1, 4, 3, 3, 2, 1, 5] },
  '打扫房间吗': { pinyin: 'dǎ sǎo fáng jiān ma', thai: 'ทำความสะอาดห้องไหม', tones: [3, 3, 2, 1, 5] },
  '打扫房间': { pinyin: 'dǎ sǎo fáng jiān', thai: 'ทำความสะอาดห้อง', tones: [3, 3, 2, 1] },
  '打扫': { pinyin: 'dǎ sǎo', thai: 'ทำความสะอาด', tones: [3, 3] },
  '帮我打扫': { pinyin: 'bāng wǒ dǎ sǎo', thai: 'ช่วยฉันทำความสะอาด', tones: [1, 3, 3, 3] },
  '一下': { pinyin: 'yī xià', thai: 'สักหน่อย/แป๊บนึง', tones: [1, 4] },
  '需要换毛巾和加水吗': { pinyin: 'xū yào huàn máo jīn hé jiā shuǐ ma', thai: 'ต้องการเปลี่ยนผ้าเช็ดตัวและเติมน้ำไหม', tones: [1, 4, 4, 2, 1, 2, 1, 3, 5] },
  '换毛巾': { pinyin: 'huàn máo jīn', thai: 'เปลี่ยนผ้าเช็ดตัว', tones: [4, 2, 1] },
  '加水吗': { pinyin: 'jiā shuǐ ma', thai: 'เติมน้ำดื่มไหม', tones: [1, 3, 5] },
  '加水': { pinyin: 'jiā shuǐ', thai: 'เติมน้ำ', tones: [1, 3] },
  '请换两条毛巾': { pinyin: 'qǐng huàn liǎng tiáo máo jīn', thai: 'ขอเปลี่ยนผ้าเช็ดตัว 2 ผืน', tones: [3, 4, 3, 2, 2, 1] },
  '换两条': { pinyin: 'huàn liǎng tiáo', thai: 'เปลี่ยน 2 ผืน', tones: [4, 3, 2] },
  '毛巾': { pinyin: 'máo jīn', thai: 'ผ้าเช็ดตัว', tones: [2, 1] },
  '再拿两瓶矿泉水': { pinyin: 'zài ná liǎng píng kuàng quán shuǐ', thai: 'ขอน้ำดื่มเพิ่มอีก 2 ขวด', tones: [4, 2, 3, 2, 4, 2, 3] },
  '再拿': { pinyin: 'zài ná', thai: 'ขอรับเพิ่มอีก', tones: [4, 2] },
  '两瓶': { pinyin: 'liǎng píng', thai: '2 ขวด', tones: [3, 2] },
  '矿泉水': { pinyin: 'kuàng quán shuǐ', thai: 'น้ำแร่/น้ำดื่ม', tones: [4, 2, 3] },
  '现在不用': { pinyin: 'xiàn zài bù yòng', thai: 'ตอนนี้ยังไม่ต้อง', tones: [4, 4, 4, 4] },
  '请下午再来打扫吧': { pinyin: 'qǐng xià wǔ zài lái dǎ sǎo ba', thai: 'ตอนบ่ายค่อยมาทำความสะอาดนะคะ', tones: [3, 4, 3, 4, 2, 3, 3, 5] },
  '下午再来': { pinyin: 'xià wǔ zài lái', thai: 'ตอนบ่ายค่อยมาอีกที', tones: [4, 3, 4, 2] },
  '打扫吧': { pinyin: 'dǎ sǎo ba', thai: 'ทำความสะอาดเถอะ', tones: [3, 3, 5] },
  '有需要请随时叫我': { pinyin: 'yǒu xū yào qǐng suí shí jiào wǒ', thai: 'หากต้องการอะไรเรียกฉันได้ตลอดเวลา', tones: [3, 1, 4, 3, 2, 2, 4, 3] },
  '有需要': { pinyin: 'yǒu xū yào', thai: 'หากมีความต้องการ', tones: [3, 1, 4] },
  '随时叫我': { pinyin: 'suí shí jiào wǒ', thai: 'เรียกฉันได้ตลอดเวลา', tones: [2, 2, 4, 3] },
  '很远吗': { pinyin: 'hěn yuǎn ma', thai: 'ไกลมากไหม', tones: [3, 3, 5] },
  '很远': { pinyin: 'hěn yuǎn', thai: 'ไกลมาก', tones: [3, 3] },
  '很近': { pinyin: 'hěn jìn', thai: 'ใกล้มาก', tones: [3, 4] },
  '不远': { pinyin: 'bù yuǎn', thai: 'ไม่ไกล', tones: [4, 3] },
  '很': { pinyin: 'hěn', thai: 'มาก', tones: [3] },
  '远': { pinyin: 'yuǎn', thai: 'ไกล', tones: [3] },
  '近': { pinyin: 'jìn', thai: 'ใกล้', tones: [4] },
  '吗': { pinyin: 'ma', thai: 'ไหม/หรือเปล่า', tones: [5] },
  '太大了': { pinyin: 'tài dà le', thai: 'ใหญ่เกินไปแล้ว', tones: [4, 4, 5] },
  '有小的吗': { pinyin: 'yǒu xiǎo de ma', thai: 'มีอันเล็กไหม', tones: [3, 3, 5, 5] },
  '太多了': { pinyin: 'tài duō le', thai: 'มากเกินไปแล้ว', tones: [4, 1, 5] },
  '少一点': { pinyin: 'shǎo yī diǎn', thai: 'น้อยลงหน่อย', tones: [3, 1, 3] },
  '太热了': { pinyin: 'tài rè le', thai: 'ร้อนเกินไปแล้ว', tones: [4, 4, 5] },
  '太冷了': { pinyin: 'tài lěng le', thai: 'หนาวเกินไปแล้ว', tones: [4, 3, 5] },
  '太快了': { pinyin: 'tài kuài le', thai: 'เร็วเกินไปแล้ว', tones: [4, 4, 5] },
  '慢一点': { pinyin: 'màn yī diǎn', thai: 'ช้าลงหน่อย', tones: [4, 1, 3] },
  '坏了': { pinyin: 'huài le', thai: 'พังแล้ว/เสียแล้ว', tones: [4, 5] },
  '能换一个吗': { pinyin: 'néng huàn yī gè ma', thai: 'ขอเปลี่ยนอันใหม่ได้ไหม', tones: [2, 4, 1, 4, 5] },
  '太高了': { pinyin: 'tài gāo le', thai: 'สูงเกินไปแล้ว', tones: [4, 1, 5] },
  '矮一点': { pinyin: 'ǎi yī diǎn', thai: 'เตี้ยลงหน่อย', tones: [3, 1, 3] },
  '给我': { pinyin: 'gěi wǒ', thai: 'ให้ฉัน/ขอ', tones: [3, 3] },
  '给你': { pinyin: 'gěi nǐ', thai: 'ให้คุณ/นี่ค่ะ', tones: [3, 3] },
  '冰水': { pinyin: 'bīng shuǐ', thai: 'น้ำเย็น/น้ำแข็ง', tones: [1, 3] },
  '热水': { pinyin: 'rè shuǐ', thai: 'น้ำร้อน', tones: [4, 3] },
};

/**
 * Generate a complete, reconstructible pool of scrambled words for a sentence unscrambling challenge
 */
export function generateCompleteScrambledWords(
  targetHanzi: string,
  targetPinyin: string,
  targetThai: string,
  existingWords?: WordBreakdown[] | Array<{ hanzi: string; pinyin?: string; thai?: string }>
): Array<{ hanzi: string; pinyin: string; thai: string }> {
  const cleanTarget = targetHanzi.replace(/[^\u4e00-\u9fa5a-zA-Z0-9]/g, '');
  if (!cleanTarget) return [];

  const enrichChunk = (chunk: { hanzi: string; pinyin?: string; thai?: string }) => {
    let pinyin = chunk.pinyin || '';
    let thai = chunk.thai || '';
    if ((!pinyin || !thai) && CHINESE_LEXICON[chunk.hanzi]) {
      pinyin = pinyin || CHINESE_LEXICON[chunk.hanzi].pinyin;
      thai = thai || CHINESE_LEXICON[chunk.hanzi].thai;
    }
    return { hanzi: chunk.hanzi, pinyin, thai };
  };

  // 1. Check if existingWords concatenated directly matches cleanTarget
  if (existingWords && existingWords.length >= 2) {
    const existingClean = existingWords
      .map((w) => (w.hanzi || '').replace(/[^\u4e00-\u9fa5a-zA-Z0-9]/g, ''))
      .join('');
    if (existingClean === cleanTarget) {
      return [...existingWords]
        .map((w) => enrichChunk(w))
        .sort(() => Math.random() - 0.5);
    }
  }

  // 2. Segment cleanTarget preserving existingWords as matches where possible
  const chunks: Array<{ hanzi: string; pinyin: string; thai: string }> = [];
  let cursor = 0;

  while (cursor < cleanTarget.length) {
    let bestMatch: { hanzi: string; pinyin: string; thai: string } | null = null;

    if (existingWords && existingWords.length > 0) {
      for (const w of existingWords) {
        const cleanW = (w.hanzi || '').replace(/[^\u4e00-\u9fa5a-zA-Z0-9]/g, '');
        if (cleanW && cleanTarget.startsWith(cleanW, cursor)) {
          if (!bestMatch || cleanW.length > bestMatch.hanzi.length) {
            bestMatch = enrichChunk(w);
          }
        }
      }
    }

    if (bestMatch) {
      chunks.push(bestMatch);
      cursor += bestMatch.hanzi.length;
    } else {
      // Look ahead for the next existing word start
      let nextMatchIdx = cleanTarget.length;
      if (existingWords && existingWords.length > 0) {
        for (const w of existingWords) {
          const cleanW = (w.hanzi || '').replace(/[^\u4e00-\u9fa5a-zA-Z0-9]/g, '');
          if (cleanW) {
            const idx = cleanTarget.indexOf(cleanW, cursor + 1);
            if (idx !== -1 && idx < nextMatchIdx) {
              nextMatchIdx = idx;
            }
          }
        }
      }

      const segment = cleanTarget.substring(cursor, nextMatchIdx);
      if (segment.length > 4) {
        let segCursor = 0;
        while (segCursor < segment.length) {
          const subLen = segment.length - segCursor === 3 ? 3 : Math.min(2, segment.length - segCursor);
          const subHanzi = segment.substring(segCursor, segCursor + subLen);
          chunks.push(enrichChunk({ hanzi: subHanzi }));
          segCursor += subLen;
        }
      } else {
        chunks.push(enrichChunk({ hanzi: segment }));
      }
      cursor = nextMatchIdx;
    }
  }

  // If we only have 1 chunk (e.g. single long word or no breakdown), split it so user can unscramble
  if (chunks.length <= 1 && cleanTarget.length >= 2) {
    chunks.length = 0;
    let segCursor = 0;
    while (segCursor < cleanTarget.length) {
      const remainingLen = cleanTarget.length - segCursor;
      const subLen = remainingLen === 3 ? 3 : Math.min(2, remainingLen);
      const subHanzi = cleanTarget.substring(segCursor, segCursor + subLen);
      chunks.push(enrichChunk({ hanzi: subHanzi }));
      segCursor += subLen;
    }
  }

  // Shuffle chunks
  return [...chunks].sort(() => Math.random() - 0.5);
}

/**
 * Get or automatically generate sentence expansion ladder for a scenario
 */
export function getScenarioExpansions(scenario: Scenario): SentenceExpansion[] {
  if (scenario.expansions && scenario.expansions.length > 0) {
    return scenario.expansions.map((exp) => {
      const validPool = generateCompleteScrambledWords(
        exp.targetHanzi,
        exp.targetPinyin,
        exp.targetThai,
        exp.scrambledWords
      );
      return {
        ...exp,
        scrambledWords: validPool,
      };
    });
  }

  // Fallback: Generate progressive expansions from user dialogues
  const userDialogues = scenario.dialogues.filter((d) => d.speaker === 'user');
  const targetList = userDialogues.length > 0 ? userDialogues : scenario.dialogues;

  return targetList.map((dlg, dIdx) => {
    const scrambledWords = generateCompleteScrambledWords(
      dlg.hanzi,
      dlg.pinyin,
      dlg.thai,
      dlg.words
    );

    const steps: SentenceExpansionStep[] = [
      {
        stepNumber: 1,
        hanzi: dlg.hanzi,
        pinyin: dlg.pinyin,
        thai: dlg.thai,
        addedPart: dlg.hanzi,
        explanation: 'รวมคำศัพท์และฝึกออกเสียงเป็นประโยคที่สมบูรณ์',
      },
    ];

    return {
      id: `exp-${scenario.id}-${dIdx + 1}`,
      targetHanzi: dlg.hanzi,
      targetPinyin: dlg.pinyin,
      targetThai: dlg.thai,
      scenarioContext: dlg.thai,
      steps,
      scrambledWords,
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
