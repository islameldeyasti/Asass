'use client';

import {useCallback, useEffect, useRef, useState} from 'react';

export function useSpeechRecognition({language = 'en', onResult, onError}) {
  const recognitionRef = useRef(null);
  const [state, setState] = useState('idle'); // idle | listening | processing

  const stop = useCallback(() => {
    try {
      recognitionRef.current?.stop?.();
    } catch {
      /* ignore */
    }
    recognitionRef.current = null;
    setState('idle');
  }, []);

  useEffect(() => () => stop(), [stop]);

  const start = useCallback(() => {
    const SR = typeof window !== 'undefined'
      ? window.SpeechRecognition || window.webkitSpeechRecognition
      : null;

    if (!SR) {
      onError?.('unsupported');
      return;
    }

    stop();
    const recognition = new SR();
    recognition.lang = language === 'ar' ? 'ar-AE' : 'en-US';
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;
    recognition.continuous = false;

    recognition.onstart = () => setState('listening');
    recognition.onspeechend = () => setState('processing');
    recognition.onerror = (event) => {
      setState('idle');
      if (event?.error === 'not-allowed' || event?.error === 'service-not-allowed') {
        onError?.('denied');
      } else if (event?.error !== 'aborted') {
        onError?.('failed');
      }
    };
    recognition.onend = () => {
      recognitionRef.current = null;
      setState('idle');
    };
    recognition.onresult = (event) => {
      setState('processing');
      const transcript = event?.results?.[0]?.[0]?.transcript?.trim();
      if (transcript) onResult?.(transcript);
      setState('idle');
    };

    recognitionRef.current = recognition;
    try {
      recognition.start();
    } catch {
      setState('idle');
      onError?.('failed');
    }
  }, [language, onError, onResult, stop]);

  return {state, start, stop, supported: typeof window !== 'undefined' && !!(window.SpeechRecognition || window.webkitSpeechRecognition)};
}
