#!/usr/bin/env bash
# サーバー上で実行し、デプロイに必要なファイルが揃っているか確認する
# 使い方: サーバーにアップロードして bash scripts/check-deploy-server.sh
# 403/404 解消に必要な3ファイル: admin/index.html, admin/onboarding/index.html, admin/products/quick/index.html
set -e
cd "$(dirname "${BASH_SOURCE[0]}")/.."

echo "=== デプロイ状態チェック ($(pwd)) ==="
echo ""

# 解消したい3つのパス（/admin/ 403, /admin/onboarding/, /admin/products/quick/ 404）
ADMIN_INDEX="admin/index.html"
ADMIN_ONBOARDING="admin/onboarding/index.html"
ADMIN_QUICK="admin/products/quick/index.html"

check_three() {
  local prefix="$1"
  local ok=0
  [[ -f "$prefix/$ADMIN_INDEX" ]]       && echo "  [OK] $prefix/$ADMIN_INDEX"       || { echo "  [NG] $prefix/$ADMIN_INDEX がありません"; ok=1; }
  [[ -f "$prefix/$ADMIN_ONBOARDING" ]]  && echo "  [OK] $prefix/$ADMIN_ONBOARDING"  || { echo "  [NG] $prefix/$ADMIN_ONBOARDING がありません"; ok=1; }
  [[ -f "$prefix/$ADMIN_QUICK" ]]       && echo "  [OK] $prefix/$ADMIN_QUICK"       || { echo "  [NG] $prefix/$ADMIN_QUICK がありません"; ok=1; }
  return $ok
}

# 1. out の有無と3ファイル
if [[ -d "out" ]]; then
  echo "[1] out/ が存在します"
  check_three "out" || true
  [[ -d "out/_next" ]] && echo "  [OK] out/_next/ あり" || echo "  [NG] out/_next/ がありません"
else
  echo "[NG] out/ がありません → ローカルで npm run build した out をサーバーの marche-link.jp/out にアップロードしてください"
fi
echo ""

# 2. public_html と3ファイル
if [[ -d "public_html" ]]; then
  echo "[2] public_html/ が存在します"
  check_three "public_html" || true
else
  echo "[NG] public_html/ がありません（out をアップロードして deploy-static.sh を実行すると作られます）"
fi
echo ""

# 3a. サブドメイン用 public_html/tanaka/（ドキュメントルートが tanaka の場合）
TANAKA_DIR="public_html/tanaka"
if [[ -d "$TANAKA_DIR" ]]; then
  echo "[3a] $TANAKA_DIR/ が存在します（ドキュメントルート用）"
  check_three "$TANAKA_DIR" || true
else
  echo "[!] $TANAKA_DIR/ がありません → bash deploy-static.sh を実行すると自動作成・同期されます"
fi
echo ""

# 3b. サブドメイン用 public_html/tanaka.marche-link.jp/
DOCROOT_DIR="public_html/tanaka.marche-link.jp"
if [[ -d "$DOCROOT_DIR" ]]; then
  echo "[3b] $DOCROOT_DIR/ が存在します（ドキュメントルート用）"
  check_three "$DOCROOT_DIR" || true
else
  echo "[!] $DOCROOT_DIR/ がありません → bash deploy-static.sh を実行すると自動作成・同期されます"
fi
echo ""

# 4. deploy-static.sh が「out を反映」する新版か
if grep -q "out/ を public_html/ に反映します" deploy-static.sh 2>/dev/null; then
  echo "[4] deploy-static.sh は新版です（out → public_html を反映します）"
else
  echo "[NG] deploy-static.sh が古い可能性があります。ローカルの deploy-static.sh をサーバーにアップロードし直してください"
fi
echo ""

# 5. .htaccess に CSP の unsafe-eval と Header unset が含まれているか（CSP で eval がブロックされると真っ白になる）
for ht in "public_html/.htaccess" "public_html/tanaka/.htaccess" "public_html/tanaka.marche-link.jp/.htaccess"; do
  if [[ -f "$ht" ]]; then
    if grep -q "unsafe-eval" "$ht" 2>/dev/null; then
      echo "[5] [OK] $ht に unsafe-eval あり（CSP 緩和済み）"
    else
      echo "[5] [NG] $ht に unsafe-eval がありません → 古い public_html。npm run export し直して public_html をアップロードしてください"
    fi
    if grep -q "Header unset Content-Security-Policy" "$ht" 2>/dev/null; then
      echo "     [OK] $ht に Header unset あり（サーバー側 CSP を消してから自前 CSP を付与）"
    else
      echo "     [!] $ht に Header unset がありません → public/.htaccess を最新にして npm run export し直し、public_html をアップロードしてください"
    fi
  else
    echo "[5] [!] $ht がありません"
  fi
done
echo ""
echo "=== チェック終了 ==="
