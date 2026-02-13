"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/hooks/use-auth";
import { createStoreWithAdmin } from "@/lib/services/create-store";
import { generateDesignPresets, DEFAULT_INSTALLED_PRESETS } from "@/lib/services/design-presets";
import { isAllowedSubdomain } from "@/lib/constants/subdomain";
import type { OnboardingData } from "@/lib/types/onboarding";
import { OnboardingStepBasic } from "@/components/onboarding/onboarding-step-basic";
import { OnboardingStepConcept } from "@/components/onboarding/onboarding-step-concept";
import { OnboardingStepDesign } from "@/components/onboarding/onboarding-step-design";

const STEPS = [
  { id: "basic", label: "基本情報", Component: OnboardingStepBasic },
  { id: "concept", label: "コンセプト・ターゲット", Component: OnboardingStepConcept },
  { id: "design", label: "デザイン希望", Component: OnboardingStepDesign },
] as const;

export default function OnboardingPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [stepIndex, setStepIndex] = useState(0);
  const [data, setData] = useState<Partial<OnboardingData>>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const step = STEPS[stepIndex];
  const StepComponent = step.Component;
  const isLastStep = stepIndex === STEPS.length - 1;

  const handleNext = () => {
    if (isLastStep) {
      if (!data.storeName?.trim() || !data.subdomain?.trim()) return;
      if (!isAllowedSubdomain(data.subdomain ?? "")) {
        setError("お店のページアドレスが無効です。予約語・形式を確認してください。");
        return;
      }
      setLoading(true);
      setError(null);
      generateDesignPresets(data as OnboardingData)
        .then((presets) => {
          const installedPresets = presets ?? DEFAULT_INSTALLED_PRESETS;
          const activePreset = installedPresets[0];
          const subdomain = (data.subdomain ?? "").trim().toLowerCase().replace(/[^a-z0-9-]/g, "");
          return createStoreWithAdmin({
            subdomain,
            name: (data.storeName ?? "").trim(),
            description: data.description?.trim() || undefined,
            installedPresets,
            activePresetId: activePreset.id,
            theme: {
              primaryColor: activePreset.theme.primaryColor ?? activePreset.theme.buttonColor,
              backgroundColor: activePreset.theme.backgroundColor,
              fontFamily: activePreset.theme.fontFamily,
              buttonColor: activePreset.theme.buttonColor,
              headerColor: activePreset.theme.headerColor,
              textColor: activePreset.theme.textColor,
            },
            layoutVariant: "default",
          });
        })
        .then(({ storeId }) => router.push(`/admin/design?storeId=${storeId}`))
        .catch((e) => setError(e instanceof Error ? e.message : "ショップの作成に失敗しました。Cloud Function のデプロイを確認してください。"))
        .finally(() => setLoading(false));
    } else {
      setStepIndex((i) => i + 1);
    }
  };

  if (authLoading || !user) {
    return (
      <main className="max-w-2xl mx-auto p-6">
        <p className="text-gray-500">
          読み込み中... または <Link href="/admin" className="text-blue-600">ログイン</Link> してください。
        </p>
      </main>
    );
  }

  const canProceed =
    step.id !== "basic" ||
    (!!data.storeName?.trim() && !!data.subdomain?.trim());

  return (
    <main className="max-w-2xl mx-auto p-6">
      <Link href="/admin" className="text-sm text-blue-600 mb-4 inline-block">
        ← 管理画面へ
      </Link>
      <h2 className="text-xl font-semibold mb-2">新規ショップ登録（オンボーディング）</h2>
      <p className="text-sm text-gray-600 mb-6">
        ステップ {stepIndex + 1} / {STEPS.length}: {step.label}
      </p>
      {error && (
        <p className="text-sm text-red-600 mb-4" role="alert">
          {error}
        </p>
      )}
      <StepComponent
        data={data}
        onChange={(patch) => setData((prev) => ({ ...prev, ...patch }))}
      />
      <div className="mt-6 flex gap-4">
        {stepIndex > 0 && (
          <button
            type="button"
            onClick={() => setStepIndex((i) => i - 1)}
            className="px-4 py-2 border border-gray-300 rounded"
          >
            戻る
          </button>
        )}
        <button
          type="button"
          onClick={handleNext}
          disabled={loading || !canProceed}
          className="px-4 py-2 bg-blue-600 text-white rounded font-medium disabled:opacity-50"
        >
          {loading ? "作成中..." : isLastStep ? "5つのデザインをインストールしてショップを作成" : "次へ"}
        </button>
      </div>
    </main>
  );
}
