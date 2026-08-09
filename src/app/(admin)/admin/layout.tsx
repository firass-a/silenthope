"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AuthGuard } from "@/components/layout/auth-guard";
import { DashboardSidebar } from "@/components/layout/dashboard-sidebar";
import { DashboardTopbar } from "@/components/layout/dashboard-topbar";
import { GlobalSearch } from "@/components/shared/global-search";
import { PageSkeleton } from "@/components/shared/loading-skeleton";
import { cn } from "@/lib/utils";
import { useSettingsStore } from "@/stores/settings.store";
import { useAuthStore } from "@/stores/auth.store";
import { isStaffRole } from "@/lib/permissions";

function StaffOnly({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const session = useAuthStore((s) => s.session);

  useEffect(() => {
    if (session && !isStaffRole(session.role)) {
      router.replace("/learn");
    }
  }, [session, router]);

  if (!session || !isStaffRole(session.role)) {
    return <PageSkeleton />;
  }

  return <>{children}</>;
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const behavior = useSettingsStore((s) => s.settings.sidebarBehavior);
  const [collapsed, setCollapsed] = useState(behavior === "collapsed");

  return (
    <AuthGuard>
      <StaffOnly>
        <div className="flex min-h-screen bg-background">
          <div className="hidden lg:block">
            <div className="sticky top-0 h-screen">
              <DashboardSidebar collapsed={collapsed} />
            </div>
          </div>

          {mobileOpen ? (
            <div className="fixed inset-0 z-50 lg:hidden">
              <button
                type="button"
                className="absolute inset-0 bg-black/40"
                aria-label="إغلاق القائمة"
                onClick={() => setMobileOpen(false)}
              />
              <div className="absolute inset-y-0 right-0 w-72 shadow-xl">
                <DashboardSidebar onNavigate={() => setMobileOpen(false)} />
              </div>
            </div>
          ) : null}

          <div className={cn("flex min-w-0 flex-1 flex-col")}>
            <DashboardTopbar
              onMenuClick={() => setMobileOpen(true)}
              onSearchClick={() => setSearchOpen(true)}
              collapsed={collapsed}
              onToggleCollapse={() => setCollapsed((v) => !v)}
            />
            <div className="flex-1 p-4 md:p-6">{children}</div>
          </div>
        </div>
        <GlobalSearch open={searchOpen} onOpenChange={setSearchOpen} />
      </StaffOnly>
    </AuthGuard>
  );
}
