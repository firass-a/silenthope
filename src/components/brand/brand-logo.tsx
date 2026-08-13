import Image from "next/image";
import { cn } from "@/lib/utils";

type BrandLogoProps = {
  className?: string;
  /** Visual size of the mark */
  size?: "sm" | "md" | "lg" | "xl";
  /** Show wordmark next to the mark */
  withWordmark?: boolean;
  /** Override brand title next to the mark */
  title?: string;
  /** Subtitle under the brand name */
  subtitle?: string;
  /** Prefer square icon crop */
  variant?: "mark" | "icon";
  /** Soft white plate behind the mark (default). Use false on dark panels. */
  plate?: boolean;
  priority?: boolean;
};

const SIZES = {
  sm: { box: "size-9", px: 36 },
  md: { box: "size-11", px: 44 },
  lg: { box: "size-14", px: 56 },
  xl: { box: "size-20", px: 80 },
} as const;

export function BrandLogo({
  className,
  size = "md",
  withWordmark = false,
  title = "الأمل الصامت",
  subtitle,
  variant = "mark",
  plate = true,
  priority = false,
}: BrandLogoProps) {
  const dim = SIZES[size];
  const src = variant === "icon" ? "/brand/logo-icon.png" : "/brand/logo.png";

  return (
    <span className={cn("inline-flex items-center gap-3", className)}>
      <span
        className={cn(
          "relative shrink-0 overflow-hidden rounded-2xl",
          plate && "bg-white/90 shadow-sm ring-1 ring-brand-200/50",
          dim.box
        )}
      >
        <Image
          src={src}
          alt="شعار الأمل الصامت"
          width={dim.px}
          height={dim.px}
          priority={priority}
          className="h-full w-full object-contain p-[6%]"
        />
      </span>
      {withWordmark ? (
        <span className="min-w-0 leading-tight">
          <span className="block truncate text-lg font-bold tracking-tight">
            {title}
          </span>
          {subtitle ? (
            <span className="mt-0.5 hidden truncate text-xs text-muted-foreground sm:block">
              {subtitle}
            </span>
          ) : null}
        </span>
      ) : null}
    </span>
  );
}
