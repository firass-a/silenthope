"use client";

import { use, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import {
  ArrowDown,
  ArrowRight,
  ArrowUp,
  GripVertical,
  Plus,
  Save,
  Trash2,
  Upload,
} from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { StatusBadge } from "@/components/shared/status-badge";
import { EmptyState } from "@/components/shared/empty-state";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useLessonsStore } from "@/stores/lessons.store";
import { generateId } from "@/lib/utils";
import type { LessonSection, LessonSectionType } from "@/types";

const SECTION_TYPES: { value: LessonSectionType; label: string }[] = [
  { value: "heading", label: "عنوان" },
  { value: "text", label: "نص" },
  { value: "image", label: "صورة" },
  { value: "infographic", label: "إنفوغرافيك" },
  { value: "video", label: "فيديو" },
  { value: "sign_language", label: "لغة الإشارة" },
  { value: "attachment", label: "مرفق" },
];

function emptySection(type: LessonSectionType): LessonSection {
  return {
    id: generateId("sec"),
    type,
    title: "",
    content: "",
    mediaUrl: "",
    caption: "",
  };
}

export default function LessonEditorPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const lessons = useLessonsStore((s) => s.lessons);
  const lesson = useMemo(() => lessons.find((l) => l.id === id), [lessons, id]);
  const updateLesson = useLessonsStore((s) => s.updateLesson);
  const publishLesson = useLessonsStore((s) => s.publishLesson);
  const unpublishLesson = useLessonsStore((s) => s.unpublishLesson);

  const [sections, setSections] = useState<LessonSection[]>([]);
  const [objectives, setObjectives] = useState("");
  const [hydratedLocal, setHydratedLocal] = useState(false);
  const [deleteSectionId, setDeleteSectionId] = useState<string | null>(null);
  const [newSectionType, setNewSectionType] = useState<LessonSectionType>("text");

  useEffect(() => {
    if (lesson && !hydratedLocal) {
      setSections(lesson.content);
      setObjectives(lesson.learningObjectives.join("\n"));
      setHydratedLocal(true);
    }
  }, [lesson, hydratedLocal]);

  if (!lesson) {
    return (
      <EmptyState
        title="الدرس غير موجود"
        description="لم يتم العثور على هذا الدرس"
        actionLabel="العودة للقائمة"
        onAction={() => window.history.back()}
      />
    );
  }

  function updateSection(sectionId: string, patch: Partial<LessonSection>) {
    setSections((prev) =>
      prev.map((s) => (s.id === sectionId ? { ...s, ...patch } : s))
    );
  }

  function moveSection(index: number, direction: "up" | "down") {
    setSections((prev) => {
      const next = [...prev];
      const target = direction === "up" ? index - 1 : index + 1;
      if (target < 0 || target >= next.length) return prev;
      [next[index], next[target]] = [next[target], next[index]];
      return next;
    });
  }

  function addSection() {
    setSections((prev) => [...prev, emptySection(newSectionType)]);
    toast.success("تمت إضافة قسم");
  }

  function removeSection(sectionId: string) {
    setSections((prev) => prev.filter((s) => s.id !== sectionId));
    setDeleteSectionId(null);
    toast.success("تم حذف القسم");
  }

  function saveAll() {
    const objectivesList = objectives
      .split("\n")
      .map((s) => s.trim())
      .filter(Boolean);
    updateLesson(id, { content: sections, learningObjectives: objectivesList });
    toast.success("تم حفظ الدرس");
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title={lesson.title}
        description="محرّر محتوى الدرس"
        badge={<StatusBadge status={lesson.status} />}
        actions={
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" asChild>
              <Link href="/dashboard/lessons">
                <ArrowRight className="size-4" />
                العودة
              </Link>
            </Button>
            <Button variant="outline" onClick={saveAll}>
              <Save className="size-4" />
              حفظ
            </Button>
            {lesson.status === "published" ? (
              <Button
                variant="secondary"
                onClick={() => {
                  unpublishLesson(id);
                  toast.success("تم إلغاء نشر الدرس");
                }}
              >
                إلغاء النشر
              </Button>
            ) : (
              <Button
                onClick={() => {
                  saveAll();
                  publishLesson(id);
                  toast.success("تم نشر الدرس");
                }}
              >
                <Upload className="size-4" />
                نشر
              </Button>
            )}
          </div>
        }
      />

      <Card>
        <CardHeader>
          <CardTitle className="text-base">أهداف التعلّم</CardTitle>
        </CardHeader>
        <CardContent>
          <Textarea
            rows={4}
            value={objectives}
            onChange={(e) => setObjectives(e.target.value)}
            placeholder="سطر لكل هدف تعليمي..."
          />
        </CardContent>
      </Card>

      <div className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-lg font-semibold">أقسام المحتوى ({sections.length})</h2>
          <div className="flex items-center gap-2">
            <Select
              value={newSectionType}
              onValueChange={(v) => setNewSectionType(v as LessonSectionType)}
            >
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {SECTION_TYPES.map((t) => (
                  <SelectItem key={t.value} value={t.value}>
                    {t.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button onClick={addSection}>
              <Plus className="size-4" />
              إضافة قسم
            </Button>
          </div>
        </div>

        {sections.length === 0 ? (
          <EmptyState
            title="لا توجد أقسام"
            description="ابدأ بإضافة أقسام المحتوى للدرس"
            actionLabel="إضافة قسم"
            onAction={addSection}
          />
        ) : (
          sections.map((section, index) => {
            const typeLabel = SECTION_TYPES.find((t) => t.value === section.type)?.label;
            const needsMedia = ["image", "infographic", "video", "sign_language", "attachment"].includes(
              section.type
            );

            return (
              <Card key={section.id}>
                <CardHeader className="flex flex-row items-center justify-between gap-2 pb-3">
                  <div className="flex items-center gap-2">
                    <GripVertical className="size-4 text-muted-foreground" />
                    <CardTitle className="text-sm">
                      {typeLabel} — #{index + 1}
                    </CardTitle>
                  </div>
                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      disabled={index === 0}
                      onClick={() => moveSection(index, "up")}
                      aria-label="تحريك لأعلى"
                    >
                      <ArrowUp className="size-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      disabled={index === sections.length - 1}
                      onClick={() => moveSection(index, "down")}
                      aria-label="تحريك لأسفل"
                    >
                      <ArrowDown className="size-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setDeleteSectionId(section.id)}
                      aria-label="حذف القسم"
                    >
                      <Trash2 className="size-4 text-destructive" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  {(section.type === "heading" || needsMedia) && (
                    <div className="space-y-2">
                      <Label>العنوان</Label>
                      <Input
                        value={section.title ?? ""}
                        onChange={(e) => updateSection(section.id, { title: e.target.value })}
                      />
                    </div>
                  )}
                  <div className="space-y-2">
                    <Label>{section.type === "heading" ? "نص العنوان" : "المحتوى"}</Label>
                    <Textarea
                      rows={section.type === "text" ? 5 : 3}
                      value={section.content}
                      onChange={(e) => updateSection(section.id, { content: e.target.value })}
                    />
                  </div>
                  {needsMedia ? (
                    <div className="space-y-2">
                      <Label>رابط الوسائط</Label>
                      <Input
                        value={section.mediaUrl ?? ""}
                        onChange={(e) => updateSection(section.id, { mediaUrl: e.target.value })}
                        placeholder="https://..."
                      />
                    </div>
                  ) : null}
                  {needsMedia || section.type === "image" ? (
                    <div className="space-y-2">
                      <Label>التعليق</Label>
                      <Input
                        value={section.caption ?? ""}
                        onChange={(e) => updateSection(section.id, { caption: e.target.value })}
                      />
                    </div>
                  ) : null}
                </CardContent>
              </Card>
            );
          })
        )}
      </div>

      <ConfirmDialog
        open={!!deleteSectionId}
        onOpenChange={(o) => !o && setDeleteSectionId(null)}
        title="حذف القسم"
        description="هل أنت متأكد من حذف هذا القسم؟"
        destructive
        confirmLabel="حذف"
        onConfirm={() => {
          if (deleteSectionId) removeSection(deleteSectionId);
        }}
      />
    </div>
  );
}
