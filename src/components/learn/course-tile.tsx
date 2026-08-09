"use client";

import Link from "next/link";
import Image from "next/image";
import { Clock, Layers } from "lucide-react";
import { cn } from "@/lib/utils";
import { courseImage } from "@/lib/media";
import type { Course } from "@/types";

export function CourseTile({
  course,
  progress,
  lessonCount,
  className,
}: {
  course: Course;
  progress?: number;
  lessonCount?: number;
  className?: string;
}) {
  const img = course.thumbnail || courseImage(course.id);

  return (
    <Link
      href={`/learn/${course.id}`}
      className={cn(
        "group relative flex min-w-[280px] max-w-sm flex-col overflow-hidden rounded-3xl border border-border/50 bg-card transition hover:-translate-y-0.5 hover:shadow-lg hover:shadow-brand-600/10",
        className
      )}
    >
      <div className="relative aspect-[16/10] overflow-hidden">
        <Image
          src={img}
          alt={course.title}
          fill
          className="object-cover transition duration-500 group-hover:scale-105"
          sizes="(max-width:768px) 90vw, 320px"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-brand-900/50 to-transparent" />
        <span className="absolute bottom-3 start-3 rounded-full bg-white/90 px-3 py-1 text-xs font-semibold text-brand-800">
          {course.level}
        </span>
      </div>
      <div className="flex flex-1 flex-col gap-3 p-5">
        <h3 className="text-lg font-bold leading-snug">{course.title}</h3>
        <p className="line-clamp-2 text-sm text-muted-foreground">
          {course.description}
        </p>
        <div className="mt-auto flex items-center gap-4 text-xs text-muted-foreground">
          <span className="inline-flex items-center gap-1">
            <Layers className="size-3.5" />
            {lessonCount ?? course.lessonIds.length} درس
          </span>
          <span className="inline-flex items-center gap-1">
            <Clock className="size-3.5" />
            بصري بالكامل
          </span>
        </div>
        {typeof progress === "number" ? (
          <div>
            <div className="mb-1 flex justify-between text-xs">
              <span>التقدّم</span>
              <span className="font-semibold text-brand-700">{progress}%</span>
            </div>
            <div className="h-1.5 overflow-hidden rounded-full bg-secondary">
              <div
                className="h-full rounded-full bg-primary transition-all"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        ) : null}
      </div>
    </Link>
  );
}
