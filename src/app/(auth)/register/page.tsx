"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { Check, ChevronLeft, GraduationCap, Shield } from "lucide-react";
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

const fieldClass = "h-10 rounded-xl";

export default function RegisterPage() {
  const router = useRouter();
  const registerStudent = useAuthStore((s) => s.registerStudent);
  const [step, setStep] = useState(0);
  const [roleChoice, setRoleChoice] = useState<"student" | "staff" | null>(
    "student"
  );
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
      if (
        !form.firstName ||
        !form.lastName ||
        !form.email ||
        form.password.length < 6
      ) {
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
    <div className="flex min-h-screen items-start justify-center px-4 py-6 sm:items-center sm:py-10">
      <div className="w-full max-w-md">
        <div className="mb-5 flex items-center justify-between gap-3">
          <Link href="/" className="flex items-center">
            <BrandLogo size="sm" withWordmark />
          </Link>
          <Link
            href="/login"
            className="text-sm font-medium text-brand-700 hover:underline"
          >
            لديك حساب؟ دخول
          </Link>
        </div>

        <div className="overflow-hidden rounded-2xl border border-border/70 bg-card shadow-sm">
          <div className="border-b border-border/60 px-5 py-4">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-xs font-semibold text-brand-600">
                  الخطوة {step + 1} / {STEPS.length}
                </p>
                <h1 className="mt-0.5 text-xl font-bold">{STEPS[step]}</h1>
              </div>
              <span className="rounded-full bg-brand-50 px-2.5 py-1 text-xs font-medium text-brand-700">
                {Math.round(((step + 1) / STEPS.length) * 100)}%
              </span>
            </div>
            <div className="mt-3 h-1 overflow-hidden rounded-full bg-secondary">
              <div
                className="h-full rounded-full bg-primary transition-all duration-300"
                style={{ width: `${((step + 1) / STEPS.length) * 100}%` }}
              />
            </div>
          </div>

          <div className="px-5 py-5">
            <AnimatePresence mode="wait">
              <motion.div
                key={step}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.2 }}
              >
                {step === 0 ? (
                  <div className="space-y-2">
                    <p className="mb-3 text-sm text-muted-foreground">
                      اختر نوع حسابك للمتابعة.
                    </p>
                    {(
                      [
                        {
                          id: "student" as const,
                          title: "طالب",
                          desc: "تعلّم بصري وتنمية مواهب",
                          icon: GraduationCap,
                        },
                        {
                          id: "staff" as const,
                          title: "مسؤول / مشرف",
                          desc: "الدخول عبر حسابات الإدارة",
                          icon: Shield,
                        },
                      ] as const
                    ).map((opt) => {
                      const Icon = opt.icon;
                      const on = roleChoice === opt.id;
                      return (
                        <button
                          key={opt.id}
                          type="button"
                          onClick={() => setRoleChoice(opt.id)}
                          className={cn(
                            "flex w-full items-center gap-3 rounded-xl border px-3.5 py-3 text-start transition",
                            on
                              ? "border-primary bg-brand-50"
                              : "border-border hover:bg-secondary/50"
                          )}
                        >
                          <span
                            className={cn(
                              "flex size-9 shrink-0 items-center justify-center rounded-lg",
                              on
                                ? "bg-primary text-primary-foreground"
                                : "bg-secondary text-brand-700"
                            )}
                          >
                            <Icon className="size-4" />
                          </span>
                          <span className="min-w-0 flex-1">
                            <span className="block text-sm font-bold">
                              {opt.title}
                            </span>
                            <span className="block text-xs text-muted-foreground">
                              {opt.desc}
                            </span>
                          </span>
                          <span
                            className={cn(
                              "size-4 shrink-0 rounded-full border",
                              on
                                ? "border-primary bg-primary"
                                : "border-border"
                            )}
                            aria-hidden
                          />
                        </button>
                      );
                    })}
                  </div>
                ) : null}

                {step === 1 ? (
                  <div className="grid gap-3 sm:grid-cols-2">
                    <div className="space-y-1.5">
                      <Label htmlFor="firstName" className="text-xs">
                        الاسم
                      </Label>
                      <Input
                        id="firstName"
                        className={fieldClass}
                        value={form.firstName}
                        onChange={(e) =>
                          setForm({ ...form, firstName: e.target.value })
                        }
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="lastName" className="text-xs">
                        اللقب
                      </Label>
                      <Input
                        id="lastName"
                        className={fieldClass}
                        value={form.lastName}
                        onChange={(e) =>
                          setForm({ ...form, lastName: e.target.value })
                        }
                      />
                    </div>
                    <div className="space-y-1.5 sm:col-span-2">
                      <Label htmlFor="email" className="text-xs">
                        البريد الإلكتروني
                      </Label>
                      <Input
                        id="email"
                        type="email"
                        dir="ltr"
                        className={cn(fieldClass, "text-left")}
                        value={form.email}
                        onChange={(e) =>
                          setForm({ ...form, email: e.target.value })
                        }
                      />
                    </div>
                    <div className="space-y-1.5 sm:col-span-2">
                      <Label htmlFor="password" className="text-xs">
                        كلمة المرور
                      </Label>
                      <Input
                        id="password"
                        type="password"
                        dir="ltr"
                        className={cn(fieldClass, "text-left")}
                        value={form.password}
                        onChange={(e) =>
                          setForm({ ...form, password: e.target.value })
                        }
                      />
                    </div>
                  </div>
                ) : null}

                {step === 2 ? (
                  <div className="grid gap-3 sm:grid-cols-2">
                    <div className="space-y-1.5 sm:col-span-2">
                      <Label htmlFor="university" className="text-xs">
                        الجامعة
                      </Label>
                      <Input
                        id="university"
                        className={fieldClass}
                        value={form.university}
                        onChange={(e) =>
                          setForm({ ...form, university: e.target.value })
                        }
                        placeholder="مثال: جامعة الجزائر 3"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="faculty" className="text-xs">
                        الكلية
                      </Label>
                      <Input
                        id="faculty"
                        className={fieldClass}
                        value={form.faculty}
                        onChange={(e) =>
                          setForm({ ...form, faculty: e.target.value })
                        }
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="major" className="text-xs">
                        التخصص
                      </Label>
                      <Input
                        id="major"
                        className={fieldClass}
                        value={form.major}
                        onChange={(e) =>
                          setForm({ ...form, major: e.target.value })
                        }
                      />
                    </div>
                    <div className="space-y-1.5 sm:col-span-2">
                      <Label htmlFor="level" className="text-xs">
                        المستوى الدراسي
                      </Label>
                      <select
                        id="level"
                        className="flex h-10 w-full rounded-xl border border-input bg-transparent px-3 text-sm"
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
                  <div>
                    <p className="mb-3 text-sm text-muted-foreground">
                      اختر ما يهمّك (واحد على الأقل).
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {INTEREST_CHIPS.map((chip) => {
                        const on = form.interests.includes(chip);
                        return (
                          <button
                            key={chip}
                            type="button"
                            onClick={() => toggleChip("interests", chip)}
                            className={cn(
                              "rounded-full border px-3 py-1.5 text-xs font-medium transition",
                              on
                                ? "border-primary bg-primary text-primary-foreground"
                                : "border-border bg-background hover:bg-secondary"
                            )}
                          >
                            {on ? (
                              <Check className="me-1 inline size-3" />
                            ) : null}
                            {chip}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ) : null}

                {step === 4 ? (
                  <div>
                    <p className="mb-3 text-sm text-muted-foreground">
                      المواد التي تريد متابعتها.
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {SUBJECT_CHIPS.map((chip) => {
                        const on = form.subjects.includes(chip);
                        return (
                          <button
                            key={chip}
                            type="button"
                            onClick={() => toggleChip("subjects", chip)}
                            className={cn(
                              "rounded-full border px-3 py-1.5 text-xs font-medium transition",
                              on
                                ? "border-primary bg-primary text-primary-foreground"
                                : "border-border bg-background hover:bg-secondary"
                            )}
                          >
                            {on ? (
                              <Check className="me-1 inline size-3" />
                            ) : null}
                            {chip}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ) : null}

                {step === 5 ? (
                  <div className="space-y-3 text-center">
                    <div className="mx-auto flex size-12 items-center justify-center rounded-2xl bg-brand-100 text-brand-700">
                      <Check className="size-6" />
                    </div>
                    <div>
                      <h2 className="text-lg font-bold">
                        أهلاً {form.firstName} — ملفك جاهز
                      </h2>
                      <p className="mt-1 text-sm text-muted-foreground">
                        سنفتح مساحة التعلّم بعد إنشاء الحساب.
                      </p>
                    </div>
                    <div className="rounded-xl bg-secondary/60 px-3 py-3 text-start text-xs leading-relaxed text-muted-foreground">
                      <p>
                        {form.university} — {form.major}
                      </p>
                      <p className="mt-1">{form.interests.join(" · ")}</p>
                      <p className="mt-1">{form.subjects.join(" · ")}</p>
                    </div>
                  </div>
                ) : null}
              </motion.div>
            </AnimatePresence>
          </div>

          <div className="flex items-center justify-between gap-2 border-t border-border/60 bg-secondary/30 px-5 py-3">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={back}
              disabled={step === 0}
              className="rounded-xl"
            >
              رجوع
            </Button>
            <Button
              type="button"
              size="sm"
              onClick={next}
              className="rounded-xl px-5"
            >
              {step === STEPS.length - 1 ? "إنشاء الحساب" : "متابعة"}
              {step < STEPS.length - 1 ? (
                <ChevronLeft className="size-4" />
              ) : null}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
