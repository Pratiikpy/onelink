import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { request as httpsRequest } from "node:https";
import { resolve } from "node:path";
import {
  createPublicClient,
  createWalletClient,
  decodeEventLog,
  erc20Abi,
  formatEther,
  formatUnits,
  getAddress,
  http,
  isAddressEqual,
  keccak256,
  parseUnits,
  stringToHex,
} from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { createClient } from "@supabase/supabase-js";

function loadEnv(path = ".env.local") {
  try {
    const raw = readFileSync(path, "utf8");
    for (const line of raw.split(/\r?\n/)) {
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
const ARC_EXPLORER = "https://testnet.arcscan.app";
const ARC_USDC = "0x3600000000000000000000000000000000000000";
const configuredAppUrl = process.env.PLAYWRIGHT_BASE_URL || process.env.NEXT_PUBLIC_APP_URL || "";
const LIVE_URL =
  configuredAppUrl && !configuredAppUrl.includes("localhost")
    ? configuredAppUrl
    : "https://onelink-mauve-nu.vercel.app";
const OUT_DIR = resolve("docs", "test-results", "qa-live-direct");
const AMOUNT_USDC = process.env.QA_AMOUNT_USDC || "0.25";

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
  {
    type: "function",
    name: "payLink",
    stateMutability: "nonpayable",
    inputs: [{ name: "linkId", type: "bytes32" }],
    outputs: [],
  },
  {
    type: "function",
    name: "getLink",
    stateMutability: "view",
    inputs: [{ name: "linkId", type: "bytes32" }],
    outputs: [
      {
        type: "tuple",
        components: [
          { name: "creator", type: "address" },
          { name: "recipient", type: "address" },
          { name: "amount", type: "uint256" },
          { name: "expiresAt", type: "uint64" },
          { name: "paid", type: "bool" },
          { name: "cancelled", type: "bool" },
        ],
      },
    ],
  },
  {
    type: "event",
    name: "PaymentCompleted",
    inputs: [
      { name: "linkId", type: "bytes32", indexed: true },
      { name: "payer", type: "address", indexed: true },
      { name: "recipient", type: "address", indexed: true },
      { name: "grossAmount", type: "uint256", indexed: false },
      { name: "feeAmount", type: "uint256", indexed: false },
    ],
  },
];

function required(name) {
  const value = process.env[name];
  if (!value) throw new Error(`${name} is required`);
  return value;
}

function mdTable(rows) {
  if (rows.length === 0) return "";
  const [head, ...body] = rows;
  const separator = head.map(() => "---");
  return [head, separator, ...body].map((row) => `| ${row.join(" | ")} |`).join("\n");
}

async function withTimeout(promise, label, timeoutMs = 180_000) {
  let timer;
  const timeout = new Promise((_, reject) => {
    timer = setTimeout(() => reject(new Error(`${label} timed out after ${timeoutMs}ms`)), timeoutMs);
  });
  try {
    return await Promise.race([promise, timeout]);
  } finally {
    clearTimeout(timer);
  }
}

function postJson(url, body, timeoutMs = 90_000) {
  return new Promise((resolvePromise, reject) => {
    const parsed = new URL(url);
    const payload = JSON.stringify(body);
    const req = httpsRequest(
      {
        hostname: parsed.hostname,
        path: `${parsed.pathname}${parsed.search}`,
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Content-Length": Buffer.byteLength(payload),
        },
        timeout: timeoutMs,
      },
      (res) => {
        let data = "";
        res.setEncoding("utf8");
        res.on("data", (chunk) => {
          data += chunk;
        });
        res.on("end", () => {
          let json = {};
          try {
            json = data ? JSON.parse(data) : {};
          } catch {
            json = { raw: data };
          }
          resolvePromise({ ok: (res.statusCode ?? 0) >= 200 && (res.statusCode ?? 0) < 300, status: res.statusCode, json });
        });
      },
    );
    req.on("timeout", () => {
      req.destroy(new Error(`POST ${url} timed out after ${timeoutMs}ms`));
    });
    req.on("error", reject);
    req.write(payload);
    req.end();
  });
}

async function main() {
  mkdirSync(OUT_DIR, { recursive: true });

  const contractAddress = getAddress(required("NEXT_PUBLIC_ONELINK_CONTRACT_ADDRESS"));
  const creatorKey = required("DEPLOYER_PRIVATE_KEY");
  const payerKey = required("QA_PAYER_PRIVATE_KEY");
  const supabaseUrl = required("NEXT_PUBLIC_SUPABASE_URL");
  const supabaseAnon = required("NEXT_PUBLIC_SUPABASE_ANON_KEY");
  const supabaseServiceRole = required("SUPABASE_SERVICE_ROLE_KEY");

  const creator = privateKeyToAccount(creatorKey);
  const payer = privateKeyToAccount(payerKey);
  const publicClient = createPublicClient({ chain: ARC_CHAIN, transport: http(ARC_RPC_URL) });
  const creatorClient = createWalletClient({ account: creator, chain: ARC_CHAIN, transport: http(ARC_RPC_URL) });
  const payerClient = createWalletClient({ account: payer, chain: ARC_CHAIN, transport: http(ARC_RPC_URL) });
  const supabase = createClient(supabaseUrl, supabaseAnon, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  const admin = createClient(supabaseUrl, supabaseServiceRole, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const startedAt = new Date();
  const stamp = startedAt.toISOString().replace(/[-:.TZ]/g, "").slice(0, 14);
  const id = crypto.randomUUID();
  const slug = `qa-live-${stamp}`;
  const linkId = keccak256(stringToHex(`onelink:${slug}`));
  const amount = parseUnits(AMOUNT_USDC, 6);
  const now = startedAt.toISOString();

  const [creatorGas, payerGas, payerUsdc] = await Promise.all([
    publicClient.getBalance({ address: creator.address }),
    publicClient.getBalance({ address: payer.address }),
    publicClient.readContract({ address: ARC_USDC, abi: erc20Abi, functionName: "balanceOf", args: [payer.address] }),
  ]);

  if (payerUsdc < amount) {
    throw new Error(`QA payer has ${formatUnits(payerUsdc, 6)} USDC, needs ${AMOUNT_USDC}`);
  }

  const createHash = await creatorClient.writeContract({
    address: contractAddress,
    abi: oneLinkAbi,
    functionName: "createLink",
    args: [linkId, creator.address, amount, 0n],
  });
  const createReceipt = await withTimeout(
    publicClient.waitForTransactionReceipt({ hash: createHash, pollingInterval: 1_000 }),
    `createLink receipt ${createHash}`,
  );
  if (createReceipt.status !== "success") throw new Error(`createLink reverted: ${createHash}`);

  const forgedId = crypto.randomUUID();
  const { error: forgedInvoiceError } = await supabase.from("payment_links").insert({
    id: forgedId,
    slug: `forged-invoice-${stamp}`,
    creator_wallet: creator.address,
    recipient_wallet: creator.address,
    amount_usdc: AMOUNT_USDC,
    memo: "Forged standard invoice must be rejected",
    status: "unpaid",
    expires_at: null,
    contract_link_id: keccak256(stringToHex(`onelink:forged-invoice-${stamp}`)),
    settlement_mode: "invoice",
    created_at: now,
    updated_at: now,
  });
  if (!forgedInvoiceError) {
    await admin.from("payment_links").delete().eq("id", forgedId);
    throw new Error("Anonymous standard invoice insertion was not rejected by RLS.");
  }

  const createRegistration = await postJson(`${LIVE_URL}/api/payments/create`, {
    link: {
      id,
      slug,
      creatorWallet: creator.address,
      recipientWallet: creator.address,
      amountUSDC: AMOUNT_USDC,
      memo: `Live QA direct Arc payment ${stamp}`,
      status: "unpaid",
      expiresAt: null,
      contractLinkId: linkId,
      settlementMode: "invoice",
      createdAt: now,
      updatedAt: now,
    },
    txHash: createHash,
  });
  if (!createRegistration.ok) {
    throw new Error(`Live invoice registration failed (${createRegistration.status}): ${JSON.stringify(createRegistration.json)}`);
  }

  const approveHash = await payerClient.writeContract({
    address: ARC_USDC,
    abi: erc20Abi,
    functionName: "approve",
    args: [contractAddress, amount],
  });
  const approveReceipt = await withTimeout(
    publicClient.waitForTransactionReceipt({ hash: approveHash, pollingInterval: 1_000 }),
    `approve receipt ${approveHash}`,
  );
  if (approveReceipt.status !== "success") throw new Error(`approve reverted: ${approveHash}`);

  const payHash = await payerClient.writeContract({
    address: contractAddress,
    abi: oneLinkAbi,
    functionName: "payLink",
    args: [linkId],
  });
  const payReceipt = await withTimeout(
    publicClient.waitForTransactionReceipt({ hash: payHash, pollingInterval: 1_000 }),
    `payLink receipt ${payHash}`,
  );
  if (payReceipt.status !== "success") throw new Error(`payLink reverted: ${payHash}`);

  const event = payReceipt.logs
    .map((log) => {
      try {
        return decodeEventLog({ abi: oneLinkAbi, data: log.data, topics: log.topics });
      } catch {
        return null;
      }
    })
    .find((decoded) => decoded?.eventName === "PaymentCompleted");
  if (!event) throw new Error(`PaymentCompleted event missing from ${payHash}`);

  if (!isAddressEqual(event.args.payer, payer.address) || !isAddressEqual(event.args.recipient, creator.address)) {
    throw new Error("PaymentCompleted event payer/recipient mismatch");
  }

  const reconcile = await postJson(`${LIVE_URL}/api/payments/reconcile`, {
    id,
    txHash: payHash,
    payerWallet: payer.address,
    paymentMethod: "arc-direct",
    sourceChain: "Arc_Testnet",
  });
  const reconcilePayload = reconcile.json;
  if (!reconcile.ok) {
    throw new Error(`Live reconcile failed (${reconcile.status}): ${JSON.stringify(reconcilePayload)}`);
  }

  const { data: row, error: loadError } = await supabase.from("payment_links").select("*").eq("id", id).single();
  if (loadError) throw new Error(`Supabase reload failed: ${loadError.message}`);
  if (row.status !== "paid") throw new Error(`Expected paid row, got ${row.status}`);
  if (row.tx_hash?.toLowerCase() !== payHash.toLowerCase()) throw new Error("Supabase tx_hash mismatch");

  const contractLink = await publicClient.readContract({
    address: contractAddress,
    abi: oneLinkAbi,
    functionName: "getLink",
    args: [linkId],
  });
  if (!contractLink.paid) throw new Error("Contract link is not paid after payLink");

  const result = {
    status: "green",
    generatedAt: new Date().toISOString(),
    liveUrl: LIVE_URL,
    paymentUrl: `${LIVE_URL}/pay/${slug}`,
    receiptUrl: `${LIVE_URL}/receipt/${id}`,
    arcscan: `${ARC_EXPLORER}/tx/${payHash}`,
    creator: creator.address,
    payer: payer.address,
    amountUSDC: AMOUNT_USDC,
    id,
    slug,
    linkId,
    createHash,
    approveHash,
    payHash,
    balancesBefore: {
      creatorNativeUSDC18: formatEther(creatorGas),
      payerNativeUSDC18: formatEther(payerGas),
      payerErc20USDC6: formatUnits(payerUsdc, 6),
    },
    supabaseRow: {
      status: row.status,
      tx_hash: row.tx_hash,
      payer_wallet: row.payer_wallet,
      payment_method: row.payment_method,
      source_chain: row.source_chain,
    },
  };

  writeFileSync(resolve(OUT_DIR, "result.json"), `${JSON.stringify(result, null, 2)}\n`);

  const report = [
    "# OneLink Live QA — Arc Direct Payment",
    "",
    `Generated: ${result.generatedAt}`,
    `Base URL: ${LIVE_URL}`,
    `Status: ${result.status}`,
    "",
    "## Flow Proven",
    "",
    mdTable([
      ["Check", "Result", "Evidence"],
      ["Forged invoice insertion", "green", "Anonymous standard invoice row rejected by RLS"],
      ["Creator contract link", "green", `[createLink](${ARC_EXPLORER}/tx/${createHash})`],
      ["Verified shared invoice", "green", `Live \`/api/payments/create\` verified and registered \`${slug}\``],
      ["Payer USDC approval", "green", `[approve](${ARC_EXPLORER}/tx/${approveHash})`],
      ["Arc settlement", "green", `[payLink](${ARC_EXPLORER}/tx/${payHash})`],
      ["Server reconciliation", "green", `Live \`/api/payments/reconcile\` accepted tx and wrote \`paid\``],
      ["Persistence after reload", "green", `Supabase row reloaded with status \`${row.status}\``],
    ]),
    "",
    "## Wallets",
    "",
    `- Creator/recipient: \`${creator.address}\``,
    `- Payer: \`${payer.address}\``,
    `- Amount: \`${AMOUNT_USDC} USDC\``,
    "",
    "## Links",
    "",
    `- Payment URL: ${result.paymentUrl}`,
    `- Receipt URL: ${result.receiptUrl}`,
    `- Arcscan settlement: ${result.arcscan}`,
    "",
    "## Truth Notes",
    "",
    "- This proves the direct Arc route with real Arc Testnet transactions.",
    "- It does not prove the Base Sepolia bridge route or Gateway route.",
    "- It is transaction-level live QA, not visual Rabby browser automation.",
    "",
  ].join("\n");
  writeFileSync(resolve(OUT_DIR, "REPORT.md"), report);

  console.log(`green ${payHash}`);
  console.log(`report ${resolve(OUT_DIR, "REPORT.md")}`);
}

main().catch((error) => {
  mkdirSync(OUT_DIR, { recursive: true });
  const message = error instanceof Error ? error.stack || error.message : String(error);
  writeFileSync(
    resolve(OUT_DIR, "REPORT.md"),
    ["# OneLink Live QA — Arc Direct Payment", "", "Status: red", "", "```txt", message, "```", ""].join("\n"),
  );
  console.error(message);
  process.exit(1);
});
