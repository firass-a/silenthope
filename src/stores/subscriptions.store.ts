"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Subscription, SubscriptionStatus } from "@/types";
import { seedSubscriptions } from "@/data/seed";
import { createAppStorage } from "@/lib/app-storage";
import { generateId } from "@/lib/utils";
import { logActivity } from "@/stores/activity.store";
import { useAuthStore } from "@/stores/auth.store";

type SubInput = Omit<Subscription, "id" | "createdAt">;

interface SubscriptionsState {
  subscriptions: Subscription[];
  addSubscription: (input: SubInput) => Subscription;
  updateSubscription: (id: string, patch: Partial<Subscription>) => void;
  deleteSubscription: (id: string) => void;
  deleteMany: (ids: string[]) => void;
  setStatus: (id: string, status: SubscriptionStatus) => void;
  getById: (id: string) => Subscription | undefined;
  getByStudent: (studentId: string) => Subscription[];
  reset: () => void;
}

function actor() {
  const s = useAuthStore.getState().session;
  return { performedBy: s?.name ?? "نظام", performedByRole: s?.role };
}

export const useSubscriptionsStore = create<SubscriptionsState>()(
  persist(
    (set, get) => ({
      subscriptions: seedSubscriptions,
      addSubscription: (input) => {
        const sub: Subscription = {
          ...input,
          id: generateId("sub"),
          createdAt: new Date().toISOString(),
        };
        set((s) => ({ subscriptions: [sub, ...s.subscriptions] }));
        logActivity({
          action: "CREATE",
          entity: "subscription",
          entityId: sub.id,
          description: `تم إنشاء اشتراك (${sub.plan})`,
          ...actor(),
        });
        return sub;
      },
      updateSubscription: (id, patch) => {
        set((s) => ({
          subscriptions: s.subscriptions.map((x) =>
            x.id === id ? { ...x, ...patch } : x
          ),
        }));
        logActivity({
          action: "UPDATE",
          entity: "subscription",
          entityId: id,
          description: `تم تعديل الاشتراك`,
          ...actor(),
        });
      },
      deleteSubscription: (id) => {
        set((s) => ({
          subscriptions: s.subscriptions.filter((x) => x.id !== id),
        }));
        logActivity({
          action: "DELETE",
          entity: "subscription",
          entityId: id,
          description: `تم حذف الاشتراك`,
          ...actor(),
        });
      },
      deleteMany: (ids) => ids.forEach((id) => get().deleteSubscription(id)),
      setStatus: (id, status) => {
        get().updateSubscription(id, { status });
        logActivity({
          action: "STATUS_CHANGE",
          entity: "subscription",
          entityId: id,
          description: `تغيير حالة الاشتراك إلى ${status}`,
          ...actor(),
        });
      },
      getById: (id) => get().subscriptions.find((s) => s.id === id),
      getByStudent: (studentId) =>
        get().subscriptions.filter((s) => s.studentId === studentId),
      reset: () => set({ subscriptions: seedSubscriptions }),
    }),
    {
      name: "silent-hope-subscriptions",
      storage: createAppStorage(),
    }
  )
);
