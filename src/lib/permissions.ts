import type { Role } from "@/types";

export const ROLE_LABELS: Record<Role, string> = {
  super_admin: "مدير عام",
  content_manager: "مدير المحتوى",
  talent_manager: "مدير المواهب",
  moderator: "مشرف",
  student: "طالب",
};

export const ALL_PERMISSIONS = [
  "manage_users",
  "manage_agents",
  "manage_courses",
  "manage_lessons",
  "manage_categories",
  "manage_talents",
  "review_talents",
  "manage_subscriptions",
  "manage_notifications",
  "manage_reports",
  "view_activity",
  "manage_settings",
  "publish_content",
  "submit_talent",
  "view_own_learning",
] as const;

export type PermissionKey = (typeof ALL_PERMISSIONS)[number];

export const PERMISSION_LABELS: Record<PermissionKey, string> = {
  manage_users: "إدارة المستخدمين",
  manage_agents: "إدارة الوكلاء",
  manage_courses: "إدارة المواد",
  manage_lessons: "إدارة الدروس",
  manage_categories: "إدارة التصنيفات",
  manage_talents: "إدارة المواهب",
  review_talents: "مراجعة المواهب",
  manage_subscriptions: "إدارة الاشتراكات",
  manage_notifications: "إدارة الإشعارات",
  manage_reports: "إدارة البلاغات",
  view_activity: "سجل العمليات",
  manage_settings: "إعدادات المنصة",
  publish_content: "نشر المحتوى",
  submit_talent: "إرسال موهبة",
  view_own_learning: "متابعة التعلّم",
};

const ROLE_PERMISSIONS: Record<Role, PermissionKey[]> = {
  super_admin: [...ALL_PERMISSIONS],
  content_manager: [
    "manage_courses",
    "manage_lessons",
    "manage_categories",
    "publish_content",
    "view_activity",
  ],
  talent_manager: [
    "manage_talents",
    "review_talents",
    "manage_categories",
    "view_activity",
  ],
  moderator: ["review_talents", "manage_reports", "view_activity"],
  student: ["submit_talent", "view_own_learning"],
};

export function hasPermission(role: Role, permission: PermissionKey): boolean {
  return ROLE_PERMISSIONS[role].includes(permission);
}

export function isStaffRole(role: Role): boolean {
  return role !== "student";
}

export function canReviewTalents(role: Role): boolean {
  return hasPermission(role, "review_talents");
}

export function canManageTalents(role: Role): boolean {
  return hasPermission(role, "manage_talents");
}

export function getRolePermissions(role: Role): PermissionKey[] {
  return ROLE_PERMISSIONS[role];
}
