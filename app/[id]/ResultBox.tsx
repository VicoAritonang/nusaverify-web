"use client";

import { Post } from "@/lib/types";

export default function ResultBox({ post }: { post: Post }) {
  const result = (post.result || "uncertain") as "valid" | "hoax" | "uncertain";

  const config = {
    valid: {
      color: "emerald",
      bgClass: "from-emerald-950/80 to-emerald-900/20",
      borderClass: "border-emerald-500/30",
      textClass: "text-emerald-400",
      icon: (
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="M9 12l2 2 4-4"/>
        </svg>
      ),
      label: "Terverifikasi Valid"
    },
    hoax: {
      color: "red",
      bgClass: "from-red-950/80 to-red-900/20",
      borderClass: "border-red-500/30",
      textClass: "text-red-400",
      icon: (
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/>
          <line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
        </svg>
      ),
      label: "Terdeteksi Hoaks"
    },
    uncertain: {
      color: "amber",
      bgClass: "from-amber-950/80 to-amber-900/20",
      borderClass: "border-amber-500/30",
      textClass: "text-amber-400",
      icon: (
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 015.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/>
        </svg>
      ),
      label: "Belum Pasti (Uncertain)"
    }
  };

  const c = config[result];
  const conf = post.confidence || 0;
  const pct = Math.abs(conf);

  return (
    <div className={`relative rounded-3xl p-8 md:p-12 overflow-hidden animate-fade-in-up shadow-2xl bg-gradient-to-br ${c.bgClass} border ${c.borderClass}`}>
      {/* Tape effect if hoax */}
      {result === "hoax" && (
        <div className="absolute inset-0 pointer-events-none opacity-20" 
             style={{ background: 'repeating-linear-gradient(-48deg, rgba(239,68,68,0.2) 0px, rgba(239,68,68,0.2) 10px, transparent 10px, transparent 22px, rgba(255,255,255,0.05) 22px, rgba(255,255,255,0.05) 32px, transparent 32px, transparent 44px)' }} 
        />
      )}
      
      <div className="relative z-10 flex flex-col md:flex-row items-center md:items-start gap-8 md:gap-12">
        {/* Left: Result Badge & Score */}
        <div className="flex flex-col items-center shrink-0">
          <div className={`w-24 h-24 rounded-3xl flex items-center justify-center mb-6 shadow-lg bg-black/40 border ${c.borderClass} ${c.textClass}`}>
            <div className="animate-[pulse_3s_ease-in-out_infinite]">{c.icon}</div>
          </div>
          
          <div className="relative">
            <svg width="120" height="120" viewBox="0 0 120 120">
              {/* Background circle track (75% circle, rotated to open at bottom) */}
              <circle 
                cx="60" cy="60" r="54" fill="none" 
                stroke="rgba(255,255,255,0.05)" strokeWidth="8" 
                strokeLinecap="round"
                strokeDasharray="254.46 339.29"
                style={{ transform: 'rotate(135deg)', transformOrigin: '50% 50%' }}
              />
              {/* Foreground circle indicator (mapped over the 75% track) */}
              <circle 
                cx="60" cy="60" r="54" fill="none" 
                stroke="currentColor" strokeWidth="8" 
                className={c.textClass}
                strokeLinecap="round"
                strokeDasharray={`${(pct / 100) * 254.46} 339.29`}
                style={{ transform: 'rotate(135deg)', transformOrigin: '50% 50%', transition: 'stroke-dasharray 1.5s cubic-bezier(0.16, 1, 0.3, 1)' }}
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className={`text-3xl font-black font-mono tracking-tighter ${c.textClass}`}>
                {Math.round(pct)}%
              </span>
              <span className="text-[9px] uppercase tracking-widest text-white/40 mt-1 text-center leading-tight">
                Tingkat<br/>Keyakinan
              </span>
            </div>
          </div>
        </div>

        {/* Right: Summary & Details */}
        <div className="flex-1 text-center md:text-left">
          <div className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-black/30 border ${c.borderClass} mb-6`}>
            {result === "valid" && <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />}
            {result === "hoax" && <span className="w-2 h-2 rounded-full bg-red-400 animate-pulse" />}
            {result === "uncertain" && <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />}
            <span className={`text-xs font-bold uppercase tracking-widest ${c.textClass}`}>{c.label}</span>
          </div>

          <h2 className="text-2xl font-bold text-white mb-6 leading-relaxed">
            Kesimpulan Analisis
          </h2>

          <div className="prose prose-sm prose-invert max-w-none">
            <p className="text-white/80 text-base md:text-lg leading-relaxed">
              {post.summary}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
