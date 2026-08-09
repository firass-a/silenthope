"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { SiteHeader } from "@/components/brand/site-header";
import { SiteFooter } from "@/components/brand/site-footer";
import { StudentHeader } from "@/components/brand/student-header";
import { useAuthStore } from "@/stores/auth.store";
import { isStaffRole } from "@/lib/permissions";

/** Public marketing routes that logged-in students should leave for /home */
const STUDENT_HOME_REDIRECTS = new Set(["/"]);

export function AdaptiveShell({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const session = useAuthStore((s) => s.session);
  const hydrated = useAuthStore((s) => s.hydrated);

  const isStudent = Boolean(session && session.role === "student");
  const isStaff = Boolean(session && isStaffRole(session.role));

  useEffect(() => {
    if (!hydrated || !session) return;
    if (isStudent && STUDENT_HOME_REDIRECTS.has(pathname)) {
      router.replace("/home");
    }
  }, [hydrated, session, isStudent, pathname, router]);

  if (isStudent) {
    return (
      <div className="flex min-h-screen flex-col bg-background">
        <StudentHeader />
        <main className="flex-1">{children}</main>
        <footer className="border-t border-border/50 py-4 text-center text-xs text-muted-foreground">
          مساحتك التعليمية · الأمل الصامت
        </footer>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main className="flex-1">{children}</main>
      <SiteFooter />
      {isStaff && hydrated ? (
        <div className="fixed bottom-4 start-4 z-50">
          <a
            href="/admin"
            className="rounded-full bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow-lg"
          >
            لوحة الإدارة
          </a>
        </div>
      ) : null}
    </div>
  );
}
