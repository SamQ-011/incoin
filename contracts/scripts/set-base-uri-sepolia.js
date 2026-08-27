import { createWalletClient, createPublicClient, http } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { sepolia } from "viem/chains";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function main() {
  const rpcUrl = process.env.SEPOLIA_RPC_URL || "https://ethereum-sepolia-rpc.publicnode.com";
  const rawKey = process.env.PRIVATE_KEY?.trim() || "0x6e55b27e7902d21e837e4a1507ac1ba237a20b95c2dc734e308a11b25ebf3424";
  const formattedKey = rawKey.startsWith("0x") ? rawKey : `0x${rawKey}`;
  const account = privateKeyToAccount(formattedKey);
  const contractAddress = "0xd60b490890afc529ca3bbe55059215a0636d79de";
  const newBaseURI = "https://incoin-one.vercel.app/api/metadata/";

  const publicClient = createPublicClient({ chain: sepolia, transport: http(rpcUrl) });
  const walletClient = createWalletClient({ account, chain: sepolia, transport: http(rpcUrl) });

  const artifactPath = path.join(__dirname, "..", "artifacts", "contracts", "InCoinCredential.sol", "InCoinCredential.json");
  const artifact = JSON.parse(fs.readFileSync(artifactPath, "utf8"));

  console.log("🌐 Configurando baseTokenURI en Sepolia...");
  console.log("   Nuevo baseURI:", newBaseURI);

  const hash = await walletClient.writeContract({
    address: contractAddress,
    abi: artifact.abi,
    functionName: "setBaseURI",
    args: [newBaseURI],
  });

  console.log("  📄 TX Hash:", hash);
  console.log("  ⏳ Esperando confirmación...");
  await publicClient.waitForTransactionReceipt({ hash });

  const token1URI = await publicClient.readContract({
    address: contractAddress,
    abi: artifact.abi,
    functionName: "tokenURI",
    args: [1n],
  });

  console.log("✅ baseTokenURI actualizado exitosamente en Sepolia!");
  console.log("   tokenURI(1) ahora apunta a:", token1URI);
}

main().catch(console.error);
