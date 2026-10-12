#!/usr/bin/env node
/**
 * 一条命令部署：本地构建静态产物，再用 rsync over SSH 同步到服务器 Nginx 目录。
 * 服务器无需安装 Node（见 docs/adr/0002-local-build-rsync-to-nginx.md）。
 *
 * 用法：
 *   npm run deploy            # 构建并同步
 *   DEPLOY_DRY_RUN=1 npm run deploy   # 只演练 rsync，不真正改动服务器
 *
 * 配置来自仓库根目录的 .env（不提交），字段见 .env.example。
 */
import { spawnSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");

function loadEnv() {
  const envPath = resolve(root, ".env");
  if (!existsSync(envPath)) return;
  const raw = readFileSync(envPath, "utf8");
  for (const line of raw.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq).trim();
    let value = trimmed.slice(eq + 1).trim();
    value = value.replace(/^["']|["']$/g, "");
    if (process.env[key] === undefined) process.env[key] = value;
  }
}

function run(command, args, options = {}) {
  const result = spawnSync(command, args, {
    cwd: root,
    stdio: "inherit",
    ...options,
  });
  if (result.status !== 0) {
    console.error(`\n✖ 命令失败: ${command} ${args.join(" ")}`);
    process.exit(result.status ?? 1);
  }
}

loadEnv();

const host = process.env.DEPLOY_HOST;
const user = process.env.DEPLOY_USER;
const targetPath = process.env.DEPLOY_PATH;
const port = process.env.SSH_PORT ?? "22";

if (!host || !user || !targetPath) {
  console.error("缺少部署配置。请复制 .env.example 为 .env 并填写 DEPLOY_HOST / DEPLOY_USER / DEPLOY_PATH。");
  process.exit(1);
}

// 发版门禁：SITE_URL 仍是占位域名时直接失败，避免 canonical/sitemap/OG 指向 example.com
const astroConfig = readFileSync(resolve(root, "astro.config.mjs"), "utf8");
if (/SITE_URL\s*=\s*["']https?:\/\/example\.com/.test(astroConfig)) {
  console.error(
    "✖ astro.config.mjs 的 SITE_URL 仍是占位域名 https://example.com。\n  请先改为正式根域名再部署（canonical / sitemap / OG 都依赖它）。"
  );
  process.exit(1);
}

// 1) 本地构建（含 astro check）
console.log("▶ 本地构建（astro check && astro build）...");
run("npm", ["run", "build"]);

// 2) rsync 同步（--delete 保证产物与本地一致；排除本机杂项）
const destination = `${user}@${host}:${targetPath}/`;
const rsyncArgs = [
  "-az",
  "--delete",
  "-e",
  `ssh -p ${port}`,
  resolve(root, "dist") + "/",
  destination,
];

if (process.env.DEPLOY_DRY_RUN === "1") {
  rsyncArgs.unshift("--dry-run");
  console.log("▶ DRY RUN：仅演练，不改动服务器。");
}

console.log(`▶ rsync 同步到 ${destination}`);
run("rsync", rsyncArgs);

console.log("\n✔ 部署完成。");
console.log(`  目标目录: ${targetPath}`);
console.log("  首次部署请确认 Nginx 已指向该目录且 HTTPS 证书已签发（见 docs/deployment.md）。");
