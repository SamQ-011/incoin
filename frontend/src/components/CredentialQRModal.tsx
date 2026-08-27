"use client";

import { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { QRCodeSVG } from "qrcode.react";
import {
  X,
  Copy,
  Check,
  ExternalLink,
  QrCode,
  ShieldCheck,
  Download,
} from "lucide-react";
import Link from "next/link";

interface CredentialQRModalProps {
  isOpen: boolean;
  onClose: () => void;
  tokenId?: number;
  walletAddress?: string;
  title: string;
  studentName: string;
  hours?: number | null;
  isGlobalCV?: boolean;
}

export function CredentialQRModal({
  isOpen,
  onClose,
  tokenId,
  walletAddress,
  title,
  studentName,
  hours,
  isGlobalCV = false,
}: CredentialQRModalProps) {
  const [mounted, setMounted] = useState(false);
  const [copied, setCopied] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const qrRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Lock body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  if (!isOpen || !mounted) return null;

  const origin = typeof window !== "undefined" ? window.location.origin : "https://incoin-one.vercel.app";
  const verifyUrl = isGlobalCV
    ? `${origin}/cv/${walletAddress}`
    : `${origin}/verify/${tokenId}`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(verifyUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Convert SVG QR to PNG and download (for certificate designers & CV insertion)
  const handleDownloadPNG = () => {
    setDownloading(true);
    try {
      const svgElement = qrRef.current?.querySelector("svg");
      if (!svgElement) return;

      const svgData = new XMLSerializer().serializeToString(svgElement);
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      const img = new Image();

      canvas.width = 600;
      canvas.height = 600;

      img.onload = () => {
        if (!ctx) return;
        ctx.fillStyle = "#FFFFFF";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

        const pngUrl = canvas.toDataURL("image/png");
        const downloadLink = document.createElement("a");
        downloadLink.href = pngUrl;
        downloadLink.download = isGlobalCV
          ? `INCOIN_CV_QR_${studentName.replace(/\s+/g, "_")}.png`
          : `INCOIN_Token_${tokenId}_QR.png`;
        document.body.appendChild(downloadLink);
        downloadLink.click();
        document.body.removeChild(downloadLink);
        setDownloading(false);
      };

      img.src = "data:image/svg+xml;base64," + btoa(unescape(encodeURIComponent(svgData)));
    } catch (err) {
      console.error("Error downloading PNG:", err);
      setDownloading(false);
    }
  };

  const modalContent = (
    <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md animate-in fade-in duration-200">
      {/* Click outside backdrop to close */}
      <div className="absolute inset-0" onClick={onClose} />

      <div className="bg-white rounded-3xl max-w-sm w-full border border-slate-200 shadow-2xl p-6 relative z-10 text-center animate-in zoom-in-95 duration-200">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
          aria-label="Cerrar modal"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header Badge */}
        <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-blue-50 text-blue-700 text-xs font-bold rounded-full mb-3 border border-blue-100">
          <QrCode className="w-3.5 h-3.5" />
          {isGlobalCV ? "QR Único para Currículum Vitae (CV)" : "QR de Verificación Oficial"}
        </div>

        <h3 className="font-extrabold text-slate-900 text-base line-clamp-2 px-4">
          {title}
        </h3>
        <p className="text-xs text-slate-500 mt-1">
          Titular: <span className="font-semibold text-slate-700">{studentName}</span>
        </p>

        {/* QR Code Container */}
        <div
          ref={qrRef}
          className="my-4 p-4 bg-white border-2 border-slate-100 rounded-2xl inline-block shadow-inner"
        >
          <QRCodeSVG
            value={verifyUrl}
            size={180}
            level="H"
            includeMargin={true}
          />
        </div>

        <div className="text-[11px] text-slate-500 flex items-center justify-center gap-1 mb-4">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
          <span>
            {isGlobalCV
              ? "Apunta a toda la trayectoria académica verificada"
              : `Token Soulbound #${tokenId} ${hours ? `• ${hours} hrs` : ""}`}
          </span>
        </div>

        {/* Action Buttons */}
        <div className="space-y-2">
          {/* Download PNG for Certificate Designers */}
          <button
            onClick={handleDownloadPNG}
            disabled={downloading}
            className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-sm transition-colors cursor-pointer active:scale-98"
          >
            <Download className="w-4 h-4" />
            <span>
              {downloading
                ? "Generando PNG..."
                : isGlobalCV
                ? "Descargar QR para CV (PNG 600px)"
                : "Descargar QR para Imprimir en Diploma (PNG)"}
            </span>
          </button>

          <button
            onClick={handleCopyLink}
            className="w-full flex items-center justify-center gap-2 py-2 px-4 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold rounded-xl transition-colors cursor-pointer active:scale-98"
          >
            {copied ? (
              <>
                <Check className="w-4 h-4 text-emerald-600" />
                <span>¡Enlace copiado al portapapeles!</span>
              </>
            ) : (
              <>
                <Copy className="w-4 h-4 text-slate-500" />
                <span>Copiar enlace de verificación</span>
              </>
            )}
          </button>

          <Link
            href={isGlobalCV ? `/cv/${walletAddress}` : `/verify/${tokenId}`}
            className="w-full flex items-center justify-center gap-1.5 py-2 px-4 bg-[#1E3A5F] hover:bg-[#152942] text-white text-xs font-bold rounded-xl shadow-sm transition-colors active:scale-98"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span>Abrir Vista Pública en Navegador</span>
          </Link>
        </div>
      </div>
    </div>
  );

  return typeof document !== "undefined" ? createPortal(modalContent, document.body) : null;
}
