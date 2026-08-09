'use client';

import { useState, useEffect, useCallback, useRef } from 'react';

function formatTextForChineseTTS(text: string): string {
  if (!text) return text;

  // Replace standalone Pinyin letters/vowels like ü, a, o, e, i, u, b, p, m, f so TTS reads them natively
  if (!/[\u4e00-\u9fa5]/.test(text)) {
    return text
      .replace(/\bā\b|\ba\b/gi, '啊')
      .replace(/\bō\b|\bo\b/gi, '喔')
      .replace(/\bē\b|\be\b/gi, '鹅')
      .replace(/\bī\b|\bi\b/gi, '衣')
      .replace(/\bū\b|\bu\b/gi, '乌')
      .replace(/ǖ|ǘ|ǚ|ǜ|ü|v/gi, '于')
      .replace(/\bbō\b|\bb\b/gi, '玻')
      .replace(/\bpō\b|\bp\b/gi, '坡')
      .replace(/\bmō\b|\bm\b/gi, '摸')
      .replace(/\bfō\b|\bf\b/gi, '佛')
      .replace(/\bdē\b|\bd\b/gi, '德')
      .replace(/\btē\b|\bt\b/gi, '特')
      .replace(/\bnē\b|\bn\b/gi, '呐')
      .replace(/\blē\b|\bl\b/gi, '勒')
      .replace(/\bgē\b|\bg\b/gi, '哥')
      .replace(/\bkē\b|\bk\b/gi, '科')
      .replace(/\bhē\b|\bh\b/gi, '喝');
  }

  // Replace any standalone ü with 于 for TTS
  return text.replace(/ü/gi, '于');
}

export function useSpeechSynthesis() {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [rate, setRate] = useState<number>(1.0); // Playback speed: 0.5, 0.75, 1.0
  const [currentText, setCurrentText] = useState<string | null>(null);
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const selectedVoiceRef = useRef<SpeechSynthesisVoice | null>(null);

  // Load available voices
  useEffect(() => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;

    const updateVoices = () => {
      const availableVoices = window.speechSynthesis.getVoices();
      setVoices(availableVoices);

      // Prefer standard Mandarin voices
      const zhVoice = availableVoices.find(
        (v) =>
          v.lang.startsWith('zh-CN') ||
          v.lang.startsWith('zh') ||
          v.name.includes('Chinese') ||
          v.name.includes('Ting-Ting') ||
          v.name.includes('Lili') ||
          v.name.includes('Mei-Jia')
      );
      if (zhVoice) {
        selectedVoiceRef.current = zhVoice;
      }
    };

    updateVoices();
    window.speechSynthesis.onvoiceschanged = updateVoices;

    return () => {
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.onvoiceschanged = null;
      }
    };
  }, []);

  const stop = useCallback(() => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      setCurrentText(null);
    }
  }, []);

  const speak = useCallback(
    (text: string, customRate?: number) => {
      if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
        console.warn('SpeechSynthesis is not supported in this browser.');
        return;
      }

      window.speechSynthesis.cancel(); // Stop any currently playing audio

      const textToSpeak = formatTextForChineseTTS(text);
      const utterance = new SpeechSynthesisUtterance(textToSpeak);
      utterance.lang = 'zh-CN';
      utterance.rate = customRate ?? rate;

      if (selectedVoiceRef.current) {
        utterance.voice = selectedVoiceRef.current;
      }

      utterance.onstart = () => {
        setIsSpeaking(true);
        setCurrentText(text);
      };

      utterance.onend = () => {
        setIsSpeaking(false);
        setCurrentText(null);
      };

      utterance.onerror = (e) => {
        console.error('SpeechSynthesis error:', e);
        setIsSpeaking(false);
        setCurrentText(null);
      };

      window.speechSynthesis.speak(utterance);
    },
    [rate]
  );

  return {
    speak,
    stop,
    isSpeaking,
    currentText,
    rate,
    setRate,
    voicesCount: voices.length,
  };
}
