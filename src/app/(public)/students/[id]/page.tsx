"use client";

import { use, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Section, SectionHeading } from "@/components/brand/section";
import { CourseTile } from "@/components/learn/course-tile";
import { studentAvatar, talentImage } from "@/lib/media";
import { useStudentsStore } from "@/stores/students.store";
import { useTalentsStore } from "@/stores/talents.store";
import { useCoursesStore } from "@/stores/courses.store";
import { useLearningStore } from "@/stores/learning.store";
import { Progress } from "@/components/ui/progress";

export default function StudentProfilePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const students = useStudentsStore((s) => s.students);
  const allTalents = useTalentsStore((s) => s.talents);
  const allCourses = useCoursesStore((s) => s.courses);
  const getCourseProgress = useLearningStore((s) => s.getCourseProgress);

  const student = useMemo(
    () => students.find((x) => x.id === id),
    [students, id]
  );
  const talents = useMemo(
    () => allTalents.filter((t) => t.studentId === id),
    [allTalents, id]
  );
  const courses = useMemo(
    () => allCourses.filter((c) => c.status === "published"),
    [allCourses]
  );

  const courseStats = useMemo(() => {
    return courses.map((c) => ({
      course: c,
      progress: getCourseProgress(id, c.id, c.lessonIds),
    }));
  }, [courses, getCourseProgress, id]);

  if (!student) {
    return (
      <div className="container mx-auto px-4 py-20 text-center">
        <h1 className="text-2xl font-bold">الملف غير موجود</h1>
        <Button asChild className="mt-6">
          <Link href="/">الرئيسية</Link>
        </Button>
      </div>
    );
  }

  return (
    <div>
      <section className="border-b border-border/40 gradient-mist">
        <div className="container mx-auto grid gap-8 px-4 py-14 md:grid-cols-[200px_1fr] md:px-6 md:py-20">
          <div className="relative mx-auto aspect-square w-44 overflow-hidden rounded-[2rem] md:w-full">
            <Image
              src={student.avatar || studentAvatar(student.id)}
              alt=""
              fill
              className="object-cover"
            />
          </div>
          <div>
            <p className="text-sm font-semibold text-brand-600">ملف أكاديمي + إبداعي</p>
            <h1 className="mt-2 text-4xl font-bold">
              {student.firstName} {student.lastName}
            </h1>
            <p className="mt-2 text-lg text-muted-foreground">
              {student.university} · {student.major}
            </p>
            <p className="mt-1 text-sm text-brand-700">{student.academicLevel}</p>
            <p className="mt-5 max-w-2xl leading-relaxed text-muted-foreground">
              {student.bio}
            </p>
            <div className="mt-6 max-w-md">
              <div className="mb-2 flex justify-between text-sm">
                <span>تقدّم التعلّم العام</span>
                <span className="font-semibold">{student.progress}%</span>
              </div>
              <Progress value={student.progress} />
            </div>
          </div>
        </div>
      </section>

      <Section>
        <SectionHeading title="المواد والمتابعة" />
        <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
          {courseStats
            .filter((c) => c.progress > 0)
            .slice(0, 3)
            .map(({ course, progress }) => (
              <CourseTile
                key={course.id}
                course={course}
                progress={progress}
                className="min-w-0 max-w-none"
              />
            ))}
          {courseStats.every((c) => c.progress === 0) ? (
            <p className="text-muted-foreground">لا يوجد تقدّم مسجّل بعد.</p>
          ) : null}
        </div>
      </Section>

      <Section tone="soft">
        <SectionHeading title="المواهب" />
        {talents.length === 0 ? (
          <p className="text-muted-foreground">لا توجد مواهب معروضة بعد.</p>
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {talents.map((t, i) => (
              <Link
                key={t.id}
                href={`/talents/${t.id}`}
                className="overflow-hidden rounded-3xl border border-border/50 bg-card"
              >
                <div className="relative aspect-[4/3]">
                  <Image
                    src={t.coverImage || talentImage(t.id, i)}
                    alt=""
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="p-4">
                  <p className="font-bold">{t.title}</p>
                  <p className="text-sm text-muted-foreground">{t.status}</p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </Section>
    </div>
  );
}
