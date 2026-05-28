import { spawn, spawnSync } from "node:child_process";
import { randomUUID } from "node:crypto";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { chromium } from "@playwright/test";
import { createClient } from "@supabase/supabase-js";
import {
  createPublicClient,
  createWalletClient,
  erc20Abi,
  formatUnits,
  getAddress,
  hexToSignature,
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

const OUT_DIR = resolve("docs", "test-results", "qa-local-gateway");
const PORT = Number(process.env.QA_GATEWAY_PORT || 3100);
const LOCAL_URL = `http://127.0.0.1:${PORT}`;
const AMOUNT_USDC = process.env.QA_GATEWAY_AMOUNT_USDC || "0.02";
const DEPOSIT_USDC = process.env.QA_GATEWAY_DEPOSIT_USDC || "2";
const ARC_CHAIN = {
  id: 5042002,
  name: "Arc Testnet",
  nativeCurrency: { name: "USDC", symbol: "USDC", decimals: 18 },
  rpcUrls: { default: { http: ["https://rpc.testnet.arc.network"] } },
  blockExplorers: { default: { name: "Arcscan", url: "https://testnet.arcscan.app" } },
  testnet: true,
};
const ARC_RPC_URL = process.env.ARC_TESTNET_RPC_URL || "https://rpc.testnet.arc.network";
const BASE_RPC_URL = process.env.BASE_SEPOLIA_RPC_URL || "https://sepolia.base.org";
const BASE_USDC = "0x036CbD53842c5426634e7929541eC2318f3dCF7e";
const GATEWAY_WALLET = "0x0077777d7EBA4688BDeF3E311b846F25870A19B9";
const GATEWAY_API = "https://gateway-api-testnet.circle.com/v1/balances";

const gatewayWalletAbi = [
  {
    type: "function",
    name: "deposit",
    inputs: [
      { name: "token", type: "address" },
      { name: "value", type: "uint256" },
    ],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "depositWithPermit",
    inputs: [
      { name: "token", type: "address" },
      { name: "owner", type: "address" },
      { name: "value", type: "uint256" },
      { name: "deadline", type: "uint256" },
      { name: "v", type: "uint8" },
      { name: "r", type: "bytes32" },
      { name: "s", type: "bytes32" },
    ],
    outputs: [],
    stateMutability: "nonpayable",
  },
];

const usdcPermitAbi = [
  ...erc20Abi,
  {
    type: "function",
    name: "nonces",
    stateMutability: "view",
    inputs: [{ name: "owner", type: "address" }],
    outputs: [{ name: "", type: "uint256" }],
  },
];

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

function stringify(value) {
  return JSON.stringify(
    value,
    (_key, item) => (typeof item === "bigint" ? item.toString() : item),
    2,
  );
}

function reviveGatewayTypedData(value) {
  if (Array.isArray(value)) return value.map(reviveGatewayTypedData);
  if (!value || typeof value !== "object") return value;
  const revived = {};
  for (const [key, item] of Object.entries(value)) {
    if (
      ["maxBlockHeight", "maxFee", "value", "deadline", "nonce"].includes(key) &&
      typeof item === "string" &&
      /^\d+$/.test(item)
    ) {
      revived[key] = BigInt(item);
    } else {
      revived[key] = reviveGatewayTypedData(item);
    }
  }
  return revived;
}

async function waitForServer(url, timeoutMs = 90_000) {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    try {
      const response = await fetch(url);
      if (response.ok) return;
    } catch {
      // retry
    }
    await new Promise((resolve) => setTimeout(resolve, 1_000));
  }
  throw new Error(`Local server did not become ready: ${url}`);
}

function startLocalServer() {
  const child = spawn("npx", ["next", "dev", "-p", String(PORT), "-H", "127.0.0.1"], {
    cwd: process.cwd(),
    env: {
      ...process.env,
      NEXT_PUBLIC_APP_URL: LOCAL_URL,
      NEXT_PUBLIC_ENABLE_GATEWAY: "true",
    },
    stdio: ["ignore", "pipe", "pipe"],
    shell: process.platform === "win32",
  });
  child.stdout.on("data", (chunk) => process.stdout.write(chunk));
  child.stderr.on("data", (chunk) => process.stderr.write(chunk));
  return child;
}

function stopLocalServer(child) {
  if (!child?.pid) return;
  if (process.platform === "win32") {
    spawnSync("taskkill", ["/pid", String(child.pid), "/T", "/F"], { stdio: "ignore" });
    return;
  }
  child.kill("SIGTERM");
}

async function gatewayBalance(depositor) {
  const response = await fetch(GATEWAY_API, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      token: "USDC",
      sources: [{ domain: 6, depositor }],
    }),
  });
  if (!response.ok) throw new Error(`Gateway balance lookup failed: ${response.status} ${await response.text()}`);
  const payload = await response.json();
  return parseUnits(payload.balances?.[0]?.balance ?? "0", 6);
}

async function ensureGatewayDeposit({ payer, spendAmount, depositAmount }) {
  const existing = await gatewayBalance(payer.address);
  if (existing >= spendAmount) return { deposited: false, existingUsdc: formatUnits(existing, 6) };

  const baseClient = createPublicClient({ chain: baseSepolia, transport: http(BASE_RPC_URL) });
  const baseWallet = createWalletClient({ account: payer, chain: baseSepolia, transport: http(BASE_RPC_URL) });
  const [baseUsdc, baseGas] = await Promise.all([
    baseClient.readContract({ address: BASE_USDC, abi: erc20Abi, functionName: "balanceOf", args: [payer.address] }),
    baseClient.getBalance({ address: payer.address }),
  ]);
  if (baseUsdc < depositAmount) {
    throw new Error(`Payer has ${formatUnits(baseUsdc, 6)} Base USDC, needs ${formatUnits(depositAmount, 6)}.`);
  }
  if (baseGas === 0n) throw new Error("Payer has no Base Sepolia ETH for Gateway deposit.");

  const nonce = await baseClient.readContract({
    address: BASE_USDC,
    abi: usdcPermitAbi,
    functionName: "nonces",
    args: [payer.address],
  });
  const deadline = BigInt(Math.floor(Date.now() / 1000) + 3600);
  const permitSignature = await payer.signTypedData({
    domain: {
      name: "USDC",
      version: "2",
      chainId: baseSepolia.id,
      verifyingContract: BASE_USDC,
    },
    types: {
      Permit: [
        { name: "owner", type: "address" },
        { name: "spender", type: "address" },
        { name: "value", type: "uint256" },
        { name: "nonce", type: "uint256" },
        { name: "deadline", type: "uint256" },
      ],
    },
    primaryType: "Permit",
    message: {
      owner: payer.address,
      spender: GATEWAY_WALLET,
      value: depositAmount,
      nonce,
      deadline,
    },
  });
  const { v, r, s } = hexToSignature(permitSignature);

  const depositHash = await baseWallet.writeContract({
    address: GATEWAY_WALLET,
    abi: gatewayWalletAbi,
    functionName: "depositWithPermit",
    args: [BASE_USDC, payer.address, depositAmount, deadline, Number(v), r, s],
  });
  const depositReceipt = await baseClient.waitForTransactionReceipt({ hash: depositHash, pollingInterval: 1_000 });
  if (depositReceipt.status !== "success") throw new Error("Gateway deposit failed.");

  for (let attempt = 0; attempt < 60; attempt += 1) {
    const updated = await gatewayBalance(payer.address);
    if (updated >= spendAmount) return { deposited: true, depositHash, balanceUsdc: formatUnits(updated, 6) };
    await new Promise((resolve) => setTimeout(resolve, 5_000));
  }

  throw new Error("Gateway deposit confirmed on-chain, but Gateway API balance did not update before timeout.");
}

async function assertBody(page, pattern, label) {
  const body = (await page.locator("body").innerText({ timeout: 60_000 })) || "";
  if (!pattern.test(body)) throw new Error(`${label} did not contain ${pattern}: ${body.slice(0, 600)}`);
}

async function rpcRequest(url, method, params) {
  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ jsonrpc: "2.0", id: 1, method, params }),
  });
  const payload = await response.json();
  if (payload.error) throw new Error(payload.error.message || `RPC ${method} failed`);
  return payload.result;
}

async function main() {
  mkdirSync(OUT_DIR, { recursive: true });
  const contract = getAddress(required("NEXT_PUBLIC_ONELINK_CONTRACT_ADDRESS"));
  const creator = privateKeyToAccount(required("DEPLOYER_PRIVATE_KEY"));
  const payer = privateKeyToAccount(required("QA_PAYER_PRIVATE_KEY"));
  const amount = parseUnits(AMOUNT_USDC, 6);
  const depositAmount = parseUnits(DEPOSIT_USDC, 6);
  const deposit = await ensureGatewayDeposit({ payer, spendAmount: amount, depositAmount });

  const server = startLocalServer();
  let browser;
  try {
    await waitForServer(LOCAL_URL);

    const arcClient = createPublicClient({ chain: ARC_CHAIN, transport: http(ARC_RPC_URL) });
    const creatorWallet = createWalletClient({ account: creator, chain: ARC_CHAIN, transport: http(ARC_RPC_URL) });
    const supabase = createClient(required("NEXT_PUBLIC_SUPABASE_URL"), required("NEXT_PUBLIC_SUPABASE_ANON_KEY"), {
      auth: { persistSession: false, autoRefreshToken: false },
    });

    const stamp = new Date().toISOString().replace(/[-:.TZ]/g, "").slice(0, 14);
    const id = randomUUID();
    const slug = `gateway-local-qa-${stamp}`;
    const memo = `Gateway local QA ${stamp}`;
    const linkId = keccak256(toBytes(`onelink:${slug}`));
    const createHash = await creatorWallet.writeContract({
      address: contract,
      abi: oneLinkAbi,
      functionName: "createLink",
      args: [linkId, creator.address, amount, 0n],
    });
    const createReceipt = await arcClient.waitForTransactionReceipt({ hash: createHash, pollingInterval: 1_000 });
    if (createReceipt.status !== "success") throw new Error("Gateway QA invoice creation failed.");

    const now = new Date().toISOString();
    const register = await fetch(`${LOCAL_URL}/api/payments/create`, {
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
    if (!register.ok) throw new Error(`Local invoice registration failed: ${await register.text()}`);

    browser = await chromium.launch({ headless: true });
    const context = await browser.newContext({
      viewport: { width: 390, height: 844 },
      recordVideo: { dir: resolve(OUT_DIR, "videos"), size: { width: 390, height: 844 } },
    });
    let currentChainId = baseSepolia.id;
    const sent = [];
    await context.exposeFunction("gatewayPayerRpc", async ({ method, params = [] }) => {
      if (method === "eth_accounts" || method === "eth_requestAccounts") return [payer.address];
      if (method === "eth_chainId") return `0x${currentChainId.toString(16)}`;
      if (method === "wallet_switchEthereumChain") {
        currentChainId = Number.parseInt(params[0].chainId, 16);
        if (![baseSepolia.id, ARC_CHAIN.id].includes(currentChainId)) {
          throw new Error("Gateway QA only permits Base Sepolia and Arc Testnet.");
        }
        return null;
      }
      if (method === "wallet_addEthereumChain") return null;
      if (method === "eth_signTypedData_v4") {
        const typed = typeof params[1] === "string" ? JSON.parse(params[1]) : params[1];
        const message = reviveGatewayTypedData(typed.message);
        return payer.signTypedData({
          domain: typed.domain,
          types: typed.types,
          primaryType: typed.primaryType,
          message,
        });
      }
      if (method === "eth_sendTransaction") {
        const tx = params[0];
        const wallet = createWalletClient({
          account: payer,
          chain: currentChainId === baseSepolia.id ? baseSepolia : ARC_CHAIN,
          transport: http(currentChainId === baseSepolia.id ? BASE_RPC_URL : ARC_RPC_URL),
        });
        const client = createPublicClient({
          chain: currentChainId === baseSepolia.id ? baseSepolia : ARC_CHAIN,
          transport: http(currentChainId === baseSepolia.id ? BASE_RPC_URL : ARC_RPC_URL),
        });
        const hash = await wallet.sendTransaction({
          to: getAddress(tx.to),
          data: tx.data,
          value: tx.value ? BigInt(tx.value) : undefined,
        });
        const receipt = await client.waitForTransactionReceipt({ hash, pollingInterval: 1_000 });
        if (receipt.status !== "success") throw new Error(`Gateway QA transaction reverted: ${hash}`);
        sent.push({ chainId: currentChainId, hash });
        return hash;
      }
      if (
        [
          "eth_call",
          "eth_getBalance",
          "eth_getBlockByNumber",
          "eth_getTransactionByHash",
          "eth_getTransactionCount",
          "eth_getTransactionReceipt",
          "eth_blockNumber",
          "eth_chainId",
          "eth_estimateGas",
          "eth_feeHistory",
          "eth_gasPrice",
          "eth_maxPriorityFeePerGas",
        ].includes(method)
      ) {
        return rpcRequest(currentChainId === baseSepolia.id ? BASE_RPC_URL : ARC_RPC_URL, method, params);
      }
      throw new Error(`Unsupported Gateway QA RPC method: ${method}`);
    });
    await context.addInitScript(({ address }) => {
      const listeners = new Map();
      const provider = {
        isMetaMask: true,
        request: async (request) => {
          const result = await window.gatewayPayerRpc(request);
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
          uuid: "350670db-19fa-4704-a166-e52e178b59d8",
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

    const page = await context.newPage();
    const paymentUrl = `${LOCAL_URL}/pay/${slug}`;
    await page.goto(paymentUrl, { waitUntil: "networkidle", timeout: 60_000 });
    await assertBody(page, /Gateway unified balance/i, "gateway route page");
    await page.getByRole("button", { name: /Gateway unified balance/i }).click();
    await page.screenshot({ path: resolve(OUT_DIR, "gateway-route-selected.png"), fullPage: true });
    await page.getByRole("button", { name: /Pay with unified balance/i }).click();
    try {
      await page.getByText("Paid", { exact: true }).waitFor({ timeout: 240_000 });
    } catch (error) {
      await page.screenshot({ path: resolve(OUT_DIR, "gateway-after-timeout.png"), fullPage: true });
      const body = (await page.locator("body").innerText({ timeout: 10_000 }).catch(() => "")) || "";
      throw new Error(`${error instanceof Error ? error.message : String(error)}\n\nPage body:\n${body}`);
    }
    await page.reload({ waitUntil: "networkidle", timeout: 60_000 });
    await assertBody(page, /View receipt|View verified receipt/i, "gateway paid refresh");
    await page.screenshot({ path: resolve(OUT_DIR, "gateway-paid.png"), fullPage: true });
    const { data, error } = await supabase.from("payment_links").select("*").eq("id", id).single();
    if (error || data?.status !== "paid" || data?.payment_method !== "unified-balance" || !data.tx_hash) {
      throw new Error(`Gateway payment persistence failed: ${error?.message || data?.status}`);
    }
    const receipt = await context.newPage();
    await receipt.goto(`${LOCAL_URL}/receipt/${id}`, { waitUntil: "networkidle", timeout: 60_000 });
    await assertBody(receipt, /Paid|Gateway/i, "gateway receipt");
    await receipt.screenshot({ path: resolve(OUT_DIR, "receipt.png"), fullPage: true });
    await context.close();

    const result = {
      status: "green",
      generatedAt: new Date().toISOString(),
      localUrl: LOCAL_URL,
      paymentUrl,
      receiptUrl: `${LOCAL_URL}/receipt/${id}`,
      amountUSDC: AMOUNT_USDC,
      deposit,
      createHash,
      transactions: sent,
      reconciledTxHash: data.tx_hash,
    };
    writeFileSync(resolve(OUT_DIR, "result.json"), `${stringify(result)}\n`);
    writeFileSync(
      resolve(OUT_DIR, "REPORT.md"),
      [
        "# OneLink Local QA - Gateway Unified Balance",
        "",
        `Generated: ${result.generatedAt}`,
        `Base URL: ${LOCAL_URL}`,
        "Status: green",
        "",
        "## Flow Proven",
        "",
        "| Step | Result |",
        "| --- | --- |",
        `| Gateway deposit available | ${deposit.deposited ? "green - deposited from Base Sepolia" : "green - existing funded balance"} |`,
        "| Gateway route exposed locally behind flag | green |",
        "| Gateway burn intent signed | green |",
        "| Gateway attestation returned | green |",
        "| Gateway minted on Arc | green |",
        "| OneLink settled on Arc | green |",
        "| Supabase receipt reconciled | green |",
        "",
      ].join("\n"),
    );
    console.log(`green ${resolve(OUT_DIR, "REPORT.md")}`);
  } finally {
    if (browser) await browser.close().catch(() => {});
    stopLocalServer(server);
  }
}

main().catch((error) => {
  mkdirSync(OUT_DIR, { recursive: true });
  const message = error instanceof Error ? error.stack || error.message : String(error);
  writeFileSync(resolve(OUT_DIR, "REPORT.md"), ["# OneLink Local QA - Gateway Unified Balance", "", "Status: red", "", "```txt", message, "```", ""].join("\n"));
  console.error(message);
  process.exit(1);
});
