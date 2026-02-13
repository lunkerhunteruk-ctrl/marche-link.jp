<?php
/**
 * 顧客向け OGP 画像プロキシ。ストアの OGP/アイコン/先頭商品画像を 1200x630 に「横の幅に合わせて上下をクロップ」して返す。
 * 呼び出し: GET ?shop=xxx
 * - ogpImageUrl が設定されていればその URL へ 302 リダイレクト（そのまま利用）。
 * - 未設定のときは firstProductImageUrl（商品画像）を優先し、なければ iconUrl を使い、幅 1200 に合わせて上下をクロップして出力。
 */
header('Cache-Control: public, max-age=3600'); // 1時間キャッシュ

$storeId = isset($_GET['shop']) ? trim((string) $_GET['shop']) : '';
$storeId = $storeId !== '' ? strtolower($storeId) : '';
if ($storeId === '' || strlen($storeId) > 64) {
    http_response_code(400);
    exit;
}

$projectId = getenv('FIREBASE_PROJECT_ID') ?: getenv('NEXT_PUBLIC_FIREBASE_PROJECT_ID') ?: 'marche-link';
$apiUrl = 'https://asia-northeast1-' . $projectId . '.cloudfunctions.net/getStorePublic?storeId=' . rawurlencode($storeId);
$ctx = stream_context_create([
    'http' => [
        'timeout' => 5,
        'ignore_errors' => true,
    ],
]);
$json = @file_get_contents($apiUrl, false, $ctx);
$imageUrl = null;
$useRedirect = false;
if ($json !== false) {
    $data = @json_decode($json, true);
    if (is_array($data)) {
        if (!empty($data['ogpImageUrl']) && is_string($data['ogpImageUrl'])) {
            $imageUrl = trim($data['ogpImageUrl']);
            $useRedirect = true; // ユーザー設定 OGP はそのままリダイレクト
        }
        if ($imageUrl === null && !empty($data['firstProductImageUrl']) && is_string($data['firstProductImageUrl'])) {
            $imageUrl = trim($data['firstProductImageUrl']);
        }
        if ($imageUrl === null && !empty($data['iconUrl']) && is_string($data['iconUrl'])) {
            $imageUrl = trim($data['iconUrl']);
        }
    }
}

if ($imageUrl === null || $imageUrl === '') {
    header('Location: https://marche-link.jp/ogp.png', true, 302);
    exit;
}

if ($useRedirect) {
    header('Location: ' . $imageUrl, true, 302);
    exit;
}

// 画像を取得して幅に合わせて上下クロップで 1200x630 を出力
$imgData = @file_get_contents($imageUrl, false, $ctx);
if ($imgData === false || $imgData === '') {
    header('Location: https://marche-link.jp/ogp.png', true, 302);
    exit;
}

$src = @imagecreatefromstring($imgData);
if (!$src) {
    header('Location: https://marche-link.jp/ogp.png', true, 302);
    exit;
}

$targetW = 1200;
$targetH = 630;
$srcW = imagesx($src);
$srcH = imagesy($src);
if ($srcW < 1 || $srcH < 1) {
    imagedestroy($src);
    header('Location: https://marche-link.jp/ogp.png', true, 302);
    exit;
}

// 横の幅に合わせて、上下をクロップする方式（極端に横長のときは高さに合わせて左右クロップ）
$scale = $targetW / $srcW;
$cropH = (int) round($targetH / $scale);
$srcX = 0;
$srcY = 0;
$cropW = $srcW;
if ($cropH > $srcH) {
    $cropH = $srcH;
    $scale = $targetH / $srcH;
    $cropW = (int) round($targetW / $scale);
    $cropW = min($cropW, $srcW);
    $srcX = (int) round(($srcW - $cropW) / 2);
    $srcX = max(0, $srcX);
} else {
    $srcY = (int) round(($srcH - $cropH) / 2);
    $srcY = max(0, $srcY);
}

$dst = imagecreatetruecolor($targetW, $targetH);
if (!$dst) {
    imagedestroy($src);
    header('Location: https://marche-link.jp/ogp.png', true, 302);
    exit;
}

imagecopyresampled($dst, $src, 0, 0, $srcX, $srcY, $targetW, $targetH, $cropW, $cropH);
imagedestroy($src);

header('Content-Type: image/jpeg');
imagejpeg($dst, null, 90);
imagedestroy($dst);
