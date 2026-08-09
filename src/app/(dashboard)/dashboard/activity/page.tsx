"use client";

import { useMemo, useState } from "react";
import { RoleGate } from "@/components/layout/role-gate";
import { PageHeader } from "@/components/shared/page-header";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/shared/empty-state";
import { useActivityStore } from "@/stores/activity.store";
import type { ActivityAction, ActivityEntity } from "@/types";
import { formatDateTime } from "@/lib/utils";
import { History } from "lucide-react";

const ACTIONS: ActivityAction[] = [
  "CREATE",
  "UPDATE",
  "DELETE",
  "STATUS_CHANGE",
  "LOGIN",
  "LOGOUT",
  "PUBLISH",
  "UNPUBLISH",
  "APPROVE",
  "REJECT",
  "FEATURE",
  "RESET",
];

const ENTITIES: ActivityEntity[] = [
  "student",
  "agent",
  "course",
  "lesson",
  "talent",
  "category",
  "subscription",
  "notification",
  "report",
  "settings",
  "auth",
  "system",
];

export default function ActivityPage() {
  return (
    <RoleGate permission="view_activity">
      <ActivityPageContent />
    </RoleGate>
  );
}

function ActivityPageContent() {
  const logs = useActivityStore((s) => s.logs);
  const [query, setQuery] = useState("");
  const [action, setAction] = useState<string>("all");
  const [entity, setEntity] = useState<string>("all");
  const [date, setDate] = useState("");

  const filtered = useMemo(() => {
    return logs.filter((log) => {
      const q = query.trim().toLowerCase();
      const matchesQ =
        !q ||
        `${log.description} ${log.performedBy} ${log.entity} ${log.action}`
          .toLowerCase()
          .includes(q);
      const matchesAction = action === "all" || log.action === action;
      const matchesEntity = entity === "all" || log.entity === entity;
      const matchesDate =
        !date || new Date(log.timestamp).toISOString().slice(0, 10) === date;
      return matchesQ && matchesAction && matchesEntity && matchesDate;
    });
  }, [logs, query, action, entity, date]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="سجل العمليات"
        description="كل عمليات الإنشاء والتعديل والحذف والمراجعة في الجلسة الحالية."
        badge={<Badge variant="secondary">{filtered.length} عملية</Badge>}
      />

      <div className="grid gap-3 md:grid-cols-4">
        <Input
          placeholder="بحث في الوصف أو المستخدم..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          aria-label="بحث في سجل العمليات"
        />
        <Select value={action} onValueChange={setAction}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="نوع العملية" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">كل العمليات</SelectItem>
            {ACTIONS.map((a) => (
              <SelectItem key={a} value={a}>
                {a}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={entity} onValueChange={setEntity}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="العنصر" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">كل العناصر</SelectItem>
            {ENTITIES.map((e) => (
              <SelectItem key={e} value={e}>
                {e}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          aria-label="تصفية بالتاريخ"
        />
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          icon={History}
          title="لا عمليات مطابقة"
          description="جرّب تغيير عوامل التصفية أو نفّذ عملية جديدة في المنصة."
        />
      ) : (
        <ol className="relative space-y-4 border-r border-border pr-6">
          {filtered.map((log) => (
            <li key={log.id} className="relative">
              <span className="absolute top-4 -right-[31px] size-3 rounded-full border-2 border-background bg-gold-500" />
              <Card>
                <CardContent className="space-y-2 pt-4">
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge>{log.action}</Badge>
                    <Badge variant="outline">{log.entity}</Badge>
                    <span className="text-xs text-muted-foreground">
                      {formatDateTime(log.timestamp)}
                    </span>
                  </div>
                  <p className="font-medium">{log.description}</p>
                  <p className="text-sm text-muted-foreground">
                    بواسطة {log.performedBy}
                    {log.performedByRole ? ` (${log.performedByRole})` : ""} — العنصر:{" "}
                    <code className="text-xs">{log.entityId}</code>
                  </p>
                </CardContent>
              </Card>
            </li>
          ))}
        </ol>
      )}
    </div>
  );
}
