"use client";

import { useState, useEffect, useCallback } from "react";
import { IssueForm } from "@/components/IssueForm";
import { BatchIssueForm } from "@/components/BatchIssueForm";
import { IssuedTable, CredentialItem } from "@/components/IssuedTable";
import { useInCoinContract } from "@/lib/useInCoinContract";
import { ConnectWallet } from "@/components/ConnectWallet";
import {
  ShieldCheck,
  Award,
  Clock,
  CheckCircle2,
  AlertCircle,
  Building2,
  RefreshCw,
  User,
  FileSpreadsheet,
  Lock,
  Wallet,
  Shield,
  Key,
} from "lucide-react";

interface IssuerProfile {
  id: string;
  name: string;
  shortName: string;
  walletAddress: string;
  type: string;
  isAuthorized: boolean;
}

export default function IssuerDashboardPage() {
  const { isConnected, isIssuer, address } = useInCoinContract();
  const [credentials, setCredentials] = useState<CredentialItem[]>([]);
  const [issuerProfile, setIssuerProfile] = useState<IssuerProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [emissionMode, setEmissionMode] = useState<"SINGLE" | "BATCH">("SINGLE");

  // Fetch credentials and issuer identity
  const fetchDashboardData = useCallback(async () => {
    if (!isConnected || !address) {
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);

      // 1. Fetch credentials
      const resCreds = await fetch(`/api/credentials?issuerAddress=${address}`);
      const jsonCreds = await resCreds.json();
      if (jsonCreds.success && Array.isArray(jsonCreds.data)) {
        setCredentials(jsonCreds.data);
      }

      // 2. Fetch issuer profile from database
      const resIssuer = await fetch(`/api/issuers?walletAddress=${address}`);
      const jsonIssuer = await resIssuer.json();
      if (jsonIssuer.success && jsonIssuer.data) {
        setIssuerProfile(jsonIssuer.data);
      } else {
        // Default to INCOS El Alto profile for development
        setIssuerProfile({
          id: "incos-default",
          name: "Instituto Comercial Superior de la Nación - INCOS El Alto",
          shortName: "INCOS El Alto",
          walletAddress: address,
          type: "INSTITUTO_TECNICO",
          isAuthorized: true,
        });
      }
    } catch (err) {
      console.error("Error fetching issuer dashboard data:", err);
    } finally {
      setIsLoading(false);
    }
  }, [isConnected, address]);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  // Statistics calculation
  const totalIssued = credentials.length;
  const totalHours = credentials.reduce((acc, curr) => acc + (curr.hours || 0), 0);
  const activeCredentials = credentials.filter((c) => c.status !== "REVOKED").length;
  const revokedCount = credentials.filter((c) => c.status === "REVOKED").length;

  // ─────────────────────────────────────────────────────────────
  // 1. PANTALLA DE ACCESO RESTRINGIDO (CUANDO NO HAY WALLET CONECTADA)
  // ─────────────────────────────────────────────────────────────
  if (!isConnected) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
        <div className="bg-white rounded-3xl border border-slate-200 shadow-xl overflow-hidden text-center p-8 sm:p-14 space-y-8">
          {/* Lock Icon */}
          <div className="w-20 h-20 rounded-3xl bg-slate-100 text-[#1E3A5F] flex items-center justify-center mx-auto border-2 border-slate-200 shadow-inner">
            <Lock className="w-10 h-10 text-[#1E3A5F]" />
          </div>

          {/* Heading */}
          <div className="max-w-lg mx-auto space-y-3">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-blue-50 text-blue-800 text-xs font-extrabold border border-blue-200">
              <Shield className="w-3.5 h-3.5" />
              PORTAL DE EMISIÓN INSTITUCIONAL
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Autenticación Web3 Requerida
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
              Para emitir títulos académicos, certificaciones técnicas, diplomados y pasantías oficiales en la red INCOIN, debes autenticarte con la billetera digital de tu institución.
            </p>
          </div>

          {/* Action to Connect */}
          <div className="pt-2 flex flex-col items-center justify-center gap-3">
            <ConnectWallet />
            <p className="text-[11px] text-slate-400">
              Compatible con MetaMask, Brave Wallet y billeteras EVM
            </p>
          </div>

          {/* Trust Pillars */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-6 border-t border-slate-100 text-left">
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-800">
                <Key className="w-4 h-4 text-blue-600" />
                <span>Firma Criptográfica</span>
              </div>
              <p className="text-[11px] text-slate-500">
                El rector o autoridad autorizada sella los títulos mediante llaves asimétricas.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-800">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>Sello Soulbound (SBT)</span>
              </div>
              <p className="text-[11px] text-slate-500">
                Las credenciales emitidas quedan bloqueadas permanentemente al titular.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-800">
                <Building2 className="w-4 h-4 text-purple-600" />
                <span>Multi-Institucional</span>
              </div>
              <p className="text-[11px] text-slate-500">
                Soporte descentralizado para institutos técnicos, universidades y academias.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ─────────────────────────────────────────────────────────────
  // 1.5. ACCESO DENEGADO (WALLET CONECTADA PERO SIN ISSUER_ROLE)
  // ─────────────────────────────────────────────────────────────
  if (!isIssuer) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
        <div className="bg-white rounded-3xl border border-amber-200 shadow-xl overflow-hidden text-center p-8 sm:p-14 space-y-8">
          <div className="w-20 h-20 rounded-3xl bg-amber-50 text-amber-700 flex items-center justify-center mx-auto border-2 border-amber-200 shadow-inner">
            <AlertCircle className="w-10 h-10 text-amber-600" />
          </div>

          <div className="max-w-lg mx-auto space-y-3">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-amber-50 text-amber-800 text-xs font-extrabold border border-amber-200">
              <Lock className="w-3.5 h-3.5 text-amber-600" />
              ROL NO AUTORIZADO (UNAUTHORIZED)
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Billetera Sin Permisos de Emisión
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              La cuenta conectada <span className="font-mono text-xs font-bold bg-slate-100 px-1.5 py-0.5 rounded text-slate-800">{address}</span> no posee el rol criptográfico <span className="font-mono text-xs font-bold text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded">ISSUER_ROLE</span> en el Smart Contract de INCOIN.
            </p>
          </div>

          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 max-w-md mx-auto text-xs text-slate-600 space-y-2">
            <p className="font-semibold text-slate-800">¿Eres una institución educativa o rectorado?</p>
            <p className="text-slate-500 text-[11px]">
              Para afiliar tu entidad a la red y obtener permisos de firma on-chain, ingresa al portal de gobernanza o conecta la wallet rectoral autorizada.
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <a
              href="/governance"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#1E3A5F] hover:bg-[#152942] text-white text-xs font-extrabold rounded-xl shadow-md transition-all cursor-pointer"
            >
              <Building2 className="w-4 h-4 text-amber-300" />
              <span>Ver Directorio de Gobernanza</span>
            </a>
            <a
              href="/student"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl border border-slate-200 transition-all"
            >
              <span>Ir a Mi Portafolio Estudiantil</span>
            </a>
          </div>
        </div>
      </div>
    );
  }

  // ─────────────────────────────────────────────────────────────
  // 2. PANEL DE EMISIÓN AUTORIZADO (CUANDO LA WALLET TIENE ISSUER_ROLE)
  // ─────────────────────────────────────────────────────────────
  const institutionName = issuerProfile?.name || "Instituto Comercial Superior de la Nación - INCOS El Alto";
  const institutionShort = issuerProfile?.shortName || "INCOS El Alto";

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header Institucional de la Entidad Conectada */}
      <div className="bg-gradient-to-r from-[#1E3A5F] to-[#12263F] text-white rounded-3xl p-6 sm:p-8 shadow-sm relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-white text-xs font-semibold backdrop-blur-sm border border-white/10">
              <Building2 className="w-3.5 h-3.5 text-amber-300" />
              Institución Emisora Autorizada • Protocolo INCOIN
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              {institutionShort} — Portal de Emisión
            </h1>
            <p className="text-sm text-slate-200 max-w-2xl">
              {institutionName}. Emisión descentralizada de títulos técnicos, certificaciones profesionales, diplomados, pasantías y horas formativas mediante Soulbound Tokens (SBT).
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={fetchDashboardData}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-white/10 hover:bg-white/20 text-white text-xs font-semibold rounded-xl backdrop-blur-sm border border-white/10 transition-colors cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? "animate-spin" : ""}`} />
              Actualizar Datos
            </button>
          </div>
        </div>

        {/* Status bar */}
        <div className="mt-6 pt-6 border-t border-white/15 flex flex-wrap items-center justify-between gap-4 text-xs">
          <div className="flex items-center gap-2">
            <span className="text-slate-300">Wallet Emisora:</span>
            <span className="font-mono bg-black/20 px-2.5 py-1 rounded-lg text-emerald-300 border border-emerald-500/20">
              {address}
            </span>
          </div>

          <div className="inline-flex items-center gap-1.5 text-emerald-300 font-semibold">
            <ShieldCheck className="w-4 h-4" /> Rol ISSUER_ROLE Verificado on-chain
          </div>
        </div>
      </div>

      {/* KPI Metrics Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center font-bold">
            <Award className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-extrabold text-slate-900">{totalIssued}</div>
            <div className="text-xs text-slate-500 font-medium">Credenciales Emitidas</div>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-700 flex items-center justify-center font-bold">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-extrabold text-slate-900">{totalHours.toLocaleString()}</div>
            <div className="text-xs text-slate-500 font-medium">Horas Formativas Validadas</div>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-extrabold text-slate-900">{activeCredentials}</div>
            <div className="text-xs text-slate-500 font-medium">Credenciales Válidas (SBT)</div>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-red-50 text-red-700 flex items-center justify-center font-bold">
            <AlertCircle className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-extrabold text-slate-900">{revokedCount}</div>
            <div className="text-xs text-slate-500 font-medium">Credenciales Revocadas</div>
          </div>
        </div>
      </div>

      {/* Selector de Modo de Emisión: Individual vs Masiva (Excel/CSV) */}
      <div className="space-y-4">
        <div className="flex items-center justify-between pb-2 border-b border-slate-200">
          <h2 className="text-base font-bold text-slate-900">
            Modalidad de Emisión de Credenciales
          </h2>

          <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-xl border border-slate-200">
            <button
              onClick={() => setEmissionMode("SINGLE")}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                emissionMode === "SINGLE"
                  ? "bg-white text-[#1E3A5F] shadow-2xs"
                  : "text-slate-500 hover:text-slate-800"
              }`}
            >
              <User className="w-3.5 h-3.5" />
              <span>Emisión Individual (1 por 1)</span>
            </button>

            <button
              onClick={() => setEmissionMode("BATCH")}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                emissionMode === "BATCH"
                  ? "bg-white text-[#1E3A5F] shadow-2xs"
                  : "text-slate-500 hover:text-slate-800"
              }`}
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
              <span>Carga Masiva (Excel / CSV)</span>
            </button>
          </div>
        </div>

        {/* Renderiza el formulario seleccionado */}
        {emissionMode === "SINGLE" ? (
          <IssueForm onIssuedSuccess={fetchDashboardData} />
        ) : (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8">
            <BatchIssueForm onIssuedSuccess={fetchDashboardData} />
          </div>
        )}
      </div>

      {/* Tabla de Credenciales Emitidas */}
      <IssuedTable credentials={credentials} onRefresh={fetchDashboardData} />
    </div>
  );
}
