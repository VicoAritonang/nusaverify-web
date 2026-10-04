import { ASSET_CLASS_COLORS, RESULT_META, type ResultMeta } from "@/lib/investmentData";
import type { PostResult, Sentiment, RiskLevel } from "@/lib/types";

export function TickerChip({
  ticker,
  assetClass,
}: {
  ticker?: string | null;
  assetClass?: string | null;
}) {
  if (!ticker) return null;
  const c = assetClass ? ASSET_CLASS_COLORS[assetClass] : null;
  const style = c ? { background: `${c}14`, border: `1px solid ${c}38`, color: c } : undefined;
  return (
    <span className="chip chip-ticker" style={style}>
      <span style={{ opacity: 0.5 }}>$</span>
      {ticker}
    </span>
  );
}

export function SectorChip({ sector }: { sector?: string | null }) {
  if (!sector) return null;
  return <span className="chip chip-sector">#{sector}</span>;
}

export function AssetClassChip({ assetClass }: { assetClass?: string | null }) {
  if (!assetClass) return null;
  const c = ASSET_CLASS_COLORS[assetClass] || "#9db8ff";
  return (
    <span className="chip" style={{ background: `${c}14`, border: `1px solid ${c}38`, color: c }}>
      <span style={{ width: 6, height: 6, borderRadius: 6, background: c }} />
      {assetClass}
    </span>
  );
}

export function SentimentBadge({
  sentiment,
  withLabel = true,
}: {
  sentiment?: Sentiment | null;
  withLabel?: boolean;
}) {
  if (!sentiment) return null;
  if (sentiment === "bullish")
    return (
      <span className="chip chip-sentiment-bull">
        <span>▲</span>
        {withLabel && "Bullish"}
      </span>
    );
  if (sentiment === "bearish")
    return (
      <span className="chip chip-sentiment-bear">
        <span>▼</span>
        {withLabel && "Bearish"}
      </span>
    );
  return (
    <span className="chip chip-sentiment-neu">
      <span>◆</span>
      {withLabel && "Netral"}
    </span>
  );
}

export function RiskMeter({ level }: { level?: RiskLevel | null }) {
  if (!level) return null;
  const cls = level === "low" ? "chip-risk-low" : level === "medium" ? "chip-risk-mid" : "chip-risk-high";
  const label = level === "low" ? "rendah" : level === "medium" ? "menengah" : "tinggi";
  const bars = level === "low" ? 1 : level === "medium" ? 2 : 3;
  return (
    <span className={`chip ${cls}`}>
      <span style={{ display: "inline-flex", gap: 2, alignItems: "end", marginRight: 2 }}>
        {[1, 2, 3].map((i) => (
          <span
            key={i}
            style={{
              width: 3,
              height: i * 3 + 2,
              background: i <= bars ? "currentColor" : "rgba(255,255,255,.15)",
              borderRadius: 1,
            }}
          />
        ))}
      </span>
      Risiko {label}
    </span>
  );
}

export function VerdictChip({ result, meta }: { result: PostResult; meta?: ResultMeta }) {
  const m = meta ?? RESULT_META[result];
  return (
    <span
      className="chip"
      style={{
        background: `${m.labelColor}1c`,
        border: `1px solid ${m.labelColor}40`,
        color: m.color,
      }}
    >
      {m.icon} {m.label}
    </span>
  );
}
