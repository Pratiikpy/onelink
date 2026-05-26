import type { Address } from "viem";

export const ONELINK_CONTRACT_ADDRESS = (process.env.NEXT_PUBLIC_ONELINK_CONTRACT_ADDRESS ||
  "0x0000000000000000000000000000000000000000") as Address;

export const HAS_CONTRACT =
  ONELINK_CONTRACT_ADDRESS !== "0x0000000000000000000000000000000000000000";

export const PLATFORM_FEE_BPS = Number(process.env.NEXT_PUBLIC_PLATFORM_FEE_BPS || 0);

export const ALLOW_DEMO_MODE = process.env.NEXT_PUBLIC_ALLOW_DEMO === "true";

const publicAppUrl = process.env.NEXT_PUBLIC_APP_URL ?? "";
const isPublicDeploy = publicAppUrl.startsWith("https://");

if (
  process.env.NODE_ENV === "production" &&
  isPublicDeploy &&
  !HAS_CONTRACT &&
  !ALLOW_DEMO_MODE
) {
  throw new Error(
    "OneLink production build is missing NEXT_PUBLIC_ONELINK_CONTRACT_ADDRESS. " +
      "Deploy contracts/src/OneLinkCollect.sol to Arc Testnet first, or set " +
      "NEXT_PUBLIC_ALLOW_DEMO=true to acknowledge demo mode in production.",
  );
}

export const oneLinkCollectAbi = [
  {
    type: "function",
    name: "createLink",
    stateMutability: "nonpayable",
    inputs: [
      { name: "linkId", type: "bytes32" },
      { name: "recipient", type: "address" },
      { name: "amount", type: "uint256" },
      { name: "expiresAt", type: "uint64" },
    ],
    outputs: [],
  },
  {
    type: "function",
    name: "payLink",
    stateMutability: "nonpayable",
    inputs: [{ name: "linkId", type: "bytes32" }],
    outputs: [],
  },
  {
    type: "function",
    name: "payRecipient",
    stateMutability: "nonpayable",
    inputs: [
      { name: "paymentId", type: "bytes32" },
      { name: "recipient", type: "address" },
      { name: "amount", type: "uint256" },
    ],
    outputs: [],
  },
  {
    type: "function",
    name: "cancelLink",
    stateMutability: "nonpayable",
    inputs: [{ name: "linkId", type: "bytes32" }],
    outputs: [],
  },
  {
    type: "function",
    name: "getLink",
    stateMutability: "view",
    inputs: [{ name: "linkId", type: "bytes32" }],
    outputs: [
      {
        type: "tuple",
        components: [
          { name: "creator", type: "address" },
          { name: "recipient", type: "address" },
          { name: "amount", type: "uint256" },
          { name: "expiresAt", type: "uint64" },
          { name: "paid", type: "bool" },
          { name: "cancelled", type: "bool" },
        ],
      },
    ],
  },
  {
    type: "event",
    name: "PaymentLinkCreated",
    inputs: [
      { name: "linkId", type: "bytes32", indexed: true },
      { name: "creator", type: "address", indexed: true },
      { name: "recipient", type: "address", indexed: true },
      { name: "amount", type: "uint256", indexed: false },
      { name: "expiresAt", type: "uint64", indexed: false },
    ],
  },
  {
    type: "event",
    name: "PaymentCompleted",
    inputs: [
      { name: "linkId", type: "bytes32", indexed: true },
      { name: "payer", type: "address", indexed: true },
      { name: "recipient", type: "address", indexed: true },
      { name: "grossAmount", type: "uint256", indexed: false },
      { name: "feeAmount", type: "uint256", indexed: false },
    ],
  },
  {
    type: "event",
    name: "PaymentLinkCancelled",
    inputs: [
      { name: "linkId", type: "bytes32", indexed: true },
      { name: "creator", type: "address", indexed: true },
    ],
  },
] as const;

export const erc20Abi = [
  {
    type: "function",
    name: "approve",
    stateMutability: "nonpayable",
    inputs: [
      { name: "spender", type: "address" },
      { name: "amount", type: "uint256" },
    ],
    outputs: [{ name: "", type: "bool" }],
  },
  {
    type: "function",
    name: "balanceOf",
    stateMutability: "view",
    inputs: [{ name: "account", type: "address" }],
    outputs: [{ name: "", type: "uint256" }],
  },
] as const;
