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

    setIsSpeaking(true);
    try {
      const response = await fetch('/api/speech', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, language }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to generate speech');
      }

      const audioBlob = await response.blob();
      const audioUrl = URL.createObjectURL(audioBlob);
      
      const audio = new Audio(audioUrl);
      audioRef.current = audio;
      
      audio.onended = () => {
        URL.revokeObjectURL(audioUrl);
        audioRef.current = null;
        setIsSpeaking(false);
      };

      console.log("TTS: Using OpenAI API (Nova)");
      await audio.play();
    } catch (error) {
      console.warn("TTS: API failed, falling back to browser synthesis.", error);
      setIsSpeaking(false);
      
      // Fallback to browser's SpeechSynthesis if API fails
      if (window.speechSynthesis) {
        window.speechSynthesis.cancel();
        
        // Ensure voices are loaded
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
        
        if (targetVoice) {
          utterance.voice = targetVoice;
          console.log(`TTS Fallback: Using browser voice: ${targetVoice.name}`);
        } else {
          console.log("TTS Fallback: No matching voice found, using system default.");
        }
        
        utterance.lang = translations[language].voiceLang;
        utterance.rate = 1.0;
        utterance.pitch = 1.1; 
        
        setIsSpeaking(true);
        window.speechSynthesis.speak(utterance);
      }
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
