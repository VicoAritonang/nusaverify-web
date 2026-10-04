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
    { key: "uncertain", title: "Belum terkonfirmasi", cls: "u", items: cols.uncertain },
  ] as const;

  return (
    <div>
      <div className="section-head">
        <div>
          <div className="eyebrow">Verifikasi terbaru · {filtered.length} klaim</div>
          <h2 className="h-section" style={{ margin: "12px 0 0" }}>
            Klaim yang baru saja dicek.
          </h2>
        </div>
        {facets.length > 1 && (
          <div className="lg lg-pill" style={{ display: "flex", flexWrap: "wrap", gap: 2, padding: 4 }} role="group" aria-label="Filter kelas aset">
            {facets.map((s) => {
              const c = ASSET_CLASS_COLORS[s];
              const isActive = filter === s;
              return (
                <button
                  key={s}
                  type="button"
                  onClick={() => setFilter(s)}
                  aria-pressed={isActive}
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 7,
                    padding: "7px 14px",
                    borderRadius: 999,
                    border: 0,
                    fontSize: 13,
                    fontWeight: 500,
                    transition: "background .25s ease, color .25s ease",
                    background: isActive ? "rgba(255,255,255,.12)" : "transparent",
                    color: isActive ? "var(--fg)" : "var(--fg-3)",
                    boxShadow: isActive ? "inset 0 1px 0 rgba(255,255,255,.16)" : "none",
                  }}
                >
                  {s !== "Semua" && c && <span style={{ width: 6, height: 6, borderRadius: 6, background: c }} />}
                  {s.charAt(0).toUpperCase() + s.slice(1)}
                </button>
              );
            })}
          </div>
        )}
      </div>

      <div className="posts-columns">
        {columns.map((c) => (
          <div key={c.key}>
            <div className={`col-head ${c.cls}`}>
              <span style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <span className="swatch" />
                {c.title}
              </span>
              <span className="count">{c.items.length}</span>
            </div>
            <div className="stg" style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              {c.items.map((p, i) => (
                <PostCard key={p.id} post={p} index={i} />
              ))}
              {c.items.length === 0 && (
                <div
                  style={{
                    padding: 28,
                    textAlign: "center",
                    color: "var(--fg-4)",
                    fontSize: 13,
                    borderRadius: 24,
                    boxShadow: "inset 0 0 0 1px rgba(255,255,255,.06)",
                  }}
                >
                  Belum ada klaim di kategori ini.
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
