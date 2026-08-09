"use client";

import { useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { ArrowLeft, Bell, Plus, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Section, SectionHeading, HorizontalScroller } from "@/components/brand/section";
import { CourseTile } from "@/components/learn/course-tile";
import { useAuthStore } from "@/stores/auth.store";
import { useCoursesStore } from "@/stores/courses.store";
import { useTalentsStore } from "@/stores/talents.store";
import { useLearningStore } from "@/stores/learning.store";
import { useStudentsStore } from "@/stores/students.store";
import { useNotificationsStore } from "@/stores/notifications.store";
import { usePreferencesStore } from "@/stores/preferences.store";
import { courseImage, talentImage } from "@/lib/media";

export default function StudentHomePage() {
  const session = useAuthStore((s) => s.session);
  const allCourses = useCoursesStore((s) => s.courses);
  const allTalents = useTalentsStore((s) => s.talents);
  const students = useStudentsStore((s) => s.students);
  const notifications = useNotificationsStore((s) => s.notifications);
  const getContinue = useLearningStore((s) => s.getContinue);
  const getCourseProgress = useLearningStore((s) => s.getCourseProgress);
  const prefs = usePreferencesStore((s) =>
    session ? s.byUserId[session.userId] : undefined
  );

  const firstName = session?.name?.split(" ")[0] ?? "طالب";
  const student = useMemo(() => {
    if (session?.studentId) {
      return students.find((s) => s.id === session.studentId);
    }
    return students.find((s) => s.email === session?.email);
  }, [students, session]);

  const published = useMemo(
    () => allCourses.filter((c) => c.status === "published"),
    [allCourses]
  );

  const continueInfo = session?.studentId
    ? getContinue(session.studentId)
    : null;
  const continueCourse = continueInfo?.courseId
    ? published.find((c) => c.id === continueInfo.courseId)
    : published[0];
  const continueProgress =
    session?.studentId && continueCourse
      ? getCourseProgress(
          session.studentId,
          continueCourse.id,
          continueCourse.lessonIds
        )
      : 0;

  const mine = useMemo(
    () =>
      allTalents.filter(
        (t) =>
          t.studentId === student?.id || t.studentName === session?.name
      ),
    [allTalents, student, session]
  );

  const unread = useMemo(
    () => notifications.filter((n) => !n.read).length,
    [notifications]
  );

  const recommended = useMemo(() => {
    if (!prefs?.subjects?.length) return published.slice(0, 3);
    return [...published]
      .sort((a, b) => {
        const aHit = prefs.subjects.some(
          (s) => a.title.includes(s) || a.description.includes(s)
        );
        const bHit = prefs.subjects.some(
          (s) => b.title.includes(s) || b.description.includes(s)
        );
        return Number(bHit) - Number(aHit);
      })
      .slice(0, 3);
  }, [published, prefs]);

  const hour = new Date().getHours();
  const greeting =
    hour < 12 ? "صباح الخير" : hour < 18 ? "مساء الخير" : "مساء النور";

  return (
    <div>
      <section className="border-b border-border/40 gradient-mist">
        <div className="container mx-auto px-4 py-12 md:px-6 md:py-16">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <p className="text-sm font-semibold text-brand-600">مساحة الطالب</p>
            <h1 className="mt-2 text-4xl font-bold md:text-5xl">
              {greeting}، {firstName}
            </h1>
            <p className="mt-3 max-w-xl text-lg text-muted-foreground">
              جاهز تكمل رحلتك البصرية؟ كل شيء هنا — تعلّمك، مواهبك، وتنبيهاتك.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Button asChild size="lg">
                <Link
                  href={
                    continueCourse
                      ? continueInfo?.lessonId
                        ? `/learn/${continueCourse.id}/${continueInfo.lessonId}`
                        : `/learn/${continueCourse.id}`
                      : "/learn"
                  }
                >
                  متابعة التعلّم <ArrowLeft className="size-4" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline">
                <Link href="/me/talents?new=1">
                  <Plus className="size-4" /> أرسل موهبة
                </Link>
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      <Section>
        <div className="grid gap-4 sm:grid-cols-3">
          <div className="rounded-3xl border border-border/60 bg-card p-5">
            <p className="text-sm text-muted-foreground">تقدّمك العام</p>
            <p className="mt-2 text-3xl font-bold text-brand-700">
              {student?.progress ?? continueProgress}%
            </p>
          </div>
          <div className="rounded-3xl border border-border/60 bg-card p-5">
            <p className="text-sm text-muted-foreground">مواهبي</p>
            <p className="mt-2 text-3xl font-bold">{mine.length}</p>
          </div>
          <Link
            href="/me/notifications"
            className="rounded-3xl border border-border/60 bg-card p-5 transition hover:border-brand-300"
          >
            <p className="flex items-center gap-2 text-sm text-muted-foreground">
              <Bell className="size-4" /> إشعارات جديدة
            </p>
            <p className="mt-2 text-3xl font-bold">{unread}</p>
          </Link>
        </div>
      </Section>

      {continueCourse ? (
        <Section tone="soft">
          <SectionHeading eyebrow="استمر" title="آخر ما كنت تتعلمه" />
          <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
            <div className="relative min-h-[240px] overflow-hidden rounded-[1.75rem]">
              <Image
                src={continueCourse.thumbnail || courseImage(continueCourse.id)}
                alt=""
                fill
                className="object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-brand-900/80 to-transparent" />
              <div className="absolute inset-x-0 bottom-0 p-6 text-white">
                <h3 className="text-2xl font-bold">{continueCourse.title}</h3>
                <p className="mt-1 text-white/80">{continueProgress}% مكتمل</p>
              </div>
            </div>
            <div className="flex flex-col justify-center rounded-[1.75rem] border border-border/60 bg-card p-6">
              <p className="text-sm text-muted-foreground">
                {continueCourse.description}
              </p>
              <Button asChild className="mt-6 w-fit" size="lg">
                <Link
                  href={
                    continueInfo?.lessonId
                      ? `/learn/${continueCourse.id}/${continueInfo.lessonId}`
                      : `/learn/${continueCourse.id}`
                  }
                >
                  متابعة الدرس
                </Link>
              </Button>
            </div>
          </div>
        </Section>
      ) : null}

      <Section>
        <SectionHeading eyebrow="موصى به" title="لك الآن" />
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

      <Section tone="mist">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <SectionHeading
            className="mb-0"
            eyebrow="إبداعك"
            title="مواهبك"
            description="تابع حالة أعمالك أو أرسل عملاً جديداً للمراجعة."
          />
          <Button asChild variant="outline">
            <Link href="/me/talents">
              <Sparkles className="size-4" /> كل مواهبي
            </Link>
          </Button>
        </div>
        {mine.length === 0 ? (
          <div className="mt-8 rounded-3xl border border-dashed border-border p-8 text-center">
            <p className="text-muted-foreground">لم ترسل موهبة بعد.</p>
            <Button asChild className="mt-4">
              <Link href="/me/talents?new=1">أرسل أول موهبة</Link>
            </Button>
          </div>
        ) : (
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {mine.slice(0, 3).map((t, i) => (
              <Link
                key={t.id}
                href={
                  t.status === "approved" || t.status === "featured"
                    ? `/talents/${t.id}`
                    : "/me/talents"
                }
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
                  <p className="mt-1 text-sm text-muted-foreground">{t.status}</p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </Section>
    </div>
  );
}
