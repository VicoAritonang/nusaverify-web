"use client";

import { Post } from "@/lib/types";
import {
  RESULT_META,
  resultOf,
  CLAIM_TYPES,
  assetColor,
  sentimentLabel,
  sentimentColor,
  riskLabel,
} from "@/lib/investmentData";
import { CountUp } from "../components/Viz";

function MetaCell({
  label,
  value,
  color,
  mono,
  small,
}: {
  label: string;
  value: string;
  color?: string;
  mono?: boolean;
  small?: boolean;
}) {
  return (
    <div>
      <div className="eyebrow" style={{ fontSize: 10, marginBottom: 6 }}>
        {label}
      </div>
      <div className={mono ? "mono" : ""} style={{ color: color || "var(--fg)", fontSize: small ? 13 : 14.5, fontWeight: 600, lineHeight: 1.4 }}>
        {value}
      </div>
    </div>
  );
}

export default function ResultBox({ post }: { post: Post }) {
  const result = resultOf(post.result);
  const m = RESULT_META[result];
  const conf = Math.min(Math.abs(post.confidence ?? 0), 100);

  const r = 54;
  const c = 2 * Math.PI * r;
  const filled = c * 0.75;
  const dash = (conf / 100) * filled;

  const verdictLabel =
    result === "valid" ? "Terverifikasi" : result === "hoax" ? "Misinformasi / Hoaks" : "Belum Terkonfirmasi";

  const hasMeta =
    post.asset_class || post.ticker || post.sector || post.sentiment || post.risk_level || post.claim_type || post.price_impact;

  return (
    <div className={`result-shell ${result} fade-in-up`}>
      {result === "hoax" && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            opacity: 0.1,
            pointerEvents: "none",
            background:
              "repeating-linear-gradient(-48deg, rgba(239,68,68,.25) 0, rgba(239,68,68,.25) 10px, transparent 10px, transparent 22px, rgba(255,255,255,.05) 22px, rgba(255,255,255,.05) 32px, transparent 32px, transparent 44px)",
          }}
        />
      )}

      <div className="result-grid" style={{ position: "relative", zIndex: 1, alignItems: "start" }}>
        {/* LEFT: icon + gauge */}
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 14 }}>
          <div
            style={{
              width: 72,
              height: 72,
              borderRadius: 24,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              background: `${m.color}14`,
              boxShadow: `inset 0 1px 0 rgba(255,255,255,.2), inset 0 0 0 1px ${m.color}55, 0 0 40px -6px ${m.color}55`,
              color: m.color,
              fontSize: 30,
              fontWeight: 700,
            }}
          >
            {m.icon}
          </div>
          <div style={{ position: "relative", width: 140, height: 140 }}>
            <svg viewBox="0 0 140 140" width="140" height="140">
              <circle
                cx="70"
                cy="70"
                r={r}
                fill="none"
                stroke="rgba(255,255,255,.06)"
                strokeWidth="8"
                strokeLinecap="round"
                strokeDasharray={`${filled} ${c}`}
                style={{ transform: "rotate(135deg)", transformOrigin: "50% 50%" }}
              />
              <circle
                cx="70"
                cy="70"
                r={r}
                fill="none"
                stroke={m.color}
                strokeWidth="8"
                strokeLinecap="round"
                strokeDasharray={`${dash} ${c}`}
                style={{ transform: "rotate(135deg)", transformOrigin: "50% 50%", transition: "stroke-dasharray 1.8s cubic-bezier(.16,1,.3,1)" }}
              />
            </svg>
            <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
              <span className="h-display" style={{ fontSize: 38, color: m.color, lineHeight: 1 }}>
                <CountUp to={Math.round(conf)} duration={1600} />%
              </span>
              <span className="eyebrow" style={{ marginTop: 6, fontSize: 10 }}>
                Keyakinan
              </span>
            </div>
          </div>
        </div>

        {/* RIGHT: verdict + summary + meta */}
        <div>
          <div
            className="chip"
            style={{ background: `${m.color}14`, border: `1px solid ${m.color}55`, color: m.color, padding: "6px 13px", fontSize: 12.5, marginBottom: 16 }}
          >
            <span className="dot-bull" style={{ background: m.color, boxShadow: `0 0 8px ${m.color}99` }} />
            Verdict · {verdictLabel}
          </div>
          <h2 className="h-display" style={{ margin: "0 0 14px", fontSize: "clamp(24px, 2.6vw, 32px)", color: "var(--fg)" }}>Kesimpulan analisis</h2>
          <p style={{ margin: "0 0 24px", color: "var(--fg-2)", fontSize: 16, lineHeight: 1.7 }}>
            {post.summary || "Ringkasan analisis belum tersedia."}
          </p>

          {hasMeta && (
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
                gap: 16,
                padding: 20,
                borderRadius: 22,
                background: "rgba(5,7,13,.35)",
                boxShadow: "inset 0 1px 2px rgba(0,0,0,.4), inset 0 0 0 1px rgba(255,255,255,.05)",
              }}
            >
              <MetaCell label="Kelas Aset" value={post.asset_class || "—"} color={assetColor(post.asset_class) || undefined} />
              <MetaCell label="Instrumen" value={post.ticker ? `$${post.ticker}` : "—"} mono />
              <MetaCell label="Sektor / Sub" value={post.sector || post.category || "—"} />
              <MetaCell label="Sentimen" value={sentimentLabel(post.sentiment)} color={sentimentColor(post.sentiment)} />
              <MetaCell label="Risiko" value={riskLabel(post.risk_level)} color={post.risk_level === "low" ? "#6ee7b7" : post.risk_level === "medium" ? "#fcd34d" : post.risk_level === "high" ? "#fca5a5" : undefined} />
              <MetaCell label="Tipe Klaim" value={(post.claim_type && CLAIM_TYPES[post.claim_type]?.label) || post.claim_type || "—"} />
              <MetaCell label="Dampak Harga" value={post.price_impact || "—"} small />
            </div>
          )}

          <div className="disclaimer" style={{ marginTop: 16, paddingLeft: 0 }}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
            <span>
              Hasil verifikasi adalah <b>validasi informasi</b>, bukan rekomendasi jual/beli. Selalu lakukan analisis mandiri.
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
