"use client";

import { getFirebaseApp, getFunctionsInstance, httpsCallable } from "@/lib/firebase";
import type { DesignPreset } from "@/lib/types/onboarding";

export interface CreateStoreInput {
  subdomain: string;
  name: string;
  description?: string;
  /** 5つの配色プリセットをショップにインストール。ユーザーはいつでも切り替え可能 */
  installedPresets?: DesignPreset[];
  /** 現在適用中のプリセットID（installedPresets のいずれか） */
  activePresetId?: string;
  /** 後方互換: 適用中テーマ（activePreset の theme と同じ内容を渡すと CF 側でそのまま使える） */
  theme?: {
    primaryColor?: string;
    backgroundColor?: string;
    fontFamily?: string;
    buttonColor?: string;
    headerColor?: string;
    textColor?: string;
  };
  layoutVariant?: string;
}

export async function createStoreWithAdmin(
  input: CreateStoreInput
): Promise<{ storeId: string }> {
  const app = getFirebaseApp();
  if (!app) throw new Error("Firebase が利用できません");

  const functions = getFunctionsInstance("asia-northeast1");
  if (!functions) throw new Error("Cloud Functions が利用できません");

  const fn = httpsCallable<CreateStoreInput, { storeId: string }>(
    functions,
    "createStoreWithAdmin"
  );
  const res = await fn(input);
  return res.data;
}
