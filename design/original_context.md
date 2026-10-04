# NusaVerify — Context untuk Redesign (Claude Design)

> Dokumen konteks lengkap untuk merombak desain **NusaVerify** dan mengubah fokus domain
> dari **fact-checking politik/sains** menjadi **validasi informasi investasi & saham**.
> Brand tetap **NusaVerify**. Arah visual baru: **Fintech / Trading Terminal** (bull/bear, data-dense, profesional).

---

## 1. Ringkasan Produk

**NusaVerify** adalah web app di mana pengguna memasukkan **klaim / berita / link / gambar**, lalu
sebuah **AI agent multi-sumber** melakukan penelusuran dan validasi untuk menilai **kebenaran informasi**
tersebut. Hasil akhirnya berupa **verdict** (Valid / Hoaks / Belum Pasti) dengan **confidence score**,
ringkasan alasan, dan **jejak penelusuran** yang divisualisasikan sebagai knowledge graph + percakapan antar agen.

### Fokus Baru: Investasi & Saham
Domain bergeser dari politik/sains ke **informasi pasar modal Indonesia**, contohnya:
- Rumor/berita saham ("Emiten X akan stock split", "BBCA bagi dividen jumbo").
- Klaim ajakan investasi / sinyal trading ("Beli sekarang, pasti naik 50%").
- Deteksi **pump-and-dump**, **pom-pom saham**, penipuan investasi bodong, robot trading ilegal.
- Validasi corporate action: dividen, right issue, IPO, akuisisi, buyback.
- Screenshot dari grup Telegram/WhatsApp "cuan", postingan influencer saham, berita finansial.

---

## 2. Tech Stack (Eksisting)

| Layer | Teknologi |
|---|---|
| Framework | **Next.js 16** (App Router, RSC) |
| UI | **React 19**, **Tailwind CSS v4** (`@import "tailwindcss"`) |
| Bahasa | TypeScript 5 |
| Database / Realtime | **Supabase** (`@supabase/supabase-js`) — polling, bukan websocket |
| Graph visual | **react-force-graph-2d** (canvas 2D, custom painter) |
| Animasi | CSS keyframes kustom + `framer-motion` (terpasang) |
| Font | Inter (sans) + JetBrains Mono (mono) |
| Backend AI | Webhook eksternal (n8n) via route `/api/analyze`; status di-polling dari tabel Supabase |

Bahasa UI utama: **Indonesia**. Tema: **dark mode** (`<html className="dark">`).

---

## 3. Arsitektur Data (Supabase)

Dua tabel utama: `post` (hasil) dan `think` (jejak proses berpikir AI).

### Tabel `post` (eksisting)
```ts
interface Post {
  id: string;
  title: string | null;          // judul ringkas hasil generate AI
  summary: string | null;        // kesimpulan naratif
  context: string;               // input mentah user (teks/link)
  result: "valid" | "hoax" | "uncertain" | null;
  confidence: number | null;     // -100..100 (negatif = condong hoaks)
  created_at: string;
  updated_at: string;
  status: "completed" | "processing" | "expired" | "updating";
  category: string | null;       // saat ini: "politic", "scientific", dll
  information: string | null;
}
```

### Tabel `think` (eksisting)
Menyimpan output tiap "sumber" + insight + skor. Sumber eksisting berorientasi berita umum:
`official`, `cnbc`, `detik`, `kompas`, `inews`, `analysis`. Tiap sumber punya:
`<source>` (teks mentah), `<source>_insight` (ringkasan), `<source>_score` (number), `<source>_url`.
State proses: `"exploring" → "analyzing" → "completed"`.

### Perubahan Data Model untuk Investasi (DIINGINKAN)
**A. Ganti sumber** dari berita umum → **sumber finansial**:

| Slot lama | Slot baru (investasi) | Peran |
|---|---|---|
| `official` | **IDX / BEI** (keterbukaan informasi emiten) | Sumber resmi bursa |
| `official` (alt) | **OJK** (regulator, daftar entitas ilegal) | Sumber regulator |
| `cnbc` | **CNBC Indonesia** (kanal finansial) | Media finansial |
| `detik` | **Kontan** | Media finansial |
| `kompas` | **Bisnis.com / Bisnis Indonesia** | Media finansial |
| `inews` | **IDX Channel** | Media finansial |
| `analysis` | **Sentimen Retail** (Stockbit / komunitas) | Analisis sentimen pasar |

> Catatan implementasi: idealnya skema `think` dijadikan **dinamis** (array of sources)
> daripada kolom hard-coded per media, supaya mudah menambah sumber finansial baru.

**B. Tambah field baru** (di `post` dan/atau `think`):

```ts
ticker: string | null;          // mis. "BBCA", "TLKM", "GOTO"
sector: string | null;          // "Perbankan", "Energi", "Teknologi", dll
sentiment: "bullish" | "bearish" | "neutral" | null;  // arah sentimen pasar
price_impact: string | null;    // estimasi dampak ke harga / volatilitas
claim_type: string | null;      // "rumor", "pump-and-dump", "corporate-action",
                                 // "investasi-ilegal", "sinyal-trading", "berita-resmi"
risk_level: "low" | "medium" | "high" | null;   // tingkat risiko bagi investor
```

**C. Makna verdict dipertegas untuk investor:**
- `valid` → **Terverifikasi** — informasi akurat & didukung sumber resmi.
- `hoax` → **Misinformasi / Hoaks** — rumor, pom-pom, pump-and-dump, atau penipuan.
- `uncertain` → **Belum Terkonfirmasi** — bukti belum cukup, investor harus hati-hati.

---

## 4. Design System Baru: "Trading Terminal"

### Filosofi
Tampilan **data-dense, presisi, profesional** seperti terminal Bloomberg/trading, tapi tetap
modern dan ramah. Tetap **dark mode**. Pertahankan kekuatan visual eksisting (glassmorphism,
glow, knowledge graph) namun arahkan ke bahasa visual finansial.

### Palet Warna (semantik bull/bear)
Kabar baik: palet eksisting sudah cocok — tinggal dipertegas maknanya.

| Token | Warna | Makna investasi |
|---|---|---|
| **Bull / Valid** | Emerald `#10b981` / `#34d399` | Naik, terverifikasi, aman |
| **Bear / Hoaks** | Red `#ef4444` / `#f87171` | Turun, misinformasi, bahaya |
| **Neutral / Uncertain** | Amber `#f59e0b` / `#fcd34d` | Sideways, belum pasti |
| **Brand / Aksen** | Indigo `#6366f1`, Violet `#8b5cf6`, Cyan `#22d3ee` | UI, grafik, highlight |
| **Background** | `#05060d` → `#0a0c18` | Kanvas gelap |

### Elemen visual khas trading yang DITAMBAHKAN
- **Ticker tape** di header → ubah dari teks generik jadi **running ticker harga/verifikasi terbaru** (mis. `BBCA ▲ VALID · GOTO ▼ HOAKS · TLKM ◆ CEK`).
- **Sparkline / candlestick mini** sebagai motif dekoratif & pada kartu.
- **Angka monospace** (JetBrains Mono) untuk semua metrik — confidence, skor, persentase.
- **Badge sentimen** bull/bear dengan panah ▲▼.
- **Panel data-dense** bergaya HUD/terminal (corner crosshairs sudah ada — pertahankan).
- **Chip ticker & sektor** (`$BBCA`, `#Perbankan`).

### Tipografi
- Heading: Inter, extra-bold, tracking ketat.
- Data/angka/label teknis: JetBrains Mono, uppercase, letter-spacing lebar.

### Bahasa visual yang DIPERTAHANKAN dari versi sekarang
Glassmorphism (`.glass`, `.glass-elev`), background grid + radial glow, blob blur "breathe",
corner crosshairs (`.corner-marks`), gradient brand text, knowledge graph interaktif.

---

## 5. Inventaris Animasi (Eksisting — untuk dipertahankan/diadaptasi)

Didefinisikan di `app/globals.css`. Semua relevan dan layak dipertahankan:

| Animasi | Fungsi |
|---|---|
| `fadeInUp` / `fadeInDown` | Entrance elemen saat load |
| `cardEntrance` | Kartu hasil muncul dengan scale+translate |
| `slideInLeft` / `slideInRight` | Kolom grid masuk dari samping |
| `shimmer` | Loading bar bergerak (gradient) |
| `breathe` | Blob background & dot status "bernapas" |
| `drift` | Blob background melayang pelan |
| `auraPulse` / `pulseGlow` / `glowPulse` | Halo bercahaya di logo & ikon |
| `marquee` | Ticker tape berjalan horizontal |
| `gradientShift` | Teks gradient brand beranimasi |
| `float` | Partikel melayang di knowledge graph |
| `orbit` | Orbit elemen (tersedia) |
| `spinSlow` | Cincin loader berputar |
| `nodePop` / `drawEdge` / `edgePulse` | Animasi node & garis mindmap |
| `borderGlow` / `scanLine` / `typewriterBlink` | Aksen HUD |
| `stagger-children` | Delay berurutan antar anak (kartu) |

Animasi runtime (JS/canvas): force-graph fisika (charge/link force), particle links bergerak,
halo skor berdenyut (sin-wave), auto zoom-to-fit, auto-minimize panel.

**Adaptasi untuk trading look:** tambahkan animasi **angka berhitung naik** (count-up) pada
confidence/skor, **garis sparkline tergambar** (draw-on), dan transisi **bull/bear** (panah & warna).

---

## 6. Breakdown Per Halaman

Aplikasi punya **2 halaman utama** + overlay/state.

---

### 6.1 Halaman Beranda — `/` (`app/page.tsx`)

**Fungsi:** Landing + entry point. Tempat user submit klaim baru, dan galeri hasil verifikasi terbaru.

**Struktur & Data:**
1. **Background berlapis** — grid (`.bg-grid`), radial glow atas, 3 blob blur beranimasi (`breathe`/`drift`).
2. **Nav strip** — logo + nama "NusaVerify" + versi build; indikator status kanan ("AI Core Online" dot hijau pulse, "Multi-source Engine").
3. **Hero** — logo besar dengan halo aura, badge "AI Fact Verification", judul gradient "NusaVerify", subjudul, lalu **ticker tape** marquee.
   - *Adaptasi investasi:* badge → "AI Stock Intelligence" / "Validasi Berita Saham"; subjudul diarahkan ke investasi; ticker → running harga/verifikasi saham.
4. **InputForm** (komponen — lihat 7.1).
5. **Divider** "Recent Verifications".
6. **PostsGrid** (komponen — lihat 7.2) — galeri hasil dengan filter kategori.
7. **Footer** — logo, "Multi-Source AI Engine", "© 2026 Hackathon BI", status "All systems nominal".

**Tombol/Interaksi:**
- Submit analisis (di InputForm).
- Filter kategori (di PostsGrid).
- Klik kartu → buka halaman detail.

**Animasi:** semua entrance (`fade-in-down/up`, `slide-in-left/right`), blob `breathe`/`drift`,
ticker `marquee`, logo `auraPulse`+`pulseGlow`, dot status `pulse`, `stagger-children` pada kartu.

**Data source:** `getPosts()` — query Supabase `post` (status ≠ processing, urut `updated_at` desc, limit 30, `revalidate=30`).

---

### 6.2 Halaman Detail — `/[id]` (`app/[id]/page.tsx` + `AnalysisDetail.tsx`)

**Fungsi:** Menampilkan **proses & hasil verifikasi** satu klaim secara real-time (live trace).
Polling Supabase tiap 2–5 detik sampai `completed`.

**Struktur & Data:**
1. **Top bar** — tombol "Kembali ke Beranda", indikator "Live Trace" + ID singkat.
2. **Header card** (`glass-elev`) — badge "Verification Trace", chip kategori, **judul klaim**,
   kutipan input (atau **InstagramPreview** bila link IG), dan **stepper 3 tahap**:
   `Eksplorasi → Analisis → Selesai` (dengan checkmark progres).
   - *Adaptasi investasi:* tambahkan **chip ticker `$BBCA` + sektor** dan **badge sentimen** bull/bear di sini.
3. **Preparation loader** — spinner cincin saat `think` belum ada ("Booting neural network").
4. **ExplorationGraph** (komponen — lihat 7.3) — knowledge graph interaktif.
5. **AnalyzingBox** (komponen — lihat 7.4) — percakapan antar agen AI.
6. **ResultBox** (komponen — lihat 7.5) — verdict final + confidence gauge.

**State machine (penting untuk animasi):**
- `exploring` → graph membangun node bertahap (polling 2s).
- `analyzing` → graph auto-minimize, AnalyzingBox muncul (polling 5s).
- `completed` / `post.result != null` → AnalyzingBox minimize, ResultBox muncul; polling berhenti.

**Animasi:** `fade-in-up` seksi, stepper transisi aktif/done (glow indigo→emerald),
spinner cincin ganda (3 layer beda kecepatan), auto-minimize panel, semua animasi sub-komponen.

---

## 7. Breakdown Per Komponen

### 7.1 `InputForm.tsx` (client)
**Fungsi:** Form input klaim + upload gambar opsional → POST `/api/analyze` → redirect ke `/[id]`.

**Data/State:** `context` (textarea, limit 2000 char), `image` (base64), `isSubmitting`, `error`,
`isDragging`, `isFocused`. `canSubmit = ada teks atau gambar`.

**Elemen:**
- Header: ikon shield (animate-ping ring), judul "Verifikasi Fakta", badge "Secure".
- **Textarea** dengan progress bar char-count (berubah ke amber→merah saat >90%).
- **Dropzone gambar** (drag&drop / klik) — preview thumbnail, tombol hapus, validasi tipe & ≤10MB.
- **Error banner** (merah, ikon warning).
- **Tombol "Analisis Sekarang"** (gradient indigo, `btn-shine` hover, ikon kirim, hint ⏎).
- Indikator "AI Online · Multi-source".
- **Preparation overlay** saat submit: spinner 3-cincin, "Menghubungkan ke AI Core", shimmer bar.

**Animasi:** focus glow (shadow transition), top border gradient saat focus, dropzone scale saat drag,
overlay `fade-in-up` + spinner + `shimmer` + dot bounce.

**Adaptasi investasi:**
- Placeholder → "Tempel berita saham, rumor, link, atau screenshot grup investasi…".
- Judul → "Validasi Informasi Investasi".
- Tambah **quick-input chips** contoh ("Cek rumor dividen", "Deteksi pom-pom", "Cek investasi ilegal").
- (Opsional) input **ticker** terstruktur.

### 7.2 `PostsGrid.tsx` + `PostCard.tsx` (client)
**Fungsi:** Galeri hasil dalam **3 kolom**: Terverifikasi Valid / Terdeteksi Hoaks / Belum Pasti.
Ada **filter kategori** (pill, "Semua" + per kategori).

**PostCard menampilkan:** ikon verdict (shield/alert/question), judul, **chip verdict + kategori**,
summary (2 baris), kutipan context, waktu relatif ("5m lalu"), **mini confidence gauge** (SVG arc) + persen,
**confidence bar** bawah. Status badge (updating/expired/completed/processing). Efek hover lift + glow,
corner clip dekoratif, tape diagonal untuk hoax.

**Animasi:** `card-entrance` + `stagger-children`, hover `translateY(-4px)` + glow, dot header `breathe`,
gauge `stroke-dasharray` transition.

**Adaptasi investasi:**
- Kolom: pertahankan, tapi label boleh "Akurat / Misinformasi / Belum Pasti".
- Tambah di kartu: **chip ticker `$BBCA`**, **badge sentimen** ▲/▼, **mini-sparkline**, **risk level**.
- Filter kategori → filter **sektor** (Perbankan, Energi, Teknologi…) + **tipe klaim**.

### 7.3 `ExplorationGraph.tsx` (client, canvas)
**Fungsi:** Knowledge graph **force-directed** yang dibangun bertahap saat AI menelusuri sumber.
Node: **root** (topik) → **source** (tiap media/sumber) → **insight** (ringkasan) → **score** (skor verdict).

**Visual node (custom canvas painter):**
- Root: kartu indigo "◆ ROOT NODE" berisi judul.
- Source: kartu cyan dengan header "◈ NAMA" + preview teks (klik → modal dengan URL).
- Insight: kartu violet "◇ INSIGHT" (klik → modal).
- Score: **lingkaran** berwarna (hijau valid / merah hoaks / kuning netral) dengan `XX% | VERDICT`,
  halo berdenyut.

**Interaksi/Tombol:** zoom scroll, pan drag, drag node, klik node → **modal** detail + link sumber,
tombol "Tutup Canvas" (minimize), badge HUD "Building Knowledge Graph", **Legend**, hint kontrol.

**Animasi:** partikel melayang (`float`), particle bergerak di link, halo skor sin-wave, bezier links
melengkung, auto `zoomToFit`, auto-minimize 1.5s setelah analyzing.

**Adaptasi investasi:**
- Ganti label source ke **IDX, OJK, CNBC Indonesia, Kontan, Bisnis, IDX Channel, Sentimen Retail**.
- Ikon/aksen per tipe sumber (regulator vs media vs sentimen komunitas).
- Score node → "kredibilitas" + **indikator sentimen** bull/bear.

### 7.4 `AnalyzingBox.tsx` (client)
**Fungsi:** Visualisasi fase "cross-analyzing" sebagai **chat bubble antar 6 agen AI**, masing-masing
melaporkan insight-nya. Ada GIF "analyzing" + label "Synthesizing outputs". Auto-minimize saat selesai.

**Agen eksisting:** Official statement (🏛️), CNBC, Detik, Kompas, iNews (📰), General evaluator (🧠).
Warna bubble: emerald/amber/purple.

**Animasi:** bubble `fade-in-up` ber-stagger (delay per agen), dot bounce "Cross-Analyzing", GIF, glow.

**Adaptasi investasi (PENTING — ganti persona agen):**
| Agen baru | Avatar | Peran |
|---|---|---|
| **IDX / BEI** | 🏛️ | Keterbukaan informasi emiten |
| **OJK** | ⚖️ | Cek regulasi & entitas ilegal |
| **CNBC Indonesia** | 📈 | Berita finansial |
| **Kontan** | 📰 | Berita pasar modal |
| **Sentimen Retail** | 💬 | Sentimen Stockbit/komunitas |
| **Analis Pasar** | 🧠 | Sintesis & penilaian risiko |

### 7.5 `ResultBox.tsx` (client)
**Fungsi:** **Verdict final** — kartu besar berwarna sesuai hasil dengan **confidence gauge** (arc SVG 130px),
ikon verdict, label, tagline, dan **summary naratif**. Footer meta (status + kategori).

**Data:** `result` (valid/hoax/uncertain), `confidence` (-100..100 → gauge & leaning label
"Mengarah ke Valid/Hoaks"). Tape diagonal merah untuk hoax. Glow ambient sesuai warna.

**Animasi:** `fade-in-up`, gauge `stroke-dasharray` transition 1.5s, ikon `pulse`, glow blobs, leaning badge.

**Adaptasi investasi:**
- Tagline domain investasi (mis. "Klaim ini didukung keterbukaan informasi resmi BEI").
- Tambah panel: **ticker, sektor, sentimen, risk level, estimasi dampak harga**.
- (Opsional) **disclaimer** "Bukan ajakan jual/beli — bukan nasihat investasi".

### 7.6 `InstagramPreview.tsx` (client)
**Fungsi:** Bila input berupa link Instagram, render preview kartu (oEmbed via noembed proxy):
ikon IG gradient, author, caption, thumbnail, URL. *Adaptasi:* dukung juga preview **Twitter/X, TikTok, link berita finansial**.

### 7.7 `/api/analyze/route.ts` (server)
POST `{ context, image }` → forward ke webhook AI (`MAIN_AGENT_WEBHOOK_URL` + `X_API_KEY`) →
balas `{ status: "exist" | "initialized" | "unauthorized" | "failed", post_id }`.
*Tidak perlu redesign, tapi payload bisa diperkaya field investasi bila backend siap.*

---

## 8. Rencana Perubahan (Ringkasan Eksekusi)

### Tahap 1 — Domain & Konten (cepat, dampak besar)
- [ ] Copywriting seluruh UI → bahasa investasi (hero, form, label kolom, taglines, footer).
- [ ] Ganti nama & persona 6 agen di `AnalyzingBox` ke sumber finansial.
- [ ] Ganti label sumber di `ExplorationGraph` (IDX, OJK, CNBC, Kontan, Bisnis, IDX Channel, Sentimen Retail).
- [ ] Ubah makna verdict (Valid→Terverifikasi, Hoax→Misinformasi, Uncertain→Belum Terkonfirmasi).
- [ ] Ticker tape → konten saham (ticker + arah + verdict).

### Tahap 2 — Visual "Trading Terminal"
- [ ] Pertegas semantik warna bull(hijau)/bear(merah)/netral(amber).
- [ ] Tambah motif candlestick/sparkline, badge sentimen ▲▼, angka monospace.
- [ ] Komponen baru: `SparklineMini`, `SentimentBadge`, `TickerChip`, `RiskMeter`.
- [ ] Animasi count-up untuk skor & gauge.

### Tahap 3 — Data Model (perlu koordinasi backend)
- [ ] Tambah field: `ticker`, `sector`, `sentiment`, `price_impact`, `claim_type`, `risk_level`.
- [ ] Refactor `think` ke skema sumber **dinamis** (array) agar fleksibel.
- [ ] PostCard & ResultBox & filter mengonsumsi field baru.

### Tahap 4 — Polish
- [ ] Disclaimer "bukan nasihat investasi".
- [ ] Empty states & loading bernuansa trading.
- [ ] Responsif & aksesibilitas (kontras warna bull/bear cukup, fokus ring).

---

## 9. Prinsip & Batasan untuk Desainer/AI

- **Tetap dark mode**, jangan hilangkan kekuatan visual eksisting (glass, glow, graph).
- **Brand "NusaVerify" tidak berubah** — logo `/logo.png` dipertahankan.
- Warna verdict adalah **bahasa utama** produk; jangan tukar makna hijau/merah.
- Angka & metrik **selalu monospace**, presisi, mudah dibaca sekilas (gaya terminal).
- Sertakan **disclaimer investasi** di tempat yang tepat (etika & regulasi OJK).
- Bahasa UI: **Indonesia** (istilah teknis finansial boleh campur, mis. "bullish").
- Hindari klaim memberi rekomendasi jual/beli — produk **memvalidasi informasi**, bukan memberi sinyal.
