import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { createPublicClient, decodeEventLog, getAddress, http, isAddressEqual, type Hex } from "viem";
import { ARC_CHAIN, ARC_RPC_URL } from "@/lib/arc";
import { HAS_CONTRACT, ONELINK_CONTRACT_ADDRESS, oneLinkCollectAbi } from "@/lib/contracts";
import { clientKey, rateLimit, tooManyRequests } from "@/lib/rate-limit";

type CancelRequest = {
  id?: string;
  txHash?: Hex;
};

export async function POST(req: Request) {
  const rl = rateLimit(clientKey(req, "payments-cancel"), { limit: 20, windowMs: 60_000 });
  if (!rl.ok) return tooManyRequests(rl.retryAfterSec);

  const request = req;
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !serviceRoleKey || !HAS_CONTRACT) {
    return NextResponse.json({ error: "Server cancellation verification is not configured." }, { status: 503 });
  }

  const body = (await request.json().catch(() => null)) as CancelRequest | null;
  if (!body?.id || !body.txHash) {
    return NextResponse.json({ error: "Cancellation request is incomplete." }, { status: 400 });
  }

  const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  const { data: link, error: loadError } = await supabase
    .from("payment_links")
    .select("id, contract_link_id, creator_wallet, status, settlement_mode")
    .eq("id", body.id)
    .maybeSingle();
  if (loadError || !link) {
    return NextResponse.json({ error: loadError?.message || "Payment link not found." }, { status: 404 });
  }
  if (link.status === "cancelled") {
    return NextResponse.json({ status: "cancelled" });
  }
  if (link.status === "paid") {
    return NextResponse.json({ error: "A paid link cannot be cancelled." }, { status: 409 });
  }
  if (link.settlement_mode !== "invoice") {
    return NextResponse.json({ error: "Permanent profile payments do not use cancellable invoices." }, { status: 409 });
  }

  const client = createPublicClient({ chain: ARC_CHAIN, transport: http(ARC_RPC_URL) });
  let receipt;
  try {
    receipt = await client.getTransactionReceipt({ hash: body.txHash });
  } catch {
    return NextResponse.json({ error: "Arc cancellation transaction is not confirmed." }, { status: 409 });
  }
  if (receipt.status !== "success") {
    return NextResponse.json({ error: "Arc cancellation transaction reverted." }, { status: 409 });
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
    .find((entry) => entry?.eventName === "PaymentLinkCancelled");
  if (!event || event.eventName !== "PaymentLinkCancelled") {
    return NextResponse.json({ error: "Transaction does not contain a OneLink cancellation event." }, { status: 409 });
  }

  const creator = getAddress(link.creator_wallet);
  if (
    event.args.linkId.toLowerCase() !== String(link.contract_link_id).toLowerCase() ||
    !isAddressEqual(event.args.creator, creator)
  ) {
    return NextResponse.json({ error: "Arc cancellation event does not match this payment link." }, { status: 409 });
  }

  const { error: updateError } = await supabase
    .from("payment_links")
    .update({
      status: "cancelled",
      tx_hash: body.txHash,
      updated_at: new Date().toISOString(),
    })
    .eq("id", body.id);
  if (updateError) {
    return NextResponse.json({ error: updateError.message }, { status: 500 });
  }

  return NextResponse.json({ status: "cancelled", txHash: body.txHash });
}
