<?php
/**
 * 商品写真アップロード（ショップごとのフォルダに保存）
 * POST: image (file), subdomain (string)
 * クライアント側で 1000x1000 にリサイズ済みの画像を受け取り、shops/{subdomain}/products/ に保存する。
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

$baseDir = __DIR__ . '/shops/' . $subdomain . '/products';
if (!is_dir($baseDir)) {
  if (!@mkdir($baseDir, 0755, true)) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => '保存フォルダの作成に失敗しました']);
    exit;
  }
}

$ext = $mime === 'image/png' ? 'png' : ($mime === 'image/gif' ? 'gif' : ($mime === 'image/webp' ? 'webp' : 'jpg'));
$filename = date('Ymd-His') . '-' . substr(uniqid(), -6) . '.' . $ext;
$destPath = $baseDir . '/' . $filename;

if (!move_uploaded_file($tmpPath, $destPath)) {
  http_response_code(500);
  echo json_encode(['success' => false, 'message' => 'ファイルの保存に失敗しました']);
  exit;
}

$url = '/shops/' . $subdomain . '/products/' . $filename;
echo json_encode(['success' => true, 'url' => $url]);
