"use client";

import { getFirebaseApp, getFunctionsInstance, httpsCallable } from "@/lib/firebase";
import type { OnboardingData } from "@/lib/types/onboarding";
import type { DesignPreset } from "@/lib/types/onboarding";

/** 5つの完成された配色プリセット。先頭（プリセット1）が Firebase おすすめ度が最も高いデフォルト。ショップ作成時にインストールし、いつでも切り替え可能 */
export const DEFAULT_INSTALLED_PRESETS: DesignPreset[] = [
  {
    id: "natural",
    name: "ナチュラル",
    description: "落ち着いた自然な配色",
    theme: {
      buttonColor: "#4a7c59",
      headerColor: "#3d6b4d",
      backgroundColor: "#faf8f5",
      textColor: "#1f2937",
      fontFamily: "sans-serif",
      primaryColor: "#4a7c59",
    },
  },
  {
    id: "marine",
    name: "マリン",
    description: "海をイメージした青系",
    theme: {
      buttonColor: "#2563eb",
      headerColor: "#1d4ed8",
      backgroundColor: "#f0f9ff",
      textColor: "#1e3a5f",
      fontFamily: "sans-serif",
      primaryColor: "#2563eb",
    },
  },
  {
    id: "warm",
    name: "ウォーム",
    description: "温かみのあるオレンジ・ベージュ",
    theme: {
      buttonColor: "#c2410c",
      headerColor: "#9a3412",
      backgroundColor: "#fff7ed",
      textColor: "#431407",
      fontFamily: "sans-serif",
      primaryColor: "#c2410c",
    },
  },
  {
    id: "minimal",
    name: "ミニマル",
    description: "シンプル・白基調",
    theme: {
      buttonColor: "#171717",
      headerColor: "#262626",
      backgroundColor: "#ffffff",
      textColor: "#171717",
      fontFamily: "sans-serif",
      primaryColor: "#171717",
    },
  },
  {
    id: "craft",
    name: "クラフト",
    description: "ハンドメイド向けナチュラル",
    theme: {
      buttonColor: "#6b4423",
      headerColor: "#5c3d1f",
      backgroundColor: "#fef3c7",
      textColor: "#292524",
      fontFamily: "serif",
      primaryColor: "#6b4423",
    },
  },
];

export async function generateDesignPresets(onboarding: OnboardingData): Promise<DesignPreset[]> {
  const app = getFirebaseApp();
  if (!app) return DEFAULT_INSTALLED_PRESETS;

  try {
    const functions = getFunctionsInstance("asia-northeast1");
    if (!functions) return DEFAULT_INSTALLED_PRESETS;

    const fn = httpsCallable<{ onboarding: OnboardingData }, { presets?: DesignPreset[] }>(
      functions,
      "generateDesignPresets"
    );
    const res = await fn({ onboarding });
    return res.data.presets ?? DEFAULT_INSTALLED_PRESETS;
  } catch {
    return DEFAULT_INSTALLED_PRESETS;
  }
}
