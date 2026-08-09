"use client";

import { useState } from "react";
import Link from "next/link";
import { useForm, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Eye, MoreHorizontal, Pencil, Plus, Trash2 } from "lucide-react";
import { RoleGate } from "@/components/layout/role-gate";
import { PageHeader } from "@/components/shared/page-header";
import { DataTable, type ColumnDef } from "@/components/shared/data-table";
import { StatusBadge } from "@/components/shared/status-badge";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
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
import { useStudentsStore } from "@/stores/students.store";
import { studentSchema, type StudentValues } from "@/schemas";
import { formatDate, getInitials } from "@/lib/utils";
import type { EntityStatus, Student } from "@/types";

const defaultValues: StudentValues = {
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
  university: "",
  faculty: "",
  major: "",
  academicLevel: "",
  bio: "",
  status: "active",
};

export default function StudentsPage() {
  return (
    <RoleGate permission="manage_users">
      <StudentsPageContent />
    </RoleGate>
  );
}

function StudentsPageContent() {
  const students = useStudentsStore((s) => s.students);
  const addStudent = useStudentsStore((s) => s.addStudent);
  const updateStudent = useStudentsStore((s) => s.updateStudent);
  const deleteStudent = useStudentsStore((s) => s.deleteStudent);
  const deleteMany = useStudentsStore((s) => s.deleteMany);
  const bulkSetStatus = useStudentsStore((s) => s.bulkSetStatus);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Student | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [bulkDeleteIds, setBulkDeleteIds] = useState<string[] | null>(null);

  const form = useForm<StudentValues>({
    resolver: zodResolver(studentSchema) as Resolver<StudentValues>,
    defaultValues,
  });

  function openCreate() {
    setEditing(null);
    form.reset(defaultValues);
    setDialogOpen(true);
  }

  function openEdit(student: Student) {
    setEditing(student);
    form.reset({
      firstName: student.firstName,
      lastName: student.lastName,
      email: student.email,
      phone: student.phone,
      university: student.university,
      faculty: student.faculty,
      major: student.major,
      academicLevel: student.academicLevel,
      bio: student.bio,
      avatar: student.avatar,
      status: student.status,
    });
    setDialogOpen(true);
  }

  function onSubmit(values: StudentValues) {
    if (editing) {
      updateStudent(editing.id, values);
      toast.success("تم تحديث بيانات الطالب");
    } else {
      addStudent(values);
      toast.success("تم إضافة الطالب بنجاح");
    }
    setDialogOpen(false);
  }

  const columns: ColumnDef<Student>[] = [
    {
      id: "avatar",
      header: "",
      sortable: false,
      hideable: false,
      accessor: (r) => r.firstName,
      cell: (r) => (
        <Avatar className="size-9">
          <AvatarFallback>{getInitials(`${r.firstName} ${r.lastName}`)}</AvatarFallback>
        </Avatar>
      ),
    },
    {
      id: "name",
      header: "الاسم",
      accessor: (r) => `${r.firstName} ${r.lastName}`,
      cell: (r) => (
        <Link href={`/dashboard/students/${r.id}`} className="font-medium hover:underline">
          {r.firstName} {r.lastName}
        </Link>
      ),
    },
    { id: "email", header: "البريد", accessor: (r) => r.email },
    { id: "university", header: "الجامعة", accessor: (r) => r.university },
    { id: "major", header: "التخصص", accessor: (r) => r.major },
    { id: "level", header: "المستوى", accessor: (r) => r.academicLevel },
    {
      id: "status",
      header: "الحالة",
      accessor: (r) => r.status,
      cell: (r) => <StatusBadge status={r.status} />,
    },
    {
      id: "joined",
      header: "تاريخ الانضمام",
      accessor: (r) => r.joinedAt,
      cell: (r) => formatDate(r.joinedAt),
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
              <Link href={`/dashboard/students/${r.id}`}>
                <Eye className="size-4" />
                عرض الملف
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => openEdit(r)}>
              <Pencil className="size-4" />
              تعديل
            </DropdownMenuItem>
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
        title="الطلبة"
        description="إدارة حسابات الطلبة وبياناتهم الأكاديمية"
        actions={
          <Button onClick={openCreate}>
            <Plus className="size-4" />
            إضافة طالب
          </Button>
        }
      />

      <DataTable
        data={students}
        columns={columns}
        searchPlaceholder="بحث بالاسم أو البريد..."
        searchFilter={(row, q) =>
          `${row.firstName} ${row.lastName} ${row.email} ${row.university} ${row.major}`
            .toLowerCase()
            .includes(q)
        }
        exportFilename="students.csv"
        onBulkDelete={(ids) => setBulkDeleteIds(ids)}
        onBulkStatusChange={(ids) => {
          const next: EntityStatus = "active";
          bulkSetStatus(ids, next);
          toast.success(`تم تحديث حالة ${ids.length} طالب إلى نشط`);
        }}
        onEmptyAction={openCreate}
        emptyActionLabel="إضافة طالب"
      />

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{editing ? "تعديل طالب" : "إضافة طالب"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="firstName">الاسم</Label>
                <Input id="firstName" {...form.register("firstName")} />
                {form.formState.errors.firstName ? (
                  <p className="text-xs text-destructive">{form.formState.errors.firstName.message}</p>
                ) : null}
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">اللقب</Label>
                <Input id="lastName" {...form.register("lastName")} />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">البريد الإلكتروني</Label>
              <Input id="email" type="email" {...form.register("email")} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">الهاتف</Label>
              <Input id="phone" {...form.register("phone")} />
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
                <Label htmlFor="major">التخصص</Label>
                <Input id="major" {...form.register("major")} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="academicLevel">المستوى الدراسي</Label>
                <Input id="academicLevel" {...form.register("academicLevel")} />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="bio">نبذة</Label>
              <Textarea id="bio" rows={3} {...form.register("bio")} />
            </div>
            <div className="space-y-2">
              <Label>الحالة</Label>
              <Select
                value={form.watch("status")}
                onValueChange={(v) => form.setValue("status", v as EntityStatus)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">نشط</SelectItem>
                  <SelectItem value="inactive">غير نشط</SelectItem>
                  <SelectItem value="suspended">موقوف</SelectItem>
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
        title="حذف الطالب"
        description="هل أنت متأكد من حذف هذا الطالب؟ لا يمكن التراجع عن هذا الإجراء."
        destructive
        confirmLabel="حذف"
        onConfirm={() => {
          if (deleteId) {
            deleteStudent(deleteId);
            toast.success("تم حذف الطالب");
            setDeleteId(null);
          }
        }}
      />

      <ConfirmDialog
        open={!!bulkDeleteIds}
        onOpenChange={(o) => !o && setBulkDeleteIds(null)}
        title="حذف الطلبة المحددين"
        description={`هل أنت متأكد من حذف ${bulkDeleteIds?.length ?? 0} طالب؟`}
        destructive
        confirmLabel="حذف الكل"
        onConfirm={() => {
          if (bulkDeleteIds) {
            deleteMany(bulkDeleteIds);
            toast.success(`تم حذف ${bulkDeleteIds.length} طالب`);
            setBulkDeleteIds(null);
          }
        }}
      />
    </div>
  );
}
