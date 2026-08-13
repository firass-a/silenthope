"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Lesson, LessonStatus } from "@/types";
import { seedLessons } from "@/data/seed";
import { createAppStorage } from "@/lib/app-storage";
import { generateId } from "@/lib/utils";
import { logActivity } from "@/stores/activity.store";
import { useAuthStore } from "@/stores/auth.store";

type LessonInput = Omit<Lesson, "id" | "createdAt" | "updatedAt">;

interface LessonsState {
  lessons: Lesson[];
  addLesson: (input: LessonInput) => Lesson;
  updateLesson: (id: string, patch: Partial<Lesson>) => void;
  deleteLesson: (id: string) => void;
  deleteMany: (ids: string[]) => void;
  setLessonStatus: (id: string, status: LessonStatus) => void;
  publishLesson: (id: string) => void;
  unpublishLesson: (id: string) => void;
  getLessonById: (id: string) => Lesson | undefined;
  getByCourse: (courseId: string) => Lesson[];
  reset: () => void;
}

function actor() {
  const s = useAuthStore.getState().session;
  return { performedBy: s?.name ?? "نظام", performedByRole: s?.role };
}

export const useLessonsStore = create<LessonsState>()(
  persist(
    (set, get) => ({
      lessons: seedLessons,
      addLesson: (input) => {
        const now = new Date().toISOString();
        const lesson: Lesson = {
          ...input,
          id: generateId("lesson"),
          createdAt: now,
          updatedAt: now,
        };
        set((s) => ({ lessons: [lesson, ...s.lessons] }));
        logActivity({
          action: "CREATE",
          entity: "lesson",
          entityId: lesson.id,
          description: `تم إنشاء درس: ${lesson.title}`,
          ...actor(),
        });
        return lesson;
      },
      updateLesson: (id, patch) => {
        set((s) => ({
          lessons: s.lessons.map((l) =>
            l.id === id
              ? { ...l, ...patch, updatedAt: new Date().toISOString() }
              : l
          ),
        }));
        const l = get().getLessonById(id);
        logActivity({
          action: "UPDATE",
          entity: "lesson",
          entityId: id,
          description: `تم تعديل الدرس: ${l?.title ?? id}`,
          ...actor(),
        });
      },
      deleteLesson: (id) => {
        const l = get().getLessonById(id);
        set((s) => ({ lessons: s.lessons.filter((x) => x.id !== id) }));
        logActivity({
          action: "DELETE",
          entity: "lesson",
          entityId: id,
          description: `تم حذف الدرس: ${l?.title ?? id}`,
          ...actor(),
        });
      },
      deleteMany: (ids) => ids.forEach((id) => get().deleteLesson(id)),
      setLessonStatus: (id, status) => {
        const patch: Partial<Lesson> = { status };
        if (status === "published") patch.publishedAt = new Date().toISOString();
        get().updateLesson(id, patch);
        logActivity({
          action: "STATUS_CHANGE",
          entity: "lesson",
          entityId: id,
          description: `تغيير حالة الدرس إلى ${status}`,
          ...actor(),
        });
      },
      publishLesson: (id) => {
        get().updateLesson(id, {
          status: "published",
          publishedAt: new Date().toISOString(),
        });
        const l = get().getLessonById(id);
        logActivity({
          action: "PUBLISH",
          entity: "lesson",
          entityId: id,
          description: `تم نشر الدرس: ${l?.title ?? id}`,
          ...actor(),
        });
      },
      unpublishLesson: (id) => {
        get().updateLesson(id, { status: "draft" });
        const l = get().getLessonById(id);
        logActivity({
          action: "UNPUBLISH",
          entity: "lesson",
          entityId: id,
          description: `تم إلغاء نشر الدرس: ${l?.title ?? id}`,
          ...actor(),
        });
      },
      getLessonById: (id) => get().lessons.find((l) => l.id === id),
      getByCourse: (courseId) =>
        get().lessons.filter((l) => l.courseId === courseId),
      reset: () => set({ lessons: seedLessons }),
    }),
    {
      name: "silent-hope-lessons",
      storage: createAppStorage(),
    }
  )
);
