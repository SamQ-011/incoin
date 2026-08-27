"use client";

import Link from "next/link";
import {
  ShieldCheck,
  Award,
  GraduationCap,
  Clock,
  Lock,
  CheckCircle2,
  ExternalLink,
  ArrowRight,
  Sparkles,
  Building2,
  FileCheck,
  QrCode,
  Layers,
  ChevronRight,
  CheckCircle,
  Zap,
  Fingerprint,
} from "lucide-react";

export default function HomePage() {
  return (
    <div className="space-y-16 sm:space-y-24 py-8 sm:py-12">
      {/* ───────────────────────────────────────────────────────────── */}
      {/* HERO SECTION */}
      {/* ───────────────────────────────────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-br from-[#0F1D30] via-[#1E3A5F] to-[#12263F] text-white rounded-3xl p-8 sm:p-12 lg:p-16 shadow-2xl relative overflow-hidden animate-fade-in-up">
          {/* Background Decorative Accents */}
          <div className="absolute -top-24 -right-24 w-96 h-96 rounded-full bg-blue-500/15 blur-3xl pointer-events-none" />
          <div className="absolute -bottom-24 -left-24 w-96 h-96 rounded-full bg-emerald-500/15 blur-3xl pointer-events-none" />
          <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none" />

          <div className="relative z-10 max-w-3xl space-y-6">
            {/* Neutral Protocol Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 text-white text-xs font-extrabold backdrop-blur-md border border-white/20 shadow-sm">
              <Sparkles className="w-4 h-4 text-amber-300" />
              <span>Protocolo Descentralizado de Identidad Académica</span>
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            </div>

            {/* Main Headline */}
            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-[1.12]">
              Credenciales Académicas Verificables en Blockchain
            </h1>

            {/* Subtitle */}
            <p className="text-sm sm:text-base text-slate-200 leading-relaxed max-w-2xl">
              Plataforma institucional para la emisión, custodia y verificación pública de títulos, certificaciones técnicas, diplomados, pasantías y horas académicas mediante <strong>Soulbound Tokens (ERC-5192)</strong>.
            </p>

            {/* Critical Disclaimer Badge (No Speculation) */}
            <div className="inline-flex items-center gap-2.5 px-4 py-2.5 rounded-2xl bg-black/35 text-slate-200 text-xs border border-white/10 font-medium backdrop-blur-sm">
              <Lock className="w-4 h-4 text-amber-400 shrink-0" />
              <span>Infraestructura de confianza e inmutabilidad académica. Sin especulación ni tokens transferibles.</span>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <Link
                href="/student"
                className="inline-flex items-center gap-2 px-6 py-3.5 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-extrabold text-xs sm:text-sm rounded-xl shadow-lg transition-all active:scale-95 cursor-pointer"
              >
                <GraduationCap className="w-5 h-5 text-slate-950" />
                <span>Consultar Mi Portafolio</span>
              </Link>

              <Link
                href="/verify"
                className="inline-flex items-center gap-2 px-6 py-3.5 bg-white/10 hover:bg-white/20 text-white font-extrabold text-xs sm:text-sm rounded-xl backdrop-blur-sm border border-white/15 transition-all active:scale-95"
              >
                <CheckCircle className="w-5 h-5 text-emerald-400" />
                <span>Verificador Gasless</span>
              </Link>

              <Link
                href="/soulbound-demo"
                className="inline-flex items-center gap-2 px-5 py-3.5 bg-black/30 hover:bg-black/40 text-amber-300 font-extrabold text-xs sm:text-sm rounded-xl border border-amber-400/30 transition-all active:scale-95"
              >
                <Lock className="w-4 h-4 text-amber-400" />
                <span>Demo ERC-5192</span>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ───────────────────────────────────────────────────────────── */}
      {/* CARACTERÍSTICAS PRINCIPALES */}
      {/* ───────────────────────────────────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Card 1: Soulbound Security */}
          <div className="bg-white p-7 rounded-3xl border border-slate-200 shadow-sm hover:shadow-md transition-all space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-700 flex items-center justify-center font-bold">
              <Lock className="w-6 h-6" />
            </div>
            <h3 className="text-base font-extrabold text-slate-900">
              100% Intransferibles (Soulbound)
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Las credenciales emitidas quedan bloqueadas de por vida a la billetera digital del estudiante mediante la regla ERC-5192. Imposibles de vender, ceder o falsificar.
            </p>
          </div>

          {/* Card 2: Gasless Verification */}
          <div className="bg-white p-7 rounded-3xl border border-slate-200 shadow-sm hover:shadow-md transition-all space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <h3 className="text-base font-extrabold text-slate-900">
              Verificación Pública Sin Costo (Gasless)
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Cualquier empresa, reclutador o universidad puede comprobar la autenticidad del diploma escaneando un código QR en menos de 1 segundo sin pagar comisiones de red.
            </p>
          </div>

          {/* Card 3: Academic Hours Standard */}
          <div className="bg-white p-7 rounded-3xl border border-slate-200 shadow-sm hover:shadow-md transition-all space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-700 flex items-center justify-center font-bold">
              <Clock className="w-6 h-6" />
            </div>
            <h3 className="text-base font-extrabold text-slate-900">
              Validación Acumulativa de Horas
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              El protocolo registra y audita la carga horaria exacta (teórica, práctica y pasantías) permitiendo a las instituciones homologar competencias con total respaldo criptográfico.
            </p>
          </div>
        </div>
      </section>

      {/* ───────────────────────────────────────────────────────────── */}
      {/* DIAGRAMA CONCEPTUAL DEL ECOSISTEMA SBT */}
      {/* ───────────────────────────────────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-10 shadow-sm space-y-8">
          <div className="max-w-2xl space-y-2">
            <div className="inline-flex items-center gap-2 text-xs font-extrabold text-blue-700 uppercase tracking-wider">
              <Layers className="w-4 h-4" />
              Arquitectura del Portafolio Unificado
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Una Sola Identidad Académica, Múltiples Logros
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
              Cada credencial emitida por instituciones autorizadas suma al historial verificable del estudiante:
            </p>
          </div>

          {/* Conceptual Tree Visual */}
          <div className="bg-slate-50 rounded-2xl p-6 sm:p-8 border border-slate-200">
            <div className="flex items-center gap-3 pb-6 border-b border-slate-200">
              <div className="w-12 h-12 rounded-2xl bg-[#1E3A5F] text-white flex items-center justify-center font-bold shadow-sm">
                <GraduationCap className="w-6 h-6 text-amber-300" />
              </div>
              <div>
                <div className="text-sm font-extrabold text-slate-900">
                  MATRIZ DE COMPETENCIAS Y RECONOCIMIENTOS ON-CHAIN
                </div>
                <div className="text-xs text-slate-500 font-mono">
                  Identidad Académica ERC-5192 • Respaldo Multi-Institucional
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-6">
              <div className="bg-white p-4 rounded-2xl border-2 border-amber-300 shadow-2xs space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded bg-amber-100 text-amber-900">
                    Título Superior
                  </span>
                  <span className="text-[11px] font-bold text-amber-800">3,600 hrs</span>
                </div>
                <div className="text-xs font-extrabold text-slate-900">Técnico Superior Universitario</div>
                <div className="text-[11px] text-slate-400">Sello Rectoral Inmutable</div>
              </div>

              <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-emerald-50 text-emerald-700">
                    Certificación
                  </span>
                  <span className="text-[11px] font-bold text-emerald-700">50 - 120 hrs</span>
                </div>
                <div className="text-xs font-bold text-slate-900">Especializaciones Técnicas</div>
                <div className="text-[11px] text-slate-400">Validación de Competencias</div>
              </div>

              <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-blue-50 text-blue-700">
                    Pasantía
                  </span>
                  <span className="text-[11px] font-bold text-blue-700">240 - 480 hrs</span>
                </div>
                <div className="text-xs font-bold text-slate-900">Práctica Profesional en Empresa</div>
                <div className="text-[11px] text-slate-400">Convenio Institucional</div>
              </div>

              <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-purple-50 text-purple-700">
                    Voluntariado
                  </span>
                  <span className="text-[11px] font-bold text-purple-700">40 - 100 hrs</span>
                </div>
                <div className="text-xs font-bold text-slate-900">Impacto y Servicio Social</div>
                <div className="text-[11px] text-slate-400">Extensión Universitaria</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ───────────────────────────────────────────────────────────── */}
      {/* DIRECT ACCESS CARDS */}
      {/* ───────────────────────────────────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          <Link
            href="/issuer"
            className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm hover:border-[#1E3A5F] hover:shadow-md transition-all group flex flex-col justify-between"
          >
            <div>
              <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-700 flex items-center justify-center font-bold mb-4 group-hover:scale-105 transition-transform">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h3 className="text-base font-extrabold text-slate-900 group-hover:text-[#1E3A5F] flex items-center justify-between">
                <span>Panel de Emisión</span>
                <ChevronRight className="w-4 h-4 text-slate-400 group-hover:translate-x-1 transition-transform" />
              </h3>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                Emisión individual o por lotes de credenciales con firma en MetaMask.
              </p>
            </div>
          </Link>

          <Link
            href="/student"
            className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm hover:border-emerald-600 hover:shadow-md transition-all group flex flex-col justify-between"
          >
            <div>
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold mb-4 group-hover:scale-105 transition-transform">
                <GraduationCap className="w-6 h-6" />
              </div>
              <h3 className="text-base font-extrabold text-slate-900 group-hover:text-emerald-700 flex items-center justify-between">
                <span>Mi Portafolio</span>
                <ChevronRight className="w-4 h-4 text-slate-400 group-hover:translate-x-1 transition-transform" />
              </h3>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                Consulta tus diplomas, horas validadas y genera tu QR para CV.
              </p>
            </div>
          </Link>

          <Link
            href="/verify"
            className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm hover:border-purple-600 hover:shadow-md transition-all group flex flex-col justify-between"
          >
            <div>
              <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-700 flex items-center justify-center font-bold mb-4 group-hover:scale-105 transition-transform">
                <QrCode className="w-6 h-6" />
              </div>
              <h3 className="text-base font-extrabold text-slate-900 group-hover:text-purple-700 flex items-center justify-between">
                <span>Verificador Público</span>
                <ChevronRight className="w-4 h-4 text-slate-400 group-hover:translate-x-1 transition-transform" />
              </h3>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                Comprobación gasless de autenticidad y horas en 1 segundo.
              </p>
            </div>
          </Link>

          <Link
            href="/governance"
            className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm hover:border-amber-600 hover:shadow-md transition-all group flex flex-col justify-between"
          >
            <div>
              <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-700 flex items-center justify-center font-bold mb-4 group-hover:scale-105 transition-transform">
                <Building2 className="w-6 h-6" />
              </div>
              <h3 className="text-base font-extrabold text-slate-900 group-hover:text-amber-700 flex items-center justify-between">
                <span>Gobernanza / Red</span>
                <ChevronRight className="w-4 h-4 text-slate-400 group-hover:translate-x-1 transition-transform" />
              </h3>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                Directorio multi-institucional y onboarding on-chain de entidades.
              </p>
            </div>
          </Link>
        </div>
      </section>
    </div>
  );
}
