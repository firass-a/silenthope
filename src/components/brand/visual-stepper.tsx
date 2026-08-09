"use client";

import { Fragment } from "react";
import { ArrowDown } from "lucide-react";
import { cn } from "@/lib/utils";

export function VisualStepper({
  steps,
  className,
}: {
  steps: { label: string; icon?: React.ReactNode }[];
  className?: string;
}) {
  return (
    <ol
      className={cn(
        "flex flex-col items-stretch gap-3 md:flex-row md:items-center md:gap-2",
        className
      )}
      aria-label="مسار التعلّم البصري"
    >
      {steps.map((step, i) => (
        <Fragment key={step.label}>
          <li className="flex flex-1 items-center gap-3 rounded-2xl border border-border/70 bg-card/80 px-4 py-4">
            {step.icon ? (
              <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-brand-100 text-brand-700">
                {step.icon}
              </span>
            ) : (
              <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-brand-100 text-sm font-bold text-brand-700">
                {String(i + 1).padStart(2, "0")}
              </span>
            )}
            <span className="text-sm font-semibold md:text-base">{step.label}</span>
          </li>
          {i < steps.length - 1 ? (
            <ArrowDown
              className="mx-auto size-4 shrink-0 text-brand-400 md:rotate-90"
              aria-hidden
            />
          ) : null}
        </Fragment>
      ))}
    </ol>
  );
}
