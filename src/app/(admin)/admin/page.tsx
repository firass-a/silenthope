"use client";

import Link from "next/link";
import {
  Flag,
  GraduationCap,
  Plus,
  Sparkles,
  Users,
} from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/stores/auth.store";
import { useStudentsStore } from "@/stores/students.store";
import { useLessonsStore } from "@/stores/lessons.store";
import { useTalentsStore } from "@/stores/talents.store";
import { useActivityStore } from "@/stores/activity.store";
import { formatDateTime } from "@/lib/utils";

export default function AdminHomePage() {
  const session = useAuthStore((s) => s.session);
  const students = useStudentsStore((s) => s.students);
  const lessons = useLessonsStore((s) => s.lessons);
  const talents = useTalentsStore((s) => s.talents);
  const activity = useActivityStore((s) => s.logs);

  const pendingTalents = talents.filter((t) => t.status === "pending").length;
  const pendingLessons = lessons.filter((l) => l.status === "pending_review").length;
  const activeStudents = students.filter((s) => s.status === "active").length;
  const publishedLessons = lessons.filter((l) => l.status === "published").length;

  const metrics = [
    {
      label: "مواهب قيد المراجعة",
      value: pendingTalents,
      href: "/admin/talents?status=pending",
      icon: Sparkles,
    },
    {
      label: "محتوى بانتظار النشر",
      value: pendingLessons,
      href: "/admin/lessons?status=pending_review",
      icon: Flag,
    },
    {
      label: "طلبة نشطون",
      value: activeStudents,
      href: "/admin/students",
      icon: Users,
    },
    {
      label: "دروس منشورة",
      value: publishedLessons,
      href: "/admin/lessons",
      icon: GraduationCap,
    },
  ];

  return (
    <div className="space-y-10">
      <PageHeader
        title="إدارة المنصة"
        description={`مرحباً ${session?.name ?? ""} — صحة المنصة والمراجعات العاجلة.`}
        actions={
          <div className="flex flex-wrap gap-2">
            <Button asChild size="sm">
              <Link href="/admin/lessons">
                <Plus /> درس جديد
              </Link>
            </Button>
            <Button asChild size="sm" variant="outline">
              <Link href="/admin/talents?status=pending">مراجعة المواهب</Link>
            </Button>
          </div>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {metrics.map((m) => {
          const Icon = m.icon;
          return (
            <Link
              key={m.label}
              href={m.href}
              className="rounded-3xl border border-border/60 bg-card p-5 transition hover:border-brand-300"
            >
              <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground">{m.label}</p>
                <Icon className="size-4 text-brand-600" />
              </div>
              <p className="mt-3 text-3xl font-bold">{m.value}</p>
            </Link>
          );
        })}
      </div>

      <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
        <section>
          <h2 className="text-lg font-bold">آخر النشاط</h2>
          <ol className="mt-4 space-y-0 border-s border-border/70 ms-3">
            {activity.slice(0, 8).map((log) => (
              <li key={log.id} className="relative ps-6 pb-5">
                <span className="absolute start-[-5px] top-1.5 size-2.5 rounded-full bg-primary" />
                <p className="text-sm font-medium">{log.description}</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {log.performedBy} · {formatDateTime(log.timestamp)}
                </p>
              </li>
            ))}
          </ol>
        </section>

        <section className="rounded-[1.75rem] gradient-mist p-6">
          <h2 className="text-lg font-bold">إجراءات سريعة</h2>
          <div className="mt-4 flex flex-col gap-2">
            <Button asChild variant="outline" className="justify-start">
              <Link href="/admin/courses">مكتبة المواد</Link>
            </Button>
            <Button asChild variant="outline" className="justify-start">
              <Link href="/admin/talents">مكتبة المواهب</Link>
            </Button>
            <Button asChild variant="outline" className="justify-start">
              <Link href="/admin/activity">سجل العمليات</Link>
            </Button>
            <Button asChild variant="outline" className="justify-start">
              <Link href="/learn">معاينة تجربة الطالب</Link>
            </Button>
          </div>
        </section>
      </div>
    </div>
  );
}
