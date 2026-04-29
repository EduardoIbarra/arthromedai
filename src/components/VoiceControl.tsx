"use client";

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mic, MicOff, Send, Bot, Keyboard } from 'lucide-react';
import { cn } from '@/lib/utils';

interface VoiceControlProps {
  isListening: boolean;
  transcript: string;
  onStart: () => void;
  onStop: () => void;
  onSubmit: (text: string) => void;
  isProcessing: boolean;
  t: any;
}

export const VoiceControl = ({ isListening, transcript, onStart, onStop, onSubmit, isProcessing, t }: VoiceControlProps) => {
  const [inputValue, setInputValue] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  // Sync transcript to input value when listening
  useEffect(() => {
    if (isListening && transcript) {
      setInputValue(transcript);
    }
  }, [isListening, transcript]);

  const handleSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (inputValue.trim() && !isProcessing) {
      onSubmit(inputValue);
      setInputValue("");
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 p-8 z-50">
      <div className="max-w-3xl mx-auto">
        <form 
          onSubmit={handleSubmit}
          className="glass rounded-[2rem] p-3 shadow-2xl border border-border relative overflow-hidden"
        >
          {/* Pulsing background when listening */}
          <AnimatePresence>
            {isListening && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 bg-secondary/5 pointer-events-none"
              >
                <motion.div
                  animate={{ 
                    scale: [1, 1.2, 1],
                    opacity: [0.1, 0.2, 0.1]
                  }}
                  transition={{ repeat: Infinity, duration: 2 }}
                  className="absolute inset-0 flex items-center justify-center"
                >
                  <div className="w-64 h-64 bg-secondary rounded-full blur-3xl" />
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="relative flex items-center gap-3">
            <button
              type="button"
              onClick={isListening ? onStop : onStart}
              disabled={isProcessing}
              className={cn(
                "w-14 h-14 rounded-2xl flex items-center justify-center transition-all duration-500 shadow-lg shrink-0",
                isListening 
                  ? "bg-red-500 text-white animate-pulse" 
                  : isProcessing
                    ? "bg-slate-200 text-slate-400 cursor-not-allowed"
                    : "bg-secondary text-white hover:scale-105 active:scale-95 shadow-secondary/30"
              )}
            >
              {isProcessing ? (
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                >
                  <Bot size={24} className="opacity-50" />
                </motion.div>
              ) : isListening ? (
                <MicOff size={24} />
              ) : (
                <Mic size={24} />
              )}
            </button>

            <div className="flex-1 relative flex items-center">
              <input
                ref={inputRef}
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={handleKeyDown}
                disabled={isProcessing}
                placeholder={isListening ? t.listening : t.typePlaceholder}
                className={cn(
                  "w-full bg-transparent border-none focus:ring-0 text-lg font-medium py-2 px-2 transition-all placeholder:text-muted/50",
                  isListening ? "text-foreground animate-pulse" : "text-foreground"
                )}
              />
              {!inputValue && !isListening && (
                <Keyboard size={18} className="absolute right-4 text-muted/30 pointer-events-none" />
              )}
            </div>

            <button
              type="submit"
              disabled={!inputValue.trim() || isProcessing || isListening}
              className={cn(
                "w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-300",
                inputValue.trim() && !isProcessing && !isListening
                  ? "bg-primary text-background hover:scale-105 active:scale-95 shadow-lg shadow-primary/20"
                  : "bg-slate-100 text-slate-300 scale-90 opacity-50 cursor-not-allowed"
              )}
            >
              <Send size={20} />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
