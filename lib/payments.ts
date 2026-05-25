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

export function shortAddress(address?: string | null) {
  if (!address) return "Not connected";
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

export function statusTone(status: PaymentStatus) {
  if (status === "paid") return "text-mint";
  if (status === "processing") return "text-violet";
  if (status === "failed" || status === "expired" || status === "cancelled") return "text-red-300";
  return "text-ash";
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

// Deterministic en-US timestamp so receipts and screenshots look the same in
// every browser, regardless of the visitor's locale.
const dateFormatter = new Intl.DateTimeFormat("en-US", {
  year: "numeric",
  month: "short",
  day: "numeric",
  hour: "numeric",
  minute: "2-digit",
  hour12: true,
});

export function formatTimestamp(input: string | number | Date) {
  try {
    return dateFormatter.format(new Date(input));
  } catch {
    return "—";
  }
}
