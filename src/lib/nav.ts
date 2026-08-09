import type { LucideIcon } from "lucide-react";
import {
  LayoutDashboard,
  BookOpen,
  GraduationCap,
  Layers,
  Sparkles,
  Users,
  UserCog,
  Shield,
  CreditCard,
  Bell,
  Flag,
  History,
  Settings,
  FolderTree,
  PlusCircle,
  User,
} from "lucide-react";
import type { Role } from "@/types";
import { hasPermission, type PermissionKey } from "@/lib/permissions";

export interface NavItem {
  title: string;
  href: string;
  icon: LucideIcon;
  permission?: PermissionKey;
  /** If set, only these roles see the item (in addition to permission check). */
  roles?: Role[];
}

export interface NavGroup {
  title: string;
  items: NavItem[];
}

/** Staff / admin navigation — filtered strictly by permission. */
export const staffNav: NavGroup[] = [
  {
    title: "الرئيسية",
    items: [{ title: "لوحة التحكم", href: "/dashboard", icon: LayoutDashboard }],
  },
  {
    title: "التعليم",
    items: [
      {
        title: "المواد",
        href: "/dashboard/courses",
        icon: GraduationCap,
        permission: "manage_courses",
      },
      {
        title: "الدروس",
        href: "/dashboard/lessons",
        icon: BookOpen,
        permission: "manage_lessons",
      },
      {
        title: "التصنيفات",
        href: "/dashboard/categories",
        icon: FolderTree,
        permission: "manage_categories",
      },
      {
        title: "المحتوى",
        href: "/dashboard/lessons?status=pending_review",
        icon: Layers,
        permission: "publish_content",
      },
    ],
  },
  {
    title: "المواهب",
    items: [
      {
        title: "جميع المواهب",
        href: "/dashboard/talents",
        icon: Sparkles,
        permission: "manage_talents",
      },
      {
        title: "قيد المراجعة",
        href: "/dashboard/talents?status=pending",
        icon: Flag,
        permission: "review_talents",
      },
      {
        title: "المنشورة",
        href: "/dashboard/talents?status=approved",
        icon: Sparkles,
        permission: "manage_talents",
      },
    ],
  },
  {
    title: "المستخدمون",
    items: [
      {
        title: "الطلبة",
        href: "/dashboard/students",
        icon: Users,
        permission: "manage_users",
      },
      {
        title: "الوكلاء",
        href: "/dashboard/agents",
        icon: UserCog,
        permission: "manage_agents",
      },
      {
        title: "الأدوار والصلاحيات",
        href: "/dashboard/roles",
        icon: Shield,
        permission: "manage_agents",
      },
    ],
  },
  {
    title: "التشغيل",
    items: [
      {
        title: "الاشتراكات",
        href: "/dashboard/subscriptions",
        icon: CreditCard,
        permission: "manage_subscriptions",
      },
      {
        title: "الإشعارات",
        href: "/dashboard/notifications",
        icon: Bell,
        permission: "manage_notifications",
      },
      {
        title: "البلاغات",
        href: "/dashboard/reports",
        icon: Flag,
        permission: "manage_reports",
      },
      {
        title: "سجل العمليات",
        href: "/dashboard/activity",
        icon: History,
        permission: "view_activity",
      },
      {
        title: "الإعدادات",
        href: "/dashboard/settings",
        icon: Settings,
        permission: "manage_settings",
      },
    ],
  },
];

/** Legacy grouped nav (unused for student chrome; kept for compatibility). */
export const studentNav: NavGroup[] = [
  {
    title: "مساحتي",
    items: [
      { title: "الرئيسية", href: "/home", icon: LayoutDashboard },
      {
        title: "ملفي",
        href: "/me",
        icon: User,
        permission: "view_own_learning",
      },
    ],
  },
  {
    title: "التعلّم",
    items: [
      {
        title: "أكاديميتي",
        href: "/learn",
        icon: GraduationCap,
        permission: "view_own_learning",
      },
    ],
  },
  {
    title: "المواهب",
    items: [
      {
        title: "مواهبي",
        href: "/me/talents",
        icon: Sparkles,
        permission: "submit_talent",
      },
      {
        title: "إرسال موهبة",
        href: "/me/talents?new=1",
        icon: PlusCircle,
        permission: "submit_talent",
      },
    ],
  },
  {
    title: "الحساب",
    items: [
      { title: "إشعاراتي", href: "/me/notifications", icon: Bell },
    ],
  },
];

/** Top nav for authenticated student shell */
export const studentAppNav = [
  { title: "الرئيسية", href: "/home" },
  { title: "تعلّمي", href: "/learn" },
  { title: "اكتشف المواهب", href: "/talents" },
  { title: "مواهبي", href: "/me/talents" },
  { title: "إشعاراتي", href: "/me/notifications" },
];

function itemVisible(item: NavItem, role: Role): boolean {
  if (item.roles && !item.roles.includes(role)) return false;
  if (!item.permission) return true;
  return hasPermission(role, item.permission);
}

/** Staff navigation under /admin */
export const adminNav: NavGroup[] = staffNav.map((group) => ({
  ...group,
  items: group.items.map((item) => ({
    ...item,
    href: item.href.replace(/^\/dashboard/, "/admin"),
  })),
}));

export function filterNavForRole(role: Role): NavGroup[] {
  const source = role === "student" ? studentNav : adminNav;
  return source
    .map((group) => ({
      ...group,
      items: group.items.filter((item) => itemVisible(item, role)),
    }))
    .filter((g) => g.items.length > 0);
}

export function filterAdminNav(role: Role): NavGroup[] {
  return adminNav
    .map((group) => ({
      ...group,
      items: group.items.filter((item) => itemVisible(item, role)),
    }))
    .filter((g) => g.items.length > 0);
}

export const publicNav = [
  { title: "الرئيسية", href: "/" },
  { title: "التعلّم", href: "/learn" },
  { title: "المواهب", href: "/talents" },
  { title: "الاشتراكات", href: "/subscriptions" },
  { title: "عن المنصة", href: "/about" },
  { title: "تواصل", href: "/contact" },
];
