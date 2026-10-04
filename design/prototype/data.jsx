// data.jsx — dummy data, helpers, dictionaries
// Loaded as a non-module script (assigns to window)

// ═════ Asset classes & sectors ═════
const ASSET_CLASSES = ["Saham", "Crypto", "Forex", "Komoditas", "Makro", "Reksa Dana"];
const SECTORS_STOCK = ["Perbankan", "Energi", "Teknologi", "Telekomunikasi", "Tambang", "Konsumer", "Otomotif", "Properti", "Healthcare"];
const CLAIM_TYPES = {
  "rumor": { label: "Rumor", icon: "💬" },
  "corporate-action": { label: "Corporate Action", icon: "📋" },
  "pump-and-dump": { label: "Pump & Dump", icon: "🚨" },
  "investasi-ilegal": { label: "Investasi Ilegal", icon: "⚠️" },
  "sinyal-trading": { label: "Sinyal Trading", icon: "📈" },
  "berita-resmi": { label: "Berita Resmi", icon: "🏛️" },
  "pom-pom": { label: "Pom-pom / Endorser", icon: "📣" },
  "kebijakan-moneter": { label: "Kebijakan Moneter", icon: "🏦" },
  "geopolitik": { label: "Geopolitik / Tarif", icon: "🌐" },
};

// ═════ POSTS — multi-asset claims ═════
const POSTS = [
  // ─ CRYPTO ─
  {
    id: "p1",
    title: "Influencer klaim Bitcoin akan tembus US$200,000 dalam 30 hari",
    summary: "Klaim tidak didukung indikator on-chain atau analisis derivatif kredibel. Pola posting konsisten dengan pump scheme untuk altcoin terkait. Sangat berisiko untuk diikuti.",
    context: "BTC siap meledak ke $200K dalam 30 hari! ETF inflow gila, halving effect baru mulai. Masuk sekarang sebelum ketinggalan!",
    result: "hoax",
    confidence: 86,
    ticker: "BTC",
    assetClass: "Crypto",
    sector: "Bitcoin",
    sentiment: "bearish",
    claimType: "pom-pom",
    riskLevel: "high",
    priceImpact: "Volatilitas tinggi, risiko losses 30-60%",
    updatedAt: "3m",
    status: "completed",
    spark: [62, 65, 68, 70, 72, 70, 68, 65, 62, 60, 58, 56],
  },
  {
    id: "p2",
    title: "Skema staking 'ETH 2.0' menjanjikan yield 20% per bulan",
    summary: "Bukan produk resmi Ethereum Foundation. Yield staking ETH resmi saat ini ~3-4% per tahun. Berpotensi skema Ponzi dengan kedok DeFi.",
    context: "Platform Stake-ETH Premium kasih yield 20% per bulan, locked 3 bulan. Sudah verified, ribuan member sudah withdraw!",
    result: "hoax",
    confidence: 95,
    ticker: "ETH",
    assetClass: "Crypto",
    sector: "DeFi",
    sentiment: "bearish",
    claimType: "investasi-ilegal",
    riskLevel: "high",
    priceImpact: "Risiko 100% loss modal",
    updatedAt: "18m",
    status: "completed",
    spark: [30, 28, 25, 22, 18, 15, 12, 10, 8, 6, 4, 3],
  },

  // ─ MAKRO ─
  {
    id: "p3",
    title: "Pasar perkirakan Fed pangkas suku bunga 25bps di FOMC Juni 2026",
    summary: "Konsensus CME FedWatch menunjukkan probabilitas cut 25bps sebesar 68%. Belum ada konfirmasi resmi dari Fed; dot plot terakhir masih hawkish.",
    context: "Sinyal dovish dari Powell minggu lalu plus CPI cooling — pasar pricing-in 25bps cut di FOMC Juni.",
    result: "uncertain",
    confidence: 58,
    ticker: "FFR",
    assetClass: "Makro",
    sector: "Suku Bunga AS",
    sentiment: "neutral",
    claimType: "kebijakan-moneter",
    riskLevel: "medium",
    priceImpact: "Bullish untuk risk assets jika benar",
    updatedAt: "32m",
    status: "completed",
    spark: [50, 52, 55, 54, 56, 58, 57, 59, 60, 58, 57, 58],
  },
  {
    id: "p4",
    title: "Trump umumkan tarif 200% untuk impor mobil listrik dari China",
    summary: "Klaim akurat. Sumber: pernyataan resmi White House Press Room 22 Mei 2026 dan publikasi USTR Federal Register. Mulai berlaku Juli 2026.",
    context: "Trump tanda tangan executive order tarif 200% mobil EV China. Berlaku Juli, baterai ikut kena tarif tambahan.",
    result: "valid",
    confidence: 96,
    ticker: "TARIFF",
    assetClass: "Makro",
    sector: "Perdagangan Global",
    sentiment: "bearish",
    claimType: "geopolitik",
    riskLevel: "high",
    priceImpact: "Tekanan sektor EV China & supply chain global",
    updatedAt: "1j",
    status: "completed",
    spark: [40, 42, 41, 43, 45, 44, 46, 48, 47, 49, 51, 52],
  },

  // ─ EMAS / KOMODITAS ─
  {
    id: "p5",
    title: "Klaim 'Emas akan tembus US$3,500/oz pada akhir 2026'",
    summary: "Target spekulatif. Konsensus analis (Goldman Sachs, UBS) di kisaran $2,800-$3,000/oz. Tidak mustahil tapi belum didukung katalis konkret.",
    context: "Emas dipastikan tembus $3,500 akhir tahun! BRICS de-dolarisasi + central bank buying terus jalan.",
    result: "uncertain",
    confidence: 44,
    ticker: "XAU/USD",
    assetClass: "Komoditas",
    sector: "Emas",
    sentiment: "neutral",
    claimType: "rumor",
    riskLevel: "medium",
    priceImpact: "Belum dapat dievaluasi",
    updatedAt: "1j",
    status: "completed",
    spark: [22, 23, 22, 24, 25, 24, 26, 25, 27, 26, 28, 27],
  },

  // ─ SAHAM ─
  {
    id: "p6",
    title: "BBCA umumkan dividen final Rp 100 per saham tahun buku 2025",
    summary: "Klaim sesuai dengan keterbukaan informasi resmi BBCA pada IDX. Cum date dan tanggal pembayaran tercantum jelas. Tidak ada indikasi manipulasi.",
    context: "BBCA bagi dividen final Rp 100/saham, cum date 28 Mei 2026. Yield ~2.1%.",
    result: "valid",
    confidence: 92,
    ticker: "BBCA",
    assetClass: "Saham",
    sector: "Perbankan",
    sentiment: "bullish",
    claimType: "corporate-action",
    riskLevel: "low",
    priceImpact: "Dampak positif terbatas, sudah priced in",
    updatedAt: "2j",
    status: "completed",
    spark: [12, 14, 13, 15, 17, 16, 18, 19, 21, 22, 24, 25],
  },
  {
    id: "p7",
    title: "Rumor GOTO stock split 1:5 minggu depan",
    summary: "Tidak ada keterbukaan informasi resmi dari GOTO ke BEI. Sumber asli adalah grup Telegram tanpa atribusi. Berpotensi pump-and-dump.",
    context: "Bocoran insider: GOTO bakal stock split 1:5 Senin depan. Beli sekarang sebelum harga naik 50%!",
    result: "hoax",
    confidence: 88,
    ticker: "GOTO",
    assetClass: "Saham",
    sector: "Teknologi",
    sentiment: "bearish",
    claimType: "pump-and-dump",
    riskLevel: "high",
    priceImpact: "Risiko losses 30-50% jika ikut FOMO",
    updatedAt: "2j",
    status: "completed",
    spark: [22, 21, 23, 25, 28, 26, 24, 22, 19, 18, 16, 15],
  },

  // ─ FOREX ─
  {
    id: "p8",
    title: "Rupiah diperkirakan menembus 17.000/USD pada Q3 2026",
    summary: "Konsensus ekonom Bank Indonesia & Mandiri menempatkan USD/IDR di kisaran 16,200-16,500 untuk Q3. Pelebaran ke 17,000 mungkin tapi bukan basis kasus.",
    context: "USDIDR dipastikan ke 17,000 Q3 ini. Fed yang lebih hawkish + capital outflow dari EM bakal tekan rupiah terus.",
    result: "uncertain",
    confidence: 46,
    ticker: "USD/IDR",
    assetClass: "Forex",
    sector: "Rupiah",
    sentiment: "bearish",
    claimType: "rumor",
    riskLevel: "medium",
    priceImpact: "Pelebaran spread jangka pendek",
    updatedAt: "3j",
    status: "completed",
    spark: [50, 51, 52, 53, 55, 54, 56, 57, 58, 60, 61, 62],
  },

  // ─ INVESTASI ILEGAL ─
  {
    id: "p9",
    title: "Robot trading 'PT Sukses Bersama' janjikan 20% profit per minggu",
    summary: "Entitas tidak terdaftar di OJK maupun Bappebti. Skema return tetap mingguan adalah ciri klasik investasi bodong/Ponzi. Sudah masuk daftar Satgas PASTI.",
    context: "Join robot trading PT Sukses Bersama, profit 20% per minggu dijamin admin. Sudah ribuan member untung!",
    result: "hoax",
    confidence: 97,
    ticker: null,
    assetClass: "Investasi Ilegal",
    sector: null,
    sentiment: "bearish",
    claimType: "investasi-ilegal",
    riskLevel: "high",
    priceImpact: "Risiko kehilangan total modal",
    updatedAt: "4j",
    status: "completed",
    spark: [30, 28, 25, 22, 18, 15, 12, 10, 8, 6, 4, 3],
  },

  // ─ MAKRO ─
  {
    id: "p10",
    title: "BI Rate dipertahankan di 5.75% dalam RDG Mei 2026",
    summary: "Klaim akurat. Hasil Rapat Dewan Gubernur BI 21-22 Mei 2026: BI Rate tetap di 5.75%, sejalan dengan ekspektasi pasar.",
    context: "BI tahan suku bunga di 5.75%. Konsisten dengan stance moneter untuk jaga stabilitas rupiah.",
    result: "valid",
    confidence: 99,
    ticker: "BI 7DRR",
    assetClass: "Makro",
    sector: "Suku Bunga ID",
    sentiment: "neutral",
    claimType: "berita-resmi",
    riskLevel: "low",
    priceImpact: "Sentimen netral, sudah priced in",
    updatedAt: "5j",
    status: "completed",
    spark: [50, 50, 50, 51, 50, 50, 51, 50, 50, 50, 51, 50],
  },

  // ─ CRYPTO ─
  {
    id: "p11",
    title: "Influencer 'X' klaim Solana akan naik 10× dalam 6 bulan",
    summary: "Klaim spekulatif tanpa dasar fundamental. Influencer terdeteksi pernah promosi 5 token rug pull lainnya. Konsisten dengan pola endorsement berbayar.",
    context: "@cryptokingid: SOL pasti 10× bro, ETF Solana mau approve, narrative AI agent gila. Beli sekarang!",
    result: "hoax",
    confidence: 82,
    ticker: "SOL",
    assetClass: "Crypto",
    sector: "L1 Chain",
    sentiment: "bearish",
    claimType: "pom-pom",
    riskLevel: "high",
    priceImpact: "Volatilitas ekstrem 24-72j ke depan",
    updatedAt: "6j",
    status: "completed",
    spark: [25, 27, 28, 26, 24, 22, 20, 18, 17, 16, 14, 13],
  },

  // ─ REGULATOR ─
  {
    id: "p12",
    title: "OJK & Bappebti rilis daftar entitas investasi ilegal Mei 2026",
    summary: "Klaim valid. Daftar Satgas PASTI per 15 Mei 2026 dapat diakses publik di situs resmi OJK. Total 38 entitas baru termasuk 12 platform crypto ilegal.",
    context: "OJK update daftar investasi ilegal — 38 entitas baru bulan ini, termasuk platform crypto tanpa izin. Cek sebelum invest!",
    result: "valid",
    confidence: 98,
    ticker: null,
    assetClass: "Makro",
    sector: "Regulasi",
    sentiment: "neutral",
    claimType: "berita-resmi",
    riskLevel: "low",
    priceImpact: "Informatif",
    updatedAt: "8j",
    status: "completed",
    spark: [10, 12, 14, 13, 15, 16, 18, 17, 19, 21, 22, 24],
  },

  // ─ SAHAM ─
  {
    id: "p13",
    title: "ANTM rampungkan program buyback saham senilai Rp 500 miliar",
    summary: "Klaim akurat. Dukungan dari keterbukaan informasi BEI dan rilis investor relation ANTM. Realisasi buyback sesuai mandat RUPSLB.",
    context: "ANTM selesaikan buyback Rp 500M. Treasury stock bertambah, EPS investor naik.",
    result: "valid",
    confidence: 94,
    ticker: "ANTM",
    assetClass: "Saham",
    sector: "Tambang",
    sentiment: "bullish",
    claimType: "corporate-action",
    riskLevel: "low",
    priceImpact: "Dukungan harga jangka pendek",
    updatedAt: "10j",
    status: "completed",
    spark: [14, 15, 14, 16, 17, 18, 17, 19, 20, 21, 22, 23],
  },

  // ─ MAKRO / GEOPOLITIK ─
  {
    id: "p14",
    title: "Rumor: ECB akan rilis stimulus quantitative easing baru Q4 2026",
    summary: "Tidak ada indikasi resmi dari Christine Lagarde maupun ECB. Stance terkini masih restrictive. Spekulasi pasar tanpa landasan.",
    context: "ECB siap luncurkan QE baru Q4 untuk topang ekonomi Eropa yang melambat. Bullish untuk risk assets.",
    result: "uncertain",
    confidence: 36,
    ticker: "EUR",
    assetClass: "Makro",
    sector: "Kebijakan ECB",
    sentiment: "neutral",
    claimType: "rumor",
    riskLevel: "medium",
    priceImpact: "Berpotensi melemahkan EUR jika terjadi",
    updatedAt: "12j",
    status: "completed",
    spark: [40, 41, 40, 42, 41, 43, 42, 41, 43, 42, 43, 42],
  },

  // ─ FOREX ─
  {
    id: "p15",
    title: "Skema 'sinyal forex VIP' jamin profit konsisten 5% per hari",
    summary: "Klaim profit konsisten harian adalah red flag matematis. Mayoritas trader retail forex kalah dalam jangka panjang. Pola match dengan signal scam.",
    context: "Subscribe channel VIP forex kami, sinyal akurat 95%, profit 5% per hari dijamin admin. Sudah ribuan member untung.",
    result: "hoax",
    confidence: 93,
    ticker: null,
    assetClass: "Investasi Ilegal",
    sector: "Sinyal Forex",
    sentiment: "bearish",
    claimType: "investasi-ilegal",
    riskLevel: "high",
    priceImpact: "Risiko 100% loss subscription + modal trading",
    updatedAt: "14j",
    status: "completed",
    spark: [22, 20, 18, 16, 14, 12, 10, 8, 7, 5, 4, 3],
  },
];

// ═════ TICKER TAPE — multi-asset live feed ═════
const TICKER_TAPE = [
  { t: "IHSG", p: "7,425", chg: +0.42, verdict: "VALID", cls: "Saham" },
  { t: "BTC", p: "98,240", chg: -1.24, verdict: "HOAKS", cls: "Crypto" },
  { t: "BBCA", p: "10,275", chg: +0.72, verdict: "VALID", cls: "Saham" },
  { t: "XAU", p: "2,438", chg: +0.86, verdict: "CEK", cls: "Komoditas" },
  { t: "USDIDR", p: "16,180", chg: +0.18, verdict: "CEK", cls: "Forex" },
  { t: "ETH", p: "3,580", chg: -0.95, verdict: "HOAKS", cls: "Crypto" },
  { t: "DJIA", p: "41,820", chg: +0.21, verdict: "VALID", cls: "Saham" },
  { t: "GOTO", p: "67", chg: -2.90, verdict: "HOAKS", cls: "Saham" },
  { t: "FFR", p: "5.25%", chg: 0.00, verdict: "CEK", cls: "Makro" },
  { t: "BI7DRR", p: "5.75%", chg: 0.00, verdict: "VALID", cls: "Makro" },
  { t: "EURUSD", p: "1.0824", chg: -0.12, verdict: "CEK", cls: "Forex" },
  { t: "SOL", p: "142", chg: -3.45, verdict: "HOAKS", cls: "Crypto" },
  { t: "WTI", p: "78.32", chg: +1.12, verdict: "VALID", cls: "Komoditas" },
  { t: "ANTM", p: "2,150", chg: +1.42, verdict: "VALID", cls: "Saham" },
];

// ═════ WATCHLIST — most-verified instruments across assets ═════
const WATCHLIST = [
  { t: "BTC", cls: "Crypto", checks: 412, valid: 84, hoax: 287 },
  { t: "GOTO", cls: "Saham", checks: 287, valid: 41, hoax: 198 },
  { t: "USDIDR", cls: "Forex", checks: 198, valid: 142, hoax: 26 },
  { t: "XAU", cls: "Komoditas", checks: 156, valid: 98, hoax: 32 },
  { t: "ETH", cls: "Crypto", checks: 248, valid: 62, hoax: 152 },
  { t: "BBCA", cls: "Saham", checks: 142, valid: 121, hoax: 8 },
  { t: "Fed Rate", cls: "Makro", checks: 124, valid: 78, hoax: 18 },
];

// ═════ QUICK-INPUT CHIPS ═════
const QUICK_INPUTS = [
  { label: "Cek pom-pom crypto", text: "Bitcoin dipastikan tembus $200,000 dalam 30 hari. Influencer X bilang masuk sekarang, ETF inflow gila!" },
  { label: "Validasi statement Fed", text: "Apakah Powell benar memberi sinyal cut 25bps di FOMC Juni 2026?" },
  { label: "Cek rumor dividen", text: "BBCA dikabarkan bagi dividen jumbo Rp 250/saham tahun buku 2025" },
  { label: "Cek investasi ilegal", text: "Robot trading PT Sukses Bersama menjanjikan profit 20% per minggu, sudah ribuan member untung" },
  { label: "Validasi target emas", text: "Emas akan tembus $3,500/oz akhir tahun, BRICS de-dolarisasi terus berlanjut" },
  { label: "Cek sinyal forex", text: "Channel VIP forex jamin profit 5% per hari, akurasi 95%, member sudah untung ratusan juta" },
];

// ═════ MOOD METER ═════
const MOOD_INDEX = {
  value: 58,
  label: "Greed",
  components: [
    { name: "Volatilitas global (VIX)", value: 52 },
    { name: "Momentum crypto", value: 64 },
    { name: "Volume hoaks 24j", value: 48 },
    { name: "Rasio bull/bear", value: 67 },
  ],
};

// ═════ AGENTS — broadened beyond stocks ═════
const TRACE_AGENTS = [
  {
    key: "exchange", name: "BEI / Exchange Data", role: "OFFICIAL · IDX & GLOBAL EXCHANGES", avatar: "🏛️", group: "regulator",
    short: "EXG",
  },
  {
    key: "regulator", name: "OJK / Bappebti", role: "REGULATOR · SATGAS PASTI · CRYPTO LICENSE", avatar: "⚖️", group: "regulator",
    short: "REG",
  },
  {
    key: "centralbank", name: "Bank Sentral", role: "CENTRAL BANK · BI · FED · ECB", avatar: "🏦", group: "regulator",
    short: "CB",
  },
  {
    key: "wire", name: "Bloomberg / Reuters", role: "GLOBAL NEWS WIRE · REAL-TIME", avatar: "📡", group: "media",
    short: "WIR",
  },
  {
    key: "media_id", name: "Media Finansial ID", role: "CNBC · KONTAN · BISNIS · INVESTOR.ID", avatar: "📰", group: "media",
    short: "MID",
  },
  {
    key: "sentimen", name: "Sentimen Komunitas", role: "STOCKBIT · CT TWITTER · TELEGRAM", avatar: "💬", group: "community",
    short: "SNT",
  },
  {
    key: "analis", name: "Analis Pasar", role: "DEEP LOGIC · MULTI-ASSET SYNTHESIS", avatar: "🧠", group: "analyst",
    short: "AI",
  },
];

// ═════ SAMPLE TRACE — Bitcoin pump claim (more interesting than stock) ═════
const SAMPLE_TRACE = {
  claim: POSTS[0], // BTC $200K hoax
  agentInsights: {
    exchange: "Data CME Bitcoin futures: open interest $42.8B, funding rate masih netral. Tidak ada lonjakan derivatif yang konsisten dengan move ke $200K dalam 30 hari.",
    regulator: "Tidak ada pelanggaran formal — namun klaim 'pasti naik X%' dapat dikategorikan sebagai market manipulation berdasarkan SEC Rule 10b-5 dan UU PPSK Indonesia.",
    centralbank: "Tidak ada signal moneter ekstrem dari Fed/ECB/BI yang dapat menjustifikasi pergerakan 90%+ BTC dalam 30 hari. Likuiditas global stabil.",
    wire: "Reuters & Bloomberg consensus: target BTC akhir 2026 mayoritas analis di $120K-$150K. Belum ada katalis konkret untuk $200K.",
    media_id: "Pemberitaan media ID seputar BTC bias netral. Tidak ada rilis korporasi atau policy change yang mendukung target $200K.",
    sentimen: "Twitter & Stockbit: keyword 'BTC 200K' melonjak 340% di 24 jam terakhir. 87% datang dari akun terverifikasi pernah promo altcoin terkait. Pola pump.",
    analis: "Sintesis multi-sumber: klaim memiliki karakteristik klasik pump scheme — target ekstrem tanpa dasar fundamental, viral di komunitas, didorong influencer dengan track record. Confidence hoax 86%.",
  },
  graph: {
    root: { label: "BTC $200K dalam 30 Hari", x: 0, y: 0 },
    sources: [
      { key: "exchange", label: "BEI / CME", x: -290, y: -160, kind: "regulator", color: "#22d3ee" },
      { key: "regulator", label: "OJK / Bappebti", x: -290, y: 50, kind: "regulator", color: "#22d3ee" },
      { key: "centralbank", label: "Bank Sentral", x: -130, y: -260, kind: "regulator", color: "#22d3ee" },
      { key: "wire", label: "Bloomberg", x: 130, y: -260, kind: "media", color: "#818cf8" },
      { key: "media_id", label: "Media ID", x: 290, y: -160, kind: "media", color: "#818cf8" },
      { key: "sentimen", label: "Sentimen", x: 290, y: 50, kind: "community", color: "#fcd34d" },
      { key: "analis", label: "Analis Pasar", x: 0, y: 220, kind: "analyst", color: "#c4b5fd" },
    ],
    score: { label: "86% HOAX", value: 86, verdict: "hoax", x: 0, y: 380 },
  },
};

// Asset class colors (for chips)
const ASSET_CLASS_COLORS = {
  "Saham": "#a5b4fc",
  "Crypto": "#fb923c",
  "Forex": "#22d3ee",
  "Komoditas": "#fcd34d",
  "Makro": "#c4b5fd",
  "Reksa Dana": "#86efac",
  "Investasi Ilegal": "#f87171",
};

// ═════ HELPERS ═════
function fmtPct(n) {
  const s = (n >= 0 ? "+" : "") + n.toFixed(2) + "%";
  return s;
}

// Export to global
Object.assign(window, {
  POSTS, ASSET_CLASSES, SECTORS_STOCK, CLAIM_TYPES, TICKER_TAPE, WATCHLIST, QUICK_INPUTS,
  MOOD_INDEX, TRACE_AGENTS, SAMPLE_TRACE, ASSET_CLASS_COLORS,
  fmtPct,
});
