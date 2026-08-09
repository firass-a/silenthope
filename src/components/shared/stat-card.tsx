"use client";

import type { LucideIcon } from "lucide-react";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface StatCardProps {
  title: string;
  value: number | string;
  icon: LucideIcon;
  hint?: string;
  className?: string;
  index?: number;
}

export function StatCard({
  title,
  value,
  icon: Icon,
  hint,
  className,
  index = 0,
}: StatCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.35 }}
    >
      <Card className={cn("overflow-hidden transition-shadow hover:shadow-md", className)}>
        <CardContent className="flex items-start justify-between gap-3 pt-1">
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">{title}</p>
            <p className="text-3xl font-bold tracking-tight">{value}</p>
            {hint ? <p className="text-xs text-muted-foreground">{hint}</p> : null}
          </div>
          <div className="flex size-11 items-center justify-center rounded-xl bg-brand-100 text-brand-700">
            <Icon className="size-5" aria-hidden />
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
