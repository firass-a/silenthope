"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Talent, TalentStatus } from "@/types";
import { seedTalents } from "@/data/seed";
import { createAppStorage } from "@/lib/app-storage";
import { generateId } from "@/lib/utils";
import { logActivity } from "@/stores/activity.store";
import { useAuthStore } from "@/stores/auth.store";

type TalentInput = Omit<
  Talent,
  "id" | "createdAt" | "updatedAt" | "views" | "likes" | "featured" | "status"
> & {
  status?: TalentStatus;
  featured?: boolean;
  views?: number;
  likes?: number;
};

interface TalentsState {
  talents: Talent[];
  addTalent: (input: TalentInput) => Talent;
  updateTalent: (id: string, patch: Partial<Talent>) => void;
  deleteTalent: (id: string) => void;
  deleteMany: (ids: string[]) => void;
  approveTalent: (id: string) => void;
  rejectTalent: (id: string, reason: string) => void;
  featureTalent: (id: string, featured?: boolean) => void;
  setTalentStatus: (id: string, status: TalentStatus) => void;
  getTalentById: (id: string) => Talent | undefined;
  getByStudent: (studentId: string) => Talent[];
  reset: () => void;
}

function actor() {
  const s = useAuthStore.getState().session;
  return { performedBy: s?.name ?? "نظام", performedByRole: s?.role };
}

export const useTalentsStore = create<TalentsState>()(
  persist(
    (set, get) => ({
      talents: seedTalents,
      addTalent: (input) => {
        const now = new Date().toISOString();
        const talent: Talent = {
          ...input,
          id: generateId("talent"),
          status: input.status ?? "pending",
          featured: input.featured ?? false,
          views: input.views ?? 0,
          likes: input.likes ?? 0,
          createdAt: now,
          updatedAt: now,
        };
        set((s) => ({ talents: [talent, ...s.talents] }));
        logActivity({
          action: "CREATE",
          entity: "talent",
          entityId: talent.id,
          description: `تم إرسال موهبة: ${talent.title}`,
          ...actor(),
        });
        return talent;
      },
      updateTalent: (id, patch) => {
        set((s) => ({
          talents: s.talents.map((t) =>
            t.id === id
              ? { ...t, ...patch, updatedAt: new Date().toISOString() }
              : t
          ),
        }));
        const t = get().getTalentById(id);
        logActivity({
          action: "UPDATE",
          entity: "talent",
          entityId: id,
          description: `تم تعديل الموهبة: ${t?.title ?? id}`,
          ...actor(),
        });
      },
      deleteTalent: (id) => {
        const t = get().getTalentById(id);
        set((s) => ({ talents: s.talents.filter((x) => x.id !== id) }));
        logActivity({
          action: "DELETE",
          entity: "talent",
          entityId: id,
          description: `تم حذف الموهبة: ${t?.title ?? id}`,
          ...actor(),
        });
      },
      deleteMany: (ids) => ids.forEach((id) => get().deleteTalent(id)),
      approveTalent: (id) => {
        get().updateTalent(id, {
          status: "approved",
          rejectionReason: undefined,
        });
        const t = get().getTalentById(id);
        logActivity({
          action: "APPROVE",
          entity: "talent",
          entityId: id,
          description: `تمت الموافقة على موهبة «${t?.title ?? id}»`,
          ...actor(),
        });
      },
      rejectTalent: (id, reason) => {
        get().updateTalent(id, { status: "rejected", rejectionReason: reason });
        const t = get().getTalentById(id);
        logActivity({
          action: "REJECT",
          entity: "talent",
          entityId: id,
          description: `تم رفض موهبة «${t?.title ?? id}»: ${reason}`,
          ...actor(),
        });
      },
      featureTalent: (id, featured = true) => {
        get().updateTalent(id, {
          featured,
          status: featured ? "featured" : "approved",
        });
        const t = get().getTalentById(id);
        logActivity({
          action: "FEATURE",
          entity: "talent",
          entityId: id,
          description: featured
            ? `تم تمييز الموهبة: ${t?.title ?? id}`
            : `إلغاء تمييز الموهبة: ${t?.title ?? id}`,
          ...actor(),
        });
      },
      setTalentStatus: (id, status) => {
        get().updateTalent(id, { status, featured: status === "featured" });
        logActivity({
          action: "STATUS_CHANGE",
          entity: "talent",
          entityId: id,
          description: `تغيير حالة الموهبة إلى ${status}`,
          ...actor(),
        });
      },
      getTalentById: (id) => get().talents.find((t) => t.id === id),
      getByStudent: (studentId) =>
        get().talents.filter((t) => t.studentId === studentId),
      reset: () => set({ talents: seedTalents }),
    }),
    {
      name: "silent-hope-talents",
      storage: createAppStorage(),
    }
  )
);
