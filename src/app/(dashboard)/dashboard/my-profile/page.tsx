"use client";

import { useMemo } from "react";
import { PageHeader } from "@/components/shared/page-header";
import { StatusBadge } from "@/components/shared/status-badge";
import { RoleGate } from "@/components/layout/role-gate";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { useAuthStore } from "@/stores/auth.store";
import { useStudentsStore } from "@/stores/students.store";
import { useSubscriptionsStore } from "@/stores/subscriptions.store";
import { formatDate, getInitials } from "@/lib/utils";

export default function MyProfilePage() {
  return (
    <RoleGate permission="view_own_learning">
      <MyProfileContent />
    </RoleGate>
  );
}

function MyProfileContent() {
  const session = useAuthStore((s) => s.session);
  const students = useStudentsStore((s) => s.students);
  const subscriptions = useSubscriptionsStore((s) => s.subscriptions);

  const student = useMemo(() => {
    if (session?.studentId) return students.find((s) => s.id === session.studentId);
    return students.find((s) => s.email === session?.email);
  }, [students, session]);

  const subs = useMemo(
    () => subscriptions.filter((s) => s.studentId === student?.id),
    [subscriptions, student]
  );

  if (!student) {
    return (
      <Card>
        <CardContent className="pt-6 text-sm text-muted-foreground">
          لم يتم ربط حساب الدخول بملف طالب.
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="ملفي الشخصي"
        description="بياناتك الأكاديمية وتقدّمك داخل المنصة"
      />
      <div className="grid gap-4 lg:grid-cols-[280px_1fr]">
        <Card>
          <CardContent className="flex flex-col items-center gap-3 pt-6 text-center">
            <Avatar className="size-20 text-xl">
              <AvatarFallback>
                {getInitials(`${student.firstName} ${student.lastName}`)}
              </AvatarFallback>
            </Avatar>
            <div>
              <h2 className="text-xl font-bold">
                {student.firstName} {student.lastName}
              </h2>
              <p className="text-sm text-muted-foreground">{student.email}</p>
            </div>
            <StatusBadge status={student.status} />
            <div className="w-full space-y-2 text-right">
              <div className="flex justify-between text-sm">
                <span>التقدم</span>
                <span>{student.progress}%</span>
              </div>
              <Progress value={student.progress} />
            </div>
          </CardContent>
        </Card>
        <div className="grid gap-4">
          <Card>
            <CardHeader>
              <CardTitle>المعلومات الأكاديمية</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-3 text-sm sm:grid-cols-2">
              <Info label="الجامعة" value={student.university} />
              <Info label="الكلية" value={student.faculty} />
              <Info label="التخصص" value={student.major} />
              <Info label="المستوى" value={student.academicLevel} />
              <Info label="الهاتف" value={student.phone} />
              <Info label="تاريخ الانضمام" value={formatDate(student.joinedAt)} />
              <div className="sm:col-span-2">
                <p className="text-muted-foreground">نبذة</p>
                <p className="mt-1 leading-relaxed">{student.bio || "—"}</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>اشتراكاتي</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {subs.length === 0 ? (
                <p className="text-sm text-muted-foreground">لا يوجد اشتراك نشط</p>
              ) : (
                subs.map((s) => (
                  <div
                    key={s.id}
                    className="flex items-center justify-between rounded-xl border px-3 py-2 text-sm"
                  >
                    <span>
                      {s.plan} — {s.price} دج
                    </span>
                    <StatusBadge status={s.status} />
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

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-muted-foreground">{label}</p>
      <p className="mt-1 font-medium">{value}</p>
    </div>
  );
}
