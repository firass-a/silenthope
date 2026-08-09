"use client";

import { use, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Section, SectionHeading, HorizontalScroller } from "@/components/brand/section";
import { talentImage } from "@/lib/media";
import { useTalentsStore } from "@/stores/talents.store";
import { useCategoriesStore } from "@/stores/categories.store";
import { StatusBadge } from "@/components/shared/status-badge";

export default function TalentProfilePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const allTalents = useTalentsStore((s) => s.talents);
  const categories = useCategoriesStore((s) => s.categories);

  const talent = useMemo(
    () => allTalents.find((t) => t.id === id),
    [allTalents, id]
  );
  const related = useMemo(
    () =>
      allTalents.filter(
        (t) =>
          t.id !== id &&
          (t.status === "approved" || t.status === "featured") &&
          t.categoryId === talent?.categoryId
      ),
    [allTalents, id, talent?.categoryId]
  );
  const category = useMemo(
    () => categories.find((c) => c.id === talent?.categoryId),
    [categories, talent?.categoryId]
  );

  if (!talent) {
    return (
      <div className="container mx-auto px-4 py-20 text-center">
        <h1 className="text-2xl font-bold">الموهبة غير موجودة</h1>
        <Button asChild className="mt-6">
          <Link href="/talents">العودة للمعرض</Link>
        </Button>
      </div>
    );
  }

  const gallery = [
    talent.coverImage || talentImage(talent.id),
    ...talent.media,
    talentImage(talent.id, 1),
    talentImage(talent.id, 2),
  ].filter(Boolean).slice(0, 4);

  return (
    <div>
      <section className="relative min-h-[55vh] overflow-hidden">
        <Image
          src={gallery[0]}
          alt={talent.title}
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-t from-brand-900 via-brand-900/50 to-brand-900/20" />
        <div className="container relative mx-auto flex min-h-[55vh] flex-col justify-end px-4 pb-12 pt-28 text-white md:px-6">
          <div className="flex flex-wrap items-center gap-3">
            <StatusBadge status={talent.status} />
            {category ? (
              <span className="rounded-full bg-white/15 px-3 py-1 text-sm backdrop-blur">
                {category.name}
              </span>
            ) : null}
          </div>
          <h1 className="mt-4 max-w-3xl text-4xl font-bold md:text-5xl">
            {talent.title}
          </h1>
          <Link
            href={`/students/${talent.studentId}`}
            className="mt-3 text-lg text-white/85 hover:underline"
          >
            {talent.studentName}
          </Link>
        </div>
      </section>

      <Section>
        <div className="grid gap-12 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="space-y-8">
            <div>
              <h2 className="text-2xl font-bold">عن العمل</h2>
              <p className="mt-4 text-lg leading-relaxed text-muted-foreground">
                {talent.description}
              </p>
            </div>
            <div>
              <h2 className="text-xl font-bold">معرض</h2>
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                {gallery.map((src, i) => (
                  <div
                    key={i}
                    className="relative aspect-[4/3] overflow-hidden rounded-3xl"
                  >
                    <Image src={src} alt="" fill className="object-cover" />
                  </div>
                ))}
              </div>
            </div>
          </div>
          <aside className="space-y-6">
            <div className="rounded-3xl border border-border/60 p-6">
              <h2 className="font-bold">المهارات</h2>
              <div className="mt-4 flex flex-wrap gap-2">
                {talent.skills.length ? (
                  talent.skills.map((s) => (
                    <span
                      key={s}
                      className="rounded-full bg-brand-100 px-3 py-1 text-sm font-medium text-brand-800"
                    >
                      {s}
                    </span>
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground">لا توجد مهارات مضافة</p>
                )}
              </div>
            </div>
            <div className="rounded-3xl gradient-mist p-6 text-sm text-muted-foreground">
              <p>
                مشاهدات: <strong className="text-foreground">{talent.views}</strong>
              </p>
              <p className="mt-2">
                إعجابات: <strong className="text-foreground">{talent.likes}</strong>
              </p>
            </div>
          </aside>
        </div>
      </Section>

      {related.length ? (
        <Section tone="soft">
          <SectionHeading title="عرض المزيد من المواهب" />
          <HorizontalScroller>
            {related.slice(0, 6).map((t, i) => (
              <Link
                key={t.id}
                href={`/talents/${t.id}`}
                className="min-w-[240px] overflow-hidden rounded-3xl border border-border/50 bg-card"
              >
                <div className="relative h-40">
                  <Image
                    src={t.coverImage || talentImage(t.id, i)}
                    alt=""
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="p-4">
                  <p className="font-bold">{t.title}</p>
                  <p className="text-sm text-muted-foreground">{t.studentName}</p>
                </div>
              </Link>
            ))}
          </HorizontalScroller>
        </Section>
      ) : null}
    </div>
  );
}
