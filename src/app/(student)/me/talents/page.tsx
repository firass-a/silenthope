"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { toast } from "sonner";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Section, SectionHeading } from "@/components/brand/section";
import { StatusBadge } from "@/components/shared/status-badge";
import { EmptyState } from "@/components/shared/empty-state";
import { useAuthStore } from "@/stores/auth.store";
import { useTalentsStore } from "@/stores/talents.store";
import { useStudentsStore } from "@/stores/students.store";
import { useCategoriesByType } from "@/hooks/use-stable-store";
import { cn, formatDate } from "@/lib/utils";

const WIZARD = [
  "معلومات أساسية",
  "التصنيف",
  "الوسائط",
  "الوصف",
  "المهارات",
  "معاينة",
] as const;

function MeTalentsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const session = useAuthStore((s) => s.session);
  const students = useStudentsStore((s) => s.students);
  const talents = useTalentsStore((s) => s.talents);
  const addTalent = useTalentsStore((s) => s.addTalent);
  const categories = useCategoriesByType("talent");

  const student = useMemo(() => {
    if (session?.studentId) return students.find((s) => s.id === session.studentId);
    return students.find((s) => s.email === session?.email);
  }, [students, session]);

  const mine = useMemo(
    () =>
      talents.filter(
        (t) => t.studentId === student?.id || t.studentName === session?.name
      ),
    [talents, student, session]
  );

  const [wizardOpen, setWizardOpen] = useState(false);
  const [step, setStep] = useState(0);
  const [form, setForm] = useState({
    title: "",
    categoryId: categories[0]?.id ?? "",
    media: "",
    description: "",
    skills: "",
  });

  useEffect(() => {
    if (!session) {
      router.replace("/login");
      return;
    }
    if (session.role !== "student") {
      router.replace("/admin");
    }
  }, [session, router]);

  useEffect(() => {
    if (searchParams.get("new") === "1") {
      setWizardOpen(true);
      setStep(0);
    }
  }, [searchParams]);

  function closeWizard() {
    setWizardOpen(false);
    router.replace("/me/talents");
  }

  function next() {
    if (step === 0 && form.title.trim().length < 3) {
      toast.error("أدخل عنواناً واضحاً");
      return;
    }
    if (step === 1 && !form.categoryId) {
      toast.error("اختر تصنيفاً");
      return;
    }
    if (step === 3 && form.description.trim().length < 10) {
      toast.error("أضف وصفاً أوضح");
      return;
    }
    if (step === WIZARD.length - 1) {
      if (!session) return;
      addTalent({
        studentId: student?.id ?? "stu_unknown",
        studentName: student
          ? `${student.firstName} ${student.lastName}`
          : session.name,
        title: form.title,
        description: form.description,
        categoryId: form.categoryId,
        media: form.media
          ? form.media.split("\n").map((s) => s.trim()).filter(Boolean)
          : [],
        skills: form.skills
          ? form.skills.split(",").map((s) => s.trim()).filter(Boolean)
          : [],
        status: "pending",
      });
      toast.success("تم إرسال الموهبة للمراجعة");
      setForm({
        title: "",
        categoryId: categories[0]?.id ?? "",
        media: "",
        description: "",
        skills: "",
      });
      closeWizard();
      return;
    }
    setStep((s) => s + 1);
  }

  if (!session || session.role !== "student") {
    return null;
  }

  return (
    <div>
      <Section>
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <SectionHeading
            className="mb-0"
            eyebrow="مساحتي"
            title="مواهبي"
            description="أرسل أعمالك وتابع حالتها حتى الموافقة."
          />
          <Button
            size="lg"
            onClick={() => {
              setWizardOpen(true);
              setStep(0);
              router.replace("/me/talents?new=1");
            }}
          >
            <Plus /> إضافة موهبة
          </Button>
        </div>

        {mine.length === 0 ? (
          <div className="mt-10">
            <EmptyState
              title="لا توجد مواهب بعد"
              description="شارك أول عمل لك ليراجعه فريق المنصة."
              actionLabel="إضافة موهبة"
              onAction={() => {
                setWizardOpen(true);
                router.replace("/me/talents?new=1");
              }}
            />
          </div>
        ) : (
          <div className="mt-10 grid gap-4 md:grid-cols-2">
            {mine.map((t) => (
              <div
                key={t.id}
                className="rounded-3xl border border-border/60 bg-card p-5"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="text-lg font-bold">{t.title}</h3>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {formatDate(t.createdAt)}
                    </p>
                  </div>
                  <StatusBadge status={t.status} />
                </div>
                <p className="mt-3 line-clamp-3 text-sm text-muted-foreground">
                  {t.description}
                </p>
                {t.status === "approved" || t.status === "featured" ? (
                  <Button asChild variant="link" className="mt-2 px-0">
                    <Link href={`/talents/${t.id}`}>عرض في المعرض</Link>
                  </Button>
                ) : null}
              </div>
            ))}
          </div>
        )}
      </Section>

      <AnimatePresence>
        {wizardOpen ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-end justify-center bg-brand-900/40 p-4 backdrop-blur-sm sm:items-center"
          >
            <motion.div
              initial={{ y: 24, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 24, opacity: 0 }}
              className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-[1.75rem] bg-background p-6 shadow-xl"
              role="dialog"
              aria-modal="true"
              aria-labelledby="talent-wizard-title"
            >
              <p className="text-sm font-semibold text-brand-600">
                الخطوة {step + 1} / {WIZARD.length}
              </p>
              <h2 id="talent-wizard-title" className="mt-1 text-2xl font-bold">
                {WIZARD[step]}
              </h2>

              <div className="mt-6 space-y-4">
                {step === 0 ? (
                  <div className="space-y-2">
                    <Label>عنوان الموهبة</Label>
                    <Input
                      value={form.title}
                      onChange={(e) => setForm({ ...form, title: e.target.value })}
                    />
                  </div>
                ) : null}
                {step === 1 ? (
                  <div className="flex flex-wrap gap-2">
                    {categories.map((c) => (
                      <button
                        key={c.id}
                        type="button"
                        onClick={() => setForm({ ...form, categoryId: c.id })}
                        className={cn(
                          "rounded-full border px-4 py-2 text-sm",
                          form.categoryId === c.id
                            ? "border-primary bg-primary text-primary-foreground"
                            : "border-border"
                        )}
                      >
                        {c.name}
                      </button>
                    ))}
                  </div>
                ) : null}
                {step === 2 ? (
                  <div className="space-y-2">
                    <Label>روابط الوسائط (سطر لكل رابط)</Label>
                    <Textarea
                      rows={4}
                      value={form.media}
                      onChange={(e) => setForm({ ...form, media: e.target.value })}
                      placeholder="https://..."
                      dir="ltr"
                      className="text-left"
                    />
                  </div>
                ) : null}
                {step === 3 ? (
                  <div className="space-y-2">
                    <Label>الوصف</Label>
                    <Textarea
                      rows={5}
                      value={form.description}
                      onChange={(e) =>
                        setForm({ ...form, description: e.target.value })
                      }
                    />
                  </div>
                ) : null}
                {step === 4 ? (
                  <div className="space-y-2">
                    <Label>مهارات مفصولة بفاصلة</Label>
                    <Input
                      value={form.skills}
                      onChange={(e) => setForm({ ...form, skills: e.target.value })}
                      placeholder="تصميم, رسم, ..."
                    />
                  </div>
                ) : null}
                {step === 5 ? (
                  <div className="space-y-2 rounded-2xl bg-secondary/50 p-4 text-sm">
                    <p className="font-bold">{form.title}</p>
                    <p className="text-muted-foreground">{form.description}</p>
                    <p>المهارات: {form.skills || "—"}</p>
                    <p className="text-brand-700">الحالة بعد الإرسال: قيد المراجعة</p>
                  </div>
                ) : null}
              </div>

              <div className="mt-8 flex justify-between gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    if (step === 0) closeWizard();
                    else setStep((s) => s - 1);
                  }}
                >
                  {step === 0 ? "إلغاء" : "رجوع"}
                </Button>
                <Button type="button" onClick={next}>
                  {step === WIZARD.length - 1 ? "إرسال للمراجعة" : "متابعة"}
                </Button>
              </div>
            </motion.div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}

export default function MeTalentsPage() {
  return (
    <Suspense fallback={<div className="p-10 text-center">…</div>}>
      <MeTalentsContent />
    </Suspense>
  );
}
