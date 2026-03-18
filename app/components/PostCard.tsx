"use client";

import { Post } from "@/lib/types";
import { useRouter } from "next/navigation";

function getRelativeTime(dateStr: string): string {
  const now = new Date();
  const date = new Date(dateStr);
  const diff = now.getTime() - date.getTime();
  const min = Math.floor(diff / 60000);
  const hr  = Math.floor(min / 60);
  const day = Math.floor(hr / 24);
  if (min < 1)  return "baru saja";
  if (min < 60) return `${min}m lalu`;
  if (hr < 24)  return `${hr}j lalu`;
  if (day < 7)  return `${day}h lalu`;
  return new Date(dateStr).toLocaleDateString("id-ID", { day:"numeric", month:"short" });
}

/* ── Icon components ──────────────────────────────── */
function ShieldIcon({ color }: { color: string }) {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="M9 12l2 2 4-4"/>
    </svg>
  );
}
function AlertIcon({ color }: { color: string }) {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/>
      <line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
    </svg>
  );
}
function QuestionIcon({ color }: { color: string }) {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 015.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/>
    </svg>
  );
}

/* ── Config per result type ───────────────────────── */
const CONFIG = {
  valid: {
    cardClass: "card-valid",
    clipClass: "clip-valid",
    iconColor: "#34d399",
    textColor: "text-emerald-300",
    mutedColor: "text-emerald-400/60",
    icon: (c: string) => <ShieldIcon color={c} />,
    barClass: "bg-emerald-500",
    label: "Valid",
    labelColor: "#059669",
  },
  hoax: {
    cardClass: "card-hoax",
    clipClass: "clip-hoax",
    iconColor: "#f87171",
    textColor: "text-red-300",
    mutedColor: "text-red-400/60",
    icon: (c: string) => <AlertIcon color={c} />,
    barClass: "bg-red-500",
    label: "Hoaks",
    labelColor: "#dc2626",
  },
  uncertain: {
    cardClass: "card-uncertain",
    clipClass: "clip-uncertain",
    iconColor: "#fcd34d",
    textColor: "text-amber-300",
    mutedColor: "text-amber-400/60",
    icon: (c: string) => <QuestionIcon color={c} />,
    barClass: "bg-amber-500",
    label: "Belum Pasti",
    labelColor: "#d97706",
  },
} as const;

/* ── Status badge ─────────────────────────────────── */
function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { cls: string; dot: string }> = {
    updating:   { cls: "badge-updating",  dot: "🔄" },
    expired:    { cls: "badge-expired",   dot: "⏰" },
    completed:  { cls: "badge-completed", dot: "●" },
    processing: { cls: "badge-processing",dot: "⏳" },
  };
  const { cls, dot } = map[status] ?? map.expired;
  return <span className={`badge ${cls}`}><span>{dot}</span>{status}</span>;
}

/* ── Confidence bar ───────────────────────────────── */
function ConfidenceBar({ confidence, barClass }: { confidence: number | null; barClass: string }) {
  if (confidence === null) return null;
  const pct = (Math.abs(confidence) / 100) * 100;
  return (
    <div className="confidence-bar">
      <div className={`confidence-bar-fill ${barClass}`} style={{ width: `${pct}%` }} />
    </div>
  );
}

/* ── Main PostCard ────────────────────────────────── */
export default function PostCard({ post, index }: { post: Post; index: number }) {
  const router = useRouter();
  const result = (post.result ?? "uncertain") as "valid" | "hoax" | "uncertain";
  const cfg = CONFIG[result];

  return (
    <article
      className={`post-card ${cfg.cardClass} animate-card-entrance`}
      style={{ animationDelay: `${index * 0.055}s` }}
      onClick={() => router.push(`/${post.id}`)}
      tabIndex={0}
      role="button"
      onKeyDown={(e) => { if (e.key === "Enter") router.push(`/${post.id}`); }}
      aria-label={`Post: ${post.title || "Untitled"}`}
    >
      {/* Police tape overlay for hoax */}
      {result === "hoax" && <div className="card-hoax-tape" />}

      {/* Corner clip decoration */}
      <div className={`card-corner-clip ${cfg.clipClass}`} />

      {/* ─ Card content ─────────────────── */}
      <div className="post-card-inner">

        {/* TOP ROW: icon + title + status */}
        <div className="flex items-start gap-3 mb-3">
          {/* Icon badge */}
          <div
            className="shrink-0 w-9 h-9 rounded-xl flex items-center justify-center"
            style={{ background: `${cfg.labelColor}22`, border: `1px solid ${cfg.labelColor}40` }}
          >
            {cfg.icon(cfg.iconColor)}
          </div>

          {/* Title */}
          <div className="flex-1 min-w-0 pt-0.5">
            <h3 className="text-white font-bold text-[13px] leading-snug line-clamp-2">
              {post.title || "Analisis Tanpa Judul"}
            </h3>
          </div>

          {/* Status badge */}
          <StatusBadge status={post.status} />
        </div>

        {/* CATEGORY + RESULT LABEL row */}
        <div className="flex items-center gap-2 mb-3 flex-wrap">
          <span
            className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold tracking-wide"
            style={{
              background: `${cfg.labelColor}20`,
              border: `1px solid ${cfg.labelColor}35`,
              color: cfg.iconColor,
            }}
          >
            {result === "valid" && "✓"}{result === "hoax" && "✕"}{result === "uncertain" && "?"}&nbsp;
            {cfg.label}
          </span>
          {post.category && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-white/8 border border-white/10 text-white/45 text-[10px] font-medium">
              🏷 {post.category.charAt(0).toUpperCase() + post.category.slice(1)}
            </span>
          )}
        </div>

        {/* SUMMARY */}
        {post.summary && (
          <p className="text-white/75 text-xs leading-relaxed mb-3 line-clamp-2">
            {post.summary}
          </p>
        )}

        {/* CONTEXT quote */}
        <blockquote className="relative pl-3 mb-3">
          <span
            className="absolute left-0 top-0 bottom-0 w-0.5 rounded-full"
            style={{ background: `linear-gradient(180deg, ${cfg.labelColor}, transparent)` }}
          />
          <p className="text-white/40 text-[11px] leading-relaxed italic line-clamp-2">
            {post.context}
          </p>
        </blockquote>

        {/* FOOTER */}
        <div className="flex items-center justify-between">
          <span className="text-white/25 text-[10px] font-medium">
            {getRelativeTime(post.updated_at)}
          </span>
          {post.confidence !== null && (
            <div className="flex items-center gap-1.5">
              {/* micro gauge */}
              <svg width="28" height="28" viewBox="0 0 36 36">
                <circle cx="18" cy="18" r="15" fill="none" stroke="rgba(255,255,255,0.07)" strokeWidth="3"/>
                <circle
                  cx="18" cy="18" r="15" fill="none"
                  stroke={cfg.iconColor}
                  strokeWidth="3"
                  strokeDasharray={`${(Math.abs(post.confidence) / 100) * 94} 94`}
                  strokeLinecap="round"
                  strokeDashoffset="23.5"
                  opacity="0.85"
                />
              </svg>
              <span className={`text-[12px] font-mono font-extrabold ${cfg.textColor}`}>
                {post.confidence > 0 ? "+" : ""}{post.confidence}
              </span>
            </div>
          )}
        </div>

        <ConfidenceBar confidence={post.confidence} barClass={cfg.barClass} />
      </div>
    </article>
  );
}
