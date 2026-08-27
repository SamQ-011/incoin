"use client";

import { useState } from "react";
import { CREDENTIAL_TYPE_LABELS } from "@/lib/metadata";
import { RevokeModal } from "@/components/RevokeModal";
import Link from "next/link";
import {
  Clock,
  ExternalLink,
  Ban,
  ShieldCheck,
  Search,
  Filter,
  CheckCircle,
  AlertTriangle,
} from "lucide-react";

export interface CredentialItem {
  id: string;
  tokenId: number | null;
  txHash: string | null;
  credentialType: string;
  title: string;
  description: string | null;
  hours: number | null;
  metadataHash: string;
  issueDate: string;
  status: string;
  revokedAt: string | null;
  revokedReason: string | null;
  issuer: {
    name: string;
    shortName: string;
    walletAddress: string;
  };
  student: {
    fullName: string;
    identityNumber: string | null;
    career: string | null;
    walletAddress: string;
  };
}

export function IssuedTable({
  credentials,
  onRefresh,
}: {
  credentials: CredentialItem[];
  onRefresh: () => void;
}) {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("ALL");
  const [selectedForRevoke, setSelectedForRevoke] = useState<CredentialItem | null>(null);

  const filtered = credentials.filter((item) => {
    const matchesSearch =
      item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.student.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item.tokenId && item.tokenId.toString().includes(searchTerm)) ||
      item.student.walletAddress.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesType = filterType === "ALL" || item.credentialType === filterType;

    return matchesSearch && matchesType;
  });

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
      {/* Table Header Controls */}
      <div className="p-4 sm:p-6 border-b border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <h3 className="text-base font-bold text-slate-800 flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-blue-600" />
            Credenciales Emitidas por INCOS El Alto ({filtered.length})
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Registro verificable de títulos, certificados, pasantías y horas académicas
          </p>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          {/* Search */}
          <div className="relative flex-1 sm:w-64">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar por estudiante, título..."
              className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#1E3A5F]"
            />
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2" />
          </div>

          {/* Filter */}
          <div className="flex items-center gap-1 bg-slate-50 border border-slate-200 rounded-lg px-2 py-1">
            <Filter className="w-3 h-3 text-slate-400" />
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="text-xs bg-transparent text-slate-700 focus:outline-none"
            >
              <option value="ALL">Todos los tipos</option>
              {Object.entries(CREDENTIAL_TYPE_LABELS).map(([key, c]) => (
                <option key={key} value={key}>
                  {c.label.split(" ")[0]}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Table Body */}
      {filtered.length === 0 ? (
        <div className="p-12 text-center text-slate-400">
          <p className="text-sm font-medium">No se encontraron credenciales con estos filtros.</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50/75 border-b border-slate-100 text-slate-500 font-bold uppercase tracking-wider">
              <tr>
                <th className="px-4 sm:px-6 py-3">Token #</th>
                <th className="px-4 py-3">Credencial / Título</th>
                <th className="px-4 py-3">Estudiante</th>
                <th className="px-4 py-3 text-center">Horas</th>
                <th className="px-4 py-3 text-center">Estado</th>
                <th className="px-4 sm:px-6 py-3 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map((item) => {
                const typeConfig = CREDENTIAL_TYPE_LABELS[item.credentialType];
                const isRevoked = item.status === "REVOKED";

                return (
                  <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                    {/* Token ID */}
                    <td className="px-4 sm:px-6 py-3.5 font-mono font-bold text-slate-800">
                      {item.tokenId ? `#${item.tokenId}` : <span className="text-slate-400 text-[10px]">Pendiente</span>}
                    </td>

                    {/* Credential Info */}
                    <td className="px-4 py-3.5 max-w-xs sm:max-w-sm">
                      <div className="font-semibold text-slate-900 line-clamp-1">{item.title}</div>
                      <div className="text-[11px] text-slate-500 flex items-center gap-1.5 mt-0.5">
                        <span className="px-1.5 py-0.2 rounded bg-slate-100 text-slate-700 font-medium">
                          {typeConfig?.label || item.credentialType}
                        </span>
                        <span>•</span>
                        <span>{new Date(item.issueDate).toLocaleDateString()}</span>
                      </div>
                    </td>

                    {/* Student Info */}
                    <td className="px-4 py-3.5">
                      <div className="font-medium text-slate-900">{item.student.fullName}</div>
                      <div className="font-mono text-[10px] text-slate-400 truncate max-w-[140px]">
                        {item.student.walletAddress}
                      </div>
                    </td>

                    {/* Hours (PROMINENT BADGE) */}
                    <td className="px-4 py-3.5 text-center">
                      {item.hours ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 font-bold text-xs border border-blue-100">
                          <Clock className="w-3 h-3 text-blue-600" />
                          {item.hours} hrs
                        </span>
                      ) : (
                        <span className="text-slate-300">—</span>
                      )}
                    </td>

                    {/* Status */}
                    <td className="px-4 py-3.5 text-center">
                      {isRevoked ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-red-50 text-red-700 text-[11px] font-semibold border border-red-100">
                          <AlertTriangle className="w-3 h-3" />
                          Revocada
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[11px] font-semibold border border-emerald-100">
                          <CheckCircle className="w-3 h-3" />
                          Válida / SBT
                        </span>
                      )}
                    </td>

                    {/* Actions */}
                    <td className="px-4 sm:px-6 py-3.5 text-right space-x-2">
                      {item.tokenId && (
                        <Link
                          href={`/verify/${item.tokenId}`}
                          className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-[#1E3A5F] hover:bg-blue-50 rounded-lg transition-colors"
                          title="Ver página pública de verificación"
                        >
                          <ExternalLink className="w-3 h-3" />
                          Verificar
                        </Link>
                      )}

                      {!isRevoked && item.tokenId && (
                        <button
                          onClick={() => setSelectedForRevoke(item)}
                          className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Revocar credencial"
                        >
                          <Ban className="w-3 h-3" />
                          Revocar
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Revoke Modal */}
      {selectedForRevoke && selectedForRevoke.tokenId && (
        <RevokeModal
          isOpen={true}
          onClose={() => setSelectedForRevoke(null)}
          credentialId={selectedForRevoke.id}
          tokenId={selectedForRevoke.tokenId}
          title={selectedForRevoke.title}
          studentName={selectedForRevoke.student.fullName}
          onRevokedSuccess={() => {
            onRefresh();
          }}
        />
      )}
    </div>
  );
}
