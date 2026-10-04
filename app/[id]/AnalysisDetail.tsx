"use client";

import { useEffect, useState, useRef } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { Post, Think } from "@/lib/types";
import { RESULT_META, resultOf, CLAIM_TYPES } from "@/lib/investmentData";
import { AssetClassChip, TickerChip, SectorChip, SentimentBadge, RiskMeter } from "../components/Chips";
import Logo from "../components/Logo";
import AnalyzingBox from "./AnalyzingBox";
import ResultBox from "./ResultBox";
import InstagramPreview from "./InstagramPreview";

function Spinner({ size = 56 }: { size?: number }) {
  return (
    <span style={{ position: "relative", width: size, height: size, display: "inline-block" }}>
      <span
        style={{
          position: "absolute",
          inset: 0,
          borderRadius: "50%",
          border: "2px solid rgba(233,200,145,.16)",
          borderTopColor: "var(--champagne)",
          animation: "spinSlow 1.1s linear infinite",
        }}
      />
      <span
        style={{
          position: "absolute",
          inset: size * 0.2,
          borderRadius: "50%",
          border: "2px solid transparent",
          borderLeftColor: "var(--sapphire-2)",
          animation: "spinSlow 1.8s linear infinite reverse",
        }}
      />
    </span>
  );
}

// Canvas relies on `window` at import time → load it client-only.
const ExplorationGraph = dynamic(() => import("./ExplorationGraph"), {
  ssr: false,
  loading: () => (
    <div className="graph-shell fade-in-up" style={{ height: "76vh", minHeight: 560, display: "flex", alignItems: "center", justifyContent: "center" }}>
      <Spinner />
    </div>
  ),
});

// ── Top bar ────────────────────────────────────────────────────────
function DetailTopBar({ state, postId }: { state: string; postId: string }) {
  const label = state === "exploring" ? "Menelusuri sumber" : state === "analyzing" ? "Menganalisis" : "Selesai";
  const done = state === "completed";
  return (
    <div
      className="lg lg-pill fade-in-down"
      style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, padding: 6, marginBottom: 20, position: "sticky", top: 14, zIndex: 40 }}
    >
      <Link href="/" className="btn-ghost" style={{ paddingLeft: 10 }}>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="15 18 9 12 15 6" />
        </svg>
        <Logo size={22} />
        <span className="hidden sm:inline">Beranda</span>
      </Link>
      <div style={{ display: "flex", alignItems: "center", gap: 12, paddingRight: 10 }}>
        <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
          {done ? <span className="dot-bull" /> : <span className="live-dot" style={{ background: "var(--champagne)" }} />}
          <span style={{ fontSize: 13, fontWeight: 500, color: done ? "#6ee7b7" : "var(--champagne-2)" }}>{label}</span>
        </span>
        <span className="mono hidden sm:inline" style={{ fontSize: 11.5, color: "var(--fg-4)" }}>
          #{postId.slice(0, 8).toUpperCase()}
        </span>
      </div>
    </div>
  );
}

// ── Stepper ────────────────────────────────────────────────────────
function Stepper({ state }: { state: string }) {
  const steps = [
    { key: "exploring", label: "Eksplorasi" },
    { key: "analyzing", label: "Analisis silang" },
    { key: "completed", label: "Selesai" },
  ];
  const idx = state === "exploring" ? 0 : state === "analyzing" ? 1 : 2;
  return (
    <div className="stepper">
      {steps.map((s, i) => (
        <div key={s.key} style={{ display: "contents" }}>
          <div className={`step ${i < idx ? "done" : i === idx ? "active" : ""}`}>
            <span className="step-dot" />
            {i < idx ? "✓ " : ""}
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
    <div className="lg lg-dense fade-in-up" style={{ borderRadius: 32, padding: "30px 32px", overflow: "hidden" }}>
      <div
        style={{
          position: "absolute",
          top: -80,
          right: -80,
          width: 360,
          height: 360,
          borderRadius: "50%",
          background: `radial-gradient(circle, ${m.color}18, transparent 70%)`,
          pointerEvents: "none",
        }}
      />
      <div style={{ position: "relative", zIndex: 1 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 16, flexWrap: "wrap" }}>
          <span className="eyebrow" style={{ marginRight: 6 }}>
            Jejak verifikasi
          </span>
          <AssetClassChip assetClass={post.asset_class} />
          <TickerChip ticker={post.ticker} assetClass={post.asset_class} />
          <SectorChip sector={post.sector ?? post.category} />
          <SentimentBadge sentiment={post.sentiment} />
          <RiskMeter level={post.risk_level} />
          {claim && (
            <span className="chip chip-sector">
              {claim.icon} {claim.label}
            </span>
          )}
        </div>

        <h1 className="h-display" style={{ margin: "0 0 16px", fontSize: "clamp(26px, 3.4vw, 42px)", color: "var(--fg)" }}>
          {post.title || "Analisis berjalan…"}
        </h1>

        {isInstagram ? (
          <div style={{ marginBottom: 20 }}>
            <InstagramPreview url={post.context.trim()} />
          </div>
        ) : (
          <blockquote style={{ margin: "0 0 22px", paddingLeft: 16, borderLeft: `2px solid ${m.color}66` }}>
            <p style={{ margin: 0, color: "var(--fg-2)", fontSize: 15, lineHeight: 1.6 }}>&ldquo;{post.context}&rdquo;</p>
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
        <div className="lg lg-dense fade-in-up" style={{ borderRadius: 32, padding: "56px 28px", textAlign: "center", marginTop: 18 }}>
          <h2 className="h-display" style={{ margin: "0 0 10px", fontSize: 28 }}>
            Klaim tidak ditemukan
          </h2>
          <p style={{ margin: "0 auto 24px", fontSize: 14.5, color: "var(--fg-3)", maxWidth: 380 }}>
            Jejak dengan ID ini tidak tersedia atau sudah kedaluwarsa. Kirim ulang klaimnya dari beranda.
          </p>
          <Link href="/#cek" className="btn-pearl">
            Cek klaim baru
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
        <div className="flex flex-col items-center justify-center" style={{ minHeight: "60vh", gap: 20 }}>
          <Spinner size={64} />
          <p style={{ margin: 0, fontSize: 15, color: "var(--fg-2)" }}>Menyiapkan analisis…</p>
          {fetchError && (
            <div style={{ padding: "10px 16px", borderRadius: 16, background: "rgba(239,68,68,.1)", boxShadow: "inset 0 0 0 1px rgba(239,68,68,.25)", color: "#fca5a5", fontSize: 13 }}>
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
      <div style={{ display: "flex", flexDirection: "column", gap: 20 }} className="fade-in-up">
        <DetailHeader post={post} state={isCompleted ? "completed" : state} />

        {/* Preparation loader (post exists, think not yet) */}
        {!think && (
          <div className="lg lg-dense fade-in-up" style={{ borderRadius: 32, padding: 48, display: "flex", flexDirection: "column", alignItems: "center", gap: 18 }}>
            <Spinner />
            <p style={{ margin: 0, fontSize: 15, color: "var(--fg-2)" }}>Menyiapkan agen dan node penelusuran</p>
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
