"use client";

import { Suspense, useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { TableSkeleton } from "@/components/shared/loading-skeleton";
import { RoleGate } from "@/components/layout/role-gate";
import { useForm, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Eye, MoreHorizontal, Pencil, Plus, Trash2 } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { DataTable, type ColumnDef } from "@/components/shared/data-table";
import { StatusBadge } from "@/components/shared/status-badge";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useLessonsStore } from "@/stores/lessons.store";
import { useCoursesStore } from "@/stores/courses.store";
import { useCategoriesByType } from "@/hooks/use-stable-store";
import { lessonSchema, type LessonValues } from "@/schemas";
import { formatDate } from "@/lib/utils";
import type { Lesson, LessonStatus } from "@/types";

const defaultValues: LessonValues = {
  title: "",
  description: "",
  courseId: "",
  categoryId: "",
  instructor: "",
  summary: "",
  learningObjectives: [],
  duration: 30,
  difficulty: "beginner",
  tags: [],
  status: "draft",
};

export default function LessonsPage() {
  return (
    <RoleGate permission="manage_lessons">
      <Suspense fallback={<TableSkeleton />}>
        <LessonsPageContent />
      </Suspense>
    </RoleGate>
  );
}

function LessonsPageContent() {
  const searchParams = useSearchParams();
  const statusFilter = searchParams.get("status") as LessonStatus | null;

  const lessons = useLessonsStore((s) => s.lessons);
  const addLesson = useLessonsStore((s) => s.addLesson);
  const updateLesson = useLessonsStore((s) => s.updateLesson);
  const deleteLesson = useLessonsStore((s) => s.deleteLesson);
  const deleteMany = useLessonsStore((s) => s.deleteMany);
  const publishLesson = useLessonsStore((s) => s.publishLesson);

  const courses = useCoursesStore((s) => s.courses);
  const lessonCategories = useCategoriesByType("lesson");

  const filteredLessons = useMemo(
    () => (statusFilter ? lessons.filter((l) => l.status === statusFilter) : lessons),
    [lessons, statusFilter]
  );

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Lesson | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [bulkDeleteIds, setBulkDeleteIds] = useState<string[] | null>(null);
  const [objectivesText, setObjectivesText] = useState("");

  const form = useForm<LessonValues>({
    resolver: zodResolver(lessonSchema) as Resolver<LessonValues>,
    defaultValues,
  });

  function openCreate() {
    setEditing(null);
    setObjectivesText("");
    form.reset({
      ...defaultValues,
      courseId: courses[0]?.id ?? "",
      categoryId: lessonCategories[0]?.id ?? "",
    });
    setDialogOpen(true);
  }

  function openEdit(lesson: Lesson) {
    setEditing(lesson);
    setObjectivesText(lesson.learningObjectives.join("\n"));
    form.reset({
      title: lesson.title,
      description: lesson.description,
      courseId: lesson.courseId,
      categoryId: lesson.categoryId,
      instructor: lesson.instructor,
      thumbnail: lesson.thumbnail,
      summary: lesson.summary,
      learningObjectives: lesson.learningObjectives,
      duration: lesson.duration,
      difficulty: lesson.difficulty,
      tags: lesson.tags,
      status: lesson.status,
    });
    setDialogOpen(true);
  }

  function onSubmit(values: LessonValues) {
    const objectives = objectivesText
      .split("\n")
      .map((s) => s.trim())
      .filter(Boolean);
    const payload = { ...values, learningObjectives: objectives, content: editing?.content ?? [] };

    if (editing) {
      updateLesson(editing.id, payload);
      toast.success("تم تحديث الدرس");
    } else {
      addLesson(payload);
      toast.success("تم إنشاء الدرس");
    }
    setDialogOpen(false);
  }

  const columns: ColumnDef<Lesson>[] = [
    {
      id: "title",
      header: "العنوان",
      accessor: (r) => r.title,
      cell: (r) => (
        <Link href={`/dashboard/lessons/${r.id}`} className="font-medium hover:underline">
          {r.title}
        </Link>
      ),
    },
    { id: "instructor", header: "المُدرّس", accessor: (r) => r.instructor },
    {
      id: "status",
      header: "الحالة",
      accessor: (r) => r.status,
      cell: (r) => <StatusBadge status={r.status} />,
    },
    {
      id: "difficulty",
      header: "الصعوبة",
      accessor: (r) => r.difficulty,
      cell: (r) => <StatusBadge status={r.difficulty} />,
    },
    { id: "duration", header: "المدة (د)", accessor: (r) => r.duration },
    {
      id: "updated",
      header: "آخر تحديث",
      accessor: (r) => r.updatedAt,
      cell: (r) => formatDate(r.updatedAt),
    },
    {
      id: "actions",
      header: "إجراءات",
      sortable: false,
      accessor: () => "",
      cell: (r) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" aria-label="إجراءات">
              <MoreHorizontal className="size-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start">
            <DropdownMenuItem asChild>
              <Link href={`/dashboard/lessons/${r.id}`}>
                <Eye className="size-4" />
                محرّر المحتوى
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => openEdit(r)}>
              <Pencil className="size-4" />
              تعديل
            </DropdownMenuItem>
            {r.status !== "published" ? (
              <DropdownMenuItem
                onClick={() => {
                  publishLesson(r.id);
                  toast.success("تم نشر الدرس");
                }}
              >
                نشر
              </DropdownMenuItem>
            ) : null}
            <DropdownMenuItem
              className="text-destructive"
              onClick={() => setDeleteId(r.id)}
            >
              <Trash2 className="size-4" />
              حذف
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ];

  const statusLabels: Record<string, string> = {
    draft: "مسودة",
    pending_review: "بانتظار المراجعة",
    published: "منشور",
    archived: "مؤرشف",
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="الدروس"
        description={
          statusFilter
            ? `عرض الدروس: ${statusLabels[statusFilter] ?? statusFilter}`
            : "إدارة الدروس والمحتوى التعليمي"
        }
        badge={statusFilter ? <StatusBadge status={statusFilter} /> : undefined}
        actions={
          <div className="flex flex-wrap gap-2">
            {statusFilter ? (
              <Button variant="outline" asChild>
                <Link href="/dashboard/lessons">عرض الكل</Link>
              </Button>
            ) : null}
            <Button onClick={openCreate}>
              <Plus className="size-4" />
              إنشاء درس
            </Button>
          </div>
        }
      />

      <DataTable
        data={filteredLessons}
        columns={columns}
        searchPlaceholder="بحث بالعنوان..."
        searchFilter={(row, q) =>
          `${row.title} ${row.instructor} ${row.summary}`.toLowerCase().includes(q)
        }
        exportFilename="lessons.csv"
        onBulkDelete={(ids) => setBulkDeleteIds(ids)}
        onBulkStatusChange={(ids) => {
          ids.forEach((id) => publishLesson(id));
          toast.success(`تم نشر ${ids.length} درس`);
        }}
        onEmptyAction={openCreate}
        emptyActionLabel="إنشاء درس"
      />

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editing ? "تعديل درس" : "إنشاء درس"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">العنوان</Label>
              <Input id="title" {...form.register("title")} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">الوصف</Label>
              <Textarea id="description" rows={2} {...form.register("description")} />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>المادة</Label>
                <Select
                  value={form.watch("courseId")}
                  onValueChange={(v) => form.setValue("courseId", v)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="اختر مادة" />
                  </SelectTrigger>
                  <SelectContent>
                    {courses.map((c) => (
                      <SelectItem key={c.id} value={c.id}>
                        {c.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>التصنيف</Label>
                <Select
                  value={form.watch("categoryId")}
                  onValueChange={(v) => form.setValue("categoryId", v)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="اختر تصنيفاً" />
                  </SelectTrigger>
                  <SelectContent>
                    {lessonCategories.map((c) => (
                      <SelectItem key={c.id} value={c.id}>
                        {c.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="instructor">المُدرّس</Label>
              <Input id="instructor" {...form.register("instructor")} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="summary">الملخص</Label>
              <Textarea id="summary" rows={2} {...form.register("summary")} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="objectives">أهداف التعلّم (سطر لكل هدف)</Label>
              <Textarea
                id="objectives"
                rows={3}
                value={objectivesText}
                onChange={(e) => setObjectivesText(e.target.value)}
              />
            </div>
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="space-y-2">
                <Label htmlFor="duration">المدة (دقيقة)</Label>
                <Input id="duration" type="number" {...form.register("duration")} />
              </div>
              <div className="space-y-2">
                <Label>الصعوبة</Label>
                <Select
                  value={form.watch("difficulty")}
                  onValueChange={(v) =>
                    form.setValue("difficulty", v as LessonValues["difficulty"])
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="beginner">مبتدئ</SelectItem>
                    <SelectItem value="intermediate">متوسط</SelectItem>
                    <SelectItem value="advanced">متقدم</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>الحالة</Label>
                <Select
                  value={form.watch("status")}
                  onValueChange={(v) => form.setValue("status", v as LessonStatus)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="draft">مسودة</SelectItem>
                    <SelectItem value="pending_review">بانتظار المراجعة</SelectItem>
                    <SelectItem value="published">منشور</SelectItem>
                    <SelectItem value="archived">مؤرشف</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                إلغاء
              </Button>
              <Button type="submit">{editing ? "حفظ" : "إنشاء"}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={!!deleteId}
        onOpenChange={(o) => !o && setDeleteId(null)}
        title="حذف الدرس"
        description="هل أنت متأكد من حذف هذا الدرس؟"
        destructive
        confirmLabel="حذف"
        onConfirm={() => {
          if (deleteId) {
            deleteLesson(deleteId);
            toast.success("تم حذف الدرس");
            setDeleteId(null);
          }
        }}
      />

      <ConfirmDialog
        open={!!bulkDeleteIds}
        onOpenChange={(o) => !o && setBulkDeleteIds(null)}
        title="حذف الدروس المحددة"
        description={`هل أنت متأكد من حذف ${bulkDeleteIds?.length ?? 0} درس؟`}
        destructive
        confirmLabel="حذف الكل"
        onConfirm={() => {
          if (bulkDeleteIds) {
            deleteMany(bulkDeleteIds);
            toast.success(`تم حذف ${bulkDeleteIds.length} درس`);
            setBulkDeleteIds(null);
          }
        }}
      />
    </div>
  );
}
