"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Category } from "@/types";
import { seedCategories } from "@/data/seed";
import { createSessionStorage } from "@/lib/session-storage";
import { generateId } from "@/lib/utils";
import { logActivity } from "@/stores/activity.store";
import { useAuthStore } from "@/stores/auth.store";

type CategoryInput = Omit<Category, "id" | "createdAt" | "updatedAt">;

interface CategoriesState {
  categories: Category[];
  addCategory: (input: CategoryInput) => Category;
  updateCategory: (id: string, patch: Partial<Category>) => void;
  deleteCategory: (id: string) => void;
  deleteMany: (ids: string[]) => void;
  getCategoryById: (id: string) => Category | undefined;
  getByType: (type: Category["type"]) => Category[];
  reset: () => void;
}

function actor() {
  const s = useAuthStore.getState().session;
  return { performedBy: s?.name ?? "نظام", performedByRole: s?.role };
}

export const useCategoriesStore = create<CategoriesState>()(
  persist(
    (set, get) => ({
      categories: seedCategories,
      addCategory: (input) => {
        const now = new Date().toISOString();
        const category: Category = {
          ...input,
          id: generateId("cat"),
          createdAt: now,
          updatedAt: now,
        };
        set((s) => ({ categories: [category, ...s.categories] }));
        logActivity({
          action: "CREATE",
          entity: "category",
          entityId: category.id,
          description: `تم إنشاء تصنيف: ${category.name}`,
          ...actor(),
        });
        return category;
      },
      updateCategory: (id, patch) => {
        set((s) => ({
          categories: s.categories.map((c) =>
            c.id === id
              ? { ...c, ...patch, updatedAt: new Date().toISOString() }
              : c
          ),
        }));
        const c = get().getCategoryById(id);
        logActivity({
          action: "UPDATE",
          entity: "category",
          entityId: id,
          description: `تم تعديل التصنيف: ${c?.name ?? id}`,
          ...actor(),
        });
      },
      deleteCategory: (id) => {
        const c = get().getCategoryById(id);
        set((s) => ({ categories: s.categories.filter((x) => x.id !== id) }));
        logActivity({
          action: "DELETE",
          entity: "category",
          entityId: id,
          description: `تم حذف التصنيف: ${c?.name ?? id}`,
          ...actor(),
        });
      },
      deleteMany: (ids) => ids.forEach((id) => get().deleteCategory(id)),
      getCategoryById: (id) => get().categories.find((c) => c.id === id),
      // Prefer useCategoriesByType() in components — never use this inside a Zustand selector
      getByType: (type) => get().categories.filter((c) => c.type === type),
      reset: () => set({ categories: seedCategories }),
    }),
    {
      name: "silent-hope-categories",
      storage: createSessionStorage(),
    }
  )
);
