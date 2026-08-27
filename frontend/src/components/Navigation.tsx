"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useInCoinContract } from "@/lib/useInCoinContract";

export function Navigation() {
  const pathname = usePathname();
  const { isConnected, isIssuer, isAdmin } = useInCoinContract();

  const isActive = (href: string) => {
    if (href === "/") return pathname === "/";
    return pathname.startsWith(href);
  };

  const linkClass = (href: string) =>
    `px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
      isActive(href)
        ? "bg-slate-900 text-white shadow-xs"
        : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
    }`;

  // 1. INSTITUCIÓN / EMISOR / ADMIN
  if (isConnected && (isIssuer || isAdmin)) {
    return (
      <nav className="hidden md:flex items-center gap-1">
        <Link href="/issuer" className={linkClass("/issuer")}>
          Emisión
        </Link>
        <Link href="/governance" className={linkClass("/governance")}>
          Gobernanza
        </Link>
        <Link href="/verify" className={linkClass("/verify")}>
          Verificador
        </Link>
        <Link href="/soulbound-demo" className={linkClass("/soulbound-demo")}>
          Demo SBT
        </Link>
      </nav>
    );
  }

  // 2. ESTUDIANTE CONECTADO
  if (isConnected && !isIssuer && !isAdmin) {
    return (
      <nav className="hidden md:flex items-center gap-1">
        <Link href="/student" className={linkClass("/student")}>
          Mi Portafolio
        </Link>
        <Link href="/verify" className={linkClass("/verify")}>
          Verificador
        </Link>
        <Link href="/governance" className={linkClass("/governance")}>
          Red Institucional
        </Link>
        <Link href="/soulbound-demo" className={linkClass("/soulbound-demo")}>
          Demo SBT
        </Link>
      </nav>
    );
  }

  // 3. VISITANTE / PÚBLICO
  return (
    <nav className="hidden md:flex items-center gap-1">
      <Link href="/verify" className={linkClass("/verify")}>
        Verificador
      </Link>
      <Link href="/student" className={linkClass("/student")}>
        Portafolios
      </Link>
      <Link href="/governance" className={linkClass("/governance")}>
        Red Institucional
      </Link>
      <Link href="/soulbound-demo" className={linkClass("/soulbound-demo")}>
        Demo SBT
      </Link>
    </nav>
  );
}
