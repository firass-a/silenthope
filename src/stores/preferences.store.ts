"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { StudentPreferences } from "@/types";
import { createSessionStorage } from "@/lib/session-storage";

interface PreferencesState {
  byUserId: Record<string, StudentPreferences>;
  setPreferences: (prefs: StudentPreferences) => void;
  getPreferences: (userId: string) => StudentPreferences | undefined;
}

export const usePreferencesStore = create<PreferencesState>()(
  persist(
    (set, get) => ({
      byUserId: {},
      setPreferences: (prefs) =>
        set((s) => ({
          byUserId: { ...s.byUserId, [prefs.userId]: prefs },
        })),
      getPreferences: (userId) => get().byUserId[userId],
    }),
    {
      name: "silent-hope-preferences",
      storage: createSessionStorage(),
    }
  )
);
