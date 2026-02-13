#!/usr/bin/env node
/**
 * ビルドごとに out-vr1.0.YYYYMMDDHHmmss 形式のバージョンを付与する。
 * - NEXT_PUBLIC_BUILD_VERSION を設定して next build を実行
 * - ビルド後に out/version.txt に同じバージョンを書き出し
 * - out/ を public_html/ にコピー（.user.ini は除外）。シェルスクリプト不要で Mac/Windows 両方で動く
 */
const { execSync } = require("child_process");
const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const OUT_DIR = path.join(root, "out");
const PUBLIC_HTML_DIR = path.join(root, "public_html");
const EXCLUDE_COPY = new Set([".user.ini"]);

function copyDirRecursive(src, dest, exclude) {
  if (!fs.existsSync(src)) return;
  fs.mkdirSync(dest, { recursive: true });
  for (const name of fs.readdirSync(src)) {
    if (exclude && exclude.has(name)) continue;
    const srcPath = path.join(src, name);
    const destPath = path.join(dest, name);
    const stat = fs.statSync(srcPath);
    if (stat.isDirectory()) {
      copyDirRecursive(srcPath, destPath, null);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

function syncOutToPublicHtml() {
  if (!fs.existsSync(OUT_DIR)) {
    console.log("out/ が見つかりません。スキップします。");
    return;
  }
  if (fs.existsSync(PUBLIC_HTML_DIR)) {
    for (const name of fs.readdirSync(PUBLIC_HTML_DIR)) {
      if (EXCLUDE_COPY.has(name)) continue;
      const destPath = path.join(PUBLIC_HTML_DIR, name);
      if (fs.statSync(destPath).isDirectory()) {
        fs.rmSync(destPath, { recursive: true });
      } else {
        fs.unlinkSync(destPath);
      }
    }
  } else {
    fs.mkdirSync(PUBLIC_HTML_DIR, { recursive: true });
  }
  copyDirRecursive(OUT_DIR, PUBLIC_HTML_DIR, EXCLUDE_COPY);
  const now = new Date();
  try {
    fs.utimesSync(PUBLIC_HTML_DIR, now, now);
  } catch (_) {}
  // コピー完了の証拠として .last-export に日時を書き出し（フォルダの更新確認用）
  const lastExportPath = path.join(PUBLIC_HTML_DIR, ".last-export");
  fs.writeFileSync(lastExportPath, now.toISOString() + "\n", "utf8");
  const versionPath = path.join(PUBLIC_HTML_DIR, "version.txt");
  const version = fs.existsSync(versionPath)
    ? fs.readFileSync(versionPath, "utf8").trim()
    : "(不明)";
  console.log("public_html/ を更新しました。バージョン:", version);
  console.log("更新日時:", now.toISOString().replace("T", " ").slice(0, 19));
  console.log("→ public_html/.last-export に書き出しました。コピーが動いたかはこのファイルの日時で確認できます。");
}

// build-version.txt があれば "1.0" のようなベースを読む。なければ "1.0"
let base = "1.0";
const versionFile = path.join(root, "build-version.txt");
if (fs.existsSync(versionFile)) {
  const content = fs.readFileSync(versionFile, "utf8").trim();
  if (content) base = content.split(/\s/)[0];
}

const now = new Date();
const timestamp =
  now.getFullYear() +
  String(now.getMonth() + 1).padStart(2, "0") +
  String(now.getDate()).padStart(2, "0") +
  String(now.getHours()).padStart(2, "0") +
  String(now.getMinutes()).padStart(2, "0") +
  String(now.getSeconds()).padStart(2, "0");

const version = `out-vr${base}.${timestamp}`;
const env = { ...process.env, NEXT_PUBLIC_BUILD_VERSION: version };

console.log("ビルドバージョン:", version);
execSync("npx next build", { cwd: root, env, stdio: "inherit" });

const outVersionPath = path.join(root, "out", "version.txt");
fs.mkdirSync(path.dirname(outVersionPath), { recursive: true });
fs.writeFileSync(outVersionPath, version + "\n", "utf8");
console.log("out/version.txt に書き出しました:", version);

// public/.htaccess を out/ に上書きコピー（Header unset CSP 等を確実に反映）
const publicHtaccess = path.join(root, "public", ".htaccess");
const outHtaccess = path.join(root, "out", ".htaccess");
if (fs.existsSync(publicHtaccess)) {
  fs.copyFileSync(publicHtaccess, outHtaccess);
  console.log("public/.htaccess を out/.htaccess にコピーしました。");
}

// CSP をやめる: out/ 内の HTML から Content-Security-Policy meta を除去
require("./remove-csp-from-html.js");

// DOCTYPE/html/body が無い HTML に付与（HierarchyRequestError・React #418/#423 対策）
require("./fix-html-doctype.js");

syncOutToPublicHtml();
