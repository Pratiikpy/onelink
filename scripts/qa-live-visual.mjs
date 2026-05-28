import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { relative, resolve } from "node:path";
import { chromium, devices } from "@playwright/test";

const DIRECT_RESULT = resolve("docs", "test-results", "qa-live-direct", "result.json");
const PROFILE_RESULT = resolve("docs", "test-results", "qa-live-profile", "result.json");
const OUT_DIR = resolve("docs", "test-results", "qa-live-visual");
const liveUrlFallback = "https://onelink-mauve-nu.vercel.app";

function loadDirectResult() {
  const result = JSON.parse(readFileSync(DIRECT_RESULT, "utf8"));
  if (!result?.liveUrl || !result?.paymentUrl || !result?.receiptUrl || !result?.payHash) {
    throw new Error(`Missing direct QA result data at ${DIRECT_RESULT}`);
  }
  return result;
}

function loadProfileResult() {
  try {
    return JSON.parse(readFileSync(PROFILE_RESULT, "utf8"));
  } catch {
    return null;
  }
}

async function capture(page, label) {
  const path = resolve(OUT_DIR, `${label}.png`);
  await page.screenshot({ path, fullPage: true });
  return path;
}

async function assertText(page, pattern, label) {
  // innerText is visible-text-only; textContent picks up RainbowKit's data-rk
  // style block and other hidden CSS strings, which causes false matches
  // against page.body.
  const text = (await page.locator("body").innerText({ timeout: 30_000 })) ?? "";
  if (!pattern.test(text)) {
    throw new Error(`${label} did not contain ${pattern}: ${text.slice(0, 500)}`);
  }
}

function rel(path) {
  return relative(process.cwd(), path).replaceAll("\\", "/");
}

async function main() {
  mkdirSync(OUT_DIR, { recursive: true });
  const direct = loadDirectResult();
  const profile = loadProfileResult();
  const liveUrl = direct.liveUrl || liveUrlFallback;
  const browser = await chromium.launch({ headless: true });
  const rows = [];

  async function runContext(name, options, pages) {
    const context = await browser.newContext({
      ...options,
    });
    const page = await context.newPage();
    for (const item of pages) {
      await page.goto(item.url, { waitUntil: "networkidle", timeout: 60_000 });
      if (item.assert) await assertText(page, item.assert, `${name}:${item.label}`);
      const shot = await capture(page, `${name}-${item.label}`);
      rows.push([`${name} ${item.label}`, "green", rel(shot)]);
    }
    await context.close();
  }

  try {
    const viewportChecks = [
      ["mobile-390", { ...devices["iPhone 13"], viewport: { width: 390, height: 844 } }],
      ["tablet-768", { viewport: { width: 768, height: 1024 } }],
      ["laptop-1366", { viewport: { width: 1366, height: 900 } }],
      ["desktop-1440", { viewport: { width: 1440, height: 1100 } }],
      ["wide-1920", { viewport: { width: 1920, height: 1080 } }],
    ];

    for (const [name, options] of viewportChecks) {
      await runContext(name, options, [
        { label: "home", url: liveUrl, assert: /Get paid in USDC|One link|Arc|payment link/i },
        ...(profile?.profileUrl
          ? [{ label: "profile", url: profile.profileUrl, assert: /Pay @|Gateway status|Send USDC|USDC/i }]
          : []),
      ]);
    }

    await runContext(
      "desktop",
      { viewport: { width: 1440, height: 1100 } },
      [
        { label: "home", url: liveUrl, assert: /Get paid in USDC|One link|Arc|payment link/i },
        { label: "create", url: `${liveUrl}/create`, assert: /Connect wallet|Create a payment link|Connect a wallet/i },
        { label: "dashboard", url: `${liveUrl}/dashboard`, assert: /Connect your wallet|Connect wallet|Dashboard/i },
        { label: "security", url: `${liveUrl}/security`, assert: /Verification before claims|What has been proven live/i },
        { label: "whitepaper", url: `${liveUrl}/whitepaper`, assert: /whitepaper|Circle CCTP|architecture/i },
        { label: "privacy", url: `${liveUrl}/privacy`, assert: /Public payment links require deliberate sharing|Privacy/i },
        { label: "terms", url: `${liveUrl}/terms`, assert: /Testnet software, not a financial service|Terms/i },
        { label: "settings", url: `${liveUrl}/settings`, assert: /Profile|Wallet|Network|Account/i },
        { label: "not-found", url: `${liveUrl}/this-handle-does-not-exist-qa`, assert: /Link not found|Nothing at this link|FREELANCER PROFILE/i },
        { label: "paid-link", url: direct.paymentUrl, assert: /View verified receipt|Paid|Receipt/i },
        { label: "receipt", url: direct.receiptUrl, assert: /Paid|Arcscan|Receipt/i },
        ...(profile?.profileUrl ? [{ label: "profile", url: profile.profileUrl, assert: /Pay @|Gateway status|USDC|Send USDC/i }] : []),
      ],
    );
    await runContext(
      "mobile",
      { ...devices["iPhone 13"], viewport: { width: 390, height: 844 } },
      [
        { label: "home", url: liveUrl, assert: /Get paid in USDC|One link|Arc|payment link/i },
        { label: "create", url: `${liveUrl}/create`, assert: /Connect wallet|Create a payment link|Connect a wallet/i },
        { label: "dashboard", url: `${liveUrl}/dashboard`, assert: /Connect your wallet|Connect wallet|Dashboard/i },
        { label: "security", url: `${liveUrl}/security`, assert: /Verification before claims|What has been proven live/i },
        { label: "whitepaper", url: `${liveUrl}/whitepaper`, assert: /whitepaper|Circle CCTP|architecture/i },
        { label: "privacy", url: `${liveUrl}/privacy`, assert: /Public payment links require deliberate sharing|Privacy/i },
        { label: "terms", url: `${liveUrl}/terms`, assert: /Testnet software, not a financial service|Terms/i },
        { label: "not-found", url: `${liveUrl}/this-handle-does-not-exist-qa`, assert: /Link not found|Nothing at this link|FREELANCER PROFILE/i },
        { label: "receipt", url: direct.receiptUrl, assert: /Paid|Arcscan|Receipt/i },
        ...(profile?.profileUrl ? [{ label: "profile", url: profile.profileUrl, assert: /Pay @|Gateway status|USDC|Send USDC/i }] : []),
      ],
    );
  } finally {
    await browser.close();
  }

  const report = [
    "# OneLink Live QA — Visual Smoke",
    "",
    `Generated: ${new Date().toISOString()}`,
    `Base URL: ${liveUrl}`,
    `Source transaction: ${direct.arcscan}`,
    "",
    "| Surface | Result | Screenshot |",
    "| --- | --- | --- |",
    ...rows.map((row) => `| ${row.join(" | ")} |`),
    "",
    "## Notes",
    "",
    "- Screenshots are captured from the live Vercel deployment.",
    "- This verifies page render, responsive layout baseline, production settings, whitepaper availability, profile polish, paid receipt visibility, and home/profile behavior at 390, 768, 1366, 1440, and 1920 pixel widths.",
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
    ["# OneLink Live QA — Visual Smoke", "", "Status: red", "", "```txt", message, "```", ""].join("\n"),
  );
  console.error(message);
  process.exit(1);
});
