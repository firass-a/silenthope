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
    <div className="grid min-h-screen lg:grid-cols-2">
      <motion.aside
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="relative hidden overflow-hidden gradient-hero p-10 text-primary-foreground lg:flex lg:flex-col lg:justify-between"
      >
        <Link href="/" className="relative z-10 inline-flex items-center gap-3">
          <BrandLogo size="lg" plate />
          <span className="text-lg font-bold text-primary-foreground">الأمل الصامت</span>
        </Link>
        <div className="relative z-10 max-w-md space-y-4">
          <h1 className="text-4xl font-bold leading-tight xl:text-5xl">
            نَسمع بالعين
            <br />
            ونتعلّم بالعقل
          </h1>
          <p className="text-base leading-relaxed text-primary-foreground/85">
            منصة بصرية للتعليم الجامعي وتنمية المواهب — مصمّمة لاستقلالية الطالب الأصم.
          </p>
        </div>
        <p className="relative z-10 text-sm text-primary-foreground/70">
          تعلّم · اكتشف · أنشئ · اعرض · انمُ
        </p>
        <div className="pointer-events-none absolute -start-16 top-24 size-64 rounded-full bg-white/10 blur-3xl" />
        <div className="pointer-events-none absolute -end-10 bottom-10 size-72 rounded-full bg-accent/30 blur-3xl" />
      </motion.aside>

      <div className="flex items-center justify-center px-4 py-12 md:px-8">
        <div className="w-full max-w-md space-y-8">
          <div>
            <Link href="/" className="mb-6 inline-flex lg:hidden">
              <BrandLogo size="sm" withWordmark />
            </Link>
            <h2 className="text-3xl font-bold">تسجيل الدخول</h2>
            <p className="mt-2 text-muted-foreground">
              مرحباً بعودتك — أكمل رحلتك البصرية.
            </p>
          </div>

          <form className="space-y-4" onSubmit={form.handleSubmit(onSubmit)}>
            <div className="space-y-2">
              <Label htmlFor="email">البريد الإلكتروني</Label>
              <Input
                id="email"
                type="email"
                autoComplete="username"
                dir="ltr"
                className="text-left"
                {...form.register("email")}
              />
              {form.formState.errors.email ? (
                <p className="text-sm text-destructive">
                  {form.formState.errors.email.message}
                </p>
              ) : null}
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">كلمة المرور</Label>
              <Input
                id="password"
                type="password"
                autoComplete="current-password"
                dir="ltr"
                className="text-left"
                {...form.register("password")}
              />
              {form.formState.errors.password ? (
                <p className="text-sm text-destructive">
                  {form.formState.errors.password.message}
                </p>
              ) : null}
            </div>
            <Button type="submit" className="w-full" size="lg">
              تسجيل الدخول
            </Button>
          </form>

          <Button asChild variant="outline" className="w-full" size="lg">
            <Link href="/register">إنشاء حساب</Link>
          </Button>

          <div className="space-y-2">
            <p className="text-sm font-medium text-muted-foreground">
              دخول سريع — كلمة المرور:{" "}
              <code className="rounded bg-muted px-1.5 py-0.5">{DEMO_PASSWORD}</code>
            </p>
            <div className="grid gap-2">
              {seedAccounts.map((acc) => (
                <button
                  key={acc.id}
                  type="button"
                  className="flex items-center justify-between rounded-2xl border border-border/70 bg-secondary/30 px-3 py-2.5 text-right text-sm transition hover:bg-secondary"
                  onClick={() => {
                    form.setValue("email", acc.email);
                    form.setValue("password", DEMO_PASSWORD);
                  }}
                >
                  <span>
                    <span className="font-medium">{acc.name}</span>
                    <span className="ms-2 text-muted-foreground">
                      {ROLE_LABELS[acc.role]}
                    </span>
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
