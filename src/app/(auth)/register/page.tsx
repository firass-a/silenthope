"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { Check, GraduationCap, Shield } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { INTEREST_CHIPS, SUBJECT_CHIPS } from "@/lib/media";
import { useAuthStore } from "@/stores/auth.store";
import { BrandLogo } from "@/components/brand/brand-logo";

const STEPS = [
  "من أنت؟",
  "معلوماتك",
  "دراستك",
  "اهتماماتك",
  "ماذا تتعلم؟",
  "جاهز!",
] as const;

export default function RegisterPage() {
  const router = useRouter();
  const registerStudent = useAuthStore((s) => s.registerStudent);
  const [step, setStep] = useState(0);
  const [roleChoice, setRoleChoice] = useState<"student" | "staff" | null>(null);
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    university: "",
    faculty: "",
    major: "",
    academicLevel: "السنة الأولى",
    interests: [] as string[],
    subjects: [] as string[],
  });

  function toggleChip(list: "interests" | "subjects", value: string) {
    setForm((f) => {
      const cur = f[list];
      return {
        ...f,
        [list]: cur.includes(value)
          ? cur.filter((x) => x !== value)
          : [...cur, value],
      };
    });
  }

  function next() {
    if (step === 0) {
      if (roleChoice === "staff") {
        toast.message("دخول المسؤولين عبر صفحة تسجيل الدخول");
        router.push("/login");
        return;
      }
      if (!roleChoice) {
        toast.error("اختر نوع الحساب للمتابعة");
        return;
      }
    }
    if (step === 1) {
      if (!form.firstName || !form.lastName || !form.email || form.password.length < 6) {
        toast.error("أكمل المعلومات وكلمة مرور من 6 أحرف على الأقل");
        return;
      }
    }
    if (step === 2) {
      if (!form.university || !form.faculty || !form.major) {
        toast.error("أكمل بيانات دراستك");
        return;
      }
    }
    if (step === 3 && form.interests.length === 0) {
      toast.error("اختر اهتماماً واحداً على الأقل");
      return;
    }
    if (step === 4 && form.subjects.length === 0) {
      toast.error("اختر مادة واحدة على الأقل");
      return;
    }
    if (step === 5) {
      const result = registerStudent(form);
      if (!result.ok) {
        toast.error(result.message);
        return;
      }
      toast.success(result.message);
      router.push("/home");
      return;
    }
    setStep((s) => Math.min(s + 1, STEPS.length - 1));
  }

  function back() {
    setStep((s) => Math.max(s - 1, 0));
  }

  return (
    <div className="mx-auto flex min-h-screen max-w-5xl flex-col px-4 py-8 md:px-6 md:py-12">
      <div className="mb-8 flex items-center justify-between gap-4">
        <Link href="/" className="flex items-center">
          <BrandLogo size="sm" withWordmark />
        </Link>
        <Button asChild variant="ghost" size="sm">
          <Link href="/login">لديك حساب؟ دخول</Link>
        </Button>
      </div>

      <div className="mb-8">
        <p className="text-sm font-semibold text-brand-600">
          الخطوة {step + 1} من {STEPS.length}
        </p>
        <h1 className="mt-2 text-3xl font-bold md:text-4xl">{STEPS[step]}</h1>
        <div className="mt-5 flex gap-1.5" aria-hidden>
          {STEPS.map((_, i) => (
            <div
              key={i}
              className={cn(
                "h-1.5 flex-1 rounded-full transition",
                i <= step ? "bg-primary" : "bg-border"
              )}
            />
          ))}
        </div>
      </div>

      <div className="flex-1 rounded-[2rem] border border-border/60 bg-card/70 p-6 shadow-sm md:p-10">
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 24 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -24 }}
            transition={{ duration: 0.25 }}
            className="space-y-6"
          >
            {step === 0 ? (
              <div className="grid gap-4 sm:grid-cols-2">
                <button
                  type="button"
                  onClick={() => setRoleChoice("student")}
                  className={cn(
                    "rounded-3xl border p-6 text-start transition",
                    roleChoice === "student"
                      ? "border-primary bg-brand-50 shadow-sm"
                      : "border-border hover:bg-secondary/60"
                  )}
                >
                  <GraduationCap className="mb-4 size-8 text-brand-600" />
                  <p className="text-xl font-bold">طالب</p>
                  <p className="mt-2 text-sm text-muted-foreground">
                    ابدأ رحلتك في التعلّم البصري وتنمية مواهبك.
                  </p>
                </button>
                <button
                  type="button"
                  onClick={() => setRoleChoice("staff")}
                  className={cn(
                    "rounded-3xl border p-6 text-start transition",
                    roleChoice === "staff"
                      ? "border-primary bg-brand-50 shadow-sm"
                      : "border-border hover:bg-secondary/60"
                  )}
                >
                  <Shield className="mb-4 size-8 text-brand-600" />
                  <p className="text-xl font-bold">مسؤول / مشرف</p>
                  <p className="mt-2 text-sm text-muted-foreground">
                    الدخول عبر حسابات الإدارة المخصّصة.
                  </p>
                </button>
              </div>
            ) : null}

            {step === 1 ? (
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="firstName">الاسم</Label>
                  <Input
                    id="firstName"
                    value={form.firstName}
                    onChange={(e) => setForm({ ...form, firstName: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">اللقب</Label>
                  <Input
                    id="lastName"
                    value={form.lastName}
                    onChange={(e) => setForm({ ...form, lastName: e.target.value })}
                  />
                </div>
                <div className="space-y-2 sm:col-span-2">
                  <Label htmlFor="email">البريد الإلكتروني</Label>
                  <Input
                    id="email"
                    type="email"
                    dir="ltr"
                    className="text-left"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                  />
                </div>
                <div className="space-y-2 sm:col-span-2">
                  <Label htmlFor="password">كلمة المرور</Label>
                  <Input
                    id="password"
                    type="password"
                    dir="ltr"
                    className="text-left"
                    value={form.password}
                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                  />
                </div>
              </div>
            ) : null}

            {step === 2 ? (
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2 sm:col-span-2">
                  <Label htmlFor="university">الجامعة</Label>
                  <Input
                    id="university"
                    value={form.university}
                    onChange={(e) => setForm({ ...form, university: e.target.value })}
                    placeholder="مثال: جامعة الجزائر 3"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="faculty">الكلية</Label>
                  <Input
                    id="faculty"
                    value={form.faculty}
                    onChange={(e) => setForm({ ...form, faculty: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="major">التخصص</Label>
                  <Input
                    id="major"
                    value={form.major}
                    onChange={(e) => setForm({ ...form, major: e.target.value })}
                  />
                </div>
                <div className="space-y-2 sm:col-span-2">
                  <Label htmlFor="level">المستوى الدراسي</Label>
                  <select
                    id="level"
                    className="flex h-11 w-full rounded-full border border-input bg-transparent px-4 text-sm"
                    value={form.academicLevel}
                    onChange={(e) =>
                      setForm({ ...form, academicLevel: e.target.value })
                    }
                  >
                    {[
                      "السنة الأولى",
                      "السنة الثانية",
                      "السنة الثالثة",
                      "السنة الرابعة",
                      "ماستر",
                    ].map((l) => (
                      <option key={l} value={l}>
                        {l}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            ) : null}

            {step === 3 ? (
              <div className="flex flex-wrap gap-2">
                {INTEREST_CHIPS.map((chip) => {
                  const on = form.interests.includes(chip);
                  return (
                    <button
                      key={chip}
                      type="button"
                      onClick={() => toggleChip("interests", chip)}
                      className={cn(
                        "rounded-full border px-4 py-2 text-sm font-medium transition",
                        on
                          ? "border-primary bg-primary text-primary-foreground"
                          : "border-border bg-background hover:bg-secondary"
                      )}
                    >
                      {on ? <Check className="me-1 inline size-3.5" /> : null}
                      {chip}
                    </button>
                  );
                })}
              </div>
            ) : null}

            {step === 4 ? (
              <div className="flex flex-wrap gap-2">
                {SUBJECT_CHIPS.map((chip) => {
                  const on = form.subjects.includes(chip);
                  return (
                    <button
                      key={chip}
                      type="button"
                      onClick={() => toggleChip("subjects", chip)}
                      className={cn(
                        "rounded-full border px-4 py-2 text-sm font-medium transition",
                        on
                          ? "border-primary bg-primary text-primary-foreground"
                          : "border-border bg-background hover:bg-secondary"
                      )}
                    >
                      {on ? <Check className="me-1 inline size-3.5" /> : null}
                      {chip}
                    </button>
                  );
                })}
              </div>
            ) : null}

            {step === 5 ? (
              <div className="space-y-4 text-center">
                <div className="mx-auto flex size-16 items-center justify-center rounded-3xl bg-brand-100 text-brand-700">
                  <Check className="size-8" />
                </div>
                <h2 className="text-2xl font-bold">
                  أهلاً {form.firstName} — ملفك جاهز
                </h2>
                <p className="mx-auto max-w-md text-muted-foreground">
                  سننشئ ملفك الأكاديمي وتفضيلاتك ونفتح مساحة التعلّم البصرية.
                </p>
                <ul className="mx-auto max-w-sm space-y-2 text-sm text-muted-foreground">
                  <li>
                    {form.university} — {form.major}
                  </li>
                  <li>{form.interests.join(" · ")}</li>
                  <li>{form.subjects.join(" · ")}</li>
                </ul>
              </div>
            ) : null}
          </motion.div>
        </AnimatePresence>

        <div className="mt-10 flex items-center justify-between gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={back}
            disabled={step === 0}
          >
            رجوع
          </Button>
          <Button type="button" size="lg" onClick={next}>
            {step === STEPS.length - 1 ? "إنشاء الحساب والبدء" : "متابعة"}
          </Button>
        </div>
      </div>
    </div>
  );
}
