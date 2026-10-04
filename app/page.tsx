import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { Post } from "@/lib/types";
import PostsGrid from "./components/PostsGrid";
import InputForm from "./components/InputForm";
import Logo from "./components/Logo";
import TickerTape from "./components/TickerTape";
import MarketPulse from "./components/MarketPulse";

export const revalidate = 30;

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
    <div className="min-h-screen relative">
      {/* Layered background */}
      <div className="fixed inset-0 bg-grid bg-grid-fade pointer-events-none z-0" />
      <div className="fixed inset-0 bg-radial-top pointer-events-none z-0" />
      <div className="fixed top-24 -left-24 w-[320px] h-[320px] rounded-full blur-[100px] breathe pointer-events-none z-0" style={{ background: "rgba(99,102,241,.1)" }} />
      <div className="fixed bottom-10 -right-24 w-[400px] h-[400px] rounded-full blur-[120px] breathe pointer-events-none z-0" style={{ background: "rgba(139,92,246,.08)", animationDelay: "2s" }} />
      <div className="fixed top-1/3 right-1/4 w-[280px] h-[280px] rounded-full blur-[110px] drift pointer-events-none z-0" style={{ background: "rgba(34,211,238,.04)" }} />

      <div className="relative z-10">
        {/* NAV STRIP */}
        <div className="wrap">
          <nav className="fade-in-down" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 0" }}>
            <Link href="/" style={{ display: "flex", alignItems: "center", gap: 12, textDecoration: "none", color: "inherit" }}>
              <Logo size={36} />
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{ fontSize: 16, fontWeight: 800, letterSpacing: "-.02em", color: "#fff" }}>
                    Nusa<span style={{ color: "#a5b4fc" }}>Verify</span>
                  </span>
                  <span
                    className="mono up"
                    style={{
                      fontSize: 9,
                      padding: "1px 5px",
                      borderRadius: 4,
                      background: "rgba(255,255,255,.05)",
                      border: "1px solid rgba(255,255,255,.08)",
                      color: "rgba(255,255,255,.4)",
                      letterSpacing: ".1em",
                    }}
                  >
                    v2.0 · MULTI-ASSET
                  </span>
                </div>
                <div className="label-tech" style={{ marginTop: 2, fontSize: 9 }}>
                  AI Investment Intelligence · Saham · Crypto · Forex · Makro
                </div>
              </div>
            </Link>
            <div className="hidden md:flex" style={{ alignItems: "center", gap: 14 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <span className="dot-bull blink" />
                <span style={{ fontSize: 11, color: "rgba(255,255,255,.5)" }}>AI Core Online</span>
              </div>
              <div className="mono up" style={{ fontSize: 10, color: "rgba(255,255,255,.3)", letterSpacing: ".1em" }}>
                6 SUMBER · LIVE POLLING
              </div>
            </div>
          </nav>
        </div>

        {/* TICKER TAPE */}
        <TickerTape />

        <div className="wrap" style={{ paddingTop: 24 }}>
          {/* HERO */}
          <header className="fade-in-down" style={{ textAlign: "center", marginBottom: 24, padding: "20px 0 18px" }}>
            <div style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", marginBottom: 16 }}>
              <Logo size={64} />
            </div>
            <div
              className="chip up"
              style={{
                display: "inline-flex",
                marginBottom: 14,
                padding: "5px 12px",
                background: "rgba(99,102,241,.13)",
                border: "1px solid rgba(99,102,241,.3)",
                color: "#c7d2fe",
                fontSize: 10,
                letterSpacing: ".15em",
              }}
            >
              <span className="dot-bull blink" style={{ background: "#a5b4fc", boxShadow: "0 0 8px rgba(165,180,252,.6)" }} />
              AI INVESTMENT INTELLIGENCE · MULTI-ASSET VALIDATION
            </div>
            <h1 className="h-display" style={{ fontSize: "clamp(40px,6vw,68px)", margin: "0 0 10px" }}>
              <span className="text-gradient-brand gradient-shift">
                Nusa<span style={{ fontWeight: 800 }}>Verify</span>
              </span>
            </h1>
            <p style={{ color: "rgba(255,255,255,.5)", maxWidth: 620, margin: "0 auto", fontSize: 14, lineHeight: 1.6 }}>
              Validasi <b style={{ color: "#a5b4fc" }}>klaim investasi lintas-aset</b> — saham, crypto, forex, emas, dan
              kebijakan moneter — melalui AI agent multi-sumber yang menelusuri BEI, OJK, Bappebti, dan kanal finansial
              secara real-time.
            </p>
          </header>

          {/* MARKET PULSE */}
          <MarketPulse />

          {/* INPUT FORM */}
          <InputForm />

          {/* POSTS GRID */}
          <PostsGrid posts={posts} />

          {/* FOOTER */}
          <footer className="fade-in-up" style={{ marginTop: 60, paddingBottom: 28, textAlign: "center" }}>
            <div className="glass" style={{ borderRadius: 16, padding: "16px 22px", maxWidth: 560, margin: "0 auto" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 10, marginBottom: 8 }}>
                <Logo size={24} />
                <span style={{ fontSize: 12, fontWeight: 700, color: "rgba(255,255,255,.55)" }}>
                  NusaVerify Investment Intelligence
                </span>
              </div>
              <p style={{ margin: "0 0 4px", fontSize: 10.5, color: "rgba(255,255,255,.3)" }}>
                AI Multi-Source Engine · BEI · OJK / Bappebti · Media Finansial · Sentimen Retail · Analis Pasar
              </p>
              <p style={{ margin: 0, fontSize: 10, color: "rgba(255,255,255,.18)" }}>
                © 2026 NusaVerify · Hackathon BI · <b>Bukan nasihat investasi</b> · All systems nominal
              </p>
            </div>
          </footer>
        </div>
      </div>
    </div>
  );
}
