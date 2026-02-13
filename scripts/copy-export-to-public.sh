#!/usr/bin/env bash
# next build (output: export) で生成された out/ を public_html/ にコピーする
# .user.ini は上書きしない（サーバー用 PHP 設定を残す）。.htaccess はプロジェクトのものをコピーする（404 防止）
# --delete で out に無いファイルは public_html から削除し、フォルダを完全に同期する
set -e
cd "$(dirname "${BASH_SOURCE[0]}")/.."
if [[ ! -d out ]]; then
  echo "Error: out/ が見つかりません。先に npm run build を実行してください。"
  exit 1
fi
rsync -av --delete out/ public_html/ \
  --exclude='.user.ini'
# フォルダの更新日時を明示的に更新（「更新の時間」で確認しやすくする）
touch public_html
if [[ -f public_html/version.txt ]]; then
  echo "public_html/ を更新しました。バージョン: $(cat public_html/version.txt | tr -d '\n')"
else
  echo "public_html/ を更新しました。"
fi
echo "更新日時: $(date '+%Y-%m-%d %H:%M:%S')"
