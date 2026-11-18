#!/usr/bin/env node
// Keep standalone CI/Nix builds on their existing Node-only entrypoint.
import { existsSync, realpathSync } from "node:fs";
import { homedir, hostname, userInfo } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";

const repo = realpathSync(join(dirname(fileURLToPath(import.meta.url)), ".."));
const mm4 = hostname().split(".")[0].toLowerCase() === "mm4";
const shared = mm4
  ? existsSync(join(userInfo().homedir, "mygit/tools/build-paths.py"))
  : [join(repo, "../tools/build-paths.py"), join(homedir(), "mygit/tools/build-paths.py")]
      .some(existsSync);
const [action, ...extra] = process.argv.slice(2);
if (!["build", "dev", "preview", "test"].includes(action)) {
  throw new Error("Expected build, dev, preview or test");
}
if (mm4 && !shared) {
  throw new Error("mm4 requires tools/build-paths.py; no internal fallback");
}
function run(command, args) {
  const result = spawnSync(command, args, { cwd: repo, stdio: "inherit" });
  if (result.error) throw result.error;
  if (result.status !== 0) process.exit(result.status ?? 1);
}
if (shared) {
  run("python3", [join(repo, "tools/run.py"), action, ...extra]);
} else {
  // Vite's dist/node_modules cache and Vitest defaults are intentional in a
  // standalone CI/Nix checkout; its downstream packagers consume dist/.
  if (action === "build") run(join(repo, "node_modules/.bin/tsc"), ["--noEmit"]);
  const tool = action === "test" ? "vitest" : "vite";
  const args = action === "test" ? ["run"] : action === "dev" ? [] : [action];
  run(join(repo, "node_modules/.bin", tool), [...args, ...extra]);
}
