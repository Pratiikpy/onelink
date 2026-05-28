import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { chromium } from "@playwright/test";
import { createClient } from "@supabase/supabase-js";
import { createPublicClient, createWalletClient, getAddress, http } from "viem";
import { privateKeyToAccount } from "viem/accounts";

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
    // CI may provide environment variables directly.
  }
}

loadEnv();

const ARC_CHAIN = {
  id: 5042002,
  name: "Arc Testnet",
  nativeCurrency: { name: "USDC", symbol: "USDC", decimals: 18 },
  rpcUrls: { default: { http: ["https://rpc.testnet.arc.network"] } },
  blockExplorers: { default: { name: "Arcscan", url: "https://testnet.arcscan.app" } },
  testnet: true,
};
const RPC_URL = process.env.ARC_TESTNET_RPC_URL || "https://rpc.testnet.arc.network";
const LIVE_URL = process.env.PLAYWRIGHT_BASE_URL || "https://onelink-mauve-nu.vercel.app";
const OUT_DIR = resolve("docs", "test-results", "qa-live-cancel");
const AMOUNT_USDC = process.env.QA_CANCEL_AMOUNT_USDC || "0.01";

function required(name) {
  const value = process.env[name];
  if (!value) throw new Error(`${name} is required`);
  return value;
}

function txLink(hash) {
  return `https://testnet.arcscan.app/tx/${hash}`;
}

async function main() {
  mkdirSync(OUT_DIR, { recursive: true });
  const creator = privateKeyToAccount(required("DEPLOYER_PRIVATE_KEY"));
  const supabase = createClient(required("NEXT_PUBLIC_SUPABASE_URL"), required("NEXT_PUBLIC_SUPABASE_ANON_KEY"), {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  const admin = createClient(required("NEXT_PUBLIC_SUPABASE_URL"), required("SUPABASE_SERVICE_ROLE_KEY"), {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  const publicClient = createPublicClient({ chain: ARC_CHAIN, transport: http(RPC_URL) });
  const wallet = createWalletClient({ account: creator, chain: ARC_CHAIN, transport: http(RPC_URL) });
  const sentHashes = [];
  const memo = `Cancellation QA ${new Date().toISOString().replace(/[-:.TZ]/g, "").slice(0, 14)}`;

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1440, height: 1100 },
    recordVideo: { dir: resolve(OUT_DIR, "videos"), size: { width: 1440, height: 1100 } },
  });
  await context.exposeFunction("creatorCancelWalletRpc", async ({ method, params = [] }) => {
    if (method === "eth_accounts" || method === "eth_requestAccounts") return [creator.address];
    if (method === "eth_chainId") return `0x${ARC_CHAIN.id.toString(16)}`;
    if (method === "wallet_switchEthereumChain" || method === "wallet_addEthereumChain") return null;
    if (method === "eth_sendTransaction") {
      const transaction = params[0];
      const hash = await wallet.sendTransaction({
        to: getAddress(transaction.to),
        data: transaction.data,
        value: transaction.value ? BigInt(transaction.value) : undefined,
      });
      const receipt = await publicClient.waitForTransactionReceipt({ hash, pollingInterval: 1_000 });
      if (receipt.status !== "success") throw new Error(`Creator transaction reverted: ${hash}`);
      sentHashes.push(hash);
      return hash;
    }
    throw new Error(`Unsupported creator QA wallet method: ${method}`);
  });
  await context.addInitScript(({ address }) => {
    const listeners = new Map();
    const provider = {
      isMetaMask: true,
      request: async (request) => window.creatorCancelWalletRpc(request),
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
        uuid: "350670db-19fa-4704-a166-e52e178b59e9",
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
    window.__ONELINK_QA_ADDRESS__ = address;
  }, { address: creator.address });

  const page = await context.newPage();
  let createdId;
  let success = false;
  try {
    await page.goto(`${LIVE_URL}/create`, { waitUntil: "networkidle", timeout: 60_000 });
    await page.locator("input").nth(0).fill(AMOUNT_USDC);
    await page.locator("input").nth(1).fill(memo);
    await page.getByRole("button", { name: /^never$/i }).click();
    // New 3-step create flow: Step 1 → Review → Step 2 → Continue → Step 3 → Open wallet to sign
    await page.getByRole("button", { name: /^Review/i }).click();
    await page.getByRole("button", { name: /^Continue/i }).click();
    await page.getByRole("button", { name: /Open wallet to sign|Sign & create link/i }).click();
    // Step 4 ("Link is live"): wait for the "Share your link" success card,
    // then navigate to the pay page via "Preview pay page".
    await page.getByRole("link", { name: /Preview pay page/i }).waitFor({ timeout: 120_000 });
    await page.getByRole("link", { name: /Preview pay page/i }).click();
    await page.waitForURL(/\/pay\//, { timeout: 60_000 });
    const paymentUrl = page.url();
    const slug = new URL(paymentUrl).pathname.split("/").pop();
    const { data: created, error: createError } = await supabase.from("payment_links").select("*").eq("slug", slug).single();
    if (createError || !created) throw new Error(`Created link not persisted: ${createError?.message || slug}`);
    createdId = created.id;

    const { error: forgedCancelError } = await supabase
      .from("payment_links")
      .update({ status: "cancelled", updated_at: new Date().toISOString() })
      .eq("id", created.id);
    if (!forgedCancelError) throw new Error("Anonymous cancellation update was not rejected by RLS.");

    await page.goto(`${LIVE_URL}/dashboard`, { waitUntil: "networkidle", timeout: 60_000 });
    if ((await page.getByText(memo, { exact: true }).count()) < 1) {
      throw new Error("Newly created invoice is not visible in the creator dashboard.");
    }
    // Dashboard is now a table with a row-level dropdown menu. Open the menu
    // for the row, click "Cancel link", then confirm in the new ConfirmDialog.
    const createdRow = page.getByText(memo, { exact: true }).first().locator("xpath=ancestor::tr[1]");
    await createdRow.getByRole("button").last().click();
    await page.getByRole("menuitem", { name: /Cancel link/i }).click();
    await page.getByText("Cancel this payment link?", { exact: true }).waitFor({ timeout: 10_000 });
    await page.screenshot({ path: resolve(OUT_DIR, "cancel-confirmation.png"), fullPage: true });
    await page.getByRole("button", { name: /Cancel link on Arc/i }).click();
    await createdRow.getByText("Cancelled", { exact: true }).waitFor({ timeout: 60_000 });
    await page.screenshot({ path: resolve(OUT_DIR, "dashboard-cancelled.png"), fullPage: true });

    const { data: cancelled, error: cancelledError } = await supabase.from("payment_links").select("*").eq("id", created.id).single();
    if (cancelledError || cancelled?.status !== "cancelled" || !cancelled?.tx_hash) {
      throw new Error(`Cancellation was not persisted: ${cancelledError?.message || cancelled?.status}`);
    }

    await page.goto(paymentUrl, { waitUntil: "networkidle", timeout: 60_000 });
    const payText = (await page.locator("body").innerText()) || "";
    if (!/Link cancelled|no longer accepting payment|Cancelled/i.test(payText)) {
      throw new Error(`Cancelled checkout is not visibly blocked: ${payText.slice(0, 400)}`);
    }
    await page.screenshot({ path: resolve(OUT_DIR, "checkout-cancelled.png"), fullPage: true });

    const result = {
      status: "green",
      generatedAt: new Date().toISOString(),
      paymentUrl,
      id: created.id,
      creator: creator.address,
      createHash: sentHashes[0],
      cancelHash: cancelled.tx_hash,
      forgedAnonymousCancellationRejected: true,
    };
    writeFileSync(resolve(OUT_DIR, "result.json"), `${JSON.stringify(result, null, 2)}\n`);
    writeFileSync(
      resolve(OUT_DIR, "REPORT.md"),
      [
        "# OneLink Live QA - Verified Creator Cancellation",
        "",
        `Generated: ${result.generatedAt}`,
        `Base URL: ${LIVE_URL}`,
        "Status: green",
        "",
        "| Step | Result | Evidence |",
        "| --- | --- | --- |",
        `| Create unpaid invoice through UI | green | [Arc createLink](${txLink(result.createHash)}) |`,
        "| Attempt anonymous cancellation write | green | Supabase RLS rejected forged `cancelled` update |",
        "| Confirm cancellation from dashboard | green | `cancel-confirmation.png` |",
        `| Sign creator cancellation on Arc | green | [Arc cancelLink](${txLink(result.cancelHash)}) |`,
        "| Server verify and persist cancelled state | green | `dashboard-cancelled.png` |",
        "| Re-open checkout after cancellation | green | `checkout-cancelled.png` blocks payment |",
        "",
        `- Payment: ${paymentUrl}`,
        "",
      ].join("\n"),
    );
    success = true;
    console.log(`green ${result.cancelHash}`);
  } finally {
    await context.close();
    await browser.close();
    if (!success && createdId) {
      await admin.from("payment_links").delete().eq("id", createdId).neq("status", "paid");
    }
  }
}

main().catch((error) => {
  mkdirSync(OUT_DIR, { recursive: true });
  const message = error instanceof Error ? error.stack || error.message : String(error);
  writeFileSync(resolve(OUT_DIR, "REPORT.md"), ["# OneLink Live QA - Verified Creator Cancellation", "", "Status: red", "", "```txt", message, "```", ""].join("\n"));
  console.error(message);
  process.exit(1);
});
