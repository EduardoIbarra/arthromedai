import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { User, Bot } from 'lucide-react';

interface MessageBubbleProps {
  content: string;
  role: 'user' | 'assistant';
  timestamp: Date;
}

export const MessageBubble = ({ content, role, timestamp }: MessageBubbleProps) => {
  const isUser = role === 'user';

  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      className={cn(
        "flex w-full mb-6 gap-4",
        isUser ? "flex-row-reverse" : "flex-row"
      )}
    >
      <div className={cn(
        "w-10 h-10 rounded-full flex items-center justify-center shrink-0 shadow-sm",
        isUser ? "bg-primary text-white" : "bg-white border border-slate-200 text-secondary dark:bg-slate-800 dark:border-slate-700"
      )}>
        {isUser ? <User size={20} /> : <Bot size={20} />}
      </div>
      
      <div className={cn(
        "max-w-[85%] px-6 py-5 rounded-3xl shadow-sm leading-relaxed",
        isUser 
          ? "bg-user-bg text-user-text rounded-tr-none shadow-secondary/5" 
          : "bg-bot-bg border border-border text-bot-text rounded-tl-none shadow-sm"
      )}>
        <p className="text-sm md:text-[15px] font-medium">{content}</p>
        <span 
          suppressHydrationWarning
          className={cn(
            "text-[10px] block mt-3 font-bold uppercase tracking-widest opacity-40",
            isUser ? "text-user-text" : "text-secondary"
          )}
        >
          {mounted ? timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ""}
        </span>
      </div>
    </motion.div>
  );
};
