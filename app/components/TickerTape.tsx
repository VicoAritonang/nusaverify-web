import { TICKER_TAPE, ASSET_CLASS_COLORS } from "@/lib/investmentData";

const verdictColor = (v: string) =>
  v === "VALID" ? "#34d399" : v === "HOAKS" ? "#f87171" : "#fcd34d";
const verdictGlyph = (v: string) => (v === "VALID" ? "✓" : v === "HOAKS" ? "✕" : "?");

export default function TickerTape() {
  const doubled = [...TICKER_TAPE, ...TICKER_TAPE];
  return (
    <div className="ticker-tape">
      <div className="ticker-track">
        {doubled.map((it, i) => {
          const clsColor = ASSET_CLASS_COLORS[it.cls] || "rgba(255,255,255,.6)";
          const vc = verdictColor(it.verdict);
          return (
            <span key={i} className="ticker-item">
              <span
                className="mono up"
                style={{
                  fontSize: 8.5,
                  padding: "1px 5px",
                  borderRadius: 3,
                  letterSpacing: ".1em",
                  color: clsColor,
                  background: `${clsColor}15`,
                }}
              >
                {it.cls.slice(0, 3).toUpperCase()}
              </span>
              <span
                className="mono"
                style={{ color: "rgba(255,255,255,.9)", fontWeight: 700, letterSpacing: ".03em" }}
              >
                {it.t}
              </span>
              <span className="mono" style={{ color: "rgba(255,255,255,.5)" }}>
                {it.p}
              </span>
              <span
                className="mono"
                style={{
                  color: it.chg > 0 ? "#34d399" : it.chg < 0 ? "#f87171" : "rgba(255,255,255,.4)",
                  fontWeight: 600,
                  fontSize: 10.5,
                }}
              >
                {it.chg > 0 ? "▲" : it.chg < 0 ? "▼" : "◆"}
                {Math.abs(it.chg).toFixed(2)}%
              </span>
              <span
                className="mono up"
                style={{
                  fontSize: 9.5,
                  padding: "2px 6px",
                  borderRadius: 4,
                  color: vc,
                  background: `${vc}15`,
                  border: `1px solid ${vc}30`,
                  letterSpacing: ".1em",
                }}
              >
                {verdictGlyph(it.verdict)} {it.verdict}
              </span>
            </span>
          );
        })}
      </div>
    </div>
  );
}
