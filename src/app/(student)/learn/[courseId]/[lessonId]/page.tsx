"use client";

import { use, useMemo, useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { CheckCircle2, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SignMediaSlot } from "@/components/brand/sign-media-slot";
import { RichContentViewer } from "@/components/shared/rich-content-viewer";
import { useCoursesStore } from "@/stores/courses.store";
import { useLessonsStore } from "@/stores/lessons.store";
import { useAuthStore } from "@/stores/auth.store";
import { useLearningStore } from "@/stores/learning.store";
import { cn } from "@/lib/utils";

export default function LessonPlayerPage({
  params,
}: {
  params: Promise<{ courseId: string; lessonId: string }>;
}) {
  const { courseId, lessonId } = use(params);
  const course = useCoursesStore((s) => s.courses.find((c) => c.id === courseId));
  const lesson = useLessonsStore((s) => s.lessons.find((l) => l.id === lessonId));
  const allLessons = useLessonsStore((s) => s.lessons);
  const session = useAuthStore((s) => s.session);
  const setLessonProgress = useLearningStore((s) => s.setLessonProgress);
  const markLessonComplete = useLearningStore((s) => s.markLessonComplete);
  const learning = useLearningStore((s) =>
    session?.studentId ? s.byStudentId[session.studentId] : undefined
  );
  const [quizAnswer, setQuizAnswer] = useState<number | null>(null);

  const siblings = useMemo(
    () =>
      allLessons
        .filter((l) => l.courseId === courseId && l.status === "published")
        .sort(
          (a, b) =>
            (course?.lessonIds.indexOf(a.id) ?? 0) -
            (course?.lessonIds.indexOf(b.id) ?? 0)
        ),
    [allLessons, courseId, course]
  );

  const index = siblings.findIndex((l) => l.id === lessonId);
  const prev = index > 0 ? siblings[index - 1] : null;
  const next = index >= 0 && index < siblings.length - 1 ? siblings[index + 1] : null;
  const percent = learning?.lessons[lessonId]?.percent ?? 0;

  if (!lesson || !course) {
    return (
      <div className="container mx-auto px-4 py-20 text-center">
        <h1 className="text-2xl font-bold">الدرس غير موجود</h1>
        <Button asChild className="mt-6">
          <Link href="/learn">العودة</Link>
        </Button>
      </div>
    );
  }

  function bumpProgress(value: number) {
    if (!session?.studentId) return;
    setLessonProgress(session.studentId, courseId, lessonId, value);
  }

  function complete() {
    if (session?.studentId) {
      markLessonComplete(session.studentId, courseId, lessonId);
      toast.success("أحسنت! تم إكمال الدرس");
    } else {
      toast.message("سجّل الدخول لحفظ تقدّمك");
    }
  }

  const quizOptions = [
    "مخطط بصري + ملخص + مثال",
    "صوت فقط بدون نص",
    "اختبار نهائي فقط",
  ];

  return (
    <div className="pb-20">
      <div className="border-b border-border/50 bg-card/60">
        <div className="container mx-auto flex flex-col gap-4 px-4 py-6 md:flex-row md:items-center md:justify-between md:px-6">
          <div>
            <Link
              href={`/learn/${courseId}`}
              className="text-sm font-semibold text-brand-600 hover:underline"
            >
              {course.title}
            </Link>
            <h1 className="mt-1 text-2xl font-bold md:text-3xl">{lesson.title}</h1>
          </div>
          <div className="w-full max-w-xs">
            <div className="mb-1 flex justify-between text-xs">
              <span>تقدّم الدرس</span>
              <span className="font-semibold">{Math.max(percent, quizAnswer !== null ? 100 : percent)}%</span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-secondary">
              <div
                className="h-full rounded-full bg-primary transition-all"
                style={{
                  width: `${Math.max(percent, quizAnswer !== null ? 100 : percent)}%`,
                }}
              />
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto grid gap-10 px-4 py-10 md:px-6 lg:grid-cols-[1fr_300px]">
        <article className="space-y-10">
          <section
            className="rounded-[1.75rem] border border-border/50 bg-brand-50/50 p-6 md:p-8"
            onMouseEnter={() => bumpProgress(Math.max(percent, 20))}
          >
            <p className="text-sm font-semibold text-brand-700">ملخص بصري</p>
            <p className="mt-3 text-lg leading-relaxed md:text-xl">
              {lesson.summary || lesson.description}
            </p>
          </section>

          <section onFocus={() => bumpProgress(Math.max(percent, 40))}>
            <h2 className="mb-4 text-xl font-bold">المفهوم الأساسي</h2>
            <RichContentViewer sections={lesson.content} />
          </section>

          <section className="rounded-[1.75rem] border border-dashed border-brand-300 bg-secondary/40 p-6">
            <h2 className="text-xl font-bold">مخطط</h2>
            <div className="mt-4 grid gap-3 sm:grid-cols-3">
              {["مفهوم", "مثال", "تطبيق"].map((label, i) => (
                <div
                  key={label}
                  className="rounded-2xl bg-card px-4 py-5 text-center shadow-sm"
                >
                  <p className="text-xs font-semibold text-brand-600">
                    {String(i + 1).padStart(2, "0")}
                  </p>
                  <p className="mt-2 font-bold">{label}</p>
                </div>
              ))}
            </div>
          </section>

          <section>
            <h2 className="mb-4 text-xl font-bold">مثال تطبيقي</h2>
            <p className="leading-relaxed text-muted-foreground">
              طبّق الفكرة على موقف جامعي يومي: راقب المخطط، اربط الخطوات، ثم أعد
              صياغتها بصرياً بكلماتك.
            </p>
          </section>

          <section onMouseEnter={() => bumpProgress(Math.max(percent, 70))}>
            <h2 className="mb-4 text-xl font-bold">فيديو بلغة الإشارة</h2>
            <SignMediaSlot />
          </section>

          <section>
            <h2 className="mb-4 text-xl font-bold">ملاحظات</h2>
            <ul className="space-y-2 text-sm leading-relaxed text-muted-foreground">
              {(lesson.learningObjectives.length
                ? lesson.learningObjectives
                : ["راجع الملخص قبل الانتقال", "اربط المخطط بالمثال"]
              ).map((n) => (
                <li key={n} className="flex gap-2">
                  <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-brand-600" />
                  {n}
                </li>
              ))}
            </ul>
          </section>

          <section className="rounded-[1.75rem] border border-border/60 p-6">
            <h2 className="text-xl font-bold">اختبار قصير</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              ما أفضل طريقة لفهم درس على الأمل الصامت؟
            </p>
            <div className="mt-4 space-y-2">
              {quizOptions.map((opt, i) => (
                <button
                  key={opt}
                  type="button"
                  onClick={() => {
                    setQuizAnswer(i);
                    bumpProgress(100);
                  }}
                  className={cn(
                    "flex w-full items-center rounded-2xl border px-4 py-3 text-start text-sm transition",
                    quizAnswer === i
                      ? i === 0
                        ? "border-success bg-success/10"
                        : "border-destructive/40 bg-destructive/5"
                      : "border-border hover:bg-secondary"
                  )}
                >
                  {opt}
                </button>
              ))}
            </div>
            {quizAnswer !== null ? (
              <p className="mt-3 text-sm font-medium">
                {quizAnswer === 0
                  ? "صحيح — التعلّم هنا بصري ومتعدد الطبقات."
                  : "حاول مجدداً — المنصة تعتمد على الملخص والمخطط والمثال."}
              </p>
            ) : null}
          </section>

          <div className="flex flex-wrap gap-3">
            <Button onClick={complete} size="lg">
              إكمال الدرس
            </Button>
            {next ? (
              <Button asChild variant="outline" size="lg">
                <Link href={`/learn/${courseId}/${next.id}`}>
                  الدرس التالي <ChevronLeft className="size-4" />
                </Link>
              </Button>
            ) : (
              <Button asChild variant="outline" size="lg">
                <Link href={`/learn/${courseId}`}>العودة للمادة</Link>
              </Button>
            )}
          </div>
        </article>

        <aside className="space-y-4 lg:sticky lg:top-24 lg:self-start">
          <p className="text-sm font-semibold text-muted-foreground">دروس المادة</p>
          <ol className="space-y-2">
            {siblings.map((l, i) => {
              const done = learning?.lessons[l.id]?.completed;
              return (
                <li key={l.id}>
                  <Link
                    href={`/learn/${courseId}/${l.id}`}
                    className={cn(
                      "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition",
                      l.id === lessonId
                        ? "bg-primary text-primary-foreground"
                        : "hover:bg-secondary"
                    )}
                  >
                    <span className="font-bold opacity-70">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <span className="flex-1 truncate">{l.title}</span>
                    {done ? <CheckCircle2 className="size-4 shrink-0" /> : null}
                  </Link>
                </li>
              );
            })}
          </ol>
          {prev ? (
            <Button asChild variant="ghost" className="w-full justify-start">
              <Link href={`/learn/${courseId}/${prev.id}`}>
                <ChevronRight className="size-4" /> الدرس السابق
              </Link>
            </Button>
          ) : null}
        </aside>
      </div>
    </div>
  );
}
