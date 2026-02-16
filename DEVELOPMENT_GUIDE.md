# marche-link.jp 開発ガイド

## 重要な背景

2026年2月に、ターミナルコマンドの事故により全ての `.tsx` ソースファイルが削除されました。
サーバー上のビルド済みファイル（HTML/JS/CSS）のみが残り、一部のソースファイルは復元できましたが、
多くのページはソースコードが失われた状態です。

---

## ファイル構成の現状

### 編集可能（ソースあり）

以下のページ・コンポーネントは `.tsx` ソースが存在し、機能追加・修正が可能です。

| パス | ファイル | 説明 |
|------|----------|------|
| `/admin/products/quick` | `app/admin/products/quick/page.tsx` | 商品登録（かんたん登録） |
| `/admin/design` | `app/admin/design/page.tsx` | デザイン設定 |
| `/admin/onboarding` | `app/admin/onboarding/page.tsx` | 初期設定ウィザード |

#### 関連するライブラリファイル

```
lib/
├── firebase.ts              # Firebase 初期化
├── liff.ts                  # LIFF SDK ラッパー
├── constants/
│   ├── liff.ts              # LIFF ID・URL 定数
│   └── subdomain.ts         # サブドメイン関連
├── hooks/
│   └── use-auth.ts          # 認証フック
├── services/
│   ├── product-service.ts   # 商品 CRUD
│   ├── store-service.ts     # ストア関連
│   ├── create-store.ts      # ストア作成
│   ├── design-presets.ts    # デザインプリセット
│   └── update-store-preset.ts
└── types/
    ├── product.ts           # 商品の型定義
    └── onboarding.ts        # オンボーディングの型定義

components/
├── ui/
│   └── combobox.tsx         # カスタムコンボボックス
├── onboarding/
│   ├── onboarding-step-basic.tsx
│   ├── onboarding-step-concept.tsx
│   ├── onboarding-step-design.tsx
│   └── optional-fields-note.tsx
└── ClientOnlyAdmin.tsx
```

---

### 編集不可（ソースなし・静的HTMLのみ）

以下のページは `.tsx` ソースが存在せず、`public/` 内のビルド済み HTML のみです。
修正には再作成が必要ですが、LIFF 認証の複雑さから困難です。

| パス | 静的ファイル | 説明 |
|------|-------------|------|
| `/admin-entry` | `public/admin-entry/index.html` | LP・ログイン画面 |
| `/admin` | `public/admin/index.html` | 管理画面トップ |
| `/admin/orders` | `public/admin/orders/index.html` | 注文一覧 |
| `/admin/products` | `public/admin/products/index.html` | 商品一覧 |
| `/admin/qrcode` | `public/admin/qrcode/index.html` | QRコード |
| `/admin/register` | `public/admin/register/index.html` | 登録 |
| `/admin/settings` | `public/admin/settings/index.html` | 設定トップ |
| `/admin/settings/about` | `public/admin/settings/about/index.html` | 店舗情報 |
| `/admin/settings/blocked-access` | `public/admin/settings/blocked-access/index.html` | ブロック設定 |
| `/admin/settings/notifications` | `public/admin/settings/notifications/index.html` | 通知設定 |
| `/admin/settings/payment` | `public/admin/settings/payment/index.html` | 決済設定 |
| `/admin/settings/presets` | `public/admin/settings/presets/index.html` | プリセット |
| `/order` | `public/order/index.html` | 注文画面（顧客向け） |
| `/shop` | `public/shop/index.html` | ショップ画面（顧客向け） |
| `/` | `public/index.html` | トップページ |

> **注意**: `app/admin-entry/page.tsx` は存在しますが、これは復元を試みて作成したもので、
> 本番環境では動作しません。本番は `public/admin-entry/index.html` を使用しています。

---

## デプロイ手順

### 安全なデプロイ方法

1. **ビルド前に `public/_next` を退避**
   ```bash
   mv public/_next /tmp/_next_backup
   ```

2. **ビルド実行**
   ```bash
   npm run build
   ```

3. **新旧のファイルをマージ**
   ```bash
   cp -r out/_next public/_next
   cp -r /tmp/_next_backup/static/* public/_next/static/
   ```

4. **編集可能なページのHTMLのみ更新**
   ```bash
   cp out/admin/products/quick/index.html public/admin/products/quick/
   cp out/admin/design/index.html public/admin/design/
   cp out/admin/onboarding/index.html public/admin/onboarding/
   ```

   > **重要**: `public/admin-entry/index.html` は更新しないでください

5. **サーバーにデプロイ（--delete なし）**
   ```bash
   rsync -avz \
     -e "ssh -i /Users/mari/Desktop/SSH/skawasaki.key -p 10022" \
     public/ \
     skawasaki@sv16731.xserver.jp:/home/skawasaki/marche-link.jp/public_html/ \
     --exclude='.DS_Store'
   ```

### 絶対にやってはいけないこと

- `rsync --delete` を使用しない（古いJSチャンクが削除され、静的ページが壊れる）
- `public/admin-entry/index.html` を上書きしない
- 編集不可ページの HTML を新しいビルドで置き換えない

---

## ビルドID について

Next.js は各ビルドで一意の ID（例: `B_CJpJji-EnU3wJ_rPDx_`）を生成します。
HTML ファイルは特定のビルドIDの JS チャンクを参照しています。

```
public/_next/static/
├── B_CJpJji-EnU3wJ_rPDx_/    # 古いビルド（admin-entry が使用）
├── 8R3lRYIExKmqSHjNsI0vI/    # 新しいビルド（編集可能ページが使用）
└── chunks/                    # 共有チャンク
```

古いビルドIDのフォルダを削除すると、それを参照している静的ページが壊れます。

---

## 機能追加の例：商品にグレード（新品/中古）を追加する場合

1. **型定義を更新** (`lib/types/product.ts`)
   ```typescript
   export interface Product {
     // ... 既存フィールド
     grade?: '新品' | '中古' | '良好';
   }

   export interface ProductFormData {
     // ... 既存フィールド
     grade: string;
   }
   ```

2. **UIを更新** (`app/admin/products/quick/page.tsx`)
   - セレクトボックスまたは Combobox を追加

3. **Cloud Functions を更新**（バックエンド）
   - `createProduct` 関数で `grade` を受け取り保存

4. **デプロイ**
   - 上記「安全なデプロイ方法」に従う

---

## サーバー情報

| 項目 | 値 |
|------|-----|
| ホスト | sv16731.xserver.jp |
| ポート | 10022 |
| ユーザー | skawasaki |
| SSH鍵 | `/Users/mari/Desktop/SSH/skawasaki.key` |
| 公開ディレクトリ | `/home/skawasaki/marche-link.jp/public_html/` |

---

## LIFF 設定

| 用途 | LIFF ID | URL |
|------|---------|-----|
| 管理者エントリ | `2009034946-GQ1UQIRr` | `/admin-entry/` |
| 管理画面 | `2009034946-LkF5LngF` | `/admin/` |
| 注文（顧客向け） | `2009034946-KaRhKY16` | `/order/`, `/shop/` |

---

## 連絡事項

このプロジェクトは一部のソースコードが失われた状態で運用されています。
大規模な変更を行う場合は、事前に十分なバックアップを取り、
ステージング環境でのテストを推奨します。

最終更新: 2026-02-16
