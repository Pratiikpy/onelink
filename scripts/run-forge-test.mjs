import { existsSync } from "node:fs";
import { homedir } from "node:os";
import path from "node:path";
import { spawnSync } from "node:child_process";

const executable = process.platform === "win32" ? "forge.exe" : "forge";
const pathEntries = (process.env.PATH ?? "").split(path.delimiter);
const candidates = [
  ...pathEntries.map((entry) => path.join(entry, executable)),
  path.join(homedir(), ".foundry", "bin", executable),
];

const forge = candidates.find((candidate) => existsSync(candidate));
const result = spawnSync(forge ?? executable, ["test"], { stdio: "inherit", shell: false });

if (result.error) {
  console.error(
    "Could not run Foundry. Install it from https://book.getfoundry.sh/getting-started/installation",
  );
  console.error(result.error.message);
  process.exit(1);
}

process.exit(result.status ?? 1);
