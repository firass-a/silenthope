"use client";

import { useMemo } from "react";
import { useCategoriesStore } from "@/stores/categories.store";
import { useTalentsStore } from "@/stores/talents.store";
import { useSubscriptionsStore } from "@/stores/subscriptions.store";
import { useLessonsStore } from "@/stores/lessons.store";
import type { CategoryType } from "@/types";

/** Never call store methods that return new arrays inside selectors — they break useSyncExternalStore. */
export function useCategoriesByType(type: CategoryType) {
  const categories = useCategoriesStore((s) => s.categories);
  return useMemo(
    () => categories.filter((c) => c.type === type),
    [categories, type]
  );
}

export function useTalentsByStudent(studentId: string) {
  const talents = useTalentsStore((s) => s.talents);
  return useMemo(
    () => talents.filter((t) => t.studentId === studentId),
    [talents, studentId]
  );
}

export function useSubscriptionsByStudent(studentId: string) {
  const subscriptions = useSubscriptionsStore((s) => s.subscriptions);
  return useMemo(
    () => subscriptions.filter((s) => s.studentId === studentId),
    [subscriptions, studentId]
  );
}

export function useLessonsByCourse(courseId: string) {
  const lessons = useLessonsStore((s) => s.lessons);
  return useMemo(
    () => lessons.filter((l) => l.courseId === courseId),
    [lessons, courseId]
  );
}

export function useEntityById<T extends { id: string }>(
  items: T[],
  id: string
): T | undefined {
  return useMemo(() => items.find((item) => item.id === id), [items, id]);
}
