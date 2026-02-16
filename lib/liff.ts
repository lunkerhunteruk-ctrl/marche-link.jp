"use client";

import liff from "@line/liff";
import { LIFF_ID_ADMIN } from "@/lib/constants/liff";

let initialized = false;

export async function initLiff(liffId: string): Promise<void> {
  if (initialized && liff.id === liffId) return;

  // admin paths should use admin LIFF ID, not order LIFF ID
  let targetLiffId = liffId;
  if (typeof window !== "undefined") {
    const path = window.location.pathname;
    if (path.startsWith("/admin") && !path.startsWith("/admin-entry")) {
      if (liffId.endsWith("KaRhKY16") || liffId.includes("KaRhKY16")) {
        targetLiffId = LIFF_ID_ADMIN;
      }
    }
  }

  await liff.init({ liffId: targetLiffId });
  initialized = true;
}

export function isInClient(): boolean {
  try {
    return liff.isInClient();
  } catch {
    return false;
  }
}

export function isLoggedIn(): boolean {
  try {
    return liff.isLoggedIn();
  } catch {
    return false;
  }
}

export function login(redirectUri: string): void {
  liff.login({ redirectUri });
}

export async function getProfile(): Promise<{
  userId: string;
  displayName: string;
  pictureUrl?: string;
}> {
  const profile = await liff.getProfile();
  return {
    userId: profile.userId,
    displayName: profile.displayName ?? "",
    pictureUrl: profile.pictureUrl,
  };
}

export async function getIDToken(): Promise<string | null> {
  try {
    const token = await liff.getIDToken();
    return token && typeof token === "string" ? token : null;
  } catch {
    return null;
  }
}

export function closeWindow(): void {
  liff.closeWindow?.();
}
