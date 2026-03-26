"use client";

import { useState, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";

export default function InputForm() {
  const [context, setContext] = useState("");
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
    if (!file.type.startsWith("image/")) { setError("File harus berupa gambar"); return; }
    if (file.size > 10 * 1024 * 1024) { setError("Ukuran gambar maksimal 10MB"); return; }
    setError(null);
    setImageName(file.name);
    const reader = new FileReader();
    reader.onloadend = () => setImage(reader.result as string);
    reader.readAsDataURL(file);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault(); setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleImageFile(file);
  }, [handleImageFile]);

  const handleSubmit = async () => {
    if (!canSubmit) { setError("Masukkan teks atau gambar untuk dianalisis"); return; }
    setIsSubmitting(true); setError(null);
    try {
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ context: context.trim(), image }),
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
    <div className="w-full max-w-3xl mx-auto animate-fade-in-up" style={{ animationDelay: "0.15s" }}>
      <div
        className={`relative rounded-2xl transition-all duration-500 ${
          isFocused
            ? "shadow-[0_0_0_1px_rgba(99,102,241,0.5),0_0_40px_rgba(99,102,241,0.15)]"
            : "shadow-[0_0_0_1px_rgba(255,255,255,0.07),0_8px_32px_rgba(0,0,0,0.4)]"
        }`}
        style={{ background: "rgba(12,14,26,0.85)", backdropFilter: "blur(24px)" }}
      >
        {/* Animated top border */}
        <div
          className="absolute top-0 left-8 right-8 h-px rounded-full transition-opacity duration-500"
          style={{
            background: isFocused
              ? "linear-gradient(90deg, transparent, rgba(99,102,241,0.8), rgba(168,85,247,0.6), transparent)"
              : "linear-gradient(90deg, transparent, rgba(255,255,255,0.15), transparent)",
          }}
        />

        <div className="p-6 relative">
          
          {/* ── PREPARATION OVERLAY ── */}
          {isSubmitting && (
            <div className="absolute inset-0 z-50 flex flex-col items-center justify-center rounded-2xl bg-[#0c0e1a]/95 backdrop-blur-md animate-fade-in-up">
              <div className="relative w-24 h-24 mb-6">
                {/* Robot / Core animation */}
                <div className="absolute inset-0 rounded-full border-4 border-indigo-500/20 animate-[spin_3s_linear_infinite]" />
                <div className="absolute inset-2 rounded-full border-4 border-t-purple-500 border-r-transparent border-b-transparent border-l-transparent animate-[spin_1.5s_cubic-bezier(0.5,0.1,0.5,0.9)_infinite]" />
                <div className="absolute inset-4 rounded-full border-4 border-l-emerald-400 border-t-transparent border-r-transparent border-b-transparent animate-[spin_2s_linear_infinite_reverse]" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 shadow-[0_0_30px_rgba(99,102,241,0.8)] animate-pulse" />
                </div>
                {/* Floating data particles */}
                <div className="absolute top-0 left-0 w-2 h-2 rounded-full bg-emerald-400 animate-ping" style={{ animationDuration: '2s' }} />
                <div className="absolute bottom-0 right-0 w-1.5 h-1.5 rounded-full bg-purple-400 animate-ping" style={{ animationDelay: '0.7s', animationDuration: '1.5s' }} />
              </div>
              
              <h3 className="text-white font-bold text-lg mb-2 flex items-center gap-2">
                Menghubungkan ke AI Core
                <span className="flex gap-0.5">
                  <span className="w-1 h-1 rounded-full bg-white/60 animate-bounce" style={{ animationDelay: '0ms' }} />
                  <span className="w-1 h-1 rounded-full bg-white/60 animate-bounce" style={{ animationDelay: '150ms' }} />
                  <span className="w-1 h-1 rounded-full bg-white/60 animate-bounce" style={{ animationDelay: '300ms' }} />
                </span>
              </h3>
              <p className="text-white/40 text-xs font-medium max-w-[250px] text-center leading-relaxed">
                Mempersiapkan agen analisis, mengecek database global, dan menginisiasi neural network.
              </p>
              
              {/* Progress bar mock */}
              <div className="w-48 h-1 bg-white/10 rounded-full mt-6 overflow-hidden">
                <div className="h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-emerald-400 animate-[shimmer_2s_infinite] w-full" style={{ backgroundSize: '200% 100%' }} />
              </div>
            </div>
          )}

          {/* Header */}
          <div className="flex items-center gap-3 mb-5">
            <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-600 to-purple-700 shadow-lg shadow-indigo-900/60 shrink-0">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                <path d="M9 12l2 2 4-4"/>
              </svg>
              <span className="absolute inset-0 rounded-xl border border-indigo-400/30 animate-ping" style={{ animationDuration: "2.5s" }} />
            </div>
            <div>
              <h2 className="font-bold text-white text-[15px] leading-tight">Verifikasi Fakta</h2>
              <p className="text-white/35 text-[11px]">Masukkan klaim, link berita, atau gambar — bisa dikombinasikan</p>
            </div>
          </div>

          {/* Textarea */}
          <textarea
            id="analysis-input"
            value={context}
            onChange={(e) => { if (e.target.value.length <= charLimit) setContext(e.target.value); }}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            placeholder="Tulis klaim, tempel link berita, atau deskripsikan konten yang ingin diverifikasi..."
            rows={4}
            className="w-full rounded-xl px-4 py-3.5 text-sm text-white resize-none outline-none transition-all duration-300 placeholder-white/20 font-medium leading-relaxed"
            style={{
              background: "rgba(255,255,255,0.04)",
              border: isFocused ? "1px solid rgba(99,102,241,0.4)" : "1px solid rgba(255,255,255,0.07)",
              caretColor: "#818cf8",
            }}
          />
          <div className="flex justify-end mt-1 px-1 mb-3">
            <span className={`text-[10px] font-mono ${context.length > charLimit * 0.9 ? "text-amber-400/70" : "text-white/20"}`}>
              {context.length} / {charLimit}
            </span>
          </div>

          {/* Image upload — always visible, optional */}
          <div
            className={`relative rounded-xl border border-dashed transition-all duration-300 cursor-pointer overflow-hidden ${
              isDragging
                ? "border-indigo-400/60 bg-indigo-500/8 scale-[1.01]"
                : image
                ? "border-emerald-500/35 bg-emerald-500/5"
                : "border-white/8 hover:border-white/15 hover:bg-white/[0.02]"
            }`}
            onClick={() => fileInputRef.current?.click()}
            onDrop={handleDrop}
            onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
            onDragLeave={() => setIsDragging(false)}
          >
            <input type="file" ref={fileInputRef} accept="image/*" className="hidden"
              onChange={(e) => { const f = e.target.files?.[0]; if (f) handleImageFile(f); }} />

            {image ? (
              <div className="flex items-center gap-4 px-4 py-3">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={image} alt="Preview" className="w-14 h-14 rounded-xl object-cover ring-1 ring-emerald-500/30" />
                <div className="flex-1 min-w-0">
                  <p className="text-emerald-300 font-medium text-xs truncate">{imageName}</p>
                  <p className="text-white/30 text-[10px] mt-0.5">Klik untuk ganti</p>
                </div>
                <button
                  onClick={(e) => { e.stopPropagation(); setImage(null); setImageName(null); }}
                  className="flex items-center justify-center w-7 h-7 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500/20 transition-colors shrink-0"
                >
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                  </svg>
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-3 px-4 py-3">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all shrink-0 ${isDragging ? "bg-indigo-500/20" : "bg-white/5"}`}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={isDragging ? "#818cf8" : "rgba(255,255,255,0.2)"} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21,15 16,10 5,21"/>
                  </svg>
                </div>
                <div>
                  <p className="text-white/30 text-xs font-medium">Lampirkan gambar <span className="text-white/18 font-normal">(opsional)</span></p>
                  <p className="text-white/15 text-[10px]">Seret atau klik · PNG, JPG, WEBP · maks 10MB</p>
                </div>
              </div>
            )}
          </div>

          {/* Error */}
          {error && (
            <div className="mt-3 flex items-center gap-2.5 text-red-300 text-xs bg-red-500/8 border border-red-500/20 rounded-xl px-4 py-2.5 animate-fade-in-up">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0">
                <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
              </svg>
              {error}
            </div>
          )}

          {/* Submit row */}
          <div className="mt-4 flex items-center gap-3">
            <button
              id="submit-analysis"
              onClick={handleSubmit}
              disabled={isSubmitting || !canSubmit}
              className={`relative flex-1 py-3 px-6 rounded-xl font-bold text-sm transition-all duration-300 flex items-center justify-center gap-2.5 overflow-hidden ${
                isSubmitting
                  ? "bg-indigo-600/40 text-white/50 cursor-wait"
                  : !canSubmit
                  ? "bg-white/5 text-white/20 cursor-not-allowed"
                  : "bg-gradient-to-r from-indigo-600 to-purple-600 text-white hover:from-indigo-500 hover:to-purple-500 hover:shadow-lg hover:shadow-indigo-900/60 active:scale-[0.98]"
              }`}
            >
              {isSubmitting ? (
                <>
                  <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeDasharray="31.4" strokeDashoffset="10" strokeLinecap="round"/>
                  </svg>
                  Menganalisis...
                </>
              ) : (
                <>
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="22" y1="2" x2="11" y2="13"/><polygon points="22,2 15,22 11,13 2,9"/>
                  </svg>
                  Analisis Sekarang
                </>
              )}
            </button>
            <div className="flex flex-col items-center gap-0.5 px-2 shrink-0">
              <div className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-[10px] text-white/25 font-medium">AI Online</span>
              </div>
              <span className="text-[9px] text-white/15">Multi-source</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
