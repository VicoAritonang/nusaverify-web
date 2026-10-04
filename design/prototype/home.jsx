// home.jsx — Home / Landing page
const { useState: useStateH, useEffect: useEffectH, useRef: useRefH, useMemo: useMemoH } = React;

// ═════ Nav strip ═════
function NavStrip({ onLogoClick }) {
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 0" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12, cursor: "pointer" }} onClick={onLogoClick}>
        <Logo size={36} />
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ fontSize: 16, fontWeight: 800, letterSpacing: "-.02em" }}>
              Nusa<span style={{ color: "#a5b4fc" }}>Verify</span>
            </span>
            <span className="mono up" style={{
              fontSize: 9, padding: "1px 5px", borderRadius: 4,
              background: "rgba(255,255,255,.05)", border: "1px solid rgba(255,255,255,.08)",
              color: "rgba(255,255,255,.4)", letterSpacing: ".1em",
            }}>
              v2.0 · MULTI-ASSET
            </span>
          </div>
          <div className="label-tech" style={{ marginTop: 2, fontSize: 9 }}>AI Investment Intelligence · Saham · Crypto · Forex · Makro</div>
        </div>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <span className="dot-bull blink" />
          <span style={{ fontSize: 11, color: "rgba(255,255,255,.5)" }}>AI Core Online</span>
        </div>
        <div className="mono up" style={{ fontSize: 10, color: "rgba(255,255,255,.3)", letterSpacing: ".1em" }}>
          7 SUMBER · 2,841 KLAIM HARI INI
        </div>
      </div>
    </div>
  );
}

// ═════ Hero ═════
function Hero() {
  return (
    <header className="fade-in-down" style={{ textAlign: "center", marginBottom: 24, padding: "20px 0 18px" }}>
      <div style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", marginBottom: 16 }}>
        <Logo size={64} />
      </div>
      <div className="chip up" style={{
        display: "inline-flex", marginBottom: 14, padding: "5px 12px",
        background: "rgba(99,102,241,.13)", border: "1px solid rgba(99,102,241,.3)", color: "#c7d2fe",
        fontSize: 10, letterSpacing: ".15em",
      }}>
        <span className="dot-bull blink" style={{ background: "#a5b4fc", boxShadow: "0 0 8px rgba(165,180,252,.6)" }} />
        AI INVESTMENT INTELLIGENCE · MULTI-ASSET VALIDATION
      </div>
      <h1 className="h-display" style={{ fontSize: "clamp(40px,6vw,68px)", margin: "0 0 10px" }}>
        <span style={{
          background: "linear-gradient(90deg, #fff 0%, #c7d2fe 40%, #a5f3fc 70%, #fff 100%)",
          WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
          backgroundClip: "text", color: "transparent",
        }} className="gradient-shift">
          Nusa<span style={{ fontWeight: 800 }}>Verify</span>
        </span>
      </h1>
      <p style={{ color: "rgba(255,255,255,.5)", maxWidth: 620, margin: "0 auto", fontSize: 14, lineHeight: 1.6 }}>
        Validasi <b style={{ color: "#a5b4fc" }}>klaim investasi lintas-aset</b> — saham, crypto, forex,
        emas, dan kebijakan moneter — melalui AI agent multi-sumber yang menelusuri BEI, OJK, Bappebti,
        Bloomberg, Reuters, dan bank sentral — real-time.
      </p>
    </header>
  );
}

// ═════ Market Pulse row (Mood + Watchlist) ═════
function MarketPulse({ onTickerClick }) {
  return (
    <div className="fade-in-up" style={{
      display: "grid", gridTemplateColumns: "minmax(340px,1.2fr) minmax(380px,1fr)",
      gap: 14, marginBottom: 24,
    }}>
      <MoodMeter />
      <Watchlist onTickerClick={onTickerClick} />
    </div>
  );
}

// ═════ Input Form ═════
function InputForm({ onSubmit, prefill }) {
  const [context, setContext] = useStateH(prefill || "");
  const [isSubmitting, setIsSubmitting] = useStateH(false);
  const [isFocused, setIsFocused] = useStateH(false);
  const [error, setError] = useStateH(null);
  const [includeTicker, setIncludeTicker] = useStateH("");
  const charLimit = 2000;

  useEffectH(() => { if (prefill !== undefined) setContext(prefill || ""); }, [prefill]);

  const canSubmit = context.trim().length > 0;

  const handleSubmit = () => {
    if (!canSubmit || isSubmitting) return;
    setIsSubmitting(true); setError(null);
    setTimeout(() => {
      onSubmit({ context: context.trim(), ticker: includeTicker.trim() || null });
    }, 1400);
  };

  return (
    <div className="fade-in-up" style={{ animationDelay: ".15s", maxWidth: 820, margin: "0 auto 24px" }}>
      <div className={`input-shell ${isFocused ? "focused" : ""}`}>
        <div style={{ padding: 24, position: "relative" }}>
          {/* Overlay during submit */}
          {isSubmitting && (
            <div className="fade-in-up" style={{
              position: "absolute", inset: 0, zIndex: 50, borderRadius: 18,
              background: "rgba(12,14,26,.96)", backdropFilter: "blur(12px)",
              display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 14,
            }}>
              <div style={{ position: "relative", width: 88, height: 88 }}>
                <div className="spin-slow" style={{
                  position: "absolute", inset: 0, borderRadius: "50%",
                  border: "3px solid rgba(99,102,241,.15)",
                }} />
                <div style={{
                  position: "absolute", inset: 8, borderRadius: "50%",
                  border: "3px solid transparent", borderTopColor: "#8b5cf6",
                  animation: "spinSlow 1.4s linear infinite",
                }} />
                <div style={{
                  position: "absolute", inset: 16, borderRadius: "50%",
                  border: "3px solid transparent", borderLeftColor: "#34d399",
                  animation: "spinSlow 2s linear infinite reverse",
                }} />
                <div style={{
                  position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center",
                }}>
                  <div style={{
                    width: 28, height: 28, borderRadius: 10,
                    background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
                    boxShadow: "0 0 30px rgba(99,102,241,.7)",
                  }} className="breathe" />
                </div>
              </div>
              <h3 style={{ margin: 0, fontSize: 15, fontWeight: 800, color: "#fff" }}>
                Menghubungkan ke AI Core
              </h3>
              <p style={{ margin: 0, fontSize: 11.5, color: "rgba(255,255,255,.4)", textAlign: "center", maxWidth: 320, lineHeight: 1.5 }}>
                Memuat agen IDX, OJK, dan kanal finansial — neural network siap menelusuri klaim Anda.
              </p>
              <div style={{ width: 200, height: 2, background: "rgba(255,255,255,.08)", borderRadius: 2, overflow: "hidden" }}>
                <div className="shimmer" style={{
                  height: "100%", width: "100%",
                  background: "linear-gradient(90deg, transparent, #6366f1, #34d399, transparent)",
                }} />
              </div>
            </div>
          )}

          {/* Header */}
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
            <div style={{
              position: "relative", width: 38, height: 38, borderRadius: 12,
              background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
              display: "flex", alignItems: "center", justifyContent: "center",
              boxShadow: "0 6px 18px rgba(99,102,241,.4)",
            }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.2"
                strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                <path d="M9 12l2 2 4-4" />
              </svg>
              <span style={{
                position: "absolute", inset: 0, borderRadius: 12, border: "1px solid rgba(165,180,252,.35)",
              }} className="aura-pulse" />
            </div>
            <div>
              <h2 style={{ margin: 0, fontSize: 15, fontWeight: 800, color: "#fff" }}>
                Validasi Informasi Investasi
              </h2>
              <p style={{ margin: 2, fontSize: 11, color: "rgba(255,255,255,.4)" }}>
                Saham · Crypto · Forex · Emas · Makro — tempel klaim, link, atau screenshot.
              </p>
            </div>
          </div>

          {/* Quick-input chips */}
          <div style={{ display: "flex", flexWrap: "wrap", gap: 7, marginBottom: 14 }}>
            <span className="label-tech" style={{ fontSize: 9, padding: "5px 0", marginRight: 4 }}>CONTOH:</span>
            {window.QUICK_INPUTS.map((q, i) => (
              <button key={i} className="qchip" onClick={() => setContext(q.text)}>
                {q.label}
              </button>
            ))}
          </div>

          {/* Textarea */}
          <textarea
            className="field"
            value={context}
            onChange={(e) => { if (e.target.value.length <= charLimit) setContext(e.target.value); }}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            placeholder="Cth: 'BTC akan tembus $200K bulan ini', 'Fed cut rate Juni', 'Robot trading 20% per minggu', screenshot grup Telegram crypto, dst."
            rows={4}
          />
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 4, padding: "0 4px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span className="label-tech" style={{ fontSize: 9 }}>INSTRUMEN (OPSIONAL)</span>
              <input
                value={includeTicker}
                onChange={(e) => setIncludeTicker(e.target.value.toUpperCase().slice(0, 8))}
                placeholder="BBCA / BTC / XAU"
                className="mono"
                style={{
                  width: 110, padding: "3px 8px", fontSize: 11, borderRadius: 6,
                  background: "rgba(99,102,241,.08)", border: "1px solid rgba(99,102,241,.25)",
                  color: "#c7d2fe", outline: "none", letterSpacing: ".05em",
                }}
              />
            </div>
            <span className={`mono`} style={{
              fontSize: 10,
              color: context.length > charLimit * 0.9 ? "#fcd34d" : "rgba(255,255,255,.25)",
            }}>
              {context.length} / {charLimit}
            </span>
          </div>

          {/* Image upload affordance — visual only */}
          <div style={{
            display: "flex", alignItems: "center", gap: 10,
            padding: "10px 14px", marginTop: 12, borderRadius: 12,
            border: "1px dashed rgba(255,255,255,.08)", background: "rgba(255,255,255,.015)",
          }}>
            <div style={{
              width: 30, height: 30, borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center",
              background: "rgba(255,255,255,.05)",
            }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,.4)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="3" width="18" height="18" rx="2" />
                <circle cx="8.5" cy="8.5" r="1.5" />
                <polyline points="21,15 16,10 5,21" />
              </svg>
            </div>
            <div>
              <p style={{ margin: 0, fontSize: 11.5, color: "rgba(255,255,255,.45)", fontWeight: 500 }}>
                Lampirkan gambar <span style={{ color: "rgba(255,255,255,.25)" }}>(opsional)</span>
              </p>
              <p style={{ margin: 0, fontSize: 10, color: "rgba(255,255,255,.2)" }}>
                Screenshot grup Telegram/WA, postingan influencer, headline Bloomberg/Reuters · PNG/JPG · maks 10MB
              </p>
            </div>
          </div>

          {/* Submit */}
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginTop: 18 }}>
            <button
              className="btn-primary"
              disabled={!canSubmit || isSubmitting}
              onClick={handleSubmit}
              style={{ flex: 1 }}
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="22" y1="2" x2="11" y2="13" />
                <polygon points="22,2 15,22 11,13 2,9" />
              </svg>
              {isSubmitting ? "Menganalisis…" : "Analisis Sekarang"}
              <span className="mono" style={{ fontSize: 10, opacity: .5, marginLeft: 6 }}>⏎</span>
            </button>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 2 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <span className="dot-bull blink" />
                <span style={{ fontSize: 10.5, color: "rgba(255,255,255,.45)", fontWeight: 600 }}>AI Online</span>
              </div>
              <span className="mono" style={{ fontSize: 9, color: "rgba(255,255,255,.25)", letterSpacing: ".05em" }}>
                7 sumber aktif
              </span>
            </div>
          </div>

          {error && (
            <div style={{
              marginTop: 12, padding: "8px 12px", borderRadius: 10,
              background: "rgba(239,68,68,.08)", border: "1px solid rgba(239,68,68,.2)",
              color: "#fca5a5", fontSize: 11.5,
            }}>
              {error}
            </div>
          )}
        </div>
      </div>

      <div style={{ marginTop: 10 }}>
        <div className="disclaimer">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
          <span><b>Disclaimer:</b> NusaVerify memvalidasi informasi, <b>bukan</b> memberi rekomendasi jual/beli. Bukan nasihat investasi.</span>
        </div>
      </div>
    </div>
  );
}

// ═════ Posts Grid (3 layout modes) ═════
function PostsGrid({ posts, onCardClick, layout = "columns" }) {
  const [filter, setFilter] = useStateH("Semua");
  const assetClasses = useMemoH(() => {
    const set = new Set();
    posts.forEach((p) => p.assetClass && set.add(p.assetClass));
    return ["Semua", ...Array.from(set)];
  }, [posts]);

  const filtered = useMemoH(() => {
    if (filter === "Semua") return posts;
    return posts.filter((p) => p.assetClass === filter);
  }, [posts, filter]);

  const cols = {
    valid: filtered.filter((p) => p.result === "valid"),
    hoax: filtered.filter((p) => p.result === "hoax"),
    uncertain: filtered.filter((p) => p.result === "uncertain"),
  };

  return (
    <div className="fade-in-up" style={{ animationDelay: ".25s" }}>
      <div style={{
        display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 18,
        flexWrap: "wrap", gap: 10,
      }}>
        <div>
          <h2 className="h-section" style={{ margin: 0, color: "#fff" }}>Verifikasi Terbaru</h2>
          <div className="label-tech" style={{ marginTop: 2 }}>
            {filtered.length} klaim · live polling
          </div>
        </div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
          {assetClasses.map((s) => {
            const c = window.ASSET_CLASS_COLORS[s];
            const isActive = filter === s;
            return (
              <button key={s}
                onClick={() => setFilter(s)}
                className="qchip"
                style={isActive ? {
                  background: c ? `${c}22` : "rgba(99,102,241,.15)",
                  borderColor: c ? `${c}55` : "rgba(99,102,241,.4)",
                  color: c || "#c7d2fe",
                } : null}
              >
                {s !== "Semua" && c && (
                  <span style={{ width: 6, height: 6, borderRadius: 2, background: c, marginRight: 4, display: "inline-block" }} />
                )}
                {s}
              </button>
            );
          })}
        </div>
      </div>

      {layout === "columns" && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, minmax(0,1fr))", gap: 18 }}>
          {[
            { key: "valid", title: "Terverifikasi", cls: "v", items: cols.valid, count: cols.valid.length },
            { key: "hoax", title: "Misinformasi", cls: "h", items: cols.hoax, count: cols.hoax.length },
            { key: "uncertain", title: "Belum Pasti", cls: "u", items: cols.uncertain, count: cols.uncertain.length },
          ].map((c) => (
            <div key={c.key}>
              <div className={`col-head ${c.cls}`}>
                <span>{c.title}</span>
                <span className="mono" style={{ fontSize: 11, opacity: .7 }}>· {c.count}</span>
              </div>
              <div className="stg" style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {c.items.map((p, i) => (
                  <PostCard key={p.id} post={p} index={i} onClick={onCardClick} />
                ))}
                {c.items.length === 0 && (
                  <div style={{
                    padding: 24, textAlign: "center", color: "rgba(255,255,255,.2)", fontSize: 11,
                    border: "1px dashed rgba(255,255,255,.06)", borderRadius: 14,
                  }}>
                    Tidak ada hasil
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {layout === "timeline" && (
        <div className="stg" style={{ display: "flex", flexDirection: "column", gap: 0 }}>
          {filtered.map((p, i) => {
            const m = RESULT_META[p.result];
            return (
              <div key={p.id} className="timeline-item card-entrance" style={{ animationDelay: `${i * 0.05}s` }}>
                <span className="timeline-dot" style={{ color: m.color }} />
                <div className="mono" style={{ fontSize: 10, color: "rgba(255,255,255,.35)", letterSpacing: ".05em", marginBottom: 6 }}>
                  {p.updatedAt.toUpperCase()} · <span style={{ color: m.color }}>{m.label}</span>
                </div>
                <div onClick={() => onCardClick && onCardClick(p)} style={{ cursor: "pointer" }}>
                  <PostCard post={p} index={0} onClick={onCardClick} />
                </div>
              </div>
            );
          })}
        </div>
      )}

      {layout === "heatmap" && (
        <HeatmapView posts={filtered} onCardClick={onCardClick} />
      )}
    </div>
  );
}

// ═════ Heatmap view (cells per ticker, grouped by sector) ═════
function HeatmapView({ posts, onCardClick }) {
  const bySector = useMemoH(() => {
    const acc = {};
    posts.forEach((p) => {
      const s = p.assetClass || "— Lainnya —";
      if (!acc[s]) acc[s] = [];
      acc[s].push(p);
    });
    return acc;
  }, [posts]);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
      {Object.entries(bySector).map(([sector, items]) => (
        <div key={sector} className="glass-elev corner-marks" style={{ borderRadius: 16, padding: 16 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
            <span className="up" style={{ fontSize: 11, fontWeight: 700, letterSpacing: ".15em", color: "rgba(255,255,255,.7)" }}>
              {sector}
            </span>
            <span className="mono" style={{ fontSize: 10, color: "rgba(255,255,255,.3)" }}>
              {items.length} klaim
            </span>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))", gap: 8 }}>
            {items.map((p) => {
              const m = RESULT_META[p.result];
              return (
                <div key={p.id} className={`heatmap-cell ${m.glow} card-entrance`} onClick={() => onCardClick && onCardClick(p)}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 6 }}>
                    {p.ticker ? (
                      <span className="mono" style={{ fontSize: 12, fontWeight: 800, color: "#fff", letterSpacing: ".02em" }}>
                        {p.ticker}
                      </span>
                    ) : (
                      <span className="mono" style={{ fontSize: 11, color: "rgba(255,255,255,.6)" }}>—</span>
                    )}
                    <span style={{ color: m.color, fontWeight: 800, fontSize: 12 }}>{m.icon}</span>
                  </div>
                  <div>
                    <Sparkline points={p.spark} color={m.color} width={120} height={18} />
                    <div className="mono" style={{ fontSize: 9.5, color: "rgba(255,255,255,.5)", marginTop: 4 }}>
                      {Math.round(p.confidence)}% · {p.updatedAt}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}

// ═════ Footer ═════
function Footer() {
  return (
    <footer style={{ marginTop: 60, paddingBottom: 28, textAlign: "center" }} className="fade-in-up">
      <div className="glass" style={{ borderRadius: 16, padding: "16px 22px", maxWidth: 540, margin: "0 auto" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 10, marginBottom: 8 }}>
          <Logo size={24} />
          <span style={{ fontSize: 12, fontWeight: 700, color: "rgba(255,255,255,.55)" }}>NusaVerify Investment Intelligence</span>
        </div>
        <p style={{ margin: "0 0 4px", fontSize: 10.5, color: "rgba(255,255,255,.3)" }}>
          AI Multi-Source Engine · 7 agen: BEI · OJK/Bappebti · Bank Sentral · Bloomberg/Reuters · Media ID · Sentimen · Analis
        </p>
        <p style={{ margin: 0, fontSize: 10, color: "rgba(255,255,255,.18)" }}>
          © 2026 NusaVerify · Hackathon BI · <b>Bukan nasihat investasi</b> · All systems nominal
        </p>
      </div>
    </footer>
  );
}

// ═════ Home Page (composes everything) ═════
function HomePage({ onCardClick, onSubmit, layout, prefill }) {
  return (
    <>
      <div className="wrap">
        <NavStrip />
      </div>
      <TickerTape />
      <div className="wrap" style={{ paddingTop: 24 }}>
        <Hero />
        <MarketPulse onTickerClick={(t) => {}} />
        <InputForm onSubmit={onSubmit} prefill={prefill} />
        <PostsGrid posts={window.POSTS} onCardClick={onCardClick} layout={layout} />
        <Footer />
      </div>
    </>
  );
}

Object.assign(window, { HomePage });
