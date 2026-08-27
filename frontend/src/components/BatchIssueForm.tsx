"use client";

import { useState, useRef } from "react";
import Papa from "papaparse";
import JSZip from "jszip";
import { useInCoinContract } from "@/lib/useInCoinContract";
import { CREDENTIAL_TYPE_LABELS, CredentialType } from "@/lib/metadata";
import {
  FileSpreadsheet,
  UploadCloud,
  Download,
  CheckCircle2,
  AlertTriangle,
  Loader2,
  FileCheck,
  Sparkles,
  Archive,
  X,
  Clock,
  Award,
  Users,
  Layers,
  FileText,
} from "lucide-react";

import { type Address } from "viem";

interface StudentRow {
  studentName: string;
  studentAddress: string;
  identityNumber: string;
  career: string;
  isValid: boolean;
  validationError?: string;
}

interface ProcessedResult {
  totalProcessed: number;
  records: Array<{
    id: string;
    tokenId: number;
    title: string;
    studentName: string;
    identityNumber?: string;
    hours?: number;
    to: string;
  }>;
}

export function BatchIssueForm({ onIssuedSuccess }: { onIssuedSuccess?: () => void }) {
  const { isConnected, address, chainId, issueBatchOnChain } = useInCoinContract();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 1. Datos comunes del Evento / Seminario / Curso
  const [credentialType, setCredentialType] = useState<string>("CERTIFICATION");
  const [eventTitle, setEventTitle] = useState("Seminario de Inteligencia Artificial y Tecnologías Web3");
  const [eventHours, setEventHours] = useState<number | "">(20);
  const [eventDescription, setEventDescription] = useState(
    "Por haber participado y aprobado satisfactoriamente el seminario de capacitación con una duración de 20 horas académicas impartido por INCOS El Alto."
  );

  // 2. Lista de estudiantes cargados
  const [studentRows, setStudentRows] = useState<StudentRow[]>([]);
  const [fileName, setFileName] = useState<string | null>(null);

  // 3. Estados de ejecución
  const [isProcessing, setIsProcessing] = useState(false);
  const [stepMessage, setStepMessage] = useState<string>("");
  const [isGeneratingZip, setIsGeneratingZip] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successResult, setSuccessResult] = useState<ProcessedResult | null>(null);

  // ─────────────────────────────────────────────────────────────
  // DESCARGA DE PLANTILLA CSV SIMPLIFICADA (Solo Alumnos)
  // ─────────────────────────────────────────────────────────────
  const downloadSimplifiedTemplate = () => {
    const csvContent = [
      "nombre_completo,cedula_identidad,carrera,wallet_estudiante",
      "Rodrigo Quispe Mamani,8392014 LP,Sistemas Informaticos,0x70997970C51812dc3A010C7d01b50e0d17dc79C8",
      "Elena Condori Flores,9182374 LP,Comercio Internacional,0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC",
      "Carlos Mamani Perez,7482910 LP,Sistemas Informaticos,0x90F79bf6EB2c4f870365E785982E1f101E93b906",
      "Mariela Huanca Gutierrez,6192834 LP,Secretariado Ejecutivo,0x15d34AAf54267DB7D7c367839AAf71A00a2C6A65",
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "plantilla_asistentes_evento_incos.csv";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // ─────────────────────────────────────────────────────────────
  // CARGA Y PARSEO DEL ARCHIVO CSV DE ASISTENTES
  // ─────────────────────────────────────────────────────────────
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileName(file.name);
    setErrorMsg(null);
    setSuccessResult(null);

    Papa.parse<Record<string, string>>(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        if (!results.data || results.data.length === 0) {
          setErrorMsg("El archivo está vacío o no contiene registros válidos.");
          return;
        }

        const parsed: StudentRow[] = results.data.map((row) => {
          const studentName = (row.nombre_completo || row.nombre || row.studentName || "").trim();
          const studentAddress = (row.wallet_estudiante || row.wallet || row.studentAddress || "").trim();
          const identityNumber = (row.cedula_identidad || row.ci || row.identityNumber || "").trim();
          const career = (row.carrera || row.career || "Sistemas Informáticos").trim();

          let isValid = true;
          let validationError = "";

          if (!studentName) {
            isValid = false;
            validationError = "Falta el nombre completo";
          } else if (!studentAddress || !studentAddress.startsWith("0x") || studentAddress.length !== 42) {
            isValid = false;
            validationError = "Wallet inválida (debe empezar con 0x y tener 42 caracteres)";
          }

          return {
            studentName,
            studentAddress,
            identityNumber,
            career,
            isValid,
            validationError,
          };
        });

        setStudentRows(parsed);
      },
      error: (err) => {
        console.error("Error parsing CSV:", err);
        setErrorMsg("Error al leer el archivo CSV. Asegúrate de usar codificación UTF-8.");
      },
    });
  };

  // ─────────────────────────────────────────────────────────────
  // PROCESAR Y EMITIR EL LOTE DE SEMINARIO ON-CHAIN (1 SOLA FIRMA)
  // ─────────────────────────────────────────────────────────────
  const handleProcessBatch = async () => {
    if (!eventTitle.trim()) {
      setErrorMsg("El título del seminario / evento es obligatorio.");
      return;
    }

    const validStudents = studentRows.filter((r) => r.isValid);
    if (validStudents.length === 0) {
      setErrorMsg("No hay estudiantes válidos en la lista para emitir certificados.");
      return;
    }

    if (!isConnected || !address) {
      setErrorMsg("Debes conectar tu wallet institucional de INCOS El Alto.");
      return;
    }

    setIsProcessing(true);
    setErrorMsg(null);
    setStepMessage("1/3: Preparando lote y calculando hashes Keccak-256...");

    try {
      // 1. Preparar metadatos en backend
      const res = await fetch("/api/credentials/batch", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          issuerAddress: address,
          commonData: {
            credentialType,
            title: eventTitle.trim(),
            hours: eventHours ? Number(eventHours) : 0,
            description: eventDescription.trim(),
          },
          items: validStudents,
        }),
      });

      const json = await res.json();
      if (!json.success) {
        throw new Error(json.error || "Error al procesar lote en base de datos.");
      }

      const { recipients, metadataHashes, enumVal, records } = json.data;

      // 2. Ejecutar emisión en lote con 1 sola firma en MetaMask
      setStepMessage(`2/3: Confirma la transacción en MetaMask para emitir ${recipients.length} certificados en 1 solo bloque...`);

      const txHash = await issueBatchOnChain(
        recipients as Address[],
        enumVal,
        metadataHashes as `0x${string}`[]
      );

      // 3. Confirmar recibo on-chain y obtener los Token IDs reales
      setStepMessage("3/3: Confirmando registro on-chain y empaquetando...");

      let mintedTokenIds: number[] = [];
      try {
        const { createPublicClient, http } = await import("viem");
        const { sepolia, hardhat } = await import("wagmi/chains");
        const isLocal = chainId === 31337;
        const publicClient = createPublicClient({
          chain: isLocal ? hardhat : sepolia,
          transport: http(isLocal ? "http://127.0.0.1:8545" : (process.env.NEXT_PUBLIC_SEPOLIA_RPC_URL || "https://ethereum-sepolia-rpc.publicnode.com")),
        });

        const receipt = await publicClient.waitForTransactionReceipt({
          hash: txHash,
        });

        for (const log of receipt.logs) {
          if (log.topics && log.topics[3]) {
            mintedTokenIds.push(Number(BigInt(log.topics[3])));
          }
        }
      } catch (receiptErr) {
        console.warn("Could not parse receipt logs directly:", receiptErr);
      }

      const updates = records.map((r: { id: string }, idx: number) => ({
        id: r.id,
        tokenId: mintedTokenIds[idx] || (idx + 1),
      }));

      // 4. Confirmar lote en BD
      const confirmRes = await fetch("/api/credentials/batch", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          updates,
          txHash,
        }),
      });

      const confirmJson = await confirmRes.json();
      if (!confirmJson.success) {
        throw new Error("Error al confirmar los tokens en la base de datos.");
      }

      setSuccessResult(confirmJson.data);
      setStudentRows([]);
      setFileName(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
      if (onIssuedSuccess) onIssuedSuccess();
    } catch (err: unknown) {
      console.error("Error processing batch:", err);
      const msg = err instanceof Error ? err.message : "Error al procesar lote.";
      setErrorMsg(msg);
    } finally {
      setIsProcessing(false);
    }
  };

  // ─────────────────────────────────────────────────────────────
  // DESCARGA ZIP CON TODOS LOS QRS Y ACTA DE ENTREGA
  // ─────────────────────────────────────────────────────────────
  const handleDownloadAllQRsZip = async () => {
    if (!successResult || !successResult.records || successResult.records.length === 0) return;

    setIsGeneratingZip(true);
    try {
      const zip = new JSZip();
      const origin = typeof window !== "undefined" ? window.location.origin : "http://localhost:3000";

      // 1. Archivo individual por estudiante con QR data
      for (const rec of successResult.records) {
        const verifyUrl = `${origin}/verify/${rec.tokenId}`;
        const sanitizedName = (rec.studentName || "Estudiante").replace(/[^a-zA-Z0-9]/g, "_");
        const sanitizedCI = (rec.identityNumber || "CI").replace(/[^a-zA-Z0-9]/g, "_");
        const filename = `Token_${rec.tokenId}_${sanitizedCI}_${sanitizedName}.txt`;

        zip.file(
          filename,
          `INCOIN — CERTIFICADO VERIFICABLE (SOULBOUND)\n` +
            `Token ID: #${rec.tokenId}\n` +
            `Actividad: ${rec.title}\n` +
            `Carga Horaria: ${rec.hours || 0} Horas\n` +
            `Titular: ${rec.studentName}\n` +
            `CI: ${rec.identityNumber || "N/A"}\n` +
            `Institucion Emisora: Instituto Comercial Superior de la Nacion INCOS El Alto\n` +
            `Enlace de Verificacion On-Chain:\n${verifyUrl}\n`
        );
      }

      // 2. Acta / Indice General para la Imprenta y Registro Académico
      const masterCsvRows = [
        "token_id,nombre_completo,cedula,carrera,actividad,horas,url_verificacion_qr",
        ...successResult.records.map(
          (r) =>
            `${r.tokenId},"${r.studentName}","${r.identityNumber || ""}","Sistemas Informáticos","${r.title}",${r.hours || 0},"${origin}/verify/${r.tokenId}"`
        ),
      ];
      zip.file(`Acta_Entrega_Seminario_INCOS.csv`, masterCsvRows.join("\n"));

      const zipBlob = await zip.generateAsync({ type: "blob" });
      const downloadUrl = URL.createObjectURL(zipBlob);
      const link = document.createElement("a");
      link.href = downloadUrl;
      link.download = `Certificados_Seminario_INCOS_${new Date().toISOString().split("T")[0]}.zip`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      console.error("Error generating ZIP:", err);
    } finally {
      setIsGeneratingZip(false);
    }
  };

  const validCount = studentRows.filter((r) => r.isValid).length;
  const invalidCount = studentRows.length - validCount;

  return (
    <div className="space-y-8">
      {/* ───────────────────────────────────────────────────────────── */}
      {/* PASO 1: DATOS COMUNES DEL EVENTO / SEMINARIO / CURSO */}
      {/* ───────────────────────────────────────────────────────────── */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
          <div className="w-7 h-7 rounded-lg bg-blue-100 text-blue-700 font-extrabold text-xs flex items-center justify-center">
            1
          </div>
          <h3 className="text-sm font-extrabold text-slate-900 uppercase tracking-wider">
            Datos Comunes del Evento / Seminario / Taller
          </h3>
          <span className="text-[11px] text-slate-400 font-medium">
            (Se aplicarán automáticamente a todos los asistentes)
          </span>
        </div>

        {/* Tipo de Actividad */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-2">
            Tipo de Credencial
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5">
            {Object.entries(CREDENTIAL_TYPE_LABELS).map(([key, config]) => {
              const isSelected = credentialType === key;
              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => setCredentialType(key)}
                  className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
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

        {/* Título y Horas del Seminario */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="sm:col-span-2">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
              Título del Seminario / Curso / Taller *
            </label>
            <input
              type="text"
              value={eventTitle}
              onChange={(e) => setEventTitle(e.target.value)}
              placeholder="ej: Seminario Internacional de Inteligencia Artificial y Blockchain"
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#1E3A5F]/20 focus:border-[#1E3A5F]"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1 flex items-center justify-between">
              <span>Carga Horaria</span>
              <span className="text-[10px] text-blue-600 font-semibold lowercase">
                (para todos)
              </span>
            </label>
            <div className="relative">
              <input
                type="number"
                value={eventHours}
                onChange={(e) => setEventHours(e.target.value === "" ? "" : Number(e.target.value))}
                placeholder="ej: 20, 40, 50, 80"
                min="0"
                className="w-full pl-9 pr-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#1E3A5F]/20 focus:border-[#1E3A5F]"
              />
              <Clock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            </div>
          </div>
        </div>

        {/* Descripción del evento */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
            Descripción Oficial del Certificado
          </label>
          <textarea
            value={eventDescription}
            onChange={(e) => setEventDescription(e.target.value)}
            rows={2}
            placeholder="ej: Por haber participado satisfactoriamente en calidad de asistente en el seminario..."
            className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#1E3A5F]/20 focus:border-[#1E3A5F]"
          />
        </div>
      </div>

      {/* ───────────────────────────────────────────────────────────── */}
      {/* PASO 2: CARGA DE LISTA DE ESTUDIANTES ASISTENTES */}
      {/* ───────────────────────────────────────────────────────────── */}
      <div className="space-y-4 pt-4 border-t border-slate-200">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-800 font-extrabold text-xs flex items-center justify-center">
              2
            </div>
            <h3 className="text-sm font-extrabold text-slate-900 uppercase tracking-wider">
              Cargar Lista de Estudiantes Asistentes (Excel / CSV)
            </h3>
          </div>

          <button
            type="button"
            onClick={downloadSimplifiedTemplate}
            className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold rounded-xl border border-slate-200 shadow-2xs transition-colors cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 text-emerald-600" />
            <span>Descargar Plantilla de Asistentes (Solo 4 columnas)</span>
          </button>
        </div>

        {/* Success Alert */}
        {successResult && (
          <div className="p-5 bg-emerald-50 border-2 border-emerald-200 rounded-2xl text-emerald-950 space-y-3">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-start gap-3">
                <CheckCircle2 className="w-6 h-6 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-sm font-extrabold">
                    ¡Certificados del Seminario Emitidos con Éxito ({successResult.totalProcessed} Alumnos)!
                  </h4>
                  <p className="text-xs text-emerald-800 mt-0.5 leading-relaxed">
                    Se emitieron los tokens Soulbound para <strong>{eventTitle}</strong> ({eventHours} hrs). Ya están disponibles en los portafolios de los estudiantes y listos para verificar.
                  </p>
                </div>
              </div>

              <button
                onClick={() => setSuccessResult(null)}
                className="p-1 text-emerald-600 hover:text-emerald-800 rounded"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex flex-wrap items-center gap-3 pt-2">
              <button
                type="button"
                onClick={handleDownloadAllQRsZip}
                disabled={isGeneratingZip}
                className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-extrabold rounded-xl shadow-sm transition-all cursor-pointer"
              >
                {isGeneratingZip ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Generando paquete...</span>
                  </>
                ) : (
                  <>
                    <Archive className="w-4 h-4" />
                    <span>Descargar ZIP con todos los QRs y Acta de Entrega</span>
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {/* Error Alert */}
        {errorMsg && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-800 text-xs flex items-start gap-2.5">
            <AlertTriangle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Dropzone */}
        <div className="border-2 border-dashed border-slate-300 hover:border-[#1E3A5F] rounded-2xl p-7 text-center bg-slate-50/50 transition-colors">
          <input
            ref={fileInputRef}
            type="file"
            accept=".csv,text/csv"
            onChange={handleFileUpload}
            className="hidden"
            id="seminar-csv-upload"
          />

          <label
            htmlFor="seminar-csv-upload"
            className="cursor-pointer flex flex-col items-center justify-center space-y-2"
          >
            <div className="w-11 h-11 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
              <UploadCloud className="w-6 h-6" />
            </div>
            <div className="text-sm font-bold text-slate-800">
              {fileName ? (
                <span className="text-emerald-700">Archivo cargado: {fileName}</span>
              ) : (
                <span>Arrastra aquí el archivo de estudiantes o haz clic para subir</span>
              )}
            </div>
            <p className="text-xs text-slate-400">
              Columnas requeridas: <code>nombre_completo</code>, <code>cedula_identidad</code>, <code>carrera</code>, <code>wallet_estudiante</code>
            </p>
          </label>
        </div>
      </div>

      {/* ───────────────────────────────────────────────────────────── */}
      {/* PASO 3: VISTA PREVIA Y CONFIRMACIÓN */}
      {/* ───────────────────────────────────────────────────────────── */}
      {studentRows.length > 0 && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden space-y-4">
          <div className="p-4 sm:p-5 border-b border-slate-100 flex flex-wrap items-center justify-between gap-3">
            <div>
              <h4 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
                <Users className="w-4 h-4 text-blue-600" />
                Asistentes a Certificar ({studentRows.length} Estudiantes)
              </h4>
              <p className="text-xs text-slate-500 mt-0.5">
                Certificado: <span className="font-semibold text-slate-700">{eventTitle}</span> ({eventHours} hrs)
              </p>
            </div>

            <div className="flex items-center gap-2 text-xs">
              <span className="px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 font-bold border border-emerald-200">
                ✓ {validCount} Listos
              </span>
              {invalidCount > 0 && (
                <span className="px-2.5 py-1 rounded-full bg-red-50 text-red-700 font-bold border border-red-200">
                  ✕ {invalidCount} con Error
                </span>
              )}
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider border-b border-slate-100">
                <tr>
                  <th className="px-4 py-2.5">Estado</th>
                  <th className="px-4 py-2.5">Estudiante</th>
                  <th className="px-4 py-2.5">CI</th>
                  <th className="px-4 py-2.5">Carrera</th>
                  <th className="px-4 py-2.5">Certificado a Emitir</th>
                  <th className="px-4 py-2.5 text-center">Horas</th>
                  <th className="px-4 py-2.5">Wallet</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {studentRows.map((row, i) => (
                  <tr key={i} className={row.isValid ? "hover:bg-slate-50/50" : "bg-red-50/30"}>
                    <td className="px-4 py-3">
                      {row.isValid ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Listo
                        </span>
                      ) : (
                        <span
                          className="inline-flex items-center gap-1 text-[11px] font-bold text-red-700 bg-red-50 px-2 py-0.5 rounded-full"
                          title={row.validationError}
                        >
                          <AlertTriangle className="w-3 h-3 text-red-600" /> Error
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 font-semibold text-slate-900">{row.studentName}</td>
                    <td className="px-4 py-3 text-slate-600">{row.identityNumber || "—"}</td>
                    <td className="px-4 py-3 text-slate-600">{row.career}</td>
                    <td className="px-4 py-3 text-slate-800 max-w-xs truncate font-medium">
                      {eventTitle}
                    </td>
                    <td className="px-4 py-3 text-center font-bold text-blue-700">
                      {eventHours ? `${eventHours}h` : "—"}
                    </td>
                    <td className="px-4 py-3 font-mono text-[11px] text-slate-500 max-w-[130px] truncate">
                      {row.studentAddress}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Confirm Button */}
          <div className="p-4 sm:p-5 bg-slate-50 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="text-xs text-slate-500 flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-amber-500" />
              <span>
                Se emitirán {validCount} certificados Soulbound de <strong>{eventHours} hrs</strong> en un solo proceso.
              </span>
            </div>

            <button
              type="button"
              onClick={handleProcessBatch}
              disabled={isProcessing || validCount === 0}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-2.5 bg-[#1E3A5F] hover:bg-[#152942] text-white text-xs font-extrabold rounded-xl shadow-sm transition-all disabled:opacity-50 active:scale-95 cursor-pointer"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-amber-300" />
                  <span>{stepMessage || "Emitiendo certificados en blockchain..."}</span>
                </>
              ) : (
                <>
                  <Award className="w-4 h-4" />
                  <span>Emitir {validCount} Certificados del Seminario</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
