"use client";

import { useState, useMemo } from "react";
import { Post } from "@/lib/types";
import { ASSET_CLASS_COLORS } from "@/lib/investmentData";
import PostCard from "./PostCard";

const STATUS_PRI: Record<string, number> = { updating: 0, expired: 1, completed: 2, processing: 3 };

function sortUncertain(posts: Post[]): Post[] {
  return [...posts].sort((a, b) => {
    const diff = (STATUS_PRI[a.status] ?? 99) - (STATUS_PRI[b.status] ?? 99);
    if (diff !== 0) return diff;
    return new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime();
  });
}

const facetOf = (p: Post): string | null => p.asset_class ?? p.category ?? null;

export default function PostsGrid({ posts }: { posts: Post[] }) {
  const [filter, setFilter] = useState("Semua");

  const facets = useMemo(() => {
    const set = new Set<string>();
    posts.forEach((p) => {
      const f = facetOf(p);
      if (f) set.add(f);
    });
    return ["Semua", ...Array.from(set)];
  }, [posts]);

  const filtered = useMemo(
    () => (filter === "Semua" ? posts : posts.filter((p) => facetOf(p) === filter)),
    [posts, filter]
  );

  const cols = useMemo(
    () => ({
      valid: filtered.filter((p) => p.result === "valid"),
      hoax: filtered.filter((p) => p.result === "hoax"),
      uncertain: sortUncertain(filtered.filter((p) => p.result === "uncertain" || p.result === null)),
    }),
    [filtered]
  );

  const columns = [
    { key: "valid", title: "Terverifikasi", cls: "v", items: cols.valid },
    { key: "hoax", title: "Misinformasi", cls: "h", items: cols.hoax },
    { key: "uncertain", title: "Belum Pasti", cls: "u", items: cols.uncertain },
  ] as const;

  return (
    <div className="fade-in-up" style={{ animationDelay: ".25s" }}>
      {/* HEADER + FILTER */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: 18,
          flexWrap: "wrap",
          gap: 10,
        }}
      >
        <div>
          <h2 className="h-section" style={{ margin: 0, color: "#fff" }}>
            Verifikasi Terbaru
          </h2>
          <div className="label-tech" style={{ marginTop: 2 }}>
            {filtered.length} klaim · live polling
          </div>
        </div>
        {facets.length > 1 && (
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
            {facets.map((s) => {
              const c = ASSET_CLASS_COLORS[s];
              const isActive = filter === s;
              return (
                <button
                  key={s}
                  onClick={() => setFilter(s)}
                  className="qchip"
                  style={
                    isActive
                      ? {
                          background: c ? `${c}22` : "rgba(99,102,241,.15)",
                          borderColor: c ? `${c}55` : "rgba(99,102,241,.4)",
                          color: c || "#c7d2fe",
                        }
                      : undefined
                  }
                >
                  {s !== "Semua" && c && (
                    <span
                      style={{ width: 6, height: 6, borderRadius: 2, background: c, display: "inline-block" }}
                    />
                  )}
                  {s.charAt(0).toUpperCase() + s.slice(1)}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* 3-COLUMN GRID */}
      <div className="posts-columns">
        {columns.map((c) => (
          <div key={c.key}>
            <div className={`col-head ${c.cls}`}>
              <span>{c.title}</span>
              <span className="mono" style={{ fontSize: 11, opacity: 0.7 }}>
                · {c.items.length}
              </span>
            </div>
            <div className="stg" style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {c.items.map((p, i) => (
                <PostCard key={p.id} post={p} index={i} />
              ))}
              {c.items.length === 0 && (
                <div
                  style={{
                    padding: 24,
                    textAlign: "center",
                    color: "rgba(255,255,255,.2)",
                    fontSize: 11,
                    border: "1px dashed rgba(255,255,255,.06)",
                    borderRadius: 14,
                  }}
                >
                  Tidak ada hasil
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
