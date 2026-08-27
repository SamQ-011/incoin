"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  ShieldCheck,
  Search,
  CheckCircle2,
  Lock,
  Building2,
  Award,
  Clock,
  ArrowRight,
  Sparkles,
  Loader2,
  FileCheck,
} from "lucide-react";
import Link from "next/link";
import { CREDENTIAL_TYPE_LABELS } from "@/lib/metadata";

interface RecentCredential {
  id: string;
  tokenId: number | null;
  title: string;
  credentialType: string;
  hours: number | null;
  status: string;
  student: {
    fullName: string;
  };
  issuer: {
    shortName: string;
    name: string;
  };
}

export default function VerifySearchPage() {
  const [tokenIdInput, setTokenIdInput] = useState("");
  const [recentCredentials, setRecentCredentials] = useState<RecentCredential[]>([]);
  const [isLoadingRecents, setIsLoadingRecents] = useState(true);
  const router = useRouter();

  useEffect(() => {
    fetch("/api/credentials")
      .then((res) => res.json())
      .then((json) => {
        if (json.success && Array.isArray(json.data)) {
          const issued = json.data
            .filter((c: RecentCredential) => c.tokenId !== null && c.status !== "PENDING_ONCHAIN")
            .slice(0, 6);
          setRecentCredentials(issued);
        }
      })
      .catch((err) => console.error("Error fetching recent credentials:", err))
      .finally(() => setIsLoadingRecents(false));
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanId = tokenIdInput.trim().replace("#", "");
    if (cleanId) {
      router.push(`/verify/${cleanId}`);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12">
      {/* Hero Search Section */}
      <div className="text-center space-y-4">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-50 text-[#1E3A5F] text-xs font-bold border border-blue-100 shadow-2xs">
          <ShieldCheck className="w-4 h-4 text-blue-600" />
          Verificador Universal Descentralizado (Gasless)
        </div>

        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
          Verificación de Credenciales Académicas
        </h1>

        <p className="text-sm text-slate-600 max-w-xl mx-auto leading-relaxed">
          Comprueba la autenticidad, institución emisora, titularidad y horas formativas validadas directamente en el Smart Contract de INCOIN sin necesidad de wallet ni pagos.
        </p>

        {/* Search Input Box */}
        <form onSubmit={handleSearch} className="max-w-md mx-auto mt-6">
          <div className="relative flex items-center shadow-md rounded-2xl overflow-hidden border-2 border-[#1E3A5F]/20 focus-within:border-[#1E3A5F] transition-all bg-white">
            <Search className="w-5 h-5 text-slate-400 absolute left-4" />
            <input
              type="text"
              value={tokenIdInput}
              onChange={(e) => setTokenIdInput(e.target.value)}
              placeholder="Ingresa el ID del Token (ej. 1, 2, 3...)"
              className="w-full pl-12 pr-28 py-3.5 text-sm font-medium text-slate-800 focus:outline-none placeholder:text-slate-400"
              required
            />
            <button
              type="submit"
              className="absolute right-2 px-4 py-2 bg-[#1E3A5F] hover:bg-[#152942] text-white text-xs font-bold rounded-xl transition-all active:scale-95 cursor-pointer"
            >
              Verificar
            </button>
          </div>
        </form>
      </div>

      {/* Dynamic Recent Verification Cards */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Award className="w-5 h-5 text-amber-500" />
              Credenciales Emitidas en la Red
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Consulta la prueba criptográfica on-chain en tiempo real de los títulos emitidos:
            </p>
          </div>
        </div>

        {isLoadingRecents ? (
          <div className="py-10 text-center space-y-2">
            <Loader2 className="w-6 h-6 animate-spin text-[#1E3A5F] mx-auto" />
            <p className="text-xs text-slate-400">Consultando registros en blockchain...</p>
          </div>
        ) : recentCredentials.length === 0 ? (
          <div className="p-8 text-center bg-slate-50 rounded-2xl border border-slate-200 text-slate-500 text-xs space-y-2">
            <FileCheck className="w-8 h-8 text-slate-400 mx-auto" />
            <p className="font-semibold text-slate-700">Sin credenciales previas en la red</p>
            <p className="text-slate-400 text-[11px]">
              Ingresa cualquier ID numérico en la barra de búsqueda o escanea el código QR de un certificado físico.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            {recentCredentials.map((cred) => {
              const typeConfig = CREDENTIAL_TYPE_LABELS[cred.credentialType] || {
                label: "Credencial",
                badgeBg: "bg-blue-50 text-blue-700",
              };

              return (
                <Link
                  key={cred.id}
                  href={`/verify/${cred.tokenId}`}
                  className="p-4 rounded-2xl border border-slate-200 hover:border-blue-300 hover:bg-blue-50/40 transition-all flex items-center justify-between group"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-blue-700 bg-blue-100/70 px-2 py-0.5 rounded">
                        Token #{cred.tokenId}
                      </span>
                      <span className="text-[11px] font-bold text-slate-500">
                        {cred.issuer.shortName || "INCOS"}
                      </span>
                    </div>
                    <div className="text-xs font-bold text-slate-900 group-hover:text-[#1E3A5F] line-clamp-1">
                      {cred.title}
                    </div>
                    <div className="text-[11px] text-slate-500 flex items-center gap-2">
                      <span>{cred.student.fullName}</span>
                      {cred.hours ? (
                        <>
                          <span>•</span>
                          <span className="font-semibold text-blue-700">{cred.hours} hrs</span>
                        </>
                      ) : null}
                    </div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-[#1E3A5F] group-hover:translate-x-0.5 transition-all shrink-0" />
                </Link>
              );
            })}
          </div>
        )}
      </div>

      {/* Trust & Guarantees Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-slate-700">
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-2">
          <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center font-bold">
            <Lock className="w-4 h-4" />
          </div>
          <h3 className="text-sm font-bold text-slate-900">Soulbound Intransferible</h3>
          <p className="text-xs text-slate-500 leading-relaxed">
            Las credenciales no pueden venderse, cederse ni transferirse entre billeteras. Están permanentemente ligadas al titular bajo estándar ERC-5192.
          </p>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-2">
          <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold">
            <CheckCircle2 className="w-4 h-4" />
          </div>
          <h3 className="text-sm font-bold text-slate-900">Verificación Gasless</h3>
          <p className="text-xs text-slate-500 leading-relaxed">
            Cualquier empleador o auditor en el mundo puede verificar la validez mediante consultas públicas sin costo alguno.
          </p>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-2">
          <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center font-bold">
            <Building2 className="w-4 h-4" />
          </div>
          <h3 className="text-sm font-bold text-slate-900">Emisores Verificados</h3>
          <p className="text-xs text-slate-500 leading-relaxed">
            Emitidas directamente por las billeteras institucionales autorizadas mediante firma criptográfica asimétrica inmutable.
          </p>
        </div>
      </div>
    </div>
  );
}
