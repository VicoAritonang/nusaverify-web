# State Machine — Detail Page

The detail page (`/[id]`) runs a three-phase machine: `exploring → analyzing → completed`.
This document is the source of truth for the **flow, timings, and what each phase shows**.

The prototype simulates these phases on a fixed timer for demo purposes. **The real
implementation must drive them from Supabase polling** — see "Real implementation" below.

---

## States

| State | Top-level meaning | Visible blocks |
|---|---|---|
| `exploring` | AI is identifying relevant sources for the claim | DetailHeader (stepper: step 1 active) + ExplorationGraph (building) |
| `analyzing` | AI agents are each producing their insights | DetailHeader (step 2 active) + ExplorationGraph (auto-minimized) + AnalyzingBox (chat bubbles streaming) |
| `completed` | Final verdict ready | DetailHeader (all steps done) + ExplorationGraph (minimized) + AnalyzingBox (collapsed) + ResultBox (visible) |

---

## Prototype timings (use as defaults in real polling)

```
mount
  └─ +600ms ─ first node reveal (root)
              └─ +550ms × 7 ─ source nodes 1..7
                              └─ +800ms ─ state transition: exploring → analyzing
                                          └─ +200ms ─ bubble 0 reveal
                                                      └─ +900ms × 6 ─ bubbles 1..6
                                                                      └─ +1200ms ─ state transition: analyzing → completed
                                                                                   └─ +2200ms ─ AnalyzingBox auto-minimize
```

Total wall time ≈ **14–16 seconds**.

Real backend may be faster or slower; UI must always **respect the actual server state** and
animate transitions at fixed component-level timings (don't queue a fake delay if the server
returns `completed` immediately on load — just render the completed state and skip
intermediate animations).

---

## Component-level animation timings (independent of state)

| Animation | Duration | Easing | Where |
|---|---|---|---|
| Node `nodePop` | 0.7s | `cubic-bezier(.175,.885,.32,1.275)` | Graph: per node appearance |
| Edge `drawEdge` (root→source) | 1.4s | `cubic-bezier(.16,1,.3,1)` | Graph: per edge reveal |
| Edge `drawEdge` (source→score) | 1.6s | ease-out | Graph: when score node appears |
| Edge `flow` particles | 1.2s | linear infinite | Graph: on revealed edges |
| Score halo `auraPulse` | 3.5s | ease-in-out infinite | Graph: around score node |
| Bubble `fade-in-up` | 0.55s | `cubic-bezier(.16,1,.3,1)` | AnalyzingBox: per bubble |
| ResultBox `fade-in-up` | 0.55s | `cubic-bezier(.16,1,.3,1)` | When first rendered |
| ResultBox arc fill | 1.8s | `cubic-bezier(.16,1,.3,1)` | Stroke-dasharray transition |
| ResultBox CountUp | 1.6s | `easeOutCubic` (rAF) | Big confidence number |
| Stepper active dot | 1.4s `blink` | ease-in-out infinite | While step is active |
| Graph minimize/restore | 0.25s | ease | Card → banner morph (immediate swap in prototype) |

---

## Layout rules per state

### `exploring`

- DetailHeader: chips + title + claim. Stepper shows **step 1 active**, dots 2 & 3 inactive.
- ExplorationGraph: visible at full size (~560 tall).
  - Reveals 1 node per ~550ms following `SAMPLE_TRACE.graph.sources` order.
  - HUD top-left chip says "BUILDING KNOWLEDGE GRAPH" with progress count `X/8 nodes`.
  - Score node not yet present.
- AnalyzingBox: NOT mounted.
- ResultBox: NOT mounted.

### `analyzing`

- DetailHeader: stepper shows step 1 done (✓ + emerald), **step 2 active**, step 3 inactive.
- ExplorationGraph:
  - Score node appears with auraPulse.
  - Source→score edges draw.
  - **After 1500ms, graph auto-minimizes** to a single-line clickable banner.
- AnalyzingBox: mounts with chip "CROSS-ANALYZING . . .". Bubbles reveal one every 900ms.
- ResultBox: NOT mounted.

### `completed`

- DetailHeader: stepper all done (✓ on all 3, emerald).
- ExplorationGraph: stays minimized; user can click to restore.
- AnalyzingBox: header chip switches to "✓ ANALISIS SELESAI" (emerald). **After 2200ms,
  AnalyzingBox auto-minimizes** to a single-line clickable banner. "Minimize" button is
  visible meanwhile.
- ResultBox: mounts (`fade-in-up`); confidence arc + CountUp animate.

---

## Manual interactions during the flow

| User action | Effect |
|---|---|
| Click minimized graph banner | Expand graph (any state) |
| Click "Tutup canvas" button in graph | Minimize graph |
| Click minimized AnalyzingBox banner | Expand chat (when collapsed) |
| Click "Minimize" in AnalyzingBox header | Manually collapse (only when `completed`) |
| Click back button | Navigate to `/` |

---

## Real implementation — Supabase polling

Replace the timed simulation with polling against the `post` row (and its associated
`think` rows). The original repo's `app/[id]/AnalysisDetail.tsx` already implements polling
on the `post.status` column. Reuse that pattern. Map:

```
post.status = "exploring"  → state = "exploring"
post.status = "analyzing"  → state = "analyzing"
post.status = "completed"  → state = "completed"
```

Polling cadence (from `original_context.md` §6.2):
- `exploring`: poll every **2s**
- `analyzing`: poll every **5s**
- `completed`: **stop polling**

When the server returns a state ahead of the client's last-known state, **fast-forward**:
play the destination animation immediately (no fake delays). This keeps the UI responsive
to fast backends and resilient to refreshes.

On initial page load:

```
if (post.status === "completed") {
  // Render final state immediately. Skip exploration animation entirely.
  // Optionally play ResultBox fade-in + arc + CountUp.
}
```

---

## Source-of-truth checklist for the implementer

- [ ] State derived from `post.status` (not from a timer).
- [ ] Knowledge graph nodes built from real `think` rows / sources list (see DATA_MODEL.md), not the static `SAMPLE_TRACE` array.
- [ ] Chat bubbles built from `think` rows per agent — one bubble per row.
- [ ] Verdict color comes from `post.result` ∈ {valid, hoax, uncertain}.
- [ ] Confidence value comes from `post.confidence` (0..100 absolute).
- [ ] When polling completes (state = completed), poll loop is cleared.
- [ ] If user navigates away mid-poll, abort the request.
- [ ] Disclaimer banner present on ResultBox.
- [ ] Image (if originally uploaded) rendered above the claim quote in DetailHeader (the prototype doesn't show one but production should).

---

## Edge cases

| Case | Expected behavior |
|---|---|
| Post ID 404 | Show a graceful empty state with "Klaim tidak ditemukan" + back button. |
| `post.status = "error"` | Show ResultBox in "uncertain" colors with message "Analisis gagal" + retry. |
| User refreshes during `analyzing` | Resume polling; show graph minimized (per behavior); reveal bubbles up to the number of completed `think` rows. |
| User opens an old, completed post | Skip animation. Render full graph (no build-up), AnalyzingBox in completed-then-minimized state, ResultBox immediately. |
| Image upload very large | Loading skeleton in InputForm; abort if > 10MB with inline error in `disclaimer`-style banner (red). |
