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
  const textRef = useRef<HTMLTextAreaElement>(null);
  const router = useRouter();

  const charLimit = 2000;
  const canSubmit = context.trim().length > 0 || image !== null;

  const handleImageFile = useCallback((file: File) => {
    if (!file.type.startsWith("image/")) {
      setError("File harus berupa gambar (PNG atau JPG).");
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setError("Ukuran gambar maksimal 10MB.");
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
      if (!canSubmit) setError("Tulis klaim, tempel link, atau lampirkan screenshot dulu.");
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
        setError("API key server tidak valid. Periksa X_API_KEY di environment.");
        setIsSubmitting(false);
      } else {
        setError("Klaim gagal dikirim karena server bermasalah. Coba lagi sebentar lagi.");
        setIsSubmitting(false);
      }
    } catch {
      setError("Koneksi terputus. Periksa internet Anda lalu coba lagi.");
      setIsSubmitting(false);
    }
  };

  return (
    <div id="cek" className="hero-composer rise-in" style={{ animationDelay: ".35s" }}>
      <div
        className={`composer lg ${isFocused ? "focused" : ""} ${isDragging ? "dragging" : ""}`}
        onDrop={handleDrop}
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={(e) => {
          if (!e.currentTarget.contains(e.relatedTarget as Node)) setIsDragging(false);
        }}
      >
        {isSubmitting && (
          <div
            className="fade-in-up"
            role="status"
            style={{
              position: "absolute",
              inset: 0,
              zIndex: 20,
              borderRadius: "inherit",
              background: "rgba(8,10,18,.82)",
              backdropFilter: "blur(14px)",
              WebkitBackdropFilter: "blur(14px)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 18,
              padding: 24,
            }}
          >
            <span style={{ position: "relative", width: 44, height: 44, flexShrink: 0 }}>
              <span
                style={{
                  position: "absolute",
                  inset: 0,
                  borderRadius: "50%",
                  border: "2px solid rgba(233,200,145,.18)",
                  borderTopColor: "var(--champagne)",
                  animation: "spinSlow 1s linear infinite",
                }}
              />
              <span
                style={{
                  position: "absolute",
                  inset: 9,
                  borderRadius: "50%",
                  border: "2px solid transparent",
                  borderLeftColor: "var(--sapphire-2)",
                  animation: "spinSlow 1.6s linear infinite reverse",
                }}
              />
            </span>
            <span>
              <span className="h-display" style={{ display: "block", fontSize: 17 }}>
                Mengirim klaim ke agen
              </span>
              <span style={{ display: "block", marginTop: 4, fontSize: 13, color: "var(--fg-3)" }}>
                Agen BEI, OJK, dan media finansial sedang disiapkan.
              </span>
            </span>
          </div>
        )}

        <div className="composer-well">
          <label htmlFor="claim" className="sr-only">
            Klaim investasi yang ingin dicek
          </label>
          <textarea
            id="claim"
            ref={textRef}
            className="field"
            value={context}
            onChange={(e) => {
              if (e.target.value.length <= charLimit) setContext(e.target.value);
            }}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
                e.preventDefault();
                handleSubmit();
              }
            }}
            placeholder="Tempel klaim, link, atau caption — mis. “Robot trading ini jamin profit 20% per minggu”"
            rows={3}
          />

          {image && (
            <div
              className="fade-in-up"
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                marginTop: 10,
                padding: 6,
                paddingRight: 8,
                borderRadius: 16,
                background: "rgba(255,255,255,.05)",
                boxShadow: "inset 0 0 0 1px rgba(255,255,255,.07)",
                maxWidth: 360,
              }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={image} alt="Pratinjau lampiran" style={{ width: 40, height: 40, borderRadius: 11, objectFit: "cover" }} />
              <span style={{ flex: 1, minWidth: 0 }}>
                <span style={{ display: "block", fontSize: 13, color: "var(--fg)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {imageName}
                </span>
                <span style={{ display: "block", fontSize: 11.5, color: "var(--fg-4)" }}>Gambar terlampir</span>
              </span>
              <button
                type="button"
                onClick={() => {
                  setImage(null);
                  setImageName(null);
                  if (fileInputRef.current) fileInputRef.current.value = "";
                }}
                aria-label="Hapus gambar"
                style={{
                  width: 28,
                  height: 28,
                  borderRadius: 999,
                  border: 0,
                  background: "rgba(255,255,255,.08)",
                  color: "var(--fg-2)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}
              >
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>
          )}

          <div className="composer-bar">
            <input
              type="file"
              ref={fileInputRef}
              accept="image/*"
              style={{ display: "none" }}
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) handleImageFile(f);
              }}
            />
            <button type="button" className="tool-btn" onClick={() => fileInputRef.current?.click()} aria-label="Lampirkan screenshot">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21.44 11.05l-9.19 9.19a6 6 0 01-8.49-8.49l9.19-9.19a4 4 0 015.66 5.66l-9.2 9.19a2 2 0 01-2.83-2.83l8.49-8.48" />
              </svg>
              <span className="hidden sm:inline">Screenshot</span>
            </button>
            <label className="sr-only" htmlFor="ticker">
              Kode instrumen (opsional)
            </label>
            <input
              id="ticker"
              className="ticker-input"
              value={ticker}
              onChange={(e) => setTicker(e.target.value.toUpperCase().slice(0, 8))}
              placeholder="$TICKER"
            />

            <span style={{ flex: 1 }} />

            <span
              className="mono hidden sm:inline"
              style={{ fontSize: 11.5, color: context.length > charLimit * 0.9 ? "var(--neu-2)" : "var(--fg-4)" }}
            >
              {context.length}/{charLimit}
            </span>
            <button
              type="button"
              className="btn-pearl"
              disabled={!canSubmit || isSubmitting}
              onClick={handleSubmit}
              style={{ padding: "10px 20px" }}
            >
              Verifikasi
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="5" y1="12" x2="19" y2="12" />
                <polyline points="12 5 19 12 12 19" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {error && (
        <div
          role="alert"
          className="fade-in-up"
          style={{
            marginTop: 12,
            padding: "10px 16px",
            borderRadius: 16,
            background: "rgba(239,68,68,.1)",
            boxShadow: "inset 0 0 0 1px rgba(239,68,68,.25)",
            color: "#fca5a5",
            fontSize: 13,
          }}
        >
          {error}
        </div>
      )}

      <div className="hero-chips">
        <span className="eyebrow" style={{ marginRight: 4 }}>
          Coba
        </span>
        {QUICK_INPUTS.map((q) => (
          <button
            key={q.label}
            type="button"
            className="qchip"
            onClick={() => {
              setContext(q.text);
              setError(null);
              textRef.current?.focus();
            }}
          >
            {q.label}
          </button>
        ))}
      </div>

      <p className="hero-note">
        <span className="mono">Ctrl ⏎</span> untuk kirim · NusaVerify memvalidasi informasi, bukan memberi rekomendasi jual/beli.
      </p>
    </div>
  );
}
