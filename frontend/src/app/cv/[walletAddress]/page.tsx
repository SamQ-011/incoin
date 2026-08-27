"use client";

import { use, useEffect, useState } from "react";
import Link from "next/link";
import { CREDENTIAL_TYPE_LABELS } from "@/lib/metadata";
import { CredentialItem } from "@/components/IssuedTable";
import { CredentialQRModal } from "@/components/CredentialQRModal";
import {
  GraduationCap,
  Clock,
  Award,
  ShieldCheck,
  Building2,
  Lock,
  ExternalLink,
  Printer,
  ArrowLeft,
  Loader2,
  AlertTriangle,
  QrCode,
  CheckCircle2,
  Sparkles,
  IdCard,
  Copy,
  Check,
  Share2,
  FileCheck,
} from "lucide-react";

interface StudentData {
  id: string;
  walletAddress: string;
  fullName: string;
  identityNumber: string | null;
  career: string | null;
  credentials: CredentialItem[];
}

export default function StudentGlobalCVPage({
  params,
}: {
  params: Promise<{ walletAddress: string }>;
}) {
  const resolvedParams = use(params);
  const rawAddress = resolvedParams.walletAddress;

  const [student, setStudent] = useState<StudentData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [showQRModal, setShowQRModal] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  // Progressive Count-Up Animation for Hours
  const [animatedHours, setAnimatedHours] = useState(0);

  useEffect(() => {
    setIsLoading(true);
    fetch(`/api/students?walletAddress=${rawAddress}`)
      .then((res) => res.json())
      .then((json) => {
        if (json.success && json.data) {
          setStudent(json.data);
          setNotFound(false);

          // Calculate and animate hours
          const total = (json.data.credentials || []).reduce(
            (acc: number, curr: CredentialItem) => acc + (curr.hours || 0),
            0
          );

          // Ease-out counter
          let start = 0;
          const duration = 1200;
          const stepTime = 20;
          const steps = duration / stepTime;
          const increment = total / steps;

          const interval = setInterval(() => {
            start += increment;
            if (start >= total) {
              setAnimatedHours(total);
              clearInterval(interval);
            } else {
              setAnimatedHours(Math.floor(start));
            }
          }, stepTime);
        } else {
          setNotFound(true);
        }
      })
      .catch((err) => {
        console.error("Error fetching student profile for CV:", err);
        setNotFound(true);
      })
      .finally(() => setIsLoading(false));
  }, [rawAddress]);

  const handleCopyLink = () => {
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(window.location.href);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    }
  };

  // ─────────────────────────────────────────────────────────────
  // 1. LOADING SKELETON
  // ─────────────────────────────────────────────────────────────
  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center space-y-6">
        <div className="w-16 h-16 rounded-3xl bg-[#1E3A5F]/10 border border-[#1E3A5F]/20 flex items-center justify-center mx-auto animate-pulse">
          <GraduationCap className="w-8 h-8 text-[#1E3A5F]" />
        </div>
        <div className="space-y-2">
          <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">
            Consultando Trayectoria Académica en Blockchain...
          </h2>
          <p className="text-xs text-slate-500 font-mono">{rawAddress}</p>
        </div>

        {/* Skeleton Bento Preview */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-6 max-w-2xl mx-auto">
          <div className="h-24 bg-slate-200/80 rounded-2xl animate-pulse" />
          <div className="h-24 bg-slate-200/80 rounded-2xl animate-pulse" />
          <div className="h-24 bg-slate-200/80 rounded-2xl animate-pulse" />
        </div>
      </div>
    );
  }

  // ─────────────────────────────────────────────────────────────
  // 2. NOT FOUND STATE
  // ─────────────────────────────────────────────────────────────
  if (notFound || !student) {
    return (
      <div className="max-w-xl mx-auto px-4 py-16 text-center space-y-6 animate-fade-in-scale">
        <div className="w-20 h-20 rounded-3xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto border-2 border-amber-200 shadow-inner">
          <AlertTriangle className="w-10 h-10" />
        </div>

        <div className="space-y-2">
          <span className="text-xs font-bold uppercase tracking-wider text-amber-700 bg-amber-100/70 px-3 py-1 rounded-full">
            Sin Registro
          </span>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Portafolio Académico No Encontrado
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 max-w-md mx-auto leading-relaxed">
            La dirección <span className="font-mono text-xs font-bold text-slate-900">{rawAddress}</span> no registra credenciales académicas selladas en la red INCOIN.
          </p>
        </div>

        <div>
          <Link
            href="/verify"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#1E3A5F] hover:bg-[#152942] text-white text-xs font-bold rounded-xl shadow-sm transition-all"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Ir al Verificador Público</span>
          </Link>
        </div>
      </div>
    );
  }

  const credentials = student.credentials || [];
  const totalHours = credentials.reduce((acc, curr) => acc + (curr.hours || 0), 0);
  const activeCount = credentials.filter((c) => c.status !== "REVOKED").length;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8 animate-fade-in-up">
      {/* Top Bar Actions */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <Link
          href="/student"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-[#1E3A5F] transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Volver al Portafolio</span>
        </Link>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowQRModal(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-extrabold rounded-xl shadow-sm transition-all active:scale-95 cursor-pointer"
          >
            <QrCode className="w-4 h-4" />
            <span>Código QR para CV</span>
          </button>

          <button
            onClick={handleCopyLink}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 text-xs font-bold rounded-xl shadow-2xs transition-all active:scale-95 cursor-pointer"
          >
            {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Share2 className="w-3.5 h-3.5" />}
            <span>{copiedLink ? "¡Enlace Copiado!" : "Compartir CV"}</span>
          </button>

          <button
            onClick={() => window.print()}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 text-xs font-bold rounded-xl shadow-2xs transition-all active:scale-95 cursor-pointer"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Imprimir</span>
          </button>
        </div>
      </div>

      {/* Main CV Verification Sheet */}
      <div className="bg-white rounded-3xl border-2 border-slate-200 shadow-xl overflow-hidden">
        {/* Header Banner */}
        <div className="bg-gradient-to-r from-[#0F1D30] via-[#1E3A5F] to-[#152E4D] text-white p-6 sm:p-10 space-y-6 relative overflow-hidden">
          <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none" />

          <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-400 text-slate-950 text-xs font-extrabold shadow-md">
                <ShieldCheck className="w-4 h-4" />
                <span>HOJA DE VIDA VERIFICADA ON-CHAIN</span>
              </div>
              <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight">
                {student.fullName}
              </h1>
              <div className="flex flex-wrap items-center gap-3 text-xs text-slate-300">
                <span className="flex items-center gap-1">
                  <IdCard className="w-3.5 h-3.5 text-amber-300" />
                  Cédula: <strong className="text-white">{student.identityNumber || "8392014 LP"}</strong>
                </span>
                <span>•</span>
                <span>Carrera: <strong className="text-white">{student.career || "Sistemas Informáticos"}</strong></span>
              </div>
            </div>

            <div className="text-left sm:text-right sm:border-l sm:border-white/20 sm:pl-6 space-y-1">
              <div className="text-[10px] uppercase font-bold text-slate-300 tracking-wider">
                Protocolo INCOIN
              </div>
              <div className="inline-flex items-center gap-1.5 text-xs font-extrabold text-emerald-300 bg-white/10 px-3 py-1.5 rounded-xl border border-white/20 backdrop-blur-sm">
                <Lock className="w-3.5 h-3.5" />
                <span>Soulbound (ERC-5192)</span>
              </div>
            </div>
          </div>

          {/* Student Wallet Address */}
          <div className="pt-4 border-t border-white/15 flex flex-wrap items-center justify-between gap-2 text-xs">
            <div className="flex items-center gap-2">
              <span className="text-slate-300">Wallet Custodia:</span>
              <span className="font-mono bg-black/40 text-emerald-300 px-3 py-1 rounded-xl border border-emerald-500/30 text-[11px] break-all">
                {student.walletAddress}
              </span>
            </div>
            <span className="text-[11px] text-emerald-400 font-bold">
              {activeCount} Títulos & Medallas Activas
            </span>
          </div>
        </div>

        {/* Bento Metrics Bar (WITH ANIMATED COUNTER) */}
        <div className="p-6 sm:p-8 bg-gradient-to-r from-blue-50/70 via-indigo-50/50 to-emerald-50/50 border-b border-slate-200">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-center sm:text-left">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-[#1E3A5F] text-white flex items-center justify-center font-bold shadow-md shadow-blue-900/20 shrink-0">
                <Clock className="w-7 h-7 text-amber-300" />
              </div>
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-blue-800 block">
                  Carga Horaria Formativa Total
                </span>
                <span className="text-3xl font-extrabold text-slate-900 drop-shadow-xs">
                  {animatedHours.toLocaleString()} Horas
                </span>
              </div>
            </div>

            <div className="flex items-center gap-4 sm:border-l sm:border-blue-200 sm:pl-6">
              <div className="w-14 h-14 rounded-2xl bg-emerald-600 text-white flex items-center justify-center font-bold shadow-md shadow-emerald-700/20 shrink-0">
                <Award className="w-7 h-7" />
              </div>
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-800 block">
                  Credenciales Obtenidas
                </span>
                <span className="text-3xl font-extrabold text-slate-900">
                  {credentials.length} Logros
                </span>
              </div>
            </div>

            <div className="flex items-center gap-4 sm:border-l sm:border-blue-200 sm:pl-6">
              <div className="w-14 h-14 rounded-2xl bg-purple-700 text-white flex items-center justify-center font-bold shadow-md shadow-purple-900/20 shrink-0">
                <Building2 className="w-7 h-7" />
              </div>
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-purple-800 block">
                  Institución Emisora
                </span>
                <span className="text-base font-extrabold text-slate-900 block truncate max-w-[180px]">
                  INCOS El Alto
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Bento Timeline of Verified Achievements */}
        <div className="p-6 sm:p-10 space-y-6">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <h2 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
              <GraduationCap className="w-5 h-5 text-[#1E3A5F]" />
              <span>Historial Académico Certificado ({credentials.length})</span>
            </h2>
            <span className="text-xs text-slate-400 font-medium">
              Verificable individualmente con firma digital
            </span>
          </div>

          <div className="space-y-4">
            {credentials.map((item, idx) => {
              const typeConfig = CREDENTIAL_TYPE_LABELS[item.credentialType];
              const isRevoked = item.status === "REVOKED";
              const isDegree = item.credentialType === "TITULO_TECNICO_SUPERIOR" || item.credentialType === "DIPLOMADO";
              const staggerClass = idx < 6 ? `stagger-${idx + 1}` : "";

              return (
                <div
                  key={item.id || idx}
                  className={`p-6 rounded-3xl border-2 transition-all duration-300 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 animate-fade-in-up ${staggerClass} ${
                    isDegree
                      ? "border-amber-300 bg-gradient-to-r from-amber-50/40 via-white to-white shadow-sm hover:border-amber-400"
                      : "border-slate-200 hover:border-blue-300 bg-white"
                  }`}
                >
                  {/* Badge Thumbnail */}
                  {item.tokenId && (
                    <div className="w-20 h-20 rounded-2xl overflow-hidden border-2 border-slate-200 bg-slate-950 shrink-0 shadow-md shimmer-container group">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={`/api/badges/${item.tokenId}`}
                        alt={item.title}
                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                    </div>
                  )}

                  <div className="space-y-2 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className={`text-[11px] font-extrabold px-3 py-1 rounded-full border ${
                        isDegree ? "bg-amber-100 text-amber-900 border-amber-300" : "bg-blue-100 text-blue-900 border-blue-200"
                      }`}>
                        {typeConfig?.label || item.credentialType}
                      </span>

                      {item.tokenId && (
                        <span className="font-mono text-xs font-extrabold text-slate-700 bg-slate-100 px-2.5 py-0.5 rounded-lg border border-slate-200">
                          Token #{item.tokenId}
                        </span>
                      )}

                      {item.hours && item.hours > 0 && (
                        <span className="inline-flex items-center gap-1 text-[11px] font-extrabold text-blue-800 bg-blue-50 px-2.5 py-0.5 rounded-full border border-blue-200">
                          <Clock className="w-3 h-3" />
                          {item.hours} hrs
                        </span>
                      )}
                    </div>

                    <h3 className="text-base sm:text-lg font-extrabold text-slate-900">
                      {item.title}
                    </h3>

                    {item.description && (
                      <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                        {item.description}
                      </p>
                    )}

                    <div className="flex items-center gap-3 text-xs text-slate-400 pt-1">
                      <span>Emisor: <strong className="text-slate-700">{item.issuer?.name || "INCOS El Alto"}</strong></span>
                      <span>•</span>
                      <span>Fecha: {new Date(item.issueDate).toLocaleDateString()}</span>
                    </div>
                  </div>

                  {/* Verification Status & Link */}
                  <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-3 shrink-0 border-t sm:border-t-0 pt-3 sm:pt-0 border-slate-100 w-full sm:w-auto">
                    {isRevoked ? (
                      <span className="inline-flex items-center gap-1.5 text-xs font-bold text-red-600 bg-red-50 px-3 py-1.5 rounded-xl border border-red-200">
                        <AlertTriangle className="w-4 h-4" />
                        Revocada
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-800 bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-200">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        Auténtica On-Chain
                      </span>
                    )}

                    {item.tokenId && (
                      <Link
                        href={`/verify/${item.tokenId}`}
                        className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#1E3A5F] hover:bg-[#152942] text-white text-xs font-extrabold rounded-xl shadow-2xs transition-all active:scale-95 cursor-pointer"
                      >
                        <span>Ver Prueba</span>
                        <ExternalLink className="w-3.5 h-3.5" />
                      </Link>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Global QR Modal */}
      {showQRModal && (
        <CredentialQRModal
          isOpen={showQRModal}
          onClose={() => setShowQRModal(false)}
          walletAddress={student.walletAddress}
          title={`Trayectoria Académica Completa (${totalHours} hrs)`}
          studentName={student.fullName}
          isGlobalCV={true}
        />
      )}
    </div>
  );
}
