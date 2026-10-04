"use client";

import { useRouter } from "next/navigation";
import { Post } from "@/lib/types";
import { RESULT_META, resultOf } from "@/lib/investmentData";
import { AssetClassChip, TickerChip, SectorChip, SentimentBadge } from "./Chips";
import { Sparkline, ConfidenceArc } from "./Viz";

function getRelativeTime(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const min = Math.floor(diff / 60000);
  const hr = Math.floor(min / 60);
  const day = Math.floor(hr / 24);
  if (min < 1) return "baru saja";
  if (min < 60) return `${min} mnt lalu`;
  if (hr < 24) return `${hr} jam lalu`;
  if (day < 7) return `${day} hari lalu`;
  return new Date(dateStr).toLocaleDateString("id-ID", { day: "numeric", month: "short" });
}

export default function PostCard({ post, index = 0 }: { post: Post; index?: number }) {
  const router = useRouter();
  const r = resultOf(post.result);
  const m = RESULT_META[r];
  const conf = Math.round(Math.abs(post.confidence ?? 0));

  return (
    <article
      className={`post-card ${m.cardClass} card-entrance focus-ring`}
      style={{ animationDelay: `${index * 0.05}s` }}
      onClick={() => router.push(`/${post.id}`)}
      onKeyDown={(e) => {
        if (e.key === "Enter") router.push(`/${post.id}`);
      }}
      role="button"
      tabIndex={0}
      aria-label={post.title || "Klaim"}
    >
      {r === "hoax" && <div className="card-hoax-tape" />}
      <div className={`card-top-glow ${m.glow}`} />
      <div className="inner">
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10, marginBottom: 12 }}>
          <span className="chip" style={{ background: `${m.labelColor}1c`, boxShadow: `inset 0 0 0 1px ${m.labelColor}40`, color: m.color }}>
            {m.icon} {m.label}
          </span>
          <span className="mono" style={{ fontSize: 11, color: "var(--fg-4)" }}>
            {getRelativeTime(post.updated_at)}
          </span>
        </div>

        <h3
          className="line-clamp-2"
          style={{ margin: "0 0 8px", fontSize: 16, fontWeight: 600, color: "var(--fg)", lineHeight: 1.35, letterSpacing: "-.005em" }}
        >
          {post.title || "Analisis tanpa judul"}
        </h3>

        {post.summary && (
          <p className="line-clamp-2" style={{ color: "var(--fg-3)", fontSize: 13.5, lineHeight: 1.55, margin: "0 0 14px" }}>
            {post.summary}
          </p>
        )}

        <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 14 }}>
          <AssetClassChip assetClass={post.asset_class} />
          <TickerChip ticker={post.ticker} assetClass={post.asset_class} />
          <SentimentBadge sentiment={post.sentiment} withLabel={false} />
          <SectorChip sector={post.sector ?? post.category} />
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 10,
            paddingTop: 12,
            borderTop: "1px solid rgba(255,255,255,.06)",
          }}
        >
          <p
            className="line-clamp-2"
            style={{ color: "var(--fg-4)", fontSize: 12, lineHeight: 1.45, margin: 0, flex: 1, minWidth: 0 }}
          >
            “{post.context}”
          </p>
          <div style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
            {post.spark && <Sparkline points={post.spark} color={m.color} width={52} height={18} />}
            {post.confidence !== null && (
              <span style={{ display: "flex", alignItems: "center", gap: 5 }}>
                <ConfidenceArc value={post.confidence} color={m.color} size={24} />
                <span className="mono" style={{ fontSize: 13, fontWeight: 600, color: m.color }}>
                  {conf}%
                </span>
              </span>
            )}
          </div>
        </div>
      </div>
    </article>
  );
}
