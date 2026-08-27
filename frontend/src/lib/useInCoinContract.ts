"use client";

import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt, useSwitchChain } from "wagmi";
import {
  INCOIN_CREDENTIAL_ABI,
  getContractAddress,
  ISSUER_ROLE_HASH,
  DEFAULT_ADMIN_ROLE_HASH,
} from "./contract";
import { type Address } from "viem";
import { sepolia } from "wagmi/chains";

const REQUIRED_CHAIN_ID = sepolia.id; // 11155111 (Sepolia Testnet)

export function useInCoinContract() {
  const { address, isConnected, chainId } = useAccount();
  const contractAddress = getContractAddress(REQUIRED_CHAIN_ID);
  const { switchChainAsync } = useSwitchChain();

  const isWrongNetwork = isConnected && chainId !== REQUIRED_CHAIN_ID;

  // 1. Check if the connected wallet has ISSUER_ROLE in the smart contract
  const {
    data: hasIssuerRoleData,
    isLoading: isLoadingIssuerRole,
    refetch: refetchIssuerRole,
  } = useReadContract({
    address: contractAddress,
    abi: INCOIN_CREDENTIAL_ABI,
    functionName: "hasRole",
    args: address ? [ISSUER_ROLE_HASH, address] : undefined,
    chainId: REQUIRED_CHAIN_ID,
    query: {
      enabled: !!address,
    },
  });

  // 2. Check if the connected wallet has DEFAULT_ADMIN_ROLE in the smart contract
  const {
    data: hasAdminRoleData,
    isLoading: isLoadingAdminRole,
    refetch: refetchAdminRole,
  } = useReadContract({
    address: contractAddress,
    abi: INCOIN_CREDENTIAL_ABI,
    functionName: "hasRole",
    args: address ? [DEFAULT_ADMIN_ROLE_HASH, address] : undefined,
    chainId: REQUIRED_CHAIN_ID,
    query: {
      enabled: !!address,
    },
  });

  // Strict role verification: true only if granted on-chain
  const isIssuer = Boolean(hasIssuerRoleData);
  const isAdmin = Boolean(hasAdminRoleData);

  // 2. Write operations (issueCredential, revokeCredential)
  const {
    data: txHash,
    writeContractAsync,
    isPending: isWritePending,
    error: writeError,
    reset: resetWrite,
  } = useWriteContract();

  const {
    isLoading: isConfirming,
    isSuccess: isConfirmed,
    data: receipt,
  } = useWaitForTransactionReceipt({
    hash: txHash,
  });

  /**
   * Ensures MetaMask is on Hardhat Localhost (31337) before any write operation.
   * If MetaMask is on another network, it will prompt the user to switch.
   */
  const ensureCorrectChain = async () => {
    if (chainId !== REQUIRED_CHAIN_ID) {
      try {
        await switchChainAsync({ chainId: REQUIRED_CHAIN_ID });
      } catch (err) {
        throw new Error(
          "Debes cambiar a la red Ethereum Sepolia para emitir credenciales. " +
          "MetaMask te pedirá confirmar el cambio de red."
        );
      }
    }
  };

  /**
   * Switch to the correct chain (can be called from UI buttons)
   */
  const switchToCorrectChain = async () => {
    await switchChainAsync({ chainId: REQUIRED_CHAIN_ID });
  };

  /**
   * Issues a credential on-chain.
   * Automatically switches to Hardhat Localhost if needed.
   */
  const issueCredentialOnChain = async (
    to: Address,
    credType: number,
    metadataHash: `0x${string}`
  ) => {
    await ensureCorrectChain();
    return await writeContractAsync({
      address: contractAddress,
      abi: INCOIN_CREDENTIAL_ABI,
      functionName: "issueCredential",
      args: [to, credType, metadataHash],
      chainId: REQUIRED_CHAIN_ID,
    });
  };

  /**
   * Issues a batch of credentials on-chain in 1 single MetaMask transaction.
   */
  const issueBatchOnChain = async (
    recipients: Address[],
    credType: number,
    metadataHashes: `0x${string}`[]
  ) => {
    await ensureCorrectChain();
    return await writeContractAsync({
      address: contractAddress,
      abi: INCOIN_CREDENTIAL_ABI,
      functionName: "issueBatch",
      args: [recipients, credType, metadataHashes],
      chainId: REQUIRED_CHAIN_ID,
    });
  };

  /**
   * Authorizes a new institution on-chain by granting ISSUER_ROLE (Admin only).
   */
  const addIssuerOnChain = async (issuerAddress: Address) => {
    await ensureCorrectChain();
    return await writeContractAsync({
      address: contractAddress,
      abi: INCOIN_CREDENTIAL_ABI,
      functionName: "addIssuer",
      args: [issuerAddress],
      chainId: REQUIRED_CHAIN_ID,
    });
  };

  /**
   * Revokes ISSUER_ROLE from an institution on-chain (Admin only).
   */
  const removeIssuerOnChain = async (issuerAddress: Address) => {
    await ensureCorrectChain();
    return await writeContractAsync({
      address: contractAddress,
      abi: INCOIN_CREDENTIAL_ABI,
      functionName: "removeIssuer",
      args: [issuerAddress],
      chainId: REQUIRED_CHAIN_ID,
    });
  };

  /**
   * Revokes a credential on-chain.
   * Automatically switches to Hardhat Localhost if needed.
   */
  const revokeCredentialOnChain = async (tokenId: bigint, reason: string) => {
    await ensureCorrectChain();
    return await writeContractAsync({
      address: contractAddress,
      abi: INCOIN_CREDENTIAL_ABI,
      functionName: "revokeCredential",
      args: [tokenId, reason],
      chainId: REQUIRED_CHAIN_ID,
    });
  };

  return {
    address,
    isConnected,
    chainId,
    contractAddress,
    isIssuer,
    isLoadingIssuerRole,
    refetchIssuerRole,
    isAdmin,
    isLoadingAdminRole,
    refetchAdminRole,
    // Network
    isWrongNetwork,
    requiredChainId: REQUIRED_CHAIN_ID,
    switchToCorrectChain,
    // Transactions & Governance
    txHash,
    isWritePending,
    isConfirming,
    isConfirmed,
    receipt,
    writeError,
    resetWrite,
    issueCredentialOnChain,
    issueBatchOnChain,
    revokeCredentialOnChain,
    addIssuerOnChain,
    removeIssuerOnChain,
  };
}
