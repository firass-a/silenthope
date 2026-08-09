"use client";

import { useState } from "react";
import { useForm, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { MoreHorizontal, Pencil, Plus, Power, Shield, Trash2 } from "lucide-react";
import { RoleGate } from "@/components/layout/role-gate";
import { PageHeader } from "@/components/shared/page-header";
import { DataTable, type ColumnDef } from "@/components/shared/data-table";
import { StatusBadge } from "@/components/shared/status-badge";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Checkbox } from "@/components/ui/checkbox";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAgentsStore } from "@/stores/agents.store";
import { agentSchema, type AgentValues } from "@/schemas";
import {
  ALL_PERMISSIONS,
  PERMISSION_LABELS,
  ROLE_LABELS,
  type PermissionKey,
} from "@/lib/permissions";
import { formatDate, getInitials } from "@/lib/utils";
import type { Agent, EntityStatus, Role } from "@/types";

const defaultValues: AgentValues = {
  name: "",
  email: "",
  phone: "",
  role: "moderator",
  department: "",
  status: "active",
  permissions: [],
};

export default function AgentsPage() {
  return (
    <RoleGate permission="manage_agents">
      <AgentsPageContent />
    </RoleGate>
  );
}

function AgentsPageContent() {
  const agents = useAgentsStore((s) => s.agents);
  const addAgent = useAgentsStore((s) => s.addAgent);
  const updateAgent = useAgentsStore((s) => s.updateAgent);
  const deleteAgent = useAgentsStore((s) => s.deleteAgent);
  const deleteMany = useAgentsStore((s) => s.deleteMany);
  const setAgentStatus = useAgentsStore((s) => s.setAgentStatus);
  const changeRole = useAgentsStore((s) => s.changeRole);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Agent | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [bulkDeleteIds, setBulkDeleteIds] = useState<string[] | null>(null);

  const form = useForm<AgentValues>({
    resolver: zodResolver(agentSchema) as Resolver<AgentValues>,
    defaultValues,
  });

  const selectedPermissions = form.watch("permissions");

  function openCreate() {
    setEditing(null);
    form.reset(defaultValues);
    setDialogOpen(true);
  }

  function openEdit(agent: Agent) {
    setEditing(agent);
    form.reset({
      name: agent.name,
      email: agent.email,
      phone: agent.phone,
      role: agent.role,
      department: agent.department,
      status: agent.status,
      permissions: agent.permissions,
      avatar: agent.avatar,
    });
    setDialogOpen(true);
  }

  function togglePermission(key: PermissionKey) {
    const current = form.getValues("permissions");
    form.setValue(
      "permissions",
      current.includes(key) ? current.filter((p) => p !== key) : [...current, key]
    );
  }

  function onSubmit(values: AgentValues) {
    if (editing) {
      updateAgent(editing.id, values);
      toast.success("تم تحديث الوكيل");
    } else {
      addAgent(values);
      toast.success("تم إضافة الوكيل");
    }
    setDialogOpen(false);
  }

  const columns: ColumnDef<Agent>[] = [
    {
      id: "avatar",
      header: "",
      sortable: false,
      hideable: false,
      accessor: (r) => r.name,
      cell: (r) => (
        <Avatar className="size-9">
          <AvatarFallback>{getInitials(r.name)}</AvatarFallback>
        </Avatar>
      ),
    },
    { id: "name", header: "الاسم", accessor: (r) => r.name },
    { id: "email", header: "البريد", accessor: (r) => r.email },
    {
      id: "role",
      header: "الدور",
      accessor: (r) => r.role,
      cell: (r) => ROLE_LABELS[r.role],
    },
    { id: "department", header: "القسم", accessor: (r) => r.department },
    {
      id: "status",
      header: "الحالة",
      accessor: (r) => r.status,
      cell: (r) => <StatusBadge status={r.status} />,
    },
    {
      id: "lastActive",
      header: "آخر نشاط",
      accessor: (r) => r.lastActive,
      cell: (r) => formatDate(r.lastActive),
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
            <DropdownMenuItem
              onClick={() => {
                const next: EntityStatus = r.status === "active" ? "inactive" : "active";
                setAgentStatus(r.id, next);
                toast.success(`تم ${next === "active" ? "تفعيل" : "إيقاف"} الوكيل`);
              }}
            >
              <Power className="size-4" />
              {r.status === "active" ? "إيقاف" : "تفعيل"}
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => {
                changeRole(r.id, "content_manager");
                toast.success("تم تغيير الدور إلى مدير المحتوى");
              }}
            >
              <Shield className="size-4" />
              تعيين مدير محتوى
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
        title="الوكلاء"
        description="إدارة فريق العمل والصلاحيات"
        actions={
          <Button onClick={openCreate}>
            <Plus className="size-4" />
            إضافة وكيل
          </Button>
        }
      />

      <DataTable
        data={agents}
        columns={columns}
        searchPlaceholder="بحث بالاسم أو البريد..."
        searchFilter={(row, q) =>
          `${row.name} ${row.email} ${row.department}`.toLowerCase().includes(q)
        }
        exportFilename="agents.csv"
        onBulkDelete={(ids) => setBulkDeleteIds(ids)}
        onBulkStatusChange={(ids) => {
          ids.forEach((id) => setAgentStatus(id, "inactive"));
          toast.success(`تم إيقاف ${ids.length} وكيل`);
        }}
        onEmptyAction={openCreate}
        emptyActionLabel="إضافة وكيل"
      />

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editing ? "تعديل وكيل" : "إضافة وكيل"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">الاسم</Label>
              <Input id="name" {...form.register("name")} />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="email">البريد</Label>
                <Input id="email" type="email" {...form.register("email")} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">الهاتف</Label>
                <Input id="phone" {...form.register("phone")} />
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>الدور</Label>
                <Select
                  value={form.watch("role")}
                  onValueChange={(v) => form.setValue("role", v as Exclude<Role, "student">)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {(Object.keys(ROLE_LABELS) as Role[])
                      .filter((r) => r !== "student")
                      .map((r) => (
                        <SelectItem key={r} value={r}>
                          {ROLE_LABELS[r]}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
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
            </div>
            <div className="space-y-2">
              <Label htmlFor="department">القسم</Label>
              <Input id="department" {...form.register("department")} />
            </div>
            <div className="space-y-2">
              <Label>الصلاحيات</Label>
              <div className="grid gap-2 rounded-xl border p-3 sm:grid-cols-2">
                {ALL_PERMISSIONS.map((key) => (
                  <label key={key} className="flex items-center gap-2 text-sm">
                    <Checkbox
                      checked={selectedPermissions.includes(key)}
                      onCheckedChange={() => togglePermission(key)}
                    />
                    {PERMISSION_LABELS[key]}
                  </label>
                ))}
              </div>
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
        title="حذف الوكيل"
        description="هل أنت متأكد من حذف هذا الوكيل؟"
        destructive
        confirmLabel="حذف"
        onConfirm={() => {
          if (deleteId) {
            deleteAgent(deleteId);
            toast.success("تم حذف الوكيل");
            setDeleteId(null);
          }
        }}
      />

      <ConfirmDialog
        open={!!bulkDeleteIds}
        onOpenChange={(o) => !o && setBulkDeleteIds(null)}
        title="حذف الوكلاء المحددين"
        description={`هل أنت متأكد من حذف ${bulkDeleteIds?.length ?? 0} وكيل؟`}
        destructive
        confirmLabel="حذف الكل"
        onConfirm={() => {
          if (bulkDeleteIds) {
            deleteMany(bulkDeleteIds);
            toast.success(`تم حذف ${bulkDeleteIds.length} وكيل`);
            setBulkDeleteIds(null);
          }
        }}
      />
    </div>
  );
}
