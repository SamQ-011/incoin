import { SoulboundTransferDemo } from "@/components/SoulboundTransferDemo";
import { Lock, ShieldCheck, Code, CheckCircle2, Award } from "lucide-react";
import Link from "next/link";

export default function SoulboundDemoPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      {/* Hero */}
      <div className="text-center space-y-3">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-50 text-amber-900 text-xs font-bold border border-amber-200 shadow-2xs">
          <Lock className="w-4 h-4 text-amber-600" />
          Laboratorio de Intransferibilidad (Soulbound Token)
        </div>

        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
          Demostración del Protocolo ERC-5192
        </h1>

        <p className="text-sm text-slate-600 max-w-2xl mx-auto leading-relaxed">
          En INCOIN, las credenciales académicas conferidas por <strong className="text-slate-800">INCOS El Alto</strong> no son activos financieros ni coleccionables negociables. Son fichas vinculadas permanentemente a la identidad del estudiante.
        </p>
      </div>

      {/* Interactive Tool */}
      <SoulboundTransferDemo />

      {/* Technical Architecture Breakdown */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-6">
        <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
          <Code className="w-5 h-5 text-blue-600" />
          ¿Cómo funciona la regla a nivel de Smart Contract en Solidity?
        </h3>

        <div className="bg-slate-950 text-slate-200 rounded-2xl p-5 font-mono text-xs overflow-x-auto border border-slate-800">
          <div className="text-slate-500">// Override de la función interna _update en InCoinCredential.sol</div>
          <div className="text-purple-400 mt-2">function <span className="text-blue-400">_update</span>(address to, uint256 tokenId, address auth) internal override returns (address) &#123;</div>
          <div className="pl-4 text-slate-300">address from = _ownerOf(tokenId);</div>
          <div className="pl-4 text-slate-500 mt-1">// Permitir únicamente la emisión inicial (mint desde address 0x0)</div>
          <div className="pl-4 text-slate-500">// Bloquear cualquier transferencia posterior entre personas</div>
          <div className="pl-4 text-amber-300 mt-1">if (from != address(0) &amp;&amp; to != address(0)) &#123;</div>
          <div className="pl-8 text-red-400 font-bold">revert SoulboundTokenNonTransferable();</div>
          <div className="pl-4 text-amber-300">&#125;</div>
          <div className="pl-4 text-slate-300 mt-1">return super._update(to, tokenId, auth);</div>
          <div className="text-purple-400">&#125;</div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs text-slate-600">
          <div className="flex items-start gap-2.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <span>
              <strong>Imposible transferir:</strong> No existe ninguna función en el contrato que permita transferir, vender o donar la credencial a otra billetera.
            </span>
          </div>

          <div className="flex items-start gap-2.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <span>
              <strong>Validez ERC-5192:</strong> Devuelve siempre <code className="bg-slate-100 px-1 py-0.5 rounded font-mono">locked(tokenId) = true</code> a cualquier explorador o billetera.
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
