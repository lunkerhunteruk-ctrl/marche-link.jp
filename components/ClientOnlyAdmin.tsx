"use client";

import { useEffect, useState } from "react";

/**
 * 管理画面用: マウント後にだけ children を描画する。
 * 静的 export でハイドレーション不一致（#418/#423, HierarchyRequestError）が起きるため、
 * 初回 HTML とクライアント初回描画を「読み込み中」で揃え、本編はクライアントのみで描画する。
 */
export function ClientOnlyAdmin({
  children,
}: {
  children: React.ReactNode;
}) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <main className="max-w-2xl mx-auto p-6">
        <p className="text-gray-500">読み込み中...</p>
      </main>
    );
  }

  return <>{children}</>;
}
