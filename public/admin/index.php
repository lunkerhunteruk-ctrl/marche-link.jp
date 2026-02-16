<?php
/**
 * 管理画面直行 LIFF（/admin/）のエンドポイント。
 * 顧客ショップ内「マイストア管理画面」等で使う LIFF（liff.line.me/2009034946-LkF5LngF）の Endpoint。
 * 共有・オンボーディング用は admin-entry/ を参照。
 *
 * OGP: ベースの LIFF URL（https://liff.line.me/2009034946-LkF5LngF）のプレビューを
 * 「ストア管理画面 | マルシェリンク」にするには、LINE Developers でこの LIFF の
 * Endpoint URL を https://marche-link.jp/admin/ に設定すること。
 * admin-entry/ のままにするとベース URL で「30秒で開店」の OGP が出る。
 */
header('Content-Type: text/html; charset=UTF-8');
header('Cache-Control: no-cache, max-age=0, must-revalidate');

$htmlPath = __DIR__ . '/index.html';
if (!is_file($htmlPath)) {
    http_response_code(404);
    echo '<!DOCTYPE html><html><head><meta charset="UTF-8"><title>404</title></head><body><p>Not Found</p></body></html>';
    return;
}

$html = file_get_contents($htmlPath);
$baseUrl = 'https://marche-link.jp';
$ogImage = $baseUrl . '/admin-ogp.png';
$ogTitle = 'ストア管理画面 | マルシェリンク';
$ogDescription = '注文・商品・QRコードを、いつものLINEでまとめて管理。';
$ogUrl = $baseUrl . '/admin/';

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
    $html = preg_replace('/<meta\s+property="og:url"\s+content="[^"]*"\s*\/?>/iu', '<meta property="og:url" content="' . htmlspecialchars($ogUrl, ENT_QUOTES, 'UTF-8') . '"/>', $html, 1);
    $html = preg_replace('/<meta\s+property="og:title"\s+content="[^"]*"\s*\/?>/iu', '<meta property="og:title" content="' . htmlspecialchars($ogTitle, ENT_QUOTES, 'UTF-8') . '"/>', $html, 1);
    $html = preg_replace('/<meta\s+property="og:description"\s+content="[^"]*"\s*\/?>/iu', '<meta property="og:description" content="' . htmlspecialchars($ogDescription, ENT_QUOTES, 'UTF-8') . '"/>', $html, 1);
    $html = preg_replace('/<meta\s+property="og:image"\s+content="[^"]*"\s*\/?>/iu', '<meta property="og:image" content="' . htmlspecialchars($ogImage, ENT_QUOTES, 'UTF-8') . '"/>', $html, 1);
    if (stripos($html, 'name="twitter:image"') !== false) {
        $html = preg_replace('/<meta\s+name="twitter:title"\s+content="[^"]*"\s*\/?>/iu', '<meta name="twitter:title" content="' . htmlspecialchars($ogTitle, ENT_QUOTES, 'UTF-8') . '"/>', $html, 1);
        $html = preg_replace('/<meta\s+name="twitter:description"\s+content="[^"]*"\s*\/?>/iu', '<meta name="twitter:description" content="' . htmlspecialchars($ogDescription, ENT_QUOTES, 'UTF-8') . '"/>', $html, 1);
        $html = preg_replace('/<meta\s+name="twitter:image"\s+content="[^"]*"\s*\/?>/iu', '<meta name="twitter:image" content="' . htmlspecialchars($ogImage, ENT_QUOTES, 'UTF-8') . '"/>', $html, 1);
    }
} else {
    $html = preg_replace('/<\/head>/i', $ogMeta . '</head>', $html, 1);
}

echo $html;
