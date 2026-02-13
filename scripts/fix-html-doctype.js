#!/usr/bin/env node
/**
 * out/ 内の HTML で先頭に <!DOCTYPE html> が無いものにだけ DOCTYPE を付与する。
 * <html><body> は付けない。付けると Next クライアントが別ルートを appendChild しようとして
 * HierarchyRequestError: Only one element on document allowed になる。
 * DOCTYPE のみで Quirks Mode は防げる。
 */
const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const OUT_DIR = path.join(root, "out");
const PREFIX = "<!DOCTYPE html>\n";

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
  const trimmed = content.trimStart();
  if (trimmed.toUpperCase().startsWith("<!DOCTYPE")) return;
  content = PREFIX + content;
  fs.writeFileSync(filePath, content, "utf8");
  count++;
});

if (count > 0) {
  console.log("DOCTYPE を付与しました:", count, "ファイル");
} else {
  console.log("修正不要（全 HTML に DOCTYPE あり）");
}
