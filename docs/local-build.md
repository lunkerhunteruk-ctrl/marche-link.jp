# ローカルでビルドする手順

このドキュメントでは、ターミナルでプロジェクトを開き、ビルドするコマンドとファイルパスをまとめています。

**「デプロイの流れをシンプルに知りたい」** → **[docs/deploy-flow.md](deploy-flow.md)** に「やること3つ」だけまとめてあります。

---

## プロジェクトのパス

```
/home/skawasaki/marche-link.jp
```

---

## 1. ターミナルを開いてプロジェクトへ移動

```bash
cd /home/skawasaki/marche-link.jp
```

---

## 2. 依存関係のインストール（初回または package.json 変更後）

```bash
cd /home/skawasaki/marche-link.jp
npm install
```

---

## 3. 開発サーバーで起動（ローカル確認用）

```bash
cd /home/skawasaki/marche-link.jp
npm run dev
```

ブラウザで http://localhost:3000 を開く。

---

## 4. ビルド（本番用静的ファイルの生成）

```bash
cd /home/skawasaki/marche-link.jp
npm run build
```

- 出力先: `out/` ディレクトリ（Next.js の static export）
- **ビルドバージョン:** 毎回 `out-vr1.0.YYYYMMDDHHmmss` 形式のバージョンが付きます（書き換え確認用）。管理画面ヘッダーと `out/version.txt` に同じ値が出ます。

### ビルドバージョン（out-vr1.0）で書き換え確認

- `npm run build` または `npm run export` を実行すると、**ビルドごとに一意のバージョン**（例: `out-vr1.0.20260203183045`）が付きます。
- **管理画面**を開くと、ヘッダー右側に「ビルド: out-vr1.0.20260203183045」のように表示されます。
- **`out/version.txt`**（export の場合は **`public_html/version.txt`**）にも同じ文字列が書き出されます。
- デプロイ後に「管理画面の表示」または「https://あなたのサイト/version.txt」を開き、バージョンが変わっていれば **out の書き換えが反映されている**と判断できます。
- ベース番号（1.0 → 1.1）を変えたいときは、プロジェクトルートの **`build-version.txt`** の内容を編集してからビルドしてください。

---

## 5. ビルド ＋ public_html へのコピー（サーバー用・推奨）

```bash
cd /home/skawasaki/marche-link.jp
npm run export
```

- **out/ と public_html/ の両方が同時に更新されます。**
- 流れ: `next build` で `out/` を生成 → `scripts/copy-export-to-public.sh` で `out/` の内容を `public_html/` にコピー。
- `.htaccess` と `.user.ini` は上書きしない。

### out だけでは無理？　両方いつも必要？

**いいえ。out だけでも更新できます。** どちらが必要かは「サーバーに何をアップロードするか」で決まります。

| 運用 | ローカルでやること | サーバーにアップロードするもの |
|------|--------------------|--------------------------------|
| **out をそのまま使う** | `npm run build` だけ（out だけ更新） | **out/** の中身 |
| **public_html をサーバーに上げる**（Xserver など） | `npm run export`（out と public_html の両方更新） | **public_html/** の中身 |

- **out だけ**の運用: ビルドで **out/** を更新し、その **out/** をサーバーのドキュメントルートにアップロードする。この場合 public_html は使わないので、**out の更新だけで十分**です。
- **public_html を上げる**運用: サーバーが public_html をドキュメントルートにしているなら、ローカルで **`npm run export`** して **public_html/** を最新にし、その **public_html/** をアップロードする。このとき「両方更新」なのは **ローカルで export を回す結果**（out → public_html にコピーされる）であり、**サーバーに上げるのは public_html だけでよい**です。

**まとめ:** 「out だけでは更新できない」わけではありません。サーバーに out を直接入れるなら out だけ、サーバーに public_html を入れるなら export で両方更新してから public_html をアップロード、と使い分けです。

### ずっと out だけで更新してきたのにサイトが変わらない理由

**サーバー（Xserver）が「サイトとして配信している」のは out ではなく、public_html の中身だからです。**

- ドキュメントルート（ブラウザで見ているページの元）は **public_html/** に設定されていることが多いです。
- そのため、**out/** をアップロードしたりサーバー上の out を更新しても、**Web サーバーは public_html/ のファイルを読んで配信している**ので、表示は変わりません。
- サイトを変えるには、**public_html/ の中身**を新しいビルドで差し替える必要があります。

つまり「out だけで更新してきた」＝ out は新しくなっているが、**配信元の public_html が古いまま**なので、サイトが変わらなかった、という状態です。  
これからは **`npm run export` で public_html を更新 → その public_html をサーバーにアップロード → サーバーで `./deploy-static.sh`** の流れにすると、変更がサイトに反映されます。

### いつ使う？　ビルドして out をサーバーに入れるのではダメ？

**「いつもビルドして out をサーバーに入れる」運用で問題ありません。**

- **`npm run build` だけ使う場合**  
  ビルドでできた **`out/`** をそのままサーバーにアップロード（FTP/rsync など）するなら、`npm run build` だけで十分です。サーバー上で `out/` の内容をドキュメントルートに置く運用になります。

- **`npm run export` を使う場合**  
  サーバー側では **`public_html/`** をドキュメントルートにしており、ローカルでも同じ `public_html/` を編集・アップロードする運用のときに使います。  
  - ローカルで `npm run export` を実行すると、`out/` の内容が **ローカルの `public_html/`** にコピーされます。  
  - その後、その **`public_html/`** をサーバーにアップロードする、という流れです。  
  - サーバーにすでにある `.htaccess` や `.user.ini` はコピー時に上書きしないので、ローカルの `public_html/` をそのまま同期しやすいです。

**まとめ:** サーバーに「out の中身」を直接入れるなら `npm run build` だけでよい。サーバーに「public_html の中身」を入れる運用なら、ローカルで `npm run export` してから `public_html/` をアップロードする、と覚えておけば大丈夫です。

---

## 変更を反映させるデプロイ手順（ビルドして同期しても反映されないとき）

**「サーバーで `./deploy-static.sh` だけ実行」では、サーバー上のファイルは新しいビルドに変わりません。**

`deploy-static.sh` は **サーバー上の `public_html/` の中身** を、サブドメイン用フォルダ（`tanaka.marche-link.jp` など）にコピーするだけです。  
なので、**サーバー上の `public_html/` が古いまま**だと、同期しても古い内容が再度コピーされるだけです。

### 正しい流れ（3ステップ）

| 順番 | どこで | やること |
|------|--------|----------|
| 1 | **ローカル（Mac など）** | `npm run export` を実行する（out を生成し、ローカルの `public_html/` にコピーされる） |
| 2 | **ローカル → サーバー** | **ローカルの `public_html/` 全体** を、サーバーの `marche-link.jp/public_html/` にアップロードする（FTP/SFTP/rsync など） |
| 3 | **サーバー上** | `./deploy-static.sh` を実行する（サーバー上の `public_html/` を各サブドメイン用フォルダに同期する） |

**2 の「アップロード」を忘れると、サーバーの `public_html/` は古いままなので、3 で同期しても変更は反映されません。**

### 反映されたか確認する方法

- アップロード後に **サーバー上の `public_html/version.txt`** を開き、中身が新しいビルドバージョン（例: `out-vr1.0.20260203183045`）になっているか確認する。
- または **https://あなたのサイト/version.txt** や **管理画面ヘッダーの「ビルド: …」** が新しいバージョンになっているか確認する。

### public_html があるのに「見つかりません」と出る場合

**スクリプトが動いているのはサーバー上です。** ローカル（Mac や Cursor）に public_html があっても、**サーバーの同じ場所**に public_html が無いとエラーになります。

1. **アップロード先を確認する**  
   `./deploy-static.sh` は **スクリプトがあるディレクトリ** で `public_html` を探します。  
   サーバーで次を実行して、**そのディレクトリに** public_html があるか確認してください。
   ```bash
   cd /home/skawasaki/marche-link.jp   # deploy-static.sh がある場所
   pwd
   ls -la public_html
   ```
   - `ls: public_html にアクセスできません: そのようなファイルやディレクトリはありません` と出る → **サーバーのこのパスに public_html が無い**ので、ここにアップロードし直してください。

2. **「フォルダごと」アップロードする**  
   **public_html の中身だけ**を marche-link.jp 直下に上げてしまうと、`marche-link.jp/public_html/` というフォルダはできません。  
   - 正しい形: サーバーに **`marche-link.jp/public_html/`** というフォルダがあり、その中に index.html や _next などが入っている。  
   - **public_html はホーム直下（/home/ユーザー名）には作らない。** SFTP で「marche-link.jp」フォルダを開き、**その中に** public_html ができるようにアップロードする。  
   - FTP では「public_html フォルダごと」選択して、`marche-link.jp` の下にアップロードする（結果として `marche-link.jp/public_html/...` になる）。

3. **スクリプトのデバッグ表示を見る**  
   修正済みの `deploy-static.sh` では、実行時に「作業ディレクトリ」と「public_html の有無」を表示します。  
   サーバーにそのスクリプトを置き直して `./deploy-static.sh` を実行し、表示されたパスに本当に public_html があるか確認してください。

---

## サイトを作り込むときの更新は？

**「out の更新」だけで十分です。HTML を手で書き換える必要はありません。**

このプロジェクトでは次の流れになります。

1. **編集するのはソースだけ**  
   `app/` や `components/` などの React/Next.js のソースを編集する。
2. **ビルドで HTML が自動生成される**  
   `npm run build` を実行すると、Next.js が静的ファイル（HTML・JS・CSS）を **`out/`** に出力する。ここに含まれる HTML が本番用のページになる。
3. **public_html は「out のコピー先」**  
   サーバーに **`public_html/`** を上げる運用の場合は、**`npm run export`** を実行すると **`out/` の内容が `public_html/` にコピー**される。  
   つまり **`public_html/` は out から自動で更新される**ので、`public_html/` 内の HTML を手で編集する必要はない。

**まとめ**

- サイトを作り込むときは、**ソースを編集 → `npm run build`** で **`out/` を更新**すればよい。
- サーバーに out を直接入れるなら、更新した **`out/`** をアップロードする。
- サーバーに public_html を入れるなら、**`npm run export`** で out → public_html をコピーしてから、**`public_html/`** をアップロードする。
- **HTML の手作業更新は不要**（すべてビルドで生成）。

---

## 主なファイル・ディレクトリパス

| 用途           | パス |
|----------------|------|
| プロジェクトルート | `/home/skawasaki/marche-link.jp` |
| ビルド出力（静的） | `/home/skawasaki/marche-link.jp/out/` |
| ビルドバージョン（out 内） | `/home/skawasaki/marche-link.jp/out/version.txt` |
| ベースバージョン編集用 | `/home/skawasaki/marche-link.jp/build-version.txt` |
| 公開用コピー先   | `/home/skawasaki/marche-link.jp/public_html/` |
| コピースクリプト  | `/home/skawasaki/marche-link.jp/scripts/copy-export-to-public.sh` |
| package.json  | `/home/skawasaki/marche-link.jp/package.json` |
| Next.js 設定  | `/home/skawasaki/marche-link.jp/next.config.mjs` |

---

## よく使うコマンド一覧

```bash
# プロジェクトへ移動
cd /home/skawasaki/marche-link.jp

# 依存関係インストール
npm install

# 開発サーバー起動
npm run dev

# 本番ビルドのみ（out/ をサーバーに入れる運用ならこれで十分）
npm run build

# ビルド ＋ public_html へコピー（public_html/ をサーバーに上げる運用のとき）
npm run export
```

---

## サーバー上でビルドを通したい（プロセスを細かくすれば無理？）

**結論:** 共有サーバー（Xserver など）の上で Next.js のビルドを通すのは、**プロセスを細かくしてもほぼ無理**なことが多いです。**ローカルまたは CI でビルドして、結果だけサーバーに置く**運用が現実的です。

### サーバー上でビルドが失敗しやすい理由

- **メモリ不足**  
  Next.js のビルドはメモリを多く使います。共有サーバーは 1 プロセスあたりのメモリ制限が厳しく、`npm run build` の途中で落ちることがあります。
- **Node.js の有無・バージョン**  
  共有サーバーでは Node.js が使えない、または古いバージョンしかなく、`next build` が動かないことがあります。
- **実行時間制限**  
  ビルドに 1〜2 分かかると、PHP の max_execution_time や CGI の制限に引っかかることがあります。

### 「一度あたりのプロセスを細かくする」で通るか

**Next.js のビルドは「1 回のコンパイル」の塊**なので、**「ここだけサーバーで実行」のように細かく分けて通すのは現実的ではありません。**

- `next build` はプロジェクト全体を読み込み、依存関係を解決し、バンドル・最適化を一気に行います。
- 「ページごとに別プロセスでビルド」のような分割は、Next.js の標準の仕組みにはありません。
- メモリ制限に引っかかるのは「1 プロセスで大量に使う」ためで、細かいステップに分けても、最後にまとめる段階で同じメモリが必要になります。

そのため、**「サーバー上の 1 回の実行を細かくする」だけでは、共有サーバーでビルドを通すのは難しい**と考えてよいです。

### 現実的なやり方（ビルドはサーバー外で行う）

1. **ローカルでビルドしてアップロード（推奨）**  
   - 自分の PC（Mac/Windows）で `npm run build` または `npm run export` を実行する。  
   - できた **`out/`** または **`public_html/`** を FTP/rsync でサーバーにアップロードする。  
   - サーバーは「静的ファイルを配信するだけ」なので、メモリ・Node・時間制限の影響を受けません。

2. **CI/CD でビルドしてからデプロイ**  
   - GitHub Actions や GitLab CI などで「コードを push したらビルドし、out や public_html をサーバーに転送する」ようにする。  
   - ビルドは GitHub 側（など）の環境で行い、サーバーには **ビルド結果のファイルだけ** を送ります。  
   - サーバー上で Node やビルドコマンドを動かす必要はありません。

3. **VPS やクラウドでビルドする場合**  
   - サーバーが VPS や Cloud Run などで、Node が使えメモリも足りる場合は、そのサーバー上で `npm run build` を実行することは可能です。  
   - その場合でも「プロセスを細かくする」より、**メモリを増やす・Node のバージョンを合わせる**の方が効果的です。

**まとめ:** サーバー上でビルドを通すために「一度あたりのプロセスを細かくする」のは、Next.js の性質上ほぼ効果がありません。**ビルドはローカルか CI で行い、サーバーには out / public_html の結果だけを置く**形にするのが確実です。
