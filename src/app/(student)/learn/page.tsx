"use client";

import { useMemo } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowLeft } from "lucide-react";
import { Section, SectionHeading, HorizontalScroller } from "@/components/brand/section";
import { CourseTile } from "@/components/learn/course-tile";
import { Button } from "@/components/ui/button";
import { SPECIALTY_VISUALS } from "@/lib/media";
import { useAuthStore } from "@/stores/auth.store";
import { useCoursesStore } from "@/stores/courses.store";
import { useLessonsStore } from "@/stores/lessons.store";
import { useLearningStore } from "@/stores/learning.store";
import { usePreferencesStore } from "@/stores/preferences.store";
import Image from "next/image";

export default function LearnAcademyPage() {
  const session = useAuthStore((s) => s.session);
  const courses = useCoursesStore((s) => s.courses);
  const lessons = useLessonsStore((s) => s.lessons);
  const getCourseProgress = useLearningStore((s) => s.getCourseProgress);
  const getContinue = useLearningStore((s) => s.getContinue);
  const prefs = usePreferencesStore((s) =>
    session ? s.byUserId[session.userId] : undefined
  );

  const published = useMemo(
    () => courses.filter((c) => c.status === "published"),
    [courses]
  );

  const continueInfo = session?.studentId
    ? getContinue(session.studentId)
    : null;
  const continueCourse = continueInfo?.courseId
    ? published.find((c) => c.id === continueInfo.courseId)
    : null;
  const continueProgress =
    session?.studentId && continueCourse
      ? getCourseProgress(
          session.studentId,
          continueCourse.id,
          continueCourse.lessonIds
        )
      : 0;

  const recommended = useMemo(() => {
    if (!prefs?.subjects?.length) return published.slice(0, 3);
    return [...published].sort((a, b) => {
      const aHit = prefs.subjects.some((s) => a.title.includes(s) || a.description.includes(s));
      const bHit = prefs.subjects.some((s) => b.title.includes(s) || b.description.includes(s));
      return Number(bHit) - Number(aHit);
    });
  }, [published, prefs]);

  const recentLessons = useMemo(
    () =>
      lessons
        .filter((l) => l.status === "published")
        .slice()
        .sort(
          (a, b) =>
            new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
        )
        .slice(0, 4),
    [lessons]
  );

  return (
    <div>
      <section className="relative overflow-hidden border-b border-border/50">
        <div className="absolute inset-0 gradient-mist opacity-80" />
        <div className="container relative mx-auto px-4 py-14 md:px-6 md:py-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-2xl"
          >
            <p className="text-sm font-semibold text-brand-600">الأكاديمية البصرية</p>
            <h1 className="mt-3 text-display">
              {session?.role === "student"
                ? `مرحباً، ${session.name.split(" ")[0]}`
                : "تعلّم بصرياً. افهم بعمق."}
            </h1>
            <p className="mt-4 text-lg text-muted-foreground">
              مواد جامعية، مسارات واضحة، ومحتوى لا يعتمد على الصوت.
            </p>
          </motion.div>

          {continueCourse && session?.studentId ? (
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
              className="mt-10 flex flex-col gap-4 rounded-[1.75rem] border border-border/60 bg-card/90 p-5 shadow-sm md:flex-row md:items-center md:justify-between md:p-6"
            >
              <div>
                <p className="text-sm font-semibold text-brand-600">
                  آخر ما كنت تتعلمه
                </p>
                <h2 className="mt-1 text-xl font-bold">{continueCourse.title}</h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  {continueProgress}% مكتمل
                </p>
              </div>
              <Button asChild size="lg">
                <Link
                  href={
                    continueInfo?.lessonId
                      ? `/learn/${continueCourse.id}/${continueInfo.lessonId}`
                      : `/learn/${continueCourse.id}`
                  }
                >
                  متابعة الدرس <ArrowLeft className="size-4" />
                </Link>
              </Button>
            </motion.div>
          ) : null}
        </div>
      </section>

      <Section>
        <SectionHeading
          eyebrow="اكتشف"
          title="حسب التخصص"
          description="تصفّح مسارات بصرية حسب اهتمامك الأكاديمي."
        />
        <HorizontalScroller>
          {SPECIALTY_VISUALS.map((s) => (
            <Link
              key={s.id}
              href="/learn"
              className="relative min-w-[200px] overflow-hidden rounded-3xl"
            >
              <div className="relative h-40 w-[200px]">
                <Image src={s.image} alt={s.title} fill className="object-cover" />
                <div className="absolute inset-0 bg-brand-900/45" />
                <p className="absolute inset-x-0 bottom-0 p-4 text-base font-bold text-white">
                  {s.title}
                </p>
              </div>
            </Link>
          ))}
        </HorizontalScroller>
      </Section>

      <Section tone="soft">
        <SectionHeading eyebrow="موصى به لك" title="ابدأ من هنا" />
        <HorizontalScroller>
          {recommended.map((course) => (
            <CourseTile
              key={course.id}
              course={course}
              progress={
                session?.studentId
                  ? getCourseProgress(
                      session.studentId,
                      course.id,
                      course.lessonIds
                    )
                  : undefined
              }
            />
          ))}
        </HorizontalScroller>
      </Section>

      <Section>
        <SectionHeading eyebrow="مكتبتك" title="المواد المتاحة" />
        <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
          {published.map((course) => (
            <CourseTile
              key={course.id}
              course={course}
              className="min-w-0 max-w-none"
              progress={
                session?.studentId
                  ? getCourseProgress(
                      session.studentId,
                      course.id,
                      course.lessonIds
                    )
                  : undefined
              }
            />
          ))}
        </div>
      </Section>

      <Section tone="mist">
        <SectionHeading eyebrow="حديثاً" title="دروس أُضيفت مؤخراً" />
        <div className="grid gap-4 md:grid-cols-2">
          {recentLessons.map((lesson, i) => (
            <Link
              key={lesson.id}
              href={`/learn/${lesson.courseId}/${lesson.id}`}
              className="flex items-start gap-4 rounded-3xl border border-border/50 bg-card/80 p-5 transition hover:border-brand-300"
            >
              <span className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-brand-100 text-sm font-bold text-brand-700">
                {String(i + 1).padStart(2, "0")}
              </span>
              <div>
                <h3 className="font-bold">{lesson.title}</h3>
                <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">
                  {lesson.summary || lesson.description}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </Section>
    </div>
  );
}
