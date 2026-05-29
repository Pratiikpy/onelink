import { NextResponse } from "next/server";
import { getAddress, type Address } from "viem";
import { GATEWAY_API_BASE_URL, GATEWAY_EVM_TESTNET_SOURCES } from "@/lib/gateway";
import { clientKey, rateLimit, tooManyRequests } from "@/lib/rate-limit";

type BalanceRequest = {
  depositor?: Address;
};

export async function POST(req: Request) {
  const rl = rateLimit(clientKey(req, "gateway-balances"), { limit: 60, windowMs: 60_000 });
  if (!rl.ok) return tooManyRequests(rl.retryAfterSec);

  const request = req;
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

  let gatewayResponse: Response;
  try {
    gatewayResponse = await fetch(`${GATEWAY_API_BASE_URL}/balances`, {
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
  } catch {
    return NextResponse.json({ error: "Gateway is unreachable." }, { status: 502 });
  }

  const payload = await gatewayResponse.json().catch(async () => ({
    error: await gatewayResponse.text(),
  }));

  if (!gatewayResponse.ok) {
    console.error("Circle Gateway balance lookup failed", {
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
