"use client";

import { useState, useEffect, useRef } from "react";
import { useInCoinContract } from "@/lib/useInCoinContract";
import { type Address } from "viem";
import {
  Building2,
  ShieldCheck,
  PlusCircle,
  ExternalLink,
  Copy,
  Check,
  Loader2,
  Award,
  Globe,
  MapPin,
  CheckCircle2,
  AlertTriangle,
  Lock,
  Sparkles,
  Layers,
  ArrowRight,
  UploadCloud,
  ImageIcon,
  Trash2,
} from "lucide-react";
import Link from "next/link";

interface IssuerItem {
  id: string;
  walletAddress: string;
  name: string;
  shortName: string;
  type: string;
  description?: string | null;
  website?: string | null;
  logoUrl?: string | null;
  primaryColor: string;
  secondaryColor: string;
  city?: string | null;
  country?: string | null;
  isAuthorized: boolean;
  txHash?: string | null;
  _count?: {
    credentials: number;
  };
}

const PRESET_INSTITUTIONS = [
  {
    name: "Universidad Mayor de San Andrés",
    shortName: "UMSA",
    type: "UNIVERSIDAD",
    primaryColor: "#003366",
    secondaryColor: "#C0392B",
    city: "La Paz",
    website: "https://umsa.bo",
    walletAddress: "0x70997970C51812dc3A010C7d01b50e0d17dc79C8",
  },
  {
    name: "Fundación INFOCAL La Paz",
    shortName: "INFOCAL",
    type: "INSTITUTO_TECNICO",
    primaryColor: "#F59E0B",
    secondaryColor: "#1F2937",
    city: "El Alto / La Paz",
    website: "https://infocallapaz.edu.bo",
    walletAddress: "0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC",
  },
  {
    name: "Escuela Militar de Ingeniería",
    shortName: "EMI",
    type: "UNIVERSIDAD",
    primaryColor: "#065F46",
    secondaryColor: "#D97706",
    city: "La Paz",
    website: "https://emi.edu.bo",
    walletAddress: "0x90F79bf6EB2c4f870365E785982E1f101E93b906",
  },
];

export default function GovernanceNetworkPage() {
  const { isConnected, address, isAdmin, addIssuerOnChain } = useInCoinContract();

  const [issuers, setIssuers] = useState<IssuerItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [copiedAddress, setCopiedAddress] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Form states
  const [showModal, setShowModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [stepMessage, setStepMessage] = useState("");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const [name, setName] = useState("");
  const [shortName, setShortName] = useState("");
  const [type, setType] = useState("INSTITUTO_TECNICO");
  const [walletAddress, setWalletAddress] = useState("");
  const [website, setWebsite] = useState("");
  const [city, setCity] = useState("El Alto / La Paz");
  const [logoUrl, setLogoUrl] = useState<string>("");
  const [primaryColor, setPrimaryColor] = useState("#1E3A5F");
  const [secondaryColor, setSecondaryColor] = useState("#D4AF37");

  const loadIssuers = () => {
    setIsLoading(true);
    fetch("/api/issuers")
      .then((res) => res.json())
      .then((json) => {
        if (json.success && Array.isArray(json.data)) {
          setIssuers(json.data);
        }
      })
      .catch((err) => console.error("Error loading issuers:", err))
      .finally(() => setIsLoading(false));
  };

  useEffect(() => {
    loadIssuers();
  }, []);

  const handleCopy = (addr: string) => {
    navigator.clipboard.writeText(addr);
    setCopiedAddress(addr);
    setTimeout(() => setCopiedAddress(null), 2000);
  };

  const handleApplyPreset = (preset: typeof PRESET_INSTITUTIONS[0]) => {
    setName(preset.name);
    setShortName(preset.shortName);
    setType(preset.type);
    setPrimaryColor(preset.primaryColor);
    setSecondaryColor(preset.secondaryColor);
    setCity(preset.city);
    setWebsite(preset.website);
    setWalletAddress(preset.walletAddress);
  };

  const handleLogoFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      setErrorMsg("El archivo del logo no debe superar los 2 MB.");
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        setLogoUrl(event.target.result as string);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleRegisterIssuer = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    if (!isConnected || !address) {
      setErrorMsg("Debes conectar tu wallet de administración de INCOIN.");
      return;
    }

    if (!isAdmin) {
      setErrorMsg("Acceso denegado: Solo el Administrador de la Red (DEFAULT_ADMIN_ROLE) puede autorizar nuevas instituciones.");
      return;
    }

    if (!walletAddress || !walletAddress.startsWith("0x") || walletAddress.length !== 42) {
      setErrorMsg("Ingresa una dirección de wallet válida (0x... de 42 caracteres).");
      return;
    }

    if (!name.trim()) {
      setErrorMsg("El nombre de la institución es obligatorio.");
      return;
    }

    setIsSubmitting(true);
    try {
      // 1. Autorizar en Smart Contract (On-Chain) con MetaMask
      setStepMessage("1/2: Autorizando rol ISSUER_ROLE en el Smart Contract con MetaMask...");
      const txHash = await addIssuerOnChain(walletAddress as Address);

      // 2. Guardar perfil institucional con sus colores, logo y marca en base de datos
      setStepMessage("2/2: Registrando perfil institucional en la red INCOIN...");
      const res = await fetch("/api/issuers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          walletAddress,
          name,
          shortName: shortName || name,
          type,
          website: website || null,
          city: city || "Bolivia",
          logoUrl: logoUrl || null,
          primaryColor,
          secondaryColor,
          txHash,
          isAuthorized: true,
        }),
      });

      const json = await res.json();
      if (!json.success) {
        throw new Error(json.error || "Error al registrar la institución en base de datos.");
      }

      setSuccessMsg(`¡Institución "${shortName || name}" afiliada y autorizada on-chain con éxito!`);
      loadIssuers();
      setShowModal(false);

      // Reset form
      setName("");
      setShortName("");
      setWalletAddress("");
      setWebsite("");
      setLogoUrl("");
    } catch (err: unknown) {
      console.error("Error onboarding issuer:", err);
      const msg = err instanceof Error ? err.message : "Error al afiliar la institución.";
      setErrorMsg(msg);
    } finally {
      setIsSubmitting(false);
      setStepMessage("");
    }
  };

  const totalCredentials = issuers.reduce(
    (acc, curr) => acc + (curr._count?.credentials || 0),
    0
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-slate-200">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-[#1E3A5F] text-xs font-bold border border-blue-100 mb-2">
            <ShieldCheck className="w-4 h-4 text-blue-600" />
            Gobernanza y Directorio de la Red INCOIN
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Ecosistema de Instituciones Afiliadas
          </h1>
          <p className="text-sm text-slate-600 max-w-2xl mt-1">
            Directorio público de universidades, institutos técnicos y colegios profesionales autorizados con permisos criptográficos de emisión <span className="font-mono text-xs font-bold text-blue-700 bg-blue-50 px-1.5 py-0.5 rounded">ISSUER_ROLE</span>.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {isAdmin ? (
            <button
              onClick={() => setShowModal(true)}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#1E3A5F] hover:bg-[#152942] text-white text-xs font-extrabold rounded-xl shadow-md transition-all active:scale-95 cursor-pointer"
            >
              <PlusCircle className="w-4 h-4 text-amber-300" />
              <span>Afiliar Nueva Institución (Admin)</span>
            </button>
          ) : (
            <div className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-100 border border-slate-200 text-xs font-medium text-slate-600">
              <Lock className="w-3.5 h-3.5 text-slate-400" />
              <span>Directorio Público (Solo Lectura)</span>
            </div>
          )}
        </div>
      </div>

      {/* Success Notification */}
      {successMsg && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold rounded-2xl flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-600" />
            <span>{successMsg}</span>
          </div>
          <button onClick={() => setSuccessMsg(null)} className="text-emerald-700 hover:underline">
            Cerrar
          </button>
        </div>
      )}

      {/* Network Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-2xs space-y-1">
          <div className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
            <Building2 className="w-4 h-4 text-blue-600" />
            Instituciones Afiliadas
          </div>
          <div className="text-2xl font-extrabold text-slate-900">
            {issuers.length} Miembros Oficiales
          </div>
          <p className="text-[11px] text-slate-400">Verificadas con clave pública en blockchain</p>
        </div>

        <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-2xs space-y-1">
          <div className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
            <Award className="w-4 h-4 text-amber-500" />
            Credenciales Emitidas en la Red
          </div>
          <div className="text-2xl font-extrabold text-slate-900">
            {totalCredentials} Soulbound Tokens
          </div>
          <p className="text-[11px] text-slate-400">Títulos, certificaciones y pasantías</p>
        </div>

        <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-2xs space-y-1">
          <div className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
            <Lock className="w-4 h-4 text-emerald-600" />
            Estándar de Seguridad
          </div>
          <div className="text-2xl font-extrabold text-emerald-700">
            ERC-721 + ERC-5192
          </div>
          <p className="text-[11px] text-slate-400">Intransferibles e incorruptibles</p>
        </div>
      </div>

      {/* Verified Institutions Directory */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
            <Building2 className="w-5 h-5 text-[#1E3A5F]" />
            Directorio de Instituciones Miembro
          </h2>
          <span className="text-xs text-slate-500">
            Cada entidad personaliza su escudo, logo y medallas digitales
          </span>
        </div>

        {isLoading ? (
          <div className="py-20 text-center space-y-3">
            <Loader2 className="w-8 h-8 animate-spin text-[#1E3A5F] mx-auto" />
            <p className="text-xs text-slate-500 font-medium">Consultando directorio de gobernanza...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {issuers.map((inst) => {
              const primary = inst.primaryColor || "#1E3A5F";
              const secondary = inst.secondaryColor || "#D4AF37";

              return (
                <div
                  key={inst.id}
                  className="bg-white rounded-3xl border border-slate-200 hover:border-blue-300 hover:shadow-md transition-all p-6 flex flex-col justify-between space-y-5 group"
                >
                  <div className="space-y-4">
                    {/* Header with Institutional Crest & Acronym */}
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        {inst.logoUrl ? (
                          <div className="w-12 h-12 rounded-2xl overflow-hidden border border-slate-200 bg-white p-1 shadow-2xs shrink-0 flex items-center justify-center">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={inst.logoUrl}
                              alt={inst.name}
                              className="w-full h-full object-contain"
                            />
                          </div>
                        ) : (
                          <div
                            className="w-12 h-12 rounded-2xl flex items-center justify-center font-extrabold text-sm shadow-sm shrink-0 border"
                            style={{
                              backgroundColor: primary,
                              color: secondary,
                              borderColor: secondary,
                            }}
                          >
                            {inst.shortName?.substring(0, 4) || "INST"}
                          </div>
                        )}

                        <div>
                          <span className="text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                            {inst.type?.replace("_", " ")}
                          </span>
                          <h3 className="text-sm font-extrabold text-slate-900 group-hover:text-[#1E3A5F] transition-colors line-clamp-1 mt-1">
                            {inst.name}
                          </h3>
                        </div>
                      </div>

                      <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200 shrink-0">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                        Autorizada
                      </span>
                    </div>

                    {/* Location & Web */}
                    <div className="space-y-1.5 text-xs text-slate-600">
                      <div className="flex items-center gap-1.5 text-slate-500">
                        <MapPin className="w-3.5 h-3.5 text-slate-400" />
                        <span>{inst.city || "Bolivia"}, {inst.country || "Bolivia"}</span>
                      </div>

                      {inst.website && (
                        <div className="flex items-center gap-1.5">
                          <Globe className="w-3.5 h-3.5 text-blue-500" />
                          <a
                            href={inst.website}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:underline truncate max-w-[220px]"
                          >
                            {inst.website.replace("https://", "")}
                          </a>
                        </div>
                      )}
                    </div>

                    {/* Branding Palette Preview */}
                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-between text-xs">
                      <span className="text-[11px] font-semibold text-slate-500">Colores de Medalla:</span>
                      <div className="flex items-center gap-2">
                        <div className="flex items-center gap-1">
                          <span
                            className="w-4 h-4 rounded-full border border-slate-300 shadow-2xs"
                            style={{ backgroundColor: primary }}
                            title={`Color Primario: ${primary}`}
                          />
                          <span className="text-[10px] font-mono text-slate-600">{primary}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <span
                            className="w-4 h-4 rounded-full border border-slate-300 shadow-2xs"
                            style={{ backgroundColor: secondary }}
                            title={`Color Secundario: ${secondary}`}
                          />
                          <span className="text-[10px] font-mono text-slate-600">{secondary}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Wallet & Stats Footer */}
                  <div className="pt-4 border-t border-slate-100 space-y-3">
                    <div>
                      <span className="text-[10px] text-slate-400 block font-bold uppercase">
                        Wallet Rectorado / Emisión:
                      </span>
                      <div className="flex items-center justify-between bg-slate-100 px-2 py-1 rounded-lg mt-0.5">
                        <span className="font-mono text-[11px] text-slate-700 truncate">
                          {inst.walletAddress}
                        </span>
                        <button
                          onClick={() => handleCopy(inst.walletAddress)}
                          className="p-1 hover:text-blue-600 cursor-pointer"
                          title="Copiar wallet"
                        >
                          {copiedAddress === inst.walletAddress ? (
                            <Check className="w-3 h-3 text-emerald-600" />
                          ) : (
                            <Copy className="w-3 h-3 text-slate-400" />
                          )}
                        </button>
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-xs pt-1">
                      <span className="text-slate-500 font-medium">
                        Credenciales Emitidas:
                      </span>
                      <span className="font-extrabold text-blue-900 bg-blue-50 px-2.5 py-0.5 rounded-full border border-blue-200">
                        {inst._count?.credentials || 0} SBTs
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Modal: Afiliar Nueva Institución */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl max-w-2xl w-full border border-slate-200 shadow-2xl p-6 sm:p-8 relative max-h-[90vh] overflow-y-auto space-y-6">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center font-bold">
                  <Building2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-slate-900">
                    Afiliar Nueva Institución a la Red INCOIN
                  </h3>
                  <p className="text-xs text-slate-500">
                    Autoriza una nueva universidad o instituto con permisos de emisión on-chain
                  </p>
                </div>
              </div>

              <button
                onClick={() => setShowModal(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg"
              >
                ✕
              </button>
            </div>

            {/* Error in modal */}
            {errorMsg && (
              <div className="p-3.5 bg-red-50 border border-red-200 text-red-800 text-xs rounded-xl flex items-center gap-2 font-medium">
                <AlertTriangle className="w-4 h-4 text-red-600 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* Quick Presets */}
            <div className="space-y-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block">
                Plantillas Rápidas de Prueba:
              </span>
              <div className="flex flex-wrap gap-2">
                {PRESET_INSTITUTIONS.map((preset) => (
                  <button
                    key={preset.shortName}
                    type="button"
                    onClick={() => handleApplyPreset(preset)}
                    className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold rounded-lg border border-slate-200 transition-colors cursor-pointer flex items-center gap-1.5"
                  >
                    <span
                      className="w-2.5 h-2.5 rounded-full"
                      style={{ backgroundColor: preset.primaryColor }}
                    />
                    <span>{preset.shortName}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Form */}
            <form onSubmit={handleRegisterIssuer} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase text-slate-600 mb-1">
                  Nombre Completo de la Institución *
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="ej. Universidad Mayor de San Andrés"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:border-blue-500 focus:bg-white"
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-600 mb-1">
                    Sigla / Acrónimo *
                  </label>
                  <input
                    type="text"
                    value={shortName}
                    onChange={(e) => setShortName(e.target.value)}
                    placeholder="ej. UMSA"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:border-blue-500 focus:bg-white"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase text-slate-600 mb-1">
                    Tipo de Institución
                  </label>
                  <select
                    value={type}
                    onChange={(e) => setType(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:border-blue-500 focus:bg-white"
                  >
                    <option value="INSTITUTO_TECNICO">Instituto Técnico Superior</option>
                    <option value="UNIVERSIDAD">Universidad Pública / Privada</option>
                    <option value="COLEGIO_PROFESIONAL">Colegio de Profesionales</option>
                    <option value="ONG">Fundación / ONG</option>
                    <option value="EMPRESA">Centro Tecnológico / Empresa</option>
                  </select>
                </div>
              </div>

              {/* Logo Upload Section */}
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-bold uppercase text-slate-700">
                    Escudo / Logo Oficial de la Institución
                  </label>
                  <span className="text-[11px] text-slate-400">PNG o SVG (Max 2MB)</span>
                </div>

                <div className="flex flex-col sm:flex-row items-center gap-4">
                  {/* Logo Preview */}
                  <div
                    className="w-16 h-16 rounded-2xl border-2 flex items-center justify-center overflow-hidden shrink-0 shadow-sm"
                    style={{
                      backgroundColor: primaryColor,
                      borderColor: secondaryColor,
                    }}
                  >
                    {logoUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={logoUrl}
                        alt="Logo Preview"
                        className="w-full h-full object-contain p-1.5"
                      />
                    ) : (
                      <span
                        className="font-extrabold text-base"
                        style={{ color: secondaryColor }}
                      >
                        {shortName?.substring(0, 4) || "LOGO"}
                      </span>
                    )}
                  </div>

                  {/* Upload Actions */}
                  <div className="flex-1 w-full space-y-2">
                    <div className="flex items-center gap-2">
                      <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleLogoFileUpload}
                        accept="image/png,image/jpeg,image/svg+xml"
                        className="hidden"
                      />
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 text-xs font-bold rounded-xl shadow-2xs transition-colors cursor-pointer"
                      >
                        <UploadCloud className="w-4 h-4 text-blue-600" />
                        <span>Subir Escudo / Logo</span>
                      </button>

                      {logoUrl && (
                        <button
                          type="button"
                          onClick={() => setLogoUrl("")}
                          className="p-2 text-slate-400 hover:text-red-600 rounded-lg"
                          title="Eliminar logo"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-[10px] text-slate-400">O ingresa URL:</span>
                      <input
                        type="url"
                        value={logoUrl.startsWith("data:") ? "" : logoUrl}
                        onChange={(e) => setLogoUrl(e.target.value)}
                        placeholder="https://ejemplo.edu.bo/escudo.png"
                        className="flex-1 px-2.5 py-1 bg-white border border-slate-200 rounded-lg text-[11px] text-slate-700 focus:outline-none focus:border-blue-500"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-slate-600 mb-1">
                  Wallet Oficial del Rectorado / Secretaría (0x...) *
                </label>
                <input
                  type="text"
                  value={walletAddress}
                  onChange={(e) => setWalletAddress(e.target.value)}
                  placeholder="0x70997970C51812dc3A010C7d01b50e0d17dc79C8"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-mono text-xs text-slate-800 focus:outline-none focus:border-blue-500 focus:bg-white"
                  required
                />
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Esta dirección recibirá el rol <code className="text-blue-700 font-bold">ISSUER_ROLE</code> en el Smart Contract.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-600 mb-1">
                    Ciudad / Sede
                  </label>
                  <input
                    type="text"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder="La Paz / El Alto"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:border-blue-500 focus:bg-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase text-slate-600 mb-1">
                    Sitio Web Oficial
                  </label>
                  <input
                    type="text"
                    value={website}
                    onChange={(e) => setWebsite(e.target.value)}
                    placeholder="https://umsa.bo"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:border-blue-500 focus:bg-white"
                  />
                </div>
              </div>

              {/* Brand Colors */}
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
                <span className="text-xs font-bold text-slate-700 block uppercase">
                  Colores de Identidad para Medallas SVG (MetaMask):
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="flex items-center gap-3">
                    <input
                      type="color"
                      value={primaryColor}
                      onChange={(e) => setPrimaryColor(e.target.value)}
                      className="w-10 h-10 rounded-lg cursor-pointer border border-slate-300"
                    />
                    <div>
                      <span className="text-xs font-bold text-slate-700 block">Color Primario</span>
                      <span className="text-[11px] font-mono text-slate-500">{primaryColor}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <input
                      type="color"
                      value={secondaryColor}
                      onChange={(e) => setSecondaryColor(e.target.value)}
                      className="w-10 h-10 rounded-lg cursor-pointer border border-slate-300"
                    />
                    <div>
                      <span className="text-xs font-bold text-slate-700 block">Color Secundario</span>
                      <span className="text-[11px] font-mono text-slate-500">{secondaryColor}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2.5 text-xs font-bold text-slate-600 hover:text-slate-800"
                >
                  Cancelar
                </button>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="inline-flex items-center justify-center gap-2 px-6 py-2.5 bg-[#1E3A5F] hover:bg-[#152942] text-white text-xs font-extrabold rounded-xl shadow-md transition-all active:scale-95 disabled:opacity-50 cursor-pointer"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin text-amber-300" />
                      <span>{stepMessage || "Autorizando en blockchain..."}</span>
                    </>
                  ) : (
                    <>
                      <ShieldCheck className="w-4 h-4 text-amber-300" />
                      <span>Autorizar Institución en Blockchain</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
