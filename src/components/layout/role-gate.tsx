"use client";

import Link from "next/link";
import { useAuthStore } from "@/stores/auth.store";
import { hasPermission, type PermissionKey, isStaffRole } from "@/lib/permissions";
import type { Role } from "@/types";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/shared/empty-state";
import { ShieldAlert } from "lucide-react";

interface RoleGateProps {
  children: React.ReactNode;
  permission?: PermissionKey;
  /** Allow if the role has at least one of these permissions. */
  anyOf?: PermissionKey[];
  roles?: Role[];
  staffOnly?: boolean;
  fallbackHref?: string;
}

export function RoleGate({
  children,
  permission,
  anyOf,
  roles,
  staffOnly,
  fallbackHref = "/dashboard",
}: RoleGateProps) {
  const session = useAuthStore((s) => s.session);
  const role = session?.role;

  if (!role) return null;

  const allowed =
    (!staffOnly || isStaffRole(role)) &&
    (!roles || roles.includes(role)) &&
    (!permission || hasPermission(role, permission)) &&
    (!anyOf || anyOf.some((p) => hasPermission(role, p)));

  if (!allowed) {
    return (
      <EmptyState
        icon={ShieldAlert}
        title="غير مصرّح لك بالوصول"
        description="هذه الصفحة مخصّصة لدور آخر في المنصة."
        actionLabel="العودة للوحة التحكم"
        onAction={() => {
          window.location.href = fallbackHref;
        }}
      />
    );
  }

  return <>{children}</>;
}

export function useCan(permission: PermissionKey): boolean {
  const role = useAuthStore((s) => s.session?.role);
  if (!role) return false;
  return hasPermission(role, permission);
}

export function StaffOnlyLink({
  href,
  children,
}: {
  href: string;
  children: React.ReactNode;
}) {
  const role = useAuthStore((s) => s.session?.role);
  if (!role || !isStaffRole(role)) return null;
  return (
    <Button asChild variant="outline" size="sm">
      <Link href={href}>{children}</Link>
    </Button>
  );
}
