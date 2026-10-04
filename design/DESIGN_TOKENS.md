# Design Tokens — NusaVerify v2

Exhaustive reference. All values pulled from `prototype/styles.css` and the JSX. Hex codes
are exact.

---

## Colors

### Verdict semantics (PRIMARY VISUAL LANGUAGE — DO NOT REMAP)

| Token | Hex | Meaning | Used in |
|---|---|---|---|
| `--bull` | `#10b981` | Bullish / Valid / Up — base | `card-valid` border, `bull` chip |
| `--bull-2` | `#34d399` | Bullish — accent | text, sparklines, score arcs, ConfidenceArc, mood meter "Extreme Greed" |
| `--bear` | `#ef4444` | Bearish / Hoax / Down — base | `card-hoax` border, `bear` chip |
| `--bear-2` | `#f87171` | Bearish — accent | text, sparklines |
| `--neu` | `#f59e0b` | Neutral / Uncertain — base | `card-uncertain` border, `neu` chip |
| `--neu-2` | `#fcd34d` | Neutral — accent | text, mood meter "Fear" zone |

### Brand & UI accents

| Token | Hex |
|---|---|
| `--indigo` | `#6366f1` |
| `--violet` | `#8b5cf6` |
| `--cyan` | `#22d3ee` |

These are the only acceptable "non-verdict" colors. Use indigo for the primary brand, violet
for secondary gradient stops, cyan for regulator/exchange highlights and a few accents in
the graph.

### Asset class colors (chip fill + dot)

| Asset class | Hex | Usage |
|---|---|---|
| Saham | `#a5b4fc` | indigo light |
| Crypto | `#fb923c` | orange — different from neutral amber to avoid confusion |
| Forex | `#22d3ee` | cyan |
| Komoditas | `#fcd34d` | amber (overlap with neutral is intentional — gold!) |
| Makro | `#c4b5fd` | violet light |
| Reksa Dana | `#86efac` | green light |
| Investasi Ilegal | `#f87171` | red — danger |

Chip pattern: `background: ${color}18`, `border: 1px solid ${color}40`, `color: ${color}`.

### Surfaces

| Layer | Background | Border | Shadow |
|---|---|---|---|
| Page base | `#05060d` | — | — |
| Page lighter | `#0a0c18` | — | — |
| `.glass` | `rgba(255,255,255,.035)` + `backdrop-filter: blur(20px)` | `1px solid rgba(255,255,255,.07)` | — |
| `.glass-elev` | `rgba(14,16,28,.65)` + `backdrop-filter: blur(24px)` | `1px solid rgba(255,255,255,.08)` | `0 8px 32px rgba(0,0,0,.5)` |
| `.input-shell` | `rgba(12,14,26,.85)` + `backdrop-filter: blur(24px)` | `1px solid rgba(255,255,255,.07)` (default) / `1px solid rgba(99,102,241,.5)` (focused) | `0 8px 32px rgba(0,0,0,.45)` (default) / `0 0 40px rgba(99,102,241,.15)` (focused) |
| `.input-shell::before` (top hairline) | `linear-gradient(90deg, transparent, rgba(255,255,255,.15), transparent)` default / `linear-gradient(90deg, transparent, rgba(99,102,241,.8), rgba(168,85,247,.6), transparent)` focused | — | — |

### Card surfaces (per verdict)

**Valid:**
```css
background:
  radial-gradient(ellipse 70% 50% at 20% 0%, rgba(16,185,129,.10) 0%, transparent 60%),
  linear-gradient(160deg, #051210 0%, #030a08 50%, #020604 100%);
border: 1px solid rgba(16,185,129,.2);
box-shadow: 0 4px 24px rgba(0,0,0,.5), inset 0 1px 0 rgba(52,211,153,.06);

/* hover */
border-color: rgba(16,185,129,.4);
box-shadow: 0 14px 44px rgba(0,0,0,.7), 0 0 28px rgba(16,185,129,.18);
```

**Hoax:**
```css
background:
  radial-gradient(ellipse 70% 50% at 80% 0%, rgba(239,68,68,.10) 0%, transparent 60%),
  linear-gradient(160deg, #120508 0%, #0a0204 50%, #050102 100%);
border: 1px solid rgba(239,68,68,.2);
box-shadow: 0 4px 24px rgba(0,0,0,.5), inset 0 1px 0 rgba(248,113,113,.06);
```

**Uncertain:**
```css
background:
  radial-gradient(ellipse 70% 50% at 50% 0%, rgba(245,158,11,.09) 0%, transparent 60%),
  linear-gradient(160deg, #120c02 0%, #090602 50%, #050300 100%);
border: 1px solid rgba(245,158,11,.2);
box-shadow: 0 4px 24px rgba(0,0,0,.5), inset 0 1px 0 rgba(251,191,36,.06);
```

### Card decorations

**Hoax police-tape overlay** (only on `result === "hoax"`):
```css
background: repeating-linear-gradient(
  -48deg,
  rgba(250,204,21,.045) 0px, rgba(250,204,21,.045) 10px,
  transparent 10px, transparent 22px,
  rgba(255,255,255,.02) 22px, rgba(255,255,255,.02) 32px,
  transparent 32px, transparent 44px
);
```

**Card top glow hairline** (`.card-top-glow.v|h|u`):
- v: `linear-gradient(90deg,transparent,rgba(52,211,153,.55),transparent)`
- h: `linear-gradient(90deg,transparent,rgba(248,113,113,.5),transparent)`
- u: `linear-gradient(90deg,transparent,rgba(251,191,36,.5),transparent)`

### Background layers (page)

1. Base: `#05060d`.
2. Grid: `linear-gradient(rgba(255,255,255,.02) 1px, transparent 1px)` + perpendicular, `50px × 50px`.
3. Radial top: `radial-gradient(ellipse 90% 55% at 50% -10%, rgba(79,70,229,.13) 0%, transparent 70%)`.
4. Three floating orbs (fixed-positioned, `breathe` / `drift` anims):
   - top-left: 320×320, `rgba(99,102,241,.1)`, `blur(100px)`.
   - bottom-right: 400×400, `rgba(139,92,246,.08)`, `blur(120px)`, delay 2s.
   - center: 280×280, `rgba(34,211,238,.04)`, `blur(110px)`, `drift` anim.

---

## Typography

### Families

| Role | Family | Fallback |
|---|---|---|
| Display / UI | `Inter` | `system-ui, -apple-system, sans-serif` |
| Mono / data | `JetBrains Mono` | `ui-monospace, "SF Mono", Menlo, monospace` |

Alt pairings (exposed via Tweaks for exploration only):

| Mode | Display | Mono |
|---|---|---|
| `default` | Inter | JetBrains Mono |
| `alt` | Geist | Geist Mono |
| `editorial` | Instrument Serif | IBM Plex Mono |

### Weights

Inter loaded: 400, 500, 600, 700, 800, 900.
JetBrains Mono loaded: 400, 500, 600, 700.

### Feature settings

```css
body { font-feature-settings: "ss01", "cv11"; }
.mono { font-feature-settings: "tnum", "zero"; }
```

### Type scale (used in the prototype)

| Class / use | Size | Weight | Line-height | Letter-spacing |
|---|---|---|---|---|
| `h-display` (hero) | `clamp(40px, 6vw, 68px)` | 800 | 1.05 | `-.025em` |
| `h-section` | 18px | 700 | — | `-.01em` |
| Detail page h1 | `clamp(22px, 2.6vw, 30px)` | 800 | 1.2 | `-.015em` |
| Result box "Kesimpulan Analisis" | 24px | 800 | — | `-.015em` |
| Card title | 13px | 700 | 1.35 | — |
| Card body | 12.5px | 500 | 1.55 | — |
| Card quote | 11px | 400 italic | 1.5 | — |
| `label-tech` | 10px | — | — | `.18em`, UPPERCASE |
| Confidence number (big) | 36px | 800 | 1 | `-.03em` |
| Confidence number (mini) | 13px | 800 | — | — |
| Ticker tape number | 11px | 600 | — | `.05em` (ticker) |
| Chip | 10.5px | 700 | — | `.04em` |
| Step pill | 11px | 600 | — | `.06em`, UPPERCASE |

### Helper classes

```css
.mono { font-family: var(--font-mono); font-feature-settings: "tnum","zero"; }
.up { text-transform: uppercase; letter-spacing: .12em; }
.label-tech { font-family: var(--font-mono); font-size: 10px;
  color: rgba(255,255,255,.45); text-transform: uppercase; letter-spacing: .18em; }
```

### When to use mono

ALL numbers, codes, tickers, prices, percentages, timestamps, IDs, technical labels.
Body prose stays Inter. Inline numeric tokens (e.g. "Rp 100/saham") in prose stay Inter
unless visually flagged as a metric.

---

## Spacing

The prototype uses ad-hoc values — convert to Tailwind. Common increments:

`4, 6, 8, 10, 12, 14, 16, 18, 22, 24, 26, 28, 32, 36, 48, 60` (px).

| Tailwind | Value | Use |
|---|---|---|
| `gap-1` | 4px | dot+text, tight runs |
| `gap-1.5` | 6px | chip stacks |
| `gap-2` | 8px | meta rows |
| `gap-2.5` | 10px | dropzone inner |
| `gap-3` | 12px | card-to-card |
| `gap-3.5` | 14px | input-form header |
| `gap-4` | 16px | most module gaps |
| `gap-4.5` | 18px | section-to-section in detail page |
| `gap-5.5` | 22px | analyzing box header to body |
| `gap-6` | 24px | column gap in detail header |
| `gap-9` | 36px | result box columns |

Container: `max-width: 1440px`, padding `0 24px`. Above this width the grid centers.

---

## Border radius

| Token | Use |
|---|---|
| `6px` | Asset class chip on ticker tape, mini bars |
| `10px` | Buttons, small panels, watchlist items |
| `12px` | Input fields, image dropzone |
| `14px` | Column headers, disclaimer, mini cards |
| `16px` | PostCards, footer card |
| `18px` | InputShell, MoodMeter card, Watchlist card |
| `22px` | DetailHeader card |
| `24px` | AnalyzingBox, ExplorationGraph shell |
| `28px` | ResultBox |
| `999px` | All pills (chips, badges, status indicators) |
| `50%` | Avatars, gauge circles, status dots |

---

## Shadows

| Token | Value |
|---|---|
| Card resting | `0 4px 24px rgba(0,0,0,.5), inset 0 1px 0 rgba(255,255,255,.06)` |
| Card hover (valid) | `0 14px 44px rgba(0,0,0,.7), 0 0 28px rgba(16,185,129,.18)` |
| Card hover (hoax) | `0 14px 44px rgba(0,0,0,.7), 0 0 28px rgba(239,68,68,.2)` |
| Card hover (uncertain) | `0 14px 44px rgba(0,0,0,.7), 0 0 28px rgba(245,158,11,.2)` |
| Glass elevated | `0 8px 32px rgba(0,0,0,.5)` |
| Input default | `0 8px 32px rgba(0,0,0,.45)` |
| Input focused | `0 0 40px rgba(99,102,241,.15)` |
| Primary button hover | `0 8px 24px rgba(99,102,241,.4)` |
| Logo background | `0 6px 18px rgba(99,102,241,.45), inset 0 1px 0 rgba(255,255,255,.2)` |
| Status dot bull | `0 0 8px rgba(52,211,153,.6)` |
| Status dot bear | `0 0 8px rgba(248,113,113,.6)` |
| Status dot neu | `0 0 8px rgba(252,211,77,.6)` |
| Confidence gauge active | `0 0 30px ${color}33` (color = verdict color) |

---

## Z-index (used)

| Layer | z-index |
|---|---|
| Background grid + radial + orbs | 0 |
| Main content | 1 |
| Card decorative tape / clip | 1–2 |
| Card content | 3 |
| Card hover scan line | 4 |
| Input form preparation overlay | 50 |
| HUD overlays in graph (top, legend, hint) | 5 |
| Tweaks panel | 2147483646 (from starter) |

---

## Iconography

Inline SVGs from Lucide-like 24×24 grid with `stroke="currentColor"`, `stroke-width=2`,
`stroke-linecap="round"`, `stroke-linejoin="round"`.

Specific icons used in prototype:

| Icon | Use |
|---|---|
| `shield` + checkmark | Verdict "Valid", input form header |
| `alert-triangle` + dot | Verdict "Hoax" |
| `help-circle` | Verdict "Uncertain" |
| `image` glyph | Image upload affordance |
| `x` | Delete image / close |
| `send` (paper-plane) | Submit button |
| `chevron-left` | Back button |
| `info` (circle + i) | Disclaimer banner |
| `minimize` (4-arrow) | Graph minimize button |

Avatars in agent bubbles use **emoji** (🏛️ ⚖️ 🏦 📡 📰 💬 🧠) — keep as-is, it's intentionally friendly.

---

## States — verdict meta (for components that need to render any verdict)

```js
const RESULT_META = {
  valid: {
    label: "TERVERIFIKASI",
    icon: "✓",
    color: "#34d399",     // text/icon
    labelColor: "#10b981" // base (used in alpha-blends)
  },
  hoax: {
    label: "MISINFORMASI",
    icon: "✕",
    color: "#f87171",
    labelColor: "#ef4444"
  },
  uncertain: {
    label: "BELUM TERKONFIRMASI",
    icon: "?",
    color: "#fcd34d",
    labelColor: "#f59e0b"
  },
};
```

Always derive color tokens from this table — don't hard-code per-component.
