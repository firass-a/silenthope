"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { AppNotification } from "@/types";
import { seedNotifications } from "@/data/seed";
import { createSessionStorage } from "@/lib/session-storage";
import { generateId } from "@/lib/utils";
import { logActivity } from "@/stores/activity.store";
import { useAuthStore } from "@/stores/auth.store";

type NotifInput = Omit<AppNotification, "id" | "createdAt" | "read"> & {
  read?: boolean;
};

interface NotificationsState {
  notifications: AppNotification[];
  addNotification: (input: NotifInput) => AppNotification;
  updateNotification: (id: string, patch: Partial<AppNotification>) => void;
  deleteNotification: (id: string) => void;
  deleteMany: (ids: string[]) => void;
  markRead: (id: string, read?: boolean) => void;
  markAllRead: () => void;
  reset: () => void;
}

function actor() {
  const s = useAuthStore.getState().session;
  return { performedBy: s?.name ?? "نظام", performedByRole: s?.role };
}

export const useNotificationsStore = create<NotificationsState>()(
  persist(
    (set, get) => ({
      notifications: seedNotifications,
      addNotification: (input) => {
        const n: AppNotification = {
          ...input,
          id: generateId("notif"),
          read: input.read ?? false,
          createdAt: new Date().toISOString(),
        };
        set((s) => ({ notifications: [n, ...s.notifications] }));
        logActivity({
          action: "CREATE",
          entity: "notification",
          entityId: n.id,
          description: `تم إنشاء إشعار: ${n.title}`,
          ...actor(),
        });
        return n;
      },
      updateNotification: (id, patch) => {
        set((s) => ({
          notifications: s.notifications.map((n) =>
            n.id === id ? { ...n, ...patch } : n
          ),
        }));
        logActivity({
          action: "UPDATE",
          entity: "notification",
          entityId: id,
          description: `تم تعديل إشعار`,
          ...actor(),
        });
      },
      deleteNotification: (id) => {
        set((s) => ({
          notifications: s.notifications.filter((n) => n.id !== id),
        }));
        logActivity({
          action: "DELETE",
          entity: "notification",
          entityId: id,
          description: `تم حذف إشعار`,
          ...actor(),
        });
      },
      deleteMany: (ids) => ids.forEach((id) => get().deleteNotification(id)),
      markRead: (id, read = true) => {
        get().updateNotification(id, { read });
      },
      markAllRead: () => {
        set((s) => ({
          notifications: s.notifications.map((n) => ({ ...n, read: true })),
        }));
      },
      reset: () => set({ notifications: seedNotifications }),
    }),
    {
      name: "silent-hope-notifications",
      storage: createSessionStorage(),
    }
  )
);
