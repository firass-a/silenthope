"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Bell, CheckCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Section, SectionHeading } from "@/components/brand/section";
import { useAuthStore } from "@/stores/auth.store";
import { useNotificationsStore } from "@/stores/notifications.store";
import { cn, formatDateTime } from "@/lib/utils";

export default function MeNotificationsPage() {
  const router = useRouter();
  const session = useAuthStore((s) => s.session);
  const notifications = useNotificationsStore((s) => s.notifications);
  const markRead = useNotificationsStore((s) => s.markRead);
  const markAllRead = useNotificationsStore((s) => s.markAllRead);

  useEffect(() => {
    if (!session) router.replace("/login");
  }, [session, router]);

  if (!session) return null;

  const mine = notifications.filter(
    (n) =>
      n.recipient === session.name ||
      n.recipient === session.email ||
      n.recipient === "الكل" ||
      n.recipient === "students"
  );

  return (
    <Section>
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <SectionHeading
          className="mb-0"
          eyebrow="تنبيهات بصرية"
          title="إشعاراتي"
          description="كل التحديثات تظهر هنا كنص وحالة بصرية — بدون اعتماد على الصوت."
        />
        <Button variant="outline" onClick={() => markAllRead()}>
          <CheckCheck /> تعليم الكل كمقروء
        </Button>
      </div>

      <ul className="mt-10 space-y-3">
        {mine.length === 0 ? (
          <li className="rounded-3xl border border-dashed border-border p-10 text-center text-muted-foreground">
            <Bell className="mx-auto mb-3 size-8 opacity-40" />
            لا توجد إشعارات حالياً
          </li>
        ) : (
          mine.map((n) => (
            <li key={n.id}>
              <button
                type="button"
                onClick={() => markRead(n.id)}
                className={cn(
                  "flex w-full items-start gap-4 rounded-3xl border px-5 py-4 text-start transition",
                  n.read
                    ? "border-border/50 bg-card"
                    : "border-brand-300 bg-brand-50/70"
                )}
              >
                <span
                  className={cn(
                    "mt-1 size-2.5 shrink-0 rounded-full",
                    n.type === "success" && "bg-success",
                    n.type === "warning" && "bg-warning",
                    n.type === "info" && "bg-info",
                    n.type === "system" && "bg-primary"
                  )}
                  aria-hidden
                />
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-bold">{n.title}</p>
                    {!n.read ? (
                      <span className="rounded-full bg-primary px-2 py-0.5 text-[10px] font-semibold text-primary-foreground">
                        جديد
                      </span>
                    ) : null}
                  </div>
                  <p className="mt-1 text-sm text-muted-foreground">{n.message}</p>
                  <p className="mt-2 text-xs text-muted-foreground">
                    {formatDateTime(n.createdAt)}
                  </p>
                </div>
              </button>
            </li>
          ))
        )}
      </ul>
    </Section>
  );
}
