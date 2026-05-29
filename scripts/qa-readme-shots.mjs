/**
 * Cropped above-the-fold README screenshots (viewport, NOT full-page) so the
 * README hero reads premium instead of a tall scrolling dump.
 * Overwrites the curated set in docs/screenshots/prod/.
 */
import { mkdirSync } from "node:fs";
import { resolve } from "node:path";
import { chromium, devices } from "@playwright/test";

const BASE = process.env.QA_LIVE_URL || "https://onelink-mauve-nu.vercel.app";
const OUT = resolve("docs", "screenshots", "prod");
mkdirSync(OUT, { recursive: true });

// fullPage:false → just the visible fold, the way a premium README hero looks.
const SHOTS = [
  { file: "desktop-landing.png", path: "/", opts: { viewport: { width: 1440, height: 900 } } },
  { file: "mobile-landing.png", path: "/", opts: { ...devices["iPhone 13"], viewport: { width: 390, height: 844 } } },
  { file: "desktop-security.png", path: "/security", opts: { viewport: { width: 1440, height: 900 } } },
];

const browser = await chromium.launch();
for (const s of SHOTS) {
  const ctx = await browser.newContext(s.opts);
  const page = await ctx.newPage();
  try {
    await page.goto(`${BASE}${s.path}`, { waitUntil: "networkidle", timeout: 60000 });
    await page.waitForTimeout(1500);
    await page.screenshot({ path: resolve(OUT, s.file), fullPage: false });
    console.log(`OK   ${s.file}`);
  } catch (e) {
    console.log(`FAIL ${s.file}: ${e.message}`);
  }
  await ctx.close();
}
await browser.close();
console.log("done ->", OUT);
