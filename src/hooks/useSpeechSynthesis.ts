'use client';

import { useState, useEffect, useCallback, useRef } from 'react';

export interface VoiceSettings {
  voiceURI: string | null;
  pitch: number; // 0.5 to 1.5, default 1.0
  rate: number; // 0.5 to 1.5, default 1.0
  volume: number; // 0.0 to 1.0, default 1.0
}

export interface FormattedVoice {
  voice: SpeechSynthesisVoice;
  name: string;
  lang: string;
  gender: 'female' | 'male' | 'unknown';
  isNatural: boolean;
  qualityBadge: string;
  score: number;
}

const VOICE_SETTINGS_KEY = 'chinese_talk_voice_settings';
const DEFAULT_SETTINGS: VoiceSettings = {
  voiceURI: null,
  pitch: 1.0,
  rate: 1.0,
  volume: 1.0,
};

/**
 * Load voice settings from LocalStorage safely
 */
export function getSavedVoiceSettings(): VoiceSettings {
  if (typeof window === 'undefined') return DEFAULT_SETTINGS;
  try {
    const raw = localStorage.getItem(VOICE_SETTINGS_KEY);
    if (!raw) return DEFAULT_SETTINGS;
    const parsed = JSON.parse(raw);
    return {
      voiceURI: parsed.voiceURI || null,
      pitch: typeof parsed.pitch === 'number' ? Math.max(0.5, Math.min(1.5, parsed.pitch)) : 1.0,
      rate: typeof parsed.rate === 'number' ? Math.max(0.5, Math.min(1.5, parsed.rate)) : 1.0,
      volume: typeof parsed.volume === 'number' ? Math.max(0.1, Math.min(1.0, parsed.volume)) : 1.0,
    };
  } catch (err) {
    console.error('Error reading voice settings:', err);
    return DEFAULT_SETTINGS;
  }
}

/**
 * Save voice settings to LocalStorage and broadcast update
 */
export function saveVoiceSettings(settings: VoiceSettings) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(VOICE_SETTINGS_KEY, JSON.stringify(settings));
    window.dispatchEvent(new CustomEvent('chinese_talk_voice_settings_changed', { detail: settings }));
  } catch (err) {
    console.error('Error saving voice settings:', err);
  }
}

/**
 * Clean & format text for Chinese Speech Synthesis.
 * If text contains Chinese characters, return cleanly.
 * If text is pure standalone Pinyin letters (e.g. b p m f, ā ō ē), map to clear phonetic Hanzi syllables.
 */
export function formatTextForChineseTTS(text: string): string {
  if (!text) return '';

  const cleanText = text.trim();

  // If text already has Chinese characters, speak directly without modifying
  if (/[\u4e00-\u9fa5]/.test(cleanText)) {
    return cleanText;
  }

  // Handle standalone single Pinyin consonants & vowels for pronunciation lessons
  return cleanText
    .replace(/\bā\b|\ba\b/gi, '啊')
    .replace(/\bō\b|\bo\b/gi, '喔')
    .replace(/\bē\b|\be\b/gi, '鹅')
    .replace(/\bī\b|\bi\b/gi, '衣')
    .replace(/\bū\b|\bu\b/gi, '乌')
    .replace(/\bǖ\b|\bǘ\b|\bǚ\b|\bǜ\b|\bü\b|\bv\b/gi, '迂')
    .replace(/\bbō\b|\bb\b/gi, '玻')
    .replace(/\bpō\b|\bp\b/gi, '坡')
    .replace(/\bmō\b|\bm\b/gi, '摸')
    .replace(/\bfō\b|\bf\b/gi, '佛')
    .replace(/\bdē\b|\bd\b/gi, '得')
    .replace(/\btē\b|\bt\b/gi, '特')
    .replace(/\bnē\b|\bn\b/gi, '讷')
    .replace(/\blē\b|\bl\b/gi, '勒')
    .replace(/\bgē\b|\bg\b/gi, '哥')
    .replace(/\bkē\b|\bk\b/gi, '科')
    .replace(/\bhē\b|\bh\b/gi, '喝')
    .replace(/\bjī\b|\bj\b/gi, '鸡')
    .replace(/\bqī\b|\bq\b/gi, '七')
    .replace(/\bxī\b|\bx\b/gi, '西')
    .replace(/\bzhī\b|\bzh\b/gi, '知')
    .replace(/\bchī\b|\bch\b/gi, '吃')
    .replace(/\bshī\b|\bsh\b/gi, '诗')
    .replace(/\brì\b|\br\b/gi, '日')
    .replace(/\bzī\b|\bz\b/gi, '资')
    .replace(/\bcī\b|\bc\b/gi, '次')
    .replace(/\bsī\b|\bs\b/gi, '思');
}

/**
 * Filter, score, and rank Chinese voices to bring natural/neural voices to the top
 */
export function getSortedChineseVoices(rawVoices: SpeechSynthesisVoice[]): FormattedVoice[] {
  // Filter for Chinese related voices
  const zhVoices = rawVoices.filter((v) => {
    const lang = (v.lang || '').toLowerCase();
    const name = (v.name || '').toLowerCase();
    return (
      lang.startsWith('zh') ||
      lang.startsWith('cmn') ||
      name.includes('chinese') ||
      name.includes('mandarin') ||
      name.includes('putonghua')
    );
  });

  const formatted: FormattedVoice[] = zhVoices.map((voice) => {
    const nameLower = voice.name.toLowerCase();
    const langLower = voice.lang.toLowerCase();

    let score = 10;
    const isNatural =
      nameLower.includes('natural') ||
      nameLower.includes('online') ||
      nameLower.includes('enhanced') ||
      nameLower.includes('neural') ||
      nameLower.includes('premium') ||
      nameLower.includes('google');

    if (nameLower.includes('natural') || nameLower.includes('neural')) score += 100;
    if (nameLower.includes('enhanced') || nameLower.includes('premium')) score += 90;
    if (nameLower.includes('google')) score += 80;

    // Mandarin China standard dialect boost
    if (langLower.includes('zh-cn') || langLower.includes('zh_cn') || langLower.includes('cmn-hans-cn')) {
      score += 50;
    } else if (langLower.includes('zh-tw') || langLower.includes('zh-hk')) {
      score -= 30; // Deprioritize Cantonese/Taiwanese for standard Mandarin course
    }

    // Identify popular natural voice names
    if (nameLower.includes('xiaoxiao') || nameLower.includes('yunxi') || nameLower.includes('tingting')) {
      score += 30;
    }

    // Gender detection guess
    let gender: 'female' | 'male' | 'unknown' = 'unknown';
    if (
      nameLower.includes('xiaoxiao') ||
      nameLower.includes('tingting') ||
      nameLower.includes('meijia') ||
      nameLower.includes('lili') ||
      nameLower.includes('xiaoyi') ||
      nameLower.includes('huihui') ||
      nameLower.includes('yaoyao') ||
      nameLower.includes('female')
    ) {
      gender = 'female';
    } else if (
      nameLower.includes('yunxi') ||
      nameLower.includes('yunjian') ||
      nameLower.includes('yunyang') ||
      nameLower.includes('sinji') ||
      nameLower.includes('limu') ||
      nameLower.includes('kangkang') ||
      nameLower.includes('male')
    ) {
      gender = 'male';
    }

    let qualityBadge = 'มาตรฐาน (Standard)';
    if (isNatural) {
      qualityBadge = '🌟 เสียงธรรมชาติ (Natural / Neural)';
    }

    return {
      voice,
      name: voice.name,
      lang: voice.lang,
      gender,
      isNatural,
      qualityBadge,
      score,
    };
  });

  // Sort descending by quality score
  return formatted.sort((a, b) => b.score - a.score);
}

export function useSpeechSynthesis() {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [currentText, setCurrentText] = useState<string | null>(null);
  const [currentSpeed, setCurrentSpeed] = useState<number>(1.0);
  const [availableVoices, setAvailableVoices] = useState<FormattedVoice[]>([]);
  const [settings, setSettings] = useState<VoiceSettings>(DEFAULT_SETTINGS);

  const selectedVoiceRef = useRef<SpeechSynthesisVoice | null>(null);
  const settingsRef = useRef<VoiceSettings>(DEFAULT_SETTINGS);
  const activeUtteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const fallbackTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Synchronize settings ref
  useEffect(() => {
    settingsRef.current = settings;
  }, [settings]);

  // Load initial settings and voices
  useEffect(() => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;

    const saved = getSavedVoiceSettings();
    setSettings(saved);

    const updateVoices = () => {
      const raw = window.speechSynthesis.getVoices();
      const sorted = getSortedChineseVoices(raw);
      setAvailableVoices(sorted);

      // Select voice: saved user choice -> highest scored Mandarin voice -> fallback
      if (sorted.length > 0) {
        if (saved.voiceURI) {
          const match = sorted.find((v) => v.voice.voiceURI === saved.voiceURI);
          if (match) {
            selectedVoiceRef.current = match.voice;
            return;
          }
        }
        selectedVoiceRef.current = sorted[0].voice;
      }
    };

    updateVoices();
    window.speechSynthesis.onvoiceschanged = updateVoices;

    const handleSettingsChange = (e: Event) => {
      const customEvent = e as CustomEvent<VoiceSettings>;
      if (customEvent.detail) {
        setSettings(customEvent.detail);
        const raw = window.speechSynthesis.getVoices();
        const sorted = getSortedChineseVoices(raw);
        if (customEvent.detail.voiceURI) {
          const match = sorted.find((v) => v.voice.voiceURI === customEvent.detail.voiceURI);
          if (match) {
            selectedVoiceRef.current = match.voice;
          }
        }
      }
    };

    window.addEventListener('chinese_talk_voice_settings_changed', handleSettingsChange);

    return () => {
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.onvoiceschanged = null;
      }
      window.removeEventListener('chinese_talk_voice_settings_changed', handleSettingsChange);
    };
  }, []);

  const stop = useCallback(() => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      if (fallbackTimeoutRef.current) {
        clearTimeout(fallbackTimeoutRef.current);
        fallbackTimeoutRef.current = null;
      }
      activeUtteranceRef.current = null;
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      setCurrentText(null);
    }
  }, []);

  const speak = useCallback(
    (text: string, customRate?: number, customPitch?: number) => {
      if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
        console.warn('SpeechSynthesis is not supported in this browser.');
        return;
      }

      if (fallbackTimeoutRef.current) {
        clearTimeout(fallbackTimeoutRef.current);
        fallbackTimeoutRef.current = null;
      }

      // Resume if engine is paused in Chrome
      if (window.speechSynthesis.paused) {
        window.speechSynthesis.resume();
      }

      window.speechSynthesis.cancel(); // Stop any currently playing audio

      const textToSpeak = formatTextForChineseTTS(text);
      if (!textToSpeak) return;

      const effectiveRate = customRate ?? settingsRef.current.rate;
      const effectivePitch = customPitch ?? settingsRef.current.pitch;
      const effectiveVolume = settingsRef.current.volume;

      const utterance = new SpeechSynthesisUtterance(textToSpeak);
      activeUtteranceRef.current = utterance; // Prevent GC bug
      utterance.lang = 'zh-CN';
      utterance.rate = effectiveRate;
      utterance.pitch = effectivePitch;
      utterance.volume = effectiveVolume;

      if (selectedVoiceRef.current) {
        utterance.voice = selectedVoiceRef.current;
      }

      utterance.onstart = () => {
        setIsSpeaking(true);
        setCurrentText(text);
        setCurrentSpeed(effectiveRate);
      };

      const handleEndOrError = () => {
        if (fallbackTimeoutRef.current) {
          clearTimeout(fallbackTimeoutRef.current);
          fallbackTimeoutRef.current = null;
        }
        activeUtteranceRef.current = null;
        setIsSpeaking(false);
        setCurrentText(null);
      };

      utterance.onend = handleEndOrError;
      utterance.onerror = (e) => {
        if (e.error !== 'interrupted' && e.error !== 'canceled') {
          console.error('SpeechSynthesis error:', e);
        }
        handleEndOrError();
      };

      // Set a safety fallback timeout in case the browser drops onend
      const estimatedDurationMs = Math.max(2000, (textToSpeak.length / effectiveRate) * 800 + 1500);
      fallbackTimeoutRef.current = setTimeout(() => {
        if (activeUtteranceRef.current === utterance) {
          handleEndOrError();
        }
      }, estimatedDurationMs);

      if (window.speechSynthesis.paused) {
        window.speechSynthesis.resume();
      }

      window.speechSynthesis.speak(utterance);
    },
    []
  );

  const updateSettings = useCallback((newSettings: Partial<VoiceSettings>) => {
    setSettings((prev) => {
      const updated = { ...prev, ...newSettings };
      saveVoiceSettings(updated);

      if (newSettings.voiceURI !== undefined && typeof window !== 'undefined' && 'speechSynthesis' in window) {
        const raw = window.speechSynthesis.getVoices();
        const sorted = getSortedChineseVoices(raw);
        const match = sorted.find((v) => v.voice.voiceURI === newSettings.voiceURI);
        if (match) {
          selectedVoiceRef.current = match.voice;
        }
      }
      return updated;
    });
  }, []);

  return {
    speak,
    stop,
    isSpeaking,
    currentText,
    currentSpeed,
    rate: settings.rate,
    pitch: settings.pitch,
    volume: settings.volume,
    selectedVoiceURI: settings.voiceURI,
    availableVoices,
    voicesCount: availableVoices.length,
    updateSettings,
  };
}
