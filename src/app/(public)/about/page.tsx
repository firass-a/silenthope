"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { Section, SectionHeading, EditorialSplit } from "@/components/brand/section";

const goals = [
  {
    title: "تعليم دامج وميسر",
    body: "تمكين الصم من الوصول إلى محتوى جامعي رقمي بصري شامل.",
  },
  {
    title: "تنمية المواهب",
    body: "تطوير القدرات الإبداعية والتقنية في بيئة رقمية متكاملة.",
  },
  {
    title: "إدماج اجتماعي",
    body: "بناء جسور بين الطالب الأصم ومحيطه الأكاديمي والمهني.",
  },
  {
    title: "نمو مستمر",
    body: "منصة قابلة للتوسع بإضافة محتوى تفاعلي وأدوات مستقبلية.",
  },
];

export default function AboutPage() {
  return (
    <div>
      <section className="relative overflow-hidden border-b border-border/40">
        <div className="absolute inset-0 gradient-mist" />
        <div className="container relative mx-auto px-4 py-20 md:px-6 md:py-28">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-3xl"
          >
            <p className="text-sm font-semibold text-brand-600">عن المنصة</p>
            <h1 className="mt-3 text-display">عن «الأمل الصامت»</h1>
            <p className="mt-6 text-lg leading-relaxed text-muted-foreground md:text-xl">
              مشروع رقمي مبتكر يحوّل التعليم الجامعي إلى تجربة بصرية متكاملة موجهة
              خصيصًا لفئة الصم — جامعة مصغّرة تجمع بين العلم والإبداع في مكان واحد.
            </p>
          </motion.div>
        </div>
      </section>

      <Section>
        <EditorialSplit>
          <div>
            <SectionHeading
              className="mb-0"
              eyebrow="رؤيتنا"
              title="عالم تعليمي بلا حواجز"
              description="نطمح إلى أن يصبح كل طالب أصم قادراً على متابعة دراسته الجامعية وتنمية مواهبه باستقلالية تامة."
            />
          </div>
          <div className="relative min-h-[300px] overflow-hidden rounded-[2rem]">
            <Image
              src="https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=1200&q=80"
              alt=""
              fill
              className="object-cover"
            />
          </div>
        </EditorialSplit>
      </Section>

      <Section tone="soft">
        <SectionHeading
          eyebrow="رسالتنا"
          title="تعليم بصري + تمكين"
          description="تقديم محتوى جامعي بصري عالي الجودة، وفضاء حر للمواهب، يجمع بين الفهم العميق والتعبير الإبداعي."
        />
      </Section>

      <Section>
        <SectionHeading eyebrow="أهدافنا" title="ما نسعى إليه" />
        <div className="grid gap-8 md:grid-cols-2">
          {goals.map((g, i) => (
            <div key={g.title} className="border-t border-border pt-6">
              <p className="text-sm font-bold text-brand-600">
                {String(i + 1).padStart(2, "0")}
              </p>
              <h3 className="mt-2 text-xl font-bold">{g.title}</h3>
              <p className="mt-2 text-muted-foreground">{g.body}</p>
            </div>
          ))}
        </div>
      </Section>
    </div>
  );
}
