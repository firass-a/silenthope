"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { MoreHorizontal, Pencil, Plus, Trash2 } from "lucide-react";
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
import { RoleGate } from "@/components/layout/role-gate";
import { useCoursesStore } from "@/stores/courses.store";
import { useCategoriesByType } from "@/hooks/use-stable-store";
import { courseSchema, type CourseValues } from "@/schemas";
import { formatDate } from "@/lib/utils";
import type { Course, CourseStatus } from "@/types";

const defaultValues: CourseValues = {
  title: "",
  description: "",
  categoryId: "",
  university: "",
  faculty: "",
  level: "",
  instructor: "",
  status: "draft",
};

export default function CoursesPage() {
  return (
    <RoleGate permission="manage_courses">
      <CoursesPageContent />
    </RoleGate>
  );
}

function CoursesPageContent() {
  const courses = useCoursesStore((s) => s.courses);
  const addCourse = useCoursesStore((s) => s.addCourse);
  const updateCourse = useCoursesStore((s) => s.updateCourse);
  const deleteCourse = useCoursesStore((s) => s.deleteCourse);
  const deleteMany = useCoursesStore((s) => s.deleteMany);
  const setCourseStatus = useCoursesStore((s) => s.setCourseStatus);
  const categories = useCategoriesByType("course");

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Course | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [bulkDeleteIds, setBulkDeleteIds] = useState<string[] | null>(null);

  const form = useForm<CourseValues>({
    resolver: zodResolver(courseSchema),
    defaultValues,
  });

  function openCreate() {
    setEditing(null);
    form.reset({ ...defaultValues, categoryId: categories[0]?.id ?? "" });
    setDialogOpen(true);
  }

  function openEdit(course: Course) {
    setEditing(course);
    form.reset({
      title: course.title,
      description: course.description,
      thumbnail: course.thumbnail,
      categoryId: course.categoryId,
      university: course.university,
      faculty: course.faculty,
      level: course.level,
      instructor: course.instructor,
      status: course.status,
    });
    setDialogOpen(true);
  }

  function onSubmit(values: CourseValues) {
    if (editing) {
      updateCourse(editing.id, values);
      toast.success("تم تحديث المادة");
    } else {
      addCourse(values);
      toast.success("تم إنشاء المادة");
    }
    setDialogOpen(false);
  }

  const columns: ColumnDef<Course>[] = [
    { id: "title", header: "العنوان", accessor: (r) => r.title },
    { id: "instructor", header: "المُدرّس", accessor: (r) => r.instructor },
    { id: "university", header: "الجامعة", accessor: (r) => r.university },
    { id: "level", header: "المستوى", accessor: (r) => r.level },
    {
      id: "status",
      header: "الحالة",
      accessor: (r) => r.status,
      cell: (r) => <StatusBadge status={r.status} />,
    },
    {
      id: "lessons",
      header: "الدروس",
      accessor: (r) => r.lessonIds.length,
    },
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
            <DropdownMenuItem onClick={() => openEdit(r)}>
              <Pencil className="size-4" />
              تعديل
            </DropdownMenuItem>
            {r.status !== "published" ? (
              <DropdownMenuItem
                onClick={() => {
                  setCourseStatus(r.id, "published");
                  toast.success("تم نشر المادة");
                }}
              >
                نشر
              </DropdownMenuItem>
            ) : (
              <DropdownMenuItem
                onClick={() => {
                  setCourseStatus(r.id, "draft");
                  toast.success("تم إرجاع المادة إلى مسودة");
                }}
              >
                إلغاء النشر
              </DropdownMenuItem>
            )}
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

  return (
    <div className="space-y-6">
      <PageHeader
        title="المواد"
        description="إدارة المواد الدراسية والمحتوى التعليمي"
        actions={
          <Button onClick={openCreate}>
            <Plus className="size-4" />
            إضافة مادة
          </Button>
        }
      />

      <DataTable
        data={courses}
        columns={columns}
        searchPlaceholder="بحث بالعنوان..."
        searchFilter={(row, q) =>
          `${row.title} ${row.instructor} ${row.university}`.toLowerCase().includes(q)
        }
        exportFilename="courses.csv"
        onBulkDelete={(ids) => setBulkDeleteIds(ids)}
        onBulkStatusChange={(ids) => {
          ids.forEach((id) => setCourseStatus(id, "published"));
          toast.success(`تم نشر ${ids.length} مادة`);
        }}
        onEmptyAction={openCreate}
        emptyActionLabel="إضافة مادة"
      />

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editing ? "تعديل مادة" : "إضافة مادة"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">العنوان</Label>
              <Input id="title" {...form.register("title")} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">الوصف</Label>
              <Textarea id="description" rows={3} {...form.register("description")} />
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
                  {categories.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="university">الجامعة</Label>
                <Input id="university" {...form.register("university")} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="faculty">الكلية</Label>
                <Input id="faculty" {...form.register("faculty")} />
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="level">المستوى</Label>
                <Input id="level" {...form.register("level")} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="instructor">المُدرّس</Label>
                <Input id="instructor" {...form.register("instructor")} />
              </div>
            </div>
            <div className="space-y-2">
              <Label>الحالة</Label>
              <Select
                value={form.watch("status")}
                onValueChange={(v) => form.setValue("status", v as CourseStatus)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="draft">مسودة</SelectItem>
                  <SelectItem value="published">منشور</SelectItem>
                  <SelectItem value="archived">مؤرشف</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                إلغاء
              </Button>
              <Button type="submit">{editing ? "حفظ" : "إضافة"}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={!!deleteId}
        onOpenChange={(o) => !o && setDeleteId(null)}
        title="حذف المادة"
        description="سيتم أرشفة الدروس المرتبطة. هل تريد المتابعة؟"
        destructive
        confirmLabel="حذف"
        onConfirm={() => {
          if (deleteId) {
            deleteCourse(deleteId);
            toast.success("تم حذف المادة");
            setDeleteId(null);
          }
        }}
      />

      <ConfirmDialog
        open={!!bulkDeleteIds}
        onOpenChange={(o) => !o && setBulkDeleteIds(null)}
        title="حذف المواد المحددة"
        description={`هل أنت متأكد من حذف ${bulkDeleteIds?.length ?? 0} مادة؟`}
        destructive
        confirmLabel="حذف الكل"
        onConfirm={() => {
          if (bulkDeleteIds) {
            deleteMany(bulkDeleteIds);
            toast.success(`تم حذف ${bulkDeleteIds.length} مادة`);
            setBulkDeleteIds(null);
          }
        }}
      />
    </div>
  );
}
