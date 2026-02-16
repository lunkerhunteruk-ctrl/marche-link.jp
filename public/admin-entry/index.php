<?php
/**
 * 管理画面エントリ（/admin-entry/）。オンボーディング・共有用。
 *
 * 【使い分け】管理画面用 LIFF は 2 本：
 * - この LIFF（Endpoint: admin-entry/）… 共有・新規向け。開くと LP → 新規は登録、既存は /admin/ へ転送。
 * - admin 直行 LIFF（Endpoint: admin/）… 顧客ショップ内「マイストア管理画面」等。1 回で /admin/ を表示。
 *
 * - クローラ（Line-Preview 等）→ OGP 付き HTML を返す。
 * - クエリ付き（?liff_id= 等）→ 302 せず HTML を返す（LINE が Endpoint を開く 2 回目。302 するとループで白画面になる）。
 * - 上記以外 → この LIFF の liff.line.me URL へ 302。
 */
header('Content-Type: text/html; charset=UTF-8');
header('Cache-Control: no-cache, max-age=0, must-revalidate');

$ua = isset($_SERVER['HTTP_USER_AGENT']) ? (string) $_SERVER['HTTP_USER_AGENT'] : '';
$isCrawler = preg_match('/facebookexternalhit|Facebot|Line-Preview|Line\s|Linespider|Twitterbot|WhatsApp|Slackbot|Discordbot|TelegramBot|Pinterest|Googlebot|bingbot|YandexBot/i', $ua);

// LINE が Endpoint URL を読みに来たときはクエリ付き（?liff_id= 等）でアクセスする。
// このときに 302 するとリダイレクトループで白画面になるため、クエリがある場合はリダイレクトしない。
$hasQuery = !empty($_GET);
$skipRedirect = $isCrawler || $hasQuery;

if (!$skipRedirect) {
    $liffId = getenv('LIFF_ID_ADMIN') ?: getenv('NEXT_PUBLIC_LIFF_ID_ADMIN') ?: '2009034946-GQ1UQIRr';
    header('Location: https://liff.line.me/' . trim($liffId) . '/', true, 302);
    exit;
}

$htmlPath = __DIR__ . '/index.html';
if (!is_file($htmlPath)) {
    http_response_code(404);
    echo '<!DOCTYPE html><html><head><meta charset="UTF-8"><title>404</title></head><body><p>Not Found</p></body></html>';
    return;
}

$html = file_get_contents($htmlPath);
$baseUrl = 'https://marche-link.jp';
$ogImage = $baseUrl . '/ogp.png';
$ogTitle = 'マルシェリンク | 30秒で開店';
$ogDescription = '写真を撮って並べるだけ。LINEのまま、かんたんに開店。';
$ogUrl = $baseUrl . '/admin-entry/';

$ogMeta = '';
$ogMeta .= '<meta property="og:type" content="website"/>';
$ogMeta .= '<meta property="og:url" content="' . htmlspecialchars($ogUrl, ENT_QUOTES, 'UTF-8') . '"/>';
$ogMeta .= '<meta property="og:title" content="' . htmlspecialchars($ogTitle, ENT_QUOTES, 'UTF-8') . '"/>';
$ogMeta .= '<meta property="og:description" content="' . htmlspecialchars($ogDescription, ENT_QUOTES, 'UTF-8') . '"/>';
$ogMeta .= '<meta property="og:image" content="' . htmlspecialchars($ogImage, ENT_QUOTES, 'UTF-8') . '"/>';
$ogMeta .= '<meta property="og:image:width" content="1200"/>';
$ogMeta .= '<meta property="og:image:height" content="630"/>';
$ogMeta .= '<meta property="og:image:alt" content="マルシェリンク"/>';
$ogMeta .= '<meta name="twitter:card" content="summary_large_image"/>';
$ogMeta .= '<meta name="twitter:title" content="' . htmlspecialchars($ogTitle, ENT_QUOTES, 'UTF-8') . '"/>';
$ogMeta .= '<meta name="twitter:description" content="' . htmlspecialchars($ogDescription, ENT_QUOTES, 'UTF-8') . '"/>';
$ogMeta .= '<meta name="twitter:image" content="' . htmlspecialchars($ogImage, ENT_QUOTES, 'UTF-8') . '"/>';

if (stripos($html, 'property="og:image"') !== false) {
    $html = preg_replace('/<meta\s+property="og:image"\s+content="[^"]*"\s*\/?>/iu', '<meta property="og:image" content="' . htmlspecialchars($ogImage, ENT_QUOTES, 'UTF-8') . '"/>', $html, 1);
    if (stripos($html, 'name="twitter:image"') !== false) {
        $html = preg_replace('/<meta\s+name="twitter:image"\s+content="[^"]*"\s*\/?>/iu', '<meta name="twitter:image" content="' . htmlspecialchars($ogImage, ENT_QUOTES, 'UTF-8') . '"/>', $html, 1);
    }
} else {
    $html = preg_replace('/<\/head>/i', $ogMeta . '</head>', $html, 1);
}

echo $html;
