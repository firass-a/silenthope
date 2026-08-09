"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { StudentLearningState } from "@/types";
import { createSessionStorage } from "@/lib/session-storage";

interface LearningState {
  byStudentId: Record<string, StudentLearningState>;
  ensureStudent: (studentId: string) => StudentLearningState;
  setLessonProgress: (
    studentId: string,
    courseId: string,
    lessonId: string,
    percent: number,
    completed?: boolean
  ) => void;
  markLessonComplete: (
    studentId: string,
    courseId: string,
    lessonId: string
  ) => void;
  getCourseProgress: (studentId: string, courseId: string, lessonIds: string[]) => number;
  getContinue: (
    studentId: string
  ) => { courseId?: string; lessonId?: string } | null;
}

function empty(studentId: string): StudentLearningState {
  return { studentId, lessons: {} };
}

export const useLearningStore = create<LearningState>()(
  persist(
    (set, get) => ({
      byStudentId: {
        // Demo student continues business course mid-way
        stu_001: {
          studentId: "stu_001",
          lastCourseId: "course_001",
          lastLessonId: "lesson_002",
          lessons: {
            lesson_001: {
              lessonId: "lesson_001",
              courseId: "course_001",
              percent: 100,
              completed: true,
              updatedAt: new Date().toISOString(),
            },
            lesson_002: {
              lessonId: "lesson_002",
              courseId: "course_001",
              percent: 72,
              completed: false,
              updatedAt: new Date().toISOString(),
            },
          },
        },
      },
      ensureStudent: (studentId) => {
        const existing = get().byStudentId[studentId];
        if (existing) return existing;
        const created = empty(studentId);
        set((s) => ({
          byStudentId: { ...s.byStudentId, [studentId]: created },
        }));
        return created;
      },
      setLessonProgress: (studentId, courseId, lessonId, percent, completed) => {
        set((s) => {
          const current = s.byStudentId[studentId] ?? empty(studentId);
          const done = completed ?? percent >= 100;
          return {
            byStudentId: {
              ...s.byStudentId,
              [studentId]: {
                ...current,
                lastCourseId: courseId,
                lastLessonId: lessonId,
                lessons: {
                  ...current.lessons,
                  [lessonId]: {
                    lessonId,
                    courseId,
                    percent: Math.min(100, Math.max(0, percent)),
                    completed: done,
                    updatedAt: new Date().toISOString(),
                  },
                },
              },
            },
          };
        });
      },
      markLessonComplete: (studentId, courseId, lessonId) => {
        get().setLessonProgress(studentId, courseId, lessonId, 100, true);
      },
      getCourseProgress: (studentId, courseId, lessonIds) => {
        if (lessonIds.length === 0) return 0;
        const state = get().byStudentId[studentId];
        if (!state) return 0;
        const sum = lessonIds.reduce((acc, id) => {
          return acc + (state.lessons[id]?.percent ?? 0);
        }, 0);
        return Math.round(sum / lessonIds.length);
      },
      getContinue: (studentId) => {
        const state = get().byStudentId[studentId];
        if (!state?.lastCourseId) return null;
        return { courseId: state.lastCourseId, lessonId: state.lastLessonId };
      },
    }),
    {
      name: "silent-hope-learning",
      storage: createSessionStorage(),
    }
  )
);
