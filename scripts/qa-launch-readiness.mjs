/**
 * OneLink Launch-Readiness QA — comprehensive non-wallet pass.
 *
 * Goals:
 *   1. Hit every route at 5 viewports.
 *   2. Capture full-page screenshots.
 *   3. Log every console error / page error / failed request.
 *   4. Verify each page actually renders content (not a 500 / crash).
 *   5. Produce one consolidated REPORT.md with severity-ranked findings.
 *
 * No wallet popup needed; this validates surfaces that don't depend on
 * Rabby. Wallet-connected flows are covered by the qa:live:* scripts.
 */
import { mkdirSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { chromium, devices } from "@playwright/test";

const LIVE_URL =
  process.env.QA_LIVE_URL || "https://onelink-mauve-nu.vercel.app";
const OUT_DIR = resolve("docs", "test-results", "qa-launch-readiness");

const VIEWPORTS = [
  {
    name: "mobile-390",
    label: "Mobile (iPhone 13, 390)",
    options: { ...devices["iPhone 13"], viewport: { width: 390, height: 844 } },
  },
  {
    name: "tablet-768",
    label: "Tablet (768)",
    options: { viewport: { width: 768, height: 1024 } },
  },
  {
    name: "laptop-1366",
    label: "Laptop (1366)",
    options: { viewport: { width: 1366, height: 900 } },
  },
  {
    name: "desktop-1440",
    label: "Desktop (1440)",
    options: { viewport: { width: 1440, height: 1100 } },
  },
  {
    name: "wide-1920",
    label: "Wide (1920)",
    options: { viewport: { width: 1920, height: 1200 } },
  },
];

// Every reachable surface. Some assertions are loose because the page
// may render in connected/disconnected states.
const ROUTES = [
  {
    label: "landing",
    path: "/",
    expect: /OneLink|USDC|Arc|payment link|Get paid/i,
  },
  {
    label: "create",
    path: "/create",
    expect: /Create|Connect|Amount|Recipient|USDC/i,
  },
  {
    label: "dashboard",
    path: "/dashboard",
    expect: /Dashboard|Connect|payment links|empty/i,
  },
  { label: "settings", path: "/settings", expect: /Settings|env|chain|RPC|USDC/i },
  {
    label: "security",
    path: "/security",
    expect: /Security|verify|verification|proven live|claims/i,
  },
  {
    label: "privacy",
    path: "/privacy",
    expect: /Privacy|payment links|data|cookies|Supabase/i,
  },
  {
    label: "terms",
    path: "/terms",
    expect: /Terms|testnet|liability|service|software/i,
  },
  {
    label: "whitepaper",
    path: "/whitepaper",
    expect: /whitepaper|protocol|Circle|CCTP|architecture/i,
  },
  { label: "pitch", path: "/pitch", expect: /OneLink|pitch|Arc|USDC|hackathon/i },
  {
    label: "not-found",
    path: "/this-handle-does-not-exist-qa-12345",
    expect: /not found|missing|nothing|Link not found|404/i,
  },
];

function rel(path) {
  return path.replace(/\\/g, "/");
}

async function captureFull(page, file) {
  // Force reveal/fade animations to settle before screenshot. We:
  //   1. Wait for fonts so layout doesn't shift mid-capture.
  //   2. Force every `.reveal` element into the `is-in` state so the
  //      content is opaque even if IntersectionObserver hasn't fired.
  //   3. Scroll the entire page so any other observers also fire.
  //   4. Scroll back to top, give animations time to finish, then capture.
  await page.evaluate(async () => {
    // @ts-expect-error fonts is fine
    if (document.fonts?.ready) await document.fonts.ready;
    document.querySelectorAll(".reveal").forEach((el) => {
      el.classList.add("is-in");
      el.style.opacity = "1";
      el.style.transform = "none";
    });
    const total = document.documentElement.scrollHeight;
    const step = window.innerHeight;
    for (let y = 0; y < total; y += step) {
      window.scrollTo(0, y);
      await new Promise((r) => setTimeout(r, 80));
    }
    window.scrollTo(0, 0);
    await new Promise((r) => setTimeout(r, 600));
  });
  await page.screenshot({ path: file, fullPage: true });
}

async function testRoute(context, route, viewport, results) {
  const url = `${LIVE_URL}${route.path}`;
  const page = await context.newPage();
  const consoleErrors = [];
  const pageErrors = [];
  const failedRequests = [];

  page.on("console", (msg) => {
    if (msg.type() === "error") consoleErrors.push(msg.text());
  });
  page.on("pageerror", (err) => pageErrors.push(err.message));
  page.on("requestfailed", (req) => {
    // Playwright cancels HEAD prefetches when goto() navigates. Those are
    // benign — same URL as the page. Real failures are different URLs or
    // GETs that didn't return.
    const errText = req.failure()?.errorText || "";
    const url = req.url();
    const isPrefetchAbort =
      req.method() === "HEAD" && errText.includes("ERR_ABORTED");
    // Next.js App Router prefetches /receipt/[id]?_rsc=… and /pay/[slug]?_rsc=…
    // on link hover; the browser cancels them on page unload. Not a real fail.
    const isRscPrefetchAbort =
      errText.includes("ERR_ABORTED") && /\?_rsc=/.test(url);
    if (isPrefetchAbort || isRscPrefetchAbort) return;
    failedRequests.push(`${req.method()} ${url} :: ${errText}`);
  });

  let status = "green";
  let httpStatus = 0;
  let bodyTextSample = "";
  let renderError = "";
  let screenshotPath = "";

  try {
    const response = await page.goto(url, {
      waitUntil: "networkidle",
      timeout: 45_000,
    });
    httpStatus = response?.status() ?? 0;
    if (httpStatus >= 500) {
      status = "red";
      renderError = `HTTP ${httpStatus}`;
    } else if (httpStatus >= 400 && route.label !== "not-found") {
      // Profile route returns 404 for missing handles, but our not-found path is supposed to 404.
      status = "red";
      renderError = `HTTP ${httpStatus}`;
    }
    bodyTextSample = (await page.locator("body").innerText().catch(() => "")) || "";

    // For 404 path we accept either 404 status or a not-found body.
    if (route.label === "not-found") {
      const has404Body =
        /not found|nothing|missing|404/i.test(bodyTextSample);
      if (httpStatus !== 404 && !has404Body) {
        status = "yellow";
        renderError = `Expected 404 or not-found copy; got HTTP ${httpStatus}, body did not match.`;
      }
    } else if (!route.expect.test(bodyTextSample)) {
      status = "yellow";
      renderError = `Body did not match assertion ${route.expect}`;
    }

    mkdirSync(resolve(OUT_DIR, viewport.name), { recursive: true });
    const file = resolve(OUT_DIR, viewport.name, `${route.label}.png`);
    await captureFull(page, file);
    screenshotPath = file;
  } catch (err) {
    status = "red";
    renderError = err instanceof Error ? err.message : String(err);
  }

  if (pageErrors.length > 0 || failedRequests.length > 0) {
    if (status === "green") status = "yellow";
  }

  results.push({
    viewport: viewport.label,
    route: route.label,
    path: route.path,
    httpStatus,
    status,
    renderError,
    consoleErrors,
    pageErrors,
    failedRequests,
    screenshot: screenshotPath ? rel(screenshotPath) : "",
    bodySample: bodyTextSample.slice(0, 240).replace(/\s+/g, " ").trim(),
  });

  await page.close();
}

async function main() {
  mkdirSync(OUT_DIR, { recursive: true });
  const browser = await chromium.launch({ headless: true });
  const results = [];

  try {
    for (const viewport of VIEWPORTS) {
      const context = await browser.newContext({
        ...viewport.options,
        reducedMotion: "reduce",
      });
      for (const route of ROUTES) {
        await testRoute(context, route, viewport, results);
      }
      await context.close();
    }
  } finally {
    await browser.close();
  }

  // Build report
  const summary = {
    total: results.length,
    green: results.filter((r) => r.status === "green").length,
    yellow: results.filter((r) => r.status === "yellow").length,
    red: results.filter((r) => r.status === "red").length,
  };

  const lines = [];
  lines.push("# OneLink Launch-Readiness QA — Visual + Render Sweep");
  lines.push("");
  lines.push(`Generated: ${new Date().toISOString()}`);
  lines.push(`Live URL: ${LIVE_URL}`);
  lines.push(`Total checks: ${summary.total}`);
  lines.push(
    `Result mix: ${summary.green} green / ${summary.yellow} yellow / ${summary.red} red`,
  );
  lines.push("");
  lines.push("## Severity-ranked issues");
  lines.push("");

  const byStatus = (s) => results.filter((r) => r.status === s);
  for (const sev of ["red", "yellow"]) {
    const items = byStatus(sev);
    if (items.length === 0) continue;
    lines.push(`### ${sev.toUpperCase()}`);
    lines.push("");
    lines.push("| Viewport | Route | HTTP | Issue |");
    lines.push("| --- | --- | --- | --- |");
    for (const r of items) {
      const issue = [
        r.renderError,
        r.pageErrors.length ? `${r.pageErrors.length} pageError(s)` : "",
        r.failedRequests.length
          ? `${r.failedRequests.length} failed req(s)`
          : "",
        r.consoleErrors.length
          ? `${r.consoleErrors.length} console error(s)`
          : "",
      ]
        .filter(Boolean)
        .join("; ");
      lines.push(
        `| ${r.viewport} | ${r.route} (${r.path}) | ${r.httpStatus} | ${issue || "—"} |`,
      );
    }
    lines.push("");
  }

  lines.push("## Full matrix");
  lines.push("");
  lines.push("| Viewport | Route | HTTP | Status | Screenshot |");
  lines.push("| --- | --- | --- | --- | --- |");
  for (const r of results) {
    lines.push(
      `| ${r.viewport} | ${r.route} | ${r.httpStatus} | ${r.status} | ${r.screenshot} |`,
    );
  }
  lines.push("");

  lines.push("## Detailed findings");
  lines.push("");
  for (const r of results) {
    if (
      r.status === "green" &&
      r.consoleErrors.length === 0 &&
      r.pageErrors.length === 0 &&
      r.failedRequests.length === 0
    ) {
      continue;
    }
    lines.push(`### ${r.viewport} :: ${r.route} (${r.path})`);
    lines.push(`- HTTP: ${r.httpStatus}`);
    lines.push(`- Status: **${r.status}**`);
    if (r.renderError) lines.push(`- Render error: \`${r.renderError}\``);
    if (r.consoleErrors.length) {
      lines.push(`- Console errors:`);
      for (const e of r.consoleErrors.slice(0, 8)) lines.push(`  - ${e}`);
    }
    if (r.pageErrors.length) {
      lines.push(`- Page errors:`);
      for (const e of r.pageErrors.slice(0, 8)) lines.push(`  - ${e}`);
    }
    if (r.failedRequests.length) {
      lines.push(`- Failed requests:`);
      for (const e of r.failedRequests.slice(0, 8)) lines.push(`  - ${e}`);
    }
    if (r.bodySample)
      lines.push(`- Body sample: \`${r.bodySample.slice(0, 160)}…\``);
    lines.push("");
  }

  writeFileSync(resolve(OUT_DIR, "REPORT.md"), lines.join("\n"));
  writeFileSync(
    resolve(OUT_DIR, "results.json"),
    JSON.stringify({ summary, results }, null, 2),
  );

  console.log(
    `[qa-launch-readiness] ${summary.total} checks: ${summary.green} green / ${summary.yellow} yellow / ${summary.red} red`,
  );
  console.log(`[qa-launch-readiness] Report: ${resolve(OUT_DIR, "REPORT.md")}`);
  if (summary.red > 0) process.exitCode = 1;
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
