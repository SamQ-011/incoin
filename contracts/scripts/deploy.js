import hre from "hardhat";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function main() {
  console.log("═══════════════════════════════════════════════════");
  console.log("  INCOIN Credential — Deployment");
  console.log("═══════════════════════════════════════════════════");
  console.log(`  Network: ${hre.network.name}`);
  console.log("═══════════════════════════════════════════════════\n");

  // Get the connection and accounts
  const connection = await hre.network.connect();
  const [deployer] = await connection.provider.request({
    method: "eth_accounts",
  });

  console.log(`  Deployer: ${deployer}`);

  // Deploy using Hardhat 3's viem integration
  const publicClient = await connection.provider.request({
    method: "eth_chainId",
  });
  console.log(`  Chain ID: ${parseInt(publicClient, 16)}\n`);

  // Compile and get the contract artifact
  const artifactPath = path.join(
    __dirname,
    "..",
    "artifacts",
    "contracts",
    "InCoinCredential.sol",
    "InCoinCredential.json"
  );

  if (!fs.existsSync(artifactPath)) {
    console.error("❌ Contract artifact not found. Run 'npx hardhat compile' first.");
    process.exit(1);
  }

  const artifact = JSON.parse(fs.readFileSync(artifactPath, "utf8"));

  // Deploy using raw transaction
  const deployTxHash = await connection.provider.request({
    method: "eth_sendTransaction",
    params: [
      {
        from: deployer,
        data: artifact.bytecode +
          // ABI encode constructor arg (address admin = deployer)
          deployer.slice(2).padStart(64, "0"),
        gas: "0x" + (5000000).toString(16),
      },
    ],
  });

  console.log(`  Deploy TX: ${deployTxHash}`);

  // Wait for receipt
  let receipt = null;
  while (!receipt) {
    receipt = await connection.provider.request({
      method: "eth_getTransactionReceipt",
      params: [deployTxHash],
    });
    if (!receipt) {
      await new Promise((r) => setTimeout(r, 1000));
    }
  }

  const contractAddress = receipt.contractAddress;

  console.log("");
  console.log("✅ InCoinCredential deployed successfully!");
  console.log(`   Contract Address: ${contractAddress}`);
  console.log(`   Token Name:       INCOIN Credential`);
  console.log(`   Token Symbol:     INCOIN`);
  console.log(`   Admin:            ${deployer}`);

  // Save deployment info
  const deploymentsDir = path.join(__dirname, "..", "deployments");
  if (!fs.existsSync(deploymentsDir)) {
    fs.mkdirSync(deploymentsDir, { recursive: true });
  }

  const deploymentData = {
    network: hre.network.name,
    contractAddress: contractAddress,
    deployer: deployer,
    deployedAt: new Date().toISOString(),
    txHash: deployTxHash,
  };

  fs.writeFileSync(
    path.join(deploymentsDir, `${hre.network.name}.json`),
    JSON.stringify(deploymentData, null, 2)
  );

  // Export ABI + address to frontend
  const frontendContractDir = path.join(__dirname, "..", "..", "frontend", "lib");
  if (!fs.existsSync(frontendContractDir)) {
    fs.mkdirSync(frontendContractDir, { recursive: true });
  }

  const contractConfig = {
    address: contractAddress,
    chainId: parseInt(publicClient, 16),
    abi: artifact.abi,
  };

  fs.writeFileSync(
    path.join(frontendContractDir, "contract-abi.json"),
    JSON.stringify(contractConfig, null, 2)
  );

  console.log("\n📋 ABI + address exported to frontend/lib/contract-abi.json");
  console.log("\n═══════════════════════════════════════════════════");
  console.log("  Deployment complete!");
  console.log("═══════════════════════════════════════════════════\n");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
