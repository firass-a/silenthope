"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { PlatformSettings } from "@/types";
import { seedSettings } from "@/data/seed";
import { clearAllAppStorage, createAppStorage } from "@/lib/app-storage";
import { logActivity } from "@/stores/activity.store";
import { useAuthStore } from "@/stores/auth.store";

interface SettingsState {
  settings: PlatformSettings;
  updateSettings: (patch: Partial<PlatformSettings>) => void;
  resetSettings: () => void;
  resetDemoData: () => void;
}

function actor() {
  const s = useAuthStore.getState().session;
  return { performedBy: s?.name ?? "نظام", performedByRole: s?.role };
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set, get) => ({
      settings: seedSettings,
      updateSettings: (patch) => {
        set((s) => ({
          settings: { ...s.settings, ...patch, theme: "light" },
        }));
        logActivity({
          action: "UPDATE",
          entity: "settings",
          entityId: "settings",
          description: "تم تحديث إعدادات المنصة",
          ...actor(),
        });
      },
      resetSettings: () => set({ settings: { ...seedSettings, theme: "light" } }),
      resetDemoData: () => {
        logActivity({
          action: "RESET",
          entity: "system",
          entityId: "demo",
          description: "إعادة تعيين بيانات المنصة",
          ...actor(),
        });
        // Allow activity log to flush, then clear
        setTimeout(() => {
          clearAllAppStorage();
          window.location.reload();
        }, 100);
      },
    }),
    {
      name: "silent-hope-settings",
      storage: createAppStorage(),
      merge: (persisted, current) => {
        const p = (persisted ?? {}) as Partial<SettingsState>;
        return {
          ...current,
          ...p,
          settings: {
            ...current.settings,
            ...(p.settings ?? {}),
            theme: "light",
          },
        };
      },
    }
  )
);

export function applySettingsToDom(settings: PlatformSettings) {
  if (typeof document === "undefined") return;
  const root = document.documentElement;
  const scale = settings.fontSize === "sm" ? 0.925 : settings.fontSize === "lg" ? 1.1 : 1;
  root.style.setProperty("--font-size-scale", String(scale));
  root.classList.remove("dark");
  root.style.colorScheme = "light";
  root.classList.toggle("high-contrast", settings.contrast === "high");
  root.classList.toggle("reduce-motion", settings.reducedMotion);
}
