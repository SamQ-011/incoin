import { keccak256, toHex } from "viem";

export enum CredentialType {
  ACADEMIC_DEGREE = 0,
  CERTIFICATION = 1,
  DIPLOMA = 2,
  INTERNSHIP = 3,
  VOLUNTEERING = 4,
}

export const CREDENTIAL_TYPE_LABELS: Record<string, { label: string; enumVal: number; color: string }> = {
  ACADEMIC_DEGREE: {
    label: "Título Académico / Profesional",
    enumVal: CredentialType.ACADEMIC_DEGREE,
    color: "from-blue-600 to-indigo-700",
  },
  CERTIFICATION: {
    label: "Certificación Técnica",
    enumVal: CredentialType.CERTIFICATION,
    color: "from-emerald-600 to-teal-700",
  },
  DIPLOMA: {
    label: "Diplomado",
    enumVal: CredentialType.DIPLOMA,
    color: "from-purple-600 to-violet-700",
  },
  INTERNSHIP: {
    label: "Pasantía Profesional",
    enumVal: CredentialType.INTERNSHIP,
    color: "from-amber-600 to-orange-700",
  },
  VOLUNTEERING: {
    label: "Voluntariado / Impacto Social",
    enumVal: CredentialType.VOLUNTEERING,
    color: "from-rose-600 to-pink-700",
  },
};

export interface CredentialMetadataPayload {
  title: string;
  credentialType: string;
  studentAddress: string;
  studentName: string;
  issuerAddress: string;
  issuerName: string;
  hours?: number | null;
  description?: string | null;
  issuedAt: string;
}

/**
 * Computes a deterministic Keccak-256 hash of the canonical credential metadata.
 * This hash matches what is anchored on-chain in the InCoinCredential smart contract.
 */
export function generateMetadataHash(payload: CredentialMetadataPayload): `0x${string}` {
  const canonicalData = {
    title: payload.title.trim(),
    credentialType: payload.credentialType,
    studentAddress: payload.studentAddress.toLowerCase(),
    studentName: payload.studentName.trim(),
    issuerAddress: payload.issuerAddress.toLowerCase(),
    issuerName: payload.issuerName.trim(),
    hours: payload.hours ?? 0,
    description: payload.description?.trim() ?? "",
    issuedAt: payload.issuedAt,
  };

  const jsonString = JSON.stringify(canonicalData, Object.keys(canonicalData).sort());
  return keccak256(toHex(jsonString));
}
