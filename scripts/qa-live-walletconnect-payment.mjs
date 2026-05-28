import { randomUUID } from "node:crypto";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { relative, resolve } from "node:path";
import { chromium } from "@playwright/test";
import { createClient } from "@supabase/supabase-js";
import { Core } from "@walletconnect/core";
import { buildApprovedNamespaces, getSdkError } from "@walletconnect/utils";
import { WalletKit } from "@reown/walletkit";
import jsQR from "jsqr";
import { PNG } from "pngjs";
import { createPublicClient, createWalletClient, formatUnits, getAddress, http, keccak256, parseUnits, toBytes } from "viem";
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
const OUT_DIR = resolve("docs", "test-results", "qa-live-walletconnect-payment");
const AMOUNT_USDC = process.env.QA_WALLETCONNECT_AMOUNT_USDC || "0.02";

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
const balanceAbi = [
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

function response(id, result) {
  return { id, jsonrpc: "2.0", result };
}

async function assertBody(page, pattern, label) {
  const body = (await page.locator("body").innerText({ timeout: 60_000 })) || "";
  if (!pattern.test(body)) throw new Error(`${label} did not contain ${pattern}: ${body.slice(0, 500)}`);
}

async function main() {
  mkdirSync(OUT_DIR, { recursive: true });
  const projectId = required("NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID");
  const contract = getAddress(required("NEXT_PUBLIC_ONELINK_CONTRACT_ADDRESS"));
  const creator = privateKeyToAccount(required("DEPLOYER_PRIVATE_KEY"));
  const payer = privateKeyToAccount(required("QA_PAYER_PRIVATE_KEY"));
  const publicClient = createPublicClient({ chain: ARC_CHAIN, transport: http(ARC_RPC_URL) });
  const creatorWallet = createWalletClient({ account: creator, chain: ARC_CHAIN, transport: http(ARC_RPC_URL) });
  const payerWallet = createWalletClient({ account: payer, chain: ARC_CHAIN, transport: http(ARC_RPC_URL) });
  const anon = createClient(required("NEXT_PUBLIC_SUPABASE_URL"), required("NEXT_PUBLIC_SUPABASE_ANON_KEY"), {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  const admin = createClient(required("NEXT_PUBLIC_SUPABASE_URL"), required("SUPABASE_SERVICE_ROLE_KEY"), {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const payerBalance = await publicClient.readContract({
    address: ARC_USDC,
    abi: balanceAbi,
    functionName: "balanceOf",
    args: [payer.address],
  });
  if (payerBalance < parseUnits(AMOUNT_USDC, 6)) {
    throw new Error(`WalletConnect payer has ${formatUnits(payerBalance, 6)} Arc USDC, needs ${AMOUNT_USDC}`);
  }

  const stamp = new Date().toISOString().replace(/[-:.TZ]/g, "").slice(0, 14);
  const id = randomUUID();
  const slug = `walletconnect-qa-${stamp}`;
  const memo = `WalletConnect QA ${stamp}`;
  const contractLinkId = keccak256(toBytes(`onelink:${slug}`));
  const createHash = await creatorWallet.writeContract({
    address: contract,
    abi: oneLinkAbi,
    functionName: "createLink",
    args: [contractLinkId, creator.address, parseUnits(AMOUNT_USDC, 6), 0n],
  });
  const createReceipt = await publicClient.waitForTransactionReceipt({ hash: createHash, pollingInterval: 1_000 });
  if (createReceipt.status !== "success") throw new Error("WalletConnect QA link creation reverted.");

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
        contractLinkId,
        settlementMode: "invoice",
        createdAt: now,
        updatedAt: now,
      },
      txHash: createHash,
    }),
  });
  if (!createRegistration.ok) {
    throw new Error(`WalletConnect QA verified invoice registration failed: ${await createRegistration.text()}`);
  }

  const paymentUrl = `${LIVE_URL}/pay/${slug}`;
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 390, height: 844 },
    recordVideo: { dir: resolve(OUT_DIR, "videos"), size: { width: 390, height: 844 } },
  });
  const page = await context.newPage();
  const hashes = [];
  let walletKit;
  let topic;
  let paidRow;
  let runSucceeded = false;
  try {
    await page.goto(paymentUrl, { waitUntil: "networkidle", timeout: 60_000 });
    await assertBody(page, /Connect wallet/i, "WalletConnect invoice");
    await page.getByRole("button", { name: "Connect wallet" }).click();
    await page.getByRole("button", { name: "WalletConnect" }).click();
    await page.getByText(/Scan with your phone/i).waitFor({ timeout: 30_000 });
    await page.screenshot({ path: resolve(OUT_DIR, "walletconnect-qr-modal.png"), fullPage: true });

    const screenshot = PNG.sync.read(await page.screenshot());
    const uri = jsQR(new Uint8ClampedArray(screenshot.data), screenshot.width, screenshot.height)?.data;
    if (!uri?.startsWith("wc:")) throw new Error("Could not decode the live WalletConnect QR URI.");

    process.env.DISABLE_GLOBAL_CORE = "true";
    const core = new Core({ projectId, customStoragePrefix: `onelink-walletconnect-qa-${Date.now()}` });
    walletKit = await WalletKit.init({
      core,
      metadata: {
        name: "OneLink QA Wallet",
        description: "Live WalletConnect payment validation peer",
        url: LIVE_URL,
        icons: [],
      },
    });

    let resolveSession;
    let rejectSession;
    const connected = new Promise((resolve, reject) => {
      resolveSession = resolve;
      rejectSession = reject;
    });
    walletKit.on("session_proposal", async ({ id: proposalId, params }) => {
      try {
        const requested = params.optionalNamespaces?.eip155 ?? { chains: [], methods: [], events: [] };
        const namespaces = buildApprovedNamespaces({
          proposal: params,
          supportedNamespaces: {
            eip155: {
              chains: requested.chains,
              methods: requested.methods,
              events: requested.events,
              accounts: requested.chains.map((chain) => `${chain}:${payer.address}`),
            },
          },
        });
        const approval = await walletKit.approveSession({ id: proposalId, namespaces });
        if (typeof approval.acknowledged === "function") await approval.acknowledged();
        const activeSessions = walletKit.getActiveSessions();
        topic = Object.keys(activeSessions)[0];
        if (!topic) throw new Error("WalletConnect session acknowledgement returned without an active session.");
        resolveSession(activeSessions[topic]);
      } catch (error) {
        rejectSession(error);
      }
    });
    walletKit.on("session_request", async ({ topic: requestTopic, params, id: requestId }) => {
      const { method, params: requestParams = [] } = params.request;
      try {
        let result;
        if (method === "eth_accounts" || method === "eth_requestAccounts") {
          result = [payer.address];
        } else if (method === "wallet_switchEthereumChain" || method === "wallet_addEthereumChain") {
          const requestedChain =
            method === "wallet_switchEthereumChain" ? Number.parseInt(requestParams[0].chainId, 16) : ARC_CHAIN.id;
          if (requestedChain !== ARC_CHAIN.id) throw new Error("QA wallet only approves payments on Arc Testnet.");
          result = null;
        } else if (method === "eth_sendTransaction") {
          if (params.chainId !== `eip155:${ARC_CHAIN.id}`) {
            throw new Error("QA wallet refused a transaction outside Arc Testnet.");
          }
          const transaction = requestParams[0];
          const hash = await payerWallet.sendTransaction({
            to: getAddress(transaction.to),
            data: transaction.data,
            value: transaction.value ? BigInt(transaction.value) : undefined,
          });
          const receipt = await publicClient.waitForTransactionReceipt({ hash, pollingInterval: 1_000 });
          if (receipt.status !== "success") throw new Error(`WalletConnect transaction reverted: ${hash}`);
          hashes.push(hash);
          result = hash;
        } else {
          throw new Error(`Unexpected WalletConnect request method: ${method}`);
        }
        await walletKit.respondSessionRequest({ topic: requestTopic, response: response(requestId, result) });
      } catch (error) {
        await walletKit.respondSessionRequest({
          topic: requestTopic,
          response: {
            id: requestId,
            jsonrpc: "2.0",
            error: { code: 5000, message: error instanceof Error ? error.message : "QA wallet request failed." },
          },
        });
        rejectSession(error);
      }
    });

    await walletKit.pair({ uri });
    await Promise.race([
      connected,
      new Promise((_, reject) => setTimeout(() => reject(new Error("WalletConnect approval timed out.")), 45_000)),
    ]);
    await page.getByRole("button", { name: /Pay.*on Arc/i }).waitFor({ timeout: 45_000 });
    await assertBody(page, /Pay.*on Arc|Connected:/i, "WalletConnect connected payment page");
    await page.waitForFunction(() => !document.body.innerText.includes("Need "), { timeout: 30_000 });
    await page.screenshot({ path: resolve(OUT_DIR, "walletconnect-connected.png"), fullPage: true });
    await page.getByRole("button", { name: /Pay.*on Arc/i }).click();
    await page.getByText("Paid", { exact: true }).waitFor({ timeout: 180_000 });
    await page.reload({ waitUntil: "networkidle", timeout: 60_000 });
    await assertBody(page, /View verified receipt/i, "WalletConnect paid page after refresh");
    await page.screenshot({ path: resolve(OUT_DIR, "walletconnect-paid-after-refresh.png"), fullPage: true });

    const { data, error } = await anon.from("payment_links").select("*").eq("id", id).single();
    if (error || data?.status !== "paid" || !data.tx_hash) {
      throw new Error(`WalletConnect settlement not persisted as paid: ${error?.message || data?.status}`);
    }
    paidRow = data;
    const receiptPage = await context.newPage();
    await receiptPage.goto(`${LIVE_URL}/receipt/${id}`, { waitUntil: "networkidle", timeout: 60_000 });
    await assertBody(receiptPage, /Paid|Arcscan/i, "WalletConnect receipt");
    await receiptPage.screenshot({ path: resolve(OUT_DIR, "receipt.png"), fullPage: true });
    runSucceeded = true;
  } finally {
    if (walletKit && topic) {
      await walletKit.disconnectSession({ topic, reason: getSdkError("USER_DISCONNECTED") }).catch(() => {});
    }
    await context.close().catch(() => {});
    await browser.close().catch(() => {});
    if (!runSucceeded) {
      await admin.from("payment_links").delete().eq("id", id).neq("status", "paid");
    }
  }

  const result = {
    status: "green",
    generatedAt: new Date().toISOString(),
    paymentUrl,
    receiptUrl: `${LIVE_URL}/receipt/${id}`,
    amountUSDC: AMOUNT_USDC,
    creator: creator.address,
    payer: payer.address,
    createHash,
    approveHash: hashes[0],
    payHash: hashes[1],
    reconciledTxHash: paidRow.tx_hash,
  };
  if (result.payHash?.toLowerCase() !== result.reconciledTxHash?.toLowerCase()) {
    throw new Error("WalletConnect reconciled tx hash does not match submitted settlement.");
  }
  writeFileSync(resolve(OUT_DIR, "result.json"), `${JSON.stringify(result, null, 2)}\n`);
  writeFileSync(
    resolve(OUT_DIR, "REPORT.md"),
    [
      "# OneLink Live QA - WalletConnect Signed Payment",
      "",
      `Generated: ${result.generatedAt}`,
      `Base URL: ${LIVE_URL}`,
      "Status: green",
      "",
      "## Flow Proven",
      "",
      "| Step | Result | Evidence |",
      "| --- | --- | --- |",
      "| Production QR decode and pairing | green | Live WalletConnect QR paired through WalletKit |",
      "| Session proposal approval | green | Arc Testnet payer account approved in `eip155` namespace |",
      `| Verified invoice creation | green | [Arc createLink](https://testnet.arcscan.app/tx/${result.createHash}) accepted by live API |`,
      `| WalletConnect approval request | green | [Arc approve](https://testnet.arcscan.app/tx/${result.approveHash}) |`,
      `| WalletConnect payment request | green | [Arc payLink](https://testnet.arcscan.app/tx/${result.payHash}) |`,
      "| Server reconciliation | green | Supabase persisted paid state with matching payment tx |",
      "| Refresh and receipt | green | Paid state and verified receipt persisted after reload |",
      "",
      "## Links",
      "",
      `- Payment: ${result.paymentUrl}`,
      `- Receipt: ${result.receiptUrl}`,
      "",
      "## Artifacts",
      "",
      `- ${rel(resolve(OUT_DIR, "walletconnect-qr-modal.png"))}`,
      `- ${rel(resolve(OUT_DIR, "walletconnect-connected.png"))}`,
      `- ${rel(resolve(OUT_DIR, "walletconnect-paid-after-refresh.png"))}`,
      `- ${rel(resolve(OUT_DIR, "receipt.png"))}`,
      `- ${rel(resolve(OUT_DIR, "videos"))}/`,
      "",
      "## Scope Note",
      "",
      "- This validates the production QR/WalletConnect protocol session using an automated WalletKit peer with a funded Arc Testnet account.",
      "- It verifies the same connection and signing protocol used by a compatible WalletConnect wallet, without claiming a specific mobile wallet application's UI was exercised.",
      "",
    ].join("\n"),
  );
  console.log(`green ${result.payHash}`);
  console.log(`report ${resolve(OUT_DIR, "REPORT.md")}`);
  process.exit(0);
}

main().catch((error) => {
  mkdirSync(OUT_DIR, { recursive: true });
  const message = error instanceof Error ? error.stack || error.message : String(error);
  writeFileSync(
    resolve(OUT_DIR, "REPORT.md"),
    ["# OneLink Live QA - WalletConnect Signed Payment", "", "Status: red", "", "```txt", message, "```", ""].join("\n"),
  );
  console.error(message);
  process.exit(1);
});
