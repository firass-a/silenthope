"use client";

import { useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import {
  BookOpen,
  Hand,
  LayoutGrid,
  Play,
  Sparkles,
  Video,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Section,
  SectionHeading,
  EditorialSplit,
  HorizontalScroller,
} from "@/components/brand/section";
import { VisualStepper } from "@/components/brand/visual-stepper";
import { CourseTile } from "@/components/learn/course-tile";
import { SPECIALTY_VISUALS, courseImage, talentImage, studentAvatar } from "@/lib/media";
import { useAuthStore } from "@/stores/auth.store";
import { useCoursesStore } from "@/stores/courses.store";
import { useTalentsStore } from "@/stores/talents.store";
import { useLearningStore } from "@/stores/learning.store";
import { useStudentsStore } from "@/stores/students.store";

export default function HomePage() {
  const session = useAuthStore((s) => s.session);
  const allCourses = useCoursesStore((s) => s.courses);
  const allTalents = useTalentsStore((s) => s.talents);
  const allStudents = useStudentsStore((s) => s.students);
  const getContinue = useLearningStore((s) => s.getContinue);
  const getCourseProgress = useLearningStore((s) => s.getCourseProgress);

  const courses = useMemo(
    () => allCourses.filter((c) => c.status === "published"),
    [allCourses]
  );
  const talents = useMemo(
    () =>
      allTalents.filter(
        (t) => t.status === "approved" || t.status === "featured"
      ),
    [allTalents]
  );
  const students = useMemo(
    () => allStudents.filter((s) => s.status === "active"),
    [allStudents]
  );

  const featured = talents.find((t) => t.featured) ?? talents[0];
  const continueInfo =
    session?.studentId ? getContinue(session.studentId) : null;
  const continueCourse = continueInfo?.courseId
    ? courses.find((c) => c.id === continueInfo.courseId)
    : null;

  return (
    <div>
      {/* Hero — brand first, asymmetric RTL */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 gradient-mist" />
        <div className="container relative mx-auto grid min-h-[88vh] items-center gap-10 px-4 py-16 md:px-6 lg:grid-cols-[1.05fr_0.95fr] lg:py-10">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55 }}
            className="order-2 lg:order-1"
          >
            <p className="text-sm font-semibold tracking-wide text-brand-600">
              منصة رقمية تعليمية شاملة
            </p>
            <h1 className="mt-4 text-display text-brand-900">الأمل الصامت</h1>
            <p className="mt-4 text-2xl font-semibold leading-snug text-foreground md:text-3xl">
              نَسمع بالعين
              <br />
              ونتعلّم بالعقل
            </p>
            <p className="mt-5 max-w-lg text-base leading-relaxed text-muted-foreground md:text-lg">
              جامعة رقمية مصغّرة موجهة لفئة الصم — تعليم بصري، فضاء للمواهب، وأدوات
              للإدماج الأكاديمي والاجتماعي.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button asChild size="lg">
                <Link href="/learn">ابدأ التعلّم</Link>
              </Button>
              <Button asChild size="lg" variant="outline">
                <Link href="/talents">اكتشف المواهب</Link>
              </Button>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="order-1 relative lg:order-2"
          >
            <div className="relative aspect-[4/5] overflow-hidden rounded-[2rem] md:aspect-[5/4] lg:aspect-[4/5]">
              <Image
                src="https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=1400&q=80"
                alt="طلبة يتعلمون بصرياً"
                fill
                className="object-cover"
                priority
                sizes="(max-width:1024px) 100vw, 50vw"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-brand-900/55 via-transparent to-transparent" />
            </div>
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.45 }}
              className="absolute -bottom-4 start-4 end-4 rounded-2xl border border-white/40 bg-white/90 p-4 shadow-lg backdrop-blur md:start-auto md:end-6 md:w-64"
            >
              <p className="text-xs font-semibold text-brand-600">معاينة مادة</p>
              <p className="mt-1 font-bold">{courses[0]?.title ?? "أساسيات إدارة الأعمال"}</p>
              <p className="mt-1 text-xs text-muted-foreground">مسار بصري · لغة إشارة</p>
            </motion.div>
            {featured ? (
              <motion.div
                initial={{ opacity: 0, x: -12 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.55 }}
                className="absolute -top-3 start-4 hidden w-48 overflow-hidden rounded-2xl border border-white/50 bg-white/95 shadow-lg md:block"
              >
                <div className="relative h-20">
                  <Image
                    src={featured.coverImage || talentImage(featured.id)}
                    alt=""
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="p-3">
                  <p className="text-[10px] font-semibold text-brand-600">موهبة مميزة</p>
                  <p className="truncate text-sm font-bold">{featured.title}</p>
                </div>
              </motion.div>
            ) : null}
          </motion.div>
        </div>
      </section>

      {continueCourse && session?.studentId ? (
        <Section tone="soft">
          <div className="flex flex-col items-start justify-between gap-6 rounded-[1.75rem] border border-border/50 bg-card p-6 md:flex-row md:items-center md:p-8">
            <div>
              <p className="text-sm font-semibold text-brand-600">آخر ما كنت تتعلمه</p>
              <h2 className="mt-2 text-2xl font-bold">{continueCourse.title}</h2>
              <p className="mt-1 text-muted-foreground">
                {getCourseProgress(
                  session.studentId,
                  continueCourse.id,
                  continueCourse.lessonIds
                )}
                % مكتمل
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
                <Play className="size-4" /> متابعة الدرس
              </Link>
            </Button>
          </div>
        </Section>
      ) : null}

      <Section>
        <SectionHeading
          eyebrow="استكشف"
          title="اكتشف حسب التخصص"
          description="مسارات بصرية عبر التخصصات الجامعية."
        />
        <HorizontalScroller>
          {SPECIALTY_VISUALS.map((s) => (
            <Link
              key={s.id}
              href="/learn"
              className="group relative min-w-[220px] overflow-hidden rounded-3xl"
            >
              <div className="relative h-44 w-[220px]">
                <Image
                  src={s.image}
                  alt={s.title}
                  fill
                  className="object-cover transition duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-brand-900/40" />
                <p className="absolute inset-x-0 bottom-0 p-4 text-lg font-bold text-white">
                  {s.title}
                </p>
              </div>
            </Link>
          ))}
        </HorizontalScroller>
      </Section>

      <Section tone="mist">
        <SectionHeading
          eyebrow="كيف نتعلم"
          title="تعلّم بصري بالكامل"
          description="كل درس يمر بخطوات واضحة دون الاعتماد على الصوت."
        />
        <VisualStepper
          steps={[
            { label: "درس", icon: <BookOpen className="size-5" /> },
            { label: "ملخص بصري", icon: <LayoutGrid className="size-5" /> },
            { label: "مخطط", icon: <Sparkles className="size-5" /> },
            { label: "فيديو بلغة الإشارة", icon: <Hand className="size-5" /> },
            { label: "اختبار", icon: <Video className="size-5" /> },
          ]}
        />
      </Section>

      <Section>
        <SectionHeading eyebrow="المواهب" title="عرض إبداعي" />
        {featured ? (
          <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
            <Link
              href={`/talents/${featured.id}`}
              className="group relative min-h-[360px] overflow-hidden rounded-[2rem]"
            >
              <Image
                src={featured.coverImage || talentImage(featured.id)}
                alt={featured.title}
                fill
                className="object-cover transition duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-brand-900/80 via-brand-900/20 to-transparent" />
              <div className="absolute inset-x-0 bottom-0 p-8 text-white">
                <p className="text-sm font-semibold text-brand-200">موهبة الأسبوع</p>
                <h3 className="mt-2 text-3xl font-bold">{featured.title}</h3>
                <p className="mt-2 text-white/80">{featured.studentName}</p>
              </div>
            </Link>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
              {talents
                .filter((t) => t.id !== featured.id)
                .slice(0, 3)
                .map((t, i) => (
                  <Link
                    key={t.id}
                    href={`/talents/${t.id}`}
                    className="group flex gap-4 overflow-hidden rounded-3xl border border-border/50 bg-card"
                  >
                    <div className="relative h-28 w-28 shrink-0 overflow-hidden">
                      <Image
                        src={t.coverImage || talentImage(t.id, i)}
                        alt=""
                        fill
                        className="object-cover transition group-hover:scale-105"
                      />
                    </div>
                    <div className="flex flex-col justify-center py-3 pe-4">
                      <p className="font-bold leading-snug">{t.title}</p>
                      <p className="mt-1 text-sm text-muted-foreground">
                        {t.studentName}
                      </p>
                    </div>
                  </Link>
                ))}
            </div>
          </div>
        ) : null}
      </Section>

      <Section tone="soft">
        <SectionHeading eyebrow="قصص" title="أصوات بصرية من الطلبة" />
        <div className="grid gap-8 md:grid-cols-3">
          {students.slice(0, 3).map((stu) => (
            <Link
              key={stu.id}
              href={`/students/${stu.id}`}
              className="space-y-4"
            >
              <div className="relative aspect-[4/5] overflow-hidden rounded-[1.75rem]">
                <Image
                  src={stu.avatar || studentAvatar(stu.id)}
                  alt={`${stu.firstName} ${stu.lastName}`}
                  fill
                  className="object-cover"
                />
              </div>
              <div>
                <h3 className="text-lg font-bold">
                  {stu.firstName} {stu.lastName}
                </h3>
                <p className="text-sm text-brand-700">{stu.major}</p>
                <p className="mt-2 line-clamp-3 text-sm text-muted-foreground">
                  {stu.bio}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </Section>

      <Section>
        <EditorialSplit>
          <div>
            <SectionHeading
              className="mb-0"
              eyebrow="لماذا الأمل الصامت؟"
              title="مصمّمة لاحتياجات الطالب الأصم"
              description="محتوى جامعي بصري، اكتشاف مواهب، وتعلّم لا يعتمد على الشرح الصوتي."
            />
            <ul className="mt-8 space-y-4 text-sm leading-relaxed">
              {[
                "محتوى جامعي بمخططات وملخصات بصرية",
                "فضاء رقمي لعرض وتنمية المهارات",
                "تجربة دامجة 100٪ بدون اعتماد على الصوت",
              ].map((item) => (
                <li key={item} className="flex gap-3">
                  <span className="mt-1 size-2 shrink-0 rounded-full bg-primary" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
          <div className="relative min-h-[280px] overflow-hidden rounded-[2rem]">
            <Image
              src={courseImage("course_001")}
              alt=""
              fill
              className="object-cover"
            />
          </div>
        </EditorialSplit>
      </Section>

      <Section>
        <SectionHeading title="ابدأ من مادة جاهزة" />
        <HorizontalScroller>
          {courses.map((c) => (
            <CourseTile key={c.id} course={c} />
          ))}
        </HorizontalScroller>
      </Section>

      <section className="px-4 pb-20 md:px-6">
        <div className="container mx-auto overflow-hidden rounded-[2rem] gradient-hero px-8 py-14 text-primary-foreground md:px-14">
          <h2 className="max-w-xl text-3xl font-bold md:text-4xl">
            جاهز تبدأ رحلتك البصرية؟
          </h2>
          <p className="mt-3 max-w-lg text-primary-foreground/85">
            أنشئ حساباً وانضم إلى أكاديمية الأمل الصامت.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Button asChild size="lg" className="bg-white text-brand-800 hover:bg-brand-50">
              <Link href="/register">إنشاء حساب</Link>
            </Button>
            <Button
              asChild
              size="lg"
              variant="outline"
              className="border-white/40 bg-transparent text-white hover:bg-white/10"
            >
              <Link href="/learn">تصفّح التعلّم</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
