"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { MoreHorizontal, Pencil, Plus, Trash2 } from "lucide-react";
import { RoleGate } from "@/components/layout/role-gate";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useCategoriesStore } from "@/stores/categories.store";
import { categorySchema, type CategoryValues } from "@/schemas";
import { formatDate } from "@/lib/utils";
import type { Category, CategoryType } from "@/types";

const TYPE_LABELS: Record<CategoryType, string> = {
  course: "مواد",
  lesson: "دروس",
  talent: "مواهب",
};

const defaultValues: CategoryValues = {
  name: "",
  description: "",
  type: "course",
  color: "#2563eb",
};

export default function CategoriesPage() {
  return (
    <RoleGate permission="manage_categories">
      <CategoriesPageContent />
    </RoleGate>
  );
}

function CategoriesPageContent() {
  const categories = useCategoriesStore((s) => s.categories);
  const addCategory = useCategoriesStore((s) => s.addCategory);
  const updateCategory = useCategoriesStore((s) => s.updateCategory);
  const deleteCategory = useCategoriesStore((s) => s.deleteCategory);
  const deleteMany = useCategoriesStore((s) => s.deleteMany);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Category | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [bulkDeleteIds, setBulkDeleteIds] = useState<string[] | null>(null);
  const [activeTab, setActiveTab] = useState<CategoryType>("course");

  const form = useForm<CategoryValues>({
    resolver: zodResolver(categorySchema),
    defaultValues,
  });

  function openCreate(type: CategoryType) {
    setEditing(null);
    form.reset({ ...defaultValues, type });
    setDialogOpen(true);
  }

  function openEdit(category: Category) {
    setEditing(category);
    form.reset({
      name: category.name,
      description: category.description,
      type: category.type,
      color: category.color,
    });
    setDialogOpen(true);
  }

  function onSubmit(values: CategoryValues) {
    if (editing) {
      updateCategory(editing.id, values);
      toast.success("تم تحديث التصنيف");
    } else {
      addCategory(values);
      toast.success("تم إنشاء التصنيف");
    }
    setDialogOpen(false);
  }

  function buildColumns(): ColumnDef<Category>[] {
    return [
      {
        id: "color",
        header: "",
        sortable: false,
        hideable: false,
        accessor: (r) => r.color,
        cell: (r) => (
          <span
            className="inline-block size-4 rounded-full border"
            style={{ backgroundColor: r.color }}
          />
        ),
      },
      { id: "name", header: "الاسم", accessor: (r) => r.name },
      { id: "description", header: "الوصف", accessor: (r) => r.description },
      {
        id: "type",
        header: "النوع",
        accessor: (r) => r.type,
        cell: (r) => TYPE_LABELS[r.type],
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
  }

  const filtered = categories.filter((c) => c.type === activeTab);

  return (
    <div className="space-y-6">
      <PageHeader
        title="التصنيفات"
        description="إدارة تصنيفات المواد والدروس والمواهب"
        actions={
          <Button onClick={() => openCreate(activeTab)}>
            <Plus className="size-4" />
            إضافة تصنيف
          </Button>
        }
      />

      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as CategoryType)}>
        <TabsList>
          <TabsTrigger value="course">مواد</TabsTrigger>
          <TabsTrigger value="lesson">دروس</TabsTrigger>
          <TabsTrigger value="talent">مواهب</TabsTrigger>
        </TabsList>
        {(["course", "lesson", "talent"] as CategoryType[]).map((type) => (
          <TabsContent key={type} value={type}>
            <DataTable
              data={categories.filter((c) => c.type === type)}
              columns={buildColumns()}
              searchPlaceholder="بحث..."
              searchFilter={(row, q) =>
                `${row.name} ${row.description}`.toLowerCase().includes(q)
              }
              exportFilename={`categories-${type}.csv`}
              onBulkDelete={(ids) => setBulkDeleteIds(ids)}
              onEmptyAction={() => openCreate(type)}
              emptyActionLabel="إضافة تصنيف"
            />
          </TabsContent>
        ))}
      </Tabs>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{editing ? "تعديل تصنيف" : "إضافة تصنيف"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">الاسم</Label>
              <Input id="name" {...form.register("name")} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">الوصف</Label>
              <Textarea id="description" rows={2} {...form.register("description")} />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>النوع</Label>
                <Select
                  value={form.watch("type")}
                  onValueChange={(v) => form.setValue("type", v as CategoryType)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="course">مواد</SelectItem>
                    <SelectItem value="lesson">دروس</SelectItem>
                    <SelectItem value="talent">مواهب</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="color">اللون</Label>
                <Input id="color" type="color" {...form.register("color")} />
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
        title="حذف التصنيف"
        description="هل أنت متأكد من حذف هذا التصنيف؟"
        destructive
        confirmLabel="حذف"
        onConfirm={() => {
          if (deleteId) {
            deleteCategory(deleteId);
            toast.success("تم حذف التصنيف");
            setDeleteId(null);
          }
        }}
      />

      <ConfirmDialog
        open={!!bulkDeleteIds}
        onOpenChange={(o) => !o && setBulkDeleteIds(null)}
        title="حذف التصنيفات المحددة"
        description={`هل أنت متأكد من حذف ${bulkDeleteIds?.length ?? 0} تصنيف؟`}
        destructive
        confirmLabel="حذف الكل"
        onConfirm={() => {
          if (bulkDeleteIds) {
            deleteMany(bulkDeleteIds);
            toast.success(`تم حذف ${bulkDeleteIds.length} تصنيف`);
            setBulkDeleteIds(null);
          }
        }}
      />
    </div>
  );
}
