"use client";

import { useState, useEffect, useCallback } from "react";
import { useAccount } from "wagmi";
import { CredentialCard } from "@/components/CredentialCard";
import { CredentialItem } from "@/components/IssuedTable";
import { CredentialQRModal } from "@/components/CredentialQRModal";
import { ConnectWallet } from "@/components/ConnectWallet";
import { CREDENTIAL_TYPE_LABELS } from "@/lib/metadata";
import { useInCoinContract } from "@/lib/useInCoinContract";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  GraduationCap,
  Clock,
  Award,
  ShieldCheck,
  User,
  Sparkles,
  IdCard,
  Building2,
  QrCode,
  ExternalLink,
  Lock,
  Search,
  ArrowRight,
  Loader2,
  Copy,
  Check,
} from "lucide-react";

interface StudentProfile {
  id?: string;
  walletAddress: string;
  fullName: string;
  identityNumber?: string | null;
  career?: string | null;
}

export default function StudentPortalPage() {
  const { address, isConnected } = useAccount();
  const { isIssuer, isAdmin } = useInCoinContract();
  const router = useRouter();

  const [studentProfile, setStudentProfile] = useState<StudentProfile | null>(null);
  const [studentCredentials, setStudentCredentials] = useState<CredentialItem[]>([]);
  const [filterType, setFilterType] = useState<string>("ALL");
  const [isLoading, setIsLoading] = useState(true);
  const [showCVQR, setShowCVQR] = useState(false);
  const [searchWalletInput, setSearchWalletInput] = useState("");
  const [copiedLink, setCopiedLink] = useState(false);

  // Fetch student profile and credentials for the CONNECTED wallet
  const fetchStudentData = useCallback(async () => {
    if (!isConnected || !address) {
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);

      // 1. Fetch student profile
      const resProfile = await fetch(`/api/students?walletAddress=${address}`);
      const jsonProfile = await resProfile.json();

      if (jsonProfile.success && jsonProfile.data) {
        setStudentProfile(jsonProfile.data);
      } else {
        setStudentProfile({
          walletAddress: address,
          fullName: "Estudiante Titular",
          career: "Educación Técnica Superior",
        });
      }

      // 2. Fetch credentials for this specific wallet
      const resCreds = await fetch(`/api/credentials?studentAddress=${address}`);
      const jsonCreds = await resCreds.json();
      if (jsonCreds.success && Array.isArray(jsonCreds.data)) {
        setStudentCredentials(jsonCreds.data);
      } else {
        setStudentCredentials([]);
      }
    } catch (err) {
      console.error("Error fetching student portal data:", err);
    } finally {
      setIsLoading(false);
    }
  }, [isConnected, address]);

  useEffect(() => {
    fetchStudentData();
  }, [fetchStudentData]);

  const handleSearchPublicCV = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanAddr = searchWalletInput.trim();
    if (cleanAddr.startsWith("0x") && cleanAddr.length === 42) {
      router.push(`/cv/${cleanAddr}`);
    }
  };

  const handleCopyCVLink = () => {
    if (!address) return;
    const url = `${window.location.origin}/cv/${address}`;
    navigator.clipboard.writeText(url);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  // Calculations
  const totalHours = studentCredentials.reduce((acc, curr) => acc + (curr.hours || 0), 0);
  const activeCount = studentCredentials.filter((c) => c.status !== "REVOKED").length;

  const filteredCredentials = studentCredentials.filter((item) => {
    if (filterType === "ALL") return true;
    return item.credentialType === filterType;
  });

  // ─────────────────────────────────────────────────────────────
  // 1. ESTADO NO CONECTADO: PIDE WALLET O BUSCAR POR DIRECCIÓN
  // ─────────────────────────────────────────────────────────────
  if (!isConnected) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24 space-y-10">
        <div className="bg-white rounded-3xl border border-slate-200 shadow-xl overflow-hidden text-center p-8 sm:p-14 space-y-8">
          <div className="w-20 h-20 rounded-3xl bg-emerald-50 text-emerald-700 flex items-center justify-center mx-auto border-2 border-emerald-200 shadow-inner">
            <GraduationCap className="w-10 h-10 text-emerald-600" />
          </div>

          <div className="max-w-lg mx-auto space-y-3">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-emerald-50 text-emerald-800 text-xs font-extrabold border border-emerald-200">
              <ShieldCheck className="w-3.5 h-3.5" />
              PORTAFOLIO ACADÉMICO DEL ESTUDIANTE
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Consulta tus Títulos y Certificados
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
              Conecta tu billetera digital (MetaMask) para acceder a tu vitrina privada de credenciales académicas intransferibles emitidas bajo el estándar Soulbound (ERC-5192).
            </p>
          </div>

          <div className="pt-2 flex flex-col items-center justify-center gap-3">
            <ConnectWallet />
            <p className="text-[11px] text-slate-400">
              Tus certificados están ligados criptográficamente a tu clave pública
            </p>
          </div>

          {/* Search any public CV */}
          <div className="pt-8 border-t border-slate-100 max-w-md mx-auto space-y-3">
            <span className="text-xs font-bold text-slate-600 block uppercase">
              O consulta un Portafolio Público por Wallet:
            </span>
            <form onSubmit={handleSearchPublicCV} className="flex gap-2">
              <input
                type="text"
                value={searchWalletInput}
                onChange={(e) => setSearchWalletInput(e.target.value)}
                placeholder="0x... (42 caracteres)"
                className="flex-1 px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl font-mono text-xs text-slate-800 focus:outline-none focus:border-blue-500 focus:bg-white"
              />
              <button
                type="submit"
                className="px-4 py-2 bg-[#1E3A5F] hover:bg-[#152942] text-white text-xs font-bold rounded-xl transition-all cursor-pointer"
              >
                Buscar
              </button>
            </form>
          </div>
        </div>
      </div>
    );
  }

  // ─────────────────────────────────────────────────────────────
  // 2. ESTADO AUTENTICADO: PORTAFOLIO PROPIO DEL ESTUDIANTE
  // ─────────────────────────────────────────────────────────────
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Issuer Notice if connected with Institutional Wallet */}
      {isIssuer && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-amber-900 text-xs">
          <div className="flex items-center gap-2.5 font-bold">
            <Building2 className="w-5 h-5 text-amber-600 shrink-0" />
            <span>Estás autenticado con la cuenta institucional oficial de <strong>INCOS El Alto</strong>.</span>
          </div>
          <Link
            href="/issuer"
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-[#1E3A5F] hover:bg-[#152942] text-white font-extrabold rounded-lg shadow-sm transition-all cursor-pointer"
          >
            <span>Ir al Panel de Emisión</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      )}

      {/* Student Profile Banner */}
      <div className="bg-gradient-to-r from-[#1E3A5F] via-[#1A365D] to-[#0F1D30] text-white rounded-3xl p-6 sm:p-8 shadow-sm relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-semibold backdrop-blur-sm border border-emerald-400/20">
              <GraduationCap className="w-3.5 h-3.5" />
              {isIssuer ? "Entidad Emisora Oficial" : "Mi Portafolio Académico Verificable"}
            </div>

            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                {isIssuer
                  ? "Instituto Comercial Superior de la Nación - INCOS El Alto"
                  : (studentProfile?.fullName || "Estudiante Titular")}
              </h1>
              <div className="flex flex-wrap items-center gap-3 text-xs text-slate-300 mt-1.5">
                <span className="flex items-center gap-1">
                  <Building2 className="w-3.5 h-3.5 text-amber-300" />
                  Red INCOIN
                </span>
                {!isIssuer && studentProfile?.identityNumber && (
                  <>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <IdCard className="w-3.5 h-3.5" />
                      CI: {studentProfile.identityNumber}
                    </span>
                  </>
                )}
                <span>•</span>
                <span>{isIssuer ? "Rol: Emisor Académico Autorizado" : `Carrera: ${studentProfile?.career || "Sistemas Informáticos"}`}</span>
              </div>
            </div>

            {/* Actions: QR & Shareable Public Link */}
            <div className="pt-1 flex flex-wrap gap-2">
              <button
                onClick={() => setShowCVQR(true)}
                className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-slate-950 text-xs font-extrabold rounded-xl shadow-sm transition-all active:scale-95 cursor-pointer"
              >
                <QrCode className="w-4 h-4 text-slate-950" />
                <span>Generar QR para Currículum</span>
              </button>

              <button
                onClick={handleCopyCVLink}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-white/10 hover:bg-white/20 text-white text-xs font-bold rounded-xl border border-white/15 transition-colors cursor-pointer"
              >
                {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedLink ? "¡Enlace Copiado!" : "Copiar Enlace a Mi CV Público"}</span>
              </button>

              {address && (
                <Link
                  href={`/cv/${address}`}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-white/10 hover:bg-white/20 text-white text-xs font-bold rounded-xl border border-white/15 transition-colors"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>Ver Vista Pública de Empleador</span>
                </Link>
              )}
            </div>
          </div>

          <div className="bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/10 space-y-1 text-xs">
            <span className="text-[10px] text-slate-300 font-bold uppercase block">
              Custodia Soulbound:
            </span>
            <p className="text-[11px] text-slate-200 leading-relaxed">
              Todos los títulos aquí reflejados están sellados de forma permanente a tu billetera sin posibilidad de robo o transferencia.
            </p>
          </div>
        </div>

        {/* Wallet Address Bar */}
        <div className="mt-6 pt-6 border-t border-white/15 flex flex-wrap items-center justify-between gap-4 text-xs">
          <div className="flex items-center gap-2">
            <span className="text-slate-300">Billetera Conectada:</span>
            <span className="font-mono bg-black/30 px-2.5 py-1 rounded-lg text-emerald-300 border border-emerald-500/30">
              {address}
            </span>
          </div>

          <div className="flex items-center gap-2 text-slate-300 text-xs">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>Estándar Oficial ERC-5192</span>
          </div>
        </div>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center font-bold">
            <Award className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-extrabold text-slate-900">{studentCredentials.length}</div>
            <div className="text-xs text-slate-500 font-medium">Credenciales en Portafolio</div>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-extrabold text-slate-900">{totalHours.toLocaleString()} hrs</div>
            <div className="text-xs text-slate-500 font-medium">Horas Formativas Validadas</div>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center font-bold">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-extrabold text-slate-900">{activeCount} Válidas</div>
            <div className="text-xs text-slate-500 font-medium">Tokens Soulbound Activos</div>
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center justify-between gap-4 flex-wrap pb-2 border-b border-slate-200">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
          <button
            onClick={() => setFilterType("ALL")}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              filterType === "ALL"
                ? "bg-[#1E3A5F] text-white shadow-sm"
                : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
            }`}
          >
            Todas ({studentCredentials.length})
          </button>

          {Object.entries(CREDENTIAL_TYPE_LABELS).map(([key, config]) => {
            const count = studentCredentials.filter((c) => c.credentialType === key).length;
            const isSelected = filterType === key;

            return (
              <button
                key={key}
                onClick={() => setFilterType(key)}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                  isSelected
                    ? "bg-[#1E3A5F] text-white shadow-sm"
                    : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
                }`}
              >
                {config.label.split(" ")[0]} ({count})
              </button>
            );
          })}
        </div>
      </div>

      {/* Credential Cards Grid */}
      {isLoading ? (
        <div className="py-20 text-center space-y-3">
          <Loader2 className="w-8 h-8 animate-spin text-[#1E3A5F] mx-auto" />
          <p className="text-xs text-slate-500 font-medium">Cargando credenciales del estudiante...</p>
        </div>
      ) : filteredCredentials.length === 0 ? (
        <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center text-slate-400 space-y-3">
          <GraduationCap className="w-12 h-12 mx-auto text-slate-300" />
          <h3 className="text-sm font-bold text-slate-700">Aún no tienes credenciales en esta billetera</h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            Cuando tu institución educativa emita un título o certificación a tu dirección <span className="font-mono text-slate-700">{address}</span>, aparecerá reflejado aquí automáticamente.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCredentials.map((cred) => (
            <CredentialCard key={cred.id} credential={cred} />
          ))}
        </div>
      )}

      {/* Global CV QR Modal */}
      {showCVQR && address && (
        <CredentialQRModal
          isOpen={showCVQR}
          onClose={() => setShowCVQR(false)}
          walletAddress={address}
          title={`Trayectoria Académica Completa (${totalHours} hrs)`}
          studentName={studentProfile?.fullName || "Estudiante Titular"}
          isGlobalCV={true}
        />
      )}
    </div>
  );
}
