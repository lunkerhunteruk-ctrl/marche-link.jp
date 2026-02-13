#!/usr/bin/env bash
# Xserver 用: public_html の内容を各サブドメイン用フォルダに同期する
# public_html が無く out/ だけある場合は、out/ を public_html/ にコピーしてから同期する
set -e
cd "$(dirname "${BASH_SOURCE[0]}")"
PUBLIC_HTML="public_html"

# デバッグ: スクリプトがどこで public_html を探しているか表示
echo "作業ディレクトリ: $(pwd)"
if [[ -d "$PUBLIC_HTML" ]]; then
  echo "public_html: 存在します"
else
  echo "public_html: このディレクトリにはありません"
fi

# out/ がサーバーにある場合は、必ず out → public_html を反映してから同期する（これで「out をアップしてスクリプト」で更新できる）
if [[ -d "out" ]]; then
  echo "out/ を public_html/ に反映します..."
  mkdir -p "$PUBLIC_HTML"
  rsync -av --delete out/ "$PUBLIC_HTML"/ \
    --exclude='.user.ini'
  echo "public_html/ を out/ の内容で更新しました。"
elif [[ ! -d "$PUBLIC_HTML" ]]; then
  echo "Error: out/ も $PUBLIC_HTML も見つかりません。"
  echo "ローカルで npm run build して out を生成し、サーバーの marche-link.jp/out にアップロードしてから再度実行してください。"
  exit 1
fi

# 名前が「.」を含むディレクトリ = サブドメイン用フォルダ（例: tanaka.marche-link）
for dest_dir in "$PUBLIC_HTML"/*.*/ ; do
  [[ -d "$dest_dir" ]] || continue
  name=$(basename "$dest_dir")
  echo "同期中: $name ..."
  rsync -a --delete \
    --exclude='*.*/' \
    --exclude='tanaka/' \
    "$PUBLIC_HTML"/ "$dest_dir"
  touch "$dest_dir"
done

# サブドメイン用フォルダ（ドットなし）。ドキュメントルートが public_html/tanaka/ の場合に必要
for subdomain in tanaka ; do
  dest_dir="$PUBLIC_HTML/$subdomain"
  if [[ ! -d "$dest_dir" ]]; then
    mkdir -p "$dest_dir"
    echo "作成しました: $dest_dir"
  fi
  echo "同期中: $subdomain (サブドメイン用) ..."
  rsync -a --delete \
    --exclude='*.*/' \
    --exclude='tanaka/' \
    "$PUBLIC_HTML"/ "$dest_dir/"
  touch "$dest_dir"
done

# サブドメイン用フォルダ（フルドメイン名）。ドキュメントルートが public_html/(サブドメイン名).marche-link.jp/ の場合に必要
# Xserver で「公開フォルダ = (サブドメイン名).marche-link.jp」と設定しているときはここに同期される
for full_domain in tanaka.marche-link.jp ; do
  dest_dir="$PUBLIC_HTML/$full_domain"
  if [[ ! -d "$dest_dir" ]]; then
    mkdir -p "$dest_dir"
    echo "作成しました: $dest_dir"
  fi
  echo "同期中: $full_domain (ドキュメントルート用) ..."
  rsync -a --delete \
    --exclude='*.*/' \
    --exclude='tanaka/' \
    "$PUBLIC_HTML"/ "$dest_dir/"
  touch "$dest_dir"
done

# 403 Forbidden 防止: Web サーバーが _next や admin 以下を読めるようにパーミッションを設定
# ディレクトリ 755・ファイル 644（Xserver 等で一般的）
echo "パーミッションを設定しています..."
for target in "$PUBLIC_HTML" "$PUBLIC_HTML/tanaka" "$PUBLIC_HTML/tanaka.marche-link.jp" ; do
  if [[ -d "$target" ]]; then
    chmod -R 755 "$target" 2>/dev/null || true
    find "$target" -type f -exec chmod 644 {} \; 2>/dev/null || true
  fi
done
echo "パーミッション設定完了（_next 以下も読み込み可能にしました）"

echo "完了しました。同期日時: $(date '+%Y-%m-%d %H:%M:%S')"
