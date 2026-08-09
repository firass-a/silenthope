"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { AuthSession, RegisterStudentInput, Role, UserAccount } from "@/types";
import { DEMO_PASSWORD, seedAccounts } from "@/data/seed";
import { createSessionStorage } from "@/lib/session-storage";
import { generateId } from "@/lib/utils";
import { logActivity } from "@/stores/activity.store";
import { useStudentsStore } from "@/stores/students.store";
import { usePreferencesStore } from "@/stores/preferences.store";
import { useLearningStore } from "@/stores/learning.store";

interface AuthState {
  session: AuthSession | null;
  hydrated: boolean;
  accounts: UserAccount[];
  login: (email: string, password: string) => { ok: boolean; message: string; role?: Role };
  logout: () => void;
  registerStudent: (
    input: RegisterStudentInput
  ) => { ok: boolean; message: string };
  setHydrated: (v: boolean) => void;
  getRole: () => Role | null;
}

function toSession(account: UserAccount): AuthSession {
  return {
    userId: account.id,
    email: account.email,
    name: account.name,
    role: account.role,
    avatar: account.avatar,
    studentId: account.studentId,
    agentId: account.agentId,
    loggedInAt: new Date().toISOString(),
  };
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      session: null,
      hydrated: false,
      accounts: seedAccounts,
      login: (email, password) => {
        const account = get().accounts.find(
          (a) => a.email.toLowerCase() === email.trim().toLowerCase()
        );
        if (!account || account.password !== password) {
          return { ok: false, message: "البريد أو كلمة المرور غير صحيحة" };
        }
        const session = toSession(account);
        set({ session });
        logActivity({
          action: "LOGIN",
          entity: "auth",
          entityId: account.id,
          description: `تسجيل دخول: ${account.name}`,
          performedBy: account.name,
          performedByRole: account.role,
        });
        return { ok: true, message: "تم تسجيل الدخول بنجاح", role: account.role };
      },
      logout: () => {
        const session = get().session;
        if (session) {
          logActivity({
            action: "LOGOUT",
            entity: "auth",
            entityId: session.userId,
            description: `تسجيل خروج: ${session.name}`,
            performedBy: session.name,
            performedByRole: session.role,
          });
        }
        set({ session: null });
      },
      registerStudent: (input) => {
        const email = input.email.trim().toLowerCase();
        if (get().accounts.some((a) => a.email.toLowerCase() === email)) {
          return { ok: false, message: "هذا البريد مسجّل مسبقاً" };
        }

        const student = useStudentsStore.getState().addStudent({
          firstName: input.firstName.trim(),
          lastName: input.lastName.trim(),
          email,
          phone: "",
          university: input.university,
          faculty: input.faculty,
          major: input.major,
          academicLevel: input.academicLevel,
          bio: "طالب جديد على منصة الأمل الصامت.",
          status: "active",
          progress: 0,
        });

        const account: UserAccount = {
          id: generateId("user"),
          email,
          password: input.password,
          name: `${input.firstName.trim()} ${input.lastName.trim()}`,
          role: "student",
          studentId: student.id,
        };

        usePreferencesStore.getState().setPreferences({
          userId: account.id,
          studentId: student.id,
          interests: input.interests,
          subjects: input.subjects,
          updatedAt: new Date().toISOString(),
        });

        useLearningStore.getState().ensureStudent(student.id);

        set((s) => ({
          accounts: [...s.accounts, account],
          session: toSession(account),
        }));

        logActivity({
          action: "CREATE",
          entity: "auth",
          entityId: account.id,
          description: `فتح حساب طالب: ${account.name}`,
          performedBy: account.name,
          performedByRole: "student",
        });

        return { ok: true, message: "تم إنشاء حسابك بنجاح" };
      },
      setHydrated: (v) => set({ hydrated: v }),
      getRole: () => get().session?.role ?? null,
    }),
    {
      name: "silent-hope-auth",
      storage: createSessionStorage(),
      onRehydrateStorage: () => (state) => {
        state?.setHydrated(true);
      },
      partialize: (s) => ({ session: s.session, accounts: s.accounts }),
      merge: (persisted, current) => {
        const p = (persisted ?? {}) as Partial<AuthState>;
        const seedEmails = new Set(seedAccounts.map((a) => a.email.toLowerCase()));
        const extra = (p.accounts ?? []).filter(
          (a) => !seedEmails.has(a.email.toLowerCase())
        );
        return {
          ...current,
          ...p,
          accounts: [...seedAccounts, ...extra],
        };
      },
    }
  )
);

export { DEMO_PASSWORD, seedAccounts };
