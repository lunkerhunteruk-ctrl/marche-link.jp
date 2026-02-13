"use client";

import { getFirebaseApp, getFunctionsInstance, httpsCallable } from "@/lib/firebase";

/** ショップの適用中デザインプリセットを切り替える（Cloud Function または Firestore で更新） */
export async function updateStoreActivePreset(
  storeId: string,
  activePresetId: string
): Promise<void> {
  const app = getFirebaseApp();
  if (!app) throw new Error("Firebase が利用できません");

  const functions = getFunctionsInstance("asia-northeast1");
  if (!functions) throw new Error("Cloud Functions が利用できません");

  const fn = httpsCallable<{ storeId: string; activePresetId: string }, void>(
    functions,
    "updateStoreActivePreset"
  );
  await fn({ storeId, activePresetId });
}
