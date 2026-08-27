"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { useInCoinContract } from "@/lib/useInCoinContract";
import { AlertTriangle, X, Loader2 } from "lucide-react";

interface RevokeModalProps {
  isOpen: boolean;
  onClose: () => void;
  credentialId: string;
  tokenId: number;
  title: string;
  studentName: string;
  onRevokedSuccess: () => void;
}

export function RevokeModal({
  isOpen,
  onClose,
  credentialId,
  tokenId,
  title,
  studentName,
  onRevokedSuccess,
}: RevokeModalProps) {
  const [mounted, setMounted] = useState(false);
  const { revokeCredentialOnChain } = useInCoinContract();
  const [reason, setReason] = useState("Revocada por la institución emisora (INCOS El Alto)");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

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

  const handleRevoke = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMsg(null);

    try {
      // 1. Revocar on-chain en el smart contract
      await revokeCredentialOnChain(BigInt(tokenId), reason);

      // 2. Actualizar estado en base de datos
      const res = await fetch(`/api/credentials/${credentialId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: "REVOKED",
          revokedReason: reason,
        }),
      });

      if (!res.ok) {
        throw new Error("Error al actualizar estado en la base de datos.");
      }

      onRevokedSuccess();
      onClose();
    } catch (err: unknown) {
      console.error("Error revoking credential:", err);
      const msg = err instanceof Error ? err.message : "Error al revocar credencial on-chain.";
      setErrorMsg(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const modalContent = (
    <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md animate-in fade-in duration-200">
      <div className="absolute inset-0" onClick={onClose} />
      <div className="bg-white rounded-2xl max-w-md w-full border border-slate-200 shadow-2xl p-6 relative z-10 animate-in zoom-in-95 duration-200">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
          aria-label="Cerrar modal"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 text-red-600 mb-4">
          <div className="w-10 h-10 rounded-xl bg-red-50 flex items-center justify-center">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-slate-900">Revocar Credencial</h3>
            <p className="text-xs text-slate-500">Token #{tokenId} en Blockchain</p>
          </div>
        </div>

        <p className="text-xs text-slate-600 mb-4 leading-relaxed">
          Estás a punto de revocar la credencial <strong className="text-slate-800">&quot;{title}&quot;</strong> conferida a{" "}
          <strong className="text-slate-800">{studentName}</strong>. Esta acción quedará registrada en blockchain y la credencial pasará a estado inválido.
        </p>

        {errorMsg && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleRevoke} className="space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
              Motivo de Revocación *
            </label>
            <input
              type="text"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="ej: Error administrativo en emisión, fraude académico..."
              className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500"
              required
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-xl shadow-sm transition-all disabled:opacity-50 cursor-pointer"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Revocando on-chain...</span>
                </>
              ) : (
                <span>Confirmar Revocación</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );

  return typeof document !== "undefined" ? createPortal(modalContent, document.body) : null;
}
