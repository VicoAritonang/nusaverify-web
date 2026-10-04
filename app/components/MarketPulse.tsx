import { MOOD_INDEX, WATCHLIST, ASSET_CLASS_COLORS } from "@/lib/investmentData";
import { CountUp } from "./Viz";

const SEGMENTS = [
  { from: 0, to: 25, color: "#ef4444", label: "Extreme fear" },
  { from: 25, to: 45, color: "#f59e0b", label: "Fear" },
  { from: 45, to: 55, color: "#a3a3a3", label: "Netral" },
  { from: 55, to: 75, color: "#10b981", label: "Greed" },
  { from: 75, to: 100, color: "#34d399", label: "Extreme greed" },
];

function MoodMeter() {
  const value = MOOD_INDEX.value;
  const r = 84;
  const cx = 100;
  const cy = 100;
  const start = Math.PI;
  const end = 2 * Math.PI;
  const angle = start + (end - start) * (value / 100);
  const px = cx + r * Math.cos(angle);
  const py = cy + r * Math.sin(angle);

  const arcPath = (fromPct: number, toPct: number) => {
    const gap = 1.2;
    const a0 = start + (end - start) * ((fromPct + (fromPct === 0 ? 0 : gap / 2)) / 100);
    const a1 = start + (end - start) * ((toPct - (toPct === 100 ? 0 : gap / 2)) / 100);
    const x0 = cx + r * Math.cos(a0);
    const y0 = cy + r * Math.sin(a0);
    const x1 = cx + r * Math.cos(a1);
    const y1 = cy + r * Math.sin(a1);
    return `M${x0.toFixed(2)},${y0.toFixed(2)} A${r},${r} 0 0 1 ${x1.toFixed(2)},${y1.toFixed(2)}`;
  };

  const seg = SEGMENTS.find((s) => value >= s.from && value < s.to) ?? SEGMENTS[3];

  return (
    <div className="lg lg-dense" style={{ borderRadius: 32, padding: 28, display: "flex", flexDirection: "column", justifyContent: "space-between", gap: 24 }}>
      <div>
        <div className="eyebrow">Sentimen lintas-aset</div>
        <div style={{ fontSize: 14, color: "var(--fg-3)", marginTop: 6 }}>Indeks fear / greed · contoh data</div>
      </div>
      <div style={{ position: "relative", width: "100%", maxWidth: 300, margin: "0 auto" }}>
        <svg viewBox="0 0 200 112" width="100%" style={{ display: "block", overflow: "visible" }}>
          {SEGMENTS.map((s, i) => (
            <path key={i} d={arcPath(s.from, s.to)} stroke={s.color} strokeWidth="10" fill="none" strokeLinecap="round" opacity={s === seg ? 0.95 : 0.3} />
          ))}
          <circle cx={px} cy={py} r="9" fill="var(--ink)" stroke="#fff" strokeWidth="2.5" />
          <circle cx={px} cy={py} r="3.5" fill={seg.color} />
        </svg>
        <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, textAlign: "center" }}>
          <div className="h-display" style={{ fontSize: 52, lineHeight: 1, color: "var(--fg)" }}>
            <CountUp to={value} duration={1400} />
          </div>
          <div style={{ fontSize: 13, fontWeight: 600, color: seg.color, marginTop: 4 }}>{seg.label}</div>
        </div>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px 16px" }}>
        {MOOD_INDEX.components.map((c) => (
          <div key={c.name}>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, color: "var(--fg-3)", gap: 8 }}>
              <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{c.name}</span>
              <span className="mono" style={{ color: "var(--fg-2)" }}>
                {c.value}
              </span>
            </div>
            <div style={{ height: 3, borderRadius: 3, background: "rgba(255,255,255,.07)", marginTop: 6 }}>
              <div style={{ width: `${c.value}%`, height: "100%", borderRadius: 3, background: "linear-gradient(90deg, var(--champagne-3), var(--champagne-2))" }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function Watchlist() {
  return (
    <div className="lg lg-dense" style={{ borderRadius: 32, padding: "24px 18px 14px" }}>
      <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", padding: "0 10px 12px" }}>
        <div>
          <div className="eyebrow">Paling banyak dicek · 24 jam</div>
          <div style={{ fontSize: 14, color: "var(--fg-3)", marginTop: 6 }}>Porsi valid vs hoaks per instrumen</div>
        </div>
      </div>
      <div style={{ display: "flex", flexDirection: "column" }}>
        {WATCHLIST.map((it) => {
          const validPct = Math.round((it.valid / it.checks) * 100);
          const hoaxPct = Math.round((it.hoax / it.checks) * 100);
          const danger = hoaxPct > 50;
          const cls = ASSET_CLASS_COLORS[it.cls] || "#9db8ff";
          return (
            <div key={it.t} className="watchlist-item">
              <div style={{ display: "flex", alignItems: "center", gap: 12, minWidth: 0, flex: "0 1 auto" }}>
                <span
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: 12,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    background: `${cls}14`,
                    boxShadow: `inset 0 0 0 1px ${cls}30`,
                    color: cls,
                    fontSize: 10,
                    fontWeight: 600,
                    flexShrink: 0,
                  }}
                  className="mono"
                >
                  {it.cls.slice(0, 3).toUpperCase()}
                </span>
                <span style={{ minWidth: 0 }}>
                  <span className="mono" style={{ display: "block", fontSize: 14, fontWeight: 600, color: "var(--fg)" }}>
                    {it.t}
                  </span>
                  <span style={{ display: "block", fontSize: 12, color: "var(--fg-4)" }}>{it.checks} kali dicek</span>
                </span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 12, flex: "1 1 auto", justifyContent: "flex-end" }}>
                <div style={{ width: "min(160px, 30vw)", height: 6, borderRadius: 6, background: "rgba(255,255,255,.06)", overflow: "hidden", display: "flex", gap: 2 }}>
                  <div style={{ width: `${validPct}%`, background: "#34d399", borderRadius: 6 }} />
                  <div style={{ width: `${hoaxPct}%`, background: "#f87171", borderRadius: 6 }} />
                </div>
                <span className="mono" style={{ fontSize: 12.5, fontWeight: 600, color: danger ? "#fca5a5" : "#6ee7b7", width: 74, textAlign: "right" }}>
                  {danger ? `${hoaxPct}% hoaks` : `${validPct}% valid`}
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
    <div className="market-pulse-grid">
      <MoodMeter />
      <Watchlist />
    </div>
  );
}
