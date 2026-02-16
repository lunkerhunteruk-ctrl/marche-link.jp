<?php
/**
 * メンテナンスモード用ページ。
 * ドキュメントルートに maintenance.flag が存在する間、.htaccess により全アクセスがここに振られる。
 * 解除: maintenance.flag を削除してから次回リクエストで通常表示に戻る。
 */
$retryAfter = 3600; // 1時間後を目安に再アクセスを促す（秒）
http_response_code(503);
header('Content-Type: text/html; charset=UTF-8');
header('Retry-After: ' . $retryAfter);
header('Cache-Control: no-store, no-cache, must-revalidate');
?>
<!DOCTYPE html>
<html lang="ja">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>メンテナンス中 | マルシェリンク</title>
  <style>
    * { box-sizing: border-box; }
    body { margin: 0; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Hiragino Sans", sans-serif; background: #f5f5f5; min-height: 100vh; display: flex; align-items: center; justify-content: center; padding: 24px; }
    .box { max-width: 400px; width: 100%; background: #fff; border-radius: 16px; padding: 32px; text-align: center; box-shadow: 0 2px 12px rgba(0,0,0,0.08); }
    h1 { font-size: 1.25rem; color: #111; margin: 0 0 16px; font-weight: 600; }
    p { font-size: 0.9375rem; color: #555; line-height: 1.6; margin: 0; }
    .note { margin-top: 24px; font-size: 0.8125rem; color: #888; }
  </style>
</head>
<body>
  <div class="box">
    <h1>只今メンテナンス中です</h1>
    <p>ご利用の皆様にはご不便をおかけして申し訳ございません。<br>まもなく復旧いたしますので、しばらくお待ちください。</p>
    <p class="note">マルシェリンク</p>
  </div>
</body>
</html>
