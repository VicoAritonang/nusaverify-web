// detail.jsx — Detail page with state machine: exploring → analyzing → completed
const { useState: useStateD, useEffect: useEffectD, useRef: useRefD, useMemo: useMemoD } = React;

// ═════ Top bar ═════
function DetailTopBar({ onBack, state, postId }) {
  const stateLabel = state === "exploring" ? "EXPLORING" : state === "analyzing" ? "ANALYZING" : "COMPLETED";
  const stateColor = state === "completed" ? "#34d399" : "#a5b4fc";
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 0" }}>
      <button className="btn-ghost" onClick={onBack}>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="15 18 9 12 15 6" />
        </svg>
        Kembali ke Beranda
      </button>
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span className={state === "completed" ? "dot-bull" : "dot-bull blink"} style={{
            background: stateColor, boxShadow: `0 0 10px ${stateColor}99`,
          }} />
          <span className="mono up" style={{ fontSize: 10, color: stateColor, letterSpacing: ".15em", fontWeight: 700 }}>
            LIVE TRACE · {stateLabel}
          </span>
        </div>
        <span className="mono" style={{
          fontSize: 10, padding: "3px 8px", borderRadius: 6,
          background: "rgba(255,255,255,.03)", border: "1px solid rgba(255,255,255,.08)",
          color: "rgba(255,255,255,.4)", letterSpacing: ".05em",
        }}>
          ID·{postId.slice(0, 8).toUpperCase()}
        </span>
      </div>
    </div>
  );
}

// ═════ Stepper ═════
function Stepper({ state }) {
  const steps = [
    { key: "exploring", label: "Eksplorasi" },
    { key: "analyzing", label: "Analisis Silang" },
    { key: "completed", label: "Selesai" },
  ];
  const idx = state === "exploring" ? 0 : state === "analyzing" ? 1 : 2;
  return (
    <div className="stepper">
      {steps.map((s, i) => (
        <React.Fragment key={s.key}>
          <div className={`step ${i < idx ? "done" : i === idx ? "active" : ""}`}>
            <span className="step-dot" />
            {i < idx ? "✓ " : `${String(i + 1).padStart(2, "0")} `}
            {s.label}
          </div>
          {i < steps.length - 1 && <div className={`step-bar ${i < idx ? "done" : ""}`} />}
        </React.Fragment>
      ))}
    </div>
  );
}

// ═════ Header Card ═════
function DetailHeader({ post, state }) {
  const m = window.RESULT_META[post.result] || window.RESULT_META.uncertain;
  return (
    <div className="glass-elev corner-marks fade-in-up" style={{ borderRadius: 22, padding: 26, position: "relative", overflow: "hidden" }}>
      {/* Subtle background glow */}
      <div style={{
        position: "absolute", top: -40, right: -40, width: 320, height: 320, borderRadius: "50%",
        background: `radial-gradient(circle, ${m.color}11, transparent 70%)`, pointerEvents: "none",
      }} />
      <div style={{ position: "relative", zIndex: 1 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 10, flexWrap: "wrap" }}>
          <span className="chip up" style={{
            fontSize: 9.5, padding: "3px 9px", letterSpacing: ".15em",
            background: "rgba(99,102,241,.13)", border: "1px solid rgba(99,102,241,.3)", color: "#c7d2fe",
          }}>
            <span className="dot-bull blink" style={{ background: "#a5b4fc", boxShadow: "0 0 6px rgba(165,180,252,.6)" }} />
            VERIFICATION TRACE
          </span>
          {post.assetClass && <AssetClassChip assetClass={post.assetClass} />}
          {post.ticker && <TickerChip ticker={post.ticker} assetClass={post.assetClass} />}
          {post.sector && <SectorChip sector={post.sector} />}
          <SentimentBadge sentiment={post.sentiment} />
          {post.riskLevel && <RiskMeter level={post.riskLevel} />}
          {post.claimType && (
            <span className="chip" style={{
              background: "rgba(255,255,255,.04)", border: "1px solid rgba(255,255,255,.1)", color: "rgba(255,255,255,.55)",
              fontSize: 10, letterSpacing: ".05em", textTransform: "none",
            }}>
              {window.CLAIM_TYPES[post.claimType]?.icon} {window.CLAIM_TYPES[post.claimType]?.label}
            </span>
          )}
        </div>

        <h1 style={{
          margin: "0 0 14px", fontSize: "clamp(22px, 2.6vw, 30px)",
          fontWeight: 800, letterSpacing: "-.015em", color: "#fff", lineHeight: 1.2,
        }}>
          {post.title}
        </h1>

        <blockquote style={{
          margin: "0 0 18px", paddingLeft: 14,
          borderLeft: `2px solid ${m.color}55`,
        }}>
          <p style={{ margin: 0, color: "rgba(255,255,255,.55)", fontSize: 13.5, lineHeight: 1.55, fontStyle: "italic" }}>
            “{post.context}”
          </p>
        </blockquote>

        <Stepper state={state} />
      </div>
    </div>
  );
}

// ═════ Exploration Graph (SVG, builds nodes incrementally) ═════
function ExplorationGraph({ trace, state, exploreProgress }) {
  // Visualization area:
  // canvas is 920 wide, 620 tall, root at center
  const W = 920, H = 620;
  const cx = W / 2, cy = H / 2 - 60;
  const { root, sources, score } = trace.graph;

  const [minimized, setMinimized] = useStateD(false);

  useEffectD(() => {
    if (state === "analyzing") {
      const t = setTimeout(() => setMinimized(true), 1500);
      return () => clearTimeout(t);
    } else if (state === "completed") {
      setMinimized(true);
    } else {
      setMinimized(false);
    }
  }, [state]);

  // Animation: reveal sources progressively. exploreProgress is 0..1.
  // We show source[i] when exploreProgress >= (i+1) / (sources.length + 1)
  const revealCount = useMemoD(() => {
    if (state !== "exploring") return sources.length + 1;
    return Math.floor(exploreProgress * (sources.length + 1));
  }, [exploreProgress, state, sources.length]);

  // Particles for the canvas background
  const particles = useMemoD(() => {
    return Array.from({ length: 28 }).map((_, i) => ({
      x: Math.random() * W, y: Math.random() * H, d: 4 + Math.random() * 5, delay: Math.random() * 4,
    }));
  }, []);

  if (minimized) {
    return (
      <div onClick={() => setMinimized(false)} className="fade-in-up" style={{
        padding: 14, borderRadius: 14, cursor: "pointer",
        background: "rgba(255,255,255,.025)", border: "1px solid rgba(99,102,241,.25)",
        textAlign: "center", transition: "all .25s ease",
      }}>
        <span className="up mono" style={{ fontSize: 11, color: "rgba(165,180,252,.7)", letterSpacing: ".15em", fontWeight: 700 }}>
          + Lihat Knowledge Graph (7 sumber lintas-aset telah dieksplorasi)
        </span>
      </div>
    );
  }

  const scoreColor = score.verdict === "valid" ? "#34d399" : score.verdict === "hoax" ? "#f87171" : "#fcd34d";

  return (
    <div className="graph-shell corner-marks fade-in-up">
      {/* HUD header */}
      <div style={{
        position: "absolute", top: 16, left: 18, right: 18, zIndex: 5,
        display: "flex", alignItems: "center", justifyContent: "space-between", pointerEvents: "none",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span className="chip up" style={{
            fontSize: 9.5, padding: "3px 9px", letterSpacing: ".15em",
            background: "rgba(0,0,0,.5)", border: "1px solid rgba(99,102,241,.35)", color: "#a5b4fc",
          }}>
            <span className="dot-bull blink" style={{ background: "#a5b4fc", boxShadow: "0 0 6px rgba(165,180,252,.6)" }} />
            BUILDING KNOWLEDGE GRAPH
          </span>
          <span className="mono" style={{ fontSize: 10, color: "rgba(255,255,255,.4)" }}>
            {revealCount}/{sources.length + 1} nodes
          </span>
        </div>
        {state !== "exploring" && (
          <button className="btn-ghost" style={{ pointerEvents: "auto", padding: "5px 10px", fontSize: 11 }} onClick={() => setMinimized(true)}>
            Tutup canvas
          </button>
        )}
      </div>

      {/* HUD: legend */}
      <div style={{ position: "absolute", left: 18, bottom: 18, zIndex: 5, pointerEvents: "none" }}>
        <div className="mono up" style={{ fontSize: 9, color: "rgba(255,255,255,.35)", letterSpacing: ".15em", marginBottom: 6 }}>
          LEGEND
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
          {[
            { label: "ROOT · klaim utama", color: "#a5b4fc" },
            { label: "REGULATOR · BEI · OJK · BI/Fed", color: "#22d3ee" },
            { label: "MEDIA · Bloomberg · Reuters · CNBC", color: "#818cf8" },
            { label: "SENTIMEN · komunitas · crypto tw", color: "#fcd34d" },
            { label: "ANALIS · sintesis multi-aset", color: "#c4b5fd" },
            { label: "SKOR · verdict", color: "#34d399" },
          ].map((l, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <span style={{ width: 8, height: 8, borderRadius: 2, background: l.color, boxShadow: `0 0 8px ${l.color}66` }} />
              <span className="mono" style={{ fontSize: 9.5, color: "rgba(255,255,255,.5)", letterSpacing: ".05em" }}>{l.label}</span>
            </div>
          ))}
        </div>
      </div>
      <div style={{ position: "absolute", right: 18, bottom: 18, zIndex: 5, pointerEvents: "none" }}>
        <div className="mono" style={{ fontSize: 9, color: "rgba(255,255,255,.25)", letterSpacing: ".05em" }}>
          scroll · drag · klik node
        </div>
      </div>

      {/* Floating particles */}
      <div style={{ position: "absolute", inset: 0, pointerEvents: "none", overflow: "hidden" }}>
        {particles.map((p, i) => (
          <span key={i} className="graph-particle" style={{
            left: p.x, top: p.y, animation: `breathe ${p.d}s ease-in-out infinite`, animationDelay: `${p.delay}s`,
          }} />
        ))}
      </div>

      {/* SVG canvas */}
      <svg viewBox={`0 0 ${W} ${H}`} width="100%" height="560" style={{ display: "block", overflow: "visible" }}>
        <defs>
          <radialGradient id="rootGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#6366f1" stopOpacity="0.5" />
            <stop offset="100%" stopColor="#6366f1" stopOpacity="0" />
          </radialGradient>
          <radialGradient id="scoreGlowG" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor={scoreColor} stopOpacity="0.5" />
            <stop offset="100%" stopColor={scoreColor} stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* Edges from root to sources, sources to score */}
        {sources.map((s, i) => {
          const visible = revealCount > i + 1; // edges appear with the node
          if (!visible) return null;
          const ax = cx + root.x, ay = cy + root.y;
          const bx = cx + s.x, by = cy + s.y;
          const mx = (ax + bx) / 2 + (s.y - root.y) * 0.15;
          const my = (ay + by) / 2 - (s.x - root.x) * 0.15;
          return (
            <g key={`edge-${s.key}`}>
              <path
                d={`M${ax},${ay} Q${mx},${my} ${bx},${by}`}
                stroke={s.color}
                strokeOpacity="0.35"
                strokeWidth="1.2"
                fill="none"
                strokeDasharray="800"
                strokeDashoffset="800"
                style={{ animation: "drawEdge 1.4s cubic-bezier(.16,1,.3,1) forwards" }}
              />
              {/* flowing particles */}
              <path
                d={`M${ax},${ay} Q${mx},${my} ${bx},${by}`}
                stroke={s.color}
                strokeOpacity="0.9"
                strokeWidth="1.5"
                fill="none"
                strokeDasharray="3 12"
                className="flow"
                style={{ animationDelay: ".4s" }}
              />
            </g>
          );
        })}

        {/* Edges from sources to score */}
        {state !== "exploring" && sources.map((s) => {
          const ax = cx + s.x, ay = cy + s.y;
          const bx = cx + score.x, by = cy + score.y;
          return (
            <g key={`edge-score-${s.key}`}>
              <path
                d={`M${ax},${ay} L${bx},${by}`}
                stroke={scoreColor}
                strokeOpacity="0.2"
                strokeWidth="1"
                fill="none"
                strokeDasharray="800"
                strokeDashoffset="800"
                style={{ animation: "drawEdge 1.6s ease-out forwards" }}
              />
            </g>
          );
        })}

        {/* Root node */}
        {revealCount >= 1 && (
          <g transform={`translate(${cx + root.x}, ${cy + root.y})`} className="node-pop">
            <circle r="100" fill="url(#rootGlow)" />
            <rect x="-110" y="-30" width="220" height="60" rx="14"
              fill="rgba(8,10,24,.95)" stroke="rgba(99,102,241,.55)" strokeWidth="1.5" />
            <text x="0" y="-8" textAnchor="middle" fill="#a5b4fc" fontSize="9.5"
              fontFamily="JetBrains Mono, monospace" letterSpacing="2" fontWeight="700">◆ ROOT NODE</text>
            <text x="0" y="14" textAnchor="middle" fill="#fff" fontSize="12.5" fontWeight="700"
              fontFamily="Inter, sans-serif">{root.label}</text>
          </g>
        )}

        {/* Source nodes */}
        {sources.map((s, i) => {
          if (revealCount < i + 2) return null;
          return (
            <g key={s.key} transform={`translate(${cx + s.x}, ${cy + s.y})`} className="node-pop"
              style={{ animationDelay: `${i * 0.12}s` }}>
              <rect x="-58" y="-22" width="116" height="44" rx="10"
                fill="rgba(8,10,24,.92)" stroke={s.color} strokeOpacity="0.6" strokeWidth="1.2" />
              <text x="0" y="-3" textAnchor="middle" fill={s.color} fontSize="8.5"
                fontFamily="JetBrains Mono, monospace" letterSpacing="1.5" fontWeight="700">
                ◈ {s.kind.toUpperCase()}
              </text>
              <text x="0" y="13" textAnchor="middle" fill="#fff" fontSize="11" fontWeight="600">
                {s.label}
              </text>
            </g>
          );
        })}

        {/* Score node */}
        {state !== "exploring" && (
          <g transform={`translate(${cx + score.x}, ${cy + score.y})`} className="node-pop">
            <circle r="80" fill="url(#scoreGlowG)" className="aura-pulse" />
            <circle r="46" fill="rgba(8,10,24,.95)" stroke={scoreColor} strokeWidth="2" />
            <text x="0" y="-2" textAnchor="middle" fill={scoreColor} fontSize="20" fontWeight="800"
              fontFamily="JetBrains Mono, monospace" letterSpacing="-1">{score.value}%</text>
            <text x="0" y="17" textAnchor="middle" fill={scoreColor} fontSize="9.5" fontWeight="700"
              fontFamily="JetBrains Mono, monospace" letterSpacing="2">{score.verdict.toUpperCase()}</text>
          </g>
        )}
      </svg>

      {/* Scan line decoration */}
      <div style={{
        position: "absolute", top: 0, left: 0, right: 0, height: 1,
        background: "linear-gradient(90deg, transparent, rgba(165,180,252,.5), transparent)",
        animation: "hudScan 4s ease-in-out infinite", pointerEvents: "none",
      }} />
    </div>
  );
}

// ═════ Analyzing Box (agent chat) ═════
function AnalyzingBox({ trace, state }) {
  const [minimized, setMinimized] = useStateD(false);
  const agents = window.TRACE_AGENTS;
  const insights = trace.agentInsights;

  // How many bubbles to reveal based on time-since-mount
  const [reveal, setReveal] = useStateD(0);
  useEffectD(() => {
    if (state === "analyzing" || state === "completed") {
      let i = 0;
      const tick = () => {
        i++;
        setReveal(i);
        if (i < agents.length) setTimeout(tick, 900);
      };
      setTimeout(tick, 200);
    }
  }, [state]);

  useEffectD(() => {
    if (state === "completed") {
      const t = setTimeout(() => setMinimized(true), 2200);
      return () => clearTimeout(t);
    } else {
      setMinimized(false);
    }
  }, [state]);

  if (minimized) {
    return (
      <div onClick={() => setMinimized(false)} className="fade-in-up" style={{
        padding: 14, borderRadius: 14, cursor: "pointer",
        background: "rgba(255,255,255,.025)", border: "1px solid rgba(99,102,241,.25)",
        textAlign: "center", transition: "all .25s ease",
      }}>
        <span className="up mono" style={{ fontSize: 11, color: "rgba(165,180,252,.7)", letterSpacing: ".15em", fontWeight: 700 }}>
          + Lihat Riwayat Chat AI (7 agen lintas-aset telah berkontribusi)
        </span>
      </div>
    );
  }

  const isCompleted = state === "completed";

  return (
    <div className="glass-elev corner-marks fade-in-up" style={{ borderRadius: 24, padding: "28px 32px", position: "relative", overflow: "hidden" }}>
      <div style={{
        position: "absolute", top: -60, right: -60, width: 320, height: 320, borderRadius: "50%",
        background: "radial-gradient(circle, rgba(99,102,241,.15), transparent 70%)", pointerEvents: "none",
      }} />
      <div style={{ position: "relative", display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 22 }}>
        <div className="chip up" style={{
          padding: "5px 12px", fontSize: 10, letterSpacing: ".15em",
          background: "rgba(0,0,0,.4)", border: `1px solid ${isCompleted ? "rgba(16,185,129,.35)" : "rgba(99,102,241,.35)"}`,
          color: isCompleted ? "#6ee7b7" : "#c7d2fe",
        }}>
          {isCompleted ? (
            <>
              <span>✓</span> ANALISIS SELESAI
            </>
          ) : (
            <>
              <span style={{ display: "inline-flex", gap: 3 }}>
                <span style={{ width: 4, height: 4, borderRadius: 2, background: "#a5b4fc" }} className="blink" />
                <span style={{ width: 4, height: 4, borderRadius: 2, background: "#a5b4fc", animationDelay: ".15s" }} className="blink" />
                <span style={{ width: 4, height: 4, borderRadius: 2, background: "#a5b4fc", animationDelay: ".3s" }} className="blink" />
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
            <div key={a.key} className={`bubble ${a.group} fade-in-up`} style={{ animationDelay: `${i * 0.08}s` }}>
              <div className="avatar">{a.avatar}</div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div className="meta">
                  <span className="name">{a.name}</span>
                  <span className="role mono">{a.role}</span>
                </div>
                <div className="msg">
                  {insights[a.key]}
                </div>
                <span className="src-chip mono">↗ source · {a.short}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ═════ Result Box ═════
function ResultBox({ post }) {
  const m = window.RESULT_META[post.result];
  const conf = Math.abs(post.confidence);
  const r = 54;
  const c = 2 * Math.PI * r;
  const filled = c * 0.75;
  const dash = (conf / 100) * filled;

  const verdictLabel = post.result === "valid" ? "Terverifikasi" : post.result === "hoax" ? "Misinformasi / Hoaks" : "Belum Terkonfirmasi";

  return (
    <div className={`result-shell ${post.result} fade-in-up`}>
      {post.result === "hoax" && (
        <div style={{
          position: "absolute", inset: 0, opacity: .15, pointerEvents: "none",
          background: "repeating-linear-gradient(-48deg, rgba(239,68,68,.25) 0, rgba(239,68,68,.25) 10px, transparent 10px, transparent 22px, rgba(255,255,255,.05) 22px, rgba(255,255,255,.05) 32px, transparent 32px, transparent 44px)",
        }} />
      )}

      <div style={{ position: "relative", zIndex: 1, display: "grid", gridTemplateColumns: "auto 1fr", gap: 36, alignItems: "start" }}>
        {/* Left: gauge */}
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 14 }}>
          <div style={{
            width: 80, height: 80, borderRadius: 22, display: "flex", alignItems: "center", justifyContent: "center",
            background: "rgba(0,0,0,.4)", border: `1px solid ${m.color}50`, color: m.color, fontSize: 32, fontWeight: 800,
            boxShadow: `0 0 30px ${m.color}33`,
          }}>
            {m.icon}
          </div>
          <div style={{ position: "relative", width: 140, height: 140 }}>
            <svg viewBox="0 0 140 140" width="140" height="140">
              <circle cx="70" cy="70" r={r} fill="none" stroke="rgba(255,255,255,.06)" strokeWidth="8"
                strokeLinecap="round" strokeDasharray={`${filled} ${c}`}
                style={{ transform: "rotate(135deg)", transformOrigin: "50% 50%" }} />
              <circle cx="70" cy="70" r={r} fill="none" stroke={m.color} strokeWidth="8"
                strokeLinecap="round" strokeDasharray={`${dash} ${c}`}
                style={{ transform: "rotate(135deg)", transformOrigin: "50% 50%", transition: "stroke-dasharray 1.8s cubic-bezier(.16,1,.3,1)" }} />
            </svg>
            <div style={{
              position: "absolute", inset: 0, display: "flex", flexDirection: "column",
              alignItems: "center", justifyContent: "center",
            }}>
              <span className="mono" style={{ fontSize: 36, fontWeight: 800, color: m.color, lineHeight: 1, letterSpacing: "-.03em" }}>
                <CountUp to={Math.round(conf)} duration={1600} />%
              </span>
              <span className="up label-tech" style={{ marginTop: 4, fontSize: 9 }}>
                CONFIDENCE
              </span>
            </div>
          </div>
        </div>

        {/* Right: details */}
        <div>
          <div className="chip up" style={{
            background: "rgba(0,0,0,.3)", border: `1px solid ${m.color}55`, color: m.color,
            padding: "5px 12px", fontSize: 10.5, letterSpacing: ".18em", marginBottom: 14,
          }}>
            <span className="dot-bull blink" style={{ background: m.color, boxShadow: `0 0 8px ${m.color}99` }} />
            VERDICT · {verdictLabel.toUpperCase()}
          </div>
          <h2 style={{ margin: "0 0 12px", fontSize: 24, fontWeight: 800, color: "#fff", letterSpacing: "-.015em" }}>
            Kesimpulan Analisis
          </h2>
          <p style={{ margin: "0 0 22px", color: "rgba(255,255,255,.78)", fontSize: 15, lineHeight: 1.65 }}>
            {post.summary}
          </p>

          {/* Investment meta panel */}
          <div style={{
            display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
            gap: 10, padding: 14, borderRadius: 14,
            background: "rgba(0,0,0,.25)", border: "1px solid rgba(255,255,255,.06)",
          }}>
            <MetaCell label="Kelas Aset" value={post.assetClass || "—"}
              color={(window.ASSET_CLASS_COLORS || {})[post.assetClass] || "#fff"} />
            <MetaCell label="Instrumen" value={post.ticker ? `$${post.ticker}` : "—"} mono />
            <MetaCell label="Sektor / Sub" value={post.sector || "—"} />
            <MetaCell label="Sentimen" value={post.sentiment === "bullish" ? "▲ Bullish" : post.sentiment === "bearish" ? "▼ Bearish" : "◆ Neutral"}
              color={post.sentiment === "bullish" ? "#6ee7b7" : post.sentiment === "bearish" ? "#fca5a5" : "#fcd34d"} />
            <MetaCell label="Risiko" value={post.riskLevel === "low" ? "Rendah" : post.riskLevel === "medium" ? "Menengah" : "Tinggi"}
              color={post.riskLevel === "low" ? "#6ee7b7" : post.riskLevel === "medium" ? "#fcd34d" : "#fca5a5"} />
            <MetaCell label="Tipe Klaim" value={window.CLAIM_TYPES[post.claimType]?.label || post.claimType || "—"} />
            <MetaCell label="Dampak Harga" value={post.priceImpact || "—"} small />
          </div>

          <div className="disclaimer" style={{ marginTop: 14 }}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
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

function MetaCell({ label, value, color, mono, small }) {
  return (
    <div>
      <div className="label-tech" style={{ fontSize: 9, marginBottom: 4 }}>{label}</div>
      <div className={mono ? "mono" : ""} style={{
        color: color || "#fff", fontSize: small ? 11.5 : 13, fontWeight: 700, lineHeight: 1.35,
      }}>
        {value}
      </div>
    </div>
  );
}

// ═════ Detail page composer ═════
function DetailPage({ postId, onBack }) {
  const trace = window.SAMPLE_TRACE;
  const post = trace.claim;

  // State machine: exploring → analyzing → completed
  const [state, setState] = useStateD("exploring");
  const [exploreProgress, setExploreProgress] = useStateD(0);

  useEffectD(() => {
    setState("exploring");
    setExploreProgress(0);
    const totalNodes = trace.graph.sources.length + 1; // 8
    const stepMs = 550;
    let i = 0;
    const tick = () => {
      i++;
      setExploreProgress(i / totalNodes);
      if (i < totalNodes) {
        setTimeout(tick, stepMs);
      } else {
        setTimeout(() => setState("analyzing"), 800);
        setTimeout(() => setState("completed"), 800 + 900 * 7 + 1200);
      }
    };
    setTimeout(tick, 600);
  }, [postId]);

  return (
    <div className="wrap" style={{ minHeight: "100vh" }}>
      <DetailTopBar onBack={onBack} state={state} postId={postId} />
      <div style={{ display: "flex", flexDirection: "column", gap: 18 }} className="fade-in-up">
        <DetailHeader post={post} state={state} />
        <ExplorationGraph trace={trace} state={state} exploreProgress={exploreProgress} />
        {(state === "analyzing" || state === "completed") && (
          <AnalyzingBox trace={trace} state={state} />
        )}
        {state === "completed" && <ResultBox post={post} />}
      </div>
      <div style={{ height: 60 }} />
    </div>
  );
}

Object.assign(window, { DetailPage });
