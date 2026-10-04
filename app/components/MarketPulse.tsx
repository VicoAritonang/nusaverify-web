import { MOOD_INDEX, WATCHLIST, ASSET_CLASS_COLORS } from "@/lib/investmentData";
import { CountUp } from "./Viz";

const SEGMENTS = [
  { from: 0, to: 25, color: "#ef4444", label: "Extreme Fear" },
  { from: 25, to: 45, color: "#f59e0b", label: "Fear" },
  { from: 45, to: 55, color: "#a3a3a3", label: "Neutral" },
  { from: 55, to: 75, color: "#10b981", label: "Greed" },
  { from: 75, to: 100, color: "#34d399", label: "Extreme Greed" },
];

function MoodMeter() {
  const value = MOOD_INDEX.value;
  const r = 64;
  const cx = 80;
  const cy = 80;
  const start = Math.PI;
  const end = 2 * Math.PI;
  const angle = start + (end - start) * (value / 100);
  const px = cx + r * Math.cos(angle);
  const py = cy + r * Math.sin(angle);

  const arcPath = (fromPct: number, toPct: number) => {
    const a0 = start + (end - start) * (fromPct / 100);
    const a1 = start + (end - start) * (toPct / 100);
    const x0 = cx + r * Math.cos(a0);
    const y0 = cy + r * Math.sin(a0);
    const x1 = cx + r * Math.cos(a1);
    const y1 = cy + r * Math.sin(a1);
    const large = a1 - a0 > Math.PI ? 1 : 0;
    return `M${x0.toFixed(2)},${y0.toFixed(2)} A${r},${r} 0 ${large} 1 ${x1.toFixed(2)},${y1.toFixed(2)}`;
  };

  const seg = SEGMENTS.find((s) => value >= s.from && value < s.to) ?? SEGMENTS[3];

  return (
    <div
      className="glass-elev corner-marks"
      style={{ borderRadius: 18, padding: "14px 18px", display: "flex", alignItems: "center", gap: 18, minWidth: 0 }}
    >
      <svg width="160" height="92" viewBox="0 0 160 92" className="shrink-0">
        {SEGMENTS.map((s, i) => (
          <path key={i} d={arcPath(s.from, s.to)} stroke={s.color} strokeWidth="8" fill="none" strokeLinecap="butt" opacity="0.55" />
        ))}
        <line
          x1={cx}
          y1={cy}
          x2={px}
          y2={py}
          stroke="#fff"
          strokeWidth="2"
          strokeLinecap="round"
          style={{ transition: "all 1.2s cubic-bezier(.16,1,.3,1)" }}
        />
        <circle cx={cx} cy={cy} r="4" fill="#fff" />
        <circle cx={px} cy={py} r="5" fill={seg.color} stroke="#fff" strokeWidth="1.5" />
      </svg>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div className="label-tech">Market Mood · Indeks Fear/Greed</div>
        <div style={{ display: "flex", alignItems: "baseline", gap: 8, marginTop: 4 }}>
          <span className="mono" style={{ fontSize: 28, fontWeight: 800, color: seg.color, lineHeight: 1 }}>
            <CountUp to={value} duration={1400} />
          </span>
          <span className="up" style={{ fontSize: 11, fontWeight: 700, color: seg.color, letterSpacing: ".1em" }}>
            {seg.label}
          </span>
        </div>
        <div style={{ color: "rgba(255,255,255,.4)", fontSize: 11, marginTop: 4, lineHeight: 1.4 }}>
          Sentimen lintas-aset global · diperbarui &lt;1 menit lalu
        </div>
      </div>
    </div>
  );
}

function Watchlist() {
  return (
    <div className="glass-elev corner-marks" style={{ borderRadius: 18, padding: 14 }}>
      <div
        style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12, padding: "0 4px" }}
      >
        <div className="label-tech">Most-Verified · Lintas-Aset · 24j</div>
        <span className="mono" style={{ fontSize: 10, color: "rgba(255,255,255,.3)" }}>
          TOP 7
        </span>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        {WATCHLIST.map((it) => {
          const hoaxPct = Math.round((it.hoax / it.checks) * 100);
          const danger = hoaxPct > 50;
          const cls = ASSET_CLASS_COLORS[it.cls] || "#a5b4fc";
          return (
            <div key={it.t} className="watchlist-item">
              <div style={{ display: "flex", alignItems: "center", gap: 8, minWidth: 0 }}>
                <span
                  style={{ width: 4, height: 16, borderRadius: 2, background: cls, boxShadow: `0 0 6px ${cls}aa`, flexShrink: 0 }}
                />
                <span className="chip-ticker" style={{ fontSize: 10.5, padding: "2px 7px" }}>
                  <span style={{ opacity: 0.5 }}>$</span>
                  {it.t}
                </span>
                <span className="mono up" style={{ fontSize: 8.5, color: cls, letterSpacing: ".1em", fontWeight: 600 }}>
                  {it.cls.slice(0, 3).toUpperCase()}
                </span>
                <span className="mono" style={{ fontSize: 10, color: "rgba(255,255,255,.35)" }}>
                  {it.checks}×
                </span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <div
                  style={{
                    width: 50,
                    height: 5,
                    borderRadius: 3,
                    background: "rgba(255,255,255,.06)",
                    overflow: "hidden",
                    display: "flex",
                  }}
                >
                  <div style={{ width: `${(it.valid / it.checks) * 100}%`, background: "#34d399" }} />
                  <div style={{ width: `${(it.hoax / it.checks) * 100}%`, background: "#f87171" }} />
                </div>
                <span
                  className="mono"
                  style={{ fontSize: 10, fontWeight: 700, color: danger ? "#fca5a5" : "#6ee7b7", width: 32, textAlign: "right" }}
                >
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

export default function MarketPulse() {
  return (
    <div
      className="fade-in-up market-pulse-grid"
      style={{ display: "grid", gap: 14, marginBottom: 24 }}
    >
      <MoodMeter />
      <Watchlist />
    </div>
  );
}
