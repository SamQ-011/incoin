import hre from "hardhat";

async function main() {
  const contract = await hre.ethers.getContractAt(
    "InCoinCredential",
    "0x5FbDB2315678afecb367f032d93F642f64180aa3"
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
