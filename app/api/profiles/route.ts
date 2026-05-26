import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { getAddress, verifyMessage, type Address, type Hex } from "viem";

type ProfileRequest = {
  profile?: {
    handle?: string;
    wallet?: Address;
    displayName?: string;
    createdAt?: string;
    updatedAt?: string;
  };
  signature?: Hex;
};

function normalizeHandle(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9-]/g, "")
    .replace(/-{2,}/g, "-")
    .replace(/(^-|-$)/g, "")
    .slice(0, 32);
}

function claimMessage(handle: string, wallet: Address) {
  return `OneLink profile claim\nHandle: ${handle}\nRecipient: ${wallet}\nNetwork: Arc Testnet`;
}

export async function POST(request: Request) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !serviceRoleKey) {
    return NextResponse.json({ error: "Server profile storage is not configured." }, { status: 503 });
  }

  const body = (await request.json().catch(() => null)) as ProfileRequest | null;
  const handle = normalizeHandle(body?.profile?.handle ?? "");
  if (!handle || !body?.profile?.wallet || !body.signature) {
    return NextResponse.json({ error: "Profile claim is incomplete." }, { status: 400 });
  }

  let wallet: Address;
  try {
    wallet = getAddress(body.profile.wallet);
  } catch {
    return NextResponse.json({ error: "Profile recipient wallet is invalid." }, { status: 400 });
  }

  const valid = await verifyMessage({
    address: wallet,
    message: claimMessage(handle, wallet),
    signature: body.signature,
  });
  if (!valid) {
    return NextResponse.json({ error: "Profile claim signature is invalid." }, { status: 403 });
  }

  const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  const { data: existing } = await supabase
    .from("freelancer_profiles")
    .select("wallet")
    .eq("handle", handle)
    .maybeSingle();
  if (existing && getAddress(existing.wallet) !== wallet) {
    return NextResponse.json({ error: "This handle has already been claimed by another wallet." }, { status: 409 });
  }

  const now = new Date().toISOString();
  const { error } = await supabase.from("freelancer_profiles").upsert({
    handle,
    wallet,
    display_name: body.profile.displayName?.trim() || handle,
    created_at: existing ? body.profile.createdAt || now : now,
    updated_at: now,
  });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ handle, wallet });
}
