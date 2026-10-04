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
      <div className="label-tech" style={{ fontSize: 9, marginBottom: 4 }}>
        {label}
      </div>
      <div className={mono ? "mono" : ""} style={{ color: color || "#fff", fontSize: small ? 11.5 : 13, fontWeight: 700, lineHeight: 1.35 }}>
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
            opacity: 0.15,
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
              width: 80,
              height: 80,
              borderRadius: 22,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              background: "rgba(0,0,0,.4)",
              border: `1px solid ${m.color}50`,
              color: m.color,
              fontSize: 32,
              fontWeight: 800,
              boxShadow: `0 0 30px ${m.color}33`,
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
              <span className="mono" style={{ fontSize: 36, fontWeight: 800, color: m.color, lineHeight: 1, letterSpacing: "-.03em" }}>
                <CountUp to={Math.round(conf)} duration={1600} />%
              </span>
              <span className="up label-tech" style={{ marginTop: 4, fontSize: 9 }}>
                CONFIDENCE
              </span>
            </div>
          </div>
        </div>

        {/* RIGHT: verdict + summary + meta */}
        <div>
          <div
            className="chip up"
            style={{ background: "rgba(0,0,0,.3)", border: `1px solid ${m.color}55`, color: m.color, padding: "5px 12px", fontSize: 10.5, letterSpacing: ".18em", marginBottom: 14 }}
          >
            <span className="dot-bull blink" style={{ background: m.color, boxShadow: `0 0 8px ${m.color}99` }} />
            VERDICT · {verdictLabel.toUpperCase()}
          </div>
          <h2 style={{ margin: "0 0 12px", fontSize: 24, fontWeight: 800, color: "#fff", letterSpacing: "-.015em" }}>Kesimpulan Analisis</h2>
          <p style={{ margin: "0 0 22px", color: "rgba(255,255,255,.78)", fontSize: 15, lineHeight: 1.65 }}>
            {post.summary || "Ringkasan analisis belum tersedia."}
          </p>

          {hasMeta && (
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
                gap: 10,
                padding: 14,
                borderRadius: 14,
                background: "rgba(0,0,0,.25)",
                border: "1px solid rgba(255,255,255,.06)",
              }}
            >
              <MetaCell label="Kelas Aset" value={post.asset_class || "—"} color={assetColor(post.asset_class) || "#fff"} />
              <MetaCell label="Instrumen" value={post.ticker ? `$${post.ticker}` : "—"} mono />
              <MetaCell label="Sektor / Sub" value={post.sector || post.category || "—"} />
              <MetaCell label="Sentimen" value={sentimentLabel(post.sentiment)} color={sentimentColor(post.sentiment)} />
              <MetaCell label="Risiko" value={riskLabel(post.risk_level)} color={post.risk_level === "low" ? "#6ee7b7" : post.risk_level === "medium" ? "#fcd34d" : post.risk_level === "high" ? "#fca5a5" : "#fff"} />
              <MetaCell label="Tipe Klaim" value={(post.claim_type && CLAIM_TYPES[post.claim_type]?.label) || post.claim_type || "—"} />
              <MetaCell label="Dampak Harga" value={post.price_impact || "—"} small />
            </div>
          )}

          <div className="disclaimer" style={{ marginTop: 14 }}>
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
