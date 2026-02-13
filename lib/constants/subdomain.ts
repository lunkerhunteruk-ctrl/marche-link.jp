const RESERVED = new Set(
  [
    "admin",
    "www",
    "api",
    "app",
    "mail",
    "ftp",
    "staging",
    "dev",
    "test",
    "localhost",
    "null",
    "undefined",
  ].map((s) => s.toLowerCase())
);

const VALID_PATTERN = /^[a-z0-9]([a-z0-9-]*[a-z0-9])?$/;

/**
 * サブドメインが許可されているか（予約語でなく、2〜32文字の英小文字・数字・ハイフン）
 */
export function isAllowedSubdomain(value: string): boolean {
  const trimmed = value.trim().toLowerCase();
  if (!trimmed) return false;
  if (RESERVED.has(trimmed)) return false;
  if (trimmed.length < 2 || trimmed.length > 32) return false;
  return VALID_PATTERN.test(trimmed);
}
