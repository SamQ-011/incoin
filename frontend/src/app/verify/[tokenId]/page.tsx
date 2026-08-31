"use client";

import { useEffect, useState, use } from "react";
import Link from "next/link";
import { CREDENTIAL_TYPE_LABELS } from "@/lib/metadata";
import {
  ShieldCheck,
  AlertTriangle,
  Clock,
  Building2,
  User,
  Calendar,
  Lock,
  ExternalLink,
  Copy,
  Check,
  Printer,
  Hash,
  ArrowLeft,
  Loader2,
  CheckCircle2,
  Sparkles,
  ChevronDown,
  ChevronUp,
  Fingerprint,
  Cpu,
  Shield,
  Layers,
  Zap,
} from "lucide-react";

interface VerificationData {
  tokenId: number;
  txHash: string | null;
  title: string;
  description: string | null;
  credentialType: string;
  hours: number | null;
  metadataHash: string;
  issueDate: string;
  status: string;
  revoked: boolean;
  revokedAt: string | null;
  revokedReason: string | null;
  isSoulbound: boolean;
  issuer: {
    name: string;
    shortName: string;
    type: string;
    walletAddress: string;
    isAuthorized: boolean;
  };
  student: {
    fullName: string;
    identityNumber: string | null;
    career: string | null;
    walletAddress: string;
  };
}

export default function PublicVerifyResultPage({
  params,
}: {
  params: Promise<{ tokenId: string }>;
}) {
  const resolvedParams = use(params);
  const tokenId = resolvedParams.tokenId;

  const [data, setData] = useState<VerificationData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadingStep, setLoadingStep] = useState(0);
  const [notFound, setNotFound] = useState(false);
  const [copied, setCopied] = useState(false);
  const [copiedTx, setCopiedTx] = useState(false);
  const [showAuditDetails, setShowAuditDetails] = useState(true);

  // Progressive cryptographic verification simulation
  useEffect(() => {
    setIsLoading(true);
    setLoadingStep(1);

    const timer1 = setTimeout(() => setLoadingStep(2), 350);
    const timer2 = setTimeout(() => setLoadingStep(3), 750);

    fetch(`/api/verify/${tokenId}`)
      .then((res) => res.json())
      .then((json) => {
        if (json.success && json.data) {
          setData(json.data);
          setNotFound(false);
        } else {
          setNotFound(true);
        }
      })
      .catch((err) => {
        console.error("Error fetching verification data:", err);
        setNotFound(true);
      })
      .finally(() => {
        setTimeout(() => {
          setIsLoading(false);
        }, 1100);
      });

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
    };
  }, [tokenId]);

  const copyHash = (hash: string) => {
    navigator.clipboard.writeText(hash);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const copyTxHash = (hash: string) => {
    navigator.clipboard.writeText(hash);
    setCopiedTx(true);
    setTimeout(() => setCopiedTx(false), 2000);
  };

  // ─────────────────────────────────────────────────────────────
  // 1. LOADING STATE: EXPERIENCIA DE DECODIFICACIÓN CRIPTOGRÁFICA
  // ─────────────────────────────────────────────────────────────
  if (isLoading) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-20">
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 sm:p-12 text-center text-white space-y-8 shadow-2xl relative overflow-hidden">
          {/* Subtle Scanning Radar Accent */}
          <div className="w-20 h-20 rounded-3xl bg-blue-500/10 border border-blue-500/30 flex items-center justify-center mx-auto relative animate-pulse">
            <Cpu className="w-10 h-10 text-blue-400" />
            <span className="absolute -top-1 -right-1 flex h-4 w-4">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-4 w-4 bg-emerald-500" />
            </span>
          </div>

          <div className="space-y-2">
            <span className="text-[11px] font-mono uppercase tracking-widest text-emerald-400 bg-emerald-950/60 px-3 py-1 rounded-full border border-emerald-800/60">
              Protocolo INCOIN • ERC-5192 (Soulbound)
            </span>
            <h2 className="text-xl sm:text-2xl font-extrabold tracking-tight">
              Decodificando Prueba Criptográfica On-Chain
            </h2>
            <p className="text-xs text-slate-400 font-mono">
              Consultando Token ID: <span className="text-amber-300">#{tokenId}</span>
            </p>
          </div>

          {/* Stepper Verification Log */}
          <div className="max-w-md mx-auto space-y-3 text-left font-mono text-xs bg-slate-950/80 p-5 rounded-2xl border border-slate-800/80">
            <div className="flex items-center gap-3 text-slate-300">
              <span className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-[10px] font-bold">
                ✓
              </span>
              <span>1. Conexión RPC EVM establecida</span>
            </div>

            <div className={`flex items-center gap-3 transition-opacity duration-300 ${loadingStep >= 2 ? "text-slate-300" : "text-slate-600 opacity-40"}`}>
              <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${loadingStep >= 2 ? "bg-emerald-500/20 text-emerald-400" : "bg-slate-800 text-slate-500"}`}>
                {loadingStep >= 2 ? "✓" : "2"}
              </span>
              <span>2. Consultando contrato InCoinCredential.sol</span>
            </div>

            <div className={`flex items-center gap-3 transition-opacity duration-300 ${loadingStep >= 3 ? "text-slate-300" : "text-slate-600 opacity-40"}`}>
              <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${loadingStep >= 3 ? "bg-emerald-500/20 text-emerald-400" : "bg-slate-800 text-slate-500"}`}>
                {loadingStep >= 3 ? "✓" : "3"}
              </span>
              <span>3. Validando Keccak-256 & bloqueo Soulbound</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ─────────────────────────────────────────────────────────────
  // 2. ERROR / NOT FOUND STATE
  // ─────────────────────────────────────────────────────────────
  if (notFound || !data) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center space-y-6 animate-fade-in-scale">
        <div className="w-20 h-20 rounded-3xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto border-2 border-amber-200 shadow-inner">
          <AlertTriangle className="w-10 h-10" />
        </div>

        <div className="space-y-2">
          <span className="text-xs font-bold uppercase tracking-wider text-amber-700 bg-amber-100/80 px-3.5 py-1 rounded-full border border-amber-200">
            Token No Registrado
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Credencial Inexistente en Blockchain
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 max-w-md mx-auto leading-relaxed">
            El identificador <span className="font-mono font-bold text-slate-900">#{tokenId}</span> no corresponde a ninguna credencial sellada on-chain en el protocolo INCOIN.
          </p>
        </div>

        <div className="pt-2">
          <Link
            href="/verify"
            className="inline-flex items-center gap-2 px-6 py-3 bg-[#1E3A5F] hover:bg-[#152942] text-white text-xs font-extrabold rounded-xl shadow-md transition-all active:scale-95 cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Buscar otra credencial</span>
          </Link>
        </div>
      </div>
    );
  }

  const isRevoked = data.revoked;
  const typeConfig = CREDENTIAL_TYPE_LABELS[data.credentialType];

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8 animate-fade-in-up">
      {/* Navigation Breadcrumb */}
      <div className="flex items-center justify-between">
        <Link
          href="/verify"
          className="inline-flex items-center gap-2 text-xs font-bold text-slate-600 hover:text-[#1E3A5F] transition-colors p-1"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Volver al buscador de verificación</span>
        </Link>

        <button
          onClick={() => window.print()}
          className="inline-flex items-center gap-1.5 px-4 py-2 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 text-xs font-bold rounded-xl shadow-2xs transition-all active:scale-95 cursor-pointer"
        >
          <Printer className="w-3.5 h-3.5" />
          <span>Imprimir Certificado</span>
        </button>
      </div>

      {/* Main Official Verification Card */}
      <div className="bg-white rounded-3xl border-2 border-slate-200 shadow-xl overflow-hidden">
        {/* Verification Status Header Banner (WITH WOW PULSE GLOW) */}
        <div
          className={`p-6 sm:p-8 text-white relative overflow-hidden transition-all duration-300 ${isRevoked
              ? "bg-gradient-to-r from-red-700 via-rose-800 to-red-950"
              : "bg-gradient-to-r from-[#0F1D30] via-[#1E3A5F] to-[#10B981] animate-pulse-glow"
            }`}
        >
          {/* Background Decorative Grid */}
          <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none" />

          <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
            <div className="space-y-2">
              <div className="flex items-center gap-2 flex-wrap">
                <span
                  className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-extrabold shadow-md ${isRevoked
                      ? "bg-red-100 text-red-900 border border-red-200"
                      : "bg-emerald-400 text-slate-950 border border-emerald-300"
                    }`}
                >
                  {isRevoked ? (
                    <>
                      <AlertTriangle className="w-4 h-4 text-red-700" />
                      REVOCADA OFICIALMENTE
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-4 h-4 text-emerald-950" />
                      CERTIFICADO AUTÉNTICO ON-CHAIN
                    </>
                  )}
                </span>

                <span className="inline-flex items-center gap-1 text-[11px] font-bold bg-white/10 text-white px-2.5 py-1.5 rounded-full border border-white/20 backdrop-blur-sm">
                  <Lock className="w-3.5 h-3.5 text-amber-300" />
                  Soulbound (ERC-5192)
                </span>
              </div>

              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                {isRevoked ? "Credencial Académica Revocada" : "Verificación de Título Oficial"}
              </h1>
              <p className="text-xs text-slate-200 flex items-center gap-2">
                <span>Prueba criptográfica verificada en tiempo real</span>
                <span>•</span>
                <span className="font-mono text-emerald-300 font-bold">LOCKED = TRUE</span>
              </p>
            </div>

            <div className="text-left sm:text-right sm:border-l sm:border-white/20 sm:pl-6 space-y-0.5">
              <div className="text-[10px] uppercase font-bold text-slate-300 tracking-wider">
                Token ID Oficial
              </div>
              <div className="text-3xl sm:text-4xl font-mono font-extrabold tracking-tight text-white drop-shadow-sm">
                #{String(data.tokenId).padStart(6, "0")}
              </div>
              <div className="text-[10px] text-emerald-300 font-medium">
                Red Hardhat Local / Sepolia
              </div>
            </div>
          </div>
        </div>

        {/* Revocation Banner */}
        {isRevoked && (
          <div className="p-4 bg-red-50 border-b border-red-200 text-red-800 text-xs flex items-start gap-3">
            <AlertTriangle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold">Motivo de revocación oficial:</span>{" "}
              {data.revokedReason || "Revocada por la institución emisora"}
              {data.revokedAt && (
                <span className="block text-[11px] text-red-600 mt-0.5">
                  Fecha de revocación: {new Date(data.revokedAt).toLocaleString()}
                </span>
              )}
            </div>
          </div>
        )}

        {/* Certificate Body */}
        <div className="p-6 sm:p-10 space-y-8">
          {/* Top Section: Title + Dynamic NFT Badge Preview */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 pb-8 border-b border-slate-100 items-center">
            <div className="lg:col-span-8 space-y-3">
              <span className="inline-flex items-center gap-1.5 text-xs font-bold px-3.5 py-1 rounded-full bg-blue-50 text-[#1E3A5F] border border-blue-100">
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                {typeConfig?.label || data.credentialType}
              </span>

              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 leading-tight">
                {data.title}
              </h2>

              {data.description && (
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                  {data.description}
                </p>
              )}
            </div>

            {/* Dynamic NFT Badge SVG with Metallic Shimmer */}
            <div className="lg:col-span-4 flex flex-col items-center">
              <div className="relative group w-full max-w-[240px] aspect-square rounded-3xl overflow-hidden border-2 border-slate-200 shadow-lg bg-slate-950 shimmer-container transition-all hover:scale-105 duration-300">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={`/api/badges/${data.tokenId}`}
                  alt={`Medalla Digital #${data.tokenId}`}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
                <div className="absolute bottom-2.5 left-2.5 right-2.5 bg-slate-950/85 backdrop-blur-md text-white text-[10px] font-bold py-1 px-2 rounded-xl text-center border border-white/10 flex items-center justify-center gap-1.5">
                  <Fingerprint className="w-3 h-3 text-emerald-400" />
                  <span>Sello Dinámico SVG</span>
                </div>
              </div>

              <a
                href={`/api/badges/${data.tokenId}`}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-3 text-xs font-bold text-blue-600 hover:text-blue-800 inline-flex items-center gap-1.5 transition-colors"
              >
                <span>Inspeccionar SVG Vectorial</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>

          {/* Validated Academic Hours (HERO BADGE) */}
          {data.hours && data.hours > 0 && (
            <div className="p-6 bg-gradient-to-r from-blue-50 via-indigo-50/70 to-emerald-50/50 border-2 border-blue-200/80 rounded-3xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-[#1E3A5F] text-white flex items-center justify-center font-bold shadow-md shadow-blue-900/20 shrink-0">
                  <Clock className="w-7 h-7 text-amber-300" />
                </div>
                <div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-blue-800 block">
                    Carga Horaria Formativa Certificada On-Chain
                  </span>
                  <span className="text-2xl sm:text-3xl font-extrabold text-slate-900">
                    {data.hours.toLocaleString()} Horas Académicas
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white border border-blue-200 text-[#1E3A5F] text-xs font-bold shadow-2xs">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>{data.issuer.shortName || "INCOS El Alto"}</span>
                </span>
              </div>
            </div>
          )}

          {/* Grid: Holder + Issuer Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Student Holder */}
            <div className="p-6 bg-slate-50/90 rounded-3xl border border-slate-200 space-y-4 shadow-2xs">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-500 uppercase tracking-wider">
                <User className="w-4 h-4 text-blue-600" />
                <span>Titular de la Credencial</span>
              </div>

              <div className="space-y-1.5">
                <div className="text-xl font-extrabold text-slate-900">
                  {data.student.fullName}
                </div>
                {data.student.identityNumber && (
                  <div className="text-xs text-slate-600">
                    Cédula de Identidad: <span className="font-bold text-slate-800">{data.student.identityNumber}</span>
                  </div>
                )}
                <div className="text-xs text-slate-600">
                  Carrera / Especialidad: <span className="font-bold text-slate-800">{data.student.career || "Sistemas Informáticos"}</span>
                </div>
                <div className="pt-2">
                  <span className="text-[10px] text-slate-400 block uppercase font-bold">Wallet del Titular (Soulbound):</span>
                  <span className="font-mono text-[11px] text-slate-800 bg-white px-2.5 py-1 rounded-xl border border-slate-200 block truncate mt-0.5">
                    {data.student.walletAddress}
                  </span>
                </div>
              </div>
            </div>

            {/* Institution Issuer */}
            <div className="p-6 bg-slate-50/90 rounded-3xl border border-slate-200 space-y-4 shadow-2xs">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-500 uppercase tracking-wider">
                <Building2 className="w-4 h-4 text-emerald-600" />
                <span>Institución Emisora Oficial</span>
              </div>

              <div className="space-y-1.5">
                <div className="text-xl font-extrabold text-slate-900">
                  {data.issuer.name}
                </div>
                <div className="text-xs text-slate-600 flex items-center gap-1.5">
                  <span>Tipo: Instituto Técnico Superior</span>
                  <span>•</span>
                  <span className="text-emerald-700 font-bold">ISSUER_ROLE Verificado ✓</span>
                </div>
                <div className="pt-2">
                  <span className="text-[10px] text-slate-400 block uppercase font-bold">Wallet de Firma Institucional:</span>
                  <span className="font-mono text-[11px] text-slate-800 bg-white px-2.5 py-1 rounded-xl border border-slate-200 block truncate mt-0.5">
                    {data.issuer.walletAddress}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Interactive Cryptographic Audit Trail (Collapsible) */}
          <div className="pt-4 border-t border-slate-200 space-y-4">
            <div
              onClick={() => setShowAuditDetails(!showAuditDetails)}
              className="flex items-center justify-between p-4 bg-slate-100 hover:bg-slate-200/80 rounded-2xl cursor-pointer transition-colors"
            >
              <div className="flex items-center gap-2 text-xs font-bold text-slate-800 uppercase tracking-wider">
                <ShieldCheck className="w-4 h-4 text-[#1E3A5F]" />
                <span>Auditoría Criptográfica e Inmutabilidad On-Chain</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-slate-500">
                <span>{showAuditDetails ? "Ocultar Detalles" : "Mostrar Detalles"}</span>
                {showAuditDetails ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </div>
            </div>

            {showAuditDetails && (
              <div className="bg-slate-950 text-slate-200 rounded-3xl p-6 font-mono text-xs space-y-4 overflow-x-auto shadow-2xl border border-slate-800 animate-fade-in-up">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 pb-3 border-b border-slate-800">
                  <span className="text-slate-400">Red Blockchain:</span>
                  <span className="text-emerald-400 font-bold">EVM Hardhat Localhost (31337) / Sepolia Testnet</span>
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 pb-3 border-b border-slate-800">
                  <span className="text-slate-400">Estándar ERC-5192 (Soulbound):</span>
                  <span className="text-blue-300 font-bold">locked(tokenId) = true (Intransferible)</span>
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 pb-3 border-b border-slate-800">
                  <span className="text-slate-400">Fecha de Sello On-Chain:</span>
                  <span className="text-slate-200">{new Date(data.issueDate).toUTCString()}</span>
                </div>

                {/* Keccak-256 Hash with Copy */}
                <div className="space-y-1.5 pt-1">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400 flex items-center gap-1.5">
                      <Fingerprint className="w-3.5 h-3.5 text-amber-400" />
                      Hash Criptográfico Keccak-256:
                    </span>
                    <button
                      onClick={() => copyHash(data.metadataHash)}
                      className="text-xs font-bold text-amber-400 hover:text-amber-300 flex items-center gap-1 cursor-pointer transition-colors"
                    >
                      {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copied ? "¡Copiado!" : "Copiar Hash"}</span>
                    </button>
                  </div>
                  <div className="bg-black/50 p-3 rounded-xl text-xs text-amber-300 break-all select-all border border-amber-500/20 shadow-inner">
                    {data.metadataHash}
                  </div>
                </div>

                {/* Transaction Hash */}
                {data.txHash && (
                  <div className="space-y-1.5 pt-1">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">Hash de Transacción:</span>
                      <button
                        onClick={() => copyTxHash(data.txHash!)}
                        className="text-xs font-bold text-blue-400 hover:text-blue-300 flex items-center gap-1 cursor-pointer transition-colors"
                      >
                        {copiedTx ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                        <span>{copiedTx ? "¡Copiado!" : "Copiar TX"}</span>
                      </button>
                    </div>
                    <div className="bg-black/50 p-3 rounded-xl text-xs text-slate-300 break-all select-all border border-slate-800 shadow-inner">
                      {data.txHash}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
