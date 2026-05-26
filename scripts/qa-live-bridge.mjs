import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { AppKit } from "@circle-fin/app-kit";
import { createViemAdapterFromPrivateKey } from "@circle-fin/adapter-viem-v2";
import { createPublicClient, createWalletClient, erc20Abi, formatUnits, http } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { baseSepolia } from "viem/chains";

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

const OUT_DIR = resolve("docs", "test-results", "qa-live-bridge-base-arc");
const ARC_RPC_URL = process.env.ARC_TESTNET_RPC_URL || "https://rpc.testnet.arc.network";
const BASE_RPC_URL = process.env.BASE_SEPOLIA_RPC_URL || "https://sepolia.base.org";
const ARC_USDC = "0x3600000000000000000000000000000000000000";
const BASE_USDC = "0x036CbD53842c5426634e7929541eC2318f3dCF7e";
const AMOUNT_USDC = process.env.QA_BRIDGE_AMOUNT_USDC || "0.50";

function required(name) {
  const value = process.env[name];
  if (!value) throw new Error(`${name} is required`);
  return value;
}

function txLink(chain, hash) {
  if (!hash) return "-";
  const explorer = chain === "Base_Sepolia" ? "https://sepolia.basescan.org" : "https://testnet.arcscan.app";
  return `[${hash.slice(0, 10)}...](${explorer}/tx/${hash})`;
}

function flattenSteps(result) {
  return (result?.steps ?? []).map((step) => ({
    name: step.name,
    state: step.state,
    txHash: step.txHash ?? step.values?.txHash ?? null,
  }));
}

async function main() {
  mkdirSync(OUT_DIR, { recursive: true });
  const privateKey = required("QA_PAYER_PRIVATE_KEY");
  const account = privateKeyToAccount(privateKey);
  const baseClient = createPublicClient({ chain: baseSepolia, transport: http(BASE_RPC_URL) });
  const arcClient = createPublicClient({ chain: ARC_CHAIN, transport: http(ARC_RPC_URL) });
  const adapter = createViemAdapterFromPrivateKey({
    privateKey,
    getPublicClient: ({ chain }) =>
      createPublicClient({
        chain,
        transport: http(chain.id === 5042002 ? ARC_RPC_URL : BASE_RPC_URL),
      }),
    getWalletClient: ({ chain, account: adapterAccount }) =>
      createWalletClient({
        chain,
        account: adapterAccount,
        transport: http(chain.id === 5042002 ? ARC_RPC_URL : BASE_RPC_URL),
      }),
  });

  const [baseBefore, arcBefore] = await Promise.all([
    baseClient.readContract({ address: BASE_USDC, abi: erc20Abi, functionName: "balanceOf", args: [account.address] }),
    arcClient.readContract({ address: ARC_USDC, abi: erc20Abi, functionName: "balanceOf", args: [account.address] }),
  ]);

  const kit = new AppKit();
  const result = await kit.bridge({
    from: { adapter, chain: "Base_Sepolia" },
    to: { adapter, chain: "Arc_Testnet", recipientAddress: account.address },
    amount: AMOUNT_USDC,
  });

  const [baseAfter, arcAfter] = await Promise.all([
    baseClient.readContract({ address: BASE_USDC, abi: erc20Abi, functionName: "balanceOf", args: [account.address] }),
    arcClient.readContract({ address: ARC_USDC, abi: erc20Abi, functionName: "balanceOf", args: [account.address] }),
  ]);

  const steps = flattenSteps(result);
  const ok = result?.state === "success" || steps.some((step) => step.name === "mint" && step.state === "success");
  if (!ok) throw new Error(`Bridge did not finish successfully: ${JSON.stringify(result, null, 2)}`);

  const proof = {
    status: "green",
    generatedAt: new Date().toISOString(),
    wallet: account.address,
    route: "Base_Sepolia -> Arc_Testnet",
    amountUSDC: AMOUNT_USDC,
    state: result.state,
    balances: {
      baseBefore: formatUnits(baseBefore, 6),
      baseAfter: formatUnits(baseAfter, 6),
      arcBefore: formatUnits(arcBefore, 6),
      arcAfter: formatUnits(arcAfter, 6),
    },
    steps,
  };
  writeFileSync(resolve(OUT_DIR, "result.json"), `${JSON.stringify(proof, null, 2)}\n`);

  const report = [
    "# OneLink Live QA — Base Sepolia to Arc Bridge",
    "",
    `Generated: ${proof.generatedAt}`,
    `Status: ${proof.status}`,
    `Wallet: \`${proof.wallet}\``,
    `Route: \`${proof.route}\``,
    `Amount requested: \`${AMOUNT_USDC} USDC\``,
    "",
    "## Balance Truth",
    "",
    `- Base USDC: \`${proof.balances.baseBefore}\` -> \`${proof.balances.baseAfter}\``,
    `- Arc USDC: \`${proof.balances.arcBefore}\` -> \`${proof.balances.arcAfter}\``,
    "",
    "## App Kit Steps",
    "",
    "| Step | State | Tx |",
    "| --- | --- | --- |",
    ...steps.map((step) => `| ${step.name} | ${step.state} | ${txLink(step.name === "mint" ? "Arc_Testnet" : "Base_Sepolia", step.txHash)} |`),
    "",
    "## Truth Notes",
    "",
    "- This proves Circle App Kit can bridge funded Base Sepolia USDC into Arc Testnet for the QA payer wallet.",
    "- This is a programmatic App Kit proof. Browser-wallet route selection still needs Rabby/AppKit popup automation for full human-like UI proof.",
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
    ["# OneLink Live QA — Base Sepolia to Arc Bridge", "", "Status: red", "", "```txt", message, "```", ""].join("\n"),
  );
  console.error(message);
  process.exit(1);
});
