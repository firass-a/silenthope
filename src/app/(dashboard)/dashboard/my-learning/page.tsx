"use client";

import { Suspense, useMemo } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { BookOpen, GraduationCap } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { RoleGate } from "@/components/layout/role-gate";
import { EmptyState } from "@/components/shared/empty-state";
import { TableSkeleton } from "@/components/shared/loading-skeleton";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useCoursesStore } from "@/stores/courses.store";
import { useLessonsStore } from "@/stores/lessons.store";

export default function MyLearningPage() {
  return (
    <Suspense fallback={<TableSkeleton />}>
      <RoleGate permission="view_own_learning">
        <MyLearningContent />
      </RoleGate>
    </Suspense>
  );
}

function MyLearningContent() {
  const searchParams = useSearchParams();
  const viewLessons = searchParams.get("view") === "lessons";
  const allCourses = useCoursesStore((s) => s.courses);
  const allLessons = useLessonsStore((s) => s.lessons);
  const courses = useMemo(
    () => allCourses.filter((c) => c.status === "published"),
    [allCourses]
  );
  const lessons = useMemo(
    () => allLessons.filter((l) => l.status === "published"),
    [allLessons]
  );

  const courseTitle = useMemo(() => {
    const map = new Map(courses.map((c) => [c.id, c.title]));
    return (id: string) => map.get(id) ?? "مادة";
  }, [courses]);

  return (
    <div className="space-y-6">
      <PageHeader
        title={viewLessons ? "الدروس المتاحة" : "استكشف المواد"}
        description={
          viewLessons
            ? "دروس منشورة يمكنك متابعتها بصرياً داخل مساحة التعلّم."
            : "مواد منشورة يمكنك فتحها ومتابعة دروسها من هنا."
        }
        actions={
          viewLessons ? (
            <Button asChild variant="outline">
              <Link href="/dashboard/my-learning">عرض المواد</Link>
            </Button>
          ) : (
            <Button asChild variant="outline">
              <Link href="/dashboard/my-learning?view=lessons">عرض الدروس</Link>
            </Button>
          )
        }
      />

      {viewLessons ? (
        lessons.length === 0 ? (
          <EmptyState
            icon={BookOpen}
            title="لا توجد دروس منشورة"
            description="ستظهر الدروس هنا بعد نشرها من فريق المحتوى."
          />
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {lessons.map((lesson) => (
              <Card key={lesson.id}>
                <CardHeader>
                  <CardTitle className="text-lg">{lesson.title}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <p className="line-clamp-2 text-sm text-muted-foreground">
                    {lesson.summary || lesson.description || "درس بصري للتعلّم المستقل."}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="secondary">{courseTitle(lesson.courseId)}</Badge>
                    {lesson.duration ? (
                      <Badge variant="outline">{lesson.duration} د</Badge>
                    ) : null}
                  </div>
                  <Button asChild size="sm">
                    <Link href={`/lessons/${lesson.id}`}>فتح الدرس</Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )
      ) : courses.length === 0 ? (
        <EmptyState
          icon={GraduationCap}
          title="لا توجد مواد منشورة"
          description="ستظهر المواد هنا بعد نشرها من فريق المحتوى."
        />
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {courses.map((course) => {
            const count = lessons.filter((l) => l.courseId === course.id).length;
            return (
              <Card key={course.id}>
                <CardHeader>
                  <CardTitle className="text-lg">{course.title}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <p className="line-clamp-2 text-sm text-muted-foreground">
                    {course.description}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="secondary">{course.level}</Badge>
                    <Badge variant="outline">{count} درس</Badge>
                  </div>
                  <Button asChild size="sm">
                    <Link href={`/courses/${course.id}`}>فتح المادة</Link>
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
