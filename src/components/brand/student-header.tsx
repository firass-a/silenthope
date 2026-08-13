"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { Bell, LogOut, Menu, User, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { studentAppNav } from "@/lib/nav";
import { cn, getInitials } from "@/lib/utils";
import { useAuthStore } from "@/stores/auth.store";
import { useNotificationsStore } from "@/stores/notifications.store";
import { ROLE_LABELS } from "@/lib/permissions";
import { BrandLogo } from "@/components/brand/brand-logo";

export function StudentHeader() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const session = useAuthStore((s) => s.session);
  const logout = useAuthStore((s) => s.logout);
  const notifications = useNotificationsStore((s) => s.notifications);
  const unread = useMemo(
    () => notifications.filter((n) => !n.read).length,
    [notifications]
  );

  return (
    <header className="sticky top-0 z-50 border-b border-border/50 bg-background/90 backdrop-blur-xl">
      <div className="container mx-auto flex h-[4.5rem] items-center justify-between gap-4 px-4 md:px-6">
        <Link href="/home" className="flex items-center">
          <BrandLogo
            priority
            withWordmark
            title="مساحتي"
            subtitle="فضاء الطالب — الأمل الصامت"
          />
        </Link>

        <nav
          className="hidden items-center gap-1 lg:flex"
          aria-label="تنقل الطالب"
        >
          {studentAppNav.map((item) => {
            const active =
              pathname === item.href ||
              (item.href !== "/home" && pathname.startsWith(item.href));
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "rounded-full px-3.5 py-2 text-sm transition",
                  active
                    ? "bg-primary font-semibold text-primary-foreground"
                    : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                )}
              >
                {item.title}
              </Link>
            );
          })}
        </nav>

        <div className="hidden items-center gap-2 lg:flex">
          <Button asChild variant="ghost" size="icon" aria-label="الإشعارات">
            <Link href="/me/notifications" className="relative">
              <Bell className="size-4" />
              {unread > 0 ? (
                <span className="absolute -top-0.5 -start-0.5 flex size-4 items-center justify-center rounded-full bg-primary text-[10px] text-primary-foreground">
                  {unread > 9 ? "9+" : unread}
                </span>
              ) : null}
            </Link>
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="gap-2 rounded-full pe-3 ps-1.5">
                <Avatar className="size-7">
                  <AvatarFallback className="bg-brand-100 text-xs text-brand-800">
                    {getInitials(session?.name ?? "ط")}
                  </AvatarFallback>
                </Avatar>
                <span className="max-w-[8rem] truncate text-sm">
                  {session?.name}
                </span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-56">
              <DropdownMenuLabel>
                <p>{session?.name}</p>
                <p className="text-xs font-normal text-muted-foreground">
                  {session ? ROLE_LABELS[session.role] : ""}
                </p>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link
                  href={
                    session?.studentId
                      ? `/students/${session.studentId}`
                      : "/me"
                  }
                >
                  <User /> ملفي
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/">تصفّح الموقع العام</Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                variant="destructive"
                onClick={() => {
                  logout();
                  router.push("/");
                }}
              >
                <LogOut /> تسجيل الخروج
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <Button
          variant="outline"
          size="icon"
          className="rounded-full lg:hidden"
          onClick={() => setOpen((v) => !v)}
          aria-label={open ? "إغلاق القائمة" : "فتح القائمة"}
        >
          {open ? <X /> : <Menu />}
        </Button>
      </div>

      <div
        className={cn(
          "border-t bg-background lg:hidden",
          open ? "block" : "hidden"
        )}
      >
        <nav
          className="container mx-auto flex flex-col gap-1 px-4 py-3"
          aria-label="قائمة الطالب"
        >
          {studentAppNav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setOpen(false)}
              className="rounded-xl px-3 py-2.5 text-sm hover:bg-secondary"
            >
              {item.title}
            </Link>
          ))}
          <Button
            variant="outline"
            className="mt-2"
            onClick={() => {
              logout();
              router.push("/");
              setOpen(false);
            }}
          >
            تسجيل الخروج
          </Button>
        </nav>
      </div>
    </header>
  );
}
