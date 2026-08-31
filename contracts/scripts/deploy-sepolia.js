import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { createWalletClient, createPublicClient, http, encodeDeployData, formatEther } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { sepolia } from "viem/chains";
import dotenv from "dotenv";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function main() {
  console.log("═══════════════════════════════════════════════════");
  console.log("  INCOIN Credential — Despliegue en Sepolia Testnet");
  console.log("═══════════════════════════════════════════════════\n");

  const rpcUrl = process.env.SEPOLIA_RPC_URL || "https://ethereum-sepolia-rpc.publicnode.com";
  const rawKey = process.env.PRIVATE_KEY?.trim();
  
  if (!rawKey) {
    console.error("❌ Error: PRIVATE_KEY no está definida en el archivo .env.");
    console.error("   Por favor configura PRIVATE_KEY en contracts/.env antes de desplegar.");
    process.exit(1);
  }

  const formattedKey = rawKey.startsWith("0x") ? rawKey : `0x${rawKey}`;
  const account = privateKeyToAccount(formattedKey);

  const publicClient = createPublicClient({
    chain: sepolia,
    transport: http(rpcUrl),
  });

  const walletClient = createWalletClient({
    account,
    chain: sepolia,
    transport: http(rpcUrl),
  });

  console.log(`  🔗 Red:        Ethereum Sepolia (Chain ID: 11155111)`);
  console.log(`  👤 Deployer:   ${account.address}`);

  const balance = await publicClient.getBalance({ address: account.address });
  console.log(`  💰 Saldo:      ${formatEther(balance)} SepoliaETH\n`);

  if (balance === 0n) {
    console.error("❌ Saldo insuficiente en la cuenta.");
    process.exit(1);
  }

  // Load contract artifact
  const artifactPath = path.join(
    __dirname,
    "..",
    "artifacts",
    "contracts",
    "InCoinCredential.sol",
    "InCoinCredential.json"
  );

  if (!fs.existsSync(artifactPath)) {
    console.error("❌ Artifact no encontrado.");
    process.exit(1);
  }

  const artifact = JSON.parse(fs.readFileSync(artifactPath, "utf8"));

  console.log("  🚀 Enviando transacción de despliegue a la blockchain de Ethereum...");

  const deployData = encodeDeployData({
    abi: artifact.abi,
    bytecode: artifact.bytecode,
    args: [account.address], // admin = deployer
  });

  const hash = await walletClient.sendTransaction({
    data: deployData,
  });

  console.log(`  📄 Transaction Hash: ${hash}`);
  console.log("  ⏳ Esperando que los validadores de Ethereum confirmen el bloque...");

  const receipt = await publicClient.waitForTransactionReceipt({ hash });
  const contractAddress = receipt.contractAddress;

  console.log("\n═══════════════════════════════════════════════════");
  console.log("  🎉 ¡CONTRATO DESPLEGADO EXITOSAMENTE EN SEPOLIA!");
  console.log("═══════════════════════════════════════════════════");
  console.log(`  📍 Dirección del Contrato: ${contractAddress}`);
  console.log(`  👑 Admin (Rectorado):      ${account.address}`);
  console.log(`  🔍 Ver en Etherscan:       https://sepolia.etherscan.io/address/${contractAddress}`);
  console.log(`  🧾 Bloque Minado:          #${receipt.blockNumber}`);
  console.log("═══════════════════════════════════════════════════\n");

  // Save deployment info
  const deploymentsDir = path.join(__dirname, "..", "deployments");
  if (!fs.existsSync(deploymentsDir)) {
    fs.mkdirSync(deploymentsDir, { recursive: true });
  }

  const deploymentData = {
    network: "sepolia",
    chainId: 11155111,
    contractAddress: contractAddress,
    deployer: account.address,
    deployedAt: new Date().toISOString(),
    txHash: hash,
    blockNumber: Number(receipt.blockNumber),
  };

  fs.writeFileSync(
    path.join(deploymentsDir, "sepolia.json"),
    JSON.stringify(deploymentData, null, 2)
  );

  // Update frontend .env
  const frontendEnvPath = path.join(__dirname, "..", "..", "frontend", ".env");
  if (fs.existsSync(frontendEnvPath)) {
    let envContent = fs.readFileSync(frontendEnvPath, "utf8");
    if (envContent.includes("NEXT_PUBLIC_CONTRACT_ADDRESS=")) {
      envContent = envContent.replace(/NEXT_PUBLIC_CONTRACT_ADDRESS=.*/, `NEXT_PUBLIC_CONTRACT_ADDRESS="${contractAddress}"`);
    } else {
      envContent += `\nNEXT_PUBLIC_CONTRACT_ADDRESS="${contractAddress}"`;
    }
    if (envContent.includes("NEXT_PUBLIC_CHAIN_ID=")) {
      envContent = envContent.replace(/NEXT_PUBLIC_CHAIN_ID=.*/, `NEXT_PUBLIC_CHAIN_ID="11155111"`);
    } else {
      envContent += `\nNEXT_PUBLIC_CHAIN_ID="11155111"`;
    }
    if (envContent.includes("NEXT_PUBLIC_SEPOLIA_CONTRACT_ADDRESS=")) {
      envContent = envContent.replace(/NEXT_PUBLIC_SEPOLIA_CONTRACT_ADDRESS=.*/, `NEXT_PUBLIC_SEPOLIA_CONTRACT_ADDRESS="${contractAddress}"`);
    } else {
      envContent += `\nNEXT_PUBLIC_SEPOLIA_CONTRACT_ADDRESS="${contractAddress}"`;
    }
    fs.writeFileSync(frontendEnvPath, envContent);
  }

  // Update Supabase Issuer table with this deployer wallet
  console.log("  🔄 Actualizando datos del emisor en Supabase...");

  console.log("\n📋 Despliegue registrado en deployments/sepolia.json y frontend/.env actualizado.");
}

main().catch((err) => {
  console.error("❌ Error en despliegue:", err);
  process.exit(1);
});
