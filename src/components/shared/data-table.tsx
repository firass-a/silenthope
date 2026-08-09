"use client";

import { useMemo, useState } from "react";
import {
  ArrowDownUp,
  ChevronLeft,
  ChevronRight,
  Download,
  Search,
  Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { EmptyState } from "@/components/shared/empty-state";
import { downloadCsv } from "@/lib/utils";
import { cn } from "@/lib/utils";

export interface ColumnDef<T> {
  id: string;
  header: string;
  accessor: (row: T) => unknown;
  cell?: (row: T) => React.ReactNode;
  sortable?: boolean;
  hideable?: boolean;
  className?: string;
}

interface DataTableProps<T extends { id: string }> {
  data: T[];
  columns: ColumnDef<T>[];
  searchPlaceholder?: string;
  searchFilter?: (row: T, query: string) => boolean;
  filters?: React.ReactNode;
  onBulkDelete?: (ids: string[]) => void;
  onBulkStatusChange?: (ids: string[]) => void;
  exportFilename?: string;
  emptyTitle?: string;
  emptyDescription?: string;
  onEmptyAction?: () => void;
  emptyActionLabel?: string;
}

export function DataTable<T extends { id: string }>({
  data,
  columns,
  searchPlaceholder = "بحث...",
  searchFilter,
  filters,
  onBulkDelete,
  onBulkStatusChange,
  exportFilename = "export.csv",
  emptyTitle = "لا توجد بيانات",
  emptyDescription = "ابدأ بإضافة عنصر جديد.",
  onEmptyAction,
  emptyActionLabel,
}: DataTableProps<T>) {
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(8);
  const [sortId, setSortId] = useState<string | null>(null);
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");
  const [selected, setSelected] = useState<string[]>([]);
  const [visible, setVisible] = useState<Record<string, boolean>>(
    Object.fromEntries(columns.map((c) => [c.id, true]))
  );

  const filtered = useMemo(() => {
    let rows = data;
    if (query.trim() && searchFilter) {
      rows = rows.filter((r) => searchFilter(r, query.trim().toLowerCase()));
    }
    if (sortId) {
      const col = columns.find((c) => c.id === sortId);
      if (col) {
        rows = [...rows].sort((a, b) => {
          const av = col.accessor(a);
          const bv = col.accessor(b);
          const as = String(av ?? "");
          const bs = String(bv ?? "");
          return sortDir === "asc" ? as.localeCompare(bs, "ar") : bs.localeCompare(as, "ar");
        });
      }
    }
    return rows;
  }, [data, query, searchFilter, sortId, sortDir, columns]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const currentPage = Math.min(page, totalPages);
  const pageRows = filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize);
  const visibleCols = columns.filter((c) => visible[c.id] !== false);

  const allSelected =
    pageRows.length > 0 && pageRows.every((r) => selected.includes(r.id));

  function toggleSort(id: string) {
    if (sortId === id) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else {
      setSortId(id);
      setSortDir("asc");
    }
  }

  function toggleAll(checked: boolean) {
    if (checked) setSelected((s) => [...new Set([...s, ...pageRows.map((r) => r.id)])]);
    else setSelected((s) => s.filter((id) => !pageRows.some((r) => r.id === id)));
  }

  function exportSelected() {
    const rows = (selected.length ? data.filter((d) => selected.includes(d.id)) : filtered).map(
      (row) => {
        const obj: Record<string, unknown> = {};
        columns.forEach((c) => {
          obj[c.header] = c.accessor(row);
        });
        return obj;
      }
    );
    downloadCsv(exportFilename, rows);
  }

  if (data.length === 0) {
    return (
      <EmptyState
        title={emptyTitle}
        description={emptyDescription}
        actionLabel={emptyActionLabel}
        onAction={onEmptyAction}
      />
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="relative w-full max-w-sm">
          <Search className="pointer-events-none absolute top-1/2 right-3 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setPage(1);
            }}
            placeholder={searchPlaceholder}
            className="pr-9"
            aria-label="بحث في الجدول"
          />
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {filters}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                الأعمدة
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start">
              <DropdownMenuLabel>إظهار الأعمدة</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {columns
                .filter((c) => c.hideable !== false)
                .map((c) => (
                  <DropdownMenuCheckboxItem
                    key={c.id}
                    checked={visible[c.id] !== false}
                    onCheckedChange={(v) =>
                      setVisible((prev) => ({ ...prev, [c.id]: !!v }))
                    }
                  >
                    {c.header}
                  </DropdownMenuCheckboxItem>
                ))}
            </DropdownMenuContent>
          </DropdownMenu>
          <Button variant="outline" size="sm" onClick={exportSelected}>
            <Download className="size-4" />
            تصدير
          </Button>
        </div>
      </div>

      {selected.length > 0 ? (
        <div className="flex flex-wrap items-center gap-2 rounded-xl border bg-secondary/60 px-3 py-2 text-sm">
          <span>تم تحديد {selected.length}</span>
          {onBulkStatusChange ? (
            <Button size="sm" variant="outline" onClick={() => onBulkStatusChange(selected)}>
              تغيير الحالة
            </Button>
          ) : null}
          {onBulkDelete ? (
            <Button
              size="sm"
              variant="destructive"
              onClick={() => {
                onBulkDelete(selected);
                setSelected([]);
              }}
            >
              <Trash2 className="size-4" />
              حذف المحدد
            </Button>
          ) : null}
        </div>
      ) : null}

      <div className="overflow-x-auto rounded-2xl border bg-card">
        <table className="w-full min-w-[720px] text-sm">
          <thead className="border-b bg-muted/40">
            <tr>
              <th className="w-12 p-3 text-right">
                <Checkbox
                  checked={allSelected}
                  onCheckedChange={(v) => toggleAll(!!v)}
                  aria-label="تحديد الكل"
                />
              </th>
              {visibleCols.map((col) => (
                <th key={col.id} className={cn("p-3 text-right font-medium", col.className)}>
                  {col.sortable !== false ? (
                    <button
                      type="button"
                      className="inline-flex items-center gap-1 hover:text-foreground"
                      onClick={() => toggleSort(col.id)}
                    >
                      {col.header}
                      <ArrowDownUp className="size-3.5 opacity-50" />
                    </button>
                  ) : (
                    col.header
                  )}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {pageRows.length === 0 ? (
              <tr>
                <td colSpan={visibleCols.length + 1} className="p-8 text-center text-muted-foreground">
                  لا نتائج مطابقة لبحثك
                </td>
              </tr>
            ) : (
              pageRows.map((row) => (
                <tr key={row.id} className="border-b last:border-0 hover:bg-muted/30">
                  <td className="p-3">
                    <Checkbox
                      checked={selected.includes(row.id)}
                      onCheckedChange={(v) =>
                        setSelected((s) =>
                          v ? [...s, row.id] : s.filter((id) => id !== row.id)
                        )
                      }
                      aria-label="تحديد الصف"
                    />
                  </td>
                  {visibleCols.map((col) => (
                    <td key={col.id} className={cn("p-3 align-middle", col.className)}>
                      {col.cell ? col.cell(row) : String(col.accessor(row) ?? "")}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-muted-foreground">
          {filtered.length} نتيجة — صفحة {currentPage} من {totalPages}
        </p>
        <div className="flex items-center gap-2">
          <Select
            value={String(pageSize)}
            onValueChange={(v) => {
              setPageSize(Number(v));
              setPage(1);
            }}
          >
            <SelectTrigger className="w-[100px]" size="sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {[5, 8, 12, 20].map((n) => (
                <SelectItem key={n} value={String(n)}>
                  {n} / صفحة
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button
            variant="outline"
            size="icon"
            disabled={currentPage <= 1}
            onClick={() => setPage((p) => p - 1)}
            aria-label="الصفحة السابقة"
          >
            <ChevronRight className="size-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            disabled={currentPage >= totalPages}
            onClick={() => setPage((p) => p + 1)}
            aria-label="الصفحة التالية"
          >
            <ChevronLeft className="size-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
