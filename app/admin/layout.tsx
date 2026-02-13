import type { Metadata } from "next";
import { ClientOnlyAdmin } from "@/components/ClientOnlyAdmin";

export const metadata: Metadata = {
  title: "マルシェリンク 管理画面",
  description: "ショップ管理",
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 px-4 py-3">
        <div className="flex items-center justify-between">
          <h1 className="text-lg font-semibold">マルシェリンク 管理画面</h1>
          <div className="flex items-center gap-4">
            {process.env.NEXT_PUBLIC_BUILD_VERSION && (
              <span className="text-xs text-gray-500 font-mono" title="out/version.txt と同じ値。デプロイが書き変わったか確認用">
                ビルド: {process.env.NEXT_PUBLIC_BUILD_VERSION}
              </span>
            )}
            <nav className="flex gap-4 text-sm">
            <a href="/admin" className="text-gray-600 hover:text-gray-900">
              トップ
            </a>
            <a href="/admin/products/quick" className="text-gray-600 hover:text-gray-900">
              商品登録
            </a>
            <a href="/admin/design" className="text-gray-600 hover:text-gray-900">
              デザイン
            </a>
            <a href="/admin/qrcode" className="text-gray-600 hover:text-gray-900">
              QRコード
            </a>
          </nav>
          </div>
        </div>
      </header>
      <ClientOnlyAdmin>{children}</ClientOnlyAdmin>
    </div>
  );
}
