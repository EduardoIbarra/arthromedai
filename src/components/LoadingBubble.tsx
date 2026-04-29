import React from 'react';
import { motion } from 'framer-motion';
import { Bot } from 'lucide-react';

export const LoadingBubble = ({ status = "Thinking..." }: { status?: string }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      className="flex w-full mb-6 gap-4 flex-row"
    >
      <div className="w-10 h-10 rounded-full flex items-center justify-center shrink-0 shadow-sm bg-white border border-slate-200 text-secondary dark:bg-slate-800 dark:border-slate-700">
        <Bot size={20} />
      </div>
      
      <div className="bg-bot-bg border border-border px-6 py-4 rounded-3xl rounded-tl-none shadow-sm flex flex-col gap-2">
        <div className="flex items-center gap-1.5">
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              animate={{ 
                scale: [1, 1.2, 1],
                opacity: [0.4, 1, 0.4]
              }}
              transition={{
                duration: 1,
                repeat: Infinity,
                delay: i * 0.2
              }}
              className="w-2 h-2 rounded-full bg-primary"
            />
          ))}
        </div>
        <span className="text-[10px] font-bold uppercase tracking-widest text-secondary opacity-60">
          {status}
        </span>
      </div>
    </motion.div>
  );
};
