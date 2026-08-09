"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/stores/auth.store";

export default function MeRedirectPage() {
  const router = useRouter();
  const session = useAuthStore((s) => s.session);

  useEffect(() => {
    if (!session) {
      router.replace("/login");
      return;
    }
    if (session.studentId) {
      router.replace(`/students/${session.studentId}`);
    } else {
      router.replace("/learn");
    }
  }, [session, router]);

  return (
    <div className="container mx-auto px-4 py-20 text-center text-muted-foreground">
      جاري فتح ملفك…
    </div>
  );
}
