import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function main() {
  const deploymentPath = path.join(__dirname, "..", "deployments", "sepolia.json");
  let contractAddress = process.env.CONTRACT_ADDRESS;

  if (!contractAddress && fs.existsSync(deploymentPath)) {
    const deploymentData = JSON.parse(fs.readFileSync(deploymentPath, "utf8"));
    contractAddress = deploymentData.contractAddress;
  }

  if (!contractAddress) {
    contractAddress = "0xd60b490890afc529ca3bbe55059215a0636d79de";
  }

  const contract = await hre.ethers.getContractAt(
    "InCoinCredential",
    contractAddress
  );

  // Check total supply
  const nextId = await contract.nextTokenId();
  console.log("Next Token ID (total minted):", nextId.toString());

  // Check owner of each minted token
  for (let i = 1; i < Number(nextId); i++) {
    try {
      const owner = await contract.ownerOf(i);
      console.log(`Token ${i} → Owner: ${owner}`);
    } catch (e) {
      console.log(`Token ${i} → REVOKED or BURNED`);
    }
  }
}

main().catch(console.error);
