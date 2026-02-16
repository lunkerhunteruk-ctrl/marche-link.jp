<?php
/**
 * 商品写真の削除（サーバー上のファイルを削除）
 * POST: subdomain (string), urls (JSON array of paths like /shops/{subdomain}/products/{filename})
 * 指定されたパスが当該ショップの products 配下であることを検証してから削除する。
 */
header('Content-Type: application/json; charset=utf-8');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
  http_response_code(405);
  echo json_encode(['success' => false, 'message' => 'POST only']);
  exit;
}

$subdomain = isset($_POST['subdomain']) ? trim((string) $_POST['subdomain']) : '';
$subdomain = preg_replace('/[^a-z0-9\-]/', '', strtolower($subdomain));

if ($subdomain === '' || strlen($subdomain) > 64) {
  http_response_code(400);
  echo json_encode(['success' => false, 'message' => '有効なショップID（サブドメイン）を入力してください']);
  exit;
}

$urlsRaw = isset($_POST['urls']) ? $_POST['urls'] : null;
if (is_string($urlsRaw)) {
  $decoded = json_decode($urlsRaw, true);
  $urls = is_array($decoded) ? $decoded : [];
} elseif (is_array($urlsRaw)) {
  $urls = $urlsRaw;
} else {
  $urls = [];
}

$baseDir = __DIR__ . '/shops/' . $subdomain . '/products';
$prefix = '/shops/' . $subdomain . '/products/';
$deleted = 0;
$errors = [];

if (is_dir($baseDir)) {
  $realBase = realpath($baseDir);
  foreach ($urls as $url) {
    if (!is_string($url) || $url === '') continue;
    $path = $url;
    if (strpos($url, 'http') === 0) {
      $parsed = parse_url($url);
      $path = isset($parsed['path']) ? $parsed['path'] : '';
    }
    $path = '/' . ltrim($path, '/');
    if (strpos($path, $prefix) !== 0) continue;
    $suffix = substr($path, strlen($prefix));
    if ($suffix === '' || strpos($suffix, '/') !== false || strpos($suffix, '..') !== false) continue;
    if (!preg_match('/^[a-zA-Z0-9._-]+$/', $suffix)) continue;
    $filePath = $baseDir . '/' . $suffix;
    if (!is_file($filePath)) continue;
    $realFile = realpath($filePath);
    if ($realFile === false || $realBase === false || strpos($realFile, $realBase) !== 0) continue;
    if (@unlink($filePath)) {
      $deleted++;
    } else {
      $errors[] = $path;
    }
  }
}

echo json_encode(['success' => true, 'deleted' => $deleted, 'errors' => $errors]);
