import { Captions, Hand } from "lucide-react";
import { cn } from "@/lib/utils";

export function SignMediaSlot({
  title = "فيديو بلغة الإشارة",
  caption = "ترجمة بصرية للمحتوى — لا يعتمد على الصوت.",
  className,
}: {
  title?: string;
  caption?: string;
  className?: string;
}) {
  return (
    <figure
      className={cn(
        "overflow-hidden rounded-2xl border border-border/80 bg-gradient-to-br from-brand-50 to-secondary",
        className
      )}
    >
      <div className="relative flex aspect-video items-center justify-center">
        <div className="absolute inset-0 opacity-40" aria-hidden>
          <div className="absolute start-8 top-8 size-24 rounded-full bg-brand-300/40 blur-2xl" />
          <div className="absolute bottom-6 end-10 size-32 rounded-full bg-accent/30 blur-2xl" />
        </div>
        <div className="relative flex flex-col items-center gap-3 text-center">
          <span className="flex size-14 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-sm">
            <Hand className="size-7" aria-hidden />
          </span>
          <p className="text-base font-semibold">{title}</p>
          <p className="max-w-xs text-sm text-muted-foreground">{caption}</p>
        </div>
      </div>
      <figcaption className="flex items-start gap-2 border-t border-border/60 bg-card/80 px-4 py-3 text-sm text-muted-foreground">
        <Captions className="mt-0.5 size-4 shrink-0 text-brand-600" aria-hidden />
        <span>ترجمة نصية متزامنة متاحة دائماً مع المحتوى البصري.</span>
      </figcaption>
    </figure>
  );
}
