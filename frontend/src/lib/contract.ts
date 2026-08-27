import artifact from "@/contracts/InCoinCredential.json";
import { type Abi, type Address, keccak256, toHex } from "viem";

export const INCOIN_CREDENTIAL_ABI = artifact.abi as Abi;

// Contrato Oficial Desplegado en Sepolia Testnet
export const SEPOLIA_CONTRACT_ADDRESS: Address =
  (process.env.NEXT_PUBLIC_SEPOLIA_CONTRACT_ADDRESS as Address) ||
  "0xd60b490890afc529ca3bbe55059215a0636d79de";

export const DEFAULT_CONTRACT_ADDRESS: Address =
  (process.env.NEXT_PUBLIC_CONTRACT_ADDRESS as Address) ||
  SEPOLIA_CONTRACT_ADDRESS;

// keccak256("ISSUER_ROLE") = 0x114e74f6ea3bd819998f78687bfcb11b140da08e9b7d222fa9c1f1ba1f2aa122
export const ISSUER_ROLE_HASH = keccak256(toHex("ISSUER_ROLE")) as `0x${string}`;

export const DEFAULT_ADMIN_ROLE_HASH =
  "0x0000000000000000000000000000000000000000000000000000000000000000" as `0x${string}`;

export function getContractAddress(chainId?: number): Address {
  if (chainId === 11155111) {
    return SEPOLIA_CONTRACT_ADDRESS;
  }
  if (chainId === 31337) {
    return "0x5fbdb2315678afecb367f032d93f642f64180aa3";
  }
  return DEFAULT_CONTRACT_ADDRESS;
}
