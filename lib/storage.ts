"use client";

import type { Address } from "viem";
import { createClient } from "@supabase/supabase-js";
import type { PaymentLink, PaymentMethod, PaymentStatus } from "@/lib/payments";

const storageKey = "onelink:payment-links";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase =
  supabaseUrl && supabaseAnonKey ? createClient(supabaseUrl, supabaseAnonKey) : null;

function readLocal(): PaymentLink[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(window.localStorage.getItem(storageKey) || "[]") as PaymentLink[];
  } catch {
    return [];
  }
}

function writeLocal(links: PaymentLink[]) {
  window.localStorage.setItem(storageKey, JSON.stringify(links));
}

export async function savePaymentLink(link: PaymentLink) {
  if (supabase) {
    await supabase.from("payment_links").upsert({
      id: link.id,
      slug: link.slug,
      creator_wallet: link.creatorWallet,
      recipient_wallet: link.recipientWallet,
      amount_usdc: link.amountUSDC,
      memo: link.memo,
      status: link.status,
      expires_at: link.expiresAt,
      contract_link_id: link.contractLinkId,
      tx_hash: link.txHash ?? null,
      payer_wallet: link.payerWallet ?? null,
      payment_method: link.paymentMethod ?? null,
      source_chain: link.sourceChain ?? null,
      created_at: link.createdAt,
      updated_at: link.updatedAt,
    });
  }

  const links = readLocal().filter((item) => item.id !== link.id);
  writeLocal([link, ...links]);
}

export async function getPaymentLinkBySlug(slug: string) {
  if (supabase) {
    const { data } = await supabase.from("payment_links").select("*").eq("slug", slug).maybeSingle();
    if (data) return fromRow(data);
  }

  return readLocal().find((link) => link.slug === slug) ?? null;
}

export async function getPaymentLinkById(id: string) {
  if (supabase) {
    const { data } = await supabase.from("payment_links").select("*").eq("id", id).maybeSingle();
    if (data) return fromRow(data);
  }

  return readLocal().find((link) => link.id === id) ?? null;
}

export async function listPaymentLinks(owner?: Address) {
  if (supabase && owner) {
    const { data } = await supabase
      .from("payment_links")
      .select("*")
      .eq("creator_wallet", owner)
      .order("created_at", { ascending: false });
    if (data) return data.map(fromRow);
  }

  const links = readLocal();
  return owner
    ? links.filter((link) => link.creatorWallet.toLowerCase() === owner.toLowerCase())
    : links;
}

export async function updatePaymentStatus(
  id: string,
  status: PaymentStatus,
  details: {
    txHash?: `0x${string}`;
    payerWallet?: Address;
    paymentMethod?: PaymentMethod;
    sourceChain?: string;
  } = {},
) {
  const existing = await getPaymentLinkById(id);
  if (!existing) return null;

  const next: PaymentLink = {
    ...existing,
    status,
    ...details,
    updatedAt: new Date().toISOString(),
  };
  await savePaymentLink(next);
  return next;
}

type PaymentLinkRow = {
  id: string;
  slug: string;
  creator_wallet: Address;
  recipient_wallet: Address;
  amount_usdc: string;
  memo: string;
  status: PaymentLink["status"];
  expires_at: string | null;
  contract_link_id: `0x${string}`;
  created_at: string;
  updated_at: string;
  tx_hash?: `0x${string}` | null;
  payer_wallet?: Address | null;
  payment_method?: PaymentLink["paymentMethod"] | null;
  source_chain?: string | null;
};

function fromRow(row: PaymentLinkRow): PaymentLink {
  return {
    id: row.id,
    slug: row.slug,
    creatorWallet: row.creator_wallet,
    recipientWallet: row.recipient_wallet,
    amountUSDC: row.amount_usdc,
    memo: row.memo,
    status: row.status,
    expiresAt: row.expires_at,
    contractLinkId: row.contract_link_id,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    txHash: row.tx_hash ?? undefined,
    payerWallet: row.payer_wallet ?? undefined,
    paymentMethod: row.payment_method ?? undefined,
    sourceChain: row.source_chain ?? undefined,
  };
}
