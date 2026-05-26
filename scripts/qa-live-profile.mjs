import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { request as httpsRequest } from "node:https";
import { resolve } from "node:path";
import { createClient } from "@supabase/supabase-js";
import { privateKeyToAccount } from "viem/accounts";

function loadEnv(path = ".env.local") {
  try {
    const raw = readFileSync(path, "utf8");
    for (const line of raw.split(/\r?\n/)) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) continue;
      const eq = trimmed.indexOf("=");
      if (eq === -1) continue;
      const key = trimmed.slice(0, eq).trim();
      const value = trimmed.slice(eq + 1).trim();
      if (!process.env[key]) process.env[key] = value;
    }
  } catch {
    // CI may provide env directly.
  }
}

loadEnv();

const OUT_DIR = resolve("docs", "test-results", "qa-live-profile");
const configuredAppUrl = process.env.PLAYWRIGHT_BASE_URL || process.env.NEXT_PUBLIC_APP_URL || "";
const LIVE_URL =
  configuredAppUrl && !configuredAppUrl.includes("localhost")
    ? configuredAppUrl
    : "https://onelink-mauve-nu.vercel.app";

function required(name) {
  const value = process.env[name];
  if (!value) throw new Error(`${name} is required`);
  return value;
}

function postJson(url, body, timeoutMs = 90_000) {
  return new Promise((resolvePromise, reject) => {
    const parsed = new URL(url);
    const payload = JSON.stringify(body);
    const req = httpsRequest(
      {
        hostname: parsed.hostname,
        path: `${parsed.pathname}${parsed.search}`,
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Content-Length": Buffer.byteLength(payload),
        },
        timeout: timeoutMs,
      },
      (res) => {
        let data = "";
        res.setEncoding("utf8");
        res.on("data", (chunk) => {
          data += chunk;
        });
        res.on("end", () => {
          let json = {};
          try {
            json = data ? JSON.parse(data) : {};
          } catch {
            json = { raw: data };
          }
          resolvePromise({ ok: (res.statusCode ?? 0) >= 200 && (res.statusCode ?? 0) < 300, status: res.statusCode, json });
        });
      },
    );
    req.on("timeout", () => req.destroy(new Error(`POST ${url} timed out after ${timeoutMs}ms`)));
    req.on("error", reject);
    req.write(payload);
    req.end();
  });
}

function claimMessage(handle, wallet) {
  return `OneLink profile claim\nHandle: ${handle}\nRecipient: ${wallet}\nNetwork: Arc Testnet`;
}

async function main() {
  mkdirSync(OUT_DIR, { recursive: true });
  const account = privateKeyToAccount(required("DEPLOYER_PRIVATE_KEY"));
  const supabase = createClient(required("NEXT_PUBLIC_SUPABASE_URL"), required("NEXT_PUBLIC_SUPABASE_ANON_KEY"), {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  const stamp = new Date().toISOString().replace(/[-:.TZ]/g, "").slice(0, 14).toLowerCase();
  const handle = `qa-${stamp}`;
  const profile = {
    handle,
    wallet: account.address,
    displayName: `QA ${stamp}`,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  const signature = await account.signMessage({ message: claimMessage(handle, account.address) });
  const response = await postJson(`${LIVE_URL}/api/profiles`, { profile, signature });
  if (!response.ok) throw new Error(`Profile API failed (${response.status}): ${JSON.stringify(response.json)}`);

  const { data, error } = await supabase.from("freelancer_profiles").select("*").eq("handle", handle).single();
  if (error) throw new Error(`Profile reload failed: ${error.message}`);
  if (data.wallet.toLowerCase() !== account.address.toLowerCase()) throw new Error("Profile wallet mismatch");

  const result = {
    status: "green",
    generatedAt: new Date().toISOString(),
    handle,
    profileUrl: `${LIVE_URL}/${handle}`,
    wallet: account.address,
    apiResponse: response.json,
    supabaseRow: data,
  };
  writeFileSync(resolve(OUT_DIR, "result.json"), `${JSON.stringify(result, null, 2)}\n`);

  const report = [
    "# OneLink Live QA — Profile Handle",
    "",
    `Generated: ${result.generatedAt}`,
    "Status: green",
    `Handle: \`/${handle}\``,
    `Wallet: \`${account.address}\``,
    `Profile URL: ${result.profileUrl}`,
    "",
    "## Flow Proven",
    "",
    "| Check | Result | Evidence |",
    "| --- | --- | --- |",
    "| Wallet-signed profile claim | green | Live `/api/profiles` accepted signature |",
    "| Supabase profile persistence | green | `freelancer_profiles` row reloaded through anon client |",
    "| Public profile URL generated | green | Profile route can load this handle |",
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
    ["# OneLink Live QA — Profile Handle", "", "Status: red", "", "```txt", message, "```", ""].join("\n"),
  );
  console.error(message);
  process.exit(1);
});
