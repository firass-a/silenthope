"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { PageSkeleton } from "@/components/shared/loading-skeleton";
import { useAuthStore } from "@/stores/auth.store";
import { isStaffRole } from "@/lib/permissions";

/** Legacy /dashboard → /admin (staff) or student surfaces */
export default function DashboardRedirectLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const session = useAuthStore((s) => s.session);
  const hydrated = useAuthStore((s) => s.hydrated);

  useEffect(() => {
    if (!hydrated) return;
    if (!session) {
      router.replace("/login");
      return;
    }
    if (!isStaffRole(session.role)) {
      const map: Record<string, string> = {
        "/dashboard": "/home",
        "/dashboard/my-learning": "/learn",
        "/dashboard/my-talents": "/me/talents",
        "/dashboard/my-profile": session.studentId
          ? `/students/${session.studentId}`
          : "/me",
        "/dashboard/my-notifications": "/me/notifications",
      };
      router.replace(map[pathname] ?? "/home");
      return;
    }
    const next = pathname.replace(/^\/dashboard/, "/admin");
    router.replace(next || "/admin");
  }, [hydrated, session, pathname, router]);

  return <PageSkeleton />;
}
