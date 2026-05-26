import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { createPublicClient, decodeEventLog, getAddress, http, isAddressEqual, type Address, type Hex } from "viem";
import { ARC_CHAIN, ARC_RPC_URL } from "@/lib/arc";
import { HAS_CONTRACT, ONELINK_CONTRACT_ADDRESS, oneLinkCollectAbi } from "@/lib/contracts";
import { amountToUnits, makeContractLinkId } from "@/lib/payments";

type InvoiceInput = {
  id?: string;
  slug?: string;
  creatorWallet?: Address;
  recipientWallet?: Address;
  amountUSDC?: string;
  memo?: string;
  status?: string;
  expiresAt?: string | null;
  contractLinkId?: Hex;
  settlementMode?: string;
  createdAt?: string;
  updatedAt?: string;
};

type CreateRequest = {
  link?: InvoiceInput;
  txHash?: Hex;
};

export async function POST(request: Request) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !serviceRoleKey || !HAS_CONTRACT) {
    return NextResponse.json({ error: "Server invoice verification is not configured." }, { status: 503 });
  }

  const body = (await request.json().catch(() => null)) as CreateRequest | null;
  const link = body?.link;
  if (
    !body?.txHash ||
    !link?.id ||
    !link.slug ||
    !link.creatorWallet ||
    !link.recipientWallet ||
    !link.amountUSDC ||
    !link.memo ||
    !link.contractLinkId ||
    !link.createdAt ||
    !link.updatedAt ||
    link.status !== "unpaid" ||
    (link.settlementMode ?? "invoice") !== "invoice"
  ) {
    return NextResponse.json({ error: "Verified invoice request is incomplete." }, { status: 400 });
  }

  let creator: Address;
  let recipient: Address;
  try {
    creator = getAddress(link.creatorWallet);
    recipient = getAddress(link.recipientWallet);
  } catch {
    return NextResponse.json({ error: "Invoice wallet address is invalid." }, { status: 400 });
  }

  const expiresAt = link.expiresAt ? new Date(link.expiresAt) : null;
  if (expiresAt && !Number.isFinite(expiresAt.getTime())) {
    return NextResponse.json({ error: "Invoice expiry is invalid." }, { status: 400 });
  }
  const expiresAtSeconds = expiresAt ? BigInt(Math.floor(expiresAt.getTime() / 1000)) : BigInt(0);
  if (makeContractLinkId(link.slug).toLowerCase() !== link.contractLinkId.toLowerCase()) {
    return NextResponse.json({ error: "Invoice URL does not match its Arc link identifier." }, { status: 409 });
  }

  const client = createPublicClient({ chain: ARC_CHAIN, transport: http(ARC_RPC_URL) });
  let receipt;
  try {
    receipt = await client.getTransactionReceipt({ hash: body.txHash });
  } catch {
    return NextResponse.json({ error: "Arc invoice creation transaction is not confirmed." }, { status: 409 });
  }
  if (receipt.status !== "success") {
    return NextResponse.json({ error: "Arc invoice creation transaction reverted." }, { status: 409 });
  }

  const event = receipt.logs
    .filter((log) => isAddressEqual(log.address, ONELINK_CONTRACT_ADDRESS))
    .map((log) => {
      try {
        return decodeEventLog({ abi: oneLinkCollectAbi, data: log.data, topics: log.topics });
      } catch {
        return null;
      }
    })
    .find((entry) => entry?.eventName === "PaymentLinkCreated");
  if (!event || event.eventName !== "PaymentLinkCreated") {
    return NextResponse.json({ error: "Transaction does not contain a OneLink invoice creation event." }, { status: 409 });
  }

  if (
    event.args.linkId.toLowerCase() !== link.contractLinkId.toLowerCase() ||
    !isAddressEqual(event.args.creator, creator) ||
    !isAddressEqual(event.args.recipient, recipient) ||
    event.args.amount !== amountToUnits(link.amountUSDC) ||
    event.args.expiresAt !== expiresAtSeconds
  ) {
    return NextResponse.json({ error: "Arc creation event does not match this invoice." }, { status: 409 });
  }

  const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  const { error } = await supabase.from("payment_links").insert({
    id: link.id,
    slug: link.slug,
    creator_wallet: creator,
    recipient_wallet: recipient,
    amount_usdc: link.amountUSDC,
    memo: link.memo,
    status: "unpaid",
    expires_at: link.expiresAt ?? null,
    contract_link_id: link.contractLinkId,
    settlement_mode: "invoice",
    created_at: link.createdAt,
    updated_at: link.updatedAt,
  });
  if (error) {
    const { data: existing } = await supabase
      .from("payment_links")
      .select("id, slug, contract_link_id, creator_wallet, recipient_wallet, amount_usdc")
      .eq("contract_link_id", link.contractLinkId)
      .maybeSingle();
    if (
      existing?.id === link.id &&
      existing.slug === link.slug &&
      existing.contract_link_id.toLowerCase() === link.contractLinkId.toLowerCase() &&
      isAddressEqual(existing.creator_wallet, creator) &&
      isAddressEqual(existing.recipient_wallet, recipient) &&
      existing.amount_usdc === link.amountUSDC
    ) {
      return NextResponse.json({ status: "unpaid", id: link.id });
    }
    return NextResponse.json({ error: error.message }, { status: 409 });
  }

  return NextResponse.json({ status: "unpaid", id: link.id });
}
