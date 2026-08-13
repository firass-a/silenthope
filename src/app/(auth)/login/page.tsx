"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { loginSchema, type LoginValues } from "@/schemas";
import { useAuthStore, DEMO_PASSWORD, seedAccounts } from "@/stores/auth.store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ROLE_LABELS, isStaffRole } from "@/lib/permissions";
import { BrandLogo } from "@/components/brand/brand-logo";

export default function LoginPage() {
  const router = useRouter();
  const login = useAuthStore((s) => s.login);
  const form = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "student@silenthope.local", password: DEMO_PASSWORD },
  });

  function onSubmit(values: LoginValues) {
    const result = login(values.email, values.password);
    if (!result.ok) {
      toast.error(result.message);
      return;
    }
    toast.success(result.message);
    if (result.role && isStaffRole(result.role)) {
      router.push("/admin");
    } else {
      router.push("/home");
    }
  }

  return (
    <div className="grid min-h-screen lg:grid-cols-[0.9fr_1.1fr]">
      <motion.aside
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="relative hidden overflow-hidden gradient-hero p-8 text-primary-foreground lg:flex lg:flex-col lg:justify-between"
      >
        <Link href="/" className="relative z-10 inline-flex items-center gap-3">
          <BrandLogo size="md" plate />
          <span className="text-base font-bold text-primary-foreground">
            الأمل الصامت
          </span>
        </Link>
        <div className="relative z-10 max-w-sm space-y-3">
          <h1 className="text-3xl font-bold leading-tight">
            نَسمع بالعين
            <br />
            ونتعلّم بالعقل
          </h1>
          <p className="text-sm leading-relaxed text-primary-foreground/85">
            منصة بصرية للتعليم الجامعي وتنمية المواهب.
          </p>
        </div>
        <p className="relative z-10 text-xs text-primary-foreground/70">
          تعلّم · اكتشف · أنشئ · اعرض · انمُ
        </p>
        <div className="pointer-events-none absolute -start-16 top-24 size-56 rounded-full bg-white/10 blur-3xl" />
        <div className="pointer-events-none absolute -end-10 bottom-10 size-56 rounded-full bg-accent/30 blur-3xl" />
      </motion.aside>

      <div className="flex items-center justify-center px-4 py-8 md:px-8">
        <div className="w-full max-w-sm">
          <Link href="/" className="mb-5 inline-flex lg:hidden">
            <BrandLogo size="sm" withWordmark />
          </Link>

          <div className="rounded-2xl border border-border/70 bg-card p-5 shadow-sm">
            <h2 className="text-xl font-bold">تسجيل الدخول</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              مرحباً بعودتك — أكمل رحلتك البصرية.
            </p>

            <form
              className="mt-5 space-y-3"
              onSubmit={form.handleSubmit(onSubmit)}
            >
              <div className="space-y-1.5">
                <Label htmlFor="email" className="text-xs">
                  البريد الإلكتروني
                </Label>
                <Input
                  id="email"
                  type="email"
                  autoComplete="username"
                  dir="ltr"
                  className="h-10 rounded-xl text-left"
                  {...form.register("email")}
                />
                {form.formState.errors.email ? (
                  <p className="text-xs text-destructive">
                    {form.formState.errors.email.message}
                  </p>
                ) : null}
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="password" className="text-xs">
                  كلمة المرور
                </Label>
                <Input
                  id="password"
                  type="password"
                  autoComplete="current-password"
                  dir="ltr"
                  className="h-10 rounded-xl text-left"
                  {...form.register("password")}
                />
                {form.formState.errors.password ? (
                  <p className="text-xs text-destructive">
                    {form.formState.errors.password.message}
                  </p>
                ) : null}
              </div>
              <Button type="submit" className="mt-1 w-full rounded-xl">
                تسجيل الدخول
              </Button>
            </form>

            <Button
              asChild
              variant="outline"
              className="mt-2 w-full rounded-xl"
              size="sm"
            >
              <Link href="/register">إنشاء حساب</Link>
            </Button>
          </div>

          <div className="mt-4 space-y-2">
            <p className="text-xs text-muted-foreground">
              دخول سريع — كلمة المرور:{" "}
              <code className="rounded bg-muted px-1 py-0.5">{DEMO_PASSWORD}</code>
            </p>
            <div className="grid grid-cols-1 gap-1.5">
              {seedAccounts.map((acc) => (
                <button
                  key={acc.id}
                  type="button"
                  className="flex items-center justify-between rounded-xl border border-border/60 bg-card px-3 py-2 text-right text-xs transition hover:bg-secondary"
                  onClick={() => {
                    form.setValue("email", acc.email);
                    form.setValue("password", DEMO_PASSWORD);
                  }}
                >
                  <span className="font-medium">{acc.name}</span>
                  <span className="text-muted-foreground">
                    {ROLE_LABELS[acc.role]}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
