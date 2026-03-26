"use client";

import { useEffect, useState } from "react";

interface OEmbedData {
  title?: string;
  author_name?: string;
  author_url?: string;
  thumbnail_url?: string;
}

function extractInstagramId(url: string): string | null {
  // Match /p/CODE, /reel/CODE, /tv/CODE patterns
  const match = url.match(/instagram\.com\/(?:p|reel|tv)\/([A-Za-z0-9_-]+)/);
  return match ? match[1] : null;
}

export default function InstagramPreview({ url }: { url: string }) {
  const [meta, setMeta] = useState<OEmbedData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const shortcode = extractInstagramId(url);

  useEffect(() => {
    if (!shortcode) {
      setLoading(false);
      setError(true);
      return;
    }

    const fetchOEmbed = async () => {
      try {
        // Use noembed proxy to avoid CORS issues
        const res = await fetch(
          `https://noembed.com/embed?url=${encodeURIComponent(url)}`
        );
        if (!res.ok) throw new Error("oEmbed failed");
        const data = await res.json();
        if (data.error) throw new Error(data.error);
        setMeta({
          title: data.title || null,
          author_name: data.author_name || null,
          author_url: data.author_url || null,
          thumbnail_url: data.thumbnail_url || null,
        });
      } catch {
        // Fallback to basic display
        setError(true);
      } finally {
        setLoading(false);
      }
    };

    fetchOEmbed();
  }, [url, shortcode]);

  // Clean URL for display
  const displayUrl = url.replace(/^https?:\/\/(www\.)?/, "").replace(/\/$/, "");

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="group block rounded-2xl overflow-hidden border border-white/10 hover:border-indigo-500/40 transition-all duration-300 bg-white/[0.03] hover:bg-white/[0.06] no-underline"
    >
      <div className="flex items-stretch">
        {/* Left accent bar */}
        <div className="w-1 shrink-0 bg-gradient-to-b from-[#E1306C] via-[#C13584] to-[#833AB4]" />

        <div className="flex-1 p-4 min-w-0">
          {/* Header row: Instagram icon + source */}
          <div className="flex items-center gap-2.5 mb-2.5">
            {/* Instagram gradient icon */}
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#F58529] via-[#DD2A7B] to-[#8134AF] flex items-center justify-center shrink-0">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="white">
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/>
              </svg>
            </div>

            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="text-white/80 text-xs font-bold">Instagram</span>
                <span className="text-white/20 text-[10px]">•</span>
                <span className="text-white/30 text-[10px]">Post</span>
              </div>
              {meta?.author_name && (
                <p className="text-white/50 text-[11px] font-medium truncate">
                  @{meta.author_name}
                </p>
              )}
            </div>
          </div>

          {/* Body: Caption / title */}
          {loading ? (
            <div className="space-y-1.5 mb-2.5">
              <div className="h-3 w-3/4 rounded bg-white/5 animate-pulse" />
              <div className="h-3 w-1/2 rounded bg-white/5 animate-pulse" />
            </div>
          ) : meta?.title ? (
            <p className="text-white/60 text-xs leading-relaxed mb-2.5 line-clamp-3">
              {meta.title}
            </p>
          ) : error ? (
            <p className="text-white/40 text-xs italic mb-2.5">
              Postingan Instagram
            </p>
          ) : null}

          {/* Footer: URL display */}
          <div className="flex items-center gap-1.5">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.25)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71" />
              <path d="M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71" />
            </svg>
            <span className="text-white/25 text-[10px] font-mono truncate group-hover:text-indigo-400/60 transition-colors">
              {displayUrl}
            </span>
          </div>
        </div>

        {/* Right: Thumbnail if available */}
        {meta?.thumbnail_url && (
          <div className="w-24 shrink-0 relative overflow-hidden">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={meta.thumbnail_url}
              alt="Instagram preview"
              className="w-full h-full object-cover opacity-60 group-hover:opacity-80 transition-opacity"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-black/60 to-transparent" />
          </div>
        )}
      </div>
    </a>
  );
}
