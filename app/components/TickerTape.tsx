import { TICKER_TAPE, ASSET_CLASS_COLORS } from "@/lib/investmentData";

const verdictColor = (v: string) => (v === "VALID" ? "#34d399" : v === "HOAKS" ? "#f87171" : "#fcd34d");
const verdictLabel = (v: string) => (v === "VALID" ? "Valid" : v === "HOAKS" ? "Hoaks" : "Dicek");

export default function TickerTape() {
  const doubled = [...TICKER_TAPE, ...TICKER_TAPE];
  return (
    <div className="lg lg-pill" style={{ padding: 4 }} aria-label="Klaim yang sedang dicek per instrumen">
      <div className="ticker-tape">
        <div className="ticker-track">
          {doubled.map((it, i) => {
            const clsColor = ASSET_CLASS_COLORS[it.cls] || "rgba(255,255,255,.6)";
            const vc = verdictColor(it.verdict);
            return (
              <span key={i} className="ticker-item" aria-hidden={i >= TICKER_TAPE.length}>
                <span style={{ width: 6, height: 6, borderRadius: 6, background: clsColor }} />
                <span className="mono" style={{ color: "var(--fg)", fontWeight: 600 }}>
                  {it.t}
                </span>
                <span className="mono" style={{ color: "var(--fg-3)" }}>
                  {it.p}
                </span>
                <span
                  className="mono"
                  style={{
                    color: it.chg > 0 ? "#34d399" : it.chg < 0 ? "#f87171" : "var(--fg-4)",
                    fontSize: 11.5,
                  }}
                >
                  {it.chg > 0 ? "+" : it.chg < 0 ? "−" : "±"}
                  {Math.abs(it.chg).toFixed(2)}%
                </span>
                <span
                  style={{
                    fontSize: 11,
                    fontWeight: 600,
                    padding: "2px 8px",
                    borderRadius: 999,
                    color: vc,
                    background: `${vc}14`,
                    boxShadow: `inset 0 0 0 1px ${vc}33`,
                  }}
                >
                  {verdictLabel(it.verdict)}
                </span>
              </span>
            );
          })}
        </div>
      </div>
    </div>
  );
}
