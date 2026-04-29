"use client";

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mic, MicOff, Send, Bot } from 'lucide-react';
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
  return (
    <div className="fixed bottom-0 left-0 right-0 p-8 z-50">
      <div className="max-w-3xl mx-auto">
        <div className="glass rounded-[2rem] p-5 shadow-2xl border border-border relative overflow-hidden">
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

          <div className="relative flex items-center gap-4">
            <button
              onClick={isListening ? onStop : onStart}
              disabled={isProcessing}
              className={cn(
                "w-16 h-16 rounded-2xl flex items-center justify-center transition-all duration-500 shadow-lg",
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
                  <Bot size={28} className="opacity-50" />
                </motion.div>
              ) : isListening ? (
                <MicOff size={28} />
              ) : (
                <Mic size={28} />
              )}
            </button>

            <div className="flex-1">
              {isListening || transcript ? (
                <div className="px-2">
                  <p className={cn(
                    "text-lg font-medium transition-opacity",
                    isListening ? "text-foreground animate-pulse" : "text-foreground/80"
                  )}>
                    {transcript || t.listening}
                  </p>
                </div>
              ) : (
                <p className="text-muted font-medium ml-2">{t.placeholder}</p>
              )}
            </div>

            {transcript && !isListening && (
              <button
                onClick={() => onSubmit(transcript)}
                className="w-12 h-12 bg-primary text-background rounded-xl flex items-center justify-center hover:scale-105 transition-transform"
              >
                <Send size={20} />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
