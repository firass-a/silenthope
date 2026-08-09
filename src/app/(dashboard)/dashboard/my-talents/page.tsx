"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Plus } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { StatusBadge } from "@/components/shared/status-badge";
import { EmptyState } from "@/components/shared/empty-state";
import { TableSkeleton } from "@/components/shared/loading-skeleton";
import { RoleGate } from "@/components/layout/role-gate";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAuthStore } from "@/stores/auth.store";
import { useTalentsStore } from "@/stores/talents.store";
import { useStudentsStore } from "@/stores/students.store";
import { useCategoriesByType } from "@/hooks/use-stable-store";
import { formatDate } from "@/lib/utils";

const schema = z.object({
  title: z.string().min(3, "العنوان مطلوب"),
  description: z.string().min(10, "الوصف مطلوب"),
  categoryId: z.string().min(1, "التصنيف مطلوب"),
  skills: z.string().optional(),
});

type FormValues = z.infer<typeof schema>;

export default function MyTalentsPage() {
  return (
    <Suspense fallback={<TableSkeleton />}>
      <RoleGate permission="submit_talent">
        <MyTalentsContent />
      </RoleGate>
    </Suspense>
  );
}

function MyTalentsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const session = useAuthStore((s) => s.session);
  const students = useStudentsStore((s) => s.students);
  const talents = useTalentsStore((s) => s.talents);
  const addTalent = useTalentsStore((s) => s.addTalent);
  const categories = useCategoriesByType("talent");

  const student = useMemo(() => {
    if (session?.studentId) {
      return students.find((s) => s.id === session.studentId);
    }
    return students.find((s) => s.email === session?.email);
  }, [students, session]);

  const mine = useMemo(
    () =>
      talents.filter(
        (t) =>
          t.studentId === student?.id ||
          t.studentName === session?.name
      ),
    [talents, student, session]
  );

  const [open, setOpen] = useState(false);
  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      title: "",
      description: "",
      categoryId: categories[0]?.id ?? "",
      skills: "",
    },
  });

  useEffect(() => {
    if (searchParams.get("new") === "1") {
      setOpen(true);
    }
  }, [searchParams]);

  function closeDialog() {
    setOpen(false);
    if (searchParams.get("new") === "1") {
      router.replace("/dashboard/my-talents");
    }
  }

  function onSubmit(values: FormValues) {
    if (!student && !session) {
      toast.error("تعذّر تحديد ملف الطالب");
      return;
    }
    addTalent({
      studentId: student?.id ?? "stu_unknown",
      studentName: student
        ? `${student.firstName} ${student.lastName}`
        : session?.name ?? "طالب",
      title: values.title,
      description: values.description,
      categoryId: values.categoryId,
      media: [],
      skills: values.skills
        ? values.skills.split(",").map((s) => s.trim()).filter(Boolean)
        : [],
      status: "pending",
    });
    toast.success("تم إرسال الموهبة للمراجعة");
    closeDialog();
    form.reset();
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="مواهبي"
        description="أرسل أعمالك ومتابعة حالتها. المراجعة تتم من فريق المواهب فقط."
        actions={
          <Button
            onClick={() => {
              setOpen(true);
              router.replace("/dashboard/my-talents?new=1");
            }}
          >
            <Plus /> إرسال موهبة
          </Button>
        }
      />

      {mine.length === 0 ? (
        <EmptyState
          title="لا توجد مواهب بعد"
          description="شارك أول عمل لك ليراجعه فريق المنصة."
          actionLabel="إرسال موهبة"
          onAction={() => {
            setOpen(true);
            router.replace("/dashboard/my-talents?new=1");
          }}
        />
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {mine.map((t) => (
            <Card key={t.id}>
              <CardHeader className="flex-row items-start justify-between gap-3 space-y-0">
                <div>
                  <CardTitle className="text-lg">{t.title}</CardTitle>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {formatDate(t.createdAt)}
                  </p>
                </div>
                <StatusBadge status={t.status} />
              </CardHeader>
              <CardContent className="space-y-2">
                <p className="line-clamp-3 text-sm text-muted-foreground">
                  {t.description}
                </p>
                {t.rejectionReason ? (
                  <p className="rounded-xl border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive">
                    سبب الرفض: {t.rejectionReason}
                  </p>
                ) : null}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog
        open={open}
        onOpenChange={(next) => {
          if (next) setOpen(true);
          else closeDialog();
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>إرسال موهبة جديدة</DialogTitle>
          </DialogHeader>
          <form className="space-y-4" onSubmit={form.handleSubmit(onSubmit)}>
            <div className="space-y-2">
              <Label>العنوان</Label>
              <Input {...form.register("title")} />
            </div>
            <div className="space-y-2">
              <Label>الوصف</Label>
              <Textarea {...form.register("description")} />
            </div>
            <div className="space-y-2">
              <Label>التصنيف</Label>
              <Select
                value={form.watch("categoryId")}
                onValueChange={(v) => form.setValue("categoryId", v)}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="اختر تصنيفاً" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>مهارات (مفصولة بفاصلة)</Label>
              <Input {...form.register("skills")} placeholder="رسم, تصميم, ..." />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={closeDialog}>
                إلغاء
              </Button>
              <Button type="submit">إرسال للمراجعة</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
