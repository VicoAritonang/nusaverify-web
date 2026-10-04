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
  if (min < 60) return `${min}m lalu`;
  if (hr < 24) return `${hr}j lalu`;
  if (day < 7) return `${day}h lalu`;
  return new Date(dateStr).toLocaleDateString("id-ID", { day: "numeric", month: "short" });
}

export default function PostCard({ post, index = 0 }: { post: Post; index?: number }) {
  const router = useRouter();
  const r = resultOf(post.result);
  const m = RESULT_META[r];
  const sparkColor = m.color;
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
        {/* TOP ROW */}
        <div style={{ display: "flex", alignItems: "flex-start", gap: 10, marginBottom: 10 }}>
          <div
            style={{
              width: 32,
              height: 32,
              borderRadius: 10,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              background: `${m.labelColor}22`,
              border: `1px solid ${m.labelColor}40`,
              color: m.color,
              fontWeight: 800,
              fontSize: 14,
              flexShrink: 0,
            }}
          >
            {m.icon}
          </div>
          <h3
            className="line-clamp-2"
            style={{ margin: 0, fontSize: 13, fontWeight: 700, color: "#fff", lineHeight: 1.35 }}
          >
            {post.title || "Analisis Tanpa Judul"}
          </h3>
        </div>

        {/* CHIPS ROW */}
        <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 10 }}>
          <span
            className="chip up"
            style={{
              background: `${m.labelColor}1f`,
              border: `1px solid ${m.labelColor}40`,
              color: m.color,
              fontSize: 9.5,
            }}
          >
            {m.icon} {m.label}
          </span>
          <AssetClassChip assetClass={post.asset_class} />
          <TickerChip ticker={post.ticker} assetClass={post.asset_class} />
          <SentimentBadge sentiment={post.sentiment} withLabel={false} />
          <SectorChip sector={post.sector ?? post.category} />
        </div>

        {/* SUMMARY */}
        {post.summary && (
          <p
            className="line-clamp-2"
            style={{ color: "rgba(255,255,255,.7)", fontSize: 12, lineHeight: 1.55, margin: "0 0 8px" }}
          >
            {post.summary}
          </p>
        )}

        {/* CONTEXT quote */}
        <blockquote style={{ position: "relative", paddingLeft: 12, margin: "0 0 10px" }}>
          <span
            style={{
              position: "absolute",
              left: 0,
              top: 0,
              bottom: 0,
              width: 2,
              borderRadius: 1,
              background: `linear-gradient(180deg, ${m.color}, transparent)`,
            }}
          />
          <p
            className="line-clamp-2"
            style={{
              color: "rgba(255,255,255,.35)",
              fontSize: 11,
              lineHeight: 1.5,
              margin: 0,
              fontStyle: "italic",
            }}
          >
            {post.context}
          </p>
        </blockquote>

        {/* FOOTER */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            {post.spark && <Sparkline points={post.spark} color={sparkColor} width={64} height={20} />}
            <span className="mono" style={{ fontSize: 10, color: "rgba(255,255,255,.3)" }}>
              {getRelativeTime(post.updated_at)}
            </span>
          </div>
          {post.confidence !== null && (
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <ConfidenceArc value={post.confidence} color={m.color} size={28} />
              <span className="mono" style={{ fontSize: 13, fontWeight: 800, color: m.color }}>
                {conf}%
              </span>
            </div>
          )}
        </div>
      </div>
    </article>
  );
}
