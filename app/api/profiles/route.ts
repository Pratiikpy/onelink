import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { getAddress, verifyTypedData, type Address, type Hex } from "viem";

import { rateLimit, clientKey, tooManyRequests } from "@/lib/rate-limit";
import {
  buildProfileClaimTypedData,
  normalizeHandle,
  PROFILE_CLAIM_TTL_SECONDS,
  type ProfileClaim,
} from "@/lib/profiles";

type ProfileRequest = {
  profile?: {
    handle?: string;
    wallet?: Address;
    displayName?: string;
    createdAt?: string;
    updatedAt?: string;
  };
  claim?: {
    handle?: string;
    owner?: string;
    issuedAt?: number | string;
    expiresAt?: number | string;
  };
  signature?: Hex;
};

const UNAUTHORIZED = "Profile claim could not be verified.";

export async function POST(request: Request) {
  const rl = rateLimit(clientKey(request, "profiles"), { limit: 10, windowMs: 60_000 });
  if (!rl.ok) return tooManyRequests(rl.retryAfterSec);

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !serviceRoleKey) {
    return NextResponse.json({ error: "Server profile storage is not configured." }, { status: 503 });
  }

  const body = (await request.json().catch(() => null)) as ProfileRequest | null;
  const handle = normalizeHandle(body?.profile?.handle ?? "");
  if (!handle || !body?.profile?.wallet || !body.signature || !body.claim) {
    return NextResponse.json({ error: "Profile claim is incomplete." }, { status: 400 });
  }

  // The wallet that will receive funds — the only identity allowed to claim the
  // handle. Everything verified below must bind back to this address.
  let wallet: Address;
  try {
    wallet = getAddress(body.profile.wallet);
  } catch {
    return NextResponse.json({ error: "Profile recipient wallet is invalid." }, { status: 400 });
  }

  // Reconstruct the claim from the request, coercing the timestamp fields to
  // numbers (they may arrive as JSON numbers or strings).
  let owner: Address;
  try {
    owner = getAddress(String(body.claim.owner ?? ""));
  } catch {
    return NextResponse.json({ error: UNAUTHORIZED }, { status: 401 });
  }
  const issuedAt = Number(body.claim.issuedAt);
  const expiresAt = Number(body.claim.expiresAt);
  if (!Number.isFinite(issuedAt) || !Number.isFinite(expiresAt)) {
    return NextResponse.json({ error: UNAUTHORIZED }, { status: 401 });
  }
  const claim: ProfileClaim = {
    handle: String(body.claim.handle ?? ""),
    owner,
    issuedAt,
    expiresAt,
  };

  const now = Math.floor(Date.now() / 1000);
  // Reject expired claims, claims minted in the future (clock skew > 60s), and
  // claims that are simply too old. This — plus the chainId/domain binding in
  // the typed data — is what keeps a captured signature from being replayed.
  if (now > claim.expiresAt) {
    return NextResponse.json({ error: UNAUTHORIZED }, { status: 401 });
  }
  if (claim.issuedAt > now + 60 || now - claim.issuedAt > PROFILE_CLAIM_TTL_SECONDS) {
    return NextResponse.json({ error: UNAUTHORIZED }, { status: 401 });
  }
  // The signed handle must match the profile handle, and the signer (claim
  // owner) must be the recipient wallet that receives funds.
  if (normalizeHandle(claim.handle) !== handle) {
    return NextResponse.json({ error: UNAUTHORIZED }, { status: 401 });
  }
  if (claim.owner.toLowerCase() !== wallet.toLowerCase()) {
    return NextResponse.json({ error: UNAUTHORIZED }, { status: 401 });
  }

  let valid = false;
  try {
    valid = await verifyTypedData({
      address: claim.owner,
      ...buildProfileClaimTypedData(claim),
      signature: body.signature,
    });
  } catch {
    valid = false;
  }
  if (!valid) {
    return NextResponse.json({ error: UNAUTHORIZED }, { status: 401 });
  }

  const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  // Read the existing row up front: it gates handle ownership AND supplies the
  // authoritative created_at. We never trust a client-supplied created_at.
  const { data: existing } = await supabase
    .from("freelancer_profiles")
    .select("wallet, created_at")
    .eq("handle", handle)
    .maybeSingle();
  if (existing && getAddress(existing.wallet) !== wallet) {
    return NextResponse.json({ error: "This handle has already been claimed by another wallet." }, { status: 409 });
  }

  const nowIso = new Date().toISOString();
  const { error } = await supabase.from("freelancer_profiles").upsert({
    handle,
    wallet,
    display_name: body.profile.displayName?.trim() || handle,
    // Preserve the original creation timestamp on update; only seed it on insert.
    created_at: existing?.created_at ?? nowIso,
    updated_at: nowIso,
  });
  if (error) {
    return NextResponse.json({ error: "Could not save profile." }, { status: 500 });
  }

  return NextResponse.json({ handle, wallet });
}
