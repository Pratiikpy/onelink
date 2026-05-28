import { NextResponse } from "next/server";
import { isHex, type Hex } from "viem";
import type { GatewayBurnIntent } from "@/lib/gateway";
import { GATEWAY_API_BASE_URL } from "@/lib/gateway";

type GatewayTransferRequest = {
  burnIntent?: GatewayBurnIntent;
  signature?: Hex;
};

function replacer(_key: string, value: unknown) {
  return typeof value === "bigint" ? value.toString() : value;
}

export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as GatewayTransferRequest | null;
  if (!body?.burnIntent || !body.signature || !isHex(body.signature)) {
    return NextResponse.json({ error: "Gateway transfer request is incomplete." }, { status: 400 });
  }

  const gatewayResponse = await fetch(`${GATEWAY_API_BASE_URL}/transfer`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify([{ burnIntent: body.burnIntent, signature: body.signature }], replacer),
  });

  const payload = await gatewayResponse.json().catch(async () => ({
    error: await gatewayResponse.text(),
  }));

  if (!gatewayResponse.ok) {
    return NextResponse.json(
      { error: "Circle Gateway transfer failed.", details: payload },
      { status: gatewayResponse.status },
    );
  }

  return NextResponse.json(payload);
}
