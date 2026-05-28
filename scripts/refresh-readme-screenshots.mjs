// Quick-and-focused screenshot refresh for the 4 images the README uses.
// Non-destructive — reads from prior qa-live-direct + qa-live-profile result.json
// for real URLs, hits the live deployment, captures 1440×900 desktop +
// 390×844 mobile, writes into docs/screenshots/.

import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { chromium, devices } from "@playwright/test";

const direct = JSON.parse(
  readFileSync(resolve("docs/test-results/qa-live-direct/result.json"), "utf8"),
);
let profile = null;
try {
  profile = JSON.parse(
    readFileSync(resolve("docs/test-results/qa-live-profile/result.json"), "utf8"),
  );
} catch {}

const liveUrl = direct.liveUrl ?? "https://onelink-mauve-nu.vercel.app";
const paymentUrl = direct.paymentUrl;
const receiptUrl = direct.receiptUrl;
const profileUrl = profile?.profileUrl;

const OUT = resolve("docs/screenshots");
mkdirSync(OUT, { recursive: true });

async function shot(page, url, file, options = {}) {
  await page.goto(url, { waitUntil: "networkidle", timeout: 60_000 });
  // Give Inter font + Reveal animations a moment
  await page.waitForTimeout(900);
  if (options.scrollY) await page.evaluate((y) => window.scrollTo(0, y), options.scrollY);
  await page.waitForTimeout(400);
  const path = resolve(OUT, file);
  await page.screenshot({ path, fullPage: !!options.fullPage });
  console.log(`wrote ${file}`);
  return path;
}

async function main() {
  const browser = await chromium.launch({ headless: true });
  try {
    // Desktop 1440x900
    const desktop = await browser.newContext({ viewport: { width: 1440, height: 900 } });
    const desktopPage = await desktop.newPage();
    await shot(desktopPage, liveUrl, "home-desktop.png");
    // Capture the product-canvas section of the landing — Request + Receipt cards.
    await shot(desktopPage, liveUrl, "product-canvas-desktop.png", { scrollY: 1100 });
    if (paymentUrl) await shot(desktopPage, paymentUrl, "pay-unpaid-desktop.png");
    if (receiptUrl) await shot(desktopPage, receiptUrl, "receipt-paid-desktop.png");
    await desktop.close();

    // Mobile 390x844 (iPhone 13)
    const mobile = await browser.newContext({
      ...devices["iPhone 13"],
      viewport: { width: 390, height: 844 },
    });
    const mobilePage = await mobile.newPage();
    if (profileUrl) await shot(mobilePage, profileUrl, "profile-mobile.png", { fullPage: false });
    await mobile.close();
  } finally {
    await browser.close();
  }

  writeFileSync(
    resolve("docs/screenshots/.captured.json"),
    JSON.stringify(
      {
        capturedAt: new Date().toISOString(),
        liveUrl,
        paymentUrl,
        receiptUrl,
        profileUrl,
      },
      null,
      2,
    ),
  );
  console.log("done");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
