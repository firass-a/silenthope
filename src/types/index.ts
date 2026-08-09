export type Role =
  | "super_admin"
  | "content_manager"
  | "talent_manager"
  | "moderator"
  | "student";

export type EntityStatus = "active" | "inactive" | "suspended";

export type LessonStatus = "draft" | "pending_review" | "published" | "archived";

export type CourseStatus = "draft" | "published" | "archived";

export type TalentStatus =
  | "pending"
  | "approved"
  | "rejected"
  | "featured"
  | "archived";

export type SubscriptionPlan = "free" | "student" | "premium";

export type SubscriptionStatus = "active" | "expired" | "cancelled" | "pending";

export type ReportStatus = "pending" | "reviewed" | "resolved" | "dismissed";

export type ReportEntity = "lesson" | "talent" | "user";

export type NotificationType = "info" | "success" | "warning" | "system";

export type ActivityAction =
  | "CREATE"
  | "UPDATE"
  | "DELETE"
  | "STATUS_CHANGE"
  | "LOGIN"
  | "LOGOUT"
  | "PUBLISH"
  | "UNPUBLISH"
  | "APPROVE"
  | "REJECT"
  | "FEATURE"
  | "RESET";

export type ActivityEntity =
  | "student"
  | "agent"
  | "course"
  | "lesson"
  | "talent"
  | "category"
  | "subscription"
  | "notification"
  | "report"
  | "settings"
  | "auth"
  | "system";

export type CategoryType = "course" | "lesson" | "talent";

export type ThemeMode = "light";

export type FontSize = "sm" | "md" | "lg";

export type ContrastMode = "normal" | "high";

export interface Permission {
  id: string;
  label: string;
}

export interface UserAccount {
  id: string;
  email: string;
  password: string;
  name: string;
  role: Role;
  avatar?: string;
  studentId?: string;
  agentId?: string;
}

export interface AuthSession {
  userId: string;
  email: string;
  name: string;
  role: Role;
  avatar?: string;
  studentId?: string;
  agentId?: string;
  loggedInAt: string;
}

export interface Student {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  university: string;
  faculty: string;
  major: string;
  academicLevel: string;
  bio: string;
  avatar?: string;
  status: EntityStatus;
  joinedAt: string;
  progress: number;
}

export interface Agent {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: Exclude<Role, "student">;
  avatar?: string;
  status: EntityStatus;
  department: string;
  permissions: string[];
  createdAt: string;
  lastActive: string;
}

export interface Category {
  id: string;
  name: string;
  description: string;
  type: CategoryType;
  color: string;
  createdAt: string;
  updatedAt: string;
}

export interface Course {
  id: string;
  title: string;
  description: string;
  thumbnail?: string;
  categoryId: string;
  university: string;
  faculty: string;
  level: string;
  instructor: string;
  status: CourseStatus;
  lessonIds: string[];
  createdAt: string;
  updatedAt: string;
}

export type LessonSectionType =
  | "heading"
  | "text"
  | "image"
  | "infographic"
  | "video"
  | "sign_language"
  | "attachment";

export interface LessonSection {
  id: string;
  type: LessonSectionType;
  title?: string;
  content: string;
  mediaUrl?: string;
  caption?: string;
}

export interface Lesson {
  id: string;
  title: string;
  description: string;
  courseId: string;
  categoryId: string;
  instructor: string;
  thumbnail?: string;
  content: LessonSection[];
  summary: string;
  learningObjectives: string[];
  duration: number;
  difficulty: "beginner" | "intermediate" | "advanced";
  tags: string[];
  status: LessonStatus;
  publishedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Talent {
  id: string;
  studentId: string;
  studentName: string;
  title: string;
  description: string;
  categoryId: string;
  coverImage?: string;
  media: string[];
  skills: string[];
  status: TalentStatus;
  featured: boolean;
  views: number;
  likes: number;
  rejectionReason?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Subscription {
  id: string;
  studentId: string;
  plan: SubscriptionPlan;
  price: number;
  status: SubscriptionStatus;
  startDate: string;
  endDate: string;
  createdAt: string;
}

export interface AppNotification {
  id: string;
  title: string;
  message: string;
  type: NotificationType;
  recipient: string;
  read: boolean;
  createdAt: string;
}

export interface Report {
  id: string;
  reporter: string;
  entity: ReportEntity;
  entityId: string;
  reason: string;
  description: string;
  status: ReportStatus;
  createdAt: string;
  updatedAt: string;
}

export interface ActivityLog {
  id: string;
  action: ActivityAction;
  entity: ActivityEntity;
  entityId: string;
  description: string;
  performedBy: string;
  performedByRole?: Role;
  timestamp: string;
  meta?: Record<string, string>;
}

export interface PlatformSettings {
  platformName: string;
  description: string;
  logo?: string;
  contactEmail: string;
  theme: ThemeMode;
  compactMode: boolean;
  sidebarBehavior: "expanded" | "collapsed" | "auto";
  fontSize: FontSize;
  contrast: ContrastMode;
  reducedMotion: boolean;
  enableNotifications: boolean;
  emailNotifications: boolean;
  systemNotifications: boolean;
}

export interface StudentPreferences {
  userId: string;
  studentId: string;
  interests: string[];
  subjects: string[];
  updatedAt: string;
}

export interface LessonProgress {
  lessonId: string;
  courseId: string;
  percent: number;
  completed: boolean;
  updatedAt: string;
}

export interface StudentLearningState {
  studentId: string;
  lessons: Record<string, LessonProgress>;
  lastCourseId?: string;
  lastLessonId?: string;
}

export interface RegisterStudentInput {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  university: string;
  faculty: string;
  major: string;
  academicLevel: string;
  interests: string[];
  subjects: string[];
}
