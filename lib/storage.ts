"use client";

import type { Address } from "viem";
import { createClient } from "@supabase/supabase-js";
import type { PaymentLink, PaymentMethod, PaymentStatus } from "@/lib/payments";

const storageKey = "onelink:payment-links";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase =
  supabaseUrl && supabaseAnonKey ? createClient(supabaseUrl, supabaseAnonKey) : null;

export const HAS_SHARED_STORAGE = Boolean(supabaseUrl && supabaseAnonKey);

function raiseStorageError(operation: string, message: string) {
  throw new Error(`Storage ${operation} failed: ${message}`);
}

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
    const { error } = await supabase.from("payment_links").upsert({
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
      settlement_mode: link.settlementMode ?? "invoice",
      created_at: link.createdAt,
      updated_at: link.updatedAt,
    });
    if (error) raiseStorageError("save", error.message);
  }

  const links = readLocal().filter((item) => item.id !== link.id);
  writeLocal([link, ...links]);
}

export async function saveVerifiedInvoiceLink(link: PaymentLink, txHash: `0x${string}`) {
  if (!HAS_SHARED_STORAGE) {
    return savePaymentLink(link);
  }

  const response = await fetch("/api/payments/create", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ link: { ...link, settlementMode: "invoice" }, txHash }),
  });
  const payload = (await response.json().catch(() => ({}))) as { error?: string };
  if (!response.ok) {
    throw new Error(payload.error || "Arc invoice creation could not be verified by the server.");
  }

  const links = readLocal().filter((item) => item.id !== link.id);
  writeLocal([link, ...links]);
}

export async function getPaymentLinkBySlug(slug: string) {
  if (supabase) {
    const { data, error } = await supabase.from("payment_links").select("*").eq("slug", slug).maybeSingle();
    if (error) raiseStorageError("read", error.message);
    if (data) return fromRow(data);
  }

  return readLocal().find((link) => link.slug === slug) ?? null;
}

export async function getPaymentLinkById(id: string) {
  if (supabase) {
    const { data, error } = await supabase.from("payment_links").select("*").eq("id", id).maybeSingle();
    if (error) raiseStorageError("read", error.message);
    if (data) return fromRow(data);
  }

  return readLocal().find((link) => link.id === id) ?? null;
}

export async function listPaymentLinks(owner?: Address) {
  if (supabase && owner) {
    const { data, error } = await supabase
      .from("payment_links")
      .select("*")
      .eq("creator_wallet", owner)
      .order("created_at", { ascending: false });
    if (error) raiseStorageError("list", error.message);
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

  const updatedAt = new Date().toISOString();
  const next: PaymentLink = {
    ...existing,
    status,
    ...details,
    updatedAt,
  };

  if (supabase) {
    const { error } = await supabase
      .from("payment_links")
      .update({
        status,
        tx_hash: details.txHash ?? existing.txHash ?? null,
        payer_wallet: details.payerWallet ?? existing.payerWallet ?? null,
        payment_method: details.paymentMethod ?? existing.paymentMethod ?? null,
        source_chain: details.sourceChain ?? existing.sourceChain ?? null,
        updated_at: updatedAt,
      })
      .eq("id", id);
    if (error) raiseStorageError("status update", error.message);
  }

  const links = readLocal().filter((item) => item.id !== id);
  writeLocal([next, ...links]);
  return next;
}

export async function confirmPaidSettlement(
  id: string,
  details: {
    txHash: `0x${string}`;
    payerWallet: Address;
    paymentMethod: PaymentMethod;
    sourceChain: string;
  },
) {
  if (!HAS_SHARED_STORAGE) {
    return updatePaymentStatus(id, "paid", details);
  }

  const response = await fetch("/api/payments/reconcile", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ id, ...details }),
  });
  const payload = (await response.json().catch(() => ({}))) as { error?: string };
  if (!response.ok) {
    throw new Error(payload.error || "Arc settlement could not be verified by the server.");
  }

  return getPaymentLinkById(id);
}

export async function confirmCancelledPayment(id: string, txHash?: `0x${string}`) {
  if (!HAS_SHARED_STORAGE) {
    return updatePaymentStatus(id, "cancelled", txHash ? { txHash } : {});
  }
  if (!txHash) {
    throw new Error("A confirmed Arc transaction is required to cancel a shared payment link.");
  }

  const response = await fetch("/api/payments/cancel", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ id, txHash }),
  });
  const payload = (await response.json().catch(() => ({}))) as { error?: string };
  if (!response.ok) {
    throw new Error(payload.error || "Arc cancellation could not be verified by the server.");
  }

  return getPaymentLinkById(id);
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
  settlement_mode?: PaymentLink["settlementMode"] | null;
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
    settlementMode: row.settlement_mode ?? "invoice",
  };
}
