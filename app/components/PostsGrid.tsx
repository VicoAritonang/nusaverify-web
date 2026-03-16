"use client";

import { useState, useMemo } from "react";
import { Post } from "@/lib/types";
import PostCard from "./PostCard";

function sortUncertain(posts: Post[]): Post[] {
  const pri: Record<string, number> = { updating: 0, expired: 1, completed: 2, processing: 3 };
  return [...posts].sort((a, b) => {
    const diff = (pri[a.status] ?? 99) - (pri[b.status] ?? 99);
    if (diff !== 0) return diff;
    return new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime();
  });
}

export default function PostsGrid({ posts }: { posts: Post[] }) {
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  const categories = useMemo(
    () => Array.from(new Set(posts.map((p) => p.category).filter(Boolean) as string[])).sort(),
    [posts]
  );

  const filtered = useMemo(
    () => (activeCategory ? posts.filter((p) => p.category === activeCategory) : posts),
    [posts, activeCategory]
  );

  const validPosts    = useMemo(() => filtered.filter((p) => p.result === "valid"), [filtered]);
  const hoaxPosts     = useMemo(() => filtered.filter((p) => p.result === "hoax"), [filtered]);
  const uncertainPosts = useMemo(
    () => sortUncertain(filtered.filter((p) => p.result === "uncertain" || p.result === null)),
    [filtered]
  );

  return (
    <>
      {/* ── CATEGORY FILTER ─────────────────────── */}
      {categories.length > 0 && (
        <div className="flex items-center justify-center gap-2 flex-wrap mb-8 animate-fade-in-down">
          <span className="text-white/25 text-xs font-medium mr-1">Filter:</span>

          <button
            onClick={() => setActiveCategory(null)}
            className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all duration-300 ${
              !activeCategory
                ? "bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg shadow-indigo-500/25"
                : "glass text-white/50 hover:text-white/80 hover:bg-white/8"
            }`}
          >
            Semua
          </button>

          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat === activeCategory ? null : cat)}
              className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all duration-300 flex items-center gap-1.5 ${
                activeCategory === cat
                  ? "bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg shadow-indigo-500/25"
                  : "glass text-white/50 hover:text-white/80 hover:bg-white/8"
              }`}
            >
              🏷 {cat.charAt(0).toUpperCase() + cat.slice(1)}
            </button>
          ))}
        </div>
      )}

      {/* ── 3-COLUMN GRID ───────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Valid */}
        <div className="animate-slide-in-left">
          <div className="column-header glass" style={{ borderBottom: "2px solid rgba(52,211,153,0.35)" }}>
            <div className="flex items-center justify-center gap-2">
              <div className="w-2 h-2 rounded-full bg-emerald-400 animate-breathe" />
              <span className="text-emerald-400">Terverifikasi Valid</span>
            </div>
            <div className="text-white/30 text-[10px] font-normal mt-0.5 normal-case tracking-normal">
              {validPosts.length} hasil
            </div>
          </div>
          <div className="space-y-3 stagger-children">
            {validPosts.length === 0 ? (
              <EmptyState emoji="✅" label="Belum ada analisis valid" />
            ) : (
              validPosts.map((p, i) => <PostCard key={p.id} post={p} index={i} />)
            )}
          </div>
        </div>

        {/* Hoax */}
        <div className="animate-fade-in-up">
          <div className="column-header glass" style={{ borderBottom: "2px solid rgba(239,68,68,0.35)" }}>
            <div className="flex items-center justify-center gap-2">
              <div className="w-2 h-2 rounded-full bg-red-400 animate-breathe" />
              <span className="text-red-400">Terdeteksi Hoax</span>
            </div>
            <div className="text-white/30 text-[10px] font-normal mt-0.5 normal-case tracking-normal">
              {hoaxPosts.length} hasil
            </div>
          </div>
          <div className="space-y-3 stagger-children">
            {hoaxPosts.length === 0 ? (
              <EmptyState emoji="🚫" label="Belum ada analisis hoax" />
            ) : (
              hoaxPosts.map((p, i) => <PostCard key={p.id} post={p} index={i} />)
            )}
          </div>
        </div>

        {/* Uncertain */}
        <div className="animate-slide-in-right">
          <div className="column-header glass" style={{ borderBottom: "2px solid rgba(245,158,11,0.35)" }}>
            <div className="flex items-center justify-center gap-2">
              <div className="w-2 h-2 rounded-full bg-amber-400 animate-breathe" />
              <span className="text-amber-400">Belum Pasti</span>
            </div>
            <div className="text-white/30 text-[10px] font-normal mt-0.5 normal-case tracking-normal">
              {uncertainPosts.length} hasil
            </div>
          </div>
          <div className="space-y-3 stagger-children">
            {uncertainPosts.length === 0 ? (
              <EmptyState emoji="❓" label="Belum ada analisis uncertain" />
            ) : (
              uncertainPosts.map((p, i) => <PostCard key={p.id} post={p} index={i} />)
            )}
          </div>
        </div>
      </div>
    </>
  );
}

function EmptyState({ emoji, label }: { emoji: string; label: string }) {
  return (
    <div className="glass rounded-2xl p-8 text-center">
      <div className="text-white/15 text-4xl mb-2">{emoji}</div>
      <p className="text-white/25 text-xs">{label}</p>
    </div>
  );
}
