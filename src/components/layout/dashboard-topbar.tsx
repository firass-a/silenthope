"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Bell, LogOut, Menu, PanelLeftClose, PanelLeftOpen, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuthStore } from "@/stores/auth.store";
import { useNotificationsStore } from "@/stores/notifications.store";
import { ROLE_LABELS } from "@/lib/permissions";
import { getInitials } from "@/lib/utils";

interface DashboardTopbarProps {
  onMenuClick: () => void;
  onSearchClick: () => void;
  collapsed: boolean;
  onToggleCollapse: () => void;
}

export function DashboardTopbar({
  onMenuClick,
  onSearchClick,
  collapsed,
  onToggleCollapse,
}: DashboardTopbarProps) {
  const router = useRouter();
  const session = useAuthStore((s) => s.session);
  const logout = useAuthStore((s) => s.logout);
  const unread = useNotificationsStore(
    (s) => s.notifications.filter((n) => !n.read).length
  );

  return (
    <header className="sticky top-0 z-40 flex h-16 items-center justify-between gap-3 border-b bg-background/90 px-4 backdrop-blur-md md:px-6">
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="icon"
          className="lg:hidden"
          onClick={onMenuClick}
          aria-label="فتح القائمة"
        >
          <Menu />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="hidden lg:inline-flex"
          onClick={onToggleCollapse}
          aria-label={collapsed ? "توسيع الشريط" : "طي الشريط"}
        >
          {collapsed ? <PanelLeftOpen /> : <PanelLeftClose />}
        </Button>
        <Button
          variant="outline"
          className="hidden min-w-[220px] justify-start gap-2 text-muted-foreground md:inline-flex"
          onClick={onSearchClick}
        >
          <Search className="size-4" />
          بحث سريع...
          <kbd className="mr-auto rounded border bg-muted px-1.5 text-[10px]">Ctrl K</kbd>
        </Button>
      </div>

      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="icon"
          className="relative md:hidden"
          onClick={onSearchClick}
          aria-label="بحث"
        >
          <Search />
        </Button>
        <Button asChild variant="ghost" size="icon" aria-label="الإشعارات">
          <Link href="/admin/notifications">
            <Bell />
            {unread > 0 ? (
              <span className="absolute top-1 left-1 flex size-4 items-center justify-center rounded-full bg-destructive text-[10px] text-destructive-foreground">
                {unread > 9 ? "9+" : unread}
              </span>
            ) : null}
          </Link>
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="gap-2 px-2">
              <Avatar className="size-8">
                <AvatarFallback>
                  {getInitials(session?.name ?? "م")}
                </AvatarFallback>
              </Avatar>
              <span className="hidden text-sm font-medium sm:inline">
                {session?.name}
              </span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-56">
            <DropdownMenuLabel>
              <div className="space-y-1">
                <p>{session?.name}</p>
                <p className="text-xs font-normal text-muted-foreground">
                  {session ? ROLE_LABELS[session.role] : ""}
                </p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            {session?.role !== "student" ? (
              <DropdownMenuItem asChild>
                <Link href="/admin/settings">الإعدادات</Link>
              </DropdownMenuItem>
            ) : null}
            <DropdownMenuItem asChild>
              <Link href="/">الموقع العام</Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              variant="destructive"
              onClick={() => {
                logout();
                router.push("/login");
              }}
            >
              <LogOut />
              تسجيل الخروج
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
