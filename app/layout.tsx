import type { Metadata, Viewport } from "next";
import { Archivo, Instrument_Sans, Geist_Mono } from "next/font/google";
import Ambient from "./components/Ambient";
import "./globals.css";

const display = Archivo({
  variable: "--font-display-src",
  subsets: ["latin"],
  axes: ["wdth"],
  display: "swap",
});

const body = Instrument_Sans({
  variable: "--font-body-src",
  subsets: ["latin"],
  display: "swap",
});

const mono = Geist_Mono({
  variable: "--font-mono-src",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "NusaVerify — Cek dulu, baru percaya",
  description:
    "Validasi klaim investasi lintas-aset — saham, crypto, forex, emas, dan kebijakan moneter — dengan AI agent multi-sumber yang menelusuri BEI, OJK, Bappebti, dan kanal finansial secara real-time.",
  keywords: [
    "validasi investasi",
    "saham",
    "crypto",
    "forex",
    "pump and dump",
    "investasi ilegal",
    "NusaVerify",
    "OJK",
    "BEI",
  ],
  icons: {
    icon: "/favicon.ico",
  },
};

export const viewport: Viewport = {
  themeColor: "#05070D",
  colorScheme: "dark",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    // Font variables live on <html> so the :root tokens in globals.css can resolve them.
    <html lang="id" className={`dark ${display.variable} ${body.variable} ${mono.variable}`}>
      <body className="antialiased">
        <Ambient />
        <div className="relative z-10">{children}</div>
      </body>
    </html>
  );
}
