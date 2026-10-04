"use client";

import { useState, useEffect } from "react";
import { Think } from "@/lib/types";
import { THINK_SOURCES } from "@/lib/investmentData";

interface Props {
  think: Think;
  state: string;
  isCompleted: boolean;
}

export default function AnalyzingBox({ think, state, isCompleted }: Props) {
  const [minimized, setMinimized] = useState(false);
  const [reveal, setReveal] = useState(0);

  const record = think as unknown as Record<string, string | null>;
  const insightOf = (k: string) => record[`${k}_insight`] ?? null;
  const urlOf = (k: string) => record[`${k}_url`] ?? null;

  const agents = THINK_SOURCES.map((s) => ({
    ...s,
    message: insightOf(s.key) || "Menelusuri dan mengevaluasi sumber…",
    url: urlOf(s.key),
  }));

  // Reveal: stream while analyzing, show all when completed.
  useEffect(() => {
    if (isCompleted || state === "completed") {
      setReveal(agents.length);
      return;
    }
    if (state === "analyzing") {
      let i = 0;
      let timer: ReturnType<typeof setTimeout>;
      const tick = () => {
        i++;
        setReveal(i);
        if (i < agents.length) timer = setTimeout(tick, 900);
      };
      timer = setTimeout(tick, 200);
      return () => clearTimeout(timer);
    }
  }, [state, isCompleted, agents.length]);

  // Auto-minimize after completion settles.
  useEffect(() => {
    if (state === "completed" || isCompleted) {
      const t = setTimeout(() => setMinimized(true), 2200);
      return () => clearTimeout(t);
    }
    setMinimized(false);
  }, [state, isCompleted]);

  if (minimized) {
    return (
      <button
        onClick={() => setMinimized(false)}
        className="fade-in-up"
        style={{
          width: "100%",
          padding: 14,
          borderRadius: 14,
          cursor: "pointer",
          background: "rgba(255,255,255,.025)",
          border: "1px solid rgba(99,102,241,.25)",
          textAlign: "center",
          transition: "all .25s ease",
        }}
      >
        <span className="up mono" style={{ fontSize: 11, color: "rgba(165,180,252,.7)", letterSpacing: ".15em", fontWeight: 700 }}>
          + Lihat Riwayat Chat AI ({agents.length} agen lintas-aset telah berkontribusi)
        </span>
      </button>
    );
  }

  return (
    <div className="glass-elev corner-marks fade-in-up" style={{ borderRadius: 24, padding: "28px 32px", position: "relative", overflow: "hidden" }}>
      <div
        style={{
          position: "absolute",
          top: -60,
          right: -60,
          width: 320,
          height: 320,
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(99,102,241,.15), transparent 70%)",
          pointerEvents: "none",
        }}
      />
      <div style={{ position: "relative", display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 22 }}>
        <div
          className="chip up"
          style={{
            padding: "5px 12px",
            fontSize: 10,
            letterSpacing: ".15em",
            background: "rgba(0,0,0,.4)",
            border: `1px solid ${isCompleted ? "rgba(16,185,129,.35)" : "rgba(99,102,241,.35)"}`,
            color: isCompleted ? "#6ee7b7" : "#c7d2fe",
          }}
        >
          {isCompleted ? (
            <>
              <span>✓</span> ANALISIS SELESAI
            </>
          ) : (
            <>
              <span style={{ display: "inline-flex", gap: 3 }}>
                <span className="blink" style={{ width: 4, height: 4, borderRadius: 2, background: "#a5b4fc" }} />
                <span className="blink" style={{ width: 4, height: 4, borderRadius: 2, background: "#a5b4fc", animationDelay: ".15s" }} />
                <span className="blink" style={{ width: 4, height: 4, borderRadius: 2, background: "#a5b4fc", animationDelay: ".3s" }} />
              </span>
              CROSS-ANALYZING . . .
            </>
          )}
        </div>
        {isCompleted && (
          <button className="btn-ghost" style={{ padding: "5px 10px", fontSize: 11 }} onClick={() => setMinimized(true)}>
            Minimize
          </button>
        )}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: 16, maxWidth: 900, margin: "0 auto" }}>
        {agents.map((a, i) => {
          if (i >= reveal) return null;
          return (
            <div key={a.key} className={`bubble ${a.group} fade-in-up`} style={{ animationDelay: `${(i % 4) * 0.08}s` }}>
              <div className="avatar">{a.avatar}</div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div className="meta">
                  <span className="name">{a.name}</span>
                  <span className="role mono">{a.role}</span>
                </div>
                <div className="msg">{a.message}</div>
                {a.url ? (
                  <a className="src-chip mono" href={a.url} target="_blank" rel="noopener noreferrer">
                    ↗ source · {a.short}
                  </a>
                ) : (
                  <span className="src-chip mono">↗ source · {a.short}</span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
