import { defineChain, type Address } from "viem";

export const ARC_CHAIN_ID = 5042002;
export const ARC_RPC_URL = "https://rpc.testnet.arc.network";
export const ARC_EXPLORER_URL = "https://testnet.arcscan.app";
export const ARC_FAUCET_URL = "https://faucet.circle.com";
export const ARC_USDC_ADDRESS = "0x3600000000000000000000000000000000000000" as Address;
export const USDC_DECIMALS = 6;
export const ARC_CHAIN = defineChain({
  id: ARC_CHAIN_ID,
  name: "Arc Testnet",
  nativeCurrency: { name: "USDC", symbol: "USDC", decimals: 18 },
  rpcUrls: { default: { http: [ARC_RPC_URL] } },
  blockExplorers: { default: { name: "Arcscan", url: ARC_EXPLORER_URL } },
  testnet: true,
});

// Source chains from which a payer can bridge USDC into Arc via Circle CCTP.
// Arc itself is the destination, not a source.
export const SUPPORTED_SOURCE_CHAINS = [
  { id: 84532, appKitName: "Base_Sepolia", label: "Base Sepolia", gateway: true },
  { id: 11155111, appKitName: "Ethereum_Sepolia", label: "Ethereum Sepolia", gateway: true },
  { id: 421614, appKitName: "Arbitrum_Sepolia", label: "Arbitrum Sepolia", gateway: true },
  { id: 80002, appKitName: "Polygon_Amoy_Testnet", label: "Polygon Amoy", gateway: false },
] as const;

export type SourceChain = (typeof SUPPORTED_SOURCE_CHAINS)[number];

export function getSourceChain(chainId: number) {
  return SUPPORTED_SOURCE_CHAINS.find((chain) => chain.id === chainId);
}

export function explorerTx(hash?: string | null) {
  return hash ? `${ARC_EXPLORER_URL}/tx/${hash}` : ARC_EXPLORER_URL;
}

// Demo-mode tx hashes are tagged 0xDEM0… by the pay flow; receipts use this
// to avoid linking to Arcscan for a transaction that doesn't exist.
export function isDemoTxHash(hash?: string | null) {
  return !!hash && hash.toLowerCase().startsWith("0xdem0");
}
