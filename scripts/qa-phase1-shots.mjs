/**
 * Phase-1 after-screenshots. Captures the key screens at mobile + desktop into
 * docs/test-results/phase1-after/ (a NEW dir, so the committed "before" set is
 * left intact for comparison). Point QA_LIVE_URL at a local server.
 */
import { mkdirSync } from "node:fs";
import { resolve } from "node:path";
import { chromium, devices } from "@playwright/test";

const BASE = process.env.QA_LIVE_URL || "http://localhost:3000";
const OUT = resolve("docs", "test-results", "phase1-after");
mkdirSync(OUT, { recursive: true });

const VIEWPORTS = [
  { name: "mobile-390", opts: { ...devices["iPhone 13"], viewport: { width: 390, height: 844 } } },
  { name: "desktop-1440", opts: { viewport: { width: 1440, height: 1000 } } },
];

const ROUTES = [
  { label: "landing", path: "/" },
  { label: "create", path: "/create" },
  { label: "dashboard", path: "/dashboard" },
  { label: "pay-demo", path: "/pay/demo" },
  { label: "receipt-demo", path: "/receipt/demo" },
  { label: "settings", path: "/settings" },
];

const browser = await chromium.launch();
for (const vp of VIEWPORTS) {
  const ctx = await browser.newContext(vp.opts);
  const page = await ctx.newPage();
  for (const r of ROUTES) {
    try {
      await page.goto(`${BASE}${r.path}`, { waitUntil: "networkidle", timeout: 60000 });
      await page.waitForTimeout(1500);
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
