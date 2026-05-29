import { keccak256, parseUnits, stringToBytes, type Address } from "viem";
import { nanoid } from "nanoid";
import { USDC_DECIMALS } from "@/lib/arc";

export type PaymentStatus =
  | "unpaid"
  | "processing"
  | "paid"
  | "expired"
  | "failed"
  | "cancelled";
export type PaymentMethod = "arc-direct" | "app-kit-bridge" | "unified-balance" | "demo";
export type SettlementMode = "invoice" | "profile";

export type PaymentLink = {
  id: string;
  slug: string;
  creatorWallet: Address;
  recipientWallet: Address;
  amountUSDC: string;
  memo: string;
  status: PaymentStatus;
  expiresAt: string | null;
  contractLinkId: `0x${string}`;
  createdAt: string;
  updatedAt: string;
  txHash?: `0x${string}`;
  payerWallet?: Address;
  paymentMethod?: PaymentMethod;
  sourceChain?: string;
  settlementMode?: SettlementMode;
};

export function amountToUnits(amount: string) {
  return parseUnits(amount || "0", USDC_DECIMALS);
}

export function makeSlug(memo: string, amount: string) {
  const base = memo
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
    .slice(0, 36);
  return `${base || "collect"}-${amount.replace(".", "-")}-${nanoid(6)}`;
}

export function makeContractLinkId(slug: string) {
  return keccak256(stringToBytes(`onelink:${slug}`));
}

export function paymentPath(slug: string) {
  return `/pay/${encodeURIComponent(slug)}`;
}

export function receiptPath(id: string) {
  return `/receipt/${encodeURIComponent(id)}`;
}

const methodLabels: Record<PaymentMethod, string> = {
  "arc-direct": "Direct on Arc",
  "app-kit-bridge": "Bridged · App Kit",
  "unified-balance": "Unified Balance",
  demo: "Demo settlement",
};

export function paymentMethodLabel(method?: PaymentMethod | null) {
  if (!method) return "Pending";
  return methodLabels[method] ?? method;
}
