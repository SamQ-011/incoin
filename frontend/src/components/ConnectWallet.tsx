"use client";

import { useAccount, useConnect, useDisconnect } from "wagmi";
import { injected } from "wagmi/connectors";
import { useInCoinContract } from "@/lib/useInCoinContract";
import {
  Wallet,
  LogOut,
  Copy,
  Check,
  Loader2,
  ExternalLink,
  X,
  AlertTriangle,
  Zap,
} from "lucide-react";
import { useState, useEffect } from "react";

export function ConnectWallet() {
  const { address, isConnected, chain } = useAccount();
  const { connect, connectors, isPending } = useConnect();
  const { disconnect } = useDisconnect();
  const { isIssuer, isWrongNetwork, switchToCorrectChain } = useInCoinContract();
  const [copied, setCopied] = useState(false);
  const [hasMetaMask, setHasMetaMask] = useState<boolean | null>(null);
  const [showInstallModal, setShowInstallModal] = useState(false);
  const [isSwitchingNetwork, setIsSwitchingNetwork] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      setHasMetaMask(Boolean((window as unknown as { ethereum?: unknown }).ethereum));
    }
  }, []);

  const copyAddress = () => {
    if (address) {
      navigator.clipboard.writeText(address);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const formatAddress = (addr: string) => {
    return `${addr.substring(0, 6)}...${addr.substring(addr.length - 4)}`;
  };

  const handleConnectClick = async () => {
    if (typeof window !== "undefined" && !(window as unknown as { ethereum?: unknown }).ethereum) {
      setShowInstallModal(true);
      return;
    }

    try {
      if (connectors && connectors.length > 0) {
        connect({ connector: connectors[0] });
      } else {
        connect({ connector: injected() });
      }
    } catch (err) {
      console.error("Error al conectar wallet:", err);
    }
  };

  const handleSwitchNetwork = async () => {
    setIsSwitchingNetwork(true);
    try {
      await switchToCorrectChain();
    } catch (err) {
      console.error("Error al cambiar de red:", err);
    } finally {
      setIsSwitchingNetwork(false);
    }
  };

  if (!isConnected) {
    return (
      <>
        <button
          onClick={handleConnectClick}
          disabled={isPending}
          className="inline-flex items-center gap-2 px-3.5 py-1.5 text-xs font-bold text-white transition-all bg-slate-900 hover:bg-slate-800 rounded-lg shadow-xs active:scale-95 disabled:opacity-50 cursor-pointer"
        >
          {isPending ? (
            <>
              <Loader2 className="w-3.5 h-3.5 animate-spin text-amber-300" />
              <span>Conectando...</span>
            </>
          ) : (
            <>
              <Wallet className="w-3.5 h-3.5 text-amber-300" />
              <span>Conectar Wallet</span>
            </>
          )}
        </button>

        {showInstallModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-150">
            <div className="bg-white rounded-3xl max-w-md w-full border border-slate-200 shadow-2xl p-6 relative text-center space-y-4">
              <button
                onClick={() => setShowInstallModal(false)}
                className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-slate-600 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="w-14 h-14 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto border border-amber-200">
                <Wallet className="w-7 h-7" />
              </div>

              <div className="space-y-2">
                <h3 className="text-lg font-extrabold text-slate-900">
                  MetaMask no detectado
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed text-left">
                  Para autenticarte como institución o estudiante necesitas la extensión de <strong>MetaMask</strong> instalada.
                </p>
              </div>

              <div className="space-y-2 pt-2">
                <a
                  href="https://metamask.io/download/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full inline-flex items-center justify-center gap-2 px-5 py-3 bg-[#1E3A5F] hover:bg-[#152942] text-white text-xs font-extrabold rounded-xl shadow-md transition-all cursor-pointer"
                >
                  <span>Instalar MetaMask</span>
                  <ExternalLink className="w-4 h-4" />
                </a>

                <button
                  onClick={() => setShowInstallModal(false)}
                  className="w-full py-2 text-xs font-semibold text-slate-500 hover:text-slate-700"
                >
                  Cerrar
                </button>
              </div>
            </div>
          </div>
        )}
      </>
    );
  }

  // WRONG NETWORK WARNING
  if (isWrongNetwork) {
    return (
      <button
        onClick={handleSwitchNetwork}
        disabled={isSwitchingNetwork}
        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-amber-900 bg-amber-100 hover:bg-amber-200 border border-amber-300 rounded-lg transition-all cursor-pointer active:scale-95 disabled:opacity-60"
        title="Cambiar a Ethereum Sepolia"
      >
        <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
        <span>{isSwitchingNetwork ? "Cambiando red..." : "Cambiar a Sepolia"}</span>
        <Zap className="w-3 h-3 text-amber-600" />
      </button>
    );
  }

  // COMPACT UNIFIED IDENTITY PILL (LINEAR / VERCEL STYLE)
  return (
    <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-lg px-3 py-1.5 shadow-2xs text-xs">
      {/* Status Dot */}
      <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" title={`Red: ${chain?.name || "Hardhat"}`} />

      {/* Role / Name */}
      <span className="font-bold text-slate-900">
        {isIssuer ? "INCOS El Alto" : "Estudiante"}
      </span>

      <span className="text-slate-300">•</span>

      {/* Address with Copy */}
      <button
        onClick={copyAddress}
        className="font-mono text-[11px] text-slate-500 hover:text-slate-900 transition-colors flex items-center gap-1 cursor-pointer"
        title="Copiar dirección completa"
      >
        <span>{formatAddress(address!)}</span>
        {copied ? (
          <Check className="w-3 h-3 text-emerald-600" />
        ) : (
          <Copy className="w-3 h-3 text-slate-400 hover:text-slate-600" />
        )}
      </button>

      {/* Disconnect Button */}
      <button
        onClick={() => disconnect()}
        className="ml-1 p-0.5 text-slate-400 hover:text-red-600 transition-colors cursor-pointer"
        title="Desconectar billetera"
      >
        <LogOut className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}
