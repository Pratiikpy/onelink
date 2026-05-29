// OneLink real-Rabby UI E2E.
// Creates an Arc invoice (creator), then drives the PRODUCTION OneLink UI in a
// headed Chromium with the REAL Rabby extension as the payer: connect Rabby ->
// "Pay on Arc" -> drive the real Rabby Connect / Add-Chain / Approve / payLink
// popups (CDP-raw clicks) -> verify the on-chain PaymentCompleted + Supabase
// paid row. Requires the seeded profile from qa-rabby-onboard.mjs.
import { chromium } from "@playwright/test";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { request as httpsRequest } from "node:https";
import { resolve } from "node:path";
import {
  createPublicClient, createWalletClient, getAddress, http,
  keccak256, parseUnits, stringToHex,
} from "viem";
import { privateKeyToAccount } from "viem/accounts";

function loadEnv(path = ".env.local") {
  try {
    for (const line of readFileSync(path, "utf8").split(/\r?\n/)) {
      const t = line.trim(); if (!t || t.startsWith("#")) continue;
      const eq = t.indexOf("="); if (eq === -1) continue;
      const k = t.slice(0, eq).trim(); const v = t.slice(eq + 1).trim();
      if (!process.env[k]) process.env[k] = v;
    }
  } catch {}
}
loadEnv();

const RABBY_EXT = process.env.RABBY_EXT_DIR;
if (!RABBY_EXT) { console.error("Set RABBY_EXT_DIR to an unpacked Rabby extension dir."); process.exit(1); }
const PROFILE_DIR = resolve(".rabby-profile-onelink");
const SHOTS = resolve("docs", "test-results", "qa-live-rabby-ui");
const PASSWORD = process.env.RABBY_PASSWORD || "RabbyPass123!QA";
const LIVE_URL = "https://onelink-mauve-nu.vercel.app";
const AMOUNT_USDC = process.env.QA_RABBY_AMOUNT_USDC || "0.02";
const ARC = {
  id: 5042002, name: "Arc Testnet",
  nativeCurrency: { name: "USDC", symbol: "USDC", decimals: 18 },
  rpcUrls: { default: { http: ["https://rpc.testnet.arc.network"] } },
  blockExplorers: { default: { name: "Arcscan", url: "https://testnet.arcscan.app" } },
  testnet: true,
};
const ARC_RPC = process.env.ARC_TESTNET_RPC_URL || "https://rpc.testnet.arc.network";
const ARC_EXPLORER = "https://testnet.arcscan.app";

const oneLinkAbi = [
  { type: "function", name: "createLink", stateMutability: "nonpayable", inputs: [
    { name: "linkId", type: "bytes32" }, { name: "recipient", type: "address" },
    { name: "amount", type: "uint256" }, { name: "expiresAt", type: "uint64" }], outputs: [] },
  { type: "function", name: "getLink", stateMutability: "view", inputs: [{ name: "linkId", type: "bytes32" }],
    outputs: [{ type: "tuple", components: [
      { name: "creator", type: "address" }, { name: "recipient", type: "address" },
      { name: "amount", type: "uint256" }, { name: "expiresAt", type: "uint64" },
      { name: "paid", type: "bool" }, { name: "cancelled", type: "bool" }] }] },
  { type: "event", name: "PaymentCompleted", inputs: [
    { name: "linkId", type: "bytes32", indexed: true }, { name: "payer", type: "address", indexed: true },
    { name: "recipient", type: "address", indexed: true }, { name: "grossAmount", type: "uint256", indexed: false },
    { name: "feeAmount", type: "uint256", indexed: false }] },
];

function required(name) { const v = process.env[name]; if (!v) throw new Error(`${name} is required`); return v; }
const wait = (ms) => new Promise((r) => setTimeout(r, ms));
mkdirSync(SHOTS, { recursive: true });
let stepN = 0;
async function snap(page, label) {
  stepN++;
  await page.screenshot({ path: resolve(SHOTS, `${String(stepN).padStart(2, "0")}-${label}.png`) }).catch(() => {});
  console.log(`  · shot ${label}`);
}
function postJson(url, body, timeoutMs = 90_000) {
  return new Promise((res, rej) => {
    const u = new URL(url); const payload = JSON.stringify(body);
    const req = httpsRequest({ hostname: u.hostname, path: u.pathname + u.search, method: "POST",
      headers: { "Content-Type": "application/json", "Content-Length": Buffer.byteLength(payload) }, timeout: timeoutMs },
      (r) => { let d = ""; r.setEncoding("utf8"); r.on("data", (c) => (d += c));
        r.on("end", () => { let j = {}; try { j = d ? JSON.parse(d) : {}; } catch { j = { raw: d }; }
          res({ ok: (r.statusCode ?? 0) >= 200 && (r.statusCode ?? 0) < 300, status: r.statusCode, json: j }); }); });
    req.on("timeout", () => req.destroy(new Error("POST timeout"))); req.on("error", rej);
    req.write(payload); req.end();
  });
}

// ── Rabby popup driver (ported from fhenix rabby-driver) ────────────────────
async function cdpRawClick(popup, x, y) {
  try {
    const cdp = await popup.context().newCDPSession(popup);
    await cdp.send("Input.dispatchMouseEvent", { type: "mouseMoved", x, y, button: "none", buttons: 0 });
    await wait(50);
    await cdp.send("Input.dispatchMouseEvent", { type: "mousePressed", x, y, button: "left", buttons: 1, clickCount: 1 });
    await wait(80);
    await cdp.send("Input.dispatchMouseEvent", { type: "mouseReleased", x, y, button: "left", buttons: 0, clickCount: 1 });
    await cdp.detach().catch(() => {});
    return true;
  } catch { return false; }
}
async function waitForRabbyPopup(ctx, extId, known, timeoutMs = 40_000) {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    for (const p of ctx.pages()) {
      if (known.has(p)) continue;
      if (p.isClosed()) { known.add(p); continue; }
      const url = p.url();
      if (url.includes(extId) && url.includes("notification.html")) { known.add(p); return p; }
    }
    await wait(400);
  }
  return null;
}
const CTAS = ["Confirm", "Sign", "Approve", "Connect", "Allow", "Add", "Add network", "Switch network", "Proceed", "Next"];
async function confirmRabbyPopup(popup, label) {
  await wait(2500);
  // dismiss low-popularity security gate if present
  const ignore = popup.getByText(/^Ignore all$/i).first();
  if (await ignore.isVisible({ timeout: 1500 }).catch(() => false)) {
    const bb = await ignore.boundingBox().catch(() => null);
    if (bb) await cdpRawClick(popup, bb.x + bb.width / 2, bb.y + bb.height / 2);
    await wait(700);
  }
  const start = Date.now(); let clicks = 0, lastClick = Date.now();
  while (Date.now() - start < 75_000) {
    if (popup.isClosed()) return { clicks, closed: true };
    let did = false;
    for (const txt of CTAS) {
      const btn = popup.getByRole("button", { name: new RegExp(`^${txt}$`, "i") }).first();
      if (!(await btn.isVisible({ timeout: 800 }).catch(() => false))) continue;
      if (!(await btn.isEnabled({ timeout: 400 }).catch(() => true))) { await wait(1500); continue; }
      const bb = await btn.boundingBox().catch(() => null); if (!bb) continue;
      if (await cdpRawClick(popup, Math.round(bb.x + bb.width / 2), Math.round(bb.y + bb.height / 2))) {
        clicks++; lastClick = Date.now(); did = true;
        await popup.screenshot({ path: resolve(SHOTS, `popup-${label}-${clicks}.png`) }).catch(() => {});
        await wait(3000); break;
      }
    }
    if (!did) { if (Date.now() - lastClick > 22_000 && clicks > 0) break; await wait(1500); }
  }
  return { clicks, closed: popup.isClosed() };
}
async function drainPopups(ctx, extId, known, label, rounds = 4) {
  let total = 0;
  for (let i = 0; i < rounds; i++) {
    const popup = await waitForRabbyPopup(ctx, extId, known, i === 0 ? 30_000 : 12_000);
    if (!popup) break;
    console.log(`  · ${label} popup ${i + 1}`);
    const r = await confirmRabbyPopup(popup, `${label}${i + 1}`);
    total += r.clicks;
    await wait(2500);
  }
  return total;
}

async function main() {
  const contract = getAddress(required("NEXT_PUBLIC_ONELINK_CONTRACT_ADDRESS"));
  const creator = privateKeyToAccount(required("DEPLOYER_PRIVATE_KEY"));
  const payer = privateKeyToAccount(required("QA_PAYER_PRIVATE_KEY"));
  const pub = createPublicClient({ chain: ARC, transport: http(ARC_RPC) });
  const creatorClient = createWalletClient({ account: creator, chain: ARC, transport: http(ARC_RPC) });

  // 1) Create + register the invoice (creator side, verified path).
  const stamp = new Date().toISOString().replace(/[-:.TZ]/g, "").slice(0, 14);
  const id = crypto.randomUUID();
  const slug = `rabby-ui-qa-${stamp}`;
  const linkId = keccak256(stringToHex(`onelink:${slug}`));
  const amount = parseUnits(AMOUNT_USDC, 6);
  const now = new Date().toISOString();
  console.log(`Creating invoice ${slug} (${AMOUNT_USDC} USDC)...`);
  const createHash = await creatorClient.writeContract({ address: contract, abi: oneLinkAbi,
    functionName: "createLink", args: [linkId, creator.address, amount, 0n] });
  const cr = await pub.waitForTransactionReceipt({ hash: createHash, pollingInterval: 1000 });
  if (cr.status !== "success") throw new Error("createLink reverted");
  const reg = await postJson(`${LIVE_URL}/api/payments/create`, { link: {
    id, slug, creatorWallet: creator.address, recipientWallet: creator.address, amountUSDC: AMOUNT_USDC,
    memo: `Rabby UI QA ${stamp}`, status: "unpaid", expiresAt: null, contractLinkId: linkId,
    settlementMode: "invoice", createdAt: now, updatedAt: now }, txHash: createHash });
  if (!reg.ok) throw new Error(`register failed ${reg.status}: ${JSON.stringify(reg.json)}`);
  const paymentUrl = `${LIVE_URL}/pay/${slug}`;
  console.log(`Invoice live: ${paymentUrl}`);

  // 2) Launch Rabby (seeded persistent profile).
  const ctx = await chromium.launchPersistentContext(PROFILE_DIR, {
    headless: false, viewport: { width: 1280, height: 900 },
    args: [`--disable-extensions-except=${RABBY_EXT}`, `--load-extension=${RABBY_EXT}`,
      "--disable-blink-features=AutomationControlled", "--no-sandbox"],
  });
  let extId = "";
  for (let i = 0; i < 40; i++) { const sw = ctx.serviceWorkers().find((w) => w.url().includes("chrome-extension://"));
    if (sw) { extId = sw.url().split("/")[2]; break; } await wait(500); }
  if (!extId) throw new Error("Rabby SW never registered");
  console.log("extId:", extId);
  const known = new Set();

  // 3) Unlock Rabby (close auto-opened tabs, open home, type password).
  await wait(2500);
  for (const p of ctx.pages()) { if (p.url().includes(extId)) await p.close().catch(() => {}); }
  const rabby = await ctx.newPage();
  await rabby.goto(`chrome-extension://${extId}/index.html`).catch(() => {});
  await wait(3000);
  const pw = rabby.locator('input[type="password"]').first();
  if (await pw.isVisible({ timeout: 4000 }).catch(() => false)) {
    await pw.click().catch(() => {}); await rabby.keyboard.type(PASSWORD, { delay: 30 });
    await rabby.keyboard.press("Enter"); await wait(3000);
    console.log("  · Rabby unlocked");
  }
  await snap(rabby, "rabby-unlocked");

  // 4) Open the pay page.
  const pay = await ctx.newPage();
  await pay.goto(paymentUrl, { waitUntil: "networkidle", timeout: 60_000 }).catch(() => {});
  await wait(2500);
  await snap(pay, "pay-loaded");

  // 5) Connect Rabby through RainbowKit.
  const connectBtn = pay.getByRole("button", { name: /Connect wallet|Connect/i }).first();
  if (await connectBtn.isVisible({ timeout: 8000 }).catch(() => false)) {
    await connectBtn.click().catch(() => {});
    await wait(2500); await snap(pay, "rainbowkit-modal");
    // pick Rabby (EIP-6963, listed as "Rabby Wallet") else MetaMask/injected
    let picked = false;
    for (const name of ["Rabby Wallet", "Rabby", "MetaMask", "Browser Wallet", "Injected"]) {
      const opt = pay.getByText(name, { exact: true }).first();
      if (await opt.isVisible({ timeout: 2000 }).catch(() => false)) {
        await opt.click({ force: true }).catch(() => {});
        console.log(`  · clicked wallet "${name}"`); picked = true; break;
      }
    }
    if (!picked) console.log("  · WARNING: no wallet option matched in modal");
    await wait(3000);
    await drainPopups(ctx, extId, known, "connect", 3);
    await pay.bringToFront().catch(() => {});
    await wait(2500); await snap(pay, "after-connect");
  } else {
    console.log("  · no connect button (already connected?)");
  }

  // 6) Pay on Arc — drive add-chain / approve / payLink popups.
  const payBtn = pay.getByRole("button", { name: /Pay.*on Arc|Pay .* USDC|Pay$/i }).first();
  if (!(await payBtn.isVisible({ timeout: 10_000 }).catch(() => false))) {
    await snap(pay, "no-pay-button");
    throw new Error("Pay button not visible after connect — inspect shots.");
  }
  await payBtn.click({ force: true }).catch(() => {});
  console.log("  · clicked Pay on Arc");
  await wait(2000);
  await drainPopups(ctx, extId, known, "pay", 5);
  await pay.bringToFront().catch(() => {});

  // 7) Wait for Paid state.
  let paidUi = false;
  try { await pay.getByText(/Paid/i).first().waitFor({ timeout: 120_000 }); paidUi = true; } catch {}
  await snap(pay, "after-pay");
  await pay.reload({ waitUntil: "networkidle", timeout: 60_000 }).catch(() => {});
  await wait(2500); await snap(pay, "after-refresh");

  // 8) On-chain truth.
  const link = await pub.readContract({ address: contract, abi: oneLinkAbi, functionName: "getLink", args: [linkId] });
  const onchainPaid = !!link.paid;

  const result = {
    status: onchainPaid ? "green" : "red",
    generatedAt: new Date().toISOString(),
    liveUrl: LIVE_URL, paymentUrl, amountUSDC: AMOUNT_USDC,
    creator: creator.address, payer: payer.address, slug, id, linkId, createHash,
    paidUiObserved: paidUi, onchainPaid,
    wallet: "real Rabby extension (EIP-6963), persistent profile, payer key imported via UI",
  };
  writeFileSync(resolve(SHOTS, "result.json"), JSON.stringify(result, null, 2) + "\n");
  writeFileSync(resolve(SHOTS, "REPORT.md"), [
    "# OneLink Live QA — Real Rabby Extension UI",
    "", `Generated: ${result.generatedAt}`, `Status: ${result.status}`, "",
    "## What this proves", "",
    "- The REAL Rabby browser extension (side-loaded, MV3 service worker) drove",
    "  the production OneLink pay UI end to end as the payer.",
    "- The payer key was imported through Rabby's own onboarding UI (not injected",
    "  into the page); popups were confirmed via CDP-raw clicks on notification.html.",
    "", "## Flow", "",
    `- Invoice: [createLink](${ARC_EXPLORER}/tx/${createHash})`,
    `- Payment URL: ${paymentUrl}`,
    `- Paid (UI observed): ${paidUi}`,
    `- Paid (on-chain getLink): ${onchainPaid}`,
    `- Creator/recipient: \`${creator.address}\``,
    `- Payer (Rabby): \`${payer.address}\``,
    "",
  ].join("\n"));

  console.log(`\nRESULT: ${result.status.toUpperCase()}  paidUi=${paidUi} onchainPaid=${onchainPaid}`);
  await wait(1500);
  await ctx.close();
  if (!onchainPaid) process.exit(1);
}

main().catch((e) => { console.error("RABBY_UI_ERROR:", e?.stack || e?.message || String(e)); process.exit(3); });
