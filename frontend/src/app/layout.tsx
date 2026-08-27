import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Web3Provider } from "@/providers/Web3Provider";
import { ConnectWallet } from "@/components/ConnectWallet";
import { Navigation } from "@/components/Navigation";
import Link from "next/link";
import { Award, ShieldCheck } from "lucide-react";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "INCOIN Protocol — Credenciales Académicas Verificables en Blockchain",
  description:
    "Infraestructura descentralizada de títulos, certificaciones y credenciales académicas verificables en blockchain mediante Soulbound Tokens (SBT - ERC-5192).",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className={`${geistSans.variable} ${geistMono.variable} h-full`}>
      <body className="flex flex-col min-h-screen bg-[#F8FAFB] text-slate-800 antialiased">
        <Web3Provider>
          {/* Header Institucional Minimalista (Linear / Vercel Standard) */}
          <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-slate-200/80">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex items-center justify-between h-14">
                {/* Logo & Navigation */}
                <div className="flex items-center gap-8">
                  <Link href="/" className="flex items-center gap-2 group">
                    <div className="w-7 h-7 rounded-lg bg-slate-900 flex items-center justify-center text-white shadow-xs group-hover:bg-[#1E3A5F] transition-colors">
                      <Award className="w-4 h-4 text-amber-300" />
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-sm font-extrabold tracking-tight text-slate-900">
                        INCOIN
                      </span>
                      <span className="text-[9px] uppercase font-bold tracking-widest px-1.5 py-0.2 rounded bg-slate-100 text-slate-600 border border-slate-200">
                        SBT
                      </span>
                    </div>
                  </Link>

                  {/* Navigation Links with Role Awareness */}
                  <Navigation />
                </div>

                {/* Right side: Unified Compact Wallet */}
                <div className="flex items-center gap-3">
                  <ConnectWallet />
                </div>
              </div>
            </div>
          </header>

          {/* Main Content Area */}
          <main className="flex-1">
            {children}
          </main>

          {/* Footer Institucional */}
          <footer className="bg-slate-900 text-slate-400 py-10 border-t border-slate-800 mt-16">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                <div className="space-y-1 text-center md:text-left">
                  <div className="flex items-center justify-center md:justify-start gap-2">
                    <span className="text-white font-bold text-base">INCOIN Protocol</span>
                    <span className="text-xs px-2 py-0.5 rounded bg-slate-800 text-emerald-400 font-mono border border-slate-700">
                      ERC-721 + ERC-5192 (Soulbound)
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 max-w-md">
                    Infraestructura descentralizada de credenciales académicas inmutables y no transferibles para institutos técnicos, universidades y academias.
                  </p>
                </div>

                <div className="flex items-center gap-6 text-xs font-medium">
                  <Link href="/issuer" className="hover:text-white transition-colors">
                    Panel Emisor
                  </Link>
                  <Link href="/student" className="hover:text-white transition-colors">
                    Estudiantes
                  </Link>
                  <Link href="/verify" className="hover:text-white transition-colors">
                    Verificación Pública
                  </Link>
                  <Link href="/governance" className="hover:text-white transition-colors">
                    Gobernanza
                  </Link>
                  <Link href="/soulbound-demo" className="hover:text-white transition-colors">
                    Protocolo SBT
                  </Link>
                </div>
              </div>

              <div className="mt-8 pt-6 border-t border-slate-800 text-center text-xs text-slate-500 flex flex-col sm:flex-row items-center justify-between gap-2">
                <span>© {new Date().getFullYear()} INCOIN Protocol. Todos los derechos reservados.</span>
                <span className="font-mono text-slate-400">Infraestructura Blockchain EVM • Firma Asimétrica</span>
              </div>
            </div>
          </footer>
        </Web3Provider>
      </body>
    </html>
  );
}
