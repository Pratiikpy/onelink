// Autonomous Rabby onboarding for OneLink real-extension E2E.
// Uses Rabby's OWN auto-opened onboarding tab (#/new-user/guide) and walks:
//   "I already have an address" -> "Import Private Key" -> enter key -> password.
// The QA payer private key is read from env and NEVER logged.
import { chromium } from "@playwright/test";
import { mkdirSync, readFileSync, rmSync } from "node:fs";
import { resolve } from "node:path";

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

// Point RABBY_EXT_DIR at an unpacked Rabby extension (manifest.json at its
// root). No default — fail loudly so this never silently runs against nothing.
const RABBY_EXT = process.env.RABBY_EXT_DIR;
if (!RABBY_EXT) { console.error("Set RABBY_EXT_DIR to an unpacked Rabby extension dir."); process.exit(1); }
const PROFILE_DIR = resolve(".rabby-profile-onelink");
const SHOTS = resolve("scripts", "_rabby_shots");
const PASSWORD = process.env.RABBY_PASSWORD || "RabbyPass123!QA";

let PK = process.env.QA_PAYER_PRIVATE_KEY || "";
if (!PK) { console.error("QA_PAYER_PRIVATE_KEY missing"); process.exit(1); }
if (!PK.startsWith("0x")) PK = "0x" + PK;

try { rmSync(PROFILE_DIR, { recursive: true, force: true }); } catch {}
mkdirSync(SHOTS, { recursive: true });
mkdirSync(PROFILE_DIR, { recursive: true });

const wait = (ms) => new Promise((r) => setTimeout(r, ms));
let stepN = 0;
async function snap(page, label) {
  stepN++;
  await page.screenshot({ path: resolve(SHOTS, `g-${String(stepN).padStart(2, "0")}-${label}.png`), fullPage: true }).catch(() => {});
  const b = ((await page.locator("body").innerText({ timeout: 4000 }).catch(() => "")) || "").replace(/\s+/g, " ").trim();
  console.log(`[${stepN}] ${label} :: ${b.slice(0, 130)}`);
  return b;
}
async function rawClick(page, loc) {
  const bb = await loc.boundingBox().catch(() => null);
  if (!bb) { await loc.click({ force: true }).catch(() => {}); return; }
  const x = Math.round(bb.x + bb.width / 2), y = Math.round(bb.y + bb.height / 2);
  try {
    const cdp = await page.context().newCDPSession(page);
    await cdp.send("Input.dispatchMouseEvent", { type: "mouseMoved", x, y, button: "none", buttons: 0 });
    await wait(40);
    await cdp.send("Input.dispatchMouseEvent", { type: "mousePressed", x, y, button: "left", buttons: 1, clickCount: 1 });
    await wait(60);
    await cdp.send("Input.dispatchMouseEvent", { type: "mouseReleased", x, y, button: "left", buttons: 0, clickCount: 1 });
    await cdp.detach().catch(() => {});
  } catch { await loc.click({ force: true }).catch(() => {}); }
}
async function clickText(page, re) {
  const loc = page.getByText(re).first();
  if (await loc.isVisible({ timeout: 1500 }).catch(() => false)) { await rawClick(page, loc); return true; }
  const btn = page.getByRole("button", { name: re }).first();
  if (await btn.isVisible({ timeout: 800 }).catch(() => false)) { await rawClick(page, btn); return true; }
  return false;
}

async function main() {
  const ctx = await chromium.launchPersistentContext(PROFILE_DIR, {
    headless: false, viewport: { width: 1280, height: 800 },
    args: [`--disable-extensions-except=${RABBY_EXT}`, `--load-extension=${RABBY_EXT}`,
      "--disable-blink-features=AutomationControlled", "--no-sandbox"],
  });
  let extId = "";
  for (let i = 0; i < 40; i++) {
    const sw = ctx.serviceWorkers().find((w) => w.url().includes("chrome-extension://"));
    if (sw) { extId = sw.url().split("/")[2]; break; }
    await wait(500);
  }
  if (!extId) { console.error("SW never registered"); await ctx.close(); process.exit(2); }
  console.log("extId:", extId);

  // Wait for Rabby's auto-opened onboarding tab, then bind to it.
  let page = null;
  for (let i = 0; i < 30; i++) {
    page = ctx.pages().find((p) => p.url().includes(extId) && p.url().includes("new-user"));
    if (page) break;
    page = ctx.pages().find((p) => p.url().includes(extId));
    if (page) break;
    await wait(500);
  }
  if (!page) { console.error("no Rabby onboarding tab"); await ctx.close(); process.exit(2); }
  await page.bringToFront().catch(() => {});
  await wait(3000);
  await snap(page, "welcome");

  let imported = false, passwordDone = false, lastState = "";
  for (let i = 0; i < 40; i++) {
    // Re-bind to the active extension page in case Rabby swaps tabs.
    const cand = ctx.pages().find((p) => p.url().includes(extId) && !p.url().includes("notification"));
    if (cand && cand !== page) { page = cand; await page.bringToFront().catch(() => {}); }

    const b = ((await page.locator("body").innerText({ timeout: 4000 }).catch(() => "")) || "").replace(/\s+/g, " ").trim();
    const head = b.slice(0, 60);
    if (head !== lastState) { console.log(`[i${i}] ${head}`); lastState = head; await snap(page, `i${i}`); }

    const pwCount = await page.locator('input[type="password"]').count().catch(() => 0);
    const hasTextarea = await page.locator("textarea").first().isVisible({ timeout: 300 }).catch(() => false);

    // Success / dashboard.
    if (imported && passwordDone && /Assets|Send|Receive|Swap|My Portfolio|0x[a-fA-F0-9]{4}/i.test(b) && !/password/i.test(b)) {
      console.log("RESULT: dashboard reached."); break;
    }
    // Password set screen (after import).
    if (imported && pwCount >= 1 && /password/i.test(b) && !passwordDone) {
      const f = page.locator('input[type="password"]');
      await f.nth(0).click({ force: true }).catch(() => {});
      await page.keyboard.type(PASSWORD, { delay: 18 });
      if ((await f.count()) >= 2) { await f.nth(1).click({ force: true }).catch(() => {}); await page.keyboard.type(PASSWORD, { delay: 18 }); }
      await wait(400); await snap(page, `pw${i}`);
      if (!(await clickText(page, /^Confirm$/i))) await clickText(page, /Confirm|Next|Done|Sign Up/i);
      passwordDone = true; await wait(2800); continue;
    }
    // Import-type method menu (checked FIRST — its body also contains the
    // substring "Seed Phrase or Private Key", so it must win over the dual-tab
    // branch below). Rabby combines seed/key into one entry; older builds show
    // "Import Private Key" directly.
    if (!imported && /Select Import Method/i.test(b)) {
      if (await clickText(page, /Seed Phrase or Private Key/i)) { await wait(2200); continue; }
      if (await clickText(page, /Import Private Key/i)) { await wait(2200); continue; }
    }
    // Dual-tab entry screen defaults to the Seed Phrase grid (unique signal:
    // the "12-word phrase" helper). Switch to the Private Key tab.
    if (!imported && /12-word phrase/i.test(b) && !hasTextarea) {
      await clickText(page, /^Private Key$/i);
      await wait(1500);
      continue;
    }
    // Private-key entry screen: a single textarea or password/text input,
    // on a screen that is NOT the seed grid and NOT the method menu.
    if (!imported && !/Select Import Method|12-word phrase/i.test(b)) {
      let field = page.locator("textarea").first();
      let vis = await field.isVisible({ timeout: 300 }).catch(() => false);
      if (!vis) {
        const single = page.locator('input[type="password"], input[type="text"]');
        if ((await single.count().catch(() => 0)) === 1) { field = single.first(); vis = await field.isVisible({ timeout: 300 }).catch(() => false); }
      }
      if (vis && /Private Key|private key/i.test(b)) {
        await field.click({ force: true }).catch(() => {});
        await page.keyboard.type(PK, { delay: 6 }); // NEVER logged
        await wait(500); await snap(page, `pk${i}`);
        if (!(await clickText(page, /^Confirm$/i))) await clickText(page, /Confirm|Next|Import/i);
        imported = true; await wait(2800); continue;
      }
    }
    // Welcome screen.
    if (/Welcome to Rabby|already have an address|Create a new address/i.test(b)) {
      if (await clickText(page, /I already have an address/i)) { await wait(2000); continue; }
    }
    // Post screens.
    if (imported && passwordDone) {
      for (const re of [/Got it/i, /^Done$/i, /Next/i, /Skip/i, /^OK$/i, /^Confirm$/i]) {
        if (await clickText(page, re)) { await wait(1300); break; }
      }
    }
    await wait(1200);
  }

  await snap(page, "final");
  console.log(`Onboarding: imported=${imported} passwordSet=${passwordDone}`);
  await ctx.close();
}

main().catch((e) => { console.error("ONBOARD_ERROR:", e?.message || String(e)); process.exit(3); });
