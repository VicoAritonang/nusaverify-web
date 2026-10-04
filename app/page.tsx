import { supabase } from "@/lib/supabase";
import { Post } from "@/lib/types";
import PostsGrid from "./components/PostsGrid";
import InputForm from "./components/InputForm";
import Logo from "./components/Logo";
import Nav from "./components/Nav";
import TickerTape from "./components/TickerTape";
import MarketPulse from "./components/MarketPulse";
import GlobeStudy from "./components/GlobeStudy";
import HowItWorks from "./components/HowItWorks";

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
    <>
      <Nav />

      {/* HERO — globe on the right (desktop) or behind the composer (mobile);
          the glass composer overlaps its limb so the glyphs bend through it. */}
      <section className="hero">
        <GlobeStudy
          className="hero-globe"
          baseColor="#B9C6E4"
          letterColor="#E9C891"
          phrase="cekdulubarupercaya"
          centerY={0.5}
          density={53}
          glyphSize={92}
          globe={{ radius: 112, drift: 70, letters: 100 }}
          pointer={{ zoom: 0, light: 110, pins: 7 }}
        />

        <div className="wrap hero-inner">
          <div
            className="lg lg-pill rise-in"
            style={{ display: "inline-flex", alignItems: "center", gap: 10, padding: "8px 16px 8px 12px" }}
          >
            <span className="live-dot" />
            <span style={{ fontSize: 13, color: "var(--fg-2)" }}>
              Saham · Crypto · Forex · Emas · Makro
            </span>
          </div>

          <h1 className="display hero-title rise-in" style={{ animationDelay: ".1s" }}>
            Cek dulu,
            <br />
            <span className="gold-foil">baru percaya.</span>
          </h1>

          <p className="hero-sub rise-in" style={{ animationDelay: ".2s" }}>
            Tempel klaim, link, atau screenshot. NusaVerify menelusuri BEI, OJK, Bappebti, dan media finansial, lalu
            memberi verdict lengkap dengan sumbernya.
          </p>

          <InputForm />
        </div>
      </section>

      <div className="wrap">
        <TickerTape />

        {/* HOW IT WORKS */}
        <section id="cara-kerja" className="section">
          <div className="section-head">
            <div>
              <div className="eyebrow">Cara kerja</div>
              <h2 className="h-section" style={{ margin: "12px 0 0", maxWidth: 640 }}>
                Dari rumor ke verdict, dengan sumber yang bisa Anda buka sendiri.
              </h2>
            </div>
            <p style={{ margin: 0, maxWidth: 360, fontSize: 14.5, lineHeight: 1.6, color: "var(--fg-3)" }}>
              Setiap klaim diperiksa oleh enam agen yang bekerja paralel. Prosesnya bisa Anda tonton langsung di
              halaman hasil.
            </p>
          </div>
          <HowItWorks />
        </section>

        {/* MARKET PULSE */}
        <section id="pasar" className="section">
          <div className="section-head">
            <div>
              <div className="eyebrow">Denyut pasar</div>
              <h2 className="h-section" style={{ margin: "12px 0 0" }}>
                Yang sedang ramai dicek.
              </h2>
            </div>
          </div>
          <MarketPulse />
        </section>

        {/* RECENT */}
        <section id="terbaru" className="section">
          <PostsGrid posts={posts} />
        </section>

        {/* FOOTER */}
        <footer style={{ marginTop: 120, paddingBottom: 40 }}>
          <div className="hairline" />
          <div
            style={{
              display: "flex",
              alignItems: "flex-start",
              justifyContent: "space-between",
              gap: 24,
              flexWrap: "wrap",
              paddingTop: 28,
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <Logo size={30} />
              <div>
                <div className="h-display" style={{ fontSize: 16 }}>
                  NusaVerify
                </div>
                <div style={{ fontSize: 12.5, color: "var(--fg-4)", marginTop: 2 }}>
                  BEI · OJK / Bappebti · Media finansial · Sentimen retail · Analis pasar
                </div>
              </div>
            </div>
            <p style={{ margin: 0, fontSize: 12.5, color: "var(--fg-4)", maxWidth: 420, lineHeight: 1.6 }}>
              Hasil verifikasi adalah validasi informasi, <b style={{ color: "var(--fg-3)" }}>bukan nasihat investasi</b>.
              © 2026 NusaVerify · Hackathon BI.
            </p>
          </div>
        </footer>
      </div>
    </>
  );
}
