"use client";

import { useEffect, useState, useRef } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { Post, Think } from "@/lib/types";
import { RESULT_META, resultOf, CLAIM_TYPES } from "@/lib/investmentData";
import { AssetClassChip, TickerChip, SectorChip, SentimentBadge, RiskMeter } from "../components/Chips";
import AnalyzingBox from "./AnalyzingBox";
import ResultBox from "./ResultBox";
import InstagramPreview from "./InstagramPreview";

// Canvas relies on `window` at import time → load it client-only.
const ExplorationGraph = dynamic(() => import("./ExplorationGraph"), {
  ssr: false,
  loading: () => (
    <div className="graph-shell corner-marks fade-in-up" style={{ height: "76vh", minHeight: 560, display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div className="relative" style={{ width: 56, height: 56 }}>
        <div className="absolute inset-0 rounded-full" style={{ border: "2px solid rgba(99,102,241,.2)", animation: "spinSlow 3s linear infinite" }} />
        <div className="absolute" style={{ inset: 8, borderRadius: "50%", border: "2px solid transparent", borderTopColor: "#818cf8", animation: "spinSlow 1.2s linear infinite" }} />
      </div>
    </div>
  ),
});

// ── Top bar ────────────────────────────────────────────────────────
function DetailTopBar({ state, postId }: { state: string; postId: string }) {
  const label = state === "exploring" ? "EXPLORING" : state === "analyzing" ? "ANALYZING" : "COMPLETED";
  const color = state === "completed" ? "#34d399" : "#a5b4fc";
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 0" }}>
      <Link href="/" className="btn-ghost">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="15 18 9 12 15 6" />
        </svg>
        Kembali ke Beranda
      </Link>
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span className={state === "completed" ? "" : "blink"} style={{ width: 6, height: 6, borderRadius: "50%", background: color, boxShadow: `0 0 10px ${color}99` }} />
          <span className="mono up" style={{ fontSize: 10, color, letterSpacing: ".15em", fontWeight: 700 }}>
            LIVE TRACE · {label}
          </span>
        </div>
        <span
          className="mono"
          style={{
            fontSize: 10,
            padding: "3px 8px",
            borderRadius: 6,
            background: "rgba(255,255,255,.03)",
            border: "1px solid rgba(255,255,255,.08)",
            color: "rgba(255,255,255,.4)",
            letterSpacing: ".05em",
          }}
        >
          ID·{postId.slice(0, 8).toUpperCase()}
        </span>
      </div>
    </div>
  );
}

// ── Stepper ────────────────────────────────────────────────────────
function Stepper({ state }: { state: string }) {
  const steps = [
    { key: "exploring", label: "Eksplorasi" },
    { key: "analyzing", label: "Analisis Silang" },
    { key: "completed", label: "Selesai" },
  ];
  const idx = state === "exploring" ? 0 : state === "analyzing" ? 1 : 2;
  return (
    <div className="stepper">
      {steps.map((s, i) => (
        <div key={s.key} style={{ display: "contents" }}>
          <div className={`step ${i < idx ? "done" : i === idx ? "active" : ""}`}>
            <span className="step-dot" />
            {i < idx ? "✓ " : `${String(i + 1).padStart(2, "0")} `}
            {s.label}
          </div>
          {i < steps.length - 1 && <div className={`step-bar ${i < idx ? "done" : ""}`} />}
        </div>
      ))}
    </div>
  );
}

// ── Header card ────────────────────────────────────────────────────
function DetailHeader({ post, state }: { post: Post; state: string }) {
  const m = RESULT_META[resultOf(post.result)];
  const isInstagram = /^https?:\/\/(www\.)?instagram\.com\/(p|reel|tv)\//.test(post.context?.trim() || "");
  const claim = post.claim_type ? CLAIM_TYPES[post.claim_type] : null;

  return (
    <div className="glass-elev corner-marks fade-in-up" style={{ borderRadius: 22, padding: 26, position: "relative", overflow: "hidden" }}>
      <div
        style={{
          position: "absolute",
          top: -40,
          right: -40,
          width: 320,
          height: 320,
          borderRadius: "50%",
          background: `radial-gradient(circle, ${m.color}11, transparent 70%)`,
          pointerEvents: "none",
        }}
      />
      <div style={{ position: "relative", zIndex: 1 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 12, flexWrap: "wrap" }}>
          <span
            className="chip up"
            style={{
              fontSize: 9.5,
              padding: "3px 9px",
              letterSpacing: ".15em",
              background: "rgba(99,102,241,.13)",
              border: "1px solid rgba(99,102,241,.3)",
              color: "#c7d2fe",
            }}
          >
            <span className="dot-bull blink" style={{ background: "#a5b4fc", boxShadow: "0 0 6px rgba(165,180,252,.6)" }} />
            VERIFICATION TRACE
          </span>
          <AssetClassChip assetClass={post.asset_class} />
          <TickerChip ticker={post.ticker} assetClass={post.asset_class} />
          <SectorChip sector={post.sector ?? post.category} />
          <SentimentBadge sentiment={post.sentiment} />
          <RiskMeter level={post.risk_level} />
          {claim && (
            <span
              className="chip"
              style={{
                background: "rgba(255,255,255,.04)",
                border: "1px solid rgba(255,255,255,.1)",
                color: "rgba(255,255,255,.55)",
                fontSize: 10,
                letterSpacing: ".05em",
                textTransform: "none",
              }}
            >
              {claim.icon} {claim.label}
            </span>
          )}
        </div>

        <h1 style={{ margin: "0 0 14px", fontSize: "clamp(22px, 2.6vw, 30px)", fontWeight: 800, letterSpacing: "-.015em", color: "#fff", lineHeight: 1.2 }}>
          {post.title || "Analisis Berjalan…"}
        </h1>

        {isInstagram ? (
          <div style={{ marginBottom: 18 }}>
            <InstagramPreview url={post.context.trim()} />
          </div>
        ) : (
          <blockquote style={{ margin: "0 0 18px", paddingLeft: 14, borderLeft: `2px solid ${m.color}55` }}>
            <p style={{ margin: 0, color: "rgba(255,255,255,.55)", fontSize: 13.5, lineHeight: 1.55, fontStyle: "italic" }}>
              &ldquo;{post.context}&rdquo;
            </p>
          </blockquote>
        )}

        <Stepper state={state} />
      </div>
    </div>
  );
}

// ── Main ───────────────────────────────────────────────────────────
export default function AnalysisDetail({ id }: { id: string }) {
  const [post, setPost] = useState<Post | null>(null);
  const [think, setThink] = useState<Think | null>(null);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [notFound, setNotFound] = useState(false);
  const prevStateRef = useRef<string | null>(null);

  useEffect(() => {
    let timeoutId: ReturnType<typeof setTimeout>;
    let isMounted = true;

    const poll = async () => {
      try {
        const { data: pData, error: pError } = await supabase.from("post").select("*").eq("id", id).maybeSingle();
        const { data: tData, error: tError } = await supabase.from("think").select("*").eq("post_id", id).maybeSingle();
        if (!isMounted) return;

        if (pError) {
          setFetchError(`Gagal mengambil data: ${pError.message}`);
        } else if (pData) {
          setFetchError(null);
          setPost(pData as Post);
        } else {
          setNotFound(true);
          return;
        }

        if (tError && tError.code !== "PGRST116") {
          console.error("Think fetch error:", tError);
        } else if (tData) {
          const t = tData as Think;
          setThink(t);
          prevStateRef.current = t.state;
        }

        if (pData?.result != null || tData?.state === "completed") return;

        const interval = tData?.state === "analyzing" ? 5000 : 2000;
        timeoutId = setTimeout(poll, interval);
      } catch (err) {
        setFetchError(`Terjadi kesalahan: ${(err as Error)?.message}`);
        timeoutId = setTimeout(poll, 2000);
      }
    };

    poll();
    return () => {
      isMounted = false;
      clearTimeout(timeoutId);
    };
  }, [id]);

  // ── 404 ──
  if (notFound) {
    return (
      <>
        <DetailTopBar state="completed" postId={id} />
        <div className="glass-elev fade-in-up" style={{ borderRadius: 24, padding: 48, textAlign: "center", marginTop: 18 }}>
          <div style={{ fontSize: 40, marginBottom: 12 }}>🔍</div>
          <h2 style={{ margin: "0 0 8px", fontSize: 20, fontWeight: 800, color: "#fff" }}>Klaim tidak ditemukan</h2>
          <p style={{ margin: "0 0 20px", fontSize: 13, color: "rgba(255,255,255,.45)" }}>
            Trace dengan ID ini tidak tersedia atau telah kedaluwarsa.
          </p>
          <Link href="/" className="btn-primary" style={{ display: "inline-flex" }}>
            Kembali ke Beranda
          </Link>
        </div>
      </>
    );
  }

  // ── Booting (no post yet) ──
  if (!post) {
    return (
      <>
        <DetailTopBar state="exploring" postId={id} />
        <div className="flex flex-col items-center justify-center" style={{ minHeight: "60vh" }}>
          <div className="relative" style={{ width: 80, height: 80, marginBottom: 24 }}>
            <div className="absolute inset-0 rounded-full" style={{ border: "2px solid rgba(99,102,241,.2)", animation: "spinSlow 3s linear infinite" }} />
            <div className="absolute" style={{ inset: 8, borderRadius: "50%", border: "2px solid transparent", borderTopColor: "#818cf8", animation: "spinSlow 1.5s linear infinite" }} />
            <div className="absolute" style={{ inset: 20, borderRadius: "50%", border: "2px solid transparent", borderLeftColor: "#22d3ee", animation: "spinSlow 2s linear infinite reverse" }} />
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="breathe" style={{ width: 12, height: 12, borderRadius: "50%", background: "linear-gradient(135deg,#6366f1,#22d3ee)", boxShadow: "0 0 20px rgba(99,102,241,.7)" }} />
            </div>
          </div>
          <p className="mono up" style={{ fontSize: 11, color: "rgba(255,255,255,.5)", letterSpacing: ".2em" }}>Menyiapkan analisis…</p>
          <p className="mono" style={{ fontSize: 10, color: "rgba(255,255,255,.25)", marginTop: 8, letterSpacing: ".15em" }}>ID · {id.slice(0, 12)}</p>
          {fetchError && (
            <div style={{ marginTop: 16, padding: "8px 14px", borderRadius: 12, background: "rgba(239,68,68,.1)", border: "1px solid rgba(239,68,68,.25)", color: "#fca5a5", fontSize: 12 }}>
              {fetchError}
            </div>
          )}
        </div>
      </>
    );
  }

  const state = think?.state || "exploring";
  const isCompleted = state === "completed" || post.result != null;

  return (
    <>
      <DetailTopBar state={isCompleted ? "completed" : state} postId={id} />
      <div style={{ display: "flex", flexDirection: "column", gap: 18 }} className="fade-in-up">
        <DetailHeader post={post} state={isCompleted ? "completed" : state} />

        {/* Preparation loader (post exists, think not yet) */}
        {!think && (
          <div className="glass-elev fade-in-up" style={{ borderRadius: 24, padding: 48, display: "flex", flexDirection: "column", alignItems: "center", border: "1px solid rgba(99,102,241,.2)" }}>
            <div className="relative" style={{ width: 64, height: 64, marginBottom: 20 }}>
              <div className="absolute inset-0 rounded-full" style={{ border: "2px solid rgba(99,102,241,.2)", animation: "spinSlow 3s linear infinite" }} />
              <div className="absolute" style={{ inset: 8, borderRadius: "50%", border: "2px solid transparent", borderTopColor: "#818cf8", animation: "spinSlow 1.2s linear infinite" }} />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="breathe" style={{ width: 10, height: 10, borderRadius: "50%", background: "#818cf8" }} />
              </div>
            </div>
            <p className="up" style={{ fontSize: 13, color: "rgba(255,255,255,.65)", letterSpacing: ".15em", fontWeight: 600 }}>
              Menyiapkan agen AI dan node penelusuran
            </p>
            <p className="mono up" style={{ fontSize: 10, color: "rgba(255,255,255,.3)", marginTop: 8, letterSpacing: ".2em" }}>
              Booting neural network
            </p>
          </div>
        )}

        {/* Knowledge graph */}
        {think && <ExplorationGraph think={think} post={post} state={state} />}

        {/* Analyzing box */}
        {think && (state === "analyzing" || state === "completed") && (
          <AnalyzingBox think={think} state={state} isCompleted={isCompleted} />
        )}

        {/* Result */}
        {isCompleted && <ResultBox post={post} />}
      </div>
    </>
  );
}
