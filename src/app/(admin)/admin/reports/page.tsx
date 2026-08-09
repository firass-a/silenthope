"use client";

import { useMemo, useState } from "react";
import { useForm, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { MoreHorizontal, Plus, Pencil, Trash2 } from "lucide-react";
import { RoleGate } from "@/components/layout/role-gate";
import { PageHeader } from "@/components/shared/page-header";
import { DataTable, type ColumnDef } from "@/components/shared/data-table";
import { StatusBadge } from "@/components/shared/status-badge";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { Button } from "@/components/ui/button";
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useReportsStore } from "@/stores/reports.store";
import { reportSchema, type ReportValues } from "@/schemas";
import type { Report, ReportStatus } from "@/types";
import { formatDateTime } from "@/lib/utils";

const defaults: ReportValues = {
  reporter: "",
  entity: "talent",
  entityId: "",
  reason: "",
  description: "",
  status: "pending",
};

export default function ReportsPage() {
  return (
    <RoleGate permission="manage_reports">
      <ReportsPageContent />
    </RoleGate>
  );
}

function ReportsPageContent() {
  const reports = useReportsStore((s) => s.reports);
  const addReport = useReportsStore((s) => s.addReport);
  const updateReport = useReportsStore((s) => s.updateReport);
  const deleteReport = useReportsStore((s) => s.deleteReport);
  const deleteMany = useReportsStore((s) => s.deleteMany);
  const setStatus = useReportsStore((s) => s.setStatus);

  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Report | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const form = useForm<ReportValues>({
    resolver: zodResolver(reportSchema) as Resolver<ReportValues>,
    defaultValues: defaults,
  });

  function openCreate() {
    setEditing(null);
    form.reset(defaults);
    setOpen(true);
  }

  function onSubmit(values: ReportValues) {
    if (editing) {
      updateReport(editing.id, values);
      toast.success("تم تحديث البلاغ");
    } else {
      addReport(values);
      toast.success("تم إنشاء البلاغ");
    }
    setOpen(false);
  }

  const columns: ColumnDef<Report>[] = useMemo(
    () => [
      { id: "reporter", header: "المبلّغ", accessor: (r) => r.reporter },
      {
        id: "entity",
        header: "العنصر",
        accessor: (r) => `${r.entity}:${r.entityId}`,
        cell: (r) => (
          <span className="text-sm">
            {r.entity} / <code className="text-xs">{r.entityId}</code>
          </span>
        ),
      },
      { id: "reason", header: "السبب", accessor: (r) => r.reason },
      {
        id: "status",
        header: "الحالة",
        accessor: (r) => r.status,
        cell: (r) => <StatusBadge status={r.status} />,
      },
      {
        id: "created",
        header: "التاريخ",
        accessor: (r) => r.createdAt,
        cell: (r) => formatDateTime(r.createdAt),
      },
      {
        id: "actions",
        header: "إجراءات",
        accessor: () => "",
        sortable: false,
        cell: (r) => (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" aria-label="إجراءات">
                <MoreHorizontal />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start">
              {(["reviewed", "resolved", "dismissed", "pending"] as ReportStatus[]).map(
                (status) => (
                  <DropdownMenuItem
                    key={status}
                    onClick={() => {
                      setStatus(r.id, status);
                      toast.success("تم تغيير حالة البلاغ");
                    }}
                  >
                    تعيين: {status}
                  </DropdownMenuItem>
                )
              )}
              <DropdownMenuItem
                onClick={() => {
                  setEditing(r);
                  form.reset({
                    reporter: r.reporter,
                    entity: r.entity,
                    entityId: r.entityId,
                    reason: r.reason,
                    description: r.description,
                    status: r.status,
                  });
                  setOpen(true);
                }}
              >
                <Pencil /> تعديل
              </DropdownMenuItem>
              <DropdownMenuItem variant="destructive" onClick={() => setDeleteId(r.id)}>
                <Trash2 /> حذف
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ),
      },
    ],
    [form, setStatus]
  );

  return (
    <div>
      <PageHeader
        title="البلاغات والإشراف"
        description="مراجعة البلاغات على الدروس والمواهب والمستخدمين."
        actions={
          <Button onClick={openCreate}>
            <Plus /> بلاغ جديد
          </Button>
        }
      />
      <DataTable
        data={reports}
        columns={columns}
        searchPlaceholder="بحث في البلاغات..."
        searchFilter={(row, q) =>
          `${row.reporter} ${row.reason} ${row.description} ${row.entityId}`
            .toLowerCase()
            .includes(q)
        }
        exportFilename="reports.csv"
        onBulkDelete={(ids) => {
          deleteMany(ids);
          toast.success("تم حذف البلاغات");
        }}
        emptyTitle="لا بلاغات"
        emptyActionLabel="إنشاء بلاغ"
        onEmptyAction={openCreate}
      />

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editing ? "تعديل بلاغ" : "بلاغ جديد"}</DialogTitle>
          </DialogHeader>
          <form className="space-y-4" onSubmit={form.handleSubmit(onSubmit)}>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>المبلّغ</Label>
                <Input {...form.register("reporter")} />
              </div>
              <div className="space-y-2">
                <Label>نوع العنصر</Label>
                <Select
                  value={form.watch("entity")}
                  onValueChange={(v) =>
                    form.setValue("entity", v as ReportValues["entity"])
                  }
                >
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="lesson">درس</SelectItem>
                    <SelectItem value="talent">موهبة</SelectItem>
                    <SelectItem value="user">مستخدم</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>معرّف العنصر</Label>
                <Input {...form.register("entityId")} />
              </div>
              <div className="space-y-2">
                <Label>السبب</Label>
                <Input {...form.register("reason")} />
              </div>
            </div>
            <div className="space-y-2">
              <Label>الوصف</Label>
              <Textarea {...form.register("description")} />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                إلغاء
              </Button>
              <Button type="submit">حفظ</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={!!deleteId}
        onOpenChange={(v) => !v && setDeleteId(null)}
        title="حذف البلاغ؟"
        description="لا يمكن التراجع عن هذه العملية."
        destructive
        confirmLabel="حذف"
        onConfirm={() => {
          if (deleteId) {
            deleteReport(deleteId);
            toast.success("تم حذف البلاغ");
            setDeleteId(null);
          }
        }}
      />
    </div>
  );
}
