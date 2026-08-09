import { Badge } from "@/components/ui/badge";

const LABELS: Record<string, string> = {
  active: "نشط",
  inactive: "غير نشط",
  suspended: "موقوف",
  draft: "مسودة",
  pending_review: "بانتظار المراجعة",
  published: "منشور",
  archived: "مؤرشف",
  pending: "قيد الانتظار",
  approved: "مقبول",
  rejected: "مرفوض",
  featured: "مميز",
  expired: "منتهٍ",
  cancelled: "ملغى",
  reviewed: "تمت المراجعة",
  resolved: "تم الحل",
  dismissed: "مرفوض",
  free: "مجاني",
  student: "طالب",
  premium: "مميز",
  beginner: "مبتدئ",
  intermediate: "متوسط",
  advanced: "متقدم",
};

const VARIANTS: Record<
  string,
  "default" | "secondary" | "destructive" | "outline" | "success" | "warning" | "info" | "accent"
> = {
  active: "success",
  published: "success",
  approved: "success",
  resolved: "success",
  featured: "accent",
  premium: "accent",
  pending: "warning",
  pending_review: "warning",
  draft: "secondary",
  inactive: "secondary",
  expired: "secondary",
  archived: "outline",
  cancelled: "outline",
  dismissed: "outline",
  rejected: "destructive",
  suspended: "destructive",
  reviewed: "info",
  free: "secondary",
  student: "info",
};

export function StatusBadge({ status }: { status: string }) {
  return (
    <Badge variant={VARIANTS[status] ?? "outline"} aria-label={`الحالة: ${LABELS[status] ?? status}`}>
      {LABELS[status] ?? status}
    </Badge>
  );
}

export function statusLabel(status: string) {
  return LABELS[status] ?? status;
}
