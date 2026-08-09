"use client";

import { RoleGate } from "@/components/layout/role-gate";
import { PageHeader } from "@/components/shared/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  ALL_PERMISSIONS,
  PERMISSION_LABELS,
  ROLE_LABELS,
  hasPermission,
} from "@/lib/permissions";
import type { Role } from "@/types";
import { Check, X } from "lucide-react";

const ROLES: Role[] = [
  "super_admin",
  "content_manager",
  "talent_manager",
  "moderator",
  "student",
];

export default function RolesPage() {
  return (
    <RoleGate permission="manage_agents">
      <RolesPageContent />
    </RoleGate>
  );
}

function RolesPageContent() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="الأدوار والصلاحيات"
        description="مصفوفة الصلاحيات حسب الدور."
      />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {ROLES.map((role) => (
          <Card key={role}>
            <CardHeader>
              <CardTitle className="flex items-center justify-between gap-2">
                <span>{ROLE_LABELS[role]}</span>
                <Badge variant="outline">{role}</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {ALL_PERMISSIONS.map((perm) => {
                const ok = hasPermission(role, perm);
                return (
                  <div
                    key={perm}
                    className="flex items-center justify-between rounded-lg border px-3 py-2 text-sm"
                  >
                    <span>{PERMISSION_LABELS[perm]}</span>
                    {ok ? (
                      <span className="inline-flex items-center gap-1 text-success">
                        <Check className="size-4" /> مسموح
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-muted-foreground">
                        <X className="size-4" /> غير مسموح
                      </span>
                    )}
                  </div>
                );
              })}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
