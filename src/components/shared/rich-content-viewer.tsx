import { Hand, ImageIcon, Paperclip, PlayCircle } from "lucide-react";
import type { LessonSection } from "@/types";
import { Card, CardContent } from "@/components/ui/card";

export function RichContentViewer({ sections }: { sections: LessonSection[] }) {
  return (
    <div className="space-y-4">
      {sections.map((section) => {
        if (section.type === "heading") {
          return (
            <h2 key={section.id} className="text-2xl font-bold tracking-tight">
              {section.content}
            </h2>
          );
        }
        if (section.type === "text") {
          return (
            <p key={section.id} className="leading-8 text-foreground/90">
              {section.content}
            </p>
          );
        }
        if (section.type === "image") {
          return (
            <figure key={section.id} className="overflow-hidden rounded-2xl border bg-card">
              {section.mediaUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={section.mediaUrl} alt={section.title || section.content} className="w-full object-cover" />
              ) : (
                <div className="flex h-48 items-center justify-center gap-2 bg-muted text-muted-foreground">
                  <ImageIcon /> صورة توضيحية
                </div>
              )}
              {(section.caption || section.title) && (
                <figcaption className="px-4 py-3 text-sm text-muted-foreground">
                  {section.caption || section.title}
                </figcaption>
              )}
            </figure>
          );
        }
        if (section.type === "infographic") {
          return (
            <Card key={section.id} className="border-accent/30 bg-accent/10">
              <CardContent className="space-y-2 pt-1">
                {section.title ? <h3 className="font-semibold">{section.title}</h3> : null}
                <p className="text-lg font-medium leading-relaxed">{section.content}</p>
                {section.caption ? (
                  <p className="text-sm text-muted-foreground">{section.caption}</p>
                ) : null}
              </CardContent>
            </Card>
          );
        }
        if (section.type === "video" || section.type === "sign_language") {
          const isSign = section.type === "sign_language";
          return (
            <div
              key={section.id}
              className="flex min-h-48 flex-col items-center justify-center gap-3 rounded-2xl border border-dashed bg-brand-50 p-6 text-center"
            >
              {isSign ? <Hand className="size-10 text-brand-600" /> : <PlayCircle className="size-10 text-brand-600" />}
              <div>
                <p className="font-semibold">
                  {section.title || (isSign ? "فيديو بلغة الإشارة" : "فيديو توضيحي")}
                </p>
                <p className="mt-1 text-sm text-muted-foreground">
                  {section.content || section.caption || "مساحة بصرية — بدون اعتماد على الصوت"}
                </p>
              </div>
            </div>
          );
        }
        return (
          <div
            key={section.id}
            className="flex items-center gap-3 rounded-2xl border bg-card px-4 py-3"
          >
            <Paperclip className="size-5 text-muted-foreground" />
            <div>
              <p className="font-medium">{section.title || "مرفق"}</p>
              <p className="text-sm text-muted-foreground">{section.content}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
