"use client";

import { useState, useEffect } from "react";
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  type User,
} from "firebase/auth";
import { getAuthInstance } from "@/lib/firebase";

export function useAuth(): {
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
} {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const auth = getAuthInstance();
    if (!auth) {
      setLoading(false);
      return;
    }
    const unsub = onAuthStateChanged(auth, (u) => {
      setUser(u ?? null);
      setLoading(false);
    });
    return () => unsub();
  }, []);

  const signIn = async (email: string, password: string) => {
    const auth = getAuthInstance();
    if (!auth) throw new Error("Firebase Auth が利用できません");
    await signInWithEmailAndPassword(auth, email, password);
  };

  const signOut = async () => {
    const auth = getAuthInstance();
    if (!auth) return;
    await firebaseSignOut(auth);
  };

  return { user, loading, signIn, signOut };
}
