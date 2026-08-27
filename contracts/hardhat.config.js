import HardhatViem from "@nomicfoundation/hardhat-viem";
import HardhatNodeTestRunner from "@nomicfoundation/hardhat-node-test-runner";
import HardhatNetworkHelpers from "@nomicfoundation/hardhat-network-helpers";
import dotenv from "dotenv";

dotenv.config();

const rawKey = process.env.PRIVATE_KEY?.trim();
const privateKey = rawKey ? (rawKey.startsWith("0x") ? rawKey : `0x${rawKey}`) : undefined;

const sepoliaConfig = {
  type: "http",
  url: process.env.SEPOLIA_RPC_URL || "https://ethereum-sepolia-rpc.publicnode.com",
  chainId: 11155111,
};

if (privateKey && privateKey.length === 66) {
  sepoliaConfig.accounts = [privateKey];
}

/** @type {import("hardhat/config").HardhatUserConfig} */
const config = {
  plugins: [HardhatViem, HardhatNodeTestRunner, HardhatNetworkHelpers],
  solidity: {
    version: "0.8.28",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
    },
  },
  networks: {
    hardhat: {
      type: "edr-simulated",
      chainId: 31337,
    },
    localhost: {
      type: "http",
      url: "http://127.0.0.1:8545",
      chainId: 31337,
    },
    sepolia: sepoliaConfig,
  },
};

export default config;
