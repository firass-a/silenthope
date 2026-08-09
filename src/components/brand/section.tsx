"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

export function Section({
  children,
  className,
  id,
  tone = "plain",
}: {
  children: React.ReactNode;
  className?: string;
  id?: string;
  tone?: "plain" | "mist" | "soft";
}) {
  return (
    <section
      id={id}
      className={cn(
        "py-16 md:py-24",
        tone === "mist" && "gradient-mist",
        tone === "soft" && "bg-secondary/40",
        className
      )}
    >
      <div className="container mx-auto px-4 md:px-6">{children}</div>
    </section>
  );
}

export function SectionHeading({
  eyebrow,
  title,
  description,
  className,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  className?: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.45 }}
      className={cn("mb-10 max-w-2xl md:mb-14", className)}
    >
      {eyebrow ? (
        <p className="mb-3 text-sm font-semibold tracking-wide text-brand-600">
          {eyebrow}
        </p>
      ) : null}
      <h2 className="text-3xl font-bold leading-tight md:text-4xl">{title}</h2>
      {description ? (
        <p className="mt-3 text-base leading-relaxed text-muted-foreground md:text-lg">
          {description}
        </p>
      ) : null}
    </motion.div>
  );
}

export function EditorialSplit({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "grid items-center gap-10 lg:grid-cols-2 lg:gap-16",
        className
      )}
    >
      {children}
    </div>
  );
}

export function HorizontalScroller({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return <div className={cn("scroller-x", className)}>{children}</div>;
}
