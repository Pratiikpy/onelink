import { arcTestnet } from "viem/chains";
import type { Address } from "viem";

export const ARC_CHAIN = arcTestnet;
export const ARC_CHAIN_ID = 5042002;
export const ARC_RPC_URL = "https://rpc.testnet.arc.network";
export const ARC_EXPLORER_URL = "https://testnet.arcscan.app";
export const ARC_FAUCET_URL = "https://faucet.circle.com";
export const ARC_USDC_ADDRESS = "0x3600000000000000000000000000000000000000" as Address;
export const USDC_DECIMALS = 6;

export const SUPPORTED_SOURCE_CHAINS = [
  { id: 5042002, appKitName: "Arc_Testnet", label: "Arc Testnet" },
  { id: 84532, appKitName: "Base_Sepolia", label: "Base Sepolia" },
  { id: 11155111, appKitName: "Ethereum_Sepolia", label: "Ethereum Sepolia" },
  { id: 421614, appKitName: "Arbitrum_Sepolia", label: "Arbitrum Sepolia" },
] as const;

export function explorerTx(hash?: string | null) {
  return hash ? `${ARC_EXPLORER_URL}/tx/${hash}` : ARC_EXPLORER_URL;
}
