<?php
/**
 * OGP用画像アップロード（LINE・SNSの共有プレビュー用）
 * POST: image (file), subdomain (string)
 * 推奨サイズ 1200×630px。アップロードした画像を中央クロップで 1200×630 にリサイズし、
 * shops/{subdomain}/ogp.jpg に保存する。未設定の場合はストアアイコンや商品画像が使われる。
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

if (!isset($_FILES['image']) || $_FILES['image']['error'] !== UPLOAD_ERR_OK) {
  http_response_code(400);
  echo json_encode(['success' => false, 'message' => '画像ファイルを選択してください']);
  exit;
}

$tmpPath = $_FILES['image']['tmp_name'];
$finfo = finfo_open(FILEINFO_MIME_TYPE);
$mime = finfo_file($finfo, $tmpPath);
finfo_close($finfo);
$allowed = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
if (!in_array($mime, $allowed, true)) {
  http_response_code(400);
  echo json_encode(['success' => false, 'message' => '画像形式が不正です（JPEG/PNG/GIF/WebP）']);
  exit;
}

$baseDir = __DIR__ . '/shops/' . $subdomain;
if (!is_dir($baseDir)) {
  if (!@mkdir($baseDir, 0755, true)) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => '保存フォルダの作成に失敗しました']);
    exit;
  }
}

$destPath = $baseDir . '/ogp.jpg';
$targetW = 1200;
$targetH = 630;

if (!extension_loaded('gd')) {
  if (!move_uploaded_file($tmpPath, $destPath)) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'ファイルの保存に失敗しました']);
    exit;
  }
  $url = '/shops/' . $subdomain . '/ogp.jpg';
  echo json_encode(['success' => true, 'url' => $url]);
  exit;
}

$src = null;
switch ($mime) {
  case 'image/jpeg':
    $src = imagecreatefromjpeg($tmpPath);
    break;
  case 'image/png':
    $src = imagecreatefrompng($tmpPath);
    break;
  case 'image/gif':
    $src = imagecreatefromgif($tmpPath);
    break;
  case 'image/webp':
    $src = imagecreatefromwebp($tmpPath);
    break;
}
if (!$src) {
  http_response_code(400);
  echo json_encode(['success' => false, 'message' => '画像の読み込みに失敗しました']);
  exit;
}

$srcW = imagesx($src);
$srcH = imagesy($src);
$targetAspect = $targetW / $targetH;
$srcAspect = $srcW / $srcH;

if ($srcAspect >= $targetAspect) {
  $scale = $targetH / $srcH;
  $cropW = (int) round($targetW / $scale);
  $cropH = $srcH;
  $srcX = (int) round(($srcW - $cropW) / 2);
  $srcY = 0;
} else {
  $scale = $targetW / $srcW;
  $cropW = $srcW;
  $cropH = (int) round($targetH / $scale);
  $srcX = 0;
  $srcY = (int) round(($srcH - $cropH) / 2);
}

$dst = imagecreatetruecolor($targetW, $targetH);
if (!$dst) {
  imagedestroy($src);
  http_response_code(500);
  echo json_encode(['success' => false, 'message' => '画像の生成に失敗しました']);
  exit;
}

imagecopyresampled($dst, $src, 0, 0, $srcX, $srcY, $targetW, $targetH, $cropW, $cropH);
imagedestroy($src);

if (!imagejpeg($dst, $destPath, 90)) {
  imagedestroy($dst);
  http_response_code(500);
  echo json_encode(['success' => false, 'message' => 'ファイルの保存に失敗しました']);
  exit;
}
imagedestroy($dst);

$url = '/shops/' . $subdomain . '/ogp.jpg';
echo json_encode(['success' => true, 'url' => $url]);
