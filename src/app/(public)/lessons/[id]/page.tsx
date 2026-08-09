"use client";

import { use, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useLessonsStore } from "@/stores/lessons.store";

export default function LessonRedirect({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const lesson = useLessonsStore((s) => s.lessons.find((l) => l.id === id));

  useEffect(() => {
    if (lesson) {
      router.replace(`/learn/${lesson.courseId}/${lesson.id}`);
    } else {
      router.replace("/learn");
    }
  }, [lesson, router]);

  return (
    <div className="container mx-auto px-4 py-20 text-center text-muted-foreground">
      جاري التحويل…
    </div>
  );
}
