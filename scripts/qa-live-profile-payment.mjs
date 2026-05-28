import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { chromium } from "@playwright/test";
import { createClient } from "@supabase/supabase-js";
import { createPublicClient, createWalletClient, formatUnits, getAddress, http, parseUnits } from "viem";
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
    // CI may provide env directly.
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
const ARC_RPC_URL = process.env.ARC_TESTNET_RPC_URL || "https://rpc.testnet.arc.network";
const ARC_USDC = "0x3600000000000000000000000000000000000000";
const LIVE_URL =
  process.env.PLAYWRIGHT_BASE_URL && !process.env.PLAYWRIGHT_BASE_URL.includes("localhost")
    ? process.env.PLAYWRIGHT_BASE_URL
    : "https://onelink-mauve-nu.vercel.app";
const PROFILE_RESULT = resolve("docs", "test-results", "qa-live-profile", "result.json");
const OUT_DIR = resolve("docs", "test-results", "qa-live-profile-payment");
const AMOUNT_USDC = process.env.QA_PROFILE_PAYMENT_AMOUNT_USDC || "0.02";

const erc20BalanceAbi = [
  {
    type: "function",
    name: "balanceOf",
    stateMutability: "view",
    inputs: [{ name: "account", type: "address" }],
    outputs: [{ name: "", type: "uint256" }],
  },
];

function required(name) {
  const value = process.env[name];
  if (!value) throw new Error(`${name} is required`);
  return value;
}

function loadProfile() {
  const result = JSON.parse(readFileSync(PROFILE_RESULT, "utf8"));
  if (!result?.profileUrl || !result?.wallet) throw new Error(`Profile QA result missing at ${PROFILE_RESULT}`);
  return result;
}

async function createWalletContext(browser, account, publicClient) {
  const sentHashes = [];
  const wallet = createWalletClient({ account, chain: ARC_CHAIN, transport: http(ARC_RPC_URL) });
  const context = await browser.newContext({
    viewport: { width: 390, height: 844 },
    recordVideo: { dir: resolve(OUT_DIR, "videos"), size: { width: 390, height: 844 } },
  });
  let chainId = ARC_CHAIN.id;

  await context.exposeFunction("profilePayerWalletRpc", async ({ method, params = [] }) => {
    if (method === "eth_accounts" || method === "eth_requestAccounts") return [account.address];
    if (method === "eth_chainId") return `0x${chainId.toString(16)}`;
    if (method === "wallet_switchEthereumChain") {
      chainId = Number.parseInt(params[0].chainId, 16);
      if (chainId !== ARC_CHAIN.id) throw new Error("Profile QA only authorizes Arc Testnet.");
      return null;
    }
    if (method === "wallet_addEthereumChain") return null;
    if (method === "eth_sendTransaction") {
      const transaction = params[0];
      const hash = await wallet.sendTransaction({
        to: getAddress(transaction.to),
        data: transaction.data,
        value: transaction.value ? BigInt(transaction.value) : undefined,
      });
      const receipt = await publicClient.waitForTransactionReceipt({ hash, pollingInterval: 1_000 });
      if (receipt.status !== "success") throw new Error(`Profile payment reverted: ${hash}`);
      sentHashes.push(hash);
      return hash;
    }
    throw new Error(`Unsupported profile QA wallet RPC method: ${method}`);
  });

  await context.addInitScript(({ address }) => {
    const listeners = new Map();
    const provider = {
      isMetaMask: true,
      request: async (request) => window.profilePayerWalletRpc(request),
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
    window.__ONELINK_QA_ADDRESS__ = address;
  }, { address: account.address });

  return { context, sentHashes };
}

async function assertBody(page, pattern, label) {
  const body = (await page.locator("body").innerText({ timeout: 60_000 })) || "";
  if (!pattern.test(body)) throw new Error(`${label} did not contain ${pattern}: ${body.slice(0, 500)}`);
}

async function main() {
  mkdirSync(OUT_DIR, { recursive: true });
  const profile = loadProfile();
  const payer = privateKeyToAccount(required("QA_PAYER_PRIVATE_KEY"));
  const supabase = createClient(required("NEXT_PUBLIC_SUPABASE_URL"), required("NEXT_PUBLIC_SUPABASE_ANON_KEY"), {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  const publicClient = createPublicClient({ chain: ARC_CHAIN, transport: http(ARC_RPC_URL) });
  const balance = await publicClient.readContract({
    address: ARC_USDC,
    abi: erc20BalanceAbi,
    functionName: "balanceOf",
    args: [payer.address],
  });
  if (balance < parseUnits(AMOUNT_USDC, 6)) {
    throw new Error(`Profile QA payer has ${formatUnits(balance, 6)} Arc USDC, needs ${AMOUNT_USDC}`);
  }

  const stamp = new Date().toISOString().replace(/[-:.TZ]/g, "").slice(0, 14);
  const memo = `Profile payment QA ${stamp}`;
  const browser = await chromium.launch({ headless: true });
  let session;
  let paymentUrl;
  let paid;
  try {
    session = await createWalletContext(browser, payer, publicClient);
    const page = await session.context.newPage();
    await page.goto(profile.profileUrl, { waitUntil: "networkidle", timeout: 60_000 });
    await assertBody(page, /Send USDC|Connect wallet to pay/i, "profile payment surface");
    await page.locator("input").nth(0).fill(AMOUNT_USDC);
    await page.locator("input").nth(1).fill(memo);
    await page.getByRole("button", { name: /Continue to pay/i }).click();
    await page.waitForURL(/\/pay\/.+/, { timeout: 60_000 });
    paymentUrl = page.url();
    await page.screenshot({ path: resolve(OUT_DIR, "payment-before-settlement.png"), fullPage: true });
    await page.getByRole("button", { name: /Pay.*on Arc/i }).click();
    await page.getByText("Paid", { exact: true }).waitFor({ timeout: 180_000 });
    await page.reload({ waitUntil: "networkidle", timeout: 60_000 });
    await assertBody(page, /View receipt|View verified receipt/i, "profile paid persistence");
    await page.screenshot({ path: resolve(OUT_DIR, "payment-paid-after-refresh.png"), fullPage: true });

    const slug = new URL(paymentUrl).pathname.split("/").pop();
    const { data, error } = await supabase.from("payment_links").select("*").eq("slug", slug).single();
    if (error || data?.status !== "paid" || data?.settlement_mode !== "profile" || !data.tx_hash) {
      throw new Error(`Profile payment did not persist as paid: ${error?.message || data?.status}`);
    }
    paid = data;
    const receipt = await session.context.newPage();
    await receipt.goto(`${LIVE_URL}/receipt/${paid.id}`, { waitUntil: "networkidle", timeout: 60_000 });
    await assertBody(receipt, /Paid|Arcscan/i, "profile receipt");
    await receipt.screenshot({ path: resolve(OUT_DIR, "receipt.png"), fullPage: true });
    await session.context.close();
  } finally {
    if (session) await session.context.close().catch(() => {});
    await browser.close();
  }

  const result = {
    status: "green",
    generatedAt: new Date().toISOString(),
    profileUrl: profile.profileUrl,
    paymentUrl,
    receiptUrl: `${LIVE_URL}/receipt/${paid.id}`,
    recipient: profile.wallet,
    payer: payer.address,
    amountUSDC: AMOUNT_USDC,
    approveHash: session.sentHashes[0],
    payRecipientHash: session.sentHashes[1],
    reconciledTxHash: paid.tx_hash,
  };
  if (result.payRecipientHash?.toLowerCase() !== result.reconciledTxHash?.toLowerCase()) {
    throw new Error("Profile reconciled tx hash does not match payRecipient transaction.");
  }
  writeFileSync(resolve(OUT_DIR, "result.json"), `${JSON.stringify(result, null, 2)}\n`);
  writeFileSync(
    resolve(OUT_DIR, "REPORT.md"),
    [
      "# OneLink Live QA - Permanent Profile Payment",
      "",
      `Generated: ${result.generatedAt}`,
      `Profile URL: ${result.profileUrl}`,
      "Status: green",
      "",
      "## Flow Proven",
      "",
      "| Step | Result | Evidence |",
      "| --- | --- | --- |",
      "| Open permanent handle | green | Live profile route loaded persisted freelancer recipient |",
      "| Create payment request | green | Payer selected amount and memo through live UI |",
      `| UI approval | green | [Arc approve](https://testnet.arcscan.app/tx/${result.approveHash}) |`,
      `| Profile settlement | green | [Arc payRecipient](https://testnet.arcscan.app/tx/${result.payRecipientHash}) |`,
      "| Server reconciliation | green | Supabase persisted paid profile payment with matching transaction |",
      "| Paid refresh and receipt | green | Paid UI survived reload and rendered verified receipt |",
      "",
      "## Links",
      "",
      `- Payment: ${result.paymentUrl}`,
      `- Receipt: ${result.receiptUrl}`,
      "",
      "## Artifacts",
      "",
      "- `payment-before-settlement.png`",
      "- `payment-paid-after-refresh.png`",
      "- `receipt.png`",
      "- `videos/`",
      "",
    ].join("\n"),
  );
  console.log(`green ${result.payRecipientHash}`);
  console.log(`report ${resolve(OUT_DIR, "REPORT.md")}`);
}

main().catch((error) => {
  mkdirSync(OUT_DIR, { recursive: true });
  const message = error instanceof Error ? error.stack || error.message : String(error);
  writeFileSync(
    resolve(OUT_DIR, "REPORT.md"),
    ["# OneLink Live QA - Permanent Profile Payment", "", "Status: red", "", "```txt", message, "```", ""].join("\n"),
  );
  console.error(message);
  process.exit(1);
});
