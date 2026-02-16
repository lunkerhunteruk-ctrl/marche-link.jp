<?php
/**
 * ショップアイコン（丸）アップロード
 * POST: image (file), subdomain (string)
 * 300x300 にリサイズして shops/{subdomain}/icon.jpg に保存する。
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

$destPath = $baseDir . '/icon.jpg';
$size = 300;

if (!extension_loaded('gd')) {
  if (!move_uploaded_file($tmpPath, $destPath)) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'ファイルの保存に失敗しました']);
    exit;
  }
  $url = '/shops/' . $subdomain . '/icon.jpg';
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

$dst = imagecreatetruecolor($size, $size);
if (!$dst) {
  imagedestroy($src);
  http_response_code(500);
  echo json_encode(['success' => false, 'message' => '画像の生成に失敗しました']);
  exit;
}

$w = imagesx($src);
$h = imagesy($src);
imagecopyresampled($dst, $src, 0, 0, 0, 0, $size, $size, $w, $h);
imagedestroy($src);

if (!imagejpeg($dst, $destPath, 90)) {
  imagedestroy($dst);
  http_response_code(500);
  echo json_encode(['success' => false, 'message' => 'ファイルの保存に失敗しました']);
  exit;
}
imagedestroy($dst);

$url = '/shops/' . $subdomain . '/icon.jpg';
echo json_encode(['success' => true, 'url' => $url]);
