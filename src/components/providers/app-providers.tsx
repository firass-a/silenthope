"use client";

import { useEffect } from "react";
import { Toaster } from "sonner";
import { useSettingsStore, applySettingsToDom } from "@/stores/settings.store";

function SettingsEffects() {
  const settings = useSettingsStore((s) => s.settings);

  useEffect(() => {
    applySettingsToDom(settings);
    // Force light mode — dark theme removed
    document.documentElement.classList.remove("dark");
    document.documentElement.style.colorScheme = "light";
  }, [settings]);

  return null;
}

export function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <>
      <SettingsEffects />
      {children}
      <Toaster
        position="top-center"
        richColors
        closeButton
        dir="rtl"
        theme="light"
        toastOptions={{
          classNames: {
            toast: "font-sans",
          },
        }}
      />
    </>
  );
}
