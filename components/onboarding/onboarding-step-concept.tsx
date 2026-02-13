"use client";

import { OptionalFieldsNote } from "./optional-fields-note";

export interface OnboardingStepConceptData {
  concept?: string;
  targetAudience?: string;
  atmosphere?: string;
  locationScale?: string;
  priceRange?: string;
}

const OPTIONAL_LABEL = (
  <span className="ml-1 text-xs font-normal text-gray-500">
    （任意・記入するとデザインの精度が上がります）
  </span>
);

export function OnboardingStepConcept({
  data,
  onChange,
}: {
  data: OnboardingStepConceptData;
  onChange: (patch: Partial<OnboardingStepConceptData>) => void;
}) {
  return (
    <div className="space-y-4">
      <OptionalFieldsNote />

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          コンセプト {OPTIONAL_LABEL}
        </label>
        <textarea
          value={data.concept ?? ""}
          onChange={(e) => onChange({ concept: e.target.value })}
          className="w-full border border-gray-300 rounded px-3 py-2"
          rows={2}
          placeholder="例: 地元の海の幸をその日の朝に"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          ターゲット客層 {OPTIONAL_LABEL}
        </label>
        <input
          type="text"
          value={data.targetAudience ?? ""}
          onChange={(e) => onChange({ targetAudience: e.target.value })}
          className="w-full border border-gray-300 rounded px-3 py-2"
          placeholder="例: 30〜50代のご家庭"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          店舗の雰囲気 {OPTIONAL_LABEL}
        </label>
        <input
          type="text"
          value={data.atmosphere ?? ""}
          onChange={(e) => onChange({ atmosphere: e.target.value })}
          className="w-full border border-gray-300 rounded px-3 py-2"
          placeholder="例: 明るく親しみやすい"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          立地・規模 {OPTIONAL_LABEL}
        </label>
        <input
          type="text"
          value={data.locationScale ?? ""}
          onChange={(e) => onChange({ locationScale: e.target.value })}
          className="w-full border border-gray-300 rounded px-3 py-2"
          placeholder="例: 商店街の一角、小規模"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          価格帯 {OPTIONAL_LABEL}
        </label>
        <input
          type="text"
          value={data.priceRange ?? ""}
          onChange={(e) => onChange({ priceRange: e.target.value })}
          className="w-full border border-gray-300 rounded px-3 py-2"
          placeholder="例: 手頃な価格帯"
        />
      </div>
    </div>
  );
}
