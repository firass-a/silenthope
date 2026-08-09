import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().email("بريد إلكتروني غير صالح"),
  password: z.string().min(4, "كلمة المرور قصيرة جداً"),
});

export const studentSchema = z.object({
  firstName: z.string().min(2, "الاسم مطلوب"),
  lastName: z.string().min(2, "اللقب مطلوب"),
  email: z.string().email("بريد غير صالح"),
  phone: z.string().min(8, "رقم الهاتف مطلوب"),
  university: z.string().min(2, "الجامعة مطلوبة"),
  faculty: z.string().min(2, "الكلية مطلوبة"),
  major: z.string().min(2, "التخصص مطلوب"),
  academicLevel: z.string().min(2, "المستوى مطلوب"),
  bio: z.string().optional().default(""),
  avatar: z.string().optional(),
  status: z.enum(["active", "inactive", "suspended"]),
});

export const agentSchema = z.object({
  name: z.string().min(2, "الاسم مطلوب"),
  email: z.string().email("بريد غير صالح"),
  phone: z.string().min(8, "الهاتف مطلوب"),
  role: z.enum([
    "super_admin",
    "content_manager",
    "talent_manager",
    "moderator",
  ]),
  department: z.string().min(2, "القسم مطلوب"),
  status: z.enum(["active", "inactive", "suspended"]),
  permissions: z.array(z.string()).default([]),
  avatar: z.string().optional(),
});

export const courseSchema = z.object({
  title: z.string().min(3, "العنوان مطلوب"),
  description: z.string().min(10, "الوصف مطلوب"),
  thumbnail: z.string().optional(),
  categoryId: z.string().min(1, "التصنيف مطلوب"),
  university: z.string().min(2),
  faculty: z.string().min(2),
  level: z.string().min(2),
  instructor: z.string().min(2),
  status: z.enum(["draft", "published", "archived"]),
});

export const lessonSchema = z.object({
  title: z.string().min(3),
  description: z.string().min(5),
  courseId: z.string().min(1),
  categoryId: z.string().min(1),
  instructor: z.string().min(2),
  thumbnail: z.string().optional(),
  summary: z.string().min(5),
  learningObjectives: z.array(z.string()).default([]),
  duration: z.coerce.number().min(1),
  difficulty: z.enum(["beginner", "intermediate", "advanced"]),
  tags: z.array(z.string()).default([]),
  status: z.enum(["draft", "pending_review", "published", "archived"]),
});

export const talentSchema = z.object({
  studentId: z.string().min(1),
  studentName: z.string().min(2),
  title: z.string().min(3),
  description: z.string().min(10),
  categoryId: z.string().min(1),
  coverImage: z.string().optional(),
  media: z.array(z.string()).default([]),
  skills: z.array(z.string()).default([]),
  status: z
    .enum(["pending", "approved", "rejected", "featured", "archived"])
    .default("pending"),
});

export const categorySchema = z.object({
  name: z.string().min(2),
  description: z.string().min(2),
  type: z.enum(["course", "lesson", "talent"]),
  color: z.string().min(4),
});

export const subscriptionSchema = z.object({
  studentId: z.string().min(1),
  plan: z.enum(["free", "student", "premium"]),
  price: z.coerce.number().min(0),
  status: z.enum(["active", "expired", "cancelled", "pending"]),
  startDate: z.string().min(1),
  endDate: z.string().min(1),
});

export const notificationSchema = z.object({
  title: z.string().min(2),
  message: z.string().min(2),
  type: z.enum(["info", "success", "warning", "system"]),
  recipient: z.string().min(1),
});

export const reportSchema = z.object({
  reporter: z.string().min(1),
  entity: z.enum(["lesson", "talent", "user"]),
  entityId: z.string().min(1),
  reason: z.string().min(2),
  description: z.string().min(2),
  status: z.enum(["pending", "reviewed", "resolved", "dismissed"]).default("pending"),
});

export type LoginValues = z.infer<typeof loginSchema>;
export type StudentValues = z.infer<typeof studentSchema>;
export type AgentValues = z.infer<typeof agentSchema>;
export type CourseValues = z.infer<typeof courseSchema>;
export type LessonValues = z.infer<typeof lessonSchema>;
export type TalentValues = z.infer<typeof talentSchema>;
export type CategoryValues = z.infer<typeof categorySchema>;
export type SubscriptionValues = z.infer<typeof subscriptionSchema>;
export type NotificationValues = z.infer<typeof notificationSchema>;
export type ReportValues = z.infer<typeof reportSchema>;
