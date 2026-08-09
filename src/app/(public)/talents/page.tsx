"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { Section, SectionHeading, HorizontalScroller } from "@/components/brand/section";
import { Button } from "@/components/ui/button";
import { talentImage } from "@/lib/media";
import { useTalentsStore } from "@/stores/talents.store";
import { useCategoriesByType } from "@/hooks/use-stable-store";
import { useAuthStore } from "@/stores/auth.store";
import { cn } from "@/lib/utils";

export default function TalentsShowcasePage() {
  const session = useAuthStore((s) => s.session);
  const talents = useTalentsStore((s) => s.talents);
  const categories = useCategoriesByType("talent");
  const [domain, setDomain] = useState<string>("all");

  const visible = useMemo(() => {
    const base = talents.filter(
      (t) => t.status === "approved" || t.status === "featured"
    );
    if (domain === "all") return base;
    return base.filter((t) => t.categoryId === domain);
  }, [talents, domain]);

  const featured = visible.find((t) => t.featured) ?? visible[0];
  const rest = visible.filter((t) => t.id !== featured?.id);

  return (
    <div>
      <section className="relative overflow-hidden border-b border-border/40">
        <div className="absolute inset-0 gradient-mist" />
        <div className="container relative mx-auto flex flex-col gap-6 px-4 py-16 md:flex-row md:items-end md:justify-between md:px-6 md:py-24">
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
            <p className="text-sm font-semibold text-brand-600">فضاء إبداعي</p>
            <h1 className="mt-3 text-display">اكتشف المواهب</h1>
            <p className="mt-4 max-w-xl text-lg text-muted-foreground">
              معرض بصري لأعمال الطلبة — فن، تصميم، برمجة، تصوير، وكتابة.
            </p>
          </motion.div>
          {session?.role === "student" ? (
            <Button asChild size="lg">
              <Link href="/me/talents?new=1">أرسل موهبتك</Link>
            </Button>
          ) : (
            <Button asChild size="lg" variant="outline">
              <Link href="/register">انضم لتعرض أعمالك</Link>
            </Button>
          )}
        </div>
      </section>

      <Section>
        <SectionHeading title="اكتشف حسب المجال" />
        <HorizontalScroller className="pb-4">
          <button
            type="button"
            onClick={() => setDomain("all")}
            className={cn(
              "shrink-0 rounded-full border px-4 py-2 text-sm font-medium",
              domain === "all"
                ? "border-primary bg-primary text-primary-foreground"
                : "border-border bg-card hover:bg-secondary"
            )}
          >
            الكل
          </button>
          {categories.map((c) => (
            <button
              key={c.id}
              type="button"
              onClick={() => setDomain(c.id)}
              className={cn(
                "shrink-0 rounded-full border px-4 py-2 text-sm font-medium",
                domain === c.id
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border bg-card hover:bg-secondary"
              )}
            >
              {c.name}
            </button>
          ))}
        </HorizontalScroller>
      </Section>

      {featured ? (
        <Section tone="soft">
          <p className="mb-4 text-sm font-semibold text-brand-600">موهبة الأسبوع</p>
          <Link
            href={`/talents/${featured.id}`}
            className="group relative block min-h-[420px] overflow-hidden rounded-[2rem]"
          >
            <Image
              src={featured.coverImage || talentImage(featured.id)}
              alt={featured.title}
              fill
              className="object-cover transition duration-700 group-hover:scale-105"
              priority
            />
            <div className="absolute inset-0 bg-gradient-to-t from-brand-900/85 via-brand-900/25 to-transparent" />
            <div className="absolute inset-x-0 bottom-0 p-8 text-white md:p-12">
              <h2 className="text-3xl font-bold md:text-5xl">{featured.title}</h2>
              <p className="mt-3 text-lg text-white/85">{featured.studentName}</p>
              <p className="mt-3 max-w-2xl line-clamp-2 text-white/75">
                {featured.description}
              </p>
            </div>
          </Link>
        </Section>
      ) : null}

      <Section>
        <SectionHeading title="المعرض" />
        <div className="columns-1 gap-5 sm:columns-2 lg:columns-3">
          {rest.map((t, i) => (
            <Link
              key={t.id}
              href={`/talents/${t.id}`}
              className="mb-5 block break-inside-avoid overflow-hidden rounded-3xl border border-border/40 bg-card"
            >
              <div
                className="relative w-full overflow-hidden"
                style={{ aspectRatio: i % 3 === 0 ? "3/4" : i % 3 === 1 ? "1/1" : "4/3" }}
              >
                <Image
                  src={t.coverImage || talentImage(t.id, i)}
                  alt={t.title}
                  fill
                  className="object-cover transition hover:scale-105"
                  sizes="(max-width:768px) 100vw, 33vw"
                />
              </div>
              <div className="p-4">
                <h3 className="font-bold">{t.title}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{t.studentName}</p>
              </div>
            </Link>
          ))}
        </div>
      </Section>
    </div>
  );
}
