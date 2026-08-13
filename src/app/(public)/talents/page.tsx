"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { ArrowLeft } from "lucide-react";
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

  const featured =
    visible.find((t) => t.featured) ??
    visible.find((t) => t.status === "featured") ??
    visible[0];

  const gallery = useMemo(
    () => visible.filter((t) => t.id !== featured?.id),
    [visible, featured?.id]
  );

  const categoryName = (id: string) =>
    categories.find((c) => c.id === id)?.name;

  return (
    <div>
      {/* Full-bleed hero — brand + one featured work */}
      <section className="relative min-h-[78vh] overflow-hidden">
        {featured ? (
          <Image
            src={featured.coverImage || talentImage(featured.id)}
            alt={featured.title}
            fill
            priority
            className="object-cover"
            sizes="100vw"
          />
        ) : (
          <div className="absolute inset-0 gradient-mist" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-brand-900 via-brand-900/55 to-brand-900/25" />
        <div className="absolute inset-0 bg-gradient-to-l from-transparent via-transparent to-brand-900/40" />

        <div className="container relative mx-auto flex min-h-[78vh] flex-col justify-end px-4 pb-12 pt-28 md:px-6 md:pb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="max-w-2xl text-white"
          >
            <p className="text-sm font-semibold tracking-wide text-brand-200">
              فضاء إبداعي
            </p>
            <h1 className="mt-3 text-display text-white">المواهب</h1>
            <p className="mt-4 max-w-lg text-base leading-relaxed text-white/85 md:text-lg">
              معرض بصري لأعمال الطلبة — فن، تصميم، برمجة، تصوير، وكتابة.
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              {session?.role === "student" ? (
                <Button asChild size="lg" className="bg-white text-brand-900 hover:bg-white/90">
                  <Link href="/me/talents?new=1">أرسل موهبتك</Link>
                </Button>
              ) : (
                <Button asChild size="lg" className="bg-white text-brand-900 hover:bg-white/90">
                  <Link href="/register">انضم لتعرض أعمالك</Link>
                </Button>
              )}
              {featured ? (
                <Button
                  asChild
                  size="lg"
                  variant="outline"
                  className="border-white/40 bg-white/10 text-white hover:bg-white/20 hover:text-white"
                >
                  <Link href={`/talents/${featured.id}`}>
                    موهبة الأسبوع
                    <ArrowLeft className="size-4" />
                  </Link>
                </Button>
              ) : null}
            </div>
            {featured ? (
              <p className="mt-8 border-t border-white/20 pt-5 text-sm text-white/80">
                <span className="font-semibold text-white">{featured.title}</span>
                <span className="mx-2 text-white/40">·</span>
                {featured.studentName}
              </p>
            ) : null}
          </motion.div>
        </div>
      </section>

      {/* Filters — understated text tabs, not pill clutter */}
      <div className="sticky top-0 z-20 border-b border-border/60 bg-background/90 backdrop-blur-md">
        <div className="container mx-auto flex gap-1 overflow-x-auto px-4 py-3 md:px-6">
          <button
            type="button"
            onClick={() => setDomain("all")}
            className={cn(
              "shrink-0 px-3 py-2 text-sm font-medium transition",
              domain === "all"
                ? "border-b-2 border-primary text-foreground"
                : "text-muted-foreground hover:text-foreground"
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
                "shrink-0 px-3 py-2 text-sm font-medium transition",
                domain === c.id
                  ? "border-b-2 border-primary text-foreground"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              {c.name}
            </button>
          ))}
        </div>
      </div>

      {/* Gallery — image-first tiles */}
      <section className="container mx-auto px-4 py-12 md:px-6 md:py-16">
        <div className="mb-8 flex items-end justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold md:text-3xl">المعرض</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              {visible.length} عمل معروض
            </p>
          </div>
        </div>

        {visible.length === 0 ? (
          <p className="py-20 text-center text-muted-foreground">
            لا توجد أعمال في هذا المجال حالياً.
          </p>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 lg:gap-5">
            {/* Keep featured in grid too when filtering its category, else show gallery list + featured first if all */}
            {(domain === "all" && featured
              ? [featured, ...gallery]
              : visible
            ).map((t, i) => (
              <motion.div
                key={t.id}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-40px" }}
                transition={{ duration: 0.4, delay: Math.min(i * 0.05, 0.2) }}
              >
                <Link
                  href={`/talents/${t.id}`}
                  className="group relative block aspect-[4/5] overflow-hidden rounded-2xl bg-muted"
                >
                  <Image
                    src={t.coverImage || talentImage(t.id, i)}
                    alt={t.title}
                    fill
                    className="object-cover transition duration-700 group-hover:scale-[1.04]"
                    sizes="(max-width:768px) 100vw, 33vw"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-brand-900/90 via-brand-900/25 to-transparent opacity-90 transition group-hover:opacity-100" />
                  <div className="absolute inset-x-0 bottom-0 p-5 text-white">
                    {categoryName(t.categoryId) ? (
                      <p className="text-xs font-medium text-brand-200">
                        {categoryName(t.categoryId)}
                      </p>
                    ) : null}
                    <h3 className="mt-1 text-lg font-bold leading-snug md:text-xl">
                      {t.title}
                    </h3>
                    <p className="mt-1 text-sm text-white/75">{t.studentName}</p>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
