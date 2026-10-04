# Component Inventory — NusaVerify v2

For each component: **purpose, props, anatomy, exact measurements, states, where it
appears in the prototype**. Read alongside the JSX source in `prototype/`.

---

## 1. `Logo`

**File:** `shared.jsx`
**Purpose:** Brand identity glyph. Used in NavStrip (36px), Hero (64px), Footer (24px).

**Anatomy:**
- Rounded-square gradient surround: `linear-gradient(135deg, #6366f1 0%, #8b5cf6 50%, #22d3ee 100%)`.
- White inline SVG glyph at center: two candlestick bars + a checkmark.
- Halo: `linear-gradient(135deg, rgba(99,102,241,.35), rgba(139,92,246,.35))`, `blur(14px)`, `breathe` anim.

**Props:** `size` (default 36).

---

## 2. `TickerChip`

**File:** `shared.jsx`
**Purpose:** Display an instrument identifier like `$BBCA`, `$BTC`, `$XAU/USD`.

**Anatomy:** Pill, mono font, `$` prefix at 50% opacity. Optional asset-class tinting.

**Props:** `ticker: string`, `assetClass?: string`, `className?: string`.

**Style:**
- Default: `background: rgba(99,102,241,.13)`, `border: 1px solid rgba(99,102,241,.3)`, color `#c7d2fe`.
- When `assetClass` given: background `${c}1f`, border `1px solid ${c}50`, color `${c}` (where `c` = asset class hex).
- Font: JetBrains Mono 700, 11px, letter-spacing `.04em`.

---

## 3. `AssetClassChip`

**File:** `shared.jsx`
**Purpose:** Mark posts and headers with asset class (Saham/Crypto/Forex/Komoditas/Makro/Reksa Dana/Investasi Ilegal).

**Anatomy:** Pill with a 6×6px solid square dot (with `0 0 6px ${c}99` glow) + uppercase label.

**Props:** `assetClass: string`.

**Style:** `background: ${c}18`, `border: 1px solid ${c}40`, color `${c}`. Font 9.5px, letter-spacing `.1em`, uppercase.

---

## 4. `SectorChip`

**File:** `shared.jsx`
**Purpose:** Sub-category indicator (`#Perbankan`, `#Bitcoin`, `#Suku Bunga AS`).

**Style:** `background: rgba(255,255,255,.05)`, `border: 1px solid rgba(255,255,255,.1)`, color `rgba(255,255,255,.55)`. No uppercase.

---

## 5. `SentimentBadge`

**File:** `shared.jsx`
**Purpose:** Bull/Bear/Neutral indicator with arrow.

**Props:** `sentiment: "bullish" | "bearish" | "neutral"`, `withLabel: boolean` (default true).

**Variants:**
- `bullish`: ▲ + "BULLISH" — emerald (`#6ee7b7` text on emerald `13%` bg, `30%` border).
- `bearish`: ▼ + "BEARISH" — red (`#fca5a5` / red 13%, 30%).
- `neutral`: ◆ + "NEUTRAL" — amber (`#fcd34d` / amber 13%, 30%).

When `withLabel=false`, shows arrow only (used in PostCard to save space).

---

## 6. `RiskMeter`

**File:** `shared.jsx`
**Purpose:** Investor-facing risk indicator.

**Props:** `level: "low" | "medium" | "high"`.

**Anatomy:** Chip pill with **3 vertical bars** (3px wide, heights 5/8/11 px) before the label. Filled bars = current level, dim bars = unfilled.

**Labels:** "RISIKO RENDAH" (low) / "RISIKO MENENGAH" (medium) / "RISIKO TINGGI" (high).

---

## 7. `Sparkline`

**File:** `shared.jsx`
**Purpose:** Tiny line chart in PostCard footer, Watchlist alternative, Heatmap cell.

**Props:** `points: number[]`, `color: string`, `width: number`, `height: number`, `fill?: boolean` (default true).

**Anatomy:**
- `<path class="line">` stroke = color, width 1.6, rounded caps.
- `<path class="fill">` semi-transparent fill (opacity .18).
- `<circle>` end dot, radius 1.8.

Y-axis auto-normalized to point range. 12 points by default. No labels.

---

## 8. `ConfidenceArc`

**File:** `shared.jsx`
**Purpose:** Mini 270° arc gauge in PostCard footer.

**Props:** `value: number` (-100..100, abs taken), `color: string`, `size: number` (default 32).

**Anatomy:** Two stacked `<circle>` elements with `strokeDasharray` cropped to 270° (top-opening). Background circle = `rgba(255,255,255,.08)`. Foreground = `color`, animated via stroke-dasharray transition `1.5s cubic-bezier(.16,1,.3,1)`.

---

## 9. `CountUp`

**File:** `shared.jsx`
**Purpose:** Eased number animation for confidence values.

**Props:** `to: number`, `duration: number` (default 1200), `decimals: number` (default 0), `suffix: string`.

**Behavior:** `requestAnimationFrame` from 0 → `to` over `duration` ms, `easeOutCubic`.

---

## 10. `TickerTape`

**File:** `shared.jsx`
**Purpose:** Infinite horizontal scrolling market feed below NavStrip.

**Anatomy:**
- Outer: `display: flex`, 1px top + bottom border `rgba(255,255,255,.06)`, subtle vertical gradient.
- Track: doubled items, `animation: marquee 60s linear infinite` (translate 0 → -50%).
- Each item: 36px tall, gap 8px, right-border `rgba(255,255,255,.04)`, padding `0 18px`.
  1. Asset class mini-chip (color-coded, 3-letter abbreviation).
  2. Ticker symbol (mono 700, 11px).
  3. Price (mono, 50% white).
  4. % change (mono, ▲/▼/◆ + value, colored by sign).
  5. Verdict badge (✓ VALID / ✕ HOAKS / ? CEK, pill with semantic color).

**Data:** `window.TICKER_TAPE` array in `data.jsx`.

---

## 11. `MoodMeter`

**File:** `shared.jsx`
**Purpose:** Market Fear/Greed semicircle gauge in homepage hero row.

**Anatomy:**
- `glass-elev` card with `corner-marks`, border-radius 18.
- Left: 160×92 SVG semicircle gauge.
  - 5 color zones: Extreme Fear (red 0-25), Fear (amber 25-45), Neutral (gray 45-55), Greed (emerald 55-75), Extreme Greed (emerald-light 75-100). Each `strokeWidth=8`, opacity 0.55.
  - Needle: 2px white line from center to point on arc, 4px white dot at pivot, 5px colored dot at tip.
  - Transition: `all 1.2s cubic-bezier(.16,1,.3,1)`.
- Right: label "Market Mood · Indeks Fear/Greed", big value with `CountUp`, segment label, sub-line "Sentimen lintas-aset global · diperbarui <1 menit lalu".

**Data:** `window.MOOD_INDEX` (`{ value, label, components }`).

---

## 12. `Watchlist`

**File:** `shared.jsx`
**Purpose:** Top instruments most-checked in 24h, with valid/hoax ratio.

**Anatomy:**
- `glass-elev` card with `corner-marks`, padding 14.
- Header: label "Most-Verified · Lintas-Aset · 24j" + "TOP 7".
- Rows (7):
  - 4×16px asset-class color bar + glow.
  - `chip-ticker` pill.
  - 3-letter uppercase asset class.
  - Check count.
  - Mini split bar (50×5): emerald = valid %, red = hoax %.
  - Percentage value (color = danger if hoax > 50%).

**Props:** `onTickerClick?: (ticker) => void`.
**Data:** `window.WATCHLIST`.

---

## 13. `PostCard`

**File:** `shared.jsx`
**Purpose:** Verdict-styled card in posts grid.

**Anatomy:**
1. Verdict-tinted radial+linear gradient background (see DESIGN_TOKENS.md "Card surfaces").
2. Hoax tape overlay (only if `result === "hoax"`).
3. 1px gradient top "glow" hairline.
4. Inner padding 16/18px.
5. Top row: 32×32 verdict icon badge + 2-line clamped title.
6. Chips row: verdict pill + `AssetClassChip` + `TickerChip` (asset-tinted) + `SentimentBadge` (icon-only) + `SectorChip`.
7. Summary text — 2-line clamp, 12px.
8. Italic context quote with 2px verdict-gradient left bar — 2-line clamp.
9. Footer: left = `Sparkline` (64×20) + relative time; right = `ConfidenceArc` (28px) + percentage (mono 800).

**Props:** `post: Post`, `index: number` (used to stagger entrance animation), `onClick: (post) => void`.

**Hover:** `translateY(-4px)`, color-tinted shadow (28px glow). Cursor pointer. Border color brightens.

---

## 14. `PostsGrid`

**File:** `home.jsx`
**Purpose:** Posts container with layout switcher + asset-class filter.

**Anatomy:**
- Header row: section title + count, asset-class filter chips (colored per class when active).
- Body: one of three layouts (controlled by `layout` prop):

#### Layout A: `columns` (default)
- CSS grid 3 columns, gap 18.
- Each column: column header ("Terverifikasi" / "Misinformasi" / "Belum Pasti", color-coded) + count + stacked `PostCard`s with `stagger-children`.
- Empty state per column: dashed-border, centered "Tidak ada hasil".

#### Layout B: `timeline`
- Single column. Each post wrapped in `.timeline-item` with a 14×14 colored dot on a 1px vertical guideline.
- Above each card: relative time + verdict label (colored).

#### Layout C: `heatmap`
- One section per asset class (rendered via `HeatmapView`).
- Inside: CSS grid `repeat(auto-fill, minmax(140px, 1fr))`, gap 8.
- Each cell (`.heatmap-cell`): ticker (mono 800) + verdict glyph; small `Sparkline`; mono confidence + freshness label.

**Filter:** asset class chips at top — selecting one filters `posts.filter(p => p.assetClass === filter)`.

**Props:** `posts: Post[]`, `onCardClick: (post) => void`, `layout: "columns" | "timeline" | "heatmap"`.

---

## 15. `NavStrip`

**File:** `home.jsx`
**Purpose:** Top nav row.

**Anatomy:**
- Left: clickable `Logo` (36px) + brand stack (wordmark "NusaVerify" with `Verify` in indigo light + `v2.0 · MULTI-ASSET` chip + sub-label "AI Investment Intelligence · Saham · Crypto · Forex · Makro").
- Right: status group: emerald blinking dot + "AI Core Online", and mono uppercase "7 SUMBER · 2,841 KLAIM HARI INI".

Height: ~64px. No bottom border (separated from ticker tape by adjacency).

---

## 16. `Hero`

**File:** `home.jsx`
**Purpose:** Centered marketing block.

**Anatomy (top → bottom, centered):**
- `Logo` 64px.
- Status pill chip: "AI INVESTMENT INTELLIGENCE · MULTI-ASSET VALIDATION" with leading blinking dot.
- Wordmark `<h1>`: `NusaVerify`, gradient `linear-gradient(90deg, #fff 0%, #c7d2fe 40%, #a5f3fc 70%, #fff 100%)` with `gradient-shift` anim (6s). Size `clamp(40px, 6vw, 68px)`.
- Subtitle paragraph, max-width 620, color 50% white, 14px, line-height 1.6. Bold accent on "klaim investasi lintas-aset".

---

## 17. `MarketPulse`

**File:** `home.jsx`
**Purpose:** Wrapper for the MoodMeter + Watchlist row.

**Layout:** CSS grid `minmax(340px,1.2fr) minmax(380px,1fr)`, gap 14. Stacks on narrow viewports — left card dictates min-width 340.

---

## 18. `InputForm`

**File:** `home.jsx`
**Purpose:** Primary CTA — submit a claim.

**Anatomy:**
- `.input-shell` glass card, border-radius 18, padding 24.
- Header: 38×38 indigo→violet gradient icon block (shield+check), animated ping ring; title "Validasi Informasi Investasi" + subtitle "Saham · Crypto · Forex · Emas · Makro — tempel klaim, link, atau screenshot.".
- Quick-input chips row: label "CONTOH:" + 6 chips with example texts. Click sets the textarea to that text.
- Textarea: `.field` style, 4 rows, 14px, character counter (mono, amber past 90%).
- Instrument input row: label "INSTRUMEN (OPSIONAL)" + 110px mono input (uppercase, indigo-tinted, capped to 8 chars).
- Image upload affordance: dashed border row with image icon + "Lampirkan gambar (opsional)" + sub-hint.
- Submit button (full-width-ish): "Analisis Sekarang" + ⏎ hint chip. Brand gradient.
- Status: "AI Online" + "7 sumber aktif" on the right.
- Disclaimer banner below: "**Disclaimer:** NusaVerify memvalidasi informasi, **bukan** memberi rekomendasi jual/beli. Bukan nasihat investasi."

**Submit overlay (during `isSubmitting`):**
- Absolute overlay covering the shell, `rgba(12,14,26,.96)` + `blur(12px)`.
- Triple spinner (3 nested rings, different speeds + directions).
- Center: 28×28 indigo→violet rounded square with `breathe`.
- Heading: "Menghubungkan ke AI Core".
- Sub-text: "Memuat agen IDX, OJK, dan kanal finansial — neural network siap menelusuri klaim Anda."
- Shimmer bar: 200×2, gradient `transparent → #6366f1 → #34d399 → transparent`.

**Props:** `onSubmit: ({ context, ticker }) => void`, `prefill?: string`.

---

## 19. `Footer`

**File:** `home.jsx`
**Purpose:** Bottom-of-page meta.

**Anatomy:** Centered glass card, max-width 540, 16px radius, 16/22 padding. Logo 24px + wordmark inline + 2 sub-lines (engine description + © year + disclaimer).

---

## 20. `DetailTopBar`

**File:** `detail.jsx`
**Purpose:** Detail page header bar.

**Anatomy:** flex space-between.
- Left: ghost button "Kembali ke Beranda" with chevron-left icon.
- Right: status group — dot (blinking unless completed) + mono uppercase "LIVE TRACE · {state}" (indigo while running, emerald when completed), and an "ID·…" chip.

**Props:** `onBack: () => void`, `state: string`, `postId: string`.

---

## 21. `DetailHeader`

**File:** `detail.jsx`
**Purpose:** Show the claim under verification.

**Anatomy:** `glass-elev` + `corner-marks`, border-radius 22, padding 26. Subtle verdict-colored radial glow top-right.
- Meta chips row (wraps): VERIFICATION TRACE chip, AssetClassChip, TickerChip (asset-tinted), SectorChip, SentimentBadge, RiskMeter, claim-type chip.
- Title `<h1>` — clamp(22, 2.6vw, 30), weight 800, tracking -.015em.
- Italic context quote with 2px verdict-tinted left border.
- `Stepper`.

---

## 22. `Stepper`

**File:** `detail.jsx`
**Purpose:** Phase indicator for the verification flow.

**3 steps:** Eksplorasi → Analisis Silang → Selesai.

**States per step:**
- `inactive`: bg `rgba(255,255,255,.02)`, border 1px white 10%, color 40% white.
- `active`: bg `rgba(99,102,241,.15)`, border `rgba(99,102,241,.4)`, color `#c7d2fe`, `0 0 18px rgba(99,102,241,.25)` glow; dot has `blink` anim.
- `done`: bg `rgba(16,185,129,.12)`, border `rgba(16,185,129,.35)`, color `#6ee7b7`. Label prefixed with ✓.

**Bars between steps:** 24px wide, 1px tall. Becomes emerald gradient when previous step done.

---

## 23. `ExplorationGraph`

**File:** `detail.jsx`
**Purpose:** SVG knowledge graph that builds up during the `exploring` phase.

**Canvas:** `viewBox="0 0 920 620"`, height responsive (`width:100%`, `height:560`).

**Layout:** Root at center (`0,0` relative), 7 source nodes around it, score node at bottom.
Coordinates from `SAMPLE_TRACE.graph` in `data.jsx`:

| Key | Relative position | Color |
|---|---|---|
| root | (0, 0) | indigo `#6366f1` |
| exchange | (-290, -160) | cyan `#22d3ee` |
| regulator | (-290, 50) | cyan |
| centralbank | (-130, -260) | cyan |
| wire | (130, -260) | indigo light `#818cf8` |
| media_id | (290, -160) | indigo light |
| sentimen | (290, 50) | amber `#fcd34d` |
| analis | (0, 220) | violet light `#c4b5fd` |
| score | (0, 380) | verdict-derived |

**Build animation:** reveal one node every 550ms. Edges from root → source draw via stroke-dashoffset (1.4s, `cubic-bezier(.16,1,.3,1)`). After exploring complete, edges from each source → score draw (1.6s ease-out).

**Visual elements:**
- Root: 220×60 rounded rect, indigo border, "◆ ROOT NODE" mono label + claim title.
- Sources: 116×44 rounded rect, kind-colored border, "◈ {KIND}" mono + label.
- Score: radial glow circle (80r) + solid circle (46r, dark fill + verdict-color border) + verdict % text + verdict word.
- Edge particles: dashed line, animated via `flow` (stroke-dashoffset -30/loop).
- Background: 28 small particles (2×2 white 40%), `breathe` anim, randomized delay.
- 1px horizontal scan line at top, `hudScan` 4s infinite.

**HUD:**
- Top-left: "BUILDING KNOWLEDGE GRAPH" chip + node count "X/8 nodes".
- Top-right (when not exploring): "Tutup canvas" button.
- Bottom-left: LEGEND (6 entries with color squares).
- Bottom-right: "scroll · drag · klik node" hint (mono, ghost).

**Minimize state:** when collapsed, shows a single-line clickable banner "+ Lihat Knowledge Graph (7 sumber lintas-aset telah dieksplorasi)" — restores graph on click.

**Props:** `trace: SAMPLE_TRACE`, `state: string`, `exploreProgress: number` (0..1).

---

## 24. `AnalyzingBox`

**File:** `detail.jsx`
**Purpose:** Show the 7 AI agents' insights as a chat thread.

**Anatomy:** `glass-elev` + `corner-marks`, border-radius 24, padding `28px 32px`.
- Background subtle indigo glow top-right.
- Header chip: "CROSS-ANALYZING . . ." (with 3 blinking dots, indigo) while running, "✓ ANALISIS SELESAI" (emerald) when completed. "Minimize" button appears when completed.
- Body: stacked chat bubbles (max-width 900, centered). Each bubble:
  - 42×42 emoji avatar in dark rounded square, colored border per group.
  - Meta line: agent name (bold) + role (mono 10px, 32% opacity).
  - Bubble body: gradient bg per group, rounded 18 with `bl=4` (chat tail), 13px text.
  - Source chip below: "↗ source · {short}" mono, dark pill.

**Bubble groups:**
- `regulator` (cyan tint).
- `media` (indigo tint).
- `community` (amber tint).
- `analyst` (violet tint).

**Reveal animation:** bubbles appear one every 900ms via `fade-in-up` with index-based delay.

**Minimize state:** single-line banner "+ Lihat Riwayat Chat AI (7 agen lintas-aset telah berkontribusi)". Auto-minimizes 2.2s after `completed`.

---

## 25. `ResultBox`

**File:** `detail.jsx`
**Purpose:** Final verdict.

**Shell:** `.result-shell` border-radius 28, padding 48, verdict-tinted gradient bg, verdict-tinted border. Hoax adds the diagonal tape pattern at 15% opacity.

**Layout:** CSS grid `auto 1fr`, gap 36.

**Left column:**
- 80×80 verdict icon block (rounded 22, dark bg, verdict-colored border + 30px glow), icon font-size 32 weight 800.
- 140×140 confidence gauge (same arc geometry as ConfidenceArc but bigger): bg track + colored arc, both 8px stroke, 270° track. Center label: huge mono `CountUp` % + "CONFIDENCE" label.

**Right column:**
- Verdict pill (uppercase): "VERDICT · TERVERIFIKASI" / "VERDICT · MISINFORMASI / HOAKS" / "VERDICT · BELUM TERKONFIRMASI" — verdict-colored, leading blinking dot.
- `<h2>` "Kesimpulan Analisis" (24px weight 800 tracking -.015em).
- Summary paragraph (78% white, 15px, line-height 1.65).
- **Meta panel** — 7-cell grid (`auto-fit minmax(150px, 1fr)`), gap 10, padding 14, radius 14, dark bg + 6% white border. Cells: Kelas Aset, Instrumen ($BBCA), Sektor / Sub, Sentimen (▲/▼/◆), Risiko, Tipe Klaim, Dampak Harga.
- Disclaimer banner at bottom (amber): "Hasil verifikasi adalah **validasi informasi**, bukan rekomendasi jual/beli. Selalu lakukan analisis mandiri."

**Props:** `post: Post`.

---

## 26. `TweaksPanel` (optional in production)

**File:** `tweaks-panel.jsx`
**Purpose:** Floating in-design control panel — exposes Motion, Layout, Type tweaks.

**Three controls:**
- Motion: radio `full | reduce | off`.
- Posts grid: radio `columns | timeline | heatmap`.
- Type pairing: select `default | alt | editorial`.

**Persistence:** values stored in a JSON block within the source HTML (handled by the
in-design `useTweaks` hook). For production, decide whether to persist a "Motion" preference
in `localStorage` (recommended; respect `prefers-reduced-motion`) and drop the others.

---

## Layout cheat-sheet

| Block | Default measurements |
|---|---|
| Page container | `max-width: 1440px`, padding `0 24px`. |
| Hero (Home) | Centered, padding `20px 0 18px`, bottom margin `24px`. |
| MarketPulse | Grid `1.2fr 1fr`, gap 14, margin-bottom 24. |
| InputForm | `max-width: 820px`, margin `0 auto 24px`. |
| Posts grid (columns) | 3 columns, gap 18. |
| Detail body | flex-column, gap 18, animated `fade-in-up`. |
| Detail header card | padding 26, radius 22. |
| Graph shell | min-height 560, padding inherited (SVG inside). |
| AnalyzingBox | padding `28 32`, radius 24. |
| ResultBox | padding 48, radius 28. |

---

## Animation map by component

| Component | Class | Anim |
|---|---|---|
| Header / nav | `fade-in-down` | one-shot |
| Hero | `fade-in-down` | one-shot |
| MarketPulse | `fade-in-up` | one-shot |
| InputForm | `fade-in-up` delay 0.15s | one-shot |
| PostsGrid | `fade-in-up` delay 0.25s | one-shot |
| PostCard | `card-entrance` + `stagger-children` | one-shot per column |
| Background orbs | `breathe`, `drift` | infinite |
| Logo halo | `breathe` | infinite |
| Logo "AI Online" dot | `blink` | infinite |
| Ticker tape track | `marquee` 60s linear | infinite |
| Submit overlay center square | `breathe` | infinite |
| Submit overlay spinner rings | nested `spinSlow` with different durations & reverse | infinite while submitting |
| Submit overlay bar | `shimmer` 2.5s | infinite while submitting |
| Wordmark | `gradient-shift` 6s | infinite |
| Graph particles | `breathe` w/ random delay | infinite |
| Graph nodes appear | `nodePop` | one-shot per node |
| Graph edges draw | `drawEdge` 1.4–1.6s | one-shot |
| Graph edge particles | `flow` 1.2s | infinite |
| Graph score halo | `auraPulse` 3.5s | infinite |
| Graph scan line | `hudScan` 4s | infinite |
| Stepper active dot | `blink` | infinite |
| Bubbles reveal | `fade-in-up` per bubble | one-shot |
| ResultBox arc | stroke-dasharray transition `1.8s cubic-bezier(.16,1,.3,1)` | one-shot |
| ResultBox CountUp | rAF easeOutCubic 1.6s | one-shot |
