# Data Model — NusaVerify v2 (multi-asset)

Schema changes required to support the redesign. Aligned with the existing Supabase setup
in [VicoAritonang/nusaverify-web](https://github.com/VicoAritonang/nusaverify-web).

The original schema is built around stock-only verification (per `lib/types.ts` + `app/[id]/AnalysisDetail.tsx`).
Multi-asset requires both **column additions** on `post` and **a refactor** of `think`'s hard-coded source columns into a dynamic per-source row model.

---

## Tables

### `post` (existing — add columns)

| Column | Type | Existing? | Notes |
|---|---|---|---|
| `id` | uuid pk | ✅ | — |
| `created_at` | timestamptz | ✅ | — |
| `updated_at` | timestamptz | ✅ | trigger on update |
| `status` | text | ✅ | `"exploring" \| "analyzing" \| "completed" \| "error"` |
| `title` | text | ✅ | AI-generated |
| `summary` | text | ✅ | AI-generated |
| `context` | text | ✅ | user input (the claim text) |
| `result` | text | ✅ | `"valid" \| "hoax" \| "uncertain"` |
| `confidence` | numeric(5,2) | ✅ | 0..100 |
| `image_url` | text \| null | ✅ | optional uploaded image |
| **`asset_class`** | text | ➕ NEW | `"Saham" \| "Crypto" \| "Forex" \| "Komoditas" \| "Makro" \| "Reksa Dana" \| "Investasi Ilegal"` |
| **`ticker`** | text \| null | ➕ NEW | e.g. `"BBCA"`, `"BTC"`, `"XAU/USD"`, `"USDIDR"`, `"FFR"` (Fed Funds Rate) |
| **`sector`** | text \| null | ➕ NEW | sub-category — Perbankan, DeFi, Bitcoin, Suku Bunga AS, etc. Free-text but use a controlled vocabulary listed in `data.jsx`. |
| **`sentiment`** | text \| null | ➕ NEW | `"bullish" \| "bearish" \| "neutral"` |
| **`claim_type`** | text \| null | ➕ NEW | one of the keys in `CLAIM_TYPES` (data.jsx) — `rumor / corporate-action / pump-and-dump / investasi-ilegal / sinyal-trading / berita-resmi / pom-pom / kebijakan-moneter / geopolitik` |
| **`risk_level`** | text \| null | ➕ NEW | `"low" \| "medium" \| "high"` |
| **`price_impact`** | text \| null | ➕ NEW | short free-text estimate, displayed in ResultBox meta panel |
| **`spark`** | jsonb \| null | ➕ NEW | array of 12 numbers for the post-card sparkline. Computed from market data if available; otherwise null and the UI hides the sparkline. |

#### Indexes

```sql
create index idx_post_status on post(status);
create index idx_post_created_at on post(created_at desc);
create index idx_post_asset_class on post(asset_class);
create index idx_post_ticker on post(ticker);
create index idx_post_result on post(result);
```

#### Sample migration

```sql
alter table post
  add column asset_class text,
  add column ticker text,
  add column sector text,
  add column sentiment text,
  add column claim_type text,
  add column risk_level text,
  add column price_impact text,
  add column spark jsonb;

-- backfill for existing rows (treat all old data as "Saham" since v1 was stock-only)
update post set asset_class = 'Saham' where asset_class is null;

alter table post alter column asset_class set not null;
```

---

### `think` (existing — REFACTOR)

The original schema hard-codes each source as a separate column (`official_source`,
`cnbc_source`, etc., with paired analysis fields). This doesn't generalize to multi-asset
where the agent set differs per asset class and we now have **7 named agents** that may grow.

**Replacement schema:**

```sql
create table think_source (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references post(id) on delete cascade,
  agent_key text not null,                -- "exchange" | "regulator" | "centralbank" | "wire" | "media_id" | "sentimen" | "analis" | (extensible)
  agent_name text not null,               -- "BEI / Exchange Data"
  agent_role text not null,               -- "OFFICIAL · IDX & GLOBAL EXCHANGES"
  agent_group text not null,              -- "regulator" | "media" | "community" | "analyst"
  agent_short text not null,              -- "EXG" — 3-letter abbreviation
  insight text not null,                  -- the agent's message body
  source_url text,                        -- external URL (BEI keterbukaan, Bloomberg article, etc.)
  source_label text,                      -- short label for the "source · {short}" chip
  position smallint not null default 0,   -- ordering for reveal
  created_at timestamptz not null default now()
);

create index idx_think_source_post on think_source(post_id, position);
```

#### Migration path

Keep the original `think` table for backward compatibility, OR migrate old rows by unpivoting
columns into `think_source` rows. Recommended approach:

1. Create `think_source` (new).
2. Write old rows' agent data into `think_source` via a one-time SQL job.
3. Drop `think` after the new UI is fully deployed.

---

## Type definitions (TypeScript)

```ts
// lib/types.ts

export type Verdict = "valid" | "hoax" | "uncertain";
export type Status = "exploring" | "analyzing" | "completed" | "error";
export type Sentiment = "bullish" | "bearish" | "neutral";
export type RiskLevel = "low" | "medium" | "high";

export type AssetClass =
  | "Saham"
  | "Crypto"
  | "Forex"
  | "Komoditas"
  | "Makro"
  | "Reksa Dana"
  | "Investasi Ilegal";

export type ClaimType =
  | "rumor"
  | "corporate-action"
  | "pump-and-dump"
  | "investasi-ilegal"
  | "sinyal-trading"
  | "berita-resmi"
  | "pom-pom"
  | "kebijakan-moneter"
  | "geopolitik";

export interface Post {
  id: string;
  created_at: string;
  updated_at: string;
  status: Status;
  title: string;
  summary: string;
  context: string;
  result: Verdict;
  confidence: number;            // 0..100
  image_url: string | null;
  asset_class: AssetClass;
  ticker: string | null;
  sector: string | null;
  sentiment: Sentiment | null;
  claim_type: ClaimType | null;
  risk_level: RiskLevel | null;
  price_impact: string | null;
  spark: number[] | null;
}

export type AgentKey =
  | "exchange"
  | "regulator"
  | "centralbank"
  | "wire"
  | "media_id"
  | "sentimen"
  | "analis";

export type AgentGroup = "regulator" | "media" | "community" | "analyst";

export interface ThinkSource {
  id: string;
  post_id: string;
  agent_key: AgentKey | string;     // extensible
  agent_name: string;
  agent_role: string;
  agent_group: AgentGroup;
  agent_short: string;              // 3-letter abbreviation
  insight: string;
  source_url: string | null;
  source_label: string | null;
  position: number;
  created_at: string;
}
```

---

## Defaults & validation

| Field | Required | Default | Validation |
|---|---|---|---|
| `asset_class` | yes | — | one of `AssetClass` |
| `ticker` | no | null | uppercase, 1–10 chars, allows `/` (e.g. `XAU/USD`) |
| `claim_type` | no | null | one of `ClaimType` |
| `sentiment` | no | null | one of `Sentiment` |
| `risk_level` | no | null | one of `RiskLevel` |
| `spark` | no | null | exactly 12 numbers or null |

When the AI service can't determine a field, leave it null. UI hides nulls gracefully.

---

## API contract (existing `/api/analyze`)

**Request** (per `original_context.md` §7.1, extended):

```ts
POST /api/analyze
{
  context: string;       // claim text, max 2000 chars
  image_base64?: string; // optional
  ticker?: string;       // user-supplied hint (uppercase, 1..10 chars)
}
```

**Response** (immediate, before async analysis):

```ts
201 Created
{
  id: string;            // post.id
  status: "exploring";
}
```

Client navigates to `/{id}` and begins polling.

---

## Asset-class controlled vocabulary

`asset_class` is intentionally a small, finite list. Future expansion:

- `"Saham"` — equities (IDX + global)
- `"Crypto"` — coins, tokens, DeFi protocols
- `"Forex"` — currency pairs
- `"Komoditas"` — gold, oil, agricultural commodities
- `"Makro"` — central bank decisions, geopolitics, government statements
- `"Reksa Dana"` — mutual funds (not yet seeded in prototype but kept in the schema)
- `"Investasi Ilegal"` — fall-through bucket for confirmed scam schemes regardless of instrument

Add new classes by:
1. Adding the literal to the `AssetClass` union.
2. Adding a hex color to `ASSET_CLASS_COLORS` in `data.jsx` / theme.
3. Documenting in this file.

---

## Sample fixtures (for seeding the dev DB)

See `prototype/data.jsx` — the `POSTS` array contains 15 well-formed examples covering
every asset class. Use them as seed data. The `SAMPLE_TRACE` object contains a full set of
example `ThinkSource` rows (one per agent) for the Bitcoin $200K claim.
