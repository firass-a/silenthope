"use client";

import { useMemo } from "react";
import { toast } from "sonner";
import { PageHeader } from "@/components/shared/page-header";
import { EmptyState } from "@/components/shared/empty-state";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useAuthStore } from "@/stores/auth.store";
import { useNotificationsStore } from "@/stores/notifications.store";
import { formatDateTime } from "@/lib/utils";

export default function MyNotificationsPage() {
  const session = useAuthStore((s) => s.session);
  const notifications = useNotificationsStore((s) => s.notifications);
  const markRead = useNotificationsStore((s) => s.markRead);
  const markAllRead = useNotificationsStore((s) => s.markAllRead);

  const mine = useMemo(() => {
    const id = session?.studentId ?? session?.userId ?? "";
    return notifications.filter(
      (n) =>
        n.recipient === "all" ||
        n.recipient === id ||
        n.recipient === session?.email
    );
  }, [notifications, session]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="إشعاراتي"
        description="تنبيهات بصرية متعلقة بحسابك فقط."
        actions={
          <Button
            variant="outline"
            onClick={() => {
              markAllRead();
              toast.success("تم تعليم الكل كمقروء");
            }}
          >
            تعليم الكل مقروء
          </Button>
        }
      />

      {mine.length === 0 ? (
        <EmptyState title="لا إشعارات" description="ستظهر هنا التنبيهات الخاصة بك." />
      ) : (
        <div className="space-y-3">
          {mine.map((n) => (
            <Card key={n.id} className={n.read ? "opacity-80" : ""}>
              <CardContent className="flex items-start justify-between gap-3 pt-5">
                <div className="space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-semibold">{n.title}</p>
                    <Badge variant="secondary">{n.type}</Badge>
                    {!n.read ? <Badge variant="warning">جديد</Badge> : null}
                  </div>
                  <p className="text-sm text-muted-foreground">{n.message}</p>
                  <p className="text-xs text-muted-foreground">
                    {formatDateTime(n.createdAt)}
                  </p>
                </div>
                {!n.read ? (
                  <Button size="sm" variant="outline" onClick={() => markRead(n.id)}>
                    مقروء
                  </Button>
                ) : null}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
