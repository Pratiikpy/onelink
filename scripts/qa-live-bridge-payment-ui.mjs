import { randomUUID } from "node:crypto";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { chromium } from "@playwright/test";
import { createClient } from "@supabase/supabase-js";
import {
  createPublicClient,
  createWalletClient,
  erc20Abi,
  formatEther,
  formatUnits,
  getAddress,
  http,
  keccak256,
  parseUnits,
  toBytes,
} from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { baseSepolia } from "viem/chains";

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
const LIVE_URL =
  process.env.PLAYWRIGHT_BASE_URL && !process.env.PLAYWRIGHT_BASE_URL.includes("localhost")
    ? process.env.PLAYWRIGHT_BASE_URL
    : "https://onelink-mauve-nu.vercel.app";
const ARC_RPC_URL = process.env.ARC_TESTNET_RPC_URL || "https://rpc.testnet.arc.network";
const BASE_RPC_URL = process.env.BASE_SEPOLIA_RPC_URL || "https://sepolia.base.org";
const BASE_USDC = "0x036CbD53842c5426634e7929541eC2318f3dCF7e";
const OUT_DIR = resolve("docs", "test-results", "qa-live-bridge-payment-ui");
const AMOUNT_USDC = process.env.QA_UI_BRIDGE_AMOUNT_USDC || "0.05";
const oneLinkAbi = [
  {
    type: "function",
    name: "createLink",
    stateMutability: "nonpayable",
    inputs: [
      { name: "linkId", type: "bytes32" },
      { name: "recipient", type: "address" },
      { name: "amount", type: "uint256" },
      { name: "expiresAt", type: "uint64" },
    ],
    outputs: [],
  },
];

function required(name) {
  const value = process.env[name];
  if (!value) throw new Error(`${name} is required`);
  return value;
}

function txLink(chainId, hash) {
  const explorer = chainId === baseSepolia.id ? "https://sepolia.basescan.org" : "https://testnet.arcscan.app";
  return `[${hash.slice(0, 10)}...](${explorer}/tx/${hash})`;
}

function rel(path) {
  return path.replaceAll("\\", "/");
}

async function assertBody(page, pattern, label) {
  const text = (await page.locator("body").innerText({ timeout: 60_000 })) || "";
  if (!pattern.test(text)) throw new Error(`${label} did not contain ${pattern}: ${text.slice(0, 500)}`);
}

async function main() {
  mkdirSync(OUT_DIR, { recursive: true });
  const contract = getAddress(required("NEXT_PUBLIC_ONELINK_CONTRACT_ADDRESS"));
  const creator = privateKeyToAccount(required("DEPLOYER_PRIVATE_KEY"));
  const payer = privateKeyToAccount(required("QA_PAYER_PRIVATE_KEY"));
  const arcClient = createPublicClient({ chain: ARC_CHAIN, transport: http(ARC_RPC_URL) });
  const baseClient = createPublicClient({ chain: baseSepolia, transport: http(BASE_RPC_URL) });
  const creatorWallet = createWalletClient({ account: creator, chain: ARC_CHAIN, transport: http(ARC_RPC_URL) });
  const payerWallets = {
    [ARC_CHAIN.id]: createWalletClient({ account: payer, chain: ARC_CHAIN, transport: http(ARC_RPC_URL) }),
    [baseSepolia.id]: createWalletClient({ account: payer, chain: baseSepolia, transport: http(BASE_RPC_URL) }),
  };
  const anon = createClient(required("NEXT_PUBLIC_SUPABASE_URL"), required("NEXT_PUBLIC_SUPABASE_ANON_KEY"), {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  const admin = createClient(required("NEXT_PUBLIC_SUPABASE_URL"), required("SUPABASE_SERVICE_ROLE_KEY"), {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  const [baseUsdc, baseGas] = await Promise.all([
    baseClient.readContract({ address: BASE_USDC, abi: erc20Abi, functionName: "balanceOf", args: [payer.address] }),
    baseClient.getBalance({ address: payer.address }),
  ]);
  if (baseUsdc < parseUnits(AMOUNT_USDC, 6)) {
    throw new Error(`UI bridge payer has ${formatUnits(baseUsdc, 6)} Base USDC, needs ${AMOUNT_USDC}.`);
  }
  if (baseGas === 0n) throw new Error("UI bridge payer has no Base Sepolia ETH for CCTP approval/burn.");

  const stamp = new Date().toISOString().replace(/[-:.TZ]/g, "").slice(0, 14);
  const id = randomUUID();
  const slug = `bridge-ui-qa-${stamp}`;
  const memo = `Base bridge UI QA ${stamp}`;
  const linkId = keccak256(toBytes(`onelink:${slug}`));
  const createHash = await creatorWallet.writeContract({
    address: contract,
    abi: oneLinkAbi,
    functionName: "createLink",
    args: [linkId, creator.address, parseUnits(AMOUNT_USDC, 6), 0n],
  });
  const createdReceipt = await arcClient.waitForTransactionReceipt({ hash: createHash, pollingInterval: 1_000 });
  if (createdReceipt.status !== "success") throw new Error("Bridge UI invoice contract creation reverted.");
  const now = new Date().toISOString();
  const createRegistration = await fetch(`${LIVE_URL}/api/payments/create`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      link: {
        id,
        slug,
        creatorWallet: creator.address,
        recipientWallet: creator.address,
        amountUSDC: AMOUNT_USDC,
        memo,
        status: "unpaid",
        expiresAt: null,
        contractLinkId: linkId,
        settlementMode: "invoice",
        createdAt: now,
        updatedAt: now,
      },
      txHash: createHash,
    }),
  });
  if (!createRegistration.ok) {
    throw new Error(`Bridge UI verified invoice registration failed: ${await createRegistration.text()}`);
  }

  const paymentUrl = `${LIVE_URL}/pay/${slug}`;
  const txs = [];
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 390, height: 844 },
    recordVideo: { dir: resolve(OUT_DIR, "videos"), size: { width: 390, height: 844 } },
  });
  let currentChainId = baseSepolia.id;
  let success = false;
  let paid;
  await context.exposeFunction("bridgePayerWalletRpc", async ({ method, params = [] }) => {
    if (method === "eth_accounts" || method === "eth_requestAccounts") return [payer.address];
    if (method === "eth_chainId") return `0x${currentChainId.toString(16)}`;
    if (method === "wallet_switchEthereumChain") {
      const requestedChain = Number.parseInt(params[0].chainId, 16);
      if (!(requestedChain in payerWallets)) throw new Error("UI bridge QA only permits Base Sepolia and Arc Testnet.");
      currentChainId = requestedChain;
      return null;
    }
    if (method === "wallet_addEthereumChain") return null;
    if (method === "eth_sendTransaction") {
      const wallet = payerWallets[currentChainId];
      const client = currentChainId === baseSepolia.id ? baseClient : arcClient;
      const transaction = params[0];
      const hash = await wallet.sendTransaction({
        to: getAddress(transaction.to),
        data: transaction.data,
        value: transaction.value ? BigInt(transaction.value) : undefined,
      });
      const receipt = await client.waitForTransactionReceipt({ hash, pollingInterval: 1_000 });
      if (receipt.status !== "success") throw new Error(`Bridge UI transaction reverted: ${hash}`);
      txs.push({ chainId: currentChainId, hash });
      return hash;
    }
    throw new Error(`Unsupported bridge UI wallet RPC method: ${method}`);
  });
  await context.addInitScript(({ address }) => {
    const listeners = new Map();
    const provider = {
      isMetaMask: true,
      request: async (request) => {
        const result = await window.bridgePayerWalletRpc(request);
        if (request.method === "wallet_switchEthereumChain") {
          for (const listener of listeners.get("chainChanged") || []) listener(request.params[0].chainId);
        }
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
        uuid: "350670db-19fa-4704-a166-e52e178b59d5",
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
  }, { address: payer.address });

  try {
    const page = await context.newPage();
    await page.goto(paymentUrl, { waitUntil: "networkidle", timeout: 60_000 });
    await assertBody(page, /Bridge/i, "bridge-connected pay page");
    await page.getByRole("button", { name: "Bridge" }).click();
    await assertBody(page, /Base Sepolia proven/i, "bridge route selection");
    await page.screenshot({ path: resolve(OUT_DIR, "bridge-route-selected.png"), fullPage: true });
    await page.getByRole("button", { name: /Bridge & pay/i }).click();
    await page.getByText("Paid", { exact: true }).waitFor({ timeout: 600_000 });
    await page.reload({ waitUntil: "networkidle", timeout: 60_000 });
    await assertBody(page, /View verified receipt/i, "bridge paid persistence");
    await page.screenshot({ path: resolve(OUT_DIR, "bridge-paid-after-refresh.png"), fullPage: true });
    const { data, error } = await anon.from("payment_links").select("*").eq("id", id).single();
    if (error || data?.status !== "paid" || data?.payment_method !== "app-kit-bridge" || !data.tx_hash) {
      throw new Error(`Bridge UI payment failed persistence check: ${error?.message || data?.status}`);
    }
    paid = data;
    const receiptPage = await context.newPage();
    await receiptPage.goto(`${LIVE_URL}/receipt/${id}`, { waitUntil: "networkidle", timeout: 60_000 });
    await assertBody(receiptPage, /Paid|Arcscan/i, "bridge receipt");
    await receiptPage.screenshot({ path: resolve(OUT_DIR, "receipt.png"), fullPage: true });
    success = true;
  } finally {
    await context.close().catch(() => {});
    await browser.close().catch(() => {});
    if (!success) await admin.from("payment_links").delete().eq("id", id).neq("status", "paid");
  }

  const arcTransactions = txs.filter((tx) => tx.chainId === ARC_CHAIN.id);
  const baseTransactions = txs.filter((tx) => tx.chainId === baseSepolia.id);
  if (baseTransactions.length < 2 || arcTransactions.length < 3) {
    throw new Error(`Expected Base approval/burn and Arc mint/approval/payment transactions; observed ${JSON.stringify(txs)}`);
  }
  const result = {
    status: "green",
    generatedAt: new Date().toISOString(),
    paymentUrl,
    receiptUrl: `${LIVE_URL}/receipt/${id}`,
    payer: payer.address,
    amountUSDC: AMOUNT_USDC,
    baseGasBefore: formatEther(baseGas),
    createHash,
    transactions: txs,
    reconciliationHash: paid.tx_hash,
  };
  writeFileSync(resolve(OUT_DIR, "result.json"), `${JSON.stringify(result, null, 2)}\n`);
  writeFileSync(
    resolve(OUT_DIR, "REPORT.md"),
    [
      "# OneLink Live QA - Browser Bridge Payment Flow",
      "",
      `Generated: ${result.generatedAt}`,
      `Base URL: ${LIVE_URL}`,
      "Status: green",
      "",
      "## Flow Proven",
      "",
      "| Step | Result | Evidence |",
      "| --- | --- | --- |",
      `| Verified invoice prepared on Arc | green | [createLink](https://testnet.arcscan.app/tx/${createHash}) accepted by live API |`,
      `| Live UI selected Bridge route | green | ${rel(resolve(OUT_DIR, "bridge-route-selected.png"))} |`,
      `| Base USDC approval | green | ${txLink(baseTransactions[0].chainId, baseTransactions[0].hash)} |`,
      `| Base CCTP burn | green | ${txLink(baseTransactions[1].chainId, baseTransactions[1].hash)} |`,
      `| Arc CCTP mint | green | ${txLink(arcTransactions[0].chainId, arcTransactions[0].hash)} |`,
      `| Arc USDC approval | green | ${txLink(arcTransactions[1].chainId, arcTransactions[1].hash)} |`,
      `| Arc invoice settlement | green | ${txLink(arcTransactions[2].chainId, arcTransactions[2].hash)} |`,
      "| Server reconciliation and refresh | green | Persisted paid receipt after UI bridge route |",
      "",
      `- Payment: ${paymentUrl}`,
      `- Receipt: ${result.receiptUrl}`,
      "",
      "## Scope Note",
      "",
      "- This uses the deployed payment UI and a browser wallet provider boundary; Circle App Kit performs Base Sepolia to Arc CCTP before Arc settlement.",
      "",
    ].join("\n"),
  );
  console.log(`green ${resolve(OUT_DIR, "REPORT.md")}`);
}

main().catch((error) => {
  mkdirSync(OUT_DIR, { recursive: true });
  const message = error instanceof Error ? error.stack || error.message : String(error);
  writeFileSync(resolve(OUT_DIR, "REPORT.md"), ["# OneLink Live QA - Browser Bridge Payment Flow", "", "Status: red", "", "```txt", message, "```", ""].join("\n"));
  console.error(message);
  process.exit(1);
});
