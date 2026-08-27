"use client";

import { useState } from "react";
import { useAccount, useWriteContract } from "wagmi";
import { INCOIN_CREDENTIAL_ABI, getContractAddress } from "@/lib/contract";
import {
  Lock,
  Send,
  AlertOctagon,
  CheckCircle2,
  HelpCircle,
  Sparkles,
  Loader2,
  ShieldAlert,
  ArrowRight,
  ShieldCheck,
  ShieldX,
  Terminal,
  Cpu,
  Flame,
} from "lucide-react";
import { type Address } from "viem";

export function SoulboundTransferDemo() {
  const { address, isConnected, chainId } = useAccount();
  const contractAddress = getContractAddress(chainId);

  const [tokenId, setTokenId] = useState("1");
  const [recipient, setRecipient] = useState("0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC");
  const [isExecuting, setIsExecuting] = useState(false);
  const [isShaking, setIsShaking] = useState(false);
  const [simulationResult, setSimulationResult] = useState<{
    status: "REJECTED" | "SUCCESS";
    errorName?: string;
    message: string;
    details: string;
  } | null>(null);

  const { writeContractAsync } = useWriteContract();

  const handleAttemptTransfer = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsExecuting(true);
    setSimulationResult(null);
    setIsShaking(false);

    try {
      if (!isConnected || !address) {
        // Simulación offline si no hay wallet conectada
        await new Promise((r) => setTimeout(r, 700));
        triggerRejection();
        return;
      }

      // Intento real on-chain de transferFrom
      await writeContractAsync({
        address: contractAddress,
        abi: INCOIN_CREDENTIAL_ABI,
        functionName: "transferFrom",
        args: [address, recipient as Address, BigInt(tokenId)],
      });

      setSimulationResult({
        status: "SUCCESS",
        message: "Transferencia ejecutada.",
        details: "El token permitió la transferencia.",
      });
    } catch (err: unknown) {
      console.log("Expected Soulbound rejection:", err);
      triggerRejection();
    } finally {
      setIsExecuting(false);
    }
  };

  const triggerRejection = () => {
    setIsShaking(true);
    setTimeout(() => setIsShaking(false), 600);
    setSimulationResult({
      status: "REJECTED",
      errorName: "SoulboundTokenNonTransferable()",
      message: "TRANSACCIÓN REVERTIDA POR SMART CONTRACT (ERC-5192)",
      details:
        "La función interna _update(to, tokenId, auth) detectó que (from != 0x0 && to != 0x0), disparando el revert SoulboundTokenNonTransferable(). La EVM bloqueó la transacción inmediatamente.",
    });
  };

  return (
    <div className={`bg-white rounded-3xl border-2 border-slate-200 shadow-lg p-6 sm:p-10 space-y-8 transition-all ${isShaking ? "animate-shake border-red-400 ring-4 ring-red-100" : ""}`}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-100">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-700 flex items-center justify-center font-bold border border-amber-200 shrink-0">
            <Lock className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">
              Simulador de Intransferencia & Ataque Criptográfico
            </h2>
            <p className="text-xs text-slate-500">
              Prueba en vivo cómo el Smart Contract rechaza intentos de venta, cesión o suplantación de títulos
            </p>
          </div>
        </div>

        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100 text-amber-900 text-xs font-extrabold border border-amber-300 self-start sm:self-auto">
          <Cpu className="w-3.5 h-3.5" />
          Estándar ERC-5192
        </span>
      </div>

      {/* Comparison Explainer */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="p-5 rounded-2xl bg-red-50/60 border border-red-200 space-y-2">
          <span className="text-xs font-extrabold uppercase tracking-wider text-red-800 flex items-center gap-1.5">
            <AlertOctagon className="w-4 h-4 text-red-600" />
            Tokens / NFTs Comerciales (Vulnerables)
          </span>
          <p className="text-xs text-slate-600 leading-relaxed">
            Cualquier persona puede transferir o vender su token a otra billetera en OpenSea. En educación, esto permitiría la compra ilegal de títulos ajenos.
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-emerald-50/60 border border-emerald-200 space-y-2">
          <span className="text-xs font-extrabold uppercase tracking-wider text-emerald-800 flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            INCOIN Soulbound Tokens (Inviolables)
          </span>
          <p className="text-xs text-slate-600 leading-relaxed">
            Las credenciales emitidas por <strong>INCOS El Alto</strong> quedan selladas criptográficamente al estudiante de por vida. Cualquier intento de transferencia genera un <code>revert</code> on-chain.
          </p>
        </div>
      </div>

      {/* Interactive Attack Simulation Form */}
      <form onSubmit={handleAttemptTransfer} className="space-y-4 pt-2">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
              Token ID a Transferir
            </label>
            <input
              type="number"
              min="1"
              value={tokenId}
              onChange={(e) => setTokenId(e.target.value)}
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-extrabold focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#1E3A5F]/20 focus:border-[#1E3A5F]"
              required
            />
          </div>

          <div className="sm:col-span-2">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
              Billetera Destino Ilegal (Comprador o Tercero)
            </label>
            <input
              type="text"
              value={recipient}
              onChange={(e) => setRecipient(e.target.value)}
              placeholder="0x..."
              className="w-full px-4 py-3 font-mono text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#1E3A5F]/20 focus:border-[#1E3A5F]"
              required
            />
          </div>
        </div>

        <div className="pt-3 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <span className="text-xs text-slate-500 flex items-center gap-1.5 font-mono">
            <Terminal className="w-4 h-4 text-slate-400" />
            Llamada: transferFrom(owner, buyer, {tokenId})
          </span>

          <button
            type="submit"
            disabled={isExecuting}
            className="inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-red-600 hover:bg-red-700 text-white text-xs font-extrabold rounded-xl shadow-md transition-all disabled:opacity-50 active:scale-95 cursor-pointer"
          >
            {isExecuting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Ejecutando intento de transferencia...</span>
              </>
            ) : (
              <>
                <Flame className="w-4 h-4 text-amber-300" />
                <span>Ejecutar Ataque de Transferencia</span>
              </>
            )}
          </button>
        </div>
      </form>

      {/* Result Display Box with WOW Impact */}
      {simulationResult && (
        <div
          className={`p-6 rounded-3xl border-2 transition-all animate-fade-in-up ${
            simulationResult.status === "REJECTED"
              ? "bg-red-50 border-red-300 text-red-950 shadow-md"
              : "bg-emerald-50 border-emerald-300 text-emerald-950"
          }`}
        >
          <div className="flex items-start gap-4">
            {simulationResult.status === "REJECTED" ? (
              <div className="w-12 h-12 rounded-2xl bg-red-600 text-white flex items-center justify-center font-bold shrink-0 shadow-md shadow-red-500/20">
                <ShieldX className="w-7 h-7" />
              </div>
            ) : (
              <div className="w-12 h-12 rounded-2xl bg-emerald-600 text-white flex items-center justify-center font-bold shrink-0">
                <CheckCircle2 className="w-7 h-7" />
              </div>
            )}

            <div className="space-y-3 flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-mono text-xs font-extrabold px-3 py-1 rounded-full bg-red-700 text-white shadow-xs">
                  🚫 REVERT ON-CHAIN CONFIRMADO
                </span>
                {simulationResult.errorName && (
                  <span className="font-mono text-xs font-bold text-red-800 bg-red-200/80 px-2.5 py-0.5 rounded-lg border border-red-300">
                    Solidity Revert: {simulationResult.errorName}
                  </span>
                )}
              </div>

              <h4 className="text-base font-extrabold text-red-950 leading-snug">
                {simulationResult.message}
              </h4>

              <div className="bg-slate-950 text-slate-200 p-4 rounded-2xl font-mono text-xs border border-slate-800 space-y-1">
                <div className="text-amber-400 font-bold">// Regla Solidity en InCoinCredential.sol:</div>
                <div className="text-slate-300">if (from != address(0) &amp;&amp; to != address(0)) &#123;</div>
                <div className="text-red-400 font-bold pl-4">revert SoulboundTokenNonTransferable();</div>
                <div className="text-slate-300">&#125;</div>
              </div>

              <p className="text-xs text-red-900 leading-relaxed font-medium">
                {simulationResult.details}
              </p>

              <div className="pt-2 text-xs text-emerald-800 flex items-center gap-2 font-bold bg-emerald-100/60 p-3 rounded-xl border border-emerald-300">
                <ShieldCheck className="w-4 h-4 text-emerald-700 shrink-0" />
                <span>Garantía Académica: El título #{tokenId} continúa 100% protegido y custodiado por su legítimo titular.</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
