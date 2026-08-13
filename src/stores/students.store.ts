"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { EntityStatus, Student } from "@/types";
import { seedStudents } from "@/data/seed";
import { createAppStorage } from "@/lib/app-storage";
import { generateId } from "@/lib/utils";
import { logActivity } from "@/stores/activity.store";
import { useAuthStore } from "@/stores/auth.store";

const SEED_IDS = new Set(seedStudents.map((s) => s.id));

type StudentInput = Omit<Student, "id" | "joinedAt" | "progress"> & {
  progress?: number;
};

interface StudentsState {
  students: Student[];
  addStudent: (input: StudentInput) => Student;
  updateStudent: (id: string, patch: Partial<Student>) => void;
  deleteStudent: (id: string) => void;
  deleteMany: (ids: string[]) => void;
  setStudentStatus: (id: string, status: EntityStatus) => void;
  bulkSetStatus: (ids: string[], status: EntityStatus) => void;
  getStudentById: (id: string) => Student | undefined;
  reset: () => void;
}

function actor() {
  const s = useAuthStore.getState().session;
  return {
    performedBy: s?.name ?? "نظام",
    performedByRole: s?.role,
  };
}

export const useStudentsStore = create<StudentsState>()(
  persist(
    (set, get) => ({
      students: seedStudents,
      addStudent: (input) => {
        const student: Student = {
          ...input,
          id: generateId("stu"),
          joinedAt: new Date().toISOString(),
          progress: input.progress ?? 0,
        };
        set((s) => ({ students: [student, ...s.students] }));
        logActivity({
          action: "CREATE",
          entity: "student",
          entityId: student.id,
          description: `تم إنشاء طالب: ${student.firstName} ${student.lastName}`,
          ...actor(),
        });
        return student;
      },
      updateStudent: (id, patch) => {
        set((s) => ({
          students: s.students.map((st) =>
            st.id === id ? { ...st, ...patch } : st
          ),
        }));
        const st = get().getStudentById(id);
        logActivity({
          action: "UPDATE",
          entity: "student",
          entityId: id,
          description: `تم تعديل الطالب: ${st ? `${st.firstName} ${st.lastName}` : id}`,
          ...actor(),
        });
      },
      deleteStudent: (id) => {
        const st = get().getStudentById(id);
        set((s) => ({ students: s.students.filter((x) => x.id !== id) }));
        logActivity({
          action: "DELETE",
          entity: "student",
          entityId: id,
          description: `تم حذف الطالب: ${st ? `${st.firstName} ${st.lastName}` : id}`,
          ...actor(),
        });
      },
      deleteMany: (ids) => {
        ids.forEach((id) => get().deleteStudent(id));
      },
      setStudentStatus: (id, status) => {
        get().updateStudent(id, { status });
        logActivity({
          action: "STATUS_CHANGE",
          entity: "student",
          entityId: id,
          description: `تغيير حالة الطالب إلى ${status}`,
          ...actor(),
        });
      },
      bulkSetStatus: (ids, status) => {
        ids.forEach((id) => get().setStudentStatus(id, status));
      },
      getStudentById: (id) => get().students.find((s) => s.id === id),
      reset: () => set({ students: seedStudents }),
    }),
    {
      name: "silent-hope-students",
      storage: createAppStorage(),
      merge: (persisted, current) => {
        const p = (persisted ?? {}) as Partial<StudentsState>;
        const saved = p.students ?? [];
        const extras = saved.filter((s) => !SEED_IDS.has(s.id));
        const mergedSeed = seedStudents.map((seed) => {
          const prev = saved.find((s) => s.id === seed.id);
          if (!prev) return seed;
          return {
            ...seed,
            progress: prev.progress,
            status: prev.status,
          };
        });
        return {
          ...current,
          ...p,
          students: [...mergedSeed, ...extras],
        };
      },
    }
  )
);
