"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { useState } from "react";
import { DEFAULT_INSTALLED_PRESETS } from "@/lib/services/design-presets";
import { updateStoreActivePreset } from "@/lib/services/update-store-preset";
import type { DesignPreset } from "@/lib/types/onboarding";

function getThemeColors(preset: DesignPreset) {
  const t = preset.theme;
  return {
    button: t.buttonColor ?? t.primaryColor ?? "#4a7c59",
    header: t.headerColor ?? t.primaryColor ?? "#3d6b4d",
    background: t.backgroundColor ?? "#faf8f5",
    text: t.textColor ?? "#1f2937",
  };
}

/** プリセット適用時の見た目をシミュレーション表示（ヘッダー・背景・ボタン・文字色） */
function PresetSimulation({ preset }: { preset: DesignPreset }) {
  const c = getThemeColors(preset);
  return (
    <div className="rounded-lg border-2 border-gray-300 overflow-hidden shadow-md bg-white">
      <p className="text-xs text-gray-500 px-2 py-1 bg-gray-100 border-b border-gray-200">
        プレビュー: {preset.name}
      </p>
      <div
        className="p-3 space-y-3"
        style={{
          backgroundColor: c.background,
          color: c.text,
          fontFamily: preset.theme.fontFamily ?? "sans-serif",
        }}
      >
        <div
          className="h-8 rounded flex items-center px-2 text-white text-xs font-medium"
          style={{ backgroundColor: c.header }}
        >
          ショップ名
        </div>
        <p className="text-sm" style={{ color: c.text }}>
          商品名・説明文の文字色
        </p>
        <button
          type="button"
          className="px-3 py-1.5 rounded text-sm font-medium text-white"
          style={{ backgroundColor: c.button }}
        >
          カートに入れる
        </button>
      </div>
    </div>
  );
}

/** プリセットで使われているカラースワッチの組み合わせ（配色一覧） */
function ColorSwatchGrid({ preset }: { preset: DesignPreset }) {
  const c = getThemeColors(preset);
  const items = [
    { label: "ボタン", color: c.button },
    { label: "ヘッダー", color: c.header },
    { label: "背景", color: c.background },
    { label: "文字", color: c.text },
  ] as const;
  return (
    <div className="mt-2">
      <p className="text-xs font-medium text-gray-600 mb-1.5">配色</p>
      <div className="grid grid-cols-4 gap-2">
        {items.map(({ label, color }) => (
          <div key={label} className="flex flex-col items-center gap-0.5">
            <div
              className="h-10 w-full rounded border border-gray-200"
              style={{ backgroundColor: color }}
              title={`${label}: ${color}`}
            />
            <span className="text-xs text-gray-500">{label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function PresetCard({
  preset,
  index,
  storeId,
  isPreview,
  onPreview,
  onApply,
  onError,
}: {
  preset: DesignPreset;
  index: number;
  storeId: string;
  isPreview: boolean;
  onPreview: () => void;
  onApply: (presetId: string) => void;
  onError: (message: string) => void;
}) {
  const [loading, setLoading] = useState(false);
  const c = getThemeColors(preset);

  const handleApply = () => {
    setLoading(true);
    onError("");
    updateStoreActivePreset(storeId, preset.id)
      .then(() => onApply(preset.id))
      .catch((e) => onError(e instanceof Error ? e.message : "適用に失敗しました"))
      .finally(() => setLoading(false));
  };

  return (
    <li
      role="group"
      tabIndex={0}
      className={`border rounded-lg p-4 bg-white transition-shadow ${
        isPreview ? "ring-2 ring-blue-400 shadow-md" : "border-gray-200"
      }`}
      onMouseEnter={onPreview}
      onFocus={onPreview}
    >
      <div className="flex items-center gap-2 flex-wrap">
        <p className="font-medium">{preset.name}</p>
        {index === 0 && (
          <span className="text-xs px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 font-medium">
            デフォルト（おすすめ）
          </span>
        )}
      </div>
      {preset.description && (
        <p className="text-sm text-gray-600 mt-0.5">{preset.description}</p>
      )}
      <ColorSwatchGrid preset={preset} />
      <button
        type="button"
        onClick={handleApply}
        disabled={loading}
        className="mt-4 px-4 py-2 rounded font-medium text-white disabled:opacity-50"
        style={{ backgroundColor: c.button }}
      >
        {loading ? "適用中..." : "このデザインを適用"}
      </button>
    </li>
  );
}

/** 静的 export 時・Suspense フォールバック用（useSearchParams によるハイドレーション不一致を防ぐ） */
function DesignPageFallback() {
  return (
    <main className="max-w-2xl mx-auto p-6">
      <h2 className="text-xl font-semibold mb-4">ショップのデザイン</h2>
      <p className="text-gray-600 mb-4">
        ショップ作成後、ここから5つの配色プリセットのうち好きなものをいつでも適用できます。
      </p>
      <p className="text-sm text-gray-500">
        <Link href="/admin/onboarding" className="text-blue-600 underline">
          新規ショップ登録
        </Link>
        を完了すると、このページでデザインを切り替えられます。
      </p>
    </main>
  );
}

function AdminDesignContent() {
  const searchParams = useSearchParams();
  const storeId = searchParams.get("storeId");
  const [appliedId, setAppliedId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [previewPresetId, setPreviewPresetId] = useState<string | null>(
    DEFAULT_INSTALLED_PRESETS[0]?.id ?? null
  );

  const previewPreset =
    DEFAULT_INSTALLED_PRESETS.find((p) => p.id === previewPresetId) ??
    DEFAULT_INSTALLED_PRESETS[0];

  if (!storeId) {
    return <DesignPageFallback />;
  }

  return (
    <main className="max-w-2xl mx-auto p-6">
      <h2 className="text-xl font-semibold mb-2">ショップのデザイン</h2>
      <p className="text-sm text-gray-600 mb-6">
        5つの配色プリセットから好きなものを選んで適用できます。マウスを乗せると、ボタン・ヘッダー・背景の見た目をプレビューできます。
      </p>

      {previewPreset && (
        <section className="mb-8">
          <h3 className="text-sm font-medium text-gray-700 mb-2">適用時の見た目シミュレーション</h3>
          <div className="max-w-xs">
            <PresetSimulation preset={previewPreset} />
          </div>
          <p className="text-xs text-gray-500 mt-1">
            各プリセットにマウスを乗せると、このプレビューが切り替わります。
          </p>
        </section>
      )}

      {appliedId && (
        <p className="mb-4 text-sm text-green-700 bg-green-50 border border-green-200 rounded px-3 py-2">
          デザインを適用しました。
        </p>
      )}
      {error && (
        <p className="mb-4 text-sm text-red-600 bg-red-50 border border-red-200 rounded px-3 py-2" role="alert">
          {error}
        </p>
      )}

      <ul className="space-y-4">
        {DEFAULT_INSTALLED_PRESETS.map((preset, index) => (
          <PresetCard
            key={preset.id}
            preset={preset}
            index={index}
            storeId={storeId}
            isPreview={previewPresetId === preset.id}
            onPreview={() => setPreviewPresetId(preset.id)}
            onApply={(id) => {
              setAppliedId(id);
              setError(null);
            }}
            onError={setError}
          />
        ))}
      </ul>
      <p className="text-xs text-gray-500 mt-6">
        適用には Cloud Function（updateStoreActivePreset）のデプロイが必要です。
      </p>
    </main>
  );
}

export default function AdminDesignPage() {
  return (
    <Suspense fallback={<DesignPageFallback />}>
      <AdminDesignContent />
    </Suspense>
  );
}
