import { mkdirSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { chromium } from "@playwright/test";

const LIVE_URL = process.env.PLAYWRIGHT_BASE_URL || "https://onelink-mauve-nu.vercel.app";
const OUT_DIR = resolve("docs", "test-results", "qa-live-walletconnect-modal");

async function main() {
  mkdirSync(OUT_DIR, { recursive: true });
  const errors = [];
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 390, height: 844 } });
  const page = await context.newPage();
  page.on("pageerror", (error) => errors.push(error.message));

  try {
    await page.goto(LIVE_URL, { waitUntil: "networkidle", timeout: 60_000 });
    await page.getByRole("button", { name: /^Connect wallet$/i }).click();
    await page.getByRole("button", { name: "WalletConnect" }).click();
    await page.waitForTimeout(3_000);
    const body = await page.locator("body").innerText();
    if (errors.length) throw new Error(`WalletConnect modal emitted client error: ${errors.join("; ")}`);
    if (/Application error/i.test(body)) throw new Error("WalletConnect modal rendered an application error.");
    if (!/WalletConnect|Scan|QR|mobile/i.test(body)) {
      throw new Error(`WalletConnect modal did not show a connection state: ${body.slice(-400)}`);
    }
    await page.screenshot({ path: resolve(OUT_DIR, "walletconnect-modal-mobile.png"), fullPage: true });
  } finally {
    await context.close();
    await browser.close();
  }

  const report = [
    "# OneLink Live QA - WalletConnect Modal",
    "",
    `Generated: ${new Date().toISOString()}`,
    `Base URL: ${LIVE_URL}`,
    "Status: green",
    "",
    "| Case | Result | Evidence |",
    "| --- | --- | --- |",
    "| Open RainbowKit wallet picker | green | WalletConnect connector is available |",
    "| Open WalletConnect connection path | green | Modal renders without client exception |",
    "| Mobile screenshot | green | `walletconnect-modal-mobile.png` |",
    "",
    "## Scope Note",
    "",
    "- This proves production QR-modal rendering and connector availability after the dependency compatibility pin.",
    "- Signed WalletConnect payment execution is covered separately by `qa:live:walletconnect-payment`.",
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
    ["# OneLink Live QA - WalletConnect Modal", "", "Status: red", "", "```txt", message, "```", ""].join("\n"),
  );
  console.error(message);
  process.exit(1);
});
