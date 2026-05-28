import { defineChain, zeroAddress, type Address, type Hex } from "viem";
import { ARC_CHAIN, ARC_USDC_ADDRESS } from "@/lib/arc";

export const GATEWAY_API_BASE_URL = "https://gateway-api-testnet.circle.com/v1";
export const GATEWAY_WALLET_ADDRESS = "0x0077777d7EBA4688BDeF3E311b846F25870A19B9" as Address;
export const GATEWAY_MINTER_ADDRESS = "0x0022222ABE238Cc2C7Bb1f21003F0a260052475B" as Address;
export const GATEWAY_MAX_FEE = BigInt(2_010000);

export type GatewaySource = {
  chain: ReturnType<typeof defineChain>;
  domain: number;
  label: string;
  usdc: Address;
};

const gatewayBaseSepolia = defineChain({
  id: 84532,
  name: "Base Sepolia",
  nativeCurrency: { name: "Sepolia Ether", symbol: "ETH", decimals: 18 },
  rpcUrls: { default: { http: ["https://sepolia.base.org"] } },
  blockExplorers: { default: { name: "Basescan", url: "https://sepolia.basescan.org" } },
  testnet: true,
});

const gatewayEthereumSepolia = defineChain({
  id: 11155111,
  name: "Ethereum Sepolia",
  nativeCurrency: { name: "Sepolia Ether", symbol: "ETH", decimals: 18 },
  rpcUrls: { default: { http: ["https://ethereum-sepolia-rpc.publicnode.com"] } },
  blockExplorers: { default: { name: "Etherscan", url: "https://sepolia.etherscan.io" } },
  testnet: true,
});

const gatewayArbitrumSepolia = defineChain({
  id: 421614,
  name: "Arbitrum Sepolia",
  nativeCurrency: { name: "Arbitrum Sepolia Ether", symbol: "ETH", decimals: 18 },
  rpcUrls: { default: { http: ["https://sepolia-rollup.arbitrum.io/rpc"] } },
  blockExplorers: { default: { name: "Arbiscan", url: "https://sepolia.arbiscan.io" } },
  testnet: true,
});

const gatewayPolygonAmoy = defineChain({
  id: 80002,
  name: "Polygon Amoy",
  nativeCurrency: { name: "POL", symbol: "POL", decimals: 18 },
  rpcUrls: { default: { http: ["https://rpc-amoy.polygon.technology"] } },
  blockExplorers: { default: { name: "PolygonScan", url: "https://amoy.polygonscan.com" } },
  testnet: true,
});

export const GATEWAY_EVM_TESTNET_SOURCES = [
  { chain: ARC_CHAIN, domain: 26, label: "Arc Testnet", usdc: ARC_USDC_ADDRESS },
  { chain: gatewayBaseSepolia, domain: 6, label: "Base Sepolia", usdc: "0x036CbD53842c5426634e7929541eC2318f3dCF7e" as Address },
  { chain: gatewayEthereumSepolia, domain: 0, label: "Ethereum Sepolia", usdc: "0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238" as Address },
  { chain: gatewayArbitrumSepolia, domain: 3, label: "Arbitrum Sepolia", usdc: "0x75faf114eafb1BDbe2F0316DF893fd58CE46AA4d" as Address },
  { chain: gatewayPolygonAmoy, domain: 7, label: "Polygon Amoy", usdc: "0x41E94Eb019C0762f9Bfcf9Fb1E58725BfB0e7582" as Address },
] as const satisfies readonly GatewaySource[];

export type GatewayBalance = {
  domain: number;
  depositor: Address;
  balance: string;
};

export type GatewayTransferSpec = {
  version: number;
  sourceDomain: number;
  destinationDomain: number;
  sourceContract: Hex;
  destinationContract: Hex;
  sourceToken: Hex;
  destinationToken: Hex;
  sourceDepositor: Hex;
  destinationRecipient: Hex;
  sourceSigner: Hex;
  destinationCaller: Hex;
  value: bigint;
  salt: Hex;
  hookData: Hex;
};

export type GatewayBurnIntent = {
  maxBlockHeight: bigint;
  maxFee: bigint;
  spec: GatewayTransferSpec;
};

export const gatewayBurnIntentTypedData = {
  domain: { name: "GatewayWallet", version: "1" },
  types: {
    EIP712Domain: [
      { name: "name", type: "string" },
      { name: "version", type: "string" },
    ],
    TransferSpec: [
      { name: "version", type: "uint32" },
      { name: "sourceDomain", type: "uint32" },
      { name: "destinationDomain", type: "uint32" },
      { name: "sourceContract", type: "bytes32" },
      { name: "destinationContract", type: "bytes32" },
      { name: "sourceToken", type: "bytes32" },
      { name: "destinationToken", type: "bytes32" },
      { name: "sourceDepositor", type: "bytes32" },
      { name: "destinationRecipient", type: "bytes32" },
      { name: "sourceSigner", type: "bytes32" },
      { name: "destinationCaller", type: "bytes32" },
      { name: "value", type: "uint256" },
      { name: "salt", type: "bytes32" },
      { name: "hookData", type: "bytes" },
    ],
    BurnIntent: [
      { name: "maxBlockHeight", type: "uint256" },
      { name: "maxFee", type: "uint256" },
      { name: "spec", type: "TransferSpec" },
    ],
  },
  primaryType: "BurnIntent",
} as const;

export const gatewayMinterAbi = [
  {
    type: "function",
    name: "gatewayMint",
    inputs: [
      { name: "attestationPayload", type: "bytes" },
      { name: "signature", type: "bytes" },
    ],
    outputs: [],
    stateMutability: "nonpayable",
  },
] as const;

export const gatewayWalletAbi = [
  {
    type: "function",
    name: "deposit",
    inputs: [
      { name: "token", type: "address" },
      { name: "value", type: "uint256" },
    ],
    outputs: [],
    stateMutability: "nonpayable",
  },
] as const;

export function gatewaySourceByChainId(chainId: number) {
  return GATEWAY_EVM_TESTNET_SOURCES.find((source) => source.chain.id === chainId);
}

export function toGatewayBytes32(address: Address) {
  return `0x${address.toLowerCase().replace(/^0x/, "").padStart(64, "0")}` as Hex;
}

export function randomGatewaySalt() {
  const bytes = crypto.getRandomValues(new Uint8Array(32));
  return `0x${Array.from(bytes, (byte) => byte.toString(16).padStart(2, "0")).join("")}` as Hex;
}

export function createGatewayBurnIntent({
  source,
  amount,
  depositor,
  recipient,
}: {
  source: GatewaySource;
  amount: bigint;
  depositor: Address;
  recipient: Address;
}): GatewayBurnIntent {
  return {
    maxBlockHeight: BigInt("0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff"),
    maxFee: GATEWAY_MAX_FEE,
    spec: {
      version: 1,
      sourceDomain: source.domain,
      destinationDomain: 26,
      sourceContract: toGatewayBytes32(GATEWAY_WALLET_ADDRESS),
      destinationContract: toGatewayBytes32(GATEWAY_MINTER_ADDRESS),
      sourceToken: toGatewayBytes32(source.usdc),
      destinationToken: toGatewayBytes32(ARC_USDC_ADDRESS),
      sourceDepositor: toGatewayBytes32(depositor),
      destinationRecipient: toGatewayBytes32(recipient),
      sourceSigner: toGatewayBytes32(depositor),
      destinationCaller: toGatewayBytes32(zeroAddress),
      value: amount,
      salt: randomGatewaySalt(),
      hookData: "0x",
    },
  };
}
