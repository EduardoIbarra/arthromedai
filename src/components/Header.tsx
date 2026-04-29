import React from 'react';
import { Activity, Globe } from 'lucide-react';
import { Language } from '@/lib/i18n';

interface HeaderProps {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: any;
}

export const Header = ({ language, setLanguage, t }: HeaderProps) => {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 glass border-b border-border px-6 py-4 shadow-sm">
      <div className="max-w-5xl mx-auto flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-secondary rounded-2xl flex items-center justify-center text-white shadow-lg shadow-secondary/20">
            <Activity size={28} />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-primary">{t.title}</h1>
            <p className="text-[10px] text-secondary font-bold uppercase tracking-widest">{t.subtitle}</p>
          </div>
        </div>
        
        <div className="flex items-center gap-8">
          <div className="flex items-center gap-1 bg-background rounded-xl p-1 border border-border shadow-inner">
            {(['es', 'en', 'zh'] as Language[]).map((lang) => (
              <button
                key={lang}
                onClick={() => setLanguage(lang)}
                className={`px-4 py-1.5 text-[10px] font-black rounded-lg transition-all ${
                  language === lang 
                    ? "bg-primary text-background shadow-sm" 
                    : "text-muted hover:text-primary"
                }`}
              >
                {lang.toUpperCase()}
              </button>
            ))}
          </div>

          <div className="hidden md:flex items-center gap-2">
            <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
            <span className="text-xs font-semibold text-muted">{t.status}</span>
          </div>
        </div>
      </div>
    </header>
  );
};
