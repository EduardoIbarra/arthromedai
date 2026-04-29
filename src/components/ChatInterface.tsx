"use client";

import React, { useState, useRef, useEffect } from 'react';
import { Header } from './Header';
import { MessageBubble } from './MessageBubble';
import { LoadingBubble } from './LoadingBubble';
import { VoiceControl } from './VoiceControl';
import { useVoice } from '@/hooks/useVoice';
import { motion, AnimatePresence } from 'framer-motion';
import { Language, translations } from '@/lib/i18n';
import { useChat } from '@ai-sdk/react';
import { TextStreamChatTransport } from 'ai';

export const ChatInterface = () => {
  const [language, setLanguage] = useState<Language>('es');
  const t = translations[language];

  const { speak, isListening, transcript, startListening, stopListening, isSpeaking } = useVoice(language);
  
  const stripMarkdown = (text: string) => {
    return text
      .replace(/\[([^\]]+)\]\([^\)]+\)/g, '$1') // Remove links but keep text
      .replace(/\*\*(.*?)\*\*/g, '$1')         // Remove bold
      .replace(/\*(.*?)\*/g, '$1')             // Remove italic
      .replace(/__(.*?)__/g, '$1')             // Remove bold
      .replace(/_(.*?)_/g, '$1')               // Remove italic
      .replace(/#(.*?)[\n\r]/g, '$1 ')         // Remove headers
      .replace(/```[\s\S]*?```/g, '')          // Remove code blocks
      .replace(/`([^`]+)`/g, '$1')             // Remove inline code
      .replace(/^[*-]\s+/gm, '')               // Remove bullet points
      .replace(/^\d+\.\s+/gm, '')              // Remove numbered lists
      .replace(/\n+/g, ' ')                    // Replace newlines with spaces
      .replace(/\s+/g, ' ')                    // Collapse multiple spaces
      .trim();
  };

  const { messages, sendMessage, setMessages, status } = useChat({
    transport: new TextStreamChatTransport({
      api: '/api/chat',
      body: { language }
    }),
    onFinish: ({ message }) => {
      // Robust text extraction from parts or content
      const textFromParts = (message as any).parts
        ?.filter((part: any) => part.type === 'text')
        ?.map((part: any) => part.text)
        ?.join('') || '';
      
      const finalText = textFromParts || (message as any).content || '';
      const cleanedText = stripMarkdown(finalText);
      
      if (cleanedText) {
        console.log("Speaking text:", cleanedText);
        speak(cleanedText);
      }
    },
    messages: [
      {
        id: '1',
        role: 'assistant',
        parts: [{ type: 'text', text: t.welcome }],
        createdAt: new Date()
      }
    ]
  });
  
  const isLoading = status === 'streaming' || status === 'submitted';

  // Re-initialize welcome message when language changes if it's the only message
  useEffect(() => {
    setMessages((prevMessages: any[]) => {
      if (prevMessages.length === 1 && prevMessages[0].id === '1') {
        const currentContent = prevMessages[0].parts
          ?.filter((part: any) => part.type === 'text')
          ?.map((part: any) => part.text)
          ?.join('') || '';
        
        if (currentContent === t.welcome) {
          return prevMessages;
        }

        return [{
          id: '1',
          role: 'assistant',
          parts: [{ type: 'text', text: t.welcome }],
          createdAt: new Date()
        } as any];
      }
      return prevMessages;
    });
  }, [language, setMessages, t.welcome]);

  const scrollRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading, isSpeaking]);

  const handleSendMessage = async (text: string) => {
    if (!text.trim()) return;

    sendMessage({
      text
    });
  };

  return (
    <main className="min-h-screen bg-background">
      <Header language={language} setLanguage={setLanguage} t={t} />
      
      <div 
        ref={scrollRef}
        className="max-w-3xl mx-auto pt-32 pb-48 px-6 h-screen overflow-y-auto no-scrollbar"
      >
        <AnimatePresence initial={false}>
          {messages.map((msg) => {
            const content = msg.parts
              .filter((part): part is { type: 'text'; text: string } => part.type === 'text')
              .map(part => part.text)
              .join('');

            return (
              <MessageBubble 
                key={msg.id}
                role={msg.role as 'user' | 'assistant'}
                content={content}
                timestamp={msg.createdAt ? new Date(msg.createdAt) : new Date()}
              />
            );
          })}
          {isLoading && <LoadingBubble status="Thinking..." />}
          {!isLoading && isSpeaking && <LoadingBubble status="Generating Voice..." />}
        </AnimatePresence>
      </div>

      <VoiceControl 
        isListening={isListening}
        transcript={transcript}
        onStart={startListening}
        onStop={stopListening}
        onSubmit={handleSendMessage}
        isProcessing={isLoading || isSpeaking}
        t={t}
      />
    </main>
  );
};
