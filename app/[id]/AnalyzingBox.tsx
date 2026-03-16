"use client";

import { useState, useEffect } from "react";
import { Think } from "@/lib/types";

interface Props {
  think: Think;
  state: string;
  isCompleted: boolean;
}

export default function AnalyzingBox({ think, state, isCompleted }: Props) {
  const [minimized, setMinimized] = useState(false);

  useEffect(() => {
    // When completed, auto-minimize after a brief delay
    if (isCompleted) {
      const t = setTimeout(() => {
        setMinimized(true);
      }, 1500);
      return () => clearTimeout(t);
    } else {
      setMinimized(false);
    }
  }, [isCompleted]);

  if (minimized) {
    return (
      <div 
        onClick={() => setMinimized(false)}
        className="glass rounded-2xl p-4 cursor-pointer hover:bg-white/5 transition-all text-center animate-fade-in-up border border-indigo-700/40"
      >
        <span className="text-white/40 text-xs font-semibold tracking-widest uppercase">
          + Analisis Selesai (Klik untuk melihat riwayat chat AI)
        </span>
      </div>
    );
  }

  return (
    <div className="relative rounded-3xl backdrop-blur-xl border border-indigo-500/30 bg-indigo-950/20 overflow-hidden transition-all duration-700 p-6 md:p-10 animate-fade-in-up shadow-2xl">
      
      {/* Background glow */}
      <div className="absolute top-0 right-0 w-[400px] h-[400px] rounded-full blur-[120px] pointer-events-none opacity-20 bg-indigo-600" />

      {/* Header & GIF */}
      <div className="flex items-start justify-between mb-10 relative z-10">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-black/40 border border-indigo-500/40 shadow-[0_0_15px_rgba(99,102,241,0.2)]">
            {!isCompleted ? (
              <>
                <div className="typing-indicator flex gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-bounce" style={{ animationDelay: '0ms' }} />
                  <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-bounce" style={{ animationDelay: '150ms' }} />
                  <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
                <span className="text-xs font-bold uppercase tracking-widest text-indigo-300 ml-1">
                  Cross-Analyzing . . .
                </span>
              </>
            ) : (
              <>
                <span className="text-emerald-400 text-sm">✓</span>
                <span className="text-xs font-bold uppercase tracking-widest text-emerald-300">
                  Analisis Selesai
                </span>
              </>
            )}
          </div>
        </div>

        {/* Minimize button */}
        {isCompleted && (
          <button 
            onClick={() => setMinimized(true)}
            className="text-white/40 hover:text-white/80 p-2 z-10"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="4 14 10 14 10 20"/><polyline points="20 10 14 10 14 4"/><line x1="14" y1="10" x2="21" y2="3"/><line x1="3" y1="21" x2="10" y2="14"/></svg>
          </button>
        )}
      </div>

      {/* Middle layout: Chat on left, GIF on right (if not completed) */}
      <div className="flex flex-col-reverse lg:flex-row items-end lg:items-center justify-between gap-10 relative z-10 w-full max-w-4xl mx-auto">
        
        {/* Chat bubbles */}
        <div className="flex-1 space-y-6 w-full">
          <ChatBubble
            name="Sumber Resmi AI"
            role="Official API & Journal Scraper"
            message={think.official_insight || "Memproses validasi dari sumber resmi..."}
            color="emerald"
            delay={0}
            avatar="🏛️"
          />
          <ChatBubble
            name="Media Scanner"
            role="News & Social Media Intelligence"
            message={think.media_insight || "Menganalisis sentimen dan tren pemberitaan media..."}
            color="amber"
            delay={2}
            avatar="📰"
          />
          <ChatBubble
            name="Logic Core Evaluator"
            role="Deep Logic & Context Engine"
            message={think.analysis_insight || "Menggabungkan temuan dan mengevaluasi probabilitas kebenaran klaim..."}
            color="purple"
            delay={4}
            avatar="🧠"
          />
        </div>

        {/* Analyzing GIF */}
        {!isCompleted && (
          <div className="shrink-0 animate-fade-in-up flex flex-col items-center gap-3">
            <div className="p-2 rounded-2xl bg-black/40 border border-indigo-500/30">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img 
                src="/assets/analyzing.gif" 
                alt="Analyzing..." 
                className="rounded-xl object-cover mix-blend-screen opacity-90 shadow-[0_0_30px_rgba(99,102,241,0.3)]"
                width={250}
                height={141}
              />
            </div>
            <p className="text-indigo-300/60 text-[10px] uppercase tracking-widest font-mono">
              Synthesizing outputs
            </p>
          </div>
        )}
      </div>

    </div>
  );
}

function ChatBubble({ name, role, message, color, delay, avatar }: any) {
  const colors: Record<string, string> = {
    emerald: "from-emerald-900/40 text-emerald-300 border-emerald-500/30",
    amber: "from-amber-900/40 text-amber-300 border-amber-500/30",
    purple: "from-purple-900/40 text-purple-300 border-purple-500/30",
  };
  const cls = colors[color];

  return (
    <div className="flex items-end gap-3 animate-fade-in-up" style={{ animationDelay: `${delay * 0.15}s` }}>
      {/* Avatar */}
      <div className={`w-10 h-10 shrink-0 rounded-2xl flex items-center justify-center text-lg bg-black/50 border ${cls.split(' ').pop()}`}>
        {avatar}
      </div>

      {/* Message Box */}
      <div className="flex flex-col gap-1 max-w-[90%]">
        <div className="flex items-baseline gap-2 ml-1">
          <span className="text-white/80 font-bold text-xs">{name}</span>
          <span className="text-white/30 text-[9px] font-mono tracking-wider">{role}</span>
        </div>
        <div className={`relative px-5 py-3.5 rounded-2xl rounded-bl-sm bg-gradient-to-br ${cls} backdrop-blur-sm border shadow-lg text-xs leading-relaxed`}>
          {message}
        </div>
      </div>
    </div>
  );
}
