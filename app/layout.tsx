import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "NusaVerify — AI Investment Intelligence",
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

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" className="dark">
      <body
        className={`${inter.variable} ${jetbrainsMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
