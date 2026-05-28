import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { chromium } from "@playwright/test";
import { createClient } from "@supabase/supabase-js";
import { keccak256, stringToHex } from "viem";

function loadEnv(path = ".env.local") {
  try {
    for (const line of readFileSync(path, "utf8").split(/\r?\n/)) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) continue;
      const eq = trimmed.indexOf("=");
      if (eq === -1) continue;
      const key = trimmed.slice(0, eq).trim();
      const value = trimmed.slice(eq + 1).trim();
      if (!process.env[key]) process.env[key] = value;
    }
  } catch {
    // CI may provide env directly.
  }
}

loadEnv();

const LIVE_URL =
  process.env.PLAYWRIGHT_BASE_URL && !process.env.PLAYWRIGHT_BASE_URL.includes("localhost")
    ? process.env.PLAYWRIGHT_BASE_URL
    : "https://onelink-mauve-nu.vercel.app";
const OUT_DIR = resolve("docs", "test-results", "qa-live-failure-states");

function required(name) {
  const value = process.env[name];
  if (!value) throw new Error(`${name} is required`);
  return value;
}

async function saveUnpaid(supabase, slug, amountUSDC, expiresAt = null) {
  const id = crypto.randomUUID();
  const creatorWallet = required("FEE_RECIPIENT");
  const timestamp = new Date().toISOString();
  const { error } = await supabase.from("payment_links").insert({
    id,
    slug,
    creator_wallet: creatorWallet,
    recipient_wallet: creatorWallet,
    amount_usdc: amountUSDC,
    memo: `Failure QA ${slug}`,
    status: "unpaid",
    expires_at: expiresAt,
    contract_link_id: keccak256(stringToHex(`failure-qa:${slug}:${id}`)),
    settlement_mode: "invoice",
    created_at: timestamp,
    updated_at: timestamp,
  });
  if (error) throw new Error(`Could not create ${slug}: ${error.message}`);
  return { id, slug };
}

async function injectRejectedWallet(context, address) {
  await context.addInitScript(({ connectedAddress }) => {
    const listeners = new Map();
    function emit(event, value) {
      for (const listener of listeners.get(event) || []) listener(value);
    }
    const provider = {
      isMetaMask: true,
      request: async ({ method, params = [] }) => {
        if (method === "eth_accounts" || method === "eth_requestAccounts") return [connectedAddress];
        if (method === "eth_chainId") return "0x4cef52";
        if (method === "wallet_switchEthereumChain") {
          emit("chainChanged", params[0].chainId);
          return null;
        }
        if (method === "wallet_addEthereumChain") return null;
        if (method === "eth_sendTransaction") throw new Error("User rejected the wallet request.");
        throw new Error(`Unsupported QA wallet RPC method: ${method}`);
      },
      on(event, listener) {
        const entries = listeners.get(event) || [];
        entries.push(listener);
        listeners.set(event, entries);
      },
      removeListener(event, listener) {
        listeners.set(event, (listeners.get(event) || []).filter((entry) => entry !== listener));
      },
    };
    const detail = {
      info: {
        uuid: "350670db-19fa-4704-a166-e52e178b59d4",
        name: "MetaMask",
        icon: "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg'/>",
        rdns: "io.metamask",
      },
      provider,
    };
    Object.defineProperty(window, "ethereum", { value: provider, configurable: false });
    window.addEventListener("eip6963:requestProvider", () => {
      window.dispatchEvent(new CustomEvent("eip6963:announceProvider", { detail }));
    });
    window.dispatchEvent(new CustomEvent("eip6963:announceProvider", { detail }));
  }, { connectedAddress: address });
}

async function assertText(page, pattern, label) {
  const text = await page.locator("body").innerText({ timeout: 60_000 });
  if (!pattern.test(text)) throw new Error(`${label} did not contain ${pattern}: ${text.slice(0, 600)}`);
}

async function main() {
  mkdirSync(OUT_DIR, { recursive: true });
  const supabase = createClient(required("NEXT_PUBLIC_SUPABASE_URL"), required("NEXT_PUBLIC_SUPABASE_ANON_KEY"), {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  const supabaseAdmin = createClient(required("NEXT_PUBLIC_SUPABASE_URL"), required("SUPABASE_SERVICE_ROLE_KEY"), {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  const payerAddress = required("QA_PAYER_ADDRESS");
  const stamp = new Date().toISOString().replace(/[-:.TZ]/g, "").slice(0, 14);
  const expired = await saveUnpaid(
    supabaseAdmin,
    `qa-expired-${stamp}`,
    "0.01",
    new Date(Date.now() - 60_000).toISOString(),
  );
  const insufficient = await saveUnpaid(supabaseAdmin, `qa-insufficient-${stamp}`, "999999.00");
  const rejected = await saveUnpaid(supabaseAdmin, `qa-rejected-${stamp}`, "0.01");
  const missingSlug = `qa-missing-${stamp}`;

  const browser = await chromium.launch({ headless: true });
  const rows = [];
  const context = await browser.newContext({
    viewport: { width: 390, height: 844 },
    recordVideo: { dir: resolve(OUT_DIR, "videos"), size: { width: 390, height: 844 } },
  });
  await injectRejectedWallet(context, payerAddress);
  const page = await context.newPage();
  try {
    await page.goto(`${LIVE_URL}/pay/${missingSlug}`, { waitUntil: "networkidle", timeout: 60_000 });
    await assertText(page, /Link not found/i, "missing link");
    await page.screenshot({ path: resolve(OUT_DIR, "missing-link.png"), fullPage: true });
    rows.push(["Missing link", "green", "Rendered not-found state"]);

    await page.goto(`${LIVE_URL}/pay/${expired.slug}`, { waitUntil: "networkidle", timeout: 60_000 });
    await assertText(page, /Expired|Link expired/i, "expired link");
    await page.screenshot({ path: resolve(OUT_DIR, "expired-link.png"), fullPage: true });
    rows.push(["Expired link", "green", "Rendered expired terminal state"]);

    await page.goto(`${LIVE_URL}/pay/${insufficient.slug}`, { waitUntil: "networkidle", timeout: 60_000 });
    await assertText(page, /Need .* more Arc USDC/i, "insufficient funds");
    const disabled = await page.getByRole("button", { name: /Pay.*on Arc/i }).isDisabled();
    if (!disabled) throw new Error("Insufficient-balance payment button was not disabled.");
    await page.screenshot({ path: resolve(OUT_DIR, "insufficient-funds.png"), fullPage: true });
    rows.push(["Insufficient funds", "green", "Balance warning rendered and payment disabled"]);

    await page.goto(`${LIVE_URL}/pay/${rejected.slug}`, { waitUntil: "networkidle", timeout: 60_000 });
    await page.getByRole("button", { name: /Pay.*on Arc/i }).click();
    await page
      .getByText(/Payment failed|User rejected|Wallet request was rejected|rejected/i)
      .first()
      .waitFor({ timeout: 60_000 });
    await assertText(
      page,
      /Payment failed|User rejected|Wallet request was rejected|rejected/i,
      "rejected action",
    );
    await page.screenshot({ path: resolve(OUT_DIR, "rejected-wallet-action.png"), fullPage: true });

    // The catch handler does an async updatePaymentStatus("failed") to Supabase
    // BEFORE setError() renders the user-visible message. Allow a short window
    // for write propagation across Supabase replicas before reading status.
    let rejectedRow = null;
    let rejectedError = null;
    for (let attempt = 0; attempt < 8; attempt++) {
      ({ data: rejectedRow, error: rejectedError } = await supabase
        .from("payment_links")
        .select("status")
        .eq("id", rejected.id)
        .single());
      if (rejectedRow?.status === "failed") break;
      await new Promise((r) => setTimeout(r, 750));
    }
    if (rejectedError || rejectedRow?.status !== "failed") {
      throw new Error(`Rejected wallet state did not persist as failed: ${rejectedError?.message || rejectedRow?.status}`);
    }
    rows.push(["Rejected wallet action", "green", "Rejected signature rendered and persisted as failed"]);

    const reconcile = await fetch(`${LIVE_URL}/api/payments/reconcile`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id: rejected.id,
        txHash: `0x${"00".repeat(32)}`,
        payerWallet: payerAddress,
        paymentMethod: "arc-direct",
        sourceChain: "Arc_Testnet",
      }),
    });
    if (reconcile.status !== 409) {
      throw new Error(`Fake reconciliation returned ${reconcile.status}, expected 409.`);
    }
    rows.push(["Invalid settlement proof", "green", "Server rejected a non-confirmed tx hash with HTTP 409"]);

    const { error: cleanupError } = await supabaseAdmin
      .from("payment_links")
      .delete()
      .in("id", [expired.id, insufficient.id, rejected.id]);
    if (cleanupError) throw new Error(`Could not remove temporary failure QA rows: ${cleanupError.message}`);
    rows.push(["QA cleanup", "green", "Temporary negative-state rows removed after capture"]);
  } finally {
    await context.close();
    await browser.close();
  }

  const report = [
    "# OneLink Live QA - Failure States",
    "",
    `Generated: ${new Date().toISOString()}`,
    `Base URL: ${LIVE_URL}`,
    "Status: green",
    "",
    "| Case | Result | Evidence |",
    "| --- | --- | --- |",
    ...rows.map((row) => `| ${row.join(" | ")} |`),
    "",
    "## Artifacts",
    "",
    "- `missing-link.png`",
    "- `expired-link.png`",
    "- `insufficient-funds.png`",
    "- `rejected-wallet-action.png`",
    "- `videos/`",
    "",
    "## Scope Note",
    "",
    "- The rejection harness intentionally refuses `eth_sendTransaction`; it does not spend testnet funds.",
    "- Failure-state fixtures are inserted with the server-only QA client because public standard invoice creation is Arc-event verified.",
    "- The reconciliation rejection proves fake transaction hashes cannot mark a row paid.",
    "- Temporary negative-state rows are removed after screenshots and assertions so the demo dashboard remains clean.",
    "",
  ].join("\n");
  writeFileSync(resolve(OUT_DIR, "REPORT.md"), report);
  console.log(`green ${resolve(OUT_DIR, "REPORT.md")}`);
}

main().catch((error) => {
  mkdirSync(OUT_DIR, { recursive: true });
  const message = error instanceof Error ? error.stack || error.message : String(error);
  writeFileSync(
    resolve(OUT_DIR, "REPORT.md"),
    ["# OneLink Live QA - Failure States", "", "Status: red", "", "```txt", message, "```", ""].join("\n"),
  );
  console.error(message);
  process.exit(1);
});
