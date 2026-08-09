"use client";

import { useMemo } from "react";
import Link from "next/link";
import {
  BookOpen,
  CreditCard,
  Flag,
  GraduationCap,
  Plus,
  Sparkles,
  Users,
  UserCheck,
} from "lucide-react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { PageHeader } from "@/components/shared/page-header";
import { StatCard } from "@/components/shared/stat-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuthStore } from "@/stores/auth.store";
import { useStudentsStore } from "@/stores/students.store";
import { useLessonsStore } from "@/stores/lessons.store";
import { useTalentsStore } from "@/stores/talents.store";
import { useSubscriptionsStore } from "@/stores/subscriptions.store";
import { useActivityStore } from "@/stores/activity.store";
import { useReportsStore } from "@/stores/reports.store";
import { useAgentsStore } from "@/stores/agents.store";
import { isStaffRole, ROLE_LABELS } from "@/lib/permissions";
import { formatDateTime } from "@/lib/utils";
import { statusLabel as badgeStatusLabel } from "@/components/shared/status-badge";

const CHART_COLORS = ["#5C4033", "#C9A227", "#8B5E3C", "#6B4E71", "#2F6F6A"];

export default function DashboardPage() {
  const session = useAuthStore((s) => s.session);
  const role = session?.role ?? "student";

  if (!isStaffRole(role)) {
    return <StudentDashboard />;
  }

  return <StaffDashboard />;
}

function StudentDashboard() {
  const session = useAuthStore((s) => s.session);
  const students = useStudentsStore((s) => s.students);
  const talents = useTalentsStore((s) => s.talents);
  const lessons = useLessonsStore((s) => s.lessons);

  const student = useMemo(() => {
    if (session?.studentId) return students.find((s) => s.id === session.studentId);
    return students.find((s) => s.email === session?.email);
  }, [students, session]);

  const mine = useMemo(
    () =>
      talents.filter(
        (t) => t.studentId === student?.id || t.studentName === session?.name
      ),
    [talents, student, session]
  );

  const publishedLessons = lessons.filter((l) => l.status === "published").length;
  const pendingMine = mine.filter((t) => t.status === "pending").length;
  const approvedMine = mine.filter(
    (t) => t.status === "approved" || t.status === "featured"
  ).length;

  return (
    <div className="space-y-6">
      <PageHeader
        title={`مرحباً، ${session?.name ?? "طالب"}`}
        description="مساحتك التعليمية — بدون أدوات الإدارة أو مراجعة المواهب."
        badge={<Badge variant="secondary">{ROLE_LABELS.student}</Badge>}
        actions={
          <div className="flex flex-wrap gap-2">
            <Button asChild size="sm" variant="accent">
              <Link href="/dashboard/my-talents?new=1">
                <Plus /> إرسال موهبة
              </Link>
            </Button>
            <Button asChild size="sm" variant="outline">
              <Link href="/courses">استكشف المواد</Link>
            </Button>
          </div>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard title="مواهبي" value={mine.length} icon={Sparkles} index={0} />
        <StatCard title="قيد المراجعة" value={pendingMine} icon={Flag} index={1} hint="موهبتك فقط" />
        <StatCard title="مقبولة / مميزة" value={approvedMine} icon={UserCheck} index={2} />
        <StatCard title="دروس متاحة" value={publishedLessons} icon={BookOpen} index={3} />
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>مواهبي</CardTitle>
          </CardHeader>
          <CardContent>
            <Button asChild className="w-full">
              <Link href="/dashboard/my-talents">عرض مواهبي</Link>
            </Button>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>التعلّم</CardTitle>
          </CardHeader>
          <CardContent>
            <Button asChild variant="outline" className="w-full">
              <Link href="/dashboard/my-learning">دروسي المتاحة</Link>
            </Button>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>ملفي</CardTitle>
          </CardHeader>
          <CardContent>
            <Button asChild variant="outline" className="w-full">
              <Link href="/dashboard/my-profile">الملف الشخصي</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function StaffDashboard() {
  const students = useStudentsStore((s) => s.students);
  const lessons = useLessonsStore((s) => s.lessons);
  const talents = useTalentsStore((s) => s.talents);
  const subscriptions = useSubscriptionsStore((s) => s.subscriptions);
  const activity = useActivityStore((s) => s.logs);
  const reports = useReportsStore((s) => s.reports);
  const agents = useAgentsStore((s) => s.agents);

  const pendingTalents = talents.filter((t) => t.status === "pending").length;
  const publishedLessons = lessons.filter((l) => l.status === "published").length;
  const pendingLessons = lessons.filter((l) => l.status === "pending_review").length;
  const pendingReports = reports.filter((r) => r.status === "pending").length;
  const activeUsers =
    students.filter((s) => s.status === "active").length +
    agents.filter((a) => a.status === "active").length;

  const studentsGrowth = Array.from({ length: 6 }).map((_, i) => {
    const d = new Date();
    d.setMonth(d.getMonth() - (5 - i));
    const key = `${d.getFullYear()}-${d.getMonth()}`;
    const count = students.filter((s) => {
      const jd = new Date(s.joinedAt);
      return `${jd.getFullYear()}-${jd.getMonth()}` <= key;
    }).length;
    return {
      month: d.toLocaleDateString("ar-DZ", { month: "short" }),
      students: count,
    };
  });

  const lessonsByStatus = ["draft", "pending_review", "published", "archived"].map(
    (status) => ({
      status: badgeStatusLabel(status),
      count: lessons.filter((l) => l.status === status).length,
    })
  );

  const talentsByStatus = ["pending", "approved", "rejected", "featured"].map(
    (status) => ({
      name: badgeStatusLabel(status),
      value: talents.filter((t) => t.status === status).length,
    })
  );

  const subDist = ["free", "student", "premium"].map((plan) => ({
    name: badgeStatusLabel(plan),
    value: subscriptions.filter((s) => s.plan === plan).length,
  }));

  return (
    <div className="space-y-6">
      <PageHeader
        title="لوحة التحكم"
        description="نظرة عامة على مؤشرات المنصة والنشاط الأخير."
        actions={
          <div className="flex flex-wrap gap-2">
            <Button asChild size="sm">
              <Link href="/dashboard/lessons">
                <Plus /> إضافة درس
              </Link>
            </Button>
            <Button asChild size="sm" variant="outline">
              <Link href="/dashboard/talents?status=pending">مراجعة المواهب</Link>
            </Button>
          </div>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard title="إجمالي الطلبة" value={students.length} icon={Users} index={0} />
        <StatCard title="إجمالي الدروس" value={lessons.length} icon={BookOpen} index={1} />
        <StatCard title="إجمالي المواهب" value={talents.length} icon={Sparkles} index={2} />
        <StatCard
          title="مواهب قيد المراجعة"
          value={pendingTalents}
          icon={Flag}
          hint="لفريق المواهب/المشرف"
          index={3}
        />
        <StatCard title="الاشتراكات" value={subscriptions.length} icon={CreditCard} index={4} />
        <StatCard title="الدروس المنشورة" value={publishedLessons} icon={GraduationCap} index={5} />
        <StatCard title="المستخدمون النشطون" value={activeUsers} icon={UserCheck} index={6} />
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>نمو الطلبة</CardTitle>
          </CardHeader>
          <CardContent className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={studentsGrowth}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                <XAxis dataKey="month" reversed />
                <YAxis orientation="right" allowDecimals={false} />
                <Tooltip />
                <Area
                  type="monotone"
                  dataKey="students"
                  name="الطلبة"
                  stroke="#5C4033"
                  fill="#C9A227"
                  fillOpacity={0.25}
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>الدروس حسب الحالة</CardTitle>
          </CardHeader>
          <CardContent className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={lessonsByStatus}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                <XAxis dataKey="status" reversed />
                <YAxis orientation="right" allowDecimals={false} />
                <Tooltip />
                <Bar dataKey="count" name="العدد" fill="#5C4033" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>توزيع المواهب</CardTitle>
          </CardHeader>
          <CardContent className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={talentsByStatus} dataKey="value" nameKey="name" outerRadius={90} label>
                  {talentsByStatus.map((_, i) => (
                    <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>توزيع الاشتراكات</CardTitle>
          </CardHeader>
          <CardContent className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={subDist} dataKey="value" nameKey="name" outerRadius={90} label>
                  {subDist.map((_, i) => (
                    <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader className="flex-row items-center justify-between">
            <CardTitle>أحدث العمليات</CardTitle>
            <Button asChild variant="ghost" size="sm">
              <Link href="/dashboard/activity">عرض الكل</Link>
            </Button>
          </CardHeader>
          <CardContent className="space-y-3">
            {activity.slice(0, 6).map((log) => (
              <div key={log.id} className="rounded-xl border bg-secondary/40 px-3 py-2">
                <p className="text-sm font-medium">{log.description}</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {log.performedBy} — {formatDateTime(log.timestamp)}
                </p>
              </div>
            ))}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>إجراءات معلّقة</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Link
              href="/dashboard/talents?status=pending"
              className="flex items-center justify-between rounded-xl border px-3 py-3 text-sm hover:bg-secondary"
            >
              <span>{pendingTalents} موهبة بانتظار المراجعة</span>
              <span aria-hidden>←</span>
            </Link>
            <Link
              href="/dashboard/lessons?status=pending_review"
              className="flex items-center justify-between rounded-xl border px-3 py-3 text-sm hover:bg-secondary"
            >
              <span>{pendingLessons} درس بانتظار النشر</span>
              <span aria-hidden>←</span>
            </Link>
            <Link
              href="/dashboard/reports"
              className="flex items-center justify-between rounded-xl border px-3 py-3 text-sm hover:bg-secondary"
            >
              <span>{pendingReports} بلاغ بحاجة للمتابعة</span>
              <span aria-hidden>←</span>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
