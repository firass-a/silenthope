"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Section, SectionHeading } from "@/components/brand/section";
import { useSubscriptionsStore } from "@/stores/subscriptions.store";
import { cn } from "@/lib/utils";

const PLAN_META: Record<
  string,
  { title: string; price: string; features: string[]; highlight?: boolean }
> = {
  free: {
    title: "مجاني",
    price: "0 دج",
    features: ["تصفح المواد المنشورة", "عرض المواهب", "حساب طالب أساسي"],
  },
  student: {
    title: "طالب",
    price: "1 900 دج / فصل",
    features: [
      "مسارات تعلّم كاملة",
      "حفظ التقدّم",
      "إرسال مواهب للمراجعة",
      "إشعارات بصرية",
    ],
    highlight: true,
  },
  premium: {
    title: "متميّز",
    price: "3 900 دج / فصل",
    features: [
      "كل مزايا طالب",
      "أولوية مراجعة المواهب",
      "شارات إنجاز",
      "دعم أولوية",
    ],
  },
};

export default function SubscriptionsPage() {
  const plans = useSubscriptionsStore((s) => s.subscriptions);

  const uniquePlans = ["free", "student", "premium"] as const;

  return (
    <div>
      <section className="gradient-mist border-b border-border/40">
        <div className="container mx-auto px-4 py-16 md:px-6 md:py-24">
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
            <p className="text-sm font-semibold text-brand-600">الاشتراكات</p>
            <h1 className="mt-3 text-display">اختر مساحتك</h1>
            <p className="mt-4 max-w-xl text-lg text-muted-foreground">
              خطط بسيطة تدعم التعلّم البصري وتنمية المواهب. جميع الأسعار بالدينار الجزائري.
            </p>
          </motion.div>
        </div>
      </section>

      <Section>
        <div className="grid gap-6 lg:grid-cols-3">
          {uniquePlans.map((plan) => {
            const meta = PLAN_META[plan];
            const sample = plans.find((p) => p.plan === plan);
            return (
              <div
                key={plan}
                className={cn(
                  "flex flex-col rounded-[2rem] border p-7",
                  meta.highlight
                    ? "border-primary bg-brand-50/60 shadow-lg shadow-brand-600/10"
                    : "border-border/60 bg-card"
                )}
              >
                <p className="text-sm font-semibold text-brand-700">{meta.title}</p>
                <p className="mt-3 text-3xl font-bold">{meta.price}</p>
                {sample ? (
                  <p className="mt-1 text-xs text-muted-foreground">
                    حالة نموذجية: {sample.status}
                  </p>
                ) : null}
                <ul className="mt-6 flex-1 space-y-3">
                  {meta.features.map((f) => (
                    <li key={f} className="flex gap-2 text-sm">
                      <Check className="mt-0.5 size-4 shrink-0 text-brand-600" />
                      {f}
                    </li>
                  ))}
                </ul>
                <Button asChild className="mt-8" variant={meta.highlight ? "default" : "outline"}>
                  <Link href="/register">ابدأ الآن</Link>
                </Button>
              </div>
            );
          })}
        </div>
      </Section>

      <Section tone="soft">
        <SectionHeading
          title="للتعلّم أولاً"
          description="الاشتراك يدعم استمرارية المحتوى — التجربة التعليمية تبقى في قلب المنصة."
        />
      </Section>
    </div>
  );
}
