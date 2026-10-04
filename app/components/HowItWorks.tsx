"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useInView, useReducedMotion } from "framer-motion";
import { THINK_SOURCES } from "@/lib/investmentData";

const STEP_MS = 5200;
const EASE = [0.16, 1, 0.3, 1] as const;

const CLAIM = "Robot trading AutoProfit X jamin profit 20% per minggu, ribuan member sudah cair.";

const STEPS = [
  {
    title: "Tempel klaimnya",
    desc: "Teks, link Instagram, atau screenshot grup Telegram. Tambahkan kode ticker kalau ada.",
  },
  {
    title: "Enam agen menelusuri",
    desc: "BEI/OJK, CNBC Indonesia, Kontan, Bisnis Indonesia, sentimen retail, dan analis pasar dibuka bersamaan.",
  },
  {
    title: "Bukti diuji silang",
    desc: "Setiap sumber memberi skor mendukung atau membantah, lalu temuannya dibandingkan satu sama lain.",
  },
  {
    title: "Verdict dan alasannya",
    desc: "Terverifikasi, misinformasi, atau belum terkonfirmasi — dengan tingkat keyakinan dan tautan sumber.",
  },
];

const SOURCE_TINT: Record<string, string> = {
  regulator: "#2fc6b4",
  media: "#9db8ff",
  community: "#fcd34d",
  analyst: "#e9c891",
};

// Short labels for narrow screens.
const COMPACT: Record<string, string> = {
  official: "BEI / OJK",
  cnbc: "CNBC",
  detik: "Kontan",
  kompas: "Bisnis",
  inews: "Retail",
  analysis: "Analis",
};

// Illustrative scores for the fictional claim above.
const SCORES: Record<string, { v: number; note: string }> = {
  official: { v: -94, note: "Tidak ada di daftar entitas berizin OJK" },
  cnbc: { v: -81, note: "Masuk daftar waspada Satgas PASTI" },
  detik: { v: -76, note: "Pola serupa kasus robot trading 2022" },
  kompas: { v: -70, note: "Tidak ada badan hukum terdaftar" },
  inews: { v: 38, note: "Banyak testimoni “sudah cair”" },
  analysis: { v: -90, note: "Imbal hasil tetap tinggi = ciri skema Ponzi" },
};

export default function HowItWorks() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { amount: 0.35 });
  const reduce = useReducedMotion();
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);
  const playing = inView && !reduce && !paused;

  useEffect(() => {
    if (!playing) return;
    const t = setTimeout(() => setActive((a) => (a + 1) % STEPS.length), STEP_MS);
    return () => clearTimeout(t);
  }, [active, playing]);

  return (
    <div
      ref={ref}
      className="hiw lg lg-dense"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <div className="hiw-steps" role="tablist" aria-label="Langkah verifikasi">
        {STEPS.map((s, i) => (
          <button
            key={s.title}
            type="button"
            role="tab"
            aria-selected={active === i}
            className={`hiw-step ${active === i ? "active" : ""}`}
            onClick={() => setActive(i)}
          >
            <span className="hiw-num">{String(i + 1).padStart(2, "0")}</span>
            <span className="hiw-title">{s.title}</span>
            <span className="hiw-desc">{s.desc}</span>
            {active === i && (
              <span className="hiw-progress" aria-hidden>
                <motion.span
                  key={`${i}-${playing}`}
                  initial={{ scaleX: playing ? 0 : 1 }}
                  animate={{ scaleX: 1 }}
                  transition={{ duration: playing ? STEP_MS / 1000 : 0, ease: "linear" }}
                />
              </span>
            )}
          </button>
        ))}
      </div>

      <div className="hiw-stage" aria-live="polite">
        <div
          style={{
            position: "absolute",
            top: 18,
            left: 20,
            right: 20,
            display: "flex",
            justifyContent: "space-between",
            zIndex: 5,
          }}
        >
          <span className="eyebrow">Contoh · klaim fiktif</span>
          <span className="eyebrow mono">
            {String(active + 1).padStart(2, "0")} / {String(STEPS.length).padStart(2, "0")}
          </span>
        </div>
        <AnimatePresence mode="wait">
          <motion.div
            key={active}
            initial={{ opacity: 0, y: 14, filter: "blur(6px)" }}
            // Clear the filter afterwards so nested glass can still blur the stage behind it.
            animate={{ opacity: 1, y: 0, filter: "blur(0px)", transitionEnd: { filter: "none" } }}
            exit={{ opacity: 0, y: -10, filter: "blur(6px)" }}
            transition={{ duration: 0.5, ease: EASE }}
            style={{ position: "absolute", inset: 0 }}
          >
            {active === 0 && <ScenePaste />}
            {active === 1 && <SceneExplore />}
            {active === 2 && <SceneCrossCheck />}
            {active === 3 && <SceneVerdict />}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}

/* ── Scene 1: typing the claim ─────────────────────────────────────── */
function ScenePaste() {
  const [n, setN] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setN((x) => (x >= CLAIM.length ? x : x + 1)), 32);
    return () => clearInterval(id);
  }, []);
  const done = n >= CLAIM.length;

  return (
    <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", padding: "56px 20px 24px" }}>
      <div className="lg" style={{ width: "100%", maxWidth: 480, borderRadius: 26, padding: 8 }}>
        <div className="composer-well" style={{ borderRadius: 19, minHeight: 150, display: "flex", flexDirection: "column" }}>
          <p style={{ margin: 0, fontSize: 15.5, lineHeight: 1.55, color: "var(--fg)", flex: 1 }}>
            {CLAIM.slice(0, n)}
            <span
              className="blink"
              style={{ display: "inline-block", width: 2, height: 18, marginLeft: 2, verticalAlign: "-3px", background: "var(--champagne)" }}
            />
          </p>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 14 }}>
            <motion.span
              className="tool-btn"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: n > 30 ? 1 : 0, scale: n > 30 ? 1 : 0.8 }}
              transition={{ duration: 0.4, ease: EASE }}
              style={{ color: "var(--fg)" }}
            >
              <span style={{ width: 16, height: 16, borderRadius: 4, background: "linear-gradient(135deg,#2AABEE,#229ED9)", display: "inline-block" }} />
              grup_vip.png
            </motion.span>
            <span style={{ flex: 1 }} />
            <motion.span
              className="btn-pearl"
              animate={done ? { scale: [1, 0.92, 1.04, 1] } : { scale: 1 }}
              transition={{ duration: 0.6, delay: 0.3, ease: EASE }}
              style={{ padding: "9px 18px", fontSize: 13.5, pointerEvents: "none" }}
            >
              Verifikasi
            </motion.span>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── Scene 2: agents fan out to sources ────────────────────────────── */
function SceneExplore() {
  const nodes = THINK_SOURCES.map((s, i) => {
    const a = (-90 + i * 60) * (Math.PI / 180);
    return { ...s, x: 50 + Math.cos(a) * 33, y: 54 + Math.sin(a) * 31, tint: SOURCE_TINT[s.group] };
  });

  return (
    <div style={{ position: "absolute", inset: 0 }}>
      <svg
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
        style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}
        aria-hidden
      >
        {nodes.map((nd, i) => (
          <motion.line
            key={nd.key}
            x1={50}
            y1={54}
            x2={nd.x}
            y2={nd.y}
            stroke={nd.tint}
            strokeOpacity={0.65}
            strokeWidth={1}
            vectorEffect="non-scaling-stroke"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 0.7, delay: 0.25 + i * 0.22, ease: EASE }}
          />
        ))}
      </svg>

      {nodes.map((nd, i) => (
        <motion.span
          key={`p-${nd.key}`}
          aria-hidden
          style={{
            position: "absolute",
            width: 6,
            height: 6,
            marginLeft: -3,
            marginTop: -3,
            borderRadius: 6,
            background: nd.tint,
            boxShadow: `0 0 12px ${nd.tint}`,
          }}
          initial={{ left: "50%", top: "54%", opacity: 0 }}
          animate={{ left: ["50%", `${nd.x}%`], top: ["54%", `${nd.y}%`], opacity: [0, 1, 0] }}
          transition={{ duration: 1.3, delay: 1 + i * 0.22, repeat: Infinity, repeatDelay: 0.6, ease: "easeInOut" }}
        />
      ))}

      <div style={{ position: "absolute", left: "50%", top: "54%", width: "min(170px, 44%)", transform: "translate(-50%, -50%)", zIndex: 2 }}>
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.6, ease: EASE }}
          className="lg"
          style={{ borderRadius: 18, padding: "10px 12px", textAlign: "center", background: "linear-gradient(160deg, rgba(233,200,145,.22), rgba(40,32,20,.9))" }}
        >
          <div className="eyebrow" style={{ fontSize: 9.5, color: "var(--champagne)" }}>
            Klaim
          </div>
          <div style={{ fontSize: 12.5, fontWeight: 600, marginTop: 3, lineHeight: 1.35 }}>Profit 20% per minggu</div>
        </motion.div>
      </div>

      {nodes.map((nd, i) => (
        <div
          key={nd.key}
          style={{ position: "absolute", left: `${nd.x}%`, top: `${nd.y}%`, transform: "translate(-50%, -50%)", zIndex: 2 }}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.7 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.7 + i * 0.22, ease: EASE }}
            className="lg lg-pill"
            style={{ display: "flex", alignItems: "center", gap: 7, padding: "7px 12px 7px 8px", whiteSpace: "nowrap", background: "rgba(16,20,34,.9)" }}
          >
            <span style={{ fontSize: 14 }}>{nd.avatar}</span>
            <span className="hidden sm:inline" style={{ fontSize: 12, fontWeight: 600 }}>{nd.name}</span>
            <span className="sm:hidden" style={{ fontSize: 12, fontWeight: 600 }}>{COMPACT[nd.key]}</span>
            <motion.span
              style={{ width: 6, height: 6, borderRadius: 6, background: nd.tint }}
              animate={{ opacity: [0.3, 1, 0.3] }}
              transition={{ duration: 1.4, repeat: Infinity, delay: i * 0.2 }}
            />
          </motion.div>
        </div>
      ))}
    </div>
  );
}

/* ── Scene 3: scores per source ────────────────────────────────────── */
function SceneCrossCheck() {
  return (
    <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", padding: "56px 20px 24px" }}>
      <div style={{ width: "100%", maxWidth: 560, display: "flex", flexDirection: "column", gap: 6 }}>
        <div style={{ display: "flex", justifyContent: "space-between", padding: "0 4px 6px" }}>
          <span className="eyebrow" style={{ color: "var(--bear-2)" }}>
            ← Membantah
          </span>
          <span className="eyebrow" style={{ color: "var(--bull-2)" }}>
            Mendukung →
          </span>
        </div>
        {THINK_SOURCES.map((s, i) => {
          const sc = SCORES[s.key];
          const neg = sc.v < 0;
          const col = neg ? "var(--bear-2)" : "var(--bull-2)";
          return (
            <motion.div
              key={s.key}
              initial={{ opacity: 0, x: -12 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.45, delay: i * 0.12, ease: EASE }}
              style={{
                display: "grid",
                gridTemplateColumns: "minmax(0,1fr) minmax(90px,1.1fr) 42px",
                alignItems: "center",
                gap: 12,
                padding: "8px 12px",
                borderRadius: 14,
                background: "rgba(255,255,255,.035)",
                boxShadow: "inset 0 0 0 1px rgba(255,255,255,.05)",
              }}
            >
              <span style={{ minWidth: 0 }}>
                <span style={{ display: "block", fontSize: 13, fontWeight: 600 }}>
                  {s.avatar} {s.name}
                </span>
                <span
                  style={{ display: "block", fontSize: 11.5, color: "var(--fg-3)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}
                >
                  {sc.note}
                </span>
              </span>
              <span style={{ position: "relative", height: 6, borderRadius: 6, background: "rgba(255,255,255,.06)" }}>
                <span style={{ position: "absolute", left: "50%", top: -3, bottom: -3, width: 1, background: "rgba(255,255,255,.2)" }} />
                <motion.span
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.abs(sc.v) / 2}%` }}
                  transition={{ duration: 0.9, delay: 0.3 + i * 0.12, ease: EASE }}
                  style={{
                    position: "absolute",
                    top: 0,
                    bottom: 0,
                    borderRadius: 6,
                    background: col,
                    boxShadow: `0 0 10px ${neg ? "rgba(248,113,113,.5)" : "rgba(52,211,153,.5)"}`,
                    ...(neg ? { right: "50%" } : { left: "50%" }),
                  }}
                />
              </span>
              <span className="mono" style={{ fontSize: 13, fontWeight: 600, textAlign: "right", color: col }}>
                {sc.v > 0 ? "+" : ""}
                {sc.v}
              </span>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}

/* ── Scene 4: verdict ──────────────────────────────────────────────── */
function SceneVerdict() {
  const target = 91;
  const [v, setV] = useState(0);
  useEffect(() => {
    const t0 = performance.now();
    let raf = 0;
    const tick = (t: number) => {
      const k = Math.min(1, (t - t0) / 1400);
      setV(Math.round(target * (1 - Math.pow(1 - k, 3))));
      if (k < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  const r = 52;
  const c = 2 * Math.PI * r;

  return (
    <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", padding: "56px 20px 24px" }}>
      <div
        className="result-shell hoax"
        style={{ padding: 26, borderRadius: 28, width: "100%", maxWidth: 540, display: "flex", gap: 24, alignItems: "center", flexWrap: "wrap" }}
      >
        <div style={{ position: "relative", width: 128, height: 128, flexShrink: 0, margin: "0 auto" }}>
          <svg viewBox="0 0 128 128" width="128" height="128" style={{ transform: "rotate(-90deg)" }}>
            <circle cx="64" cy="64" r={r} fill="none" stroke="rgba(255,255,255,.07)" strokeWidth="7" />
            <motion.circle
              cx="64"
              cy="64"
              r={r}
              fill="none"
              stroke="var(--bear-2)"
              strokeWidth="7"
              strokeLinecap="round"
              strokeDasharray={c}
              initial={{ strokeDashoffset: c }}
              animate={{ strokeDashoffset: c * (1 - target / 100) }}
              transition={{ duration: 1.4, ease: EASE }}
              style={{ filter: "drop-shadow(0 0 8px rgba(248,113,113,.6))" }}
            />
          </svg>
          <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
            <span className="h-display" style={{ fontSize: 32, color: "var(--bear-2)" }}>
              {v}%
            </span>
            <span className="eyebrow" style={{ fontSize: 9 }}>
              Yakin
            </span>
          </div>
        </div>
        <div style={{ flex: "1 1 220px", minWidth: 0 }}>
          <motion.span
            className="chip"
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.4 }}
            style={{ background: "rgba(239,68,68,.14)", border: "1px solid rgba(239,68,68,.35)", color: "#fca5a5" }}
          >
            ✕ Misinformasi
          </motion.span>
          <motion.h4
            className="h-display"
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.65, duration: 0.4 }}
            style={{ margin: "12px 0 8px", fontSize: 20, lineHeight: 1.15 }}
          >
            AutoProfit X bukan investasi legal
          </motion.h4>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.85, duration: 0.5 }}
            style={{ margin: 0, fontSize: 13.5, lineHeight: 1.55, color: "var(--fg-2)" }}
          >
            Tidak terdaftar di OJK, dan janji imbal hasil tetap 20% per minggu cocok dengan pola skema Ponzi.
          </motion.p>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.05, duration: 0.5 }}
            style={{ display: "flex", gap: 6, marginTop: 14, flexWrap: "wrap" }}
          >
            {["OJK", "CNBC", "Kontan", "Analis"].map((s) => (
              <span key={s} className="chip chip-sector mono" style={{ fontSize: 10.5 }}>
                ↗ {s}
              </span>
            ))}
          </motion.div>
        </div>
      </div>
    </div>
  );
}
