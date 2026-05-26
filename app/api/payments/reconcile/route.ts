import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { createPublicClient, decodeEventLog, getAddress, http, isAddressEqual, type Address, type Hex } from "viem";
import { ARC_CHAIN, ARC_RPC_URL } from "@/lib/arc";
import { HAS_CONTRACT, ONELINK_CONTRACT_ADDRESS, oneLinkCollectAbi } from "@/lib/contracts";
import { amountToUnits, type PaymentMethod } from "@/lib/payments";

type SettlementRequest = {
  id?: string;
  txHash?: Hex;
  payerWallet?: Address;
  paymentMethod?: PaymentMethod;
  sourceChain?: string;
};

export async function POST(request: Request) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !serviceRoleKey || !HAS_CONTRACT) {
    return NextResponse.json(
      { error: "Server settlement verification is not configured." },
      { status: 503 },
    );
  }

  const body = (await request.json().catch(() => null)) as SettlementRequest | null;
  if (!body?.id || !body.txHash || !body.payerWallet || !body.paymentMethod || !body.sourceChain) {
    return NextResponse.json({ error: "Settlement request is incomplete." }, { status: 400 });
  }

  let payerWallet: Address;
  try {
    payerWallet = getAddress(body.payerWallet);
  } catch {
    return NextResponse.json({ error: "Payer wallet is invalid." }, { status: 400 });
  }

  const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  const { data: link, error: loadError } = await supabase
    .from("payment_links")
    .select("id, contract_link_id, recipient_wallet, amount_usdc, status")
    .eq("id", body.id)
    .maybeSingle();
  if (loadError || !link) {
    return NextResponse.json({ error: loadError?.message || "Payment link not found." }, { status: 404 });
  }
  if (link.status === "paid") {
    return NextResponse.json({ status: "paid" });
  }

  const client = createPublicClient({ chain: ARC_CHAIN, transport: http(ARC_RPC_URL) });
  let receipt;
  try {
    receipt = await client.getTransactionReceipt({ hash: body.txHash });
  } catch {
    return NextResponse.json({ error: "Arc settlement transaction is not confirmed." }, { status: 409 });
  }
  if (receipt.status !== "success") {
    return NextResponse.json({ error: "Arc settlement transaction reverted." }, { status: 409 });
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
    .find((entry) => entry?.eventName === "PaymentCompleted");
  if (!event || event.eventName !== "PaymentCompleted") {
    return NextResponse.json({ error: "Transaction does not contain a OneLink settlement event." }, { status: 409 });
  }

  const recipient = getAddress(link.recipient_wallet);
  if (
    event.args.linkId.toLowerCase() !== String(link.contract_link_id).toLowerCase() ||
    !isAddressEqual(event.args.payer, payerWallet) ||
    !isAddressEqual(event.args.recipient, recipient) ||
    event.args.grossAmount !== amountToUnits(link.amount_usdc)
  ) {
    return NextResponse.json({ error: "Arc settlement event does not match this payment link." }, { status: 409 });
  }

  const { error: updateError } = await supabase
    .from("payment_links")
    .update({
      status: "paid",
      tx_hash: body.txHash,
      payer_wallet: payerWallet,
      payment_method: body.paymentMethod,
      source_chain: body.sourceChain,
      updated_at: new Date().toISOString(),
    })
    .eq("id", body.id);
  if (updateError) {
    return NextResponse.json({ error: updateError.message }, { status: 500 });
  }

  return NextResponse.json({ status: "paid", txHash: body.txHash });
}
