"use client";

import { useState, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { QUICK_INPUTS } from "@/lib/investmentData";

export default function InputForm() {
  const [context, setContext] = useState("");
  const [ticker, setTicker] = useState("");
  const [image, setImage] = useState<string | null>(null);
  const [imageName, setImageName] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  const charLimit = 2000;
  const canSubmit = context.trim().length > 0 || image !== null;

  const handleImageFile = useCallback((file: File) => {
    if (!file.type.startsWith("image/")) {
      setError("File harus berupa gambar");
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setError("Ukuran gambar maksimal 10MB");
      return;
    }
    setError(null);
    setImageName(file.name);
    const reader = new FileReader();
    reader.onloadend = () => setImage(reader.result as string);
    reader.readAsDataURL(file);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      const file = e.dataTransfer.files[0];
      if (file) handleImageFile(file);
    },
    [handleImageFile]
  );

  const handleSubmit = async () => {
    if (!canSubmit || isSubmitting) {
      if (!canSubmit) setError("Masukkan klaim, link, atau gambar untuk divalidasi");
      return;
    }
    setIsSubmitting(true);
    setError(null);
    try {
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ context: context.trim(), image, ticker: ticker.trim() || null }),
      });
      const data = await res.json();
      if (data.status === "exist" || data.status === "initialized") {
        router.push(`/${data.post_id}`);
      } else if (data.status === "unauthorized") {
        setError("API Key tidak valid (Unauthorized).");
        setIsSubmitting(false);
      } else {
        setError("Gagal mengirim. Internal server error.");
        setIsSubmitting(false);
      }
    } catch {
      setError("Terjadi kesalahan jaringan.");
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fade-in-up" style={{ animationDelay: ".15s", maxWidth: 820, margin: "0 auto 24px" }}>
      <div className={`input-shell ${isFocused ? "focused" : ""}`}>
        <div style={{ padding: 24, position: "relative" }} className="corner-marks">
          {/* ── SUBMIT OVERLAY ── */}
          {isSubmitting && (
            <div
              className="fade-in-up"
              style={{
                position: "absolute",
                inset: 0,
                zIndex: 50,
                borderRadius: 18,
                background: "rgba(12,14,26,.96)",
                backdropFilter: "blur(12px)",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                gap: 14,
              }}
            >
              <div style={{ position: "relative", width: 88, height: 88 }}>
                <div
                  className="spin-slow"
                  style={{ position: "absolute", inset: 0, borderRadius: "50%", border: "3px solid rgba(99,102,241,.15)" }}
                />
                <div
                  style={{
                    position: "absolute",
                    inset: 8,
                    borderRadius: "50%",
                    border: "3px solid transparent",
                    borderTopColor: "#8b5cf6",
                    animation: "spinSlow 1.4s linear infinite",
                  }}
                />
                <div
                  style={{
                    position: "absolute",
                    inset: 16,
                    borderRadius: "50%",
                    border: "3px solid transparent",
                    borderLeftColor: "#34d399",
                    animation: "spinSlow 2s linear infinite reverse",
                  }}
                />
                <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <div
                    className="breathe"
                    style={{
                      width: 28,
                      height: 28,
                      borderRadius: 10,
                      background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
                      boxShadow: "0 0 30px rgba(99,102,241,.7)",
                    }}
                  />
                </div>
              </div>
              <h3 style={{ margin: 0, fontSize: 15, fontWeight: 800, color: "#fff" }}>Menghubungkan ke AI Core</h3>
              <p
                style={{
                  margin: 0,
                  fontSize: 11.5,
                  color: "rgba(255,255,255,.4)",
                  textAlign: "center",
                  maxWidth: 320,
                  lineHeight: 1.5,
                }}
              >
                Memuat agen BEI, OJK, dan kanal finansial — neural network siap menelusuri klaim Anda.
              </p>
              <div style={{ width: 200, height: 2, background: "rgba(255,255,255,.08)", borderRadius: 2, overflow: "hidden" }}>
                <div
                  className="shimmer"
                  style={{ height: "100%", width: "100%", background: "linear-gradient(90deg, transparent, #6366f1, #34d399, transparent)" }}
                />
              </div>
            </div>
          )}

          {/* HEADER */}
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
            <div
              style={{
                position: "relative",
                width: 38,
                height: 38,
                borderRadius: 12,
                background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                boxShadow: "0 6px 18px rgba(99,102,241,.4)",
              }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                <path d="M9 12l2 2 4-4" />
              </svg>
              <span className="aura-pulse" style={{ position: "absolute", inset: 0, borderRadius: 12, border: "1px solid rgba(165,180,252,.35)" }} />
            </div>
            <div>
              <h2 style={{ margin: 0, fontSize: 15, fontWeight: 800, color: "#fff" }}>Validasi Informasi Investasi</h2>
              <p style={{ margin: "2px 0 0", fontSize: 11, color: "rgba(255,255,255,.4)" }}>
                Saham · Crypto · Forex · Emas · Makro — tempel klaim, link, atau screenshot.
              </p>
            </div>
          </div>

          {/* QUICK CHIPS */}
          <div style={{ display: "flex", flexWrap: "wrap", gap: 7, marginBottom: 14 }}>
            <span className="label-tech" style={{ fontSize: 9, padding: "5px 0", marginRight: 4 }}>
              CONTOH:
            </span>
            {QUICK_INPUTS.map((q, i) => (
              <button key={i} type="button" className="qchip" onClick={() => setContext(q.text)}>
                {q.label}
              </button>
            ))}
          </div>

          {/* TEXTAREA */}
          <textarea
            className="field"
            value={context}
            onChange={(e) => {
              if (e.target.value.length <= charLimit) setContext(e.target.value);
            }}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            placeholder="Cth: 'BTC akan tembus $200K bulan ini', 'Fed cut rate Juni', 'Robot trading 20% per minggu', screenshot grup Telegram crypto, dst."
            rows={4}
          />
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 4, padding: "0 4px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span className="label-tech" style={{ fontSize: 9 }}>
                INSTRUMEN (OPSIONAL)
              </span>
              <input
                value={ticker}
                onChange={(e) => setTicker(e.target.value.toUpperCase().slice(0, 8))}
                placeholder="BBCA / BTC / XAU"
                className="mono"
                style={{
                  width: 120,
                  padding: "3px 8px",
                  fontSize: 11,
                  borderRadius: 6,
                  background: "rgba(99,102,241,.08)",
                  border: "1px solid rgba(99,102,241,.25)",
                  color: "#c7d2fe",
                  outline: "none",
                  letterSpacing: ".05em",
                }}
              />
            </div>
            <span
              className="mono"
              style={{ fontSize: 10, color: context.length > charLimit * 0.9 ? "#fcd34d" : "rgba(255,255,255,.25)" }}
            >
              {context.length} / {charLimit}
            </span>
          </div>

          {/* IMAGE DROPZONE */}
          <div
            onClick={() => fileInputRef.current?.click()}
            onDrop={handleDrop}
            onDragOver={(e) => {
              e.preventDefault();
              setIsDragging(true);
            }}
            onDragLeave={() => setIsDragging(false)}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              padding: "10px 14px",
              marginTop: 12,
              borderRadius: 12,
              cursor: "pointer",
              border: `1px dashed ${isDragging ? "rgba(99,102,241,.6)" : image ? "rgba(16,185,129,.4)" : "rgba(255,255,255,.1)"}`,
              background: isDragging ? "rgba(99,102,241,.08)" : image ? "rgba(16,185,129,.05)" : "rgba(255,255,255,.015)",
              transition: "all .25s ease",
            }}
          >
            <input
              type="file"
              ref={fileInputRef}
              accept="image/*"
              className="hidden"
              style={{ display: "none" }}
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) handleImageFile(f);
              }}
            />
            {image ? (
              <>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={image} alt="Preview" style={{ width: 44, height: 44, borderRadius: 10, objectFit: "cover", boxShadow: "0 0 0 1px rgba(16,185,129,.4)" }} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ margin: 0, fontSize: 11.5, color: "#6ee7b7", fontWeight: 600, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {imageName}
                  </p>
                  <p style={{ margin: 0, fontSize: 10, color: "rgba(255,255,255,.3)" }}>Klik untuk ganti gambar</p>
                </div>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setImage(null);
                    setImageName(null);
                  }}
                  style={{
                    width: 28,
                    height: 28,
                    borderRadius: 8,
                    background: "rgba(239,68,68,.1)",
                    border: "1px solid rgba(239,68,68,.25)",
                    color: "#fca5a5",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                  }}
                  aria-label="Hapus gambar"
                >
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="18" y1="6" x2="6" y2="18" />
                    <line x1="6" y1="6" x2="18" y2="18" />
                  </svg>
                </button>
              </>
            ) : (
              <>
                <div
                  style={{
                    width: 30,
                    height: 30,
                    borderRadius: 8,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    background: "rgba(255,255,255,.05)",
                  }}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={isDragging ? "#a5b4fc" : "rgba(255,255,255,.4)"} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
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
              </>
            )}
          </div>

          {/* SUBMIT */}
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginTop: 18 }}>
            <button className="btn-primary btn-shine" disabled={!canSubmit || isSubmitting} onClick={handleSubmit} style={{ flex: 1 }}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="22" y1="2" x2="11" y2="13" />
                <polygon points="22,2 15,22 11,13 2,9" />
              </svg>
              {isSubmitting ? "Menganalisis…" : "Analisis Sekarang"}
              <span className="mono" style={{ fontSize: 10, opacity: 0.5, marginLeft: 6 }}>
                ⏎
              </span>
            </button>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 2 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <span className="dot-bull blink" />
                <span style={{ fontSize: 10.5, color: "rgba(255,255,255,.45)", fontWeight: 600 }}>AI Online</span>
              </div>
              <span className="mono" style={{ fontSize: 9, color: "rgba(255,255,255,.25)", letterSpacing: ".05em" }}>
                6 sumber aktif
              </span>
            </div>
          </div>

          {error && (
            <div
              style={{
                marginTop: 12,
                padding: "8px 12px",
                borderRadius: 10,
                background: "rgba(239,68,68,.08)",
                border: "1px solid rgba(239,68,68,.2)",
                color: "#fca5a5",
                fontSize: 11.5,
              }}
            >
              {error}
            </div>
          )}
        </div>
      </div>

      <div style={{ marginTop: 10 }}>
        <div className="disclaimer">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
          <span>
            <b>Disclaimer:</b> NusaVerify memvalidasi informasi, <b>bukan</b> memberi rekomendasi jual/beli. Bukan nasihat investasi.
          </span>
        </div>
      </div>
    </div>
  );
}
