"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { ActivityAction, ActivityEntity, ActivityLog, Role } from "@/types";
import { seedActivity } from "@/data/seed";
import { createSessionStorage } from "@/lib/session-storage";
import { generateId } from "@/lib/utils";

interface ActivityState {
  logs: ActivityLog[];
  log: (input: {
    action: ActivityAction;
    entity: ActivityEntity;
    entityId: string;
    description: string;
    performedBy: string;
    performedByRole?: Role;
    meta?: Record<string, string>;
  }) => void;
  reset: () => void;
}

export const useActivityStore = create<ActivityState>()(
  persist(
    (set) => ({
      logs: seedActivity,
      log: (input) => {
        const entry: ActivityLog = {
          id: generateId("activity"),
          ...input,
          timestamp: new Date().toISOString(),
        };
        set((s) => ({ logs: [entry, ...s.logs] }));
      },
      reset: () => set({ logs: seedActivity }),
    }),
    {
      name: "silent-hope-activity",
      storage: createSessionStorage(),
    }
  )
);

export function logActivity(
  input: Parameters<ActivityState["log"]>[0]
) {
  useActivityStore.getState().log(input);
}
