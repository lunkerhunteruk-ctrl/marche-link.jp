# デプロイの流れ（これだけやればいい）

サイトを更新してサーバーに反映するときは、**次の3つを順番にやる**だけです。

---

## ステップ 1：ローカルでエクスポート（1コマンド）

プロジェクトのフォルダで:

```bash
npm run deploy
```

または:

```bash
npm run export
```

- **`npm run deploy`** は「export を実行して、そのあと『次にやること』を表示する」ので、迷いにくいです。
- これで **out** と **public_html** が両方、最新のビルドで更新されます。
- エラーが出なければ、表示された手順どおりにステップ 2 へ。

**public_html が更新されたか確認する:**  
`npm run export` のあと、ターミナルに **「public_html/ を更新しました。バージョン: out-vr1.0.xxxxxx」** と出ていればコピーは動いています。  
フォルダの変更日時が変わらない環境では、**public_html 内の `.last-export`** または **`version.txt`** を開き、中身の日時・バージョンが今回の実行時刻になっているかで判断してください。  
（Mac に最新のコードが同期されていないと、コピー処理が動かず public_html は古いままになります。Cursor で編集した内容を Mac のプロジェクトフォルダに反映してから `npm run export` してください。）

### Mac に反映するとき、どのファイル・フォルダを更新すればいい？

**手動でコピーする場合、次のフォルダ・ファイルを Cursor 側から Mac の同じ場所に上書きしてください。**

| 種類 | パス |
|------|------|
| フォルダ | **app/** 全体 |
| フォルダ | **components/** 全体 |
| フォルダ | **lib/** 全体 |
| フォルダ | **public/** 全体 |
| フォルダ | **scripts/** 全体 |
| ファイル | **package.json** |
| ファイル | **build-version.txt** |
| ファイル | **next.config.mjs** |
| ファイル | **tsconfig.json** |
| ファイル | **deploy-static.sh**（サーバーで使うのであれば） |

**コピーしなくてよいもの:**  
`node_modules/`（Mac で `npm install` すればよい）、`.next/`、`out/`、`public_html/`（これらは Mac で `npm run export` すると作られる・更新される）。

### 画面が真っ白のまま変わらない場合（ローカルに手動で更新するファイル）

Cursor で編集した内容が、**`npm run export` を実行するマシン（Mac など）にまだ反映されていない**と、古い public_html がサーバーに上がり続け、真っ白が解消しません。次を**必ず**ローカルに反映してください。

| 必須 | パス | 理由 |
|------|------|------|
| ✅ | **scripts/build-with-version.js** | CSP 除去のあとで `public/.htaccess` を `out/` にコピーする処理を追加済み。これがないと out/.htaccess に `Header unset` が入らない。 |
| ✅ | **public/.htaccess** | `Header unset Content-Security-Policy` と `Header always set Content-Security-Policy ... unsafe-eval ...` が入った最新版が必要。 |
| ✅ | **scripts/remove-csp-from-html.js** | ビルド後に HTML から CSP meta を除去するスクリプト。export 時に使う。 |

**手順の流れ:**

1. 上記ファイル（および必要なら **app/** や **lib/** など）を Cursor からローカルにコピーするか、`git pull` で反映する。
2. ローカルで **`npm run export`** を実行する（out/ と public_html/ が再生成される。CSP 除去と .htaccess コピーがこのタイミングで行われる）。
3. できた **public_html フォルダごと** をサーバーにアップロードする。
4. サーバーで **`bash deploy-static.sh`** を実行する。

**out/ や public_html/ は手動で編集しないでください。** 毎回 `npm run export` で上書きされるため、正しい状態は「export の結果」だけです。

**Git を使っている場合:**  
Cursor 側で `git add` → `git commit` → `git push` し、Mac 側で `git pull` すれば、上記はまとめて反映されます。

**Cursor 上で public_html を直接確認した場合:**  
`version.txt` や `.last-export` が無い・`admin/design` が無い・管理画面のナビに「デザイン」が無い場合は、古いビルドのままです。ローカル（Mac）で `npm run export` を実行し、できた public_html をサーバーにアップロードしてください。`public_html/README.txt` にも手順を書いてあります。

---

## ステップ 2：public_html をサーバーにアップロード

- **アップロードするもの:** ローカルの **`public_html` フォルダ全体**
- **アップロード先:** サーバー上の **`marche-link.jp` フォルダのなか**（`marche-link.jp/public_html/` になるようにする）

**重要（画面が真っ白になる原因）:** 必ず **`npm run export` で作った public_html** をアップロードしてください。**out フォルダだけ**をサーバーに上げて `deploy-static.sh` で out → public_html にコピーすると、HTML から CSP が除去されていない状態で public_html が更新され、画面が真っ白になることがあります。常にローカルで `npm run export` を実行し、その結果の **public_html フォルダごと** をアップロードしてください。

**注意:** public_html は **ホーム直下（例: /home/ユーザー名）には置きません。** 必ず **marche-link.jp フォルダを開いたその中** にアップロードしてください。SFTP で「marche-link.jp の上の階層」だけ見ると public_html は見えませんが、その階層に作るのではなく、**marche-link.jp を開いて、その中に public_html ができるように**上げます。

FTP/SFTP のときのコツ:

- **「public_html というフォルダごと」** 選んでアップロードする。
- サーバーで **`marche-link.jp/public_html/`** というフォルダができ、その中に index.html や _next などが入っている状態にする。
- 「public_html の**中身だけ**」を marche-link.jp 直下に上げない（それだと public_html フォルダができない）。

---

## ステップ 3：サーバーで同期スクリプトを実行

サーバーに SSH で入り、次の2つを実行:

```bash
cd marche-link.jp
./deploy-static.sh
```

- `marche-link.jp` は、**deploy-static.sh があるディレクトリ**に読み替えてください（サーバー上のパスが違う場合）。
- これで public_html の内容が各サブドメイン用フォルダにコピーされます。
- **「Permission denied」と出る場合:** 実行権限がないため。`bash deploy-static.sh` で実行するか、一度 `chmod +x deploy-static.sh` してから `./deploy-static.sh` を実行してください。

---

## まとめ（コピペ用）

**ローカル（1回）:**

```bash
npm run export
```

**その後:**  
1. ローカルの **public_html** フォルダを、サーバーの **marche-link.jp/public_html/** にアップロードする。  
2. サーバーで `cd marche-link.jp` → `./deploy-static.sh` を実行する。

ここまでやれば、サイトの更新は反映されます。

---

## 404・403 が出る原因（スレッドを遡った整理）

このプロジェクトで 404/403 が出た主な原因は次のとおりです。

### 404 の原因

1. **DirectoryIndex が効いていない（Xserver など）**  
   ディレクトリにアクセスしたときに「どのファイルを読むか」が未設定だと、`/admin/onboarding/` のように末尾スラッシュでアクセスしても `index.html` が読まれず 404 になる。  
   → **対策:** `public/.htaccess` に `DirectoryIndex index.html` を入れ、out/ および public_html/ にコピーする（ビルド・export で自動）。アップロード後に **public_html をサーバーに上げ直す**と .htaccess も反映される。

2. **配信元が public_html ではない／古い**  
   - サーバーのドキュメントルートが **public_html/** なのに、**out/** だけアップロードしていた、または public_html を更新していない。  
   - または **public_html の中身だけ**をアップロードして、サーバーに `marche-link.jp/public_html/` ができていない（アップロード先の勘違い）。  
   → **対策:** ローカルで `npm run export` → **public_html フォルダごと** サーバーの **marche-link.jp のなか** にアップロードする。

3. **サブドメイン用フォルダが未同期**  
   サブドメイン（例: tanaka.marche-link.jp）のドキュメントルートが `public_html/tanaka.marche-link.jp/` なのに、そこに index.html や .htaccess がコピーされていない。  
   → **対策:** サーバーで **`./deploy-static.sh`** を実行し、public_html の内容をサブドメイン用フォルダにコピーする。

### 403 の原因

1. **ディレクトリに index が無い ＋ 一覧禁止**  
   Apache でディレクトリ一覧が無効（Options -Indexes）のとき、そのディレクトリに index.html が無いと 403 Forbidden になることがある。  
   → **対策:** 404 と同様に **DirectoryIndex index.html** を .htaccess で設定し、Next.js の静的 export（`trailingSlash: true`）で各ディレクトリに index.html が出力されていることを確認。public_html を最新でアップロードし、サブドメイン用は `./deploy-static.sh` で同期する。

2. **パーミッション**  
   Web サーバーがファイルを読めない（例: ファイルが 644、ディレクトリが 755 でない）と 403 になる。  
   → **対策:** サーバー上で `marche-link.jp/public_html` 以下を適切な権限（例: ファイル 644、ディレクトリ 755）にし、所有が Web サーバー実行ユーザーと合っているか確認する。

3. **.htaccess が効いていない**  
   サーバー側で AllowOverride 等のため .htaccess が読まれていないと、DirectoryIndex が効かず 404 や 403 になり得る。  
   → **対策:** サーバーの「.htaccess を有効にする」設定を確認。Xserver では通常、public_html 内の .htaccess は有効。

---

## 404 エラーが出る場合（public_html はあるのにページが表示されない）

**Xserver などでは「ディレクトリに index.html を読ませる」設定がないと 404 になることがあります。**

このプロジェクトでは次の対応をしています。

1. **`public/.htaccess`** に `DirectoryIndex index.html` を入れています。  
   - ビルド時に **out/** にコピーされ、**export 時に public_html/** にもコピーされます。  
   - ローカルで **`npm run export`** をやり直し、**public_html をサーバーにアップロードし直す**と、`.htaccess` も一緒に上がります。

2. **まだ 404 のとき**  
   - サーバーの **public_html**（およびサブドメイン用フォルダ）の**直下**に **index.html** があるか確認してください。  
   - ない場合は、アップロード先や「フォルダごと」アップロードになっているかを見直してください。  
   - サブドメイン（例: tanaka.marche-link.jp）の場合は、**サーバーで `./deploy-static.sh` を実行**すると、public_html の内容（index.html と .htaccess 含む）がサブドメイン用フォルダにコピーされます。  
   - 上記「404・403 が出る原因」も参照してください。

---

## CSP で eval がブロックされる場合（画面が真っ白・「/admin/onboarding/ 以外」で出る場合）

**「/admin/onboarding/ 以外のどのページでも CSP が eval をブロックする」** ときは、ルートの `.htaccess` で **script-src に `unsafe-eval` を許可** して、全ページで同じ CSP を送るようにしています。

### このプロジェクトでの対応（すでに組み込み済み）

1. **`public/.htaccess` で CSP に unsafe-eval を入れる**  
   **`public/.htaccess`** に `Header set Content-Security-Policy` で **script-src に `'unsafe-eval'` を含めた CSP** を設定しています。  
   ビルド時に public/ が out/ にコピーされ、export 時に out/ が public_html/ にコピーされるため、**public_html/ およびサブドメイン用フォルダ（tanaka.marche-link.jp 等）のルートに同じ .htaccess が置かれ、全パスで同じ CSP が効きます**。  
   これで `/admin/` や `/admin/design/` など、onboarding 以外のページでも eval がブロックされなくなります。

2. **HTML から CSP meta は除去する**  
   ビルド結果の HTML に CSP の `<meta http-equiv="Content-Security-Policy" ...>` が含まれる場合、**`npm run export`** のなかで out/ 内の全 HTML からその meta を除去しています（`scripts/remove-csp-from-html.js`）。  
   CSP は **.htaccess の 1 本** にそろえ、HTML の meta と重ならないようにしています。

### 手順（CSP に unsafe-eval を入れた状態で反映する）

1. **ローカルで**  
   ```bash
   npm run export
   ```  
   を実行する。  
   → out/ に .htaccess（CSP に unsafe-eval あり）が入り、その内容が public_html/ にコピーされる。

2. **public_html をサーバーにアップロード**  
   ローカルの **public_html/** を、サーバーの **marche-link.jp/public_html/** にアップロードする。

3. **サーバーで**  
   ```bash
   cd marche-link.jp
   bash deploy-static.sh
   ```  
   を実行し、サブドメイン用フォルダ（tanaka.marche-link.jp 等）にも同じ .htaccess を反映する。

これで全ページで CSP の script-src に `unsafe-eval` が含まれ、eval ブロックによる真っ白画面は出なくなります。

**CSP がまだ出て真っ白な場合の確認:**

1. **サーバーが別の CSP を送っていないか**  
   Xserver の「サーバーパネル」→「HTTPヘッダー」や「セキュリティ」で、Content-Security-Policy を付与していないか確認する。付与している場合は「無効」にするか、`script-src` に `unsafe-eval` を追加する。

2. **レスポンスヘッダーを確認**  
   ブラウザの開発者ツール → ネットワーク → 該当ページの HTML を選択 → 「ヘッダー」タブで **Response Headers** の `Content-Security-Policy` を見る。  
   - 複数ある場合は、どれかが厳しい（unsafe-eval なし）と eval がブロックされる。  
   - 値に `script-src ... 'unsafe-eval'` が含まれているか確認する。

3. **.htaccess が効いているか**  
   サーバー上の `public_html/.htaccess` に `Header unset Content-Security-Policy` と `Header always set Content-Security-Policy ... unsafe-eval ...` が入っているか確認する。入っていれば、**新しい public_html をアップロードし直し**、サーバーで `bash deploy-static.sh` を実行する。

**Xserver が急に CSP を効かせてくることはあるか？**  
レンタルサーバーがセキュリティポリシー変更で、全ドメインに HTTP ヘッダーで CSP を付与することがあります。Xserver のサーバーパネルで「HTTPヘッダー」や「セキュリティ」を確認し、Content-Security-Policy が付与されていて script-src に `unsafe-eval` が無いと、Next.js のハイドレーションで eval がブロックされ、画面が真っ白になります。その場合は (1) サーバー側の CSP 付与を無効にするか、(2) 当プロジェクトの `.htaccess` で `Header unset Content-Security-Policy` のあと `Header always set Content-Security-Policy ... unsafe-eval ...` を送るようにしており、**必ず `npm run export` で作った public_html（.htaccess 含む）をアップロード**すれば、同じドメイン内では .htaccess の CSP が優先される場合があります。サーバー側の CSP が強く効く場合は、Xserver サポートに「Content-Security-Policy を無効にしたい／script-src に unsafe-eval を入れたい」と問い合わせる必要があります。

---

## デプロイしたのに表示されない・真っ白のとき（他に考えられる原因）
</think><｜tool▁call▁begin｜>
TodoWrite

「古いローカルの public_html をアップするまではちゃんと見えていた」のに、デプロイ後に表示されない・真っ白になる場合は、次の原因が考えられます。

### 1. アップロードしたのが「古い」public_html だった

**原因:** 新しい `npm run export` で**今**作った public_html ではなく、以前の（CSP 入りの）public_html をアップロードしている。サーバーにはまだ CSP 付きの .htaccess や HTML が残っている。

**確認:** サーバー上の `public_html/.htaccess` を開く。`Header set Content-Security-Policy` の行があれば古い。`public_html/admin/onboarding/index.html` の先頭に `<meta http-equiv="Content-Security-Policy"` があれば古い。

**対策:**
- **必ず「今」作った public_html をアップロードする。** ローカルで最新コードを反映したうえで `npm run export` を実行し、**その直後にできた** public_html フォルダだけをサーバーにアップロードする。
- Cursor で編集した場合は、その変更を Mac のプロジェクトに反映してから `npm run export` し、できた public_html をアップロードする。古い public_html フォルダを選ばない。

### 2. ルート（/）に index.html が無かった

**原因:** このプロジェクトは `app/admin/` のみのため、ビルド結果の out/ に**ルート用 index.html** が無く、`https://ドメイン/` で 403 や 404 になる。古い public_html にはルート用の index やリダイレクトがあった可能性がある。

**対策:** プロジェクトに **`public/index.html`**（0秒で `/admin/` にリダイレクト）を追加済み。`npm run export` すると out/ の直下に index.html ができ、public_html にコピーされる。**再度 `npm run export` して、新しい public_html をアップロード**すればルートからも遷移できる。

### 3. ビルドを「export」でやっていない

**原因:** `next build` や `npm run build:raw` だけ実行していると、CSP 除去スクリプト（`remove-csp-from-html.js`）が動かない。`public/.htaccess` のコピーも Next のビルドで out に反映されるが、**CSP 除去は `npm run export`（＝ build-with-version.js）のなかでしか実行されない**。

**対策:** デプロイ用のビルドは **`npm run export`** で行う。`npm run export` の直後にできた public_html をアップロードする。

### 4. デプロイ後の確認（CSP が正しく効いているか）

- サーバー上の **`marche-link.jp/public_html/.htaccess`** を開き、`Header unset Content-Security-Policy` と `Header always set Content-Security-Policy ... unsafe-eval ...` の行が**ある**ことを確認する。
- **`public_html/admin/onboarding/index.html`** の先頭数行を開き、`<meta http-equiv="Content-Security-Policy"` が**無い**こと（HTML 内の CSP meta は除去されていること）を確認する。
- ブラウザで **https://あなたのサイト/admin/** を開き、開発者ツールの「ネットワーク」で該当 HTML のレスポンスヘッダーに `Content-Security-Policy` の値に `script-src ... 'unsafe-eval'` が**含まれている**ことを確認する。

### 5. コンソールに React #418/#423 や HierarchyRequestError が残る場合

Next.js の静的 export（`output: "export"`）では、ハイドレーションの不一致でコンソールにエラーが数件出ることがあります（例: React #418, #423, HierarchyRequestError, NotFoundError）。**画面が表示され操作できていれば、運用上は問題ない場合があります。** 対策として以下を実施済みです。

- **ルートレイアウト**（`app/layout.tsx`）の `<html>` と `<body>` に `suppressHydrationWarning` を付与。
- ビルド後に **DOCTYPE/html/body の付与**（`scripts/fix-html-doctype.js`）で Quirks Mode を防止。

**useSearchParams と Suspense:** 静的 export ではビルド時に URL のクエリが決まらないため、`useSearchParams()` をそのまま使うとサーバー出力とクライアントの初回描画がずれ、ハイドレーション不一致（#418/#423 等）の原因になります。**`app/admin/design/page.tsx`** では、`useSearchParams()` を使う部分を **`<Suspense>`** で囲み、フォールバックに「storeId なし」時の説明 UI を表示するようにしています。これで静的 HTML とクライアントの初回描画が揃い、不一致が起きにくくなります。

それでもエラーが残る場合は、Next.js の静的 export と React ハイドレーションの既知の挙動である可能性があります。管理画面が実用上動いていれば、エラーは無視するか、必要に応じて Next.js のアップデートや Issue を確認してください。

---

## Cursor はローカルに繋ぐ？ サーバーに繋ぐ？ 両方繋げる？

**結論:** 開発は **ローカルフォルダを Cursor で開く**のがスムーズです。サーバーは「本番の確認用」や「参照用」で追加する形がおすすめです。

### ローカルフォルダに繋ぐ（おすすめ）

- **メリット**
  - **ビルド・export がその場で完結する**（`npm run dev` / `npm run export` を Cursor のターミナルで実行できる）
  - 編集が速い（ネット遅延なし）、サーバーを触らないので安全
- **デメリット**
  - 反映するには「Mac で export → public_html をサーバーにアップロード」が必要
- **向いている人:** 普段 Mac で開発して、サーバーにはアップロードで反映したい人

### サーバーフォルダに繋ぐ（SSH など）

- **メリット**
  - サーバー上のファイルを直接編集できる
- **デメリット**
  - **サーバー上ではビルドが通らない**（メモリ・Node の制約）ので、結局「編集はサーバー、ビルドはローカル」となり、**コードを一度ローカルに持ってきて export する**必要がある
  - 編集のたびにネット越しになるので重くなりやすい
- **向いている人:** サーバー上の設定ファイルだけ触りたい、本番のログやファイルをすぐ見たい人

### 両方のフォルダを Cursor で開く（ワークスペースに2フォルダ）

**方法:** Cursor で **ファイル → フォルダをワークスペースに追加** を使い、  
1) ローカルの `marche-link.jp`、2) サーバー上の `marche-link.jp`（Remote-SSH や SFTP マウントで開いたフォルダ）の **両方** を同じワークスペースに追加する。

- **メリット**
  - 同じ画面で「ローカル」と「サーバー」を並べて見られる
  - 差分確認や、必要なファイルだけサーバー側にコピーするのがしやすい
- **注意**
  - **編集・ビルド・export はローカル側のフォルダで行う**ようにすると混乱が少ないです（サーバー側は「参照・確認用」）
  - どちらのフォルダを編集したか間違えないようにする（片方だけ更新されてしまうのを防ぐ）

**まとめ:**  
- **開発をスムーズにしたい** → Cursor は **ローカル**の marche-link.jp に繋ぐ。  
- **サーバーの状態も見たい** → 同じワークスペースに **サーバー側のフォルダを追加**して、参照用にする。  
- **編集とビルドはローカルで行い、反映は「export → アップロード」** にすると、このプロジェクトでは一番シンプルです。

### 今はサーバーに繋いでいる場合の移行手順

**はい。いったん対象ファイルをローカル（Mac）にコピーし終えたら、Cursor の繋ぎ先をローカルに移すのがベストです。**

1. **Mac にフォルダを用意する**  
   Mac の適当な場所に `marche-link.jp` フォルダを作る（まだなければ）。
2. **Cursor 側から Mac にコピーする**  
   「Mac に手動で反映するときの対象」の表どおり、**app/, components/, lib/, public/, scripts/** と **package.json, build-version.txt, next.config.mjs, tsconfig.json, deploy-static.sh** を、Cursor で開いている方から Mac の同じパスに上書きする。
3. **Mac で依存関係を入れる**  
   Mac のターミナルで `cd marche-link.jp` → `npm install` を実行する。
4. **Cursor の繋ぎ先をローカルに変える**  
   Cursor で **ファイル → フォルダを開く**（または 開いているワークスペースを閉じる）で、**Mac の marche-link.jp フォルダ**を選んで開く。
5. **以降はローカルで開発**  
   編集・`npm run dev`・`npm run export` はすべて Cursor（＝Mac のフォルダ）で行い、反映するときだけ「public_html をサーバーにアップロード → サーバーで deploy-static.sh」にする。

こうすると、**常にローカルが正**になり、ビルドと export がその場で完結するので、開発が一番スムーズです。
