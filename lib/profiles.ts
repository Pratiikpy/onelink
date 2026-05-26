"use client";

import { createClient } from "@supabase/supabase-js";
import type { Address } from "viem";

export type FreelancerProfile = {
  handle: string;
  wallet: Address;
  displayName: string;
  createdAt: string;
  updatedAt: string;
};

const profileStorageKey = "onelink:freelancer-profiles";
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

export function profileClaimMessage(handle: string, wallet: Address) {
  return `OneLink profile claim\nHandle: ${normalizeHandle(handle)}\nRecipient: ${wallet}\nNetwork: Arc Testnet`;
}

function readLocal() {
  if (typeof window === "undefined") return [] as FreelancerProfile[];
  try {
    return JSON.parse(window.localStorage.getItem(profileStorageKey) || "[]") as FreelancerProfile[];
  } catch {
    return [] as FreelancerProfile[];
  }
}

export async function saveFreelancerProfile(profile: FreelancerProfile, signature?: `0x${string}`) {
  if (supabase) {
    if (!signature) throw new Error("Sign the wallet ownership message to claim a public handle.");
    const response = await fetch("/api/profiles", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ profile, signature }),
    });
    const payload = (await response.json().catch(() => ({}))) as { error?: string };
    if (!response.ok) throw new Error(payload.error || "Profile claim failed.");
  }

  const profiles = readLocal().filter((existing) => existing.handle !== profile.handle);
  window.localStorage.setItem(profileStorageKey, JSON.stringify([profile, ...profiles]));
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
