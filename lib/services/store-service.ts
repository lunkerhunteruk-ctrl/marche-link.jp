"use client";

import {
  getFirestore,
  collection,
  query,
  where,
  getDocs,
  doc,
  updateDoc,
  serverTimestamp,
} from "firebase/firestore";
import { getFirebaseApp, getFunctionsInstance, httpsCallable } from "@/lib/firebase";

export interface Store {
  id: string;
  name: string;
  subdomain: string;
  ownerId: string;
  iconUrl?: string;
}

export async function getUserStores(uid: string): Promise<Store[]> {
  const app = getFirebaseApp();
  if (!app) return [];

  const db = getFirestore(app);
  const storesRef = collection(db, "stores");
  const q = query(storesRef, where("ownerId", "==", uid));
  const snapshot = await getDocs(q);

  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  })) as Store[];
}

export async function getLineCustomToken(idToken: string): Promise<string> {
  const functions = getFunctionsInstance("asia-northeast1");
  if (!functions) throw new Error("Cloud Functions が利用できません");

  const fn = httpsCallable<{ idToken: string }, { customToken: string }>(
    functions,
    "getLineCustomToken"
  );
  const res = await fn({ idToken });
  return res.data.customToken;
}

export async function signInWithLineToken(idToken: string): Promise<void> {
  const { getAuth, signInWithCustomToken } = await import("firebase/auth");
  const app = getFirebaseApp();
  if (!app) throw new Error("Firebase が利用できません");

  const customToken = await getLineCustomToken(idToken);
  const auth = getAuth(app);
  await signInWithCustomToken(auth, customToken);
}

export async function updateStoreIcon(
  storeId: string,
  iconUrl: string
): Promise<void> {
  const app = getFirebaseApp();
  if (!app) return;

  const db = getFirestore(app);
  const storeRef = doc(db, "stores", storeId);
  await updateDoc(storeRef, {
    iconUrl,
    updatedAt: serverTimestamp(),
  });
}
