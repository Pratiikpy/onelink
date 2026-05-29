"use client";

import { createClient } from "@supabase/supabase-js";
import type { Address } from "viem";

import { ARC_CHAIN_ID } from "@/lib/arc";

export type FreelancerProfile = {
  handle: string;
  wallet: Address;
  displayName: string;
  createdAt: string;
  updatedAt: string;
};

export const PROFILE_STORAGE_KEY = "onelink:freelancer-profiles";
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase =
  supabaseUrl && supabaseAnonKey ? createClient(supabaseUrl, supabaseAnonKey) : null;

export function normalizeHandle(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9-]/g, "")
    .replace(/-{2,}/g, "-")
    .replace(/(^-|-$)/g, "")
    .slice(0, 32);
}

// Handles that collide with a static app/ route segment (the router would shadow
// the profile, leaving it permanently unreachable) plus common reserved words.
// Claiming one is rejected on both the client and the server.
export const RESERVED_HANDLES = new Set<string>([
  "create", "dashboard", "pay", "receipt", "settings", "pitch", "whitepaper",
  "mobile", "brand", "how-it-works", "security", "privacy", "terms", "api",
  "admin", "login", "logout", "signin", "signup", "about", "home", "index",
  "app", "www", "docs", "support", "help", "status", "profile", "profiles",
  "link", "links", "new", "edit", "sitemap", "robots", "manifest", "favicon",
  "icon", "apple-icon", "opengraph-image", "account", "billing", "onelink",
]);

export function isReservedHandle(value: string) {
  return RESERVED_HANDLES.has(normalizeHandle(value));
}

// How long a signed profile claim stays valid. The server rejects claims older
// than this (and ones issued in the future beyond a small clock-skew window).
// This — combined with the EIP-712 domain binding (name/version/chainId) — is
// what bounds signature replay; see the note in the API route.
export const PROFILE_CLAIM_TTL_SECONDS = 600;

export type ProfileClaim = {
  handle: string;
  owner: `0x${string}`;
  issuedAt: number;
  expiresAt: number;
};

// EIP-712 typed-data builder for a profile-handle claim. Both the client signer
// and the server verifier MUST build the struct from this single function so
// the digest matches exactly. uint256 fields are bigint for viem.
export function buildProfileClaimTypedData(claim: ProfileClaim) {
  return {
    domain: { name: "OneLink Collect", version: "1", chainId: ARC_CHAIN_ID },
    types: {
      ProfileClaim: [
        { name: "handle", type: "string" },
        { name: "owner", type: "address" },
        { name: "issuedAt", type: "uint256" },
        { name: "expiresAt", type: "uint256" },
      ],
    },
    primaryType: "ProfileClaim" as const,
    message: {
      handle: claim.handle,
      owner: claim.owner,
      issuedAt: BigInt(claim.issuedAt),
      expiresAt: BigInt(claim.expiresAt),
    },
  };
}

function readLocal() {
  if (typeof window === "undefined") return [] as FreelancerProfile[];
  try {
    return JSON.parse(window.localStorage.getItem(PROFILE_STORAGE_KEY) || "[]") as FreelancerProfile[];
  } catch {
    return [] as FreelancerProfile[];
  }
}

export async function saveFreelancerProfile(
  profile: FreelancerProfile,
  signature?: `0x${string}`,
  claim?: ProfileClaim,
) {
  if (isReservedHandle(profile.handle)) {
    throw new Error("That handle is reserved — please choose another.");
  }
  if (supabase) {
    if (!signature || !claim) {
      throw new Error("Sign the wallet ownership message to claim a public handle.");
    }
    const response = await fetch("/api/profiles", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ profile, claim, signature }),
    });
    const payload = (await response.json().catch(() => ({}))) as { error?: string };
    if (!response.ok) throw new Error(payload.error || "Profile claim failed.");
  }

  const profiles = readLocal().filter((existing) => existing.handle !== profile.handle);
  window.localStorage.setItem(PROFILE_STORAGE_KEY, JSON.stringify([profile, ...profiles]));
}

export async function getFreelancerProfile(handle: string) {
  const normalized = normalizeHandle(handle);
  if (!normalized) return null;

  if (supabase) {
    const { data, error } = await supabase
      .from("freelancer_profiles")
      .select("*")
      .eq("handle", normalized)
      .maybeSingle();
    if (error) throw new Error(`Profile read failed: ${error.message}`);
    if (data) {
      return {
        handle: data.handle,
        wallet: data.wallet as Address,
        displayName: data.display_name,
        createdAt: data.created_at,
        updatedAt: data.updated_at,
      } satisfies FreelancerProfile;
    }
  }

  return readLocal().find((profile) => profile.handle === normalized) ?? null;
}
