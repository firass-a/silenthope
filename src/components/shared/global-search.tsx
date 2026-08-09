"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { useStudentsStore } from "@/stores/students.store";
import { useAgentsStore } from "@/stores/agents.store";
import { useCoursesStore } from "@/stores/courses.store";
import { useLessonsStore } from "@/stores/lessons.store";
import { useTalentsStore } from "@/stores/talents.store";
import { useSubscriptionsStore } from "@/stores/subscriptions.store";

interface GlobalSearchProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function GlobalSearch({ open, onOpenChange }: GlobalSearchProps) {
  const router = useRouter();
  const students = useStudentsStore((s) => s.students);
  const agents = useAgentsStore((s) => s.agents);
  const courses = useCoursesStore((s) => s.courses);
  const lessons = useLessonsStore((s) => s.lessons);
  const talents = useTalentsStore((s) => s.talents);
  const subscriptions = useSubscriptionsStore((s) => s.subscriptions);
  const [q, setQ] = useState("");

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        onOpenChange(true);
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onOpenChange]);

  const query = q.trim().toLowerCase();

  const groups = useMemo(() => {
    if (!query) {
      return {
        students: students.slice(0, 4),
        agents: agents.slice(0, 4),
        courses: courses.slice(0, 4),
        lessons: lessons.slice(0, 4),
        talents: talents.slice(0, 4),
        subscriptions: subscriptions.slice(0, 4),
      };
    }
    return {
      students: students
        .filter((s) =>
          `${s.firstName} ${s.lastName} ${s.email}`.toLowerCase().includes(query)
        )
        .slice(0, 6),
      agents: agents
        .filter((a) => `${a.name} ${a.email}`.toLowerCase().includes(query))
        .slice(0, 6),
      courses: courses
        .filter((c) => c.title.toLowerCase().includes(query))
        .slice(0, 6),
      lessons: lessons
        .filter((l) => l.title.toLowerCase().includes(query))
        .slice(0, 6),
      talents: talents
        .filter((t) => `${t.title} ${t.studentName}`.toLowerCase().includes(query))
        .slice(0, 6),
      subscriptions: subscriptions
        .filter((s) => `${s.plan} ${s.studentId}`.toLowerCase().includes(query))
        .slice(0, 6),
    };
  }, [query, students, agents, courses, lessons, talents, subscriptions]);

  function go(href: string) {
    onOpenChange(false);
    setQ("");
    router.push(href);
  }

  return (
    <CommandDialog open={open} onOpenChange={onOpenChange} title="بحث شامل" description="ابحث في المنصة">
      <CommandInput
        placeholder="ابحث عن طالب، وكيل، مادة، درس، موهبة..."
        value={q}
        onValueChange={setQ}
      />
      <CommandList>
        <CommandEmpty>لا نتائج</CommandEmpty>
        <CommandGroup heading="الطلبة">
          {groups.students.map((s) => (
            <CommandItem
              key={s.id}
              value={`${s.firstName} ${s.lastName} ${s.email}`}
              onSelect={() => go(`/admin/students/${s.id}`)}
            >
              {s.firstName} {s.lastName}
              <span className="text-muted-foreground mr-auto text-xs">{s.email}</span>
            </CommandItem>
          ))}
        </CommandGroup>
        <CommandGroup heading="الوكلاء">
          {groups.agents.map((a) => (
            <CommandItem
              key={a.id}
              value={`${a.name} ${a.email}`}
              onSelect={() => go(`/admin/agents`)}
            >
              {a.name}
            </CommandItem>
          ))}
        </CommandGroup>
        <CommandGroup heading="المواد">
          {groups.courses.map((c) => (
            <CommandItem
              key={c.id}
              value={c.title}
              onSelect={() => go(`/admin/courses`)}
            >
              {c.title}
            </CommandItem>
          ))}
        </CommandGroup>
        <CommandGroup heading="الدروس">
          {groups.lessons.map((l) => (
            <CommandItem
              key={l.id}
              value={l.title}
              onSelect={() => go(`/admin/lessons/${l.id}`)}
            >
              {l.title}
            </CommandItem>
          ))}
        </CommandGroup>
        <CommandGroup heading="المواهب">
          {groups.talents.map((t) => (
            <CommandItem
              key={t.id}
              value={`${t.title} ${t.studentName}`}
              onSelect={() => go(`/admin/talents/${t.id}`)}
            >
              {t.title}
            </CommandItem>
          ))}
        </CommandGroup>
        <CommandGroup heading="الاشتراكات">
          {groups.subscriptions.map((s) => (
            <CommandItem
              key={s.id}
              value={`${s.plan} ${s.id}`}
              onSelect={() => go(`/admin/subscriptions`)}
            >
              اشتراك {s.plan} — {s.status}
            </CommandItem>
          ))}
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  );
}
