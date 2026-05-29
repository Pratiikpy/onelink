/**
 * Production screenshots for the README/Notion visual refresh.
 * Captures the live Vercel deployment (new UI) into docs/screenshots/prod/.
 * Override the target with QA_LIVE_URL.
 */
import { mkdirSync } from "node:fs";
import { resolve } from "node:path";
import { chromium, devices } from "@playwright/test";

const BASE = process.env.QA_LIVE_URL || "https://onelink-mauve-nu.vercel.app";
const OUT = resolve("docs", "screenshots", "prod");
mkdirSync(OUT, { recursive: true });

const VIEWPORTS = [
  { name: "desktop", opts: { viewport: { width: 1440, height: 1000 } } },
  { name: "mobile", opts: { ...devices["iPhone 13"], viewport: { width: 390, height: 844 } } },
];

const ROUTES = [
  { label: "landing", path: "/" },
  { label: "create", path: "/create" },
  { label: "dashboard", path: "/dashboard" },
  { label: "settings", path: "/settings" },
  { label: "security", path: "/security" },
  { label: "pay-demo", path: "/pay/demo" },
  { label: "receipt-demo", path: "/receipt/demo" },
];

const browser = await chromium.launch();
for (const vp of VIEWPORTS) {
  const ctx = await browser.newContext(vp.opts);
  const page = await ctx.newPage();
  for (const r of ROUTES) {
    try {
      await page.goto(`${BASE}${r.path}`, { waitUntil: "networkidle", timeout: 60000 });
      await page.waitForTimeout(1800);
      await page.screenshot({ path: resolve(OUT, `${vp.name}-${r.label}.png`), fullPage: true });
      console.log(`OK   ${vp.name} ${r.label}`);
    } catch (e) {
      console.log(`FAIL ${vp.name} ${r.label}: ${e.message}`);
    }
  }
  await ctx.close();
}
await browser.close();
console.log("done ->", OUT);
