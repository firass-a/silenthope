"use client";

import { use, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import { Check, Lock, Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Section } from "@/components/brand/section";
import { courseImage } from "@/lib/media";
import { useCoursesStore } from "@/stores/courses.store";
import { useLessonsStore } from "@/stores/lessons.store";
import { useAuthStore } from "@/stores/auth.store";
import { useLearningStore } from "@/stores/learning.store";
import { cn } from "@/lib/utils";

export default function CoursePage({
  params,
}: {
  params: Promise<{ courseId: string }>;
}) {
  const { courseId } = use(params);
  const course = useCoursesStore((s) => s.courses.find((c) => c.id === courseId));
  const allLessons = useLessonsStore((s) => s.lessons);
  const session = useAuthStore((s) => s.session);
  const learning = useLearningStore((s) =>
    session?.studentId ? s.byStudentId[session.studentId] : undefined
  );
  const getCourseProgress = useLearningStore((s) => s.getCourseProgress);

  const lessons = useMemo(() => {
    const ids = course?.lessonIds ?? [];
    return allLessons
      .filter((l) => l.courseId === courseId && l.status === "published")
      .sort((a, b) => ids.indexOf(a.id) - ids.indexOf(b.id));
  }, [allLessons, courseId, course]);

  if (!course) {
    return (
      <div className="container mx-auto px-4 py-20 text-center">
        <h1 className="text-2xl font-bold">المادة غير موجودة</h1>
        <Button asChild className="mt-6">
          <Link href="/learn">العودة للأكاديمية</Link>
        </Button>
      </div>
    );
  }

  const progress = session?.studentId
    ? getCourseProgress(session.studentId, course.id, course.lessonIds)
    : 0;

  const firstIncomplete =
    lessons.find((l) => !learning?.lessons[l.id]?.completed) ?? lessons[0];

  return (
    <div>
      <section className="relative min-h-[420px] overflow-hidden">
        <Image
          src={course.thumbnail || courseImage(course.id)}
          alt=""
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-t from-brand-900 via-brand-900/70 to-brand-900/30" />
        <div className="container relative mx-auto flex min-h-[420px] flex-col justify-end px-4 pb-12 pt-24 text-white md:px-6">
          <p className="text-sm font-semibold text-brand-200">{course.level}</p>
          <h1 className="mt-2 max-w-3xl text-4xl font-bold md:text-5xl">
            {course.title}
          </h1>
          <p className="mt-4 max-w-2xl text-base text-white/85 md:text-lg">
            {course.description}
          </p>
          <div className="mt-6 flex flex-wrap items-center gap-4 text-sm text-white/80">
            <span>{course.instructor}</span>
            <span aria-hidden>·</span>
            <span>{lessons.length} درس</span>
            <span aria-hidden>·</span>
            <span>{progress}% مكتمل</span>
          </div>
          {firstIncomplete ? (
            <Button asChild size="lg" className="mt-8 w-fit bg-white text-brand-800 hover:bg-brand-50">
              <Link href={`/learn/${course.id}/${firstIncomplete.id}`}>
                <Play className="size-4" />
                {progress > 0 ? "متابعة التعلّم" : "ابدأ المادة"}
              </Link>
            </Button>
          ) : null}
        </div>
      </section>

      <Section>
        <div className="grid gap-12 lg:grid-cols-[1.2fr_0.8fr]">
          <div>
            <h2 className="text-2xl font-bold">منهج المادة</h2>
            <ol className="mt-6 space-y-3">
              {lessons.map((lesson, index) => {
                const lp = learning?.lessons[lesson.id];
                // Soft lock: only if previous not started at all for students
                const softLocked =
                  Boolean(session?.studentId) &&
                  index > 0 &&
                  !learning?.lessons[lessons[index - 1].id] &&
                  !lp;

                const state = lp?.completed
                  ? "done"
                  : (lp?.percent ?? 0) > 0
                    ? "progress"
                    : softLocked
                      ? "locked"
                      : "open";

                const inner = (
                  <>
                    <span
                      className={cn(
                        "flex size-11 shrink-0 items-center justify-center rounded-2xl text-sm font-bold",
                        state === "done" && "bg-success/15 text-success",
                        state === "progress" && "bg-brand-100 text-brand-700",
                        state === "open" && "bg-secondary text-foreground",
                        state === "locked" && "bg-muted text-muted-foreground"
                      )}
                    >
                      {state === "done" ? (
                        <Check className="size-5" />
                      ) : state === "locked" ? (
                        <Lock className="size-4" />
                      ) : (
                        String(index + 1).padStart(2, "0")
                      )}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="font-semibold">{lesson.title}</p>
                      <p className="text-sm text-muted-foreground">
                        {state === "done"
                          ? "مكتمل"
                          : state === "progress"
                            ? `${lp?.percent}%`
                            : state === "locked"
                              ? "مقفل — أكمل الدرس السابق"
                              : `${lesson.duration} دقيقة بصرية`}
                      </p>
                    </div>
                  </>
                );

                return (
                  <li key={lesson.id}>
                    {state === "locked" ? (
                      <div className="flex items-center gap-4 rounded-2xl border border-dashed border-border px-4 py-4 opacity-70">
                        {inner}
                      </div>
                    ) : (
                      <Link
                        href={`/learn/${course.id}/${lesson.id}`}
                        className="flex items-center gap-4 rounded-2xl border border-border/60 bg-card px-4 py-4 transition hover:border-brand-300 hover:bg-brand-50/40"
                      >
                        {inner}
                      </Link>
                    )}
                  </li>
                );
              })}
            </ol>
          </div>

          <aside className="space-y-8">
            <div>
              <h2 className="text-xl font-bold">أهداف التعلّم</h2>
              <ul className="mt-4 space-y-3">
                {(lessons[0]?.learningObjectives ?? [
                  "فهم المفاهيم الأساسية بصرياً",
                  "تطبيق المعرفة عبر مخططات وأمثلة",
                  "المراجعة باستقلالية دون صوت",
                ]).map((obj) => (
                  <li key={obj} className="flex gap-3 text-sm leading-relaxed">
                    <Check className="mt-0.5 size-4 shrink-0 text-brand-600" />
                    {obj}
                  </li>
                ))}
              </ul>
            </div>
            <div className="rounded-3xl gradient-mist p-6">
              <p className="text-sm font-semibold text-brand-700">المدرّب</p>
              <p className="mt-2 text-lg font-bold">{course.instructor}</p>
              <p className="mt-2 text-sm text-muted-foreground">
                محتوى مصمّم للفهم البصري مع ملخصات ومخططات ولغة إشارة.
              </p>
            </div>
          </aside>
        </div>
      </Section>
    </div>
  );
}
