"use client";

import { OptionalFieldsNote } from "./optional-fields-note";

export interface OnboardingStepDesignData {
  preferredColors?: string;
  avoidColors?: string;
  referenceImage?: string;
  styleMaterial?: string;
}

const OPTIONAL_LABEL = (
  <span className="ml-1 text-xs font-normal text-gray-500">
    （任意・記入するとデザインの精度が上がります）
  </span>
);

export function OnboardingStepDesign({
  data,
  onChange,
}: {
  data: OnboardingStepDesignData;
  onChange: (patch: Partial<OnboardingStepDesignData>) => void;
}) {
  return (
    <div className="space-y-4">
      <OptionalFieldsNote />

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          希望する色 {OPTIONAL_LABEL}
        </label>
        <input
          type="text"
          value={data.preferredColors ?? ""}
          onChange={(e) => onChange({ preferredColors: e.target.value })}
          className="w-full border border-gray-300 rounded px-3 py-2"
          placeholder="例: 青・白・ナチュラル"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          避けたい色 {OPTIONAL_LABEL}
        </label>
        <input
          type="text"
          value={data.avoidColors ?? ""}
          onChange={(e) => onChange({ avoidColors: e.target.value })}
          className="w-full border border-gray-300 rounded px-3 py-2"
          placeholder="例: 派手な赤"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          参考にしたいイメージ {OPTIONAL_LABEL}
        </label>
        <input
          type="text"
          value={data.referenceImage ?? ""}
          onChange={(e) => onChange({ referenceImage: e.target.value })}
          className="w-full border border-gray-300 rounded px-3 py-2"
          placeholder="例: 落ち着いた和風、ミニマル"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          作風・素材・世界観
          <span className="ml-1 text-xs font-normal text-gray-500">
            （任意・記入推奨・ハンドクラフト向け）
          </span>
        </label>
        <textarea
          value={data.styleMaterial ?? ""}
          onChange={(e) => onChange({ styleMaterial: e.target.value })}
          className="w-full border border-gray-300 rounded px-3 py-2"
          rows={2}
          placeholder="例: 天然石とシルバー、ナチュラル"
        />
      </div>
    </div>
  );
}
