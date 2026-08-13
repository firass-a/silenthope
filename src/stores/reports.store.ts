"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Report, ReportStatus } from "@/types";
import { seedReports } from "@/data/seed";
import { createAppStorage } from "@/lib/app-storage";
import { generateId } from "@/lib/utils";
import { logActivity } from "@/stores/activity.store";
import { useAuthStore } from "@/stores/auth.store";

type ReportInput = Omit<Report, "id" | "createdAt" | "updatedAt" | "status"> & {
  status?: ReportStatus;
};

interface ReportsState {
  reports: Report[];
  addReport: (input: ReportInput) => Report;
  updateReport: (id: string, patch: Partial<Report>) => void;
  deleteReport: (id: string) => void;
  deleteMany: (ids: string[]) => void;
  setStatus: (id: string, status: ReportStatus) => void;
  getById: (id: string) => Report | undefined;
  reset: () => void;
}

function actor() {
  const s = useAuthStore.getState().session;
  return { performedBy: s?.name ?? "نظام", performedByRole: s?.role };
}

export const useReportsStore = create<ReportsState>()(
  persist(
    (set, get) => ({
      reports: seedReports,
      addReport: (input) => {
        const now = new Date().toISOString();
        const report: Report = {
          ...input,
          id: generateId("rep"),
          status: input.status ?? "pending",
          createdAt: now,
          updatedAt: now,
        };
        set((s) => ({ reports: [report, ...s.reports] }));
        logActivity({
          action: "CREATE",
          entity: "report",
          entityId: report.id,
          description: `تم إنشاء بلاغ: ${report.reason}`,
          ...actor(),
        });
        return report;
      },
      updateReport: (id, patch) => {
        set((s) => ({
          reports: s.reports.map((r) =>
            r.id === id
              ? { ...r, ...patch, updatedAt: new Date().toISOString() }
              : r
          ),
        }));
        logActivity({
          action: "UPDATE",
          entity: "report",
          entityId: id,
          description: `تم تحديث بلاغ`,
          ...actor(),
        });
      },
      deleteReport: (id) => {
        set((s) => ({ reports: s.reports.filter((r) => r.id !== id) }));
        logActivity({
          action: "DELETE",
          entity: "report",
          entityId: id,
          description: `تم حذف بلاغ`,
          ...actor(),
        });
      },
      deleteMany: (ids) => ids.forEach((id) => get().deleteReport(id)),
      setStatus: (id, status) => {
        get().updateReport(id, { status });
        logActivity({
          action: "STATUS_CHANGE",
          entity: "report",
          entityId: id,
          description: `تغيير حالة البلاغ إلى ${status}`,
          ...actor(),
        });
      },
      getById: (id) => get().reports.find((r) => r.id === id),
      reset: () => set({ reports: seedReports }),
    }),
    {
      name: "silent-hope-reports",
      storage: createAppStorage(),
    }
  )
);
