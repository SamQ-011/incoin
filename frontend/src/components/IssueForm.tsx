"use client";

import { useState, useEffect } from "react";
import { useInCoinContract } from "@/lib/useInCoinContract";
import { CREDENTIAL_TYPE_LABELS, CredentialType } from "@/lib/metadata";
import {
  Award,
  Clock,
  User,
  FileText,
  CheckCircle2,
  AlertCircle,
  Loader2,
  ExternalLink,
  Sparkles,
} from "lucide-react";
import Link from "next/link";
import { type Address } from "viem";

interface StudentOption {
  id: string;
  walletAddress: string;
  fullName: string;
  identityNumber?: string;
  career?: string;
}

export function IssueForm({ onIssuedSuccess }: { onIssuedSuccess?: () => void }) {
  const { isConnected, address, issueCredentialOnChain } = useInCoinContract();

  // Form states
  const [credentialType, setCredentialType] = useState<string>("CERTIFICATION");
  const [title, setTitle] = useState("");
  const [hours, setHours] = useState<number | "">(50);
  const [description, setDescription] = useState("");

  // Student states
  const [studentAddress, setStudentAddress] = useState("");
  const [studentName, setStudentName] = useState("");
  const [identityNumber, setIdentityNumber] = useState("");
  const [career, setCareer] = useState("Sistemas Informáticos");
  const [existingStudents, setExistingStudents] = useState<StudentOption[]>([]);

  // Execution states
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [stepMessage, setStepMessage] = useState<string>("");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successData, setSuccessData] = useState<{
    tokenId: number;
    txHash: string;
    title: string;
    studentName: string;
  } | null>(null);

  // Load existing student suggestions from DB
  useEffect(() => {
    fetch("/api/students")
      .then((res) => res.json())
      .then((json) => {
        if (json.success && Array.isArray(json.data)) {
          setExistingStudents(json.data);
        }
      })
      .catch(() => {});
  }, []);

  const handleSelectExistingStudent = (selectedWallet: string) => {
    if (!selectedWallet) return;
    const found = existingStudents.find(
      (s) => s.walletAddress.toLowerCase() === selectedWallet.toLowerCase()
    );
    if (found) {
      setStudentAddress(found.walletAddress);
      setStudentName(found.fullName);
      setIdentityNumber(found.identityNumber || "");
      setCareer(found.career || "Sistemas Informáticos");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessData(null);

    if (!isConnected || !address) {
      setErrorMsg("Debes conectar tu wallet institucional de INCOS El Alto.");
      return;
    }

    if (!studentAddress || !studentAddress.startsWith("0x") || studentAddress.length !== 42) {
      setErrorMsg("Ingresa una dirección de wallet de estudiante válida (0x...).");
      return;
    }

    if (!title.trim()) {
      setErrorMsg("El título de la credencial es obligatorio.");
      return;
    }

    setIsSubmitting(true);

    try {
      // ─────────────────────────────────────────────────────────────
      // PASO 1: Registrar metadata off-chain y generar hash Keccak-256
      // ─────────────────────────────────────────────────────────────
      setStepMessage("1/3: Registrando metadatos y generando hash Keccak-256...");

      const res = await fetch("/api/credentials", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          issuerAddress: address,
          studentAddress,
          studentName: studentName || "Estudiante INCOS",
          identityNumber,
          career,
          credentialType,
          title,
          description,
          hours: hours ? Number(hours) : 0,
        }),
      });

      const apiResult = await res.json();

      if (!apiResult.success) {
        throw new Error(apiResult.error || "Error al registrar metadatos en backend.");
      }

      const { credential, metadataHash } = apiResult.data;
      const enumVal = CREDENTIAL_TYPE_LABELS[credentialType]?.enumVal ?? CredentialType.CERTIFICATION;

      // ─────────────────────────────────────────────────────────────
      // PASO 2: Confirmar emisión en el Smart Contract con MetaMask
      // ─────────────────────────────────────────────────────────────
      setStepMessage("2/3: Confirma la transacción en MetaMask para mintear el Soulbound Token...");

      const txHash = await issueCredentialOnChain(
        studentAddress as Address,
        enumVal,
        metadataHash as `0x${string}`
      );

      // ─────────────────────────────────────────────────────────────
      // PASO 3: Obtener el Token ID REAL del recibo on-chain
      // ─────────────────────────────────────────────────────────────
      setStepMessage("3/3: Confirmando registro en blockchain y leyendo Token ID...");

      let realTokenId = 1;
      try {
        const { createPublicClient, http } = await import("viem");
        const { hardhat } = await import("wagmi/chains");
        const publicClient = createPublicClient({
          chain: hardhat,
          transport: http("http://127.0.0.1:8545"),
        });

        const receipt = await publicClient.waitForTransactionReceipt({
          hash: txHash,
        });

        // Buscar el log de emisión o Transferencia para extraer el tokenId
        for (const log of receipt.logs) {
          if (log.topics && log.topics[3]) {
            // El topic[3] en Transfer(from, to, tokenId) es el TokenId indexado
            realTokenId = Number(BigInt(log.topics[3]));
            break;
          } else if (log.topics && log.topics[1]) {
            realTokenId = Number(BigInt(log.topics[1]));
            break;
          }
        }
      } catch (receiptErr) {
        console.warn("Could not parse receipt logs directly, falling back:", receiptErr);
        const totalRes = await fetch("/api/credentials");
        const totalJson = await totalRes.json();
        realTokenId = totalJson.data?.length || 1;
      }

      await fetch(`/api/credentials/${credential.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tokenId: realTokenId,
          txHash: txHash,
          status: "ISSUED",
        }),
      });

      setSuccessData({
        tokenId: realTokenId,
        txHash,
        title,
        studentName: studentName || "Estudiante INCOS",
      });

      // Reset fields
      setTitle("");
      setDescription("");

      if (onIssuedSuccess) onIssuedSuccess();
    } catch (err: unknown) {
      console.error("Error issuing credential:", err);
      const msg = err instanceof Error ? err.message : "Error inesperado al emitir la credencial.";
      setErrorMsg(msg);
    } finally {
      setIsSubmitting(false);
      setStepMessage("");
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8">
      {/* Header Form */}
      <div className="flex items-center gap-3 pb-6 border-b border-slate-100">
        <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center font-bold">
          <Award className="w-5 h-5" />
        </div>
        <div>
          <h2 className="text-lg font-bold text-slate-800">
            Nueva Emisión de Credencial Académica
          </h2>
          <p className="text-xs text-slate-500">
            Emisor Institucional Autorizado: <span className="font-semibold text-slate-700">INCOS El Alto</span>
          </p>
        </div>
      </div>

      {/* Success Notification Banner */}
      {successData && (
        <div className="my-6 p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-900">
          <div className="flex items-start gap-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
            <div className="flex-1">
              <h3 className="text-sm font-bold">
                ¡Credencial Soulbound Emitida con Éxito en Blockchain!
              </h3>
              <p className="text-xs text-emerald-700 mt-1">
                La credencial <span className="font-semibold">&quot;{successData.title}&quot;</span> fue conferida a{" "}
                <span className="font-semibold">{successData.studentName}</span> con ID de Token #
                {successData.tokenId}.
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                <Link
                  href={`/verify/${successData.tokenId}`}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-lg shadow-sm transition-colors"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  Ver Página Pública de Verificación
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Error Alert */}
      {errorMsg && (
        <div className="my-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-800 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
          <div className="text-xs">
            <span className="font-bold">Error en la emisión:</span> {errorMsg}
          </div>
        </div>
      )}

      {/* Form Body */}
      <form onSubmit={handleSubmit} className="mt-6 space-y-6">
        {/* Tipo de Credencial Selector */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-2">
            1. Tipo de Credencial Formativa
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5">
            {Object.entries(CREDENTIAL_TYPE_LABELS).map(([key, config]) => {
              const isSelected = credentialType === key;
              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => setCredentialType(key)}
                  className={`p-3 rounded-xl border text-left transition-all ${
                    isSelected
                      ? "border-[#1E3A5F] bg-blue-50/70 shadow-sm ring-2 ring-[#1E3A5F]/20"
                      : "border-slate-200 hover:border-slate-300 bg-slate-50/50"
                  }`}
                >
                  <div className="text-xs font-bold text-slate-800">
                    {config.label.split(" ")[0]}
                  </div>
                  <div className="text-[11px] text-slate-500 line-clamp-1 mt-0.5">
                    {config.label}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Datos de la Credencial */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="sm:col-span-2">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
              2. Título de la Certificación / Logro *
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="ej: Técnico Superior en Sistemas Informáticos"
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#1E3A5F]/20 focus:border-[#1E3A5F]"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1 flex items-center justify-between">
              <span>Horas Validadas</span>
              <span className="text-[10px] text-blue-600 font-semibold lowercase">
                (metadato formativo)
              </span>
            </label>
            <div className="relative">
              <input
                type="number"
                value={hours}
                onChange={(e) => setHours(e.target.value === "" ? "" : Number(e.target.value))}
                placeholder="ej: 50, 80, 240, 3600"
                min="0"
                className="w-full pl-9 pr-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#1E3A5F]/20 focus:border-[#1E3A5F]"
              />
              <Clock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            </div>
          </div>
        </div>

        {/* Descripción */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
            Descripción Detallada / Alcance de la Competencia
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={2}
            placeholder="ej: Aprobación satisfactoria del plan de estudios oficial de INCOS El Alto con mención de honor..."
            className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#1E3A5F]/20 focus:border-[#1E3A5F]"
          />
        </div>

        {/* Datos del Estudiante */}
        <div className="pt-4 border-t border-slate-100">
          <div className="flex items-center justify-between mb-3">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-600 flex items-center gap-1.5">
              <User className="w-4 h-4 text-slate-500" />
              3. Titular / Estudiante Destinatario
            </label>

            {existingStudents.length > 0 && (
              <select
                onChange={(e) => handleSelectExistingStudent(e.target.value)}
                className="text-xs bg-slate-100 border border-slate-200 rounded-lg px-2.5 py-1 text-slate-700"
              >
                <option value="">-- Autocompletar con estudiante registrado --</option>
                {existingStudents.map((s) => (
                  <option key={s.id} value={s.walletAddress}>
                    {s.fullName} ({s.career || "Sistemas"})
                  </option>
                ))}
              </select>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                Wallet del Estudiante (0x...) *
              </label>
              <input
                type="text"
                value={studentAddress}
                onChange={(e) => setStudentAddress(e.target.value)}
                placeholder="0x70997970C51812dc3A010C7d01b50e0d17dc79C8"
                className="w-full px-3.5 py-2.5 font-mono text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#1E3A5F]/20 focus:border-[#1E3A5F]"
                required
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                Nombre Completo del Estudiante
              </label>
              <input
                type="text"
                value={studentName}
                onChange={(e) => setStudentName(e.target.value)}
                placeholder="ej: Rodrigo Quispe Mamani"
                className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#1E3A5F]/20 focus:border-[#1E3A5F]"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                Cédula de Identidad (CI)
              </label>
              <input
                type="text"
                value={identityNumber}
                onChange={(e) => setIdentityNumber(e.target.value)}
                placeholder="ej: 8392014 LP"
                className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#1E3A5F]/20 focus:border-[#1E3A5F]"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                Carrera / Programa Académico
              </label>
              <input
                type="text"
                value={career}
                onChange={(e) => setCareer(e.target.value)}
                placeholder="ej: Sistemas Informáticos"
                className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#1E3A5F]/20 focus:border-[#1E3A5F]"
              />
            </div>
          </div>
        </div>

        {/* Submit Action */}
        <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-xs text-slate-500 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-500" />
            <span>El token generado es intransferible (Soulbound Token ERC-5192).</span>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 bg-[#1E3A5F] hover:bg-[#152942] text-white text-sm font-bold rounded-xl shadow-sm transition-all disabled:opacity-50 active:scale-95 cursor-pointer"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>{stepMessage || "Procesando emisión..."}</span>
              </>
            ) : (
              <>
                <FileText className="w-4 h-4" />
                <span>Emitir Credencial Soulbound</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
