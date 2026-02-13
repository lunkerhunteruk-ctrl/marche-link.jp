#!/usr/bin/env node
/**
 * out/ 内の全 HTML から Content-Security-Policy の meta タグを除去する。
 * CSP をやめて eval ブロックによる真っ白画面を防ぐために使用。
 * 使い方: node scripts/remove-csp-from-html.js
 */
const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const OUT_DIR = path.join(root, "out");

// CSP meta タグ（1行 or 改行含む）にマッチ。http-equiv / content-security-policy の大文字小文字は区別しない
const CSP_META_REGEX = /<meta\s+[^>]*http-equiv\s*=\s*["']Content-Security-Policy["'][^>]*>\s*/gi;

function walkDir(dir, callback) {
  if (!fs.existsSync(dir)) return;
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const ent of entries) {
    const full = path.join(dir, ent.name);
    if (ent.isDirectory()) {
      walkDir(full, callback);
    } else if (ent.isFile() && ent.name.toLowerCase().endsWith(".html")) {
      callback(full);
    }
  }
}

let count = 0;
walkDir(OUT_DIR, (filePath) => {
  let content = fs.readFileSync(filePath, "utf8");
  const before = content;
  content = content.replace(CSP_META_REGEX, "");
  if (content !== before) {
    fs.writeFileSync(filePath, content, "utf8");
    count++;
  }
});

if (count > 0) {
  console.log("CSP meta を除去しました:", count, "ファイル");
} else {
  console.log("CSP meta は見つかりませんでした（out/ 内）");
}
