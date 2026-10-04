# Handoff: NusaVerify v2 — Multi-Asset Investment Validation

## Overview

**NusaVerify v2** is a redesign of an AI-powered fact-verification web app, refocused from
politics/science into **multi-asset investment information validation**. Users submit a claim
(text, link, or image) — about stocks, crypto, forex, gold, macro/government statements, etc. —
and an AI agent orchestrates 7 sources to return a verdict (`Terverifikasi` / `Misinformasi` /
`Belum Terkonfirmasi`) with a confidence score, a live exploration trace, and an agent-by-agent
synthesis.

The original app code (Next.js 16 + React 19 + Tailwind v4 + Supabase) lives at
[VicoAritonang/nusaverify-web](https://github.com/VicoAritonang/nusaverify-web). This handoff
documents the **redesign** — what to build on top of (or in place of) that codebase.

UI language: **Indonesian**. Theme: **dark mode only**.

---

## About the Design Files

The files under `prototype/` are **design references created in HTML/JSX (React 18 via Babel
in-browser)**. They are not production code to copy verbatim.

**Your task is to recreate these designs in the existing NusaVerify codebase** — Next.js 16
App Router + React 19 + Tailwind v4 + Supabase — using its established patterns
(`"use client"` components, RSC for data fetching, server actions where applicable,
`@supabase/supabase-js` for data). Treat the prototype as the source of truth for visuals
and interaction; treat the existing repo as the source of truth for engineering patterns.

Where the prototype hard-codes data, the real implementation must:

- Fetch from Supabase (`post` and `think` tables).
- Poll the trace (per `original_context.md` §6.2) — `2s` while `exploring`, `5s` while `analyzing`, stop on `completed`.
- Submit via the existing `/api/analyze` route.

A schema change is required to support multi-asset claims (new columns on `post`, dynamic
sources for `think`). See `DATA_MODEL.md`.

---

## Fidelity

**High-fidelity.** All colors, typography, spacing, animations, and interactions in the
prototype are intentional and should be matched. Pixel-perfect when feasible.

The prototype is interactive: clicking a `PostCard` navigates to a detail page that runs
the full `exploring → analyzing → completed` state machine with dummy data.

---

## File Map

```
design_handoff_nusaverify/
├── README.md                      ← this file (overview, screens, components, behavior)
├── DESIGN_TOKENS.md               ← exhaustive token reference (colors, type, spacing, shadows)
├── STATE_MACHINE.md               ← detail-page state machine + animation timings
├── DATA_MODEL.md                  ← Supabase schema changes for multi-asset
├── COMPONENT_INVENTORY.md         ← every reusable component with props + visual rules
├── original_context.md            ← the original product brief
└── prototype/
    ├── NusaVerify.html            ← entry point (open this in a browser)
    ├── styles.css                 ← all CSS (animations, glassmorphism, cards, ticker tape)
    ├── data.jsx                   ← dummy data, asset classes, agents, sample trace
    ├── shared.jsx                 ← Logo, Sparkline, TickerChip, AssetClassChip, MoodMeter,
    │                                Watchlist, TickerTape, ConfidenceArc, PostCard, etc.
    ├── home.jsx                   ← HomePage (NavStrip, Hero, MarketPulse, InputForm, PostsGrid, Footer)
    ├── detail.jsx                 ← DetailPage (DetailTopBar, DetailHeader, ExplorationGraph,
    │                                AnalyzingBox, ResultBox)
    ├── app.jsx                    ← router + TweaksPanel wiring
    └── tweaks-panel.jsx           ← in-design tweak controls (motion / layout / typography)
```

---

## Screens

### 1. Home — `/`

**Purpose:** Landing + entry point. User submits a new claim. Galeri hasil verifikasi terbaru
displayed in 3 columns (or alternative layouts via Tweaks).

**Layout (top → bottom):**

| Block | Component | Height/Notes |
|---|---|---|
| Nav strip | `NavStrip` | 64px, logo + brand + version chip + status indicators |
| Ticker tape | `TickerTape` | 36px, infinite marquee, mixed-asset feed |
| Hero | `Hero` | ~280px centered, logo + gradient title + subtitle |
| Market pulse row | `MoodMeter` (1.2fr) + `Watchlist` (1fr) | grid, gap 14px |
| Input form | `InputForm` | max-width 820px, centered |
| Posts grid + filter | `PostsGrid` | 3 columns × cards (default), filter chips top-right |
| Footer | `Footer` | glass card, ~120px |

**Background:** dark `#05060d` base + `bg-grid` (50px grid lines @ 2% opacity) + radial top
glow (indigo 12% at top center) + 3 floating blurred orbs (`breathe`/`drift` anims).

Container: `max-width: 1440px`, horizontal padding `24px`.

---

### 2. Detail — `/[id]`

**Purpose:** Live trace of a single verification. Shows graph build-up → multi-agent chat →
final verdict.

**Layout (top → bottom, gap 18px):**

| Block | Component | Visible when |
|---|---|---|
| Top bar | `DetailTopBar` (back button + LIVE TRACE indicator + post ID) | always |
| Header card | `DetailHeader` (title, chips, claim quote, 3-step stepper) | always |
| Knowledge graph | `ExplorationGraph` (SVG, 920×620, builds nodes incrementally) | always (auto-minimizes when analyzing/completed) |
| Analyzing box | `AnalyzingBox` (7 agent chat bubbles, stagger reveal) | when `analyzing` or `completed` (auto-minimizes 2.2s after completed) |
| Result box | `ResultBox` (icon + confidence gauge + verdict label + summary + meta panel + disclaimer) | when `completed` |

---

## Component Inventory (overview — full specs in COMPONENT_INVENTORY.md)

**Brand & micro**
- `Logo` — gradient rounded square with embedded candlestick + check glyph, halo pulse.
- `TickerChip` — `$BBCA` pill. Optionally colored by asset class.
- `AssetClassChip` — pill with colored dot, labels: Saham, Crypto, Forex, Komoditas, Makro, Investasi Ilegal.
- `SectorChip` — `#Perbankan` neutral pill.
- `SentimentBadge` — ▲ Bullish (emerald) / ▼ Bearish (red) / ◆ Neutral (amber).
- `RiskMeter` — 3 stacked bars + label "RISIKO RENDAH/MENENGAH/TINGGI".
- `Sparkline` — 12-point SVG line + fill + end dot (24px tall default).
- `ConfidenceArc` — 270° arc gauge, animated stroke-dasharray.
- `CountUp` — eased number animation (1200ms).

**Market data**
- `TickerTape` — infinite marquee ticker. Each item: asset-class chip, ticker, price, %chg, verdict badge. 60s loop.
- `MoodMeter` — semicircle Fear/Greed gauge (0–100) with 5 color zones; live needle + label.
- `Watchlist` — 7-row list of most-verified instruments across asset classes, with valid/hoax split bar.

**Listing**
- `PostCard` — verdict-colored card. Top: icon + title. Chips row. Summary. Italic context quote. Footer: sparkline + relative time + mini confidence gauge + %.
- `PostsGrid` — three layout modes: `columns` (default, 3 verdict columns) / `timeline` / `heatmap` (grouped by asset class).
- `HeatmapView` — per asset class, grid of compact cells showing ticker + sparkline + confidence + freshness.

**Input**
- `InputForm` — heading + quick-input chips + textarea + instrument input + (optional) image dropzone + submit button + status indicator + disclaimer. Overlay during submit.

**Detail page**
- `DetailTopBar` — back + LIVE TRACE indicator with stateful color.
- `DetailHeader` — meta chips + h1 title + italic context quote + 3-step stepper.
- `Stepper` — Eksplorasi → Analisis Silang → Selesai (active=indigo glow, done=emerald).
- `ExplorationGraph` — SVG knowledge graph; builds Root → 7 source nodes → Score node. Floating particles, draw-edge anims, flow particles on edges, scan line.
- `AnalyzingBox` — chat bubbles per agent (avatar + name + role + message + source chip).
- `ResultBox` — verdict icon block + 140px confidence gauge with CountUp + summary + 7-cell meta panel + disclaimer.

**System**
- `TweaksPanel` — floating panel with: Motion (full/reduce/off), Posts layout (columns/timeline/heatmap), Type pairing (default/alt/editorial).

---

## Interactions & Behavior

### Navigation

| Trigger | Effect |
|---|---|
| Click `PostCard` | Navigate to `/${post.id}` |
| Submit `InputForm` (valid input) | 1.4s preparation overlay (spinner + shimmer) → `router.push('/${post_id}')` |
| Click "Kembali ke Beranda" | Navigate to `/` |
| Click `NavStrip` logo | Navigate to `/` |
| Filter chip click | Filters in-page posts (no nav) |
| Quick-input chip click | Sets textarea to chip's example text |

### Detail page state machine

```
mount → exploring (~5.5s) → analyzing (~7.5s) → completed
```

Timings in the prototype (use these as defaults; real app should follow polling response):

- `exploring` step: reveals 1 node every 550ms × 8 nodes (root + 7 sources) ≈ 4.4s, then 800ms pause.
- `analyzing` step: each chat bubble reveals 900ms after the previous × 7 agents ≈ 6.3s, then 1.2s pause.
- `completed`: AnalyzingBox stays expanded 2.2s, then auto-minimizes.

Graph and analyzing box can both be manually minimized/restored by click after first appearance.

Full timing diagram in `STATE_MACHINE.md`.

### Form validation

- `canSubmit = context.trim().length > 0` (image optional in the original — visual affordance only in prototype).
- `charLimit = 2000`; counter turns amber `#fcd34d` past 90%.
- Image: `.startsWith("image/")` MIME check, ≤10MB. Shows preview thumbnail + filename, with delete button.

### Hover / active states

- `PostCard:hover` → `translateY(-4px)` + color-tinted shadow (emerald / red / amber 28px glow).
- `qchip:hover` → background `rgba(99,102,241,.1)`, text `#c7d2fe`.
- `watchlist-item:hover` → background `rgba(99,102,241,.06)`.
- `btn-primary:hover` → `filter: brightness(1.1)` + `0 8px 24px rgba(99,102,241,.4)`.
- `btn-primary:active` → `scale(.98)`.
- `heatmap-cell:hover` → `scale(1.04)` + `box-shadow: 0 6px 20px rgba(0,0,0,.4)`.

### Motion control

Set `document.documentElement.dataset.motion` to one of:

- `"full"` (default) — all animations.
- `"reduce"` — animation-duration `.001s`, transition-duration `.05s`.
- `"off"` — all animations & transitions disabled.

CSS rules in `styles.css` already implement this (`[data-motion="reduce"] *`, etc.). Map to
`prefers-reduced-motion` for accessibility.

---

## Tweaks (in-design controls)

In the prototype, a floating "Tweaks" panel offers:

1. **Motion**: full / reduce / off — applied via `<html data-motion="…">`.
2. **Posts grid layout**: columns / timeline / heatmap.
3. **Type pairing**: default (Inter + JetBrains Mono) / alt (Geist + Geist Mono) / editorial (Instrument Serif + IBM Plex Mono).

These are design-exploration affordances. In the real product, decide whether to keep them
as user-facing settings or drop them. The "Motion" toggle is genuinely useful as a
preference; the other two are exploration-only.

---

## Data Model Changes Required

The original `post` table has `result`, `confidence`, `category`, etc. For multi-asset, **add
these columns** (matching the prototype):

| Column | Type | Notes |
|---|---|---|
| `asset_class` | text | `"Saham" \| "Crypto" \| "Forex" \| "Komoditas" \| "Makro" \| "Reksa Dana" \| "Investasi Ilegal"` |
| `ticker` | text \| null | e.g., `"BBCA"`, `"BTC"`, `"XAU/USD"`, `"FFR"`, `"USDIDR"` |
| `sector` | text \| null | sub-category (Perbankan, DeFi, Bitcoin, Suku Bunga AS, etc.) |
| `sentiment` | text \| null | `"bullish" \| "bearish" \| "neutral"` |
| `price_impact` | text \| null | free-text estimate |
| `claim_type` | text | one of: rumor, corporate-action, pump-and-dump, investasi-ilegal, sinyal-trading, berita-resmi, pom-pom, kebijakan-moneter, geopolitik |
| `risk_level` | text \| null | `"low" \| "medium" \| "high"` |

Verdict label semantics (display-only — DB value unchanged):
- `valid` → "Terverifikasi"
- `hoax` → "Misinformasi / Hoaks"
- `uncertain` → "Belum Terkonfirmasi"

For `think`, refactor the hard-coded `official_*`, `cnbc_*`, etc. columns to a dynamic
sources schema. See `DATA_MODEL.md`.

---

## Agents (replaces the original 6-agent set)

| Key | Avatar | Group | Role |
|---|---|---|---|
| `exchange` | 🏛️ | regulator | BEI / Exchange Data — IDX + global exchanges |
| `regulator` | ⚖️ | regulator | OJK / Bappebti — Satgas PASTI, crypto licensing |
| `centralbank` | 🏦 | regulator | Bank Sentral — BI, Fed, ECB statements |
| `wire` | 📡 | media | Bloomberg / Reuters — global news wire |
| `media_id` | 📰 | media | Media Finansial ID — CNBC, Kontan, Bisnis, Investor.id |
| `sentimen` | 💬 | community | Sentimen Komunitas — Stockbit, crypto Twitter, Telegram |
| `analis` | 🧠 | analyst | Analis Pasar — multi-asset synthesis |

Each agent maps to a node group in the knowledge graph (color-coded) and a chat bubble class
in AnalyzingBox.

---

## Design Tokens (summary — full table in DESIGN_TOKENS.md)

**Colors — verdict semantics (DON'T REMAP):**

| Token | Hex | Meaning |
|---|---|---|
| `--bull` | `#10b981` / `#34d399` | Bullish / Valid / Up |
| `--bear` | `#ef4444` / `#f87171` | Bearish / Hoax / Down |
| `--neu` | `#f59e0b` / `#fcd34d` | Neutral / Uncertain / Sideways |

**Brand:**

| Token | Hex |
|---|---|
| Indigo | `#6366f1` |
| Violet | `#8b5cf6` |
| Cyan | `#22d3ee` |

**Asset class colors (for chips):**

| Class | Hex |
|---|---|
| Saham | `#a5b4fc` |
| Crypto | `#fb923c` |
| Forex | `#22d3ee` |
| Komoditas | `#fcd34d` |
| Makro | `#c4b5fd` |
| Reksa Dana | `#86efac` |
| Investasi Ilegal | `#f87171` |

**Surfaces:**

| Layer | Background |
|---|---|
| Page | `#05060d` → `#0a0c18` |
| Glass | `rgba(255,255,255,.035)` + `backdrop-filter: blur(20px)` + 1px white 7% border |
| Glass elevated | `rgba(14,16,28,.65)` + blur(24px) + 1px white 8% border + shadow `0 8px 32px rgba(0,0,0,.5)` |

**Type:**

- Display + UI: `Inter` (400/500/600/700/800/900). Heading display: `font-weight: 800`, `letter-spacing: -.025em`, `line-height: 1.05`.
- Mono: `JetBrains Mono` (400/500/600/700). Used for ALL numbers, codes, tickers, prices, percentages, technical labels.
- Tabular numbers: `font-feature-settings: "tnum", "zero"`.

**Radius scale:** 6 (chips), 10 (buttons, small elements), 12 (inputs, dropzones), 14 (column headers), 16 (post cards), 18 (input shell, watchlist), 22 (detail header), 24 (analyzing box), 28 (result box).

**Spacing:** prototype uses ad-hoc values — convert to Tailwind `gap-2 .. gap-6` and `p-3 .. p-12`. Common: 6/8/10/12/14/16/18/22/24/26/36/48px.

---

## Animations (full keyframes in `prototype/styles.css`)

| Name | Duration | Easing | Use |
|---|---|---|---|
| `fadeInUp` / `fadeInDown` | 0.55s / 0.45s | `cubic-bezier(.16,1,.3,1)` / `ease-out` | Entrance for cards, sections |
| `slideInLeft` / `slideInRight` | 0.55s | `cubic-bezier(.16,1,.3,1)` | Column entrance |
| `cardEntrance` | 0.55s | `cubic-bezier(.16,1,.3,1)` | PostCard reveal (with `stagger-children` 0.05s steps) |
| `marquee` | 60s | linear infinite | Ticker tape (translate -50%) |
| `shimmer` | 2.5s | linear infinite | Loading bar |
| `breathe` | 4s | ease-in-out infinite | Background orbs, blob halos, dot status |
| `drift` | 12s | ease-in-out infinite | Far background orb (translate +20/-15) |
| `pulseGlow` | 2.5s | ease-in-out infinite | Logo / icon halo opacity |
| `gradientShift` | 6s | ease infinite | Animated text gradient (NusaVerify wordmark) |
| `nodePop` | 0.7s | `cubic-bezier(.175,.885,.32,1.275)` | Graph node appearance |
| `drawEdge` | 1.4–1.6s | `cubic-bezier(.16,1,.3,1)` or ease | SVG path reveal via stroke-dashoffset |
| `flow` | 1.2s | linear infinite | Dotted particles flowing along graph edges |
| `auraPulse` | 3.5s | ease-in-out infinite | Score node glow scale |
| `blink` | 1.5s | ease-in-out infinite | Status dots |
| `hudScan` | 4s | ease-in-out infinite | Horizontal scan line on graph |
| `priceFlip` | — | — | (reserved for live price ticks) |

`stagger-children > *:nth-child(N)` adds incremental `animation-delay: (N × 0.05)s` up to N=10.

---

## Implementation Mapping (Next.js 16 + Tailwind v4)

### Tailwind theme

Migrate the CSS variables in `styles.css` to `tailwind.config.ts` (or Tailwind v4 `@theme` block).

```ts
// tailwind.config.ts (or @theme in globals.css for v4)
theme: {
  extend: {
    colors: {
      bg: { DEFAULT: "#05060d", 2: "#0a0c18" },
      bull: { DEFAULT: "#10b981", light: "#34d399" },
      bear: { DEFAULT: "#ef4444", light: "#f87171" },
      neu:  { DEFAULT: "#f59e0b", light: "#fcd34d" },
      brand: { indigo: "#6366f1", violet: "#8b5cf6", cyan: "#22d3ee" },
      asset: {
        saham: "#a5b4fc", crypto: "#fb923c", forex: "#22d3ee",
        komoditas: "#fcd34d", makro: "#c4b5fd", reksadana: "#86efac",
        ilegal: "#f87171",
      },
    },
    fontFamily: {
      sans: ["Inter", "system-ui", "sans-serif"],
      mono: ["JetBrains Mono", "ui-monospace", "monospace"],
    },
    borderRadius: { /* 6, 10, 12, 14, 16, 18, 22, 24, 28 */ },
    keyframes: { /* fadeInUp, marquee, breathe, drift, nodePop, drawEdge, ... */ },
    animation: { /* shorthand classes */ },
  },
}
```

### Page structure

```
app/
├── page.tsx                    ← HomePage (RSC: fetches POSTS via getPosts())
├── [id]/page.tsx               ← DetailPage shell (RSC), renders <AnalysisDetail id={id} />
├── [id]/AnalysisDetail.tsx     ← "use client", polling, state machine, renders sub-components
├── components/
│   ├── NavStrip.tsx
│   ├── TickerTape.tsx          ← "use client" (CSS animation only, can be RSC)
│   ├── Hero.tsx
│   ├── MoodMeter.tsx
│   ├── Watchlist.tsx
│   ├── InputForm.tsx           ← "use client"
│   ├── PostsGrid.tsx           ← "use client" (filter state)
│   ├── PostCard.tsx
│   ├── HeatmapView.tsx
│   ├── chips/
│   │   ├── TickerChip.tsx
│   │   ├── AssetClassChip.tsx
│   │   ├── SectorChip.tsx
│   │   ├── SentimentBadge.tsx
│   │   └── RiskMeter.tsx
│   ├── viz/
│   │   ├── Sparkline.tsx
│   │   ├── ConfidenceArc.tsx
│   │   └── CountUp.tsx          ← "use client" (rAF)
│   └── Logo.tsx
├── [id]/
│   ├── DetailTopBar.tsx
│   ├── DetailHeader.tsx
│   ├── Stepper.tsx
│   ├── ExplorationGraph.tsx    ← "use client" (SVG anims, manual minimize)
│   ├── AnalyzingBox.tsx        ← "use client" (stagger reveal via useEffect)
│   └── ResultBox.tsx
└── api/analyze/route.ts         ← unchanged (per original_context.md §7.7)
```

### Component-to-prototype mapping

For every component listed in `COMPONENT_INVENTORY.md`, the prototype file containing
the canonical implementation is named. Read those, port to your framework, but keep:

1. Class names, animations, and exact pixel measurements.
2. The verdict color → meaning mapping (never swap).
3. Indonesian copy verbatim.

---

## Assets

| Asset | Source | Notes |
|---|---|---|
| Logo | Rendered as inline SVG in `Logo` component | Replace with the existing `/public/logo.png` if preferred — see original prototype's Logo for the gradient surround |
| Analyzing GIF | `public/assets/analyzing.gif` (original repo) | Optional decoration in AnalyzingBox |
| Fonts | Google Fonts | Already linked in `prototype/NusaVerify.html` `<head>` — port via `next/font` |

The prototype uses no other binary assets — everything is CSS/SVG.

---

## What NOT to change

- **Verdict color semantics** (emerald = valid/bull, red = hoax/bear, amber = uncertain/neutral). This is the product's primary visual language.
- **Indonesian copy** — keep it verbatim. Tech terms (bullish, bearish, claim, etc.) can stay English.
- **Disclaimer placement** — every page that displays a verdict or invites investment action shows "bukan nasihat investasi". OJK compliance.
- **Brand: NusaVerify** — wordmark style is the gradient-shift on `linear-gradient(90deg, #fff, #c7d2fe 40%, #a5f3fc 70%, #fff)`.

---

## Open questions / decisions for the developer

1. **Live prices in TickerTape & Watchlist** — prototype uses static data. Hook to a real market data feed (e.g. IDX API, CoinGecko, Yahoo Finance) or keep static for v1?
2. **MoodMeter** — recompute periodically from a backend signal or static for v1?
3. **Heatmap & Timeline layouts** — keep all 3 layouts in production, or ship `columns` only and treat the other two as exploration?
4. **Image upload** — the original repo already supports image input (base64). Wire the InputForm image dropzone to the existing `/api/analyze` flow.
5. **Force-directed vs static graph** — the original repo uses `react-force-graph-2d`. The prototype uses a static SVG layout with manual coordinates for clarity. Either is fine; pick based on physics-vs-stability preference.

---

## Build order suggestion

1. Tokens (Tailwind theme + CSS variables + Google Fonts via `next/font`).
2. Atoms: `Logo`, `Sparkline`, `ConfidenceArc`, all chips, `RiskMeter`, `CountUp`.
3. Lists: `PostCard`, `PostsGrid` (`columns` layout first).
4. Hero & market: `NavStrip`, `Hero`, `TickerTape`, `MoodMeter`, `Watchlist`.
5. Input flow: `InputForm` + submit overlay → wire to `/api/analyze`.
6. Detail shell: `DetailTopBar`, `DetailHeader`, `Stepper`.
7. Detail state machine: `ExplorationGraph` (SVG node reveal) → `AnalyzingBox` (chat stagger) → `ResultBox` (gauge + meta panel). Wire Supabase polling per `AnalysisDetail.tsx` in original repo.
8. Schema migration (`DATA_MODEL.md`) — coordinate with backend.
9. Polish: `Heatmap` + `Timeline` layouts, `TweaksPanel` (optional), motion preference toggle, copywriting QA, disclaimer audit.

---

Questions? The prototype is fully interactive — open `prototype/NusaVerify.html` in a
browser and explore. Click any card, change the layout via Tweaks, watch the state machine
run on the detail page.
