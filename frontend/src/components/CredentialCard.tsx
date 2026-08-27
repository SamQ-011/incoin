"use client";

import { useState } from "react";
import { CREDENTIAL_TYPE_LABELS } from "@/lib/metadata";
import { CredentialQRModal } from "@/components/CredentialQRModal";
import Link from "next/link";
import {
  Clock,
  QrCode,
  ExternalLink,
  ShieldCheck,
  Building2,
  Lock,
  AlertTriangle,
  Calendar,
  Sparkles,
} from "lucide-react";
import { CredentialItem } from "@/components/IssuedTable";

interface CredentialCardProps {
  credential: CredentialItem;
}

export function CredentialCard({ credential }: CredentialCardProps) {
  const [showQR, setShowQR] = useState(false);
  const typeConfig = CREDENTIAL_TYPE_LABELS[credential.credentialType];
  const isRevoked = credential.status === "REVOKED";
  const isDegree =
    credential.credentialType === "TITULO_TECNICO_SUPERIOR" ||
    credential.credentialType === "DIPLOMADO";

  return (
    <div
      className={`bg-white rounded-3xl border-2 transition-all duration-300 flex flex-col justify-between overflow-hidden group shadow-sm hover:shadow-xl hover:-translate-y-1 ${
        isDegree
          ? "border-amber-300/80 hover:border-amber-400"
          : "border-slate-200 hover:border-blue-300"
      }`}
    >
      {/* Top Banner Accent with subtle gradient */}
      <div
        className={`h-2.5 w-full bg-gradient-to-r ${
          typeConfig?.color || "from-blue-600 to-indigo-700"
        }`}
      />

      <div className="p-6 sm:p-7 flex-1 flex flex-col space-y-4">
        {/* Header Badges & SVG Thumbnail Preview */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-2 flex-wrap">
            <span
              className={`text-[11px] font-extrabold px-3 py-1 rounded-full border ${
                isDegree
                  ? "bg-amber-100 text-amber-900 border-amber-300"
                  : "bg-blue-50 text-blue-900 border-blue-200"
              }`}
            >
              {typeConfig?.label || credential.credentialType}
            </span>

            {/* Soulbound Badge */}
            <span
              className="inline-flex items-center gap-1 text-[10px] font-extrabold px-2.5 py-0.5 rounded-full bg-slate-900 text-emerald-300 border border-slate-700"
              title="Token no transferible / Soulbound"
            >
              <Lock className="w-2.5 h-2.5" />
              SBT
            </span>
          </div>

          {/* Token ID */}
          <span className="font-mono text-xs font-extrabold text-slate-700 bg-slate-100 px-2.5 py-1 rounded-xl border border-slate-200 shrink-0">
            {credential.tokenId ? `#${String(credential.tokenId).padStart(6, "0")}` : "PENDING"}
          </span>
        </div>

        {/* Thumbnail & Title Row */}
        <div className="flex items-start gap-4 pt-1">
          {credential.tokenId && (
            <div className="w-16 h-16 rounded-2xl overflow-hidden border-2 border-slate-200 bg-slate-950 shrink-0 shadow-md shimmer-container group-hover:scale-105 transition-transform">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={`/api/badges/${credential.tokenId}`}
                alt={credential.title}
                className="w-full h-full object-cover"
              />
            </div>
          )}

          <div className="space-y-1 flex-1">
            <h3 className="text-base sm:text-lg font-extrabold text-slate-900 leading-snug group-hover:text-[#1E3A5F] transition-colors line-clamp-2">
              {credential.title}
            </h3>

            {credential.description && (
              <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                {credential.description}
              </p>
            )}
          </div>
        </div>

        {/* Highlighted Hours Box */}
        {credential.hours && credential.hours > 0 && (
          <div className="p-3.5 bg-gradient-to-r from-blue-50/80 to-indigo-50/60 border border-blue-200 rounded-2xl flex items-center justify-between shadow-2xs">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-[#1E3A5F] text-white flex items-center justify-center font-bold shadow-xs">
                <Clock className="w-4.5 h-4.5 text-amber-300" />
              </div>
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-blue-800 block">
                  Carga Horaria Validada
                </span>
                <span className="text-sm font-extrabold text-slate-900">
                  {credential.hours} Horas Académicas
                </span>
              </div>
            </div>
            <span className="text-[11px] font-extrabold text-emerald-800 bg-emerald-100/70 px-2.5 py-1 rounded-lg border border-emerald-300">
              Validada ✓
            </span>
          </div>
        )}

        {/* Issuer and Date Details */}
        <div className="mt-auto pt-4 space-y-2 text-xs border-t border-slate-100">
          <div className="flex items-center justify-between text-slate-600">
            <span className="flex items-center gap-1.5 text-slate-500 font-medium">
              <Building2 className="w-3.5 h-3.5 text-[#1E3A5F]" /> Emisor
            </span>
            <span className="font-bold text-slate-800 text-right truncate max-w-[180px]">
              {credential.issuer.shortName || credential.issuer.name}
            </span>
          </div>

          <div className="flex items-center justify-between text-slate-600">
            <span className="flex items-center gap-1.5 text-slate-500 font-medium">
              <Calendar className="w-3.5 h-3.5 text-slate-400" /> Fecha de Sello
            </span>
            <span className="font-medium text-slate-700">
              {new Date(credential.issueDate).toLocaleDateString("es-ES", {
                year: "numeric",
                month: "short",
                day: "numeric",
              })}
            </span>
          </div>

          <div className="flex items-center justify-between pt-1">
            <span className="text-slate-500 font-medium">Estado On-Chain</span>
            {isRevoked ? (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-red-50 text-red-700 font-bold text-[11px] border border-red-200">
                <AlertTriangle className="w-3 h-3" /> Revocada
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 font-bold text-[11px] border border-emerald-200">
                <ShieldCheck className="w-3 h-3 text-emerald-600" /> Inmutable / Válida
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Card Action Footer */}
      <div className="p-4 bg-slate-50/90 border-t border-slate-100 flex items-center justify-between gap-3">
        {credential.tokenId ? (
          <>
            <button
              onClick={() => setShowQR(true)}
              className="flex-1 inline-flex items-center justify-center gap-1.5 py-2.5 px-3 bg-white hover:bg-slate-100 text-slate-800 text-xs font-bold rounded-xl border border-slate-200 shadow-2xs transition-all active:scale-95 cursor-pointer"
            >
              <QrCode className="w-3.5 h-3.5 text-emerald-600" />
              <span>QR Certificado</span>
            </button>

            <Link
              href={`/verify/${credential.tokenId}`}
              className="flex-1 inline-flex items-center justify-center gap-1.5 py-2.5 px-3 bg-[#1E3A5F] hover:bg-[#152942] text-white text-xs font-bold rounded-xl shadow-2xs transition-all active:scale-95"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>Verificar</span>
            </Link>
          </>
        ) : (
          <span className="text-center w-full text-xs text-slate-400 font-medium py-1.5">
            Confirmando bloque on-chain...
          </span>
        )}
      </div>

      {/* QR Modal */}
      {showQR && credential.tokenId && (
        <CredentialQRModal
          isOpen={showQR}
          onClose={() => setShowQR(false)}
          tokenId={credential.tokenId}
          title={credential.title}
          studentName={credential.student.fullName}
          hours={credential.hours}
        />
      )}
    </div>
  );
}
