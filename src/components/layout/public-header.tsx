"use client";

import Link from "next/link";
import { useState } from "react";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { publicNav } from "@/lib/nav";
import { cn } from "@/lib/utils";

export function PublicHeader() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-border/60 bg-background/85 backdrop-blur-md">
      <div className="container mx-auto flex h-20 items-center justify-between gap-4 px-4 md:px-6">
        <Link href="/" className="flex items-center gap-3">
          <div className="flex size-11 items-center justify-center rounded-2xl gradient-hero text-sm font-bold text-primary-foreground shadow-sm">
            ش
          </div>
          <div className="leading-tight">
            <p className="text-base font-bold">الأمل الصامت</p>
            <p className="text-xs text-muted-foreground">نَسمع بالعين ونتعلّم بالعقل</p>
          </div>
        </Link>

        <nav className="hidden items-center gap-1 lg:flex" aria-label="التنقل الرئيسي">
          {publicNav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="rounded-lg px-3 py-2 text-sm text-muted-foreground transition hover:bg-secondary hover:text-foreground"
            >
              {item.title}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-2 lg:flex">
          <Button asChild variant="outline" size="sm">
            <Link href="/login">دخول الإدارة</Link>
          </Button>
          <Button asChild size="sm" variant="accent">
            <Link href="/login">فضاء الطالب</Link>
          </Button>
        </div>

        <Button
          variant="outline"
          size="icon"
          className="lg:hidden"
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
        <nav className="container mx-auto flex flex-col gap-1 px-4 py-3" aria-label="قائمة الجوال">
          {publicNav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setOpen(false)}
              className="rounded-lg px-3 py-2 text-sm hover:bg-secondary"
            >
              {item.title}
            </Link>
          ))}
          <div className="mt-2 flex gap-2">
            <Button asChild variant="outline" className="flex-1">
              <Link href="/login">دخول</Link>
            </Button>
          </div>
        </nav>
      </div>
    </header>
  );
}
