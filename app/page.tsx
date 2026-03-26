import { supabase } from "@/lib/supabase";
import { Post } from "@/lib/types";
import PostsGrid from "./components/PostsGrid";
import InputForm from "./components/InputForm";

export const revalidate = 30; // ISR every 30s

async function getPosts(): Promise<Post[]> {
  const { data, error } = await supabase
    .from("post")
    .select("*")
    .neq("status", "processing")
    .order("updated_at", { ascending: false })
    .limit(30);

  if (error) {
    console.error("Error fetching posts:", error);
    return [];
  }
  return (data as Post[]) || [];
}

export default async function Home() {
  const posts = await getPosts();

  return (
    <div className="min-h-screen bg-grid relative">
      {/* Background glows */}
      <div className="bg-radial-top fixed inset-0 pointer-events-none z-0" />
      <div className="fixed top-20 left-10 w-72 h-72 bg-indigo-600/10 rounded-full blur-[100px] animate-breathe pointer-events-none" />
      <div
        className="fixed bottom-20 right-10 w-96 h-96 bg-purple-600/8 rounded-full blur-[120px] animate-breathe pointer-events-none"
        style={{ animationDelay: "2s" }}
      />

      <div className="relative z-10 max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* ── HERO ──────────────────────────────── */}
        <header className="text-center mb-8 animate-fade-in-down">
          <div className="inline-flex items-center justify-center mb-5">
            <div className="relative">
              <div className="w-14 h-14 rounded-2xl flex items-center justify-center shadow-xl shadow-indigo-500/30 animate-pulse-glow overflow-hidden bg-black/20">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/logo.png" alt="NusaVerify Logo" width={1024} height={1024} className="w-full h-full object-cover" />
              </div>
              <div className="absolute -inset-2 rounded-3xl bg-gradient-to-br from-indigo-500/20 to-purple-500/20 blur-xl -z-10 animate-breathe" />
            </div>
          </div>

          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight">
            <span className="bg-gradient-to-r from-white via-indigo-200 to-white bg-clip-text text-transparent animate-gradient-shift">
              NusaVerify
            </span>
          </h1>
          <p className="mt-2 text-white/40 text-sm sm:text-base font-medium max-w-lg mx-auto">
            AI-Powered Multi-Source Fact Verification Engine
          </p>

          {/* Ticker */}
          <div className="mt-5 overflow-hidden rounded-full glass px-4 py-1.5 max-w-md mx-auto">
            <div className="flex" style={{ animation: "marquee 25s linear infinite" }}>
              <span className="text-[10px] text-white/30 whitespace-nowrap mr-8">
                🛡 Trusted Sources &nbsp;•&nbsp; 🤖 LLM Analysis &nbsp;•&nbsp; 📊 Confidence Scoring &nbsp;•&nbsp; ✅ Real-time Verification &nbsp;•&nbsp; 🌐 Multi-Platform &nbsp;•&nbsp;
              </span>
              <span className="text-[10px] text-white/30 whitespace-nowrap mr-8">
                🛡 Trusted Sources &nbsp;•&nbsp; 🤖 LLM Analysis &nbsp;•&nbsp; 📊 Confidence Scoring &nbsp;•&nbsp; ✅ Real-time Verification &nbsp;•&nbsp; 🌐 Multi-Platform &nbsp;•&nbsp;
              </span>
            </div>
          </div>
        </header>

        {/* ── INPUT FORM ────────────────────────── */}
        <div className="mb-8">
          <InputForm />
        </div>

        {/* ── POSTS GRID + FILTER (client-side) ── */}
        <PostsGrid posts={posts} />

        {/* ── FOOTER ────────────────────────────── */}
        <footer className="mt-16 text-center pb-8 animate-fade-in-up" style={{ animationDelay: "0.5s" }}>
          <div className="glass rounded-2xl p-4 max-w-sm mx-auto">
            <p className="text-white/20 text-[10px]">Powered by AI Multi-Source Analysis Engine</p>
            <p className="text-white/10 text-[9px] mt-1">© 2026 NusaVerify — Hackathon BI</p>
          </div>
        </footer>
      </div>
    </div>
  );
}
