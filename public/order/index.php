<?php
/**
 * 顧客用ストア LIFF（/order/?shop=xxx）の OGP をストア名・アイコンで動的出力する。
 * Xserver 等で静的 HTML のまま運用する場合、?shop= 付きのときだけこの PHP が動く。
 *
 * - クローラ（OGP 取得）→ 動的 OGP 付き HTML を返す（ストア名・アイコン・説明を差し替え）。
 * - 通常のブラウザ → LIFF URL へ 302 リダイレクト（LINE 内で開くとアプリ内ブラウザで注文できる）。
 *
 * これで「https://marche-link.jp/order/?shop=xxx」1本で、共有プレビューは動的 OGP、タップ時は LINE 内で開ける。
 *
 * 設定: .user.ini で FIREBASE_PROJECT_ID=marche-link, LIFF_ID_CUSTOMER=2009034946-KaRhKY16 を指定するか、下の FALLBACK を変更。
 */
$storeId = isset($_GET['shop']) ? trim((string) $_GET['shop']) : '';
header('Content-Type: text/html; charset=UTF-8');
if ($storeId === '') {
    // shop なしの場合は静的 index.html をそのまま出力（Apache が index.html を出さないようここで読む）
    $path = __DIR__ . '/index.html';
    if (is_file($path)) {
        readfile($path);
    } else {
        http_response_code(404);
        echo '<!DOCTYPE html><html><head><meta charset="UTF-8"><title>404</title></head><body><p>Not Found</p></body></html>';
    }
    return;
}

$storeId = strtolower($storeId);

// OGP 用クローラ以外は LIFF URL へリダイレクト。ループ防止は「Referer が liff」または「直前に付与した Cookie」で判定する。
// LINE のリンクプレビューは Linespider という UA で取得するため、Line-Preview / Linespider をクローラとみなす。
// LINE の WebView では Referer が付かないことがあるため、302 時に短命 Cookie を付与し、次のリクエストで「2回目」と判断する。
$ua = isset($_SERVER['HTTP_USER_AGENT']) ? (string) $_SERVER['HTTP_USER_AGENT'] : '';
$referer = isset($_SERVER['HTTP_REFERER']) ? (string) $_SERVER['HTTP_REFERER'] : '';
$isCrawler = preg_match('/facebookexternalhit|Facebot|Line-Preview|Line\s|Linespider|Twitterbot|WhatsApp|Slackbot|Discordbot|TelegramBot|Pinterest|Googlebot|bingbot|YandexBot/i', $ua);
$isFromLiff = (strpos($referer, 'https://liff.line.me/') === 0);
$cookieName = 'ml_liff';
$hasLiffCookie = !empty($_COOKIE[$cookieName]);

if ($hasLiffCookie) {
    setcookie($cookieName, '', ['expires' => time() - 3600, 'path' => '/order/', 'secure' => true, 'httponly' => true, 'samesite' => 'Lax']);
}
if (!$isCrawler && !$isFromLiff && !$hasLiffCookie) {
    setcookie($cookieName, '1', ['expires' => time() + 90, 'path' => '/order/', 'secure' => true, 'httponly' => true, 'samesite' => 'Lax']);
    $liffId = getenv('LIFF_ID_CUSTOMER') ?: getenv('NEXT_PUBLIC_LIFF_ID_CUSTOMER') ?: '2009034946-KaRhKY16';
    $liffUrl = 'https://liff.line.me/' . trim($liffId) . '?shop=' . rawurlencode($storeId);
    header('Location: ' . $liffUrl, true, 302);
    exit;
}

$projectId = getenv('FIREBASE_PROJECT_ID') ?: getenv('NEXT_PUBLIC_FIREBASE_PROJECT_ID') ?: 'marche-link';
$apiUrl = 'https://asia-northeast1-' . $projectId . '.cloudfunctions.net/getStorePublic?storeId=' . rawurlencode($storeId);

$storeName = $storeId;
$iconUrl = null;
$ogImageFromApi = null;
$firstProductImageUrl = null;
$ctx = stream_context_create([
    'http' => [
        'timeout' => 5,
        'ignore_errors' => true,
    ],
]);
$json = @file_get_contents($apiUrl, false, $ctx);
if ($json !== false) {
    $data = @json_decode($json, true);
    if (is_array($data)) {
        if (!empty($data['name']) && is_string($data['name'])) {
            $storeName = trim($data['name']);
        }
        if (!empty($data['iconUrl']) && is_string($data['iconUrl'])) {
            $iconUrl = trim($data['iconUrl']);
        }
        if (!empty($data['firstProductImageUrl']) && is_string($data['firstProductImageUrl'])) {
            $firstProductImageUrl = trim($data['firstProductImageUrl']);
        }
        // OGP用画像（推奨1200x630）を設定していれば最優先。未設定なら iconUrl → 先頭商品画像
        if (!empty($data['ogpImageUrl']) && is_string($data['ogpImageUrl'])) {
            $ogImageFromApi = trim($data['ogpImageUrl']);
        }
    }
}

$htmlPath = __DIR__ . '/index.html';
if (!is_file($htmlPath)) {
    http_response_code(404);
    echo '<!DOCTYPE html><html><head><meta charset="UTF-8"><title>404</title></head><body><p>Not Found</p></body></html>';
    return;
}

$html = file_get_contents($htmlPath);
$titleDynamic = $storeName . 'のメニュー｜LINEで楽々注文・マルシェリンク';
$titleSafe = htmlspecialchars($titleDynamic, ENT_QUOTES, 'UTF-8');
$desc = '会員登録やアプリDLは不要。いつものLINEで、サクッと商品を見て注文できます。';
// ユーザーが OGP 画像を設定している場合はその URL。未設定のときはプロキシで幅1200・上下クロップした画像を返す（左右の隙間を防ぐ）
$baseUrlOg = 'https://marche-link.jp';
if (isset($ogImageFromApi) && $ogImageFromApi !== '') {
    $ogImage = (strpos($ogImageFromApi, 'http') !== 0) ? rtrim($baseUrlOg, '/') . '/' . ltrim($ogImageFromApi, '/') : $ogImageFromApi;
} else {
    $ogImage = $baseUrlOg . '/order/ogp-image.php?shop=' . rawurlencode($storeId);
}
$ogUrl = 'https://marche-link.jp/order/?shop=' . rawurlencode($storeId);
$ogImageEsc = htmlspecialchars($ogImage, ENT_QUOTES, 'UTF-8');
$ogUrlEsc = htmlspecialchars($ogUrl, ENT_QUOTES, 'UTF-8');
$storeNameEsc = htmlspecialchars($storeName, ENT_QUOTES, 'UTF-8');

// <title>ストアページ</title> → 動的タイトル（完全一致でない場合も置換できるよう緩く）
$html = preg_replace('/<title>\s*ストアページ\s*<\/title>/iu', '<title>' . $titleSafe . '</title>', $html, 1);

// og:title "ストアページ" または content='ストアページ' → 動的（属性順・引用符両対応）
$html = preg_replace('/<meta\s+property="og:title"\s+content="ストアページ"\s*\/?>/iu', '<meta property="og:title" content="' . $titleSafe . '"/>', $html, 1);
$html = preg_replace("/<meta\s+property=\"og:title\"\s+content='ストアページ'\s*\/?>/iu", '<meta property="og:title" content="' . $titleSafe . '"/>', $html, 1);

// og:url を shop 付きに（content="..." または content='...'）
$html = preg_replace('/<meta\s+property="og:url"\s+content="[^"]*"\s*\/?>/iu', '<meta property="og:url" content="' . $ogUrlEsc . '"/>', $html, 1);

// og:image をストア設定 OGP / プロキシ（幅1200・上下クロップ） / デフォルトに。プロキシは常に 1200x630 を返す
$html = preg_replace('/<meta\s+property="og:image"\s+content="[^"]*"\s*\/?>/iu', '<meta property="og:image" content="' . $ogImageEsc . '"/>' . "\n" . '<meta property="og:image:width" content="1200"/>' . "\n" . '<meta property="og:image:height" content="630"/>', $html, 1);

// og:description を差し替え（ストア名入りにするとより分かりやすい）
$descDynamic = $storeName . 'のメニューを見て注文。' . $desc;
$descEsc = htmlspecialchars($descDynamic, ENT_QUOTES, 'UTF-8');
$html = preg_replace('/<meta\s+property="og:description"\s+content="[^"]*"\s*\/?>/iu', '<meta property="og:description" content="' . $descEsc . '"/>', $html, 1);

// twitter:title
$html = preg_replace('/<meta\s+name="twitter:title"\s+content="ストアページ"\s*\/?>/iu', '<meta name="twitter:title" content="' . $titleSafe . '"/>', $html, 1);

// twitter:image
$html = preg_replace('/<meta\s+name="twitter:image"\s+content="[^"]*"\s*\/?>/iu', '<meta name="twitter:image" content="' . $ogImageEsc . '"/>', $html, 1);

// twitter:description
$html = preg_replace('/<meta\s+name="twitter:description"\s+content="[^"]*"\s*\/?>/iu', '<meta name="twitter:description" content="' . $descEsc . '"/>', $html, 1);

// og:image:alt をストア名に
$html = preg_replace('/<meta\s+property="og:image:alt"\s+content="マルシェリンク"\s*\/?>/iu', '<meta property="og:image:alt" content="' . $storeNameEsc . '"/>', $html, 1);

// LINE・SNS のプレビューがすぐ更新されるようキャッシュを抑制（admin / admin-entry と同様）
header('Cache-Control: no-cache, max-age=0, must-revalidate');

echo $html;
