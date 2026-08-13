"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Course, CourseStatus } from "@/types";
import { seedCourses } from "@/data/seed";
import { createAppStorage } from "@/lib/app-storage";
import { generateId } from "@/lib/utils";
import { logActivity } from "@/stores/activity.store";
import { useAuthStore } from "@/stores/auth.store";

type CourseInput = Omit<Course, "id" | "createdAt" | "updatedAt" | "lessonIds"> & {
  lessonIds?: string[];
};

interface CoursesState {
  courses: Course[];
  addCourse: (input: CourseInput) => Course;
  updateCourse: (id: string, patch: Partial<Course>) => void;
  deleteCourse: (id: string) => void;
  deleteMany: (ids: string[]) => void;
  setCourseStatus: (id: string, status: CourseStatus) => void;
  getCourseById: (id: string) => Course | undefined;
  reset: () => void;
}

function actor() {
  const s = useAuthStore.getState().session;
  return { performedBy: s?.name ?? "نظام", performedByRole: s?.role };
}

export const useCoursesStore = create<CoursesState>()(
  persist(
    (set, get) => ({
      courses: seedCourses,
      addCourse: (input) => {
        const now = new Date().toISOString();
        const course: Course = {
          ...input,
          id: generateId("course"),
          lessonIds: input.lessonIds ?? [],
          createdAt: now,
          updatedAt: now,
        };
        set((s) => ({ courses: [course, ...s.courses] }));
        logActivity({
          action: "CREATE",
          entity: "course",
          entityId: course.id,
          description: `تم إنشاء مادة: ${course.title}`,
          ...actor(),
        });
        return course;
      },
      updateCourse: (id, patch) => {
        set((s) => ({
          courses: s.courses.map((c) =>
            c.id === id
              ? { ...c, ...patch, updatedAt: new Date().toISOString() }
              : c
          ),
        }));
        const c = get().getCourseById(id);
        logActivity({
          action: "UPDATE",
          entity: "course",
          entityId: id,
          description: `تم تعديل المادة: ${c?.title ?? id}`,
          ...actor(),
        });
      },
      deleteCourse: (id) => {
        const c = get().getCourseById(id);
        // Cascade via dynamic import to avoid circular deps
        void import("@/stores/lessons.store").then(({ useLessonsStore }) => {
          const lessons = useLessonsStore.getState();
          lessons.lessons
            .filter((l) => l.courseId === id)
            .forEach((l) => {
              lessons.updateLesson(l.id, { status: "archived" });
            });
        });
        set((s) => ({ courses: s.courses.filter((x) => x.id !== id) }));
        logActivity({
          action: "DELETE",
          entity: "course",
          entityId: id,
          description: `تم حذف المادة: ${c?.title ?? id} (تم أرشفة الدروس المرتبطة)`,
          ...actor(),
        });
      },
      deleteMany: (ids) => ids.forEach((id) => get().deleteCourse(id)),
      setCourseStatus: (id, status) => {
        get().updateCourse(id, { status });
        logActivity({
          action: status === "published" ? "PUBLISH" : "STATUS_CHANGE",
          entity: "course",
          entityId: id,
          description: `تغيير حالة المادة إلى ${status}`,
          ...actor(),
        });
      },
      getCourseById: (id) => get().courses.find((c) => c.id === id),
      reset: () => set({ courses: seedCourses }),
    }),
    {
      name: "silent-hope-courses",
      storage: createAppStorage(),
    }
  )
);
