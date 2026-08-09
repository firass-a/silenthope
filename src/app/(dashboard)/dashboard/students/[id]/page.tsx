"use client";

import { use, useMemo } from "react";
import Link from "next/link";
import { ArrowRight, Mail, Phone, GraduationCap } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { StatusBadge } from "@/components/shared/status-badge";
import { EmptyState } from "@/components/shared/empty-state";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { useStudentsStore } from "@/stores/students.store";
import {
  useTalentsByStudent,
  useSubscriptionsByStudent,
} from "@/hooks/use-stable-store";
import { formatDate, getInitials } from "@/lib/utils";

export default function StudentProfilePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const students = useStudentsStore((s) => s.students);
  const student = useMemo(() => students.find((s) => s.id === id), [students, id]);
  const talents = useTalentsByStudent(id);
  const subscriptions = useSubscriptionsByStudent(id);

  if (!student) {
    return (
      <EmptyState
        title="الطالب غير موجود"
        description="لم يتم العثور على هذا الطالب"
        actionLabel="العودة للقائمة"
        onAction={() => window.history.back()}
      />
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title={`${student.firstName} ${student.lastName}`}
        description="ملف الطالب الكامل"
        badge={<StatusBadge status={student.status} />}
        actions={
          <Button variant="outline" asChild>
            <Link href="/dashboard/students">
              <ArrowRight className="size-4" />
              العودة
            </Link>
          </Button>
        }
      />

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-1">
          <CardContent className="flex flex-col items-center gap-4 pt-6">
            <Avatar className="size-24 text-xl">
              <AvatarFallback>{getInitials(`${student.firstName} ${student.lastName}`)}</AvatarFallback>
            </Avatar>
            <div className="text-center">
              <h2 className="text-xl font-bold">
                {student.firstName} {student.lastName}
              </h2>
              <p className="text-sm text-muted-foreground">{student.major}</p>
            </div>
            <div className="w-full space-y-2 text-sm">
              <div className="flex items-center gap-2">
                <Mail className="size-4 text-muted-foreground" />
                {student.email}
              </div>
              <div className="flex items-center gap-2">
                <Phone className="size-4 text-muted-foreground" />
                {student.phone}
              </div>
              <div className="flex items-center gap-2">
                <GraduationCap className="size-4 text-muted-foreground" />
                {student.university} — {student.faculty}
              </div>
            </div>
            <div className="w-full space-y-2">
              <div className="flex justify-between text-sm">
                <span>التقدم</span>
                <span>{student.progress}%</span>
              </div>
              <Progress value={student.progress} />
            </div>
            <p className="text-xs text-muted-foreground">
              انضم في {formatDate(student.joinedAt)}
            </p>
          </CardContent>
        </Card>

        <div className="space-y-6 lg:col-span-2">
          {student.bio ? (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">نبذة</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm leading-relaxed">{student.bio}</p>
              </CardContent>
            </Card>
          ) : null}

          <Card>
            <CardHeader>
              <CardTitle className="text-base">المواهب ({talents.length})</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {talents.length === 0 ? (
                <p className="text-sm text-muted-foreground">لا توجد مواهب مسجّلة</p>
              ) : (
                talents.map((t) => (
                  <Link
                    key={t.id}
                    href={`/dashboard/talents/${t.id}`}
                    className="flex items-center justify-between rounded-xl border p-3 transition-colors hover:bg-muted/40"
                  >
                    <div>
                      <p className="font-medium">{t.title}</p>
                      <p className="text-xs text-muted-foreground">{formatDate(t.createdAt)}</p>
                    </div>
                    <StatusBadge status={t.status} />
                  </Link>
                ))
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">الاشتراكات ({subscriptions.length})</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {subscriptions.length === 0 ? (
                <p className="text-sm text-muted-foreground">لا توجد اشتراكات</p>
              ) : (
                subscriptions.map((sub) => (
                  <div
                    key={sub.id}
                    className="flex items-center justify-between rounded-xl border p-3"
                  >
                    <div>
                      <p className="font-medium">
                        <StatusBadge status={sub.plan} />
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {formatDate(sub.startDate)} — {formatDate(sub.endDate)}
                      </p>
                    </div>
                    <div className="text-left">
                      <p className="font-medium">{sub.price} د.ج</p>
                      <StatusBadge status={sub.status} />
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
