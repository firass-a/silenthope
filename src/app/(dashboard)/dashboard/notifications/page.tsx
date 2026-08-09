"use client";

import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { MoreHorizontal, Plus, Pencil, Trash2, CheckCheck } from "lucide-react";
import { RoleGate } from "@/components/layout/role-gate";
import { PageHeader } from "@/components/shared/page-header";
import { DataTable, type ColumnDef } from "@/components/shared/data-table";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { Badge } from "@/components/ui/badge";
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
import { useNotificationsStore } from "@/stores/notifications.store";
import { notificationSchema, type NotificationValues } from "@/schemas";
import type { AppNotification } from "@/types";
import { formatDateTime } from "@/lib/utils";

const defaults: NotificationValues = {
  title: "",
  message: "",
  type: "info",
  recipient: "all",
};

export default function NotificationsPage() {
  return (
    <RoleGate permission="manage_notifications">
      <NotificationsPageContent />
    </RoleGate>
  );
}

function NotificationsPageContent() {
  const notifications = useNotificationsStore((s) => s.notifications);
  const addNotification = useNotificationsStore((s) => s.addNotification);
  const updateNotification = useNotificationsStore((s) => s.updateNotification);
  const deleteNotification = useNotificationsStore((s) => s.deleteNotification);
  const deleteMany = useNotificationsStore((s) => s.deleteMany);
  const markRead = useNotificationsStore((s) => s.markRead);
  const markAllRead = useNotificationsStore((s) => s.markAllRead);

  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<AppNotification | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const form = useForm<NotificationValues>({
    resolver: zodResolver(notificationSchema),
    defaultValues: defaults,
  });

  function openCreate() {
    setEditing(null);
    form.reset(defaults);
    setOpen(true);
  }

  function onSubmit(values: NotificationValues) {
    if (editing) {
      updateNotification(editing.id, values);
      toast.success("تم تعديل الإشعار");
    } else {
      addNotification(values);
      toast.success("تم إنشاء الإشعار");
    }
    setOpen(false);
  }

  const columns: ColumnDef<AppNotification>[] = useMemo(
    () => [
      {
        id: "title",
        header: "العنوان",
        accessor: (r) => r.title,
        cell: (r) => (
          <div>
            <p className={r.read ? "font-medium" : "font-bold"}>{r.title}</p>
            <p className="line-clamp-1 text-xs text-muted-foreground">{r.message}</p>
          </div>
        ),
      },
      {
        id: "type",
        header: "النوع",
        accessor: (r) => r.type,
        cell: (r) => <Badge variant="secondary">{r.type}</Badge>,
      },
      { id: "recipient", header: "المستلم", accessor: (r) => r.recipient },
      {
        id: "read",
        header: "القراءة",
        accessor: (r) => (r.read ? "مقروء" : "غير مقروء"),
        cell: (r) => (
          <Badge variant={r.read ? "outline" : "warning"}>
            {r.read ? "مقروء" : "غير مقروء"}
          </Badge>
        ),
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
              <DropdownMenuItem
                onClick={() => {
                  markRead(r.id, !r.read);
                  toast.success(r.read ? "تم تعليم كغير مقروء" : "تم تعليم كمقروء");
                }}
              >
                <CheckCheck /> {r.read ? "غير مقروء" : "مقروء"}
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => {
                  setEditing(r);
                  form.reset({
                    title: r.title,
                    message: r.message,
                    type: r.type,
                    recipient: r.recipient,
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
    [form, markRead]
  );

  return (
    <div>
      <PageHeader
        title="الإشعارات"
        description="إنشاء وإدارة إشعارات المنصة البصرية."
        actions={
          <>
            <Button
              variant="outline"
              onClick={() => {
                markAllRead();
                toast.success("تم تعليم الكل كمقروء");
              }}
            >
              <CheckCheck /> تعليم الكل مقروء
            </Button>
            <Button onClick={openCreate}>
              <Plus /> إشعار جديد
            </Button>
          </>
        }
      />
      <DataTable
        data={notifications}
        columns={columns}
        searchPlaceholder="بحث في الإشعارات..."
        searchFilter={(row, q) =>
          `${row.title} ${row.message} ${row.recipient}`.toLowerCase().includes(q)
        }
        exportFilename="notifications.csv"
        onBulkDelete={(ids) => {
          deleteMany(ids);
          toast.success("تم حذف الإشعارات");
        }}
        emptyTitle="لا إشعارات"
        emptyActionLabel="إنشاء إشعار"
        onEmptyAction={openCreate}
      />

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editing ? "تعديل إشعار" : "إشعار جديد"}</DialogTitle>
          </DialogHeader>
          <form className="space-y-4" onSubmit={form.handleSubmit(onSubmit)}>
            <div className="space-y-2">
              <Label>العنوان</Label>
              <Input {...form.register("title")} />
            </div>
            <div className="space-y-2">
              <Label>الرسالة</Label>
              <Textarea {...form.register("message")} />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>النوع</Label>
                <Select
                  value={form.watch("type")}
                  onValueChange={(v) =>
                    form.setValue("type", v as NotificationValues["type"])
                  }
                >
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="info">معلومة</SelectItem>
                    <SelectItem value="success">نجاح</SelectItem>
                    <SelectItem value="warning">تنبيه</SelectItem>
                    <SelectItem value="system">نظام</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>المستلم</Label>
                <Input placeholder="all أو معرف مستخدم" {...form.register("recipient")} />
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
        title="حذف الإشعار؟"
        description="لا يمكن التراجع عن هذه العملية."
        destructive
        confirmLabel="حذف"
        onConfirm={() => {
          if (deleteId) {
            deleteNotification(deleteId);
            toast.success("تم حذف الإشعار");
            setDeleteId(null);
          }
        }}
      />
    </div>
  );
}
