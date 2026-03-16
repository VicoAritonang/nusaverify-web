"use client";

import { useEffect, useState, useRef } from "react";
import { supabase } from "@/lib/supabase";
import { Post, Think } from "@/lib/types";
import ExplorationGraph from "./ExplorationGraph";
import AnalyzingBox from "./AnalyzingBox";
import ResultBox from "./ResultBox";

export default function AnalysisDetail({ id }: { id: string }) {
  const [post, setPost] = useState<Post | null>(null);
  const [think, setThink] = useState<Think | null>(null);
  const [fetchError, setFetchError] = useState<string | null>(null);

  const [exploringFinished, setExploringFinished] = useState(false);
  const prevStateRef = useRef<string | null>(null);

  useEffect(() => {
    let timeoutId: NodeJS.Timeout;
    let isMounted = true;

    const poll = async () => {
      try {
        // Fetch with maybeSingle to avoid throw on 0 rows
        const { data: pData, error: pError } = await supabase.from("post").select("*").eq("id", id).maybeSingle();
        const { data: tData, error: tError } = await supabase.from("think").select("*").eq("post_id", id).maybeSingle();

        if (!isMounted) return;

        if (pError) {
          console.error("Post fetch error:", pError);
          setFetchError(`Gagal mengambil data post: ${pError.message}`);
        } else if (pData) {
          setFetchError(null);
          setPost(pData as Post);
        }

        if (tError && tError.code !== "PGRST116") {
          console.error("Think fetch error:", tError);
        } else if (tData) {
          const t = tData as Think;
          setThink(t);

          if (prevStateRef.current === "exploring" && t.state === "analyzing") {
            setExploringFinished(true);
            setTimeout(() => {
              if (isMounted) setExploringFinished(false);
            }, 2000);
          }
          prevStateRef.current = t.state;
        }

        let interval = 5000;
        if (tData?.state === "analyzing") interval = 10000;

        if (pData?.result != null || tData?.state === "completed") {
          return; // stop polling
        }

        timeoutId = setTimeout(poll, interval);
      } catch (err: any) {
        console.error("Poll catch error", err);
        setFetchError(`Terjadi kesalahan interval: ${err?.message}`);
        timeoutId = setTimeout(poll, 5000);
      }
    };

    poll();

    return () => {
      isMounted = false;
      clearTimeout(timeoutId);
    };
  }, [id]);

  if (!post) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh]">
        <div className="w-12 h-12 rounded-full border-4 border-indigo-500/20 border-t-indigo-500 animate-spin mb-4" />
        <p className="text-white/40 text-sm animate-pulse mb-2">Menyiapkan analisis...</p>
        <p className="text-white/20 text-[10px] font-mono">ID: {id}</p>
        {fetchError && (
          <div className="mt-4 max-w-sm text-center px-4 py-2 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-xs">
            {fetchError}
          </div>
        )}
      </div>
    );
  }

  const category = post.category || "politic";
  const state = think?.state || "exploring";
  const isCompleted = state === "completed" || post.result != null;

  return (
    <div className="space-y-8 animate-fade-in-up">
      {/* ── HEADER ── */}
      <div className="glass rounded-3xl p-6 relative overflow-hidden">
        {/* Topic background subtle glow */}
        <div
          className={`absolute inset-0 opacity-10 pointer-events-none ${
            category === "scientific" ? "bg-emerald-500" : "bg-slate-400"
          }`}
          style={{ mixBlendMode: "screen", filter: "blur(40px)" }}
        />
        
        <div className="relative z-10">
          <div className="flex items-start justify-between gap-4 mb-3">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white leading-tight">
              {post.title || "Analisis Berjalan..."}
            </h1>
            {category && (
              <span className="shrink-0 inline-flex items-center gap-1.5 px-3 py-1 bg-white/10 border border-white/20 rounded-full text-white/70 text-xs font-bold uppercase tracking-wider">
                🏷 {category}
              </span>
            )}
          </div>
          <blockquote className="pl-4 border-l-2 border-indigo-500/50">
            <p className="text-white/50 text-sm leading-relaxed italic">
              &ldquo;{post.context}&rdquo;
            </p>
          </blockquote>
        </div>
      </div>

      {/* ── EXPLORING GRAPH ── */}
      {(think || (post && !think)) && (
        <ExplorationGraph
          think={think || {
            id: "", post_id: id, state: "exploring",
            information: null, media: null, analysis: null, official: null,
            media_score: null, analysis_score: null, official_score: null,
            media_insight: null, official_insight: null, analysis_insight: null,
            official_url: null, official_name: null,
            detik: null, kompas: null, inews: null, cnbc: null,
            detik_insight: null, detik_score: null, detik_url: null,
            kompas_insight: null, kompas_score: null, kompas_url: null,
            inews_insight: null, inews_score: null, inews_url: null,
            cnbc_insight: null, cnbc_score: null, cnbc_url: null
          }}
          post={post}
          state={state}
        />
      )}

      {/* ── ANALYZING BOX ── */}
      {think && (state === "analyzing" || state === "completed") && (
        <AnalyzingBox
          think={think}
          state={state}
          isCompleted={isCompleted ? true : false}
        />
      )}

      {/* ── FINAL RESULT BOX ── */}
      {isCompleted && (
        <ResultBox post={post} />
      )}
    </div>
  );
}
