"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { useAuthStore } from "@/stores/auth.store";
import { filterNavForRole } from "@/lib/nav";
import { cn } from "@/lib/utils";
import { ScrollArea } from "@/components/ui/scroll-area";

interface DashboardSidebarProps {
  collapsed?: boolean;
  onNavigate?: () => void;
}

/** Match path + query so sibling links like ?new=1 / ?view=lessons don't both highlight. */
function isNavActive(pathname: string, search: string, href: string): boolean {
  const [path, query = ""] = href.split("?");
  const current = new URLSearchParams(search);
  const wanted = new URLSearchParams(query);

  if (path === "/admin" || path === "/dashboard") {
    return pathname === path;
  }

  const pathMatch = pathname === path || pathname.startsWith(`${path}/`);
  if (!pathMatch) return false;

  if (wanted.size > 0) {
    for (const [key, value] of wanted.entries()) {
      if (current.get(key) !== value) return false;
    }
    return true;
  }

  // Plain path: inactive when the URL carries a query another nav sibling owns
  for (const key of current.keys()) {
    // Any explicit query on a sibling-style link means this plain item is not the target
    if (current.has(key)) return false;
  }

  return true;
}

function SidebarNav({
  collapsed,
  onNavigate,
}: {
  collapsed?: boolean;
  onNavigate?: () => void;
}) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const search = searchParams.toString();
  const role = useAuthStore((s) => s.session?.role) ?? "student";
  const groups = filterNavForRole(role);

  return (
    <ScrollArea className="flex-1 px-2 py-3">
      <nav aria-label="قائمة لوحة التحكم" className="space-y-5">
        {groups.map((group) => (
          <div key={group.title}>
            {!collapsed ? (
              <p className="mb-2 px-2 text-xs font-semibold tracking-wide text-muted-foreground">
                {group.title}
              </p>
            ) : null}
            <ul className="space-y-1">
              {group.items.map((item) => {
                const active = isNavActive(pathname, search, item.href);
                const Icon = item.icon;
                return (
                  <li key={item.href + item.title}>
                    <Link
                      href={item.href}
                      onClick={onNavigate}
                      title={item.title}
                      className={cn(
                        "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition",
                        active
                          ? "bg-sidebar-primary text-sidebar-primary-foreground shadow-sm"
                          : "hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                        collapsed && "justify-center px-2"
                      )}
                    >
                      <Icon className="size-4 shrink-0" aria-hidden />
                      {!collapsed ? <span>{item.title}</span> : null}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>
    </ScrollArea>
  );
}

export function DashboardSidebar({ collapsed, onNavigate }: DashboardSidebarProps) {
  return (
    <aside
      className={cn(
        "flex h-full flex-col border-l border-sidebar-border bg-sidebar text-sidebar-foreground",
        collapsed ? "w-[72px]" : "w-64"
      )}
    >
      <div className={cn("flex items-center gap-3 border-b border-sidebar-border p-4", collapsed && "justify-center")}>
        <Link
          href="/admin"
          className="flex size-10 shrink-0 items-center justify-center rounded-xl gradient-hero text-sm font-bold text-primary-foreground"
        >
          ش
        </Link>
        {!collapsed ? (
          <div className="min-w-0">
            <p className="truncate font-bold">الأمل الصامت</p>
            <p className="truncate text-xs text-muted-foreground">إدارة المنصة</p>
          </div>
        ) : null}
      </div>

      <Suspense fallback={<div className="flex-1" />}>
        <SidebarNav collapsed={collapsed} onNavigate={onNavigate} />
      </Suspense>
    </aside>
  );
}
