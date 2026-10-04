import type { PostResult, Sentiment } from "./types";

// ════════════════════════════════════════════════════════════════════
//  Verdict semantics — the product's primary visual language.
//  DB value (valid/hoax/uncertain) is unchanged; only display differs.
// ════════════════════════════════════════════════════════════════════
export interface ResultMeta {
  label: string; // display label
  icon: string; // glyph
  color: string; // text / accent
  labelColor: string; // base (for alpha blends)
  glow: "v" | "h" | "u";
  cardClass: string;
}

export const RESULT_META: Record<PostResult, ResultMeta> = {
  valid: {
    label: "Terverifikasi",
    icon: "✓",
    color: "#34d399",
    labelColor: "#10b981",
    glow: "v",
    cardClass: "card-valid",
  },
  hoax: {
    label: "Misinformasi",
    icon: "✕",
    color: "#f87171",
    labelColor: "#ef4444",
    glow: "h",
    cardClass: "card-hoax",
  },
  uncertain: {
    label: "Belum Terkonfirmasi",
    icon: "?",
    color: "#fcd34d",
    labelColor: "#f59e0b",
    glow: "u",
    cardClass: "card-uncertain",
  },
};

export function resultOf(r: PostResult | null | undefined): PostResult {
  return r ?? "uncertain";
}

// ════════════════════════════════════════════════════════════════════
//  Asset classes
// ════════════════════════════════════════════════════════════════════
export const ASSET_CLASS_COLORS: Record<string, string> = {
  Saham: "#a5b4fc",
  Crypto: "#fb923c",
  Forex: "#22d3ee",
  Komoditas: "#fcd34d",
  Makro: "#c4b5fd",
  "Reksa Dana": "#86efac",
  "Investasi Ilegal": "#f87171",
};

export function assetColor(assetClass?: string | null): string | null {
  if (!assetClass) return null;
  return ASSET_CLASS_COLORS[assetClass] ?? null;
}

// ════════════════════════════════════════════════════════════════════
//  Claim types
// ════════════════════════════════════════════════════════════════════
export const CLAIM_TYPES: Record<string, { label: string; icon: string }> = {
  rumor: { label: "Rumor", icon: "💬" },
  "corporate-action": { label: "Corporate Action", icon: "📋" },
  "pump-and-dump": { label: "Pump & Dump", icon: "🚨" },
  "investasi-ilegal": { label: "Investasi Ilegal", icon: "⚠️" },
  "sinyal-trading": { label: "Sinyal Trading", icon: "📈" },
  "berita-resmi": { label: "Berita Resmi", icon: "🏛️" },
  "pom-pom": { label: "Pom-pom / Endorser", icon: "📣" },
  "kebijakan-moneter": { label: "Kebijakan Moneter", icon: "🏦" },
  geopolitik: { label: "Geopolitik / Tarif", icon: "🌐" },
};

// ════════════════════════════════════════════════════════════════════
//  Agent / source personas.
//
//  The live `think` table still exposes 6 hard-coded source columns. We map
//  each to an investment persona so the live trace reads as a multi-source
//  financial engine. `key` matches the Think column prefix.
// ════════════════════════════════════════════════════════════════════
export type AgentGroup = "regulator" | "media" | "community" | "analyst";

export interface ThinkSourceConfig {
  key: "official" | "cnbc" | "detik" | "kompas" | "inews" | "analysis";
  name: string;
  role: string;
  avatar: string;
  group: AgentGroup;
  short: string;
  color: string; // graph node accent
}

export const GROUP_COLOR: Record<AgentGroup, string> = {
  regulator: "#22d3ee", // cyan
  media: "#818cf8", // indigo-light
  community: "#fcd34d", // amber
  analyst: "#c4b5fd", // violet-light
};

export const THINK_SOURCES: ThinkSourceConfig[] = [
  {
    key: "official",
    name: "BEI / OJK",
    role: "OFFICIAL · IDX · KETERBUKAAN INFORMASI",
    avatar: "🏛️",
    group: "regulator",
    short: "EXG",
    color: GROUP_COLOR.regulator,
  },
  {
    key: "cnbc",
    name: "CNBC Indonesia",
    role: "MEDIA FINANSIAL · REAL-TIME",
    avatar: "📈",
    group: "media",
    short: "CNBC",
    color: GROUP_COLOR.media,
  },
  {
    key: "detik",
    name: "Kontan",
    role: "MEDIA PASAR MODAL",
    avatar: "📰",
    group: "media",
    short: "KTN",
    color: GROUP_COLOR.media,
  },
  {
    key: "kompas",
    name: "Bisnis Indonesia",
    role: "MEDIA BISNIS · KORPORASI",
    avatar: "🗞️",
    group: "media",
    short: "BSN",
    color: GROUP_COLOR.media,
  },
  {
    key: "inews",
    name: "Sentimen Retail",
    role: "STOCKBIT · KOMUNITAS · TELEGRAM",
    avatar: "💬",
    group: "community",
    short: "SNT",
    color: GROUP_COLOR.community,
  },
  {
    key: "analysis",
    name: "Analis Pasar",
    role: "DEEP LOGIC · SINTESIS MULTI-ASET",
    avatar: "🧠",
    group: "analyst",
    short: "AI",
    color: GROUP_COLOR.analyst,
  },
];

// ════════════════════════════════════════════════════════════════════
//  Static "market pulse" demo data (v1 — decorative, not user posts).
// ════════════════════════════════════════════════════════════════════
export interface TickerTapeItem {
  t: string;
  p: string;
  chg: number;
  verdict: "VALID" | "HOAKS" | "CEK";
  cls: string;
}

export const TICKER_TAPE: TickerTapeItem[] = [
  { t: "IHSG", p: "7,425", chg: +0.42, verdict: "VALID", cls: "Saham" },
  { t: "BTC", p: "98,240", chg: -1.24, verdict: "HOAKS", cls: "Crypto" },
  { t: "BBCA", p: "10,275", chg: +0.72, verdict: "VALID", cls: "Saham" },
  { t: "XAU", p: "2,438", chg: +0.86, verdict: "CEK", cls: "Komoditas" },
  { t: "USDIDR", p: "16,180", chg: +0.18, verdict: "CEK", cls: "Forex" },
  { t: "ETH", p: "3,580", chg: -0.95, verdict: "HOAKS", cls: "Crypto" },
  { t: "DJIA", p: "41,820", chg: +0.21, verdict: "VALID", cls: "Saham" },
  { t: "GOTO", p: "67", chg: -2.9, verdict: "HOAKS", cls: "Saham" },
  { t: "FFR", p: "5.25%", chg: 0.0, verdict: "CEK", cls: "Makro" },
  { t: "BI7DRR", p: "5.75%", chg: 0.0, verdict: "VALID", cls: "Makro" },
  { t: "EURUSD", p: "1.0824", chg: -0.12, verdict: "CEK", cls: "Forex" },
  { t: "SOL", p: "142", chg: -3.45, verdict: "HOAKS", cls: "Crypto" },
  { t: "WTI", p: "78.32", chg: +1.12, verdict: "VALID", cls: "Komoditas" },
  { t: "ANTM", p: "2,150", chg: +1.42, verdict: "VALID", cls: "Saham" },
];

export interface WatchlistItem {
  t: string;
  cls: string;
  checks: number;
  valid: number;
  hoax: number;
}

export const WATCHLIST: WatchlistItem[] = [
  { t: "BTC", cls: "Crypto", checks: 412, valid: 84, hoax: 287 },
  { t: "GOTO", cls: "Saham", checks: 287, valid: 41, hoax: 198 },
  { t: "USDIDR", cls: "Forex", checks: 198, valid: 142, hoax: 26 },
  { t: "XAU", cls: "Komoditas", checks: 156, valid: 98, hoax: 32 },
  { t: "ETH", cls: "Crypto", checks: 248, valid: 62, hoax: 152 },
  { t: "BBCA", cls: "Saham", checks: 142, valid: 121, hoax: 8 },
  { t: "Fed Rate", cls: "Makro", checks: 124, valid: 78, hoax: 18 },
];

export const QUICK_INPUTS: { label: string; text: string }[] = [
  {
    label: "Cek pom-pom crypto",
    text: "Bitcoin dipastikan tembus $200,000 dalam 30 hari. Influencer X bilang masuk sekarang, ETF inflow gila!",
  },
  {
    label: "Validasi statement Fed",
    text: "Apakah Powell benar memberi sinyal cut 25bps di FOMC Juni 2026?",
  },
  {
    label: "Cek rumor dividen",
    text: "BBCA dikabarkan bagi dividen jumbo Rp 250/saham tahun buku 2025",
  },
  {
    label: "Cek investasi ilegal",
    text: "Robot trading PT Sukses Bersama menjanjikan profit 20% per minggu, sudah ribuan member untung",
  },
  {
    label: "Validasi target emas",
    text: "Emas akan tembus $3,500/oz akhir tahun, BRICS de-dolarisasi terus berlanjut",
  },
  {
    label: "Cek sinyal forex",
    text: "Channel VIP forex jamin profit 5% per hari, akurasi 95%, member sudah untung ratusan juta",
  },
];

export const MOOD_INDEX = {
  value: 58,
  label: "Greed",
  components: [
    { name: "Volatilitas global (VIX)", value: 52 },
    { name: "Momentum crypto", value: 64 },
    { name: "Volume hoaks 24j", value: 48 },
    { name: "Rasio bull/bear", value: 67 },
  ],
};

// ════════════════════════════════════════════════════════════════════
//  Helpers
// ════════════════════════════════════════════════════════════════════
export function fmtPct(n: number): string {
  return (n >= 0 ? "+" : "") + n.toFixed(2) + "%";
}

export const sentimentLabel = (s?: Sentiment | null) =>
  s === "bullish"
    ? "▲ Bullish"
    : s === "bearish"
    ? "▼ Bearish"
    : s === "neutral"
    ? "◆ Neutral"
    : "—";

export const sentimentColor = (s?: Sentiment | null) =>
  s === "bullish" ? "#6ee7b7" : s === "bearish" ? "#fca5a5" : "#fcd34d";

export const riskLabel = (r?: string | null) =>
  r === "low" ? "Rendah" : r === "medium" ? "Menengah" : r === "high" ? "Tinggi" : "—";
