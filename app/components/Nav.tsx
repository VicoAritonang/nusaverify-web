import Link from "next/link";
import Logo from "./Logo";

export default function Nav() {
  return (
    <nav className="nav lg lg-dense fade-in-down" aria-label="Navigasi utama">
      <Link href="/" style={{ display: "flex", alignItems: "center", gap: 10, textDecoration: "none", color: "inherit" }}>
        <Logo size={32} />
        <span className="h-display" style={{ fontSize: 17, letterSpacing: "-.02em" }}>
          NusaVerify
        </span>
      </Link>

      <div className="nav-links">
        <Link href="/#cara-kerja" className="nav-link">
          Cara kerja
        </Link>
        <Link href="/#pasar" className="nav-link">
          Denyut pasar
        </Link>
        <Link href="/#terbaru" className="nav-link">
          Verifikasi terbaru
        </Link>
      </div>

      <Link href="/#cek" className="btn-pearl" style={{ padding: "9px 18px", fontSize: 13.5 }}>
        Cek klaim
      </Link>
    </nav>
  );
}
