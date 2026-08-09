"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { StudentHeader } from "@/components/brand/student-header";
import { PageSkeleton } from "@/components/shared/loading-skeleton";
import { useAuthStore } from "@/stores/auth.store";
import { isStaffRole } from "@/lib/permissions";

export default function StudentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const session = useAuthStore((s) => s.session);
  const hydrated = useAuthStore((s) => s.hydrated);

  useEffect(() => {
    if (!hydrated) return;
    if (!session) {
      router.replace("/login");
      return;
    }
    if (isStaffRole(session.role)) {
      router.replace("/admin");
    }
  }, [hydrated, session, router]);

  if (!hydrated || !session || isStaffRole(session.role)) {
    return <PageSkeleton />;
  }

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
