// Capture every public page at desktop + mobile so we can audit
// the new UI end-to-end. Non-destructive — only navigates, never signs.

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
const profileUrl = profile?.profileUrl ?? `${liveUrl}/qa-20260527071615`;

const OUT = resolve("docs/screenshots/audit");
mkdirSync(OUT, { recursive: true });

const targets = [
  { label: "landing", url: liveUrl },
  { label: "landing-bottom", url: liveUrl, scrollY: 4500 },
  { label: "create", url: `${liveUrl}/create` },
  { label: "pay", url: paymentUrl },
  { label: "receipt", url: receiptUrl },
  { label: "profile", url: profileUrl },
  { label: "dashboard", url: `${liveUrl}/dashboard` },
  { label: "settings", url: `${liveUrl}/settings` },
  { label: "whitepaper", url: `${liveUrl}/whitepaper` },
  { label: "pitch", url: `${liveUrl}/pitch` },
  { label: "security", url: `${liveUrl}/security` },
  { label: "privacy", url: `${liveUrl}/privacy` },
  { label: "terms", url: `${liveUrl}/terms` },
  { label: "brand", url: `${liveUrl}/brand` },
  { label: "not-found", url: `${liveUrl}/this-handle-does-not-exist-audit` },
];

async function shoot(ctx, target, suffix) {
  const page = await ctx.newPage();
  try {
    await page.goto(target.url, { waitUntil: "networkidle", timeout: 60_000 });
    await page.waitForTimeout(800);
    if (target.scrollY) {
      await page.evaluate((y) => window.scrollTo(0, y), target.scrollY);
      await page.waitForTimeout(400);
    }
    const path = resolve(OUT, `${target.label}-${suffix}.png`);
    await page.screenshot({ path, fullPage: !target.scrollY });
    console.log(`wrote ${target.label}-${suffix}.png`);
  } catch (err) {
    console.error(`failed ${target.label}-${suffix}: ${err.message}`);
  } finally {
    await page.close();
  }
}

async function main() {
  const browser = await chromium.launch({ headless: true });
  try {
    const desktop = await browser.newContext({ viewport: { width: 1440, height: 900 } });
    for (const t of targets) await shoot(desktop, t, "desktop");
    await desktop.close();

    const mobile = await browser.newContext({
      ...devices["iPhone 13"],
      viewport: { width: 390, height: 844 },
    });
    for (const t of targets) await shoot(mobile, t, "mobile");
    await mobile.close();
  } finally {
    await browser.close();
  }

  writeFileSync(
    resolve(OUT, ".captured.json"),
    JSON.stringify({ capturedAt: new Date().toISOString(), liveUrl, count: targets.length * 2 }, null, 2),
  );
  console.log("done");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
