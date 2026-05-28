import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { relative, resolve } from "node:path";
import { chromium } from "@playwright/test";
import { createClient } from "@supabase/supabase-js";
import {
  createPublicClient,
  createWalletClient,
  formatUnits,
  getAddress,
  http,
  parseUnits,
} from "viem";
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
const OUT_DIR = resolve("docs", "test-results", "qa-live-browser-wallet");
const AMOUNT_USDC = process.env.QA_UI_AMOUNT_USDC || "0.02";

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

function rel(path) {
  return relative(process.cwd(), path).replaceAll("\\", "/");
}

async function createWalletContext(browser, role, account, publicClient) {
  const sentHashes = [];
  const wallet = createWalletClient({ account, chain: ARC_CHAIN, transport: http(ARC_RPC_URL) });
  const context = await browser.newContext({
    viewport: { width: 1280, height: 1000 },
    recordVideo: { dir: resolve(OUT_DIR, "videos"), size: { width: 1280, height: 1000 } },
  });
  let chainId = ARC_CHAIN.id;

  await context.exposeFunction(`${role}WalletRpc`, async ({ method, params = [] }) => {
    if (method === "eth_accounts" || method === "eth_requestAccounts") return [account.address];
    if (method === "eth_chainId") return `0x${chainId.toString(16)}`;
    if (method === "wallet_switchEthereumChain") {
      chainId = Number.parseInt(params[0].chainId, 16);
      if (chainId !== ARC_CHAIN.id) throw new Error("Live browser QA only authorizes Arc Testnet.");
      return null;
    }
    if (method === "wallet_addEthereumChain") return null;
    if (method === "eth_sendTransaction") {
      if (chainId !== ARC_CHAIN.id) throw new Error("Transaction requested outside Arc Testnet.");
      const transaction = params[0];
      const hash = await wallet.sendTransaction({
        to: getAddress(transaction.to),
        data: transaction.data,
        value: transaction.value ? BigInt(transaction.value) : undefined,
      });
      const receipt = await publicClient.waitForTransactionReceipt({ hash, pollingInterval: 1_000 });
      if (receipt.status !== "success") throw new Error(`Arc browser-wallet transaction reverted: ${hash}`);
      sentHashes.push(hash);
      return hash;
    }
    throw new Error(`Unsupported QA wallet RPC method: ${method}`);
  });

  await context.addInitScript(({ bindingName, address, role: providerRole }) => {
    const listeners = new Map();
    function emit(event, value) {
      for (const listener of listeners.get(event) || []) listener(value);
    }
    const provider = {
      isMetaMask: true,
      request: async (request) => {
        const result = await window[bindingName](request);
        if (request.method === "wallet_switchEthereumChain") emit("chainChanged", request.params[0].chainId);
        return result;
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
        uuid: providerRole === "creator"
          ? "350670db-19fa-4704-a166-e52e178b59d2"
          : "350670db-19fa-4704-a166-e52e178b59d3",
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
  }, { bindingName: `${role}WalletRpc`, address: account.address, role });

  return { context, sentHashes };
}

async function assertBody(page, pattern, label) {
  const body = (await page.locator("body").innerText({ timeout: 60_000 })) || "";
  if (!pattern.test(body)) throw new Error(`${label} did not contain ${pattern}: ${body.slice(0, 500)}`);
}

async function main() {
  mkdirSync(OUT_DIR, { recursive: true });
  const creator = privateKeyToAccount(required("DEPLOYER_PRIVATE_KEY"));
  const payer = privateKeyToAccount(required("QA_PAYER_PRIVATE_KEY"));
  const supabase = createClient(required("NEXT_PUBLIC_SUPABASE_URL"), required("NEXT_PUBLIC_SUPABASE_ANON_KEY"), {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  const publicClient = createPublicClient({ chain: ARC_CHAIN, transport: http(ARC_RPC_URL) });
  const payerBalance = await publicClient.readContract({
    address: ARC_USDC,
    abi: erc20BalanceAbi,
    functionName: "balanceOf",
    args: [payer.address],
  });
  if (payerBalance < parseUnits(AMOUNT_USDC, 6)) {
    throw new Error(`QA payer has ${formatUnits(payerBalance, 6)} Arc USDC, needs ${AMOUNT_USDC}`);
  }

  const stamp = new Date().toISOString().replace(/[-:.TZ]/g, "").slice(0, 14);
  const memo = `Browser wallet QA ${stamp}`;
  const browser = await chromium.launch({ headless: true });
  let paymentUrl;
  let link;
  let creatorSession;
  let payerSession;
  try {
    creatorSession = await createWalletContext(browser, "creator", creator, publicClient);
    const createPage = await creatorSession.context.newPage();
    await createPage.goto(`${LIVE_URL}/create`, { waitUntil: "networkidle", timeout: 60_000 });
    await assertBody(createPage, new RegExp(creator.address.slice(0, 6), "i"), "creator wallet connected UI");
    await createPage.locator("input").nth(0).fill(AMOUNT_USDC);
    await createPage.locator("input").nth(1).fill(memo);
    await createPage.getByRole("button", { name: /^never$/i }).click();
    await createPage.getByRole("button", { name: /Sign & create link/i }).click();
    await createPage.waitForURL(/\/pay\/.+/, { timeout: 120_000 });
    paymentUrl = createPage.url();
    await createPage.screenshot({ path: resolve(OUT_DIR, "creator-created-link.png"), fullPage: true });
    await creatorSession.context.close();

    const slug = new URL(paymentUrl).pathname.split("/").pop();
    const { data: created, error: createdError } = await supabase
      .from("payment_links")
      .select("*")
      .eq("slug", slug)
      .single();
    if (createdError || !created) throw new Error(`Created UI link not persisted: ${createdError?.message || slug}`);
    link = created;

    payerSession = await createWalletContext(browser, "payer", payer, publicClient);
    const payPage = await payerSession.context.newPage();
    await payPage.goto(paymentUrl, { waitUntil: "networkidle", timeout: 60_000 });
    await assertBody(payPage, /Pay on Arc/i, "payer Arc route");
    await payPage.screenshot({ path: resolve(OUT_DIR, "payer-before-payment.png"), fullPage: true });
    await payPage.getByRole("button", { name: "Pay on Arc", exact: true }).click();
    await payPage.getByText("Paid", { exact: true }).waitFor({ timeout: 180_000 });
    await payPage.reload({ waitUntil: "networkidle", timeout: 60_000 });
    await assertBody(payPage, /Paid/i, "persisted paid page after refresh");
    await payPage.getByRole("link", { name: /View verified receipt/i }).waitFor({ timeout: 30_000 });
    await payPage.screenshot({ path: resolve(OUT_DIR, "payer-paid-after-refresh.png"), fullPage: true });

    const { data: paid, error: paidError } = await supabase.from("payment_links").select("*").eq("id", link.id).single();
    if (paidError || paid?.status !== "paid" || !paid.tx_hash) {
      throw new Error(`Live UI settlement was not reconciled as paid: ${paidError?.message || paid?.status}`);
    }
    link = paid;
    const receiptPage = await payerSession.context.newPage();
    await receiptPage.goto(`${LIVE_URL}/receipt/${paid.id}`, { waitUntil: "networkidle", timeout: 60_000 });
    await assertBody(receiptPage, /Paid|paid/i, "browser receipt");
    await receiptPage.screenshot({ path: resolve(OUT_DIR, "receipt.png"), fullPage: true });
    await payerSession.context.close();
  } finally {
    if (creatorSession) await creatorSession.context.close().catch(() => {});
    if (payerSession) await payerSession.context.close().catch(() => {});
    await browser.close();
  }

  const result = {
    status: "green",
    generatedAt: new Date().toISOString(),
    liveUrl: LIVE_URL,
    paymentUrl,
    receiptUrl: `${LIVE_URL}/receipt/${link.id}`,
    amountUSDC: AMOUNT_USDC,
    creator: creator.address,
    payer: payer.address,
    slug: link.slug,
    id: link.id,
    createHash: creatorSession.sentHashes[0],
    approveHash: payerSession.sentHashes[0],
    payHash: payerSession.sentHashes[1],
    reconciledTxHash: link.tx_hash,
  };
  if (result.payHash?.toLowerCase() !== result.reconciledTxHash?.toLowerCase()) {
    throw new Error("Supabase reconciled tx hash does not match the UI-submitted pay transaction.");
  }
  writeFileSync(resolve(OUT_DIR, "result.json"), `${JSON.stringify(result, null, 2)}\n`);
  writeFileSync(
    resolve(OUT_DIR, "REPORT.md"),
    [
      "# OneLink Live QA - Browser Wallet Full Flow",
      "",
      `Generated: ${result.generatedAt}`,
      `Base URL: ${LIVE_URL}`,
      "Status: green",
      "",
      "## Flow Proven",
      "",
      "| Step | Result | Evidence |",
      "| --- | --- | --- |",
      `| UI wallet discovery | green | EIP-6963 browser wallet connected through RainbowKit |`,
      `| UI create link | green | [Arc createLink](https://testnet.arcscan.app/tx/${result.createHash}) |`,
      `| Cross-context load | green | Payer browser loaded \`${result.slug}\` from Supabase |`,
      `| UI approval | green | [Arc approve](https://testnet.arcscan.app/tx/${result.approveHash}) |`,
      `| UI settlement | green | [Arc payLink](https://testnet.arcscan.app/tx/${result.payHash}) |`,
      `| Server reconciliation | green | Supabase persisted \`paid\` with matching settlement tx |`,
      `| Paid refresh | green | Payer page remained paid after reload |`,
      `| Receipt | green | ${result.receiptUrl} |`,
      "",
      "## Artifacts",
      "",
      `- ${rel(resolve(OUT_DIR, "creator-created-link.png"))}`,
      `- ${rel(resolve(OUT_DIR, "payer-before-payment.png"))}`,
      `- ${rel(resolve(OUT_DIR, "payer-paid-after-refresh.png"))}`,
      `- ${rel(resolve(OUT_DIR, "receipt.png"))}`,
      `- ${rel(resolve(OUT_DIR, "videos"))}/`,
      "",
      "## Scope Note",
      "",
      "- This is an actual live frontend transaction flow through RainbowKit and an EIP-1193 browser wallet harness.",
      "- Keys remain in Node environment variables and are not injected into the browser page.",
      "- It does not claim a WalletConnect mobile QR handshake or a third-party extension popup was automated.",
      "",
    ].join("\n"),
  );
  console.log(`green ${result.payHash}`);
  console.log(`report ${resolve(OUT_DIR, "REPORT.md")}`);
}

main().catch((error) => {
  mkdirSync(OUT_DIR, { recursive: true });
  const message = error instanceof Error ? error.stack || error.message : String(error);
  writeFileSync(
    resolve(OUT_DIR, "REPORT.md"),
    ["# OneLink Live QA - Browser Wallet Full Flow", "", "Status: red", "", "```txt", message, "```", ""].join("\n"),
  );
  console.error(message);
  process.exit(1);
});
