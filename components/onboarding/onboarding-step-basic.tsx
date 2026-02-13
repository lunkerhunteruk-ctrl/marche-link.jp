"use client";

import { OptionalFieldsNote } from "./optional-fields-note";

const PRODUCT_CATEGORIES = [
  "魚介類",
  "生花・フラワー",
  "野菜・果物",
  "精肉",
  "惣菜・加工品",
  "雑貨・生活用品",
  "ハンドクラフト・アクセサリー",
  "その他",
];

export interface OnboardingStepBasicData {
  storeName?: string;
  subdomain?: string;
  description?: string;
  productCategories?: string[];
}

export function OnboardingStepBasic({
  data,
  onChange,
}: {
  data: OnboardingStepBasicData;
  onChange: (patch: Partial<OnboardingStepBasicData>) => void;
}) {
  const toggleCategory = (name: string) => {
    const current = data.productCategories ?? [];
    onChange({
      productCategories: current.includes(name)
        ? current.filter((c) => c !== name)
        : [...current, name],
    });
  };

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          店舗名 <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          value={data.storeName ?? ""}
          onChange={(e) => onChange({ storeName: e.target.value })}
          className="w-full border border-gray-300 rounded px-3 py-2"
          placeholder="例: 田中商店"
          required
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          お店のページアドレス（○○.marche-link.jp の ○○ の部分）{" "}
          <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          value={data.subdomain ?? ""}
          onChange={(e) =>
            onChange({
              subdomain: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ""),
            })
          }
          className="w-full border border-gray-300 rounded px-3 py-2"
          placeholder="例: tanaka と入れると tanaka.marche-link.jp になります"
          required
        />
        <p className="text-xs text-gray-500 mt-1">
          半角英小文字・数字・ハイフンのみ。admin, www は使えません。
        </p>
      </div>

      <OptionalFieldsNote />

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          説明・キャッチコピー
          <span className="ml-1 text-xs font-normal text-gray-500">
            （任意・記入するとデザインの精度が上がります）
          </span>
        </label>
        <textarea
          value={data.description ?? ""}
          onChange={(e) => onChange({ description: e.target.value })}
          className="w-full border border-gray-300 rounded px-3 py-2"
          rows={2}
          placeholder="例: 新鮮な魚介をお届けします"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          取扱商品カテゴリ・ジャンル（複数可）
          <span className="ml-1 text-xs font-normal text-gray-500">
            （任意・記入推奨）
          </span>
        </label>
        <div className="flex flex-wrap gap-2">
          {PRODUCT_CATEGORIES.map((name) => (
            <button
              key={name}
              type="button"
              onClick={() => toggleCategory(name)}
              className={`px-3 py-1 rounded-full text-sm border ${
                (data.productCategories ?? []).includes(name)
                  ? "bg-blue-100 border-blue-300 text-blue-800"
                  : "bg-white border-gray-300 text-gray-700"
              }`}
            >
              {name}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
