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
import { useSubscriptionsStore } from "@/stores/subscriptions.store";
import { useStudentsStore } from "@/stores/students.store";
import { subscriptionSchema, type SubscriptionValues } from "@/schemas";
import type { Subscription } from "@/types";
import { formatDate } from "@/lib/utils";

const defaults: SubscriptionValues = {
  studentId: "",
  plan: "student",
  price: 990,
  status: "active",
  startDate: new Date().toISOString().slice(0, 10),
  endDate: new Date(Date.now() + 30 * 86400000).toISOString().slice(0, 10),
};

export default function SubscriptionsPage() {
  return (
    <RoleGate permission="manage_subscriptions">
      <SubscriptionsPageContent />
    </RoleGate>
  );
}

function SubscriptionsPageContent() {
  const subscriptions = useSubscriptionsStore((s) => s.subscriptions);
  const addSubscription = useSubscriptionsStore((s) => s.addSubscription);
  const updateSubscription = useSubscriptionsStore((s) => s.updateSubscription);
  const deleteSubscription = useSubscriptionsStore((s) => s.deleteSubscription);
  const deleteMany = useSubscriptionsStore((s) => s.deleteMany);
  const students = useStudentsStore((s) => s.students);

  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Subscription | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const form = useForm<SubscriptionValues>({
    resolver: zodResolver(subscriptionSchema) as Resolver<SubscriptionValues>,
    defaultValues: defaults,
  });

  function openCreate() {
    setEditing(null);
    form.reset({ ...defaults, studentId: students[0]?.id ?? "" });
    setOpen(true);
  }

  function onSubmit(values: SubscriptionValues) {
    const payload = {
      ...values,
      startDate: new Date(values.startDate).toISOString(),
      endDate: new Date(values.endDate).toISOString(),
    };
    if (editing) {
      updateSubscription(editing.id, payload);
      toast.success("تم تعديل الاشتراك");
    } else {
      addSubscription(payload);
      toast.success("تم إنشاء الاشتراك");
    }
    setOpen(false);
  }

  const columns: ColumnDef<Subscription>[] = useMemo(
    () => [
      {
        id: "student",
        header: "الطالب",
        accessor: (r) => {
          const st = students.find((s) => s.id === r.studentId);
          return st ? `${st.firstName} ${st.lastName}` : r.studentId;
        },
      },
      {
        id: "plan",
        header: "الخطة",
        accessor: (r) => r.plan,
        cell: (r) => <StatusBadge status={r.plan} />,
      },
      { id: "price", header: "السعر", accessor: (r) => r.price, cell: (r) => `${r.price} دج` },
      {
        id: "status",
        header: "الحالة",
        accessor: (r) => r.status,
        cell: (r) => <StatusBadge status={r.status} />,
      },
      {
        id: "start",
        header: "البداية",
        accessor: (r) => r.startDate,
        cell: (r) => formatDate(r.startDate),
      },
      {
        id: "end",
        header: "النهاية",
        accessor: (r) => r.endDate,
        cell: (r) => formatDate(r.endDate),
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
              <DropdownMenuItem
                onClick={() => {
                  setEditing(r);
                  form.reset({
                    studentId: r.studentId,
                    plan: r.plan,
                    price: r.price,
                    status: r.status,
                    startDate: r.startDate.slice(0, 10),
                    endDate: r.endDate.slice(0, 10),
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
    [students, form]
  );

  return (
    <div>
      <PageHeader
        title="الاشتراكات"
        description="إدارة خطط الاشتراك والأسعار."
        actions={
          <Button onClick={openCreate}>
            <Plus /> إضافة اشتراك
          </Button>
        }
      />
      <DataTable
        data={subscriptions}
        columns={columns}
        searchPlaceholder="بحث بالطالب أو الخطة..."
        searchFilter={(row, q) => {
          const st = students.find((s) => s.id === row.studentId);
          return `${st?.firstName ?? ""} ${st?.lastName ?? ""} ${row.plan} ${row.status}`
            .toLowerCase()
            .includes(q);
        }}
        exportFilename="subscriptions.csv"
        onBulkDelete={(ids) => {
          deleteMany(ids);
          toast.success("تم حذف الاشتراكات");
        }}
        emptyTitle="لا اشتراكات"
        emptyActionLabel="إضافة اشتراك"
        onEmptyAction={openCreate}
      />

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editing ? "تعديل اشتراك" : "اشتراك جديد"}</DialogTitle>
          </DialogHeader>
          <form className="space-y-4" onSubmit={form.handleSubmit(onSubmit)}>
            <div className="space-y-2">
              <Label>الطالب</Label>
              <Select
                value={form.watch("studentId")}
                onValueChange={(v) => form.setValue("studentId", v)}
              >
                <SelectTrigger className="w-full">
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
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>الخطة</Label>
                <Select
                  value={form.watch("plan")}
                  onValueChange={(v) => {
                    const plan = v as SubscriptionValues["plan"];
                    form.setValue("plan", plan);
                    form.setValue("price", plan === "free" ? 0 : plan === "student" ? 990 : 8900);
                  }}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="free">مجاني</SelectItem>
                    <SelectItem value="student">طالب</SelectItem>
                    <SelectItem value="premium">مميز</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>السعر</Label>
                <Input type="number" {...form.register("price")} />
              </div>
              <div className="space-y-2">
                <Label>الحالة</Label>
                <Select
                  value={form.watch("status")}
                  onValueChange={(v) =>
                    form.setValue("status", v as SubscriptionValues["status"])
                  }
                >
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">نشط</SelectItem>
                    <SelectItem value="pending">قيد الانتظار</SelectItem>
                    <SelectItem value="expired">منتهٍ</SelectItem>
                    <SelectItem value="cancelled">ملغى</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>تاريخ البداية</Label>
                <Input type="date" {...form.register("startDate")} />
              </div>
              <div className="space-y-2 sm:col-span-2">
                <Label>تاريخ النهاية</Label>
                <Input type="date" {...form.register("endDate")} />
              </div>
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
        title="حذف الاشتراك؟"
        description="لا يمكن التراجع عن هذه العملية."
        destructive
        confirmLabel="حذف"
        onConfirm={() => {
          if (deleteId) {
            deleteSubscription(deleteId);
            toast.success("تم حذف الاشتراك");
            setDeleteId(null);
          }
        }}
      />
    </div>
  );
}
