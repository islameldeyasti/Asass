'use client';

import {useCallback, useEffect, useRef, useState} from 'react';

export function useSpeechSynthesis() {
  const [speakingId, setSpeakingId] = useState(null);
  const utterRef = useRef(null);

  const stop = useCallback(() => {
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
    utterRef.current = null;
    setSpeakingId(null);
  }, []);

  useEffect(() => () => stop(), [stop]);

  const speak = useCallback(
    (text, {id, language = 'en'} = {}) => {
      if (typeof window === 'undefined' || !window.speechSynthesis) return;
      stop();
      const utter = new SpeechSynthesisUtterance(String(text || ''));
      utter.lang = language === 'ar' ? 'ar-AE' : 'en-US';
      utter.rate = 1;
      utter.onend = () => {
        setSpeakingId(null);
        utterRef.current = null;
      };
      utter.onerror = () => {
        setSpeakingId(null);
        utterRef.current = null;
      };
      utterRef.current = utter;
      setSpeakingId(id || 'active');
      window.speechSynthesis.speak(utter);
    },
    [stop],
  );

  return {
    speak,
    stop,
    speakingId,
    supported: typeof window !== 'undefined' && !!window.speechSynthesis,
  };
}
