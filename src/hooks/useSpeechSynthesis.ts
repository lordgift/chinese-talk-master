'use client';

import { useState, useEffect, useCallback, useRef } from 'react';

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

      const utterance = new SpeechSynthesisUtterance(text);
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
