"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
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
import { publicNav } from "@/lib/nav";
import { cn, getInitials } from "@/lib/utils";
import { useAuthStore } from "@/stores/auth.store";
import { useNotificationsStore } from "@/stores/notifications.store";
import { isStaffRole, ROLE_LABELS } from "@/lib/permissions";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { BrandLogo } from "@/components/brand/brand-logo";

export function SiteHeader() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const session = useAuthStore((s) => s.session);
  const logout = useAuthStore((s) => s.logout);
  const studentUnread = useNotificationsStore(
    (s) => s.notifications.filter((n) => !n.read).length
  );

  return (
    <header className="sticky top-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-xl">
      <div className="container mx-auto flex h-[4.5rem] items-center justify-between gap-4 px-4 md:px-6">
        <Link
          href={session?.role === "student" ? "/home" : "/"}
          className="flex items-center"
        >
          <BrandLogo
            priority
            withWordmark
            subtitle="نَسمع بالعين ونتعلّم بالعقل"
          />
        </Link>

        <nav className="hidden items-center gap-1 lg:flex" aria-label="التنقل الرئيسي">
          {publicNav.map((item) => {
            const active =
              pathname === item.href ||
              (item.href !== "/" && pathname.startsWith(item.href));
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "rounded-full px-3.5 py-2 text-sm transition",
                  active
                    ? "bg-brand-100 font-semibold text-brand-800"
                    : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                )}
              >
                {item.title}
              </Link>
            );
          })}
        </nav>

        <div className="hidden items-center gap-2 lg:flex">
          {session ? (
            <>
              {session.role === "student" ? (
                <Button asChild variant="ghost" size="icon" aria-label="الإشعارات">
                  <Link href="/me/notifications" className="relative">
                    <Bell className="size-4" />
                    {studentUnread > 0 ? (
                      <span className="absolute -top-0.5 -start-0.5 flex size-4 items-center justify-center rounded-full bg-primary text-[10px] text-primary-foreground">
                        {studentUnread > 9 ? "9+" : studentUnread}
                      </span>
                    ) : null}
                  </Link>
                </Button>
              ) : null}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="gap-2 rounded-full pe-3 ps-1.5">
                    <Avatar className="size-7">
                      <AvatarFallback className="bg-brand-100 text-xs text-brand-800">
                        {getInitials(session.name)}
                      </AvatarFallback>
                    </Avatar>
                    <span className="max-w-[8rem] truncate text-sm">{session.name}</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="w-56">
                  <DropdownMenuLabel>
                    <p>{session.name}</p>
                    <p className="text-xs font-normal text-muted-foreground">
                      {ROLE_LABELS[session.role]}
                    </p>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  {session.role === "student" ? (
                    <>
                      <DropdownMenuItem asChild>
                        <Link href={session.studentId ? `/students/${session.studentId}` : "/me"}>
                          <User /> ملفي
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link href="/me/talents">مواهبي</Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link href="/learn">مساحة التعلّم</Link>
                      </DropdownMenuItem>
                    </>
                  ) : (
                    <DropdownMenuItem asChild>
                      <Link href="/admin">لوحة الإدارة</Link>
                    </DropdownMenuItem>
                  )}
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
            </>
          ) : (
            <>
              <Button asChild variant="ghost" size="sm" className="rounded-full">
                <Link href="/login">دخول</Link>
              </Button>
              <Button asChild size="sm" className="rounded-full">
                <Link href="/register">إنشاء حساب</Link>
              </Button>
            </>
          )}
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

      <div className={cn("border-t bg-background lg:hidden", open ? "block" : "hidden")}>
        <nav className="container mx-auto flex flex-col gap-1 px-4 py-3" aria-label="قائمة الجوال">
          {publicNav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setOpen(false)}
              className="rounded-xl px-3 py-2.5 text-sm hover:bg-secondary"
            >
              {item.title}
            </Link>
          ))}
          <div className="mt-2 flex gap-2">
            {session ? (
              <>
                {isStaffRole(session.role) ? (
                  <Button asChild className="flex-1 rounded-full">
                    <Link href="/admin" onClick={() => setOpen(false)}>
                      الإدارة
                    </Link>
                  </Button>
                ) : (
                  <Button asChild className="flex-1 rounded-full">
                    <Link href="/learn" onClick={() => setOpen(false)}>
                      تعلّمي
                    </Link>
                  </Button>
                )}
              </>
            ) : (
              <>
                <Button asChild variant="outline" className="flex-1 rounded-full">
                  <Link href="/login" onClick={() => setOpen(false)}>
                    دخول
                  </Link>
                </Button>
                <Button asChild className="flex-1 rounded-full">
                  <Link href="/register" onClick={() => setOpen(false)}>
                    حساب جديد
                  </Link>
                </Button>
              </>
            )}
          </div>
        </nav>
      </div>
    </header>
  );
}
