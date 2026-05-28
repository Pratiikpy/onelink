import { NextResponse } from "next/server";
import { getAddress, type Address } from "viem";
import { GATEWAY_API_BASE_URL, GATEWAY_EVM_TESTNET_SOURCES } from "@/lib/gateway";

type BalanceRequest = {
  depositor?: Address;
};

export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as BalanceRequest | null;
  if (!body?.depositor) {
    return NextResponse.json({ error: "Gateway depositor is required." }, { status: 400 });
  }

  let depositor: Address;
  try {
    depositor = getAddress(body.depositor);
  } catch {
    return NextResponse.json({ error: "Gateway depositor address is invalid." }, { status: 400 });
  }

  const gatewayResponse = await fetch(`${GATEWAY_API_BASE_URL}/balances`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      token: "USDC",
      sources: GATEWAY_EVM_TESTNET_SOURCES.map((source) => ({
        domain: source.domain,
        depositor,
      })),
    }),
  });

  const payload = await gatewayResponse.json().catch(async () => ({
    error: await gatewayResponse.text(),
  }));

  if (!gatewayResponse.ok) {
    return NextResponse.json(
      { error: "Circle Gateway balance lookup failed.", details: payload },
      { status: gatewayResponse.status },
    );
  }

  return NextResponse.json(payload);
}
