"use client";

import { useState, useEffect, useCallback, useRef } from 'react';
import { Language, translations } from '@/lib/i18n';

export const useVoice = (language: Language) => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const recognitionRef = useRef<any>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    // Clean up audio on unmount
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        if (recognitionRef.current) {
          recognitionRef.current.stop();
        }
        recognitionRef.current = new SpeechRecognition();
        recognitionRef.current.continuous = false;
        recognitionRef.current.interimResults = true;
        recognitionRef.current.lang = translations[language].voiceLang;

        recognitionRef.current.onresult = (event: any) => {
          const currentTranscript = Array.from(event.results)
            .map((result: any) => result[0].transcript)
            .join('');
          setTranscript(currentTranscript);
        };

        recognitionRef.current.onend = () => {
          setIsListening(false);
        };

        recognitionRef.current.onerror = (event: any) => {
          console.error("Speech Recognition Error:", event.error);
          setIsListening(false);
        };
      }
    }
  }, [language]);

  const startListening = useCallback(() => {
    if (recognitionRef.current) {
      setTranscript("");
      setIsListening(true);
      recognitionRef.current.start();
    } else {
      alert("Speech recognition not supported in this browser.");
    }
  }, []);

  const stopListening = useCallback(() => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      setIsListening(false);
    }
  }, []);

  const [isSpeaking, setIsSpeaking] = useState(false);

  const speak = useCallback(async (text: string) => {
    if (typeof window === 'undefined') return;

    // Stop current playback if any
    if (audioRef.current) {
      audioRef.current.pause();
    }

    const handleTTSError = (text: string, error: any) => {
      console.warn("TTS: API failed, falling back to browser synthesis.", error);
      setIsSpeaking(false);
      
      if (window.speechSynthesis) {
        window.speechSynthesis.cancel();
        let voices = window.speechSynthesis.getVoices();
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.onend = () => setIsSpeaking(false);
        utterance.onerror = () => setIsSpeaking(false);
        
        let targetVoice = null;
        if (language === 'es') {
          targetVoice = voices.find(v => v.lang.startsWith('es') && (v.name.includes('Monica') || v.name.includes('Helena'))) || 
                        voices.find(v => v.lang.startsWith('es'));
        } else if (language === 'zh') {
          targetVoice = voices.find(v => v.lang.startsWith('zh') && (v.name.includes('Ting-Ting') || v.name.includes('Huihui'))) || 
                        voices.find(v => v.lang.startsWith('zh'));
        } else {
          targetVoice = voices.find(v => v.name.includes('Samantha') || v.name.includes('Victoria') || v.name.includes('Google US English'));
        }
        
        if (targetVoice) utterance.voice = targetVoice;
        utterance.lang = translations[language].voiceLang;
        utterance.rate = 1.0;
        utterance.pitch = 1.1; 
        
        setIsSpeaking(true);
        window.speechSynthesis.speak(utterance);
      }
    };

    const performManualFetch = async (text: string) => {
      try {
        const response = await fetch('/api/speech', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ text, language }),
        });

        if (!response.ok) throw new Error('Failed to generate speech');

        const audioBlob = await response.blob();
        const audioUrl = URL.createObjectURL(audioBlob);
        
        const audio = new Audio(audioUrl);
        audioRef.current = audio;
        
        audio.onended = () => {
          URL.revokeObjectURL(audioUrl);
          audioRef.current = null;
          setIsSpeaking(false);
        };

        await audio.play();
      } catch (e) {
        handleTTSError(text, e);
      }
    };

    setIsSpeaking(true);
    try {
      if (text.length < 1500) {
        const url = `/api/speech?text=${encodeURIComponent(text)}&language=${language}`;
        const audio = new Audio(url);
        audioRef.current = audio;
        
        audio.onended = () => {
          audioRef.current = null;
          setIsSpeaking(false);
        };

        audio.onerror = (e) => {
          console.warn("Audio streaming failed, falling back to manual fetch", e);
          performManualFetch(text);
        };

        await audio.play();
        return;
      }

      await performManualFetch(text);
    } catch (error) {
      handleTTSError(text, error);
    }
  }, [language]);


  return {
    isListening,
    isSpeaking,
    transcript,
    startListening,
    stopListening,
    speak
  };
};
