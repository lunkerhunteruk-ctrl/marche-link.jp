import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "マルシェリンク",
  description: "マルシェリンク",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ja" suppressHydrationWarning>
      <body suppressHydrationWarning>{children}</body>
    </html>
  );
}
