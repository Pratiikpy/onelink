import { NextResponse } from "next/server";
import { isHex, type Hex } from "viem";
import type { GatewayBurnIntent } from "@/lib/gateway";
import { GATEWAY_API_BASE_URL } from "@/lib/gateway";
import { clientKey, rateLimit, tooManyRequests } from "@/lib/rate-limit";

type GatewayTransferRequest = {
  burnIntent?: GatewayBurnIntent;
  signature?: Hex;
};

// Arc Testnet CCTP domain. This endpoint only relays bridges INTO Arc, so any
// other destination is rejected before forwarding to Circle.
const ARC_DESTINATION_DOMAIN = 26;

function replacer(_key: string, value: unknown) {
  return typeof value === "bigint" ? value.toString() : value;
}

export async function POST(req: Request) {
  const rl = rateLimit(clientKey(req, "gateway-transfer"), { limit: 15, windowMs: 60_000 });
  if (!rl.ok) return tooManyRequests(rl.retryAfterSec);

  const request = req;
  const body = (await request.json().catch(() => null)) as GatewayTransferRequest | null;
  if (!body?.burnIntent || !body.signature || !isHex(body.signature)) {
    return NextResponse.json({ error: "Gateway transfer request is incomplete." }, { status: 400 });
  }
  if (body.burnIntent.spec?.destinationDomain !== ARC_DESTINATION_DOMAIN) {
    return NextResponse.json({ error: "Gateway transfer request is incomplete." }, { status: 400 });
  }

  let gatewayResponse: Response;
  try {
    gatewayResponse = await fetch(`${GATEWAY_API_BASE_URL}/transfer`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify([{ burnIntent: body.burnIntent, signature: body.signature }], replacer),
    });
  } catch {
    return NextResponse.json({ error: "Gateway is unreachable." }, { status: 502 });
  }

  const payload = await gatewayResponse.json().catch(async () => ({
    error: await gatewayResponse.text(),
  }));

  if (!gatewayResponse.ok) {
    console.error("Circle Gateway transfer failed", {
      status: gatewayResponse.status,
      detail: payload,
    });
    return NextResponse.json(
      { error: "Gateway request failed." },
      { status: gatewayResponse.status },
    );
  }

  return NextResponse.json(payload);
}
