// shared.jsx — shared building blocks
// React must be loaded first. Exports to window.

const { useState, useEffect, useRef, useMemo } = React;

// ═════ Logo ═════
function Logo({ size = 36 }) {
  return (
    <div className="relative" style={{ width: size, height: size }}>
      <div
        className="absolute inset-0 rounded-xl"
        style={{
          background: "linear-gradient(135deg, #6366f1 0%, #8b5cf6 50%, #22d3ee 100%)",
          boxShadow: "0 6px 18px rgba(99,102,241,.45), inset 0 1px 0 rgba(255,255,255,.2)",
        }}
      />
      <svg viewBox="0 0 36 36" width={size} height={size} className="relative" style={{ zIndex: 1 }}>
        {/* candlestick + check mark glyph */}
        <g transform="translate(7 8)">
          <rect x="0" y="8" width="3" height="12" fill="rgba(255,255,255,.95)" rx="1" />
          <rect x="1" y="4" width="1" height="20" fill="rgba(255,255,255,.95)" />
          <rect x="6" y="2" width="3" height="16" fill="rgba(255,255,255,.95)" rx="1" />
          <rect x="7" y="0" width="1" height="22" fill="rgba(255,255,255,.95)" />
          <path d="M13 15 L17 19 L23 9" stroke="rgba(255,255,255,.95)" strokeWidth="2.4" fill="none" strokeLinecap="round" strokeLinejoin="round" />
        </g>
      </svg>
      <div
        className="absolute -inset-2 rounded-2xl breathe -z-10"
        style={{ background: "linear-gradient(135deg, rgba(99,102,241,.35), rgba(139,92,246,.35))", filter: "blur(14px)" }}
      />
    </div>
  );
}

// ═════ Sparkline ═════
function Sparkline({ points, color = "#34d399", width = 80, height = 24, fill = true }) {
  if (!points || !points.length) return null;
  const min = Math.min(...points);
  const max = Math.max(...points);
  const range = max - min || 1;
  const stepX = width / (points.length - 1);
  const path = points
    .map((v, i) => {
      const x = i * stepX;
      const y = height - ((v - min) / range) * (height - 2) - 1;
      return `${i === 0 ? "M" : "L"}${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(" ");
  const fillPath = `${path} L${width.toFixed(1)},${height} L0,${height} Z`;
  const last = points[points.length - 1];
  const prev = points[points.length - 2] ?? last;
  const upish = last >= prev;
  return (
    <svg className="spark" width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
      {fill && <path className="fill" d={fillPath} style={{ fill: color }} />}
      <path className="line" d={path} style={{ stroke: color }} />
      <circle cx={(points.length - 1) * stepX} cy={height - ((last - min) / range) * (height - 2) - 1} r="1.8" fill={color} />
    </svg>
  );
}

// ═════ TickerChip ═════
function TickerChip({ ticker, assetClass, className = "" }) {
  if (!ticker) return null;
  const c = assetClass && window.ASSET_CLASS_COLORS ? window.ASSET_CLASS_COLORS[assetClass] : null;
  const style = c ? {
    background: `${c}1f`, border: `1px solid ${c}50`, color: c,
  } : null;
  return (
    <span className={`chip chip-ticker ${className}`} style={style}>
      <span style={{ opacity: 0.5, fontWeight: 600 }}>$</span>
      {ticker}
    </span>
  );
}

function SectorChip({ sector }) {
  if (!sector) return null;
  return <span className="chip chip-sector">#{sector}</span>;
}

function AssetClassChip({ assetClass }) {
  if (!assetClass) return null;
  const c = window.ASSET_CLASS_COLORS[assetClass] || "#a5b4fc";
  return (
    <span className="chip up" style={{
      background: `${c}18`, border: `1px solid ${c}40`, color: c,
      fontSize: 9.5, letterSpacing: ".1em",
    }}>
      <span style={{ width: 6, height: 6, borderRadius: 2, background: c, boxShadow: `0 0 6px ${c}99` }} />
      {assetClass}
    </span>
  );
}

// ═════ SentimentBadge ═════
function SentimentBadge({ sentiment, withLabel = true }) {
  if (!sentiment) return null;
  if (sentiment === "bullish") return (
    <span className="chip chip-sentiment-bull"><span>▲</span>{withLabel && "BULLISH"}</span>
  );
  if (sentiment === "bearish") return (
    <span className="chip chip-sentiment-bear"><span>▼</span>{withLabel && "BEARISH"}</span>
  );
  return <span className="chip chip-sentiment-neu"><span>◆</span>{withLabel && "NEUTRAL"}</span>;
}

// ═════ Risk meter ═════
function RiskMeter({ level }) {
  if (!level) return null;
  const cls = level === "low" ? "chip-risk-low" : level === "medium" ? "chip-risk-mid" : "chip-risk-high";
  const label = level === "low" ? "RENDAH" : level === "medium" ? "MENENGAH" : "TINGGI";
  const bars = level === "low" ? 1 : level === "medium" ? 2 : 3;
  return (
    <span className={`chip ${cls}`}>
      <span style={{ display: "inline-flex", gap: 2, alignItems: "end", marginRight: 2 }}>
        {[1, 2, 3].map((i) => (
          <span key={i} style={{
            width: 3, height: i * 3 + 2,
            background: i <= bars ? "currentColor" : "rgba(255,255,255,.15)",
            borderRadius: 1,
          }} />
        ))}
      </span>
      RISIKO {label}
    </span>
  );
}

// ═════ CountUp ═════
function CountUp({ to, duration = 1200, decimals = 0, suffix = "" }) {
  const [v, setV] = useState(0);
  useEffect(() => {
    const t0 = performance.now();
    let raf;
    const tick = (t) => {
      const k = Math.min(1, (t - t0) / duration);
      // easeOutCubic
      const e = 1 - Math.pow(1 - k, 3);
      setV(to * e);
      if (k < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [to, duration]);
  return <>{v.toFixed(decimals)}{suffix}</>;
}

// ═════ Ticker Tape ═════
function TickerTape() {
  const items = window.TICKER_TAPE;
  const verdictColor = (v) => v === "VALID" ? "#34d399" : v === "HOAKS" ? "#f87171" : "#fcd34d";
  const verdictGlyph = (v) => v === "VALID" ? "✓" : v === "HOAKS" ? "✕" : "?";
  const doubled = [...items, ...items];
  return (
    <div className="ticker-tape">
      <div className="ticker-track">
        {doubled.map((it, i) => {
          const cls = it.cls;
          const clsColor = (window.ASSET_CLASS_COLORS || {})[cls] || "rgba(255,255,255,.6)";
          return (
            <span key={i} className="ticker-item">
              <span className="mono up" style={{
                fontSize: 8.5, padding: "1px 5px", borderRadius: 3, letterSpacing: ".1em",
                color: clsColor, background: `${clsColor}15`,
              }}>
                {cls?.slice(0, 3).toUpperCase()}
              </span>
              <span className="mono" style={{ color: "rgba(255,255,255,.9)", fontWeight: 700, letterSpacing: ".03em" }}>
                {it.t}
              </span>
              <span className="mono" style={{ color: "rgba(255,255,255,.5)" }}>{it.p}</span>
              <span className="mono" style={{
                color: it.chg > 0 ? "#34d399" : it.chg < 0 ? "#f87171" : "rgba(255,255,255,.4)", fontWeight: 600,
                fontSize: 10.5,
              }}>
                {it.chg > 0 ? "▲" : it.chg < 0 ? "▼" : "◆"}{Math.abs(it.chg).toFixed(2)}%
              </span>
              <span className="mono up" style={{
                fontSize: 9.5, padding: "2px 6px", borderRadius: 4,
                color: verdictColor(it.verdict),
                background: `${verdictColor(it.verdict)}15`,
                border: `1px solid ${verdictColor(it.verdict)}30`,
                letterSpacing: ".1em",
              }}>
                {verdictGlyph(it.verdict)} {it.verdict}
              </span>
            </span>
          );
        })}
      </div>
    </div>
  );
}

// ═════ Mood Meter (fear/greed gauge) ═════
function MoodMeter() {
  const data = window.MOOD_INDEX;
  const value = data.value; // 0..100
  // semicircle gauge from 180° to 360° (i.e., bottom half flipped to top half)
  const r = 64;
  const cx = 80, cy = 80;
  const start = Math.PI; // left
  const end = 2 * Math.PI; // right
  const angle = start + (end - start) * (value / 100);
  const px = cx + r * Math.cos(angle);
  const py = cy + r * Math.sin(angle);

  // color zones
  const segments = [
    { from: 0, to: 25, color: "#ef4444", label: "Extreme Fear" },
    { from: 25, to: 45, color: "#f59e0b", label: "Fear" },
    { from: 45, to: 55, color: "#a3a3a3", label: "Neutral" },
    { from: 55, to: 75, color: "#10b981", label: "Greed" },
    { from: 75, to: 100, color: "#34d399", label: "Extreme Greed" },
  ];

  const arcPath = (fromPct, toPct) => {
    const a0 = start + (end - start) * (fromPct / 100);
    const a1 = start + (end - start) * (toPct / 100);
    const x0 = cx + r * Math.cos(a0);
    const y0 = cy + r * Math.sin(a0);
    const x1 = cx + r * Math.cos(a1);
    const y1 = cy + r * Math.sin(a1);
    const large = a1 - a0 > Math.PI ? 1 : 0;
    return `M${x0.toFixed(2)},${y0.toFixed(2)} A${r},${r} 0 ${large} 1 ${x1.toFixed(2)},${y1.toFixed(2)}`;
  };

  const currentLabel = segments.find((s) => value >= s.from && value < s.to)?.label || "Greed";
  const currentColor = segments.find((s) => value >= s.from && value < s.to)?.color || "#10b981";

  return (
    <div className="glass-elev corner-marks" style={{ borderRadius: 18, padding: "14px 18px", display: "flex", alignItems: "center", gap: 18, minWidth: 0 }}>
      <svg width="160" height="92" viewBox="0 0 160 92">
        {segments.map((s, i) => (
          <path key={i} d={arcPath(s.from, s.to)} stroke={s.color} strokeWidth="8" fill="none" strokeLinecap="butt" opacity="0.55" />
        ))}
        {/* Active needle */}
        <line x1={cx} y1={cy} x2={px} y2={py} stroke="#fff" strokeWidth="2" strokeLinecap="round" style={{ transition: "all 1.2s cubic-bezier(.16,1,.3,1)" }} />
        <circle cx={cx} cy={cy} r="4" fill="#fff" />
        <circle cx={px} cy={py} r="5" fill={currentColor} stroke="#fff" strokeWidth="1.5" style={{ transition: "all 1.2s cubic-bezier(.16,1,.3,1)" }} />
      </svg>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div className="label-tech">Market Mood · Indeks Fear/Greed</div>
        <div style={{ display: "flex", alignItems: "baseline", gap: 8, marginTop: 4 }}>
          <span className="mono" style={{ fontSize: 28, fontWeight: 800, color: currentColor, lineHeight: 1 }}>
            <CountUp to={value} duration={1400} />
          </span>
          <span className="up" style={{ fontSize: 11, fontWeight: 700, color: currentColor, letterSpacing: ".1em" }}>
            {currentLabel}
          </span>
        </div>
        <div style={{ color: "rgba(255,255,255,.4)", fontSize: 11, marginTop: 4, lineHeight: 1.4 }}>
          Sentimen lintas-aset global · diperbarui {`<`}1 menit lalu
        </div>
      </div>
    </div>
  );
}

// ═════ Watchlist ═════
function Watchlist({ onTickerClick }) {
  const items = window.WATCHLIST;
  return (
    <div className="glass-elev corner-marks" style={{ borderRadius: 18, padding: 14 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12, padding: "0 4px" }}>
        <div className="label-tech">Most-Verified · Lintas-Aset · 24j</div>
        <span className="mono" style={{ fontSize: 10, color: "rgba(255,255,255,.3)" }}>TOP 7</span>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        {items.map((it) => {
          const hoaxPct = Math.round((it.hoax / it.checks) * 100);
          const danger = hoaxPct > 50;
          const cls = (window.ASSET_CLASS_COLORS || {})[it.cls] || "#a5b4fc";
          return (
            <div key={it.t} className="watchlist-item" onClick={() => onTickerClick && onTickerClick(it.t)}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, minWidth: 0 }}>
                <span style={{
                  width: 4, height: 16, borderRadius: 2, background: cls,
                  boxShadow: `0 0 6px ${cls}aa`, flexShrink: 0,
                }} />
                <span className="chip-ticker" style={{ fontSize: 10.5, padding: "2px 7px" }}>
                  <span style={{ opacity: .5 }}>$</span>{it.t}
                </span>
                <span className="mono up" style={{
                  fontSize: 8.5, color: cls, letterSpacing: ".1em", fontWeight: 600,
                }}>
                  {it.cls.slice(0, 3).toUpperCase()}
                </span>
                <span className="mono" style={{ fontSize: 10, color: "rgba(255,255,255,.35)" }}>
                  {it.checks}×
                </span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <div style={{
                  width: 50, height: 5, borderRadius: 3, background: "rgba(255,255,255,.06)", overflow: "hidden",
                  display: "flex",
                }}>
                  <div style={{ width: `${(it.valid / it.checks) * 100}%`, background: "#34d399" }} />
                  <div style={{ width: `${(it.hoax / it.checks) * 100}%`, background: "#f87171" }} />
                </div>
                <span className="mono" style={{
                  fontSize: 10, fontWeight: 700,
                  color: danger ? "#fca5a5" : "#6ee7b7", width: 32, textAlign: "right",
                }}>
                  {danger ? `${hoaxPct}%` : `${Math.round((it.valid / it.checks) * 100)}%`}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ═════ Confidence gauge (used in PostCard + ResultBox) ═════
function ConfidenceArc({ value, color, size = 32 }) {
  const r = size / 2 - 2;
  const c = 2 * Math.PI * r;
  const filled = c * 0.75; // 270° track
  const dash = (Math.abs(value) / 100) * filled;
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="rgba(255,255,255,.08)" strokeWidth="2.5"
        strokeLinecap="round"
        strokeDasharray={`${filled} ${c}`}
        style={{ transform: "rotate(135deg)", transformOrigin: "50% 50%" }}
      />
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={color} strokeWidth="2.5"
        strokeLinecap="round"
        strokeDasharray={`${dash} ${c}`}
        style={{ transform: "rotate(135deg)", transformOrigin: "50% 50%", transition: "stroke-dasharray 1.5s cubic-bezier(.16,1,.3,1)" }}
      />
    </svg>
  );
}

// ═════ Post Card ═════
const RESULT_META = {
  valid: { label: "TERVERIFIKASI", icon: "✓", cls: "card-valid", glow: "v", color: "#34d399", labelColor: "#10b981", textCls: "text-emerald-300" },
  hoax: { label: "MISINFORMASI", icon: "✕", cls: "card-hoax", glow: "h", color: "#f87171", labelColor: "#ef4444", textCls: "text-red-300" },
  uncertain: { label: "BELUM TERKONFIRMASI", icon: "?", cls: "card-uncertain", glow: "u", color: "#fcd34d", labelColor: "#f59e0b", textCls: "text-amber-300" },
};

function PostCard({ post, index = 0, onClick }) {
  const r = post.result || "uncertain";
  const m = RESULT_META[r];
  const sparkColor = r === "valid" ? "#34d399" : r === "hoax" ? "#f87171" : "#fcd34d";
  return (
    <article
      className={`post-card ${m.cls} card-entrance`}
      style={{ animationDelay: `${index * 0.05}s` }}
      onClick={() => onClick && onClick(post)}
      role="button"
      tabIndex={0}
    >
      {r === "hoax" && <div className="card-hoax-tape" />}
      <div className={`card-top-glow ${m.glow}`} />
      <div className="inner">
        {/* TOP ROW */}
        <div style={{ display: "flex", alignItems: "flex-start", gap: 10, marginBottom: 10 }}>
          <div style={{
            width: 32, height: 32, borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center",
            background: `${m.labelColor}22`, border: `1px solid ${m.labelColor}40`, color: m.color,
            fontWeight: 800, fontSize: 14, flexShrink: 0,
          }}>
            {m.icon}
          </div>
          <h3 style={{
            margin: 0, fontSize: 13, fontWeight: 700, color: "#fff", lineHeight: 1.35,
            display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden",
          }}>
            {post.title}
          </h3>
        </div>

        {/* CHIPS ROW */}
        <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 10 }}>
          <span className="chip up" style={{
            background: `${m.labelColor}1f`, border: `1px solid ${m.labelColor}40`, color: m.color, fontSize: 9.5,
          }}>
            {m.icon} {m.label}
          </span>
          {post.assetClass && <AssetClassChip assetClass={post.assetClass} />}
          {post.ticker && <TickerChip ticker={post.ticker} assetClass={post.assetClass} />}
          <SentimentBadge sentiment={post.sentiment} withLabel={false} />
          {post.sector && <SectorChip sector={post.sector} />}
        </div>

        {/* SUMMARY */}
        <p style={{
          color: "rgba(255,255,255,.7)", fontSize: 12, lineHeight: 1.55, margin: "0 0 8px",
          display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden",
        }}>
          {post.summary}
        </p>

        {/* CONTEXT quote */}
        <blockquote style={{ position: "relative", paddingLeft: 12, margin: "0 0 10px" }}>
          <span style={{
            position: "absolute", left: 0, top: 0, bottom: 0, width: 2, borderRadius: 1,
            background: `linear-gradient(180deg, ${m.color}, transparent)`,
          }} />
          <p style={{
            color: "rgba(255,255,255,.35)", fontSize: 11, lineHeight: 1.5, margin: 0, fontStyle: "italic",
            display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden",
          }}>
            {post.context}
          </p>
        </blockquote>

        {/* FOOTER */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <Sparkline points={post.spark} color={sparkColor} width={64} height={20} />
            <span className="mono" style={{ fontSize: 10, color: "rgba(255,255,255,.3)" }}>{post.updatedAt}</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <ConfidenceArc value={post.confidence} color={m.color} size={28} />
            <span className="mono" style={{ fontSize: 13, fontWeight: 800, color: m.color }}>
              {Math.round(post.confidence)}%
            </span>
          </div>
        </div>
      </div>
    </article>
  );
}

// Export
Object.assign(window, {
  Logo, Sparkline, TickerChip, SectorChip, AssetClassChip, SentimentBadge, RiskMeter, CountUp,
  TickerTape, MoodMeter, Watchlist, ConfidenceArc, PostCard, RESULT_META,
});
