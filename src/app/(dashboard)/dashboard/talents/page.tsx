"use client";

import { Suspense, useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { TableSkeleton } from "@/components/shared/loading-skeleton";
import { useForm, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import {
  Check,
  Eye,
  MoreHorizontal,
  Pencil,
  Plus,
  Star,
  Trash2,
  X,
} from "lucide-react";
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
  DropdownMenuSeparator,
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
import { RoleGate, useCan } from "@/components/layout/role-gate";
import { useTalentsStore } from "@/stores/talents.store";
import { useStudentsStore } from "@/stores/students.store";
import { useCategoriesByType } from "@/hooks/use-stable-store";
import { talentSchema, type TalentValues } from "@/schemas";
import { formatDate } from "@/lib/utils";
import type { Talent, TalentStatus } from "@/types";

const defaultValues: TalentValues = {
  studentId: "",
  studentName: "",
  title: "",
  description: "",
  categoryId: "",
  media: [],
  skills: [],
  status: "pending",
};

export default function TalentsPage() {
  return (
    <RoleGate anyOf={["manage_talents", "review_talents"]}>
      <Suspense fallback={<TableSkeleton />}>
        <TalentsPageContent />
      </Suspense>
    </RoleGate>
  );
}

function TalentsPageContent() {
  const searchParams = useSearchParams();
  const statusFilter = searchParams.get("status") as TalentStatus | null;
  const canReview = useCan("review_talents");
  const canManage = useCan("manage_talents");

  const talents = useTalentsStore((s) => s.talents);
  const addTalent = useTalentsStore((s) => s.addTalent);
  const updateTalent = useTalentsStore((s) => s.updateTalent);
  const deleteTalent = useTalentsStore((s) => s.deleteTalent);
  const deleteMany = useTalentsStore((s) => s.deleteMany);
  const approveTalent = useTalentsStore((s) => s.approveTalent);
  const rejectTalent = useTalentsStore((s) => s.rejectTalent);
  const featureTalent = useTalentsStore((s) => s.featureTalent);

  const students = useStudentsStore((s) => s.students);
  const talentCategories = useCategoriesByType("talent");

  const filteredTalents = useMemo(
    () => (statusFilter ? talents.filter((t) => t.status === statusFilter) : talents),
    [talents, statusFilter]
  );

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Talent | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [bulkDeleteIds, setBulkDeleteIds] = useState<string[] | null>(null);
  const [rejectId, setRejectId] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState("");
  const [skillsText, setSkillsText] = useState("");

  const form = useForm<TalentValues>({
    resolver: zodResolver(talentSchema) as Resolver<TalentValues>,
    defaultValues,
  });

  function openCreate() {
    setEditing(null);
    setSkillsText("");
    const firstStudent = students[0];
    form.reset({
      ...defaultValues,
      studentId: firstStudent?.id ?? "",
      studentName: firstStudent ? `${firstStudent.firstName} ${firstStudent.lastName}` : "",
      categoryId: talentCategories[0]?.id ?? "",
    });
    setDialogOpen(true);
  }

  function openEdit(talent: Talent) {
    setEditing(talent);
    setSkillsText(talent.skills.join(", "));
    form.reset({
      studentId: talent.studentId,
      studentName: talent.studentName,
      title: talent.title,
      description: talent.description,
      categoryId: talent.categoryId,
      coverImage: talent.coverImage,
      media: talent.media,
      skills: talent.skills,
      status: talent.status,
    });
    setDialogOpen(true);
  }

  function onSubmit(values: TalentValues) {
    const skills = skillsText
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
    const payload = { ...values, skills };

    if (editing) {
      updateTalent(editing.id, payload);
      toast.success("تم تحديث الموهبة");
    } else {
      addTalent(payload);
      toast.success("تم إضافة الموهبة");
    }
    setDialogOpen(false);
  }

  const columns: ColumnDef<Talent>[] = [
    {
      id: "title",
      header: "العنوان",
      accessor: (r) => r.title,
      cell: (r) => (
        <Link href={`/dashboard/talents/${r.id}`} className="font-medium hover:underline">
          {r.title}
        </Link>
      ),
    },
    { id: "student", header: "الطالب", accessor: (r) => r.studentName },
    {
      id: "status",
      header: "الحالة",
      accessor: (r) => r.status,
      cell: (r) => <StatusBadge status={r.status} />,
    },
    { id: "views", header: "المشاهدات", accessor: (r) => r.views },
    { id: "likes", header: "الإعجابات", accessor: (r) => r.likes },
    {
      id: "created",
      header: "تاريخ الإرسال",
      accessor: (r) => r.createdAt,
      cell: (r) => formatDate(r.createdAt),
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
              <Link href={`/dashboard/talents/${r.id}`}>
                <Eye className="size-4" />
                عرض التفاصيل
              </Link>
            </DropdownMenuItem>
            {canManage ? (
              <DropdownMenuItem onClick={() => openEdit(r)}>
                <Pencil className="size-4" />
                تعديل
              </DropdownMenuItem>
            ) : null}
            {canReview && r.status === "pending" ? (
              <>
                <DropdownMenuItem
                  onClick={() => {
                    approveTalent(r.id);
                    toast.success("تمت الموافقة على الموهبة");
                  }}
                >
                  <Check className="size-4" />
                  موافقة
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setRejectId(r.id)}>
                  <X className="size-4" />
                  رفض
                </DropdownMenuItem>
              </>
            ) : null}
            {canManage && (r.status === "approved" || r.status === "featured") ? (
              <DropdownMenuItem
                onClick={() => {
                  featureTalent(r.id, !r.featured);
                  toast.success(r.featured ? "تم إلغاء التمييز" : "تم تمييز الموهبة");
                }}
              >
                <Star className="size-4" />
                {r.featured ? "إلغاء التمييز" : "تمييز"}
              </DropdownMenuItem>
            ) : null}
            {canManage ? (
              <>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="text-destructive"
                  onClick={() => setDeleteId(r.id)}
                >
                  <Trash2 className="size-4" />
                  حذف
                </DropdownMenuItem>
              </>
            ) : null}
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="المواهب"
        description={
          statusFilter ? `عرض المواهب: ${statusFilter}` : "إدارة ومراجعة مواهب الطلبة"
        }
        badge={statusFilter ? <StatusBadge status={statusFilter} /> : undefined}
        actions={
          <div className="flex flex-wrap gap-2">
            {statusFilter ? (
              <Button variant="outline" asChild>
                <Link href="/dashboard/talents">عرض الكل</Link>
              </Button>
            ) : null}
            {canManage ? (
              <Button onClick={openCreate}>
                <Plus className="size-4" />
                إضافة موهبة
              </Button>
            ) : null}
          </div>
        }
      />

      <DataTable
        data={filteredTalents}
        columns={columns}
        searchPlaceholder="بحث بالعنوان أو الطالب..."
        searchFilter={(row, q) =>
          `${row.title} ${row.studentName} ${row.description}`.toLowerCase().includes(q)
        }
        exportFilename="talents.csv"
        onBulkDelete={(ids) => setBulkDeleteIds(ids)}
        onBulkStatusChange={(ids) => {
          ids.forEach((id) => approveTalent(id));
          toast.success(`تمت الموافقة على ${ids.length} موهبة`);
        }}
        onEmptyAction={openCreate}
        emptyActionLabel="إضافة موهبة"
      />

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editing ? "تعديل موهبة" : "إضافة موهبة"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label>الطالب</Label>
              <Select
                value={form.watch("studentId")}
                onValueChange={(v) => {
                  const st = students.find((s) => s.id === v);
                  form.setValue("studentId", v);
                  if (st) form.setValue("studentName", `${st.firstName} ${st.lastName}`);
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="اختر طالباً" />
                </SelectTrigger>
                <SelectContent>
                  {students.map((s) => (
                    <SelectItem key={s.id} value={s.id}>
                      {s.firstName} {s.lastName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
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
                  {talentCategories.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="skills">المهارات (مفصولة بفاصلة)</Label>
              <Input id="skills" value={skillsText} onChange={(e) => setSkillsText(e.target.value)} />
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

      <Dialog open={!!rejectId} onOpenChange={(o) => !o && setRejectId(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>رفض الموهبة</DialogTitle>
          </DialogHeader>
          <div className="space-y-2">
            <Label htmlFor="reason">سبب الرفض</Label>
            <Textarea
              id="reason"
              rows={3}
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="اكتب سبب الرفض..."
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRejectId(null)}>
              إلغاء
            </Button>
            <Button
              variant="destructive"
              disabled={!rejectReason.trim()}
              onClick={() => {
                if (rejectId) {
                  rejectTalent(rejectId, rejectReason.trim());
                  toast.success("تم رفض الموهبة");
                  setRejectId(null);
                  setRejectReason("");
                }
              }}
            >
              تأكيد الرفض
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={!!deleteId}
        onOpenChange={(o) => !o && setDeleteId(null)}
        title="حذف الموهبة"
        description="هل أنت متأكد من حذف هذه الموهبة؟"
        destructive
        confirmLabel="حذف"
        onConfirm={() => {
          if (deleteId) {
            deleteTalent(deleteId);
            toast.success("تم حذف الموهبة");
            setDeleteId(null);
          }
        }}
      />

      <ConfirmDialog
        open={!!bulkDeleteIds}
        onOpenChange={(o) => !o && setBulkDeleteIds(null)}
        title="حذف المواهب المحددة"
        description={`هل أنت متأكد من حذف ${bulkDeleteIds?.length ?? 0} موهبة؟`}
        destructive
        confirmLabel="حذف الكل"
        onConfirm={() => {
          if (bulkDeleteIds) {
            deleteMany(bulkDeleteIds);
            toast.success(`تم حذف ${bulkDeleteIds.length} موهبة`);
            setBulkDeleteIds(null);
          }
        }}
      />
    </div>
  );
}
